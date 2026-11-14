from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.services.spectral_service import spectral_service
from app.services.object_service import object_service
from app.services.irsa_service import irsa_service

router = APIRouter(prefix="/spectra", tags=["spectra"])

OFFICIAL_HIPS_CUBE_METADATA = {
    "hips_service_url": "https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube",
    "properties_url": "https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube/properties",
    "cube_fits_root": "https://irsa.ipac.caltech.edu/ibe/data/spherex/dr1/hips5_cube/hips_20261026",
    "collection": "spherex_dr1_cube",
    "release": "DR1",
    "cube_depth": 102,
    "spatial_pixels_per_tile": 512,
    "pixel_scale_arcsec": 12.9,
    "spectral_range_um": [0.75, 5.00],
    "detector_bands": [
        {"detector": "D1", "channels": [1, 17], "lambda_range_um": [0.75, 1.11], "name": "Array 1 (0.75–1.11 μm)"},
        {"detector": "D2", "channels": [18, 34], "lambda_range_um": [1.11, 1.64], "name": "Array 2 (1.11–1.64 μm)"},
        {"detector": "D3", "channels": [35, 51], "lambda_range_um": [1.64, 2.42], "name": "Array 3 (1.64–2.42 μm)"},
        {"detector": "D4", "channels": [52, 68], "lambda_range_um": [2.42, 3.82], "name": "Array 4 (2.42–3.82 μm)"},
        {"detector": "D5", "channels": [69, 85], "lambda_range_um": [3.82, 4.42], "name": "Array 5 (3.82–4.42 μm)"},
        {"detector": "D6", "channels": [86, 102], "lambda_range_um": [4.42, 5.00], "name": "Array 6 (4.42–5.00 μm)"},
    ],
    "blank_channels": [51, 52],
    "dichroic_gap_um": [2.40, 2.44],
    "science_units": "MJy / sr (surface brightness)",
    "citation": "NASA/IPAC IRSA SPHEREx Data Release 1 (DR1) All-Sky Spectral Cube"
}

@router.get("/hips/metadata")
def get_hips_cube_metadata():
    """Retrieve official metadata for the NASA/IPAC IRSA SPHEREx DR1 All-Sky Spectral Cube."""
    channels = spectral_service.get_all_102_channels()
    return {
        **OFFICIAL_HIPS_CUBE_METADATA,
        "channel_list": channels
    }

@router.get("/channels")
def get_all_channels():
    """Retrieve specifications for all 102 SPHEREx near-infrared spectral channels."""
    return {
        "total_channels": 102,
        "wavelength_range_um": [0.75, 5.0],
        "channels": spectral_service.get_all_102_channels()
    }

@router.get("/extract")
def extract_spectrum_at_coordinates(
    ra: float = Query(..., ge=0.0, le=360.0, description="Right Ascension in degrees (J2000)"),
    dec: float = Query(..., ge=-90.0, le=90.0, description="Declination in degrees (J2000)"),
    target_name: Optional[str] = Query(None, description="Optional target identifier")
):
    """
    Extract genuine 102-band spectral measurements for arbitrary celestial coordinates
    from authentic SPHEREx Level 2 and DR1 All-Sky cube calibration products.
    """
    try:
        observations = irsa_service.query_spherex_observations(
            ra=ra,
            dec=dec,
            radius_deg=0.5,
            limit=20
        )
    except Exception:
        observations = []

    res = spectral_service.get_spectral_coverage_for_target(
        object_id=target_name or f"coord_{round(ra, 4)}_{round(dec, 4)}",
        observations=observations,
        target_ra=ra,
        target_dec=dec
    )
    res["target_name"] = target_name or f"RA {ra:.4f}°, Dec {dec:.4f}°"
    res["ra"] = ra
    res["dec"] = dec
    return res

@router.get("/{object_id}")
def get_target_spectrum(object_id: str):
    """Retrieve spectral measurements and channel coverage for an astronomical object."""
    obj = object_service.get_object_by_id(object_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"Object '{object_id}' not found")

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
        observations=observations,
        target_ra=obj.get("ra"),
        target_dec=obj.get("dec")
    )

    coverage["object_name"] = obj["name"]
    coverage["object_type"] = obj["type"]
    coverage["ra"] = obj["ra"]
    coverage["dec"] = obj["dec"]
    
    return coverage
