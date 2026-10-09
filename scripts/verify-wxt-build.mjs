import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const browser = process.argv[2];
assert.ok(['chrome', 'firefox'].includes(browser), 'provide chrome or firefox');
const root = resolve(import.meta.dirname, '../apps/browser-extension/.output', `${browser}-mv3`);
const manifestFile = join(root, 'manifest.json');
assert.ok(existsSync(manifestFile), `missing ${manifestFile}`);
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
assert.equal(manifest.manifest_version, 3);
const scripts = manifest.content_scripts ?? [];
assert.equal(scripts.length, 1, 'expected exactly one early content script');
const [script] = scripts;
assert.deepEqual(script.matches, ['https://claude.ai/*']);
assert.equal(script.run_at, 'document_start');
assert.equal(script.world, 'MAIN');
assert.equal(script.all_frames ?? false, false);
assert.ok(script.js?.length >= 1, 'missing generated JavaScript');
for (const name of script.js) {
  assert.ok(!name.startsWith('..') && !name.includes('\\'), 'unsafe script path');
  assert.ok(existsSync(join(root, name)), `missing output script: ${name}`);
}
assert.deepEqual(manifest.host_permissions ?? [], [], 'unexpected host permissions');
assert.deepEqual(manifest.permissions ?? [], [], 'unexpected extension permissions');
if (browser === 'firefox') {
  assert.equal(manifest.browser_specific_settings?.gecko?.id, 'claude-split-ui@example.invalid');
}
console.log(`${browser} MV3 manifest verified`);
