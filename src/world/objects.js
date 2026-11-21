// Object-type registry. Every placeable thing in a room is plain data
// ({type, x, ...}) and its behaviour lives here:
//   layer   'bg' (behind player) | 'fg' (in front of player)
//   static  true → baked into the room's tile cache (never changes)
//   draw    (ctx, o, room, t)            drawing in world units
//   lights  (o, room) → [light]           light sources it emits
//   interact{ prompt(o, game) → string|null, act(o, game), range }
//   update  (o, dt, game)
//   solid   (o) → [x0, x1] | null          blocks the player
import { W } from '../core/const.js';
import * as A from '../render/art.js';
import { itemIcon, ITEMS } from '../game/items.js';
import { bus } from '../core/events.js';
import { pad4 } from '../core/util.js';

const WARM = [255, 186, 120];
const iconImgs = new Map();
function iconImage(id, data) {
  const key = id + (id === 'key' ? data?.num : '');
  let im = iconImgs.get(key);
  if (!im) {
    im = new Image();
    im.src = itemIcon(id, data);
    iconImgs.set(key, im);
  }
  return im;
}

function sconceLight(o) {
  if (o.broken) return [];
  return [
    {
      x: o.x,
      y: o.y - 6,
      r: 120,
      color: WARM,
      i: 0.85,
      flicker: o.dying ? 'dying' : 'steady',
      glow: [
        [o.x - 8, o.y - 6.5, 7],
        [o.x + 8, o.y - 6.5, 7],
      ],
    },
  ];
}

