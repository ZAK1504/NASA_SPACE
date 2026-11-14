from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_hips_channel_properties():
    """Verify individual SPHEREx HiPS channel properties match HiPS 2D image standard."""
    resp = client.get("/api/spectra/hips/24/properties")
    assert resp.status_code == 200
    assert "dataproduct_type     = image" in resp.text
    assert "hips_tile_format     = png" in resp.text
    assert "creator_did          = ivo://IPAC/P/SPHEREx/DR1/ch24" in resp.text

def test_hips_cube_properties():
    """Verify SPHEREx DR1 HiPS Cube properties match 102-band cube specification."""
    resp = client.get("/api/spectra/hips/cube/properties")
    assert resp.status_code == 200
    assert "dataproduct_type     = cube" in resp.text
    assert "hips_cube_depth      = 102" in resp.text
    assert "hips_cube_firstframe = 1" in resp.text

def test_hips_cube_slice_properties():
    """Verify Aladin Lite v3 frame slice properties resolution."""
    resp = client.get("/api/spectra/hips/cube/24/properties")
    assert resp.status_code == 200
    assert "creator_did          = ivo://IPAC/P/SPHEREx/DR1/ch24" in resp.text

def test_hips_tile_stream():
    """Verify streaming authentic NASA IPAC PNG tile bytes."""
    resp = client.get("/api/spectra/hips/24/Norder0/Dir0/Npix0.png")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "image/png"
    assert len(resp.content) > 1000
