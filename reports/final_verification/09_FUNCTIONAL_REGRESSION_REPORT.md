# 09 — Functional Regression & User Experience Audit

## 1. Route Navigation & Workflow Pass/Fail Matrix

All primary application routes and scientific tools were tested using automated Puppeteer browser drivers and interactive validation.

| Route | Feature / Workspace | Primary Workflow Tested | API Endpoints Invoked | Status |
| :--- | :--- | :--- | :--- | :---: |
| `/` | **Main Journey (6 Chapters)** | Continuous scrolling from Chapter 01 (Home) down to Chapter 06 (About) | `/api/objects`, `/api/missions` | **PASS** |
| `/explore` | **Interactive Sky Map** | Aladin Lite all-sky canvas, pan/zoom, coordinate search, survey toggling (DSS2, 2MASS, AllWISE) | Aladin CDN, `/api/objects` | **PASS** |
| `/objects` | **Object Explorer** | Catalog filtering (Brown Dwarfs, Variable Stars, Moving Stars), target cards | `/api/objects` | **PASS** |
| `/objects/:id` | **Object Detail Profile** | Astrometry metadata, proper motion, spectral type, distance, observation timeline | `/api/objects/:id` | **PASS** |
| `/time-machine` | **Time Machine** | Multi-epoch observation comparison: Side-by-side, Drag Slider, Blink, Difference Image | `/api/comparison/manifest`, `/api/comparison/align` | **PASS** |
| `/spectra` | **Spectral Explorer** | 102 near-infrared channels, channel slider, molecular absorption overlays ($H_2O$ ice, $CO_2$ ice, $CO$), dichroic gap at 2.42 μm | `/api/spectra/channels`, `/api/spectra/:id` | **PASS** |
| `/discovery-lab` | **Discovery Lab** | DAOStarFinder automated source detection, difference residual analysis, discovery logging | `/api/processing/detect`, `/api/discoveries` | **PASS** |
| `/light-curves` | **Light Curves** | Multi-epoch photometric time-series, phase folding, Mira & T Tauri variability curves | `/api/lightcurves/:id` | **PASS** |
| `/missions` | **Guided Science Missions** | Mission 01 (Moving Star), Mission 02 (Invisible World), Mission 03 (Changing Star), quiz checkpoints | `/api/missions`, `/api/missions/:id` | **PASS** |
| `/about` | **Behind the Horizon** | Full team profiles, official photographs, scientific purpose, technical architecture | None (Static) | **PASS** |
| `/storybook` | **SPHEREx Info Book** | Interactive digital storybook: "The Universe in 102 Colours", 13 spreads, spread pagination | Local HTML / Static | **PASS** |

---

## 2. Main Journey Chapter Scrolling Audit

### Evaluation of Recent Scroll Fixes
The interaction controller combines custom wheel smoothing with **Lenis 1.3.27**:
1. **Small Gestures:** A gentle mouse-wheel notch or trackpad swipe promptly triggers a single chapter transition.
2. **Momentum Bursts:** Long trackpad flick gestures are absorbed by a transition cooldown; the page stops cleanly at the adjacent chapter without skipping multiple sections.
3. **Scroll Restoration:** Navigating from Chapter 04 (Labs) into `/discovery-lab` and clicking "Back to Journey" cleanly restores scroll position to Chapter 04 without flashing to Home.

---

## 3. 3D SPHEREx Spacecraft Stability

The Three.js spacecraft model on Chapter 01 was subjected to 25 stress cycles:
- **Interaction Stress:** Rapid mouse dragging, pointer release outside canvas, and concurrent scrolling.
- **Canvas Lifecycle:** Navigated repeatedly between Home and other chapters.
- **Resource Measurement:** WebGL context count remained constant (1 context); memory heap remained stable with zero canvas memory leaks or frozen render loops.

---

## 4. About Chapter & Info Book Verification

- **Team Photographs:** All 5 approved team photographs are rendered with high visual fidelity.
- **Quote Animation:** Framer Motion reveal for the closing quote operates seamlessly without glitching or clipped text.
- **Astronomical Finale:** Full-bleed background renders smoothly across wide viewports.
- **Info Book (`/storybook`):** Displays all 13 interactive spreads within the responsive viewport, supporting page flips, chapter jumping, and print modes.
