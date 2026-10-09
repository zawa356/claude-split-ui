# Contributing

Thank you for helping improve this experimental project.

**Languages:** English and Japanese are welcome in issues and pull requests. Main documentation is in [English](README.md) and [Japanese](docs/i18n/README.ja.md).

## Before contributing

1. Check the [roadmap](README.md#roadmap) and existing issues.
2. Keep changes narrow, reversible and easy to review.
3. Never post HAR files, authenticated bootstrap payloads, cookies, credentials, user identifiers or private conversation content.
4. Avoid claiming official affiliation with Anthropic or implying subscription bypass.

## Development

Use Node.js 22+ and pnpm 10.x for WXT builds. Clone with `--recurse-submodules`, because the Claude Desktop loader is the submodule `vendor/claude-desktop-webext`. Fix loader issues upstream in [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext). See the [Development guide](docs/DEVELOPMENT.md).

```sh
git submodule update --init
npm run check
npm test
npm run build:poc
corepack enable
pnpm install --no-frozen-lockfile
pnpm run build:firefox
pnpm run build:chrome
```

## Pull requests

Describe the motivation, the affected targets (Firefox, Chrome, Claude Desktop), the verification method and the rollback. Preserve the original Firefox PoC as a known-good baseline. When changing public behavior, update both README translations and the FAQ as appropriate. WXT Firefox and Chrome have passed a **basic real-browser split/restore smoke test**; do not overstate this as full-feature validation or perpetual compatibility.

Use synthetic data for regression tests. The project does not accept proprietary Claude application archives, copied vendor source, or secrets.

## Responsible disclosure

See [SECURITY.md](SECURITY.md). Do not open a public issue containing sensitive exploit or authentication details.
