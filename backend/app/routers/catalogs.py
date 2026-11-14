from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.catalog_service import catalog_service

router = APIRouter(prefix="/catalogs", tags=["catalogs"])

@router.get("/{object_id}", response_model=Dict[str, Any])
def get_catalog_crossmatch(object_id: str):
    """Retrieve cross-matched multi-mission catalog records (Gaia DR3, AllWISE, SIMBAD, JPL Horizons)."""
    match = catalog_service.get_catalog_crossmatch(object_id)
    if not match:
        raise HTTPException(
            status_code=404,
            detail=f"Catalog cross-match not found for '{object_id}'. Supported objects: barnards-star, wise-0855, epsilon-indi-b, rw-aurigae, r-draconis"
        )
    return match
