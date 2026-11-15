# 11 — Google Cloud Production Readiness Audit

## 1. Intended Production Architecture

```
                    Internet HTTPS (Port 443)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Google Compute Engine (VM)                  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                 Caddy Web Server                    │   │
│   │   - Automatic Let's Encrypt TLS (spherexplore.earth)│   │
│   │   - Serves static frontend (/var/www/spherex/dist)  │   │
│   │   - Reverse proxies /api/* to 127.0.0.1:8000        │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │ HTTP (Loopback Only)         │
│                              ▼                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              FastAPI (systemd service)              │   │
│   │   - Bound to 127.0.0.1:8000 (Internal Only)         │   │
│   │   - Reads GROQ_API_KEY from /etc/spherex/backend.env│   │
│   │   - Persistent SQLite token budget (/var/data/db)   │   │
│   │   - FITS scientific cache (/var/data/fits)          │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure & Security Readiness Checklist

| Inspection Item | Production Requirement | Audit Finding | Status |
| :--- | :--- | :--- | :---: |
| **Domain & TLS** | Valid DNS pointing to static IP with HTTPS on `spherexplore.earth` | Caddy handles automated TLS renewal; HTTP automatically redirects to HTTPS. | **PASS** |
| **Port Binding** | Backend bound strictly to loopback (`127.0.0.1:8000`) | FastAPI `--host 127.0.0.1` ensures port 8000 is unreachable externally. | **PASS** |
| **Firewall Rules** | Only ingress ports 80 (HTTP) and 443 (HTTPS) exposed | GCE firewall rules default-deny all external traffic except HTTP/HTTPS. | **PASS** |
| **SSE Streaming** | Caddy reverse proxy supports Server-Sent Events | Caddy natively handles unbuffered HTTP streaming with appropriate timeouts. | **PASS** |
| **Secret Isolation** | `GROQ_API_KEY` stored exclusively in server environment | Zero credentials in frontend static build or public GitHub repository. | **PASS** |
| **Build Pipeline** | Cloud Build triggers deploy from GitHub `main` | Automatic deployment preserves persistent data disk mounts across builds. | **PASS** |

---

## 3. Cost & Billing Protection Summary

- **GCE VM Instance (`e2-medium`):** ~$24.46 / month.
- **Persistent Disk (20 GB Balanced SSD):** ~$2.00 / month.
- **Static External IP:** ~$2.92 / month.
- **Groq AI Cost Protection:**
  - Hard daily limit: **150,000 tokens / day** ($0.00 on supported tier or <$0.05/day on paid tier).
  - Monthly inference expenditure strictly capped at under **$1.50 / month**.
- **Total Estimated Operating Cost:** **~$30 – $35 / month**.
