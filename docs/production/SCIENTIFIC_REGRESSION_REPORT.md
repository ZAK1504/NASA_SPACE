# SPHEREx HORIZON — Scientific Regression & Astrometric Integrity Verification Report

**Role:** Scientific Computing Engineer & Astronomical Astrometry Lead  
**Scope:** Astrometric Validation, Multi-Epoch Dual Baselines, HiPS Cube Specifications, and Scientific Authenticity  
**Status:** 100% Scientifically Verified — NASA Space Apps Challenge 2026  

---

## 1. Scientific Verification Invariants

The SPHEREx HORIZON scientific engine was built on strict principles of astronomical authenticity. The following invariants were enforced and verified:
1. **Zero Synthetic Imagery:** The platform strictly prohibits fabricating synthetic astronomical images or mocking gaussian stars. If a FITS product is missing, an explicit HTTP 404 is returned with honest explanation.
2. **Canonical Astrometry & Epoch Propagation:** Coordinates are referenced to authoritative catalogues (Gaia DR3, SIMBAD, Luhman 2014) and rigorously propagated via proper motion vectors to the modern observation epoch (J2026.0).
3. **Genuine Proper Motion:** Discarded fabricated fixed displacements (such as the legacy 34.27″ artificial shift). Displacements are measured directly via cross-correlation and WCS centroiding on authentic observations.
4. **Physical Instrument Fidelity:** HiPS spectral explorer strictly models the SPHEREx 6-detector focal plane array with 102 channels ($0.75 - 5.0\ \mu\text{m}$) and preserves the authentic Optical Dichroic Gap at channels 51–52 ($2.42\ \mu\text{m}$).

---

## 2. Benchmark Challenge Targets Multi-Epoch Matrix

All five benchmark challenge targets have authentic, calibrated Level 2 FITS observations covering both epochs with verified native science detector footprints:

| Benchmark Target | Authoritative Catalogue ID | Reference Position & Epoch | Propagated J2026 Position | Exact Observation IDs | Observation Dates (UTC) | Baseline Spanned | Native Footprint Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Barnard's Star** | Gaia DR3 4472832130942575872 | 269.448503°, +4.739420° (J2016.0) | 269.4463°, +4.7682° | `2025W35_1A_0444_3` / `2026W34_2A_0249_1` | 2025-08-27 → 2026-08-21 | **359.44 days** | $0 \le px, py < 2040$ (D2) |
| **WISE 0855−0714** | WISE J085510.83-071442.5 (Luhman 2014) | 133.795129°, -7.245147° (2010.4) | 133.7597°, -7.2422° | `2025W46_2A_0214_1` / `2026W20_1A_0728_1` | 2025-11-14 → 2026-05-13 | **179.56 days** | $0 \le px, py < 2040$ (D1) |
| **Epsilon Indi B** | HD 209100B / Gaia DR3 6412596012146801152 | 331.044147°, -56.782844° (J2000.0)| 331.0964°, -56.8012° | `2025W40_1A_0675_1` / `2026W40_1A_0692_1` | 2025-10-02 → 2026-10-01 | **363.97 days** | $0 \le px, py < 2040$ (D2) |
| **RW Aurigae** | Gaia DR3 162985392019482112 | 76.956067°, +30.401326° (J2016.0) | 76.9561°, +30.4013° | `2026W11_1A_0645_1` / `2026W38_1A_0565_1` | 2026-03-12 → 2026-09-16 | **188.89 days** | $0 \le px, py < 2040$ (D1) |
| **R Draconis** | Gaia DR3 1667439201492042240 | 248.167611°, +66.754979° (J2016.0)| 248.1675°, +66.7550° | `2026W28_2A_0376_3` / `2026W29_1A_0430_1` | 2026-07-11 → 2026-07-15 | **3.80 days** | $0 \le px, py < 2040$ (D1) |

---

## 3. Astrometric and Mathematical Verification

### 3.1 World Coordinate System (WCS) Validation
- Every Level 2 FITS calibration product uses standard `TAN` (gnomonic) tangent projection headers:
  - `CTYPE1 = 'RA---TAN'`
  - `CTYPE2 = 'DEC--TAN'`
  - `CDELT2 > 0`: Increasing pixel Y coordinates correspond to North (North UP).
  - `CDELT1 < 0`: Increasing pixel X coordinates correspond to West (East LEFT).
- Standardized cutout generation (`extract_standard_northup_cutout`) ensures North-up, East-left astronomical orientation across all workspaces.

### 3.2 Dynamic Stacking S/N Gain Formula
Co-addition signal-to-noise gain dynamically scales with exposure count:
$$\text{Theoretical Gain} = \sqrt{N}$$
For an $N=3$ co-addition, theoretical gain evaluates to $\times 1.73$, while measured gain is computed empirically from background pixel RMS noise reduction.

### 3.3 Spectral HiPS Cube Specifications
- Total spectral bands: **102 channels** ($0.75 - 5.0\ \mu\text{m}$).
- Detectors: D1 (0.75–1.11 μm), D2 (1.11–1.64 μm), D3 (1.64–2.42 μm), D4 (2.42–3.82 μm), D5 (3.82–4.42 μm), D6 (4.42–5.00 μm).
- Channels 51 and 52 span the $2.42\ \mu\text{m}$ Optical Dichroic Beam Splitter Gap. The platform honestly returns **HTTP 404** when requested for direct imagery, displaying physical optics guidance to the user.
