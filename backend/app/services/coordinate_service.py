import re
from typing import Tuple, Optional, Dict, Any
from astropy.coordinates import SkyCoord
import astropy.units as u

# Comprehensive astronomical reference catalog for fast, offline, and reliable name resolution
BUILTIN_CATALOG: Dict[str, Tuple[float, float, str]] = {
    # SPHEREx Challenge Benchmark Targets (Authoritative SIMBAD & Gaia DR3 Coordinates)
    "barnard's star": (269.4463, 4.7682, "Barnard's Star (Propagated J2026.0 from Gaia DR3 J2016.0)"),
    "barnards star": (269.4463, 4.7682, "Barnard's Star"),
    "gj 699": (269.4463, 4.7682, "Barnard's Star"),
    "wise 0855": (133.7598, -7.2428, "WISE 0855−0714 (Coldest Sub-Stellar Brown Dwarf, J2026.0)"),
    "wise 0855-0714": (133.7598, -7.2428, "WISE 0855−0714"),
    "wise 0855−0714": (133.7598, -7.2428, "WISE 0855−0714"),
    "wise0855": (133.7598, -7.2428, "WISE 0855−0714"),
    "epsilon indi b": (331.0441, -56.7828, "Epsilon Indi B (Binary Brown Dwarf System, Gaia DR3 6412596012146801152)"),
    "epsilon indi": (331.0441, -56.7828, "Epsilon Indi B"),
    "eps ind b": (331.0441, -56.7828, "Epsilon Indi B"),
    "rw aurigae": (76.9561, 30.4013, "RW Aurigae (T Tauri Star with Occulting Disk, Gaia DR3 162985392019482112)"),
    "rw aur": (76.9561, 30.4013, "RW Aurigae"),
    "r draconis": (248.1676, 66.7550, "R Draconis (Mira-type Carbon Pulsator, Gaia DR3 1667439201492042240)"),
    "r dra": (248.1676, 66.7550, "R Draconis"),

    # Prime Astronomical Calibration & Reference Stars
    "vega": (279.2347, 38.7837, "Vega (Alpha Lyrae)"),
    "alpha lyrae": (279.2347, 38.7837, "Vega"),
    "sirius": (101.2872, -16.7161, "Sirius (Alpha Canis Majoris)"),
    "alpha canis majoris": (101.2872, -16.7161, "Sirius"),
    "betelgeuse": (88.7929, 7.4071, "Betelgeuse (Alpha Orionis)"),
    "alpha orionis": (88.7929, 7.4071, "Betelgeuse"),
    "rigel": (78.6345, -8.2016, "Rigel (Beta Orionis)"),
    "polaris": (37.9546, 89.2641, "Polaris (North Star)"),
    "alpha ursae minoris": (37.9546, 89.2641, "Polaris"),
    "proxima centauri": (217.4289, -62.6795, "Proxima Centauri (Closest Star to Sun)"),
    "alpha centauri": (219.9021, -60.8340, "Alpha Centauri System"),
    "alpha centauri a": (219.9021, -60.8340, "Alpha Centauri A"),
    "arcturus": (213.9153, 19.1824, "Arcturus (Alpha Boötis)"),
    "aldebaran": (68.9802, 16.5093, "Aldebaran (Alpha Tauri)"),
    "antares": (247.3519, -26.4320, "Antares (Alpha Scorpii)"),
    "spica": (201.2982, -11.1613, "Spica (Alpha Virginis)"),
    "capella": (79.1723, 45.9980, "Capella (Alpha Aurigae)"),
    "deneb": (310.3580, 45.2803, "Deneb (Alpha Cygni)"),
    "altair": (297.6958, 8.8683, "Altair (Alpha Aquilae)"),
    "fomalhaut": (344.4127, -29.6222, "Fomalhaut (Alpha Piscis Austrini with Debris Disk)"),
    "canopus": (95.9879, -52.6957, "Canopus (Alpha Carinae)"),

    # Notable Exoplanet Hosts & Brown Dwarfs
    "trappist-1": (346.6224, -5.0414, "TRAPPIST-1 (Ultracool Dwarf with 7 Earth-sized Planets)"),
    "51 pegasi": (344.7674, 20.7688, "51 Pegasi (First Exoplanet Host)"),
    "51 peg": (344.7674, 20.7688, "51 Pegasi"),
    "hd 209458": (330.7949, 18.8843, "HD 209458 (Transiting Hot Jupiter Osiris)"),
    "luhman 16": (162.2989, -53.3184, "Luhman 16 (Closest Known Brown Dwarf Binary)"),
    "wolf 359": (164.1203, 7.0147, "Wolf 359 (Nearby Red Dwarf)"),
    "luyten's star": (111.8521, 5.2250, "Luyten's Star (GJ 273)"),
    "teegarden's star": (43.2538, 16.8649, "Teegarden's Star"),

    # Iconic Deep-Sky & Infrared Discovery Fields
    "andromeda": (10.6847, 41.2687, "Andromeda Galaxy (M31)"),
    "m31": (10.6847, 41.2687, "Andromeda Galaxy (M31)"),
    "orion nebula": (83.8221, -5.3911, "Orion Nebula (M42 Star-Forming Region)"),
    "m42": (83.8221, -5.3911, "Orion Nebula (M42)"),
    "crab nebula": (83.6331, 22.0145, "Crab Nebula (M1 Supernova Remnant)"),
    "m1": (83.6331, 22.0145, "Crab Nebula (M1)"),
    "pleiades": (56.7500, 24.1167, "Pleiades Cluster (M45 Seven Sisters)"),
    "m45": (56.7500, 24.1167, "Pleiades (M45)"),
    "whirlpool galaxy": (202.4696, 47.1952, "Whirlpool Galaxy (M51)"),
    "m51": (202.4696, 47.1952, "Whirlpool Galaxy (M51)"),
    "sombrero galaxy": (189.9976, -11.6231, "Sombrero Galaxy (M104)"),
    "m104": (189.9976, -11.6231, "Sombrero Galaxy (M104)"),
    "sagittarius a*": (266.4168, -29.0078, "Sagittarius A* (Supermassive Black Hole at Milky Way Center)"),
    "sgr a*": (266.4168, -29.0078, "Sagittarius A*"),
    "planet x": (80.0, -15.0, "Planet X / Planet Nine Candidate Search Field (Taurus/Eridanus border)"),
    "planet nine": (80.0, -15.0, "Planet X / Planet Nine Candidate Search Field"),
}

