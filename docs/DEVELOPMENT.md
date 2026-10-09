# Development guide

[English](DEVELOPMENT.md) · [日本語](i18n/DEVELOPMENT.ja.md)

## Requirements

- Node.js 22 or later
- pnpm 10.x (via Corepack or local installation) for WXT
- Firefox 128+ for the manually verified temporary-add-on PoC

## Commands

```sh
npm run check
npm test
npm run build:poc
corepack enable
pnpm install --no-frozen-lockfile
pnpm run build:firefox
pnpm run build:chrome
```

CI checks the generated MV3 manifest for the expected same-origin match, MAIN world and document_start. Build output is under `apps/browser-extension/.output/`. The WXT builds are **not yet browser validated**.

## Architecture

- `poc/firefox-mv3/`: original, manually verified reference implementation; preserve it for regression testing.
- `packages/core/`: narrow, fail-open transformation of the observed feature definition.
- `apps/browser-extension/`: WXT entrypoint and browser builds.
- `apps/desktop-patcher/`: future reversible Electron/ASAR patcher.

## Testing and reporting

Use synthetic fixture data in automated tests. Never commit or paste actual HARs, bootstrap JSON, cookies, tokens, account identifiers or private conversation content. Report browser version, extension commit SHA, whether DevTools Network Override was disabled, and the UI result **without** attaching raw responses.

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md). Changes should be submitted by pull request and must not claim browser runtime support solely because CI passed.
