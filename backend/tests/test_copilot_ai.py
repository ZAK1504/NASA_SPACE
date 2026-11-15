import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.services.copilot_budget_service import copilot_budget_service

client = TestClient(app)

def test_copilot_status_endpoint():
    """Verify status endpoint returns public health metrics and NEVER leaks secrets."""
    response = client.get("/api/assistant/status")
    assert response.status_code == 200
    data = response.json()
    assert "ai_enabled" in data
    assert "model" in data
    assert "status" in data
    assert "daily_requests" in data
    assert "daily_tokens" in data
    assert "token_budget" in data
    # Security check: ensure GROQ_API_KEY is not leaked
    assert "gsk_" not in json.dumps(data)
    assert "api_key" not in data

def test_copilot_fast_navigation():
    """Verify navigation commands return instant deterministic fast response without burning Groq tokens."""
    payload = {"message": "open sky map"}
    response = client.post("/api/assistant/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["source"] in ("fast_nav", "deterministic_navigation")
    assert any("/explore" in a["url"] for a in data["actions"])

def test_copilot_streaming_sse():
    """Verify /api/assistant/stream delivers valid Server-Sent Events."""
    payload = {
        "message": "What is Barnard's Star?",
        "session_id": "test-sse-session-123"
    }
    with client.stream("POST", "/api/assistant/stream", json=payload) as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        events = []
        for line in response.iter_lines():
            if line.startswith("data: "):
                event_data = json.loads(line[6:].strip())
                events.append(event_data)
                if event_data.get("type") == "done":
                    break

        # Must have received tokens, actions, and done event
        token_events = [e for e in events if e.get("type") == "token"]
        action_events = [e for e in events if e.get("type") == "actions"]
        done_events = [e for e in events if e.get("type") == "done"]

        assert len(token_events) > 0
        assert len(action_events) > 0
        assert len(done_events) == 1

def test_copilot_rate_limiting():
    """Verify session rate limiting rejects excessive queries."""
    unique_session = "abuse-test-session-999"
    # Make multiple requests rapidly to trip session RPM
    rejected = False
    for i in range(settings.COSMIC_AI_SESSION_RPM + 3):
        res = client.post("/api/assistant/stream", json={
            "message": f"Question number {i}",
            "session_id": unique_session
        })
        for line in res.iter_lines():
            if line.startswith("data: "):
                event = json.loads(line[6:].strip())
                if event.get("type") == "fallback" and "Rate Limit Reached" in event.get("text", ""):
                    rejected = True
                    break
        if rejected:
            break

    assert rejected, "Session RPM rate limiting should have triggered fallback event."

def test_copilot_circuit_breaker():
    """Verify circuit breaker trips and falls back gracefully upon failure."""
    copilot_budget_service.record_groq_failure(500)
    copilot_budget_service.record_groq_failure(500)
    copilot_budget_service.record_groq_failure(500)
    assert copilot_budget_service.is_circuit_open()

    # Reset circuit breaker
    copilot_budget_service.record_groq_success()
    assert not copilot_budget_service.is_circuit_open()

def test_input_validation():
    """Verify long inputs (>2000 chars) are handled or rejected properly."""
    long_msg = "x" * 2500
    res = client.post("/api/assistant/stream", json={"message": long_msg})
    assert res.status_code == 422  # Pydantic validation error
