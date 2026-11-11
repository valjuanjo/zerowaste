// Drives the web build of the app through the whole citizen flow.
// It checks the app logic; the real camera and GPS can only be checked on a phone with Expo Go.
//
//   npx expo export --platform web --output-dir dist-web
//   node scripts/web-smoke-test.js dist-web
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(process.argv[2] || 'dist-web');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  let f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, 'index.html');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 800 },
    permissions: ['geolocation', 'camera'],
    geolocation: { latitude: -12.1211, longitude: -77.0297 },
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base);
  const id = (t) => page.locator(`[data-testid="${t}"]`);

  // Report 1: photo + location + type.
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), id('btn-cam').click()]);
  await chooser.setFiles(path.join(__dirname, '..', 'assets', 'icon.png'));
  await id('btn-send').waitFor();
  assert.match(await id('place').textContent(), /-12\.1211/); // coordinates, since the web has no address lookup
  assert.strictEqual(await id('btn-send').getAttribute('aria-disabled'), 'true', 'cannot send before choosing a type');
  await id('chip-tecnopor').click();
  await id('btn-send').click();
  await id('btn-see').click();
  await id('card-101').waitFor();
  assert.match(await id('card-101').textContent(), /Styrofoam/); // English by default
  assert.match(await page.textContent('body'), /My reports/);
  await id('lang-toggle').click(); // switch to Spanish
  assert.match(await id('card-101').textContent(), /Tecnopor/);
  assert.match(await page.textContent('body'), /Mis reportes/);
  assert.strictEqual(await id('done-101').count(), 1);

  // Facilitator long-press advances the status.
  for (const expected of [2, 3]) {
    const box = await id('card-101').boundingBox();
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down(); await page.waitForTimeout(700); await page.mouse.up();
    assert.strictEqual(await id('done-101').count(), expected);
  }

  // Reports and the chosen language survive a restart of the app.
  await page.reload();
  await id('nav-list').click();
  await id('card-101').waitFor();
  assert.strictEqual(await id('done-101').count(), 3);
  assert.match(await id('card-101').textContent(), /Tecnopor/);

  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(over <= 0, `horizontal overflow ${over}px`);
  assert.deepStrictEqual(errors, []);
  if (process.argv[3]) await page.screenshot({ path: process.argv[3] });
  await browser.close(); server.close();
  console.log('mobile web smoke test: OK');
})().catch((e) => { console.error(e); process.exit(1); });
