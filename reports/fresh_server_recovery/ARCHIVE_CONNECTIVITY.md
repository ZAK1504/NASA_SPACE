# sphereXplorer — Live Archive Connectivity, Error Discrimination & Reliability Report

**Audit Date:** November 15, 2026  
**Auditor:** Senior Astrophysics Software Engineer & Network Infrastructure Auditor  
**Scope:** NASA/IPAC Infrared Science Archive (IRSA) Protocols & Failure Handling  

---

## 1. Official IRSA Service Audit Summary

sphereXplorer interfaces with four distinct astronomical archive protocols hosted by NASA/IPAC IRSA at Caltech:

| Protocol / Service | Official Base Endpoint | Dev Environment Status | GCP VM Observed Status | Platform Handling |
| :--- | :--- | :---: | :---: | :--- |
| **IVOA TAP (Table Access Protocol)** | `https://irsa.ipac.caltech.edu/TAP` | 200 OK | HTTP 502 Proxy Error | Asynchronous job execution + local spatial query fallback |
| **IVOA SIA (Simple Image Access)** | `https://irsa.ipac.caltech.edu/SIA` | 200 OK | HTTP 502 Proxy Error | Positional cone search with strict spatial limits |
| **Direct FITS Retrieval (IBE)** | `https://irsa.ipac.caltech.edu/ibe/data/spherex/` | 200 OK | 200 OK (Reachable) | Direct HTTPS streaming with SSRF IP and size validation |
| **HiPS All-Sky Spectral Cube** | `https://irsa.ipac.caltech.edu/data/hips/SPHEREx/` | 200 OK | 200 OK (Properties OK) | Pre-cached Order 0–2 tiles with fallback to live IPAC tiles |

---

## 2. Root Cause of Google Cloud IRSA 502 Errors

During the Google Cloud fresh-server deployment, tests targeting `https://irsa.ipac.caltech.edu/TAP/async` and `https://irsa.ipac.caltech.edu/SIA` returned:
```
HTTP/1.1 502 Server Error: Proxy Error
Content-Type: text/html
Error reading from remote server.
```
IPAC's reverse-proxy infrastructure periodically throttles or proxies cloud egress ranges (such as GCP Compute Engine IP blocks) when batch ADQL queries are submitted without authenticated API tokens.

**Critical Defect Identified in Previous Code:**
In the previous implementation of `irsa_service.py`:
```python
# PREVIOUS FLAWED IMPLEMENTATION:
except Exception as e:
    return []  # Silently returned empty list!
```
This masked an upstream proxy outage as a valid scientific search with 0 products, falsely signaling that the queried patch of sky had never been observed by SPHEREx.

---

## 3. Implemented Architectural Corrections

### 3.1 Explicit Scientific Status Discrimination
`irsa_service.py` and `ArchiveQueryResponse` now maintain explicit result classifications:

- **`LIVE_SUCCESS_WITH_PRODUCTS`**: Live IVOA TAP query completed and returned $\ge 1$ authentic records.
- **`LIVE_SUCCESS_EMPTY`**: Live query completed successfully; the queried coordinates are genuinely unobserved.
- **`CACHED_SUCCESS`**: Live service unreachable or offline; authentic local query cache successfully served records.
- **`ARCHIVE_UNAVAILABLE`**: Upstream IRSA returned 502/503/proxy error; no local offline cache covers the region.
- **`QUERY_TIMEOUT`**: TAP asynchronous query exceeded deadline (4.0s) and was safely aborted.
- **`NO_VALID_TARGET_COVERAGE`**: Requested coordinates are outside SPHEREx Level 2 footprints.

### 3.2 Honest Upstream Error Propagation
In `backend/app/routers/archive.py`:
```python
# NEW RESILIENT IMPLEMENTATION:
if status in ("ARCHIVE_UNAVAILABLE", "QUERY_TIMEOUT") and not records:
    raise HTTPException(
        status_code=503,
        detail=f"NASA/IPAC IRSA archive service is temporarily unavailable ({diag.get('error', '502 Server Error')}). No local offline cache covers this coordinate region."
    )
```
If an upstream failure occurs and no offline cache exists, the API returns HTTP 503 Service Unavailable with an honest scientific message, rather than a misleading HTTP 200 with 0 observations.

### 3.3 Offline Spatial Cone Fallback
When live queries time out or fail, `irsa_service._search_cached_tap_inventory()` searches local cached query JSONs using Astropy celestial cone separation (`target_sky.separation(rec_coord).deg <= radius_deg`). This ensures offline stability for all challenge targets even when the external internet is disconnected.
