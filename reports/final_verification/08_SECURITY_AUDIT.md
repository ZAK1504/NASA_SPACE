# 08 — Comprehensive Cybersecurity & AI Safety Audit

## 1. Threat Model & Attack Surface

sphereXplorer is a public web application (`https://spherexplore.earth`) that does not require visitor login.
Potential threat vectors evaluated:
1. **Server-Side Request Forgery (SSRF):** Exploitation of backend image fetchers to probe Google Cloud internal metadata or intranet endpoints.
2. **AI Provider Quota Exhaustion / Denial of Wallet:** Malicious scripts spamming Groq LLM completions to burn token budgets or trigger provider billing.
3. **Data Tampering & Privacy Violation:** Overwriting, reading, or deleting other visitors' discoveries.
4. **Client-Side Attacks:** Cross-Site Scripting (XSS), Content Security Policy (CSP) bypass, and secret leaks in browser bundles.

---

## 2. Security Vulnerability Findings

### Finding SEC-01 (CRITICAL) — Unvalidated `fits_url` Ingestion (SSRF Risk)
- **Affected File:** `backend/app/routers/processing.py` (lines 60–65) & `backend/app/services/fits_service.py` (lines 22–35).
- **Vulnerability Description:** In `_find_or_fetch_fits_for_target()`, a caller can provide an arbitrary `fits_url` parameter in the request body. `fits_service.download_fits(fits_url)` directly invokes `requests.get(fits_url, stream=True)` without validating the domain or IP address.
- **Exploit Scenario:** An attacker could supply `fits_url="http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token"` to probe the Google Compute Engine metadata service or internal loopback ports (`http://127.0.0.1:8000`).
- **Impact:** Critical Information Disclosure / SSRF.
- **Required Remediation:** Implement strict URL validation:
  1. Only allow schemes `https://`.
  2. Whitelist authoritative hostnames: `*.ipac.caltech.edu`, `*.irsa.ipac.caltech.edu`, `*.nasa.gov`.
  3. Explicitly reject private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.169.254`).
- **Release-Blocking Status:** **BLOCKING FOR OPEN PUBLIC ACCESS.**

### Finding SEC-02 (HIGH) — Unauthenticated Shared JSON Storage for Discovery Journal
- **Affected File:** `backend/app/routers/discoveries.py` (lines 10–71).
- **Vulnerability Description:** Discoveries are written to a shared server-side file `backend/data/discoveries.json`. `GET /api/discoveries` returns all records globally. `DELETE /api/discoveries/{id}` deletes any entry without checking user identity or authorization.
- **Impact:** Data loss, denial of service, lack of visitor isolation.
- **Required Remediation:** Migrate discovery storage to client-side browser `localStorage` (matching the Mission progress architecture) or implement session-isolated database records.
- **Release-Blocking Status:** **HIGH PRIORITY.**

### Finding SEC-03 (MEDIUM) — Permissive CORS Configuration
- **Affected File:** `backend/app/config.py` (lines 33–38).
- **Vulnerability Description:** `CORS_ORIGINS` includes `"*"` alongside localhost entries.
- **Impact:** Cross-origin request access from unauthorized origins.
- **Required Remediation:** In production, restrict `CORS_ORIGINS` to `["https://spherexplore.earth"]`.

---

## 3. Secret Scanning & Credential Shielding Verification

| Inspection Target | Search Pattern | Matches Found | Status |
| :--- | :---: | :---: | :---: |
| Frontend Production Bundle (`frontend/dist/`) | `gsk_*`, `AI_KEY`, `secret` | **0** | **PASS** |
| Git History & Staged Changes | `.env`, `*.db`, `copilot_budget.db` | **0** | **PASS** |
| Backend Status Endpoint (`/api/assistant/status`) | `gsk_*`, `api_key` | **0** | **PASS** |
| Example Configuration (`backend/.env.example`) | Real credentials | **0** (Placeholders only) | **PASS** |

---

## 4. Prompt Injection & AI Tool Guardrails

- **System Prompt Hardening:** System instructions reside strictly on the server in `copilot_ai_service.py` and cannot be overridden by user messages or client payloads.
- **Restricted Tool Allowlist:** The assistant can only suggest verified frontend routes (`/spectra`, `/time-machine`, `/objects`, `/missions`, `/explore`, `/discovery-lab`, `/about`, `/storybook`).
- **No Arbitrary Code Execution:** The LLM has zero access to shell commands, Python evaluation, filesystem paths, or cloud infrastructure.
- **Output Sanitization:** Frontend `CosmicCopilot.tsx` uses a custom AST parser rendering formatted spans and paragraphs without `dangerouslySetInnerHTML`.
