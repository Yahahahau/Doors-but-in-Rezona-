// DOM UI: main menu, pause, settings, HUD (door plate, gold, hotbar, toasts),
// on-screen touch controls. Positions adapt to the renderer layout through CSS
// variables so nothing covers the gameplay band in portrait.
import { bus } from '../core/events.js';
import { ITEMS, itemIcon } from '../game/items.js';
import { pad4 } from '../core/util.js';

const $ = (s) => document.querySelector(s);

export class UI {
  constructor(app) {
    this.app = app; // { game, input, audio, settings, actions }
    this.root = $('#app');
    this.toastTimer = 0;
    this.buildHotbar();
    this.bindMenus();
    this.bindTouch();
    this.bindSettings();
    bus.on('inv:changed', () => this.renderHotbar());
    bus.on('inv:fuel', () => this.renderFuel());
    bus.on('gold:changed', (e) => ($('#gold-val').textContent = e.gold));
    bus.on('room:enter', (e) => this.onRoom(e));
    bus.on('toast', (e) => this.toast(e.text, e.time));
    bus.on('floor:complete', (e) => this.showEnd(e));
  }

  // ------------------------------------------------------------- screens
  show(id) {
    for (const el of document.querySelectorAll('.screen')) el.classList.toggle('on', el.id === id);
    this.root.dataset.screen = id || 'game';
  }
  setHud(on) {
    $('#hud').classList.toggle('on', on);
  }

  bindMenus() {
    const A = this.app.actions;
    const click = (sel, fn) =>
      $(sel).addEventListener('click', (e) => {
        e.preventDefault();
        this.app.audio.unlock();
        bus.emit('sfx', { name: 'ui' });
        fn();
      });
    click('#btn-start', () => A.newGame());
    click('#btn-continue', () => A.continueGame());
    click('#btn-settings', () => this.openSettings('menu'));
    click('#btn-pause', () => A.pause());
    click('#btn-resume', () => A.resume());
    click('#btn-pause-settings', () => this.openSettings('pause'));
    click('#btn-quit', () => A.quitToMenu());
    click('#btn-settings-back', () => this.closeSettings());
    click('#btn-end-menu', () => A.quitToMenu());
    click('#btn-reset-save', () => {
      A.resetSave();
      this.toast('ลบเซฟแล้ว');
    });
  }

  refreshMenu(save) {
    const b = $('#btn-continue');
    b.hidden = !save;
    if (save) b.querySelector('small').textContent = 'Door ' + pad4(save.door);
  }

  // ------------------------------------------------------------- settings
  bindSettings() {
    const s = this.app.settings;
    const bindRange = (id, key, fmt) => {
      const el = $(id);
      const out = el.parentElement.querySelector('output');
      const upd = () => (out.textContent = fmt(+el.value));
      el.value = s[key];
      upd();
      el.addEventListener('input', () => {
        s[key] = +el.value;
        upd();
        this.app.actions.settingsChanged();
      });
    };
    const pct = (v) => Math.round(v * 100) + '%';
    bindRange('#set-master', 'master', pct);
    bindRange('#set-sfx', 'sfx', pct);
    bindRange('#set-amb', 'ambience', pct);
    bindRange('#set-bright', 'brightness', pct);
    const seg = (id, key, cast = (v) => v) => {
      const el = $(id);
      const sync = () => el.querySelectorAll('button').forEach((b) => b.classList.toggle('on', String(s[key]) === b.dataset.v));
      el.querySelectorAll('button').forEach((b) =>
        b.addEventListener('click', () => {
          s[key] = cast(b.dataset.v);
          sync();
          this.app.actions.settingsChanged(key);
        }),
      );
      sync();
    };
    seg('#set-quality', 'quality');
    seg('#set-touch', 'touch');
    seg('#set-fps', 'showFps', (v) => v === 'true');
    seg('#set-shake', 'shake', (v) => v === 'true');
  }
  openSettings(from) {
    this.settingsFrom = from;
    this.show('screen-settings');
  }
  closeSettings() {
    this.show(this.settingsFrom === 'pause' ? 'screen-pause' : 'screen-menu');
  }

  // ------------------------------------------------------------- HUD
  onRoom(e) {
    $('#door-num').textContent = pad4(e.door);
    const t = $('#room-name');
    t.textContent = e.room.name + (e.room.dark ? ' · มืด' : '');
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    if (e.door === 0 && e.initial) {
      const tc = $('#titlecard');
      tc.classList.remove('show');
      void tc.offsetWidth;
      tc.classList.add('show');
    }
  }

