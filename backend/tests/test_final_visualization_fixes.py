import os
from pathlib import Path
import numpy as np
import pytest
from fastapi.testclient import TestClient
from astropy.io import fits
from astropy.wcs import WCS
from app.main import app
from app.services.image_processing_service import ImageProcessingService
from app.routers.comparison import _resolve_fits_file_for_obs

client = TestClient(app)

def test_standard_northup_cutout_projection():
    """Verify that extract_standard_northup_cutout creates tangent-projected arrays with North UP and East LEFT."""
    fits_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "cache", "fits", "level2_2025W35_1A_0444_3D2_spx_l2b-v27-2026-230.fits"
    )
    assert os.path.exists(fits_path), f"FITS file not found: {fits_path}"
    
    # Target: Barnard's Star, 15 arcminutes (900 arcseconds)
    ra = 269.4521
    dec = 4.6933
    fov_arcsec = 900.0
    
    with fits.open(fits_path) as hdul:
        data = hdul[1].data
        wcs = WCS(hdul[1].header)

    cutout, wcs_out, valid_frac = ImageProcessingService.extract_standard_northup_cutout(
        image_data=data,
        wcs=wcs,
        center_ra=ra,
        center_dec=dec,
        size_arcsec=fov_arcsec,
        pixel_scale_arcsec=6.15
    )
    
    # Expected dimension: round(900 / 6.15) = 146 pixels
    expected_dim = int(round(900.0 / 6.15))
    assert cutout.shape == (expected_dim, expected_dim), f"Shape {cutout.shape} != ({expected_dim}, {expected_dim})"
    
    # Verify astrometric orientation in TAN WCS
    header = wcs_out.to_header()
    assert header["CTYPE1"] == "RA---TAN"
    assert header["CTYPE2"] == "DEC--TAN"
    # Standard astronomical convention:
    # CDELT2 > 0 -> Increasing Y goes North (North UP)
    # CDELT1 < 0 -> Increasing X goes West, meaning East is to the LEFT (East LEFT)
    assert header["CDELT2"] > 0, "CDELT2 must be positive (North UP)"
    assert header["CDELT1"] < 0, "CDELT1 must be negative (East LEFT)"
    assert abs(header["CDELT2"] * 3600.0 - 6.15) < 1e-4, "Pixel scale must be 6.15 arcsec/pixel"

def test_white_frame_prevention_on_flat_or_nan_data():
    """Verify render_image_to_base64 handles degenerate/empty/flat arrays safely and flags is_valid=False."""
    # Degenerate all-NaN array
    nan_arr = np.full((50, 50), np.nan)
    b64_nan, meta_nan = ImageProcessingService.render_image_to_base64(nan_arr, stretch="asinh", colormap="gray")
    assert meta_nan["is_valid"] is False, "All-NaN array must have is_valid=False"
    assert b64_nan.startswith("data:image/png;base64,")

    # Degenerate all-zero array
    zero_arr = np.zeros((50, 50))
    b64_zero, meta_zero = ImageProcessingService.render_image_to_base64(zero_arr, stretch="asinh", colormap="gray")
    assert meta_zero["is_valid"] is False, "All-zero array must have is_valid=False"
    assert b64_zero.startswith("data:image/png;base64,")

def test_exact_product_resolution_footprint_guard():
    """Verify _resolve_fits_file_for_obs rejects files whose celestial footprint is far from the target."""
    # Barnard's Star coords (RA ~ 269.45°, Dec ~ 4.69°)
    ra_barnard = 269.4521
    dec_barnard = 4.6933
    
    # Asking for a Barnard's Star obs ID should succeed
    f_match = _resolve_fits_file_for_obs("2025W35_1A_0444_3", ra_barnard, dec_barnard)
    assert f_match is not None, "Barnard's Star obs ID must resolve to local cached FITS"
    assert "2025W35" in str(f_match)
    
    # Asking for an Epsilon Indi B obs ID at Barnard's Star coordinates must return None (not substitute wrong file)
    f_unrelated = _resolve_fits_file_for_obs("2026W40_1A_0692_1", ra_barnard, dec_barnard)
    assert f_unrelated is None, "Obs ID >100° away must return None, preventing silent wrong-field substitution"

def test_time_machine_honest_single_epoch_handling():
    """Verify that when only 1 epoch is available, the backend does not substitute an unrelated field."""
    resp = client.post("/api/comparison/align", json={
        "target_name": "WISE 0855-0714",
        "ra": 133.8496,
        "dec": -7.2438,
        "obs_id_1": "2025W50_2A_0254_1",
        "obs_id_2": "2025W50_2A_0254_1",
        "fov_arcsec": 900.0,
        "stretch": "asinh",
        "colormap": "gray"
    })
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    # In single-epoch case, difference_image_base64 must be None
    assert data.get("difference_image_base64") is None, "Single-epoch comparison must not produce synthetic difference map"
    assert len(data.get("candidates", [])) == 0, "No change candidates when only 1 epoch is available"
    notes = " ".join(data.get("processing_notes", []))
    assert "single" in notes.lower()

def test_spectral_preloader_endpoints():
    """Verify spectral preloader status and trigger endpoints respond correctly."""
    # Status endpoint
    status_resp = client.get("/api/spectra/hips/preload/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert "is_ready" in status_data
    assert "total_channels" in status_data
    assert status_data["total_channels"] == 100
    assert "prepared_channels" in status_data

    # Preload trigger endpoint (Band D1)
    preload_resp = client.post("/api/spectra/hips/preload?mode=d1")
    assert preload_resp.status_code == 200
    preload_data = preload_resp.json()
    assert preload_data.get("success") is True
    assert "d1" in preload_data.get("mode", "").lower()

def test_processing_preview_standard_northup_15arcmin():
    """Verify POST /api/processing/preview standardizes orientation and dimensions for 15' FOV."""
    resp = client.post("/api/processing/preview", json={
        "ra": 269.4521,
        "dec": 4.6933,
        "fov_arcsec": 900.0,
        "stretch": "asinh",
        "colormap": "gray"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "image_base64" in data
    assert data["image_base64"].startswith("data:image/png;base64,")
    sci_meta = data.get("scientific_metadata", {})
    assert sci_meta.get("dimensions") == [146, 146]
    assert sci_meta.get("pixel_scale_arcsec") == 6.15
    assert sci_meta.get("telescope") == "SPHEREx"
