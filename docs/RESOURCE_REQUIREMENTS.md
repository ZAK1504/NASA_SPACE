# Resource requirements and compatibility gates

Audit date: 2026-11-15. Source snapshot: [main 14286d5](https://github.com/ZAK1504/NASA_SPACE/tree/14286d5a69a92059a8b22761ee73fb4b20215510). All provider links below were consulted or identified for verification on this date. Findings are static-source observations, not deployed benchmarks. No cloud resources, billing, or application code were changed.

## Workload evidence
FITS streaming and memmap in backend/app/services/fits_service.py; copy of image data, potential 3D nanmedian and masks. Image processing and reprojection in image_processing_service.py and alignment_service.py; comparison and detection in comparison.py, difference_service.py; stacks in processing.py (2–10 exposures). Manifest archive discovery scans disk and may download missing observations (30s requests timeout, query limit 100). Spectra router streams/caches PNG tiles and uses 8 threads for preload. Base64 output in preview, manifest and comparison. No durable queue identified. Browser uses WebGL, 3D GLB and Aladin; no server GPU identified.
## Estimates (not measured)
| Item | Planning value | Validation |
|---|---|---|
| Idle FastAPI | 0.3–0.8 GB RSS | /usr/bin/time -v startup; ps RSS after imports |
| Typical job | 1–3 GB total | single preview, 2–3 epoch manifest, stack, difference, spectrum |
| Heavy peak | 4–8+ GB possible | max allowed FOV, 10 exposures, cube access, concurrency test |
| CPU | 2 ARM cores initial, 1 heavy job | wall time and CPU seconds separately; BLAS thread caps |
| Disk | 50 GB OS boot, 100 GB data volume; 40–60 GB cache cap | du, df, cache eviction and warm/cold test |
| Network | 60 MB per Level 2 file illustrative; 12 files ~720 MB; 1000 x 1 MB response ~1 GB | record actual transfer and output sizes |
| Cold start | unknown; persistent VM avoids scale-to-zero | test after service restart |
| Worker | start one heavy job, queue 5; 2 downloads max | concurrent API health and overload test |
2040x2040 float32 array = 16,646,400 B (~15.9 MiB); float64 ~31.8 MiB. Ten float32 arrays ~159 MiB before copies, masks, variance and temporary intermediates. 512x512x102 float32 cube ~102 MiB for one extension. Base64 expands binary ~4/3 before JSON overhead. Actual memory may exceed estimate due to dtype promotion, FITS extensions, plotting, reprojection, cube reduction and concurrency. Do not load entire archive.
## ARM64 gate
No runtime version pin. Propose CPython 3.12 + Ubuntu ARM64 only after wheel/build test. On actual ARM test host: python -m venv .venv; . .venv/bin/activate; python -m pip install --upgrade pip; pip install -r requirements.txt; pip check; python -c 'import numpy, scipy, astropy, photutils, reproject, matplotlib, astroquery, pyvo; print("imports OK")'; python -m pytest -q. Capture platform.machine(), versions, resolved transitive dependencies. Prefer binary wheels in dry-run (pip download --only-binary=:all: -r requirements.txt); verify any source builds including BLAS/CFITSIO dependencies. Lock successful environment, separate pytest into dev requirements. No native ARM validation was executed here. OCI A1 is conditionally feasible; x86 Cloud Run alternative if ARM fails.
## Benchmark plan
In isolated staging with separate persistent data, run cold and warm: startup; archive search; one actual FITS download; 2-epoch manifest for all five targets; entirely uncached arbitrary coordinates outside cached footprints; preview; WCS alignment and difference; 10-exposure stack if real available; spectrum extraction; 100-plane preload and playback; light curves; simultaneous requests. Capture wall time, peak process RSS, CPU time, bytes in/out, cache growth, HTTP status, actual product/date/provenance; include failure and timeout cases. Use /usr/bin/time -v for isolated benchmark scripts and psutil/cgroup metrics for API process. Do not report values until measured. Verify cancellation, no wrong-field substitution, no mislabeled channels.
## Storage
Keep persistent disk for FITS, query metadata, preview and HiPS cache. Protect pinned genuine demo observations; LRU eviction for other files, size/age caps, atomic writes, per-product locks, disk free reserve at least 10 GB; purge incomplete temporary downloads on failure. Avoid raw FITS delivery to browsers. Use immutable cache headers only for verified content, release/product/settings-based keys. Browser-local journal is separate from disposable cache; if server-owned use private transactional SQLite and backups. No blanket deletion or full archive copy.
