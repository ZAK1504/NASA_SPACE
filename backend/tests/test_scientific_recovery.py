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

def test_target_coordinates_simbad_gaia_accuracy():
    """Verify authoritative SIMBAD & Gaia DR3 coordinates across all 5 benchmark targets."""
    from app.services.object_service import object_service
    from app.services.coordinate_service import coordinate_service

    # Check object_service coordinates
    objects = {o["slug"]: o for o in object_service.get_all_objects()}
    assert abs(objects["barnards-star"]["ra"] - 269.4463) < 0.01
    assert abs(objects["barnards-star"]["dec"] - 4.7682) < 0.01

    assert abs(objects["wise-0855"]["ra"] - 133.7598) < 0.01
    assert abs(objects["wise-0855"]["dec"] - (-7.2428)) < 0.01

    assert abs(objects["epsilon-indi-b"]["ra"] - 331.0964) < 0.01 or abs(objects["epsilon-indi-b"]["reference_coords"]["ra_deg"] - 331.0441) < 0.01
    assert abs(objects["epsilon-indi-b"]["dec"] - (-56.8012)) < 0.01 or abs(objects["epsilon-indi-b"]["reference_coords"]["dec_deg"] - (-56.7828)) < 0.01

    assert abs(objects["rw-aurigae"]["ra"] - 76.9561) < 0.01
    assert abs(objects["rw-aurigae"]["dec"] - 30.4013) < 0.01

    assert abs(objects["r-draconis"]["ra"] - 248.1676) < 0.01
    assert abs(objects["r-draconis"]["dec"] - 66.7550) < 0.01

    # Check coordinate_service name resolver
    c_rw = coordinate_service.resolve_object_name("RW Aurigae")
    assert abs(c_rw["ra"] - 76.9561) < 0.01
    assert abs(c_rw["dec"] - 30.4013) < 0.01

    c_r_dra = coordinate_service.resolve_object_name("R Draconis")
    assert abs(c_r_dra["ra"] - 248.1676) < 0.01
    assert abs(c_r_dra["dec"] - 66.7550) < 0.01

    c_eps = coordinate_service.resolve_object_name("Epsilon Indi B")
    assert abs(c_eps["ra"] - 331.0441) < 0.01
    assert abs(c_eps["dec"] - (-56.7828)) < 0.01

def test_exact_product_resolution_no_silent_fallback():
    """Verify requesting an unobserved or non-existent observation returns 404 without silent substitution."""
    resp = client.post("/api/comparison/align", json={
        "obs_id_1": "DEFINITELY_NONEXISTENT_OBS_ID_99999",
        "obs_id_2": "DEFINITELY_NONEXISTENT_OBS_ID_88888",
        "target_name": "Unknown",
        "center_ra": 0.0,
        "center_dec": 0.0,
    })
    assert resp.status_code == 404, f"Expected 404 for missing obs product, got {resp.status_code}"
    assert "Silent substitution is prohibited" in resp.json().get("detail", "")

def test_epsilon_indi_b_real_fits_preview():
    """Verify Epsilon Indi B preview renders authentic SPHEREx Level 2 FITS cutout."""
    resp = client.post("/api/processing/preview", json={
        "ra": 331.0441,
        "dec": -56.7828,
        "fov_arcsec": 180.0,
        "stretch": "asinh",
        "colormap": "inferno"
    })
    assert resp.status_code == 200, f"Preview failed: {resp.text}"
    data = resp.json()
    assert data["image_base64"].startswith("data:image/png;base64,")
    assert any(x in data["scientific_metadata"]["obs_id"] for x in ["2025W40_1A", "2026W40_1A"])

def test_r_draconis_real_fits_preview():
    """Verify R Draconis preview renders authentic SPHEREx Level 2 FITS cutout."""
    resp = client.post("/api/processing/preview", json={
        "ra": 248.1676,
        "dec": 66.7550,
        "fov_arcsec": 180.0,
        "stretch": "asinh",
        "colormap": "inferno"
    })
    assert resp.status_code == 200, f"Preview failed: {resp.text}"
    data = resp.json()
    assert data["image_base64"].startswith("data:image/png;base64,")
    assert "2026W29_1A" in data["scientific_metadata"]["obs_id"]

def test_authoritative_coordinates_consistency():
    """Verify canonical coordinate consistency across target registry and object definitions."""
    from app.services.target_service import TARGET_REGISTRY
    from app.services.object_service import object_service

    # Authoritative reference coordinates
    expected = {
        "barnards-star": (269.448503, 4.739420, "Gaia DR3"),
        "wise-0855": (133.795129, -7.245147, "Luhman"),
        "epsilon-indi-b": (331.044147, -56.782844, "Scholz"),
        "rw-aurigae": (76.956067, 30.401326, "Gaia DR3"),
        "r-draconis": (248.167611, 66.754979, "Gaia DR3"),
    }

    for tid, (exp_ra, exp_dec, cat_sub) in expected.items():
        assert tid in TARGET_REGISTRY
        tgt = TARGET_REGISTRY[tid]
        assert abs(tgt.ref_ra_deg - exp_ra) < 0.001
        assert abs(tgt.ref_dec_deg - exp_dec) < 0.001
        assert cat_sub in tgt.catalog_source

        # Also check object service
        obj = object_service.get_object_by_id(tid)
        assert obj is not None
        # J2026 propagated position must be consistent
        assert abs(obj["ra"] - tgt.ref_ra_deg) < 0.1 or tgt.pm_ra_cosdec_mas_yr != 0

    # Ensure incorrect coordinates (77.4642, 248.3304) never appear
    assert abs(TARGET_REGISTRY["rw-aurigae"].ref_ra_deg - 77.4642) > 0.4
    assert abs(TARGET_REGISTRY["r-draconis"].ref_ra_deg - 248.3304) > 0.1

