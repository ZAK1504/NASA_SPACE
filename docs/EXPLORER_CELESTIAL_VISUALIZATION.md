# SPHEREx HORIZON — 3D Celestial Explorer Visualization

## Overview

The Chapter 02 (Explorer) showcase features an authentic, interactive 3D celestial sphere rendered via Three.js (`frontend/src/components/showcase/ExplorerShowcaseVisual.tsx`). It replaces legacy flat 2D representations with a full spherical celestial coordinate globe mapped with genuine NASA/IPAC SPHEREx DR1 all-sky infrared imagery.

---

## Technical Architecture

### 1. Authentic All-Sky Texture Mapping
Instead of synthetic noise or generic starfields, the celestial globe is textured with genuine SPHEREx DR1 equirectangular projections derived directly from authentic IPAC HiPS Order 0 FITS tiles located in `backend/data/cache/hips`:
- **Composite False-Color Map (`spherex_dr1_composite.jpg`):** 3-band astronomical infrared composite (Red = 4.72 µm Array 6 / D6, Green = 1.33 µm Array 2 / D2, Blue = 0.75 µm Array 1 / D1).
- **Single-Band Spectral Textures:**
  - `spherex_band_075um.jpg` (Array 1 / D1, 0.75 µm — stellar photospheres and visible/NIR boundary)
  - `spherex_band_133um.jpg` (Array 2 / D2, 1.33 µm — J-band interstellar extinction penetration)
  - `spherex_band_236um.jpg` (Array 3 / D3, 2.36 µm — K-band molecular CO/H₂O absorption)
  - `spherex_band_472um.jpg` (Array 6 / D6, 4.72 µm — cold brown dwarfs and ice bands)

The textures are synthesized using `astropy_healpix` Morton bit-deinterleaving, mapping the 12 order 0 HEALPix base diamonds ($N_{\text{side}}=512$) into standard $2048 \times 1024$ equirectangular celestial coordinates ($\text{RA} \in [0^\circ, 360^\circ]$, $\text{Dec} \in [-90^\circ, +90^\circ]$).

### 2. Spherical-to-Cartesian Coordinate Projection
Astronomical targets and coordinate rings are mapped to the 3D sphere ($R = 1.35$) using standard equatorial coordinate transformations:

$$\phi = \frac{\text{RA}_{\text{deg}} \cdot \pi}{180}$$
$$\theta = \frac{(90 - \text{Dec}_{\text{deg}}) \cdot \pi}{180}$$

In Three.js right-handed Cartesian space ($+Y$ = North Celestial Pole, $+Z$ = observer forward, $+X$ = right):

$$x = -R \cdot \sin(\theta) \cdot \cos(\phi)$$
$$y = R \cdot \cos(\theta)$$
$$z = R \cdot \sin(\theta) \cdot \sin(\phi)$$

### 3. Coordinate Grids
- **Celestial Equator ($\text{Dec} = 0^\circ$):** Drawn in subtle amber/gold (`#F4A272`, opacity 0.35) at $y = 0$.
- **Ecliptic Plane ($23.44^\circ$ obliquity):** Drawn in cyan/indigo (`#818CF8`, opacity 0.28) tilted along the celestial axis to show the plane of the Solar System.

### 4. Canonical Target Beacons & Occlusion Handling
Five scientifically critical targets are positioned at their exact celestial coordinates:
1. **Barnard's Star:** $\text{RA} = 269.45^\circ$, $\text{Dec} = +4.74^\circ$ (Fastest proper motion star, $10.39''/\text{yr}$)
2. **WISE 0855−0714:** $\text{RA} = 133.80^\circ$, $\text{Dec} = -7.25^\circ$ (Coldest known sub-stellar brown dwarf, $\sim 250\text{ K}$)
3. **Epsilon Indi B:** $\text{RA} = 331.04^\circ$, $\text{Dec} = -56.78^\circ$ (Binary T-dwarf system with methane absorption)
4. **RW Aurigae:** $\text{RA} = 76.96^\circ$, $\text{Dec} = +30.40^\circ$ (Young stellar object with disrupted protoplanetary disk)
5. **R Draconis:** $\text{RA} = 248.17^\circ$, $\text{Dec} = +66.70^\circ$ (Mira-type pulsating variable, 314-day period)

**Occlusion Logic:**
During rotation, each beacon's world normal is tested against the camera vector:
$$\mathbf{toCam} = \frac{\mathbf{camPos} - \mathbf{worldPos}}{\|\mathbf{camPos} - \mathbf{worldPos}\|}$$
$$\text{visible} = (\mathbf{normal} \cdot \mathbf{toCam}) > 0.05$$
When a target is on the far hemisphere, its HTML label is hidden and its pin core is rendered at reduced opacity ($0.18$), preventing front-to-back label clutter while maintaining 3D depth perception.

### 5. Interactive States & Modes
- **Sky Mode (Default):** Displays the full composite false-color infrared map with slow idle rotation ($0.05\text{ rad/s}$). Dragging rotates the sphere smoothly via `OrbitControls` with damping factor $0.05$ (vertical and horizontal scroll remain completely unblocked because zoom and pan are disabled).
- **Object Mode:** Focuses camera directly onto canonical targets (e.g., Barnard's Star), illuminates targeting reticles, and opens an astrophysical inspection HUD detailing coordinates, proper motion, and spectral characteristics.
- **Spectral Mode:** Dynamically cycles through authentic single-band infrared textures every 2.8 seconds, accompanied by active wavelength indicators ($0.75\ \mu\text{m} \to 1.33\ \mu\text{m} \to 2.36\ \mu\text{m} \to 4.72\ \mu\text{m}$).

### 6. Performance Optimization
- **IntersectionObserver:** When the Explorer section is scrolled out of the viewport, the render loop pauses automatically (`cancelAnimationFrame` / conditional update), saving GPU/CPU resources.
- **Alpha Transparency:** Canvas background is fully transparent (`gl.setClearColor(0x000000, 0)`), seamlessly integrating with the ambient cosmic background without rectangular card borders.