export const TYPES = {
  // ------------------------------------------------------------- static decor
  painting: { static: true, z: 1, draw: (c, o) => A.drawPainting(c, o.x, o.y, o.w, o.h, o.variant, o.seed), ext: (o) => o.w / 2 + 4 },
  clock: {
    static: true,
    z: 1,
    draw: (c, o) => A.drawClock(c, o.x, o.y, o.r),
    ext: () => 14,
    dynamic: (c, o, room, t) => A.drawClockHands(c, o.x, o.y, o.r, 40 + t * 3),
  },
  sconce: { static: true, z: 2, draw: (c, o) => A.drawSconce(c, o.x, o.y, !o.broken), lights: sconceLight, ext: () => 14 },
  chandelier: {
    static: true,
    z: 2,
    draw: (c, o, room, t, yTop) => A.drawChandelier(c, o.x, yTop, !o.broken),
    ext: () => 22,
    lights: (o) =>
      o.broken
        ? []
        : [{ x: o.x, y: W.CEIL + 30, r: 200, color: WARM, i: 0.9, flicker: 'steady', glow: A.chandelierBulbs(o.x).map(([x, y]) => [x, y, 5]) }],
  },
  window: {
    static: true,
    z: 1,
    draw: (c, o) => A.drawWindow(c, o.x, o.top, o.w, o.h, o.arched),
    ext: (o) => o.w / 2 + 6,
    lights: (o) => [{ x: o.x, y: o.top + o.h / 2, r: 80, color: [110, 140, 200], i: 0.28, flicker: 'window', window: true }],
    dynamic: (c, o, room, t) => drawRain(c, o, t, room),
  },
  decorDoor: { static: true, z: 2, draw: (c, o) => A.drawDecorDoor(c, o.x, o.num), ext: () => 28 },
  plant: { static: true, z: 5, draw: (c, o) => A.drawPlant(c, o.x, o.s || 1), ext: () => 16 },
  bookshelf: { static: true, z: 3, draw: (c, o) => A.drawBookshelf(c, o.x, o.w, o.h, o.seed, o.arched), ext: (o) => o.w / 2 + 5 },
  bench: { static: true, z: 4, draw: (c, o) => A.drawBench(c, o.x, o.w), ext: (o) => o.w / 2 },
  armchair: { static: true, z: 6, draw: (c, o) => A.drawArmchair(c, o.x, o.flip, o.color), ext: () => 22 },
  couch: { static: true, z: 5, draw: (c, o) => A.drawCouch(c, o.x, o.w, o.color), ext: (o) => o.w / 2 + 6 },
  bed: { static: true, z: 4, draw: (c, o) => A.drawBed(c, o.x, o.w, o.color), ext: (o) => o.w / 2 + 6 },
  desk: { static: true, z: 4, draw: (c, o) => A.drawDesk(c, o.x), ext: () => 34 },
  chair: { static: true, z: 6, draw: (c, o) => A.drawChair(c, o.x, o.flip), ext: () => 10 },
  vase: { static: true, z: 7, draw: (c, o) => A.drawVase(c, o.x, o.y), ext: () => 6 },
  receptionDesk: { static: true, z: 6, draw: (c, o) => A.drawReceptionDesk(c, o.x, o.w), ext: (o) => o.w / 2 + 6 },
  keyBoard: { static: true, z: 1, draw: (c, o) => A.drawKeyBoard(c, o.x, o.top, o.w, o.h), ext: (o) => o.w / 2 + 4 },
  luggageCart: { static: true, z: 6, draw: (c, o) => A.drawLuggageCart(c, o.x), ext: () => 26 },
  elevator: {
    static: true,
    z: 1,
    draw: (c, o) => A.drawElevator(c, o.x, true),
    ext: () => 36,
    lights: (o) => [{ x: o.x, y: W.BASE - 99, r: 34, color: [255, 150, 80], i: 0.6, flicker: 'steady', glow: [[o.x, W.BASE - 99.5, 4]] }],
  },
  pipes: { static: true, z: 0, draw: (c, o) => A.drawPipes(c, o.x0, o.x1, o.y), ext: () => 0, span: true },
  planter: { static: true, z: 4, draw: (c, o) => A.drawPlanter(c, o.x, o.w), ext: (o) => o.w / 2 + 6 },
  paper: {
    static: true,
    z: 7,
    draw: (c, o) => {
      c.fillStyle = '#e8dcc0';
      c.fillRect(o.x - 5, o.y - 1.5, 10, 1.5);
    },
    ext: () => 6,
  },
  fireplace: {
    static: true,
    z: 3,
    draw: (c, o) => A.drawFireplace(c, o.x, o.w),
    ext: (o) => o.w / 2 + 6,
    dynamic: (c, o, room, t) => A.drawFire(c, o.x, o.w, t, o.lit),
    lights: (o) =>
      o.lit ? [{ x: o.x, y: A.FURN_Y - 14, r: 175, color: [255, 130, 50], i: 1.0, flicker: 'fire', glow: [[o.x, A.FURN_Y - 10, 16]] }] : [],
  },
  tableLamp: {
    static: true,
    z: 8,
    draw: (c, o) => {
      c.fillStyle = '#5a3a20';
      c.fillRect(o.x - 3, o.y - 2, 6, 2);
      c.fillRect(o.x - 0.7, o.y - 9, 1.4, 8);
      A.drawLampShade(c, o.x, o.y - 18, !o.broken, 0.7);
    },
    ext: () => 8,
    lights: (o) => (o.broken ? [] : [{ x: o.x, y: o.y - 11, r: 85, color: [255, 200, 130], i: 0.8, flicker: 'steady', glow: [[o.x, o.y - 10, 6]] }]),
  },
  floorLamp: {
    static: true,
    z: 7,
    draw: (c, o) => {
      A.drawFloorLamp(c, o.x);
      A.drawLampShade(c, o.x, A.FURN_Y + 2 - 74, !o.broken, 1);
    },
    ext: () => 10,
    lights: (o) =>
      o.broken ? [] : [{ x: o.x, y: A.FURN_Y - 62, r: 100, color: [255, 205, 140], i: 0.85, flicker: 'steady', glow: [[o.x, A.FURN_Y - 60, 8]] }],
  },
  bulb: {
    static: true,
    z: 2,
    draw: (c, o) => {
      c.strokeStyle = '#1a1210';
      c.lineWidth = 0.6;
      c.beginPath();
      c.moveTo(o.x, W.CEIL - 2);
      c.lineTo(o.x, W.CEIL + 26);
      c.stroke();
      c.fillStyle = '#3a3430';
      c.fillRect(o.x - 2, W.CEIL + 24, 4, 4);
      c.fillStyle = o.broken ? '#3a3430' : '#fff0c8';
      c.beginPath();
      c.arc(o.x, W.CEIL + 31, 3, 0, Math.PI * 2);
      c.fill();
    },
    ext: () => 6,
    lights: (o) =>
      o.broken ? [] : [{ x: o.x, y: W.CEIL + 31, r: 175, color: [255, 205, 150], i: 0.85, flicker: o.dying ? 'dying' : 'buzz', glow: [[o.x, W.CEIL + 31, 7]] }],
  },

  // ------------------------------------------------------------- foreground
  fgPillar: {
    layer: 'fg',
    draw: (c, o, room, t, yTop, yBot) => A.drawPillar(c, o.x, yTop, yBot, 18, true),
    ext: () => 12,
  },
  fgPlant: {
    layer: 'fg',
    draw: (c, o) => {
      // big dark potted topiary close to the camera
      const base = W.FLOOR_FRONT + 30,
        x = o.x;
      c.fillStyle = '#120a07';
      c.beginPath();
      c.moveTo(x - 20, base - 34);
      c.lineTo(x + 20, base - 34);
      c.lineTo(x + 14, base + 10);
      c.lineTo(x - 14, base + 10);
      c.closePath();
      c.fill();
      c.fillStyle = '#1a0f0a';
      c.fillRect(x - 22, base - 38, 44, 6);
      c.fillStyle = '#0a0705';
      for (let i = 0; i < 22; i++) {
        const t = i / 22;
        const yy = base - 40 - t * 92,
          ww = (1 - t) * 24 + 4;
        for (let k = -1; k <= 1; k++) {
          c.beginPath();
          c.arc(x + k * ww * 0.55 + Math.sin(i * 2.3 + k) * 2, yy, 6 + (1 - t) * 3, 0, Math.PI * 2);
          c.fill();
        }
      }
    },
    ext: () => 34,
  },

  // ------------------------------------------------------------- interactables
  wardrobe: {
    z: 3,
    draw: (c, o) => A.drawWardrobe(c, o.x, o.anim || 0, o.occupied),
    ext: () => 34,
    update(o, dt) {
      const target = o.flash > 0 ? 1 : 0;
      o.flash = Math.max(0, (o.flash || 0) - dt);
      o.anim = (o.anim || 0) + (target - (o.anim || 0)) * Math.min(1, dt * 14);
    },
    interact: {
      range: 28,
      prompt: (o, g) => (g.player.hidden === o ? 'ออกจากตู้' : g.player.hidden ? null : 'ซ่อน'),
      act: (o, g) => (g.player.hidden === o ? g.unhide() : g.hide(o)),
    },
  },
  dresser: {
    z: 6,
    draw: (c, o) => A.drawDresser(c, o.x, o.w, o.h, o.openRows || [], o.rows),
    ext: (o) => o.w / 2 + 4,
    update: animOpen,
    interact: {
      range: 24,
      prompt: (o) => (o.opened ? null : 'เปิดลิ้นชัก'),
      act: (o, g) => openContainer(o, g, A.FURN_Y - o.h + 6),
    },
  },
  drawerTable: {
    z: 6,
    draw: (c, o) => {
      A.drawConsole(c, o.x, o.w, false);
      const top = A.FURN_Y - 28 + 4;
      const op = o.openAmt || 0;
      if (op > 0) {
        c.fillStyle = '#0c0604';
        c.fillRect(o.x - o.w / 2 + 2, top, o.w - 4, 7);
      }
      A.bevel(c, o.x - o.w / 2 + 2 - op, top + op * 4, o.w - 4 + op * 2, 7, op ? '#7a4a30' : '#5a3322', 0.8, 0.2);
      c.fillStyle = A.WOOD.brassLight;
      c.fillRect(o.x - 3, top + 3 + op * 4, 6, 1.2);
    },
    ext: (o) => o.w / 2 + 4,
    update: animOpen,
    interact: {
      range: 24,
      prompt: (o) => (o.opened ? null : 'เปิดลิ้นชัก'),
      act: (o, g) => openContainer(o, g, A.FURN_Y - 28),
    },
  },
  chest: {
    z: 7,
    draw: (c, o) => A.drawChest(c, o.x, o.openAmt || 0),
    ext: () => 26,
    update: animOpen,
    interact: {
      range: 26,
      prompt: (o) => (o.opened ? null : 'เปิดหีบ'),
      act: (o, g) => openContainer(o, g, A.FURN_Y - 8),
    },
  },
  lever: {
    z: 2,
    draw: (c, o) => A.drawLever(c, o.x, o.y, o.on),
    ext: () => 10,
    interact: {
      range: 22,
      prompt: (o) => (o.on ? null : 'ดึงคันโยก'),
      act: (o, g) => {
        o.on = true;
        bus.emit('sfx', { name: 'lever', x: o.x });
        bus.emit('noise', { x: o.x, loudness: 0.6 });
        const gate = g.rooms.roomAt(o.x)?.objects.find((x) => x.type === 'gate');
        if (gate) {
          gate.opening = true;
          bus.emit('sfx', { name: 'gate', x: gate.x });
        }
        bus.emit('puzzle:solved', { kind: 'lever' });
        bus.emit('toast', { text: 'ประตูรั้วเปิดแล้ว' });
      },
    },
    hintTarget: (o) => !o.on,
  },
  gate: {
    layer: 'fg',
    draw: (c, o) => A.drawGate(c, o.x, o.open || 0),
    ext: () => 18,
    update(o, dt) {
      if (o.opening) o.open = Math.min(1, (o.open || 0) + dt * 0.6);
    },
    solid: (o) => ((o.open || 0) < 0.6 ? [o.x - 10, o.x + 10] : null),
    interact: {
      range: 30,
      prompt: (o) => ((o.open || 0) < 0.6 ? 'ประตูรั้วล็อก — หาคันโยก' : null),
      act: () => bus.emit('sfx', { name: 'locked' }),
      passive: true,
    },
  },
  pickup: {
    z: 9,
    draw: (c, o, room, t) => drawPickup(c, o, t),
    ext: () => 10,
    interact: {
      range: 16,
      prompt: (o) => (o.gold ? `เก็บทอง (${o.gold})` : 'เก็บ ' + (ITEMS[o.item.id]?.name || o.item.id) + (o.item.id === 'key' ? ' ' + pad4(o.item.data.num) : '')),
      act: (o, g) => g.pickup(o),
    },
    hintTarget: (o) => o.isKey || o.isBook,
  },
  elevatorEnd: {
    z: 1,
    draw: () => {},
    ext: () => 30,
    interact: { range: 30, prompt: () => 'ขึ้นลิฟต์ (จบ Phase 02)', act: (o, g) => g.finishFloor() },
  },
};

