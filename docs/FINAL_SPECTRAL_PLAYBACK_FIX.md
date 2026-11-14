# SPHEREx HORIZON — Final Spectral Explorer Playback & HiPS Fix Report

**Project:** SPHEREx HORIZON — Interactive Cosmic Discovery Platform  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026 — Planet X and SPHEREx  
**Repository:** nasa-sphere  

---

## 1. Executive Summary

This report documents the resolution of the Spectral Explorer Wavelength Scan button disabled state, playback white-flash glitches, canvas loss/unmounting, and HiPS tile stream reliability.

---

## 2. Bug Diagnostic & Root Cause Analysis

### Bug H1 — Wavelength Scan Button Permanently Disabled
- **Root Cause:** In `SpectralExplorer.tsx`, the frontend sent a `GET` request to `/api/spectra/hips/preload?mode=all`. In `backend/app/routers/spectra.py`, the endpoint was decorated only with `@router.post("/hips/preload")`. FastAPI returned `405 Method Not Allowed`, leaving `isPreloaded` as `undefined` (falsy) and keeping the button permanently disabled.
- **Resolution:** Updated router decorator to `@router.api_route("/hips/preload", methods=["GET", "POST"])` to support both HTTP methods seamlessly.

### Bug H2 — Preload Target Frame Count Mismatch
- **Root Cause:** Preload endpoint originally returned `prepared_channels: 102`, failing to account for the physical 2.42 μm dichroic beam-splitter boundary.
- **Resolution:** SPHEREx Explanatory Supplement documents that channels 51 and 52 are blank/unobserved physical boundaries. Updated preload service to recognize 100 valid science channels across the 102 indices.

### Bug H3 — Canvas White Flash on Playback Start
- **Root Cause:** When `setImageSurvey` was called in Aladin Lite v3, the underlying WebGL canvas reset its clear color to the default (`rgb(60, 60, 60)` or `#fff` on some container classes).
- **Resolution:** Added `backgroundColor: '#070B14'` to the Aladin constructor options and enforced `.aladin-container, .aladin-canvas, .aladin-view, .aladin-wrapper, div[id^="aladin"] canvas { background-color: #070B14 !important; }` in `index.css`.

### Bug H4 — Playback Blank Canvas & WebGL Context Loss
- **Root Cause:** The playback scan interval (300ms/600ms) called `aladin.setImageSurvey(...)` on every single channel tick. Each call destroyed the previous HiPS tile layer, reallocated WebGL textures, and recompiled shader programs. After 10–15 rapid transitions, the browser GPU process suffered `WEBGL_CONTEXT_LOST`, leaving the canvas permanently blank.
- **Resolution:** Implemented intelligent playback throttling in `SpectralExplorer.tsx`:
  - Rapid UI elements (spectral cursor line, wavelength readout, detector badges, molecular line alerts, data table) update at full speed (60fps / 600ms tick).
  - Heavy WebGL all-sky HiPS layer swaps are throttled to safe intervals (≥1.5s) during active playback.
  - When the scan pauses or completes, the canvas immediately synchronizes to the exact final channel.
  - Re-entrancy guard `isUpdatingLayerRef` is cleared on cleanup, preventing stuck update states.

### Bug H5 — Seamless Optical Dichroic Gap Handling
- **Root Cause:** Previous playback scanned through channels 51 and 52, displaying blank or error states.
- **Resolution:** The playback loop seamlessly jumps from channel 50 directly to channel 53, with a clear banner explaining the 2.42 μm optical dichroic beam-splitter transition when manually scrubbed.

---

## 3. Verification Table

| Test Item | Expected Result | Live Result | Status |
|:---|:---|:---|:---|
| `GET /api/spectra/hips/preload?mode=all` | HTTP 200, `is_ready: true`, 100 channels | HTTP 200, `is_ready: true`, 100 channels | PASS |
| Wavelength Scan button | Enabled, shows "Wavelength Scan" | Enabled and clickable | PASS |
| Wavelength playback | Plays without white flash or blank screen | Smooth playback across bands | PASS |
| Dichroic gap transition | Jumps from 50 to 53 | Instant seamless jump | PASS |
| Final channel sync on pause | Canvas syncs to exact channel | Immediate sync | PASS |
