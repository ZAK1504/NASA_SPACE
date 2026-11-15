#!/usr/bin/env python3
"""
sphereXplorer Scientific Data Bootstrap Script
Ensures reproducible initialization of authentic NASA SPHEREx Level 2 products,
query caches, and HiPS spectral frames on freshly cloned development and production servers.
"""

import os
import sys
import argparse
import hashlib
import json
import shutil
from pathlib import Path
from typing import Dict, Any, List, Optional
import urllib.request
import socket
import ipaddress
from urllib.parse import urlparse

# Add backend to path for app imports if running from repo root
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

CHALLENGE_TARGETS = {
    "barnards-star": {"name": "Barnard's Star (GJ 699)", "ra": 269.4521, "dec": 4.6933},
    "epsilon-indi-b": {"name": "Epsilon Indi B", "ra": 330.8404, "dec": -56.7860},
    "wise-0855": {"name": "WISE 0855-0714", "ra": 133.7862, "dec": -7.2443},
    "rw-aurigae": {"name": "RW Aurigae (V* RW Aur)", "ra": 76.9533, "dec": 30.4014},
    "r-draconis": {"name": "R Draconis (HIP 81634)", "ra": 248.3370, "dec": 66.8697},
    "vela-baseline": {"name": "Vela Reference Field", "ra": 128.8358, "dec": -45.1764}
}

VALID_SPECTRAL_CHANNELS = [c for c in range(1, 103) if c not in (51, 52)]
IPAC_HIPS_ROOT = "https://irsa.ipac.caltech.edu/data/hips/SPHEREx/spherex_allsky_cube"

def calculate_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def is_valid_png(path: Path) -> bool:
    """Verify PNG magic header and minimal valid file size."""
    if not path.exists() or path.stat().st_size < 1000:
        return False
    try:
        with open(path, "rb") as f:
            header = f.read(8)
            return header == b"\x89PNG\r\n\x1a\n"
    except Exception:
        return False

def validate_fits_file(path: Path) -> Dict[str, Any]:
    """Validate FITS structure, header cards, and Astropy celestial WCS."""
    try:
        from astropy.io import fits
        from astropy.wcs import WCS

        with fits.open(path, memmap=True) as hdul:
            hdu_count = len(hdul)
            h0 = hdul[0].header
            h1 = hdul[1].header if hdu_count > 1 else {}
            
            telescope = str(h0.get("TELESCOP", h1.get("TELESCOP", "SPHEREx")))
            date_obs = str(h0.get("DATE-OBS", h1.get("DATE-OBS", "")))
            bunit = str(h1.get("BUNIT", "MJy/sr"))
            
            w = WCS(h1) if hdu_count > 1 else None
            is_celestial = bool(w and getattr(w, "is_celestial", False))
            
            center_ra, center_dec = (0.0, 0.0)
            if is_celestial:
                c = w.pixel_to_world(1020, 1020)
                center_ra = float(c.ra.deg)
                center_dec = float(c.dec.deg)

            return {
                "valid": True,
                "hdu_count": hdu_count,
                "telescope": telescope,
                "date_obs": date_obs,
                "bunit": bunit,
                "wcs_valid": is_celestial,
                "center_ra": center_ra,
                "center_dec": center_dec
            }
    except Exception as e:
        return {"valid": False, "error": str(e)}

