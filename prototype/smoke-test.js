// End-to-end check of the clickable prototype: citizen reports → officer schedules and cleans → citizen sees it.
// Run: node prototype/smoke-test.js
const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');
const url = (f) => 'file://' + path.join(__dirname, f);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 400, height: 800 } });
  const errors = [];

  const app = await ctx.newPage();
  app.on('pageerror', (e) => errors.push(e.message));
  await app.goto(url('index.html'));
  await app.click('#btn-cam');
  await app.selectOption('#place', { label: 'Mercado' });
  await app.click('.scene[data-type="bag"]');
  await app.click('.chip[data-type="tecnopor"]'); // user corrects the suggestion
  await app.click('#btn-send');
  await app.click('#s-sent [data-go="s-list"]');
  assert.match(await app.textContent('#list .card'), /Tecnopor/);
  assert.strictEqual(await app.locator('#list .steps .done').count(), 1);
  const id = await app.getAttribute('#list .card', 'data-id');

  const dash = await ctx.newPage();
  dash.on('pageerror', (e) => errors.push(e.message));
  await dash.setViewportSize({ width: 1200, height: 800 });
  await dash.goto(url('dashboard.html'));
  const row = dash.locator(`tr[data-id="${id}"]`);
  assert.match(await row.textContent(), /Recibido/);
  const openBefore = +(await dash.textContent('#k-open'));
  await dash.selectOption(`select[data-crew="${id}"]`, 'Cuadrilla B');
  assert.match(await row.textContent(), /Programado/);
  await dash.click(`[data-clean="${id}"]`);
  assert.match(await row.textContent(), /Limpiado/);
  assert.strictEqual(+(await dash.textContent('#k-open')), openBefore - 1);
  assert.strictEqual(await dash.locator('.pin').count(), 8);

  const [dl] = await Promise.all([dash.waitForEvent('download'), dash.click('#btn-csv')]);
  const csv = require('fs').readFileSync(await dl.path(), 'utf8');
  assert.match(csv, new RegExp(`"${id}","street","tecnopor","0.8","true","Mercado"`));

  await dash.click('[data-flag="104"]'); // false report disappears
  assert.strictEqual(await dash.locator('tr[data-id="104"]').count(), 0);

  await app.reload();
  await app.click('#nav-list');
  assert.strictEqual(await app.locator('#list .steps .done').count(), 3);

  // No horizontal scroll at phone width on either page.
  await dash.setViewportSize({ width: 380, height: 800 });
  for (const p of [app, dash]) {
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(over <= 0, `horizontal overflow ${over}px on ${p.url()}`);
  }
  assert.deepStrictEqual(errors, []);
  await app.screenshot({ path: path.join(__dirname, 'shot-app.png') });
  await dash.setViewportSize({ width: 1200, height: 800 });
  await dash.screenshot({ path: path.join(__dirname, 'shot-dashboard.png') });
  await browser.close();
  console.log('prototype smoke test: OK');
})().catch((e) => { console.error(e); process.exit(1); });
