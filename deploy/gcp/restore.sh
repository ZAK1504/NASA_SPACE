#!/usr/bin/env bash
# ==============================================================================
# SPHEREx HORIZON — Disaster Recovery & Backup Restoration Script
# Restores session journals and configuration from an archive tarball.
# ==============================================================================
set -euo pipefail

# Require root
if [ "${EUID}" -ne 0 ]; then
    echo "[!] Error: restore.sh must be executed as root (e.g. sudo bash restore.sh <backup_file>)" >&2
    exit 1
fi

BACKUP_FILE="${1:-}"

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
    echo "Usage: $0 /path/to/horizon_backup_YYYYMMDD_HHMMSS.tar.gz" >&2
    exit 1
fi

echo "=================================================================="
echo "    SPHEREx HORIZON — RESTORING STATE FROM BACKUP"
echo "    Source: ${BACKUP_FILE}"
echo "=================================================================="

# Temporary extraction directory
EXTRACT_DIR="$(mktemp -d /tmp/horizon_restore_XXXXXX)"
trap 'rm -rf "${EXTRACT_DIR}"' EXIT

echo "[+] Step 1: Extracting and inspecting backup tarball..."
tar -xzf "${BACKUP_FILE}" -C "${EXTRACT_DIR}"

# Restore sessions if present
if [ -d "${EXTRACT_DIR}/sessions" ]; then
    echo "[+] Step 2: Restoring user session journals to /srv/horizon-data/sessions/..."
    mkdir -p /srv/horizon-data/sessions
    cp -r "${EXTRACT_DIR}/sessions"/* /srv/horizon-data/sessions/ 2>/dev/null || true
    chown -R horizon:horizon /srv/horizon-data/sessions
    chmod 750 /srv/horizon-data/sessions
fi

# Restore configuration if present
if [ -d "${EXTRACT_DIR}/horizon" ]; then
    echo "[+] Step 3: Restoring configuration files to /etc/horizon/..."
    mkdir -p /etc/horizon
    cp -r "${EXTRACT_DIR}/horizon"/* /etc/horizon/ 2>/dev/null || true
    chown -R horizon:horizon /etc/horizon
    chmod 640 /etc/horizon/* 2>/dev/null || true
    chmod 750 /etc/horizon
fi

echo "[+] Step 4: Restarting services to apply restored state..."
systemctl restart horizon.service || true

echo "=================================================================="
echo "    RESTORATION COMPLETE"
echo "=================================================================="
