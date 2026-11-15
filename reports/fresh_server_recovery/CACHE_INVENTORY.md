# sphereXplorer — Scientific Cache Inventory & Storage Audit

**Audit Date:** November 15, 2026  
**Auditor:** Senior Astronomical Data Scientist & Scientific Software Engineer  
**Status:** COMPLETED & VERIFIED  

---

## 1. Executive Summary of Cache Inventory

A rigorous local audit was conducted across the development environment's astronomical data cache (`backend/data/cache`). All stored Level 2 FITS calibrated files, TAP/SIA query responses, and HiPS spectral frames were inspected, hashed with SHA-256, and validated against Astropy celestial WCS and official IPAC IRSA standards.

| Cache Category | File Count | Uncompressed Size | Verified Authentic | Invalid / Corrupt | Package Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Level 2 FITS Products** | 16 | 978.26 MB | 16 (100%) | 0 | Packaged in `scientific-cache.tar.gz` |
| **TAP/SIA Query Metadata** | 54 | 0.76 MB | 54 (100%) | 0 | Packaged in `scientific-cache.tar.gz` |
| **HiPS Spectral Cubes** | 1,171 (100 planes) | 111.13 MB | 1,171 (100%) | 0 | Packaged in `scientific-cache.tar.gz` |
| **Derived Previews** | 0 | 0.00 MB | N/A | 0 | Dynamically generated from FITS |
| **Benchmark Manifests** | 2 | 0.04 MB | 2 (100%) | 0 | Tracked in Git & Tarball |
| **TOTAL** | **1,243 files** | **1,090.19 MB** | **1,243 (100%)** | **0** | **Tarball Size: 802.27 MB** |

---

## 2. Complete Inventory of the 16 Level 2 FITS Products

All 16 Level 2 FITS files contain 7 standard SPHEREx extensions:
`PRIMARY`, `IMAGE` (calibrated science array in MJy/sr), `FLAGS`, `VARIANCE`, `ZODI`, `EPSF`, and `WCS-WAVE`.

| # | Filename | Target | Detector | Epoch Date (UTC) | Size (MB) | SHA-256 Checksum (First 16 chars) | Astropy WCS Valid |
| :- | :--- | :--- | :-: | :--- | :-: | :--- | :-: |
| 1 | `level2_2025W18_1B_0162_4D1_spx_l2b-v27-2026-196.fits` | Vela / Deep Field Baseline | D1 | 2025-04-29T14:21:04 | 59.99 | `eb38a1d33669e458` | YES |
| 2 | `level2_2025W35_1A_0444_3D2_spx_l2b-v27-2026-230.fits` | Barnard's Star (GJ 699) | D2 | 2025-08-27T06:42:07 | 57.93 | `c5b1b1c8bcf08537` | YES |
| 3 | `level2_2025W40_1A_0675_1D2_spx_l2b-v27-2026-239.fits` | Epsilon Indi B | D2 | 2025-10-02T02:04:22 | 66.71 | `12200e6268b2d986` | YES |
| 4 | `level2_2025W46_2A_0214_1D3_spx_l2b-v27-2026-207.fits` | WISE 0855-0714 | D3 | 2025-11-14T12:07:21 | 63.16 | `f2643f6d73950b7b` | YES |
| 5 | `level2_2025W50_2A_0254_1D3_spx_l2b-v27-2026-210.fits` | WISE 0855-0714 | D3 | 2025-12-12T08:26:02 | 62.78 | `e7ffe95e0c51e0ca` | YES |
| 6 | `level2_2026W11_1A_0645_1D4_spx_l2b-v27-2026-232.fits` | RW Aurigae (V* RW Aur) | D4 | 2026-03-12T00:03:00 | 59.96 | `20cc449a04a3ad9d` | YES |
| 7 | `level2_2026W20_1A_0728_1D5_spx_l2b-v27-2026-246.fits` | WISE 0855-0714 | D5 | 2026-05-13T01:32:15 | 62.72 | `5cc51dad9d1e4e20` | YES |
| 8 | `level2_2026W21_1A_0480_4D1_spx_l2b-v27-2026-268.fits` | Vela / Deep Field Baseline | D1 | 2026-05-21T03:33:47 | 59.68 | `934b910342317033` | YES |
| 9 | `level2_2026W28_2A_0376_3D4_spx_l2b-v27-2026-276.fits` | R Draconis (HIP 81634) | D4 | 2026-07-11T10:39:46 | 62.68 | `a21249fcb154ebcb` | YES |
| 10 | `level2_2026W29_1A_0430_1D4_spx_l2b-v27-2026-276.fits` | R Draconis (HIP 81634) | D4 | 2026-07-15T05:47:15 | 63.92 | `e1933b6045ee3750` | YES |
| 11 | `level2_2026W34_2A_0249_1D2_spx_l2b-v27-2026-243.fits` | Barnard's Star (GJ 699) | D2 | 2026-08-21T17:16:20 | 57.33 | `1c0588b0fbeea059` | YES |
| 12 | `level2_2026W35_1A_0079_4D2_spx_l2b-v27-2026-243.fits` | Barnard's Star (GJ 699) | D2 | 2026-08-24T08:51:15 | 56.19 | `50d255b12efda447` | YES |
| 13 | `level2_2026W37_2A_0581_1D3_spx_l2b-v27-2026-259.fits` | RW Aurigae (V* RW Aur) | D3 | 2026-09-13T07:08:31 | 60.86 | `842902de218861cf` | YES |
| 14 | `level2_2026W38_1A_0565_1D2_spx_l2b-v27-2026-261.fits` | RW Aurigae (V* RW Aur) | D2 | 2026-09-16T21:30:05 | 59.01 | `36888a3c3e11ab7c` | YES |
| 15 | `level2_2026W38_1A_0565_1D3_spx_l2b-v27-2026-261.fits` | RW Aurigae (V* RW Aur) | D3 | 2026-09-16T21:30:05 | 60.92 | `11a4f311ebf5ca97` | YES |
| 16 | `level2_2026W40_1A_0692_1D2_spx_l2b-v27-2026-276.fits` | Epsilon Indi B | D2 | 2026-10-01T01:15:26 | 64.42 | `46577ad0a68d71fb` | YES |

---

## 3. HiPS Spectral Frame Inventory

- **Total Valid Spectral Channels:** 100 channels (Channels 1 through 50 and 53 through 102).
- **Excluded Dichroic Gaps:** Channels 51 and 52 (2.40 - 2.44 μm beam-splitter gap, unphysical optical gap).
- **Resolution Level:** Order 0 (full-sky panoramic projection), Order 1 (regional zoom), Order 2.
- **Image Format:** Decodable 8-bit PNG images with valid `\x89PNG\r\n\x1a\n` magic headers and size > 1,000 bytes.
- **File Count:** 1,071 PNG image tiles + 100 metadata properties text files = 1,171 files.

---

## 4. Transfer Package & Deployment Footprint

- **Package Name:** `deploy_artifacts/scientific-cache.tar.gz`
- **Integrity File:** `deploy_artifacts/scientific-cache.tar.gz.sha256`
- **Package SHA-256:** `e1fa4aacd9e97564ddead642dbb7686c43ea999e7e2025d0fdc48d82cc01b856`
- **Compressed Package Size:** 802.27 MB
- **Required Free Space on Target:** >= 2.5 GB (Archive + uncompressed data + runtime scratch).
- **Persistent Production Directory:** `/srv/spherexplore-data` (Configured via `SPHEREXPLORE_DATA_DIR`).
