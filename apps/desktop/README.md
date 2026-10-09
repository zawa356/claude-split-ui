# Claude Desktop package

Claude Desktop (Electron) support. Nothing here patches Claude: the WXT **Chrome** build is installed through [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) (submodule `vendor/claude-desktop-webext`). That loader merges plain MV3 extensions into the single extension slot that Claude Desktop loads when `REACT_PROFILE=1`, so this extension can coexist with other tools built on the same loader (for example claude_ctrl-enter ≥ 0.4).

- `desktop-webext.json`: loader config. `order: 10` puts the bootstrap fetch hook before other tools' scripts.
- Release asset: `claude-split-ui-<version>-desktop.zip`, built in CI by `vendor/claude-desktop-webext/tools/package.mjs`.

Local install from a checkout (after `pnpm run build:chrome`):

```powershell
git submodule update --init
powershell -ExecutionPolicy Bypass -File vendor\claude-desktop-webext\bin\webext.ps1 -Action install -Config apps\desktop\desktop-webext.json
```

Manual verification: [Desktop PoC report](../../docs/research/2026-10-09-desktop-poc.md).
