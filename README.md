<div align="center">

# Claude Split UI

**Bring back the separate Chat / Cowork interface — experimentally.**

[English](README.md) · [日本語](docs/i18n/README.ja.md)

[Quick start](#quick-start--firefox-poc) · [Status](#project-status) · [FAQ](docs/FAQ.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

> [!WARNING]
> **Unofficial experimental project.** Not affiliated with, sponsored by, or endorsed by Anthropic. The underlying feature is undocumented and may stop working at any time.

</div>

## Why this exists

Claude's web interface changed from separate **Chat** and **Cowork** modes to a unified interface. This project investigates a narrow, reversible **client-side** change that restores the separate selector in tested versions. It does **not** unlock subscriptions, bypass authorization, or recreate desktop-only capabilities.

## Project status

| Target | Status | What is actually verified |
| :-- | :-- | :-- |
| Firefox — original MV3 PoC | **Manually verified** | Split selector appears after installing and reloading; unified UI returns after removing and reloading |
| Firefox — WXT extension | **Experimental** | Builds in CI; browser A/B/A validation pending |
| Chrome — WXT extension | **Experimental** | Builds in CI; browser A/B/A validation pending |
| Claude Desktop — Electron | **Planned** | No usable patcher or release |

> [!NOTE]
> A successful CI build is **not** proof of runtime compatibility. Check the [Actions page](https://github.com/zawa356/claude-split-ui/actions) for the latest result.

## Quick start — Firefox PoC

**Requirements:** Firefox 128+ (manually tested with Firefox 157.0.1), access to Claude Web, and a local checkout or extracted source ZIP. No Node.js is needed for this PoC.

1. [Download the repository ZIP](https://github.com/zawa356/claude-split-ui/archive/refs/heads/main.zip) and extract it, or clone this repository.
2. In Firefox, open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…** and select `poc/firefox-mv3/manifest.json`.
4. Open [Claude Web](https://claude.ai/new) and reload the page.
5. Look for the separate **Chat / Cowork** selector. The exact appearance may differ by account and upstream release.

**Undo:** Remove the temporary add-on from `about:debugging` and reload Claude. The source files remain untouched.

**If it does not work:** Confirm that a Firefox DevTools Network Override is not active, reload, and consult [Troubleshooting](docs/FAQ.md#troubleshooting). Never upload a full HAR, raw bootstrap response, cookie, or authenticated request to an issue.

> [!IMPORTANT]
> This PoC executes in the page's MAIN world and is intended for informed testers. Inspect the code before loading it. Temporary add-ons disappear when Firefox is restarted.

## How it works

```text
Claude Web → same-origin bootstrap fetch
           → local response wrapper (in your browser)
           → feature 1174351393: defaultValue=false; Boolean rules[].force=false
           → original page renders with split Chat / Cowork selector
```

Only a matching bootstrap response is considered. Other fetches and unknown response formats pass through. The project does not collect telemetry, transmit response bodies, or save authentication material.

[Technical notes](docs/research/wxt-migration.md) · [Privacy policy](docs/PRIVACY.md)

## For developers

**Requirements:** Node.js 22+, pnpm 10.x for WXT builds.

```sh
npm run check
npm test
npm run build:poc
```

To build the **unverified** WXT variants:

```sh
corepack enable
pnpm install --no-frozen-lockfile
pnpm run build:firefox
pnpm run build:chrome
```

See [Development](docs/DEVELOPMENT.md) for build outputs, verification steps and limitations.

## Project layout

| Path | Purpose |
| :-- | :-- |
| `poc/firefox-mv3/` | Manually verified reference PoC |
| `apps/browser-extension/` | Shared WXT Firefox / Chrome implementation, not yet browser-validated |
| `packages/core/` | Bootstrap transformation and tests |
| `apps/desktop-patcher/` | Future Electron patcher |
| `docs/` | Research, troubleshooting, development and translations |

## Roadmap

- [x] Identify the relevant bootstrap feature and verify the UI difference
- [x] Verify a reversible Firefox MV3 PoC
- [x] Implement shared core and WXT build candidates
- [ ] Validate WXT Firefox in a real browser
- [ ] Validate WXT Chrome in a real browser
- [ ] Add browser-level regression tests
- [ ] Design, implement and validate a reversible Desktop patcher

## Community and license

Contributions and reproducible reports are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md) before posting.

MIT license — see [LICENSE](LICENSE). **Anthropic and Claude are trademarks of their respective owners.**

---

<sub>Independent research project · No official affiliation · No guarantees of compatibility</sub>
