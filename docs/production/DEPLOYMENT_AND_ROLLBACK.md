# SPHEREx HORIZON — Zero-Downtime Deployment & Automated Rollback Guide

**Author:** DevOps & Site Reliability Engineering Team  
**Platform:** Google Compute Engine (`e2-standard-2`, Ubuntu 24.04 LTS x86-64)  
**Host Architecture:** Caddy Reverse Proxy + Systemd-Managed FastAPI Backend  

---

## 1. Release Lifecycle & Architecture

SPHEREx HORIZON employs a blue/green atomic symlink release pattern modeled after Capistrano/Nix deployments. The deployment structure decouples immutable versioned releases from mutable runtime state:

```
/opt/horizon/
├── current -> /opt/horizon/releases/release-14286d5  <-- ATOMIC SYMLINK
└── releases/
    ├── release-09b3f41/   (Previous Release)
    ├── release-14286d5/   (Active Release)
    └── release-8f2a10e/   (Candidate Release)

/srv/horizon-data/          <-- PERSISTENT STORAGE (Survives Releases & Reboots)
├── cache/
│   ├── fits/              (Calibrated Level 2 FITS files)
│   ├── hips/              (100 spectral cube channels)
│   ├── previews/          (Computed asinh cutouts)
│   └── queries/           (Cached IVOA TAP queries)
└── sessions/              (Isolated anonymous user journals)

/etc/horizon/              <-- SECURE CONFIGURATION
└── backend.env            (Environment variables, mode 640)
```

---

## 2. Release Preparation (`build-release.sh`)

Every release is compiled into a standalone directory before touching active traffic:

1. **Frontend Compilation:**
   - Evaluates TypeScript compiler checks (`tsc --noEmit`).
   - Invokes Vite in production mode with `VITE_API_BASE_URL=/api`.
   - Bundles, minifies, and splits code into optimized route-level chunks (1.12 MB initial payload).
   - Generates immutable hashed asset chunks in `dist/assets/`.
2. **Backend Assembly:**
   - Copies production Python application files from `backend/app/`.
   - Provisions a clean, isolated Python virtualenv (`backend/venv`).
   - Installs frozen, verified dependencies from `backend/requirements.txt`.
3. **Release Metadata:**
   - Embeds `release_info.json` containing Git commit hash, branch, and UTC build timestamp.

---

## 3. Zero-Downtime Atomic Deployment Flow (`deploy-release.sh`)

The deployment process follows a 6-stage transaction:

```
[Stage 1: Build]  ─────────►  Compile release into /opt/horizon/releases/$TAG
                                       │
[Stage 2: Pre-flight] ─────►  Verify Python backend imports cleanly
                                       │
[Stage 3: Symlink Swap] ───►  ln -sfn $TAG /opt/horizon/current_next
                              mv -Tf current_next /opt/horizon/current  <-- ZERO-DOWNTIME SWAP
                                       │
[Stage 4: Service Reload] ─►  systemctl restart horizon.service
                              systemctl reload caddy
                                       │
[Stage 5: Health Check] ───►  Poll http://127.0.0.1:8000/api/health (Max 15 attempts)
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       [HTTP 200 OK]                  [HTTP Failure / Timeout]
               │                               │
[Stage 6: Prune Old Releases]         [Stage 6B: AUTOMATED ROLLBACK]
Keep 5 newest releases                Revert symlink to previous release
Report SUCCESS                        Restart service & alert SRE
```

### Atomic Symlink Swap Mechanics
To ensure that requests are never routed to an incomplete directory, the symlink replacement is atomic at the Linux kernel VFS layer:
```bash
ln -sfn "/opt/horizon/releases/${RELEASE_TAG}" /opt/horizon/current_next
mv -Tf /opt/horizon/current_next /opt/horizon/current
```
`mv -Tf` executes an atomic `rename()` syscall. Any incoming request either hits the old release or the new release, with zero intermediate broken states.

---

## 4. Automated & Manual Rollback (`rollback.sh`)

### Automated Trigger
If the post-deployment health check (`/api/health`) does not return HTTP 200 within 30 seconds of deployment, `deploy-release.sh` halts immediately and executes `rollback.sh`.

### Manual Rollback Execution
To manually trigger a rollback at any time:
```bash
sudo bash /opt/horizon-source/deploy/gcp/rollback.sh
```

### Rollback Process:
1. Identifies the most recent release in `/opt/horizon/releases/` that is distinct from the currently active release.
2. Atomically repoints `/opt/horizon/current` to the previous verified release.
3. Issues `systemctl restart horizon.service` and `systemctl reload caddy`.
4. Executes an immediate health check to confirm recovery.
5. Total rollback duration: **< 1.8 seconds**.

---

## 5. State Preservation Invariants

During both deployments and rollbacks, the following invariants are guaranteed:
1. **User Discoveries:** Stored under `/srv/horizon-data/sessions/` — never touched by application updates or rollbacks.
2. **Scientific Data Caches:** Level 2 FITS calibration files in `/srv/horizon-data/cache/fits` remain intact. No redundant multi-gigabyte re-downloads occur.
3. **HiPS Spectral Cubes:** Pre-rendered PNG frames in `/srv/horizon-data/cache/hips` persist across versions.
4. **Active HTTPS Certificates:** Managed by Caddy in `/var/lib/caddy/` — TLS certificates remain active without disruption.
