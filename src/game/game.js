// Game state + gameplay systems that connect world, player and inventory:
// interaction targeting, door logic, pickups, hiding, items, hints, checkpoints.
import { W, PLAYER as P } from '../core/const.js';
import { bus } from '../core/events.js';
import { Save } from '../core/save.js';
import { pad4 } from '../core/util.js';
import { RoomManager, LAST_DOOR } from '../world/roomManager.js';
import { TYPES } from '../world/objects.js';
import { Player } from './player.js';
import { Inventory } from './inventory.js';
import { ITEMS, itemIcon } from './items.js';
import { RULES } from '../data/doors_rules.js';

export class Game {
  constructor(settings) {
    this.settings = settings;
    this.player = new Player();
    this.inv = new Inventory();
    this.rooms = new RoomManager(1);
    this.prompt = null;
    this.target = null;
    this.hints = [];
    this.fade = 1;
    this.fadeTarget = 0;
    this.time = 0;
    this.playerLight = null;
    this.mode = 'menu'; // menu | play | end
    this.stats = { doorsOpened: 0, startedAt: 0 };
    this._heldImgs = new Map();
    bus.on('room:enter', (e) => this.onEnter(e));
  }

  // ------------------------------------------------------------- lifecycle
  newGame(seed = (Math.random() * 1e9) | 0) {
    this.seed = seed;
    this.inv = new Inventory();
    this.rooms = new RoomManager(seed);
    const r = this.rooms.start(0);
    this.player.reset(r.x0 + 170);
    this.player.facing = 1;
    this.mode = 'play';
    this.fade = 1;
    this.fadeTarget = 0;
    this.stats = { doorsOpened: 0, startedAt: Date.now() };
    bus.emit('inv:changed');
    bus.emit('gold:changed', { gold: 0 });
    bus.emit('room:enter', { door: 0, room: r, initial: true });
  }

  continueGame(save) {
    this.seed = save.seed;
    this.inv = new Inventory();
    this.inv.load(save.inv);
    this.rooms = new RoomManager(save.seed);
    const r = this.rooms.start(save.door);
    this.player.reset(r.x0 + 40);
    this.mode = 'play';
    this.fade = 1;
    this.fadeTarget = 0;
    this.stats = save.stats || { doorsOpened: save.door, startedAt: Date.now() };
    bus.emit('gold:changed', { gold: this.inv.gold });
    bus.emit('room:enter', { door: save.door, room: r, initial: true });
  }

  /** demo world shown behind the main menu */
  attract(seed = 7) {
    this.rooms = new RoomManager(seed);
    const r = this.rooms.start(0);
    this.player.reset(r.x0 + 520);
    this.player.visible = false; // invisible during attract
    this.mode = 'menu';
    this.fade = 1;
    this.fadeTarget = 0;
    this.attractT = 0;
  }

  onEnter(e) {
    if (this.mode !== 'play') return;
    const { door, room } = e;
    if (!e.initial) this.stats.doorsOpened++;
    Save.write({ door, seed: this.seed, inv: this.inv.serialize(), stats: this.stats });
    if (room.type === 'final') bus.emit('toast', { text: 'Door 100 — ลิฟต์อยู่ข้างหน้า', time: 3 });
  }

  // ------------------------------------------------------------- per-frame
  update(dt, input) {
    this.time += dt;
    this.fade += (this.fadeTarget - this.fade) * Math.min(1, dt * 3);

    if (this.mode === 'menu') {
      // slow camera drift across the reception behind the menu
      this.attractT += dt;
      this.player.x = this.rooms.current.x0 + 380 + Math.sin(this.attractT * 0.08) * 330;
      this.rooms.update(dt, this);
      this.playerLight = null;
      this.hints = [];
      return;
    }
    if (this.mode !== 'play') return;

    for (const a of input.drain()) this.action(a);
    this.player.update(dt, input, this.rooms.solids());
    this.rooms.update(dt, this);
    this.inv.update(dt);
    this.updatePlayerLight(dt);
    this.updateTarget();
    this.updateHints(dt);
  }

  action(a) {
    if (a === 'interact') return this.interact();
    if (a === 'toggle') return this.toggleEquipped();
    if (a === 'use') return this.useEquipped();
    if (a.startsWith('slot')) return this.selectSlot(+a.slice(4) - 1);
  }

