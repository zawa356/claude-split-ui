# Claude Split UI (unofficial)

> **Experimental / Not affiliated with or endorsed by Anthropic.**
>
> Restores the separate **Chat / Cowork** interface on supported versions of Claude by locally adjusting a client-side bootstrap feature flag. It does **not** grant new account entitlements or restore historical local runtimes.

**Status (2026-10-09): Firefox MV3 proof of concept tested successfully.** Chrome, WXT, and the Electron desktop patcher are **not yet implemented or validated** in this repository.

## Confirmed result

In a tested Claude Web account, setting the GrowthBook feature definition `1174351393` to `defaultValue=false` and its Boolean `rules[].force=false` in the `/edge-api/bootstrap/.../app_start` response restored the separate Chat / Cowork selector. A/B/A/B manual tests confirmed repeatability. The Firefox MV3 extension reproduced the split view without using DevTools Network Override; removing it and refreshing returned to the unified UI.

A basic file-generation task was completed after selecting Cowork, but this does **not** prove that any older local execution environment has been restored.

## Try the verified Firefox PoC

1. Download or clone the repository.
2. In Firefox, go to `about:debugging#/runtime/this-firefox`.
3. Choose **Load Temporary Add-on** and select `poc/firefox-mv3/manifest.json`.
4. Open `https://claude.ai/new`, reload, and check for a separate Chat / Cowork selector.
5. To revert, remove the temporary add-on and reload Claude.

No account response, session token, chat message, or authentication data is stored or transmitted by the PoC. It does not make additional network requests. It only modifies matching fetch responses in the local page context.

**Important:** The PoC runs in the page's `MAIN` world and is not security-hardened. Inspect the source before use. The upstream implementation may change at any time, and the feature flag may cease to exist.

## Repository structure

| Directory | Purpose | Status |
|---|---|---|
| `poc/firefox-mv3/` | Original, tested baseline WebExtension | **Tested on Firefox 157.0.1** |
| `apps/browser-extension/` | WXT-based Firefox/Chromium extension | Planned |
| `apps/desktop-patcher/` | Claude Desktop Electron/ASAR patcher | Planned |
| `packages/core/` | Shared response transformation and tests | Planned |
| `docs/research/` | Reproducible technical findings | Initial report |
| `docs/handoff/` | Instructions for coding agents | Initial handoff |
| `.github/workflows/` | Tests, ZIP artifacts, prerelease packaging | Configured for verified PoC only |

## CI / release

- Push and PR: Node syntax checks, PoC smoke tests, manifest checks, sensitive-file checks, and Firefox PoC ZIP packaging.
- Tags `v*`: repeat checks, generate a checksum, and publish a **prerelease** ZIP through GitHub Releases.
- These checks do **not** imply browser runtime validation. Chrome and Desktop artifacts are intentionally **not** published yet.

For the current proof of concept:

```sh
npm run check
npm test
npm run build:poc
```

Node.js 22+ is required. The initial PoC build is dependency-free; a `pnpm-workspace.yaml` is in place for future WXT development.

## Responsible publication

**Never commit** a full HAR capture, `app_start` response, authenticated requests, JWTs, cookies, device IDs, or account-specific data. These may include credentials or private conversations. Keep local overrides outside the repository. Relevant findings are documented without authentic account identifiers.

The project only modifies behavior in the user's own client. It does not attempt to bypass server-side authorization or license checks.

## Roadmap

- [x] Identify and reproduce the feature flag's effect on split UI.
- [x] Verify Firefox MV3 content script interception of bootstrap response.
- [ ] Extract a tested, pure transformation function in `packages/core`.
- [ ] Implement WXT extension and verify **both** Firefox and Chrome (`document_start`, `MAIN` world timing).
- [ ] Add Playwright/browser integration tests where feasible.
- [ ] Implement backup/restore-safe Desktop patcher, with update compatibility checks.

## License

MIT. See [LICENSE](LICENSE).
