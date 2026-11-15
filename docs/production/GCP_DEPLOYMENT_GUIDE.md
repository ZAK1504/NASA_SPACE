# SPHEREx HORIZON — Google Cloud Platform Production Deployment Guide

**Target Audience:** DevOps Engineers, Cloud Infrastructure Architects, SREs  
**Application:** SPHEREx HORIZON — Interactive Cosmic Discovery Platform  
**Target Platform:** Google Compute Engine (GCE) Single VM  
**Target OS:** Ubuntu 24.04 LTS (Noble Numbat) x86-64  
**Recommended Machine Type:** `e2-standard-2` (2 vCPUs, 8 GB RAM, 50 GB Persistent Disk)  
**Primary Region:** `us-central1` (low latency, optimal NASA/IPAC peering, cost efficiency)  

---

## 1. Architectural Overview

SPHEREx HORIZON is engineered to run as a single-origin, high-performance scientific application on a dedicated Google Compute Engine virtual machine:

```
[Public Internet / Space Apps Evaluators]
                     │
                     ▼ (Port 80 / 443 HTTPS via Automated TLS)
       ┌───────────────────────────┐
       │   Caddy Reverse Proxy     │
       └─────────────┬─────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
  [Path: /api/*]          [Path: /*]
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────────────────────┐
│ FastAPI Backend  │    │ Built React 19 / Vite SPA        │
│ Uvicorn (127.0.0.1:8000)│ │ (/opt/horizon/current/frontend/dist)│
│ Managed by systemd│   │ Handled via Caddy file_server    │
└────────┬─────────┘    └──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Persistent Data & Scientific Cache│
│ /srv/horizon-data/               │
│ ├── cache/ (fits, hips, queries) │
│ └── sessions/ (isolated journals)│
└──────────────────────────────────┘
```

### Key Architectural Tenets
1. **Single Origin Model:** Frontend communicates with `/api` through the same domain and port. Zero CORS complexity and zero exposed internal ports.
2. **Stateless Releases with Isolated State:** Application releases reside in `/opt/horizon/releases/` with an atomic `/opt/horizon/current` symlink. Persistent data resides in `/srv/horizon-data/` and survives updates, rollbacks, and reboots.
3. **Defense in Depth:** Uvicorn binds strictly to `127.0.0.1:8000`. Kernel security sandboxing (`ProtectSystem=full`, `PrivateTmp=true`, `NoNewPrivileges=true`) is enforced by systemd.
4. **Resilient Offline Capabilities:** Complete local indexing of authentic SPHEREx Level 2 calibration FITS products and all 100 spectral cube channels ensures full operation even when external IPAC TAP services experience downtime.

---

## 2. Infrastructure Provisioning via Google Cloud SDK (`gcloud`)

### Step 2.1 — Set Environment Variables
```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-central1"
export ZONE="us-central1-a"
export INSTANCE_NAME="horizon-production-vm"
export MACHINE_TYPE="e2-standard-2"
export DISK_SIZE="50GB"
```

### Step 2.2 — Configure Cloud Project & APIs
```bash
gcloud config set project "${PROJECT_ID}"
gcloud services enable compute.googleapis.com
```

### Step 2.3 — Provision Compute Engine Virtual Machine
```bash
gcloud compute instances create "${INSTANCE_NAME}" \
    --project="${PROJECT_ID}" \
    --zone="${ZONE}" \
    --machine-type="${MACHINE_TYPE}" \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account="$(gcloud compute project-info describe --format='value(defaultServiceAccount)')" \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --tags=http-server,https-server \
    --create-disk=auto-delete=yes,boot=yes,image=projects/ubuntu-os-cloud/global/images/family/ubuntu-2404-lts-amd64,size="${DISK_SIZE}",type=pd-balanced \
    --shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring
```

### Step 2.4 — Configure Network Security & Firewall Rules
```bash
# Allow HTTP (port 80) and HTTPS (port 443) for Caddy web server
gcloud compute firewall-rules create allow-http-https \
    --project="${PROJECT_ID}" \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:80,tcp:443 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=http-server,https-server
```