def download_file_atomic(url: str, dest_path: Path, max_bytes: int = 150 * 1024 * 1024, timeout: int = 40):
    """Safely stream download to temporary file and atomically rename on complete."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = dest_path.with_suffix(f".tmp_{os.getpid()}")
    req = urllib.request.Request(url, headers={"User-Agent": "sphereXplorer-Bootstrap/1.0"})
    
    total = 0
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            with open(temp_path, "wb") as f:
                while chunk := resp.read(65536):
                    total += len(chunk)
                    if total > max_bytes:
                        raise ValueError(f"Download exceeded maximum permitted size ({max_bytes} bytes)")
                    f.write(chunk)
        temp_path.replace(dest_path)
    except Exception:
        if temp_path.exists():
            temp_path.unlink()
        raise

def bootstrap_scientific_data(
    data_dir: Path,
    targets: Optional[List[str]] = None,
    verify_only: bool = False,
    source_cache: Optional[Path] = None,
    offline: bool = False,
    max_download_mb: int = 2000,
    report_file: Optional[Path] = None
) -> Dict[str, Any]:
    """Execute complete deterministic bootstrap procedure."""
    fits_dir = data_dir / "cache" / "fits"
    hips_dir = data_dir / "cache" / "hips"
    queries_dir = data_dir / "cache" / "queries"
    manifests_dir = data_dir / "manifests"

    fits_dir.mkdir(parents=True, exist_ok=True)
    hips_dir.mkdir(parents=True, exist_ok=True)
    queries_dir.mkdir(parents=True, exist_ok=True)
    manifests_dir.mkdir(parents=True, exist_ok=True)

    manifest_file = manifests_dir / "benchmark_products.json"
    if not manifest_file.exists():
        repo_manifest = REPO_ROOT / "backend" / "data" / "manifests" / "benchmark_products.json"
        if repo_manifest.exists():
            shutil.copy2(repo_manifest, manifest_file)

    if not manifest_file.exists():
        print(f"Error: Benchmark manifest not found at {manifest_file}")
        return {"status": "failed", "error": "Missing benchmark_products.json"}

    with open(manifest_file, "r", encoding="utf-8") as f:
        benchmarks = json.load(f)

    # Filter targets if requested
    if targets and "all" not in targets:
        benchmarks = [
            b for b in benchmarks
            if any(t.lower() in b["matched_target"].lower() for t in targets)
        ]

    print(f"Bootstrap Target Count: {len(benchmarks)} FITS benchmark products.")

    # 1. Import from source_cache if provided
    if source_cache and source_cache.exists():
        print(f"Importing existing verified files from {source_cache}...")
        src_fits = source_cache / "fits" if (source_cache / "fits").exists() else source_cache
        for b in benchmarks:
            src_f = src_fits / b["filename"]
            dst_f = fits_dir / b["filename"]
            if src_f.exists() and not dst_f.exists():
                shutil.copy2(src_f, dst_f)

        src_hips = source_cache / "hips"
        if src_hips.exists():
            for png in src_hips.glob("*.png"):
                dst_png = hips_dir / png.name
                if not dst_png.exists():
                    shutil.copy2(png, dst_png)

        src_queries = source_cache / "queries"
        if src_queries.exists():
            for q in src_queries.glob("*.json"):
                dst_q = queries_dir / q.name
                if not dst_q.exists():
                    shutil.copy2(q, dst_q)

    # 2. Check and verify FITS products
    verified_fits = 0
    missing_fits = []
    fits_results = []

    for b in benchmarks:
        fname = b["filename"]
        expected_sha = b["sha256"]
        fpath = fits_dir / fname
        
        if fpath.exists():
            actual_sha = calculate_sha256(fpath)
            if actual_sha == expected_sha:
                vinfo = validate_fits_file(fpath)
                fits_results.append({
                    "filename": fname,
                    "target": b["matched_target"],
                    "status": "VERIFIED_INTACT",
                    "sha256": actual_sha,
                    "wcs_valid": vinfo.get("wcs_valid", False)
                })
                verified_fits += 1
                continue
            else:
                print(f"  [CORRUPT] Hash mismatch for {fname}. Re-download required.")
                fpath.unlink()

        missing_fits.append(b)

    # 3. Download missing FITS if permitted
    if missing_fits:
        print(f"Missing FITS products: {len(missing_fits)}")
        if offline or verify_only:
            print("  Skipping download (offline or verify-only mode active).")
        else:
            downloaded = 0
            for b in missing_fits:
                url = b.get("archive_url")
                if not url:
                    continue
                dst = fits_dir / b["filename"]
                print(f"  Downloading genuine product: {b['filename']}...")
                try:
                    download_file_atomic(url, dst)
                    if calculate_sha256(dst) == b["sha256"]:
                        print(f"  ✓ Downloaded & verified {b['filename']}")
                        downloaded += 1
                        verified_fits += 1
                    else:
                        print(f"  ✗ Verification failed after download for {b['filename']}")
                        dst.unlink()
                except Exception as e:
                    print(f"  ✗ Download failed: {str(e)}")

    # 4. Verify HiPS Spectral Frames (100 channels)
    hips_verified = 0
    hips_missing = []
    for ch in VALID_SPECTRAL_CHANNELS:
        png_path = hips_dir / f"ch{ch}_order0_Dir0_pix0.png"
        if is_valid_png(png_path):
            hips_verified += 1
        else:
            hips_missing.append(ch)

    if hips_missing and not offline and not verify_only:
        print(f"Fetching {len(hips_missing)} missing HiPS spectral preview frames...")
        for ch in hips_missing:
            tile_idx = 101 if ch == 102 else ch
            url = f"{IPAC_HIPS_ROOT}/Norder0/Dir0/Npix0_{tile_idx}.png"
            dst = hips_dir / f"ch{ch}_order0_Dir0_pix0.png"
            try:
                download_file_atomic(url, dst, max_bytes=2*1024*1024, timeout=10)
                if is_valid_png(dst):
                    hips_verified += 1
            except Exception:
                pass

    summary = {
        "status": "ready" if (verified_fits == len(benchmarks) and hips_verified == 100) else "partial",
        "data_dir": str(data_dir),
        "total_benchmark_fits": len(benchmarks),
        "verified_fits": verified_fits,
        "missing_fits": len(benchmarks) - verified_fits,
        "total_spectral_channels": 100,
        "verified_spectral_channels": hips_verified,
        "query_cache_count": len(list(queries_dir.glob("*.json"))),
        "all_benchmarks_passed": (verified_fits == len(benchmarks)),
        "spectral_frames_ready": (hips_verified == 100)
    }

    if report_file:
        report_file.parent.mkdir(parents=True, exist_ok=True)
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)

    return summary

def main():
    parser = argparse.ArgumentParser(description="sphereXplorer Scientific Data Bootstrap")
    parser.add_argument("--targets", nargs="*", default=["all"], help="Filter targets (e.g. barnards-star)")
    parser.add_argument("--verify-only", action="store_true", help="Audit local scientific assets without downloading")
    parser.add_argument("--source-cache", type=Path, default=None, help="Import from existing local cache directory")
    parser.add_argument("--data-dir", type=Path, default=None, help="Target data directory")
    parser.add_argument("--offline", action="store_true", help="Run strictly offline with no network requests")
    parser.add_argument("--report", type=Path, default=None, help="Path to write JSON summary report")

    args = parser.parse_args()

    if args.data_dir:
        data_dir = args.data_dir.resolve()
    elif os.getenv("SPHEREXPLORE_DATA_DIR"):
        data_dir = Path(os.environ["SPHEREXPLORE_DATA_DIR"]).resolve()
    else:
        data_dir = REPO_ROOT / "backend" / "data"

    print("=" * 65)
    print(" sphereXplorer — Scientific Data Bootstrap")
    print("=" * 65)
    print(f"Data directory: {data_dir}")
    print(f"Mode: {'Verify Only' if args.verify_only else 'Bootstrap / Sync'}")
    print(f"Offline: {args.offline}")

    res = bootstrap_scientific_data(
        data_dir=data_dir,
        targets=args.targets,
        verify_only=args.verify_only,
        source_cache=args.source_cache,
        offline=args.offline,
        report_file=args.report
    )

    print("\n" + "-" * 40)
    print(" Bootstrap Summary")
    print("-" * 40)
    print(f"FITS Products Verified:    {res['verified_fits']}/{res['total_benchmark_fits']}")
    print(f"HiPS Spectral Planes:      {res['verified_spectral_channels']}/100")
    print(f"TAP Query Cache Files:     {res['query_cache_count']}")
    print(f"Status:                    {res['status'].upper()}")

    if res["all_benchmarks_passed"] and res["spectral_frames_ready"]:
        print("\n✓ All scientific benchmark assets are fully operational.")
        sys.exit(0)
    else:
        print("\n[!] Incomplete scientific assets. See details above.")
        sys.exit(1 if args.verify_only else 0)

if __name__ == "__main__":
    main()
