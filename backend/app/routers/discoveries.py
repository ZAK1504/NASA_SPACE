import json
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, Body, Header, Query
from typing import List, Optional, Dict, Any
from app.config import settings

router = APIRouter(prefix="/discoveries", tags=["discoveries"])

def _get_discoveries_file() -> Path:
    # Prefer isolated journal dir if exists, else fall back to data dir
    journal_file = settings.JOURNAL_DIR / "discoveries.json"
    if journal_file.exists():
        return journal_file
    legacy_file = settings.DATA_DIR / "discoveries.json"
    if legacy_file.exists():
        return legacy_file
    return journal_file

def _load_discoveries() -> List[Dict[str, Any]]:
    fpath = _get_discoveries_file()
    if not fpath.exists():
        return []
    try:
        with open(fpath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def _save_discoveries(items: List[Dict[str, Any]]):
    fpath = _get_discoveries_file()
    fpath.parent.mkdir(parents=True, exist_ok=True)
    temp_path = fpath.with_suffix(".tmp")
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2)
    temp_path.replace(fpath)

@router.get("", response_model=List[dict])
def list_discoveries(
    x_session_id: Optional[str] = Header(None),
    session_id: Optional[str] = Query(None)
):
    """
    List user discoveries with session isolation.
    Returns discoveries for the calling session and benchmark sample entries.
    """
    active_session = x_session_id or session_id
    all_items = _load_discoveries()
    if not active_session:
        # Return all public/unisolated items or full list for backwards compatibility
        return all_items
    
    # Return items belonging to this session or unassigned public benchmark items
    return [
        d for d in all_items
        if d.get("owner_session_id") == active_session or not d.get("owner_session_id")
    ]

@router.post("", response_model=dict)
def save_discovery(
    title: str = Body(...),
    object_id: str = Body(...),
    object_name: str = Body(...),
    notes: str = Body(""),
    observation_ids: List[str] = Body(default_factory=list),
    analysis_summary: str = Body(""),
    candidate_type: str = Body("moving_source"),
    angular_displacement_arcsec: Optional[float] = Body(None),
    confidence: str = Body("moderate"),
    x_session_id: Optional[str] = Header(None),
    session_id: Optional[str] = Body(None)
):
    """
    Save a user candidate discovery with session-scoped ownership and scientific notes.
    """
    owner_session = x_session_id or session_id or "default"
    new_discovery = {
        "id": str(uuid.uuid4()),
        "title": title,
        "object_id": object_id,
        "object_name": object_name,
        "notes": notes,
        "observation_ids": observation_ids,
        "analysis_summary": analysis_summary,
        "candidate_type": candidate_type,
        "angular_displacement_arcsec": angular_displacement_arcsec,
        "confidence": confidence,
        "owner_session_id": owner_session,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    current = _load_discoveries()
    current.insert(0, new_discovery)
    _save_discoveries(current)

    return new_discovery

@router.delete("/{discovery_id}")
def delete_discovery(
    discovery_id: str,
    x_session_id: Optional[str] = Header(None),
    session_id: Optional[str] = Query(None)
):
    """
    Remove a discovery entry with ownership verification.
    Prevents unauthorized visitors from deleting other users' discoveries.
    """
    active_session = x_session_id or session_id
    current = _load_discoveries()
    target = None
    for d in current:
        if d["id"] == discovery_id:
            target = d
            break

    if not target:
        raise HTTPException(status_code=404, detail="Discovery not found")

    # If the discovery has an owner, require session match
    owner = target.get("owner_session_id")
    if owner and owner != "default":
        if not active_session or active_session != owner:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Cannot delete discoveries created by another session."
            )

    updated = [d for d in current if d["id"] != discovery_id]
    _save_discoveries(updated)
    return {"status": "deleted", "id": discovery_id}
