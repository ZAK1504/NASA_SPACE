# SPHEREx HORIZON — Scientific Onboarding Guide

## Overview

SPHEREx HORIZON incorporates an interactive, non-intrusive onboarding tour system built on Driver.js (`frontend/src/hooks/useGuidedTour.ts` and `frontend/src/components/tutorial/tourDefinitions.ts`). It welcomes new users and student researchers with clear explanations of astronomical controls without blocking expert workflows.

---

## 1. Core Principles

1. **Focus on "Why":** Steps explain *why* scientific controls exist (e.g., explaining why band cycling isolates methane absorption, or why blinking frames uncovers high proper motion) rather than merely pointing to buttons.
2. **Explicit Semantic Targeting:** All tour steps bind strictly to explicit `data-tour="<step-id>"` DOM attributes attached to functional components.
3. **Non-Intrusive Lifecycle:** Automatic tours run exactly once per workspace per browser session, and users have immediate one-click options to skip the current tour or skip all automatic tours for the entire session.
4. **Always Replayable:** A prominent "Tour" button in the TopBar lets users relaunch the relevant guide at any time on demand.

---

## 2. Centralized Tour Registry

Tours are registered in `frontend/src/components/tutorial/tourDefinitions.ts` with structured definitions:

| Tour ID | Workspace Route | Canonical Spotlight Elements | Key Scientific Educational Focus |
| :--- | :--- | :--- | :--- |
| `sky-explorer` | `/explore` | `sky-survey-select`, `sky-quickjump`, `sky-target-search`, `sky-inspect-button`, `sky-map` | Explains HiPS all-sky projections, SPHEREx DR1 mosaics, cross-matching coordinates with SIMBAD/NED. |
| `object-explorer` | `/object/:id` | `viewer-astrometry`, `object-spectra-link` | Explains proper motion vectors ($(\mu_\alpha, \mu_\delta)$), epoch parallax, and spectral energy distributions. |
| `spectral-explorer` | `/spectral-explorer` | `spectral-slider`, `spectral-chart`, `spectral-line-tags` | Explains SPHEREx 102 continuous bands ($0.75 - 5.0\ \mu\text{m}$), ices ($\text{H}_2\text{O}, \text{CO}_2, \text{CO}$), and dichroic gaps. |
| `time-machine` | `/time-machine` | `time-target-select`, `time-epoch-slider`, `time-playback-controls`, `time-difference-toggle`, `time-telemetry-motion` | Explains multi-epoch celestial blinking, transient detection, subtraction residual analysis, and genuine proper motion tracking. |
| `discovery-lab` | `/discovery-lab` | `image-stacking-panel`, `difference-imaging-panel`, `lab-action-execute`, `stacking-controls` | Explains co-addition signal-to-noise improvement ($S/N \propto \sqrt{N}$) and Point Spread Function (PSF) matching. |
| `discovery-journal`| `/my-discoveries` | `journal-export`, `journal-list`, `discovery-card` | Explains research logging, transient classification, notes export, and scientific recordkeeping. |
| `light-curves` | `/light-curves` | `light-curve-target`, `light-curve-chart`, `light-curve-provenance` | Explains photometric time-series, stellar pulsation periods (e.g. Mira variables), and instrumental error bars. |
| `missions` | `/missions` | `missions-catalog`, `mission-briefing`, `mission-launch-btn` | Explains challenge objectives, research milestones, and guided citizen science tasks. |
| `training-game` | `/training-game` | `training-canvas`, `training-controls` | Interactive classification training distinguishing real celestial transients from cosmic ray hits and detector artifacts. |

---

## 3. Session Tracking & User Controls

Session state is persisted in `sessionStorage` under the key `horizon_tour_session_v1`:

```json
{
  "completedTours": ["time-machine", "sky-explorer"],
  "skippedTours": [],
  "skipAllAutomaticTours": false
}
```

### Auto-Launch Logic
- When a workspace mounts, `useGuidedTour` waits $1100\text{ms}$ (allowing the workspace transition overlay to finish and all DOM nodes to render).
- If `skipAllAutomaticTours` is `false` and the workspace's tour has not yet been completed or skipped in this session, the tour launches automatically.

### User Skip Options
- **"Skip Tour":** Injected into Driver.js popovers as a primary action button; immediately dismisses the active tour and records it in `skippedTours`.
- **"Skip all automatic tours for this session":** Injected as a subtle link in the popover footer; immediately suppresses all future automatic tour triggers across all workspaces for the remainder of the session.
- **Manual Replay:** Clicking the "Tour" button in `TopBar.tsx` invokes `startTour(tourId, true)` (force-start flag overrides skip settings), ensuring tutorials are never permanently lost.
