# 10 — Performance & System Benchmark Report

## 1. Test Environment Specification

- **Host Operating System:** Microsoft Windows NT 10.0.26300.0
- **Python Runtime:** Python 3.10.11 (64-bit)
- **Node.js Runtime:** Node.js v20.19.2
- **Frontend Framework:** React 19.0.0 / Vite 6.4.6 / Three.js 0.187.0
- **Backend Framework:** FastAPI 0.162.5 / Uvicorn 0.54.0

---

## 2. Backend Latency Benchmarks (Sample Size = 5 Runs)

All benchmarks measured against local loopback under steady-state operating conditions.

| Endpoint | Method | Path | Response Size | p50 Latency | p95 Latency | Operational Notes |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
| **Health Check** | `GET` | `/api/health` | 241 B | **14.81 ms** | **15.99 ms** | Instant status and cache directory verification |
| **Target Catalog** | `GET` | `/api/objects` | 6,572 B | **4.53 ms** | **20.76 ms** | In-memory astrometric catalogue serialization |
| **Target Detail** | `GET` | `/api/objects/barnards-star` | 1,285 B | **2.51 ms** | **2.72 ms** | Astrometry propagation to epoch 2026.0 |
| **Spectral Channels** | `GET` | `/api/spectra/channels` | 24,528 B | **4.88 ms** | **15.52 ms** | 102 channels with dichroic boundary metadata |
| **Spectral Extraction** | `GET` | `/api/spectra/barnards-star` | 24,723 B | **1,666.63 ms** | **1,703.94 ms** | Multi-detector FITS pixel flux extraction |
| **Light Curves** | `GET` | `/api/lightcurves/r-draconis` | 3,339 B | **14.85 ms** | **23.36 ms** | Multi-epoch photometric time-series |
| **Missions Catalog** | `GET` | `/api/missions` | 7,980 B | **15.53 ms** | **15.64 ms** | Citizen-science missions & stage content |
| **Time Machine Manifest** | `POST` | `/api/comparison/manifest` | 271,552 B | **2.55 ms** | **25.07 ms** | Cached multi-epoch pre-rendered frame payload |
| **Copilot Health Status** | `GET` | `/api/assistant/status` | 179 B | **14.95 ms** | **24.04 ms** | SQLite rate limiter and token budget inquiry |
| **Copilot Fast Navigation** | `POST` | `/api/assistant/query` | 407 B | **15.53 ms** | **15.59 ms** | Instant deterministic intent recognition (0 tokens) |

---

## 3. Frontend Bundle & Asset Performance

Measured via production build `tsc -b && vite build`:

| Asset File | Uncompressed Size | Gzip Size | Optimization Status |
| :--- | :---: | :---: | :--- |
| `dist/index.html` | 1.64 kB | 0.72 kB | Optimized |
| `dist/assets/index-*.css` | 125.29 kB | 22.59 kB | Tailwind & cinematic stylesheet bundles |
| `dist/assets/index-*.js` | 4,126.86 kB | 1,259.36 kB | Includes Three.js, Aladin Lite, Lucide, Framer Motion |

*Recommendation:* Future releases can leverage dynamic `import()` code-splitting on workspace routes (`/spectra`, `/explore`) to reduce initial JS payload below 1 MB.

---

## 4. Hardware Sizing & Cloud Resource Recommendations

Based on measured memory usage (~145 MB steady-state backend worker RSS) and astronomical FITS array processing:

| Metric | Minimum Requirement | Recommended Production (GCE) |
| :--- | :---: | :---: |
| **Machine Type** | `e2-small` (1 vCPU, 2 GB RAM) | **`e2-medium`** (1 vCPU, 4 GB RAM) or **`e2-standard-2`** |
| **Persistent Disk** | 10 GB Standard Disk | **20 GB Balanced Persistent Disk** (FITS & preview caches) |
| **Network Egress** | Standard Tier | Premium Tier (for low-latency astronomical tiles) |
