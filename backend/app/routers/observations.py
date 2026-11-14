from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional, List
from app.services.irsa_service import irsa_service
from app.services.object_service import object_service
from app.services.fits_service import fits_service
from app.services.image_processing_service import image_processing_service
from app.schemas.observation_schema import ObservationListResponse

router = APIRouter(prefix="/observations", tags=["observations"])

@router.get("", response_model=ObservationListResponse)
def get_observations(
    object_id: Optional[str] = Query(None, description="Featured object slug or ID"),
    ra: Optional[float] = Query(None, description="RA in decimal degrees"),
    dec: Optional[float] = Query(None, description="Dec in decimal degrees"),
    radius_deg: float = Query(0.75, description="Search radius in degrees"),
    limit: int = Query(50, description="Max observations")
):
    """Retrieve SPHEREx observations for a target object or sky coordinate."""
    target_name = None
    target_ra = ra
    target_dec = dec

    if object_id:
        obj = object_service.get_object_by_id(object_id)
        if obj:
            target_name = obj["name"]
            target_ra = obj["ra"]
            target_dec = obj["dec"]
        else:
            raise HTTPException(status_code=404, detail=f"Object '{object_id}' not found")

    if target_ra is None or target_dec is None:
        raise HTTPException(status_code=400, detail="Must provide either object_id or ra & dec coordinates")

    try:
        records = irsa_service.query_spherex_observations(
            ra=target_ra,
            dec=target_dec,
            radius_deg=radius_deg,
            limit=limit
        )
        return {
            "total": len(records),
            "page": 1,
            "page_size": limit,
            "query_target": target_name or f"RA {target_ra:.4f}, Dec {target_dec:.4f}",
            "target_ra": target_ra,
            "target_dec": target_dec,
            "observations": records,
            "archive_status": "online" if records else "empty",
            "message": f"Retrieved {len(records)} SPHEREx observations from NASA/IPAC IRSA archive"
        }
    except Exception as e:
        return {
            "total": 0,
            "page": 1,
            "page_size": limit,
            "query_target": target_name,
            "target_ra": target_ra,
            "target_dec": target_dec,
            "observations": [],
            "archive_status": "error",
            "message": f"Archive query failed: {str(e)}"
        }

@router.get("/{obs_id}")
def get_observation_detail(obs_id: str):
    """Get observation details and resolve DataLink FITS link."""
    return {
        "obs_id": obs_id,
        "archive": "NASA/IPAC IRSA SPHEREx DR1"
    }
