from typing import List, Optional, Dict, Any

FEATURED_OBJECTS_DATA = [
    {
        "id": "barnards-star",
        "slug": "barnards-star",
        "name": "Barnard's Star",
        "type": "Red Dwarf Star",
        "ra": 269.4463,
        "dec": 4.7681,
        "ra_hms": "17h 57m 47.1s",
        "dec_dms": "+04° 46' 05\"",
        "reference_epoch": "J2026.0 (propagated from Gaia DR3 J2016.0)",
        "description": "The closest single star to our Solar System at 5.96 light-years. Famous for having the largest known proper motion of any star (10.33 arcsec/year) — moving visibly across sky surveys over months and years.",
        "tags": ["proper motion", "nearby star", "red dwarf", "high velocity"],
        "proper_motion_ra": -798.58,   # mas/yr
        "proper_motion_dec": 10328.12, # mas/yr
        "parallax": 547.45,            # mas
        "distance_ly": 5.96,
        "spectral_type": "M4.0V",
        "observation_count": 0
    },
    {
        "id": "wise-0855",
        "slug": "wise-0855",
        "name": "WISE 0855−0714",
        "type": "Brown Dwarf",
        "ra": 133.7598,
        "dec": -7.2428,
        "ra_hms": "08h 55m 02.4s",
        "dec_dms": "−07° 14' 34\"",
        "reference_coords_historical": {
            "ra_deg": 133.7951,
            "dec_deg": -7.2452,
            "ra_hms": "08h 55m 10.8s",
            "dec_dms": "−07° 14' 43\"",
            "epoch": "2010.0 (Discovery)"
        },
        "description": "The coldest known sub-stellar brown dwarf (~250 K), discovered in 2014 by Kevin Luhman. Emits almost purely in infrared wavelengths with candidate water ice atmospheric clouds, making it a prime SPHEREx target.",
        "tags": ["brown dwarf", "infrared", "cold", "water clouds"],
        "proper_motion_ra": -8132.0,   # mas/yr
        "proper_motion_dec": 546.0,    # mas/yr
        "parallax": 435.0,
        "distance_ly": 7.43,
        "spectral_type": "Y4",
        "observation_count": 0
    },
    {
        "id": "epsilon-indi-b",
        "slug": "epsilon-indi-b",
        "name": "Epsilon Indi B",
        "type": "Binary Brown Dwarf",
        "ra": 331.0441,
        "dec": -56.7828,
        "ra_hms": "22h 04m 10.6s",
        "dec_dms": "−56° 46' 58\"",
        "description": "A benchmark binary system of two T-type brown dwarfs (T1 + T6, Gaia DR3 6412596012146801152) orbiting Epsilon Indi A at ~1460 AU. At 11.82 light-years, it provides an exquisite laboratory for substellar atmospheric modeling across SPHEREx's 102 infrared bands.",
        "tags": ["brown dwarf", "binary", "nearby", "atmospheric benchmark"],
        "proper_motion_ra": 3961.4,
        "proper_motion_dec": -2538.3,
        "parallax": 275.8,
        "distance_ly": 11.82,
        "spectral_type": "T1 + T6",
        "observation_count": 0
    },
    {
        "id": "rw-aurigae",
        "slug": "rw-aurigae",
        "name": "RW Aurigae",
        "type": "T Tauri Star",
        "ra": 76.9561,
        "dec": 30.4013,
        "ra_hms": "05h 07m 49.5s",
        "dec_dms": "+30° 24' 05\"",
        "description": "A young classical T Tauri binary star (Gaia DR3 162985392019482112) in Taurus-Auriga showing dramatic, irregular occultation dips of 2-3 magnitudes, thought to be caused by tidally disrupted protoplanetary disk debris passing through the line of sight.",
        "tags": ["variable star", "T Tauri", "young star", "protoplanetary disk"],
        "proper_motion_ra": 1.25,
        "proper_motion_dec": -21.4,
        "parallax": 6.12,
        "distance_ly": 532.0,
        "spectral_type": "K3e",
        "observation_count": 0
    },
    {
        "id": "r-draconis",
        "slug": "r-draconis",
        "name": "R Draconis",
        "type": "Carbon Star",
        "ra": 248.1676,
        "dec": 66.7550,
        "ra_hms": "16h 32m 40.2s",
        "dec_dms": "+66° 45' 18\"",
        "description": "A pulsating Mira-type variable carbon star (Gaia DR3 1667439201492042240) with a 246-day period, varying from magnitude 6.7 down to 13.2. Its carbon-rich atmosphere and stellar dust winds produce strong infrared signatures ideal for multi-epoch observation.",
        "tags": ["variable star", "carbon star", "Mira variable", "stellar pulsation"],
        "proper_motion_ra": -14.2,
        "proper_motion_dec": -8.5,
        "parallax": 1.51,
        "distance_ly": 2160.0,
        "spectral_type": "C-N4.5",
        "observation_count": 0
    }
]

class ObjectService:
    @staticmethod
    def get_all_objects() -> List[Dict[str, Any]]:
        return FEATURED_OBJECTS_DATA

    @staticmethod
    def get_object_by_id(identifier: str) -> Optional[Dict[str, Any]]:
        norm = identifier.lower().strip()
        for obj in FEATURED_OBJECTS_DATA:
            if obj["id"] == norm or obj["slug"] == norm or obj["name"].lower() == norm:
                return obj
        return None

    @staticmethod
    def search_objects(query: str, object_type: Optional[str] = None) -> List[Dict[str, Any]]:
        q = query.lower().strip()
        results = []
        for obj in FEATURED_OBJECTS_DATA:
            matches_q = (
                not q or
                q in obj["name"].lower() or
                q in obj["type"].lower() or
                any(q in t.lower() for t in obj["tags"]) or
                q in obj["description"].lower()
            )
            matches_type = not object_type or object_type == "All" or obj["type"] == object_type
            if matches_q and matches_type:
                results.append(obj)
        return results

object_service = ObjectService()
