import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Request, Body, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, ConfigDict

from app.config import settings
from app.services.copilot_budget_service import copilot_budget_service
from app.services.copilot_ai_service import copilot_ai_service, DETERMINISTIC_RESPONSES
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

def get_client_ip(request: Request) -> str:
    """Safely extracts client IP address handling proxies/Cloudflare."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # First IP in list is the original client
        return forwarded.split(",")[0].strip()
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()
    return request.client.host if request.client else "127.0.0.1"


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
        budget_used_percent=metrics["budget_percentage_used"]
    )


@router.post("/stream")
async def stream_copilot_chat(
    req: CopilotChatRequest,
    request: Request
):
    """
    Server-Sent Events (SSE) streaming endpoint for Cosmic Copilot.
    Provides progressive token-by-token text generation, dynamic actions,
    suggested questions, and token usage accounting with Groq LLM.
    """
    client_ip = get_client_ip(request)
    session_id = req.session_id or "anon"

    # Sanitize and validate history
    clean_history = []
    if req.history:
        for turn in req.history[-8:]:
            if isinstance(turn, dict) and "sender" in turn and "text" in turn:
                clean_history.append({
                    "sender": str(turn["sender"])[:20],
                    "text": str(turn["text"])[:1000]
                })

    # Sanitize context
    clean_context = {}
    if req.context and isinstance(req.context, dict):
        clean_context = {
            "route": str(req.context.get("route", ""))[:100],
            "target_id": str(req.context.get("target_id", ""))[:50],
            "band": str(req.context.get("band", ""))[:50],
            "mode": str(req.context.get("mode", ""))[:50]
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


@router.post("/query")
async def ask_assistant(
    request: Request,
    body: Dict[str, Any] = Body(...)
) -> Dict[str, Any]:
    """
    Synchronous fallback & backward-compatible endpoint for Cosmic Copilot.
    Integrates fast deterministic routing, astronomical glossary, and full responses.
    """
    raw_message = body.get("message", "")
    if not isinstance(raw_message, str) or not raw_message.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message field is required and must be non-empty."
        )

    q = raw_message.lower().strip()
    session_id = str(body.get("session_id", "anon"))[:64]
    client_ip = get_client_ip(request)

    # 1. Fast deterministic navigation command
    fast_nav = copilot_ai_service.is_navigation_command(raw_message)
    if fast_nav:
        return {
            "response": fast_nav["text"],
            "actions": fast_nav["actions"],
            "suggested_questions": copilot_ai_service.generate_suggested_questions(fast_nav["text"], raw_message),
            "source": "fast_nav"
        }

    # 2. Check deterministic responses
    for key, entry in DETERMINISTIC_RESPONSES.items():
        if key in q:
            return {
                "response": entry["text"],
                "actions": entry["actions"],
                "suggested_questions": copilot_ai_service.generate_suggested_questions(entry["text"], raw_message),
                "source": "knowledge_base"
            }

    # 3. If AI is enabled and within budget, gather stream into single response
    if copilot_budget_service.is_ai_enabled() and not copilot_budget_service.is_circuit_open():
        tokens = []
        actions = []
        suggested = []
        try:
            async for sse_event in copilot_ai_service.stream_chat_response(
                message=raw_message,
                session_id=session_id,
                client_ip=client_ip,
                history=body.get("history", []),
                context=body.get("context", {})
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
                    elif p_type == "suggested_questions":
                        suggested = payload.get("suggested_questions", [])

            if tokens:
                return {
                    "response": "".join(tokens),
                    "actions": actions or copilot_ai_service.extract_actions("".join(tokens), raw_message),
                    "suggested_questions": suggested or copilot_ai_service.generate_suggested_questions("".join(tokens), raw_message),
                    "source": "groq_ai"
                }
        except Exception as e:
            logger.error("Synchronous query error: %s", str(e))

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
