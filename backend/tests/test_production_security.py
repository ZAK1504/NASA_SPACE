import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.fits_service import fits_service
from app.config import settings

client = TestClient(app)

def test_ssrf_blocking_metadata_and_private_ips():
    """Verify that requests to cloud metadata service, loopback, and private IPs are blocked."""
    evil_targets = [
        "http://169.254.169.254/computeMetadata/v1/",
        "https://169.254.169.254/latest/meta-data",
        "http://127.0.0.1:8000/internal",
        "http://localhost:8000/secret",
        "http://10.0.0.1/admin",
        "http://192.168.1.1/gateway",
        "https://evil-attacker.com/malicious.fits",
    ]

    for target in evil_targets:
        with pytest.raises(ValueError) as excinfo:
            fits_service.validate_outbound_url(target)
        err = str(excinfo.value).lower()
        assert any(term in err for term in ["prohibited", "scheme", "host", "ssrf", "blocked", "permitted"])

def test_ssrf_allowed_archives():
    """Verify that legitimate NASA/IPAC IRSA and STScI archive endpoints are permitted."""
    valid_targets = [
        "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/sample.fits",
        "https://mast.stsci.edu/api/v0.1/Download/file?uri=mast:SPHEREx/sample.fits",
    ]

    for target in valid_targets:
        validated = fits_service.validate_outbound_url(target)
        assert validated == target

def test_hips_directory_traversal_prevention():
    """Verify that path traversal attempts in HiPS tile routing return HTTP 400 or 422."""
    traversal_paths = [
        "/api/spectra/hips/..%2F..%2Fetc/Dir0/Npix0.png",
        "/api/spectra/hips/order0/..%2F..%2Fetc/Npix0.png",
        "/api/spectra/hips/order0/Dir0/Npix..png",
        "/api/spectra/hips/order0/Dir0/Npix-1.png",
    ]

    for path in traversal_paths:
        resp = client.get(path)
        assert resp.status_code in (400, 404, 422), f"Expected 400, 404, or 422 for traversal {path}, got {resp.status_code}"

def test_session_journal_isolation():
    """Verify that anonymous session journals are strictly isolated by X-Session-ID header."""
    session_a = "session_test_alpha_999"
    session_b = "session_test_beta_888"

    # User A creates a journal entry
    resp_a = client.post(
        "/api/discoveries",
        headers={"X-Session-ID": session_a},
        json={
            "title": "User A Investigation",
            "object_id": "barnards-star",
            "object_name": "Barnard's Star",
            "notes": "User A Private Notes",
            "confidence": "high",
            "candidate_type": "moving_source"
        }
    )
    assert resp_a.status_code == 200, f"Expected 200, got {resp_a.status_code}: {resp_a.text}"
    entry_a = resp_a.json()
    id_a = entry_a["id"]

    # User B creates a journal entry
    resp_b = client.post(
        "/api/discoveries",
        headers={"X-Session-ID": session_b},
        json={
            "title": "User B Investigation",
            "object_id": "wise-0855",
            "object_name": "WISE 0855",
            "notes": "User B Private Notes",
            "confidence": "moderate",
            "candidate_type": "moving_source"
        }
    )
    assert resp_b.status_code == 200, f"Expected 200, got {resp_b.status_code}: {resp_b.text}"

    # User A reads journal -> must only see User A's entry
    list_a = client.get("/api/discoveries", headers={"X-Session-ID": session_a}).json()
    assert any(e["id"] == id_a for e in list_a)
    assert not any("User B Private Notes" in e.get("notes", "") for e in list_a)

    # User B reads journal -> must only see User B's entry
    list_b = client.get("/api/discoveries", headers={"X-Session-ID": session_b}).json()
    assert not any(e["id"] == id_a for e in list_b)
    assert any("User B Private Notes" in e.get("notes", "") for e in list_b)

    # User B attempts to delete User A's discovery -> must return 404
    del_resp = client.delete(f"/api/discoveries/{id_a}", headers={"X-Session-ID": session_b})
    assert del_resp.status_code == 404, "Cross-session deletion must be prevented!"

    # Clean up: User A deletes own entry
    clean_resp = client.delete(f"/api/discoveries/{id_a}", headers={"X-Session-ID": session_a})
    assert clean_resp.status_code == 200

def test_session_id_path_traversal_rejection():
    """Verify that malicious X-Session-ID containing path traversal is rejected with HTTP 400."""
    resp = client.get("/api/discoveries", headers={"X-Session-ID": "../../etc/passwd"})
    assert resp.status_code == 400
    assert "Invalid session ID format" in resp.json().get("detail", "")

def test_production_health_endpoint_masking(monkeypatch):
    """Verify that /api/health masks internal filesystem paths when APP_ENV=production."""
    monkeypatch.setattr(settings, "APP_ENV", "production")
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    # Ensure raw local server filesystem directories are not exposed
    assert "data_dir" not in data
    assert "fits_dir" not in data
