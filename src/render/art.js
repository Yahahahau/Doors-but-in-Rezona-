// Procedural 2D art for the Hotel, drawn in world units.
// Visual identity follows the reference screenshots: warm brown wood, diamond
// wallpaper (red / purple / teal / navy), dark wainscoting, wooden ceilings with
// beams, brass double sconces, cone topiaries in terracotta pots, wardrobes with
// arched crowns, bookshelves, brick fireplaces, orange carpet runners.
import { W } from '../core/const.js';
import { shade, rgba, noise1, mulberry32, pad4 } from '../core/util.js';

export const FURN_Y = W.BASE + 8; // furniture against the back wall stands on this line

export const WALLS = {
  red: { base: '#5a231d', dia: '#682b23', dot: '#7e3b2c', edge: '#4a1b16' },
  purple: { base: '#3a2945', dia: '#46324f', dot: '#5d4569', edge: '#2d1f36' },
  teal: { base: '#1f3c39', dia: '#274843', dot: '#3b6059', edge: '#18302d' },
  navy: { base: '#232840', dia: '#2b3149', dot: '#3f4864', edge: '#1b2033' },
  rose: { base: '#4f2a2b', dia: '#5c3233', dot: '#744143', edge: '#3f2122' },
  olive: { base: '#33331f', dia: '#3c3c25', dot: '#555634', edge: '#2a2a19' },
};

export const WOOD = {
  panel: '#4d2a1b',
  panelDark: '#3a1f14',
  panelLight: '#6c3f28',
  rail: '#6f432a',
  trim: '#38200f',
  ceil: '#47281a',
  ceilLine: '#3a2014',
  beam: '#3b2014',
  floor: '#5c3320',
  floorDark: '#3d2112',
  floorLight: '#74452b',
  furniture: '#5a3322',
  furnitureLight: '#7a4a30',
  furnitureDark: '#3a2014',
  brass: '#b8894a',
  brassLight: '#e6c27a',
};

// ---------------------------------------------------------------- helpers
export function bevel(ctx, x, y, w, h, base, depth = 1.2, amt = 0.18) {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = shade(base, amt);
  ctx.fillRect(x, y, w, depth);
  ctx.fillRect(x, y, depth, h);
  ctx.fillStyle = shade(base, -amt * 1.6);
  ctx.fillRect(x, y + h - depth, w, depth);
  ctx.fillRect(x + w - depth, y, depth, h);
}

