# Hosting decision matrix

Audit date: 2026-11-15. Source snapshot: [main 14286d5](https://github.com/ZAK1504/NASA_SPACE/tree/14286d5a69a92059a8b22761ee73fb4b20215510). All provider links below were consulted or identified for verification on this date. Findings are static-source observations, not deployed benchmarks. No cloud resources, billing, or application code were changed.

## Weighted scoring (judgment, not benchmark)
Criteria: long-term free 20, compatibility 20, reliability/persistence 15, performance 10, security 10, science compute 10, global accessibility 5, simplicity 5, maintenance 5.
| Architecture | Free | Compat | Reliability | Perf | Sec | Science | Global | Simple | Maint | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Pages + OCI A1 |18|19|10|8|8|9|5|4|3|84|
| Single OCI A1 |18|19|10|7|8|9|3|5|3|82|
| Pages + Cloud Run |12|14|12|7|8|8|5|3|3|72|
| Pages + Azure Container Apps |12|13|11|7|8|8|5|3|3|70|
Scores: OCI gets high free/compat/science because persistent ARM Linux supports existing disk-centric design if dependencies pass; loses reliability for idle reclamation/capacity/single VM, maintenance for OS and TLS. Split frontend gives better global delivery and independent static availability, single VM simpler same-origin. Managed containers score better for managed lifecycle/TLS but lower free/compat due to metered compute, separate storage and refactoring; cold starts reduce performance. Azure storage mounts are possible but separate Azure Files cost. All security scores conditional on hardening.
## Provider screening and official sources (accessed 2026-11-15)
| Provider | Free conditions / constraints | Decision |
|---|---|---|
| Cloudflare Pages | 500 builds/month, 20-minute build timeout, 20k files, 25 MiB each, static CDN, HTTPS, pages.dev; private GitHub integration possible with authorization | Preferred static |
| GitHub Pages | Static only; published site and bandwidth/build limits; private source availability depends on plan | Not preferred for private repository |
| Vercel Hobby | Personal noncommercial usage and quotas; static compatible, no persistent scientific process | Alternative static |
| Netlify Free | Metered free credits and site limits; static compatible | Alternative static |
| OCI Always Free | A1 1500 OCPU-hours, 9000 GB-hours/month (2/12 continuous), 200 GB disk combined, 5 volume backups; free resources in home region; card verification, capacity, idle reclaim; no SLA | Preferred compute |
| Cloud Run | Request billing 180k vCPU-s, 360k GiB-s, 2m requests; region-priced, min 0, ephemeral memory-backed filesystem, max request duration 60 min; billing account, egress/storage/build registry charges possible | Conditional fallback |
| Azure Container Apps | 180k vCPU-s, 360k GiB-s, 2m requests; scale zero; ephemeral storage 8 GiB for >1 vCPU; Azure Files persistent at separate cost, logging/network charges possible | Conditional fallback |
| GCE e2-micro | Eligible US regions, 30 GB standard disk, 1 GB outbound per month; ~1 GB RAM; external IPv4 pricing must be checked | Insufficient headroom |
| Render Free | 750 hours/workspace/month; 15-minute idle sleep, ~1-minute wake, ephemeral disk, no free persistent disk, bandwidth limits | Not suitable as primary |
| Workers Free | 100k requests/day, 10 ms CPU, 128 MB RAM | Not compatible with scientific CPython runtime; optional edge gateway only |
| Supabase Free | 500 MB DB, 1 GB file storage, project inactivity pause; not needed for current journal | Optional after design approval |
| Neon | Managed Postgres with free limits and scale-to-zero; check live plan | Not required; exact plan not audited |
| R2 Standard | 10 GB-month, 1m Class A, 10m Class B, free internet egress; overages metered | Optional for small immutable artifacts, not 60 GB cache |
| Self-hosted computer | No hosting subscription, electricity/connectivity costs, downtime and maintenance | Emergency fallback only |
Official links: https://developers.cloudflare.com/pages/platform/limits/ ; https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits ; https://vercel.com/docs/plans/hobby ; https://www.netlify.com/pricing/ ; https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm ; https://cloud.google.com/run/pricing ; https://cloud.google.com/run/docs/container-contract ; https://cloud.google.com/free/docs/free-cloud-features ; https://learn.microsoft.com/azure/container-apps/billing ; https://learn.microsoft.com/azure/container-apps/storage-mounts ; https://render.com/docs/free ; https://developers.cloudflare.com/workers/platform/limits/ ; https://supabase.com/pricing ; https://neon.com/pricing ; https://developers.cloudflare.com/r2/pricing/
## Costs
| Item | A/B OCI | C Cloud Run | risk |
|---|---|---|---|
| Static | $0/₹0 | $0/₹0 | Pages limits |
| CPU/RAM | $0/₹0 within A1 allowance | $0/₹0 within request-based grant | C metered past grant, regional pricing |
| Disk | $0/₹0 with 50 GB boot + 100 GB data | ephemeral scratch, optional R2/GCS within small allowances | cache growth/storage operations |
| DB | $0/₹0 browser-local or SQLite | browser-local or separate DB | migration/privacy |
| Network | OCI first 10 TB outbound according to price list; confirm other networking resources | regional egress and internet tariffs | quota and traffic abuse |
| Backup | 5 included OCI volume backups; offsite small private backup | small object storage quota only | snapshots/egress/storage |
| Domain/TLS | pages.dev + IP TLS if proven; NASA domain free first year | pages.dev + run.app | domain renewal, IP cost and certificate renewals |
| CI/CD | within GitHub included private minutes | same, registry/build costs separate | private CI minutes/artifacts |
| Monitoring | local logs and capped free monitoring | cloud logging quota | excess log ingestion |
All $0=₹0; no exchange rate conversion needed for zero. Illustrative Cloud Run 2 vCPU/4 GiB at Tier 1 free allowance gives 25 hours active/month before overhead; 30s sequential job gives 3,000 jobs compute-only, not guaranteed. Set max instances and admission controls; budgets are alerts not hard caps. If no paid billing enabled, service may stop rather than exceed grant. No provider guarantees permanent unchanged terms.
## Offer strategy
NASA offer as supplied: Porkbun/GoDaddy eligible domain and hosting/SSL one year; check Python support and renewal, use domain only if suitable. Google $300/90 days and Azure $200/30 days are temporary; student Azure $100/12 months eligibility/renewal https://azure.microsoft.com/en-in/free/students/. No credit consumption or provisioning approved. Planetary Computer and weather API do not replace IRSA. Claim only after deciding cost/terms.
