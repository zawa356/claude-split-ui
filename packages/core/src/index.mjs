/**
 * Tiny, dependency-free bootstrap response patcher.
 * Intended ONLY for data returned to the owner's browser by Claude.
 * No authentication material, actual bootstrap payload, or network access.
 */
export const FEATURE_ID = '1174351393';
export const STATE_KEY = '__CLAUDE_SPLIT_PATCH_STATE__';

const APP_START_PATH = /^\/edge-api\/bootstrap\/(?:[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\/)?app_start\/?$/i;

/** Match the observed same-origin endpoint, without embedding account IDs. */
export function isBootstrapUrl(input, baseUrl) {
  try {
    const url = new URL(input instanceof Request ? input.url : String(input), baseUrl);
    return url.origin === new URL(baseUrl).origin && APP_START_PATH.test(url.pathname);
  } catch {
    return false;
  }
}

const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

function eligible(definition) {
  return definition !== null && typeof definition === 'object' &&
    !Array.isArray(definition) && typeof definition.defaultValue === 'boolean' &&
    Array.isArray(definition.rules) && definition.rules.some(rule =>
      rule && typeof rule === 'object' && own(rule, 'force') && typeof rule.force === 'boolean');
}

/**
 * Traverse just JSON-like objects. Skip duplicate references, and never
 * interpret a string which happens to contain a feature ID as a flag.
 */
function visitDefinitions(root, visitor) {
  const stack = [root];
  const seen = new WeakSet();
  while (stack.length) {
    const node = stack.pop();
    if (node === null || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);
    if (own(node, FEATURE_ID) && eligible(node[FEATURE_ID])) visitor(node[FEATURE_ID]);
    for (const child of Object.values(node)) {
      if (child !== null && typeof child === 'object') stack.push(child);
    }
  }
}

/**
 * Return a non-mutating transformation of a parsed JSON value. No changes to
 * variation, track, account entitlements, or any other features.
 *
 * @returns {{value: any, matched: number, modifiedRules: number, changed: boolean}}
 */
export function patchBootstrap(root) {
  let matched = 0;
  let changesNeeded = false;
  visitDefinitions(root, definition => {
    matched++;
    if (definition.defaultValue !== false || definition.rules.some(rule =>
      rule && typeof rule.force === 'boolean' && rule.force !== false)) changesNeeded = true;
  });

  if (!changesNeeded) return { value: root, matched, modifiedRules: 0, changed: false };

  // Avoid ever mutating a caller-owned object, including nested metadata.
  // Bootstrap data originates from JSON.parse, so structuredClone is suitable.
  const copy = structuredClone(root);
  let modifiedRules = 0;
  visitDefinitions(copy, definition => {
    definition.defaultValue = false;
    for (const rule of definition.rules) {
      if (rule && typeof rule.force === 'boolean' && rule.force !== false) {
        rule.force = false;
        modifiedRules++;
      }
    }
  });
  return { value: copy, matched, modifiedRules, changed: true };
}

function mirrorResponseMetadata(replacement, source) {
  for (const name of ['url', 'redirected', 'type']) {
    try {
      Object.defineProperty(replacement, name, {
        configurable: true,
        get: () => source[name]
      });
    } catch { /* Best-effort compatibility; the modified body is authoritative. */ }
  }
  return replacement;
}

/**
 * Wrap exactly the fetch method of a MAIN-world window-like object.
 * Fail open on unknown payload/format or decoding errors.
 */
export function installFetchHook(scope) {
  if (scope[STATE_KEY]?.installed) return scope[STATE_KEY];
  if (typeof scope.fetch !== 'function') return null;
  const originalFetch = scope.fetch;
  const state = {
    installed: true,
    intercepted: 0,
    patched: 0,
    lastResult: 'waiting',
    modifiedRules: 0
  };
  Object.defineProperty(scope, STATE_KEY, {
    configurable: false,
    writable: false,
    value: state
  });

  scope.fetch = function(...args) {
    if (!isBootstrapUrl(args[0], scope.location.href)) {
      return Reflect.apply(originalFetch, this, args);
    }
    state.intercepted++;
    return Reflect.apply(originalFetch, this, args).then(async response => {
      if (!response.ok) {
        state.lastResult = `HTTP ${response.status}: passthrough`;
        return response;
      }
      try {
        const original = await response.clone().json();
        const patched = patchBootstrap(original);
        if (!patched.changed) {
          state.lastResult = patched.matched ? 'already disabled' : 'feature absent';
          return response;
        }
        const headers = new Headers(response.headers);
        for (const name of [
          'content-length', 'content-encoding', 'transfer-encoding',
          'etag', 'content-md5', 'digest', 'content-digest'
        ]) headers.delete(name);
        const replacement = new Response(JSON.stringify(patched.value), {
          status: response.status,
          statusText: response.statusText,
          headers
        });
        state.patched++;
        state.modifiedRules = patched.modifiedRules;
        state.lastResult = 'patched';
        // Logs contain counts only, never response bodies or account data.
        console.info('[Claude Split UI] bootstrap flag patched');
        return mirrorResponseMetadata(replacement, response);
      } catch (error) {
        state.lastResult = `passthrough: ${error?.name ?? 'unknown error'}`;
        return response;
      }
    });
  };
  return state;
}
