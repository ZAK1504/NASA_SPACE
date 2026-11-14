import type { Mission } from '../types';

export const MISSIONS: Mission[] = [
  {
    id: 'moving-star',
    title: 'The Moving Star',
    subtitle: 'Mission 01',
    targetObject: 'barnards-star',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    description:
      "Discover why Barnard's Star is extraordinary by tracking its movement across the sky. Learn how proper motion works and why nearby stars move faster than distant ones.",
    teaches: ['Proper motion', 'Sky coordinates', 'Image comparison', 'Source matching'],
  },
  {
    id: 'invisible-world',
    title: 'The Invisible World',
    subtitle: 'Mission 02',
    targetObject: 'wise-0855',
    difficulty: 'beginner',
    estimatedMinutes: 20,
    description:
      "Explore WISE 0855, the coldest known brown dwarf. Understand why some objects are only visible in infrared light and what SPHEREx's 102 spectral bands reveal.",
    teaches: ['Brown dwarfs', 'Infrared astronomy', 'Wavelengths', 'Why infrared matters'],
  },
  {
    id: 'changing-star',
    title: 'A Star That Changes',
    subtitle: 'Mission 03',
    targetObject: 'rw-aurigae',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    description:
      "Investigate the dramatic brightness changes of RW Aurigae and R Draconis. Learn how astronomers study variable stars and what causes them to dim and brighten.",
    teaches: ['Variable stars', 'Brightness changes', 'Light curves', 'Observation comparison'],
  },
];
