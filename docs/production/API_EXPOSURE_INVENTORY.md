# SPHEREx HORIZON — Complete API Exposure & Security Inventory

**Version:** 1.0.0 Production  
**Base Route:** `/api`  
**Host Binding:** `127.0.0.1:8000` (Internal; reverse proxied via Caddy)  
**Authentication & Session Model:** Anonymous session isolation via `X-Session-ID` header  

---

## 1. API Route Inventory & Security Matrix

| Method | Endpoint Path | Router Tag | Input Schema / Query Parameters | Response Model | Rate Limit / Admission Tier | Security & Isolation Controls |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System | None | HealthResponse | Standard | Masks filesystem paths in `APP_ENV=production` |
| `GET` | `/api/archive/search` | Archive | `ra` [0-360], `dec` [-90, 90], `radius_deg` (0, 5], `bandpass`, `limit` [1, 200] | ArchiveQueryResponse | Standard | Strict astronomical coordinate validation; ADQL injection protection; offline cache fallback |
| `POST` | `/api/processing/preview` | Processing | `PreviewRequest` (`ra`, `dec`, `fov_arcsec` [10, 1800], `stretch`, `colormap`, `fits_url`) | PreviewResponse | **Heavy Job** (Max 1 concurrent, queue max 5) | SSRF validation on `fits_url`; bounded parameter values; in-memory LRU cache |
| `POST` | `/api/processing/stack` | Processing | `StackRequest` (`num_exposures` [2, 10], `method`, `ra`, `dec`, `target_name`) | StackResponse | **Heavy Job** (Max 1 concurrent, queue max 5) | Numerical array bounds; memory allocation safeguards |
| `POST` | `/api/comparison/align` | Comparison | `ComparisonRequest` (`obs_id_1`, `obs_id_2`, `target_name`, `center_ra`, `center_dec`, `cutout_size_arcsec`) | ComparisonResponse | **Heavy Job** (Max 1 concurrent, queue max 5) | Strict WCS alignment; authentic difference imaging without synthetic motion artifacts |
| `POST` | `/api/comparison/manifest`| Comparison | `TimeMachineManifestRequest` (`ra`, `dec`, `target_name`, `cutout_size_arcsec`) | TimeMachineManifestResponse | Standard / Cached | Multi-epoch grouping; fixed coordinate comparisons |
| `GET` | `/api/spectra/barnards-star`| Spectra | None | SpectralDetailResponse | Standard / Static | Calibrated 102-band channel model; explicit Dichroic Gap at channels 51-52 |
| `GET` | `/api/spectra/extract` | Spectra | `ra`, `dec`, `target_name` | SpectralDetailResponse | Standard | Calibrated spectral energy distribution extraction |
| `GET` | `/api/spectra/hips/metadata`| Spectra | None | HiPSMetadataResponse | Standard / Static | Official SPHEREx DR1 All-Sky HiPS Cube specifications |
| `GET` | `/api/spectra/frame/{channel}`| Spectra | `channel` [1, 102] | `image/png` | Standard / Cached | Serves pre-cached DR1 PNG frames; channels 51-52 return 404 with Optical Gap details |
| `GET` | `/api/spectra/hips/{order}/{dir}/{file}`| Spectra | `order`, `dir_val`, `filename` | `image/png` | Standard / Cached | Strict regex validation (`HIPS_DIR_REGEX`, `HIPS_FILENAME_REGEX`); path traversal jail checks |
| `GET` | `/api/spectra/hips/preload/status`| Spectra| `mode` ("all" / "channel") | dict | Standard | Diagnostic audit of HiPS spectral frames on disk |
| `GET` | `/api/discoveries` | Discoveries | `X-Session-ID` Header | List[DiscoveryRecord] | Standard | Isolated to session journal (`DATA_DIR/sessions/journal_{id}.json`); prevents cross-user leakage |
| `POST` | `/api/discoveries` | Discoveries | `X-Session-ID` Header, `DiscoveryCreateRequest` | DiscoveryRecord | Standard | Enforces session regex; atomic file writing; caps records at 100 per session |
| `DELETE`| `/api/discoveries/{id}` | Discoveries | `X-Session-ID` Header, `id` (path) | dict | Standard | Scoped to calling session; cross-session deletion rejected with 404 |
| `GET` | `/api/objects` | Objects | None | List[ObjectRecord] | Standard / Static | Authoritative astronomical catalog data (SIMBAD, Gaia DR3, Luhman) |
| `GET` | `/api/objects/{slug}` | Objects | `slug` (path) | ObjectRecord | Standard / Static | Individual target astrometry and scientific metadata |
| `POST` | `/api/assistant/query` | Assistant | `AssistantQueryRequest` (`prompt`, `context`) | AssistantQueryResponse | Standard | Payload size validation (`max_length=2000`); strictly astronomical domain scope |

---

## 2. Resource Admission Controller & Concurrency Tiers

To protect the 2 vCPU / 8 GB RAM envelope on `e2-standard-2`, endpoints are segregated into two operational tiers:

1. **Standard Tier:** Handled concurrently via standard asynchronous FastAPI event loop (health checks, metadata queries, cached HiPS frame serving, session journals).
2. **Heavy Job Tier (`resource_guard.heavy_job`):**
   - Applies to: `/api/processing/preview`, `/api/processing/stack`, `/api/comparison/align`.
   - Concurrency limit: **1 active heavy scientific operation at a time**.
   - Pending queue capacity: **Up to 5 waiting requests**.
   - Backpressure behavior: If the queue is saturated, incoming requests immediately receive **HTTP 429 Too Many Requests** with header `Retry-After: 5`.
