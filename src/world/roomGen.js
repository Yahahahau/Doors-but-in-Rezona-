// Deterministic room generator. generateRoom(seed, door) → plain room spec.
// Positions in the spec are LOCAL (0 … width); Room converts them to world x.
//
// Rules taken from Phase 01 research (src/data/doors_rules.js):
//  - Door 0 = Reception (key 0001 behind the desk)       - fixed
//  - Door 50 = Library (puzzle room)                      - fixed
//  - Door 61 = Basement style gate room (always dark)     - fixed
//  - Doors 90-98 = Greenhouse (always dark)               - fixed range
//  - Door 100 = end of floor (Electrical Room placeholder)
//  - Dark rooms possible from Door 9; small basements (gate puzzle) from Door 5
//  - Locked rooms possible from Door 1/2 (key spawns in the same room)
import { W } from '../core/const.js';
import { mulberry32, hash2, pick, range, irange, weighted } from '../core/util.js';
import { RULES } from '../data/doors_rules.js';

const BAY = 200; // width of one wall bay (between pilasters)

const PAINTINGS = ['landscape', 'portrait', 'sea', 'abstract'];
const RUNNERS = ['#9a4a28', '#8a3a24', '#7a3a3a', '#6a2a2a'];
const RUGS = ['#6a2a2a', '#3a2a4a', '#5a3a20', '#2a3a3a'];
const ARMCHAIRS = ['#6a5a8a', '#7a4a4a', '#4a5a6a', '#6a4a6a'];

// ------------------------------------------------------------------ loot
function rollGold(rng) {
  const v = RULES.economy.goldValues.value;
  return weighted(rng, [
    [v.coin, 40],
    [v.coinPile4, 26],
    [v.bar1_coin3, 15],
    [v.bar2, 8],
    [v.bar3_coin2, 3],
    [v.jackpot, 1],
  ]);
}
function rollLoot(rng, door) {
  const out = [];
  if (rng() < 0.5) out.push({ gold: rollGold(rng) });
  const r = rng();
  if (r < 0.07) out.push({ item: 'lighter', data: { fuel: range(rng, 0.5, 1) } });
  else if (r < 0.1) out.push({ item: 'flashlight', data: { charge: range(rng, 0.4, 1) } });
  else if (r < 0.17 && door > 4) out.push({ item: 'battery' });
  else if (r < 0.2) out.push({ item: 'vitamins' });
  else if (r < 0.25) out.push({ item: 'lockpick' });
  return out;
}

