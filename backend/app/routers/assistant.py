import json
import logging
import ipaddress
import os
import secrets
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Request, Response, Body, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, ConfigDict

from app.config import settings
from app.services.copilot_budget_service import copilot_budget_service
from app.services.copilot_ai_service import (
    copilot_ai_service,
    DETERMINISTIC_RESPONSES,
    copilot_in_scope,
    get_scope_refusal,
    COPILOT_SCOPE_REFUSAL,
    COPILOT_SCOPE_ACTIONS,
    COPILOT_SCOPE_QUESTIONS,
)
from app.services.object_service import object_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["assistant"])

class CopilotAction(BaseModel):
    label: str
    url: str

class CopilotChatRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message: str = Field(..., min_length=1, max_length=2000, description="User question or navigational prompt")
    session_id: Optional[str] = Field("anon", max_length=64, description="Anonymous client session identifier")
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="Recent conversation turns")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Active route and target context")

class CopilotStatusResponse(BaseModel):
    ai_enabled: bool
    model: str
    status: str
    circuit_open: bool
    daily_requests: int
    daily_tokens: int
    token_budget: int
    budget_used_percent: float
    monthly_requests: Optional[int] = 0
    monthly_tokens: Optional[int] = 0
    monthly_token_budget: Optional[int] = 3000000

class CopilotQueryResponse(BaseModel):
    response: str
    actions: List[Dict[str, str]]
    suggested_questions: List[str]
    source: str

TRUSTED_PROXIES = {
    "127.0.0.1",
    "::1",
    "localhost",
}
# Extend with any configured trusted proxies
if os.getenv("TRUSTED_PROXIES"):
    for p in os.getenv("TRUSTED_PROXIES", "").split(","):
        if p.strip():
            TRUSTED_PROXIES.add(p.strip())

def get_client_ip(request: Request) -> str:
    """
    Safely extracts client IP address with anti-spoofing protection:
    Forwarded headers are ONLY trusted if direct client host is in TRUSTED_PROXIES.
    """
    direct_ip = request.client.host if request.client else "127.0.0.1"

    # Only trust proxy headers when request originates from a trusted local proxy/reverse-proxy
    if direct_ip in TRUSTED_PROXIES:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            candidate = forwarded.split(",")[0].strip()
            try:
                ipaddress.ip_address(candidate)
                return candidate
            except ValueError:
                pass
        cf_ip = request.headers.get("cf-connecting-ip")
        if cf_ip:
            candidate = cf_ip.strip()
            try:
                ipaddress.ip_address(candidate)
                return candidate
            except ValueError:
                pass

    return direct_ip

def get_or_create_session(request: Request, response: Response, provided_id: Optional[str] = None) -> str:
    """
    Retrieves or establishes a cryptographically secure anonymous session cookie.
    Prevents client-side identity spoofing and rate-limit evasion.
    """
    cookie_session = request.cookies.get("spherex_copilot_session")
    if cookie_session and len(cookie_session) <= 64:
        return cookie_session

    if provided_id and provided_id != "anon" and len(provided_id) <= 64:
        session_id = provided_id
    else:
        session_id = f"sess_{secrets.token_urlsafe(18)}"

    # Issue HttpOnly session cookie
    response.set_cookie(
        key="spherex_copilot_session",
        value=session_id,
        httponly=True,
        samesite="lax",
        max_age=86400 * 30  # 30 days
    )
    return session_id


@router.get("/status", response_model=CopilotStatusResponse)
def get_copilot_status():
    """
    Returns public health and usage metrics for Cosmic Copilot.
    Strictly safeguards API keys and internal credentials.
    """
    metrics = copilot_budget_service.get_usage_metrics()
    is_healthy = metrics["ai_enabled"] and not metrics["circuit_open"]
    return CopilotStatusResponse(
        ai_enabled=metrics["ai_enabled"],
        model=settings.GROQ_MODEL if metrics["ai_enabled"] else "deterministic-fallback",
        status="healthy" if is_healthy else "fallback",
        circuit_open=metrics["circuit_open"],
        daily_requests=metrics["total_requests"],
        daily_tokens=metrics["total_tokens"],
        token_budget=metrics["daily_token_budget"],
        budget_used_percent=metrics["budget_percentage_used"],
        monthly_requests=metrics.get("monthly_requests", 0),
        monthly_tokens=metrics.get("monthly_tokens", 0),
        monthly_token_budget=metrics.get("monthly_token_budget", settings.COSMIC_AI_MONTHLY_TOKEN_BUDGET)
    )