function grain(ctx, x, y, w, h, color, seed, density = 0.35) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  const n = Math.max(2, Math.floor(h * density));
  for (let i = 0; i < n; i++) {
    const yy = y + ((i + 0.5) / n) * h + (noise1(i, seed) - 0.5) * 1.5;
    ctx.moveTo(x, yy);
    const segs = Math.max(2, Math.floor(w / 18));
    for (let s = 1; s <= segs; s++) {
      ctx.lineTo(x + (s / segs) * w, yy + (noise1(i * 31 + s, seed + 7) - 0.5) * 1.6);
    }
  }
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------- patterns
const patCache = new Map();
function wallPattern(ctx, styleKey, res) {
  const key = styleKey + '@' + res.toFixed(2);
  let p = patCache.get(key);
  if (p) return p;
  const s = WALLS[styleKey] || WALLS.red;
  const tw = 24,
    th = 32;
  const c = document.createElement('canvas');
  c.width = Math.ceil(tw * res);
  c.height = Math.ceil(th * res);
  const g = c.getContext('2d');
  g.scale(c.width / tw, c.height / th);
  g.fillStyle = s.base;
  g.fillRect(0, 0, tw, th);
  // diamond lattice (argyle like the references)
  g.fillStyle = s.dia;
  g.beginPath();
  g.moveTo(12, 0);
  g.lineTo(24, 16);
  g.lineTo(12, 32);
  g.lineTo(0, 16);
  g.closePath();
  g.fill();
  g.strokeStyle = s.edge;
  g.lineWidth = 0.6;
  g.stroke();
  g.fillStyle = s.dot;
  g.beginPath();
  g.arc(12, 16, 1.3, 0, Math.PI * 2);
  g.arc(0, 0, 1, 0, Math.PI * 2);
  g.arc(24, 0, 1, 0, Math.PI * 2);
  g.arc(0, 32, 1, 0, Math.PI * 2);
  g.arc(24, 32, 1, 0, Math.PI * 2);
  g.fill();
  // subtle fabric noise
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(0,0,0,${0.04 + noise1(i, 3) * 0.06})`;
    g.fillRect(noise1(i, 1) * tw, noise1(i, 2) * th, 0.6, 0.6);
  }
  p = ctx.createPattern(c, 'repeat');
  p.setTransform(new DOMMatrix().scale(tw / c.width, th / c.height));
  patCache.set(key, p);
  return p;
}

function brickPattern(ctx, res, base = '#4a2c22') {
  const key = 'brick' + base + res.toFixed(2);
  let p = patCache.get(key);
  if (p) return p;
  const tw = 24,
    th = 12;
  const c = document.createElement('canvas');
  c.width = Math.ceil(tw * res);
  c.height = Math.ceil(th * res);
  const g = c.getContext('2d');
  g.scale(c.width / tw, c.height / th);
  g.fillStyle = '#2a1812';
  g.fillRect(0, 0, tw, th);
  const brick = (x, y, w, i) => {
    g.fillStyle = shade(base, (noise1(i, 9) - 0.5) * 0.3);
    g.fillRect(x + 0.5, y + 0.5, w - 1, 5);
  };
  brick(0, 0, 12, 1);
  brick(12, 0, 12, 2);
  brick(-6, 6, 12, 3);
  brick(6, 6, 12, 4);
  brick(18, 6, 12, 5);
  p = ctx.createPattern(c, 'repeat');
  p.setTransform(new DOMMatrix().scale(tw / c.width, th / c.height));
  patCache.set(key, p);
  return p;
}

// ---------------------------------------------------------------- architecture
/**
 * Draws ceiling, wall, wainscot and floor of `room` between world x [xa, xb]
 * and y [yTop, yBot]. Called by the tile cache, so it must be deterministic.
 */
export function drawArchitecture(ctx, room, xa, xb, yTop, yBot, res) {
  const st = room.style;
  const w = xb - xa;

  // ---- ceiling
  ctx.fillStyle = st.ceil || WOOD.ceil;
  ctx.fillRect(xa, yTop, w, W.CEIL - yTop);
  ctx.strokeStyle = rgba('#000000', 0.25);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let y = W.CEIL - 4; y > yTop; y -= 7) {
    ctx.moveTo(xa, y);
    ctx.lineTo(xb, y);
  }
  ctx.stroke();
  // vault / depth shading
  let g = ctx.createLinearGradient(0, yTop, 0, W.CEIL);
  g.addColorStop(0, 'rgba(0,0,0,0.75)');
  g.addColorStop(Math.max(0, Math.min(1, (0 - yTop) / (W.CEIL - yTop + 0.01))), 'rgba(0,0,0,0.35)');
  g.addColorStop(1, st.vault ? 'rgba(255,190,140,0.10)' : 'rgba(0,0,0,0.05)');
  ctx.fillStyle = g;
  ctx.fillRect(xa, yTop, w, W.CEIL - yTop);

  // beams & pilasters (aligned to room so they are deterministic)
  for (const bx of room.beams) {
    if (bx + 12 < xa || bx - 12 > xb) continue;
    // ceiling beam
    bevel(ctx, bx - 7, yTop, 14, W.CEIL - yTop + 2, WOOD.beam, 1.5, 0.15);
    if (st.vault) {
      ctx.strokeStyle = rgba('#000000', 0.35);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 60, W.CEIL - 2);
      ctx.quadraticCurveTo(bx, W.CEIL - 40, bx + 60, W.CEIL - 2);
      ctx.stroke();
    }
  }

  // ---- wall
  const wallTop = W.CEIL + 4;
  if (st.wall === 'brick') {
    ctx.fillStyle = brickPattern(ctx, res, st.brick || '#4a2c22');
    ctx.fillRect(xa, wallTop, w, W.BASE - wallTop);
  } else if (st.wall === 'glass') {
    drawGlassWall(ctx, room, xa, xb, wallTop);
  } else {
    ctx.fillStyle = wallPattern(ctx, st.wall || 'red', res);
    ctx.fillRect(xa, wallTop, w, W.RAIL - wallTop);
  }
  // shadow under cornice
  g = ctx.createLinearGradient(0, wallTop, 0, wallTop + 26);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(xa, wallTop, w, 26);

  // ---- cornice / crown molding
  bevel(ctx, xa, W.CEIL - 4, w, 6, WOOD.trim, 1, 0.25);
  bevel(ctx, xa, W.CEIL + 2, w, 3, WOOD.panelLight, 0.8, 0.2);

  // ---- wainscot
  if (st.wall !== 'brick' && st.wall !== 'glass') {
    bevel(ctx, xa, W.RAIL - 3, w, 6, WOOD.rail, 1.2, 0.25);
    ctx.fillStyle = WOOD.panel;
    ctx.fillRect(xa, W.RAIL + 3, w, W.BASE - W.RAIL - 3);
    const pw = 60;
    const start = Math.floor((xa - room.x0) / pw) * pw + room.x0;
    for (let px = start; px < xb; px += pw) {
      const x = px + 6,
        y = W.RAIL + 9,
        ww = pw - 12,
        hh = W.BASE - W.RAIL - 22;
      ctx.fillStyle = WOOD.panelDark;
      ctx.fillRect(x, y, ww, hh);
      ctx.fillStyle = shade(WOOD.panel, 0.12);
      ctx.fillRect(x + 2, y + 2, ww - 4, hh - 4);
      grain(ctx, x + 2, y + 2, ww - 4, hh - 4, rgba('#000000', 0.12), px | 0, 0.25);
      ctx.fillStyle = rgba('#000000', 0.25);
      ctx.fillRect(x + 2, y + hh - 3, ww - 4, 1);
    }
  }
  // pilasters on top of wall
  for (const bx of room.beams) {
    if (bx + 10 < xa || bx - 10 > xb) continue;
    bevel(ctx, bx - 6, wallTop, 12, W.BASE - wallTop, shade(WOOD.panel, 0.05), 1.4, 0.2);
    ctx.fillStyle = rgba('#000000', 0.25);
    ctx.fillRect(bx + 6, wallTop, 3, W.BASE - wallTop);
  }
  // baseboard
  bevel(ctx, xa, W.BASE - 7, w, 7, WOOD.trim, 1, 0.2);

  // ---- floor
  drawFloor(ctx, room, xa, xb, yBot);
}

function drawGlassWall(ctx, room, xa, xb, wallTop) {
  // greenhouse: tall panes showing a stormy night, with vines
  const g = ctx.createLinearGradient(0, wallTop, 0, W.BASE);
  g.addColorStop(0, '#0d1a1c');
  g.addColorStop(1, '#162a24');
  ctx.fillStyle = g;
  ctx.fillRect(xa, wallTop, xb - xa, W.BASE - wallTop);
  const pw = 40;
  const start = Math.floor((xa - room.x0) / pw) * pw + room.x0;
  ctx.fillStyle = '#2a2a22';
  for (let px = start; px <= xb; px += pw) ctx.fillRect(px - 1.5, wallTop, 3, W.BASE - wallTop);
  for (const y of [wallTop + 40, wallTop + 100]) ctx.fillRect(xa, y, xb - xa, 2.5);
  // planter wall
  bevel(ctx, xa, W.BASE - 34, xb - xa, 34, '#3a2c22', 1.5, 0.2);
  // vines
  ctx.strokeStyle = '#1f3a1c';
  ctx.lineWidth = 1.2;
  for (let px = start; px < xb; px += 23) {
    const n = noise1(px | 0, 77);
    if (n < 0.45) continue;
    ctx.beginPath();
    ctx.moveTo(px, wallTop);
    const len = 30 + n * 90;
    for (let i = 1; i <= 8; i++) ctx.lineTo(px + Math.sin(i * 1.3 + n * 9) * 4, wallTop + (len * i) / 8);
    ctx.stroke();
  }
}

function drawFloor(ctx, room, xa, xb, yBot) {
  const st = room.style;
  const w = xb - xa;
  const kind = st.floor || 'plank';
  const base = kind === 'stone' ? '#3b3532' : kind === 'tile' ? '#4a2e22' : WOOD.floor;
  ctx.fillStyle = base;
  ctx.fillRect(xa, W.BASE, w, yBot - W.BASE);

  // rows grow towards the viewer (fake depth)
  let y = W.BASE,
    h = 4.2,
    row = 0;
  while (y < yBot) {
    const rh = Math.min(h, yBot - y);
    const boardLen = kind === 'stone' ? 26 + h * 1.5 : 70 + h * 6;
    const off = noise1(row, 5) * boardLen;
    ctx.fillStyle = rgba('#000000', 0.3);
    ctx.fillRect(xa, y, w, 0.6);
    // board tint variation
    const startB = Math.floor((xa - off) / boardLen) * boardLen + off;
    for (let bx = startB; bx < xb; bx += boardLen) {
      const n = noise1(Math.round(bx / 3), row + 11);
      ctx.fillStyle = n > 0.5 ? rgba('#ffffff', (n - 0.5) * 0.08) : rgba('#000000', (0.5 - n) * 0.16);
      ctx.fillRect(bx, y + 0.6, boardLen, rh - 0.6);
      ctx.fillStyle = rgba('#000000', 0.35);
      ctx.fillRect(bx, y, 0.7, rh);
    }
    y += h;
    h *= kind === 'stone' ? 1.22 : 1.16;
    row++;
  }

  // carpet runner (hallways) / rugs
  if (st.runner) {
    const top = W.BASE + 14,
      bot = W.FLOOR_FRONT + 6;
    ctx.fillStyle = st.runner;
    ctx.fillRect(xa, top, w, bot - top);
    ctx.fillStyle = shade(st.runner, -0.35);
    ctx.fillRect(xa, top, w, 2);
    ctx.fillRect(xa, bot - 2, w, 2);
    ctx.fillStyle = shade(st.runner, 0.15);
    ctx.fillRect(xa, top + 4, w, 1);
    ctx.fillRect(xa, bot - 5, w, 1);
    // woven texture
    ctx.fillStyle = rgba('#000000', 0.08);
    for (let x = Math.floor(xa / 4) * 4; x < xb; x += 4) ctx.fillRect(x, top + 6, 1, bot - top - 12);
  }
  for (const r of room.rugs || []) {
    if (r.x1 < xa || r.x0 > xb) continue;
    drawRug(ctx, r.x0, r.x1, r.color);
  }

  // shadow at wall base and darkening toward the front
  let g = ctx.createLinearGradient(0, W.BASE, 0, W.BASE + 18);
  g.addColorStop(0, 'rgba(0,0,0,0.6)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(xa, W.BASE, w, 18);
  if (yBot > W.FLOOR_FRONT) {
    g = ctx.createLinearGradient(0, W.FLOOR_FRONT - 10, 0, W.FLOOR_FRONT + 120);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = g;
    ctx.fillRect(xa, W.FLOOR_FRONT - 10, w, yBot - W.FLOOR_FRONT + 10);
  }
}

export function drawRug(ctx, x0, x1, color) {
  const top = W.BASE + 18,
    bot = W.FLOOR_FRONT - 2;
  ctx.fillStyle = shade(color, -0.4);
  ctx.beginPath();
  ctx.moveTo(x0 + 10, top);
  ctx.lineTo(x1 - 10, top);
  ctx.lineTo(x1, bot);
  ctx.lineTo(x0, bot);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0 + 14, top + 3);
  ctx.lineTo(x1 - 14, top + 3);
  ctx.lineTo(x1 - 5, bot - 3);
  ctx.lineTo(x0 + 5, bot - 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = shade(color, 0.25);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  const cx = (x0 + x1) / 2,
    cy = (top + bot) / 2;
  ctx.ellipse(cx, cy, (x1 - x0) * 0.3, (bot - top) * 0.28, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// ---------------------------------------------------------------- props (static)
export function drawPainting(ctx, cx, cy, w, h, variant, seed = 1) {
  const x = cx - w / 2,
    y = cy - h / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x + 2, y + 3, w, h);
  bevel(ctx, x, y, w, h, '#7a5428', 1.5, 0.3);
  bevel(ctx, x + 3, y + 3, w - 6, h - 6, '#4a3418', 0.8, 0.2);
  const ix = x + 5,
    iy = y + 5,
    iw = w - 10,
    ih = h - 10;
  ctx.save();
  ctx.beginPath();
  ctx.rect(ix, iy, iw, ih);
  ctx.clip();
  if (variant === 'landscape') {
    const g = ctx.createLinearGradient(0, iy, 0, iy + ih);
    g.addColorStop(0, '#9db5c4');
    g.addColorStop(0.55, '#e0c9a0');
    g.addColorStop(0.56, '#c96a2c');
    g.addColorStop(1, '#8a3a18');
    ctx.fillStyle = g;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.fillStyle = '#3e5a2c';
    for (let i = 0; i < 5; i++) {
      const tx = ix + ((i + 0.5) / 5) * iw;
      ctx.beginPath();
      ctx.arc(tx, iy + ih * 0.52, 2 + noise1(i, seed) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#d58a46';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ix + iw * 0.5, iy + ih * 0.56);
    ctx.lineTo(ix + iw * 0.2, iy + ih);
    ctx.stroke();
  } else if (variant === 'portrait') {
    ctx.fillStyle = '#d8d0c0';
    ctx.fillRect(ix, iy, iw, ih);
    ctx.fillStyle = '#1a1412';
    ctx.beginPath();
    ctx.ellipse(ix + iw / 2, iy + ih * 0.42, iw * 0.24, ih * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(ix + iw * 0.18, iy + ih * 0.66, iw * 0.64, ih * 0.4);
  } else if (variant === 'sea') {
    const g = ctx.createLinearGradient(0, iy, 0, iy + ih);
    g.addColorStop(0, '#3a4a5a');
    g.addColorStop(0.5, '#6a7a86');
    g.addColorStop(0.5, '#1e3040');
    g.addColorStop(1, '#0e1c26');
    ctx.fillStyle = g;
    ctx.fillRect(ix, iy, iw, ih);
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(ix + iw * 0.4, iy + ih * 0.5);
    ctx.lineTo(ix + iw * 0.5, iy + ih * 0.2);
    ctx.lineTo(ix + iw * 0.55, iy + ih * 0.5);
    ctx.fill();
  } else {
    ctx.fillStyle = '#2b1f2c';
    ctx.fillRect(ix, iy, iw, ih);
    ctx.fillStyle = '#6a3a5a';
    ctx.beginPath();
    ctx.arc(ix + iw * 0.5, iy + ih * 0.5, Math.min(iw, ih) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawClock(ctx, cx, cy, r) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.arc(cx + 1.5, cy + 2, r + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a2a18';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#efe4cc';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a1a10';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.fillRect(cx + Math.cos(a) * r * 0.82 - 0.5, cy + Math.sin(a) * r * 0.82 - 0.5, 1, 1);
  }
}
export function drawClockHands(ctx, cx, cy, r, timeSec) {
  const m = (timeSec / 60) % 60;
  const h = 11 + m / 60;
  ctx.strokeStyle = '#1a100a';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.2;
  const ha = (h / 12) * Math.PI * 2 - Math.PI / 2;
  const ma = (m / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(ha) * r * 0.5, cy + Math.sin(ha) * r * 0.5);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(ma) * r * 0.75, cy + Math.sin(ma) * r * 0.75);
  ctx.stroke();
  ctx.strokeStyle = '#8a1a10';
  ctx.lineWidth = 0.5;
  const sa = ((timeSec % 60) / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(sa) * r * 0.8, cy + Math.sin(sa) * r * 0.8);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

export function drawSconce(ctx, x, y, on = true) {
  // brass back plate + two frosted bulbs (double sconce from references)
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x - 3, y - 3, 7, 12);
  bevel(ctx, x - 3.5, y - 4, 7, 11, '#6a4a28', 0.8, 0.3);
  ctx.strokeStyle = WOOD.brass;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y + 2);
  ctx.quadraticCurveTo(x - 8, y + 2, x - 8, y - 4);
  ctx.moveTo(x, y + 2);
  ctx.quadraticCurveTo(x + 8, y + 2, x + 8, y - 4);
  ctx.stroke();
  for (const dx of [-8, 8]) {
    ctx.fillStyle = on ? '#fff2d0' : '#4a4038';
    ctx.beginPath();
    ctx.ellipse(x + dx, y - 6.5, 3.6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!on) {
      ctx.strokeStyle = '#2a2420';
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(x + dx - 2, y - 8);
      ctx.lineTo(x + dx + 1, y - 5);
      ctx.stroke();
    }
  }
}

export function drawChandelier(ctx, x, yTop, on = true) {
  ctx.strokeStyle = '#2a1a10';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, yTop);
  ctx.lineTo(x, W.CEIL + 22);
  ctx.stroke();
  const cy = W.CEIL + 30;
  ctx.strokeStyle = WOOD.brass;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, cy, 18, 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#7a5a30';
  ctx.beginPath();
  ctx.moveTo(x - 3, W.CEIL + 22);
  ctx.lineTo(x + 3, W.CEIL + 22);
  ctx.lineTo(x + 2, cy + 6);
  ctx.lineTo(x - 2, cy + 6);
  ctx.fill();
  for (const dx of [-18, -9, 0, 9, 18]) {
    const by = cy - 4 + Math.abs(dx) * 0.1;
    ctx.fillStyle = on ? '#fff3d6' : '#3e3630';
    ctx.beginPath();
    ctx.arc(x + dx, by, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function chandelierBulbs(x) {
  const cy = W.CEIL + 30;
  return [-18, -9, 0, 9, 18].map((dx) => [x + dx, cy - 4 + Math.abs(dx) * 0.1]);
}

export function drawPlant(ctx, x, s = 1) {
  const base = FURN_Y;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, base, 11 * s, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // terracotta pot
  ctx.fillStyle = '#8a3a26';
  ctx.beginPath();
  ctx.moveTo(x - 9 * s, base - 16 * s);
  ctx.lineTo(x + 9 * s, base - 16 * s);
  ctx.lineTo(x + 6.5 * s, base);
  ctx.lineTo(x - 6.5 * s, base);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#a24a30';
  ctx.fillRect(x - 10 * s, base - 18 * s, 20 * s, 3.5 * s);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + 2 * s, base - 14.5 * s, 4 * s, 14 * s);
  // cone topiary built from leaf clusters
  const h = 50 * s;
  for (let i = 0; i < 26; i++) {
    const t = i / 26;
    const yy = base - 18 * s - t * h;
    const ww = (1 - t) * 11 * s + 2;
    for (let k = -1; k <= 1; k++) {
      const n = noise1(i * 3 + k, (x | 0) + 3);
      ctx.fillStyle = n > 0.6 ? '#3a5a30' : n > 0.3 ? '#2b4524' : '#1e331a';
      ctx.beginPath();
      ctx.arc(x + k * ww * 0.55 + (n - 0.5) * 3, yy, 3.2 * s + n * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawBookshelf(ctx, x, w, h, seed = 1, arched = false) {
  const base = FURN_Y,
    x0 = x - w / 2,
    top = base - h;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x0 + 3, top + 4, w, h - 4);
  bevel(ctx, x0, top, w, h, WOOD.furniture, 1.6, 0.2);
  if (arched) {
    ctx.fillStyle = WOOD.furniture;
    ctx.beginPath();
    ctx.ellipse(x, top + 2, w / 2, 10, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = WOOD.furnitureLight;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  const inner = { x: x0 + 4, y: top + 5, w: w - 8, h: h - 14 };
  ctx.fillStyle = '#1e100a';
  ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
  const shelves = Math.max(3, Math.round(inner.h / 19));
  const sh = inner.h / shelves;
  const rng = mulberry32(seed);
  const bookColors = ['#7a2a20', '#2c4a5a', '#5a6a2a', '#8a6a2a', '#4a2a4a', '#6a3a1a', '#2a3a2a', '#9a4a2a'];
  for (let s = 0; s < shelves; s++) {
    const sy = inner.y + s * sh;
    let bx = inner.x + 1;
    while (bx < inner.x + inner.w - 3) {
      const bw = 2 + rng() * 2.6;
      if (rng() < 0.08) {
        bx += bw + 2;
        continue;
      }
      const bh = sh - 4 - rng() * 5;
      const col = bookColors[Math.floor(rng() * bookColors.length)];
      if (rng() < 0.1 && bx + 10 < inner.x + inner.w) {
        // leaning book
        ctx.save();
        ctx.translate(bx, sy + sh - 2);
        ctx.rotate(-0.35);
        ctx.fillStyle = col;
        ctx.fillRect(0, -bh, bw, bh);
        ctx.restore();
        bx += bw + 5;
        continue;
      }
      ctx.fillStyle = col;
      ctx.fillRect(bx, sy + sh - 2 - bh, bw, bh);
      ctx.fillStyle = 'rgba(255,220,160,0.18)';
      ctx.fillRect(bx, sy + sh - 2 - bh + 2, bw, 0.6);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(bx + bw - 0.6, sy + sh - 2 - bh, 0.6, bh);
      bx += bw + 0.3;
    }
    bevel(ctx, inner.x, sy + sh - 2, inner.w, 2.5, WOOD.furnitureLight, 0.5, 0.2);
  }
  bevel(ctx, x0 - 1, base - 9, w + 2, 9, WOOD.furnitureDark, 1, 0.2);
}

export function drawWindow(ctx, cx, top, w, h, arched = true) {
  const x0 = cx - w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x0 - 2, top - 2, w + 6, h + 8);
  ctx.save();
  ctx.beginPath();
  if (arched) {
    ctx.moveTo(x0, top + w / 2);
    ctx.arc(cx, top + w / 2, w / 2, Math.PI, 0);
    ctx.lineTo(x0 + w, top + h);
    ctx.lineTo(x0, top + h);
  } else ctx.rect(x0, top, w, h);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, top, 0, top + h);
  g.addColorStop(0, '#0b1420');
  g.addColorStop(1, '#1b2836');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.clip();
  // distant trees silhouette
  ctx.fillStyle = '#060a10';
  for (let i = 0; i < 6; i++) {
    const tx = x0 + (i / 5) * w;
    ctx.beginPath();
    ctx.moveTo(tx - 8, top + h);
    ctx.lineTo(tx, top + h * (0.55 + noise1(i, cx | 0) * 0.25));
    ctx.lineTo(tx + 8, top + h);
    ctx.fill();
  }
  ctx.restore();
  drawWindowFrame(ctx, cx, top, w, h, arched);
}
export function drawWindowFrame(ctx, cx, top, w, h, arched = true) {
  const x0 = cx - w / 2;
  ctx.strokeStyle = '#5a3420';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (arched) {
    ctx.moveTo(x0, top + h);
    ctx.lineTo(x0, top + w / 2);
    ctx.arc(cx, top + w / 2, w / 2, Math.PI, 0);
    ctx.lineTo(x0 + w, top + h);
  } else ctx.rect(x0, top, w, h);
  ctx.stroke();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx, top + (arched ? 0 : 0));
  ctx.lineTo(cx, top + h);
  ctx.moveTo(x0, top + h * 0.55);
  ctx.lineTo(x0 + w, top + h * 0.55);
  ctx.stroke();
  bevel(ctx, x0 - 4, top + h, w + 8, 4, '#6a4028', 0.8, 0.25);
}

export function drawDecorDoor(ctx, cx, num, opts = {}) {
  // closed guest-room door on the back wall (not progression)
  const w = 40,
    h = 82,
    x0 = cx - w / 2,
    top = W.BASE - h;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x0 - 6, top - 6, w + 12, h + 6);
  bevel(ctx, x0 - 5, top - 5, w + 10, h + 5, '#4a2a18', 1.2, 0.25);
  bevel(ctx, x0, top, w, h, opts.color || '#6e4129', 1, 0.15);
  grain(ctx, x0 + 1, top + 1, w - 2, h - 2, rgba('#000000', 0.12), cx | 0, 0.2);
  for (const [px, py, pw, ph] of [
    [4, 6, w - 8, 30],
    [4, 42, w - 8, 34],
  ]) {
    ctx.strokeStyle = rgba('#000000', 0.35);
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 + px, top + py, pw, ph);
    ctx.strokeStyle = rgba('#ffd0a0', 0.12);
    ctx.strokeRect(x0 + px + 1, top + py + 1, pw - 2, ph - 2);
  }
  ctx.fillStyle = WOOD.brass;
  ctx.fillRect(x0 + w - 7, top + 44, 4, 1.6);
  drawPlate(ctx, cx, top + 12, num, 0.8);
}

export function drawPlate(ctx, cx, cy, num, s = 1) {
  ctx.fillStyle = '#5a3a1a';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 10 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c9a060';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 9 * s, 4.2 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2410';
  ctx.font = `bold ${5.2 * s}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(typeof num === 'number' ? pad4(num) : num, cx, cy + 0.3);
}

