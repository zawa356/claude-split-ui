import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium, firefox } from 'playwright';

// Synthetic traffic only. Chromium loads actual WXT MV3 package.
// Firefox uses compiled MAIN-world script through addInitScript, NOT an installed addon.
const target = process.argv[2];
assert.ok(['chromium-extension', 'firefox-script'].includes(target));
const root = resolve(import.meta.dirname, '..', '.output', target === 'chromium-extension' ? 'chrome-mv3' : 'firefox-mv3');
const scriptPath = join(root, 'content-scripts/claude.js');
const endpoint = '/edge-api/bootstrap/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/app_start';
const flag = '1174351393';
const fixture = {
  features: {
    [flag]: { defaultValue: true, rules: [{ force: true, tracks: [{ result: { value: true } }] }] },
    other: { defaultValue: true, rules: [{ force: true }] }
  }
};

async function mock(context) {
  await context.route('https://claude.ai/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/new') return route.fulfill({
      status: 200, contentType: 'text/html',
      body: '<!doctype html><title>synthetic browser fixture</title><p>No external traffic</p>'
    });
    if (path === endpoint) return route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json', etag: '"synthetic"' },
      body: JSON.stringify(fixture)
    });
    if (path === '/unrelated') return route.fulfill({
      status: 200, contentType: 'application/json', body: '{"untouched":true}'
    });
    return route.fulfill({ status: 404, body: 'no real network requests permitted' });
  });
}

async function check(context, enabled) {
  await mock(context);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  try {
    await page.goto('https://claude.ai/new', { waitUntil: 'load' });
    if (enabled) await page.waitForFunction(
      () => globalThis.__CLAUDE_SPLIT_PATCH_STATE__?.installed === true,
      null, { timeout: 15000 }
    );
    const result = await page.evaluate(async endpoint => {
      const response = await fetch(endpoint);
      const body = await response.json();
      return {
        value: body.features['1174351393'].defaultValue,
        force: body.features['1174351393'].rules[0].force,
        track: body.features['1174351393'].rules[0].tracks[0].result.value,
        unrelatedFlag: body.features.other.defaultValue,
        otherResponse: await (await fetch('/unrelated')).json(),
        etag: response.headers.get('etag'),
        state: globalThis.__CLAUDE_SPLIT_PATCH_STATE__?.patched ?? null
      };
    }, endpoint);
    assert.deepEqual(errors, [], 'page script errors');
    assert.equal(result.value, !enabled, 'feature default');
    assert.equal(result.force, !enabled, 'boolean rule force');
    assert.equal(result.track, true, 'tracking metadata unchanged');
    assert.equal(result.unrelatedFlag, true, 'unrelated feature unchanged');
    assert.equal(result.otherResponse.untouched, true, 'other endpoint');
    assert.equal(result.etag === null, enabled, 'obsolete etag stripped after patch');
    assert.equal(result.state, enabled ? 1 : null, 'MAIN-world hook state');
  } finally { await page.close(); }
}

async function testChromium() {
  const before = await chromium.launch({ channel: 'chromium', headless: true });
  try {
    const c = await before.newContext();
    try { await check(c, false); } finally { await c.close(); }
  } finally { await before.close(); }

  const profile = mkdtempSync(join(tmpdir(), 'claude-split-chromium-'));
  try {
    const c = await chromium.launchPersistentContext(profile, {
      channel: 'chromium', headless: true,
      args: ['--disable-extensions-except=' + root, '--load-extension=' + root]
    });
    try { await check(c, true); } finally { await c.close(); }
  } finally { rmSync(profile, { recursive: true, force: true }); }

  const after = await chromium.launch({ channel: 'chromium', headless: true });
  try {
    const c = await after.newContext();
    try { await check(c, false); } finally { await c.close(); }
  } finally { await after.close(); }
  console.log('PASS Chromium: actual unpacked WXT MV3 package (synthetic A/B/A)');
}

async function testFirefox() {
  const browser = await firefox.launch({ headless: true });
  try {
    const before = await browser.newContext();
    try { await check(before, false); } finally { await before.close(); }
    const patched = await browser.newContext();
    try {
      await patched.addInitScript({ path: scriptPath });
      await check(patched, true);
    } finally { await patched.close(); }
    const after = await browser.newContext();
    try { await check(after, false); } finally { await after.close(); }
  } finally { await browser.close(); }
  console.log('PASS Firefox: compiled content script injected in engine (NOT addon installed)');
}

if (target === 'chromium-extension') await testChromium();
else await testFirefox();
