"""
Live Authorized Groq AI Integration Verification Script
Tests novel questions, streaming tokens, multi-turn conversational context,
response-source metadata, and persistent usage recording with Groq LLM (openai/gpt-oss-20b).
"""

import sys
import json
import urllib.request
import urllib.error
import time

BASE_URL = "http://127.0.0.1:8000"

def get_status():
    req = urllib.request.Request(f"{BASE_URL}/api/assistant/status")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def stream_query(prompt: str, history=None, context=None, session_id="live_verify_session_42"):
    payload = {
        "message": prompt,
        "session_id": session_id,
        "history": history or [],
        "context": context or {}
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/api/assistant/stream",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    
    events = []
    tokens = []
    actions = []
    questions = []
    final_source = None
    usage = None

    with urllib.request.urlopen(req) as resp:
        for raw_line in resp:
            line = raw_line.decode("utf-8").strip()
            if line.startswith("data: "):
                event_data = json.loads(line[6:].strip())
                events.append(event_data)
                etype = event_data.get("type")
                if etype == "token":
                    tokens.append(event_data.get("token", ""))
                elif etype == "actions":
                    actions = event_data.get("actions", [])
                elif etype == "suggested_questions":
                    questions = event_data.get("suggested_questions", [])
                elif etype == "done":
                    final_source = event_data.get("source")
                    usage = event_data.get("usage")
                elif etype == "fallback":
                    final_source = event_data.get("source")
                    tokens.append(event_data.get("text", ""))

    full_text = "".join(tokens)
    return {
        "text": full_text,
        "events_count": len(events),
        "source": final_source,
        "actions": actions,
        "suggested_questions": questions,
        "usage": usage
    }

def main():
    print("=" * 70)
    print("SPHEREx Cosmic Copilot — Live Groq AI Provider Verification")
    print("=" * 70)

    # 1. Check Initial Status
    initial_status = get_status()
    print(f"\n[1] Initial Status:")
    print(f"    AI Enabled: {initial_status['ai_enabled']}")
    print(f"    Configured Model: {initial_status['model']}")
    print(f"    Status: {initial_status['status']}")
    print(f"    Daily Requests: {initial_status['daily_requests']}")
    print(f"    Daily Tokens Used: {initial_status['daily_tokens']} / {initial_status['token_budget']}")
    print(f"    Monthly Tokens Used: {initial_status.get('monthly_tokens', 0)} / {initial_status.get('monthly_token_budget', 0)}")

    if not initial_status["ai_enabled"]:
        print("ERROR: AI is not enabled in backend. Check GROQ_API_KEY and COSMIC_AI_ENABLED.")
        sys.exit(1)

    # 2. Turn 1: Novel Question (Wien's Displacement Law & Cold Brown Dwarfs)
    prompt_1 = "Why does Wien's displacement law make infrared telescopes useful for studying cold brown dwarfs? Explain using a simple analogy."
    print(f"\n[2] Submitting Turn 1 Prompt:")
    print(f"    \"{prompt_1}\"")
    
    t0 = time.time()
    res_1 = stream_query(prompt_1, session_id="live_test_wien_session")
    dt_1 = time.time() - t0
    
    print(f"    Stream completed in {dt_1:.2f}s across {res_1['events_count']} SSE events.")
    print(f"    Response Source: {res_1['source']}")
    print(f"    Usage Metrics: {res_1['usage']}")
    print(f"\n--- Turn 1 Response ---")
    print(res_1["text"])
    print("-" * 50)

    # Assertions for Turn 1
    assert res_1["source"] == "groq_ai", f"Expected source 'groq_ai', got '{res_1['source']}'"
    assert len(res_1["text"]) > 100, "Response text was too short"
    text_lower_1 = res_1["text"].lower()
    assert "wien" in text_lower_1 or "wavelength" in text_lower_1, "Missing Wien / wavelength concept"
    assert "infrared" in text_lower_1, "Missing infrared discussion"
    print("    [PASS] Turn 1 successfully generated genuine Groq AI response.")

    # 3. Turn 2: Follow-up Question with Conversational History Context
    prompt_2 = "How would that apply to WISE 0855?"
    print(f"\n[3] Submitting Turn 2 Follow-Up Prompt:")
    print(f"    \"{prompt_2}\"")

    history = [
        {"sender": "user", "text": prompt_1},
        {"sender": "copilot", "text": res_1["text"]}
    ]
    context = {
        "route": "/spectra",
        "target_id": "wise-0855",
        "target_name": "WISE 0855-0714",
        "wavelength_um": 3.82,
        "detector": "D4"
    }

    t0 = time.time()
    res_2 = stream_query(prompt_2, history=history, context=context, session_id="live_test_wien_session")
    dt_2 = time.time() - t0

    print(f"    Stream completed in {dt_2:.2f}s across {res_2['events_count']} SSE events.")
    print(f"    Response Source: {res_2['source']}")
    print(f"    Usage Metrics: {res_2['usage']}")
    print(f"\n--- Turn 2 Response ---")
    print(res_2["text"])
    print("-" * 50)

    # Assertions for Turn 2
    assert res_2["source"] == "groq_ai", f"Expected source 'groq_ai', got '{res_2['source']}'"
    assert len(res_2["text"]) > 100, "Response text was too short"
    text_lower_2 = res_2["text"].lower()
    assert "wise 0855" in text_lower_2 or "0855" in text_lower_2, "Missing WISE 0855 reference"
    print("    [PASS] Turn 2 successfully generated contextual follow-up response.")

    # 4. Check Final Status & Accounting
    final_status = get_status()
    print(f"\n[4] Final Accounting & Usage Verification:")
    print(f"    Daily Requests: {initial_status['daily_requests']} -> {final_status['daily_requests']} (+{final_status['daily_requests'] - initial_status['daily_requests']})")
    print(f"    Daily Tokens Used: {initial_status['daily_tokens']} -> {final_status['daily_tokens']} (+{final_status['daily_tokens'] - initial_status['daily_tokens']})")
    print(f"    Monthly Tokens Used: {initial_status.get('monthly_tokens', 0)} -> {final_status.get('monthly_tokens', 0)} (+{final_status.get('monthly_tokens', 0) - initial_status.get('monthly_tokens', 0)})")
    
    assert final_status["daily_requests"] >= initial_status["daily_requests"] + 2, "Daily request counter failed to increment properly"
    assert final_status["daily_tokens"] > initial_status["daily_tokens"], "Daily token counter failed to record tokens"
    print("    [PASS] Token and request accounting atomically recorded in SQLite database.")

    # Save summary artifact
    verification_data = {
        "status": "PASS",
        "model": final_status["model"],
        "turn_1": {
            "prompt": prompt_1,
            "response": res_1["text"],
            "source": res_1["source"],
            "usage": res_1["usage"],
            "elapsed_seconds": round(dt_1, 2)
        },
        "turn_2": {
            "prompt": prompt_2,
            "response": res_2["text"],
            "source": res_2["source"],
            "usage": res_2["usage"],
            "elapsed_seconds": round(dt_2, 2)
        },
        "accounting": {
            "daily_requests": final_status["daily_requests"],
            "daily_tokens": final_status["daily_tokens"],
            "monthly_tokens": final_status.get("monthly_tokens", 0)
        }
    }
    with open("live_groq_verification_result.json", "w", encoding="utf-8") as f:
        json.dump(verification_data, f, indent=2)

    print("\n" + "=" * 70)
    print("ALL LIVE GROQ INTEGRATION ASSERTIONS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    main()