// ------------------------------------------------------------------ bay compositions
// each returns objects with local x; c = bay centre
const BAYS = {
  paintingConsole(o, c, rng, ctx) {
    o.push({ type: 'painting', x: c, y: 92, w: 54, h: 40, variant: pick(rng, PAINTINGS), seed: irange(rng, 1, 99) });
    o.push({ type: 'sconce', x: c - 62, y: 96 });
    o.push({ type: 'sconce', x: c + 62, y: 96 });
    const tbl = { type: 'drawerTable', x: c, w: 50, loot: rollLoot(rng, ctx.door) };
    o.push(tbl);
    ctx.containers.push(tbl);
    if (rng() < 0.5) o.push({ type: 'tableLamp', x: c - 14, y: W.BASE - 20 });
    else o.push({ type: 'vase', x: c + 12, y: W.BASE - 20 });
  },
  decorDoor(o, c, rng, ctx) {
    o.push({ type: 'decorDoor', x: c, num: ctx.door + '-' + 'ABCDEFGH'[irange(rng, 0, 7)] });
    o.push({ type: 'sconce', x: c - 48, y: 98 });
    o.push({ type: 'sconce', x: c + 48, y: 98 });
    if (rng() < 0.7) o.push({ type: 'plant', x: c - 72, s: 0.95 });
    if (rng() < 0.7) o.push({ type: 'plant', x: c + 72, s: 0.95 });
  },
  clock(o, c, rng, ctx) {
    o.push({ type: 'clock', x: c, y: 88, r: 10 });
    o.push({ type: 'bench', x: c, w: 70 });
    o.push({ type: 'sconce', x: c - 60, y: 96 });
    o.push({ type: 'sconce', x: c + 60, y: 96 });
  },
  window(o, c, rng, ctx) {
    o.push({ type: 'window', x: c, top: 56, w: 50, h: 82, arched: rng() < 0.6 });
    ctx.windows++;
    if (rng() < 0.5) {
      o.push({ type: 'armchair', x: c - 46, flip: false, color: pick(rng, ARMCHAIRS) });
      o.push({ type: 'armchair', x: c + 46, flip: true, color: pick(rng, ARMCHAIRS) });
    } else o.push({ type: 'bench', x: c, w: 56 });
    o.push({ type: 'sconce', x: c - 70, y: 96 });
  },
  dresser(o, c, rng, ctx) {
    o.push({ type: 'painting', x: c, y: 88, w: 40, h: 50, variant: pick(rng, PAINTINGS), seed: irange(rng, 1, 99) });
    const d = { type: 'dresser', x: c, w: 54, h: 42, rows: 3, loot: rollLoot(rng, ctx.door) };
    o.push(d);
    ctx.containers.push(d);
    o.push({ type: 'plant', x: c + 54, s: 0.9 });
    o.push({ type: 'sconce', x: c - 56, y: 96 });
  },
  wardrobe(o, c, rng, ctx) {
    o.push({ type: 'wardrobe', x: c - 34 });
    if (rng() < 0.5) o.push({ type: 'wardrobe', x: c + 34 });
    else {
      o.push({ type: 'plant', x: c + 28, s: 1 });
      o.push({ type: 'sconce', x: c + 60, y: 96 });
    }
  },
  bookshelf(o, c, rng, ctx) {
    const arched = rng() < 0.5;
    o.push({ type: 'bookshelf', x: c - 30, w: 54, h: 116, seed: irange(rng, 1, 999), arched });
    o.push({ type: 'bookshelf', x: c + 30, w: 54, h: 116, seed: irange(rng, 1, 999), arched });
  },
  fireplace(o, c, rng, ctx) {
    o.push({ type: 'fireplace', x: c, w: 76, lit: !ctx.dark });
    o.push({ type: 'painting', x: c, y: 104, w: 34, h: 26, variant: pick(rng, PAINTINGS), seed: irange(rng, 1, 99) });
    o.push({ type: 'armchair', x: c - 66, flip: false, color: pick(rng, ARMCHAIRS) });
    o.push({ type: 'armchair', x: c + 66, flip: true, color: pick(rng, ARMCHAIRS) });
    ctx.fire = true;
  },
  couch(o, c, rng, ctx) {
    o.push({ type: 'painting', x: c, y: 90, w: 70, h: 40, variant: pick(rng, PAINTINGS), seed: irange(rng, 1, 99) });
    o.push({ type: 'couch', x: c, w: 80, color: pick(rng, ARMCHAIRS) });
    o.push({ type: 'floorLamp', x: c + 62 });
  },
  bed(o, c, rng, ctx) {
    o.push({ type: 'bed', x: c, w: 92, color: pick(rng, ['#7a3a3a', '#3a4a6a', '#5a3a5a']) });
    o.push({ type: 'painting', x: c, y: 98, w: 44, h: 30, variant: pick(rng, PAINTINGS), seed: irange(rng, 1, 99) });
    const n = { type: 'dresser', x: c + 70, w: 26, h: 28, rows: 2, loot: rollLoot(rng, ctx.door) };
    o.push(n);
    ctx.containers.push(n);
    o.push({ type: 'tableLamp', x: c + 70, y: W.BASE - 18 + 8 - 6 });
  },
  desk(o, c, rng, ctx) {
    o.push({ type: 'desk', x: c - 10 });
    o.push({ type: 'chair', x: c + 28, flip: true });
    o.push({ type: 'floorLamp', x: c - 60 });
    o.push({ type: 'painting', x: c - 10, y: 82, w: 30, h: 36, variant: 'portrait', seed: irange(rng, 1, 99) });
  },
  chest(o, c, rng, ctx) {
    const ch = { type: 'chest', x: c, loot: rollLoot(rng, ctx.door) };
    if (rng() < 0.5) ch.loot.push({ gold: rollGold(rng) });
    o.push(ch);
    ctx.containers.push(ch);
    o.push({ type: 'plant', x: c - 44, s: 1 });
    o.push({ type: 'plant', x: c + 44, s: 1 });
    o.push({ type: 'sconce', x: c, y: 92 });
  },
};