@router.post("/stream")
async def stream_copilot_chat(
    req: CopilotChatRequest,
    request: Request,
    response: Response
):
    """
    Server-Sent Events (SSE) streaming endpoint for Cosmic Copilot.
    Provides progressive token-by-token text generation, dynamic actions,
    suggested questions, honest response source metadata, and token accounting with Groq LLM.
    """
    client_ip = get_client_ip(request)
    session_id = get_or_create_session(request, response, req.session_id)

    # Sanitize and validate history
    clean_history = []
    if req.history:
        for turn in req.history[-8:]:
            if isinstance(turn, dict) and "sender" in turn and "text" in turn:
                clean_history.append({
                    "sender": str(turn["sender"])[:20],
                    "text": str(turn["text"])[:1000]
                })

    # Sanitize scientific context
    clean_context = {}
    if req.context and isinstance(req.context, dict):
        clean_context = {
            "route": str(req.context.get("route", ""))[:100],
            "target_id": str(req.context.get("target_id", ""))[:50],
            "target_name": str(req.context.get("target_name", ""))[:100],
            "ra": req.context.get("ra"),
            "dec": req.context.get("dec"),
            "wavelength_um": req.context.get("wavelength_um"),
            "band": str(req.context.get("band", ""))[:50],
            "detector": str(req.context.get("detector", ""))[:20],
            "mode": str(req.context.get("mode", ""))[:50],
            "subtraction_mode": str(req.context.get("subtraction_mode", ""))[:100],
            "obs_ids": req.context.get("obs_ids") if isinstance(req.context.get("obs_ids"), list) else [],
            "epoch_dates": req.context.get("epoch_dates") if isinstance(req.context.get("epoch_dates"), list) else [],
            "baseline_days": req.context.get("baseline_days"),
            "measured_displacement_arcsec": req.context.get("measured_displacement_arcsec"),
            "catalog_proper_motion": str(req.context.get("catalog_proper_motion", ""))[:100],
            "detection_summary": str(req.context.get("detection_summary", ""))[:150],
            "scientific_limitations": str(req.context.get("scientific_limitations", ""))[:200],
        }

    generator = copilot_ai_service.stream_chat_response(
        message=req.message,
        session_id=session_id,
        client_ip=client_ip,
        history=clean_history,
        context=clean_context
    )

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@router.post("/query", response_model=CopilotQueryResponse)
async def ask_assistant(
    req: CopilotChatRequest,
    request: Request,
    response: Response
) -> Dict[str, Any]:
    """
    Synchronous fallback & backward-compatible endpoint for Cosmic Copilot.
    Uses strict shared validation schema identical to /stream.
    Integrates fast deterministic routing, astronomical glossary, and full responses with honest source metadata.
    """
    raw_message = req.message.strip()
    if not raw_message:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message field is required and must be non-empty."
        )

    q = raw_message.lower().strip()
    client_ip = get_client_ip(request)
    session_id = get_or_create_session(request, response, req.session_id)

    # 1. Fast deterministic navigation command
    fast_nav = copilot_ai_service.is_navigation_command(raw_message)
    if fast_nav:
        return {
            "response": fast_nav["text"],
            "actions": fast_nav["actions"],
            "suggested_questions": copilot_ai_service.generate_suggested_questions(fast_nav["text"], raw_message),
            "source": "deterministic_navigation"
        }

    # 1.5. Server-Side Scientific Scope Guard (Defense in Depth before burning tokens or falling back)
    if not copilot_in_scope(raw_message, req.history):
        return {
            "response": get_scope_refusal(raw_message),
            "actions": COPILOT_SCOPE_ACTIONS,
            "suggested_questions": COPILOT_SCOPE_QUESTIONS,
            "source": "scope_restricted"
        }

    # 2. If AI is enabled and within budget, gather dynamic Groq response
    if copilot_budget_service.is_ai_enabled() and not copilot_budget_service.is_circuit_open():
        tokens = []
        actions = []
        suggested = []
        final_source = "groq_ai"
        try:
            async for sse_event in copilot_ai_service.stream_chat_response(
                message=raw_message,
                session_id=session_id,
                client_ip=client_ip,
                history=req.history or [],
                context=req.context or {}
            ):
                if sse_event.startswith("data: "):
                    payload = json.loads(sse_event[6:].strip())
                    p_type = payload.get("type")
                    if p_type == "token":
                        tokens.append(payload.get("token", ""))
                    elif p_type in ("actions", "fallback"):
                        if "actions" in payload:
                            actions = payload["actions"]
                        if "text" in payload:
                            tokens.append(payload["text"])
                        if "source" in payload:
                            final_source = payload["source"]
                    elif p_type == "suggested_questions":
                        suggested = payload.get("suggested_questions", [])
                    elif p_type == "done" and "source" in payload:
                        final_source = payload["source"]

            if tokens:
                return {
                    "response": "".join(tokens),
                    "actions": actions or copilot_ai_service.extract_actions("".join(tokens), raw_message),
                    "suggested_questions": suggested or copilot_ai_service.generate_suggested_questions("".join(tokens), raw_message),
                    "source": final_source
                }
        except Exception as e:
            logger.error("Synchronous query error: %s", str(e))

    # 3. Deterministic Knowledge Base fallback (when AI is disabled, circuit is open, or out of budget)
    for key, entry in DETERMINISTIC_RESPONSES.items():
        if key in q:
            return {
                "response": entry["text"],
                "actions": entry["actions"],
                "suggested_questions": copilot_ai_service.generate_suggested_questions(entry["text"], raw_message),
                "source": "scientific_knowledge_base"
            }

    # 4. Fallback response
    default_text = (
        "I am your SPHEREx Cosmic Copilot! I can guide you to celestial objects, explain astronomy concepts "
        "(like proper motion, RA/Dec coordinates, and infrared spectroscopy), and take you directly to any exploration tool."
    )
    return {
        "response": default_text,
        "actions": [
            {"label": "Explore Featured Objects", "url": "/objects"},
            {"label": "Start Guided Missions", "url": "/missions"},
            {"label": "Open Interactive Sky Map", "url": "/explore"}
        ],
        "suggested_questions": [
            "Where can I see a star moving?",
            "What is a brown dwarf?",
            "How does the difference image work?",
            "What do the 102 spectral bands detect?"
        ],
        "source": "fallback"
    }
