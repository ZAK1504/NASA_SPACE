# SPHEREx HORIZON — Cinematic Art Direction & Chapter Visual Environments

**Project:** SPHEREx HORIZON — Interactive Cosmic Discovery Platform  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026 — Planet X and SPHEREx  
**Reference Design:** ZENVYX Solutions / NASA Eyes / Cinematic Interactive Science Documentaries  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Creative Philosophy & Narrative Progression

SPHEREx HORIZON is designed not as a generic static dashboard, but as an **interactive cinematic documentary** exploring the infrared universe. Scrolling physically propels the visitor through a deliberate five-stage narrative arc:

```
[01 — HOME]          DEPARTURE          Meet the SPHEREx Spacecraft & Mission
       │
       ▼ (HomeToExplorer Transition: drift upward into deep indigo space)
[02 — EXPLORER]      INFRARED SKY       Discover the Hidden Universe across 102 Wavelengths
       │
       ▼ (TimeWarp Transition: relativistic hyperspace light trails)
[03 — TIME MACHINE]  CHANGING SKY       Travel Across Genuine Epochs (359-Day Baseline)
       │
       ▼ (TimeMachineToLabs Transition: deceleration freeze scan-lines)
[04 — LABS]          THE EVIDENCE       Investigate Aligned FITS & Signed Residual Maps
       │
       ▼ (LabsToMission Transition: golden sunrise horizon expanding outward)
[05 — MISSION]       PARTICIPATION      Explore the 5 Challenge Destinations & Citizen Missions
```

---

## 2. Chapter Atmosphere & Lighting Matrix

Rather than uniform dark space wallpaper, each chapter immerses the visitor in a distinct decorative environment matching its storytelling role:

| Chapter | Atmospheric Palette | Lighting Quality | Visual Centerpiece | Interaction Model |
| :--- | :--- | :--- | :--- | :--- |
| **01 — Home** | Deep cosmic black, warm golden sunlight (`#ffedd5`), soft copper glow | High-contrast solar key lighting, subtle cool cyan rim | 3D SPHEREx Flight Model (`Satellite3D.tsx`) | 360° drag-to-rotate, auto-floating sinusoidal motion, scroll flyby |
| **02 — Explorer** | Deep indigo (`#030308`), midnight blue, violet nebula layers | Atmospheric glow, soft stellar illumination | Interactive Celestial Panorama (`ExplorerShowcaseVisual.tsx`) | Drag-to-rotate star sphere, 5 target beacons with hover metadata, CTA-reactive modes |
| **03 — Time Machine** | Pitch black, warm amber (`#f59e0b`) & orange light trails | Dramatic depth illumination, time-dilation streaks | Genuine Dual-Epoch Observation Portal (`TimeMachineShowcaseVisual.tsx`) | Interactive split-slider wipe & 700ms blink comparison of real Level 2 FITS |
| **04 — Labs** | Dark graphite (`#050505`), neutral charcoal, restrained cool-white | Precision observatory lighting, zero saturated haze | 3-Plane Exploded Residual Array (`LabsShowcaseVisual.tsx`) | 3D isometric perspective toggle, plane hover focus, signed residual legend |
| **05 — Mission** | Midnight blue, deep cosmic black, soft warm sunrise horizon | Expansive celestial depth, warm golden horizon glow | Celestial Destination Atlas (`MissionShowcaseVisual.tsx`) | Interactive destination nodes, canonical RA/Dec celestial grid, direct workspace launching |

---

## 3. Scientific Preview Asset Strategy

To avoid generic AI-generated radar rings or synthetic graphics:
1. **Time Machine Showcase:** Calls `/api/comparison/align` to load the genuine Level 2 SPHEREx FITS observations of Barnard's Star across Epoch 1 (`2025-08-27`) and Epoch 2 (`2026-08-21`), directly displaying real base64 astronomical images with authentic star fields.
2. **Labs Showcase:** Renders the authentic signed difference map ($\Delta = E_2 - E_1$) directly alongside the calibrated epoch cutouts, illustrating the classic dipole motion signature resulting from Barnard's Star 10.223″/yr displacement.
3. **Mission Showcase:** Uses the canonical Gaia DR3 / SIMBAD coordinate registry from `FEATURED_OBJECTS` to accurately position the 5 challenge targets on a celestial coordinate grid (+90° to -90° Dec, 0h to 24h RA).

---

## 4. Design Tokens & Workspace Chrome

The core HORIZON design tokens are unified in `cinematic.css`:
- **Workspace Background:** `#08080C`
- **Primary Surface:** `#111117`
- **Border / Accents:** `rgba(255, 255, 255, 0.1)` / `#F4A272` (Warm Infrared) / `#FF7B3D` (Action Accent)
- **Primary Text:** `#F3EFE8` (Warm Off-White)
- **Technical Metadata:** `JetBrains Mono`
- **Prose / UI Typography:** `Inter` (300 / 400 / 500 / 600)
- **Button Parity:** "Explore the Sky" and "Time Machine" share identical button height, padding, border radius, background, and hover interactions.
