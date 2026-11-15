#!/usr/bin/env bash
# ==============================================================================
# SPHEREx HORIZON — Automated Rollback Script
# Restores previous verified release in /opt/horizon/releases/, swaps symlink,
# restarts backend service, and validates health.
# ==============================================================================
set -euo pipefail

# Require root
if [ "${EUID}" -ne 0 ]; then
    echo "[!] Error: rollback.sh must be executed as root (e.g. sudo bash rollback.sh)" >&2
    exit 1
fi

echo "=================================================================="
echo "    SPHEREx HORIZON — INITIATING AUTOMATED ROLLBACK"
echo "=================================================================="

CURRENT_TARGET=""
if [ -L /opt/horizon/current ]; then
    CURRENT_TARGET="$(readlink -f /opt/horizon/current)"
    echo "    Current active release: ${CURRENT_TARGET}"
fi

# Find available releases sorted by modification time (most recent first)
cd /opt/horizon/releases
RELEASES=($(ls -dt */ 2>/dev/null || true))

if [ "${#RELEASES[@]}" -lt 2 ]; then
    echo "[!] Fatal: Cannot rollback — fewer than 2 releases found in /opt/horizon/releases/" >&2
    exit 1
fi

# Find the newest release that is NOT the currently broken release
ROLLBACK_TARGET=""
for rel in "${RELEASES[@]}"; do
    CANDIDATE="$(readlink -f "/opt/horizon/releases/${rel}")"
    if [ "${CANDIDATE}" != "${CURRENT_TARGET}" ]; then
        ROLLBACK_TARGET="${CANDIDATE}"
        break
    fi
done

if [ -z "${ROLLBACK_TARGET}" ] || [ ! -d "${ROLLBACK_TARGET}" ]; then
    echo "[!] Fatal: Could not determine valid previous release target." >&2
    exit 1
fi

echo "[+] Step 1: Reverting symlink to previous release: ${ROLLBACK_TARGET}..."
ln -sfn "${ROLLBACK_TARGET}" /opt/horizon/current_prev
mv -Tf /opt/horizon/current_prev /opt/horizon/current
echo "    /opt/horizon/current -> ${ROLLBACK_TARGET}"

echo "[+] Step 2: Restarting backend service and reloading Caddy..."
systemctl restart horizon.service
systemctl reload caddy || systemctl restart caddy

echo "[+] Step 3: Verifying rolled-back backend health..."
HEALTH_URL="http://127.0.0.1:8000/api/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${HEALTH_URL}" || echo "000")

if [ "${HTTP_CODE}" = "200" ]; then
    echo "=================================================================="
    echo "    ROLLBACK COMPLETED SUCCESSFULLY"
    echo "    Active release restored to: ${ROLLBACK_TARGET}"
    echo "    Health status: HTTP 200 OK"
    echo "=================================================================="
else
    echo "=================================================================="
    echo "[!] WARNING: Health check returned HTTP ${HTTP_CODE} after rollback."
    echo "    Inspect logs: journalctl -u horizon.service -n 50 --no-pager"
    echo "=================================================================="
    exit 1
fi