const TYPE_DEFS = {
  hallway: {
    bays: [4, 6],
    pool: [
      ['paintingConsole', 4],
      ['decorDoor', 4],
      ['clock', 1.5],
      ['window', 1.5],
      ['dresser', 1.5],
      ['wardrobe', 1.2],
    ],
    style: (rng) => ({ wall: pick(rng, ['red', 'purple', 'navy', 'rose']), floor: 'plank', runner: pick(rng, RUNNERS), vault: true }),
    name: 'Hallway',
  },
  bedroom: {
    bays: [3, 4],
    pool: [
      ['bed', 3],
      ['wardrobe', 3],
      ['dresser', 2],
      ['window', 2],
      ['desk', 1],
      ['chest', 1],
    ],
    style: (rng) => ({ wall: pick(rng, ['teal', 'navy', 'purple', 'olive']), floor: 'plank', vault: false }),
    rugs: true,
    name: 'Guest Room',
  },
  lounge: {
    bays: [4, 5],
    pool: [
      ['fireplace', 2],
      ['bookshelf', 2],
      ['couch', 2],
      ['window', 2],
      ['wardrobe', 1.5],
      ['clock', 1],
      ['dresser', 1],
    ],
    style: (rng) => ({ wall: pick(rng, ['red', 'navy', 'rose', 'purple']), floor: 'plank', vault: true }),
    chandeliers: true,
    rugs: true,
    name: 'Lounge',
  },
  study: {
    bays: [3, 4],
    pool: [
      ['bookshelf', 4],
      ['desk', 2],
      ['wardrobe', 1.5],
      ['chest', 1],
      ['dresser', 1],
    ],
    style: (rng) => ({ wall: pick(rng, ['olive', 'teal', 'red']), floor: 'plank', vault: false }),
    chandeliers: true,
    name: 'Study',
  },
};

