"""
Canonical Target Registry and Astronomical Astrometry Service for SPHEREx HORIZON.
Authoritative celestial catalogue sources (Gaia DR3, SIMBAD, Luhman et al. 2014/2016).
Provides rigorous epoch-aware astrometric propagation, coordinate reference frames,
and celestial comparison grid calculations.
"""

from typing import Dict, Any, List, Optional, Tuple, Union
from dataclasses import dataclass, asdict
import math
from datetime import datetime
from astropy.coordinates import SkyCoord, FK5, ICRS, Distance
import astropy.units as u
from astropy.time import Time

@dataclass
class TargetRecord:
    id: str
    name: str
    designation: str
    aliases: List[str]
    object_type: str
    catalog_source: str
    reference_frame: str  # e.g. "ICRS"
    reference_epoch: str  # e.g. "J2016.0", "2010.4"
    reference_epoch_val: float # Numeric year
    ref_ra_deg: float
    ref_dec_deg: float
    ref_ra_hms: str
    ref_dec_dms: str
    pm_ra_cosdec_mas_yr: float  # proper motion in RA * cos(dec), mas/yr
    pm_dec_mas_yr: float         # proper motion in DEC, mas/yr
    parallax_mas: float
    distance_ly: float
    radial_velocity_km_s: Optional[float]
    spectral_type: str
    description: str
    scientific_limitations: str
    astrometric_citation: str
    # Primary companion info (e.g. Epsilon Indi A for Epsilon Indi B)
    companion_name: Optional[str] = None
    companion_ra_deg: Optional[float] = None
    companion_dec_deg: Optional[float] = None
    companion_type: Optional[str] = None
    companion_separation_arcsec: Optional[float] = None

