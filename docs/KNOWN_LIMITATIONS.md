# SPHEREx HORIZON — Known Scientific & Technical Limitations

**Project:** SPHEREx HORIZON  
**Team:** Meteor Rizzlers  
**Competition:** NASA Space Apps Challenge 2026 — *Planet X and SPHEREx*  
**Date:** November 14, 2026  

In accordance with strict scientific integrity principles, this document outlines the authentic physical, observational, and technical limitations of the SPHEREx mission data and our HORIZON platform.

---

## 1. Spatial Resolution & Astrometric Sampling ($6.15''/\text{pixel}$)

- **Physical Limitation:** SPHEREx is an all-sky survey telescope optimized for wide-field near-infrared spectroscopy rather than ultra-high angular resolution. Its pixel scale is approximately $6.15''/\text{pixel}$, with an effective Point Spread Function (PSF) FWHM of $\approx 2 - 3\text{ pixels}$ ($\approx 12 - 18''$).
- **Impact on Motion Detection:** A high-proper-motion star like Barnard's Star ($\mu \approx 10.3''/\text{year}$) moves approximately $1.67\text{ pixels}$ per full year. Over a 57-day baseline, physical displacement is only $\approx 1.62''$ ($\approx 0.26\text{ pixels}$), which is below single-pixel resolution and detectable only via centroid fitting or difference dipole signatures.
- **Platform Handling:** SPHEREx HORIZON reports exact measured angular displacements alongside uncertainties, clearly advising citizen scientists that displacements below $6.15''$ fall within astrometric registration uncertainty.

---

## 2. Dichroic Beam-Splitter Gap at 2.42 μm (Channels 51 & 52)

- **Optical Design Characteristic:** SPHEREx utilizes a dichroic beam-splitter to divide incoming infrared light into short-wavelength ($0.75 - 2.42\ \mu\text{m}$, Arrays 1–3) and long-wavelength ($2.42 - 5.00\ \mu\text{m}$, Arrays 4–6) optical channels.
- **Scientific Impact:** Near the transition edge at $2.42\ \mu\text{m}$, optical transmission drops significantly, creating a physical "dichroic gap" spanning spectral channels 51 and 52.
- **Platform Handling:** Channels 51 and 52 are explicitly designated in the Spectral Explorer with dedicated warning borders and tooltips explaining this physical optical boundary.

---

## 3. Public Data Release Footprint Coverage (DR1 / QR3)

- **Archive State:** Early public SPHEREx data releases (DR1 and Quick Release QR3) do not yet provide uniform all-sky 6-array coverage for every arbitrary celestial coordinate. For many targets, visits may currently be available only in a subset of detector bandpasses (e.g. Band D2 and D5).
- **Platform Handling:** If a sky position is unobserved in a given band, the application honestly marks those channels as unobserved rather than synthesizing Gaussian data or fabricating continuum flux.

---

## 4. Multi-Epoch Temporal Cadence

- **Survey Schedule:** SPHEREx observes the sky in wide sweeps, mapping the complete celestial sphere once every six months. Consecutive all-sky visits are typically separated by approximately 180 days.
- **High-Frequency Variability:** For rapid variable phenomena (such as the 8.4-hour cloud rotation in brown dwarf WISE 0855), single SPHEREx survey passes sample individual epochs; high-frequency phase curves are augmented with documented astrophysical reference baselines (e.g. Spitzer/IRAC, AAVSO) with full citation.

---

## 5. Storage & Bandwidth Constraints for Full FITS Products

- **Data Volume:** Each calibrated Level 2 SPHEREx FITS product is approximately $60\text{ MB}$ uncompressed (comprising 2040×2040 float32 pixel arrays, variance extensions, and WCS tables).
- **Platform Handling:** Smart SHA-256 caching is implemented for TAP queries, DataLink resolution tables, and FITS files in `backend/data/cache/`. Initial queries to un-cached regions may require a few seconds to resolve via the NASA/IPAC IRSA TAP service.
