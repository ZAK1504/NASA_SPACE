#!/usr/bin/env bash
# ==============================================================================
# SPHEREx HORIZON — Zero-Downtime Release Deployment Script
# Deploys pre-built release or triggers build, performs atomic symlink swap,
# reloads systemd service and Caddy, and executes automated post-deploy health check.
# ==============================================================================
set -euo pipefail

# Require root
if [ "${EUID}" -ne 0 ]; then
    echo "[!] Error: deploy-release.sh must be executed as root (e.g. sudo bash deploy-release.sh)" >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

RELEASE_TAG="${1:-$(git -C "${REPO_ROOT}" rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"
RELEASE_SRC="${REPO_ROOT}/build/release-${RELEASE_TAG}"
TARGET_RELEASE_DIR="/opt/horizon/releases/${RELEASE_TAG}"

echo "=================================================================="
echo "    SPHEREx HORIZON — DEPLOYING RELEASE: ${RELEASE_TAG}"
echo "=================================================================="

# 1. Build if release folder does not exist
if [ ! -d "${RELEASE_SRC}" ]; then
    echo "[+] Release directory not found at ${RELEASE_SRC}. Running build-release.sh..."
    bash "${SCRIPT_DIR}/build-release.sh" "${RELEASE_TAG}"
fi

# 2. Copy Release to /opt/horizon/releases/
echo "[+] Step 1: Installing release into ${TARGET_RELEASE_DIR}..."
rm -rf "${TARGET_RELEASE_DIR}"
mkdir -p "${TARGET_RELEASE_DIR}"
cp -r "${RELEASE_SRC}"/* "${TARGET_RELEASE_DIR}/"

# Set ownership
chown -R horizon:horizon "${TARGET_RELEASE_DIR}"

# 3. Pre-flight Verification of Release Virtualenv
echo "[+] Step 2: Running pre-flight verification on new release..."
if ! su -s /bin/bash horizon -c "${TARGET_RELEASE_DIR}/backend/venv/bin/python -c 'import app.main; print(\"Backend import verified successfully\")'"; then
    echo "[!] Fatal: Pre-flight check failed — Python backend failed to import app.main" >&2
    exit 1
fi

# 4. Atomic Symlink Swap
echo "[+] Step 3: Performing atomic symlink swap to active release..."
# Create temporary symlink then atomically rename to /opt/horizon/current
ln -sfn "${TARGET_RELEASE_DIR}" /opt/horizon/current_next
mv -Tf /opt/horizon/current_next /opt/horizon/current
echo "    /opt/horizon/current -> ${TARGET_RELEASE_DIR}"

# 5. Service Reload
echo "[+] Step 4: Restarting systemd service and reloading Caddy..."
systemctl restart horizon.service
systemctl reload caddy || systemctl restart caddy

# 6. Post-Deployment Smoke Test & Health Check
echo "[+] Step 5: Executing health verification..."
HEALTH_URL="http://127.0.0.1:8000/api/health"
MAX_ATTEMPTS=15
ATTEMPT=0
SUCCESS=false

while [ "${ATTEMPT}" -lt "${MAX_ATTEMPTS}" ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo "    Polling ${HEALTH_URL} (Attempt ${ATTEMPT}/${MAX_ATTEMPTS})..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "${HEALTH_URL}" || echo "000")
    if [ "${HTTP_CODE}" = "200" ]; then
        SUCCESS=true
        break
    fi
    sleep 2
done

if [ "${SUCCESS}" = "false" ]; then
    echo "=================================================================="
    echo "[!] ERROR: Post-deployment health check failed (HTTP ${HTTP_CODE})!"
    echo "    Initiating automatic rollback to previous release..."
    echo "=================================================================="
    bash "${SCRIPT_DIR}/rollback.sh"
    exit 1
fi

echo "    Health check PASSED: Backend returned HTTP 200 OK."

# 7. Release Pruning (Keep last 5 releases)
echo "[+] Step 6: Pruning old releases (retaining 5 most recent)..."
cd /opt/horizon/releases
ls -dt */ 2>/dev/null | tail -n +6 | while read -r old_rel; do
    echo "    Removing obsolete release: /opt/horizon/releases/${old_rel}"
    rm -rf "/opt/horizon/releases/${old_rel}"
done

echo "=================================================================="
echo "    SPHEREx HORIZON DEPLOYMENT SUCCESSFUL"
echo "    Release: ${RELEASE_TAG}"
echo "    Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================================="
