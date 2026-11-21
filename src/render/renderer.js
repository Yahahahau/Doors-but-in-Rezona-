// Main renderer: responsive layout, camera transform, static tile cache,
// dynamic objects, player, foreground parallax, lighting, bloom, post FX.
import { W } from '../core/const.js';
import { clamp, noise1 } from '../core/util.js';
import { Lighting } from './lighting.js';
import { Particles } from './particles.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.lighting = new Lighting();
    this.particles = new Particles();
    this.tiles = new Map(); // key → {canvas, room, used}
    this.view = { scale: 1, camX: 0, camY: 0, viewW: 400, viewH: 270, cssW: 1, cssH: 1, dpr: 1 };
    this.cam = { cx: 0, shake: 0 };
    this.quality = 'high';
    this.grain = makeGrain();
  }

  /** Computes the layout for any aspect ratio (portrait phone, landscape, iframe). */
  resize(cssW, cssH, dpr, quality) {
    this.quality = quality;
    const portrait = cssH > cssW * 1.15;
    let scale, bandTop, ctrlH = 0;
    if (portrait) {
      ctrlH = clamp(cssH * 0.25, 150, 270);
      const topBar = 50;
      const avail = cssH - ctrlH - topBar;
      scale = Math.min(cssW / W.MIN_VIEW_W, avail / W.VIEW_H);
      bandTop = topBar + Math.max(0, avail - W.VIEW_H * scale) * 0.5;
    } else {
      scale = cssH / (W.VIEW_H + 26);
      if (cssW / scale < W.MIN_VIEW_W) scale = cssW / W.MIN_VIEW_W;
      bandTop = Math.max(0, (cssH - (W.VIEW_H + 26) * scale) / 2);
    }
    const capDpr = quality === 'low' ? 1 : Math.min(dpr, 2);
    this.canvas.width = Math.round(cssW * capDpr);
    this.canvas.height = Math.round(cssH * capDpr);
    const v = this.view;
    v.cssW = cssW;
    v.cssH = cssH;
    v.dpr = capDpr;
    v.scale = scale;
    v.viewW = cssW / scale;
    v.viewH = cssH / scale;
    v.camY = -bandTop / scale;
    v.portrait = portrait;
    v.bandTop = bandTop;
    v.bandBottom = bandTop + W.VIEW_H * scale;
    v.ctrlH = ctrlH;
    // tile resolution in px per world unit
    const cap = quality === 'low' ? 1.6 : 3;
    v.res = Math.min(scale * capDpr, cap);
    v.yTop = Math.floor(v.camY) - 2;
    v.yBot = Math.ceil(v.camY + v.viewH) + 2;
    this.tiles.clear();
    this.lighting.resize(cssW, cssH, quality);
    this.particles.setQuality(quality);
    this.vignette = makeVignette(cssW, cssH);
    return v;
  }

  dropRoom(room) {
    for (const [k, t] of this.tiles) if (t.room === room) this.tiles.delete(k);
  }

  tile(room, i) {
    const key = room.id + ':' + i;
    let t = this.tiles.get(key);
    if (t) return t;
    const v = this.view;
    const xa = room.drawX0 + i * W.TILE_W;
    const xb = Math.min(xa + W.TILE_W, room.x1);
    const wW = xb - xa + 1;
    const c = document.createElement('canvas');
    c.width = Math.ceil(wW * v.res);
    c.height = Math.ceil((v.yBot - v.yTop) * v.res);
    const g = c.getContext('2d');
    g.setTransform(v.res, 0, 0, v.res, -xa * v.res, -v.yTop * v.res);
    g.beginPath();
    g.rect(xa, v.yTop, wW, v.yBot - v.yTop);
    g.clip();
    room.drawStatic(g, xa, xb + 1, v.yTop, v.yBot, v.res);
    t = { canvas: c, room, xa, w: wW };
    this.tiles.set(key, t);
    return t;
  }

  /** build one missing tile per frame for rooms about to be seen */
  prewarm(rooms) {
    for (const r of rooms) {
      const n = Math.ceil((r.x1 - r.drawX0) / W.TILE_W);
      for (let i = 0; i < n; i++)
        if (!this.tiles.has(r.id + ':' + i)) {
          this.tile(r, i);
          return;
        }
    }
  }

  updateCamera(dt, game) {
    const v = this.view,
      p = game.player;
    const [bl, br] = game.rooms.cameraBounds();
    const look = p.hidden ? 0 : p.facing * Math.min(40, v.viewW * 0.1);
    const target = p.x + look;
    if (this.cam.snap) {
      this.cam.cx = target;
      this.cam.snap = false;
    }
    this.cam.cx += (target - this.cam.cx) * Math.min(1, dt * 4.5);
    let cx = this.cam.cx;
    if (br - bl <= v.viewW) cx = (bl + br) / 2;
    else cx = clamp(cx, bl + v.viewW / 2, br - v.viewW / 2);
    this.cam.cx = cx;
    v.camX = cx - v.viewW / 2;
    if (this.cam.shake > 0) this.cam.shake = Math.max(0, this.cam.shake - dt);
  }

  render(game, t) {
    const { ctx } = this;
    const v = this.view;
    let camX = v.camX,
      camY = v.camY;
    if (this.cam.shake > 0 && game.settings.shake) {
      camX += (Math.random() - 0.5) * this.cam.shake * 6;
      camY += (Math.random() - 0.5) * this.cam.shake * 4;
    }
    const k = v.scale * v.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#050302';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(k, 0, 0, k, -camX * k, -camY * k);

    const xa = camX,
      xb = camX + v.viewW;
    const rooms = game.rooms.visibleRooms(xa, xb);

    // 1) static tiles
    for (const r of rooms) {
      const i0 = Math.max(0, Math.floor((xa - r.drawX0) / W.TILE_W));
      const i1 = Math.floor((Math.min(xb, r.x1) - r.drawX0) / W.TILE_W);
      for (let i = i0; i <= i1; i++) {
        const tl = this.tile(r, i);
        ctx.drawImage(tl.canvas, tl.xa, v.yTop, tl.w, v.yBot - v.yTop);
      }
    }
    // 2) dynamic objects
    for (const r of rooms) r.drawDynamic(ctx, t, xa, xb, game);
    // 3) player
    game.player.draw(ctx, t, game.heldIcon());
    // 4) particles (lit dust / embers) — before lighting so darkness hides them
    this.particles.draw(ctx, t, Lighting);
    // 5) foreground
    for (const r of rooms) r.drawForeground(ctx, t, xa, xb, v.yTop, v.yBot, camX + v.viewW / 2, game);

    // 6) lighting multiply
    this.lighting.render(game, { camX, camY, scale: v.scale, viewW: v.viewW }, t);
    ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.lighting.canvas, 0, 0, v.cssW, v.cssH);
    ctx.globalCompositeOperation = 'source-over';

    // 7) bloom / glow (additive)
    ctx.setTransform(k, 0, 0, k, -camX * k, -camY * k);
    ctx.globalCompositeOperation = 'lighter';
    for (const r of rooms)
      for (const l of r.lights) {
        if (!l.glow) continue;
        const ki = Lighting.intensity(l, t);
        if (ki < 0.05) continue;
        const [cr, cg, cb] = l.color;
        for (const [gx, gy, gs] of l.glow) {
          if (gx < xa - 40 || gx > xb + 40) continue;
          const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gs * 2.6);
          g.addColorStop(0, `rgba(255,248,230,${0.85 * Math.min(1, ki)})`);
          g.addColorStop(0.25, `rgba(${cr},${cg},${cb},${0.35 * ki})`);
          g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(gx - gs * 2.6, gy - gs * 2.6, gs * 5.2, gs * 5.2);
        }
      }
    const pl = game.playerLight;
    if (pl && !pl.cone) {
      const g = ctx.createRadialGradient(pl.x, pl.y - 3, 0, pl.x, pl.y - 3, 9);
      g.addColorStop(0, `rgba(255,220,150,${0.9 * pl.k})`);
      g.addColorStop(1, 'rgba(255,140,40,0)');
      ctx.fillStyle = g;
      ctx.fillRect(pl.x - 9, pl.y - 12, 18, 18);
    }
    // hint sparkles
    for (const h of game.hints) {
      for (let i = 0; i < 5; i++) {
        const a = t * 1.3 + i * 1.256;
        const sx = h.x + Math.cos(a) * 14,
          sy = h.y + Math.sin(a * 1.4) * 18;
        ctx.fillStyle = `rgba(140,200,255,${0.6 * h.a})`;
        ctx.fillRect(sx - 0.8, sy - 0.8, 1.6, 1.6);
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    // 8) post: hiding view, vignette, grain, fades
    ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    if (game.player.hidden) drawHidingOverlay(ctx, v, t);
    ctx.drawImage(this.vignette, 0, 0, v.cssW, v.cssH);
    if (this.quality !== 'low') {
      ctx.globalAlpha = 0.06;
      const ox = (t * 977) % 128 | 0,
        oy = (t * 613) % 128 | 0;
      ctx.fillStyle = this.grainPat || (this.grainPat = ctx.createPattern(this.grain, 'repeat'));
      ctx.translate(-ox, -oy);
      ctx.fillRect(ox, oy, v.cssW, v.cssH);
      ctx.translate(ox, oy);
      ctx.globalAlpha = 1;
    }
    // world-space prompt (crisp, drawn last)
    if (game.prompt) drawPrompt(ctx, game.prompt, v, camX, camY);
    if (game.fade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${game.fade})`;
      ctx.fillRect(0, 0, v.cssW, v.cssH);
    }
  }
}

function drawPrompt(ctx, p, v, camX, camY) {
  const sx = (p.x - camX) * v.scale,
    sy = (p.y - camY) * v.scale;
  const fs = Math.round(clamp(v.scale * 6.5, 11, 16));
  ctx.font = `600 ${fs}px system-ui, "Noto Sans Thai", sans-serif`;
  const tw = ctx.measureText(p.text).width;
  const pad = fs * 0.6,
    bh = fs * 1.9,
    icon = bh;
  const w = tw + pad * 2 + icon * 0.8;
  let x = clamp(sx - w / 2, 6, v.cssW - w - 6);
  const y = Math.max(6, sy - bh - 4);
  ctx.fillStyle = 'rgba(22,12,8,0.82)';
  rr(ctx, x, y, w, bh, bh / 2);
  ctx.fill();
  ctx.strokeStyle = p.disabled ? 'rgba(200,90,70,0.6)' : 'rgba(241,220,192,0.45)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // key glyph
  ctx.fillStyle = p.disabled ? '#c86a50' : '#f1dcc0';
  ctx.beginPath();
  ctx.arc(x + bh / 2, y + bh / 2, bh * 0.33, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a0e08';
  ctx.font = `800 ${Math.round(fs * 0.8)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.disabled ? '!' : 'E', x + bh / 2, y + bh / 2 + 0.5);
  ctx.font = `600 ${fs}px system-ui, "Noto Sans Thai", sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillStyle = p.disabled ? '#e8b0a0' : '#f1dcc0';
  ctx.fillText(p.text, x + bh * 0.85, y + bh / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

function drawHidingOverlay(ctx, v, t) {
  // looking out through wardrobe door slits
  ctx.fillStyle = 'rgba(6,3,2,0.86)';
  const gap = v.cssW * 0.06;
  const cx = v.cssW / 2;
  ctx.fillRect(0, 0, cx - gap, v.cssH);
  ctx.fillRect(cx + gap, 0, v.cssW - cx - gap, v.cssH);
  ctx.fillStyle = 'rgba(6,3,2,0.5)';
  ctx.fillRect(cx - gap, 0, gap * 2, v.cssH);
  ctx.fillStyle = 'rgba(70,40,24,0.5)';
  for (let y = 0; y < v.cssH; y += 22) ctx.fillRect(0, y, v.cssW, 2);
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeVignette(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w / 2));
  c.height = Math.max(2, Math.round(h / 2));
  const g = c.getContext('2d');
  const r = Math.hypot(c.width, c.height) / 2;
  const grad = g.createRadialGradient(c.width / 2, c.height / 2, r * 0.45, c.width / 2, c.height / 2, r);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.7)');
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

function makeGrain() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const d = g.createImageData(128, 128);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = (noise1(i, 42) * 255) | 0;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return c;
}
