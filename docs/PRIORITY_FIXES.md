# SPHEREx HORIZON — Prioritized Issues & Remediation Plan

**Project:** SPHEREx HORIZON  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026  
**Audit Date:** November 14, 2026  

---

## 1. Issue Overview & Severity Definitions

- **P0 — Critical:** Issues that make the core challenge solution broken, scientifically invalid, or based on fabricated data. Blocks NASA Space Apps submission.
- **P1 — High:** Issues that seriously affect scientific credibility or core user experience.
- **P2 — Medium:** Issues that reduce functionality or usability but do not invalidate the central demonstration.
- **P3 — Optional:** Enhancements that can be postponed until post-competition roadmap.

---

## 2. P0 — Critical Issues (Must Fix Before Submission)

### Issue P0-01: Disconnected FITS Cutout Pipeline in Image Presentation
- **Severity:** P0 — Critical
- **Blocks Submission:** **YES.** NASA Space Apps challenge explicitly requires displaying images captured by the SPHEREx mission.
- **Evidence:**
  In `backend/app/routers/processing.py` (lines 22-44), `/api/processing/preview` constructs a $256 \times 256$ array with `np.random.normal()` and adds an artificial 2D Gaussian PSF with $\sigma=3.5$. In `backend/app/routers/comparison.py` (lines 41-78), `/api/comparison/align` generates two synthetic Gaussian arrays and applies an artificial shift. Downloaded authentic 60 MB FITS files are completely ignored during image rendering.
- **Affected Files:**
  - `backend/app/routers/processing.py`
  - `backend/app/routers/comparison.py`
  - `frontend/src/pages/TimeMachine.tsx`
  - `frontend/src/pages/ObjectDetail.tsx`
- **Suggested Correction:**
  1. In `processing.py`, update `generate_preview` to accept `obs_id` or `fits_url`.
  2. If a local FITS file is not cached, invoke `fits_service.download_fits(fits_url)`.
  3. Load the calibrated float32 science image using `fits_service.get_image_data_and_wcs()`.
  4. Extract a centered $120'' \times 120''$ cutout using `image_processing_service.extract_cutout()`.
  5. Render the authentic cutout array to base64 PNG using `image_processing_service.render_image_to_base64()` with Astropy `AsinhStretch`.
  6. In `TimeMachine.tsx`, fetch cutouts for the two selected observation IDs and display real infrared observation visits.
- **Dependencies:** `fits_service.py`, `image_processing_service.py`, `irsa_service.py`.

---

### Issue P0-02: Fabricated Proper Motion Displacement ($34.27''$ for Barnard's Star)
- **Severity:** P0 — Critical
- **Blocks Submission:** **YES.** Presenting an unphysical $34.27''$ displacement in 57 days severely compromises scientific credibility.
- **Evidence:**
  `backend/app/routers/comparison.py` (lines 66-68) injects an artificial pixel shift:
  ```python
  shift_x = 4.2 if is_moving else 0.0
  shift_y = 3.5 if is_moving else 0.0
  ```
  This $5.47\text{ px}$ shift at $6.2''\text{/px}$ produces an artificial $\sim 34''$ displacement. In reality, Barnard's Star moves $10.39''\text{/yr}$, which equates to only $\approx 1.62''$ across 57 days. The false number is automatically recorded in `backend/data/discoveries.json`.
- **Affected Files:**
  - `backend/app/routers/comparison.py`
  - `backend/app/services/difference_service.py`
  - `backend/data/discoveries.json`
- **Suggested Correction:**
  1. Remove hardcoded `shift_x` and `shift_y` logic from `comparison.py`.
  2. When comparing two observations, reproject the later FITS cutout onto the celestial coordinate grid of the earlier FITS cutout using `alignment_service.reproject_to_common_grid()`.
  3. Run `difference_service.detect_candidate_changes()` on the genuine reprojected difference array.
  4. For moving targets with long baselines (e.g. 6-12 months), report the real image-derived displacement. For short baselines where motion is sub-pixel ($<6.15''$), report that motion is below single-pixel resolution and display the predicted proper motion vector.
  5. Clean fabricated entries from `backend/data/discoveries.json`.
- **Dependencies:** `alignment_service.py`, `difference_service.py`.

---

### Issue P0-03: Schema Validation Crash on `/api/archive/search` (HTTP 500)
- **Severity:** P0 — Critical
- **Blocks Submission:** **YES.** The dedicated archive search endpoint crashes with an unhandled exception.
- **Evidence:**
  FastAPI throws `ResponseValidationError: 18 validation errors` on `GET /api/archive/search`. The response model `ArchiveProductRecord` in `backend/app/schemas/archive_schema.py` defines required fields:
  - `s_ra: float`
  - `s_dec: float`
  - `wavelength_min_m: float`
  - `wavelength_max_m: float`
  - `t_min_mjd: float`
  - `t_max_mjd: float`
  However, `irsa_service.py` builds dictionaries with keys: `ra`, `dec`, `wavelength_min_um`, `wavelength_max_um`, `mjd_start`, `mjd_end`.
- **Affected Files:**
  - `backend/app/schemas/archive_schema.py`
  - `backend/app/routers/archive.py`
- **Suggested Correction:**
  Update `ArchiveProductRecord` in `archive_schema.py` to match the dictionary keys produced by `irsa_service.py` or define aliases using Pydantic `Field(validation_alias=...)`:
  ```python
  class ArchiveProductRecord(BaseModel):
      id: str
      obs_id: str
      collection: str
      target_name: Optional[str] = None
      ra: float
      dec: float
      bandpass: str
      wavelength_min_um: Optional[float] = None
      wavelength_max_um: Optional[float] = None
      mjd_start: Optional[float] = None
      mjd_end: Optional[float] = None
      date_obs: Optional[str] = None
      exposure_time_s: Optional[float] = None
      access_url: Optional[str] = None
      fits_url: Optional[str] = None
      dataproduct_type: str = "image"
      calib_level: int = 2
  ```
