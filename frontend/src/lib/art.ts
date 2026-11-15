/* Procedural full-colour space pictures: nebula, spiral galaxy, deep-field sky, Milky-Way band.
   Drawn once into a canvas. No downloads, no licences, always on-theme.
   NOTE: Used exclusively for decorative backgrounds and cards; strictly prohibited for real scientific data. */

export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number, s: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function vnoise(x: number, y: number, s: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, y: number, s: number, octaves = 3): number {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < octaves; i++) {
    v += a * vnoise(x * f, y * f, s + i);
    f *= 2;
    a *= 0.5;
  }
  return v;
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const VIOLET = [110, 70, 255];
const MAGENTA = [255, 80, 170];
const CYAN = [70, 210, 255];
const GOLD = [255, 205, 130];
const BLUE = [120, 165, 255];
const STAR_COLS = [[155, 176, 255], [202, 215, 255], [255, 244, 234], [255, 210, 161], [255, 163, 102]];

function add(d: Uint8ClampedArray, i: number, c: number[], k: number) {
  d[i] = Math.min(255, d[i] + c[0] * k);
  d[i + 1] = Math.min(255, d[i + 1] + c[1] * k);
  d[i + 2] = Math.min(255, d[i + 2] + c[2] * k);
}

function stars(d: Uint8ClampedArray, w: number, h: number, seed: number, n: number) {
  const r = rng(seed * 977 + 13);
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * w), y = Math.floor(r() * h);
    const b = Math.pow(r(), 3.5);
    const col = STAR_COLS[Math.floor(r() * STAR_COLS.length)];
    add(d, (y * w + x) * 4, col, 0.45 + 0.9 * b);
    if (b > 0.25) {
      for (const [dx, dy, k] of [[1, 0, 0.5], [-1, 0, 0.5], [0, 1, 0.5], [0, -1, 0.5], [1, 1, 0.25], [-1, -1, 0.25], [1, -1, 0.25], [-1, 1, 0.25]]) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && xx < w && yy >= 0 && yy < h) add(d, (yy * w + xx) * 4, col, b * k * 1.3);
      }
    }
  }
}

type ArtKind = "nebula" | "galaxy" | "sky" | "band";

const KINDS: Record<ArtKind, (d: Uint8ClampedArray, w: number, h: number, s: number) => void> = {
  nebula(d, w, h, s) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / w, ny = y / h, i = (y * w + x) * 4;
        const a = smooth(0.38, 0.8, fbm(nx * 3, ny * 3, s));
        const b = smooth(0.42, 0.85, fbm(nx * 5 + 10, ny * 5, s + 3));
        const c = smooth(0.5, 0.9, fbm(nx * 8, ny * 8 + 7, s + 6));
        const lane = smooth(0.55, 0.8, fbm(nx * 10, ny * 10, s + 9));
        const dim = 1 - 0.55 * lane;
        add(d, i, VIOLET, a * 0.85 * dim);
        add(d, i, MAGENTA, a * b * 0.75 * dim);
        add(d, i, CYAN, c * 0.45 * dim);
      }
    }
    stars(d, w, h, s, Math.floor(w * h * 0.004));
  },
  galaxy(d, w, h, s) {
    const cx = w / 2, cy = h / 2, rot = 0.55;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const dx = (x - cx) / h, dy = (y - cy) / h;
        const rx = dx * Math.cos(rot) + dy * Math.sin(rot);
        const ry = (-dx * Math.sin(rot) + dy * Math.cos(rot)) * 2.0;
        const r = Math.hypot(rx, ry), th = Math.atan2(ry, rx);
        const arms = 0.5 + 0.5 * Math.cos(2 * th - 6 * Math.log(r + 0.03));
        const disc = Math.exp(-r * 4.0) * (0.12 + 0.88 * arms) * (0.55 + 0.9 * fbm(x / 16, y / 16, s));
        const core = Math.exp(-r * r * 220) * 1.3;
        const knots = smooth(0.62, 0.8, fbm(x / 6, y / 6, s + 4)) * disc * 1.4;
        add(d, i, GOLD, (core * 1.1 + disc * 0.55 + knots * 0.35) * 1.1);
        add(d, i, CYAN, disc * 0.45 + knots * 0.7);
        add(d, i, MAGENTA, disc * 0.3);
      }
    }
    stars(d, w, h, s, Math.floor(w * h * 0.002));
  },
  sky(d, w, h, s) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const nx = x / w, ny = y / h;
        const glow = smooth(0.35, 0.75, fbm(nx * 4, ny * 4, s));
        add(d, i, BLUE, glow * 0.35);
        add(d, i, MAGENTA, glow * 0.2);
      }
    }
    stars(d, w, h, s, Math.floor(w * h * 0.006));
  },
  band(d, w, h, s) {
    const cy = h / 2;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const dy = (y - cy) / (h * 0.4);
        const b = Math.exp(-dy * dy * 3.5) * (0.5 + 0.7 * fbm(x / 20, y / 12, s));
        add(d, i, GOLD, b * 0.9);
        add(d, i, MAGENTA, b * 0.45);
        add(d, i, CYAN, b * 0.25);
      }
    }
    stars(d, w, h, s, Math.floor(w * h * 0.004));
  },
};

export interface DrawOptions {
  kind?: string;
  seed?: number;
  w?: number;
  h?: number;
}

// Module-level cache so expensive procedural textures (nebula, galaxy, sky)
// are computed once and reused in 0ms on subsequent mounts and Back-to-Journey returns.
const ART_CACHE = new Map<string, ImageData>();

export function drawColor(canvas: HTMLCanvasElement, { kind = "nebula", seed = 1, w = 480, h = 360 }: DrawOptions = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = w;
  canvas.height = h;

  const key = `${kind}_${seed}_${w}_${h}`;
  const cached = ART_CACHE.get(key);
  if (cached) {
    ctx.putImageData(cached, 0, 0);
    return;
  }

  const img = ctx.createImageData(w, h);
  const fn = KINDS[kind as ArtKind] || KINDS.nebula;
  for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255;
  fn(img.data, w, h, seed);
  ART_CACHE.set(key, img);
  ctx.putImageData(img, 0, 0);
}
