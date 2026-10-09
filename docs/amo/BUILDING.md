# Reviewer build instructions — Claude Split UI

This archive contains the publicly available source of the extension; it excludes any runtime credentials, HAR captures, account payloads or proprietary application code.

## Versions and environment

- Operating system: Ubuntu Linux (GitHub Actions uses ubuntu-latest)
- Node.js: 22
- pnpm: 10.15.0
- WXT: 0.21.4
- TypeScript: 5.9.3
- Extension version: the version in `apps/browser-extension/package.json` (identical in the submitted `manifest.json`)

The included pnpm-lock.yaml is generated during the submission CI job and added to this reviewer source archive. It captures the exact dependency graph used for that submission. The repository itself does not currently commit a lockfile; build reproducibility across future dependency resolutions is not guaranteed.

## Reproduce extension build

From the root of this source archive:

```sh
corepack enable
corepack prepare pnpm@10.15.0 --activate
pnpm install --frozen-lockfile
pnpm run build:firefox
node scripts/verify-wxt-build.mjs firefox
```

Output is in `apps/browser-extension/.output/firefox-mv3/`, containing `manifest.json` and the generated `content-scripts/claude.js`. Compare those files with the extension package submitted to AMO. There is no remote application source included.

The only site matched by the extension is `https://claude.ai/*`. It locally wraps page `fetch` for matching bootstrap responses, sets the observed UI flag to false, and leaves unrelated responses unchanged. The extension has no background worker, no network telemetry, and no data storage. It does not bypass server authorization.

Please see `README.md`, `docs/PRIVACY.md`, and `packages/core/src/index.mjs` for the behavior and limitations.

Project: https://github.com/zawa356/claude-split-ui