# Authoritative Catalogue Definitions
TARGET_REGISTRY: Dict[str, TargetRecord] = {
    "barnards-star": TargetRecord(
        id="barnards-star",
        name="Barnard's Star",
        designation="GJ 699",
        aliases=["V2500 Oph", "BD+04 3561", "HIP 87937", "Gaia DR3 4472832130942575872"],
        object_type="High Proper Motion Red Dwarf",
        catalog_source="Gaia DR3 (Source ID 4472832130942575872) & SIMBAD",
        reference_frame="ICRS",
        reference_epoch="J2016.0",
        reference_epoch_val=2016.0,
        ref_ra_deg=269.448503,
        ref_dec_deg=4.739420,
        ref_ra_hms="17h 57m 47.64s",
        ref_dec_dms="+04° 44' 21.9\"",
        pm_ra_cosdec_mas_yr=-801.551,   # mas/yr
        pm_dec_mas_yr=10362.394,        # mas/yr (fastest known proper motion)
        parallax_mas=546.9759,          # mas
        distance_ly=5.96,
        radial_velocity_km_s=-110.11,
        spectral_type="M4.0V",
        description="The closest single star to our Solar System at 5.96 light-years. Famous for exhibiting the largest known proper motion (10.39 arcsec/yr), traversing over 10 arcseconds across each year of SPHEREx observation.",
        scientific_limitations="High optical and near-IR flux saturates the central pixel of the Teledyne H2RG detector. The central core is flagged and masked as NaN by the IPAC pipeline (FLAGS bits 1 and 2), necessitating centroiding on the unmasked diffraction wings.",
        astrometric_citation="Gaia DR3 (Gaia Collaboration, 2022); SIMBAD Astronomical Database"
    ),
    "wise-0855": TargetRecord(
        id="wise-0855",
        name="WISE 0855−0714",
        designation="WISE J085510.83-071442.5",
        aliases=["WISE 0855-0714", "WISE J0855-0714"],
        object_type="Sub-stellar Cold Brown Dwarf",
        catalog_source="Luhman (2014, ApJL 786:L18) & Luhman & Esplin (2016, ApJ 820:78)",
        reference_frame="ICRS",
        reference_epoch="2010.4",
        reference_epoch_val=2010.4,
        ref_ra_deg=133.795129,
        ref_dec_deg=-7.245147,
        ref_ra_hms="08h 55m 10.83s",
        ref_dec_dms="−07° 14' 42.5\"",
        pm_ra_cosdec_mas_yr=-8118.0,    # -8.118 arcsec/yr WESTWARD
        pm_dec_mas_yr=680.0,            # +0.680 arcsec/yr NORTHWARD
        parallax_mas=449.0,             # 0.449 arcsec
        distance_ly=7.26,
        radial_velocity_km_s=None,
        spectral_type="Y4",
        description="The coldest known sub-stellar brown dwarf (~250 K), discovered in 2014 by Kevin Luhman. Moves predominantly westward (-8.12 arcsec/yr). Exhibits candidate water-ice clouds in its cold upper atmosphere.",
        scientific_limitations="Extremely cold surface temperature (~250 K) results in negligible flux at short near-IR wavelengths (< 3.0 μm). Best detected in longer-wavelength SPHEREx detectors D5 and D6 (3.8–5.0 μm). D3 observations at 2.0 μm provide upper limits but generally lack direct point-source detection.",
        astrometric_citation="Luhman & Esplin (2016, ApJ 820:78, doi:10.3847/0004-6256/152/3/78); SIMBAD"
    ),
    "epsilon-indi-b": TargetRecord(
        id="epsilon-indi-b",
        name="Epsilon Indi B",
        designation="HD 209100B",
        aliases=["GJ 845B", "Eps Ind B", "Gaia DR3 6412596012146801152"],
        object_type="Binary T-Dwarf System",
        catalog_source="Scholz et al. (2003, A&A 398:L29); Gaia DR3; SIMBAD",
        reference_frame="ICRS",
        reference_epoch="J2000.0",
        reference_epoch_val=2000.0,
        ref_ra_deg=331.044147,
        ref_dec_deg=-56.782844,
        ref_ra_hms="22h 04m 10.60s",
        ref_dec_dms="−56° 46' 58.2\"",
        pm_ra_cosdec_mas_yr=3961.4,     # mas/yr
        pm_dec_mas_yr=-2538.3,          # mas/yr
        parallax_mas=275.8,             # mas
        distance_ly=11.82,
        radial_velocity_km_s=-40.4,
        spectral_type="T1 + T6",
        description="A benchmark substellar binary of two brown dwarfs (T1 + T6) orbiting primary star Epsilon Indi A at ~1460 AU (~402\" / ~6.7′ separation). Provides an essential laboratory for substellar atmospheric physics.",
        scientific_limitations="In typical SPHEREx 15′ FOV cutouts, primary star Epsilon Indi A (K5V, V=4.69 mag) is present in the field and heavily saturated with a masked core. Epsilon Indi B is separated by ~402″ (~6.7′) to the ENE. Individual Ba and Bb components (0.7\" separation) are spatially unresolved at SPHEREx's 6.15\"/pixel scale.",
        astrometric_citation="Scholz et al. (2003); King et al. (2010); Gaia DR3 (Gaia Collaboration, 2022)",
        companion_name="Epsilon Indi A",
        companion_ra_deg=330.840223,
        companion_dec_deg=-56.785979,
        companion_type="Primary K5V Dwarf Star (V=4.69, Saturated Core)",
        companion_separation_arcsec=402.4
    ),
    "rw-aurigae": TargetRecord(
        id="rw-aurigae",
        name="RW Aurigae",
        designation="V* RW Aur",
        aliases=["HD 242703", "HIP 24433", "Gaia DR3 162985392019482112"],
        object_type="Classical T Tauri Binary",
        catalog_source="Gaia DR3 (Source ID 162985392019482112) & SIMBAD",
        reference_frame="ICRS",
        reference_epoch="J2016.0",
        reference_epoch_val=2016.0,
        ref_ra_deg=76.956067,
        ref_dec_deg=30.401326,
        ref_ra_hms="05h 07m 49.46s",
        ref_dec_dms="+30° 24' 04.8\"",
        pm_ra_cosdec_mas_yr=1.25,       # mas/yr
        pm_dec_mas_yr=-21.40,           # mas/yr
        parallax_mas=6.12,              # mas
        distance_ly=532.0,
        radial_velocity_km_s=15.8,
        spectral_type="K3e + K5e",
        description="A young pre-main sequence binary star system exhibiting sudden dimming events (2-3 magnitudes) attributed to tidally disrupted protoplanetary disk debris passing along our line of sight.",
        scientific_limitations="Complex circumstellar dust emission and tidal bridge between components A and B (1.4\" separation) are spatially blended within the SPHEREx beam. Variability is monitored via total integrated flux.",
        astrometric_citation="Gaia DR3 (Gaia Collaboration, 2022); Rodriguez et al. (2018)"
    ),
    "r-draconis": TargetRecord(
        id="r-draconis",
        name="R Draconis",
        designation="V* R Dra",
        aliases=["HD 149214", "HIP 80693", "Gaia DR3 1667439201492042240"],
        object_type="Mira-type Carbon Pulsating Variable",
        catalog_source="Gaia DR3 (Source ID 1667439201492042240) & SIMBAD",
        reference_frame="ICRS",
        reference_epoch="J2016.0",
        reference_epoch_val=2016.0,
        ref_ra_deg=248.167611,
        ref_dec_deg=66.754979,
        ref_ra_hms="16h 32m 40.23s",
        ref_dec_dms="+66° 45' 17.9\"",
        pm_ra_cosdec_mas_yr=-14.20,     # mas/yr
        pm_dec_mas_yr=-8.50,            # mas/yr
        parallax_mas=1.51,              # mas
        distance_ly=2160.0,
        radial_velocity_km_s=-28.0,
        spectral_type="C-N4.5 (Mira variable)",
        description="An asymptotic giant branch (AGB) carbon-rich pulsating variable star with a 245.6-day period, varying from magnitude 6.7 down to 13.2. Exhibits dust condensation cycles in its circumstellar wind.",
        scientific_limitations="Near peak luminosity, the high flux can approach non-linearity thresholds in high-sensitivity channels. Photometric calibration requires sigma-clipped background subtraction to account for surrounding circumstellar dust emission.",
        astrometric_citation="Gaia DR3 (Gaia Collaboration, 2022); GCVS (Samus et al. 2017)"
    )
}

