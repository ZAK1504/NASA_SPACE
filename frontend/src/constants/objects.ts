import type { AstronomicalObject } from '../types';

export const FEATURED_OBJECTS: AstronomicalObject[] = [
  {
    id: 'barnards-star',
    name: "Barnard's Star",
    type: 'Red Dwarf Star',
    ra: 269.4521,
    dec: 4.6933,
    raHms: "17h 57m 48.5s",
    decDms: "+04° 41' 36\"",
    description:
      "The closest single star to our Solar System at 5.96 light-years. Famous for the largest proper motion of any known star — it moves so fast its position is measurably different from year to year.",
    tags: ['proper motion', 'nearby star', 'red dwarf'],
    slug: 'barnards-star',
  },
  {
    id: 'wise-0855',
    name: 'WISE 0855−0714',
    type: 'Brown Dwarf',
    ra: 133.7879,
    dec: -7.2435,
    raHms: '08h 55m 10.8s',
    decDms: '−07° 14\' 42"',
    description:
      "The coldest known brown dwarf, discovered in 2014. So cold it may have water ice clouds in its atmosphere. Only visible in infrared — invisible to optical telescopes, making it a perfect SPHEREx target.",
    tags: ['brown dwarf', 'infrared', 'cold'],
    slug: 'wise-0855',
  },
  {
    id: 'epsilon-indi-b',
    name: 'Epsilon Indi B',
    type: 'Binary Brown Dwarf',
    ra: 330.8408,
    dec: -56.7868,
    raHms: '22h 03m 21.8s',
    decDms: '−56° 47\' 12"',
    description:
      "A binary pair of brown dwarfs orbiting the nearby star Epsilon Indi A. Among the closest brown dwarfs to Earth, ideal targets for studying substellar objects in infrared wavelengths.",
    tags: ['brown dwarf', 'binary', 'nearby'],
    slug: 'epsilon-indi-b',
  },
  {
    id: 'rw-aurigae',
    name: 'RW Aurigae',
    type: 'T Tauri Star',
    ra: 83.4042,
    dec: 30.4017,
    raHms: '05h 33m 36.9s',
    decDms: '+30° 24\' 06"',
    description:
      "A young binary star system showing dramatic dimming events, possibly caused by a disrupted protoplanetary disk. Its brightness changes make it a compelling variable star target.",
    tags: ['variable star', 'T Tauri', 'young star'],
    slug: 'rw-aurigae',
  },
  {
    id: 'r-draconis',
    name: 'R Draconis',
    type: 'Carbon Star',
    ra: 166.5708,
    dec: 68.0417,
    raHms: '11h 06m 17.0s',
    decDms: '+68° 02\' 30"',
    description:
      "A Mira-type long-period variable carbon star with a pulsation period of ~246 days. Its dramatic brightness variations make it excellent for studying stellar variability across infrared wavelengths.",
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
