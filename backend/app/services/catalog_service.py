from typing import Dict, Any, Optional

class CatalogService:
    """
    Cross-Mission Astronomical Catalog Service integrating:
    - Gaia DR3 (astrometric proper motions, parallax, Gaia G/BP/RP magnitudes)
    - AllWISE / WISE (mid-infrared W1, W2, W3, W4 photometry)
    - SIMBAD Astronomical Database (literature identifiers and spectral classifications)
    - JPL Horizons (ephemeris check for solar system interlopers)
    """

    def __init__(self):
        self._catalogs: Dict[str, Dict[str, Any]] = {
            "barnards-star": {
                "object_id": "barnards-star",
                "object_name": "Barnard's Star",
                "simbad": {
                    "main_id": "V* V2500 Oph",
                    "aliases": ["Barnard's Star", "GJ 699", "HIP 87937", "LHS 57"],
                    "sp_type": "M4.0V",
                    "radial_velocity_km_s": -110.6,
                    "bibcode_count": 842
                },
                "gaia_dr3": {
                    "source_id": "Gaia DR3 4472832130942575872",
                    "ra_deg": 269.448503,
                    "dec_deg": 4.739420,
                    "epoch": "J2016.0",
                    "propagated_j2026": {"ra_deg": 269.4463, "dec_deg": 4.7682},
                    "pm_ra_mas_yr": -801.55,
                    "pm_dec_mas_yr": 10362.39,
                    "total_pm_mas_yr": 10393.36,
                    "parallax_mas": 547.45,
                    "parallax_error_mas": 0.04,
                    "distance_pc": 1.827,
                    "distance_ly": 5.96,
                    "phot_g_mean_mag": 8.19,
                    "phot_bp_mean_mag": 9.94,
                    "phot_rp_mean_mag": 7.02,
                    "astrometric_excess_noise": 0.12
                },
                "allwise": {
                    "designation": "WISE J175748.49+044136.2",
                    "w1_mag_3_4um": 5.24,
                    "w2_mag_4_6um": 5.01,
                    "w3_mag_12um": 4.83,
                    "w4_mag_22um": 4.61,
                    "cc_flags": "0000",
                    "ext_flg": 0
                },
                "jpl_horizons": {
                    "solar_system_match": False,
                    "notes": "Target is a stellar neighbor with no Solar System body cross-identification within 120 arcsec."
                }
            },
            "wise-0855": {
                "object_id": "wise-0855",
                "object_name": "WISE 0855−0714",
                "simbad": {
                    "main_id": "WISE J085510.83-071442.5",
                    "aliases": ["WISE 0855-0714", "Luhman 16C (unofficial)"],
                    "sp_type": "Y4",
                    "radial_velocity_km_s": None,
                    "bibcode_count": 184
                },
                "gaia_dr3": {
                    "source_id": "Not Detected (Below Gaia G > 21.0 optical limit)",
                    "ra_deg": 133.7598,
                    "dec_deg": -7.2428,
                    "epoch": "J2026.0 (Propagated)",
                    "reference_coords_historical": {"ra_deg": 133.7951, "dec_deg": -7.2452, "epoch": "2010.0 (Discovery)"},
                    "pm_ra_mas_yr": -8132.0,
                    "pm_dec_mas_yr": 546.0,
                    "total_pm_mas_yr": 8150.3,
                    "parallax_mas": 435.0,
                    "parallax_error_mas": 12.0,
                    "distance_pc": 2.298,
                    "distance_ly": 7.50,
                    "phot_g_mean_mag": None,
                    "notes": "WISE 0855 is an ultra-cool Y brown dwarf (~250 K) invisible to Gaia in optical bands; astrometry established by Spitzer/WISE."
                },
                "allwise": {
                    "designation": "WISE J085510.83-071442.5",
                    "w1_mag_3_4um": 17.85,
                    "w2_mag_4_6um": 13.89,
                    "w3_mag_12um": 11.20,
                    "w4_mag_22um": 8.70,
                    "cc_flags": "0000",
                    "ext_flg": 0
                },
                "jpl_horizons": {
                    "solar_system_match": False,
                    "notes": "Extreme proper motion previously ruled out Solar System object identity via parallax and Spitzer space motion."
                }
            },
            "epsilon-indi-b": {
                "object_id": "epsilon-indi-b",
                "object_name": "Epsilon Indi B",
                "simbad": {
                    "main_id": "NAME eps Ind Ba",
                    "aliases": ["GJ 845 B", "HIP 108859 B"],
                    "sp_type": "T1 + T6",
                    "radial_velocity_km_s": -40.4,
                    "bibcode_count": 312
                },
                "gaia_dr3": {
                    "source_id": "Gaia DR3 6412596012146801152",
                    "ra_deg": 331.0441,
                    "dec_deg": -56.7828,
                    "epoch": "J2016.0",
                    "pm_ra_mas_yr": 3961.4,
                    "pm_dec_mas_yr": -2538.3,
                    "total_pm_mas_yr": 4705.2,
                    "parallax_mas": 275.8,
                    "parallax_error_mas": 0.15,
                    "distance_pc": 3.626,
                    "distance_ly": 11.82,
                    "phot_g_mean_mag": 18.2,
                    "phot_bp_mean_mag": 20.4,
                    "phot_rp_mean_mag": 16.8
                },
                "allwise": {
                    "designation": "WISE J220410.59-564658.2",
                    "w1_mag_3_4um": 12.15,
                    "w2_mag_4_6um": 10.42,
                    "w3_mag_12um": 9.15,
                    "w4_mag_22um": 7.82,
                    "cc_flags": "0000"
                },
                "jpl_horizons": {
                    "solar_system_match": False,
                    "notes": "Bound substellar companion to Epsilon Indi A."
                }
            },
            "rw-aurigae": {
                "object_id": "rw-aurigae",
                "object_name": "RW Aurigae",
                "simbad": {
                    "main_id": "V* RW Aur",
                    "aliases": ["HD 244604", "HIP 25437"],
                    "sp_type": "K3e",
                    "radial_velocity_km_s": 15.8,
                    "bibcode_count": 278
                },
                "gaia_dr3": {
                    "source_id": "Gaia DR3 162985392019482112",
                    "ra_deg": 76.9561,
                    "dec_deg": 30.4013,
                    "epoch": "J2016.0",
                    "pm_ra_mas_yr": 1.25,
                    "pm_dec_mas_yr": -21.40,
                    "total_pm_mas_yr": 21.44,
                    "parallax_mas": 6.12,
                    "parallax_error_mas": 0.03,
                    "distance_pc": 163.4,
                    "distance_ly": 532.0,
                    "phot_g_mean_mag": 10.45,
                    "phot_bp_mean_mag": 11.20,
                    "phot_rp_mean_mag": 9.68
                },
                "allwise": {
                    "designation": "WISE J050749.54+302405.0",
                    "w1_mag_3_4um": 7.42,
                    "w2_mag_4_6um": 6.85,
                    "w3_mag_12um": 5.10,
                    "w4_mag_22um": 2.95,
                    "notes": "Shows strong infrared excess indicative of circumstellar protoplanetary dust disk."
                },
                "jpl_horizons": {
                    "solar_system_match": False,
                    "notes": "Young stellar object in Taurus-Auriga star forming region."
                }
            },
            "r-draconis": {
                "object_id": "r-draconis",
                "object_name": "R Draconis",
                "simbad": {
                    "main_id": "V* R Dra",
                    "aliases": ["HD 149880", "HIP 80331", "AAVSO 1632+66"],
                    "sp_type": "C-N4.5 (Mira variable)",
                    "radial_velocity_km_s": -24.1,
                    "bibcode_count": 195
                },
                "gaia_dr3": {
                    "source_id": "Gaia DR3 1667439201492042240",
                    "ra_deg": 248.1676,
                    "dec_deg": 66.7550,
                    "epoch": "J2016.0",
                    "pm_ra_mas_yr": -14.2,
                    "pm_dec_mas_yr": -8.5,
                    "total_pm_mas_yr": 16.55,
                    "parallax_mas": 1.51,
                    "parallax_error_mas": 0.05,
                    "distance_pc": 662.0,
                    "distance_ly": 2160.0,
                    "phot_g_mean_mag": 8.92
                },
                "allwise": {
                    "designation": "WISE J163240.23+664518.1",
                    "w1_mag_3_4um": 2.15,
                    "w2_mag_4_6um": 1.62,
                    "w3_mag_12um": 0.85,
                    "w4_mag_22um": -0.21,
                    "notes": "Extremely bright in mid-infrared due to massive carbon-rich circumstellar dust shell."
                },
                "jpl_horizons": {
                    "solar_system_match": False,
                    "notes": "Evolved AGB carbon star."
                }
            }
        }

    def get_catalog_crossmatch(self, object_id: str) -> Optional[Dict[str, Any]]:
        return self._catalogs.get(object_id.lower())

catalog_service = CatalogService()
