from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Dict, Any

class ArchiveProductRecord(BaseModel):
    obs_id: str
    collection: str = "spherex_dr1"
    target_name: Optional[str] = None
    ra: float
    dec: float
    s_ra: Optional[float] = None
    s_dec: Optional[float] = None
    bandpass: str = ""
    wavelength_min_um: Optional[float] = None
    wavelength_max_um: Optional[float] = None
    wavelength_min_m: Optional[float] = None
    wavelength_max_m: Optional[float] = None
    mjd_start: Optional[float] = None
    mjd_end: Optional[float] = None
    t_min_mjd: Optional[float] = None
    t_max_mjd: Optional[float] = None
    date_obs: Optional[str] = None
    exposure_time_s: Optional[float] = None
    access_url: Optional[str] = None
    datalink_url: Optional[str] = None
    fits_url: Optional[str] = None
    filesize_bytes: Optional[int] = None
    file_size_bytes: Optional[int] = None
    dataproduct_type: str = "image"
    data_product_type: str = "image"
    calib_level: int = 2
    pixel_scale_arcsec: Optional[float] = 6.15
    naxis1: Optional[int] = 2040
    naxis2: Optional[int] = 2040
    is_real_data: bool = True
    archive_source: str = "NASA/IPAC IRSA"

    @model_validator(mode='before')
    @classmethod
    def populate_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Synchronize ra / s_ra
            if 'ra' in data and data.get('s_ra') is None:
                data['s_ra'] = data['ra']
            elif 's_ra' in data and data.get('ra') is None:
                data['ra'] = data['s_ra']
            
            # Synchronize dec / s_dec
            if 'dec' in data and data.get('s_dec') is None:
                data['s_dec'] = data['dec']
            elif 's_dec' in data and data.get('dec') is None:
                data['dec'] = data['s_dec']

            # Synchronize mjd
            if 'mjd_start' in data and data.get('t_min_mjd') is None:
                data['t_min_mjd'] = data['mjd_start']
            elif 't_min_mjd' in data and data.get('mjd_start') is None:
                data['mjd_start'] = data['t_min_mjd']

            if 'mjd_end' in data and data.get('t_max_mjd') is None:
                data['t_max_mjd'] = data['mjd_end']
            elif 't_max_mjd' in data and data.get('mjd_end') is None:
                data['mjd_end'] = data['t_max_mjd']

            # Synchronize wavelengths
            if 'wavelength_min_um' in data and data.get('wavelength_min_m') is None:
                if data['wavelength_min_um'] is not None:
                    data['wavelength_min_m'] = data['wavelength_min_um'] * 1e-6
            elif 'wavelength_min_m' in data and data.get('wavelength_min_um') is None:
                if data['wavelength_min_m'] is not None:
                    data['wavelength_min_um'] = round(data['wavelength_min_m'] * 1e6, 3)

            if 'wavelength_max_um' in data and data.get('wavelength_max_m') is None:
                if data['wavelength_max_um'] is not None:
                    data['wavelength_max_m'] = data['wavelength_max_um'] * 1e-6
            elif 'wavelength_max_m' in data and data.get('wavelength_max_um') is None:
                if data['wavelength_max_m'] is not None:
                    data['wavelength_max_um'] = round(data['wavelength_max_m'] * 1e6, 3)

            # Synchronize filesize
            if 'file_size_bytes' in data and data.get('filesize_bytes') is None:
                data['filesize_bytes'] = data['file_size_bytes']
            elif 'filesize_bytes' in data and data.get('file_size_bytes') is None:
                data['file_size_bytes'] = data['filesize_bytes']

            # Synchronize dataproduct_type
            if 'dataproduct_type' in data and data.get('data_product_type') is None:
                data['data_product_type'] = data['dataproduct_type']
            elif 'data_product_type' in data and data.get('dataproduct_type') is None:
                data['dataproduct_type'] = data['data_product_type']

        return data

class ArchiveQueryRequest(BaseModel):
    ra: float = Field(..., ge=0.0, le=360.0, description="Right Ascension in decimal degrees (J2000)")
    dec: float = Field(..., ge=-90.0, le=90.0, description="Declination in decimal degrees (J2000)")
    radius_deg: float = Field(default=0.5, gt=0.0, le=5.0, description="Search radius in degrees")
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
    archive_status: Optional[str] = "LIVE_SUCCESS_WITH_PRODUCTS"
    diagnostic_message: Optional[str] = None
