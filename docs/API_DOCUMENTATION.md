# SPHEREx HORIZON — Scientific REST API Documentation

**Version:** 1.0.0 (Post-Scientific Recovery)  
**Base URL:** `http://localhost:8000/api`  
**Interactive Docs (Swagger UI):** `http://localhost:8000/docs`  
**OpenAPI Specification:** `http://localhost:8000/openapi.json`  

---

## 1. Archive & Observations Endpoints

### 1.1 `GET /api/archive/search`
Queries the official NASA/IPAC IRSA SPHEREx archive (`spherex.obscore`) using IVOA TAP cone search with strict astronomical coordinate bounds.

**Query Parameters:**
| Parameter | Type | Required | Range | Description |
|---|---|---|---|---|
| `ra` | `float` | Yes | `[0.0, 360.0]` | Right Ascension in decimal degrees (J2000) |
| `dec` | `float` | Yes | `[-90.0, +90.0]` | Declination in decimal degrees (J2000) |
| `radius_deg` | `float` | No | `(0.0, 5.0]` | Search radius in degrees (default: `0.5`) |
| `bandpass` | `string` | No | `SPHEREx-D1` to `D6` | Filter by detector array |
| `limit` | `int` | No | `[1, 200]` | Maximum records to return (default: `50`) |

**Response (HTTP 200):**
```json
{
  "ra": 269.452,
  "dec": 4.693,
  "radius_deg": 0.5,
  "total_found": 39,
  "products": [
    {
      "obs_id": "2026W34_2A_0249_1",
      "collection": "spherex_dr1",
      "ra": 269.8912,
      "dec": 4.8131,
      "bandpass": "SPHEREx-D2",
      "wavelength_min_um": 1.11,
      "wavelength_max_um": 1.64,
      "date_obs": "2026-08-21 17:16:20",
      "access_url": "https://irsa.ipac.caltech.edu/datalink/...",
      "calib_level": 2,
      "pixel_scale_arcsec": 6.15,
      "is_real_data": true,
      "archive_source": "NASA/IPAC IRSA"
    }
  ],
  "archive_url": "https://irsa.ipac.caltech.edu/TAP",
  "query_time_seconds": 0.042,
  "cached": true
}
```

---

## 2. Scientific Image Processing & Stacking

### 2.1 `POST /api/processing/preview`
Generates an Astropy WCS-centered cutout from authentic NASA SPHEREx Level 2 FITS products. Synthetic Gaussian images are never substituted.

**Request Body:**
```json
{
  "ra": 269.4521,
  "dec": 4.6933,
  "fov_arcsec": 180.0,
  "stretch": "asinh",
  "colormap": "inferno",
  "lower_percentile": 0.5,
  "upper_percentile": 99.5
}
```

**Response (HTTP 200):**
```json
{
  "image_base64": "data:image/png;base64,iVBORw0KG...",
  "metadata": {
    "stretch": "asinh",
    "colormap": "inferno",
    "vmin": 0.124,
    "vmax": 3.841,
    "dimensions": [29, 29]
  },
  "scientific_metadata": {
    "telescope": "SPHEREx",
    "instrument": "SPHEREx",
    "obs_id": "2026W34_2A_0249_1",
    "date_obs": "2026-08-21T17:16:20.786",
    "bunit": "MJy / sr",
    "bandpass": "SPHEREx-D2",
    "pixel_scale_arcsec": 6.15,
    "calib_level": 2,
    "is_real_data": true,
    "archive_source": "NASA/IPAC IRSA"
  }
}
```

### 2.2 `POST /api/processing/stack`
Performs multi-exposure co-addition (median or mean stacking) across authentic SPHEREx calibrated cutouts to boost signal-to-noise.

**Request Body:**
```json
{
  "num_exposures": 3,
  "method": "median",
  "target_name": "Barnard's Star",
  "ra": 269.4521,
  "dec": 4.6933,
  "fov_arcsec": 180.0
}
```

---

## 3. Astrometric Multi-Epoch Comparison

### 3.1 `POST /api/comparison/align`
Reprojects two genuine SPHEREx observation epochs onto a common tangential grid using `reproject_interp`, performs sigma-clipped background matching, computes the scientific difference image ($\text{Later} - \text{Earlier}$), and runs `DAOStarFinder` candidate detection.

**Request Body:**
```json
{
  "obs_id_1": "2025W35_1A_0444_3",
  "obs_id_2": "2026W34_2A_0249_1",
  "target_name": "Barnard's Star",
  "center_ra": 269.4521,
  "center_dec": 4.6933,
  "cutout_size_arcsec": 180.0,
  "stretch": "asinh",
  "colormap": "inferno"
}
```

**Response (HTTP 200):**
```json
{
  "observation_1": {
    "obs_id": "2025W35_1A_0444_3",
    "date_obs": "2025-08-27T06:42:07.665",
    "bunit": "MJy / sr"
  },
  "observation_2": {
    "obs_id": "2026W34_2A_0249_1",
    "date_obs": "2026-08-21T17:16:20.786",
    "bunit": "MJy / sr"
  },
  "common_footprint": true,
  "overlap_area_arcmin2": 26.4,
  "epoch1_image_base64": "data:image/png;base64,...",
  "epoch2_image_base64": "data:image/png;base64,...",
  "difference_image_base64": "data:image/png;base64,...",
  "aligned": true,
  "reprojection_performed": true,
  "candidates": [
    {
      "id": "e4b1a82c",
      "target_name": "Barnard's Star Candidate V1",
      "ra": 269.4521,
      "dec": 4.6933,
      "angular_displacement_arcsec": 2.74,
      "candidate_type": "variable_source",
      "confidence": "high",
      "explanation": "Astrometric stability benchmark confirms displacement of 2.74\" (<0.5 pixels) across 359-day baseline."
    }
  ]
}
```

---

## 4. Spectroscopy & Light Curves

### 4.1 `GET /api/spectra/{object_id}`
Returns all 102 SPHEREx near-infrared spectral channels, explicitly flagging channels 51 and 52 as the $2.42\ \mu\text{m}$ Dichroic Gap, and providing genuine Level 2 calibrated fluxes.

### 4.2 `GET /api/lightcurves/{object_id}`
Returns photometric time-series with explicit data source provenance (`"literature_reference_baseline"` vs `"authentic_spherex_l2"`).
