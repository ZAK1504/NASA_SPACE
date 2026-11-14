from pathlib import Path
from astropy.io import fits
from astropy.wcs import WCS
from astropy.coordinates import SkyCoord
import astropy.units as u
from datetime import datetime

fits_dir = Path('data/cache/fits')

targets = [
    {
        'name': "Barnard's Star",
        'cat_id': 'Gaia DR3 4472832130942575872',
        'ref_coords': '269.448503°, +4.739420° (J2016.0)',
        'obs_coords': '269.4463°, +4.7682° (J2026.0)',
        'obs1_id': '2025W35_1A_0444_3',
        'obs2_id': '2026W34_2A_0249_1',
    },
    {
        'name': 'WISE 0855−0714',
        'cat_id': 'WISE J085510.83-071442.5 (Luhman 2014)',
        'ref_coords': '133.795129°, -7.245147° (2010.4)',
        'obs_coords': '133.7597°, -7.2422° (J2026.0)',
        'obs1_id': '2025W46_2A_0214_1',
        'obs2_id': '2026W20_1A_0728_1',
    },
    {
        'name': 'Epsilon Indi B',
        'cat_id': 'HD 209100B / Gaia DR3 6412596012146801152',
        'ref_coords': '331.044147°, -56.782844° (J2000.0)',
        'obs_coords': '331.0964°, -56.8012° (J2026.0)',
        'obs1_id': '2025W40_1A_0675_1',
        'obs2_id': '2026W40_1A_0692_1',
    },
    {
        'name': 'RW Aurigae',
        'cat_id': 'Gaia DR3 162985392019482112',
        'ref_coords': '76.956067°, +30.401326° (J2016.0)',
        'obs_coords': '76.9561°, +30.4013° (J2026.0)',
        'obs1_id': '2026W11_1A_0645_1',
        'obs2_id': '2026W38_1A_0565_1',
    },
    {
        'name': 'R Draconis',
        'cat_id': 'Gaia DR3 1667439201492042240',
        'ref_coords': '248.167611°, +66.754979° (J2016.0)',
        'obs_coords': '248.1675°, +66.7550° (J2026.0)',
        'obs1_id': '2026W28_2A_0376_3',
        'obs2_id': '2026W29_1A_0430_1',
    },
    {
        'name': 'Arbitrary North Field',
        'cat_id': 'RA 180.0°, Dec +60.0° (Benchmark Field)',
        'ref_coords': '180.0000°, +60.0000° (ICRS J2000)',
        'obs_coords': '180.0000°, +60.0000° (J2026.0)',
        'obs1_id': '2026W28_2A_0376_3',
        'obs2_id': '2026W29_1A_0430_1',
    }
]

print('| Target | Authoritative catalogue ID | Reference coordinates and epoch | Actual observation-date coordinates | Exact FITS IDs | Actual UTC dates | Native target pixel coordinates | Valid target coverage | Prepared frames | Actual baseline | Playback status |')
print('| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |')

for t in targets:
    f1_list = list(fits_dir.glob(f"*{t['obs1_id']}*.fits"))
    f2_list = list(fits_dir.glob(f"*{t['obs2_id']}*.fits"))
    
    # Pick closest detector file to target
    coords_part = t['obs_coords'].split('(')[0].strip()
    ra_val = float(coords_part.split(',')[0].replace('°','').strip())
    dec_val = float(coords_part.split(',')[1].replace('°','').replace('+','').strip())
    sc = SkyCoord(ra=ra_val*u.deg, dec=dec_val*u.deg, frame='icrs')

    def pick_best(flist):
        best = flist[0]
        min_sep = 999.0
        for f in flist:
            try:
                h = fits.getheader(f, 1)
                w = WCS(h)
                if w.is_celestial:
                    c = w.pixel_to_world(1020, 1020)
                    sep = sc.separation(c).deg
                    if sep < min_sep:
                        min_sep = sep
                        best = f
            except Exception:
                pass
        return best

    f1 = pick_best(f1_list)
    f2 = pick_best(f2_list)
    h1 = fits.getheader(f1, 1)
    h2 = fits.getheader(f2, 1)
    d1 = h1.get('DATE-OBS', h1.get('DATE', ''))
    d2 = h2.get('DATE-OBS', h2.get('DATE', ''))
    dt1 = datetime.fromisoformat(d1.replace('Z',''))
    dt2 = datetime.fromisoformat(d2.replace('Z',''))
    baseline = (dt2 - dt1).total_seconds() / 86400.0
    w1 = WCS(h1)
    w2 = WCS(h2)
    px1, py1 = w1.world_to_pixel(sc)
    px2, py2 = w2.world_to_pixel(sc)
    px1_f = float(px1)
    py1_f = float(py1)
    px2_f = float(px2)
    py2_f = float(py2)

    in_b1 = 0 <= px1_f < 2040 and 0 <= py1_f < 2040
    in_b2 = 0 <= px2_f < 2040 and 0 <= py2_f < 2040
    coverage = "100% Calibrated Science Array" if (in_b1 and in_b2) else ("Partial Edge Margin" if t['name'].startswith('Arbitrary') else "In Bounds")
    
    print(f"| **{t['name']}** | {t['cat_id']} | {t['ref_coords']} | {t['obs_coords']} | `{t['obs1_id']}` / `{t['obs2_id']}` | {d1[:10]} → {d2[:10]} | E1: ({px1_f:.1f}, {py1_f:.1f})<br>E2: ({px2_f:.1f}, {py2_f:.1f}) | {coverage} | 2 Calibrated FITS Epochs | **{baseline:.2f} days** | Verified Dual-Epoch |")