export function drawConsole(ctx, x, w = 44, withDrawer = true) {
  const base = FURN_Y,
    top = base - 28,
    x0 = x - w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, base, w / 2 + 2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = WOOD.furnitureDark;
  ctx.fillRect(x0 + 3, top + 6, 2.5, 22);
  ctx.fillRect(x0 + w - 5.5, top + 6, 2.5, 22);
  bevel(ctx, x0, top, w, 4, WOOD.furnitureLight, 0.8, 0.2);
  if (withDrawer) bevel(ctx, x0 + 2, top + 4, w - 4, 7, WOOD.furniture, 0.8, 0.2);
}

export function drawBench(ctx, x, w = 60) {
  const base = FURN_Y,
    x0 = x - w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x0, base - 1, w, 2);
  ctx.fillStyle = WOOD.furnitureDark;
  for (const lx of [4, w - 7]) ctx.fillRect(x0 + lx, base - 16, 3, 16);
  bevel(ctx, x0, base - 19, w, 4, WOOD.furnitureLight, 0.8, 0.2);
  ctx.fillStyle = WOOD.furniture;
  ctx.fillRect(x0 + 2, base - 15, w - 4, 2.5);
}

export function drawArmchair(ctx, x, flip = false, color = '#6a5a8a') {
  const base = FURN_Y + 6;
  ctx.save();
  ctx.translate(x, base);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = WOOD.furnitureDark;
  ctx.fillRect(-16, -6, 3, 6);
  ctx.fillRect(12, -6, 3, 6);
  // back
  ctx.fillStyle = shade(color, -0.2);
  roundRect(ctx, -18, -44, 10, 40, 4);
  ctx.fill();
  // seat
  ctx.fillStyle = color;
  roundRect(ctx, -14, -20, 32, 14, 4);
  ctx.fill();
  ctx.fillStyle = shade(color, 0.15);
  roundRect(ctx, -10, -23, 26, 6, 3);
  ctx.fill();
  // arm
  ctx.fillStyle = shade(color, -0.08);
  roundRect(ctx, -6, -30, 26, 9, 4);
  ctx.fill();
  ctx.fillStyle = rgba('#000000', 0.2);
  ctx.fillRect(-14, -9, 32, 3);
  ctx.restore();
}

