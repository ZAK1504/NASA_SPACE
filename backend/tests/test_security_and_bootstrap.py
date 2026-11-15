import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.fits_service import is_safe_fits_url
from app.routers.assistant import get_client_ip

client = TestClient(app)

def test_ssrf_validation_allowlist():
    """Verify that only official HTTPS NASA/IPAC endpoints are permitted and internal IPs are rejected."""
    # Permitted official URLs
    ok, reason = is_safe_fits_url("https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/level2/level2_2025W18.fits")
    assert ok is True, f"Official URL rejected: {reason}"

    ok_nasa, reason_nasa = is_safe_fits_url("https://archive.stsci.edu/missions/spherex/test.fits")
    assert ok_nasa is True, f"Official STScI URL rejected: {reason_nasa}"

    # Prohibited non-HTTPS
    bad_http, _ = is_safe_fits_url("http://irsa.ipac.caltech.edu/test.fits")
    assert bad_http is False

    # Prohibited Cloud metadata (SSRF vector)
    bad_meta, _ = is_safe_fits_url("https://169.254.169.254/computeMetadata/v1/")
    assert bad_meta is False

    bad_meta2, _ = is_safe_fits_url("https://metadata.google.internal/computeMetadata/v1/")
    assert bad_meta2 is False

    # Prohibited Loopback / Localhost
    bad_local, _ = is_safe_fits_url("https://localhost:8000/secret.fits")
    assert bad_local is False

    bad_ip, _ = is_safe_fits_url("https://127.0.0.1:8000/secret.fits")
    assert bad_ip is False

    # Prohibited Arbitrary External Domain
    bad_ext, _ = is_safe_fits_url("https://attacker-domain.com/malicious.fits")
    assert bad_ext is False

def test_preview_endpoint_blocks_ssrf_fits_url():
    """Verify /processing/preview rejects unsafe caller-supplied fits_url with HTTP 400."""
    resp = client.post("/api/processing/preview", json={
        "fits_url": "https://169.254.169.254/computeMetadata/v1/instance/service-accounts/default/token",
        "fov_arcsec": 180.0
    })
    assert resp.status_code == 400
    assert "Prohibited FITS URL" in resp.json()["detail"]

def test_client_ip_anti_spoofing():
    """Verify untrusted client cannot forge IP via X-Forwarded-For to bypass rate limits."""
    class MockRequest:
        def __init__(self, host, headers):
            self.client = type("Client", (), {"host": host})()
            self.headers = headers

    # When request comes from an untrusted client (e.g., 203.0.113.50)
    req_untrusted = MockRequest(
        host="203.0.113.50",
        headers={"x-forwarded-for": "8.8.8.8, 1.1.1.1"}
    )
    # Must NOT trust header; must return actual direct IP
    assert get_client_ip(req_untrusted) == "203.0.113.50"

    # When request comes from a trusted local proxy (127.0.0.1)
    req_trusted = MockRequest(
        host="127.0.0.1",
        headers={"x-forwarded-for": "198.51.100.22, 10.0.0.1"}
    )
    # Must extract the legitimate client IP forwarded by reverse proxy
    assert get_client_ip(req_trusted) == "198.51.100.22"

def test_discovery_journal_session_isolation():
    """Verify discovery journal isolates deletions across sessions."""
    # Session A creates a discovery
    resp_create = client.post(
        "/api/discoveries",
        headers={"x-session-id": "session-alice-123"},
        json={
            "title": "Alice Candidate Object",
            "object_id": "ALICE-001",
            "object_name": "Test Star",
            "notes": "Private research observation",
            "angular_displacement_arcsec": 12.5
        }
    )
    assert resp_create.status_code == 200
    created = resp_create.json()
    disc_id = created["id"]

    # Session B attempts to delete Alice's discovery -> 403 Forbidden
    resp_del_unauth = client.delete(
        f"/api/discoveries/{disc_id}",
        headers={"x-session-id": "session-bob-999"}
    )
    assert resp_del_unauth.status_code == 403
    assert "Forbidden" in resp_del_unauth.json()["detail"]

    # Session A successfully deletes their own discovery
    resp_del_auth = client.delete(
        f"/api/discoveries/{disc_id}",
        headers={"x-session-id": "session-alice-123"}
    )
    assert resp_del_auth.status_code == 200
    assert resp_del_auth.json()["status"] == "deleted"
