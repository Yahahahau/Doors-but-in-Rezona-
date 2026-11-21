// Small shared helpers: seeded RNG, math, colors.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2(a, b) {
  let h = 2166136261 ^ a;
  h = Math.imul(h ^ b, 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  return (h ^ (h >>> 15)) >>> 0;
}

/** Deterministic noise 0..1 from integer coordinates. */
export function noise1(i, salt = 0) {
  return hash2(i | 0, salt | 0) / 4294967296;
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const approach = (v, target, delta) =>
  v < target ? Math.min(v + delta, target) : Math.max(v - delta, target);

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
export function range(rng, a, b) {
  return a + rng() * (b - a);
}
export function irange(rng, a, b) {
  return Math.floor(a + rng() * (b - a + 1));
}
export function weighted(rng, entries) {
  // entries: [[value, weight], ...]
  let total = 0;
  for (const [, w] of entries) total += w;
  let r = rng() * total;
  for (const [v, w] of entries) {
    if ((r -= w) <= 0) return v;
  }
  return entries[entries.length - 1][0];
}

// ---- colors --------------------------------------------------------------
const hexCache = new Map();
export function hexToRgb(hex) {
  let c = hexCache.get(hex);
  if (c) return c;
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  hexCache.set(hex, c);
  return c;
}
/** Lighten (amt>0) or darken (amt<0) a hex colour. amt in -1..1 */
export function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const f = (v) =>
    Math.round(clamp(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt), 0, 255));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
export function rgba(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export function pad4(n) {
  return String(Math.max(0, n)).padStart(4, '0');
}
