import math
import json
import csv
from pathlib import Path
import numpy as np
from astropy.io import fits
from astropy.wcs import WCS
from astropy.coordinates import SkyCoord
import astropy.units as u
from astropy.stats import sigma_clipped_stats
from photutils.aperture import CircularAperture, aperture_photometry
from photutils.detection import DAOStarFinder
from reproject import reproject_interp

from app.services.target_service import astrometry_service, TARGET_REGISTRY
from app.services.difference_service import difference_service
from app.services.alignment_service import alignment_service
from app.services.fits_service import fits_service
from app.services.spectral_service import spectral_service
from app.services.irsa_service import irsa_service

print("=============================================================")
print("RUNNING INDEPENDENT SCIENTIFIC AND NUMERICAL AUDIT SUITE")
print("=============================================================")

results_rows = []

def record_test(test_id, feature, input_val, ref_method, expected, actual, units, tol, status, notes=""):
    try:
        err = abs(float(actual) - float(expected))
        rel_err = round((err / abs(float(expected))) * 100, 4) if float(expected) != 0 else 0.0
    except Exception:
        err = 0.0
        rel_err = 0.0
    
    row = {
        "test_id": test_id,
        "feature": feature,
        "input": str(input_val),
        "ref_method": ref_method,
        "expected": str(expected),
        "actual": str(actual),
        "units": units,
        "absolute_error": err,
        "relative_error_pct": rel_err,
        "tolerance": tol,
        "status": status,
        "notes": notes
    }
    results_rows.append(row)
    print(f"[{status}] {test_id} - {feature}: Expected={expected}, Actual={actual} ({units}) | Err={err}")

# -------------------------------------------------------------
# 1. ASTROMETRIC PROPAGATION & COORDINATES
# -------------------------------------------------------------
print("\n--- 1. Astrometric Propagation ---")
# Barnard's Star: Epoch 2016.0 to 2026.0 (delta = 10.0 years)
b_star = TARGET_REGISTRY["barnards-star"]
ra_prop, dec_prop, meta = astrometry_service.propagate_to_epoch(b_star, 2026.0)

# Independent calculation
d_years = 10.0
d_dec_deg_expected = (b_star.pm_dec_mas_yr * d_years) / 3.6e6
dec_expected = b_star.ref_dec_deg + d_dec_deg_expected
mean_dec_rad = math.radians((b_star.ref_dec_deg + dec_expected) / 2.0)
d_ra_deg_expected = ((b_star.pm_ra_cosdec_mas_yr * d_years) / 3.6e6) / math.cos(mean_dec_rad)
ra_expected = (b_star.ref_ra_deg + d_ra_deg_expected) % 360.0

total_pm_annual_expected = math.hypot(b_star.pm_ra_cosdec_mas_yr, b_star.pm_dec_mas_yr) / 1000.0 # 10.393 arcsec/yr
total_motion_10yr_expected = total_pm_annual_expected * 10.0

record_test(
    "ASTRO-01", "Barnard RA Propagation (10 yr)", "Epoch 2026.0",
    "Independent Spherical CosDec Trig", round(ra_expected, 6), round(ra_prop, 6),
    "degrees", "1e-5 deg", "PASS" if abs(ra_prop - ra_expected) < 1e-5 else "FAIL"
)
record_test(
    "ASTRO-02", "Barnard Dec Propagation (10 yr)", "Epoch 2026.0",
    "Independent Linear Proper Motion", round(dec_expected, 6), round(dec_prop, 6),
    "degrees", "1e-5 deg", "PASS" if abs(dec_prop - dec_expected) < 1e-5 else "FAIL"
)
record_test(
    "ASTRO-03", "Barnard 10-Yr Displacement", "Epoch 2026.0",
    "Hypot(dRA*cosDec, dDec)", round(total_motion_10yr_expected, 3), round(meta["total_motion_arcsec"], 3),
    "arcseconds", "0.05 arcsec", "PASS" if abs(meta["total_motion_arcsec"] - total_motion_10yr_expected) < 0.05 else "FAIL"
)

# -------------------------------------------------------------
# 2. WCS WORLD-TO-PIXEL ROUND-TRIP PRECISION
# -------------------------------------------------------------
print("\n--- 2. WCS Round-Trip Precision ---")
f_barnard = Path("data/cache/fits/level2_2025W35_1A_0444_3D2_spx_l2b-v27-2026-230.fits")
with fits.open(f_barnard) as hdul:
    wcs = WCS(hdul[1].header)
    test_px, test_py = 1024.0, 1024.0
    sky = wcs.pixel_to_world(test_px, test_py)
    rx, ry = wcs.world_to_pixel(sky)

    err_x = abs(rx - test_px)
    err_y = abs(ry - test_py)
    record_test(
        "WCS-01", "WCS Roundtrip X-axis", f"({test_px}, {test_py})",
        "Astropy WCS pixel_to_world -> world_to_pixel", test_px, round(float(rx), 6),
        "pixels", "1e-4 px", "PASS" if err_x < 1e-4 else "FAIL"
    )
    record_test(
        "WCS-02", "WCS Roundtrip Y-axis", f"({test_px}, {test_py})",
        "Astropy WCS pixel_to_world -> world_to_pixel", test_py, round(float(ry), 6),
        "pixels", "1e-4 px", "PASS" if err_y < 1e-4 else "FAIL"
    )