  toast(text, time = 1.6) {
    const el = $('#toast');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this._tt);
    this._tt = setTimeout(() => el.classList.remove('show'), time * 1000);
  }

  buildHotbar() {
    const hb = $('#hotbar');
    hb.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const b = document.createElement('button');
      b.className = 'slot';
      b.dataset.i = i;
      b.innerHTML = `<span class="n">${i + 1}</span><img alt=""><span class="c"></span><span class="fuel"><i></i></span>`;
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.app.audio.unlock();
        this.app.input.push('slot' + (i + 1));
      });
      hb.appendChild(b);
    }
  }
  renderHotbar() {
    const inv = this.app.game.inv;
    const slots = document.querySelectorAll('#hotbar .slot');
    slots.forEach((b, i) => {
      const s = inv.slots[i];
      b.classList.toggle('empty', !s);
      b.classList.toggle('sel', inv.selected === i && !!s);
      b.classList.toggle('lit', inv.selected === i && inv.lightOn);
      const img = b.querySelector('img');
      const c = b.querySelector('.c');
      if (s) {
        img.src = itemIcon(s.id, s.data);
        img.hidden = false;
        c.textContent = s.id === 'key' ? pad4(s.data.num) : s.count > 1 ? '×' + s.count : '';
        b.title = ITEMS[s.id].name;
      } else {
        img.hidden = true;
        c.textContent = '';
        b.title = '';
      }
    });
    this.renderFuel();
    // quest chips (keys / books)
    const q = document.querySelector('#quest');
    q.innerHTML = '';
    for (const k of inv.keys) q.insertAdjacentHTML('beforeend', `<span class="chip"><img src="${itemIcon('key', { num: k })}">${pad4(k)}</span>`);
    if (inv.books) q.insertAdjacentHTML('beforeend', `<span class="chip"><img src="${itemIcon('book')}">×${inv.books}</span>`);
    // show hotbar only when something is in it (DOORS style)
    $('#hotbar').classList.toggle('has', inv.slots.some(Boolean));
  }
  renderFuel() {
    const inv = this.app.game.inv;
    document.querySelectorAll('#hotbar .slot').forEach((b, i) => {
      const s = inv.slots[i];
      const f = b.querySelector('.fuel');
      const def = s && ITEMS[s.id];
      if (def?.kind === 'light') {
        f.hidden = false;
        const v = Math.min(1, s.data[def.fuelKey] ?? 0);
        f.firstChild.style.width = v * 100 + '%';
        f.classList.toggle('low', v < 0.2);
      } else f.hidden = true;
    });
  }

  showEnd(e) {
    const s = e.stats;
    const mins = Math.max(1, Math.round((Date.now() - s.startedAt) / 60000));
    $('#end-stats').innerHTML = `ประตูที่ผ่าน: <b>${s.doorsOpened}</b><br>ทองที่เก็บได้: <b>${e.gold}</b><br>เวลา: <b>${mins} นาที</b>`;
    this.setHud(false);
    this.show('screen-end');
  }

  // ------------------------------------------------------------- touch
  bindTouch() {
    const inp = this.app.input;
    const hold = (el, key) => {
      const on = (e) => {
        e.preventDefault();
        this.app.audio.unlock();
        el.setPointerCapture?.(e.pointerId);
        inp.touch[key] = true;
        el.classList.add('down');
      };
      const off = (e) => {
        inp.touch[key] = false;
        el.classList.remove('down');
      };
      el.addEventListener('pointerdown', on);
      el.addEventListener('pointerup', off);
      el.addEventListener('pointercancel', off);
      el.addEventListener('lostpointercapture', off);
    };
    hold($('#t-left'), 'left');
    hold($('#t-right'), 'right');
    // crouch toggles on touch (holding + moving is awkward on phones)
    $('#t-crouch').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      inp.touch.crouch = !inp.touch.crouch;
      $('#t-crouch').classList.toggle('down', inp.touch.crouch);
    });
    $('#t-act').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.app.audio.unlock();
      inp.push('interact');
      $('#t-act').classList.add('down');
      setTimeout(() => $('#t-act').classList.remove('down'), 120);
    });
  }

  /** layout sync with renderer (CSS vars) */
  layout(v, settings) {
    const st = this.root.style;
    st.setProperty('--band-top', v.bandTop + 'px');
    st.setProperty('--band-bottom', v.bandBottom + 'px');
    st.setProperty('--ctrl-h', v.ctrlH + 'px');
    this.root.classList.toggle('portrait', v.portrait);
    this.root.classList.toggle('landscape', !v.portrait);
    const coarse = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const showTouch = settings.touch === 'on' || (settings.touch === 'auto' && coarse);
    this.root.classList.toggle('touch', showTouch);
  }

  updateActButton(prompt) {
    const b = $('#t-act');
    b.classList.toggle('ready', !!prompt && !prompt.disabled);
  }
  fps(v, on) {
    const el = $('#fps');
    el.hidden = !on;
    if (on) el.textContent = v + ' fps';
  }
}
