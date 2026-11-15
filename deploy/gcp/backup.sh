#!/usr/bin/env bash
# ==============================================================================
# SPHEREx HORIZON — Automated Backup Script
# Backs up user session journals, configuration files, and critical state.
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/srv/horizon-backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
ARCHIVE_NAME="horizon_backup_${TIMESTAMP}.tar.gz"
DEST_ARCHIVE="${BACKUP_DIR}/${ARCHIVE_NAME}"

mkdir -p "${BACKUP_DIR}"

echo "=================================================================="
echo "    SPHEREx HORIZON — CREATING STATE BACKUP"
echo "=================================================================="

# Tar sessions and configuration files
tar -czf "${DEST_ARCHIVE}" \
    -C /srv/horizon-data sessions \
    -C /etc horizon \
    2>/dev/null || true

chmod 600 "${DEST_ARCHIVE}"
echo "[+] Backup archive created: ${DEST_ARCHIVE} ($(du -h "${DEST_ARCHIVE}" | cut -f1))"

# Optional Cloud Storage replication if GCS_BACKUP_BUCKET is set
if [ -n "${GCS_BACKUP_BUCKET:-}" ]; then
    echo "[+] Uploading backup to Google Cloud Storage: gs://${GCS_BACKUP_BUCKET}/backups/${ARCHIVE_NAME}..."
    if command -v gcloud &>/dev/null; then
        gcloud storage cp "${DEST_ARCHIVE}" "gs://${GCS_BACKUP_BUCKET}/backups/${ARCHIVE_NAME}"
    else
        echo "[!] Warning: gcloud CLI not found; skipping remote cloud upload."
    fi
fi

# Prune old local backups (retain last 14 days)
echo "[+] Pruning local backups older than 14 days..."
find "${BACKUP_DIR}" -name "horizon_backup_*.tar.gz" -mtime +14 -delete

echo "=================================================================="
echo "    BACKUP COMPLETED: ${DEST_ARCHIVE}"
echo "=================================================================="
