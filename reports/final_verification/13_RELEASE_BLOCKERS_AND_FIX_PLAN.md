# 13 — Release Blockers & Remediation Action Plan

This document details every important technical and security defect discovered during the final independent audit, along with exact code references and concrete remediation instructions.

---

## Issue SEC-01 (CRITICAL) — Unvalidated `fits_url` Ingestion (SSRF Vector)

- **Severity:** **CRITICAL** (Release Blocker for Unrestricted Public Launch)
- **Component:** `backend/app/routers/processing.py` (lines 60–65) & `backend/app/services/fits_service.py` (lines 22–35)
- **Reproduction Steps:**
  Send a POST request to `/api/processing/detect` with body:
  ```json
  {
    "fits_url": "http://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token"
  }
  ```
- **Evidence:** `_find_or_fetch_fits_for_target()` calls `fits_service.download_fits(fits_url)`, which passes the URL directly to `requests.get(fits_url, stream=True)` with no domain allowlist or IP range restrictions.
- **Impact:** An attacker could extract Google Cloud instance service account access tokens, probe loopback interfaces (`http://127.0.0.1`), or perform network reconnaissance.
- **Recommended Remediation:**
  In `fits_service.py`, add a strict URL validator before executing requests:
  ```python
  import urllib.parse
  import ipaddress

  ALLOWED_DOMAINS = [
      "ipac.caltech.edu",
      "irsa.ipac.caltech.edu",
      "nasa.gov"
  ]

  def is_safe_fits_url(url: str) -> bool:
      parsed = urllib.parse.urlparse(url)
      if parsed.scheme != "https":
          return False
      hostname = parsed.hostname.lower() if parsed.hostname else ""
      if not any(hostname == d or hostname.endswith("." + d) for d in ALLOWED_DOMAINS):
          return False
      # Block loopback, private, and cloud metadata IPs
      try:
          ip = ipaddress.ip_address(hostname)
          if ip.is_private or ip.is_loopback or ip.is_link_local:
              return False
      except ValueError:
          pass
      return True
  ```
- **Acceptance Test:** Test POST requests with external URLs and internal IPs; verify that non-whitelisted domains return HTTP 400 Bad Request.

---

## Issue SEC-02 (HIGH) — Unauthenticated Shared JSON Storage for Discovery Journal

- **Severity:** **HIGH**
- **Component:** `backend/app/routers/discoveries.py` (lines 10–71) & `backend/data/discoveries.json`
- **Reproduction Steps:**
  1. Visitor A saves a discovery via `POST /api/discoveries`.
  2. Visitor B opens `/discoveries` and views Visitor A's private notes and title.
  3. Visitor B sends `DELETE /api/discoveries/{id}` and successfully deletes Visitor A's entry.
- **Evidence:** Source inspection of `discoveries.py` reveals zero authorization checks and uncoordinated writes to a single shared JSON file.
- **Impact:** Complete lack of visitor privacy, risk of malicious record deletion, and potential JSON file corruption during concurrent writes.
- **Recommended Remediation:**
  Refactor the Discovery Journal to persist records directly in the visitor's browser `localStorage` (key `spherex_user_discoveries_v1`), exactly mirroring the privacy model used by `spherex_mission_progress_v1`.
- **Acceptance Test:** Open two independent browser sessions; verify that discoveries created in Session A are completely invisible and unmodifiable in Session B.

---

## Issue SEC-03 (MEDIUM) — Wildcard CORS in Production Config

- **Severity:** **MEDIUM**
- **Component:** `backend/app/config.py` (lines 33–38)
- **Evidence:** `CORS_ORIGINS` contains `"*"` alongside localhost origins.
- **Impact:** Any external website can make credentialed or cross-origin requests to the API.
- **Recommended Remediation:**
  In production, enforce `CORS_ORIGINS = ["https://spherexplore.earth"]`.
- **Acceptance Test:** Verify that cross-origin requests from third-party domains are rejected by Caddy/FastAPI.

---

## Issue PERF-01 (LOW) — Monolithic JavaScript Chunk

- **Severity:** **LOW** (Operational / Optimization)
- **Component:** `frontend/vite.config.ts`
- **Evidence:** Production build outputs a single `dist/assets/index-*.js` of 4,126 kB (1,259 kB gzip), triggering Vite chunk size warnings.
- **Impact:** Slightly longer initial page load on slow mobile connections.
- **Recommended Remediation:**
  Configure `rollupOptions.output.manualChunks` in `vite.config.ts` to split Three.js, Aladin Lite, and Recharts into asynchronous route-loaded chunks.
- **Acceptance Test:** Verify that `dist/assets/index.js` drops below 800 kB.