// ------------------------------------------------------------------ main
export function generateRoom(seed, door) {
  const rng = mulberry32(hash2(seed, door * 7919 + 13));
  if (door === 0) return reception(rng);
  if (door === 50) return library(rng, door);
  if (door === 61) return gateRoom(rng, door, true);
  if (door >= 90 && door <= 98) return greenhouse(rng, door);
  if (door === 100) return finalRoom(rng, door);

  // type selection
  let type = weighted(rng, [
    ['hallway', 34],
    ['bedroom', 24],
    ['lounge', 22],
    ['study', 12],
    ['gate', door >= RULES.rooms.earliest.smallBasement ? 9 : 0],
  ]);
  if (door === 1) type = 'hallway';
  if (type === 'gate') return gateRoom(rng, door, false);

  const def = TYPE_DEFS[type];
  const darkFrom = RULES.rooms.earliest.darkRoom; // 9
  const dark = door >= darkFrom && door !== 49 && rng() < 0.14;
  const locked = door >= 1 && door !== 49 && door !== 52 && rng() < (door === 1 ? 0 : 0.3);

  const nBays = irange(rng, def.bays[0], def.bays[1]);
  const width = nBays * BAY + W.PART_W + 40;
  const ctx = { door, containers: [], windows: 0, fire: false, dark };
  const objects = [];
  const beams = [];
  let last = null;
  for (let b = 0; b < nBays; b++) {
    const c = 20 + b * BAY + BAY / 2;
    beams.push(20 + b * BAY);
    let comp = weighted(rng, def.pool);
    if (comp === last) comp = weighted(rng, def.pool); // avoid repetition
    last = comp;
    BAYS[comp](objects, c, rng, ctx);
  }
  beams.push(20 + nBays * BAY);
  if (def.chandeliers) for (let b = 0; b < nBays; b += 2) objects.push({ type: 'chandelier', x: 20 + b * BAY + BAY / 2 + (b % 4 ? 0 : BAY / 2) });

  const style = def.style(rng);
  const rugs = [];
  if (def.rugs) {
    const rc = 20 + irange(rng, 0, nBays - 1) * BAY + BAY / 2;
    rugs.push({ x0: rc - 70, x1: rc + 70, color: pick(rng, RUGS) });
  }
  // foreground silhouettes for depth
  const fg = [];
  for (let b = 1; b < nBays; b++) if (rng() < 0.35) fg.push({ type: 'fgPillar', x: 20 + b * BAY + range(rng, -10, 10) });
  if (rng() < 0.5) fg.push({ type: 'fgPlant', x: 20 + irange(rng, 0, nBays - 1) * BAY + range(rng, 40, 160) });

  const spec = finish({
    door,
    type,
    name: def.name,
    width,
    style,
    dark,
    beams,
    rugs,
    objects: objects.concat(fg),
    exit: { locked, req: null },
    ambience: { windows: ctx.windows, fire: ctx.fire },
    ctx,
    rng,
  });
  return spec;
}

/** places the key for locked rooms, sets hint timing, decorates dark rooms */
function finish(spec) {
  const { rng, ctx } = spec;
  if (spec.exit.locked) {
    spec.exit.keyId = spec.door + 1;
    if (ctx.containers.length && rng() < 0.8) {
      const c = pick(rng, ctx.containers);
      c.loot.unshift({ item: 'key', data: { num: spec.door + 1 } });
      c.hasKey = true;
    } else {
      // on top of a table or on the floor
      const x = range(rng, 80, spec.width - W.PART_W - 80);
      spec.objects.push({ type: 'pickup', x, y: W.FEET - 2, item: { id: 'key', data: { num: spec.door + 1 } }, isKey: true });
    }
  }
  spec.hintAfter = range(rng, RULES.entities.guidingLight.highlightAfterSec.value[0], RULES.entities.guidingLight.highlightAfterSec.value[1]);
  if (spec.dark) {
    // a dark room: fixtures are broken, maybe one dying bulb
    for (const o of spec.objects) {
      if (['sconce', 'chandelier', 'tableLamp', 'floorLamp', 'bulb'].includes(o.type)) o.broken = true;
    }
    const s = spec.objects.filter((o) => o.type === 'sconce' || o.type === 'bulb');
    if (s.length && rng() < 0.4) {
      const d = pick(rng, s);
      d.broken = false;
      d.dying = true;
    }
  }
  delete spec.rng;
  delete spec.ctx;
  return spec;
}

