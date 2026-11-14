import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.target_service import astrometry_service, TARGET_REGISTRY
from app.services.archive_discovery_service import archive_discovery_service

client = TestClient(app)

def test_canonical_target_registry_coverage():
    """All 5 NASA challenge targets exist with complete astrometric metadata."""
    targets = astrometry_service.get_all_targets()
    target_ids = {t.id for t in targets}
    required_ids = {"barnards-star", "wise-0855", "epsilon-indi-b", "rw-aurigae", "r-draconis"}
    assert required_ids.issubset(target_ids)
    
    for t in targets:
        assert t.ref_ra_deg > 0
        assert -90 <= t.ref_dec_deg <= 90
        assert t.reference_epoch != ""
        assert t.spectral_type != ""
        assert t.astrometric_citation != ""

def test_wise_0855_westward_motion_propagation():
    """WISE 0855 moves westward (negative pmRA); propagated RA must decrease."""
    target = TARGET_REGISTRY.get("wise-0855")
    assert target is not None
    # Discovery epoch 2010.4: RA ~ 133.7951
    # pmRA is -8118.0 mas/yr
    ra_prop, dec_prop, _ = astrometry_service.propagate_to_epoch(target, 2026.0)
    assert ra_prop < target.ref_ra_deg
    assert round(ra_prop, 4) == 133.7597
    assert round(dec_prop, 4) == -7.2422

def test_barnards_star_astrometric_propagation():
    """Barnard's Star has dominant northward proper motion (+10.36 arcsec/yr)."""
    target = TARGET_REGISTRY.get("barnards-star")
    assert target is not None
    ra_prop, dec_prop, _ = astrometry_service.propagate_to_epoch(target, 2026.0)
    assert dec_prop > target.ref_dec_deg
    assert round(ra_prop, 4) == 269.4463
    assert round(dec_prop, 4) == 4.7682

def test_epsilon_indi_a_vs_b_distinction():
    """Verify primary star Epsilon Indi A is distinct from brown dwarf binary Epsilon Indi B (~90 arcsec separation)."""
    target = TARGET_REGISTRY.get("epsilon-indi-b")
    assert target is not None
    assert target.companion_name == "Epsilon Indi A"
    assert target.companion_separation_arcsec > 80.0
    assert "Saturated Core" in target.companion_type
    
    # Coordinates of A vs B
    assert abs(target.companion_ra_deg - 330.8402) < 0.01
    assert abs(target.companion_dec_deg - (-56.7860)) < 0.01
    
    ra_b, dec_b, _ = astrometry_service.propagate_to_epoch(target, 2026.0)
    assert abs(ra_b - 331.0964) < 0.01

def test_targets_api_endpoints():
    """Test /api/targets and /api/targets/{id} endpoints."""
    res = client.get("/api/targets")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    
    res_b = client.get("/api/targets/barnards-star")
    assert res_b.status_code == 200
    b_data = res_b.json()
    assert b_data["name"] == "Barnard's Star"
    assert "proper_motion_ra" in b_data

def test_archive_discovery_multi_epoch_manifest():
    """Archive discovery service correctly recovers available products and dates."""
    manifest = archive_discovery_service.discover_and_prepare_manifest(
        target_name="Barnard's Star",
        ra=269.4463,
        dec=4.7682,
        cutout_size_arcsec=180.0
    )
    assert manifest.total_frames >= 2
    assert manifest.baseline_days >= 350
    assert manifest.total_archive_products is not None
    assert manifest.total_archive_products > 0
    assert manifest.archive_distinct_dates is not None
    assert manifest.archive_distinct_dates >= 2

def test_comparison_endpoint_alignment_and_metrics():
    """Comparison /api/comparison/align returns 3-view images and detection breakdown metrics."""
    res = client.post("/api/comparison/align", json={
        "obs_id_1": "2025W35_1A_0444_3",
        "obs_id_2": "2026W34_2A_0249_1",
        "target_name": "Barnard's Star",
        "cutout_size_arcsec": 180.0,
        "stretch": "asinh",
        "colormap": "inferno"
    })
    assert res.status_code == 200
    data = res.json()
    assert "epoch1_image_base64" in data
    assert "epoch2_image_base64" in data
    assert "difference_image_base64" in data
    assert data["difference_image_base64"] is not None
    assert "detection_metrics" in data
    metrics = data["detection_metrics"]
    assert metrics is not None
    assert "astrometric_stability_arcsec" in metrics
    assert "associations" in metrics
