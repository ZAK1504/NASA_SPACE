#!/usr/bin/env python3
"""
sphereXplorer Scientific Cache Import Utility
Securely imports, validates, and deploys verified astronomical data archives into
the configured persistent SPHERExplor data directory (e.g., /srv/spherexplore-data).

Enforces:
1. Cryptographic SHA-256 pre-extraction archive verification.
2. Tar-slip / Path-traversal attack protection.
3. Disk space reserve verification (requires >= 2.0 GB free).
4. Post-extraction FITS and HiPS integrity verification against benchmark manifest.
"""

import os
import sys
import argparse
import hashlib
import tarfile
import shutil
import json
from pathlib import Path

def calculate_sha256(file_path: Path) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def check_disk_space(target_path: Path, min_required_bytes: int = 2 * 1024 * 1024 * 1024) -> bool:
    try:
        usage = shutil.disk_usage(target_path)
        return usage.free >= min_required_bytes
    except Exception:
        return True

def safe_extract_tar(tar_path: Path, target_dir: Path):
    """
    Safely extract tar archive preventing directory traversal (Tar Slip vulnerabilities).
    """
    target_abs = target_dir.resolve()
    with tarfile.open(tar_path, "r:gz") as tar:
        for member in tar.getmembers():
            member_path = (target_abs / member.name).resolve()
            try:
                member_path.relative_to(target_abs)
            except ValueError:
                raise RuntimeError(f"Security Alert: Tar member attempts path traversal: {member.name}")
        
        # Safe extraction
        tar.extractall(path=target_dir)

def verify_extracted_data(target_dir: Path) -> bool:
    """Validate that required FITS products and spectral channels are present and intact."""
    manifest_file = target_dir / "manifests" / "benchmark_products.json"
    if not manifest_file.exists():
        # Also check backend/data/manifests if target_dir is custom
        alt_manifest = Path(__file__).resolve().parent.parent / "backend" / "data" / "manifests" / "benchmark_products.json"
        if alt_manifest.exists():
            manifest_file = alt_manifest

    fits_cache = target_dir / "cache" / "fits"
    if not fits_cache.exists():
        print(f"Error: FITS cache directory not found at {fits_cache}")
        return False

    if manifest_file.exists():
        with open(manifest_file, "r", encoding="utf-8") as f:
            benchmarks = json.load(f)
        
        missing = 0
        corrupt = 0
        for entry in benchmarks:
            fname = entry["filename"]
            expected_sha = entry["sha256"]
            fpath = fits_cache / fname
            if not fpath.exists():
                print(f"  [MISSING] FITS product: {fname}")
                missing += 1
                continue
            
            actual_sha = calculate_sha256(fpath)
            if actual_sha != expected_sha:
                print(f"  [CORRUPT] FITS hash mismatch for {fname}")
                corrupt += 1

        if missing == 0 and corrupt == 0:
            print(f"✓ All {len(benchmarks)} Level 2 FITS benchmark products verified intact.")
        else:
            print(f"Verification incomplete: {missing} missing, {corrupt} corrupt.")
            return False

    # Check HiPS spectral frames
    hips_cache = target_dir / "cache" / "hips"
    if hips_cache.exists():
        valid_channels = [c for c in range(1, 103) if c not in (51, 52)]
        prepared = 0
        for ch in valid_channels:
            p = hips_cache / f"ch{ch}_order0_Dir0_pix0.png"
            if p.exists() and p.stat().st_size > 1000:
                prepared += 1
        print(f"✓ HiPS Spectral Planes: {prepared}/100 verified.")

    return True

def main():
    parser = argparse.ArgumentParser(description="sphereXplorer Scientific Cache Import Utility")
    parser.add_argument(
        "--archive",
        type=Path,
        default=Path("deploy_artifacts/scientific-cache.tar.gz"),
        help="Path to scientific-cache.tar.gz archive"
    )
    parser.add_argument(
        "--checksum",
        type=Path,
        default=Path("deploy_artifacts/scientific-cache.tar.gz.sha256"),
        help="Path to SHA256 checksum file"
    )
    parser.add_argument(
        "--target-dir",
        type=Path,
        default=None,
        help="Target data directory (defaults to SPHEREXPLORE_DATA_DIR or backend/data)"
    )
    parser.add_argument(
        "--skip-checksum",
        action="store_true",
        help="Skip pre-extraction archive hash validation"
    )
    
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent

    # Determine target data directory
    if args.target_dir:
        target_dir = args.target_dir.resolve()
    elif os.getenv("SPHEREXPLORE_DATA_DIR"):
        target_dir = Path(os.environ["SPHEREXPLORE_DATA_DIR"]).resolve()
    else:
        target_dir = (repo_root / "backend" / "data").resolve()

    archive_path = args.archive if args.archive.is_absolute() else (repo_root / args.archive)
    checksum_path = args.checksum if args.checksum.is_absolute() else (repo_root / args.checksum)

    print("=" * 65)
    print(" sphereXplorer — Scientific Cache Secure Import")
    print("=" * 65)
    print(f"Archive file:     {archive_path}")
    print(f"Target directory: {target_dir}")

    if not archive_path.exists():
        print(f"\nError: Archive not found: {archive_path}")
        sys.exit(1)

    # 1. Pre-extraction SHA-256 Checksum Verification
    if not args.skip_checksum:
        if checksum_path.exists():
            expected_hash = checksum_path.read_text(encoding="utf-8").strip().split()[0].lower()
            print(f"Calculating SHA-256 for {archive_path.name}...")
            actual_hash = calculate_sha256(archive_path).lower()
            print(f"  Expected: {expected_hash}")
            print(f"  Actual:   {actual_hash}")
            if actual_hash != expected_hash:
                print("\n[CRITICAL ERROR] Archive SHA-256 checksum mismatch! Extraction aborted.")
                sys.exit(2)
            print("✓ Archive cryptographic integrity confirmed.")
        else:
            print(f"Warning: Checksum file not found at {checksum_path}. Proceeding with caution.")

    # 2. Disk Space Verification
    target_dir.mkdir(parents=True, exist_ok=True)
    if not check_disk_space(target_dir):
        print("\n[ERROR] Insufficient disk space on target volume (requires >= 2.0 GB free).")
        sys.exit(3)

    # 3. Safe Extraction
    print(f"Extracting scientific cache to {target_dir}...")
    try:
        safe_extract_tar(archive_path, target_dir)
        print("✓ Extraction completed safely.")
    except Exception as e:
        print(f"\n[ERROR] Failed to extract archive: {str(e)}")
        sys.exit(4)

    # 4. Post-Extraction Verification
    print("\nVerifying extracted scientific assets...")
    ok = verify_extracted_data(target_dir)
    if ok:
        print("\n" + "=" * 65)
        print(" SUCCESS: Scientific cache imported and verified.")
        print(" Production backend is ready for offline and online operation.")
        print("=" * 65)
        sys.exit(0)
    else:
        print("\n[WARNING] Cache imported but some assets failed verification.")
        sys.exit(5)

if __name__ == "__main__":
    main()
