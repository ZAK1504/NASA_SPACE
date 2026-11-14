# SPHEREx HORIZON — Final Multi-Epoch Recovery & Discovery Lab Synchronization Report

**Project:** SPHEREx HORIZON — Interactive Cosmic Discovery Platform  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026 — Planet X and SPHEREx  
**Repository:** nasa-sphere  

---

## 1. Executive Summary

This correction pass eliminates false single-epoch claims across all NASA challenge targets, repairs state isolation and synchronized 3-view alignment in the Discovery Lab, standardizes astronomical visualization (15′ default FOV, asinh stretch, grayscale, smooth display), and ensures honest handling of single-epoch and multi-epoch states without silent data substitution.

---

## 2. Authentic Multi-Epoch Archive Discovery & Cache Verification

All five challenge targets now have verified multi-epoch calibrated SPHEREx Level 2 FITS observations cached locally and indexed in the archive manifest service.

| Target Name | RA (J2000) | Dec (J2000) | Epoch 1 Observation | Epoch 1 Date | Epoch 2 Observation | Epoch 2 Date | Baseline (Days) | Detector | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **Barnard's Star** | 269.4463° | +4.7682° | `2025W35_1A_0444_3` | 2025-08-27 | `2026W34_2A_0249_1` | 2026-08-21 | 359 | D2 (NIR) | Verified Dual-Epoch |
| **WISE 0855−0714** | 133.7862° | -7.2444° | `2025W46_2A_0214_1` | 2025-11-14 | `2025W50_2A_0254_1` | 2025-12-12 | 27 | D3 (MIR) | Verified Dual-Epoch |
| **Epsilon Indi B** | 331.0604° | -56.7865° | `2025W40_1A_0675_1` | 2025-10-02 | `2026W40_1A_0692_1` | 2026-10-01 | 363 | D2 (NIR) | Verified Dual-Epoch |
| **RW Aurigae** | 77.4642° | +30.4014° | `2026W37_2A_0581_1` | 2026-09-13 | `2026W38_1A_0565_1` | 2026-09-16 | 3 | D3 (MIR) | Verified Dual-Epoch |
| **R Draconis** | 248.3304° | +66.7042° | `2026W28_2A_0376_3` | 2026-07-11 | `2026W29_1A_0430_1` | 2026-07-15 | 3 | D4 (MIR) | Verified Dual-Epoch |

*Note on RW Aurigae:* SPHEREx Array 2 (D2) does not cover RW Aurigae (pixels fell outside the active array). SPHEREx Array 3 (D3) provides full science coverage with authentic finite pixels at `(1550, 564)` and `(1549, 601)`.

---

## 3. Bug Fix Breakdown

### Bug A — Incorrect Single-Epoch Claim
- **Root Cause:** Hardcoded `obs1 == obs2` fallback in `targetObsPairs` when only 1 local FITS file was initially present.
- **Resolution:** Downloaded and verified authentic second-epoch Level 2 FITS from IPAC IRSA for WISE 0855, Epsilon Indi B, RW Aurigae, and R Draconis. Updated `targetObsPairs` across frontend and manifest generator.

### Bug B — Discovery Lab Target Association Bug
- **Root Cause:** React state from previous target comparisons persisted in memory when switching targets.
- **Resolution:** Immediate clearing of `comparison`, `selectedCandidate`, and `discoveryNotes`, with title reset to `Exploratory Analysis of <Target>` and default confidence `not_assessed`.

### Bug C — Duplicate Single-Observation Bug
- **Root Cause:** Backend duplicated `b64_1` into `b64_2` when only 1 observation was provided.
- **Resolution:** Explicitly returning `epoch2_image_base64: None`, `observation_2: None`, `difference_image_base64: None`, `comparison_available: False`, and `prepared_frame_count: 1`. Frontend displays clear empty states in View 2 and View 3 without confusion.

### Bug D — Unified Astronomical Visualization
- **Root Cause:** Discovery Lab rendered 3′ pixelated cutouts with `inferno` colormap while Time Machine used 15′ `grayscale` `asinh` cutouts.
- **Resolution:** Discovery Lab standardized to default 15′ FOV (900.0 arcseconds), `asinh` stretch, `grayscale` palette, smooth rendering, North-up and East-left orientation, with full interactive controls for FOV (2′, 5′, 10′, 15′, 30′), stretch, colormap, and pixel smoothing.

### Bug E — Misleading Candidate Status
- **Root Cause:** 0 candidates displayed identically regardless of whether multi-epoch comparison was performed.
- **Resolution:** Distinguished "Analysis unavailable (fewer than 2 epochs)" from "Analysis completed with 0 reliable candidates".

### Bug F — Journal Title & Confidence
- **Root Cause:** Title and confidence defaulted to previously selected candidate or hardcoded strings.
- **Resolution:** Title dynamically synchronizes to current target; confidence initializes to `not_assessed` (Exploratory Investigation).

### Bug G — Stacking S/N Scaling
- **Root Cause:** Hardcoded label `×1.73 (√3)`.
- **Resolution:** Dynamic formula based on actual input exposure count: `×{stackResult?.theoretical_snr_gain ?? Math.sqrt(numExposures).toFixed(2)} Theoretical S/N (Idealized √{numExposures})`.