export function drawCouch(ctx, x, w = 76, color = '#4a3a5a') {
  const base = FURN_Y + 2,
    x0 = x - w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x, base, w / 2 + 3, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = shade(color, -0.25);
  roundRect(ctx, x0, base - 38, w, 26, 5);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, x0 + 2, base - 18, w - 4, 13, 4);
  ctx.fill();
  for (const ax of [x0 - 3, x0 + w - 9]) {
    ctx.fillStyle = shade(color, -0.1);
    roundRect(ctx, ax, base - 28, 12, 22, 4);
    ctx.fill();
  }
  ctx.fillStyle = rgba('#ffffff', 0.06);
  for (let i = 1; i < 3; i++) ctx.fillRect(x0 + (w * i) / 3, base - 36, 0.8, 20);
  ctx.fillStyle = WOOD.furnitureDark;
  ctx.fillRect(x0 + 3, base - 5, 3, 5);
  ctx.fillRect(x0 + w - 6, base - 5, 3, 5);
}

export function drawFireplace(ctx, x, w = 70) {
  const base = FURN_Y,
    x0 = x - w / 2;
  // chimney breast up to ceiling (brick)
  ctx.fillStyle = brickPattern(ctx, 3, '#6a3626');
  ctx.fillRect(x0 + 6, W.CEIL + 4, w - 12, base - W.CEIL - 4);
  let g = ctx.createLinearGradient(x0 + 6, 0, x0 + w - 6, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.35)');
  g.addColorStop(0.3, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(x0 + 6, W.CEIL + 4, w - 12, base - W.CEIL - 4);
  // mantle
  bevel(ctx, x0, base - 52, w, 6, WOOD.furnitureLight, 1, 0.25);
  // firebox
  const fx = x0 + 14,
    fw = w - 28,
    fy = base - 40;
  ctx.fillStyle = '#120806';
  ctx.fillRect(fx, fy, fw, 40);
  g = ctx.createLinearGradient(0, fy, 0, base);
  g.addColorStop(0, 'rgba(0,0,0,0.8)');
  g.addColorStop(1, 'rgba(60,20,8,0.6)');
  ctx.fillStyle = g;
  ctx.fillRect(fx, fy, fw, 40);
  // logs
  ctx.fillStyle = '#2a160c';
  ctx.fillRect(fx + 6, base - 6, fw - 12, 4);
  // hearth
  bevel(ctx, x0 - 4, base - 2, w + 8, 5, '#5a4a44', 1, 0.2);
  // grate
  ctx.strokeStyle = '#1a1210';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    ctx.moveTo(fx + 4 + (i * (fw - 8)) / 6, base - 9);
    ctx.lineTo(fx + 4 + (i * (fw - 8)) / 6, base - 2);
  }
  ctx.moveTo(fx + 4, base - 9);
  ctx.lineTo(fx + fw - 4, base - 9);
  ctx.stroke();
}
/** dynamic flames (drawn every frame) */
export function drawFire(ctx, x, w, t, lit = true) {
  if (!lit) return;
  const base = FURN_Y - 6,
    fw = w - 34;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const fx = x - fw / 2 + (i + 0.5) * (fw / 7);
    const fh = 10 + Math.sin(t * 9 + i * 1.7) * 3 + Math.sin(t * 13 + i) * 2;
    const g = ctx.createLinearGradient(0, base - fh, 0, base);
    g.addColorStop(0, 'rgba(255,120,20,0)');
    g.addColorStop(0.4, 'rgba(255,150,40,0.55)');
    g.addColorStop(1, 'rgba(255,230,140,0.9)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(fx - 3.5, base);
    ctx.quadraticCurveTo(fx - 3, base - fh * 0.5, fx + Math.sin(t * 7 + i) * 1.5, base - fh);
    ctx.quadraticCurveTo(fx + 3, base - fh * 0.5, fx + 3.5, base);
    ctx.fill();
  }
  ctx.restore();
}

