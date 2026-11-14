# SPHEREx HORIZON — Complete Feature Checklist & Verification Matrix

**Project:** SPHEREx HORIZON  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026  
**Audit Date:** November 14, 2026  

---

## 1. Feature Checklist Matrix

| # | System / Feature | Expected Behavior | Actual Verified Behavior | Status | Verified Evidence | Priority |
|---|---|---|---|---|---|---|
| 1 | **Application Startup (Frontend)** | React SPA starts and serves assets without runtime compilation errors. | Vite v6.4.6 serves on `http://localhost:5173/`; transforms 1620 modules in 3.77s with 0 errors. | **PASS** | `npm run build` and `npm run dev` clean exit code 0. | Core |
| 2 | **Application Startup (Backend)** | FastAPI backend starts and serves REST API on port 8000. | Starts cleanly after installing `requirements.txt` dependencies. Listens on `http://127.0.0.1:8000/`. | **PASS** | `uvicorn app.main:app` logs `Application startup complete`. | Core |
| 3 | **Client-Server Proxy** | Vite reverse proxy redirects `/api` calls to backend port 8000. | Vite successfully proxies `/api/health`, returning JSON service status. | **PASS** | `Invoke-RestMethod http://localhost:5173/api/health` returns HTTP 200. | Core |
| 4 | **Automated Tests** | Scientific test suite verifies core routines. | All 5 unit tests in `tests/test_coordinates.py`, `tests/test_difference.py`, `tests/test_processing.py` pass. | **PASS** | `pytest tests/` passed 5 in 2.68s. | Core |
| 5 | **Public Access (No Login)** | Public users can explore data with no sign-up or paywall. | Zero authentication gates; all routes and API endpoints are openly accessible. | **PASS** | Direct access to all routes verified. | Core |
| 6 | **IRSA TAP Archive Connection** | Queries NASA/IPAC IRSA TAP service (`spherex.obscore`). | PyVO queries `https://irsa.ipac.caltech.edu/TAP` via ADQL cone search. | **PASS** | Retrieved 50 observations for Barnard's Star from `spherex.obscore`. | Core |
| 7 | **FITS DataLink URL Resolution** | Resolves authentic FITS URLs from DataLink services. | DataLink query resolves direct IBE FITS URL for SPHEREx QR3 products. | **PASS** | Resolved `level2_2026W34_2A_0249_1D2_spx_l2b-v27-2026-243.fits`. | Core |
| 8 | **Actual FITS Product Download** | Stream downloads authentic multi-extension FITS files. | Downloaded 60,120,000-byte Level 2 FITS file to `backend/data/cache/fits/`. | **PASS** | Verified file on disk with 7 HDUs. | Core |
| 9 | **FITS Header & HDU Inspection** | Reads multi-extension headers, identifying science and calibration tables. | Inspects `PRIMARY`, `IMAGE`, `FLAGS`, `VARIANCE`, `ZODI`, `EPSF`, `WCS-WAVE`. | **PASS** | Verified float32 $2040 \times 2040$ science array and calibrated units `MJy / sr`. | Core |
| 10 | **Celestial WCS Ingestion** | Reads tangential SIP WCS and computes coordinate projections. | Reads WCS from HDU 1; target pixel coordinate for Barnard's Star is (1031.91, 810.81). | **PASS** | WCS roundtrip error measured at $3.63 \times 10^{-9}$ arcsec. | Core |
| 11 | **Cutout Extraction** | Extracts centered sub-arrays around requested sky positions. | Astropy `Cutout2D` extracts centered $20 \times 20$ pixel sub-array for $120'' \times 120''$ request. | **PASS** | Cutout centered at RA 269.4522°, Dec 4.6930° with preserved WCS. | Core |
| 12 | **Target-to-Data Association** | Target queries return observations matching requested sky footprints. | Tested on all 5 challenge targets; all 5 return matching observations within $0.23^\circ\text{--}0.75^\circ$. | **PASS** | Observation IDs: `2026W35_2A_0412_1`, `2026W19_1A_0594_2`, etc. | Core |
| 13 | **Arbitrary RA/Dec Ingestion** | Supports user-entered sky coordinates not in preset list. | Tested on Vega (RA 279.2347°, Dec 38.7837°); retrieved 2 genuine QR3 products. | **PASS** | Observation `2026W38_2A_0217_3` retrieved. | Core |
| 14 | **Empty Footprint Handling** | Handles unobserved sky regions gracefully without crashing. | Tested on empty region (`ra=10.0, dec=10.0, radius=0.01`); returns `total: 0`. | **PASS** | API returns `archive_status: "empty"` with empty observations list. | Core |
| 15 | **Archive Endpoint Schema Validation** | `/api/archive/search` validates response schemas. | Schema field mismatch (`s_ra` vs `ra`, `wavelength_min_m` vs `wavelength_min_um`) causes HTTP 500 error. | **FAIL** | FastAPI raises `ResponseValidationError` on search calls. | **P0** |
| 16 | **Celestial Coordinate Range Validation** | Rejects invalid coordinates outside physical bounds. | Bypasses validation; `ra=999, dec=999` sends invalid ADQL query wrapping to south pole. | **FAIL** | No Pydantic coordinate range checks. | **P1** |
| 17 | **Interactive Sky Atlas** | Contextual sky navigation with survey layers. | Aladin Lite v3 renders DSS2, 2MASS, and AllWISE hierarchical surveys with reticle. | **PASS** | Verified smooth pan/zoom, quick jump, and search. | Core |
| 18 | **Astronomical Name Resolution** | Resolves names to RA/Dec coordinates. | Instant offline resolution for 50+ stars; fallback to CDS Sesame / SIMBAD. | **PASS** | Vega, Barnard's Star, Sirius, M31 resolve accurately. | Core |
| 19 | **Time Machine UI Controls** | Provides Blink, Slider, Side-by-Side, Difference comparison modes. | UI switches between all 4 modes; blink timer toggles between epochs at 1, 2, 4 Hz. | **PASS** | Frontend comparison interface operates smoothly. | Core |
| 20 | **Real Time-Domain Playback** | Displays real multi-epoch SPHEREx observations over time. | Time Machine displays synthetic Gaussian PSFs generated by `comparison.py`. | **FAIL / MOCK** | Observation IDs hardcoded to `'2025W34_2B_0030_1'`; images are synthetic. | **P0** |
| 21 | **Multi-Date Timeline Scrubbing** | Allows scrubbing across a time sequence of observations ($N > 2$). | Only compares single pairs ($N=2$); no multi-date sequence player or scrubber. | **MISSING** | UI restricted to pairwise comparison. | **P2** |
| 22 | **Cross-Epoch WCS Alignment** | Aligns multi-epoch observations onto a common tangential grid. | `alignment_service.py` implements `reproject_interp`; however, `comparison.py` uses synthetic arrays. | **PARTIAL** | Algorithm implemented in service, but bypassed in router. | **P0** |
| 23 | **Source Detection & Centroiding** | Detects moving or variable sources in observation difference. | `difference_service.py` uses `photutils.detection.DAOStarFinder` and `match_to_catalog_sky`. | **PARTIAL** | Runs on synthetic shifted array, not real FITS difference. | **P0** |
| 24 | **Astronomical Proper Motion Measurement** | Measures physical angular displacement across observation epochs. | Reports $34.27''$ motion for Barnard's Star in 57 days (over 21x larger than physical $1.62''$). | **FAIL / MOCK** | Caused by artificial $4.2\text{ px}, 3.5\text{ px}$ shift in `comparison.py`. | **P0** |
| 25 | **Multi-Exposure Image Stacking Engine** | Co-adds multiple exposures to boost S/N of faint sources. | Calculates median/mean stacking and computes theoretical $S/N \approx \sqrt{N}$ gain. | **PARTIAL / MOCK** | Co-adds synthetic Gaussian noise frames instead of real FITS. | **P2** |
| 26 | **102 Spectral Channels Specifications** | Details SPHEREx 6 detector arrays and resolving powers. | `/api/spectra/channels` returns specifications across D1–D6 ($0.75\ \mu\text{m} \to 5.0\ \mu\text{m}$). | **PASS** | Verified nominal bandwidths and resolving powers ($R=35\text{--}130$). | Core |
| 27 | **Level 3 Spectral Cube Ingestion** | Ingests All-Sky 102-channel FITS cubes (`spherex_dr1_cube`). | `spherex_dr1_cube` is not queried, downloaded, or sliced. | **MISSING** | No cube ingestion pipeline implemented. | **P2** |
| 28 | **Spectrum Extraction & Charting** | Displays measured flux versus wavelength for target positions. | `SpectralExplorer.tsx` computes relative flux with `Math.exp()`; API returns `flux_uJy: null`. | **MOCK** | Stylized Gaussian continuum curves rather than measured flux. | **P1** |
| 29 | **Dichroic Gap Handling** | Displays blank channels 51 and 52 near beam splitter crossover. | Channels 51 and 52 rendered with non-zero heights by synthetic continuum formula. | **PARTIAL** | Does not blank channels 51 and 52 in display. | **P2** |
| 30 | **Photometric Light Curves** | Time-series brightness charts with phase folding for variable stars. | Charts display phase folding ($0.0 \to 1.0$) and error bars, but data is hardcoded in Python. | **MOCK** | Static dictionaries in `lightcurve_service.py`. | **P1** |
| 31 | **Cross-Mission Catalog Cross-Matches** | Displays Gaia DR3 proper motions and AllWISE photometry. | `catalog_service.py` provides authentic published literature astrometry and photometry. | **PASS** | Gaia DR3 source IDs, proper motions, parallax, AllWISE mags verified. | Core |
| 32 | **Interactive Guided Missions** | Citizen-science missions guiding users through analysis. | 3 complete missions (Barnard's Star, WISE 0855, RW Aurigae) with quizzes. | **PASS** | Educational citizen-science workflow functional. | Core |
| 33 | **Discovery Journal & Report Export** | Persists candidate discoveries and exports reproducible reports. | Saves candidate notes and metadata to `discoveries.json`; exports Markdown `.md` report. | **PASS** | Tested file save and Markdown blob download. | Core |
| 34 | **Cosmic Copilot Assistant** | Interactive floating assistant answering science questions. | Rule-based astronomy assistant with quick-action navigation pills and glossary. | **PASS** | Tested on "What is proper motion?". | Optional |
| 35 | **Responsive Design** | Accessible across mobile, tablet, and desktop viewports. | Clean responsive navigation, sidebar toggle, and mobile menu. | **PASS** | Mobile layout operational. | Core |

---

## 2. Summary Status Counts

- **Total PASS:** **17**
- **Total PARTIAL:** **6**
- **Total FAIL:** **3**
- **Total MISSING:** **2**
- **Total MOCK:** **5**
- **Total UNVERIFIED:** **0**
- **Total OPTIONAL:** **1**
