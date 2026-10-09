import { readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const excludedDirectories = new Set(['.git', 'node_modules', 'dist', '.output', '.wxt', '.idea', '.vscode']);
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) walk(join(dir, entry.name));
    } else if (entry.isFile()) {
      files.push(relative(root, join(dir, entry.name)).replaceAll('\\', '/'));
    }
  }
}
walk(root);
const patterns = [
  /\.har(?:\.gz)?$/i,
  /^\.?env(?:\.|$)/i,
  /\.(?:pem|p12|pfx|key)$/i,
  /(?:^|\/)cookies[^/]*\.json$/i,
  /(?:^|\/)[^/]*app_start[^/]*\.json$/i,
  /(?:^|\/)[^/]*bootstrap[^/]*response[^/]*\.json$/i
];
const failures = files.filter(path => path.split('/').some(segment => segment === 'secrets' || segment === 'local-captures') || patterns.some(re => re.test(path.split('/').at(-1))));
assert.equal(failures.length, 0, `Sensitive/forbidden filenames found:\n${failures.join('\n')}`);
console.log(`public-file guard: ${files.length} expected source files; no captured/secret filenames`);
