from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.object_service import object_service
from app.services.coordinate_service import coordinate_service
from app.schemas.object_schema import CoordinateResolveResponse

router = APIRouter(prefix="/objects", tags=["objects"])

@router.get("", response_model=List[dict])
def list_objects(
    q: Optional[str] = Query(None, description="Search query string"),
    type: Optional[str] = Query(None, description="Filter by object type")
):
    """Retrieve all featured astronomical objects with optional search and type filter."""
    if q or type:
        return object_service.search_objects(query=q or "", object_type=type)
    return object_service.get_all_objects()

@router.get("/resolve", response_model=CoordinateResolveResponse)
def resolve_coordinates(query: str = Query(..., description="Object name or coordinate string")):
    """Resolve astronomical object name to sky coordinates using SIMBAD or coordinate parser."""
    result = coordinate_service.resolve_object_name(query)
    return {
        "query": query,
        "resolved": result.get("resolved", False),
        "ra": result.get("ra"),
        "dec": result.get("dec"),
        "ra_hms": result.get("ra_hms"),
        "dec_dms": result.get("dec_dms"),
        "source": result.get("source"),
        "error": result.get("error")
    }

@router.get("/{object_id}", response_model=dict)
def get_object(object_id: str):
    """Retrieve detailed scientific properties of a specific astronomical object."""
    obj = object_service.get_object_by_id(object_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Astronomical object '{object_id}' not found")
    return obj
