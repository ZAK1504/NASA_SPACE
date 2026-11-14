from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.services.lightcurve_service import lightcurve_service

router = APIRouter(prefix="/lightcurves", tags=["lightcurves"])

@router.get("", response_model=List[Dict[str, Any]])
def list_lightcurve_targets():
    """Retrieve all astronomical targets with multi-epoch photometric light curves."""
    return lightcurve_service.get_all_lightcurve_targets()

@router.get("/{object_id}", response_model=Dict[str, Any])
def get_lightcurve(object_id: str):
    """Retrieve calibrated multi-band photometric time-series data points for a specific object."""
    lc = lightcurve_service.get_lightcurve(object_id)
    if not lc:
        raise HTTPException(
            status_code=404,
            detail=f"No light curve time-series found for object '{object_id}'. Available targets: r-draconis, rw-aurigae, barnards-star, wise-0855"
        )
    return lc
