# Claude Desktop package

Claude Desktop (Electron) support. Nothing here patches Claude. The WXT **Chrome** build is installed through [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) (submodule `vendor/claude-desktop-webext`, pinned to a loader commit). That loader merges plain MV3 extensions into the single extension slot that Claude Desktop loads when `REACT_PROFILE=1`. This extension can therefore coexist with other tools built on the same loader, for example [claude_ctrl-enter](https://github.com/zawa356/claude_ctrl-enter) 0.4 and later.

- `desktop-webext.json`: loader config. `order: 10` puts the bootstrap fetch hook before other tools' scripts. `testedClaudeVersions` lists the manually checked Claude versions; other versions only produce a warning.
- Release asset: `claude-split-ui-<version>-desktop.zip`. CI builds it with `vendor/claude-desktop-webext/tools/package.mjs`. It contains `install` / `uninstall` / `diagnose` / `repair` scripts for Windows (`.bat`) and Linux (`.sh`, needs python3 ≥ 3.8).

Verified: Windows 11, Claude Desktop 2.31226 (Microsoft Store). The split UI appears after installing and restarting Claude, the unified UI returns after removal, and the extension works alongside claude_ctrl-enter 0.4. Linux is untested. Details: [Desktop PoC report](../../docs/research/2026-10-09-desktop-poc.md).

Local install from a checkout (after `pnpm run build:chrome`):

```powershell
git submodule update --init
powershell -ExecutionPolicy Bypass -File vendor\claude-desktop-webext\bin\webext.ps1 -Action install -Config apps\desktop\desktop-webext.json
```

## Installation discovery (development version)

The updated loader discovers MSIX and classic installations through package, process,
registry and standard-path information. If several candidates remain, specify
`diagnose.bat -ClaudePath "D:\Apps\Claude\claude.exe"` (also accepted by install,
uninstall and repair). On Linux use `--claude-path` with the executable, directory or
app.asar. Detection does not prove runtime support; classic Windows builds remain
unverified. MSIX virtual-only user data no longer blocks installation. The existing
extension slot location is preserved, and virtualized slot conflicts still stop changes.
