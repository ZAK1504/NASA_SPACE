#!/usr/bin/env bash
# ==============================================================================
# SPHEREx HORIZON — Production Smoke Test & API Verification Suite
# Tests single-origin reverse proxy, frontend SPA routing, scientific endpoints,
# FITS rendering, spectral frames, and security headers.
# ==============================================================================
set -euo pipefail

TARGET_URL="${1:-http://127.0.0.1}"
echo "=================================================================="
echo "    SPHEREx HORIZON — EXECUTING SMOKE TESTS ON: ${TARGET_URL}"
echo "=================================================================="

FAILED=0
TOTAL=0

assert_test() {
    local name="$1"
    local status="$2"
    local expected="$3"
    TOTAL=$((TOTAL + 1))
    if [ "${status}" = "${expected}" ]; then
        echo "  [PASS] ${name} (Expected: ${expected}, Got: ${status})"
    else
        echo "  [FAIL] ${name} (Expected: ${expected}, Got: ${status})" >&2
        FAILED=$((FAILED + 1))
    fi
}

# 1. Frontend Root Serving
echo "[+] Test 1: Frontend SPA Index HTML"
STATUS=$(curl -s -k -o /tmp/horizon_index.html -w "%{http_code}" "${TARGET_URL}/")
assert_test "Frontend Root /" "${STATUS}" "200"
if grep -q "SPHEREx HORIZON" /tmp/horizon_index.html 2>/dev/null || grep -q "root" /tmp/horizon_index.html 2>/dev/null; then
    echo "  [PASS] HTML body contains expected React SPA root container"
else
    echo "  [FAIL] HTML body missing React root element" >&2
    FAILED=$((FAILED + 1))
fi

# 2. React Router Deep Link Handling
echo "[+] Test 2: React Router Deep Linking"
STATUS=$(curl -s -k -o /dev/null -w "%{http_code}" "${TARGET_URL}/explore")
assert_test "Deep Link /explore" "${STATUS}" "200"

# 3. Backend Health Check
echo "[+] Test 3: Backend Health API"
STATUS=$(curl -s -k -o /tmp/horizon_health.json -w "%{http_code}" "${TARGET_URL}/api/health")
assert_test "API /api/health" "${STATUS}" "200"
if grep -q "healthy" /tmp/horizon_health.json 2>/dev/null; then
    echo "  [PASS] Health API status is healthy"
else
    echo "  [FAIL] Health API payload missing 'healthy'" >&2
    FAILED=$((FAILED + 1))
fi

# 4. IRSA Archive Search
echo "[+] Test 4: Astronomical Archive Search (Barnard's Star Coordinates)"
STATUS=$(curl -s -k -o /tmp/horizon_archive.json -w "%{http_code}" "${TARGET_URL}/api/archive/search?ra=269.452&dec=4.693&radius_deg=0.5")
assert_test "API /api/archive/search" "${STATUS}" "200"
if grep -q "products" /tmp/horizon_archive.json 2>/dev/null; then
    echo "  [PASS] Archive search returned valid product catalog"
else
    echo "  [FAIL] Archive search response missing products" >&2
    FAILED=$((FAILED + 1))
fi

# 5. Scientific Cutout Rendering
echo "[+] Test 5: Scientific Preview Cutout Generation"
STATUS=$(curl -s -k -o /tmp/horizon_preview.json -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -d '{"ra": 269.4521, "dec": 4.6933, "fov_arcsec": 180.0, "stretch": "asinh", "colormap": "inferno"}' \
    "${TARGET_URL}/api/processing/preview")
assert_test "POST /api/processing/preview" "${STATUS}" "200"
if grep -q "data:image/png;base64" /tmp/horizon_preview.json 2>/dev/null; then
    echo "  [PASS] Preview generated authentic base64 PNG astronomical cutout"
else
    echo "  [FAIL] Preview output missing base64 image data" >&2
    FAILED=$((FAILED + 1))
fi

# 6. Spectral Cube Frame Serving
echo "[+] Test 6: Spectral Explorer Frame Serving"
STATUS=$(curl -s -k -o /tmp/horizon_frame.png -w "%{http_code}" "${TARGET_URL}/api/spectra/frame/1")
assert_test "GET /api/spectra/frame/1" "${STATUS}" "200"

# 7. Optical Dichroic Gap Channel 51 Honesty Check
echo "[+] Test 7: Dichroic Gap Channel 51 Honesty"
STATUS=$(curl -s -k -o /tmp/horizon_gap.json -w "%{http_code}" "${TARGET_URL}/api/spectra/frame/51")
assert_test "GET /api/spectra/frame/51 (Gap)" "${STATUS}" "404"

# 8. Security Headers Verification
echo "[+] Test 8: Security Headers Inspection"
HEADERS=$(curl -s -I -k "${TARGET_URL}/")
if echo "${HEADERS}" | grep -iq "x-content-type-options: nosniff"; then
    echo "  [PASS] X-Content-Type-Options: nosniff present"
else
    echo "  [WARN] X-Content-Type-Options header missing (check reverse proxy configuration)"
fi

if echo "${HEADERS}" | grep -iq "x-frame-options: DENY"; then
    echo "  [PASS] X-Frame-Options: DENY present"
else
    echo "  [WARN] X-Frame-Options header missing"
fi

# 9. Anonymous Session Journal Isolation
echo "[+] Test 9: Journal Session Isolation"
SESSION_ID="test-session-$(date +%s)"
STATUS=$(curl -s -k -o /tmp/horizon_journal.json -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -H "X-Session-ID: ${SESSION_ID}" \
    -d '{"target_name": "Barnard'\''s Star", "target_ra": 269.452, "target_dec": 4.693, "notes": "Production smoke test note", "confidence": "high"}' \
    "${TARGET_URL}/api/discoveries")
assert_test "POST /api/discoveries (with X-Session-ID)" "${STATUS}" "200"

echo "=================================================================="
if [ "${FAILED}" -eq 0 ]; then
    echo "    ALL ${TOTAL} PRODUCTION SMOKE TESTS PASSED SUCCESSFULLY!"
    echo "=================================================================="
    exit 0
else
    echo "    SMOKE TESTS FAILED: ${FAILED} of ${TOTAL} tests failed."
    echo "=================================================================="
    exit 1
fi
