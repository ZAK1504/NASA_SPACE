from typing import List, Dict, Any, Optional
import numpy as np
from pathlib import Path
from astropy.coordinates import SkyCoord
import astropy.units as u

from app.config import settings
from app.services.fits_service import fits_service

# Official SPHEREx 6 detector arrays and their wavelength specifications
SPHEREX_BANDS_SPEC = [
    {"band_id": "D1", "name": "Array 1 (D1)", "lambda_min_um": 0.75, "lambda_max_um": 1.11, "channels": 17, "resolving_power": 41},
    {"band_id": "D2", "name": "Array 2 (D2)", "lambda_min_um": 1.11, "lambda_max_um": 1.64, "channels": 17, "resolving_power": 41},
    {"band_id": "D3", "name": "Array 3 (D3)", "lambda_min_um": 1.64, "lambda_max_um": 2.42, "channels": 17, "resolving_power": 41},
    {"band_id": "D4", "name": "Array 4 (D4)", "lambda_min_um": 2.42, "lambda_max_um": 3.82, "channels": 17, "resolving_power": 35},
    {"band_id": "D5", "name": "Array 5 (D5)", "lambda_min_um": 3.82, "lambda_max_um": 4.42, "channels": 17, "resolving_power": 110},
    {"band_id": "D6", "name": "Array 6 (D6)", "lambda_min_um": 4.42, "lambda_max_um": 5.00, "channels": 17, "resolving_power": 130},
]

# Solid angle of a SPHEREx 6.15 arcsec pixel in steradians
PIXEL_STERADIANS = ((6.15 / 206265.0) ** 2)

class SpectralService:
    @staticmethod
    def get_all_102_channels() -> List[Dict[str, Any]]:
        """
        Compute the central wavelengths and boundaries for all 102 SPHEREx spectral channels.
        Includes explicit marking of the dichroic beam-splitter gap between Arrays 3 & 4.
        """
        channels = []
        global_index = 1
        for b in SPHEREX_BANDS_SPEC:
            wavelengths = np.linspace(b["lambda_min_um"], b["lambda_max_um"], b["channels"])
            step = (b["lambda_max_um"] - b["lambda_min_um"]) / b["channels"]
            for wl in wavelengths:
                is_gap = global_index in (51, 52)
                channels.append({
                    "channel_number": global_index,
                    "detector": b["band_id"],
                    "detector_name": b["name"],
                    "wavelength_center_um": round(float(wl), 4),
                    "wavelength_min_um": round(float(wl - step / 2), 4),
                    "wavelength_max_um": round(float(wl + step / 2), 4),
                    "bandwidth_um": round(float(step), 4),
                    "resolving_power_R": b["resolving_power"],
                    "is_dichroic_gap": is_gap,
                    "gap_notes": "Dichroic beam-splitter boundary between Array 3 and 4 (~2.42 μm)" if is_gap else None
                })
                global_index += 1
        return channels

    @classmethod
    def get_spectral_coverage_for_target(
        cls,
        object_id: str,
        observations: List[Dict[str, Any]],
        target_ra: Optional[float] = None,
        target_dec: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Extract wavelength coverage and genuine calibrated spectral measurements for a target
        from authentic SPHEREx Level 2 observations.
        Distinguishes real observed pixel measurements from theoretical reference model baselines.
        """
        all_channels = cls.get_all_102_channels()
        
        # Check which detectors are covered by observations
        covered_detectors = set()
        for obs in observations:
            bandpass = obs.get("bandpass", "")
            for spec in SPHEREX_BANDS_SPEC:
                if spec["band_id"] in bandpass:
                    covered_detectors.add(spec["band_id"])

        # Check if we have cached FITS files covering the target
        measured_flux_by_detector: Dict[str, float] = {}
        if target_ra is not None and target_dec is not None:
            cache_dir = settings.FITS_CACHE_DIR
            target_coord = SkyCoord(ra=target_ra * u.deg, dec=target_dec * u.deg, frame="icrs")
            for f in cache_dir.glob("*.fits"):
                try:
                    data, wcs, hdr = fits_service.get_image_data_and_wcs(f)
                    if wcs is not None and wcs.is_celestial:
                        x, y = wcs.world_to_pixel(target_coord)
                        h_dim, w_dim = data.shape[-2], data.shape[-1]
                        if 0 <= x < w_dim and 0 <= y < h_dim:
                            det_num = int(hdr.get("DETECTOR", 2))
                            det_key = f"D{det_num}"
                            val = float(data[int(round(float(y))), int(round(float(x)))])
                            measured_flux_by_detector[det_key] = val
                            covered_detectors.add(det_key)
                except Exception:
                    continue

        spectral_points = []
        for ch in all_channels:
            det = ch["detector"]
            is_observed = det in covered_detectors
            is_gap = ch.get("is_dichroic_gap", False)

            # Authentic measured flux in MJy/sr and converted microJanskys (1 MJy/sr * steradians * 1e12 = uJy)
            real_val_mjy_sr = measured_flux_by_detector.get(det) if is_observed else None
            real_flux_ujy = None
            if real_val_mjy_sr is not None:
                # 1 MJy/sr * 1e6 Jy/MJy * Omega_px * 1e6 uJy/Jy
                real_flux_ujy = round(real_val_mjy_sr * PIXEL_STERADIANS * 1e12, 2)

            # Model continuum for educational reference baseline (clearly designated)
            wl = ch["wavelength_center_um"]
            # Planck blackbody-like approximation for reference baseline
            if "barnard" in object_id.lower() or "dwarf" in object_id.lower():
                ref_flux = round(3500.0 * np.exp(-((wl - 1.4)**2) / 1.5) + 200.0, 1)
            elif "wise" in object_id.lower():
                ref_flux = round(25.0 * np.exp(-((wl - 4.2)**2) / 1.8) + 2.0, 1)
            else:
                ref_flux = round(800.0 * np.exp(-((wl - 2.0)**2) / 2.0) + 50.0, 1)

            spectral_points.append({
                "channel": ch["channel_number"],
                "detector": ch["detector"],
                "detector_name": ch["detector_name"],
                "wavelength_um": ch["wavelength_center_um"],
                "observed": is_observed,
                "is_dichroic_gap": is_gap,
                "flux_mjy_sr": real_val_mjy_sr,
                "flux_uJy": real_flux_ujy,
                "reference_model_flux_uJy": ref_flux,
                "flux_err_uJy": round(real_flux_ujy * 0.05, 2) if real_flux_ujy is not None else None,
                "gap_notes": ch.get("gap_notes")
            })

        return {
            "object_id": object_id,
            "total_bands": 102,
            "covered_detectors": sorted(list(covered_detectors)),
            "total_channels_observed": sum(1 for p in spectral_points if p["observed"]),
            "channels": spectral_points,
            "wavelength_units": "micrometers (μm)",
            "flux_units": "MJy/sr (raw) & microJansky (uJy)",
            "dichroic_gap_channels": [51, 52],
            "dichroic_gap_wavelength_um": [2.40, 2.44],
            "science_explanation": (
                "SPHEREx samples near-infrared spectra using 6 Linear Variable Filter (LVF) detector arrays "
                "spanning 102 spectral channels from 0.75 to 5.00 μm. "
                "Channels 51 and 52 sit at the 2.42 μm dichroic beam-splitter boundary. "
                "Authentic measurements are calibrated in MJy/sr from IRSA Level 2 products."
            )
        }

spectral_service = SpectralService()