def test_actual_fits_target_footprint_and_science_pixels():
    """Verify actual FITS files cover target celestial coordinates within 2040x2040 detector science arrays."""
    from astropy.io import fits
    from astropy.wcs import WCS
    from astropy.coordinates import SkyCoord
    import astropy.units as u
    from app.config import settings

    fits_cache = settings.FITS_CACHE_DIR
    assert fits_cache.exists()

    checks = [
        ("wise-0855", 133.76, -7.242, "level2_2026W20_1A_0728_1"),
        ("rw-aurigae", 76.9561, 30.4013, "level2_2026W11_1A_0645_1"),
        ("barnards-star", 269.4463, 4.7682, "level2_2026W34_2A_0249_1"),
        ("epsilon-indi-b", 331.096, -56.801, "level2_2026W40_1A_0692_1"),
        ("r-draconis", 248.1675, 66.755, "level2_2026W29_1A_0430_1"),
    ]

    for tid, ra, dec, filename_prefix in checks:
        matching = list(fits_cache.glob(f"*{filename_prefix}*.fits"))
        assert len(matching) > 0, f"Missing required FITS file for {tid} ({filename_prefix})"
        
        found_covered = False
        coord = SkyCoord(ra=ra * u.deg, dec=dec * u.deg, frame="icrs")
        for fpath in matching:
            with fits.open(fpath) as hdul:
                hdr = hdul[1].header
                w = WCS(hdr)
                if not getattr(w, "is_celestial", False):
                    continue
                px, py = w.world_to_pixel(coord)
                px_val = float(px)
                py_val = float(py)
                naxis1 = int(hdr.get("NAXIS1", 2040))
                naxis2 = int(hdr.get("NAXIS2", 2040))
                if 0 <= px_val < naxis1 and 0 <= py_val < naxis2:
                    found_covered = True
                    data = hdul[1].data
                    val = float(data[int(round(py_val)), int(round(px_val))])
                    import math
                    assert not math.isinf(val)
                    break

        assert found_covered, f"No matching FITS file for {tid} ({filename_prefix}) covers target within native science array"

def test_extended_multi_epoch_baselines():
    """Verify genuine recovered baselines for challenge targets."""
    from astropy.io import fits
    from datetime import datetime
    from app.config import settings

    fits_cache = settings.FITS_CACHE_DIR

    def get_date_obs(prefix):
        matches = list(fits_cache.glob(f"*{prefix}*.fits"))
        assert len(matches) > 0, f"Cannot find {prefix}"
        h = fits.getheader(matches[0], 1)
        d_str = h.get("DATE-OBS", h.get("DATE", ""))
        return datetime.fromisoformat(d_str.replace("Z", ""))

    # WISE 0855: Nov 2025 to May 2026
    d_wise1 = get_date_obs("2025W46_2A_0214_1")
    d_wise2 = get_date_obs("2026W20_1A_0728_1")
    baseline_wise = (d_wise2 - d_wise1).total_seconds() / 86400.0
    assert baseline_wise >= 179.0, f"WISE baseline was {baseline_wise} days, expected >= 179"

    # RW Aurigae: March 2026 to Sept 2026
    d_rw1 = get_date_obs("2026W11_1A_0645_1")
    d_rw2 = get_date_obs("2026W38_1A_0565_1")
    baseline_rw = (d_rw2 - d_rw1).total_seconds() / 86400.0
    assert baseline_rw >= 188.0, f"RW Aurigae baseline was {baseline_rw} days, expected >= 188"

    # Barnard's Star: Aug 2025 to Aug 2026
    d_bs1 = get_date_obs("2025W35_1A_0444_3")
    d_bs2 = get_date_obs("2026W34_2A_0249_1")
    baseline_bs = (d_bs2 - d_bs1).total_seconds() / 86400.0
    assert baseline_bs >= 358.0, f"Barnards Star baseline was {baseline_bs} days, expected >= 358"

    # Epsilon Indi B: Oct 2025 to Oct 2026
    d_eps1 = get_date_obs("2025W40_1A_0675_1")
    d_eps2 = get_date_obs("2026W40_1A_0692_1")
    baseline_eps = (d_eps2 - d_eps1).total_seconds() / 86400.0
    assert baseline_eps >= 363.0, f"Eps Indi baseline was {baseline_eps} days, expected >= 363"

def test_spectral_preload_and_frame_api():
    """Verify genuine spectral preparation and synchronous frame serving."""
    # 1. Audit status
    resp = client.get("/api/spectra/hips/preload/status?mode=all")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_channels"] == 100
    assert data["prepared_channels"] == 100
    assert data["is_ready"] is True
    assert data["failed_channels"] == 0

    # 2. Check valid frame
    resp_frame = client.get("/api/spectra/frame/24")
    assert resp_frame.status_code == 200
    assert resp_frame.headers["content-type"] == "image/png"
    assert resp_frame.headers["x-spherex-channel"] == "24"
    assert resp_frame.headers["x-spherex-detector"] == "D2"
    assert len(resp_frame.content) > 1000

    # 3. Check optical dichroic gap channels 51 and 52 return honest 404
    for ch in (51, 52):
        resp_gap = client.get(f"/api/spectra/frame/{ch}")
        assert resp_gap.status_code == 404
        assert "Optical Dichroic Gap" in resp_gap.json()["detail"]

