// Minimal event bus. Systems talk through events so future Entity AI
// (Figure hearing noises, Rush flickering lights, …) can plug in without
// touching the emitters.
//
// Event names used in Phase 02:
//  sfx            {name, x?, vol?}          → audio
//  noise          {x, loudness}             → future: Figure hearing
//  room:enter     {door, room}
//  room:loaded    {room} / room:unloaded {room}
//  door:open      {door, room}
//  door:locked    {door}
//  item:pickup    {id, count}
//  inv:changed    {}
//  gold:changed   {gold}
//  hide:enter / hide:exit {spot}
//  lights:flicker {duration, roomId?}     → future: Rush warning
//  lightning      {}
//  toast          {text, time?}
//  puzzle:solved  {room, kind}

export class EventBus {
  constructor() {
    this.map = new Map();
  }
  on(name, fn) {
    if (!this.map.has(name)) this.map.set(name, new Set());
    this.map.get(name).add(fn);
    return () => this.off(name, fn);
  }
  off(name, fn) {
    this.map.get(name)?.delete(fn);
  }
  emit(name, data) {
    const set = this.map.get(name);
    if (!set) return;
    for (const fn of [...set]) fn(data);
  }
}

export const bus = new EventBus();
