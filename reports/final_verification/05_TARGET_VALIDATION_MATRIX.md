# 05 — Target Validation Matrix

This matrix summarizes the astronomical validation across the five mandatory NASA challenge targets and arbitrary sky positions.

---

## 1. Challenge Targets Matrix

| Target Name | Canonical Designation | Catalogue Source & Epoch | Real Products Available | Distinct Epochs | Wavelength Bands Available | Available Measurements | Unavailable / Limitations | Verdict |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :---: |
| **Barnard's Star** | GJ 699 | Gaia DR3 (J2016.0) | 3 | 3 (2025-08-27, 2026-08-21, 2026-08-24) | D1, D2 | Proper motion displacement ($10.23''$ over ~360 days), astrometric dipole in difference image, aperture flux | Saturated central core flagged as NaN; requires wing centroiding | **PASS** |
| **Epsilon Indi B** | HD 209100B | Scholz et al. (2003) (J2000.0) | 2 | 2 (2025-10-02, 2026-10-01) | D2 | Binary separation from primary star ($402.3''$ / ~6.7'), 1-year astrometric displacement | Ba & Bb sub-components ($0.7''$) spatially blended at 6.15''/px scale | **PASS** |
| **WISE 0855−0714** | WISE J085510.83-071442.5 | Luhman & Esplin (2016) (2010.4) | 3 | 3 (2025-11-14, 2025-12-12, 2026-05-13) | D3, D5 | Westward proper motion ($-8.12''/\text{yr}$), thermal infrared flux in D5 (4.15 μm) | Negligible optical / short near-IR flux (<2.5 μm) due to 250 K temperature | **PASS** |
| **RW Aurigae** | V* RW Aur | Gaia DR3 (J2016.0) | 4 | 3 (2026-03-12, 2026-09-13, 2026-09-16) | D2, D3, D4 | Multi-epoch flux deficit, episodic occultation dimming (~2 mag) | Protoplanetary disk tidal bridge blended in 6.15'' beam; total flux monitored | **PASS** |
| **R Draconis** | V* R Dra | Gaia DR3 / GCVS (J2016.0) | 2 | 2 (2026-07-11, 2026-07-15) | D4 | 4-day short-term photometric stability, Level 2 calibrated surface brightness | SPHEREx sampling spans 4 days; full 245.6-day Mira cycle supported via AAVSO baseline | **PASS** |

---

## 2. Arbitrary Sky Coordinates Matrix

| Test Region | Coordinates (RA, Dec) | Context & Sky Field | Products Returned | Distinct Epochs | Valid Prepared Frames | Behavior on Cache Bypass | Verdict |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **Region 1: Vela Baseline** | `128.9819°`, `-38.4230°` | Vela constellation deep survey baseline | 2 | 2 (2025-04-29, 2026-05-21) | 2 | Loads Level 2 products, verifies detector footprint, renders 2040x2040 arrays | **PASS** |
| **Region 2: Auriga Field** | `82.4495°`, `+31.3249°` | Galactic anti-center star-forming complex | 1 | 1 (2026-09-16) | 1 | Single-epoch honest reporting; no artificial comparison generated | **PASS** |
| **Region 3: Unsurveyed Equator** | `180.0000°`, `0.0000°` | Arbitrary celestial equator position | 0 | 0 | 0 | Returns clean empty dataset; no fake sky or fallback substitution | **PASS** |

---

## 3. Exclusion Criteria & Data Hygiene

In all target evaluations, products were excluded if:
1. Coordinates fall outside physical detector bounds ($x < 0$ or $x \ge 2040$ or $y < 0$ or $y \ge 2040$).
2. Observation contains $>90\%$ invalid NaN pixels across target region.
3. Reprojection overlap area is less than $100\text{ pixels}$.
