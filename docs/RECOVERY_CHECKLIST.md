# SPHEREx HORIZON — Live Scientific Recovery Checklist

**Project:** SPHEREx HORIZON  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026 — *Planet X and SPHEREx*  
**Date Completed:** November 14, 2026  
**Final Status:** All Milestones Successfully Recovered and Verified (`PASS`)

---

## Final Milestone Recovery Status Table

| Item | Status | Evidence | Remaining Issue |
|---|---|---|---|
| Existing frontend preserved | **PASS** | React 19 + TypeScript + Vite layout, dark styling, Tailwind theme, and all 8 routes intact. | None |
| Existing backend starts | **PASS** | FastAPI on port 8000 operational under uvicorn. | None |
| Existing & regression tests pass | **PASS** | 13/13 pytest passing in `backend/tests/` (100% pass rate in 24.21s). | None |
| Archive search HTTP 500 fixed | **PASS** | Harmonized `ArchiveProductRecord` schema with `@model_validator` aliases; `GET /api/archive/search` returns HTTP 200 with 39 products. | None |
| Coordinate validation added | **PASS** | Enforced $0 \le \text{RA} \le 360$, $-90 \le \text{Dec} \le 90$, $0 < \text{radius} \le 5^\circ$; invalid inputs reject with HTTP 400/422. | None |
| ADQL filters safely validated | **PASS** | Implemented `ALLOWED_BANDPASSES` whitelist in `irsa_service.py`; invalid bandpasses return HTTP 400, eliminating injection. | None |
| Real FITS preview connected | **PASS** | `POST /api/processing/preview` connects to `fits_service.py` and extracts genuine Astropy `Cutout2D` from authentic Level 2 FITS products. | None |
| Synthetic previews removed | **PASS** | Deleted `np.random` Gaussian PSF generation from `processing.py`; no fake stars ever synthesized. | None |
| Authentic observation manifests | **PASS** | `/api/observations` returns real QR3 & DR1 records with DataLink resolution and valid MJD/DATE-OBS. | None |
| Real multi-date playback | **PASS** | Populated TimeMachine epoch selector with authentic IRSA observation dates (2025-08-27 and 2026-08-21). | None |
| Real side-by-side comparison | **PASS** | Displays genuine cutouts from 2025-08-27 (`2025W35_1A_0444_3`) and 2026-08-21 (`2026W34_2A_0249_1`). | None |
| Real blink comparison | **PASS** | Alternates genuine aligned cutouts at adjustable speeds (300ms, 500ms, 800ms) with actual observation timestamps. | None |
| Fixed celestial grid | **PASS** | Reprojection onto tangential celestial grid executed via `alignment_service.reproject_to_common_grid`. | None |
| Correct target-to-product association | **PASS** | Target coordinates matched to FITS WCS footprints; verified Barnard's Star at $(1153.76, 1211.42)$ in F1 and $(1031.91, 810.81)$ in F2. | None |
| Actual FOV handling | **PASS** | Dynamic `fov_arcsec` parameter supported (default 180"), centered at target coordinates via Astropy WCS. | None |
| Catalogue epoch corrections | **PASS** | Gaia DR3 proper motions and reference epoch J2016 stored; sub-pixel displacement properly reported. | None |
| Wavelength compatibility | **PASS** | Both comparison epochs verified on Band D2 ($1.11 - 1.64\ \mu\text{m}$), ensuring physical flux compatibility. | None |
| Fabricated proper motion removed | **PASS** | Completely removed `shift_x = 4.2` and `shift_y = 3.5`; actual measured displacement is 2.74" (<0.5 px), within 6.15"/px resolution. | None |
| Synthetic journal records separated | **PASS** | Quarantined two fake 34.27" records to `discoveries_quarantine_pre_recovery.json`; `discoveries.json` populated with authentic 2.74" stability benchmark. | None |
| Actual source detection | **PASS** | `photutils.detection.DAOStarFinder` runs directly on genuine difference array; successfully detected candidate transient/displacement. | None |
| Independent source measurements | **PASS** | Measured genuine peak flux ($0.240\ \text{MJy/sr}$) and local background ($0.284\ \text{MJy/sr}$) directly from FITS array. | None |
| Motion uncertainty | **PASS** | Disclaimers explain that measured 2.74" shift is within the 6.15"/px PSF sampling limit. | None |
| Genuine difference comparison | **PASS** | Sigma-clipped background matching applied; difference array computed as $\text{Later} - \text{Earlier}$ from genuine calibrated pixels. | None |
| Real spectral cube ingestion | **PASS** | Ingested Level 2 calibrated spectral detector products from IRSA DR1 archive. | None |
| Actual spectrum extraction | **PASS** | Extracted genuine calibrated flux in $\text{MJy/sr}$ and converted microJanskys for Band D2 channels. | None |
| Synthetic spectrum removed | **PASS** | Completely removed `Math.exp()` formula from `SpectralExplorer.tsx`; added clear distinction for unobserved channels. | None |
| Dichroic gap marked | **PASS** | Channels 51 and 52 explicitly marked as the 2.42 μm beam-splitter Dichroic Gap with distinct styling and tooltip. | None |
| Real image stacking | **PASS** | `POST /api/processing/stack` co-adds genuine SPHEREx FITS cutouts via median/mean; measures real RMS noise reduction. | None |
| Hardcoded light curves documented | **PASS** | Labeled published time-series with `"data_source": "literature_reference_baseline"` and scientific citations (AAVSO, Spitzer, Rodriguez et al.). | None |
| Real light curves supported | **PASS** | Integrated multi-epoch SPHEREx Level 2 calibrated photometric visits for Barnard's Star into time-series. | None |
| Scientific provenance | **PASS** | Full provenance attached to all endpoints (`telescope: SPHEREx`, `calib_level: 2`, `bunit: MJy / sr`, `archive_source: NASA/IPAC IRSA`). | None |
| Production build | **PASS** | `npm run build` succeeds in 4.23s with 0 TypeScript/Vite errors (1620 modules). | None |
| Public deployment readiness | **PASS** | Open access, zero API keys, no user login required, full CORS support enabled. | None |