  // ------------------------------------------------------------- interaction
  updateTarget() {
    const p = this.player;
    let best = null,
      bestD = 1e9;
    const cx = p.x;
    for (const r of this.rooms.rooms) {
      if (r.x1 < cx - 200 || r.drawX0 > cx + 200) continue;
      for (const o of r.objects) {
        const T = TYPES[o.type];
        const it = T?.interact;
        if (!it) continue;
        if (p.hidden && p.hidden !== o) continue;
        const reach = (T.ext?.(o) ?? 20) * 0.6 + (it.range ?? P.INTERACT_RANGE);
        const d = Math.abs(o.x - cx);
        if (d > reach) continue;
        // pickups win ties
        const score = d - (o.type === 'pickup' ? 14 : 0);
        if (score < bestD && it.prompt(o, this)) {
          bestD = score;
          best = o;
        }
      }
    }
    this.target = best;
    if (best) {
      const T = TYPES[best.type];
      const text = T.interact.prompt(best, this);
      const y = best.type === 'pickup' ? best.y - 14 : best.type === 'exitDoor' ? W.FEET - W.DOOR_H - 22 : W.BASE - 70;
      const disabled = /ล็อก|ปิดผนึก/.test(text) && !/ไข|สะเดาะ/.test(text);
      this.prompt = { x: best.x, y: Math.min(y, p.y - P.H - 8), text, disabled };
    } else this.prompt = null;
  }

  interact() {
    const o = this.target;
    if (!o) return;
    this.player.setAnim('interact');
    TYPES[o.type].interact.act(o, this);
  }

  pickup(o) {
    const room = this.rooms.roomAt(o.x);
    if (o.gold) {
      this.inv.addGold(o.gold);
      bus.emit('sfx', { name: 'gold', x: o.x });
      bus.emit('toast', { text: `+${o.gold} ทอง`, time: 0.9 });
      room.removeObject(o);
      return;
    }
    const { id, data } = o.item;
    if (!this.inv.add(id, 1, data)) {
      bus.emit('toast', { text: 'กระเป๋าเต็ม' });
      bus.emit('sfx', { name: 'deny' });
      return;
    }
    bus.emit('sfx', { name: id === 'key' ? 'key' : 'pickup', x: o.x });
    bus.emit('item:pickup', { id, count: 1 });
    let name = ITEMS[id].name + (id === 'key' ? ' ' + pad4(data.num) : '');
    if (id === 'book') {
      const need = this.rooms.current.exit?.req?.need;
      if (need) name += ` (${this.inv.books}/${need})`;
    }
    bus.emit('toast', { text: 'ได้รับ ' + name, time: 1.2 });
    room.removeObject(o);
  }

  openExit(o) {
    if (o.state !== 'closed') return;
    if (o.req?.kind === 'books') {
      const have = this.inv.count('book');
      if (have < o.req.need) {
        bus.emit('sfx', { name: 'locked', x: o.x });
        return;
      }
      this.inv.useBooks(o.req.need);
      bus.emit('puzzle:solved', { kind: 'books' });
    }
    if (o.locked) {
      if (this.inv.hasKey(o.keyId)) {
        this.inv.useKey(o.keyId);
        bus.emit('sfx', { name: 'unlock', x: o.x });
      } else {
        const li = this.inv.find('lockpick');
        if (li >= 0) {
          this.inv.consume(li);
          bus.emit('sfx', { name: 'unlock', x: o.x });
          bus.emit('toast', { text: 'ใช้ที่สะเดาะกุญแจ' });
        } else {
          bus.emit('sfx', { name: 'locked', x: o.x });
          bus.emit('door:locked', { door: o.num });
          bus.emit('toast', { text: 'ประตูล็อก — กุญแจอยู่ในห้องนี้', time: 1.6 });
          return;
        }
      }
      o.locked = false;
    }
    o.state = 'opening';
    bus.emit('sfx', { name: 'door_open', x: o.x });
    bus.emit('noise', { x: o.x, loudness: 0.5 });
    bus.emit('door:open', { door: o.num });
  }

  hide(spot) {
    const p = this.player;
    if (spot.occupied) return;
    p.hidden = spot;
    p.x = spot.x;
    p.vx = 0;
    spot.occupied = true;
    spot.flash = 0.35;
    this.hiddenTime = 0;
    bus.emit('sfx', { name: 'wardrobe', x: spot.x });
    bus.emit('hide:enter', { spot });
  }
  unhide() {
    const p = this.player;
    const spot = p.hidden;
    if (!spot) return;
    spot.occupied = false;
    spot.flash = 0.35;
    p.hidden = null;
    p.y = W.FEET;
    bus.emit('sfx', { name: 'wardrobe', x: spot.x });
    bus.emit('hide:exit', { spot });
  }

  // ------------------------------------------------------------- items
  selectSlot(i) {
    const inv = this.inv;
    if (i < 0 || i >= inv.slots.length) return;
    const s = inv.slots[i];
    if (inv.selected === i) {
      // second tap on the selected slot uses / toggles it
      this.useEquipped();
      return;
    }
    if (inv.lightOn) inv.lightOn = false;
    inv.selected = s ? i : -1;
    if (s && ITEMS[s.id].kind === 'light') this.toggleEquipped(true);
    bus.emit('sfx', { name: 'ui' });
    bus.emit('inv:changed');
  }