export function drawReceptionDesk(ctx, x, w = 150) {
  const base = FURN_Y + 14,
    x0 = x - w / 2,
    top = base - 40;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x0 + 2, base - 2, w, 4);
  bevel(ctx, x0, top + 4, w, 36, WOOD.furniture, 1.4, 0.18);
  const n = Math.round(w / 34);
  for (let i = 0; i < n; i++) {
    const px = x0 + 5 + (i * (w - 10)) / n;
    const pw = (w - 10) / n - 5;
    ctx.fillStyle = WOOD.furnitureDark;
    ctx.fillRect(px, top + 10, pw, 24);
    ctx.fillStyle = shade(WOOD.furniture, 0.08);
    ctx.fillRect(px + 1.5, top + 11.5, pw - 3, 21);
  }
  bevel(ctx, x0 - 4, top, w + 8, 5, WOOD.furnitureLight, 1, 0.25);
  // desk bell, papers, quill
  ctx.fillStyle = WOOD.brassLight;
  ctx.beginPath();
  ctx.arc(x0 + w * 0.7, top - 1, 3, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(x0 + w * 0.3, top - 1, 10, 1.2);
  ctx.fillStyle = '#d8ccb0';
  ctx.fillRect(x0 + w * 0.32, top - 2, 8, 1);
}

