# Claude Desktop (Electron) — proof of concept (2026-10-09)

## Result

The split Chat / Cowork selector was restored in Claude Desktop for Windows by loading the WXT Chrome content script through Claude Desktop's React DevTools extension slot. A/B/A on one machine:

| Step | Slot contents | UI after full Claude restart | Hook state |
|---|---|---|---|
| A (baseline) | claude_ctrl-enter 0.3.0 only | Unified | — |
| B | claude_ctrl-enter 0.3.0 + split-ui content script (first entry) | **Split** (Chat / Cowork toggle next to `+` in the composer) | `intercepted: 1, patched: 1, modifiedRules: 1` |
| A | claude_ctrl-enter 0.3.0 only (restored from backup) | Unified | `undefined` |

claude_ctrl-enter kept working in all steps (sidebar label shown, Enter / Ctrl+Enter behaviour unchanged), so both tools can share the one slot.

Selecting Cowork showed the Cowork composer and task list. This does **not** demonstrate that any older Cowork runtime was restored.

## Environment

- Claude Desktop 2.31226.0.0 (MSIX, Windows 11), Electron 44.4.3, Chrome 152.0.7977.130.
- Content script: `content-scripts/claude.js` from the CI-built release asset `claude-split-ui-0.1.1-chrome.zip` (checksum verified against `SHA256SUMS.txt`), unchanged.
- Development VM; manual restart by the user (no tool closes Claude).

## How the content script reaches the page

Read-only inspection of `app.asar` (not copied, not committed):

1. When the user environment variable `REACT_PROFILE` equals `1`, the main process awaits `loadReactDevTools()` **before** it creates the main window.
2. `loadReactDevTools()` uses the bundled `electron-devtools-installer` with the React DevTools ID `fmkadmapgofadopljbjfkapdkoienihi`. If `%APPDATA%\Claude\extensions\<that ID>` already exists it calls `session.defaultSession.loadExtension()` on it. (The only fallback reads a macOS Chrome profile path.) Exactly **one** extension can be loaded this way.
3. The main window shows the real `https://claude.ai` origin in the default session, so a manifest content script with `matches: ["https://claude.ai/*"]`, `run_at: document_start`, `world: MAIN` runs before Claude's inline bootstrap preload.
4. The page's inline preload uses `window.fetch` for `/edge-api/bootstrap/<uuid>/app_start`, so `installFetchHook` from `packages/core` patches it exactly as in browsers.

Other observations:

- The feature ID `1174351393` does not appear in `app.asar`; the flag is evaluated by the remote web app.
- No main-process code rewrites claude.ai response bodies. `/api/bootstrap/.../app_start` appears only in a handler for the `app://localhost` "custom-3p" mode, which ordinary claude.ai sessions don't use.
- Resource Timing did not list `app_start` after load (entries were presumably dropped). The hook state counters are the reliable signal.

## Rejected approaches

- Patching `app.asar`: the MSIX package is signed and installed under `WindowsApps`, which users cannot write to. This supersedes the ASAR-based [desktop patcher design](../desktop-patcher-design.md).
- Launch flags / remote debugging, `NODE_OPTIONS`: the claude_ctrl-enter project found that Claude rejects these approaches (debug arguments are refused; the Node options fuse is disabled).

## Consequence

Because the slot holds one extension, split-ui and claude_ctrl-enter must share it. This is solved by the separate [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) loader. Each tool keeps a plain MV3 extension folder, the same unit that [Claude-WebExtension-Launcher](https://github.com/lugia19/Claude-WebExtension-Launcher) uses, and the loader generates the slot from all of them.

## Follow-up: installation through the loader (2026-10-09)

Same machine, Claude 2.31226. claude-desktop-webext `e39289f` was used:

1. It took over the existing claude_ctrl-enter 0.3.0 slot. The old folder moved to the loader's backups, and the existing `REACT_PROFILE=1` was adopted.
2. It installed `claude-split-ui` (v0.1.1 Chrome build, order 10).

After a full restart, the user confirmed:

- the split Chat / Cowork selector
- claude_ctrl-enter's sidebar label, saved settings, Enter newline and Ctrl+Enter send

The hook state was `intercepted: 1, patched: 1`.