// ------------------------------------------------------------------ fixed rooms
function reception(rng) {
  const width = 1260;
  const o = [];
  // elevators on the back wall (player arrives here)
  o.push({ type: 'elevator', x: 90 }, { type: 'elevator', x: 170 }, { type: 'elevator', x: 250 });
  o.push({ type: 'sconce', x: 130, y: 92 }, { type: 'sconce', x: 210, y: 92 });
  o.push({ type: 'luggageCart', x: 330 });
  o.push({ type: 'plant', x: 380, s: 1.1 });
  o.push({ type: 'chandelier', x: 300 });
  // reception counter with key board behind it
  o.push({ type: 'keyBoard', x: 560, top: 64, w: 150, h: 70 });
  o.push({ type: 'painting', x: 680, y: 84, w: 30, h: 38, variant: 'portrait', seed: 3 });
  o.push({ type: 'sconce', x: 460, y: 96 }, { type: 'sconce', x: 740, y: 96 });
  o.push({ type: 'receptionDesk', x: 560, w: 180 });
  o.push({ type: 'tableLamp', x: 490, y: W.BASE - 6 });
  o.push({ type: 'pickup', x: 600, y: 100, item: { id: 'key', data: { num: 1 } }, isKey: true, onWall: true });
  o.push({ type: 'chandelier', x: 600 });
  // lounge corner with fireplace
  o.push({ type: 'bookshelf', x: 810, w: 50, h: 118, seed: 5, arched: true });
  o.push({ type: 'fireplace', x: 920, w: 84, lit: true });
  o.push({ type: 'armchair', x: 850, flip: false, color: '#5a4a6a' });
  o.push({ type: 'armchair', x: 990, flip: true, color: '#5a4a6a' });
  o.push({ type: 'plant', x: 1050, s: 1.1 });
  o.push({ type: 'window', x: 1112, top: 46, w: 46, h: 78, arched: true });
  o.push({ type: 'chandelier', x: 950 });
  o.push({ type: 'fgPillar', x: 420 }, { type: 'fgPlant', x: 700 }, { type: 'fgPillar', x: 1010 });
  const d = { type: 'dresser', x: 1112, w: 40, h: 36, rows: 2, loot: [{ gold: 10 }, { item: 'lighter', data: { fuel: 0.8 } }] };
  o.push(d);
  return {
    door: 0,
    type: 'reception',
    name: 'The Reception',
    width,
    style: { wall: 'teal', floor: 'plank', vault: true, runner: null },
    dark: false,
    beams: [20, 420, 760, 1010, width - W.PART_W - 6],
    rugs: [{ x0: 860, x1: 1000, color: '#6a2a2a' }],
    objects: o,
    exit: { locked: true, keyId: 1, req: null },
    ambience: { windows: 1, fire: true },
    hintAfter: 20,
    noEntrance: true,
  };
}

function library(rng, door) {
  const nBays = 6;
  const width = nBays * BAY + W.PART_W + 40;
  const o = [];
  const beams = [];
  for (let b = 0; b <= nBays; b++) beams.push(20 + b * BAY);
  for (let b = 0; b < nBays; b++) {
    const c = 20 + b * BAY + BAY / 2;
    if (b === 2) {
      o.push({ type: 'desk', x: c });
      o.push({ type: 'chair', x: c + 36, flip: true });
      o.push({ type: 'paper', x: c - 6, y: W.BASE - 28 });
      continue;
    }
    o.push({ type: 'bookshelf', x: c - 46, w: 50, h: 124, seed: door * 10 + b, arched: false });
    o.push({ type: 'bookshelf', x: c + 6, w: 50, h: 124, seed: door * 10 + b + 50, arched: false });
    o.push({ type: 'sconce', x: c + 64, y: 92 });
  }
  for (let b = 0; b < nBays; b += 2) o.push({ type: 'chandelier', x: 20 + b * BAY + BAY });
  // books puzzle: collect N books → exit unlocks (simplified stand-in for the code lock)
  const need = 3;
  const xs = [];
  while (xs.length < need) {
    const b = irange(rng, 0, nBays - 1);
    if (b === 2) continue;
    const x = 20 + b * BAY + BAY / 2 + (rng() < 0.5 ? -46 : 6);
    if (xs.some((v) => Math.abs(v - x) < 20)) continue;
    xs.push(x);
  }
  for (const x of xs) o.push({ type: 'pickup', x, y: W.FEET - 2, item: { id: 'book' }, isBook: true });
  o.push({ type: 'fgPillar', x: 20 + BAY * 2 }, { type: 'fgPillar', x: 20 + BAY * 4 });
  return {
    door,
    type: 'library',
    name: 'The Library',
    width,
    style: { wall: 'olive', floor: 'plank', vault: true },
    dark: false,
    beams,
    rugs: [{ x0: 20 + BAY * 2 + 30, x1: 20 + BAY * 3 - 30, color: '#3a2a2a' }],
    objects: o,
    exit: { locked: false, req: { kind: 'books', need } },
    ambience: { windows: 0, fire: false },
    hintAfter: 30,
    ambientTint: 0.85,
  };
}

