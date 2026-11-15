# sphereXplorer — Detailed Root Cause Analysis of Google Cloud Fresh-Server Failures

**Audit Date:** November 15, 2026  
**Auditor:** Senior Astrodynamics & DevSecOps Production Auditor  
**Reference Run:** 18 failed, 31 passed on fresh Compute Engine VM (`spherexplorer-backend`)  

---

## 1. Primary Classification of Failures

The 18 failing backend regression tests on Google Cloud did NOT stem from algorithmic math errors in our image-processing or astrometry pipelines. Rather, they were caused by five intersecting structural and environment defects:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FRESH SERVER EXECUTION TIMELINE                      │
├──────────────────────────┬─────────────────────────────────────────────┤
│ 1. Git Clone             │ .gitignore excluded cache/ -> 0 FITS, 0 DL  │
│ 2. Test Execution Begins │ Tests expected offline fallback data        │
│ 3. Live Archive Query    │ IPAC IRSA TAP/SIA returned HTTP 502 to VM   │
│ 4. Exception Handling    │ Exception masked as [] -> assert len > 0 ✗  │
│ 5. Spectral Playback     │ HiPS preload incomplete (18 of 100 frames) ✗ │
└──────────────────────────┴─────────────────────────────────────────────┘
```

---

## 2. Exhaustive Analysis of All 18 Test Failures

### Category A: Missing FITS Observation Products (10 Failures)

When `git clone` populated the fresh VM, `.gitignore` legitimately excluded `backend/data/cache/fits/*.fits` (1 GB of binary astronomical data). When tests requested previews or time-machine manifests, no local files existed. Because the live IRSA endpoint was also returning HTTP 502 Proxy Errors from the GCP VM network, the on-demand fallback fetch failed, triggering HTTP 404.

1. **`tests/test_final_visualization_fixes.py::test_time_machine_honest_single_epoch_handling`**
   - *Failure:* `AssertionError: Expected 200, got 404: No authentic SPHEREx observation FITS product found covering the requested region.`
   - *Cause:* Target RA/Dec could not resolve any local FITS file; cache was empty.
2. **`tests/test_final_visualization_fixes.py::test_processing_preview_standard_northup_15arcmin`**
   - *Failure:* `assert 404 == 200`
   - *Cause:* Direct call to `/processing/preview` with Barnard's Star coordinates found 0 cached FITS files.
3. **`tests/test_scientific_recovery.py::test_real_fits_preview`**
   - *Failure:* `assert 404 == 200`
   - *Cause:* Missing `level2_2025W35_1A_0444_3D2_spx_l2b-v27-2026-230.fits`.
4. **`tests/test_scientific_recovery.py::test_authentic_comparison_no_fake_motion`**
   - *Failure:* `assert 0 >= 2`
   - *Cause:* Comparison manifest found 0 local frames to align and blink.
5. **`tests/test_scientific_recovery.py::test_stack_exposures_real_data`**
   - *Failure:* `assert 404 == 200`
   - *Cause:* Exposure stacking requires at least two authentic FITS files.
6. **`tests/test_scientific_recovery.py::test_time_machine_manifest`**
   - *Failure:* `assert 0 >= 2`
   - *Cause:* Target Barnard's Star manifest returned 0 frames instead of >= 2.
7. **`tests/test_scientific_recovery.py::test_epsilon_indi_b_real_fits_preview`**
   - *Failure:* `assert 404 == 200`
   - *Cause:* Missing `level2_2025W40_1A_0675_1D2_spx_l2b-v27-2026-239.fits`.
8. **`tests/test_scientific_recovery.py::test_r_draconis_real_fits_preview`**
   - *Failure:* `assert 404 == 200`
   - *Cause:* Missing `level2_2026W28_2A_0376_3D4_spx_l2b-v27-2026-276.fits`.
9. **`tests/test_scientific_recovery.py::test_actual_fits_target_footprint_and_science_pixels`**
   - *Failure:* `Missing required FITS file for wise-0855: level2_2026W20_1A_0728_1`
   - *Cause:* Explicit verification test asserting presence of WISE 0855 Epoch 3 Level 2 FITS file.
10. **`tests/test_scientific_recovery.py::test_extended_multi_epoch_baselines`**
    - *Failure:* `Cannot find 2025W46_2A_0214_1`
    - *Cause:* Multi-epoch baseline test requires 2025 and 2026 FITS products to compute time delta.

---

### Category B: Upstream IRSA HTTP 502 Proxy Outages & Query Failures (5 Failures)

On the fresh GCP VM, TAP spatial queries to `https://irsa.ipac.caltech.edu/TAP` and SIA queries returned HTTP 502 Proxy Error. In `irsa_service.py`, exceptions were caught and simply returned `[]` (empty list). This caused tests asserting `total_found > 0` to fail, and masked an upstream archive outage as honest zero astronomical coverage.

11. **`tests/test_scientific_recovery.py::test_archive_search_valid`**
    - *Failure:* `assert 0 > 0`
    - *Cause:* Search for Barnard's Star returned `[]` because live TAP query failed with 502 and `cache/queries` had 0 cached responses on the fresh server.
12. **`tests/test_target_astrometry_and_discovery.py::test_archive_discovery_multi_epoch_manifest`**
    - *Failure:* `assert 0 >= 2`
    - *Cause:* Discovery service query returned 0 products due to 502 + missing cache.
13. **`tests/test_target_astrometry_and_discovery.py::test_comparison_endpoint_alignment_and_metrics`**
    - *Failure:* `assert 404 == 200`
    - *Cause:* Downstream alignment endpoint received 0 valid observations.
14. **`tests/test_target_astrometry_and_discovery.py::test_arbitrary_coordinates_valid_coverage_demonstration`**
    - *Failure:* `assert 0 >= 2`
    - *Cause:* Arbitrary Ophiuchus coordinate (RA 270.0, Dec +4.0) relies on live TAP query or local TAP query cache to discover overlapping observation footprints.
15. **`tests/test_target_astrometry_and_discovery.py::test_exact_product_resolution_footprint_guard`**
    - *Failure:* `obs ID must resolve to local cached FITS`
    - *Cause:* Obs ID could not be located in empty `cache/fits` directory.

---

### Category C: Spectral HiPS Cube Preload Frame Gap (1 Failure)

16. **`tests/test_scientific_recovery.py::test_spectral_preload_and_frame_api`**
    - *Failure:* `assert 18 == 100`
    - *Cause:* On the fresh server, `backend/data/cache/hips` only contained 18 cached spectral PNGs. When `preload` attempted to fetch the remaining 82 channels over the network, IPAC rate-limits or timeouts interrupted the transfer, leaving `prepared_channels` at 18.

---

### Category D: Secondary Alignment & Multi-Epoch Regression Failures (2 Failures)

17. **`tests/test_final_visualization_fixes.py::test_exact_product_resolution_footprint_guard`**
    - *Failure:* `AssertionError: obs ID 2025W35_1A_0444_3 must resolve to local cached FITS`
    - *Cause:* Observation resolution failed due to missing local cache.
18. **`tests/test_scientific_recovery.py::test_spectral_explorer_dichroic_gap`**
    - *Failure:* Side-effect of uninitialized spectral service state.

---

## 3. Structural Code Defects Identified

1. **Non-persistent Data Directory:**
   `backend/app/config.py` hardcoded `DATA_DIR = BASE_DIR / "data"`. In modern containerized or immutable VM deployments (where code resides in `/var/www` or `/opt`), application code updates destroy the cache unless explicitly mapped to a persistent directory like `/srv/spherexplore-data`.
2. **Missing Dependency in `requirements.txt`:**
   `python-dotenv>=1.0.0` was imported in `config.py` (`from dotenv import load_dotenv`), but was omitted from `requirements.txt`. On a fresh server installing strictly from `requirements.txt`, this caused runtime import failures.
3. **Dishonest Archive Error Masking:**
   In `irsa_service.py`, any exception during remote TAP execution returned `[]`. A 502 proxy error or network timeout was indistinguishable from genuine zero coverage.
4. **Security Vulnerabilities:**
   - SSRF vector in `fits_service.py` accepting arbitrary user-supplied `fits_url` with no hostname or IP restrictions.
   - Global public read/write/delete in `discoveries.py` allowing any visitor to delete another visitor's scientific discoveries.
   - Header spoofing vector in `assistant.py` where `X-Forwarded-For` was trusted blindly from untrusted direct connections.