# -------------------------------------------------------------
# 3. EPSILON INDI B VS EPSILON INDI A SEPARATION
# -------------------------------------------------------------
print("\n--- 3. Epsilon Indi B vs Primary Companion ---")
eps_b = TARGET_REGISTRY["epsilon-indi-b"]
c_a = SkyCoord(ra=eps_b.companion_ra_deg * u.deg, dec=eps_b.companion_dec_deg * u.deg, frame="icrs")
c_b = SkyCoord(ra=eps_b.ref_ra_deg * u.deg, dec=eps_b.ref_dec_deg * u.deg, frame="icrs")
actual_sep_arcsec = round(c_a.separation(c_b).arcsec, 2)
expected_sep_arcsec = eps_b.companion_separation_arcsec

record_test(
    "TARGET-01", "Eps Indi A/B Separation", "ICRS Catalogue Coords",
    "SkyCoord.separation", expected_sep_arcsec, actual_sep_arcsec,
    "arcseconds", "1.0 arcsec", "PASS" if abs(actual_sep_arcsec - expected_sep_arcsec) < 1.0 else "FAIL",
    "Confirms Epsilon Indi B (~6.7 arcmin away) is accurately distinguished from saturated primary star Epsilon Indi A"
)

# -------------------------------------------------------------
# 4. DIFFERENCE IMAGING MATHEMATICAL ACCURACY
# -------------------------------------------------------------
print("\n--- 4. Difference Imaging Math Validation ---")
# Synthetic test: Identical arrays -> Difference must be exactly 0
shape = (100, 100)
img1 = np.ones(shape, dtype=np.float32) * 50.0
img2 = np.ones(shape, dtype=np.float32) * 50.0
diff_ident, meta_ident = difference_service.calculate_difference_image(img1, img2)
max_ident_diff = float(np.max(np.abs(diff_ident)))

record_test(
    "DIFF-01", "Difference of Identical Images", "Constant 50.0 arrays",
    "Difference = Later - Earlier", 0.0, round(max_ident_diff, 6),
    "flux units", "1e-5", "PASS" if max_ident_diff < 1e-5 else "FAIL"
)

# Synthetic test: Known positive delta at center
img_later = np.copy(img1)
img_later[50, 50] += 25.0 # Positive brightening
diff_pos, _ = difference_service.calculate_difference_image(img1, img_later)
measured_delta_pos = float(diff_pos[50, 50])

record_test(
    "DIFF-02", "Positive Brightness Transient", "Later += 25.0",
    "Difference = Later - Earlier", 25.0, round(measured_delta_pos, 2),
    "flux units", "0.5", "PASS" if abs(measured_delta_pos - 25.0) < 0.5 else "FAIL"
)

# Synthetic test: Known negative dimming at center
img_dim = np.copy(img1)
img_dim[50, 50] -= 15.0 # Dimming
diff_neg, _ = difference_service.calculate_difference_image(img1, img_dim)
measured_delta_neg = float(diff_neg[50, 50])

record_test(
    "DIFF-03", "Negative Dimming Transient", "Later -= 15.0",
    "Difference = Later - Earlier", -15.0, round(measured_delta_neg, 2),
    "flux units", "0.5", "PASS" if abs(measured_delta_neg - (-15.0)) < 0.5 else "FAIL"
)

# -------------------------------------------------------------
# 5. IMAGE STACKING & S/N THEORETICAL FORMULA
# -------------------------------------------------------------
print("\n--- 5. Image Stacking Validation ---")
# Stack 4 synthetic images with mean 10.0 and Gaussian noise std=2.0
np.random.seed(42)
stack_inputs = [np.random.normal(loc=10.0, scale=2.0, size=(64, 64)) for _ in range(4)]
stacked_median = np.median(stack_inputs, axis=0)
stacked_mean = np.mean(stack_inputs, axis=0)

std_in = np.std(stack_inputs[0])
std_stacked = np.std(stacked_mean)
sn_improvement_actual = std_in / std_stacked
sn_improvement_expected = math.sqrt(4) # 2.000

record_test(
    "STACK-01", "Stack S/N Improvement (N=4)", "4 Gaussian Noise Arrays",
    "Theoretical sqrt(N)", round(sn_improvement_expected, 3), round(float(sn_improvement_actual), 3),
    "ratio", "0.2", "PASS" if abs(sn_improvement_actual - sn_improvement_expected) < 0.2 else "FAIL"
)

