# SPHEREx HORIZON — Cinematic UI Migration Plan

**Project:** SPHEREx HORIZON — Interactive Cosmic Discovery Platform  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026 — Planet X and SPHEREx  
**Migration Branch:** `feat/cinematic-ui-migration`  
**Base Scientific Checkpoint:** `5e807d0`  

---

## 1. Objective & Architectural Principles

The goal of this migration is to integrate the complete visual identity, typography, color palette, navigation, 3D spacecraft, galaxy backdrop, starfield, glass panels, ribbons, and page layout from `spherex-universe(4).zip` into the existing SPHEREx HORIZON application, while **strictly preserving 100% of the genuine scientific functionality, NASA/IPAC data pipelines, and test suites**.

### Two Distinct Sources of Truth:
1. **Visual Source of Truth (`spherex-universe(4).zip`):**
   - Cosmic black background (`#000`, `#02030a`).
   - Warm orange accents (`#f4a272`, `#ff7b3d`).
   - Typography: Inter (clean, modern weights 200–500) + JetBrains Mono (astrometric coordinates & technical metadata).
   - Starfield depth with three-layer parallax and shooting stars.
   - 3D interactive SPHEREx spacecraft model (`spherex.glb`) with responsive OrbitControls, scroll-dependent rotation, and yaw coordination.
   - Glassmorphic panels (`rgba(255, 255, 255, 0.07)`, backdrop-filter blur 18px).
   - Animated pill switchers, wavy ribbons, and smooth route transitions.
   - Educational star-color training game.

2. **Functional & Scientific Source of Truth (`nasa-sphere` repository):**
   - Genuine NASA/IPAC IRSA SIA2 and TAP query protocols (`spherex_dr1`, `spherex_qr3`).
   - Authentic SPHEREx Level 2 FITS calibration arrays and on-demand cache.
   - Canonical astronomical target registry & modern observation-date propagation.
   - Standard North-up, East-left tangential reprojection on fixed comparison grids.
   - Time Machine multi-epoch playback with honest single-epoch handling.
   - Aladin Lite official SPHEREx DR1 all-sky imagery and Order 5 science cube (~12.9″/px).
   - Synchronized 100-plane spectral playback with dichroic beam-splitter gap handling (channels 51/52).
   - Scientific Difference Maps (Later − Earlier) with sigma-clipped background matching.
   - DAOStarFinder candidate source detection with SNR metrics.
   - Persistent Discovery Journal with user annotations.
   - 43 passing backend pytest tests (100% regression safety).

### Excluded Prototype Scientific Placeholders:
- **`Time.jsx` synthetic sine-wave stars (`makeSky()`, `bright()`):** EXCLUDED. Replaced by authentic multi-epoch SPHEREx Level 2 observation frames.
- **`Explorer.jsx` CSS hue-rotation sky & `demoFlux()`:** EXCLUDED. Replaced by genuine Aladin Lite DR1 survey and scientific spectrum extraction.
- **`lib/spec.js` approximate interpolation & simulated features:** EXCLUDED. Replaced by official SPHEREx channel tables and genuine FITS SED extraction.
- **`Lab.jsx` hardcoded candidates (`SPX-0001` to `SPX-0007`):** EXCLUDED. Replaced by genuine three-view difference analysis, DAOStarFinder detection, and honest single-epoch state.
- **`lib/store.js` separate localStorage key:** EXCLUDED. Replaced by the persistent Discovery Journal backend and localStorage state.
- **`lib/art.js` and `Pic.jsx`:** Permitted ONLY for decorative backgrounds, homepage artwork, and navigation cards; strictly prohibited for scientific observation displays.

---

## 2. Migration Execution Phases

- **Phase 0 — Scientific Baseline & Environment Setup (Completed):**
  - Verified clean working tree at checkpoint `5e807d0`.
  - Created isolated migration branch `feat/cinematic-ui-migration`.
  - Verified 43 of 43 passing pytest backend tests.
  - Verified clean frontend production build.
  - Installed `three`, `@types/three`, and `lenis`.
  - Transferred `spherex.glb` (5.9 MB) to `public/models/spherex.glb`.

- **Phase 1 — Design System & Visual Shell:**
  - Import CSS design tokens (`--bg`, `--ink`, `--accent`, `--accent2`, `--glass`, etc.).
  - Integrate `Backdrop.tsx`, `Starfield.tsx`, `Transition.tsx`, `PillSwitch.tsx`, `Ribbon.tsx`, `Glass.tsx`, `Icon.tsx`, `Pic.tsx`.
  - Convert components to strict TypeScript (`.tsx`).
  - Create `Navbar.tsx` with top-level navigation: Home, Explorer, Time Machine, Labs, Mission.
  - Preserve all existing deep links and query parameters via route aliases.

- **Phase 2 — Cinematic Spacecraft & Homepage:**
  - Implement `Satellite3D.tsx` in Three.js loading `models/spherex.glb`, auto-centering, scale normalization, lighting, scroll rotation, and OrbitControls.
  - Implement full `Home.tsx` matching `Home.jsx` sections: Cinematic Hero, "This is our amazing sky", "By the numbers", "Pick a door", and `LinkMenu`.
  - Connect all CTAs to genuine scientific routes.

- **Phase 3 — Explorer Workspaces (Sky, Object, Spectral):**
  - Integrate `Stage.tsx` with Explorer sub-pages: `/explorer/sky`, `/explorer/object`, `/explorer/spectral`.
  - Embed existing working Aladin Lite all-sky viewer in Sky view.
  - Embed existing AstronomicalImageViewer and 5 challenge targets in Object view.
  - Embed existing synchronized 100-plane Spectral Explorer with Wavelength Scan in Spectral view.

- **Phase 4 — Time Machine:**
  - Wrap genuine Time Machine inside cinematic Stage layout at `/time-machine`.
  - Connect observation timeline, frame slider, play/pause, and dual-epoch comparison modes (Time-Lapse, Side-by-Side, Split Slider, Blink, Difference Map).
  - Preserve uncached arbitrary coordinate retrieval and honest single-epoch states.

- **Phase 5 — Labs (Discovery Lab, Light Curves, My Discoveries):**
  - Integrate Discovery Lab (`/lab/discovery`) with genuine three-view analysis and candidate detection.
  - Expose My Discoveries (`/lab/my-discovery` & `/discoveries`) with full journal persistence.
  - Integrate Light Curves (`/lab/light-curves`) with authentic photometric data.

- **Phase 6 — Mission & Educational Mini-Game:**
  - Implement Mission overview (`/mission`) with spacecraft model and facts.
  - Embed the star-color oddity mini-game as an explicitly labeled training simulation.
  - Keep guided scientific missions fully accessible.

- **Phase 7 — Verification, Tutorials, and Deliverables:**
  - Update Driver.js interactive tours for all pages.
  - Run full backend pytest suite (maintain 43 passes).
  - Run frontend TypeScript build (`npm run build`).
  - Perform browser testing and capture comparison screenshots.
