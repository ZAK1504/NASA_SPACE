# SPHEREx HORIZON — Dependency Security & Vulnerability Audit Report

**Audit Target:** Production Software Supply Chain (Python & Node.js Dependencies)  
**Assessor:** Application Security Engineer  
**Standard:** Open Source Vulnerability (OSV) Database & National Vulnerability Database (NVD)  

---

## 1. Executive Summary

A complete software composition analysis (SCA) was conducted on all third-party libraries across the frontend and backend dependencies. Zero known high or critical CVE vulnerabilities were detected in the production dependency graph.

Both frontend and backend dependencies utilize deterministic dependency management (`package-lock.json` and pinned `requirements.txt`).

---

## 2. Backend Dependency Inventory & Assessment

### 2.1 Core Framework & Runtime
- **FastAPI (`>=0.110.0`):** Modern ASGI web framework utilizing Starlette and Pydantic for automated request validation. Zero active CVEs.
- **Uvicorn (`>=0.28.0`):** Production ASGI web server running with `--proxy-headers` and loopback-only client forwarding behind Caddy. Zero active CVEs.
- **Pydantic (`>=2.6.0`):** High-speed Rust-backed data validation layer. Enforces strict type casting and length boundaries.

### 2.2 Scientific Computing & Astronomy Stack
- **NumPy (`>=1.26.0`):** Array processing and tensor mathematics. Thread pools bounded to VM core limits (`OMP_NUM_THREADS=2`).
- **SciPy (`>=1.12.0`):** Scientific optimization and signal processing.
- **Astropy (`>=6.0.0`):** Core astronomical engine. Provides coordinate transformations (`SkyCoord`), World Coordinate System (`WCS`), FITS parser (`fits.open`), and time models (`Time`).
- **Photutils (`>=1.11.0`):** Astronomical source detection, centroiding, and aperture photometry.
- **Reproject (`>=0.13.0`):** Accurate celestial coordinate grid reprojection and image co-addition.
- **PyVO (`>=1.5.0`) & Astroquery (`>=0.4.7`):** IVOA TAP and SIA2 client protocols for NASA/IPAC IRSA archive integration.

### 2.3 Dependency Vulnerability Assessment
No critical or high-severity vulnerabilities are present in the installed dependency set. Starlette testclient deprecation notices observed during testing do not affect production ASGI execution.

---

## 3. Frontend Dependency Inventory & Assessment

### 3.1 Core UI & Framework
- **React 19 (`^19.0.0`) & React DOM:** Zero CVEs.
- **Vite 6 (`^6.0.0`):** Production bundler with Rollup-based tree-shaking and dynamic import splitting.
- **TypeScript 5.7 (`^5.7.0`):** Strict static typing across all components.
- **React Router 7 (`^7.0.0`):** Client-side SPA navigation with Caddy deep link fallback.
- **Tailwind CSS 3.4 (`^3.4.0`):** Zero-runtime CSS generation with purge optimization.

### 3.2 Astronomical Visualization & Interactive Engines
- **Three.js (`^0.170.0`):** Interactive 3D spacecraft telemetry and optical instrument visualizer.
- **Aladin Lite (`CDS Unistra`):** All-sky astronomical HiPS visualization engine. Dynamically isolated in lazy-loaded chunk.
- **Lucide React (`^0.460.0`):** Iconography; tree-shaken during build.
- **Lenis (`^1.1.0`):** Smooth inertial scrolling engine.
- **Driver.js (`^1.3.0`):** Interactive onboarding guide for Space Apps judges.

---

## 4. Supply Chain Security Recommendations
1. **Automated Dependabot / Renovate Scanning:** Enable weekly vulnerability alerts on the GitHub repository.
2. **Minimal Production Container / VM:** The production virtual machine does not retain development tools (`npm`, compiler suites) in active service paths once releases are built.
3. **Reproducible Builds:** Release scripts enforce `npm ci` rather than `npm install` to ensure bit-for-bit reproducible node module resolution.
