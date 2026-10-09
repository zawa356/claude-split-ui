# Browser extension — Firefox and Chrome (WXT MV3)

WXT/TypeScript implementation for Firefox MV3 and Chromium MV3. Shared narrow bootstrap feature transformation lives in `../../packages/core/`.

- **Basic real-browser test passed (both targets):** enable extension and reload Claude → split Chat/Cowork selector; remove/disable and reload → original unified UI.
- Automated synthetic tests cover Chromium unpacked installation and Firefox generated-script engine behavior; they do **not** test a real Firefox add-on installation in automation.
- More extensive Cowork functionality, account variations, upstream compatibility, and store approvals remain unverified.
- The original reference `../../poc/firefox-mv3/` remains available.
- The Chrome build (`.output/chrome-mv3`) is also the Claude Desktop extension. `../desktop/` packages it with the claude-desktop-webext loader.

See [root README](../../README.md) for current release downloads and installation. For developer builds:

```sh
corepack enable
pnpm install --no-frozen-lockfile
pnpm run build:firefox
pnpm run build:chrome
pnpm run zip:firefox
pnpm run zip:chrome
```

The Firefox AMO publishing preparation and instructions are in [docs/amo/AMO.md](../../docs/amo/AMO.md). It has **not** been submitted to or approved by Mozilla yet. No login cookies or network data are stored or transmitted.
