import hashlib
from pathlib import Path
from astropy.io import fits
from astropy.wcs import WCS
import numpy as np

fits_dir = Path('data/cache/fits')
files = sorted(list(fits_dir.glob('*.fits')))
print(f"Total FITS files found: {len(files)}")

manifest_rows = []

for idx, f in enumerate(files):
    file_size = f.stat().st_size
    # Compute sha256
    h_sha = hashlib.sha256()
    with open(f, 'rb') as fp:
        while chunk := fp.read(1024 * 1024):
            h_sha.update(chunk)
    sha256_hash = h_sha.hexdigest()

    try:
        with fits.open(f) as hdul:
            hdu_names = [h.name for h in hdul]
            h1 = hdul[1].header if len(hdul) > 1 else hdul[0].header
            w = WCS(h1)
            
            telescope = str(h1.get("TELESCOP", "SPHEREx"))
            instrument = str(h1.get("INSTRUME", "SPHEREx"))
            date_obs = str(h1.get("DATE-OBS", h1.get("DATE", "")))
            mjd_obs = h1.get("MJD-OBS", h1.get("MJD", h1.get("MJD_OBS", None)))
            detector = str(h1.get("DETECTOR", ""))
            bandpass = str(h1.get("BANDPASS", h1.get("FILTER", "")))
            obj_name = str(h1.get("OBJECT", ""))
            bunit = str(h1.get("BUNIT", ""))
            crval1 = h1.get("CRVAL1")
            crval2 = h1.get("CRVAL2")
            cdelt1 = h1.get("CDELT1", h1.get("CD1_1"))
            cdelt2 = h1.get("CDELT2", h1.get("CD2_2"))
            naxis1 = h1.get("NAXIS1")
            naxis2 = h1.get("NAXIS2")

            # Check finite pixels
            data_arr = hdul[1].data if len(hdul) > 1 else hdul[0].data
            nan_count = int(np.isnan(data_arr).sum()) if data_arr is not None else 0
            finite_count = int(np.isfinite(data_arr).sum()) if data_arr is not None else 0

            manifest_rows.append({
                "filename": f.name,
                "size_mb": round(file_size / 1e6, 2),
                "sha256": sha256_hash,
                "hdu_count": len(hdul),
                "hdu_names": ",".join(hdu_names),
                "telescope": telescope,
                "instrument": instrument,
                "date_obs": date_obs,
                "mjd_obs": mjd_obs,
                "detector": detector,
                "bandpass": bandpass,
                "object": obj_name,
                "bunit": bunit,
                "crval1": crval1,
                "crval2": crval2,
                "cdelt1": cdelt1,
                "cdelt2": cdelt2,
                "naxis1": naxis1,
                "naxis2": naxis2,
                "is_celestial": w.is_celestial,
                "nan_pixels": nan_count,
                "finite_pixels": finite_count
            })
            print(f"[{idx+1}/{len(files)}] {f.name} -> {date_obs} | {bunit} | CRVAL=({crval1}, {crval2}) | Shape=({naxis1}, {naxis2}) | WCS={w.is_celestial}")
    except Exception as e:
        print(f"[{idx+1}/{len(files)}] ERROR on {f.name}: {e}")

import json
with open("fits_audit_manifest.json", "w") as fp:
    json.dump(manifest_rows, fp, indent=2)
print("Saved fits_audit_manifest.json")
