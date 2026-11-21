// Procedural Web Audio: no sound files needed. Every effect is synthesised
// from noise and oscillators. Listens to `sfx` events on the bus, positions
// them in stereo relative to the camera, and runs room-dependent ambience
// (room tone, rain, fireplace crackle, electrical hum).
import { bus } from './events.js';

export class Audio {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.listenerX = 0;
    this.viewW = 400;
    this.amb = {};
    bus.on('sfx', (e) => this.play(e.name, e.x, e.vol));
    bus.on('lightning', () => setTimeout(() => this.play('thunder'), 500 + Math.random() * 900));
  }

  /** must be called from a user gesture (tap/click/key) */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const c = this.ctx;
    this.master = c.createGain();
    this.master.connect(c.destination);
    this.sfxBus = c.createGain();
    this.sfxBus.connect(this.master);
    this.ambBus = c.createGain();
    this.ambBus.connect(this.master);
    this.noiseBuf = this.makeNoise(2, 'white');
    this.brownBuf = this.makeNoise(4, 'brown');
    this.applyVolumes();
    this.startAmbience();
  }

  applyVolumes() {
    if (!this.ctx) return;
    const s = this.settings;
    this.master.gain.value = s.master;
    this.sfxBus.gain.value = s.sfx;
    this.ambBus.gain.value = s.ambience;
  }

  suspend(on) {
    if (!this.ctx) return;
    if (on) this.ctx.suspend();
    else this.ctx.resume();
  }

  makeNoise(sec, kind) {
    const c = this.ctx;
    const b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      } else d[i] = w;
    }
    return b;
  }

  noise(buf = this.noiseBuf, loop = false) {
    const s = this.ctx.createBufferSource();
    s.buffer = buf;
    s.loop = loop;
    return s;
  }

  // ------------------------------------------------------------- ambience
  startAmbience() {
    const c = this.ctx;
    // room tone: brown noise, low-passed
    const tone = this.noise(this.brownBuf, true);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 260;
    const tg = c.createGain();
    tg.gain.value = 0.22;
    tone.connect(lp).connect(tg).connect(this.ambBus);
    tone.start();
    // low drone
    const o1 = c.createOscillator();
    o1.frequency.value = 54;
    const o2 = c.createOscillator();
    o2.frequency.value = 54.7;
    const dg = c.createGain();
    dg.gain.value = 0.025;
    o1.connect(dg);
    o2.connect(dg);
    dg.connect(this.ambBus);
    o1.start();
    o2.start();
    // rain
    const rain = this.noise(this.noiseBuf, true);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1400;
    bp.Q.value = 0.6;
    const rg = c.createGain();
    rg.gain.value = 0;
    rain.connect(bp).connect(rg).connect(this.ambBus);
    rain.start();
    // electrical hum (basements / buzzing bulbs)
    const hum = c.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.value = 60;
    const hf = c.createBiquadFilter();
    hf.type = 'lowpass';
    hf.frequency.value = 200;
    const hg = c.createGain();
    hg.gain.value = 0;
    hum.connect(hf).connect(hg).connect(this.ambBus);
    hum.start();
    this.amb = { rain: rg, hum: hg, tone: tg, drone: dg };
  }

  /** called each frame with the current room ambience description */
  setAmbience(desc, dt) {
    if (!this.ctx || !this.amb.rain) return;
    const lerp = (p, v) => (p.value += (v - p.value) * Math.min(1, dt * 1.5));
    lerp(this.amb.rain.gain, desc.heavyRain ? 0.2 : desc.windows ? 0.07 + desc.windows * 0.02 : 0.025);
    lerp(this.amb.hum.gain, desc.hum ? 0.03 : 0);
    lerp(this.amb.drone.gain, desc.dark ? 0.05 : 0.022);
    if (desc.fire && Math.random() < dt * 9) this.play('crackle', desc.fireX, 0.5);
    if (desc.drip && Math.random() < dt * 0.4) this.play('drip', desc.dripX);
    if (desc.clock && Math.random() < dt * 0.9) this.play('tick', desc.clockX, 0.4);
  }

  setListener(x, viewW) {
    this.listenerX = x;
    this.viewW = viewW;
  }

  // ------------------------------------------------------------- one-shots
  out(x, vol = 1) {
    const c = this.ctx;
    const g = c.createGain();
    let pan = 0,
      att = 1;
    if (typeof x === 'number') {
      const d = (x - this.listenerX) / (this.viewW * 0.6);
      pan = Math.max(-1, Math.min(1, d));
      att = 1 / (1 + Math.abs(d) * 0.9);
    }
    g.gain.value = vol * att;
    if (c.createStereoPanner) {
      const p = c.createStereoPanner();
      p.pan.value = pan * 0.8;
      g.connect(p).connect(this.sfxBus);
    } else g.connect(this.sfxBus);
    return g;
  }

  env(g, t0, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }

  burst(dest, { freq = 800, q = 1, type = 'bandpass', a = 0.005, peak = 0.5, d = 0.1, delay = 0, rate = 1 } = {}) {
    const c = this.ctx,
      t0 = c.currentTime + delay;
    const s = this.noise();
    s.playbackRate.value = rate;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    this.env(g, t0, a, peak, d);
    s.connect(f).connect(g).connect(dest);
    s.start(t0, Math.random());
    s.stop(t0 + a + d + 0.05);
    return f;
  }

  tone(dest, { f0 = 440, f1 = f0, type = 'sine', a = 0.005, peak = 0.3, d = 0.2, delay = 0 } = {}) {
    const c = this.ctx,
      t0 = c.currentTime + delay;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + a + d);
    const g = c.createGain();
    this.env(g, t0, a, peak, d);
    o.connect(g).connect(dest);
    o.start(t0);
    o.stop(t0 + a + d + 0.05);
  }

  play(name, x, vol = 1) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const o = this.out(x, vol);
    switch (name) {
      case 'step':
        this.burst(o, { freq: 180 + Math.random() * 60, q: 0.8, type: 'lowpass', peak: 0.55, d: 0.07 });
        this.burst(o, { freq: 2200, q: 2, peak: 0.05, d: 0.03 });
        break;
      case 'door_open': {
        // creak: modulated band-passed saw + latch click
        this.burst(o, { freq: 3000, q: 3, peak: 0.25, d: 0.03 });
        const c = this.ctx,
          t0 = c.currentTime + 0.05;
        const s = c.createOscillator();
        s.type = 'sawtooth';
        s.frequency.setValueAtTime(70, t0);
        s.frequency.linearRampToValueAtTime(130, t0 + 0.25);
        s.frequency.linearRampToValueAtTime(90, t0 + 0.55);
        const bp = c.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 900;
        bp.Q.value = 6;
        const g = c.createGain();
        this.env(g, t0, 0.05, 0.18, 0.55);
        s.connect(bp).connect(g).connect(o);
        s.start(t0);
        s.stop(t0 + 0.7);
        break;
      }
      case 'door_close':
        this.burst(o, { freq: 120, type: 'lowpass', peak: 0.9, d: 0.25 });
        this.burst(o, { freq: 1800, q: 3, peak: 0.12, d: 0.05, delay: 0.01 });
        break;
      case 'locked':
        for (let i = 0; i < 3; i++) this.burst(o, { freq: 2400, q: 6, peak: 0.25, d: 0.04, delay: i * 0.07 });
        break;
      case 'unlock':
        this.burst(o, { freq: 3200, q: 8, peak: 0.35, d: 0.05 });
        this.burst(o, { freq: 1600, q: 5, peak: 0.3, d: 0.08, delay: 0.12 });
        break;
      case 'drawer':
        this.burst(o, { freq: 500, q: 1.2, a: 0.04, peak: 0.3, d: 0.25, rate: 0.6 });
        this.burst(o, { freq: 220, type: 'lowpass', peak: 0.4, d: 0.08, delay: 0.27 });
        break;
      case 'chest':
        this.burst(o, { freq: 300, q: 2, a: 0.08, peak: 0.25, d: 0.4, rate: 0.5 });
        break;
      case 'wardrobe':
        this.burst(o, { freq: 700, q: 4, a: 0.03, peak: 0.2, d: 0.22, rate: 0.5 });
        this.burst(o, { freq: 140, type: 'lowpass', peak: 0.5, d: 0.12, delay: 0.2 });
        break;
      case 'pickup':
        this.tone(o, { f0: 880, f1: 1320, peak: 0.12, d: 0.18 });
        break;
      case 'gold':
        this.tone(o, { f0: 2600, peak: 0.08, d: 0.12, type: 'triangle' });
        this.tone(o, { f0: 3300, peak: 0.06, d: 0.15, type: 'triangle', delay: 0.05 });
        this.tone(o, { f0: 2900, peak: 0.05, d: 0.2, type: 'triangle', delay: 0.1 });
        break;
      case 'key':
        this.tone(o, { f0: 1900, peak: 0.07, d: 0.1, type: 'triangle' });
        this.tone(o, { f0: 2500, peak: 0.07, d: 0.15, type: 'triangle', delay: 0.07 });
        break;
      case 'lighter':
        this.burst(o, { freq: 4000, q: 1, peak: 0.3, d: 0.04 });
        this.burst(o, { freq: 1200, q: 0.5, a: 0.03, peak: 0.08, d: 0.4, delay: 0.05 });
        break;
      case 'click':
        this.burst(o, { freq: 3500, q: 6, peak: 0.3, d: 0.02 });
        break;
      case 'lever':
        this.burst(o, { freq: 400, q: 2, peak: 0.6, d: 0.15 });
        this.burst(o, { freq: 90, type: 'lowpass', peak: 0.8, d: 0.3, delay: 0.1 });
        break;
      case 'gate':
        this.burst(o, { freq: 900, q: 8, a: 0.2, peak: 0.12, d: 1.4, rate: 0.4 });
        this.tone(o, { f0: 60, f1: 45, type: 'sawtooth', a: 0.2, peak: 0.06, d: 1.4 });
        break;
      case 'thunder':
        this.burst(this.out(undefined, vol), { freq: 120, type: 'lowpass', a: 0.05, peak: 0.9, d: 2.5, rate: 0.3 });
        break;
      case 'crackle':
        this.burst(o, { freq: 2000 + Math.random() * 3000, q: 4, peak: 0.12 * Math.random(), d: 0.015 });
        break;
      case 'drip':
        this.tone(o, { f0: 1400, f1: 600, peak: 0.08, d: 0.08 });
        break;
      case 'tick':
        this.burst(o, { freq: 5000, q: 10, peak: 0.08, d: 0.01 });
        break;
      case 'vitamins':
        this.burst(o, { freq: 2500, q: 1, peak: 0.15, d: 0.08 });
        this.tone(o, { f0: 300, f1: 900, peak: 0.08, d: 0.3, delay: 0.1 });
        break;
      case 'ui':
        this.tone(o, { f0: 660, peak: 0.06, d: 0.06, type: 'triangle' });
        break;
      case 'hide':
        this.burst(o, { freq: 160, type: 'lowpass', peak: 0.4, d: 0.15 });
        break;
      case 'deny':
        this.tone(o, { f0: 180, f1: 140, type: 'square', peak: 0.04, d: 0.15 });
        break;
      case 'flicker':
        for (let i = 0; i < 6; i++) this.burst(o, { freq: 6000, q: 2, peak: 0.08, d: 0.02, delay: i * 0.09 * Math.random() });
        break;
    }
  }
}
