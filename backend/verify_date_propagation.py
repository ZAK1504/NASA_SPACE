import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))
from app.services.target_service import astrometry_service, TARGET_REGISTRY

dates = {
    'barnards-star': ('2025-08-27', '2026-08-21'),
    'wise-0855': ('2025-11-14', '2026-05-13'),
    'epsilon-indi-b': ('2025-10-02', '2026-10-01'),
    'rw-aurigae': ('2026-03-12', '2026-09-16'),
    'r-draconis': ('2026-07-11', '2026-07-15'),
}

print('| Target | Ref Epoch & Coords | Epoch 1 Date & Coords | Epoch 2 Date & Coords | True Motion Between Visits |')
print('|:---|:---|:---|:---|:---|')
for tid, (d1, d2) in dates.items():
    t = TARGET_REGISTRY[tid]
    r1, dec1, m1 = astrometry_service.propagate_to_date(t, d1)
    r2, dec2, m2 = astrometry_service.propagate_to_date(t, d2)
    # Apparent angular shift between observation dates
    import math
    cos_d = math.cos(math.radians((dec1 + dec2) / 2.0))
    shift_arcsec = math.hypot((r2 - r1) * cos_d, dec2 - dec1) * 3600.0
    print(f'| **{t.name}** | {t.reference_epoch}: ({t.ref_ra_deg:.4f}°, {t.ref_dec_deg:.4f}°) | {d1} ({m1["target_observation_epoch"]}): ({r1:.4f}°, {dec1:.4f}°) | {d2} ({m2["target_observation_epoch"]}): ({r2:.4f}°, {dec2:.4f}°) | **{shift_arcsec:.3f}″** |')
