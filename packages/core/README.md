# Shared core

Dependency-free implementation of the bootstrap transformation, used by every target: the WXT Firefox and Chrome builds, and through the Chrome build also the Claude Desktop package.

- `src/index.mjs` (types in `src/index.d.mts`):
  - `isBootstrapUrl(input, baseUrl)`: same-origin `/edge-api/bootstrap/[<uuid>/]app_start` only.
  - `patchBootstrap(root)`: returns a modified **copy** in which feature `1174351393` has `defaultValue=false` and every Boolean `rules[].force=false`, plus `matched` / `modifiedRules` / `changed`. Unknown shapes are returned unchanged.
  - `installFetchHook(scope)`: wraps `fetch` in the page's MAIN world. On a non-OK status, a parse error or a missing feature it passes the original response through. Its state is exposed as `window.__CLAUDE_SPLIT_PATCH_STATE__` (counts only, never response content).
- `tests/patch.test.mjs`: synthetic fixtures only (`node --test`, part of `npm test`).

Never log or persist bootstrap response content.
