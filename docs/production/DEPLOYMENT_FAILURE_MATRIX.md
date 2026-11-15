# SPHEREx HORIZON — Production Deployment Failure Matrix

**Document Purpose:** Site Reliability Engineering (SRE) Runbook & Diagnostic Playbook  
**Target Environment:** Google Compute Engine (`e2-standard-2`, Ubuntu 24.04 LTS)  
**Classification:** Production Incident Response  

---

## 1. Matrix Overview

This matrix categorizes every credible operational failure mode for the SPHEREx HORIZON platform, detailing the detection signature, severity, root cause, automated mitigation, and manual recovery procedures.

---

## 2. Failure Modes & Remediation Procedures

| Failure Code | Incident Description | Detection Signature | Severity | Primary Root Cause | Automated Protection / Mitigation | Manual Recovery Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FL-NET-01** | Port 80/443 Inaccessible | `curl: (7) Failed to connect to host` | Critical | GCE firewall rules not applied or UFW blocking traffic | Bootstrap scripts configure UFW and GCE tags | Run `gcloud compute firewall-rules create allow-http-https --allow=tcp:80,tcp:443 --target-tags=http-server,https-server` |
| **FL-TLS-02** | Caddy ACME / TLS Failure | `SSL_ERROR_SYSCALL` or 502 Gateway | High | Domain DNS A-record not pointing to VM external IP | Caddy retries TLS handshake with exponential backoff | Verify DNS with `dig +short your-domain.com`. Update `/etc/caddy/Caddyfile` with correct hostname. Run `systemctl reload caddy`. |
| **FL-SVC-03** | Backend Crash Loop | `systemctl status horizon` reports `activating (auto-restart)` | Critical | Syntax error, missing environment variable, or missing Python package | Systemd `Restart=always` with `RestartSec=5s` prevents zombie state | Inspect logs with `journalctl -u horizon.service -n 50 --no-pager`. Check `/etc/horizon/backend.env` permissions and virtualenv integrity. |
| **FL-DEP-04** | Release Deployment Failure | `deploy-release.sh` aborts with `Pre-flight check failed` | High | Python import error in new release commit | `deploy-release.sh` halts before symlink swap; active release remains untouched | Inspect error output from `python -c "import app.main"`. Fix code regression on branch and redeploy. |
| **FL-HLT-05** | Post-Deploy Health Check Timeout | Health check returns HTTP != 200 after 15 attempts | High | Uvicorn slow startup or database/directory permission error | `deploy-release.sh` automatically invokes `rollback.sh` to previous release | Rollback is automatic. Check `/var/log/horizon/` and `journalctl -u horizon.service`. |
| **FL-OOM-06** | Out of Memory (OOM Killer) | Kernel invokes OOM killer; `dmesg \| grep -i oom` | High | Concurrent high-resolution FITS reprojections exceeding 8 GB RAM | `ResourceGuard` admission controller caps heavy jobs to `MAX_HEAVY_JOBS=1` and returns HTTP 429 | Thread pools bounded to `OMP_NUM_THREADS=2`. If heavy load persists, increase swap or upgrade machine to `e2-standard-4`. |
| **FL-DSK-07** | Disk Space Exhaustion | `df -h /` reports > 95% usage; FITS download fails | High | Uncontrolled caching of Level 2 FITS or logs | `FitsService._enforce_cache_quota()` caps cache at 15 GB via LRU eviction | Run `find /srv/horizon-data/cache/previews -type f -mtime +7 -delete`. Check `/var/log/journal/` disk usage with `journalctl --vacuum-size=500M`. |
| **FL-SSRF-08** | SSRF / Arbitrary URL Injection | Attacker submits `http://169.254.169.254/` to FITS preview | Critical | Malicious API request attempting metadata credential theft | `validate_outbound_url` rejects non-HTTPS, private IPs, loopback, and unapproved hosts | Request blocked at application layer (HTTP 400). Logged in security audit trail. |
| **FL-TAP-09** | NASA/IPAC IRSA TAP Endpoint 502/Down | `/api/archive/search` gets 502 from remote IPAC TAP | Medium | Upstream IPAC server maintenance or network timeout | `IrsaService` falls back to cached TAP query inventory (`tap_*.json`) | Platform continues serving cached benchmark targets seamlessly. No user disruption. |
| **FL-HIPS-10** | HiPS Tile Path Traversal Attempt | Attacker requests `/api/spectra/hips/../../etc/passwd` | High | Directory traversal attack against static tile server | Strict regex validation (`HIPS_DIR_REGEX`, `HIPS_FILENAME_REGEX`) and path jail checks | Request rejected immediately with HTTP 400/422. Server filesystem remains isolated. |
| **FL-RTE-11** | React Router Deep Link 404 | Navigating directly to `/explore` or `/missions` returns 404 | Medium | Missing SPA fallback in web server | Caddyfile `try_files {path} /index.html` directive handles all client routes | Ensure `/etc/caddy/Caddyfile` contains `try_files {path} /index.html` within the default handler block. |
| **FL-JRN-12** | Cross-Session Journal Conflict | User discoveries overwritten by another user | Medium | Shared global `discoveries.json` without session scoping | `X-Session-ID` header scopes storage to `DATA_DIR/sessions/journal_{id}.json` | Session IDs strictly validated by regex. Atomic temporary file rename prevents file corruption. |

---

## 3. Incident Severity Tiers & SLA Escalation

### Severity 1 (Critical) — SLA Response: Immediate (< 15 mins)
- Entire platform unreachable (HTTP 502, Caddy crash, VM network disconnect).
- Backend service down with failing health checks.
- Confirmed security perimeter breach attempt.
- **Action:** Execute automated rollback, check firewall rules, inspect systemd logs.

### Severity 2 (High) — SLA Response: < 1 hour
- Astronomical preview/comparison failing on benchmark targets.
- OOM kill events triggered on heavy scientific queries.
- Persistent disk storage reaching 90% capacity.
- **Action:** Clear ephemeral preview caches, check thread limits, verify memory usage via `free -m`.

### Severity 3 (Medium) — SLA Response: < 4 hours
- Remote IPAC TAP archive query timeout (fallback cache operational).
- Non-critical UI asset caching issues.
- **Action:** Monitor remote TAP status; check local query cache validity.

---

## 4. Emergency SRE Checklist

In the event of an unrecoverable system state:
1. **Freeze Traffic:** `systemctl stop caddy` (serves maintenance page if configured).
2. **Execute Rollback:** `sudo bash deploy/gcp/rollback.sh`.
3. **Inspect Core Logs:**
   ```bash
   journalctl -u horizon.service -n 100 --no-pager
   journalctl -u caddy -n 100 --no-pager
   dmesg -T | grep -E -i "oom|killed process"
   ```
4. **Verify Storage & Memory:**
   ```bash
   df -h / /srv/horizon-data
   free -h
   ```
5. **Restart Clean:**
   ```bash
   systemctl restart horizon.service
   systemctl restart caddy
   ```
6. **Execute Smoke Test:**
   ```bash
   bash deploy/gcp/smoke-test.sh
   ```
