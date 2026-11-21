// Light-map renderer. A low-resolution canvas is filled with each room's
// ambient colour, lights are added with 'lighter', then the map is multiplied
// over the scene. Cheap enough for mobile (≈ a dozen radial gradients).
import { hash2 } from '../core/util.js';

export class Lighting {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.res = 0.5;
  }
  resize(cssW, cssH, quality) {
    this.res = quality === 'low' ? 0.3 : 0.5;
    this.canvas.width = Math.max(1, Math.ceil(cssW * this.res));
    this.canvas.height = Math.max(1, Math.ceil(cssH * this.res));
  }

  static intensity(l, t) {
    let k = 1;
    switch (l.flicker) {
      case 'fire':
        k = 0.82 + Math.sin(t * 8.3 + l.phase) * 0.08 + Math.sin(t * 13.7 + l.phase * 2) * 0.06 + Math.sin(t * 3.1) * 0.04;
        break;
      case 'dying': {
        const n = hash2(Math.floor(t * 9 + l.phase), 7) / 4294967296;
        const m = hash2(Math.floor(t * 0.7 + l.phase), 9) / 4294967296;
        k = m < 0.45 ? (n < 0.55 ? 0.05 : 0.5 + n * 0.4) : 0.75 + n * 0.15;
        break;
      }
      case 'buzz':
        k = 0.9 + (hash2(Math.floor(t * 20 + l.phase), 3) / 4294967296) * 0.1;
        break;
      case 'window':
        k = 1 + (l.room?.lightning || 0) * 6;
        break;
      default:
        k = 0.97 + Math.sin(t * 1.7 + l.phase) * 0.03;
    }
    const ft = l.room?.flickerT || 0;
    if (ft > 0) {
      const n = hash2(Math.floor(t * 18 + l.phase * 3), 5) / 4294967296;
      k *= n < 0.5 ? 0.08 : 1;
    }
    return k * l.i;
  }

  render(game, view, t) {
    const { ctx, res } = this;
    const { camX, camY, scale } = view;
    const s = scale * res;
    const cw = this.canvas.width,
      ch = this.canvas.height;
    const bright = game.settings.brightness;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);

    const rooms = game.rooms.visibleRooms(camX, camX + view.viewW);
    for (const r of rooms) {
      const a = r.ambient;
      const lb = r.lightning * 70;
      const m = bright;
      const c = `rgb(${Math.min(255, a[0] * m + lb) | 0},${Math.min(255, a[1] * m + lb * 1.05) | 0},${Math.min(255, a[2] * m + lb * 1.3) | 0})`;
      ctx.fillStyle = c;
      const x0 = (r.drawX0 - camX) * s,
        x1 = (r.x1 - camX) * s;
      ctx.fillRect(Math.floor(x0), 0, Math.ceil(x1 - x0) + 1, ch);
    }

    ctx.globalCompositeOperation = 'lighter';
    for (const r of rooms) {
      for (const l of r.lights) {
        const sx = (l.x - camX) * s,
          sy = (l.y - camY) * s,
          rr = l.r * s;
        if (sx + rr < 0 || sx - rr > cw) continue;
        const k = Lighting.intensity(l, t) * (0.75 + bright * 0.25);
        if (k <= 0.01) continue;
        const [cr, cg, cb] = l.color;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${Math.min(1, k)})`);
        g.addColorStop(0.35, `rgba(${cr},${cg},${cb},${Math.min(1, k * 0.55)})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
        // light pool on the floor below wall / ceiling fixtures
        if (l.y < 200 && !l.window) {
          const fy = (240 - camY) * s,
            fr = l.r * 0.85 * s;
          const fg = ctx.createRadialGradient(sx, fy, 0, sx, fy, fr);
          fg.addColorStop(0, `rgba(${cr},${cg},${cb},${Math.min(1, k * 0.38)})`);
          fg.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.fillStyle = fg;
          ctx.save();
          ctx.translate(sx, fy);
          ctx.scale(1, 0.45);
          ctx.translate(-sx, -fy);
          ctx.fillRect(sx - fr, fy - fr, fr * 2, fr * 2);
          ctx.restore();
        }
      }
    }

    // held light (lighter radial / flashlight cone)
    const pl = game.playerLight;
    if (pl) {
      const hx = (pl.x - camX) * s,
        hy = (pl.y - camY) * s;
      const [cr, cg, cb] = pl.color;
      const k = pl.k;
      if (pl.cone) {
        const len = pl.radius * s;
        const half = 0.42;
        const a0 = pl.facing > 0 ? 0 : Math.PI;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.arc(hx, hy, len, a0 - half, a0 + half);
        ctx.closePath();
        ctx.clip();
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, len);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${k})`);
        g.addColorStop(0.5, `rgba(${cr},${cg},${cb},${k * 0.6})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(hx - len, hy - len, len * 2, len * 2);
        ctx.restore();
        const sp = 46 * s;
        const g2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, sp);
        g2.addColorStop(0, `rgba(${cr},${cg},${cb},${k * 0.45})`);
        g2.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g2;
        ctx.fillRect(hx - sp, hy - sp, sp * 2, sp * 2);
      } else {
        const rr = pl.radius * s;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, rr);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${k})`);
        g.addColorStop(0.45, `rgba(${cr},${cg},${cb},${k * 0.45})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(hx - rr, hy - rr, rr * 2, rr * 2);
      }
    }

    // a faint personal light so the player never fully disappears
    {
      const p = game.player;
      if (!p.hidden && p.visible) {
        const hx = (p.x - camX) * s,
          hy = (p.y - 34 - camY) * s,
          rr = 46 * s;
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, rr);
        g.addColorStop(0, 'rgba(60,55,70,0.55)');
        g.addColorStop(1, 'rgba(60,55,70,0)');
        ctx.fillStyle = g;
        ctx.fillRect(hx - rr, hy - rr, rr * 2, rr * 2);
      }
    }

    // hint (Guiding-Light-style blue glow)
    for (const h of game.hints) {
      const sx = (h.x - camX) * s,
        sy = (h.y - camY) * s,
        rr = 60 * s;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr);
      g.addColorStop(0, `rgba(90,170,255,${0.6 * h.a})`);
      g.addColorStop(1, 'rgba(90,170,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}
