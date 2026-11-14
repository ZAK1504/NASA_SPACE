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
    description:
      "The closest single star to our Solar System at 5.96 light-years (Gaia DR3 4472832130942575872, J2026.0 propagated). Famous for the largest proper motion of any known star (10.33 arcsec/year) — moving measurably across sky surveys over months and years.",
    tags: ['proper motion', 'nearby star', 'red dwarf'],
    slug: 'barnards-star',
  },
  {
    id: 'wise-0855',
    name: 'WISE 0855−0714',
    type: 'Brown Dwarf',
    ra: 133.7598,
    dec: -7.2428,
    raHms: '08h 55m 02.4s',
    decDms: '−07° 14\' 34"',
    description:
      "The coldest known sub-stellar brown dwarf (~250 K), discovered in 2014 by Kevin Luhman (J2026.0 propagated). Visible almost purely in infrared wavelengths with candidate water ice atmospheric clouds.",
    tags: ['brown dwarf', 'infrared', 'cold'],
    slug: 'wise-0855',
  },
  {
    id: 'epsilon-indi-b',
    name: 'Epsilon Indi B',
    type: 'Binary Brown Dwarf',
    ra: 331.0441,
    dec: -56.7828,
    raHms: '22h 04m 10.6s',
    decDms: '−56° 46\' 58"',
    description:
      "A benchmark binary system of two T-type brown dwarfs (T1 + T6, Gaia DR3 6412596012146801152) orbiting Epsilon Indi A. At 11.82 light-years, it provides an exquisite laboratory for substellar atmospheric modeling across SPHEREx's 102 infrared bands.",
    tags: ['brown dwarf', 'binary', 'nearby'],
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
    description:
      "A young classical T Tauri binary star (Gaia DR3 162985392019482112) in Taurus-Auriga showing dramatic, irregular occultation dips of 2-3 magnitudes, thought to be caused by tidally disrupted protoplanetary disk debris.",
    tags: ['variable star', 'T Tauri', 'young star'],
    slug: 'rw-aurigae',
  },
  {
    id: 'r-draconis',
    name: 'R Draconis',
    type: 'Carbon Star',
    ra: 248.1676,
    dec: 66.7550,
    raHms: '16h 32m 40.2s',
    decDms: '+66° 45\' 18"',
    description:
      "A pulsating Mira-type variable carbon star (Gaia DR3 1667439201492042240) with a 246-day period, varying from magnitude 6.7 down to 13.2. Its carbon-rich atmosphere and stellar dust winds produce strong infrared signatures.",
    tags: ['variable star', 'carbon star', 'Mira variable'],
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
