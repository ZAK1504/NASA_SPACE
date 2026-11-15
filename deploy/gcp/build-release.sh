#!/usr/bin/env bash
# ==============================================================================
# SPHEREx HORIZON — Production Release Build Script
# Builds production static frontend bundle and prepares Python virtualenv
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

RELEASE_TAG="${1:-$(git -C "${REPO_ROOT}" rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"
BUILD_DIR="${REPO_ROOT}/build/release-${RELEASE_TAG}"

echo "=================================================================="
echo "    SPHEREx HORIZON — BUILDING RELEASE: ${RELEASE_TAG}"
echo "=================================================================="

# 1. Clean Build Directory
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/frontend"
mkdir -p "${BUILD_DIR}/backend"

# 2. Build Frontend Static Assets
echo "[+] Step 1: Building production frontend with Vite..."
cd "${REPO_ROOT}/frontend"

# Enforce same-origin API configuration
export VITE_API_BASE_URL="/api"
export NODE_ENV="production"

if [ -f package-lock.json ]; then
    npm ci --prefer-offline || npm install
else
    npm install
fi

# Run TypeScript type check
echo "    Running TypeScript type checking..."
npm run typecheck || npm run build -- --mode production

# Build optimized production bundle
npm run build

# Verify build output
if [ ! -f "${REPO_ROOT}/frontend/dist/index.html" ]; then
    echo "[!] Error: Frontend build failed — dist/index.html not found!" >&2
    exit 1
fi
echo "    Frontend build verified successfully."

# Copy dist to release
cp -r "${REPO_ROOT}/frontend/dist" "${BUILD_DIR}/frontend/dist"

# 3. Package Backend Files & Dependencies
echo "[+] Step 2: Packaging backend application..."
cd "${REPO_ROOT}/backend"

# Copy backend source tree excluding local caches, test logs, and virtual environments
mkdir -p "${BUILD_DIR}/backend/app"
cp -r "${REPO_ROOT}/backend/app"/* "${BUILD_DIR}/backend/app/"
cp "${REPO_ROOT}/backend/requirements.txt" "${BUILD_DIR}/backend/"

# Setup release virtualenv
echo "    Creating Python virtualenv in release directory..."
python3 -m venv "${BUILD_DIR}/backend/venv"
"${BUILD_DIR}/backend/venv/bin/pip" install --upgrade pip setuptools wheel
"${BUILD_DIR}/backend/venv/bin/pip" install -r "${BUILD_DIR}/backend/requirements.txt"

# Record build metadata
cat <<EOF > "${BUILD_DIR}/release_info.json"
{
  "release_tag": "${RELEASE_TAG}",
  "built_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "git_commit": "$(git -C "${REPO_ROOT}" rev-parse HEAD 2>/dev/null || echo "unknown")",
  "git_branch": "$(git -C "${REPO_ROOT}" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")"
}
EOF

echo "=================================================================="
echo "    RELEASE BUILD COMPLETE: ${BUILD_DIR}"
echo "=================================================================="
