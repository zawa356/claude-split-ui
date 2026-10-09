# Claude Split UI: Firefox MV3 early-bootstrap PoC

A short-lived, local-only WebExtension experiment. It adds a `document_start` script in `MAIN` world for https://claude.ai only, intercepts exactly `/edge-api/bootstrap[/<UUID>]/app_start`, parses the current server JSON *in memory*, changes the GrowthBook definition of feature `1174351393` to `defaultValue=false` and `rules[].force=false`, then gives the modified JSON back to Claude. All other requests pass through untouched.

It DOES NOT save the response, session tokens, account data, or chat messages. It makes no network requests of its own. It logs only installation/patched counts, not response content. This is not a hardened production extension.

## Install temporarily
1. Extract the ZIP to a local directory.
2. In Firefox, open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...** and choose the extracted `manifest.json`.
4. Go to `https://claude.ai/new` and reload the tab with Ctrl+Shift+R.
5. Check whether Chat / Cowork selection UI returned.
6. In the Claude page DevTools console, inspect `window.__CLAUDE_SPLIT_POC_STATE__` to see `installed`, `intercepted`, `patched`, and `lastResult`. Do not paste auth-bearing response data.

## Revert
- Return to `about:debugging#/runtime/this-firefox` and click Remove for this extension. Refresh Claude. The extension is temporary, so restarting Firefox also removes it.
- Make sure the earlier Firefox Network Override for `app_start` remains removed to avoid conflicts.

## Known risks/limitations
- The page may change the bootstrap path, response schema, or when the initial fetch starts. The patch then fails open and forwards the original response.
- A newly constructed `Response` may differ subtly from the original in metadata/clone behavior; this must be validated against live Claude use.
- `MAIN` world can be seen and changed by page scripts. Do not put secrets or privileged extension APIs in it.
- This is meant for Firefox MV3; WXT Firefox's usual default is MV2 and requires separate timing tests or an explicit MV3 target. Do not assume the same extension code works in every browser without a separate build/test.
