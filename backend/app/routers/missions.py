from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

router = APIRouter(prefix="/missions", tags=["missions"])

MISSIONS_CATALOG = [
    {
        "id": "moving-star",
        "title": "The Moving Star",
        "subtitle": "Mission 01",
        "target_object": "barnards-star",
        "difficulty": "beginner",
        "estimated_minutes": 15,
        "description": "Discover why Barnard's Star is extraordinary by tracking its movement across the sky. Learn how proper motion works and why nearby stars move faster than distant ones.",
        "teaches": ["Proper motion", "Sky coordinates", "Image comparison", "Source matching"],
        "stages": [
            {
                "step": 1,
                "type": "intro",
                "title": "Meet Barnard's Star",
                "content": (
                    "Barnard's Star is a red dwarf located just 5.96 light-years from Earth in the constellation Ophiuchus. "
                    "It is the second closest star system to us after the Alpha Centauri system, but it is invisible to the naked eye. "
                    "Its true fame comes from something remarkable: it is the fastest-moving star across our night sky."
                )
            },
            {
                "step": 2,
                "type": "concept",
                "title": "What is Proper Motion?",
                "content": (
                    "To our eyes, stars appear fixed in constellations. But in reality, every star in our galaxy is orbiting the galactic center at hundreds of kilometers per second. "
                    "Proper motion is the apparent angular motion of a star across the celestial sphere relative to distant background stars. "
                    "Barnard's star moves 10.3 arcseconds per year — enough to cover the diameter of the full Moon in just 180 years!"
                )
            },
            {
                "step": 3,
                "type": "comparison",
                "title": "Compare SPHEREx Observations",
                "content": (
                    "Compare two observations of Barnard's Star taken at different epochs. Notice the distant background stars remain completely stationary, "
                    "while Barnard's Star has shifted noticeably. In the difference image (Later − Earlier), the star appears as a dark dip (where it was) "
                    "next to a bright peak (where it moved to)."
                )
            },
            {
                "step": 4,
                "type": "quiz",
                "title": "Citizen Science Check",
                "question": "Why does Barnard's Star show greater apparent motion across our sky than a giant star like Betelgeuse?",
                "options": [
                    "It is much closer to Earth, so its physical motion translates to a larger angular shift on our sky",
                    "It has a higher mass and pulls itself through space faster",
                    "It is moving backwards against the galactic rotation",
                    "Its red color causes light refraction through space dust"
                ],
                "correct_option_index": 0,
                "explanation": "Just like looking out a car window, nearby objects (trees, street signs) rush past your view rapidly, while distant mountains barely appear to move at all. Because Barnard's Star is only 5.96 light-years away, its physical velocity creates a huge angular displacement on our celestial coordinate grid."
            },
            {
                "step": 5,
                "type": "completion",
                "title": "Mission Complete: You Tracked a Moving Star",
                "content": (
                    "Congratulations! You've learned how astronomers measure stellar proper motions and use image subtraction to detect movement. "
                    "SPHEREx's all-sky mapping enables tracking thousands of nearby low-mass stars and brown dwarfs across multiple passes."
                )
            }
        ]
    },
    {
        "id": "invisible-world",
        "title": "The Invisible World",
        "subtitle": "Mission 02",
        "target_object": "wise-0855",
        "difficulty": "beginner",
        "estimated_minutes": 20,
        "description": "Explore WISE 0855, the coldest known brown dwarf. Understand why some objects are only visible in infrared light and what SPHEREx's 102 spectral bands reveal.",
        "teaches": ["Brown dwarfs", "Infrared astronomy", "Wavelengths", "Why infrared matters"],
        "stages": [
            {
                "step": 1,
                "type": "intro",
                "title": "The Coldest World",
                "content": "WISE 0855-0714 is a sub-stellar object called a brown dwarf located 7.5 light-years away. At around -10°C to +10°C, it is barely warmer than an Earth winter. It is completely dark in visible light."
            },
            {
                "step": 2,
                "type": "concept",
                "title": "Why Infrared Telescopes?",
                "content": "Warm and cool objects radiate light according to Planck's Law: cooler bodies emit primarily at longer, infrared wavelengths. SPHEREx's 0.75 to 5.0 micrometer coverage captures the thermal glow of worlds like WISE 0855."
            },
            {
                "step": 3,
                "type": "comparison",
                "title": "Infrared vs Optical Comparison",
                "content": "Compare the optical DSS2 survey against SPHEREx infrared channels. Notice WISE 0855 vanishes into total darkness in optical wavelengths, but stands out as a distinctive thermal point source in SPHEREx channel 4.72 µm."
            },
            {
                "step": 4,
                "type": "quiz",
                "title": "Citizen Science Check",
                "question": "Why is WISE 0855-0714 bright in SPHEREx infrared observations while completely absent in visible light?",
                "options": [
                    "Its low temperature (~250 K) means its peak thermal emission occurs in the mid-infrared, not the optical band",
                    "It is hiding inside a dense interstellar black hole",
                    "Optical light cannot travel through interplanetary space",
                    "Brown dwarfs only reflect moonlight from distant solar systems"
                ],
                "correct_option_index": 0,
                "explanation": "According to Wien's Displacement Law, peak emission wavelength is inversely proportional to temperature (λ_peak ≈ 2898 / T). A world at ~250 K emits its peak energy around 10-12 µm and substantial flux in the SPHEREx 3-5 µm bands, while emitting essentially zero photons in visible light (0.4-0.7 µm)."
            },
            {
                "step": 5,
                "type": "completion",
                "title": "Mission Complete: You Unveiled a Cold World",
                "content": "Congratulations! You have verified how infrared spectroscopy detects cool planetary-mass objects that optical surveys miss entirely. SPHEREx's 102 bands will map thousands of cool brown dwarfs across the entire sky."
            }
        ]
    },
    {
        "id": "changing-star",
        "title": "A Star That Changes",
        "subtitle": "Mission 03",
        "target_object": "rw-aurigae",
        "difficulty": "intermediate",
        "estimated_minutes": 25,
        "description": "Investigate the dramatic brightness changes of RW Aurigae and R Draconis. Learn how astronomers study variable stars and what causes them to dim and brighten.",
        "teaches": ["Variable stars", "Brightness changes", "Light curves", "Observation comparison"],
        "stages": [
            {
                "step": 1,
                "type": "intro",
                "title": "Disrupted Planets in RW Aurigae",
                "content": "RW Aurigae is a young binary star system still surrounded by planet-forming material. Astronomers witnessed it dim by over 80% when broken debris from a collided protoplanetary disc passed in front of it."
            },
            {
                "step": 2,
                "type": "concept",
                "title": "Understanding Stellar Variability & Light Curves",
                "content": "Variable stars change in brightness over time due to intrinsic processes (stellar pulsation, flares) or extrinsic events (eclipsing binaries, dust obscuration). By measuring the flux of a star across multiple survey epochs, astronomers construct a light curve to determine the physical mechanism causing the change."
            },
            {
                "step": 3,
                "type": "comparison",
                "title": "Compare Multi-Epoch Observations",
                "content": "Examine two SPHEREx observations of RW Aurigae separated by 6 months. In the difference image (Epoch 2 − Epoch 1), note the strong flux deficit, corresponding to an obscuration event where opaque circumstellar dust clouds eclipsed the central star."
            },
            {
                "step": 4,
                "type": "quiz",
                "title": "Citizen Science Check",
                "question": "What evidence indicates that RW Aurigae's dimming is caused by dust obscuration rather than stellar core collapse?",
                "options": [
                    "The infrared colors show extinction by micron-sized dust grains, and the star recovered its brightness after the dust cloud passed",
                    "The star turned completely green and disappeared permanently",
                    "It emitted strong gravitational waves and formed a neutron star",
                    "Core collapse occurs on time scales of billions of years without any dimming"
                ],
                "correct_option_index": 0,
                "explanation": "Multi-wavelength infrared observations show selective extinction consistent with dusty circumstellar gas clouds. Furthermore, spectroscopy reveals ongoing accretion from the protoplanetary disk, demonstrating the star remains active and will brighten again once the intervening debris moves out of our line of sight."
            },
            {
                "step": 5,
                "type": "completion",
                "title": "Mission Complete: You Decoded Variable Star Light Curves",
                "content": "Outstanding work! You have investigated how SPHEREx's all-sky repetitive surveys detect time-domain cosmic phenomena. You now understand how light curves and multi-epoch subtraction reveal circumstellar collisions and variable stars across the galaxy."
            }
        ]
    }
]

@router.get("", response_model=List[dict])
def list_missions():
    """Retrieve all citizen-science educational missions."""
    return MISSIONS_CATALOG

@router.get("/{mission_id}", response_model=dict)
def get_mission(mission_id: str):
    """Retrieve a specific mission and its stages."""
    for m in MISSIONS_CATALOG:
        if m["id"] == mission_id:
            return m
    raise HTTPException(status_code=404, detail=f"Mission '{mission_id}' not found")
