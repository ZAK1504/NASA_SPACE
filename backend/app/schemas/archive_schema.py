from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ArchiveProductRecord(BaseModel):
    obs_id: str
    collection: str
    target_name: Optional[str] = None
    s_ra: float
    s_dec: float
    bandpass: str
    wavelength_min_m: float
    wavelength_max_m: float
    t_min_mjd: float
    t_max_mjd: float
    access_url: str
    datalink_url: Optional[str] = None
    fits_url: Optional[str] = None
    filesize_bytes: Optional[int] = None
    dataproduct_type: str = "image"
    calib_level: int = 2

class ArchiveQueryRequest(BaseModel):
    ra: float = Field(..., description="Right Ascension in decimal degrees (J2000)")
    dec: float = Field(..., description="Declination in decimal degrees (J2000)")
    radius_deg: float = Field(default=0.5, description="Search radius in degrees")
    collection: Optional[str] = "spherex_dr1"
    bandpass: Optional[str] = None

class ArchiveQueryResponse(BaseModel):
    ra: float
    dec: float
    radius_deg: float
    total_found: int
    products: List[ArchiveProductRecord]
    archive_url: str = "https://irsa.ipac.caltech.edu/TAP"
    query_time_seconds: float
    cached: bool = False
