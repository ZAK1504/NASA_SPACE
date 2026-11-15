import json
import re
import uuid
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Header, Body
from pydantic import BaseModel, Field

from app.config import settings

router = APIRouter(prefix="/discoveries", tags=["discoveries"])
_journal_lock = threading.Lock()

# Regex to strictly validate anonymous session IDs and prevent path traversal
SESSION_ID_REGEX = re.compile(r"^[a-zA-Z0-9_-]{8,64}$")

class DiscoveryCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    object_id: str = Field(..., min_length=1, max_length=100)
    object_name: str = Field(..., min_length=1, max_length=100)
    notes: str = Field("", max_length=10000)
    observation_ids: List[str] = Field(default_factory=list)
    analysis_summary: str = Field("", max_length=5000)
    candidate_type: str = Field("moving_source", pattern="^(moving_source|variable_source|transient|new_source)$")
    angular_displacement_arcsec: Optional[float] = Field(None, ge=0.0, le=3600.0)
    confidence: str = Field("moderate", pattern="^(high|moderate|low)$")

def _get_journal_file(session_id: Optional[str]) -> Path:
    """Resolve isolated session-scoped journal path with strict path traversal validation."""
    if session_id:
        if not SESSION_ID_REGEX.match(session_id):
            raise HTTPException(status_code=400, detail="Invalid session ID format. Must be 8-64 alphanumeric characters, underscores, or hyphens.")
        return settings.SESSIONS_DIR / f"journal_{session_id}.json"
    # Fallback default file for non-session requests
    return settings.DATA_DIR / "discoveries.json"

def _load_discoveries_for_session(journal_path: Path) -> List[Dict[str, Any]]:
    if not journal_path.exists():
        return []
    try:
        with open(journal_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []

def _save_discoveries_for_session(journal_path: Path, items: List[Dict[str, Any]]) -> None:
    journal_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = journal_path.with_name(f"{journal_path.name}.tmp.{uuid.uuid4().hex}")
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2)
    temp_path.replace(journal_path)

@router.get("", response_model=List[dict])
def list_discoveries(x_session_id: Optional[str] = Header(None, alias="X-Session-ID")):
    """
    List user discoveries isolated to the requesting user's session.
    Protects user data privacy by ensuring no cross-user record leakage.
    """
    journal_path = _get_journal_file(x_session_id)
    with _journal_lock:
        return _load_discoveries_for_session(journal_path)

@router.post("", response_model=dict)
def save_discovery(
    req: DiscoveryCreateRequest,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Save a candidate discovery with scientific notes and analysis,
    transactionally isolated to the authenticated session container.
    """
    journal_path = _get_journal_file(x_session_id)
    
    new_discovery = {
        "id": str(uuid.uuid4()),
        "title": req.title.strip(),
        "object_id": req.object_id.strip(),
        "object_name": req.object_name.strip(),
        "notes": req.notes.strip(),
        "observation_ids": [o.strip() for o in req.observation_ids[:20]],
        "analysis_summary": req.analysis_summary.strip(),
        "candidate_type": req.candidate_type,
        "angular_displacement_arcsec": req.angular_displacement_arcsec,
        "confidence": req.confidence,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    with _journal_lock:
        current = _load_discoveries_for_session(journal_path)
        current.insert(0, new_discovery)
        # Cap max records per session at 100 entries to prevent resource exhaustion
        _save_discoveries_for_session(journal_path, current[:100])

    return new_discovery

@router.delete("/{discovery_id}")
def delete_discovery(
    discovery_id: str,
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID")
):
    """
    Safely delete a discovery entry strictly owned by the caller's session.
    Cannot modify or delete another user's journal entries.
    """
    journal_path = _get_journal_file(x_session_id)
    
    with _journal_lock:
        current = _load_discoveries_for_session(journal_path)
        updated = [d for d in current if d.get("id") != discovery_id]
        if len(updated) == len(current):
            raise HTTPException(status_code=404, detail="Discovery entry not found in active session journal.")
        _save_discoveries_for_session(journal_path, updated)

    return {"status": "deleted", "id": discovery_id}
