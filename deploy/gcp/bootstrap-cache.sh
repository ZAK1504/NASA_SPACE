#!/usr/bin/env bash
# ==============================================================================
# SPHEREx HORIZON — Scientific Benchmark Data & Cache Population Script
# Populates /srv/horizon-data/cache with authentic Level 2 FITS calibration files,
# spectral cube frames, and query indices from NASA/IPAC IRSA.
# ==============================================================================
set -euo pipefail

DATA_DIR="${HORIZON_DATA_DIR:-/srv/horizon-data}"
FITS_DIR="${DATA_DIR}/cache/fits"
HIPS_DIR="${DATA_DIR}/cache/hips"
QUERIES_DIR="${DATA_DIR}/cache/queries"

mkdir -p "${FITS_DIR}" "${HIPS_DIR}" "${QUERIES_DIR}"

echo "=================================================================="
echo "    SPHEREx HORIZON — POPULATING SCIENTIFIC BENCHMARK CACHE"
echo "    Destination: ${DATA_DIR}/cache"
echo "=================================================================="

# 1. Authentic SPHEREx Level 2 FITS Benchmark Calibrations
echo "[+] Step 1: Downloading authentic Level 2 FITS benchmarks from NASA/IPAC IRSA..."
FITS_URLS=(
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W35_1A/l2b-v27-2026-230/1/level2_2025W35_1A_0444_3D2_spx_l2b-v27-2026-230.fits"
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2026W34_2A/l2b-v27-2026-243/1/level2_2026W34_2A_0249_1D2_spx_l2b-v27-2026-243.fits"
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W46_2A/l2b-v27-2026-207/1/level2_2025W46_2A_0214_1D1_spx_l2b-v27-2026-207.fits"
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2026W20_1A/l2b-v27-2026-246/1/level2_2026W20_1A_0728_1D1_spx_l2b-v27-2026-246.fits"
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2025W40_1A/l2b-v27-2026-239/2/level2_2025W40_1A_0675_1D2_spx_l2b-v27-2026-239.fits"
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W40_1A/l2b-v27-2026-276/2/level2_2026W40_1A_0692_1D2_spx_l2b-v27-2026-276.fits"
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/2026W11_1A/l2b-v27-2026-232/1/level2_2026W11_1A_0645_1D1_spx_l2b-v27-2026-232.fits"
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W38_1A/l2b-v27-2026-261/1/level2_2026W38_1A_0565_1D1_spx_l2b-v27-2026-261.fits"
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W28_2A/l2b-v27-2026-276/1/level2_2026W28_2A_0376_3D1_spx_l2b-v27-2026-276.fits"
    "https://irsa.ipac.caltech.edu/ibe/data/spherex/qr3/level2/2026W29_1A/l2b-v27-2026-276/1/level2_2026W29_1A_0430_1D1_spx_l2b-v27-2026-276.fits"
)

for url in "${FITS_URLS[@]}"; do
    filename="$(basename "${url}")"
    dest="${FITS_DIR}/${filename}"
    if [ ! -f "${dest}" ] || [ "$(stat -c%s "${dest}" 2>/dev/null || stat -f%z "${dest}" 2>/dev/null || echo 0)" -lt 50000000 ]; then
        echo "  Downloading ${filename}..."
        curl -sSL --retry 3 --retry-delay 2 -o "${dest}" "${url}"
        echo "  Done: ${filename} ($(du -h "${dest}" | cut -f1))"
    else
        echo "  Cached: ${filename}"
    fi
done

# 2. Seed Query Caches
echo "[+] Step 2: Seeding offline TAP query index..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [ -f "${REPO_ROOT}/backend/populate_query_cache.py" ]; then
    python3 "${REPO_ROOT}/backend/populate_query_cache.py" || true
fi

# Fix ownership
if id -u horizon &>/dev/null; then
    chown -R horizon:horizon "${DATA_DIR}"
fi

echo "=================================================================="
echo "    SCIENTIFIC CACHE POPULATION COMPLETE"
echo "=================================================================="