---

## 3. Server Bootstrap & Configuration

### Step 3.1 — SSH into Instance
```bash
gcloud compute ssh "${INSTANCE_NAME}" --zone="${ZONE}"
```

### Step 3.2 — Clone Repository
```bash
sudo git clone https://github.com/ZAK1504/NASA_SPACE.git /opt/horizon-source
cd /opt/horizon-source
sudo git checkout feat/gcp-production-readiness
```

### Step 3.3 — Execute Automated System Bootstrap
Run the verified provisioning script:
```bash
sudo bash deploy/gcp/bootstrap.sh
```
This automatically:
- Installs Python 3.12, Node.js 20 LTS, and Caddy.
- Creates the isolated `horizon` system user and group.
- Provisions `/srv/horizon-data/` with strict 750 permissions.
- Configures and enables systemd service `horizon.service`.
- Configures local UFW firewall.

### Step 3.4 — Configure Production Domain & Secrets
Edit `/etc/horizon/backend.env`:
```bash
sudo nano /etc/horizon/backend.env
```
Ensure the following variables match your assigned domain or external IP:
```env
APP_ENV=production
PUBLIC_BASE_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

Edit `/etc/caddy/Caddyfile`:
```bash
sudo nano /etc/caddy/Caddyfile
```
Replace `{$DOMAIN:localhost}` with your public domain name (e.g. `spherex-horizon.org`). Caddy will automatically provision and renew a free Let's Encrypt / ZeroSSL TLS certificate!

---

## 4. Building and Deploying Releases

### Step 4.1 — Build and Ship Release
```bash
sudo bash deploy/gcp/deploy-release.sh
```
What happens automatically:
1. `build-release.sh` executes TypeScript checks and compiles React into optimized static assets under `dist/`.
2. Python virtualenv is populated with scientific dependencies (`astropy`, `photutils`, `reproject`, `pyvo`).
3. Release files are placed in `/opt/horizon/releases/<commit-hash>/`.
4. Pre-flight check verifies `app.main` imports cleanly.
5. Atomic symlink swap points `/opt/horizon/current` to the new release.
6. Systemd restarts `horizon.service` and Caddy reloads configuration.
7. Automated health check polls `/api/health`. If any failure occurs, an immediate rollback is triggered!

### Step 4.2 — Seed Scientific Benchmark Data
Populate persistent storage with authentic SPHEREx Level 2 FITS calibration files:
```bash
sudo bash deploy/gcp/bootstrap-cache.sh
```

---

## 5. Verification & Operational Testing

Run the automated smoke test suite:
```bash
sudo bash deploy/gcp/smoke-test.sh "http://127.0.0.1"
```
Or test via public domain:
```bash
bash deploy/gcp/smoke-test.sh "https://your-domain.com"
```
The test suite verifies:
- Frontend SPA loading & deep routing (`/explore`).
- Scientific API health (`/api/health`).
- Archive search with spatial cone searching (`/api/archive/search`).
- FITS image preview rendering (`/api/processing/preview`).
- Calibrated 100-channel spectral cube frame delivery (`/api/spectra/frame/1`).
- Scientific honesty verification on Optical Dichroic Gap (`/api/spectra/frame/51` returns 404).
- Production security headers (HSTS, nosniff, DENY).
- Session-scoped journal isolation.

---

## 6. Daily Operations & Disaster Recovery

### Inspecting Application Logs
```bash
# Backend Uvicorn logs
journalctl -u horizon.service -f

# Caddy web server access logs
tail -f /var/log/caddy/horizon_access.log

# Service status
systemctl status horizon.service
systemctl status caddy
```

### Performing an Automated Rollback
If a regression is identified in production:
```bash
sudo bash deploy/gcp/rollback.sh
```
The rollback script atomically points `/opt/horizon/current` to the previous verified release and restarts services within < 2 seconds.

### Automated Backups
Run manual backup or schedule via cron:
```bash
sudo bash deploy/gcp/backup.sh
```
Backups are archived into `/srv/horizon-backups/` and automatically pruned after 14 days.
