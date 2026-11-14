import numpy as np
from typing import Dict, Any, List, Optional

class LightCurveService:
    """
    Photometric Time-Series Service providing multi-epoch light curves across
    SPHEREx wavelength bands (D1 to D6) with photometric uncertainties and variability metrics.
    """

    def __init__(self):
        self._lightcurves: Dict[str, Dict[str, Any]] = {
            "r-draconis": {
                "object_id": "r-draconis",
                "object_name": "R Draconis",
                "object_type": "Mira Variable (Carbon Star)",
                "period_days": 245.6,
                "variability_type": "Pulsational (Mira)",
                "primary_band": "SPHEREx Band D3 (2.42 μm)",
                "secondary_band": "SPHEREx Band D5 (4.15 μm)",
                "amplitude_mag": 2.35,
                "scientific_summary": "R Draconis is an asymptotic giant branch (AGB) carbon-rich star undergoing radial fundamental-mode pulsations with a 245.6-day period. SPHEREx infrared observations monitor dust grain condensation cycles in its circumstellar envelope.",
                "data_points": [
                    {"mjd": 60750.2, "date_utc": "2025-03-15", "band": "D3 (2.42 μm)", "flux_ujy": 8450.0, "flux_err_ujy": 120.0, "mag": 6.82, "mag_err": 0.015, "phase": 0.05, "is_outlier": False},
                    {"mjd": 60785.4, "date_utc": "2025-04-19", "band": "D3 (2.42 μm)", "flux_ujy": 6210.0, "flux_err_ujy": 95.0, "mag": 7.15, "mag_err": 0.017, "phase": 0.19, "is_outlier": False},
                    {"mjd": 60815.1, "date_utc": "2025-05-19", "band": "D3 (2.42 μm)", "flux_ujy": 3890.0, "flux_err_ujy": 70.0, "mag": 7.66, "mag_err": 0.020, "phase": 0.31, "is_outlier": False},
                    {"mjd": 60845.8, "date_utc": "2025-06-18", "band": "D3 (2.42 μm)", "flux_ujy": 1940.0, "flux_err_ujy": 45.0, "mag": 8.42, "mag_err": 0.025, "phase": 0.44, "is_outlier": False},
                    {"mjd": 60875.0, "date_utc": "2025-07-18", "band": "D3 (2.42 μm)", "flux_ujy": 1120.0, "flux_err_ujy": 38.0, "mag": 9.01, "mag_err": 0.035, "phase": 0.56, "is_outlier": False},
                    {"mjd": 60905.3, "date_utc": "2025-08-17", "band": "D3 (2.42 μm)", "flux_ujy": 1820.0, "flux_err_ujy": 50.0, "mag": 8.48, "mag_err": 0.028, "phase": 0.68, "is_outlier": False},
                    {"mjd": 60935.9, "date_utc": "2025-09-16", "band": "D3 (2.42 μm)", "flux_ujy": 4210.0, "flux_err_ujy": 80.0, "mag": 7.58, "mag_err": 0.021, "phase": 0.81, "is_outlier": False},
                    {"mjd": 60965.2, "date_utc": "2025-10-16", "band": "D3 (2.42 μm)", "flux_ujy": 7650.0, "flux_err_ujy": 115.0, "mag": 6.93, "mag_err": 0.016, "phase": 0.93, "is_outlier": False},
                    {"mjd": 60995.5, "date_utc": "2025-11-15", "band": "D3 (2.42 μm)", "flux_ujy": 8620.0, "flux_err_ujy": 125.0, "mag": 6.80, "mag_err": 0.015, "phase": 0.05, "is_outlier": False},
                    
                    # Band D5 multi-epoch
                    {"mjd": 60750.2, "date_utc": "2025-03-15", "band": "D5 (4.15 μm)", "flux_ujy": 14200.0, "flux_err_ujy": 190.0, "mag": 6.25, "mag_err": 0.014, "phase": 0.05, "is_outlier": False},
                    {"mjd": 60815.1, "date_utc": "2025-05-19", "band": "D5 (4.15 μm)", "flux_ujy": 8900.0, "flux_err_ujy": 140.0, "mag": 6.76, "mag_err": 0.017, "phase": 0.31, "is_outlier": False},
                    {"mjd": 60875.0, "date_utc": "2025-07-18", "band": "D5 (4.15 μm)", "flux_ujy": 3850.0, "flux_err_ujy": 85.0, "mag": 7.67, "mag_err": 0.024, "phase": 0.56, "is_outlier": False},
                    {"mjd": 60935.9, "date_utc": "2025-09-16", "band": "D5 (4.15 μm)", "flux_ujy": 9150.0, "flux_err_ujy": 150.0, "mag": 6.73, "mag_err": 0.018, "phase": 0.81, "is_outlier": False},
                    {"mjd": 60995.5, "date_utc": "2025-11-15", "band": "D5 (4.15 μm)", "flux_ujy": 14500.0, "flux_err_ujy": 210.0, "mag": 6.23, "mag_err": 0.014, "phase": 0.05, "is_outlier": False}
                ]
            },
            "rw-aurigae": {
                "object_id": "rw-aurigae",
                "object_name": "RW Aurigae",
                "object_type": "Classical T Tauri Star",
                "period_days": None,
                "variability_type": "Irregular Accretion & Circumstellar Disk Occultation",
                "primary_band": "SPHEREx Band D2 (1.55 μm)",
                "secondary_band": "SPHEREx Band D4 (3.20 μm)",
                "amplitude_mag": 2.85,
                "scientific_summary": "RW Aurigae is a young pre-main sequence binary exhibiting sudden dimming events (occultation dips) caused by tidally disrupted protoplanetary disk debris passing along our line of sight.",
                "data_points": [
                    {"mjd": 60740.0, "date_utc": "2025-03-05", "band": "D2 (1.55 μm)", "flux_ujy": 28500.0, "flux_err_ujy": 320.0, "mag": 10.25, "mag_err": 0.012, "phase": None, "is_outlier": False},
                    {"mjd": 60770.5, "date_utc": "2025-04-04", "band": "D2 (1.55 μm)", "flux_ujy": 27900.0, "flux_err_ujy": 310.0, "mag": 10.27, "mag_err": 0.012, "phase": None, "is_outlier": False},
                    {"mjd": 60800.2, "date_utc": "2025-05-04", "band": "D2 (1.55 μm)", "flux_ujy": 14200.0, "flux_err_ujy": 210.0, "mag": 11.01, "mag_err": 0.016, "phase": None, "is_outlier": False},
                    {"mjd": 60810.8, "date_utc": "2025-05-14", "band": "D2 (1.55 μm)", "flux_ujy": 4100.0, "flux_err_ujy": 90.0, "mag": 12.35, "mag_err": 0.024, "phase": None, "is_outlier": False},
                    {"mjd": 60820.4, "date_utc": "2025-05-24", "band": "D2 (1.55 μm)", "flux_ujy": 2200.0, "flux_err_ujy": 65.0, "mag": 13.03, "mag_err": 0.032, "phase": None, "is_outlier": False},
                    {"mjd": 60840.1, "date_utc": "2025-06-13", "band": "D2 (1.55 μm)", "flux_ujy": 5800.0, "flux_err_ujy": 110.0, "mag": 11.97, "mag_err": 0.021, "phase": None, "is_outlier": False},
                    {"mjd": 60880.6, "date_utc": "2025-07-23", "band": "D2 (1.55 μm)", "flux_ujy": 21000.0, "flux_err_ujy": 260.0, "mag": 10.58, "mag_err": 0.014, "phase": None, "is_outlier": False},
                    {"mjd": 60920.3, "date_utc": "2025-09-01", "band": "D2 (1.55 μm)", "flux_ujy": 28100.0, "flux_err_ujy": 320.0, "mag": 10.26, "mag_err": 0.012, "phase": None, "is_outlier": False}
                ]
            },
            "barnards-star": {
                "object_id": "barnards-star",
                "object_name": "Barnard's Star",
                "object_type": "Red Dwarf Star (M4.0V)",
                "period_days": None,
                "variability_type": "Photometrically Stable Baseline (<0.05 mag)",
                "primary_band": "SPHEREx Band D1 (0.95 μm)",
                "secondary_band": "SPHEREx Band D3 (2.42 μm)",
                "amplitude_mag": 0.06,
                "scientific_summary": "Barnard's Star exhibits exceptionally stable infrared flux, serving as an astrometric and photometric reference benchmark for measuring high proper motion across SPHEREx observing epochs.",
                "data_points": [
                    {"mjd": 60750.0, "date_utc": "2025-03-15", "band": "D1 (0.95 μm)", "flux_ujy": 42100.0, "flux_err_ujy": 280.0, "mag": 9.54, "mag_err": 0.007, "phase": None, "is_outlier": False},
                    {"mjd": 60790.3, "date_utc": "2025-04-24", "band": "D1 (0.95 μm)", "flux_ujy": 42050.0, "flux_err_ujy": 275.0, "mag": 9.54, "mag_err": 0.007, "phase": None, "is_outlier": False},
                    {"mjd": 60830.8, "date_utc": "2025-06-03", "band": "D1 (0.95 μm)", "flux_ujy": 42200.0, "flux_err_ujy": 285.0, "mag": 9.53, "mag_err": 0.007, "phase": None, "is_outlier": False},
                    {"mjd": 60885.1, "date_utc": "2025-07-28", "band": "D1 (0.95 μm)", "flux_ujy": 41980.0, "flux_err_ujy": 270.0, "mag": 9.54, "mag_err": 0.007, "phase": None, "is_outlier": False},
                    {"mjd": 60940.4, "date_utc": "2025-09-21", "band": "D1 (0.95 μm)", "flux_ujy": 42120.0, "flux_err_ujy": 280.0, "mag": 9.54, "mag_err": 0.007, "phase": None, "is_outlier": False}
                ]
            },
            "wise-0855": {
                "object_id": "wise-0855",
                "object_name": "WISE 0855−0714",
                "object_type": "Sub-Stellar Brown Dwarf (Y4)",
                "period_days": 0.35, # ~8.4 hours
                "variability_type": "Rotational Weather / Cloud Modulation",
                "primary_band": "SPHEREx Band D5 (4.50 μm)",
                "secondary_band": "SPHEREx Band D6 (4.85 μm)",
                "amplitude_mag": 0.09,
                "scientific_summary": "WISE 0855 is the coldest known brown dwarf (~250 K). Its flux exhibits subtle rotational variability driven by inhomogeneous water-ice cloud decks turning on an 8.4-hour period.",
                "data_points": [
                    {"mjd": 60760.10, "date_utc": "2025-03-25 02:24", "band": "D5 (4.50 μm)", "flux_ujy": 14.8, "flux_err_ujy": 0.7, "mag": 13.98, "mag_err": 0.051, "phase": 0.10, "is_outlier": False},
                    {"mjd": 60760.18, "date_utc": "2025-03-25 04:19", "band": "D5 (4.50 μm)", "flux_ujy": 15.9, "flux_err_ujy": 0.7, "mag": 13.90, "mag_err": 0.048, "phase": 0.33, "is_outlier": False},
                    {"mjd": 60760.27, "date_utc": "2025-03-25 06:28", "band": "D5 (4.50 μm)", "flux_ujy": 16.2, "flux_err_ujy": 0.8, "mag": 13.88, "mag_err": 0.053, "phase": 0.58, "is_outlier": False},
                    {"mjd": 60760.35, "date_utc": "2025-03-25 08:24", "band": "D5 (4.50 μm)", "flux_ujy": 15.1, "flux_err_ujy": 0.7, "mag": 13.95, "mag_err": 0.050, "phase": 0.81, "is_outlier": False},
                    {"mjd": 60760.44, "date_utc": "2025-03-25 10:33", "band": "D5 (4.50 μm)", "flux_ujy": 14.7, "flux_err_ujy": 0.7, "mag": 13.99, "mag_err": 0.052, "phase": 0.07, "is_outlier": False}
                ]
            }
        }

    def get_lightcurve(self, object_id: str) -> Optional[Dict[str, Any]]:
        return self._lightcurves.get(object_id.lower())

    def get_all_lightcurve_targets(self) -> List[Dict[str, Any]]:
        return [
            {
                "object_id": v["object_id"],
                "object_name": v["object_name"],
                "object_type": v["object_type"],
                "variability_type": v["variability_type"],
                "period_days": v["period_days"],
                "amplitude_mag": v["amplitude_mag"],
                "num_epochs": len(v["data_points"])
            }
            for v in self._lightcurves.values()
        ]

lightcurve_service = LightCurveService()
