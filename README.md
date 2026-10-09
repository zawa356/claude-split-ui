<div align="center">

# Claude Split UI

**Bring back the separate Chat / Cowork interface — experimentally.**

[English](README.md) · [日本語](docs/i18n/README.ja.md)

[Quick start](#quick-start--firefox-and-chrome) · [Status](#project-status) · [FAQ](docs/FAQ.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

> [!WARNING]
> **Unofficial experimental project.** Not affiliated with, sponsored by, or endorsed by Anthropic. The underlying feature is undocumented and may stop working at any time.

</div>

## Why this exists

Claude's web interface changed from separate **Chat** and **Cowork** modes to a unified interface. This project investigates a narrow, reversible **client-side** change that restores the separate selector in tested versions. It does **not** unlock subscriptions, bypass authorization, or recreate desktop-only capabilities.

## Project status

| Target | Status | What is actually verified |
| :-- | :-- | :-- |
| Firefox — original MV3 PoC | **Manually verified** | Split selector appears after installing and reloading; unified UI returns after removing and reloading |
| Firefox — WXT extension | **Basic manual test passed** | Temporary installation restored split UI; removal and reload restored unified UI |
| Chrome — WXT extension | **Basic manual test passed** | Unpacked installation restored split UI; disabling and reload restored unified UI |
| Claude Desktop — Electron | **Planned** | No usable patcher or release |

> [!NOTE]
> A successful CI build is **not** proof of runtime compatibility. Check the [Actions page](https://github.com/zawa356/claude-split-ui/actions) for the latest result.

## Quick start — Firefox and Chrome

Both WXT builds passed a basic manual test on Claude Web: the Chat / Cowork selector appeared with the extension enabled, and the unified interface returned when it was removed/disabled and the page was reloaded. **These are developer/test installations, not signed store releases.**

1. Open the [successful GitHub Actions WXT build](https://github.com/zawa356/claude-split-ui/actions/runs/37882338338).
2. Under **Artifacts**, download `wxt-firefox-mv3-unverified` or `wxt-chrome-mv3-unverified` for your browser. GitHub sign-in may be required.
3. **Extract the downloaded artifact ZIP**, then extract the WXT-generated extension ZIP inside it. The innermost extension folder must contain `manifest.json` and `content-scripts/` at its top level.
4. **Firefox:** open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → choose `manifest.json` in the extracted extension folder. Temporary add-ons disappear after Firefox restarts.
5. **Chrome:** open `chrome://extensions/` → enable **Developer mode** → **Load unpacked** → select the extracted extension **folder** containing `manifest.json`.
6. Open [Claude Web](https://claude.ai/new) (or reload it). Confirm the separate Chat / Cowork selector appears.

**Undo:** In Firefox, remove the temporary add-on in `about:debugging`; in Chrome, switch off or remove the extension in `chrome://extensions/`. Reload Claude and confirm the unified interface returns.

**Limitations:** No Mozilla-signed XPI or Chrome Web Store release is available yet. ZIP-to-XPI renaming does not add a Mozilla signature. Only the basic split/restore UI flow has been manually checked; compatibility with other releases/accounts and all Cowork functionality is not guaranteed.

**Reference implementation:** If WXT fails, the earlier [Firefox PoC](poc/firefox-mv3/README.md) is retained for diagnostics. Never post authenticated HAR files or bootstrap payloads to GitHub issues.

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
| `apps/browser-extension/` | Shared WXT Firefox / Chrome implementation, basic manual A/B/A test passed |
| `packages/core/` | Bootstrap transformation and tests |
| `apps/desktop-patcher/` | Future Electron patcher |
| `docs/` | Research, troubleshooting, development and translations |

## Roadmap

- [x] Identify the relevant bootstrap feature and verify the UI difference
- [x] Verify a reversible Firefox MV3 PoC
- [x] Implement shared core and WXT build candidates
- [x] Validate basic split/restore flow of WXT Firefox in a real browser
- [x] Validate basic split/restore flow of WXT Chrome in a real browser
- [x] Add synthetic browser-engine regression tests (Chromium extension; Firefox generated script)
- [ ] Design, implement and validate a reversible Desktop patcher

## Community and license

Contributions and reproducible reports are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md) before posting.

MIT license — see [LICENSE](LICENSE). **Anthropic and Claude are trademarks of their respective owners.**

---

<sub>Independent research project · No official affiliation · No guarantees of compatibility</sub>
