// Lightweight atmospheric particles: dust motes floating in lamp light,
// embers above fireplaces. Pool-based, capped by quality setting.
export class Particles {
  constructor() {
    this.list = [];
    this.max = 70;
  }
  setQuality(q) {
    this.max = q === 'low' ? 18 : 70;
  }
  clear() {
    this.list.length = 0;
  }

  update(dt, game, view) {
    const rooms = game.rooms.visibleRooms(view.camX, view.camX + view.viewW);
    // spawn
    let budget = 3;
    while (this.list.length < this.max && budget-- > 0) {
      const r = rooms[(Math.random() * rooms.length) | 0];
      if (!r || !r.lights.length) break;
      const l = r.lights[(Math.random() * r.lights.length) | 0];
      if (l.flicker === 'window') continue;
      if (l.flicker === 'fire' && Math.random() < 0.5) {
        this.list.push({
          kind: 'ember',
          x: l.x + (Math.random() - 0.5) * 30,
          y: l.y + 6,
          vx: (Math.random() - 0.5) * 6,
          vy: -12 - Math.random() * 14,
          life: 0,
          max: 1.2 + Math.random() * 1.4,
          light: l,
        });
        continue;
      }
      const a = Math.random() * Math.PI * 2,
        d = Math.random() * l.r * 0.65;
      this.list.push({
        kind: 'dust',
        x: l.x + Math.cos(a) * d,
        y: l.y + Math.sin(a) * d * 0.8 + 20,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 2,
        life: 0,
        max: 5 + Math.random() * 6,
        light: l,
        size: 0.5 + Math.random() * 0.7,
      });
    }
    for (const p of this.list) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'dust') {
        p.vx += (Math.random() - 0.5) * 2 * dt;
        p.vy += (Math.random() - 0.5) * 2 * dt;
      } else p.vx += (Math.random() - 0.5) * 30 * dt;
    }
    this.list = this.list.filter((p) => p.life < p.max && p.light.room && rooms.includes(p.light.room));
  }

  draw(ctx, t, Lighting) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.list) {
      const f = Math.sin((p.life / p.max) * Math.PI);
      if (p.kind === 'ember') {
        ctx.fillStyle = `rgba(255,${140 + ((p.life * 60) | 0)},60,${f * 0.9})`;
        ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
      } else {
        const k = Lighting.intensity(p.light, t);
        const dx = p.x - p.light.x,
          dy = p.y - p.light.y;
        const prox = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / p.light.r);
        const a = f * prox * k * 0.55;
        if (a < 0.02) continue;
        ctx.fillStyle = `rgba(255,225,180,${a})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
    ctx.restore();
  }
}
