# SPHEREx HORIZON — Continuous Single-Page Cinematic Architecture

**Project:** SPHEREx HORIZON — Interactive Cosmic Discovery Platform  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026 — Planet X and SPHEREx  
**Git Branch:** `feat/cinematic-ui-migration`  
**Checkpoint:** `feat(navigation): continuous single-page scroll architecture`

---

## 1. Architectural Vision & Objective

SPHEREx HORIZON transforms astronomical exploration into a continuous cinematic journey across space and time. Rather than fragmenting the user experience across isolated, disjointed pages, the entire application operates as **one unified, vertically scrolling continuous single-page cosmos**.

Users travel seamlessly from Earth's orbital vantage point down through all five major scientific destinations by scrolling, maintaining uninterrupted immersion, persistent application state, and smooth inertial motion:

```
┌──────────────────────────────────────────────────────────────┐
│  PERSISTENT TOP NAVIGATION BAR                               │
│  [SPHEREx HORIZON]  Home · Explorer · Time Machine · Labs · Mission  [Tour] [Play mission] │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  1. HOME SECTION (#home)                                    │
 │  - Hero typography & glowing atmospheric horizon            │
 │  - Interactive 3D SPHEREx satellite (paused when off-screen)│
 │  - Real-time UTC & 6-month survey pass HUD                  │
 │  - Primary exploration CTAs ("Explore the Sky ↓", "Time")   │
 │  - "By the numbers" mission statistics (102, 450M, 4, 2 yr) │
 │  - "Pick a door" interactive portal cards                   │
 └─────────────────────────────┬───────────────────────────────┘
                               │ (Smooth continuous scroll)
                               ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  2. EXPLORER SECTION (#explorer)                            │
 │  - Stage Header ("A whole universe in 102 infrared colours")│
 │  - Sub-Tabs: [Sky | Object | Spectral]                      │
 │  - Genuine Aladin Lite v3 WebGL sphere + DR1 all-sky cube   │
 │  - Multi-target inspector & Gaia DR3 proper motion vectors  │
 │  - 102-channel spectral cube viewer + Wavelength Scan (500ms│
 │  - STICKY CONTEXTUAL BOTTOM NAV: [Sky | Object | Spectral]  │
 │  - Section-End Action: "Continue to Time Machine ↓"         │
 └─────────────────────────────┬───────────────────────────────┘
                               │
                               ▼ (Scroll-Linked Spacetime Bridge)
 ┌─────────────────────────────────────────────────────────────┐
 │  ★ TIME WARP TRANSITION BRIDGE                              │
 │  - Starfield stars stretch into relativistic light trails   │
 │  - Warm amber spacetime tunnel glow (#f4a272 / #ff7b3d)     │
 │  - Parallax celestial speed indicators & phase coordinates  │
 └─────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  3. TIME MACHINE SECTION (#time-machine)                    │
 │  - Stage Header ("Watch the sky change over two years")     │
 │  - Genuine multi-epoch FITS player (5 canonical targets)    │
 │  - On-demand arbitrary RA/Dec IRSA SIA2 retrieval & viewer  │
 │  - 5 Comparison modes: Time-Lapse, Side-by-Side, Split,     │
 │    Blink, Signed Difference Map                             │
 │  - NO BOTTOM NAV                                            │
 │  - Section-End Action: "Continue to Labs ↓"                 │
 └─────────────────────────────┬───────────────────────────────┘
                               │ (Smooth continuous scroll)
                               ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  4. LABS SECTION (#labs)                                    │
 │  - Stage Header ("This is where discovery begins")          │
 │  - Sub-Tabs: [Discovery | Light Curves]                     │
 │  - Discovery Lab: Nested [Difference & Stacking | Journal]   │
 │    DAOStarFinder source extraction, 3-panel difference,     │
 │    noise-suppression stacking, My Discoveries catalog       │
 │  - Light Curve Lab: Photometric variability (R Leo, RW Aur, │
 │    Barnard's Star, WISE 0855) across MJD baselines          │
 │  - STICKY CONTEXTUAL BOTTOM NAV: [Discovery | Light Curves] │
 │  - Section-End Action: "Continue to Mission ↓"              │
 └─────────────────────────────┬───────────────────────────────┘
                               │ (Smooth continuous scroll)
                               ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  5. MISSION SECTION (#mission)                              │
 │  - Stage Header ("Meet the observatory mapping it all")     │
 │  - Interactive 3D spacecraft model with OrbitControls       │
 │  - Mission specification HUD (102 bands, 0.75–5.0µm, etc.)  │
 │  - Star-color anomaly training simulation (educational game)│
 │  - Guided science missions (Planet Nine, Brown Dwarfs, etc.)│
 │  - NO BOTTOM NAV                                            │
 │  - Section-End Action: Return to Top / Explorer / Time      │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Navigation & Sticky Bottom Bar Rules

A primary defect identified in earlier navigation models was navigation bar confusion and UI clutter. HORIZON enforces strict, unambiguous rules across all viewports:

| Section | Anchor ID | Top Nav Active | Contextual Bottom Nav | Section End Action |
| :--- | :--- | :--- | :--- | :--- |
| **Home** | `#home` | `Home •` | **Hidden** (Clean hero, zero bottom bars) | Door Cards ➔ Smooth scroll |
| **Explorer** | `#explorer` | `Explorer •` | **Visible**: `[Sky \| Object \| Spectral]` | "Continue to Time Machine ↓" |
| **Time Warp** | N/A | Transition | **Hidden** | Smooth acceleration |
| **Time Machine** | `#time-machine` | `Time Machine •` | **Hidden** (Maximizes FITS viewing canvas) | "Continue to Labs ↓" |
| **Labs** | `#labs` | `Labs •` | **Visible**: `[Discovery \| Light Curves]` | "Continue to Mission ↓" |
| **Mission** | `#mission` | `Mission •` | **Hidden** (Clean observatory overview) | "Return to Explorer" / "Back to Top" |

