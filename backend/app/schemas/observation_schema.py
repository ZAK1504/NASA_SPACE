from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ObservationRecord(BaseModel):
    id: str
    obs_id: str
    collection: str
    ra: float
    dec: float
    bandpass: str
    wavelength_min_um: Optional[float] = None
    wavelength_max_um: Optional[float] = None
    mjd_start: Optional[float] = None
    mjd_end: Optional[float] = None
    date_obs: Optional[str] = None
    exposure_time_s: Optional[float] = None
    access_url: Optional[str] = None
    fits_url: Optional[str] = None
    preview_url: Optional[str] = None
    data_product_type: str = "image"
    calib_level: int = 2
    pixel_scale_arcsec: Optional[float] = None
    naxis1: Optional[int] = None
    naxis2: Optional[int] = None
    quality_flags: Dict[str, Any] = Field(default_factory=dict)
    is_real_data: bool = True
    archive_source: str = "NASA/IPAC IRSA"

class ObservationListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    query_target: Optional[str] = None
    target_ra: Optional[float] = None
    target_dec: Optional[float] = None
    observations: List[ObservationRecord]
    archive_status: str
    message: Optional[str] = None

class ObservationDetailResponse(BaseModel):
    observation: ObservationRecord
    fits_header_summary: Dict[str, Any] = Field(default_factory=dict)
    has_downloaded_fits: bool = False
    file_size_bytes: Optional[int] = None
