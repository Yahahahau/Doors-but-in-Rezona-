// Boot + main loop. Works standalone, inside an <iframe>, and in the Rezona
// WebView: sizes to its container (ResizeObserver), never uses alert/navigation,
// guards localStorage, unlocks audio on the first gesture, pauses when hidden.
import { Input } from './core/input.js';
import { Audio } from './core/audio.js';
import { Settings, Save } from './core/save.js';
import { bus } from './core/events.js';
import { Renderer } from './render/renderer.js';
import { Game } from './game/game.js';
import { UI } from './ui/ui.js';

const params = new URLSearchParams(location.search);
const app = document.getElementById('app');
const canvas = document.getElementById('game');

const settings = Settings.load();
if (params.has('debug')) settings.showFps = true;
if (params.has('touch')) settings.touch = 'on';
const input = new Input();
const audio = new Audio(settings);
const renderer = new Renderer(canvas);
const game = new Game(settings);

let state = 'loading'; // loading | menu | play | paused | end
let quality = resolveQuality();

const actions = {
  newGame() {
    Save.clear();
    startPlay(() => game.newGame(params.has('seed') ? +params.get('seed') : undefined));
  },
  continueGame() {
    const s = Save.load();
    if (s) startPlay(() => game.continueGame(s));
  },
  pause() {
    if (state !== 'play') return;
    state = 'paused';
    input.enabled = false;
    ui.show('screen-pause');
    audio.suspend(true);
  },
  resume() {
    state = 'play';
    input.enabled = true;
    input.drain();
    ui.show(null);
    audio.suspend(false);
  },
  quitToMenu() {
    toMenu();
  },
  resetSave() {
    Save.clear();
    ui.refreshMenu(null);
  },
  settingsChanged(key) {
    Settings.write(settings);
    audio.applyVolumes();
    if (key === 'quality' || key === 'touch') {
      quality = resolveQuality();
      resize();
    }
  },
};

const ui = new UI({ game, input, audio, settings, actions });

function resolveQuality() {
  if (settings.quality !== 'auto') return settings.quality;
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  return mem <= 2 || cores <= 2 ? 'low' : 'high';
}

function startPlay(fn) {
  audio.unlock();
  ui.show('screen-loading');
  ui.setHud(false);
  state = 'loading';
  // let the loading screen paint, then build rooms
  setTimeout(() => {
    fn();
    for (const r of game.rooms.rooms) renderer.dropRoom(r);
    renderer.tiles.clear();
    renderer.particles.clear();
    renderer.cam.snap = true;
    state = 'play';
    input.enabled = true;
    input.drain();
    ui.show(null);
    ui.setHud(true);
    ui.renderHotbar();
  }, 450);
}

function toMenu() {
  state = 'menu';
  input.enabled = false;
  audio.suspend(false);
  game.attract();
  renderer.tiles.clear();
  renderer.cam.snap = true;
  ui.setHud(false);
  ui.refreshMenu(Save.load());
  ui.show('screen-menu');
}

bus.on('room:unloaded', (e) => renderer.dropRoom(e.room));
bus.on('floor:complete', () => {
  state = 'end';
  input.enabled = false;
});
bus.on('door:open', () => (renderer.cam.shake = 0.12));

// ------------------------------------------------------------- sizing
function resize() {
  const r = app.getBoundingClientRect();
  const v = renderer.resize(Math.max(1, r.width), Math.max(1, r.height), window.devicePixelRatio || 1, quality);
  ui.layout(v, settings);
}
new ResizeObserver(resize).observe(app);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));
resize();

// ------------------------------------------------------------- focus / visibility
// inside an iframe the page needs focus to receive keys
app.addEventListener('pointerdown', () => {
  audio.unlock();
  if (document.activeElement !== document.body) document.activeElement?.blur?.();
  window.focus();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state === 'play') actions.pause();
});

// ------------------------------------------------------------- loop
let last = performance.now();
let fpsAcc = 0,
  fpsN = 0,
  fpsShown = 60,
  slowFor = 0;
function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.1) dt = 0.1;

  // pause key
  if (state === 'play' && input.queue.includes('pause')) {
    input.queue = input.queue.filter((a) => a !== 'pause');
    actions.pause();
  } else if (state === 'paused' && input.queue.includes('pause')) {
    input.queue = [];
    actions.resume();
  }
  if (state !== 'play') input.queue = input.queue.filter((a) => a === 'pause');

  if (state === 'play' || state === 'menu' || state === 'end') game.update(state === 'end' ? dt * 0.3 : dt, input);
  if (state !== 'paused' && state !== 'loading') {
    renderer.updateCamera(dt, game);
    renderer.particles.update(dt, game, renderer.view);
    renderer.prewarm(game.rooms.rooms);
    audio.setListener(renderer.cam.cx, renderer.view.viewW);
    audio.setAmbience(game.ambienceDesc(), dt);
  }
  if (state !== 'loading') renderer.render(game, game.time);
  ui.updateActButton(game.prompt);

  // fps + automatic quality fallback
  fpsAcc += dt;
  fpsN++;
  if (fpsAcc > 0.5) {
    fpsShown = Math.round(fpsN / fpsAcc);
    fpsAcc = 0;
    fpsN = 0;
    ui.fps(fpsShown, settings.showFps);
    if (settings.quality === 'auto' && quality === 'high' && state === 'play') {
      slowFor = fpsShown < 38 ? slowFor + 0.5 : 0;
      if (slowFor >= 4) {
        quality = 'low';
        resize();
        bus.emit('toast', { text: 'ปรับกราฟิกเป็นโหมดประหยัดอัตโนมัติ' });
      }
    }
  }
}

// ------------------------------------------------------------- boot
setTimeout(() => {
  toMenu();
  if (params.has('autostart')) actions.newGame();
  if (params.has('door')) {
    const d = Math.max(0, Math.min(100, +params.get('door')));
    startPlay(() => game.continueGame({ door: d, seed: +(params.get('seed') || 1234), inv: null }));
  }
}, 600);
requestAnimationFrame(frame);

// debug helpers (?debug=1): L = flicker lights, K = give lockpick, N = next door teleport
if (params.has('debug')) {
  window.__game = game;
  window.addEventListener('keydown', (e) => {
    if (state !== 'play') return;
    if (e.code === 'KeyL') {
      game.rooms.current.flickerT = 2;
      bus.emit('sfx', { name: 'flicker' });
    }
    if (e.code === 'KeyK') game.inv.add('lockpick', 1);
    if (e.code === 'KeyN') {
      const r = game.rooms.current;
      if (r.exit) {
        r.exit.locked = false;
        r.exit.req = null;
        r.exit.state = 'open';
        r.exit.open = 1;
        const g = r.objects.find((o) => o.type === 'gate');
        if (g) g.open = 1;
        game.player.x = r.x1 + 30;
        game.rooms.update(0, game);
        game.player.x = game.rooms.current.x0 + 140;
        renderer.cam.snap = true;
      }
    }
  });
}
