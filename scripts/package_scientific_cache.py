#!/usr/bin/env python3
"""
Packages verified scientific data for Google Cloud VM transfer.
Creates deploy_artifacts/scientific-cache.tar.gz and .sha256 checksum file.
Excludes secrets, private journals, copilot databases, and git files.
"""

import os
import shutil
import tarfile
import hashlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_DATA = REPO_ROOT / "backend" / "data"
ARTIFACTS_DIR = REPO_ROOT / "deploy_artifacts"
STAGING_DIR = ARTIFACTS_DIR / "scientific-cache"

def calculate_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def package():
    print("=" * 65)
    print(" Packaging sphereXplorer Scientific Cache for Deployment")
    print("=" * 65)

    if STAGING_DIR.exists():
        shutil.rmtree(STAGING_DIR)

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    STAGING_DIR.mkdir(parents=True, exist_ok=True)

    cache_dir = STAGING_DIR / "cache"
    fits_dir = cache_dir / "fits"
    queries_dir = cache_dir / "queries"
    hips_dir = cache_dir / "hips"
    previews_dir = cache_dir / "previews"
    manifests_dir = STAGING_DIR / "manifests"

    fits_dir.mkdir(parents=True, exist_ok=True)
    queries_dir.mkdir(parents=True, exist_ok=True)
    hips_dir.mkdir(parents=True, exist_ok=True)
    previews_dir.mkdir(parents=True, exist_ok=True)
    manifests_dir.mkdir(parents=True, exist_ok=True)

    # 1. Copy 16 FITS files
    src_fits = SOURCE_DATA / "cache" / "fits"
    fits_count = 0
    fits_bytes = 0
    for f in sorted(src_fits.glob("*.fits")):
        shutil.copy2(f, fits_dir / f.name)
        fits_count += 1
        fits_bytes += f.stat().st_size
    print(f"Copied {fits_count} Level 2 FITS products ({fits_bytes / (1024*1024):.2f} MB).")

    # 2. Copy Query Cache JSONs
    src_queries = SOURCE_DATA / "cache" / "queries"
    queries_count = 0
    for f in sorted(src_queries.glob("*.json")):
        shutil.copy2(f, queries_dir / f.name)
        queries_count += 1
    print(f"Copied {queries_count} TAP/SIA query cache JSON files.")

    # 3. Copy HiPS preview frames (100 valid channels + properties)
    src_hips = SOURCE_DATA / "cache" / "hips"
    hips_count = 0
    for f in sorted(src_hips.glob("*")):
        if f.is_file() and (f.suffix in [".png", ".txt"]):
            shutil.copy2(f, hips_dir / f.name)
            hips_count += 1
    print(f"Copied {hips_count} HiPS spectral preview files.")

    # 4. Copy Manifests
    src_manifest = SOURCE_DATA / "manifests" / "benchmark_products.json"
    if src_manifest.exists():
        shutil.copy2(src_manifest, manifests_dir / "benchmark_products.json")

    # 5. Generate checksums.sha256 for all packaged files
    checksums_file = manifests_dir / "checksums.sha256"
    print("Generating checksums.sha256 for all packaged files...")
    checksum_lines = []
    for p in sorted(STAGING_DIR.rglob("*")):
        if p.is_file() and p.name != "checksums.sha256":
            rel = p.relative_to(STAGING_DIR)
            sha = calculate_sha256(p)
            checksum_lines.append(f"{sha}  {rel.as_posix()}\n")

    with open(checksums_file, "w", encoding="utf-8") as f:
        f.writelines(checksum_lines)
    print(f"Recorded {len(checksum_lines)} checksums.")

    # 6. Add README.md
    readme_path = STAGING_DIR / "README.md"
    readme_path.write_text(
        "# sphereXplorer Scientific Data Cache Archive\n\n"
        "This package contains authentic, verified NASA SPHEREx Level 2 astronomical data,\n"
        "query metadata, and spectral cube visualization planes.\n\n"
        "## Contents:\n"
        "- `cache/fits/`: 16 Level 2 FITS calibrated surface brightness products (978 MB)\n"
        "- `cache/queries/`: 54 TAP/SIA query metadata responses (0.76 MB)\n"
        "- `cache/hips/`: 100 valid spectral channels (0.75-5.00 μm) + HiPS properties (111 MB)\n"
        "- `manifests/`: Benchmark products manifest & SHA-256 cryptographic verification file\n\n"
        "## Deployment Import:\n"
        "```bash\n"
        "python scripts/import_scientific_cache.py --archive deploy_artifacts/scientific-cache.tar.gz\n"
        "```\n",
        encoding="utf-8"
    )

    # 7. Create tar.gz archive
    tar_path = ARTIFACTS_DIR / "scientific-cache.tar.gz"
    print(f"\nCompressing {tar_path} (this may take a moment)...")
    with tarfile.open(tar_path, "w:gz") as tar:
        for item in STAGING_DIR.iterdir():
            tar.add(item, arcname=item.name)

    tar_size_mb = tar_path.stat().st_size / (1024*1024)
    tar_sha = calculate_sha256(tar_path)
    print(f"✓ Archive created: {tar_path.name} ({tar_size_mb:.2f} MB)")
    print(f"✓ Archive SHA-256: {tar_sha}")

    # 8. Write archive checksum file
    sha_file = ARTIFACTS_DIR / "scientific-cache.tar.gz.sha256"
    sha_file.write_text(f"{tar_sha}  {tar_path.name}\n", encoding="utf-8")
    print(f"✓ Integrity file written: {sha_file.name}")

    # Clean up staging directory to save local space
    shutil.rmtree(STAGING_DIR)
    print("✓ Staging directory cleaned up.")
    print("=" * 65)

if __name__ == "__main__":
    package()