export function drawKeyBoard(ctx, cx, top, w, h) {
  // the wall of pigeon holes behind the reception (key 0001 hangs here)
  const x0 = cx - w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x0 + 3, top + 4, w, h);
  bevel(ctx, x0, top, w, h, '#5a3020', 1.5, 0.22);
  const cols = Math.floor((w - 6) / 7),
    rows = Math.floor((h - 6) / 7);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const px = x0 + 3 + c * 7,
        py = top + 3 + r * 7;
      ctx.fillStyle = '#2a140c';
      ctx.fillRect(px + 0.6, py + 0.6, 5.8, 5.8);
      ctx.fillStyle = noise1(r * 50 + c, 4) > 0.75 ? '#d8ccb0' : '#3a1e12';
      ctx.fillRect(px + 1.4, py + 4, 4.2, 1.6);
    }
}

export function drawLuggageCart(ctx, x) {
  const base = FURN_Y + 10;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(x, base, 24, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = WOOD.brass;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - 20, base - 6);
  ctx.lineTo(x - 20, base - 56);
  ctx.quadraticCurveTo(x, base - 70, x + 20, base - 56);
  ctx.lineTo(x + 20, base - 6);
  ctx.stroke();
  bevel(ctx, x - 24, base - 8, 48, 3, '#6a4020', 0.6, 0.2);
  ctx.fillStyle = '#1a1a1a';
  for (const wx of [-18, 18]) {
    ctx.beginPath();
    ctx.arc(x + wx, base - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // suitcases
  bevel(ctx, x - 18, base - 22, 22, 14, '#8a6a40', 0.8, 0.2);
  bevel(ctx, x + 2, base - 18, 16, 10, '#6a3a24', 0.8, 0.2);
  bevel(ctx, x - 12, base - 32, 18, 10, '#c0a070', 0.8, 0.2);
  ctx.fillStyle = '#3a2410';
  ctx.fillRect(x - 8, base - 22, 0.8, 14);
  ctx.fillRect(x - 3, base - 32, 0.8, 10);
}

export function drawElevator(ctx, cx, lit = true) {
  const w = 52,
    h = 92,
    x0 = cx - w / 2,
    top = W.BASE - h;
  bevel(ctx, x0 - 8, top - 14, w + 16, h + 14, '#3a2418', 1.5, 0.2);
  // floor indicator
  ctx.fillStyle = '#1a0e08';
  ctx.fillRect(cx - 12, top - 11, 24, 7);
  ctx.fillStyle = lit ? '#ff9a50' : '#4a2a18';
  ctx.beginPath();
  ctx.arc(cx, top - 7.5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a120c';
  ctx.fillRect(x0, top, w, h);
  // lattice gate (from the elevator screenshot)
  ctx.strokeStyle = '#a89a8a';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) {
    const gx = x0 + 3 + (i * (w - 6)) / 6;
    ctx.moveTo(gx, top + 2);
    ctx.lineTo(gx, top + h);
  }
  for (let i = 0; i < 6; i++) {
    const gx = x0 + 3 + (i * (w - 6)) / 6,
      gw = (w - 6) / 6;
    for (let k = 0; k < 4; k++) {
      const y = top + 8 + k * 21;
      ctx.moveTo(gx, y);
      ctx.lineTo(gx + gw / 2, y + 10);
      ctx.lineTo(gx + gw, y);
      ctx.moveTo(gx, y + 20);
      ctx.lineTo(gx + gw / 2, y + 10);
      ctx.lineTo(gx + gw, y + 20);
    }
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x0, top, w, 6);
}

export function drawBed(ctx, x, w = 90, color = '#7a3a3a') {
  const base = FURN_Y + 4,
    x0 = x - w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(x, base, w / 2 + 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // headboard
  bevel(ctx, x0 - 4, base - 52, 8, 52, WOOD.furniture, 1, 0.2);
  ctx.fillStyle = WOOD.furniture;
  ctx.beginPath();
  ctx.arc(x0, base - 52, 5, Math.PI, 0);
  ctx.fill();
  bevel(ctx, x0 + w - 4, base - 32, 7, 32, WOOD.furniture, 1, 0.2);
  // frame + mattress
  bevel(ctx, x0, base - 18, w, 9, WOOD.furnitureDark, 1, 0.2);
  ctx.fillStyle = '#d8ccb4';
  roundRect(ctx, x0 + 2, base - 27, w - 4, 10, 3);
  ctx.fill();
  // blanket
  ctx.fillStyle = color;
  roundRect(ctx, x0 + 18, base - 28, w - 20, 13, 3);
  ctx.fill();
  ctx.fillStyle = shade(color, -0.25);
  ctx.fillRect(x0 + 18, base - 18, w - 20, 3);
  // pillow
  ctx.fillStyle = '#efe6d4';
  roundRect(ctx, x0 + 3, base - 33, 16, 8, 4);
  ctx.fill();
  // dark gap under the bed (hiding space in later phases)
  ctx.fillStyle = '#0c0604';
  ctx.fillRect(x0 + 3, base - 9, w - 6, 9);
}

export function drawDesk(ctx, x, w = 64) {
  const base = FURN_Y + 4,
    x0 = x - w / 2,
    top = base - 30;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x0, base - 1, w, 2);
  // roll-top hutch
  ctx.fillStyle = WOOD.furnitureDark;
  ctx.beginPath();
  ctx.moveTo(x0 + 3, top);
  ctx.lineTo(x0 + 3, top - 14);
  ctx.quadraticCurveTo(x0 + w / 2, top - 26, x0 + w - 3, top - 14);
  ctx.lineTo(x0 + w - 3, top);
  ctx.fill();
  ctx.strokeStyle = rgba('#000000', 0.4);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let i = 1; i < 6; i++) {
    ctx.moveTo(x0 + 6, top - i * 3);
    ctx.lineTo(x0 + w - 6, top - i * 3);
  }
  ctx.stroke();
  bevel(ctx, x0, top, w, 4, WOOD.furnitureLight, 0.8, 0.2);
  bevel(ctx, x0 + 2, top + 4, 18, 26, WOOD.furniture, 1, 0.2);
  bevel(ctx, x0 + w - 20, top + 4, 18, 26, WOOD.furniture, 1, 0.2);
  for (const dx of [11, w - 11])
    for (const dy of [10, 18, 25]) {
      ctx.fillStyle = WOOD.brassLight;
      ctx.fillRect(x0 + dx - 1, top + dy, 2, 1);
    }
}

export function drawChair(ctx, x, flip = false) {
  const base = FURN_Y + 8;
  ctx.save();
  ctx.translate(x, base);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = WOOD.furnitureDark;
  ctx.fillRect(-8, -14, 2, 14);
  ctx.fillRect(6, -14, 2, 14);
  ctx.fillStyle = '#5a4434';
  roundRect(ctx, -9, -17, 18, 4, 1.5);
  ctx.fill();
  roundRect(ctx, -10, -40, 5, 25, 2);
  ctx.fill();
  ctx.restore();
}

export function drawFloorLamp(ctx, x) {
  const base = FURN_Y + 2;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x, base, 7, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - 5, base - 2, 10, 2);
  ctx.fillRect(x - 0.8, base - 66, 1.6, 64);
}
export function drawLampShade(ctx, x, top, on = true, size = 1) {
  ctx.fillStyle = on ? '#f2deae' : '#6a5a48';
  ctx.beginPath();
  ctx.moveTo(x - 5 * size, top);
  ctx.lineTo(x + 5 * size, top);
  ctx.lineTo(x + 9 * size, top + 12 * size);
  ctx.lineTo(x - 9 * size, top + 12 * size);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(x - 9 * size, top + 10.5 * size, 18 * size, 1.5 * size);
}

