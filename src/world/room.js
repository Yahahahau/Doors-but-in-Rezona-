// A loaded room instance: converts a spec (local coords) into world space,
// owns its objects, lights and per-room state, and knows how to draw itself.
import { W } from '../core/const.js';
import { pad4 } from '../core/util.js';
import { bus } from '../core/events.js';
import { TYPES } from './objects.js';
import * as A from '../render/art.js';

let uid = 1;

export class Room {
  constructor(spec, x0) {
    this.id = uid++;
    this.spec = spec;
    this.door = spec.door;
    this.type = spec.type;
    this.name = spec.name;
    this.style = spec.style;
    this.dark = !!spec.dark;
    this.width = spec.width;
    this.x0 = x0;
    this.x1 = x0 + spec.width;
    this.beams = spec.beams.map((b) => b + x0);
    this.rugs = (spec.rugs || []).map((r) => ({ ...r, x0: r.x0 + x0, x1: r.x1 + x0 }));
    this.ambience = spec.ambience || {};
    this.hintAfter = spec.hintAfter ?? 40;
    this.noEntrance = !!spec.noEntrance;
    this.noExit = spec.exit?.req?.kind === 'final';
    this.timeIn = 0;
    this.visited = false;
    this.prevLoaded = false;
    this.flickerT = 0; // > 0 → all lights flicker hard (future Rush warning)
    this.lightning = 0;
    this.nextLightning = 14 + Math.random() * 20;
    this.ambient = this.computeAmbient(spec);

    this.objects = [];
    for (const o of spec.objects) {
      const c = structuredClone(o);
      c.x += x0;
      if (c.x0 !== undefined) c.x0 += x0;
      if (c.x1 !== undefined) c.x1 += x0;
      this.objects.push(c);
    }
    if (!this.noExit) {
      this.exit = {
        type: 'exitDoor',
        x: this.x1 - W.PART_W / 2,
        num: this.door + 1,
        locked: !!spec.exit?.locked,
        keyId: spec.exit?.keyId,
        req: spec.exit?.req || null,
        open: 0,
        state: 'closed', // closed | opening | open | closing | sealed
      };
      this.objects.push(this.exit);
    } else {
      const el = this.objects.find((o) => o.type === 'elevator');
      if (el) this.objects.push({ type: 'elevatorEnd', x: el.x });
    }
    this.sortObjects();
    this.lights = this.collectLights();
  }

  computeAmbient(spec) {
    const t = spec.ambientTint ?? 1;
    if (spec.dark) {
      if (spec.type === 'greenhouse') return [5, 9, 8];
      return [5, 4, 7];
    }
    if (spec.type === 'gate' || spec.type === 'final') return [34 * t, 30 * t, 28 * t];
    return [58 * t, 40 * t, 34 * t];
  }

  sortObjects() {
    const z = (o) => (o.type === 'exitDoor' ? 20 : TYPES[o.type]?.z ?? 5);
    this.staticObjs = this.objects.filter((o) => TYPES[o.type]?.static).sort((a, b) => z(a) - z(b));
    this.dynObjs = this.objects.filter((o) => {
      const T = TYPES[o.type];
      return o.type === 'exitDoor' || (T && !T.static && T.layer !== 'fg') || (T && T.dynamic);
    });
    this.dynObjs.sort((a, b) => z(a) - z(b));
    this.fgObjs = this.objects.filter((o) => TYPES[o.type]?.layer === 'fg');
  }

  addObject(o) {
    this.objects.push(o);
    this.sortObjects();
  }
  removeObject(o) {
    const i = this.objects.indexOf(o);
    if (i >= 0) this.objects.splice(i, 1);
    this.sortObjects();
  }

  collectLights() {
    const out = [];
    for (const o of this.objects) {
      const T = TYPES[o.type];
      if (!T?.lights) continue;
      for (const l of T.lights(o, this)) {
        l.phase = Math.random() * 100;
        l.room = this;
        out.push(l);
      }
    }
    return out;
  }

  /** extent of what this room draws (includes its entrance partition) */
  get drawX0() {
    return this.x0 - W.PART_W;
  }

  // ------------------------------------------------------------- update
  update(dt, game) {
    this.timeIn += dt;
    if (this.flickerT > 0) this.flickerT = Math.max(0, this.flickerT - dt);
    if (this.ambience.windows) {
      this.nextLightning -= dt;
      if (this.nextLightning <= 0) {
        this.nextLightning = 18 + Math.random() * 28;
        this.lightningSeq = [0, 0.18, 0.32];
        this.lightningClock = 0;
        bus.emit('lightning', { room: this });
      }
      if (this.lightningSeq) {
        this.lightningClock += dt;
        let v = 0;
        for (const s of this.lightningSeq) {
          const d = this.lightningClock - s;
          if (d >= 0 && d < 0.09) v = Math.max(v, 1 - d / 0.09);
        }
        this.lightning = v;
        if (this.lightningClock > 0.6) this.lightningSeq = null;
      }
    }
    for (const o of this.objects) TYPES[o.type]?.update?.(o, dt, game, this);
    if (this.exit) updateExit(this.exit, dt);
  }