class AstrometryService:
    """Rigorous astronomical astrometry and coordinate propagation engine."""

    @staticmethod
    def get_canonical_target(target_id: str) -> Optional[TargetRecord]:
        clean_id = target_id.lower().strip().replace(" ", "-").replace("_", "-")
        # Direct lookup
        if clean_id in TARGET_REGISTRY:
            return TARGET_REGISTRY[clean_id]
        # Match aliases or name
        for rec in TARGET_REGISTRY.values():
            if clean_id == rec.id or clean_id == rec.name.lower().replace(" ", "-"):
                return rec
            for alias in rec.aliases:
                if clean_id == alias.lower().replace(" ", "-"):
                    return rec
        return None

    @staticmethod
    def get_all_targets() -> List[TargetRecord]:
        return list(TARGET_REGISTRY.values())

    @classmethod
    def propagate_to_epoch(
        cls,
        target: TargetRecord,
        target_epoch_year: float = 2026.0
    ) -> Tuple[float, float, Dict[str, Any]]:
        """
        Propagate reference coordinates to observation epoch using linear proper motion
        and spherical geometry:
        Delta_Dec = pm_dec * delta_t
        Delta_RA = (pm_ra_cosdec / cos(mean_dec)) * delta_t
        """
        delta_years = target_epoch_year - target.reference_epoch_val
        
        # Proper motion in degrees
        d_dec_deg = (target.pm_dec_mas_yr * delta_years) / (3600.0 * 1000.0)
        new_dec_deg = target.ref_dec_deg + d_dec_deg
        
        mean_dec_rad = math.radians((target.ref_dec_deg + new_dec_deg) / 2.0)
        cos_mean_dec = max(0.001, math.cos(mean_dec_rad))
        d_ra_deg = ((target.pm_ra_cosdec_mas_yr * delta_years) / (3600.0 * 1000.0)) / cos_mean_dec
        new_ra_deg = (target.ref_ra_deg + d_ra_deg) % 360.0

        c_prop = SkyCoord(ra=new_ra_deg * u.deg, dec=new_dec_deg * u.deg, frame="icrs")
        ra_hms = c_prop.ra.to_string(unit=u.hour, sep=('h ', 'm ', 's'), precision=2)
        dec_dms = c_prop.dec.to_string(unit=u.deg, sep=('° ', '\' ', '"'), precision=1, alwayssign=True)

        metadata = {
            "catalog_reference_epoch": target.reference_epoch,
            "target_observation_epoch": f"J{target_epoch_year:.2f}",
            "delta_years": round(delta_years, 3),
            "propagated_ra_deg": round(new_ra_deg, 6),
            "propagated_dec_deg": round(new_dec_deg, 6),
            "propagated_ra_hms": ra_hms,
            "propagated_dec_dms": dec_dms,
            "total_motion_arcsec": round(math.hypot(d_ra_deg * cos_mean_dec, d_dec_deg) * 3600.0, 3)
        }
        return new_ra_deg, new_dec_deg, metadata

    @classmethod
    def propagate_to_date(
        cls,
        target: TargetRecord,
        date_obs: Any
    ) -> Tuple[float, float, Dict[str, Any]]:
        """
        Propagate reference coordinates to an exact observation date string (e.g. '2025-08-27' or ISO).
        Computes the decimal Besselian/Julian epoch year:
        epoch_year = year + (day_of_year - 1) / 365.25
        """
        if isinstance(date_obs, (int, float)):
            epoch_year = float(date_obs)
            date_str = f"Epoch {epoch_year:.2f}"
        else:
            try:
                date_clean = str(date_obs).replace("Z", "").split("+")[0].strip()
                if "T" in date_clean:
                    dt = datetime.fromisoformat(date_clean)
                else:
                    dt = datetime.strptime(date_clean[:10], "%Y-%m-%d")
                epoch_year = dt.year + (dt.timetuple().tm_yday - 1.0) / 365.25
                date_str = dt.strftime("%Y-%m-%d")
            except Exception:
                epoch_year = 2026.0
                date_str = "2026-01-01"

        ra_deg, dec_deg, meta = cls.propagate_to_epoch(target, epoch_year)
        meta["observation_date"] = date_str
        meta["target_observation_epoch"] = f"J{epoch_year:.2f}"
        return ra_deg, dec_deg, meta

    @classmethod
    def get_fixed_comparison_center(
        cls,
        target: TargetRecord,
        epochs: List[float] = [2025.65, 2026.65]
    ) -> Tuple[float, float, float]:
        """
        Determine a fixed celestial comparison region center and minimum FOV
        that encloses the target trajectory across all observation dates without
        artificially recentering individual images.
        """
        ra_list = []
        dec_list = []
        for ep in epochs:
            r, d, _ = cls.propagate_to_epoch(target, ep)
            ra_list.append(r)
            dec_list.append(d)

        center_ra = sum(ra_list) / len(ra_list)
        center_dec = sum(dec_list) / len(dec_list)

        # Angular extent of motion
        cos_dec = math.cos(math.radians(center_dec))
        max_extent_arcsec = max(
            math.hypot((ra_list[-1] - ra_list[0]) * cos_dec, dec_list[-1] - dec_list[0]) * 3600.0,
            30.0
        )
        recommended_fov_arcsec = max(300.0, max_extent_arcsec * 3.0)
        return center_ra, center_dec, recommended_fov_arcsec

astrometry_service = AstrometryService()