// ------------------------------------------------------------- helpers
function animOpen(o, dt) {
  if (!o.opened) return;
  o.openAmt = Math.min(1, (o.openAmt || 0) + dt * 5);
  if (o.openRows) o.openRows[0] = o.openAmt;
}

function openContainer(o, g, lootY) {
  if (o.opened) return;
  o.opened = true;
  if (o.type === 'dresser') o.openRows = [0];
  bus.emit('sfx', { name: o.type === 'chest' ? 'chest' : 'drawer', x: o.x });
  bus.emit('noise', { x: o.x, loudness: 0.35 });
  const room = g.rooms.roomAt(o.x);
  const n = o.loot?.length || 0;
  if (!n) {
    bus.emit('toast', { text: 'ว่างเปล่า', time: 0.9 });
    return;
  }
  o.loot.forEach((l, i) => {
    const x = o.x + (n === 1 ? 0 : (i / (n - 1) - 0.5) * Math.min(28, (o.w || 40) - 10));
    const p = { type: 'pickup', x, y: lootY + 4, fromContainer: o };
    if (l.gold) p.gold = l.gold;
    else p.item = { id: l.item, data: l.data || {} };
    if (l.item === 'key') p.isKey = true;
    room.addObject(p);
  });
  o.loot = [];
}

