import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../poc/firefox-mv3/manifest.json', import.meta.url), 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.ok(manifest.name.includes('Claude'));
assert.equal(manifest.content_scripts?.length, 1);
const [script] = manifest.content_scripts;
assert.deepEqual(script.matches, ['https://claude.ai/*']);
assert.deepEqual(script.js, ['bootstrap-hook.js']);
assert.equal(script.run_at, 'document_start');
assert.equal(script.world, 'MAIN');
assert.equal(script.all_frames, false);
assert.ok(manifest.browser_specific_settings?.gecko?.id);
assert.equal(manifest.permissions?.length || 0, 0);
console.log('manifest: constrained to claude.ai, MV3, MAIN/document_start, no permissions');
