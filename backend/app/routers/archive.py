import time
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.irsa_service import irsa_service
from app.schemas.archive_schema import ArchiveQueryResponse

router = APIRouter(prefix="/archive", tags=["archive"])

@router.get("/search", response_model=ArchiveQueryResponse)
def search_archive(
    ra: float = Query(..., ge=0.0, le=360.0, description="Right Ascension (degrees, J2000, 0-360)"),
    dec: float = Query(..., ge=-90.0, le=90.0, description="Declination (degrees, J2000, -90 to +90)"),
    radius_deg: float = Query(0.5, gt=0.0, le=5.0, description="Search radius in degrees (0 to 5)"),
    bandpass: Optional[str] = Query(None, description="Optional SPHEREx detector bandpass (e.g. SPHEREx-D1 to SPHEREx-D6)"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of observations to retrieve")
):
    """
    Query the official NASA/IPAC IRSA SPHEREx archive (spherex.obscore)
    using IVOA TAP spatial cone search with strict astronomical coordinate validation.
    """
    start_time = time.time()
    try:
        records = irsa_service.query_spherex_observations(
            ra=ra,
            dec=dec,
            radius_deg=radius_deg,
            limit=limit,
            bandpass=bandpass
        )
        elapsed = time.time() - start_time
        return {
            "ra": ra,
            "dec": dec,
            "radius_deg": radius_deg,
            "total_found": len(records),
            "products": records,
            "archive_url": "https://irsa.ipac.caltech.edu/TAP",
            "query_time_seconds": round(elapsed, 3),
            "cached": False
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"IRSA archive query error: {str(e)}")
