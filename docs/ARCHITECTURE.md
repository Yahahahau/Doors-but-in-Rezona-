# Architecture — DOORS but in Rezona (Phase 02)

## Coordinate system
World units, 1 unit ≈ 1 px at scale 1. The **gameplay band** is `y = 0…270`
(`W.VIEW_H`); the player walks on `y = 240` (`W.FEET`), the back wall ends at
`y = 198` (`W.BASE`). The renderer scales the band to the screen and extends the
ceiling/floor above and below it on tall screens, so portrait phones get UI
space under the band without letterboxing (see `Renderer.resize`).

Rooms are laid out left→right: room N occupies `[x0, x1]`; its last 72 units
(`W.PART_W`) are the partition wall with the exit door (Door N+1).

## Flow
```
main.js loop → Game.update(dt) → Player.update / RoomManager.update / Inventory.update
            → Renderer.updateCamera → Particles.update → Audio.setAmbience
            → Renderer.render(game)
```

## Rooms
* `roomGen.generateRoom(seed, door)` → **spec** (plain JSON, local coords). Fully
  deterministic per `(seed, door)`, so saves only store `{seed, door, inventory}`.
  Normal rooms are built from **bays** (200-unit wall sections between
  pilasters) chosen from per-type pools (`TYPE_DEFS`, `BAYS`). Fixed rooms:
  `reception`, `library`, `gateRoom`, `greenhouse`, `finalRoom`.
* `Room` converts the spec to world space, adds the exit door object, collects
  lights, and draws itself (`drawStatic` → tile cache, `drawDynamic`,
  `drawForeground`).
* `RoomManager` keeps current + next (+ previous while its door is open), seals
  the door behind the player and unloads old rooms. It also provides
  `solids()` (collision ranges) and `cameraBounds()`.

### Add a new room type
1. Add art helpers in `src/render/art.js` if needed.
2. Add object types to `src/world/objects.js` (`TYPES.myThing = { static, z, draw, ext, lights?, interact?, update?, solid? }`).
3. Add a bay composition to `BAYS` or a fixed-room function in `roomGen.js`, and
   wire it in `generateRoom`.

## Objects (`world/objects.js`)
Data-only objects + behaviour registry:

| key | meaning |
|---|---|
| `static` | baked into the room tile cache (never changes) |
| `layer: 'fg'` | drawn after the player with parallax, fades when overlapping the player |
| `draw / dynamic` | drawing in world units (dynamic is drawn every frame on top of the static bake) |
| `lights(o)` | `{x, y, r, color, i, flicker: steady/fire/dying/buzz/window, glow:[[x,y,size]]}` |
| `interact` | `{range, prompt(o, game) → text|null, act(o, game)}` |
| `solid(o)` | `[x0, x1]` collision range or `null` |
| `hintTarget(o)` | shown by the Guiding-Light-style hint after `room.hintAfter` seconds |

## Rendering (`render/`)
* Static layer is rendered into 256-unit-wide **tiles** per room (cached, rebuilt
  on resize, dropped on unload, pre-warmed one tile per frame).
* **Lighting**: a half-resolution light map (room ambient + additive radial
  gradients + held light) multiplied over the scene, then a bloom pass for bulbs.
  `room.flickerT` makes every light in a room flicker — this is the hook for the
  future Rush/Ambush warning. `room.lightning` is driven by windows.
* Quality `low` reduces DPR, tile resolution, light-map resolution and particles;
  `auto` falls back to `low` when FPS stays < 38.

## Events (`core/events.js`)
`sfx`, `noise` (loudness for a future hearing-based Figure), `room:enter`,
`room:loaded/unloaded`, `door:open`, `door:locked`, `item:pickup`,
`inv:changed`, `gold:changed`, `hide:enter/exit`, `lightning`, `toast`,
`puzzle:solved`, `floor:complete`.

## Hooks prepared for the Entity phase
* `noise` events from footsteps (crouch = quieter), doors, drawers, flashlight, vitamins.
* `player.hidden` + `hide:enter/exit` + `Game.hiddenTime` → Hide's kick-out timer.
* `room.flickerT` / `lights:flicker` → Rush & Ambush warnings; `RoomManager.solids()`
  and the door states for Rush opening the next door.
* Light state per room (`room.dark`, broken fixtures) → Screech spawn rules.
* All numeric rules live in `src/data/doors_rules.js` (from Phase 01).
