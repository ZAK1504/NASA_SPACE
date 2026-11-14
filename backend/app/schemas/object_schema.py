from pydantic import BaseModel, Field
from typing import List, Optional

class CoordinateInfo(BaseModel):
    ra_deg: float
    dec_deg: float
    ra_hms: str
    dec_dms: str

class AstronomicalObject(BaseModel):
    id: str
    name: str
    type: str
    ra: float
    dec: float
    ra_hms: str
    dec_dms: str
    description: str
    tags: List[str]
    slug: str
    proper_motion_ra: Optional[float] = None  # mas/yr
    proper_motion_dec: Optional[float] = None # mas/yr
    parallax: Optional[float] = None          # mas
    distance_ly: Optional[float] = None       # light-years
    spectral_type: Optional[str] = None
    observation_count: int = 0

class CoordinateResolveRequest(BaseModel):
    query: str = Field(..., description="Object name or coordinate string")

class CoordinateResolveResponse(BaseModel):
    query: str
    resolved: bool
    ra: Optional[float] = None
    dec: Optional[float] = None
    ra_hms: Optional[str] = None
    dec_dms: Optional[str] = None
    source: Optional[str] = None
    error: Optional[str] = None
