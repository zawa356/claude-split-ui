/*
 * Claude Split UI - Bootstrap PoC (Firefox MV3)
 * The only intended behavior is to set GrowthBook feature 1174351393
 * defaultValue and boolean rules[].force to false, using the current
 * server response for everything else.
 * No auth/session data is stored, transmitted, or logged by this PoC.
 */
(() => {
  'use strict';

  const FEATURE_ID = '1174351393';
  const MARKER = '[Claude Split PoC]';
  const STATE_KEY = '__CLAUDE_SPLIT_POC_STATE__';
  if (window[STATE_KEY]?.installed) return;

  const state = {
    installed: true,
    intercepted: 0,
    patched: 0,
    lastResult: 'waiting for app_start',
    lastRuleCount: 0
  };
  Object.defineProperty(window, STATE_KEY, {
    value: state,
    writable: false,
    configurable: false
  });

  const nativeFetch = window.fetch;

  function targetsAppStart(input) {
    try {
      const rawUrl = input instanceof Request ? input.url : String(input);
      const url = new URL(rawUrl, location.href);
      return url.origin === location.origin &&
        /^\/edge-api\/bootstrap\/(?:[0-9a-f-]{36}\/)?app_start\/?$/i.test(url.pathname);
    } catch {
      return false;
    }
  }

  function patchFlag(root) {
    const stack = [root];
    const seen = new WeakSet();
    let matched = 0;
    let forcedRules = 0;

    while (stack.length) {
      const current = stack.pop();
      if (current === null || typeof current !== 'object' || seen.has(current)) continue;
      seen.add(current);

      if (Object.prototype.hasOwnProperty.call(current, FEATURE_ID)) {
        const definition = current[FEATURE_ID];
        if (definition && typeof definition === 'object' &&
            Object.prototype.hasOwnProperty.call(definition, 'defaultValue') &&
            Array.isArray(definition.rules)) {
          let thisRules = 0;
          for (const rule of definition.rules) {
            if (rule && Object.prototype.hasOwnProperty.call(rule, 'force') &&
                typeof rule.force === 'boolean') {
              rule.force = false;
              thisRules++;
            }
          }
          if (thisRules > 0) {
            definition.defaultValue = false;
            forcedRules += thisRules;
            matched++;
          }
        }
      }

      for (const child of Object.values(current)) {
        if (child && typeof child === 'object' && !seen.has(child)) {
          stack.push(child);
        }
      }
    }
    return { matched, forcedRules };
  }

  function preserveMetadata(replacement, original) {
    for (const prop of ['url', 'redirected', 'type']) {
      try {
        Object.defineProperty(replacement, prop, {
          configurable: true,
          get: () => original[prop]
        });
      } catch { /* Metadata is best-effort; Response body is authoritative. */ }
    }
    return replacement;
  }

  window.fetch = function(...args) {
    if (!targetsAppStart(args[0])) {
      return Reflect.apply(nativeFetch, this, args);
    }
    state.intercepted++;
    return Reflect.apply(nativeFetch, this, args).then(async (response) => {
      if (!response.ok) {
        state.lastResult = `HTTP ${response.status}: passthrough`;
        return response;
      }

      try {
        const bootstrap = await response.clone().json();
        const { matched, forcedRules } = patchFlag(bootstrap);
        if (matched === 0) {
          state.lastResult = 'feature definition not found: passthrough';
          console.warn(MARKER, state.lastResult);
          return response;
        }

        const headers = new Headers(response.headers);
        // Body is re-serialized as plain JSON. Remove stale transport metadata.
        for (const name of ['content-length', 'content-encoding', 'transfer-encoding']) {
          headers.delete(name);
        }

        const replacement = preserveMetadata(
          new Response(JSON.stringify(bootstrap), {
            status: response.status,
            statusText: response.statusText,
            headers
          }),
          response
        );
        state.patched++;
        state.lastRuleCount = forcedRules;
        state.lastResult = 'patched';
        console.info(MARKER, `patched ${matched} definition(s), ${forcedRules} rule(s)`);
        return replacement;
      } catch (error) {
        state.lastResult = `passthrough after error: ${error?.name || 'unknown'}`;
        console.warn(MARKER, state.lastResult);
        return response;
      }
    });
  };

  console.info(MARKER, 'fetch hook installed at', document.readyState);
})();
