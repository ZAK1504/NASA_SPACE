# SPHEREx HORIZON — Coordinated Cinematic Animation & Transition Architecture

**Project:** SPHEREx HORIZON — Interactive Cosmic Discovery Platform  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026 — Planet X and SPHEREx  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Coordinated Scroll Progress Architecture

Rather than independent, competing scroll listeners or generic CSS fade-ins, HORIZON coordinates animations through a unified, high-performance scroll architecture:

### Global & Chapter Scroll Variables
1. **`--p` (0..1):** Normalized document scroll progress written directly to `<html>` by `useScrollVars` in `lib/hooks.ts`.
2. **`--hero-scroll` (0..1):** Local progress over the first viewport height ($y \le 0.85 \times \text{vh}$).
3. **`--hero-opacity` (1..0):** Inverse fade curve ($1 - 1.35 \times \text{heroP}$).
4. **`window.__horizonWarpFactor` (0..1):** Dynamically set in `JourneyPage.tsx` based on the intersection geometry of the `#time-machine` chapter.
5. **No Full App Re-renders:** Driven via `requestAnimationFrame` loops, updating CSS variables on `<html>` and Canvas context transforms directly.

---

## 2. Four Unique Chapter Transitions

Each transition features a distinct motion language tailored to the narrative progression:

### 1. Home → Explorer (`HomeToExplorerTransition.tsx`)
- **Theme:** Departure from instrument into the vast infrared universe.
- **Motion:** Upward-drifting particles (`@keyframes driftUp`) with staggered delays, transitioning the atmosphere from warm golden amber (`rgba(220,150,60,0.05)`) into deep indigo (`rgba(60,50,200,0.08)`).
- **Height:** 20vh buffer.

### 2. Explorer → Time Machine (`TimeWarpTransition.tsx`)
- **Theme:** Relativistic spacetime acceleration into time-domain astronomy.
- **Motion:** As the user scrolls into Time Machine, `window.__horizonWarpFactor` dynamically ramps from 0 to 1, causing the background starfield in `Starfield.tsx` to accelerate outward into luminous radial light streaks with an amber warp tunnel glow.
- **Height:** 35vh buffer.

### 3. Time Machine → Labs (`TimeMachineToLabsTransition.tsx`)
- **Theme:** Deceleration and scientific freeze-frame focus.
- **Motion:** Starfield warp drops to 0; horizontal scan lines (`@keyframes scanReveal`) expand across the viewport, shifting the lighting from warm amber into neutral graphite/charcoal.
- **Height:** 18vh buffer.

### 4. Labs → Mission (`LabsToMissionTransition.tsx`)
- **Theme:** Expanding celestial atlas into citizen discovery.
- **Motion:** Golden sunrise horizon radial glow rising from the bottom edge (`rgba(220,160,60,0.15)`), opening into vast celestial depth.
- **Height:** 20vh buffer.

---

## 3. Homepage Spacecraft Flyby Effect

In `ChapterHome.tsx`:
- The right-side spacecraft column translates diagonally with scroll:
  `transform: translateX(calc(var(--hero-scroll, 0) * 40px - 2.5rem)) translateY(calc(var(--hero-scroll, 0) * 20px + 2rem))`
- The model scales down subtly ($1 - 0.08 \times \text{heroP}$) and dims ($1 - 0.65 \times \text{heroP}$), creating the impression of moving past the satellite into space.
- The left-side headline column recedes upward:
  `transform: translateY(calc(var(--hero-scroll, 0) * -30px))` with opacity `calc(1 - var(--hero-scroll, 0) * 1.3)`.

---

## 4. Performance & Resource Lifecycle

- **Visibility-Aware Rendering:** `Satellite3D.tsx` uses an `IntersectionObserver` to pause Three.js rendering loops when scrolled out of view.
- **Canvas Auto-Throttle:** `ExplorerShowcaseVisual.tsx` auto-rotates at 1°/min on rAF and halts drag calculations on mouse-up.
- **Bounded DPR:** Canvas elements clamp device pixel ratio to $\min(\text{DPR}, 2)$ to eliminate GPU fill-rate bottlenecks on Retina screens.
- **Lenis Smooth Scroll Protection:** Aladin Lite WebGL maps and scientific inputs are excluded via `prevent` callbacks to prevent scroll hijacking.
- **Accessibility:** All intensive animations respect `@media (prefers-reduced-motion: reduce)`, instantly falling back to static visual layouts.
