// CI quality gate: serves the game, opens it in headless Chromium and checks
//  1. no JS errors on boot, menu, gameplay
//  2. autoplay Door 0 → 100 succeeds for several seeds (keys, levers, books, doors)
//  3. rooms are unloaded (memory stays bounded)
//  4. layouts render in portrait, landscape and inside an iframe
//  5. average FPS is reported (informational)
// Screenshots go to ci-artifacts/. Exit code 1 on any failure.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'ci-artifacts');
fs.mkdirSync(OUT, { recursive: true });
const SEEDS = (process.env.SEEDS || '1,99,4242,31337').split(',').map(Number);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  const file = fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, 'index.html') : p;
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--autoplay-policy=no-user-gesture-required'],
});
const failures = [];
const fail = (m) => {
  failures.push(m);
  console.log('  ✗ ' + m);
};
const ok = (m) => console.log('  ✓ ' + m);
const autoplaySrc = fs.readFileSync(path.join(ROOT, 'tools/autoplay.js'), 'utf8');

async function page(w, h, url) {
  const pg = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  pg.on('pageerror', (e) => errors.push(String(e)));
  pg.on('console', (m) => m.type() === 'error' && !/favicon|404/.test(m.text()) && errors.push(m.text()));
  await pg.goto(BASE + url);
  return { pg, errors };
}

// ---------------------------------------------------------------- 1. boot + menu + play
console.log('▶ boot / menu / gameplay');
{
  const { pg, errors } = await page(1280, 720, '/index.html?debug=1');
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${OUT}/menu-landscape.png` });
  await pg.click('#btn-start');
  await pg.waitForTimeout(1500);
  await pg.keyboard.down('d');
  await pg.waitForTimeout(1500);
  await pg.keyboard.up('d');
  const x = await pg.evaluate(() => __game.player.x);
  x > 250 ? ok(`player moves (x=${x.toFixed(0)})`) : fail(`player did not move (x=${x})`);
  await pg.evaluate(() => (__game.player.x = 600));
  await pg.waitForTimeout(200);
  await pg.keyboard.press('e');
  const hasKey = await pg.evaluate(() => __game.inv.hasKey(1));
  hasKey ? ok('key 0001 picked up') : fail('key 0001 not picked up');
  await pg.screenshot({ path: `${OUT}/play-landscape.png` });
  const fps = await pg.evaluate(
    () =>
      new Promise((r) => {
        let n = 0;
        const t0 = performance.now();
        const f = () => (++n, performance.now() - t0 < 2000 ? requestAnimationFrame(f) : r((n * 1000) / (performance.now() - t0)));
        requestAnimationFrame(f);
      }),
  );
  console.log(`  ℹ fps ≈ ${fps.toFixed(0)} (headless, software rendering)`);
  errors.length ? fail('JS errors: ' + errors.join(' | ')) : ok('no JS errors');
  await pg.close();
}

// ---------------------------------------------------------------- 2/3. autoplay 0 → 100
console.log('▶ autoplay Door 0 → 100');
for (const seed of SEEDS) {
  const { pg, errors } = await page(960, 540, `/index.html?debug=1&seed=${seed}&autostart=1`);
  await pg.waitForTimeout(2200);
  const r = await pg.evaluate(autoplaySrc);
  if (r.errs.length) fail(`seed ${seed}: ${r.errs.join('; ')}`);
  else if (r.reached !== 100) fail(`seed ${seed}: stopped at door ${r.reached}`);
  else ok(`seed ${seed}: reached Door 100, gold ${r.gold}`);
  r.loaded.length <= 3 ? ok(`seed ${seed}: ${r.loaded.length} room(s) loaded at end`) : fail(`seed ${seed}: rooms not unloaded (${r.loaded})`);
  if (errors.length) fail(`seed ${seed} JS errors: ${errors.join(' | ')}`);
  await pg.close();
}

// ---------------------------------------------------------------- 4. layouts
console.log('▶ layouts');
for (const [name, w, h, url] of [
  ['portrait', 390, 844, '/index.html?door=12&seed=5&touch=1'],
  ['landscape-dark', 1280, 720, '/index.html?door=61&seed=5'],
  ['library', 1280, 720, '/index.html?door=50&seed=5'],
  ['iframes', 1400, 900, '/frame-test.html'],
]) {
  const { pg, errors } = await page(w, h, url);
  await pg.waitForTimeout(2800);
  await pg.screenshot({ path: `${OUT}/${name}.png` });
  if (name === 'portrait') {
    const v = await pg.evaluate(() => {
      const a = document.querySelector('#t-act').getBoundingClientRect();
      const s = getComputedStyle(document.getElementById('app'));
      return { actTop: a.top, bandBottom: parseFloat(s.getPropertyValue('--band-bottom')) };
    });
    v.actTop >= v.bandBottom ? ok('portrait: touch controls below gameplay band') : fail(`portrait: controls overlap band ${JSON.stringify(v)}`);
  }
  errors.length ? fail(`${name} JS errors: ${errors.join(' | ')}`) : ok(`${name} renders`);
  await pg.close();
}

await browser.close();
server.close();
console.log(failures.length ? `\n✗ ${failures.length} check(s) failed` : '\n✓ all checks passed');
process.exit(failures.length ? 1 : 0);
