import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../bootstrap-hook.js', import.meta.url), 'utf8');
const appStart = 'https://claude.ai/edge-api/bootstrap/00000000-0000-4000-8000-000000000000/app_start?cache_bust=1';
const nativeBody = {
  config: { features: {
    '1174351393': {
      defaultValue: true,
      rules: [{ force: true, condition: { ok: true } }]
    },
    'otherFlag': { defaultValue: true }
  } },
  account: { sentinel: 'untouched' }
};
const requests = [];
const globals = {
  Request, Response, Headers, URL,
  location: { href: 'https://claude.ai/new', origin: 'https://claude.ai' },
  document: { readyState: 'loading' },
  console: { info() {}, warn() {} },
  fetch: async function(url) {
    requests.push(String(url));
    return new Response(JSON.stringify(nativeBody), { status: 200, headers: { 'content-type': 'application/json' }});
  }
};
globals.window = globals;
vm.runInNewContext(source, globals);
const response = await globals.fetch(appStart);
const patched = await response.json();
assert.equal(patched.config.features['1174351393'].defaultValue, false);
assert.equal(patched.config.features['1174351393'].rules[0].force, false);
assert.equal(patched.config.features.otherFlag.defaultValue, true);
assert.equal(patched.account.sentinel, 'untouched');
assert.equal(globals.__CLAUDE_SPLIT_POC_STATE__.patched, 1);
assert.equal(response.url, ''); // parity with mock native Response URL
const otherResponse = await globals.fetch('https://claude.ai/edge-api/some_other_api');
assert.equal((await otherResponse.json()).config.features['1174351393'].defaultValue, true);
assert.equal(globals.__CLAUDE_SPLIT_POC_STATE__.intercepted, 1);
assert.equal(requests.length, 2);
console.log('smoke: patched targeted flag; preserved other fields; passed through other requests');