function gateRoom(rng, door, big) {
  const nBays = big ? 5 : 3;
  const width = nBays * BAY + W.PART_W + 40;
  const o = [];
  const beams = [];
  for (let b = 0; b <= nBays; b++) beams.push(20 + b * BAY);
  o.push({ type: 'pipes', x0: 0, x1: width, y: W.CEIL + 14 });
  const ctx = { door, containers: [] };
  for (let b = 0; b < nBays; b++) {
    const c = 20 + b * BAY + BAY / 2;
    if (rng() < 0.6) {
      const ch = { type: 'chest', x: c + range(rng, -40, 40), loot: rollLoot(rng, door) };
      o.push(ch);
      ctx.containers.push(ch);
    } else if (rng() < 0.5) o.push({ type: 'wardrobe', x: c });
    o.push({ type: 'bulb', x: c + 60 });
  }
  const leverX = 20 + irange(rng, 0, nBays - 2) * BAY + range(rng, 50, 150);
  o.push({ type: 'lever', x: leverX, y: 150 });
  const gateX = width - W.PART_W - 40;
  o.push({ type: 'gate', x: gateX });
  return finish({
    door,
    type: 'gate',
    name: big ? 'The Basement' : 'Small Basement',
    width,
    style: { wall: 'brick', brick: big ? '#3e2a22' : '#4a2c22', floor: 'stone', vault: false, ceil: '#2a1e18' },
    dark: big || rng() < 0.35,
    beams,
    rugs: [],
    objects: o,
    exit: { locked: false, req: { kind: 'lever' } },
    ambience: { windows: 0, fire: false, drip: true },
    ctx,
    rng,
  });
}

function greenhouse(rng, door) {
  const nBays = irange(rng, 3, 4);
  const width = nBays * BAY + W.PART_W + 40;
  const o = [];
  const beams = [];
  for (let b = 0; b <= nBays; b++) beams.push(20 + b * BAY);
  for (let b = 0; b < nBays; b++) {
    const c = 20 + b * BAY + BAY / 2;
    o.push({ type: 'planter', x: c - 40, w: 70 });
    if (b === 0 || rng() < 0.4) o.push({ type: 'wardrobe', x: c + 50, shed: true });
    else o.push({ type: 'planter', x: c + 50, w: 60 });
  }
  return finish({
    door,
    type: 'greenhouse',
    name: 'The Greenhouse',
    width,
    style: { wall: 'glass', floor: 'stone', vault: false, ceil: '#1a1e1a' },
    dark: true,
    beams,
    rugs: [],
    objects: o,
    exit: { locked: false, req: null },
    ambience: { windows: 3, fire: false, heavyRain: true },
    ctx: { door, containers: [] },
    rng,
  });
}

function finalRoom(rng, door) {
  const width = 3 * BAY + W.PART_W + 40;
  const o = [{ type: 'pipes', x0: 0, x1: width, y: W.CEIL + 12 }];
  o.push({ type: 'bulb', x: 120 }, { type: 'bulb', x: 300 }, { type: 'bulb', x: 480 });
  o.push({ type: 'elevator', x: width - W.PART_W - 120 });
  return {
    door,
    type: 'final',
    name: 'The Electrical Room',
    width,
    style: { wall: 'brick', brick: '#3a3434', floor: 'stone', vault: false, ceil: '#1e1c1c' },
    dark: false,
    beams: [20, 220, 420, 620],
    rugs: [],
    objects: o,
    exit: { locked: false, req: { kind: 'final' } },
    ambience: { windows: 0, fire: false },
    hintAfter: 999,
    ambientTint: 0.8,
  };
}