  // ------------------------------------------------------------- drawing
  drawStatic(ctx, xa, xb, yTop, yBot, res) {
    A.drawArchitecture(ctx, this, xa, xb, yTop, yBot, res);
    for (const o of this.staticObjs) {
      const T = TYPES[o.type];
      const e = T.ext?.(o) ?? 30;
      if (!T.span && (o.x + e < xa - 2 || o.x - e > xb + 2)) continue;
      T.draw(ctx, o, this, 0, yTop, yBot);
    }
    // entrance & exit partitions
    if (this.drawX0 < xb && this.x0 > xa) A.drawPartition(ctx, this.x0, yTop, yBot, this.noEntrance);
    if (this.x1 - W.PART_W < xb && this.x1 > xa) A.drawPartition(ctx, this.x1, yTop, yBot, this.noExit);
  }

  drawDynamic(ctx, t, xa, xb, game) {
    // closed entrance door when the previous room is gone
    if (!this.noEntrance && !this.prevLoaded && this.x0 > xa && this.drawX0 < xb) {
      A.drawDoorPanel(ctx, this.x0, 0, this.door, false);
    }
    for (const o of this.dynObjs) {
      if (o.type === 'exitDoor') {
        if (o.x - 40 > xb || o.x + 40 < xa) continue;
        A.drawDoorPanel(ctx, this.x1, o.open, o.num, o.locked && o.state === 'closed');
        continue;
      }
      const T = TYPES[o.type];
      const e = T.ext?.(o) ?? 30;
      if (!T.span && (o.x + e < xa || o.x - e > xb)) continue;
      if (T.dynamic) T.dynamic(ctx, o, this, t);
      else T.draw(ctx, o, this, t);
    }
  }

  drawForeground(ctx, t, xa, xb, yTop, yBot, camCenter, game) {
    for (const o of this.fgObjs) {
      const T = TYPES[o.type];
      if (o.type === 'gate') {
        T.draw(ctx, o, this, t, yTop, yBot);
        continue;
      }
      // parallax: foreground moves faster than the world
      const px = o.x + (o.x - camCenter) * 0.3;
      const e = T.ext?.(o) ?? 30;
      if (px + e < xa || px - e > xb) continue;
      ctx.save();
      // fade foreground props that would hide the player
      const pd = Math.abs(px - (game?.player?.x ?? -1e9));
      if (pd < e + 14) ctx.globalAlpha = 0.28 + 0.72 * Math.min(1, Math.max(0, (pd - e) / 14 + 0.0));
      ctx.translate(px - o.x, 0);
      T.draw(ctx, o, this, t, yTop, yBot);
      ctx.restore();
    }
  }

  /** objects the hint system (Guiding-Light style) should point to */
  hintTargets(game) {
    const out = [];
    const ex = this.exit;
    for (const o of this.objects) {
      const T = TYPES[o.type];
      if (T?.hintTarget?.(o)) out.push(o);
      if (o.hasKey && !o.opened) out.push(o);
    }
    if (ex && ex.state === 'closed') {
      const ready =
        (!ex.locked || game.inv.hasKey(ex.keyId)) &&
        (!ex.req || ex.req.kind !== 'books' || game.inv.count('book') >= ex.req.need);
      if (this.dark || ready) out.push(ex);
    }
    return out;
  }
}

function updateExit(e, dt) {
  if (e.state === 'opening') {
    e.open = Math.min(1, e.open + dt * 2.4);
    if (e.open >= 1) e.state = 'open';
  } else if (e.state === 'closing') {
    e.open = Math.max(0, e.open - dt * 3);
    if (e.open <= 0) {
      e.state = 'sealed';
      bus.emit('sfx', { name: 'door_close', x: e.x });
    }
  }
}

// exit door behaviour lives here because it needs Room state
TYPES.exitDoor = {
  z: 20,
  ext: () => 30,
  solid: (o) => (o.open < 0.65 ? [o.x - W.PART_W / 2 + 14, o.x + W.PART_W / 2 + 4] : null),
  hintTarget: () => false,
  interact: {
    range: 22,
    prompt(o, g) {
      if (o.state !== 'closed') return null;
      if (o.req?.kind === 'books') {
        const have = g.inv.count('book');
        if (have < o.req.need) return `ปิดผนึก — ต้องใช้หนังสือ ${have}/${o.req.need}`;
        return 'วางหนังสือ & เปิดประตู';
      }
      if (o.locked) {
        if (g.inv.hasKey(o.keyId)) return 'ไขกุญแจ ' + pad4(o.keyId);
        if (g.inv.has('lockpick')) return 'สะเดาะกุญแจ';
        return 'ล็อกอยู่ — หากุญแจ ' + pad4(o.keyId);
      }
      return 'เปิดประตู ' + pad4(o.num);
    },
    act: (o, g) => g.openExit(o),
  },
};
