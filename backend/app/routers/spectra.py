from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.spectral_service import spectral_service
from app.services.object_service import object_service
from app.services.irsa_service import irsa_service

router = APIRouter(prefix="/spectra", tags=["spectra"])

@router.get("/channels")
def get_all_channels():
    """Retrieve specifications for all 102 SPHEREx near-infrared spectral channels."""
    return {
        "total_channels": 102,
        "wavelength_range_um": [0.75, 5.0],
        "channels": spectral_service.get_all_102_channels()
    }

@router.get("/{object_id}")
def get_target_spectrum(object_id: str):
    """Retrieve spectral measurements and channel coverage for an astronomical object."""
    obj = object_service.get_object_by_id(object_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Object '{object_id}' not found")

    # Fetch observations to determine observed spectral channels
    try:
        observations = irsa_service.query_spherex_observations(
            ra=obj["ra"],
            dec=obj["dec"],
            radius_deg=0.5,
            limit=30
        )
    except Exception:
        observations = []

    coverage = spectral_service.get_spectral_coverage_for_target(
        object_id=object_id,
        observations=observations
    )

    coverage["object_name"] = obj["name"]
    coverage["object_type"] = obj["type"]
    coverage["ra"] = obj["ra"]
    coverage["dec"] = obj["dec"]
    
    return coverage
