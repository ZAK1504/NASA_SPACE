import json
import hashlib
import time
from typing import List, Dict, Any, Optional
from pathlib import Path
import requests
import pyvo as vo
from astropy.time import Time
from app.config import settings

ALLOWED_BANDPASSES = {
    "SPHEREx-D1": "SPHEREx-D1",
    "SPHEREx-D2": "SPHEREx-D2",
    "SPHEREx-D3": "SPHEREx-D3",
    "SPHEREx-D4": "SPHEREx-D4",
    "SPHEREx-D5": "SPHEREx-D5",
    "SPHEREx-D6": "SPHEREx-D6",
    "D1": "SPHEREx-D1",
    "D2": "SPHEREx-D2",
    "D3": "SPHEREx-D3",
    "D4": "SPHEREx-D4",
    "D5": "SPHEREx-D5",
    "D6": "SPHEREx-D6",
}

class IrsaService:
    def __init__(self):
        self.tap_url = settings.IRSA_TAP_URL
        self.cache_dir = settings.QUERY_CACHE_DIR
        self._tap_service = None

    @property
    def tap_service(self):
        if self._tap_service is None:
            self._tap_service = vo.dal.TAPService(self.tap_url)
        return self._tap_service

    def _get_cache_key(self, query: str) -> Path:
        h = hashlib.sha256(query.encode('utf-8')).hexdigest()
        return self.cache_dir / f"tap_{h}.json"

    def query_spherex_observations(
        self,
        ra: float,
        dec: float,
        radius_deg: float = 0.5,
        limit: int = 50,
        bandpass: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Query official NASA/IPAC IRSA SPHEREx archive (spherex.obscore)
        using IVOA TAP spatial cone search with strict astronomical coordinate bounds.
        """
        if not (0.0 <= ra <= 360.0):
            raise ValueError(f"Right Ascension {ra} out of valid astronomical range [0.0, 360.0] degrees.")
        if not (-90.0 <= dec <= 90.0):
            raise ValueError(f"Declination {dec} out of valid astronomical range [-90.0, +90.0] degrees.")
        if not (0.0 < radius_deg <= 5.0):
            raise ValueError(f"Search radius {radius_deg} out of valid astronomical range (0.0, 5.0] degrees.")

        band_clause = ""
        if bandpass:
            clean_bp = bandpass.strip()
            norm_bp = ALLOWED_BANDPASSES.get(clean_bp)
            if not norm_bp:
                raise ValueError(
                    f"Invalid bandpass '{clean_bp}'. Must be one of: {list(ALLOWED_BANDPASSES.keys())}"
                )
            band_clause = f"AND energy_bandpassname = '{norm_bp}'"

        adql = f"""
        SELECT TOP {int(limit)}
            obs_id, obs_collection, target_name,
            s_ra, s_dec, s_fov, s_pixel_scale, s_xel1, s_xel2,
            energy_bandpassname, em_min, em_max,
            t_min, t_max, t_exptime,
            access_url, access_format, dataproduct_type, calib_level, access_estsize
        FROM spherex.obscore
        WHERE CONTAINS(POINT('ICRS', s_ra, s_dec), CIRCLE('ICRS', {ra:.6f}, {dec:.6f}, {radius_deg:.4f})) = 1
        {band_clause}
        ORDER BY t_min DESC
        """

        cache_file = self._get_cache_key(adql)
        if cache_file.exists():
            try:
                with open(cache_file, "r") as f:
                    return json.load(f)
            except Exception:
                pass

        try:
            # Use async TAP job to ensure complete execution without http read timeouts
            job = self.tap_service.submit_job(adql)
            job.run()
            # Wait up to 25s
            for _ in range(25):
                time.sleep(1)
                phase = job.phase
                if phase in ('COMPLETED', 'ERROR', 'ABORTED'):
                    break
            
            if job.phase != 'COMPLETED':
                job.abort()
                raise TimeoutError("IRSA TAP query timed out or did not complete")

            results = job.fetch_result()
            records: List[Dict[str, Any]] = []

            for row in results:
                # Convert MJD to ISO observation date
                t_min = float(row.get('t_min', 0)) if row.get('t_min') is not None else None
                date_obs_str = None
                if t_min and t_min > 50000:
                    try:
                        date_obs_str = Time(t_min, format='mjd').iso[:19]
                    except Exception:
                        pass

                em_min = float(row.get('em_min', 0)) if row.get('em_min') is not None else 0
                em_max = float(row.get('em_max', 0)) if row.get('em_max') is not None else 0
                est_size = int(row.get('access_estsize')) if row.get('access_estsize') is not None else 0

                rec = {
                    "id": f"{row.get('obs_id')}_{row.get('energy_bandpassname')}",
                    "obs_id": str(row.get('obs_id')),
                    "collection": str(row.get('obs_collection', 'spherex_dr1')),
                    "target_name": str(row.get('target_name', '')),
                    "ra": float(row.get('s_ra')),
                    "dec": float(row.get('s_dec')),
                    "s_ra": float(row.get('s_ra')),
                    "s_dec": float(row.get('s_dec')),
                    "bandpass": str(row.get('energy_bandpassname', '')),
                    "wavelength_min_um": round(em_min * 1e6, 3) if em_min else None,
                    "wavelength_max_um": round(em_max * 1e6, 3) if em_max else None,
                    "wavelength_min_m": em_min if em_min else None,
                    "wavelength_max_m": em_max if em_max else None,
                    "mjd_start": t_min,
                    "mjd_end": float(row.get('t_max')) if row.get('t_max') is not None else None,
                    "t_min_mjd": t_min,
                    "t_max_mjd": float(row.get('t_max')) if row.get('t_max') is not None else None,
                    "date_obs": date_obs_str,
                    "exposure_time_s": float(row.get('t_exptime')) if row.get('t_exptime') is not None else None,
                    "access_url": str(row.get('access_url', '')),
                    "datalink_url": str(row.get('access_url', '')),
                    "fits_url": None, # Resolved via datalink
                    "dataproduct_type": str(row.get('dataproduct_type', 'image')),
                    "data_product_type": str(row.get('dataproduct_type', 'image')),
                    "calib_level": int(row.get('calib_level', 2)),
                    "pixel_scale_arcsec": float(row.get('s_pixel_scale')) if row.get('s_pixel_scale') is not None else 6.2,
                    "naxis1": int(row.get('s_xel1')) if row.get('s_xel1') is not None else 2048,
                    "naxis2": int(row.get('s_xel2')) if row.get('s_xel2') is not None else 2048,
                    "file_size_bytes": est_size,
                    "filesize_bytes": est_size,
                    "is_real_data": True,
                    "archive_source": "NASA/IPAC IRSA"
                }
                records.append(rec)

            # Cache the response
            with open(cache_file, "w") as f:
                json.dump(records, f)

            return records

        except Exception as e:
            # Check if cached results exist
            if cache_file.exists():
                try:
                    with open(cache_file, "r") as f:
                        return json.load(f)
                except Exception:
                    pass
            raise RuntimeError(f"IRSA archive query failed: {str(e)}")

    def resolve_fits_url_from_datalink(self, datalink_url: str) -> Optional[str]:
        """Query DataLink service to obtain direct FITS science image URL."""
        if not datalink_url:
            return None
        
        cache_key = hashlib.sha256(datalink_url.encode('utf-8')).hexdigest()
        cache_file = self.cache_dir / f"dl_{cache_key}.json"
        if cache_file.exists():
            try:
                with open(cache_file, "r") as f:
                    return json.load(f).get("fits_url")
            except Exception:
                pass

        try:
            dl = vo.dal.adhoc.DatalinkResults.from_result_url(datalink_url)
            for row in dl:
                # Look for the primary science image
                desc = str(row.description).lower() if hasattr(row, 'description') else ""
                ctype = str(row.content_type).lower() if hasattr(row, 'content_type') else ""
                sem = str(row.semantics).lower() if hasattr(row, 'semantics') else ""
                
                if (sem == '#this' or 'science' in desc or 'primary' in desc) and 'fits' in ctype:
                    fits_url = str(row.access_url)
                    with open(cache_file, "w") as f:
                        json.dump({"fits_url": fits_url}, f)
                    return fits_url
            
            # Fallback: check any row with fits content type
            for row in dl:
                ctype = str(row.content_type).lower() if hasattr(row, 'content_type') else ""
                if 'fits' in ctype:
                    fits_url = str(row.access_url)
                    with open(cache_file, "w") as f:
                        json.dump({"fits_url": fits_url}, f)
                    return fits_url
        except Exception:
            pass

        return None

irsa_service = IrsaService()
