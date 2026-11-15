# SPHEREx HORIZON — Journey Transitions & Workspace Choreography

## Overview

The SPHEREx HORIZON application connects its continuous five-chapter storytelling Journey to dedicated scientific workspaces through a unified, cinema-grade transition architecture. This document details the implementation and verification of inter-chapter flow and workspace travel choreography.

---

## 1. Inter-Chapter Animated Snake Ribbons

Between each consecutive chapter on the Journey page, a continuous SVG animated wave ribbon connects the visual environments (`frontend/src/components/ui/SnakeRibbon.tsx`):

| Transition | Ribbon Text & Copy | Gradient Palette | Wave Characteristics |
| :--- | :--- | :--- | :--- |
| **Ch 01 (Home) $\to$ Ch 02 (Explorer)** | `LET'S EXPLORE ✦ BEYOND THE VISIBLE ✦ DISCOVER THE INFRARED UNIVERSE` | Gold (`#F4A272`) $\to$ Indigo (`#818CF8`) | Seamless sine wave, $A = 14\text{px}$, $\lambda = 340\text{px}$ |
| **Ch 02 (Explorer) $\to$ Ch 03 (Time Machine)** | `THROUGH SPACE & TIME ✦ THE UNIVERSE DOESN'T STAND STILL ✦ REWIND THE SKY` | Indigo (`#818CF8`) $\to$ Amber (`#FF7B3D`) | Seamless sine wave, $A = 14\text{px}$, $\lambda = 340\text{px}$ |
| **Ch 03 (Time Machine) $\to$ Ch 04 (Discovery Lab)** | `EVERY CHANGE TELLS A STORY ✦ INVESTIGATE THE EVIDENCE ✦ DISCOVER MORE` | Amber (`#FF7B3D`) $\to$ Graphite (`#94A3B8`) | Seamless sine wave, $A = 14\text{px}$, $\lambda = 340\text{px}$ |
| **Ch 04 (Discovery Lab) $\to$ Ch 05 (Missions)** | `YOUR DISCOVERY BEGINS ✦ EXPLORE THE UNKNOWN ✦ THE NEXT DISCOVERY COULD BE YOURS` | Graphite (`#94A3B8`) $\to$ Gold (`#F4A272`) | Seamless sine wave, $A = 14\text{px}$, $\lambda = 340\text{px}$ |

### Technical Execution
- **Seamless Wave Period:** The path `d` pattern repeats exactly every $340\text{px}$, allowing infinite horizontal looping via CSS `@keyframes snake-ribbon-flow` translating from $X = 0$ to $X = -340\text{px}$ over 14 seconds without any visible jitter or seams.
- **Accessibility:** Respects `@media (prefers-reduced-motion: reduce)`, pausing continuous translation while preserving the subtle curved typographic display.
- **Atmospheric Blending:** Each ribbon's gradient matches the exit atmosphere of the preceding chapter and the entrance atmosphere of the succeeding chapter, creating an organic visual blend.

---

## 2. Chapter-Colored Workspace Travel Overlay

When launching a dedicated workspace (e.g., from Explorer to Sky Explorer, or Time Machine to Time Machine Workspace), a non-intrusive cinematic travel sequence bridges the page navigation:

### Choreography & Timing
- **Total Duration:** $\sim 950\text{ms}$
- **Phase 1: Departure Acceleration ($0 - 420\text{ms}$)**
  - Ambient radial glow deepens to the chapter's dominant theme color.
  - Outward relativistic star streaks radiate from the viewport center.
  - Reticle and screen text are completely omitted to prevent visual clutter and artificial delay.
- **Phase 2: Route Execution ($420\text{ms}$)**
  - Router navigates to the target workspace route.
  - Workspace DOM mounts with window scroll set immediately to top (`scrollY = 0`).
- **Phase 3: Arrival Deceleration ($420 - 950\text{ms}$)**
  - Radial flash resolves gently into the workspace header.
  - Overlay fades to $0$ opacity, revealing the scientific workspace.

### Color Palettes by Chapter
- **Home / Spacecraft:** Deep warm gold radial aura (`rgba(244, 162, 114, 0.45)`).
- **Explorer:** Deep cosmic indigo / cyan streak aura (`rgba(99, 102, 241, 0.50)`).
- **Time Machine:** High-contrast amber / orange warp field (`rgba(255, 123, 61, 0.55)`).
- **Discovery Lab:** Analytical slate / cyan streak aura (`rgba(56, 189, 248, 0.45)`).
- **Missions:** Rich stellar gold aura (`rgba(244, 162, 114, 0.50)`).

---

## 3. Lossless Return to Journey with Scroll Restoration

Returning to the Journey from any workspace via the "Back to Journey" button (`journeyState.ts`) follows a complementary reverse sequence:
1. **Journey Origin Tracking:** `journeyState.recordJourneyPosition(chapterId, scrollY)` preserves the exact vertical pixel scroll offset and originating chapter ID prior to departure.
2. **Reverse Inward Streaks:** The transition overlay plays inward contracting star streaks representing return deceleration.
3. **Covered Scroll Restoration:** While the transition overlay is completely opaque at $t \approx 300\text{ms}$, the window scroll is restored instantly to the exact saved $Y$ position (`window.scrollTo({ top: savedY, behavior: 'instant' })`) and the URL hash is set to the originating chapter (e.g., `/#time-machine`).
4. **Zero Flash of Top/Home:** The user never experiences an intermediate flash of the Home chapter or scroll jumping.
