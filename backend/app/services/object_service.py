from typing import List, Optional, Dict, Any
from app.services.target_service import astrometry_service, TargetRecord

def _target_to_dict(t: TargetRecord) -> Dict[str, Any]:
    ra_prop, dec_prop, meta = astrometry_service.propagate_to_epoch(t, 2026.0)
    
    tags_map = {
        "barnards-star": ["proper motion", "nearby star", "red dwarf", "high velocity"],
        "wise-0855": ["brown dwarf", "infrared", "cold", "water clouds", "sub-stellar"],
        "epsilon-indi-b": ["brown dwarf", "binary", "nearby", "atmospheric benchmark"],
        "rw-aurigae": ["variable star", "T Tauri", "young star", "protoplanetary disk"],
        "r-draconis": ["variable star", "carbon star", "Mira variable", "stellar pulsation"],
    }

    obs_count_map = {
        "barnards-star": 80,
        "wise-0855": 47,
        "epsilon-indi-b": 65,
        "rw-aurigae": 50,
        "r-draconis": 5,
    }

    d = {
        "id": t.id,
        "slug": t.id,
        "name": t.name,
        "designation": t.designation,
        "aliases": t.aliases,
        "type": t.object_type,
        "ra": round(ra_prop, 4),
        "dec": round(dec_prop, 4),
        "ra_hms": meta["propagated_ra_hms"],
        "dec_dms": meta["propagated_dec_dms"],
        "reference_coords": {
            "ra_deg": t.ref_ra_deg,
            "dec_deg": t.ref_dec_deg,
            "ra_hms": t.ref_ra_hms,
            "dec_dms": t.ref_dec_dms,
            "epoch": t.reference_epoch,
            "frame": t.reference_frame
        },
        "reference_epoch": f"J2026.0 (Propagated from {t.reference_epoch})",
        "description": t.description,
        "scientific_limitations": t.scientific_limitations,
        "astrometric_citation": t.astrometric_citation,
        "tags": tags_map.get(t.id, ["SPHEREx"]),
        "proper_motion_ra": t.pm_ra_cosdec_mas_yr,
        "proper_motion_dec": t.pm_dec_mas_yr,
        "parallax": t.parallax_mas,
        "distance_ly": t.distance_ly,
        "spectral_type": t.spectral_type,
        "observation_count": obs_count_map.get(t.id, 10)
    }

    if t.companion_name:
        d["companion"] = {
            "name": t.companion_name,
            "ra": t.companion_ra_deg,
            "dec": t.companion_dec_deg,
            "type": t.companion_type,
            "separation_arcsec": t.companion_separation_arcsec
        }

    return d

class ObjectService:
    @staticmethod
    def get_all_objects() -> List[Dict[str, Any]]:
        return [_target_to_dict(t) for t in astrometry_service.get_all_targets()]

    @staticmethod
    def get_object_by_id(identifier: str) -> Optional[Dict[str, Any]]:
        t = astrometry_service.get_canonical_target(identifier)
        if t:
            return _target_to_dict(t)
        return None

    @staticmethod
    def search_objects(query: str, object_type: Optional[str] = None) -> List[Dict[str, Any]]:
        q = query.lower().strip()
        all_objs = ObjectService.get_all_objects()
        results = []
        for obj in all_objs:
            matches_q = (
                not q or
                q in obj["name"].lower() or
                q in obj["type"].lower() or
                any(q in t.lower() for t in obj["tags"]) or
                q in obj["description"].lower() or
                any(q in a.lower() for a in obj.get("aliases", []))
            )
            matches_type = not object_type or object_type == "All" or obj["type"] == object_type
            if matches_q and matches_type:
                results.append(obj)
        return results

object_service = ObjectService()
