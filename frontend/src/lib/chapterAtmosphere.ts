export type ChapterEnv = {
  id: string;
  bgColor: string;        // CSS color for body/html
  ambientColor: string;   // atmospheric glow color (rgba)
  nebulaOpacity: number;  // 0..1
  starDensity: number;    // multiplier 0.5..2
  starWarmth: number;     // 0=cool, 1=warm tones
  warpFactor: number;     // 0..1 for Starfield warp
  glowColor: string;      // accent glow rgba
  motionIntensity: number; // 0..1
};

export const CHAPTER_ENVS: Record<string, ChapterEnv> = {
  home: {
    id: 'home',
    bgColor: '#030205',
    ambientColor: 'rgba(220, 150, 60, 0.12)',
    nebulaOpacity: 0.35,
    starDensity: 1.0,
    starWarmth: 0.7,
    warpFactor: 0,
    glowColor: 'rgba(244, 162, 114, 0.18)',
    motionIntensity: 0.4,
  },
  explorer: {
    id: 'explorer',
    bgColor: '#030308',
    ambientColor: 'rgba(60, 50, 180, 0.15)',
    nebulaOpacity: 0.65,
    starDensity: 1.3,
    starWarmth: 0.2,
    warpFactor: 0,
    glowColor: 'rgba(100, 80, 240, 0.15)',
    motionIntensity: 0.3,
  },
  'time-machine': {
    id: 'time-machine',
    bgColor: '#040200',
    ambientColor: 'rgba(200, 100, 20, 0.14)',
    nebulaOpacity: 0.2,
    starDensity: 1.6,
    starWarmth: 0.9,
    warpFactor: 0.6,
    glowColor: 'rgba(255, 123, 61, 0.2)',
    motionIntensity: 0.8,
  },
  labs: {
    id: 'labs',
    bgColor: '#050505',
    ambientColor: 'rgba(200, 200, 220, 0.06)',
    nebulaOpacity: 0.1,
    starDensity: 0.6,
    starWarmth: 0.1,
    warpFactor: 0,
    glowColor: 'rgba(180, 180, 200, 0.08)',
    motionIntensity: 0.15,
  },
  mission: {
    id: 'mission',
    bgColor: '#020308',
    ambientColor: 'rgba(50, 60, 150, 0.12)',
    nebulaOpacity: 0.4,
    starDensity: 1.2,
    starWarmth: 0.5,
    warpFactor: 0,
    glowColor: 'rgba(220, 160, 80, 0.14)',
    motionIntensity: 0.3,
  },
};

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function lerpEnv(e1: ChapterEnv, e2: ChapterEnv, t: number): ChapterEnv {
  return {
    id: t < 0.5 ? e1.id : e2.id,
    bgColor: e1.bgColor,  // blend handled via CSS
    ambientColor: e1.ambientColor,
    nebulaOpacity: lerp(e1.nebulaOpacity, e2.nebulaOpacity, t),
    starDensity: lerp(e1.starDensity, e2.starDensity, t),
    starWarmth: lerp(e1.starWarmth, e2.starWarmth, t),
    warpFactor: lerp(e1.warpFactor, e2.warpFactor, t),
    glowColor: e1.glowColor,
    motionIntensity: lerp(e1.motionIntensity, e2.motionIntensity, t),
  };
}