export function drawPillar(ctx, x, yTop, yBot, w = 18, dark = false) {
  const base = dark ? '#1e100a' : shade(WOOD.panel, 0.05);
  bevel(ctx, x - w / 2, yTop, w, yBot - yTop, base, 2, dark ? 0.08 : 0.2);
  if (!dark) {
    ctx.fillStyle = rgba('#000000', 0.25);
    ctx.fillRect(x + w / 2 - 4, yTop, 4, yBot - yTop);
  }
}

export function drawVase(ctx, x, y) {
  ctx.fillStyle = '#2c4a5a';
  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.quadraticCurveTo(x - 6, y - 6, x - 2, y - 12);
  ctx.lineTo(x + 2, y - 12);
  ctx.quadraticCurveTo(x + 6, y - 6, x + 2, y);
  ctx.fill();
  ctx.fillStyle = '#7a2a2a';
  ctx.beginPath();
  ctx.arc(x - 2, y - 15, 2.4, 0, Math.PI * 2);
  ctx.arc(x + 2, y - 16, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

export function drawPipes(ctx, xa, xb, y) {
  for (const [dy, r, c] of [
    [0, 3, '#3a3630'],
    [9, 2, '#4a3a2a'],
  ]) {
    const g = ctx.createLinearGradient(0, y + dy - r, 0, y + dy + r);
    g.addColorStop(0, shade(c, 0.3));
    g.addColorStop(1, shade(c, -0.5));
    ctx.fillStyle = g;
    ctx.fillRect(xa, y + dy - r, xb - xa, r * 2);
  }
}

export function drawPlanter(ctx, x, w = 70) {
  const base = FURN_Y + 30;
  bevel(ctx, x - w / 2, base - 18, w, 18, '#4a3428', 1.2, 0.2);
  ctx.fillStyle = '#1e140e';
  ctx.fillRect(x - w / 2 + 3, base - 18, w - 6, 3);
  for (let i = 0; i < 9; i++) {
    const px = x - w / 2 + 6 + (i * (w - 12)) / 8;
    const n = noise1(i, x | 0);
    ctx.fillStyle = n > 0.5 ? '#2a4022' : '#1a2c18';
    ctx.beginPath();
    ctx.ellipse(px, base - 22 - n * 6, 5 + n * 3, 7 + n * 5, (n - 0.5) * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- dynamic interactables
export function drawWardrobe(ctx, x, open = 0, occupied = false, w = 58, h = 108) {
  const base = FURN_Y,
    x0 = x - w / 2,
    top = base - h;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x0 + 4, top + 6, w, h - 4);
  // crown (arched pediment like the screenshots)
  ctx.fillStyle = WOOD.furniture;
  ctx.beginPath();
  ctx.moveTo(x0 - 3, top + 6);
  ctx.lineTo(x0 - 3, top);
  ctx.quadraticCurveTo(x, top - 14, x0 + w + 3, top);
  ctx.lineTo(x0 + w + 3, top + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = WOOD.furnitureLight;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  bevel(ctx, x0, top + 5, w, h - 5, WOOD.furniture, 1.5, 0.18);
  // interior
  const ix = x0 + 3,
    iy = top + 9,
    iw = w - 6,
    ih = h - 18;
  ctx.fillStyle = '#0d0705';
  ctx.fillRect(ix, iy, iw, ih);
  const dw = iw / 2;
  const sw = dw * (1 - open * 0.85);
  // doors (left hinged left, right hinged right)
  for (const side of [0, 1]) {
    const dx = side === 0 ? ix : ix + iw - sw;
    const c = open > 0 ? shade(WOOD.furnitureLight, -0.1 - open * 0.2) : shade(WOOD.furnitureLight, -0.05);
    bevel(ctx, dx, iy, sw, ih, c, 1, 0.15);
    if (sw > 8) {
      ctx.strokeStyle = rgba('#000000', 0.35);
      ctx.lineWidth = 0.9;
      ctx.strokeRect(dx + 3, iy + 6, sw - 6, ih * 0.42);
      ctx.strokeRect(dx + 3, iy + ih * 0.52, sw - 6, ih * 0.42);
      ctx.fillStyle = WOOD.brassLight;
      ctx.beginPath();
      ctx.arc(side === 0 ? dx + sw - 3 : dx + 3, iy + ih * 0.48, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (occupied && open > 0.2) {
    // eyes of the hiding player peeking (placeholder)
    ctx.fillStyle = 'rgba(255,240,220,0.6)';
    ctx.fillRect(x - 3, iy + 22, 1.5, 1);
    ctx.fillRect(x + 1.5, iy + 22, 1.5, 1);
  }
  bevel(ctx, x0 - 2, base - 8, w + 4, 8, WOOD.furnitureDark, 1, 0.2);
}

export function drawDresser(ctx, x, w = 50, h = 40, openRows = [], rows = 3) {
  const base = FURN_Y,
    x0 = x - w / 2,
    top = base - h;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x0 + 3, top + 3, w, h);
  bevel(ctx, x0, top, w, h, WOOD.furniture, 1.2, 0.18);
  bevel(ctx, x0 - 2, top - 3, w + 4, 4, WOOD.furnitureLight, 0.8, 0.25);
  const rh = (h - 8) / rows;
  for (let r = 0; r < rows; r++) {
    const ry = top + 3 + r * rh;
    const op = openRows[r] || 0;
    if (op > 0) {
      ctx.fillStyle = '#0c0604';
      ctx.fillRect(x0 + 3, ry, w - 6, rh - 1.5);
      // drawer pulled toward the viewer → appears lower and larger
      bevel(ctx, x0 + 1, ry + op * 4, w - 2, rh - 1.5, shade(WOOD.furnitureLight, -0.05), 0.9, 0.2);
      ctx.fillStyle = '#1a0c06';
      ctx.fillRect(x0 + 3, ry + op * 4 - 1.5, w - 6, 2);
    } else {
      bevel(ctx, x0 + 3, ry, w - 6, rh - 1.5, shade(WOOD.furniture, 0.1), 0.9, 0.18);
    }
    ctx.fillStyle = WOOD.brassLight;
    ctx.fillRect(x - 3, ry + rh / 2 - 1 + op * 4, 6, 1.4);
  }
  ctx.fillStyle = WOOD.furnitureDark;
  ctx.fillRect(x0 + 2, base - 4, 3, 4);
  ctx.fillRect(x0 + w - 5, base - 4, 3, 4);
}

export function drawChest(ctx, x, open = 0, w = 44) {
  const base = FURN_Y + 14,
    x0 = x - w / 2,
    h = 20,
    top = base - h;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(x, base, w / 2 + 3, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  bevel(ctx, x0, top, w, h, '#6a4e3e', 1, 0.2);
  for (const sx of [6, w / 2 - 1, w - 8]) {
    ctx.fillStyle = '#3a2a22';
    ctx.fillRect(x0 + sx, top, 2.5, h);
  }
  // lid (rotates up/back when opened)
  ctx.save();
  ctx.translate(x0, top);
  ctx.scale(1, 1 - open * 1.6);
  bevel(ctx, 0, -8, w, 8, '#7a5a48', 1, 0.2);
  ctx.restore();
  if (open > 0.3) {
    ctx.fillStyle = '#0c0604';
    ctx.fillRect(x0 + 2, top - 1, w - 4, 3);
  } else {
    ctx.fillStyle = WOOD.brassLight;
    ctx.fillRect(x - 2, top - 2, 4, 4);
  }
}

export function drawLever(ctx, x, y, on) {
  bevel(ctx, x - 7, y - 12, 14, 24, '#4a4440', 1, 0.25);
  ctx.fillStyle = '#1a1614';
  ctx.fillRect(x - 1.5, y - 8, 3, 16);
  ctx.save();
  ctx.translate(x, y + (on ? 6 : -6));
  ctx.rotate(on ? 0.5 : -0.5);
  ctx.fillStyle = '#8a8070';
  ctx.fillRect(-1.2, -14, 2.4, 14);
  ctx.fillStyle = on ? '#6aa04a' : '#a8402a';
  ctx.beginPath();
  ctx.arc(0, -15, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawGate(ctx, x, openFrac, yTop = W.CEIL + 4) {
  const yBot = W.FLOOR_FRONT + 4;
  const lift = (yBot - yTop - 30) * openFrac;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 16, yTop, 32, yBot - yTop);
  ctx.clip();
  ctx.translate(0, -lift);
  ctx.fillStyle = '#1e1c1a';
  for (let i = -2; i <= 2; i++) ctx.fillRect(x + i * 6 - 1.2, yTop, 2.4, yBot - yTop);
  ctx.fillStyle = '#3a3632';
  for (let y = yTop + 10; y < yBot; y += 28) ctx.fillRect(x - 14, y, 28, 3);
  ctx.restore();
  bevel(ctx, x - 17, yTop - 4, 34, 6, '#2a2624', 1, 0.3);
}

export function drawItemSparkle(ctx, x, y, t, color = '255,230,170') {
  const a = 0.5 + Math.sin(t * 5 + x) * 0.3;
  ctx.fillStyle = `rgba(${color},${a})`;
  const s = 2 + Math.sin(t * 3 + x * 0.1);
  ctx.fillRect(x - s, y - 0.4, s * 2, 0.8);
  ctx.fillRect(x - 0.4, y - s, 0.8, s * 2);
}

// ---------------------------------------------------------------- partition + exit door
export function drawPartition(ctx, xEnd, yTop, yBot, solid = false) {
  const x0 = xEnd - W.PART_W,
    x1 = xEnd,
    cx = (x0 + x1) / 2;
  // wall body (cut-away)
  let g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, '#2a160d');
  g.addColorStop(0.15, '#4a2a1a');
  g.addColorStop(0.85, '#4a2a1a');
  g.addColorStop(1, '#22120a');
  ctx.fillStyle = g;
  ctx.fillRect(x0, yTop, W.PART_W, yBot - yTop);
  if (solid) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x0, W.FEET + 8, W.PART_W, yBot - W.FEET - 8);
    return;
  }
  // door frame (casing)
  const dTop = W.FEET + 4 - W.DOOR_H;
  bevel(ctx, cx - W.DOOR_W / 2 - 7, dTop - 9, W.DOOR_W + 14, W.FEET + 4 - dTop + 9, '#6a3e26', 1.5, 0.25);
  // pediment above door
  bevel(ctx, cx - W.DOOR_W / 2 - 10, dTop - 15, W.DOOR_W + 20, 6, '#7a4a2e', 1, 0.3);
  // doorway hole (seen when the door is open)
  ctx.fillStyle = '#0a0503';
  ctx.fillRect(cx - W.DOOR_W / 2, dTop, W.DOOR_W, W.DOOR_H + 4);
  g = ctx.createLinearGradient(0, dTop, 0, W.FEET + 4);
  g.addColorStop(0, 'rgba(40,20,10,0)');
  g.addColorStop(1, 'rgba(80,40,20,0.45)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - W.DOOR_W / 2, dTop, W.DOOR_W, W.DOOR_H + 4);
  // threshold
  bevel(ctx, cx - W.DOOR_W / 2 - 8, W.FEET + 4, W.DOOR_W + 16, 4, '#3a2014', 1, 0.2);
  // floor under partition
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x0, W.FEET + 8, W.PART_W, yBot - W.FEET - 8);
}

export function drawDoorPanel(ctx, xEnd, openFrac, num, locked, style = {}) {
  const cx = xEnd - W.PART_W / 2;
  const dTop = W.FEET + 4 - W.DOOR_H;
  const x0 = cx - W.DOOR_W / 2;
  const ang = openFrac * Math.PI * 0.5 * 0.92;
  const pw = W.DOOR_W * Math.cos(ang);
  if (pw < 1) return;
  const color = style.color || '#6e4129';
  bevel(ctx, x0, dTop, pw, W.DOOR_H, openFrac > 0 ? shade(color, -openFrac * 0.45) : color, 1.2, 0.18);
  grain(ctx, x0 + 1, dTop + 1, pw - 2, W.DOOR_H - 2, rgba('#000000', 0.1), num, 0.18);
  if (pw > 12) {
    const k = pw / W.DOOR_W;
    ctx.strokeStyle = rgba('#000000', 0.38);
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 + 5 * k, dTop + 22, pw - 10 * k, 30);
    ctx.strokeRect(x0 + 5 * k, dTop + 58, pw - 10 * k, 32);
    ctx.strokeStyle = rgba('#ffd0a0', 0.1);
    ctx.strokeRect(x0 + 6 * k, dTop + 23, pw - 12 * k, 28);
    // handle
    ctx.fillStyle = WOOD.brassLight;
    ctx.fillRect(x0 + pw - 9 * k, dTop + 54, 6 * k, 1.8);
    ctx.fillStyle = WOOD.brass;
    ctx.beginPath();
    ctx.arc(x0 + pw - 5 * k, dTop + 55, 1.6, 0, Math.PI * 2);
    ctx.fill();
    if (openFrac < 0.05) drawPlate(ctx, cx, dTop + 12, num, 1);
    if (locked && openFrac < 0.05) {
      // padlock
      ctx.strokeStyle = '#9a9a9a';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(x0 + pw - 6, dTop + 61, 2.6, Math.PI, 0);
      ctx.stroke();
      bevel(ctx, x0 + pw - 9.5, dTop + 61, 7, 6, '#8a8a8a', 0.6, 0.3);
      ctx.fillStyle = '#222';
      ctx.fillRect(x0 + pw - 6.4, dTop + 63, 0.8, 2);
    }
  }
}
