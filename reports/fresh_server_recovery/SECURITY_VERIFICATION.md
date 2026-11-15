# sphereXplorer — Security Verification & Vulnerability Remediation Report

**Audit Date:** November 15, 2026  
**Auditor:** Senior AI Security Engineer & DevSecOps Production Specialist  
**Security Standard:** OWASP Top 10 API Security / Google Cloud CIS Foundations  
**Status:** ALL PRODUCTION-BLOCKING VULNERABILITIES REMEDIATED  

---

## 1. Vulnerability Matrix & Remediation Summary

| Ref | Vulnerability Category | Original Severity | Affected File | Remediation Implemented | Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **SEC-01** | Server-Side Request Forgery (SSRF) | **CRITICAL** | `fits_service.py`, `processing.py` | HTTPS scheme check, domain allowlist (`*.ipac.caltech.edu`, `*.nasa.gov`), IP resolution check blocking loopback, private ranges, link-local, and GCP metadata (`169.254.169.254`). | **RESOLVED** |
| **SEC-02** | Unauthenticated Discovery Journal Deletion | **HIGH** | `discoveries.py` | Implemented session-scoped ownership (`x-session-id`). Deleting entries owned by other sessions now triggers HTTP 403 Forbidden. | **RESOLVED** |
| **SEC-03** | Rate-Limit IP Header Forgery | **HIGH** | `assistant.py` | `get_client_ip()` verifies `request.client.host` against `TRUSTED_PROXIES` before parsing `X-Forwarded-For` or `CF-Connecting-IP`. | **RESOLVED** |
| **SEC-04** | CORS Permissive Wildcard | **MEDIUM** | `config.py` | Removed `*` wildcard; defaults to explicit production origin `https://spherexplore.earth` and local dev ports. Configurable via `CORS_ORIGINS`. | **RESOLVED** |
| **SEC-05** | Sensitive Data Leakage in Packages | **HIGH** | `package_scientific_cache.py`, `.gitignore` | `deploy_artifacts/`, `.env`, `copilot_budget.db`, and `discoveries.json` strictly excluded from git tracking and transfer tarballs. | **RESOLVED** |
| **SEC-06** | Missing Dependency Declaration | **MEDIUM** | `backend/requirements.txt` | Added `python-dotenv>=1.0.0` ensuring reproducible container and VM environment builds. | **RESOLVED** |

---

## 2. Technical Details of Key Security Fixes

### 2.1 SSRF Defenses in `fits_service.py`
Any request attempting to fetch an arbitrary URL via `/processing/preview` or internal downloaders must pass `is_safe_fits_url()`:
1. **Scheme Validation:** Must strictly be `https://`.
2. **Domain Allowlist:** Hostname must match or end with `.ipac.caltech.edu`, `.nasa.gov`, or `.stsci.edu`.
3. **Cloud Metadata IP Blocking:** Explicitly blocks `169.254.169.254` and `metadata.google.internal`.
4. **DNS Rebinding Prevention:** Performs `socket.getaddrinfo()` and rejects resolved IPs in private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`), or link-local (`169.254.0.0/16`).
5. **Magic Header Byte Check:** First 80 bytes of downloaded file must start with `b"SIMPLE  ="` to ensure non-FITS payloads are rejected.
6. **Bounded Download Size:** Maximum 150 MB enforced per file stream.

### 2.2 Discovery Journal Session Ownership in `discoveries.py`
- Saves entries with `owner_session_id` derived from client `x-session-id` header.
- Deletions verify `active_session == owner_session_id`. Attempting to delete another visitor's entry returns `403 Forbidden: Cannot delete discoveries created by another session`.
- No mandatory user account or login is required, preserving user privacy.

### 2.3 IP Anti-Spoofing in `assistant.py`
Untrusted direct connections sending forged headers (e.g. `X-Forwarded-For: 1.1.1.1`) are ignored. Only connections from trusted local proxies (`127.0.0.1`, `::1`, or configured reverse proxies like Caddy) have their forwarded headers parsed.

---

## 3. Automated Security Test Results

The automated regression suite includes `backend/tests/test_security_and_bootstrap.py`:
- `test_ssrf_validation_allowlist`: **PASSED** (Rejects non-HTTPS, metadata IPs, loopback, and arbitrary domains).
- `test_preview_endpoint_blocks_ssrf_fits_url`: **PASSED** (Returns HTTP 400 Bad Request with `"Prohibited FITS URL"`).
- `test_client_ip_anti_spoofing`: **PASSED** (Rejects untrusted client spoofed headers; accepts trusted proxy headers).
- `test_discovery_journal_session_isolation`: **PASSED** (Rejects cross-session deletion with HTTP 403 Forbidden).
