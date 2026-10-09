# Development guide

[English](DEVELOPMENT.md) · [日本語](i18n/DEVELOPMENT.ja.md)

## Requirements

- Node.js 22 or later
- pnpm 10.x (via Corepack or local installation) for WXT
- Git submodules: clone with `--recurse-submodules`, or run `git submodule update --init`. The Claude Desktop loader lives in `vendor/claude-desktop-webext`.
- Firefox 128+ for the manually verified temporary-add-on PoC

## Commands

```sh
git submodule update --init
npm run check
npm test
npm run build:poc
corepack enable
pnpm install --no-frozen-lockfile
pnpm run build:firefox
pnpm run build:chrome
node vendor/claude-desktop-webext/tools/package.mjs --config apps/desktop/desktop-webext.json --extension apps/browser-extension/.output/chrome-mv3 --out dist/desktop/claude-split-ui-desktop
```

CI checks the generated MV3 manifest for the expected same-origin match, MAIN world and document_start. Build output is under `apps/browser-extension/.output/`. Both WXT browser targets passed a basic real-browser split/restore smoke test. The last command builds the Claude Desktop package from the Chrome build. It then verifies the package by installing it into a throw-away sandbox, using python3 or Windows PowerShell. Synthetic CI tests supplement but do not replace full feature coverage.

## Architecture

- `poc/firefox-mv3/`: original, manually verified reference implementation; preserve it for regression testing.
- `packages/core/`: narrow, fail-open transformation of the observed feature definition.
- `apps/browser-extension/`: WXT entrypoint and browser builds.
- `apps/desktop/`: Claude Desktop package configuration (`desktop-webext.json`). It reuses the WXT Chrome build. `order: 10` makes the fetch hook load before other tools' scripts.
- `vendor/claude-desktop-webext/`: shared Claude Desktop loader (git submodule, pinned to a release tag). Fix loader issues upstream in [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext), then bump the submodule.

## Releases

Pushing to `main` with a version that has no GitHub Release yet publishes one through `.github/workflows/release.yml`. The release contains the Firefox, Chrome and Desktop ZIPs and `SHA256SUMS.txt`.

To cut a release:

1. Bump the version in `package.json`, `apps/browser-extension/package.json` and `apps/browser-extension/wxt.config.ts`.
2. Add `docs/releases/v<version>.md`.

## Testing and reporting

Use synthetic fixture data in automated tests. Never commit or paste actual HARs, bootstrap JSON, cookies, tokens, account identifiers or private conversation content. Report the browser or Claude Desktop version, the extension commit SHA, whether DevTools Network Override was disabled, and the UI result **without** attaching raw responses.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md). Changes should be submitted by pull request and must not claim browser runtime support solely because CI passed.
