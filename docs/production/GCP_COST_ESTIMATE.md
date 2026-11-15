# SPHEREx HORIZON — Google Cloud Platform Production Cost Model & Post-Trial Strategy

**Target Machine:** `e2-standard-2` (2 vCPUs, 8 GB RAM, 50 GB Persistent Disk)  
**Region:** `us-central1` (Iowa, USA)  
**Primary Funding Source:** NASA Space Apps Challenge 2026 Google Cloud Promotional Credit  
**Target Audience:** Project Leads, DevOps Engineers, FinOps / Billing Administrators  

---

## 1. Executive Cost Summary

SPHEREx HORIZON is hosted on a single Google Compute Engine virtual machine to minimize infrastructure complexity and maintain predictability.

| Cost Component | Monthly Cost (USD) | NASA Credit Burn Rate | Post-Trial Free Tier Eligibility |
| :--- | :--- | :--- | :--- |
| **Compute Engine (`e2-standard-2`)** | \$48.92 | Covered by credit | Not eligible for Always Free (e2-micro only) |
| **Balanced Persistent Disk (50 GB)** | \$5.00 | Covered by credit | First 30 GB standard disk is Always Free |
| **Network Egress (Estimated 15 GB/mo)** | \$1.80 | Covered by credit | First 1 GB free, then \$0.12/GB |
| **Static External IPv4 Address** | \$2.88 | Covered by credit | \$0.004/hour while instance is attached |
| **Total Estimated Monthly Expenditure** | **\$58.60 / month** | **~\$1.95 / day** | **N/A (Requires Paid or Free Tier Downgrade)** |

> [!IMPORTANT]
> The NASA Space Apps promotional credit is temporary (typically \$300–\$500, valid for 90 days). The `e2-standard-2` instance is **NOT** permanently free. Continuous monitoring and a scheduled post-trial transition plan are mandatory to prevent unexpected personal billing.

---

## 2. Granular Infrastructure Cost Breakdown

### 2.1 Compute Engine Virtual Machine (`e2-standard-2`)
- **vCPU Allocation:** 2 vCPUs (Intel Xeon / AMD EPYC shared core with 2.0–2.2 GHz burst capability).
- **RAM Allocation:** 8.0 GB RAM (comfortably handles 60 MB Level 2 FITS cutouts and 100-channel spectral cube slices).
- **Hourly Rate (`us-central1`):** \$0.067011 / hour.
- **Monthly Compute Total (730 hours):** **\$48.92**

### 2.2 Storage (`pd-balanced` 50 GB)
- **Disk Type:** Balanced Persistent Disk (`pd-balanced`), offering 3,000 IOPS and 140 MB/s throughput.
- **Storage Allocation:**
  - OS & System Packages: ~10 GB
  - Application Releases & Source: ~5 GB
  - Level 2 FITS Calibration Benchmarks: ~1.5 GB
  - Pre-rendered HiPS Spectral Cube Tiles: ~0.5 GB
  - User Journals & Previews: ~2 GB
  - Headroom & Swap: ~31 GB
- **Monthly Rate:** \$0.10 per GB-month.
- **Monthly Disk Total:** **\$5.00**

### 2.3 Network Egress & Bandwidth
- **Architecture Advantage:** Same-origin Caddy reverse proxy compresses assets with gzip/zstd, reducing frontend bundle transfer to ~311 kB on initial load and 0 kB on repeat visits due to HTTP 304 / cache-control immutability.
- **Estimated Monthly Traffic:** ~15 GB transfer to public judges and evaluators.
- **Monthly Bandwidth Total:** **\$1.80**

---

## 3. NASA Space Apps Promotional Credit Runway Analysis

Assuming an initial credit allocation of **\$300.00**:
- **Daily Burn Rate:** \$1.953 / day
- **Credit Runway:** **~153.6 days (~5.1 months)**
- **Safe Evaluation Window:** The application can run uninterrupted throughout the entirety of the NASA Space Apps judging, global finalist review, and public exhibition periods.

---

## 4. Post-Trial Strategy & Migration Roadmap

To prevent unexpected billing once the NASA promotional credit expires, the following 3 options are defined:

```
┌────────────────────────────────────────────────────────┐
│           NASA Promotional Credit Expiration            │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
[Option A: Scale Down] [Option B: Hybrid Cloud] [Option C: Clean Shutdown]
e2-micro (Always Free) Static Frontend on Pages  Snapshot Persistent Disk
Pre-rendered benchmarks FastAPI on Cloud Run     Terminate VM
Monthly Cost: $0.00     Monthly Cost: $0.00      Monthly Cost: $0.00
```

### Option A: Downgrade to Google Cloud "Always Free" Tier (`e2-micro`)
- Google Cloud offers 1 `e2-micro` instance (2 vCPUs, 1 GB RAM) permanently free in `us-central1`, `us-east1`, or `us-west1`.
- **Adaptation:** Downgrade disk to 30 GB (standard persistent disk). Bound memory via aggressive swap. Run backend with `MAX_HEAVY_JOBS=1` and pre-generated cutouts.
- **Resulting Cost:** **\$0.00 / month permanently**.

### Option B: Cloudflare Pages + Google Cloud Run (Serverless)
- Host built static frontend on Cloudflare Pages (100% free with unlimited bandwidth).
- Containerize FastAPI backend and deploy to Google Cloud Run (free tier includes 2 million requests/month and 360,000 GB-seconds memory).
- **Resulting Cost:** **\$0.00 / month for typical evaluation traffic**.

### Option C: Complete Project Preservation & Clean Shutdown
- Execute final automated backup: `bash deploy/gcp/backup.sh`.
- Create a disk snapshot in Google Cloud Console (`gcloud compute disks snapshot`).
- Delete Compute Engine instance: `gcloud compute instances delete horizon-production-vm`.
- Release external static IP: `gcloud compute addresses delete horizon-ip`.
- **Resulting Cost:** **\$0.00 / month**.
