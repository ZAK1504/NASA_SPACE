# NASA SPACE APPS CHALLENGE 2026 — COMPLIANCE REPORT

**Project:** SPHEREx HORIZON  
**Challenge:** Planet X and SPHEREx  
**Team:** Meteor Rizzlers  
**Compliance Rating:** 100% Core Requirements Met  

---

## 1. MANDATORY NASA CHALLENGE OBJECTIVES VERIFICATION

### Question 1: Can an ordinary user enter celestial coordinates?
- **Answer:** **YES.**  
- **Implementation:** Users can enter Right Ascension (0° to 360°) and Declination (-90° to +90°) via the Custom Coordinates control or select presets for all 5 challenge targets.  
- **Verification:** Tested with custom arbitrary coordinates `(RA 269.4463°, Dec +4.7681°)`, which triggers real-time archive verification and FITS cutout extraction.

### Question 2: Does the application retrieve actual SPHEREx observations of that patch?
- **Answer:** **YES.**  
- **Implementation:** Integrated with NASA/IPAC IRSA TAP query endpoint (`https://irsa.ipac.caltech.edu/TAP`) querying `spherex.obscore`.  
- **Verification:** Retrieved authentic Level 2 FITS products including `level2_2025W35_1A_0444_3D2_spx_l2b-v27-2026-230.fits` and `level2_2026W34_2A_0249_1D2_spx_l2b-v27-2026-243.fits`.

### Question 3: Does it display genuine astronomical images?
- **Answer:** **YES.**  
- **Implementation:** All images are generated directly from 2D scientific FITS arrays using Astropy `Cutout2D`, `ImageNormalize`, and `AsinhStretch`. Synthetic Gaussian mock star generators were permanently excised.  
- **Verification:** Rendered images contain genuine telescope background noise, calibrated stellar flux, and astrometry grid axes.

### Question 4: Can the user watch actual observations across different dates like a video?
- **Answer:** **YES.**  
- **Implementation:** The Time Machine features a full Time-Lapse Player with Play, Pause, Scrubber, Step Back/Forward, Loop, and Playback Speed (0.5×, 1.0×, 2.0×) stepping through genuine multi-epoch SPHEREx observations.  
- **Verification:** Demonstrated across a 359-day observation baseline between 2025-08-27 and 2026-08-21.

### Question 5: Does the fixed sky region preserve genuine positional changes?
- **Answer:** **YES.**  
- **Implementation:** All multi-epoch cutouts are reprojected onto a common fixed tangential celestial grid using Astropy WCS. Images are NOT centered on the moving object itself, preserving astronomical displacement.

### Question 6: Can the user investigate possible moving or variable sources?
- **Answer:** **YES.**  
- **Implementation:** Provides five distinct analytical modes:
  1. Time-Lapse Movie
  2. Side-by-Side Comparison
  3. Interactive Split Slider
  4. High-Speed Blink Comparator (250–700ms)
  5. Cross-Epoch Difference Map (Later − Earlier with coolwarm diverging colormap)
  6. Automated source centroiding using Photutils `DAOStarFinder`.

### Question 7: Have all five specified challenge targets actually been tested?
- **Answer:** **YES.**  
- **Targets Verified:**
  1. **Barnard's Star:** Tested at modern J2026 epoch coordinates (`RA 269.4463°`, `Dec +4.7681°`) propagated from Gaia DR3 J2016.0 reference astrometry.
  2. **WISE 0855:** Tested with historical discovery coordinates propagated to SPHEREx observation epoch with D3 calibrated FITS array.
  3. **Epsilon Indi B:** Verified binary brown dwarf coordinates (`RA 330.8408°`, `Dec -56.7868°`).
  4. **RW Aurigae:** Tested classical T Tauri variable star (`RA 83.4042°`, `Dec +30.4017°`).
  5. **R Draconis:** Tested 246-day Mira-type variable carbon star (`RA 166.5708°`, `Dec +68.0417°`).

### Question 8: Does the application support optional considerations?
- **Answer:** **YES.**  
- **Supported Considerations:**
  - Official SPHEREx DR1 All-Sky HiPS Cube integration.
  - 102-channel near-infrared exploration (0.75 μm – 5.00 μm).
  - Wavelength scan animation.
  - On-demand 102-band spectrum extraction with CSV export.
  - Configurable field of view (2′, 5′, 10′, 15′, 30′) eliminating pixelation.
  - Driver.js interactive guided tutorials.
  - Cross-epoch difference imaging and co-addition (stacking).
  - Grayscale astronomical default palette and smooth interpolation toggle.

### Question 9: Is the application publicly accessible without login?
- **Answer:** **YES.**  
- Zero authentication barriers, no login screens, and open public API endpoints.

### Question 10: Are scientific limitations and provenance communicated honestly?
- **Answer:** **YES.**  
- The 2.42 μm Dichroic Gap (channels 51 & 52) is explicitly explained as a physical optical boundary. Candidate detections are labeled as unconfirmed candidate features subject to telescope PSF registration uncertainty (~6.15″/px).
