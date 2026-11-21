// Item definitions + procedural icons. Add new items here; the inventory,
// pickup and HUD systems read everything from this registry.
import { RULES } from '../data/doors_rules.js';

export const ITEMS = {
  key: {
    name: 'กุญแจห้อง',
    stack: 1,
    kind: 'key',
    unique: (data) => 'key' + data.num, // keys never merge
    label: (d) => String(d.num).padStart(4, '0'),
  },
  lighter: {
    name: 'ไฟแช็ก',
    stack: 1,
    kind: 'light',
    light: { radius: 150, color: [255, 176, 96], intensity: 1, flicker: 0.14 },
    drainPerSec: 1 / RULES.items.lighter.maxUseSec.value, // 60s full
    fuelKey: 'fuel',
    sfxOn: 'lighter',
  },
  flashlight: {
    name: 'ไฟฉาย',
    stack: 1,
    kind: 'light',
    light: { cone: true, radius: 230, color: [255, 235, 200], intensity: 1.0, flicker: 0.02 },
    drainPerSec: 1 / RULES.items.flashlight.maxUseSec.value, // 120s full
    fuelKey: 'charge',
    maxFuel: RULES.items.flashlight.overchargeMaxFraction.value,
    sfxOn: 'click',
    noise: 0.4,
  },
  battery: { name: 'แบตเตอรี่', stack: 5, kind: 'consumable' },
  vitamins: { name: 'วิตามิน', stack: RULES.items.vitamins.maxStack.value, kind: 'consumable' },
  lockpick: { name: 'ที่สะเดาะกุญแจ', stack: RULES.items.lockpick.maxStack.value, kind: 'tool' },
  book: { name: 'หนังสือ', stack: 8, kind: 'quest' },
};

// ------------------------------------------------------------------ icons
const iconCache = new Map();
export function itemIcon(id, data) {
  const key = id + (id === 'key' ? data?.num : '');
  if (iconCache.has(key)) return iconCache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.translate(32, 32);
  ICON_PAINTERS[id]?.(g, data);
  const url = c.toDataURL();
  iconCache.set(key, url);
  return url;
}

const ICON_PAINTERS = {
  key(g, d) {
    g.rotate(-0.7);
    g.fillStyle = '#e4c27a';
    g.strokeStyle = '#7a5a2a';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(-12, 0, 9, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = '#3a2a10';
    g.beginPath();
    g.arc(-12, 0, 3.5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#e4c27a';
    g.fillRect(-4, -3, 28, 6);
    g.fillRect(14, 3, 4, 7);
    g.fillRect(20, 3, 3, 5);
    g.strokeRect(-4, -3, 28, 6);
  },
  flashlight(g) {
    g.rotate(-0.6);
    g.fillStyle = '#3a3a3e';
    g.fillRect(-20, -6, 30, 12);
    g.fillStyle = '#55555c';
    g.fillRect(-20, -6, 30, 3);
    g.fillStyle = '#4a4a50';
    g.beginPath();
    g.moveTo(10, -6);
    g.lineTo(22, -10);
    g.lineTo(22, 10);
    g.lineTo(10, 6);
    g.fill();
    g.fillStyle = '#fff3c0';
    g.fillRect(21, -9, 3, 18);
    g.fillStyle = '#c03a2a';
    g.fillRect(-6, -8, 6, 2);
  },
  battery(g) {
    g.rotate(-0.4);
    g.fillStyle = '#2a2a2a';
    g.fillRect(-18, -9, 32, 18);
    g.fillStyle = '#d4a020';
    g.fillRect(-18, -9, 12, 18);
    g.fillStyle = '#bbb';
    g.fillRect(14, -4, 4, 8);
    g.fillStyle = '#fff';
    g.font = 'bold 12px sans-serif';
    g.fillText('+', 0, 5);
  },
  vitamins(g) {
    g.fillStyle = '#e8e0d0';
    g.fillRect(-11, -16, 22, 6);
    g.fillStyle = '#d0802a';
    g.beginPath();
    g.moveTo(-12, -10);
    g.lineTo(12, -10);
    g.lineTo(13, 20);
    g.lineTo(-13, 20);
    g.fill();
    g.fillStyle = '#f4ecd8';
    g.fillRect(-10, 0, 20, 10);
    g.fillStyle = '#c03a2a';
    g.fillRect(-3, 2, 6, 6);
  },
  lockpick(g) {
    g.rotate(-0.8);
    g.strokeStyle = '#bfbfc8';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(-20, 0);
    g.lineTo(18, 0);
    g.lineTo(22, -5);
    g.stroke();
    g.fillStyle = '#6a3a2a';
    g.fillRect(-22, -5, 14, 10);
  },
  book(g) {
    g.rotate(-0.15);
    g.fillStyle = '#6a2a20';
    g.fillRect(-14, -18, 28, 36);
    g.fillStyle = '#e8dcc0';
    g.fillRect(10, -16, 4, 32);
    g.fillStyle = '#c9a060';
    g.fillRect(-10, -10, 16, 3);
    g.fillRect(-10, 8, 16, 2);
  },
};
ICON_PAINTERS.lighter = (g) => {
  g.fillStyle = '#b03a2a';
  g.fillRect(-10, -6, 20, 26);
  g.fillStyle = '#d0d0d4';
  g.fillRect(-10, -14, 20, 9);
  g.fillStyle = '#8a8a90';
  g.beginPath();
  g.arc(4, -10, 4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#ffb040';
  g.beginPath();
  g.moveTo(-5, -15);
  g.quadraticCurveTo(-9, -24, -3, -30);
  g.quadraticCurveTo(1, -22, -1, -15);
  g.fill();
};
