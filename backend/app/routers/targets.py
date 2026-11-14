from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.target_service import astrometry_service, TARGET_REGISTRY
from app.services.object_service import object_service

router = APIRouter(prefix="/targets", tags=["targets"])

@router.get("", response_model=List[Dict[str, Any]])
def get_canonical_targets():
    """Retrieve all authoritative benchmark targets with canonical reference & propagated coordinates."""
    return object_service.get_all_objects()

@router.get("/{target_id}", response_model=Dict[str, Any])
def get_canonical_target_detail(target_id: str):
    """Retrieve canonical astronomical record and astrometric provenance for a target."""
    obj = object_service.get_object_by_id(target_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Target '{target_id}' not found in canonical registry")
    return obj
