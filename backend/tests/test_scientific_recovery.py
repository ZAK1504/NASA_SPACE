import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_archive_search_valid():
    """Verify archive search returns valid SPHEREx products with no HTTP 500 error."""
    resp = client.get("/api/archive/search", params={"ra": 269.452, "dec": 4.693, "radius_deg": 0.5})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert "products" in data
    assert data["total_found"] > 0
    p0 = data["products"][0]
    assert "obs_id" in p0
    assert "bandpass" in p0
    assert "ra" in p0
    assert "dec" in p0

def test_coordinate_validation():
    """Verify unphysical sky coordinates (RA=999, Dec=999) are rejected with HTTP 422/400."""
    resp = client.get("/api/archive/search", params={"ra": 999.0, "dec": 999.0, "radius_deg": 0.5})
    assert resp.status_code in (400, 422), f"Expected 400 or 422 for out-of-bounds coords, got {resp.status_code}"

def test_bandpass_whitelist():
    """Verify ADQL injection attempt via invalid bandpass is rejected."""
    resp = client.get("/api/archive/search", params={"ra": 269.452, "dec": 4.693, "bandpass": "' OR 1=1 --"})
    assert resp.status_code in (400, 422), f"Expected 400 or 422 for invalid bandpass, got {resp.status_code}"

def test_real_fits_preview():
    """Verify /processing/preview renders authentic SPHEREx FITS cutouts without synthetic Gaussian mock stars."""
    resp = client.post("/api/processing/preview", json={
        "ra": 269.4521,
        "dec": 4.6933,
        "fov_arcsec": 180.0,
        "stretch": "asinh",
        "colormap": "inferno"
    })
    assert resp.status_code == 200, f"Preview failed: {resp.text}"
    data = resp.json()
    assert "image_base64" in data
    assert data["image_base64"].startswith("data:image/png;base64,")
    sci_meta = data.get("scientific_metadata", {})
    assert sci_meta.get("is_real_data") is True
    assert sci_meta.get("telescope") == "SPHEREx"
    assert "MJy" in sci_meta.get("bunit", "")
    assert sci_meta.get("pixel_scale_arcsec") == 6.15

def test_authentic_comparison_no_fake_motion():
    """Verify /comparison/align loads real FITS cutouts and does NOT generate fake 34.27\" motion."""
    resp = client.post("/api/comparison/align", json={
        "obs_id_1": "2025W35_1A_0444_3",
        "obs_id_2": "2026W34_2A_0249_1",
        "target_name": "Barnard's Star",
        "center_ra": 269.4521,
        "center_dec": 4.6933,
        "cutout_size_arcsec": 180.0
    })
    assert resp.status_code == 200, f"Comparison failed: {resp.text}"
    data = resp.json()
    assert data["aligned"] is True
    assert data["reprojection_performed"] is True
    assert data["epoch1_image_base64"].startswith("data:image/png;base64,")
    assert data["epoch2_image_base64"].startswith("data:image/png;base64,")
    assert data["difference_image_base64"].startswith("data:image/png;base64,")
    
    # Check candidates: displacement must NOT be the fabricated 34.27"
    for c in data.get("candidates", []):
        assert abs(c["angular_displacement_arcsec"] - 34.27) > 5.0, (
            f"Detected fabricated 34.27\" displacement: {c}"
        )

def test_stack_exposures_real_data():
    """Verify /processing/stack performs co-addition on real SPHEREx data."""
    resp = client.post("/api/processing/stack", json={
        "num_exposures": 3,
        "method": "median",
        "target_name": "Barnard's Star",
        "ra": 269.4521,
        "dec": 4.6933
    })
    assert resp.status_code == 200, f"Stack failed: {resp.text}"
    data = resp.json()
    assert data["is_real_data"] is True
    assert data["measured_snr_gain"] > 0
    assert "stacked_image_base64" in data

def test_spectral_explorer_dichroic_gap():
    """Verify /spectra provides 102 channels with explicit Dichroic Gap at channels 51-52."""
    resp = client.get("/api/spectra/barnards-star")
    assert resp.status_code == 200, f"Spectra failed: {resp.text}"
    data = resp.json()
    assert data["total_bands"] == 102
    assert "dichroic_gap_channels" in data
    assert 51 in data["dichroic_gap_channels"]
    assert 52 in data["dichroic_gap_channels"]
    ch51 = next(c for c in data["channels"] if c["channel"] == 51)
    assert ch51["is_dichroic_gap"] is True

def test_discoveries_clean_from_fake_motion():
    """Verify /discoveries contains NO fabricated 34.27\" entries."""
    resp = client.get("/api/discoveries")
    assert resp.status_code == 200, f"Discoveries failed: {resp.text}"
    data = resp.json()
    for d in data:
        assert abs(d.get("angular_displacement_arcsec", 0.0) - 34.27) > 1.0, (
            f"Found quarantined fake motion record in active discoveries: {d}"
        )

def test_time_machine_manifest():
    """Verify /comparison/manifest returns authentic multi-epoch chronological observation frames."""
    resp = client.post("/api/comparison/manifest", json={
        "ra": 269.4463,
        "dec": 4.7681,
        "target_name": "Barnard's Star",
        "cutout_size_arcsec": 180.0
    })
    assert resp.status_code == 200, f"Manifest failed: {resp.text}"
    data = resp.json()
    assert data["total_frames"] >= 2
    assert data["baseline_days"] > 0
    assert len(data["frames"]) == data["total_frames"]
    f0 = data["frames"][0]
    assert f0["image_base64"].startswith("data:image/png;base64,")
    assert "date_obs" in f0
    assert "obs_id" in f0

def test_hips_metadata():
    """Verify /spectra/hips/metadata returns official SPHEREx DR1 All-Sky HiPS Cube specs."""
    resp = client.get("/api/spectra/hips/metadata")
    assert resp.status_code == 200, f"HiPS metadata failed: {resp.text}"
    data = resp.json()
    assert data["cube_depth"] == 102
    assert 51 in data["blank_channels"]
    assert 52 in data["blank_channels"]
    assert len(data["channel_list"]) == 102

def test_extract_spectrum():
    """Verify /spectra/extract extracts calibrated 102-band spectrum at arbitrary sky coordinates."""
    resp = client.get("/api/spectra/extract", params={"ra": 269.4463, "dec": 4.7681, "target_name": "Barnard's Star"})
    assert resp.status_code == 200, f"Extract spectrum failed: {resp.text}"
    data = resp.json()
    assert data["total_bands"] == 102
    assert "channels" in data
    assert len(data["channels"]) == 102
