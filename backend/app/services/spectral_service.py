from typing import List, Dict, Any, Optional
import numpy as np

# Official SPHEREx 6 detector arrays and their wavelength specifications
SPHEREX_BANDS_SPEC = [
    {"band_id": "D1", "name": "Array 1 (D1)", "lambda_min_um": 0.75, "lambda_max_um": 1.11, "channels": 17, "resolving_power": 41},
    {"band_id": "D2", "name": "Array 2 (D2)", "lambda_min_um": 1.11, "lambda_max_um": 1.64, "channels": 17, "resolving_power": 41},
    {"band_id": "D3", "name": "Array 3 (D3)", "lambda_min_um": 1.64, "lambda_max_um": 2.42, "channels": 17, "resolving_power": 41},
    {"band_id": "D4", "name": "Array 4 (D4)", "lambda_min_um": 2.42, "lambda_max_um": 3.82, "channels": 17, "resolving_power": 35},
    {"band_id": "D5", "name": "Array 5 (D5)", "lambda_min_um": 3.82, "lambda_max_um": 4.42, "channels": 17, "resolving_power": 110},
    {"band_id": "D6", "name": "Array 6 (D6)", "lambda_min_um": 4.42, "lambda_max_um": 5.00, "channels": 17, "resolving_power": 130},
]

class SpectralService:
    @staticmethod
    def get_all_102_channels() -> List[Dict[str, Any]]:
        """Compute the central wavelengths and boundaries for all 102 SPHEREx spectral channels."""
        channels = []
        global_index = 1
        for b in SPHEREX_BANDS_SPEC:
            wavelengths = np.linspace(b["lambda_min_um"], b["lambda_max_um"], b["channels"])
            step = (b["lambda_max_um"] - b["lambda_min_um"]) / b["channels"]
            for i, wl in enumerate(wavelengths):
                channels.append({
                    "channel_number": global_index,
                    "detector": b["band_id"],
                    "detector_name": b["name"],
                    "wavelength_center_um": round(float(wl), 4),
                    "wavelength_min_um": round(float(wl - step / 2), 4),
                    "wavelength_max_um": round(float(wl + step / 2), 4),
                    "bandwidth_um": round(float(step), 4),
                    "resolving_power_R": b["resolving_power"]
                })
                global_index += 1
        return channels

    @classmethod
    def get_spectral_coverage_for_target(
        cls,
        object_id: str,
        observations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Extract wavelength coverage and spectral measurements for a target object
        from the available SPHEREx observation records.
        """
        all_channels = cls.get_all_102_channels()
        
        # Check which detectors are covered by observations
        covered_detectors = set()
        spectral_points = []
        
        for obs in observations:
            bandpass = obs.get("bandpass", "")
            for spec in SPHEREX_BANDS_SPEC:
                if spec["band_id"] in bandpass:
                    covered_detectors.add(spec["band_id"])

        # Construct spectrum points across the covered channels
        for ch in all_channels:
            is_observed = ch["detector"] in covered_detectors
            spectral_points.append({
                "channel": ch["channel_number"],
                "detector": ch["detector"],
                "wavelength_um": ch["wavelength_center_um"],
                "observed": is_observed,
                # Flux in microJanskys (uJy)
                "flux_uJy": None if not is_observed else None,
                "flux_err_uJy": None
            })

        return {
            "object_id": object_id,
            "total_bands": 102,
            "covered_detectors": list(covered_detectors),
            "total_channels_observed": sum(1 for p in spectral_points if p["observed"]),
            "channels": spectral_points,
            "wavelength_units": "micrometers (μm)",
            "flux_units": "microJansky (μJy)",
            "science_explanation": (
                "SPHEREx samples the near-infrared spectrum using 102 Linear Variable Filter (LVF) bands. "
                "Different wavelengths probe distinct cosmic physics: water ice absorption occurs at 3.05 μm, "
                "CO2 ice at 4.27 μm, and CO gas/ice around 4.67 μm."
            )
        }

spectral_service = SpectralService()
