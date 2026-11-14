from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CandidateDetection(BaseModel):
    id: str
    target_name: str
    ra: float
    dec: float
    pixel_x_epoch1: float
    pixel_y_epoch1: float
    pixel_x_epoch2: float
    pixel_y_epoch2: float
    angular_displacement_arcsec: float
    estimated_proper_motion_mas_yr: Optional[float] = None
    flux_epoch1: Optional[float] = None
    flux_epoch2: Optional[float] = None
    delta_magnitude: Optional[float] = None
    candidate_type: str = "moving_source"  # moving_source or variable_source
    confidence: str = "moderate"           # high, moderate, low
    explanation: str
    scientific_limitations: str

class ComparisonRequest(BaseModel):
    observation_id_1: str = Field(..., description="Earlier observation ID")
    observation_id_2: str = Field(..., description="Later observation ID")
    center_ra: Optional[float] = None
    center_dec: Optional[float] = None
    cutout_size_arcsec: float = 120.0
    colormap: str = "inferno"
    stretch: str = "asinh" # asinh, linear, sqrt, log

class ComparisonResponse(BaseModel):
    observation_1: Dict[str, Any]
    observation_2: Dict[str, Any]
    common_footprint: bool
    overlap_area_arcmin2: Optional[float] = None
    epoch1_image_base64: str
    epoch2_image_base64: str
    difference_image_base64: Optional[str] = None
    aligned: bool
    reprojection_performed: bool
    stretch_used: str
    min_percentile: float
    max_percentile: float
    candidates: List[CandidateDetection] = Field(default_factory=list)
    processing_notes: List[str] = Field(default_factory=list)
    scientific_disclaimer: str = (
        "Calculations performed using Astropy WCS and Reproject. "
        "Candidate detections are potential astronomical features, not confirmed discoveries."
    )
