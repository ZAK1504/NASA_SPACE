from fastapi import APIRouter, Body
from typing import Dict, Any, List, Optional
from app.services.object_service import object_service

router = APIRouter(prefix="/assistant", tags=["assistant"])

KNOWLEDGE_BASE = {
    "ra": (
        "Right Ascension (RA) is the celestial equivalent of terrestrial longitude. "
        "It measures the angular distance eastward along the celestial equator from the vernal equinox, "
        "usually expressed in hours, minutes, and seconds (0h to 24h) or in decimal degrees (0° to 360°)."
    ),
    "dec": (
        "Declination (Dec) is the celestial equivalent of terrestrial latitude. "
        "It measures the angular distance north (+) or south (−) of the celestial equator, "
        "from +90° at the north celestial pole to −90° at the south celestial pole."
    ),
    "proper motion": (
        "Proper motion is the apparent angular velocity of a star across our sky relative to distant background stars. "
        "It is measured in milliarcseconds per year (mas/yr) or arcseconds per year. "
        "Barnard's Star has the highest proper motion of any known star (10.3 arcsec/yr)."
    ),
    "fits": (
        "FITS (Flexible Image Transport System) is the standard digital data format used by NASA, ESA, "
        "and professional astronomers worldwide. Unlike consumer images (JPEG/PNG), a FITS file stores "
        "uncompressed scientific 32-bit floating-point measurements, multi-extension headers, and World Coordinate System (WCS) calibration."
    ),
    "asinh": (
        "The inverse hyperbolic sine (Asinh) stretch is an astronomical display transfer function. "
        "Telescope images have extreme dynamic range: bright stars can be a million times brighter than faint nebulosity. "
        "An Asinh stretch behaves linearly for faint signals (preserving background noise structure) and logarithmically for bright signals (preventing pixel saturation)."
    ),
    "difference image": (
        "A difference image is computed as: Difference = Later Observation − Earlier Observation. "
        "After careful alignment and background normalization, stationary stars subtract to zero, while moving objects produce a dipole (dark dip where it was, bright peak where it moved) and variable stars show a brightness excess or deficit."
    ),
    "102 bands": (
        "SPHEREx carries Linear Variable Filters (LVF) that observe light in 102 distinct near-infrared bands from 0.75 μm to 5.0 μm. "
        "This allows measuring full spectroscopy for every pixel on the entire sky, detecting water ice (3.05 μm), CO2 ice (4.27 μm), and mapping galaxy redshifts across cosmic time."
    )
}

@router.post("/query")
def ask_assistant(message: str = Body(..., embed=True)) -> Dict[str, Any]:
    """
    Intelligent astronomical copilot that provides educational guidance,
    answers science questions, and provides direct navigation actions.
    """
    q = message.lower().strip()
    actions: List[Dict[str, str]] = []
    response_text = ""

    # Navigation intents
    if "barnard" in q or "moving star" in q:
        response_text = (
            "Barnard's Star is a red dwarf star only 5.96 light-years away, famous for having the largest proper motion "
            "of any known star (10.3 arcsec/year). You can track its movement in the Time Machine or complete Mission 01!"
        )
        actions = [
            {"label": "Explore Barnard's Star", "url": "/objects/barnards-star"},
            {"label": "Track Motion in Time Machine", "url": "/time-machine?object=barnards-star"},
            {"label": "Launch Mission 01: The Moving Star", "url": "/missions/moving-star"}
        ]
    elif "wise" in q or "cold" in q or "brown dwarf" in q:
        response_text = (
            "WISE 0855−0714 is the coldest known brown dwarf (~250 K), barely warmer than ice. "
            "It is invisible in optical light but glows in near-infrared. Explore it in the Spectral Explorer across SPHEREx's infrared bands!"
        )
        actions = [
            {"label": "Inspect WISE 0855", "url": "/objects/wise-0855"},
            {"label": "Explore Infrared Spectra", "url": "/spectra?object=wise-0855"},
            {"label": "Mission 02: The Invisible World", "url": "/missions/invisible-world"}
        ]
    elif "variable" in q or "rw aurigae" in q or "draconis" in q or "change" in q:
        response_text = (
            "Variable stars change in brightness over time. RW Aurigae dims dramatically due to colliding protoplanetary disk debris, "
            "while R Draconis is a pulsating Mira-type carbon star with a 246-day cycle."
        )
        actions = [
            {"label": "Inspect RW Aurigae", "url": "/objects/rw-aurigae"},
            {"label": "Inspect R Draconis", "url": "/objects/r-draconis"},
            {"label": "Mission 03: A Star That Changes", "url": "/missions/changing-star"}
        ]
    elif "map" in q or "sky" in q or "aladin" in q:
        response_text = (
            "The Explore Sky map is powered by Aladin Lite from CDS Strasbourg. "
            "You can zoom, pan, search coordinates, and toggle between Optical (DSS2), Near-Infrared (2MASS), and Mid-Infrared (AllWISE) backgrounds."
        )
        actions = [
            {"label": "Open Sky Map", "url": "/explore"}
        ]
    elif "time machine" in q or "compare" in q or "blink" in q:
        response_text = (
            "The Time Machine allows you to compare two observations of the same field using 4 modes: "
            "Side-by-side, Drag slider, Blink comparison (jumping between images), and Scientific Difference (Later − Earlier)."
        )
        actions = [
            {"label": "Open Time Machine", "url": "/time-machine"}
        ]
    elif "lab" in q or "discovery" in q:
        response_text = (
            "The Discovery Lab is your citizen-science workspace. Run automated source detection with Photutils (DAOStarFinder) "
            "to spot candidate moving or variable objects, and save them to your personal Discovery Journal."
        )
        actions = [
            {"label": "Go to Discovery Lab", "url": "/discovery-lab"},
            {"label": "View My Discoveries", "url": "/discoveries"}
        ]
    elif "spectral" in q or "band" in q or "spectrum" in q or "102" in q:
        response_text = (
            "SPHEREx observes light across 102 near-infrared channels from 0.75 to 5.0 micrometers. "
            "It probes key cosmic molecules including Water Ice (3.05 μm), CO2 Ice (4.27 μm), and Carbon Monoxide (4.67 μm)."
        )
        actions = [
            {"label": "Open Spectral Explorer", "url": "/spectra"}
        ]
    else:
        # Check astronomy glossary concepts
        found_concept = False
        for term, explanation in KNOWLEDGE_BASE.items():
            if term in q:
                response_text = explanation
                found_concept = True
                break

        if not found_concept:
            response_text = (
                "I am your SPHEREx Cosmic Copilot! I can guide you to celestial objects, explain astronomy concepts "
                "(like proper motion, RA/Dec coordinates, and infrared spectroscopy), and take you directly to any exploration tool."
            )
            actions = [
                {"label": "Explore Featured Objects", "url": "/objects"},
                {"label": "Start Guided Missions", "url": "/missions"},
                {"label": "Open Interactive Sky Map", "url": "/explore"}
            ]

    return {
        "response": response_text,
        "actions": actions,
        "suggested_questions": [
            "Where can I see a star moving?",
            "What is a brown dwarf?",
            "How does the difference image work?",
            "What do the 102 spectral bands detect?"
        ]
    }