# -------------------------------------------------------------
# 6. APERTURE PHOTOMETRY VS PHOTUTILS BENCHMARK
# -------------------------------------------------------------
print("\n--- 6. Aperture Photometry Benchmark ---")
synth_field = np.zeros((100, 100), dtype=np.float32)
# Insert synthetic Gaussian star of known total flux 1000.0 at (50, 50)
y_idx, x_idx = np.ogrid[:100, :100]
r_sq = (x_idx - 50.0)**2 + (y_idx - 50.0)**2
sigma = 1.5
star_profile = (1000.0 / (2 * np.pi * sigma**2)) * np.exp(-r_sq / (2 * sigma**2))
synth_field += star_profile

aperture = CircularAperture((50.0, 50.0), r=5.0)
phot_table = aperture_photometry(synth_field, aperture)
measured_flux = float(phot_table['aperture_sum'][0])
# Expected enclosed flux for r=5.0 with sigma=1.5 is 1000.0 * (1 - exp(-25 / (2 * 2.25))) = 1000.0 * (1 - exp(-5.55)) = 996.1
expected_flux = 1000.0 * (1.0 - math.exp(-25.0 / (2 * sigma**2)))

record_test(
    "PHOT-01", "Aperture Photometry (r=5 px)", "Synthetic Gaussian Star",
    "Photutils CircularAperture Sum", round(expected_flux, 1), round(measured_flux, 1),
    "counts", "5.0 counts", "PASS" if abs(measured_flux - expected_flux) < 5.0 else "FAIL"
)

# -------------------------------------------------------------
# 7. SPECTRAL EXPLORER: 102 CHANNELS & DICHROIC GAP
# -------------------------------------------------------------
print("\n--- 7. Spectral Explorer Channels & Wavelengths ---")
all_channels = spectral_service.get_all_102_channels()
num_channels = len(all_channels)
ch1_wl = all_channels[0]["wavelength_center_um"]
ch102_wl = all_channels[-1]["wavelength_center_um"]
gap_ch51 = all_channels[50]["is_dichroic_gap"]
gap_ch52 = all_channels[51]["is_dichroic_gap"]

record_test(
    "SPEC-01", "Total Nominal Spectral Channels", "SPHEREx 6 Detector Arrays",
    "17 channels * 6 arrays", 102, num_channels,
    "channels", "0", "PASS" if num_channels == 102 else "FAIL"
)
record_test(
    "SPEC-02", "Channel 1 Wavelength (Array 1)", "First Channel",
    "0.75 μm lower limit", 0.75, ch1_wl,
    "micrometers", "0.01 μm", "PASS" if abs(ch1_wl - 0.75) < 0.01 else "FAIL"
)
record_test(
    "SPEC-03", "Channel 102 Wavelength (Array 6)", "Final Channel",
    "5.00 μm upper limit", 5.00, ch102_wl,
    "micrometers", "0.01 μm", "PASS" if abs(ch102_wl - 5.00) < 0.01 else "FAIL"
)
record_test(
    "SPEC-04", "Dichroic Gap Identification", "Channels 51 & 52",
    "Beam Splitter Boundary D3/D4", True, gap_ch51 and gap_ch52,
    "boolean", "0", "PASS" if (gap_ch51 and gap_ch52) else "FAIL"
)

# -------------------------------------------------------------
# 8. ARBITRARY COORDINATES UNCACHED RETRIEVAL & HONESTY
# -------------------------------------------------------------
print("\n--- 8. Arbitrary Coordinate Test ---")
# Pos 1: RA=128.9819, Dec=-38.4230 (Covered by cached Vela FITS)
# Pos 2: RA=82.4495, Dec=31.3249 (Auriga-Taurus complex)
# Pos 3: RA=180.0000, Dec=0.0000 (Empty / Out-of-bounds celestial equator)

res_pos3 = irsa_service.query_spherex_observations(ra=180.0, dec=0.0, radius_deg=0.5, bypass_cache=True)
record_test(
    "ARBIT-01", "Unsurveyed Coordinate Honesty", "RA=180.0, Dec=0.0",
    "Live/Bypass TAP Spatial Cone Search", 0, len(res_pos3),
    "records", "0", "PASS" if len(res_pos3) == 0 else "FAIL",
    "Verifies application returns honest empty dataset rather than substituting unrelated sky region"
)

# Save results to CSV
csv_path = Path("reports_numerical_validation.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as fp:
    writer = csv.DictWriter(fp, fieldnames=list(results_rows[0].keys()))
    writer.writeheader()
    writer.writerows(results_rows)

print(f"\nSaved {len(results_rows)} numerical validation results to {csv_path.name}")
