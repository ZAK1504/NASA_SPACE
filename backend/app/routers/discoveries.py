import json
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional, Dict, Any
from app.config import settings

router = APIRouter(prefix="/discoveries", tags=["discoveries"])
DISCOVERIES_FILE = settings.DATA_DIR / "discoveries.json"

def _load_discoveries() -> List[Dict[str, Any]]:
    if not DISCOVERIES_FILE.exists():
        return []
    try:
        with open(DISCOVERIES_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def _save_discoveries(items: List[Dict[str, Any]]):
    with open(DISCOVERIES_FILE, "w") as f:
        json.dump(items, f, indent=2)

@router.get("", response_model=List[dict])
def list_discoveries():
    """List all saved user discoveries."""
    return _load_discoveries()

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
    confidence: str = Body("moderate")
):
    """Save a user candidate discovery with scientific notes and analysis."""
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
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    current = _load_discoveries()
    current.insert(0, new_discovery)
    _save_discoveries(current)

    return new_discovery

@router.delete("/{discovery_id}")
def delete_discovery(discovery_id: str):
    """Remove a discovery entry from the journal."""
    current = _load_discoveries()
    updated = [d for d in current if d["id"] != discovery_id]
    if len(updated) == len(current):
        raise HTTPException(status_code=404, detail="Discovery not found")
    _save_discoveries(updated)
    return {"status": "deleted", "id": discovery_id}
