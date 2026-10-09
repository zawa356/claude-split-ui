import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'apps/browser-extension/package.json'), 'utf8'));
const version = pkg.version;
const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
assert.equal(version, rootPkg.version, 'root and extension versions must match');
const generated = 'claude-split-uibrowser-extension-' + version;
const outputDir = join(root, 'apps/browser-extension/.output');
const dest = join(root, 'dist/release');
mkdirSync(dest, { recursive: true });
const sums = [];
for (const browser of ['firefox', 'chrome']) {
  const source = join(outputDir, generated + '-' + browser + '.zip');
  assert.ok(existsSync(source), 'Missing WXT ZIP: ' + source);
  const filename = 'claude-split-ui-' + version + '-' + browser + '.zip';
  const target = join(dest, filename);
  copyFileSync(source, target);
  const sum = createHash('sha256').update(readFileSync(target)).digest('hex');
  sums.push(sum + '  ' + filename);
  console.log(browser + ' => ' + filename + ' (SHA256: ' + sum + ')');
}
writeFileSync(join(dest, 'SHA256SUMS.txt'), sums.join('\n') + '\n');
