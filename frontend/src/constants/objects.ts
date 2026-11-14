import type { AstronomicalObject } from '../types';

export const FEATURED_OBJECTS: AstronomicalObject[] = [
  {
    id: 'barnards-star',
    name: "Barnard's Star",
    type: 'Red Dwarf Star',
    ra: 269.4463,
    dec: 4.7682,
    raHms: "17h 57m 47.1s",
    decDms: "+04° 46' 06\"",
    referenceEpoch: "J2026.0 (Propagated from Gaia DR3 J2016.0)",
    referenceCoords: {
      raDeg: 269.448503,
      decDeg: 4.739420,
      raHms: "17h 57m 47.64s",
      decDms: "+04° 44' 21.9\"",
      epoch: "J2016.0",
      frame: "ICRS"
    },
    properMotionRa: -801.55,
    properMotionDec: 10362.39,
    parallax: 546.98,
    distanceLy: 5.96,
    spectralType: "M4.0V",
    description:
      "The closest single star to our Solar System at 5.96 light-years (Gaia DR3 4472832130942575872, J2026.0 propagated). Famous for the largest known proper motion of any star (10.39 arcsec/year) — moving measurably across sky surveys over months and years.",
    scientificLimitations:
      "High flux saturates the central pixel of the Teledyne H2RG detector. The central core is flagged and masked as NaN by the IPAC pipeline (FLAGS bits 1 and 2), necessitating centroiding on the unmasked diffraction wings.",
    astrometricCitation: "Gaia DR3 (Gaia Collaboration, 2022); SIMBAD Astronomical Database",
    tags: ['proper motion', 'nearby star', 'red dwarf', 'high velocity'],
    slug: 'barnards-star',
  },
  {
    id: 'wise-0855',
    name: 'WISE 0855−0714',
    type: 'Brown Dwarf',
    ra: 133.7597,
    dec: -7.2422,
    raHms: '08h 55m 02.3s',
    decDms: '−07° 14\' 32"',
    referenceEpoch: "J2026.0 (Propagated from Discovery 2010.4)",
    referenceCoords: {
      raDeg: 133.795129,
      decDeg: -7.245147,
      raHms: "08h 55m 10.83s",
      decDms: "−07° 14' 42.5\"",
      epoch: "2010.4",
      frame: "ICRS"
    },
    properMotionRa: -8118.0,
    properMotionDec: 680.0,
    parallax: 449.0,
    distanceLy: 7.26,
    spectralType: "Y4",
    description:
      "The coldest known sub-stellar brown dwarf (~250 K), discovered in 2014 by Kevin Luhman (J2026.0 propagated). Moves predominantly westward (-8.12 arcsec/yr). Visible almost purely in infrared wavelengths with candidate water-ice clouds.",
    scientificLimitations:
      "Extremely cold surface temperature (~250 K) results in negligible flux at short near-IR wavelengths (< 3.0 μm). Best detected in longer-wavelength SPHEREx detectors D5 and D6 (3.8–5.0 μm). D3 observations provide upper limits.",
    astrometricCitation: "Luhman & Esplin (2016, ApJ 820:78); SIMBAD",
    tags: ['brown dwarf', 'infrared', 'cold', 'water clouds'],
    slug: 'wise-0855',
  },
  {
    id: 'epsilon-indi-b',
    name: 'Epsilon Indi B',
    type: 'Binary Brown Dwarf',
    ra: 331.0964,
    dec: -56.8012,
    raHms: '22h 04m 23.1s',
    decDms: '−56° 48\' 04"',
    referenceEpoch: "J2026.0 (Propagated from J2000.0)",
    referenceCoords: {
      raDeg: 331.044147,
      decDeg: -56.782844,
      raHms: "22h 04m 10.60s",
      decDms: "−56° 46' 58.2\"",
      epoch: "J2000.0",
      frame: "ICRS"
    },
    properMotionRa: 3961.4,
    properMotionDec: -2538.3,
    parallax: 275.8,
    distanceLy: 11.82,
    spectralType: "T1 + T6",
    companion: {
      name: "Epsilon Indi A",
      ra: 330.840223,
      dec: -56.785979,
      type: "Primary K5V Star (V=4.69, Saturated Core)",
      separationArcsec: 90.2
    },
    description:
      "A benchmark binary system of two T-type brown dwarfs (T1 + T6, Gaia DR3 6412596012146801152) orbiting Epsilon Indi A. At 11.82 light-years, it provides an exquisite laboratory for substellar atmospheric modeling across SPHEREx's 102 infrared bands.",
    scientificLimitations:
      "In typical 15′ FOV cutouts, primary star Epsilon Indi A (K5V, V=4.69) is present in the field and heavily saturated with a masked core. Epsilon Indi B is separated by ~90″ to the ENE. Individual Ba and Bb components (0.7\" separation) are spatially unresolved at SPHEREx's 6.15\"/pixel scale.",
    astrometricCitation: "Scholz et al. (2003); Gaia DR3 (Gaia Collaboration, 2022)",
    tags: ['brown dwarf', 'binary', 'nearby', 'atmospheric benchmark'],
    slug: 'epsilon-indi-b',
  },
  {
    id: 'rw-aurigae',
    name: 'RW Aurigae',
    type: 'T Tauri Star',
    ra: 76.9561,
    dec: 30.4013,
    raHms: '05h 07m 49.5s',
    decDms: '+30° 24\' 05"',
    referenceEpoch: "J2026.0 (Propagated from Gaia DR3 J2016.0)",
    referenceCoords: {
      raDeg: 76.956067,
      decDeg: 30.401326,
      raHms: "05h 07m 49.46s",
      decDms: "+30° 24' 04.8\"",
      epoch: "J2016.0",
      frame: "ICRS"
    },
    properMotionRa: 1.25,
    properMotionDec: -21.40,
    parallax: 6.12,
    distanceLy: 532.0,
    spectralType: "K3e + K5e",
    description:
      "A young classical T Tauri binary star (Gaia DR3 162985392019482112) in Taurus-Auriga showing dramatic, irregular occultation dips of 2-3 magnitudes, thought to be caused by tidally disrupted protoplanetary disk debris.",
    scientificLimitations:
      "Complex circumstellar dust emission and tidal bridge between components A and B (1.4\" separation) are spatially blended within the SPHEREx beam. Variability is monitored via total integrated flux.",
    astrometricCitation: "Gaia DR3 (Gaia Collaboration, 2022); Rodriguez et al. (2018)",
    tags: ['variable star', 'T Tauri', 'young star', 'protoplanetary disk'],
    slug: 'rw-aurigae',
  },
  {
    id: 'r-draconis',
    name: 'R Draconis',
    type: 'Carbon Star',
    ra: 248.1675,
    dec: 66.7550,
    raHms: '16h 32m 40.2s',
    decDms: '+66° 45\' 18"',
    referenceEpoch: "J2026.0 (Propagated from Gaia DR3 J2016.0)",
    referenceCoords: {
      raDeg: 248.167611,
      decDeg: 66.754979,
      raHms: "16h 32m 40.23s",
      decDms: "+66° 45' 17.9\"",
      epoch: "J2016.0",
      frame: "ICRS"
    },
    properMotionRa: -14.20,
    properMotionDec: -8.50,
    parallax: 1.51,
    distanceLy: 2160.0,
    spectralType: "C-N4.5 (Mira variable)",
    description:
      "A pulsating Mira-type variable carbon star (Gaia DR3 1667439201492042240) with a 246-day period, varying from magnitude 6.7 down to 13.2. Its carbon-rich atmosphere and stellar dust winds produce strong infrared signatures.",
    scientificLimitations:
      "Near peak luminosity, the high flux can approach non-linearity thresholds in high-sensitivity channels. Photometric calibration requires sigma-clipped background subtraction to account for surrounding circumstellar dust emission.",
    astrometricCitation: "Gaia DR3 (Gaia Collaboration, 2022); GCVS (Samus et al. 2017)",
    tags: ['variable star', 'carbon star', 'Mira variable', 'stellar pulsation'],
    slug: 'r-draconis',
  },
];

export const OBJECT_TYPE_FILTERS = [
  'All',
  'Red Dwarf Star',
  'Brown Dwarf',
  'Binary Brown Dwarf',
  'T Tauri Star',
  'Carbon Star',
];
