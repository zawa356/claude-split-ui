import test from 'node:test';
import assert from 'node:assert/strict';
import { FEATURE_ID, STATE_KEY, patchBootstrap, isBootstrapUrl, installFetchHook } from '../src/index.mjs';

const ORIGIN = 'https://claude.ai/new';
const ENDPOINT = '/edge-api/bootstrap/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/app_start';
const fixture = () => ({
  unrelated: { value: 123 },
  deep: { flags: { [FEATURE_ID]: {
    defaultValue: true,
    rules: [{ force: true, tracks: [{ result: { value: true } }] },
      { force: false, other: 'keep' }, { force: 'true' }]
  } } }
});

test('only exact observed same-origin app_start paths match', () => {
  assert.equal(isBootstrapUrl(ENDPOINT, ORIGIN), true);
  assert.equal(isBootstrapUrl(`${ENDPOINT}?foo=bar`, ORIGIN), true);
  assert.equal(isBootstrapUrl('/edge-api/bootstrap/app_start', ORIGIN), true);
  assert.equal(isBootstrapUrl(new Request(`https://claude.ai${ENDPOINT}`), ORIGIN), true);
  for (const bad of [
    'https://example.net/edge-api/bootstrap/app_start',
    '/edge-api/bootstrap/not-a-uuid/app_start',
    '/edge-api/bootstrap/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/app_start_else',
    '/edge-api/bootstrap',
    '/edge-api/bootstrap/app_start/notmatching'
  ]) assert.equal(isBootstrapUrl(bad, ORIGIN), false, bad);
});

test('patches only defaultValue and boolean force; never mutates input', () => {
  const input = fixture();
  const untouched = structuredClone(input);
  const result = patchBootstrap(input);
  assert.equal(result.matched, 1);
  assert.equal(result.modifiedRules, 1);
  assert.equal(result.changed, true);
  assert.deepEqual(input, untouched);
  const def = result.value.deep.flags[FEATURE_ID];
  assert.equal(def.defaultValue, false);
  assert.equal(def.rules[0].force, false);
  assert.equal(def.rules[0].tracks[0].result.value, true);
  assert.equal(def.rules[1].force, false);
  assert.equal(def.rules[2].force, 'true');
  assert.deepEqual(result.value.unrelated, input.unrelated);
});

test('returns original reference unchanged on missing/malformed/already-false definitions', () => {
  for (const input of [
    { feature: { [FEATURE_ID]: { defaultValue: 'true', rules: [{ force: true }] } } },
    { feature: { [FEATURE_ID]: { defaultValue: true, rules: [{ force: 1 }] } } },
    { irrelevant: FEATURE_ID },
    { feature: { [FEATURE_ID]: { defaultValue: false, rules: [{ force: false }] } } }
  ]) {
    const result = patchBootstrap(input);
    assert.equal(result.changed, false);
    assert.strictEqual(result.value, input);
  }
});

test('handles nested arrays, two definitions, and multiple force rules', () => {
  const one = fixture().deep.flags;
  const input = { one, two: [{ [FEATURE_ID]: { defaultValue: true, rules: [{ force: true }, { force: true }] } }] };
  const result = patchBootstrap(input);
  assert.equal(result.matched, 2);
  assert.equal(result.modifiedRules, 3);
  assert.equal(input.two[0][FEATURE_ID].rules[0].force, true);
  assert.equal(result.value.two[0][FEATURE_ID].rules[1].force, false);
});

function makeScope(handler) {
  let calls = 0;
  const scope = {
    location: { href: ORIGIN },
    async fetch(...args) { calls++; return handler(...args); }
  };
  return { scope, getCalls: () => calls };
}

test('intercepts matching responses, retains status/headers, preserves original response', async () => {
  const input = fixture();
  const source = new Response(JSON.stringify(input), {
    status: 200,
    headers: { 'content-type': 'application/json', etag: 'obsolete', 'x-custom': 'keep' }
  });
  const { scope, getCalls } = makeScope(() => source);
  const state = installFetchHook(scope);
  assert.strictEqual(installFetchHook(scope), state);
  const result = await scope.fetch(ENDPOINT);
  const output = await result.json();
  assert.equal(output.deep.flags[FEATURE_ID].defaultValue, false);
  assert.equal(source.headers.get('etag'), 'obsolete');
  assert.equal(result.headers.get('etag'), null);
  assert.equal(result.headers.get('x-custom'), 'keep');
  assert.equal(source.bodyUsed, false);
  assert.equal(state.patched, 1);
  assert.equal(getCalls(), 1);
  assert.equal(scope[STATE_KEY], state);
});

test('passes through irrelevant, bad JSON, failed HTTP, and absent feature responses', async () => {
  const responses = [
    new Response('not-json'),
    new Response('{}'),
    new Response('failure', { status: 500 })
  ];
  const { scope } = makeScope(() => responses.shift());
  const state = installFetchHook(scope);
  const originalFetch = scope.fetch;
  const a = await scope.fetch(ENDPOINT);
  assert.equal(await a.text(), 'not-json');
  const b = await scope.fetch(ENDPOINT);
  assert.equal(await b.text(), '{}');
  const c = await scope.fetch(ENDPOINT);
  assert.equal(c.status, 500);
  assert.strictEqual(scope.fetch, originalFetch);
  assert.equal(state.patched, 0);
});

test('does not touch other fetch requests', async () => {
  const expected = new Response('plain');
  const { scope } = makeScope(() => expected);
  installFetchHook(scope);
  assert.strictEqual(await scope.fetch('/api/anything-else'), expected);
});
