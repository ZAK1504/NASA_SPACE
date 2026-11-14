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
    obs_id_1: Optional[str] = Field(None, description="Earlier observation ID")
    obs_id_2: Optional[str] = Field(None, description="Later observation ID")
    observation_id_1: Optional[str] = Field(None, description="Earlier observation ID (alias)")
    observation_id_2: Optional[str] = Field(None, description="Later observation ID (alias)")
    target_name: Optional[str] = Field("Target Field")
    center_ra: Optional[float] = Field(269.4521)
    center_dec: Optional[float] = Field(4.6933)
    cutout_size_arcsec: float = Field(180.0)
    fov_arcsec: Optional[float] = Field(None)
    colormap: str = Field("inferno")
    stretch: str = Field("asinh") # asinh, linear, sqrt, log
    smooth: bool = Field(False)

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

class TimeMachineFrame(BaseModel):
    frame_index: int
    obs_id: str
    date_obs: str
    date_display: str
    bandpass: str
    detector: int
    file_name: str
    image_base64: str
    pixel_scale_arcsec: float = 6.15
    exposure_time_s: float = 120.0
    bunit: str = "MJy / sr"

class TimeMachineManifestResponse(BaseModel):
    target_name: str
    ra: float
    dec: float
    total_frames: int
    baseline_days: int
    frames: List[TimeMachineFrame]
    processing_notes: List[str]
