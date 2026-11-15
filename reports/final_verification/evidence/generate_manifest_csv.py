import json
import csv
from pathlib import Path

with open("fits_audit_manifest.json", "r") as fp:
    fits_data = json.load(fp)

target_map = {
    "269.": "Barnard's Star (GJ 699)",
    "272.": "Barnard's Star (GJ 699)",
    "331.": "Epsilon Indi B (HD 209100B)",
    "133.": "WISE 0855-0714",
    "134.": "WISE 0855-0714",
    "77.": "RW Aurigae (V* RW Aur)",
    "82.": "RW Aurigae (V* RW Aur)",
    "248.": "R Draconis (V* R Dra)",
    "249.": "R Draconis (V* R Dra)",
    "128.": "Vela / Deep Field Baseline",
}

wavelength_map = {
    "D1": "0.75 - 1.11 μm",
    "D2": "1.11 - 1.64 μm",
    "D3": "1.64 - 2.42 μm",
    "D4": "2.42 - 3.82 μm",
    "D5": "3.82 - 4.42 μm",
    "D6": "4.42 - 5.00 μm",
}

manifest_rows = []
for item in fits_data:
    crval1_str = str(item.get("crval1", ""))[:4]
    target_name = "SPHEREx Survey Target"
    for prefix, name in target_map.items():
        if crval1_str.startswith(prefix):
            target_name = name
            break
            
    det = item.get("detector", "")
    wl = wavelength_map.get(det, "0.75 - 5.00 μm")
    
    row = {
        "target": target_name,
        "product_id": item["filename"].replace(".fits", ""),
        "collection": "spherex_dr1_l2b",
        "observation_date": item.get("date_obs", ""),
        "ra_deg": item.get("crval1"),
        "dec_deg": item.get("crval2"),
        "detector": det,
        "wavelength_range": wl,
        "calibration_level": 2,
        "filename": item["filename"],
        "size_mb": item.get("size_mb"),
        "sha256": item.get("sha256"),
        "official_source": "NASA/IPAC Infrared Science Archive (IRSA)",
        "processing_status": "Calibrated Level 2 Surface Brightness (MJy/sr)"
    }
    manifest_rows.append(row)

out_csv = Path("../reports/final_verification/03_DATA_PROVENANCE_MANIFEST.csv")
with open(out_csv, "w", newline="", encoding="utf-8") as fp:
    writer = csv.DictWriter(fp, fieldnames=list(manifest_rows[0].keys()))
    writer.writeheader()
    writer.writerows(manifest_rows)

print(f"Generated {out_csv} with {len(manifest_rows)} rows.")
