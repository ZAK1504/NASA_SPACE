import json
import hashlib
import time
from typing import List, Dict, Any, Optional
from pathlib import Path
import requests
import pyvo as vo
from astropy.time import Time
from app.config import settings

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
        using IVOA TAP spatial cone search.
        """
        band_clause = f"AND energy_bandpassname = '{bandpass}'" if bandpass else ""
        adql = f"""
        SELECT TOP {limit}
            obs_id, obs_collection, target_name,
            s_ra, s_dec, s_fov, s_pixel_scale, s_xel1, s_xel2,
            energy_bandpassname, em_min, em_max,
            t_min, t_max, t_exptime,
            access_url, access_format, dataproduct_type, calib_level, access_estsize
        FROM spherex.obscore
        WHERE CONTAINS(POINT('ICRS', s_ra, s_dec), CIRCLE('ICRS', {ra}, {dec}, {radius_deg})) = 1
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

                rec = {
                    "id": f"{row.get('obs_id')}_{row.get('energy_bandpassname')}",
                    "obs_id": str(row.get('obs_id')),
                    "collection": str(row.get('obs_collection', 'spherex_dr1')),
                    "target_name": str(row.get('target_name', '')),
                    "ra": float(row.get('s_ra')),
                    "dec": float(row.get('s_dec')),
                    "bandpass": str(row.get('energy_bandpassname', '')),
                    "wavelength_min_um": round(em_min * 1e6, 3) if em_min else None,
                    "wavelength_max_um": round(em_max * 1e6, 3) if em_max else None,
                    "mjd_start": t_min,
                    "mjd_end": float(row.get('t_max')) if row.get('t_max') is not None else None,
                    "date_obs": date_obs_str,
                    "exposure_time_s": float(row.get('t_exptime')) if row.get('t_exptime') is not None else None,
                    "access_url": str(row.get('access_url', '')),
                    "datalink_url": str(row.get('access_url', '')),
                    "fits_url": None, # Resolved via datalink
                    "dataproduct_type": str(row.get('dataproduct_type', 'image')),
                    "calib_level": int(row.get('calib_level', 2)),
                    "pixel_scale_arcsec": float(row.get('s_pixel_scale')) if row.get('s_pixel_scale') is not None else 6.2,
                    "naxis1": int(row.get('s_xel1')) if row.get('s_xel1') is not None else 2048,
                    "naxis2": int(row.get('s_xel2')) if row.get('s_xel2') is not None else 2048,
                    "file_size_bytes": int(row.get('access_estsize')) if row.get('access_estsize') is not None else None,
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
                with open(cache_file, "r") as f:
                    return json.load(f)
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
                if (row.semantics == '#this' or 'science' in str(row.description).lower()) and 'fits' in str(row.content_type).lower():
                    fits_url = str(row.access_url)
                    with open(cache_file, "w") as f:
                        json.dump({"fits_url": fits_url}, f)
                    return fits_url
        except Exception:
            pass

        return None

irsa_service = IrsaService()
