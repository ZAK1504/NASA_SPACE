# sphereXplorer — Google Cloud Production Deployment & Next Steps Guide

**Document Purpose:** Copy-pasteable step-by-step instructions for deploying the verified scientific data package and code corrections to Google Cloud Compute Engine (`spherexplorer-backend`).

> [!IMPORTANT]
> All code corrections, tests, and data packages were prepared and validated strictly on the local development machine. Follow these exact steps to update the Google Cloud VM.

---

## Architecture Overview

```
                          Internet / Clients
                                 │
                     https://spherexplore.earth
                                 │
                     ┌───────────────────────┐
                     │   Caddy Web Server    │ (TLS / HTTPS Termination)
                     └───────────┬───────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Static Frontend Files           FastAPI Scientific API
       (/var/www/spherexplore/dist)     (http://127.0.0.1:8000)
                                                 │
                                                 ▼
                                     Persistent Scientific Data
                                     (/srv/spherexplore-data)
                                     - cache/fits (16 Level 2 FITS)
                                     - cache/queries (54 TAP JSONs)
                                     - cache/hips (100 Spectral Planes)
```

---

## Step A: Push Code Changes to GitHub (From Local Machine)

On your local development machine:
```bash
git checkout fix/fresh-server-scientific-bootstrap
git add .
git commit -m "fix(deployment): resolve fresh-server scientific cache, SSRF security, and persistent data storage"
git push origin fix/fresh-server-scientific-bootstrap
```

---

## Step B: Update Repository on Google Cloud VM

SSH into the Google Cloud VM:
```bash
gcloud compute ssh spherexplorer-backend --zone us-central1-a
```

Inside the VM, pull the latest code:
```bash
cd /opt/NASA_SPACE  # Or your repository root path on the VM
git fetch origin
git checkout fix/fresh-server-scientific-bootstrap
git pull origin fix/fresh-server-scientific-bootstrap
```

---

## Step C: Update Python Dependencies

```bash
cd /opt/NASA_SPACE/backend
source /opt/venv/bin/activate  # Or your active virtualenv
pip install -r requirements.txt
```
*(Ensures `python-dotenv>=1.0.0`, `astropy`, `pyvo`, `fastapi`, and `groq` are up to date).*

---

## Step D: Transfer Scientific Data Package from Local Machine to GCP VM

Run this command **on your local machine** (in `c:\Users\lenovo\OneDrive\Desktop\NASA\nasa-sphere`):
```bash
gcloud compute scp deploy_artifacts/scientific-cache.tar.gz deploy_artifacts/scientific-cache.tar.gz.sha256 spherexplorer-backend:/tmp/ --zone us-central1-a
```

---

## Step E: Verify Transfer Integrity on GCP VM

On the Google Cloud VM:
```bash
cd /tmp
sha256sum -c scientific-cache.tar.gz.sha256
```
*Expected Output:*
```
scientific-cache.tar.gz: OK
```

---

## Step F: Securely Import Scientific Data into Persistent Storage

On the Google Cloud VM:
```bash
# Create persistent data root with appropriate permissions
sudo mkdir -p /srv/spherexplore-data
sudo chown -R $USER:$USER /srv/spherexplore-data

# Execute the secure import utility
cd /opt/NASA_SPACE
python scripts/import_scientific_cache.py \
    --archive /tmp/scientific-cache.tar.gz \
    --checksum /tmp/scientific-cache.tar.gz.sha256 \
    --target-dir /srv/spherexplore-data
```

*Expected Output:*
```
✓ Archive cryptographic integrity confirmed.
✓ Extraction completed safely.
✓ All 16 Level 2 FITS benchmark products verified intact.
✓ HiPS Spectral Planes: 100/100 verified.
=================================================================
 SUCCESS: Scientific cache imported and verified.
 Production backend is ready for offline and online operation.
=================================================================
```

Clean up temporary archive from `/tmp` to free disk space:
```bash
rm /tmp/scientific-cache.tar.gz /tmp/scientific-cache.tar.gz.sha256
```

---

## Step G: Execute Backend Regression Tests on GCP VM

On the Google Cloud VM:
```bash
cd /opt/NASA_SPACE/backend
export SPHEREXPLORE_DATA_DIR=/srv/spherexplore-data
python -m pytest tests/
```
*Expected Output:*
```
====================== 53 passed, 28 warnings in ~40s =======================
```
All 18 previously failing tests will now pass!

---

## Step H: Update Backend Systemd Service

Ensure the production backend systemd service injects `SPHEREXPLORE_DATA_DIR`:

```bash
sudo nano /etc/systemd/system/spherexplorer-backend.service
```

Ensure the service file contains:
```ini
[Unit]
Description=sphereXplorer Scientific FastAPI Backend
After=network.target

[Service]
User=spherexplorer
Group=spherexplorer
WorkingDirectory=/opt/NASA_SPACE/backend
Environment="PATH=/opt/venv/bin:/usr/local/bin:/usr/bin"
Environment="SPHEREXPLORE_DATA_DIR=/srv/spherexplore-data"
EnvironmentFile=/opt/NASA_SPACE/backend/.env
ExecStart=/opt/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Reload and restart systemd:
```bash
sudo systemctl daemon-reload
sudo systemctl restart spherexplorer-backend
sudo systemctl status spherexplorer-backend
```

---

## Step I: Build Frontend on GCP VM

```bash
cd /opt/NASA_SPACE/frontend
npm install
npm run build

# Deploy built frontend assets to web root
sudo mkdir -p /var/www/spherexplore
sudo cp -r dist/* /var/www/spherexplore/
```

---

## Step J: Verify Application Health & Caddy HTTPS

Test backend local health:
```bash
curl -s http://127.0.0.1:8000/api/health | jq .
```
*Expected Output:*
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "cache_directory": "/srv/spherexplore-data/cache"
}
```

Verify Caddy configuration (`/etc/caddy/Caddyfile`):
```caddy
spherexplore.earth {
    root * /var/www/spherexplore
    file_server

    handle /api/* {
        reverse_proxy 127.0.0.1:8000
    }

    try_files {path} /index.html
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

Verify public access:
```bash
curl -I https://spherexplore.earth
curl -s https://spherexplore.earth/api/archive/search?ra=269.452&dec=4.693 | jq .total_found
```