### Top Navigation Synchronization
The persistent top navigation bar (`Navbar.tsx`) contains exactly five primary destinations:
1. `Home`
2. `Explorer`
3. `Time Machine`
4. `Labs`
5. `Mission`

Clicking any destination executes smooth inertial scrolling directly to that section:
- If Lenis smooth scroll engine is loaded: `window.__lenis.scrollTo(element, { offset: -70, duration: 1.2 })`
- Fallback: `element.scrollIntoView({ behavior: 'smooth' })`
- Passive `IntersectionObserver` updates the active navigation dot and URL hash (`history.replaceState`) without triggering scroll feedback loops or re-renders.

---

## 3. Section Architecture & Sub-Tab Behavior

### 3.1 Explorer Section (`ExplorerSection.tsx`)
The Explorer section consolidates three astronomical workspaces into a single stage with internal sub-tabs:
- **Sky**: CDS Aladin Lite v3 WebGL celestial sphere streaming hierarchical HiPS tiles from NASA/IPAC IRSA and official SPHEREx DR1 all-sky cube layers.
- **Object**: Dedicated astronomical inspector for the 5 NASA challenge targets (Barnard's Star, WISE 0855, Epsilon Indi B, RW Aurigae, R Draconis) with Gaia DR3 proper motion vector overlays, WCS boundaries, and cutouts.
- **Spectral**: 102-channel infrared spectral cube viewer (0.75–5.00 µm) with continuous Wavelength Scan playback (500 ms automated stepping), molecular marker overlays, and DR1 order 5 HEALPix tile resolution (12.9 arcsec/pixel).

**Crucial Sub-Tab Guarantee:** Switching between `Sky`, `Object`, and `Spectral` updates the active workspace component instantly **without full-page reloads, without scroll-position resets, and without unmounting parent components**.

### 3.2 Spacetime Warp Transition Bridge (`TimeWarpTransition.tsx`)
Between the Explorer and Time Machine sections sits a dedicated scroll-linked spacetime transition:
- As the user scrolls through this zone, scroll progress ($0.0 \to 1.0$) dynamically drives `window.__horizonWarpFactor`.
- In `Starfield.tsx`, stars stretch into relativistic light trails radiating from the center of the viewport.
- A warm amber spacetime tunnel glow (`rgba(244, 162, 114, 0.15)`) intensifies and expands.
- As the user approaches the Time Machine workspace, the warp factor smoothly returns to zero, resolving into the crisp, calibrated multi-epoch workspace.

### 3.3 Time Machine Section (`TimeMachineSection.tsx`)
- Embeds the genuine scientific `TimeMachine.tsx` workspace.
- Supports all 5 canonical challenge targets with authentic multi-epoch Level 2 FITS observations across genuine 359-day and 365-day baselines.
- Features live on-demand SIA2 archive retrieval for arbitrary coordinates (e.g. RA 270°, Dec +4°).
- Offers 5 astronomical comparison modes: Time-Lapse Movie, Side-by-Side, Split Slider, Blink Mode, and Signed Difference Map.
- **Bottom Navigation is completely omitted**, giving maximum vertical screen space to the astronomical image canvases and analysis badges.

### 3.4 Labs Section (`LabsSection.tsx`)
The Labs section hosts two scientific analysis workspaces:
- **Discovery**:
  - Embedded stage sub-bar: `[Difference & Stacking | My Discoveries Journal]`.
  - *Difference & Stacking*: DAOStarFinder point-source detection, calibrated cross-epoch subtraction ($E_2 - E_1$), and noise-suppression stacking co-addition ($\times 1.73$ idealized $S/N$ gain).
  - *My Discoveries Journal*: Persistent candidate catalog, observation metadata inspector, displacement metric logger, and Markdown report export.
- **Light Curves**:
  - Interactive multi-epoch photometric light curve explorer for Mira variables (R Draconis), young stellar objects (RW Aurigae), and brown dwarfs (WISE 0855).
  - Magnitude ($m$), Flux ($\mu\text{Jy}$), and Time-Domain (MJD) unit switching.

### 3.5 Mission Section (`MissionSection.tsx`)
- Houses the interactive 3D `spherex.glb` spacecraft model with full OrbitControls.
- Mission statistics HUD (102 infrared channels, 0.75–5.0 $\mu\text{m}$ spectral range, 4 whole-sky passes, 2-year prime mission).
- Embedded stage sub-bar: `[Observatory & Training Simulation | Guided Science Missions]`.
- Interactive educational training simulation ("Train your eyes to spot spectral anomalies").
- Guided science missions with step-by-step challenges (Planet Nine search, Brown Dwarf confirmation, Asteroid tracking, Supernova discovery).
- Concluding actions: "Return to Sky Explorer", "Return to Time Machine", "Back to Top ↑".

---

## 4. Performance & Hardware Acceleration

### 4.1 WebGL & Three.js Lifecycle Management
Rendering multiple WebGL canvases (such as the 3D spacecraft, the Aladin celestial sphere, and background starfields) simultaneously can cause GPU memory pressure and frame drops.
- **Automatic Pause on Scroll:** In `Satellite3D.tsx`, an `IntersectionObserver` monitors viewport visibility. When the 3D satellite scrolls off-screen (`intersectionRatio === 0`), the internal `requestAnimationFrame` render loop is completely paused (`isVisible = false`).
- When scrolled back into view, the render loop resumes instantaneously with zero hitching.

### 4.2 Lenis Smooth Scroll Engine & Map Protection
Smooth scroll engines can interfere with embedded interactive canvases (such as celestial maps or pan-and-zoom plots). In `frontend/src/lib/hooks.ts`:
- Lenis is configured with a strict `prevent` filter:
```typescript
prevent: (node: HTMLElement) => {
  return (
    node.closest('.aladin-container') !== null ||
    node.closest('.aladin-box') !== null ||
    node.closest('[data-lenis-prevent]') !== null ||
    node.closest('.sky-map') !== null ||
    node.tagName === 'INPUT' ||
    node.tagName === 'SELECT' ||
    node.tagName === 'TEXTAREA'
  );
}
```
- This prevents mouse wheel zooming inside the Aladin Lite all-sky map or dragging range sliders from triggering window-level page scrolling.

---

## 5. URL Deep-Linking & State Preservation

HORIZON supports deep links to any specific section or sub-tab. When a user navigates directly to a URL, the application mounts the continuous layout and scrolls smoothly to the requested destination:

| Direct URL | Resulting Section | Active Sub-Tab | Query Params Preserved |
| :--- | :--- | :--- | :--- |
| `/` or `/home` | `#home` | N/A | None |
| `/explorer/sky` or `/explore` | `#explorer` | `sky` | Target/Layer selections |
| `/explorer/object` or `/objects` | `#explorer` | `object` | `?object=...` |
| `/explorer/spectral` or `/spectra` | `#explorer` | `spectral` | `?object=...`, channel index |
| `/time` or `/time-machine` | `#time-machine` | N/A | `?object=...`, `?view=...` |
| `/lab/discovery` or `/discovery-lab` | `#labs` | `discovery` | Candidate filters |
| `/lab/light-curves` or `/light-curves` | `#labs` | `light-curves` | Target selection |
| `/mission` or `/missions` | `#mission` | N/A | Mission ID |

**Zero Scientific Data Loss:** State within components (such as loaded FITS cutouts, extracted spectra, or selected candidates) is preserved during scrolling. The application never re-queries the archive or re-downloads FITS products simply because the user scrolled through another section.

---

## 6. Verification & Automated Test Status

- **Frontend Production Build:** `tsc -b && vite build` built successfully in 6.94 seconds with zero TypeScript or packaging errors.
- **Backend Scientific Test Suite:** 43 passed, 0 failed in 31.61 seconds (100% pass rate).
- **Automated Headless Journey:** 10 full-resolution screenshots captured across all sections verifying clean typography, correct sticky bottom bar behaviors, active top nav tracking, and smooth transitions.

---

## 7. Cinematic Scroll Choreography & Seamless Layout Repairs

### 7.1 Root Causes Identified & Fixed

| Issue Observed | Technical Root Cause | Architectural Correction |
| :--- | :--- | :--- |
| **Problem A: Abrupt Horizon Cutoff** | `.hero` had `min-height: 100svh; overflow: hidden;`. The circular 170vw horizon was clipped at the bottom container edge, causing a razor-sharp cut across the screen. | Changed `.hero` to `overflow-x: clip; overflow-y: visible;`. Added soft vertical gradient mask on `.horizon` and `.hero-atmosphere` layer (`height: 42vh`) that seamlessly blends the planetary glow into the persistent galaxy environment. |
| **Problem B: Giant Empty Areas** | `.amazing` had `min-height: 112vh; padding: 16vh var(--pad) 0;`. `.facts` had `padding: 14vh 0 8vh;`. `.doors` had `padding: 8vh 0 10vh;`. Empty spaces exceeded 1,000 vertical pixels. | Replaced `.amazing` with cohesive `.mission-intro` (`padding: 10vh 0 4vh; height: 678px; max-w-6xl mx-auto`). Normalized `.facts` (`6vh`) and `.doors` (`4vh`), reducing page height by 453px while eliminating all dead space. |
| **Problem C: Disconnected Ribbon** | Animated `<Ribbon />` sat in an isolated 140px container positioned at `top: 50%` across the empty 112vh section, floating alone in the void. | Integrated `<Ribbon className="mission-ribbon my-6" amp={22} />` directly between the mission headline and the scientific HUD grid, serving as an organic visual connector. |
| **Problem D: Poor Statistics Composition** | `.am-r` and `.am-cards` were forced into extreme bottom-left and bottom-right corners (`position: absolute; bottom: 9vh`), leaving an enormous hollow middle. | Replaced with centered, unified 4-card HUD grid (`grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6`): ClockCard (real-time UTC), ChannelsCard (102 bands), StatCard (Wavelength range), and StatCard (All-sky surveys). |
| **Problem E: Entire Blank Viewport (Invisible Content)** | `.rv` CSS rule was set to `opacity: 0; transform: translateY(30px); filter: blur(6px);`. `useReveal()` was never called in `Home.tsx`, so elements remained at `opacity: 0` permanently. | Refactored `.rv` to safe progressive enhancement (default `opacity: 1`). Only fades in when `.js-reveal` is active. Immediate viewport check on mount. Called `useReveal()` in `Home.tsx` and `ContinuousHorizonApp.tsx`. Supports `prefers-reduced-motion`. |

### 7.2 Choreographed Scroll Timeline

1. **Scene 1 — The Arrival (Hero):**
   - Left: Tag, headline, description, primary CTAs ("Explore the Sky ↓", "Time Machine ↓"), scroll hint.
   - Right: Interactive 3D SPHEREx satellite (`Satellite3D`).
   - Bottom: Planetary horizon with soft atmospheric glow.
   - Scroll Parallax: As user scrolls down, headline gently fades (`calc(var(--hero-opacity, 1))`), satellite ascends gracefully (`calc(var(--py) - var(--hero-scroll) * 70px)`), and planetary glow softly expands downward. Full reverse restoration on upward scroll.
2. **Scene 2 — Meet the Mission ("This is our amazing sky"):**
   - Centered headline and lead explanation card.
   - Flowing animated ribbon.
   - Cohesive 4-card HUD grid centered in the viewport.
3. **Scene 3 — By the Numbers:**
   - 4 count-up metrics (102 channels, 5.0 µm, 4× passes, 2 yrs) with reliable intersection observers.
4. **Scene 4 — Explore the Possibilities:**
   - 4 destination doors (01 Explore the sky, 02 Travel in time, 03 Make a discovery, 04 Join the mission).
5. **Scene 5 — Gateway into Explorer:**
   - Vertical trajectory line with celestial badge and direct CTA button smoothly flowing into `#explorer`.
6. **Time Warp Bridge:**
   - Tightened from 45vh to 26vh (`py-8 my-2`). Relativistic star acceleration and amber continuum glow seamlessly bridging Explorer into Time Machine.

