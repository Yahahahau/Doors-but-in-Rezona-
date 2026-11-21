// Inventory foundation: hotbar slots, stacking, selection, light fuel.
import { ITEMS } from './items.js';
import { bus } from '../core/events.js';

export const SLOTS = 6;

export class Inventory {
  constructor() {
    this.slots = new Array(SLOTS).fill(null); // {id, count, data}
    this.selected = -1;
    this.lightOn = false;
    this.gold = 0;
    // quest items never take a hotbar slot, so a full bag can't soft-lock progress
    this.keys = []; // room key numbers
    this.books = 0;
  }

  serialize() {
    return { slots: this.slots, selected: this.selected, gold: this.gold, keys: this.keys, books: this.books };
  }
  load(s) {
    if (!s) return;
    this.slots = (s.slots || []).slice(0, SLOTS);
    while (this.slots.length < SLOTS) this.slots.push(null);
    this.selected = s.selected ?? -1;
    this.gold = s.gold || 0;
    this.keys = s.keys || [];
    this.books = s.books || 0;
    this.lightOn = false;
    bus.emit('inv:changed');
  }

  /** returns true if the item fit */
  add(id, count = 1, data = null) {
    const def = ITEMS[id];
    if (!def) return false;
    if (id === 'key') {
      if (!this.keys.includes(data.num)) this.keys.push(data.num);
      bus.emit('inv:changed');
      return true;
    }
    if (id === 'book') {
      this.books += count;
      bus.emit('inv:changed');
      return true;
    }
    if (def.stack > 1 && !def.unique) {
      const s = this.slots.find((x) => x && x.id === id && x.count < def.stack);
      if (s) {
        s.count = Math.min(def.stack, s.count + count);
        bus.emit('inv:changed');
        return true;
      }
    }
    // single-instance items like lighter: replace if new one is better
    if (def.kind === 'light') {
      const idx = this.slots.findIndex((x) => x && x.id === id);
      if (idx >= 0) {
        const k = def.fuelKey;
        const cur = this.slots[idx].data?.[k] ?? 0;
        if ((data?.[k] ?? 1) > cur) this.slots[idx].data = { ...data };
        bus.emit('inv:changed');
        return true;
      }
    }
    const free = this.slots.findIndex((x) => !x);
    if (free < 0) return false;
    this.slots[free] = { id, count, data: data ? { ...data } : {} };
    if (this.selected < 0 && def.kind === 'light') this.selected = free;
    bus.emit('inv:changed');
    return true;
  }

  hasKey(num) {
    return this.keys.includes(num);
  }
  useKey(num) {
    this.keys = this.keys.filter((k) => k !== num);
    bus.emit('inv:changed');
  }
  useBooks(n) {
    this.books = Math.max(0, this.books - n);
    bus.emit('inv:changed');
  }
  has(id, pred) {
    return this.slots.some((s) => s && s.id === id && (!pred || pred(s)));
  }
  find(id, pred) {
    return this.slots.findIndex((s) => s && s.id === id && (!pred || pred(s)));
  }
  count(id) {
    if (id === 'book') return this.books;
    return this.slots.reduce((n, s) => n + (s && s.id === id ? s.count : 0), 0);
  }
  consume(idx, n = 1) {
    const s = this.slots[idx];
    if (!s) return;
    s.count -= n;
    if (s.count <= 0) {
      this.slots[idx] = null;
      if (this.selected === idx) {
        this.selected = -1;
        this.lightOn = false;
      }
    }
    bus.emit('inv:changed');
  }

  addGold(n) {
    this.gold += n;
    bus.emit('gold:changed', { gold: this.gold });
  }

  get equipped() {
    return this.selected >= 0 ? this.slots[this.selected] : null;
  }

  /** Light source currently emitting, or null */
  activeLight() {
    const e = this.equipped;
    if (!e || !this.lightOn) return null;
    const def = ITEMS[e.id];
    if (def.kind !== 'light') return null;
    if ((e.data?.[def.fuelKey] ?? 0) <= 0) return null;
    return { ...def.light, id: e.id, fuel: e.data[def.fuelKey] };
  }

  update(dt) {
    const e = this.equipped;
    if (!e || !this.lightOn) return;
    const def = ITEMS[e.id];
    if (def.kind !== 'light') return;
    const k = def.fuelKey;
    const before = e.data[k] ?? 0;
    e.data[k] = Math.max(0, before - def.drainPerSec * dt);
    if (e.data[k] <= 0 && before > 0) {
      this.lightOn = false;
      bus.emit('toast', { text: def.name + ' หมดแล้ว' });
      bus.emit('inv:changed');
    }
    // HUD fuel bar refresh ~4x per second
    this._acc = (this._acc || 0) + dt;
    if (this._acc > 0.25) {
      this._acc = 0;
      bus.emit('inv:fuel');
    }
  }
}
