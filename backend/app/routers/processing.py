import numpy as np
from fastapi import APIRouter, HTTPException, Body
from typing import Optional, Dict, Any
from app.services.image_processing_service import image_processing_service

router = APIRouter(prefix="/processing", tags=["processing"])

@router.post("/preview")
def generate_preview(
    stretch: str = Body("asinh"),
    colormap: str = Body("inferno"),
    lower_percentile: float = Body(0.5),
    upper_percentile: float = Body(99.5),
    object_name: Optional[str] = Body(None),
    ra: Optional[float] = Body(None),
    dec: Optional[float] = Body(None)
):
    """
    Generate display-ready astronomical visualization using Astropy AsinhStretch
    and percentile normalization.
    """
    # Create scientific preview array (256x256)
    np.random.seed(int(abs(ra or 42) * 100) % 10000)
    grid_y, grid_x = np.mgrid[0:256, 0:256]
    
    # Background noise with Poisson / Gaussian distribution
    data = np.random.normal(loc=12.0, scale=3.5, size=(256, 256))
    
    # Central astronomical source with 2D Gaussian PSF
    center_x, center_y = 128, 128
    sigma = 3.5
    psf = np.exp(-((grid_x - center_x)**2 + (grid_y - center_y)**2) / (2 * sigma**2))
    data += 180.0 * psf
    
    # Add several background stars
    num_stars = 14
    for _ in range(num_stars):
        sx = np.random.uniform(20, 236)
        sy = np.random.uniform(20, 236)
        s_flux = np.random.uniform(20, 120)
        s_psf = np.exp(-((grid_x - sx)**2 + (grid_y - sy)**2) / (2 * 2.2**2))
        data += s_flux * s_psf

    b64_img, meta = image_processing_service.render_image_to_base64(
        image_data=data,
        stretch=stretch,
        lower_percentile=lower_percentile,
        upper_percentile=upper_percentile,
        colormap=colormap
    )

    return {
        "image_base64": b64_img,
        "metadata": meta,
        "processing_parameters": {
            "stretch": stretch,
            "colormap": colormap,
            "percentiles": [lower_percentile, upper_percentile]
        }
    }

@router.post("/stack")
def stack_exposures(
    num_exposures: int = Body(3),
    method: str = Body("median"),
    target_name: Optional[str] = Body("WISE 0855"),
    stretch: str = Body("asinh"),
    colormap: str = Body("inferno"),
    ra: Optional[float] = Body(None),
    dec: Optional[float] = Body(None)
):
    """
    Perform multi-exposure image co-addition (median or mean stacking)
    to suppress uncorrelated background Poisson/read noise and boost S/N of faint sources.
    """
    np.random.seed(int(abs(ra or 133.78) * 100) % 10000)
    grid_y, grid_x = np.mgrid[0:256, 0:256]
    
    # Generate N independent exposure frames
    exposures = []
    center_x, center_y = 128, 128
    sigma = 3.2
    psf = np.exp(-((grid_x - center_x)**2 + (grid_y - center_y)**2) / (2 * sigma**2))
    
    # Faint astronomical target (e.g. WISE 0855 brown dwarf)
    target_flux = 35.0
    
    for i in range(num_exposures):
        frame_noise = np.random.normal(loc=15.0, scale=8.0, size=(256, 256))
        frame = frame_noise + target_flux * psf
        
        # Add background reference stars
        for j in range(8):
            np.random.seed(j * 31 + 7)
            sx = np.random.uniform(25, 230)
            sy = np.random.uniform(25, 230)
            s_flux = np.random.uniform(40, 160)
            s_psf = np.exp(-((grid_x - sx)**2 + (grid_y - sy)**2) / (2 * 2.5**2))
            frame += s_flux * s_psf
            
        exposures.append(frame)
        
    stack_array = np.array(exposures)
    
    if method == "median":
        stacked = np.median(stack_array, axis=0)
    else:
        stacked = np.mean(stack_array, axis=0)
        
    # Calculate noise metrics
    single_bg_rms = float(np.std(exposures[0][:50, :50]))
    stacked_bg_rms = float(np.std(stacked[:50, :50]))
    snr_gain = float(single_bg_rms / (stacked_bg_rms + 1e-6))
    
    # Render single exposure and stacked co-add
    single_b64, single_meta = image_processing_service.render_image_to_base64(
        image_data=exposures[0],
        stretch=stretch,
        lower_percentile=1.0,
        upper_percentile=99.0,
        colormap=colormap
    )
    
    stacked_b64, stacked_meta = image_processing_service.render_image_to_base64(
        image_data=stacked,
        stretch=stretch,
        lower_percentile=1.0,
        upper_percentile=99.0,
        colormap=colormap
    )
    
    return {
        "num_exposures_combined": num_exposures,
        "method": method,
        "target_name": target_name,
        "single_exposure_image_base64": single_b64,
        "stacked_image_base64": stacked_b64,
        "single_bg_rms": round(single_bg_rms, 3),
        "stacked_bg_rms": round(stacked_bg_rms, 3),
        "theoretical_snr_gain": round(np.sqrt(num_exposures), 2),
        "measured_snr_gain": round(snr_gain, 2),
        "scientific_notes": [
            f"Median stacking of {num_exposures} exposures suppressed background RMS noise from {round(single_bg_rms, 2)} down to {round(stacked_bg_rms, 2)}.",
            f"Measured signal-to-noise improvement: ×{round(snr_gain, 2)} (Theoretical limit for N={num_exposures} is ×{round(np.sqrt(num_exposures), 2)}).",
            "Scientific caution: High proper motion sources will become spatially smeared in fixed-grid stacks unless shift-and-add alignment is applied along the motion vector."
        ]
    }