class CoordinateService:
    @staticmethod
    def deg_to_hms_dms(ra_deg: float, dec_deg: float) -> Tuple[str, str]:
        """Convert decimal degrees to standard HMS and DMS strings."""
        coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
        hms = coord.ra.to_string(unit=u.hour, sep=('h ', 'm ', 's'), precision=1)
        dms = coord.dec.to_string(unit=u.deg, sep=('° ', "' ", '"'), alwayssign=True, precision=1)
        return hms, dms

    @staticmethod
    def parse_coordinate_string(coord_str: str) -> Optional[Tuple[float, float]]:
        """
        Parse flexible coordinate formats:
        - "269.4521, 4.6933"
        - "17h57m48.5s +04d41m36s"
        - "17 57 48.5 +04 41 36"
        """
        s = coord_str.strip()
        
        # Check decimal degrees first: "269.4521, 4.6933" or "269.4521 4.6933"
        dec_match = re.match(r"^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$", s)
        if dec_match:
            try:
                ra = float(dec_match.group(1))
                dec = float(dec_match.group(2))
                if 0 <= ra <= 360 and -90 <= dec <= 90:
                    return ra, dec
            except ValueError:
                pass
        
        # Try Astropy SkyCoord parser for sexagesimal formats
        try:
            coord = SkyCoord(s, frame="icrs")
            return float(coord.ra.deg), float(coord.dec.deg)
        except Exception:
            pass

        try:
            coord = SkyCoord(s, unit=(u.hourangle, u.deg), frame="icrs")
            return float(coord.ra.deg), float(coord.dec.deg)
        except Exception:
            pass

        return None

    @classmethod
    def resolve_object_name(cls, query: str) -> Dict[str, Any]:
        """
        Resolve astronomical object name to sky coordinates.
        1. Built-in curated catalog (instant, offline, zero-network).
        2. Direct coordinate string parsing (decimal degrees or sexagesimal HMS/DMS).
        3. Astropy SkyCoord.from_name / SIMBAD (when external network is reachable).
        """
        clean_query = query.strip()
        normalized_key = clean_query.lower()
        
        # 1. Check local catalog first
        if normalized_key in BUILTIN_CATALOG:
            ra, dec, desc = BUILTIN_CATALOG[normalized_key]
            hms, dms = cls.deg_to_hms_dms(ra, dec)
            return {
                "resolved": True,
                "ra": ra,
                "dec": dec,
                "ra_hms": hms,
                "dec_dms": dms,
                "source": f"Curated Catalog: {desc}"
            }

        # 2. Try direct coordinate parse
        parsed = cls.parse_coordinate_string(clean_query)
        if parsed:
            ra, dec = parsed
            hms, dms = cls.deg_to_hms_dms(ra, dec)
            return {
                "resolved": True,
                "ra": ra,
                "dec": dec,
                "ra_hms": hms,
                "dec_dms": dms,
                "source": "Coordinate Parser (ICRS)"
            }

        # 3. Try SkyCoord.from_name (CDS Sesame HTTP resolver)
        try:
            c = SkyCoord.from_name(clean_query)
            ra_deg = float(c.ra.deg)
            dec_deg = float(c.dec.deg)
            hms, dms = cls.deg_to_hms_dms(ra_deg, dec_deg)
            return {
                "resolved": True,
                "ra": ra_deg,
                "dec": dec_deg,
                "ra_hms": hms,
                "dec_dms": dms,
                "source": "CDS Sesame / SIMBAD"
            }
        except Exception:
            pass

        # 4. Try astroquery.simbad
        try:
            from astroquery.simbad import Simbad
            custom_simbad = Simbad()
            custom_simbad.TIMEOUT = 5
            result = custom_simbad.query_object(clean_query)
            if result is not None and len(result) > 0:
                ra_str = str(result["RA"][0])
                dec_str = str(result["DEC"][0])
                c = SkyCoord(f"{ra_str} {dec_str}", unit=(u.hourangle, u.deg), frame="icrs")
                ra_deg = float(c.ra.deg)
                dec_deg = float(c.dec.deg)
                hms, dms = cls.deg_to_hms_dms(ra_deg, dec_deg)
                return {
                    "resolved": True,
                    "ra": ra_deg,
                    "dec": dec_deg,
                    "ra_hms": hms,
                    "dec_dms": dms,
                    "source": "SIMBAD (CDS Strasbourg)"
                }
        except Exception:
            pass

        return {
            "resolved": False,
            "error": (
                f"Could not resolve '{clean_query}'. "
                "No API key is needed. You can enter coordinates directly (e.g. '269.4521, 4.6933' or '17h57m48s +04d41m36s'), "
                "or search any catalog target (e.g. Vega, Sirius, Betelgeuse, Barnard's Star, WISE 0855, M31)."
            )
        }

    @staticmethod
    def is_point_in_footprint(point_ra: float, point_dec: float, center_ra: float, center_dec: float, fov_deg: float) -> bool:
        """Check if target coordinate falls within the telescope field of view."""
        c1 = SkyCoord(ra=point_ra * u.deg, dec=point_dec * u.deg, frame="icrs")
        c2 = SkyCoord(ra=center_ra * u.deg, dec=center_dec * u.deg, frame="icrs")
        sep = c1.separation(c2).deg
        return sep <= (fov_deg / 2.0)

coordinate_service = CoordinateService()