- **Dependencies:** None.

---

## 3. P1 — High-Priority Issues (Must Fix for Scientific Credibility)

### Issue P1-01: Missing Celestial Coordinate Range Validation & ADQL Injection Risk
- **Severity:** P1 — High
- **Blocks Submission:** No (fails on malicious/edge inputs, but functional for normal use).
- **Evidence:**
  `GET /api/observations?ra=999&dec=999` succeeds with HTTP 200 and passes coordinates directly into the ADQL query:
  `WHERE CONTAINS(POINT('ICRS', s_ra, s_dec), CIRCLE('ICRS', 999, 999, 0.75)) = 1`
  Furthermore, `band_clause = f"AND energy_bandpassname = '{bandpass}'" if bandpass else ""` directly concatenates unvalidated string parameters into ADQL.
- **Affected Files:**
  - `backend/app/routers/observations.py`
  - `backend/app/routers/archive.py`
  - `backend/app/services/irsa_service.py`
- **Suggested Correction:**
  1. Add Pydantic query validation:
     `ra: float = Query(..., ge=0.0, le=360.0)`
     `dec: float = Query(..., ge=-90.0, le=90.0)`
     `radius_deg: float = Query(0.5, gt=0.0, le=5.0)`
  2. Validate `bandpass` against an allowed whitelist: `["SPHEREx-D1", "SPHEREx-D2", "SPHEREx-D3", "SPHEREx-D4", "SPHEREx-D5", "SPHEREx-D6"]`.
- **Dependencies:** FastAPI Query validation.

---

### Issue P1-02: Hardcoded Photometric Light Curves
- **Severity:** P1 — High
- **Blocks Submission:** No.
- **Evidence:**
  In `backend/app/services/lightcurve_service.py` (lines 12-98), all photometric points for R Draconis, RW Aurigae, Barnard's Star, and WISE 0855 are hardcoded dictionaries.
- **Affected Files:**
  - `backend/app/services/lightcurve_service.py`
  - `frontend/src/pages/LightCurves.tsx`
- **Suggested Correction:**
  1. In the UI, add an explicit scientific badge: `"Calibrated Literature Benchmark (AAVSO / SIMBAD / SPHEREx Calibration Target)"` to distinguish curated reference time-series from real-time aperture photometry.
  2. Implement an on-demand aperture photometry routine in `fits_service.py` using `photutils.aperture.CircularAperture` to measure fluxes across multiple cached Level 2 FITS cutouts when available.
- **Dependencies:** `photutils.aperture`.

---

### Issue P1-03: Synthetic Continuum Formula in Spectral Explorer
- **Severity:** P1 — High
- **Blocks Submission:** No.
- **Evidence:**
  `frontend/src/pages/SpectralExplorer.tsx` (lines 147-155) uses a Gaussian continuum curve `relativeFlux = Math.max(0.15, 0.85 * Math.exp(-((wl - 1.4)**2) / 0.8) + 0.15)` because `/api/spectra/{object_id}` returns `flux_uJy: null`.
- **Affected Files:**
  - `frontend/src/pages/SpectralExplorer.tsx`
  - `backend/app/services/spectral_service.py`
- **Suggested Correction:**
  1. For targets with downloaded Level 2 spectral images across different bands (e.g. D1, D2, D4, D5), compute the aperture flux at the target coordinates and populate `flux_uJy`.
  2. In `SpectralExplorer.tsx`, clearly distinguish between:
     - Real measured photometric points (with error bars).
     - The background theoretical blackbody curve.
- **Dependencies:** `fits_service.py`, `photutils`.

---

## 4. P2 — Medium-Priority Issues

### Issue P2-01: Missing Multi-Epoch Playback Sequence ($N > 2$)
- **Severity:** P2 — Medium
- **Evidence:**
  `TimeMachine.tsx` compares only pairs ($N=2$). There is no chronological timeline player or time-lapse scrubber across multiple observation dates.
- **Remedy:** Add a frame slider that cycles through all available observation epochs chronologically ($N=3, 5, 8$).

### Issue P2-02: Missing `.env.example` Templates
- **Severity:** P2 — Medium
- **Evidence:** Neither `frontend/` nor `backend/` provides `.env.example`.
- **Remedy:** Add `frontend/.env.example` (`VITE_API_BASE_URL=http://localhost:8000/api`) and `backend/.env.example`.

### Issue P2-03: Dichroic Gap Display in Spectral Explorer
- **Severity:** P2 — Medium
- **Evidence:** Channels 51 and 52 near $2.42\ \mu\text{m}$ are rendered with active continuum bars rather than showing an instrument gap marker.
- **Remedy:** In `SpectralExplorer.tsx`, add an explicit `isDichroicGap` check for channels 51 and 52, rendering a distinctive hatched or blank gap pattern.

---

## 5. P3 — Optional Enhancements (Post-Competition Roadmap)

- **Issue P3-01:** Direct ingestion of All-Sky 102-channel FITS Cubes (`spherex_dr1_cube`).
- **Issue P3-02:** Live SIMBAD / Gaia DR3 TAP cross-matching for arbitrary user-entered coordinates beyond the 5 curated targets.
- **Issue P3-03:** Live automated JPL Horizons ephemeris query for moving Solar System asteroids.
- **Issue P3-04:** AI-assisted anomaly detection ranking in Discovery Lab.
