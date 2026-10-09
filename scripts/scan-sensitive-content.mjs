/** Best-effort public-repository guard; never a substitute for human review. */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const skipDirs = new Set(['.git', 'node_modules', '.output', '.wxt', 'dist', 'coverage', '.idea', '.vscode']);
const skipExtensions = /\.(?:png|jpg|jpeg|webp|ico|woff2?|pdf|zip|asar|bundle)$/i;
const rules = [
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/g],
  ['OpenAI-style key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{35,}\b/g],
  ['Generic private key', /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/g],
  ['Authorization bearer', /\bAuthorization\s*:\s*Bearer\s+[A-Za-z0-9_.-]{28,}/gi],
  ['Cookie header with session value', /\bCookie\s*:\s*[^\n]{0,200}(?:session|token|auth)[^\n]{0,100}=[A-Za-z0-9_.-]{30,}/gi]
];
const problems = [];
let inspected = 0;
function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const full = join(folder, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(full);
    } else if (entry.isFile() && !skipExtensions.test(entry.name)) {
      inspected++;
      const body = readFileSync(full, 'utf8');
      for (const [label, pattern] of rules) {
        pattern.lastIndex = 0;
        if (pattern.test(body)) problems.push(`${relative(root, full)}: ${label}`);
      }
    }
  }
}
walk(root);
assert.equal(problems.length, 0, `Potential secrets; inspect manually (values suppressed):\n${problems.join('\n')}`);
console.log(`secret-content heuristic: scanned ${inspected} text files; no token-shaped matches`);
