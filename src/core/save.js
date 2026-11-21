import { SAVE_KEY, SETTINGS_KEY } from './const.js';

// localStorage can throw inside sandboxed iframes — always guard.
function safeGet(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    return false;
  }
}

export const Save = {
  load() {
    const s = safeGet(SAVE_KEY);
    return s && typeof s.door === 'number' ? s : null;
  },
  write(state) {
    return safeSet(SAVE_KEY, { ...state, savedAt: Date.now(), v: 1 });
  },
  clear() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {}
  },
};

export const DEFAULT_SETTINGS = {
  master: 0.8,
  sfx: 0.9,
  ambience: 0.7,
  brightness: 1.0, // 0.7 … 1.4
  quality: 'auto', // 'low' | 'high' | 'auto'
  showFps: false,
  shake: true,
  touch: 'auto', // 'auto' | 'on' | 'off'
};

export const Settings = {
  load() {
    return { ...DEFAULT_SETTINGS, ...(safeGet(SETTINGS_KEY) || {}) };
  },
  write(s) {
    safeSet(SETTINGS_KEY, s);
  },
};