function drawPickup(c, o, t) {
  const bob = o.fromContainer ? 0 : Math.sin(t * 2 + o.x) * 0.6;
  if (o.gold) {
    // pile size by value (5 → 1 coin … 100 → bars + jewels)
    const n = o.gold >= 50 ? 5 : o.gold >= 25 ? 4 : o.gold >= 10 ? 3 : 1;
    for (let i = 0; i < n; i++) {
      const gx = o.x + (i - (n - 1) / 2) * 3,
        gy = o.y - (i % 2) * 1.5;
      c.fillStyle = '#8a6a1a';
      c.beginPath();
      c.ellipse(gx, gy + 0.6, 2.6, 1.2, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#f0c84a';
      c.beginPath();
      c.ellipse(gx, gy, 2.6, 1.2, 0, 0, Math.PI * 2);
      c.fill();
    }
    if (o.gold >= 25) {
      c.fillStyle = '#e8b830';
      c.fillRect(o.x - 4, o.y - 4, 8, 2.4);
    }
    A.drawItemSparkle(c, o.x + 3, o.y - 4, t);
    return;
  }
  const im = iconImage(o.item.id, o.item.data);
  const s = o.item.id === 'book' ? 13 : 11;
  if (o.isBook) {
    c.save();
    c.globalAlpha = 0.95;
    c.drawImage(im, o.x - s / 2, o.y - s + bob, s, s);
    c.restore();
  } else if (im.complete) c.drawImage(im, o.x - s / 2, o.y - s + bob, s, s);
  A.drawItemSparkle(c, o.x + 4, o.y - s + 2, t, o.isKey ? '200,230,255' : '255,230,170');
}

// rain on window glass
function drawRain(c, o, t, room) {
  const x0 = o.x - o.w / 2;
  c.save();
  c.beginPath();
  c.rect(x0, o.top, o.w, o.h);
  c.clip();
  c.strokeStyle = 'rgba(160,190,230,0.28)';
  c.lineWidth = 0.5;
  c.beginPath();
  const n = room.ambience.heavyRain ? 26 : 16;
  for (let i = 0; i < n; i++) {
    const sx = x0 + ((i * 37.7 + o.x) % o.w);
    const sy = o.top + ((t * 160 + i * 53) % (o.h + 20)) - 10;
    c.moveTo(sx, sy);
    c.lineTo(sx - 1.5, sy + 7);
  }
  c.stroke();
  if (room.lightning > 0) {
    c.fillStyle = `rgba(200,220,255,${room.lightning * 0.7})`;
    c.fillRect(x0, o.top, o.w, o.h);
  }
  c.restore();
  A.drawWindowFrame(c, o.x, o.top, o.w, o.h, o.arched);
}
