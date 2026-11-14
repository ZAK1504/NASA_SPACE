# SPHEREx HORIZON — Interactive Cosmic Discovery Platform

[![NASA Space Apps Challenge 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026-blue.svg)](https://www.spaceappschallenge.org/)
[![Python 3.14](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![Astropy](https://img.shields.io/badge/Astropy-7.0-orange.svg)](https://www.astropy.org/)

> **"Explore the sky. Track what moves. Discover what changes."**  
> *NASA Space Apps Challenge 2026 — Planet X and SPHEREx*

---

## 🌌 What is SPHEREx HORIZON?

**SPHEREx HORIZON** is an interactive, public-facing astronomy exploration and citizen-science platform built using authentic NASA SPHEREx (*Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer*) infrared astronomical observations.

SPHEREx surveys the entire celestial sphere in infrared light across **102 spectral channels** ($0.75\ \mu\text{m} \to 5.0\ \mu\text{m}$) across 6 detector arrays (D1 to D6).

SPHEREx HORIZON transforms complex multi-extension FITS data and IVOA TAP archive queries into an intuitive, visually stunning, and scientifically rigorous web experience accessible to students, amateur astronomers, and researchers alike.

---

## 🔭 Key Capabilities & What Users Can Do

### 1. Interactive Celestial Sky Atlas (Aladin Lite v3)
- Navigate the full celestial sphere using CDS Aladin Lite with smooth pan and zoom.
- Multi-wavelength background survey switcher: **DSS2 Color (Optical)**, **2MASS (Near-Infrared J/H/Ks)**, and **AllWISE (Mid-Infrared)**.
- Real-time **RA / Dec coordinate tracking** under the cursor in decimal degrees and sexagesimal format.
- **Offline Curated Astronomical Name Resolver**: Instantly resolve names like *Vega, Sirius, Betelgeuse, Barnard's Star, WISE 0855, TRAPPIST-1, or M31* without remote server latency.

### 2. Multi-Epoch Astronomical Time Machine
- **Blink Comparator Mode**: Rapidly alternate between observation epochs at 1 Hz, 2 Hz, or 4 Hz (the exact technique Clyde Tombaugh used to discover Pluto).
- **Split-Screen Slider**: Interactive draggable divider revealing subtle stellar motion between observations.
- **Side-by-Side View**: Synchronized zoom and pan between two distinct observation visits.
- **Scientific Difference Image**: Computes $\text{Epoch 2} - \text{Epoch 1}$ using Astropy `reproject` and background subtraction to produce a residual map highlighting proper-motion dipoles.

### 3. Photometric Light Curve Explorer
- Interactive time-series brightness charts for pulsating and variable stars across SPHEREx infrared visits.
- **Phase Folding**: Toggle between Modified Julian Date (MJD) timeline and **Phase-Folded View ($0.0 \to 1.0$)** to inspect periodic pulsations.
- **Photometric Error Bars**: View calibrated flux ($\mu\text{Jy}$) and apparent magnitude ($m$) with $\pm 1\sigma$ uncertainties.
- Featured targets:
  - **R Draconis**: Mira-type carbon star pulsating on a 245.6-day cycle ($\Delta m \approx 2.35\text{ mag}$).
  - **RW Aurigae**: Classical T Tauri star with circumstellar protoplanetary disk occultation dips ($\Delta m \approx 2.85\text{ mag}$).
  - **Barnard's Star**: Stable photometric baseline benchmark ($<0.06\text{ mag}$).
  - **WISE 0855**: Cold brown dwarf showing rotational weather/cloud modulation ($\sim 8.4\text{ hours}$).

### 4. Discovery Lab & Multi-Exposure Image Stacking
- **Source Detection**: Uses Astropy `photutils` (`DAOStarFinder`) to detect candidate moving or variable sources ($>5\sigma$).
- **Displacement & Proper Motion**: Computes angular displacement in arcseconds and estimated proper motion in $\text{mas/yr}$.
- **Multi-Exposure Co-Addition (Stacking Engine)**: Median or weighted-mean stacking of multiple exposures ($N=3, 5, 8$) to suppress Poisson read noise and boost signal-to-noise ratio ($S/N \approx \sqrt{N}$), bringing faint brown dwarfs out of the background.
- **Discovery Journal**: Record and export candidate discoveries with notes, timestamps, and confidence ratings to reproducible Markdown (`.md`).

### 5. 102-Band Spectral Cube Explorer
- Explore energy distributions across SPHEREx's 6 detector arrays (D1 through D6, $0.75\ \mu\text{m} \to 5.0\ \mu\text{m}$).
- **Molecular Absorption Line Markers**: Interactive visual tags identifying:
  - **Water Ice ($H_2O$)** at $3.05\ \mu\text{m}$ (protoplanetary disks & brown dwarfs)
  - **Carbon Dioxide Ice ($CO_2$)** at $4.27\ \mu\text{m}$
  - **Carbon Monoxide ($CO$)** at $4.67\ \mu\text{m}$
  - **Paschen-Beta ($Pa\text{-}\beta$)** stellar hydrogen accretion line at $1.28\ \mu\text{m}$
- **Dichroic Gap Compliance**: Correctly identifies and displays blank channels 51 and 52 near the instrument's dichroic beam splitter without interpolating fake data.

### 6. Cross-Mission Catalog Integration
- **Gaia DR3 Astrometry**: Displays total proper motion ($\mu$ in $\text{mas/yr}$), $\mu_\alpha \cos\delta$, $\mu_\delta$, parallax ($\varpi$), astrometric distance in light-years, and Gaia $G/BP/RP$ mean magnitudes.
- **AllWISE Infrared**: Historical mid-infrared measurements across $W1$ ($3.4\ \mu\text{m}$), $W2$ ($4.6\ \mu\text{m}$), $W3$ ($12\ \mu\text{m}$), and $W4$ ($22\ \mu\text{m}$).
- **SIMBAD Database**: Primary identifiers, known aliases, spectral classifications, and literature citations.
- **JPL Horizons**: Automated solar system interloper / asteroid verification.

### 7. Guided Citizen-Science Missions
- **Mission 01 — The Moving Star**: Step-by-step investigation of Barnard's Star proper motion, blink comparison, and knowledge verification quiz with a completion certificate.
- **Mission 02 — The Coldest World**: Hunting the cold brown dwarf WISE 0855 in infrared light.
- **Mission 03 — The Pulsating Giant**: Tracking stellar pulsations in R Draconis.

### 8. Cosmic Copilot & Command Palette (`Ctrl+K`)
- Floating interactive assistant with quick-action navigation pills and astronomy Q&A.
- Global command palette (`Ctrl+K` or `⌘K`) to jump directly to any target, mission, or tool.

---

## 🛠️ Architecture & Technology Stack

```
nasademo/
├── frontend/                     # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── assistant/        # CosmicCopilot floating assistant
│   │   │   ├── astronomy/        # ObjectCard, StarField particle animation
│   │   │   ├── layout/           # Sidebar, TopBar, MobileNav, Layout
│   │   │   ├── navigation/       # CommandPalette (Ctrl+K)
│   │   │   └── ui/               # Button, Badge, Card, CoordDisplay, InfoPanel
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Cinematic hero, live preview, featured targets
│   │   │   ├── ExploreSky.tsx    # Interactive Aladin Lite sky map
│   │   │   ├── ObjectExplorer.tsx# Search & filter celestial targets
│   │   │   ├── ObjectDetail.tsx  # Overview, Observations, Spectra, Catalogs
│   │   │   ├── TimeMachine.tsx   # Blink, Split Slider, Side-by-Side, Difference
│   │   │   ├── LightCurves.tsx   # Photometric variability & phase folding
│   │   │   ├── DiscoveryLab.tsx  # DAOStarFinder & Image Stacking Engine
│   │   │   ├── SpectralExplorer.tsx # 102 Near-IR bands & molecular lines
│   │   │   ├── Missions.tsx      # Guided interactive astronomy missions
│   │   │   ├── MyDiscoveries.tsx # Journal & Markdown export
│   │   │   └── About.tsx         # Science attribution & SPHEREx mission specs
│   │   └── services/api.ts       # Typed client for backend REST API
│   └── vite.config.ts            # Vite proxy configuration
│
├── backend/                      # Python 3.14 + FastAPI + Scientific Stack
│   ├── app/
│   │   ├── main.py               # FastAPI entry point, CORS, and routers
│   │   ├── config.py             # Environment configuration & cache paths
│   │   ├── routers/              # Modular API endpoints
│   │   │   ├── archive.py        # NASA/IPAC IRSA TAP query
│   │   │   ├── objects.py        # Target database & coordinate resolution
│   │   │   ├── observations.py   # SPHEREx observation queries
│   │   │   ├── processing.py     # Astropy AsinhStretch & Image Stacking
│   │   │   ├── comparison.py     # Cross-epoch WCS alignment & differencing
│   │   │   ├── lightcurves.py    # Multi-epoch photometric time-series
│   │   │   ├── catalogs.py       # Gaia DR3 & AllWISE cross-matches
│   │   │   ├── spectra.py        # 102 spectral channels & molecular lines
│   │   │   ├── missions.py       # Guided educational missions
│   │   │   ├── discoveries.py    # User discovery journal persistence
│   │   │   └── assistant.py      # Cosmic Copilot knowledge base
│   │   └── services/             # Core scientific computation services
│   │       ├── irsa_service.py   # NASA/IPAC IRSA TAP (spherex.obscore) cone search
│   │       ├── fits_service.py   # Astropy FITS parser, HDU inspector, WCS
│   │       ├── coordinate_service.py # Astropy SkyCoord & offline catalog resolver
│   │       ├── image_processing_service.py # AsinhStretch, Percentiles, Colormaps
│   │       ├── lightcurve_service.py # Multi-epoch photometric time-series
│   │       ├── catalog_service.py # Gaia DR3 & AllWISE cross-matching
│   │       ├── alignment_service.py # WCS alignment & Reproject interpolation
│   │       ├── difference_service.py # Difference imaging & DAOStarFinder
│   │       └── spectral_service.py # 102 LVF channels across detectors D1–D6
│   └── tests/                    # Automated scientific test suite (pytest)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or higher, tested on Python 3.14)

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest tests/

# Launch backend server (runs on http://localhost:8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev

# Or build for production
npm run build
```

Open your browser to `http://localhost:5173`.

---

## 📡 Official Data Sources & Scientific References

- **NASA/IPAC Infrared Science Archive (IRSA)**:
  - SPHEREx TAP Service: `https://irsa.ipac.caltech.edu/TAP` (`spherex.obscore`)
  - SPHEREx SIA2 Endpoint: `https://irsa.ipac.caltech.edu/SIA`
- **Documentation Authorities**:
  - [SPHEREx Mission Overview](https://irsa.ipac.caltech.edu/Missions/spherex.html)
  - [SPHEREx Data Products](https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-products/)
  - [SPHEREx DR1 Overview](https://irsa.ipac.caltech.edu/data/SPHEREx/docs/overview_dr1.html)
- **Catalogs**:
  - **Gaia DR3** (European Space Agency)
  - **AllWISE** (NASA / IPAC / Caltech)
  - **CDS SIMBAD** (Centre de Données astronomiques de Strasbourg)

---

## 📜 Scientific Responsibility & Ethics
- **Authentic Observations Only**: No fabricated celestial imagery or synthetic discovery claims.
- **Transparent Uncertainties**: Every photometric and astrometric measurement displays its estimated standard error ($\pm 1\sigma$).
- **No Sign-Up or Paywall**: Openly accessible to anyone with an internet connection.

---

## 👥 Team & Acknowledgments
Built for **NASA Space Apps Challenge 2026**.  
Special thanks to the **NASA / JPL / Caltech SPHEREx Science Team** and **NASA/IPAC IRSA** for making space science data publicly accessible.
