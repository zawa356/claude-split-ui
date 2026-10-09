import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const pages = [
  'README.md', 'docs/i18n/README.ja.md',
  'docs/FAQ.md', 'docs/i18n/FAQ.ja.md',
  'docs/DEVELOPMENT.md', 'docs/i18n/DEVELOPMENT.ja.md',
  'docs/PRIVACY.md', 'docs/i18n/PRIVACY.ja.md',
  'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md'
];
const failures = [];
for (const page of pages) {
  const file = join(root, page);
  assert.ok(existsSync(file), `Missing documentation: ${page}`);
  const body = readFileSync(file, 'utf8');
  // Only local Markdown links; external URLs and heading fragments are out of scope.
  const links = body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g);
  for (const [, link] of links) {
    if (/^(?:https?:|mailto:|#)/i.test(link)) continue;
    const target = decodeURIComponent(link.split('#')[0].split('?')[0]);
    if (!target) continue;
    if (!existsSync(resolve(dirname(file), target))) {
      failures.push(`${page}: missing local link ${link}`);
    }
  }
}
assert.deepEqual(failures, [], failures.join('\n'));
console.log(`Documentation: ${pages.length} pages present; relative Markdown links resolve`);