  toggleEquipped(forceOn) {
    const inv = this.inv,
      e = inv.equipped;
    if (!e) return;
    const def = ITEMS[e.id];
    if (def.kind !== 'light') return this.useEquipped();
    if ((e.data[def.fuelKey] ?? 0) <= 0) {
      bus.emit('toast', { text: def.name + ' หมด' + (e.id === 'flashlight' ? ' — ใช้แบตเตอรี่' : '') });
      inv.lightOn = false;
      return;
    }
    inv.lightOn = forceOn ? true : !inv.lightOn;
    bus.emit('sfx', { name: inv.lightOn ? def.sfxOn : 'click', x: this.player.x });
    if (def.noise) bus.emit('noise', { x: this.player.x, loudness: def.noise });
    bus.emit('inv:changed');
  }

  useEquipped() {
    const inv = this.inv,
      e = inv.equipped;
    if (!e) return;
    const p = this.player;
    if (ITEMS[e.id].kind === 'light') return this.toggleEquipped();
    if (e.id === 'vitamins') {
      if (p.speedBoost > 0 || p.boostCooldown > 0) {
        bus.emit('sfx', { name: 'deny' });
        return;
      }
      p.speedBoost = RULES.items.vitamins.boostSec.value;
      p.boostCooldown = RULES.items.vitamins.cooldownAfterEffectSec.value;
      inv.consume(inv.selected);
      bus.emit('sfx', { name: 'vitamins', x: p.x });
      bus.emit('noise', { x: p.x, loudness: 0.5 });
      bus.emit('toast', { text: 'วิ่งเร็วขึ้น 8 วินาที' });
    } else if (e.id === 'battery') {
      const fi = inv.find('flashlight');
      if (fi < 0) return bus.emit('toast', { text: 'ต้องมีไฟฉายก่อน' });
      const fl = inv.slots[fi];
      fl.data.charge = RULES ? Math.min(1.1, (fl.data.charge || 0) + RULES.items.flashlight.batteryAddsFraction.value) : 1;
      inv.consume(inv.selected);
      bus.emit('sfx', { name: 'click', x: p.x });
      bus.emit('toast', { text: 'ชาร์จไฟฉาย +50%' });
    } else {
      bus.emit('toast', { text: ITEMS[e.id].name + ' ใช้กับประตูอัตโนมัติ', time: 1.2 });
    }
  }

  heldIcon() {
    const e = this.inv.equipped;
    if (!e) return null;
    const key = e.id + (e.id === 'key' ? e.data.num : '');
    let im = this._heldImgs.get(key);
    if (!im) {
      im = new Image();
      im.src = itemIcon(e.id, e.data);
      this._heldImgs.set(key, im);
    }
    return im;
  }

  updatePlayerLight(dt) {
    const l = this.inv.activeLight();
    const p = this.player;
    if (!l || p.hidden) {
      this.playerLight = null;
      return;
    }
    const flick = 1 - l.flicker * (0.5 + 0.5 * Math.sin(this.time * 23) * Math.sin(this.time * 7.3));
    const low = l.fuel < 0.15 ? 0.6 + 0.4 * Math.sin(this.time * 30) : 1;
    const hp = p.handPos || { x: p.x + p.facing * 9, y: p.y - 42 };
    this.playerLight = { ...l, x: hp.x, y: hp.y, facing: p.facing, k: l.intensity * flick * low };
  }

  updateHints() {
    const r = this.rooms.current;
    this.hints = [];
    if (!r || r.timeIn < r.hintAfter) return;
    const a = Math.min(1, (r.timeIn - r.hintAfter) / 2);
    for (const o of r.hintTargets(this)) {
      const y = o.type === 'exitDoor' ? W.FEET - W.DOOR_H / 2 : o.type === 'pickup' ? o.y - 5 : W.BASE - 30;
      this.hints.push({ x: o.x, y, a });
    }
  }

  finishFloor() {
    this.prompt = null;
    this.target = null;
    this.mode = 'end';
    this.fadeTarget = 0.85;
    Save.clear();
    bus.emit('floor:complete', { stats: this.stats, gold: this.inv.gold });
  }

  ambienceDesc() {
    const r = this.rooms.current;
    if (!r) return {};
    const fire = r.objects.find((o) => o.type === 'fireplace' && o.lit);
    const clock = r.objects.find((o) => o.type === 'clock');
    return {
      windows: r.ambience.windows || 0,
      heavyRain: r.ambience.heavyRain,
      dark: r.dark,
      hum: r.type === 'gate' || r.type === 'final',
      drip: r.ambience.drip,
      dripX: r.x0 + Math.random() * r.width,
      fire: !!fire,
      fireX: fire?.x,
      clock: !!clock,
      clockX: clock?.x,
    };
  }
}

export { LAST_DOOR };
