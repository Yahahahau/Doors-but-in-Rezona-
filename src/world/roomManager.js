// Loads / unloads rooms as the player progresses. Only the current room, the
// next room (behind the closed exit door) and — while its door is still open —
// the previous room are kept in memory. This keeps Door 1 → 100 cheap.
import { W } from '../core/const.js';
import { bus } from '../core/events.js';
import { generateRoom } from './roomGen.js';
import { Room } from './room.js';
import { TYPES } from './objects.js';

export const LAST_DOOR = 100;

export class RoomManager {
  constructor(seed) {
    this.seed = seed;
    this.rooms = []; // ordered by door
    this.cur = 0;
  }

  start(door) {
    for (const r of this.rooms) bus.emit('room:unloaded', { room: r });
    this.rooms = [];
    this.cur = door;
    const r = this.load(door, 0);
    r.prevLoaded = false;
    r.visited = true;
    this.ensureNext();
    return r;
  }

  load(door, x0) {
    const spec = generateRoom(this.seed, door);
    const r = new Room(spec, x0);
    this.rooms.push(r);
    this.rooms.sort((a, b) => a.door - b.door);
    bus.emit('room:loaded', { room: r });
    return r;
  }

  get current() {
    return this.rooms.find((r) => r.door === this.cur);
  }
  get(door) {
    return this.rooms.find((r) => r.door === door);
  }

  ensureNext() {
    const c = this.current;
    if (!c || c.noExit || this.cur >= LAST_DOOR) return;
    if (!this.get(this.cur + 1)) {
      const n = this.load(this.cur + 1, c.x1);
      n.prevLoaded = true;
    }
  }

  roomAt(x) {
    for (const r of this.rooms) if (x >= r.x0 - 0.001 && x <= r.x1) return r;
    // inside an entrance partition region
    for (const r of this.rooms) if (x >= r.drawX0 && x < r.x0) return r;
    return this.rooms[0];
  }

  update(dt, game) {
    const px = game.player.x;
    for (const r of this.rooms) r.update(dt, game);

    const inRoom = this.roomAt(px);
    if (inRoom && inRoom.door === this.cur + 1 && px > inRoom.x0 + 6) this.enter(inRoom);

    // close & seal the door behind the player, then unload the previous room
    const c = this.current;
    const prev = this.get(this.cur - 1);
    if (prev && prev.exit && px > c.x0 + 120 && prev.exit.state === 'open') {
      prev.exit.state = 'closing';
    }
    // anything older than the previous room is never reachable again
    for (const r of this.rooms.filter((r) => r.door < this.cur - 1)) {
      this.rooms = this.rooms.filter((x) => x !== r);
      bus.emit('room:unloaded', { room: r });
    }
    if (prev && prev.exit?.state === 'sealed') {
      this.rooms = this.rooms.filter((r) => r !== prev);
      c.prevLoaded = false;
      bus.emit('room:unloaded', { room: prev });
    }
  }

  enter(room) {
    this.cur = room.door;
    room.visited = true;
    room.timeIn = 0;
    this.ensureNext();
    bus.emit('room:enter', { door: room.door, room });
  }

  /** horizontal solid ranges the player cannot enter */
  solids() {
    const out = [];
    const first = this.rooms[0];
    // left wall: entrance of the oldest loaded room
    out.push([first.x0 - 4000, first.x0 + 2]);
    for (const r of this.rooms) {
      for (const o of r.objects) {
        const s = TYPES[o.type]?.solid?.(o);
        if (s) out.push(s);
      }
      if (r.noExit) out.push([r.x1 - W.PART_W + 6, r.x1 + 4000]);
      if (!this.get(r.door + 1) && !r.noExit) out.push([r.x1 - W.PART_W + 14, r.x1 + 4000]);
    }
    return out;
  }

  /** world-x range the camera may show */
  cameraBounds() {
    const c = this.current;
    let left = c.drawX0;
    const prev = this.get(this.cur - 1);
    if (prev && prev.exit && prev.exit.state !== 'sealed') left = Math.min(left, prev.drawX0);
    let right = c.x1;
    let r = c;
    while (r && r.exit && r.exit.state !== 'closed' && r.exit.state !== 'sealed') {
      const n = this.get(r.door + 1);
      if (!n) break;
      right = n.x1;
      r = n;
    }
    return [left, right];
  }

  visibleRooms(xa, xb) {
    return this.rooms.filter((r) => r.x1 >= xa && r.drawX0 <= xb);
  }
}
