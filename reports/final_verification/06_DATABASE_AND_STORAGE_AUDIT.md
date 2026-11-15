# 06 — Database, Storage & Persistence Audit

## 1. Storage Architecture & Data Inventory

sphereXplorer intentionally avoids heavy external database engines, relying on lightweight, persistent local disk storage and browser client storage.

| Storage Location | Storage Engine | Purpose | Data Type | Persistence Policy | Privacy & Security Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `backend/data/cache/fits/` | Local Filesystem | Genuine NASA SPHEREx Level 2 FITS products | Astronomical Binary FITS (32-bit float) | Persistent across restarts; atomic `.tmp` rename | Public NASA scientific data; read-only to clients |
| `backend/data/cache/queries/` | JSON files | TAP cone search and DataLink URL cache | Metadata JSON | Persistent query cache with SHA-256 keys | Public archive metadata; no private user information |
| `backend/data/cache/previews/` | PNG files | Pre-rendered astronomical cutouts | Image PNG | Generated on-demand and cached | Visual representations of public science |
| `backend/data/copilot_budget.db` | SQLite 3 (WAL mode) | Cosmic Copilot rate limiting and token accounting | SQLite tables: daily usage, rolling limits, blocks | Persistent across VM restarts & redeployments | Server-side only; never exposed to clients |
| `backend/data/discoveries.json` | Single JSON file | User Discovery Journal entries | User candidate notes, coordinates, confidence | Server-side persistent file | **VULNERABLE (SEC-02):** Globally shared, unauthenticated |
| Browser `localStorage` | Client Storage | Mission progress & user preferences | JSON (`spherex_mission_progress_v1`) | Client browser isolated | Private to individual visitor |
| Browser `sessionStorage` | Client Storage | Anonymous Copilot session identifier | UUID string (`spherex_copilot_session`) | Cleared on tab close | Anonymous session tracking |

---

## 2. Scientific Cache Integrity & Concurrency

### FITS File Cache
- **Path Resolution:** File paths are derived deterministically via SHA-256 hash or filename (`level2_*.fits`).
- **Atomic Writing:** Implemented in `fits_service.download_fits`: downloads stream to `.tmp` files and are renamed atomically (`temp_path.rename(local_path)`), preventing partial or corrupt FITS files if a network interruption occurs.
- **Cache Sizing:** Current cache holds 16 verified FITS products totaling ~1.02 GB.

### Query Cache
- TAP ADQL queries are hashed using SHA-256 (`tap_{hash}.json`).
- If an archive query fails or IRSA is temporarily unreachable, the service falls back to spatial searching across the local authentic TAP cache, ensuring offline resiliency.

---

## 3. Discovery Journal Audit (Finding SEC-02)

### Current Implementation Defect
In `backend/app/routers/discoveries.py`, discoveries are persisted to a single shared file:
`DISCOVERIES_FILE = settings.DATA_DIR / "discoveries.json"`

1. **Unauthenticated Public Read:** `GET /api/discoveries` returns all entries across all visitors.
2. **Unauthenticated Public Write:** `POST /api/discoveries` appends to the global file.
3. **Unauthenticated Deletion:** `DELETE /api/discoveries/{id}` permits any caller to delete another visitor's journal record.
4. **Race Conditions:** `_load_discoveries()` and `_save_discoveries()` do not use file locking or SQLite transactions. Concurrent saves can overwrite data.

### Remediation Plan
Migrate Discovery Journal storage directly to client browser `localStorage` (matching the mission progress model) or implement session-isolated SQLite records.

---

## 4. Mission Progress Persistence

- **Storage Key:** `spherex_mission_progress_v1` in browser `localStorage`.
- **Validation Test:** A fresh browser session with empty `localStorage` was loaded.
  - Mission 01: `not_started` ("Launch Mission")
  - Mission 02: `not_started` ("Launch Mission")
  - Mission 03: `not_started` ("Launch Mission")
- **Verdict:** Fixed regression verified. Mission 03 no longer defaults to "Completed" for new users.

---

## 5. AI Usage Accounting Persistence (`copilot_budget.db`)

Implemented in `backend/app/services/copilot_budget_service.py`:
- **Engine:** SQLite with `PRAGMA journal_mode=WAL;` and `PRAGMA synchronous=NORMAL;`.
- **Concurrency & Atomic Pre-Allocation:** Token reservation uses `BEGIN IMMEDIATE` transactions to prevent race conditions during simultaneous requests.
- **Restart Survival:** Backend server was restarted multiple times during verification; usage metrics (`total_requests`, `input_tokens`, `output_tokens`) remained intact.
