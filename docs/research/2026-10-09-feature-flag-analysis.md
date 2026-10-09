# Claude Chat / Cowork split UI — investigation (2026-10-09)

## Scope and provenance

User-driven manual testing using Firefox DevTools, a local Network Override, a captured bootstrap document, and an experimental Firefox MV3 extension. Only non-secret technical details are recorded here. Raw HAR/JSON files must **not** be added to this repository.

Test environment: Firefox 157.0.1, `https://claude.ai/new`, integrated Chat/Cowork UI at baseline. Browser Build ID observed: `0a9973a010` (subject to change).

## Direct observations

1. On initial load, the page requests a same-origin endpoint resembling `GET /edge-api/bootstrap/{organization-uuid}/app_start?statsig_hashing_algorithm=djb2&growthbook_format=sdk&...`.
2. The HTML document has an inline bootstrap preload script that calls `fetch(path, { credentials: "include", headers: ... })` and assigns its Promise to `window.__BOOTSTRAP_PRELOAD__.promise`. This is executed early, **before** the external module script. A content-script interception hook must therefore be installed before the inline preload runs.
3. The JSON includes a GrowthBook feature definition at key `1174351393` with `defaultValue: true` and a Boolean `rules[].force: true`. An experiment-related record referenced this numeric feature ID, but was **not changed** during the test.
4. Editing only `defaultValue: false` and `rules[].force: false` in the feature definition through Firefox Network Override restored the separate Chat / Cowork selector and separate-looking navigation/history display.
5. Controlled toggles: baseline true/true -> unified; false/false -> split; false/true -> unified; false/false -> split. These observations support that `force` takes precedence over `defaultValue` for this test case.
6. Clicking Cowork displayed the Cowork-specific screen; the browser route was reported as `/cowork/`. A simple Markdown file-generation request completed, but does not prove that an older local Cowork runtime was restored.
7. A Firefox MV3 WebExtension with a `document_start`, `MAIN` world `fetch()` wrapper patched the latest live bootstrap response in memory. Its installation + page reload produced split UI; removal + page reload restored unified UI. DevTools Network Override was removed before this experiment.

## Key technical details

- Matched endpoint: `^/edge-api/bootstrap/(?:UUID/)?app_start/?$` on the same origin.
- Target feature ID: `1174351393` (observed 2026-10-09; unofficial, unstable).
- Transform on a valid feature definition: set Boolean `rules[].force = false`; set `defaultValue = false`.
- Preserve the entire latest response except for this feature definition; use fail-open semantics when missing or malformed.
- The original inline script creates `window.__BOOTSTRAP_PRELOAD__`; wrapping `fetch()` after DOMContentLoaded is too late.

## Evidence and limits

| Finding | Confidence | Scope |
|---|---|---|
| A/B/A/B feature toggle changes visible UI | High | One tested account/build/browser |
| Firefox MV3 extension restores split UI | High | One tested Firefox environment |
| The mode selector routes to `/cowork/` | High | User-observed route after UI switch |
| The historical Cowork runtime is active | **Not demonstrated** | File creation alone is insufficient |
| Chromium MV3 supports the same early injection | **Not yet tested** at the time of this report; later verified with the WXT Chrome build ([WXT notes](wxt-migration.md)) | Must test |
| Electron desktop app can use the same early hook | **Not yet tested** at the time of this report; later verified on Claude Desktop 2.31226 for Windows ([Desktop PoC](2026-10-09-desktop-poc.md)) | Depends on Electron boot sequence |
| Feature flag will remain available | **Unknown** | Upstream may change silently |

## Hypotheses not elevated to facts

- `classic_mode_available`, `showCoworkTab`, and `sidebar: "combined"` were also observed, but are **not** shown to be the controlling variables. The successful patch did not modify them.
- Separate Chat and Cowork may still share portions of the new underlying backend. Do not advertise a restoration of older backend entitlements without evidence.

## Reproduction / rollback

See `poc/firefox-mv3/README.md`. For production evolution, never ship a frozen authenticated bootstrap JSON; patch live response bytes in memory.
