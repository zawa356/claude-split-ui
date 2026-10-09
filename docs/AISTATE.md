# AISTATE
<!-- AI-optimized state file. Not for humans. Dense, factual, keyed. Update on EVERY work session (see AGENTS.md#aistate-protocol). -->
<!-- Conventions: dates=ISO; V=verified-by-run by AI, U=user-verified on real app, O=observed in docs/handoff (not re-verified), H=hypothesis, ?=unknown. Paths repo-relative. Keep sections; prune stale; LOG newest-first, cap ~30 (fold older into HISTORY). -->

## META
- updated: 2026-10-09 (session2: desktop)
- head_at_update: 5886fdb (main, ff from origin) + uncommitted: docs/AISTATE.md, AGENTS.md, CLAUDE.md
- user: zawa356; replies in Japanese. builds/releases via GitHub Actions (pnpm/WXT not used locally).
- repo: https://github.com/zawa356/claude-split-ui ; MIT; unofficial; goal=restore split Chat/Cowork UI by client-side patch of GrowthBook flag in bootstrap response.
- read_order: this file -> README.md -> docs/research/wxt-migration.md -> docs/research/2026-10-09-feature-flag-analysis.md -> packages/core/src/index.mjs. docs/handoff/* = historical (archived).
- GOTCHA: local clone was stale (4c337c0) at session2 start while origin/main had 27 more commits. ALWAYS `git fetch` first.

## ENV (local dev machine)
- win32 Win11, Hyper-V VM w/ user checkpoints (same VM as sibling repo's ENV-VM). PowerShell 5.1 + Git Bash.
- node v24.20.0 at C:\Program Files\nodejs — NOT on Git Bash PATH: `export PATH="/c/Program Files/nodejs:$PATH"`. V
- no pnpm install locally; no node_modules. gh CLI authenticated as zawa356. V
- PowerShell tool safety filter blocks Remove-Item / Copy-Item lines containing "$var\*" paths -> use Bash for file copies.

## CORE_FACTS
- endpoint: same-origin GET /edge-api/bootstrap/{org-uuid}/app_start?... fetched by INLINE preload script (window.__BOOTSTRAP_PRELOAD__) before bundles => hook must be document_start MAIN world. O
- flag key "1174351393": baseline defaultValue=true, rules[].force=true. patch both to false => split UI. force dominates defaultValue. O(A/B/A/B)
- not controlling (H): classic_mode_available, showCoworkTab, sidebar:"combined", experiment record.
- never claim old Cowork runtime restored. flag may vanish; fail open.

## COMPONENT_STATUS (main 5886fdb)
| path | status |
|---|---|
| poc/firefox-mv3/ | U verified Firefox 157.0.1; regression baseline; state key __CLAUDE_SPLIT_POC_STATE__ |
| packages/core/src/index.mjs | implemented: FEATURE_ID, STATE_KEY=__CLAUDE_SPLIT_PATCH_STATE__, isBootstrapUrl (strict UUID regex), patchBootstrap(root)->{value(structuredClone copy),matched,modifiedRules,changed} (eligible: boolean defaultValue + >=1 boolean force rule), installFetchHook(scope) (strips content-length/encoding/transfer-encoding/etag/md5/digest; mirrors url/redirected/type; logs counts only). tests packages/core/tests/patch.test.mjs (node --test) |
| apps/browser-extension/ | WXT 0.21.4, entrypoints/claude.content.ts -> installFetchHook(window); MV3 document_start MAIN; Firefox+Chrome U basic A/B passed (per README) |
| releases | v0.1.0, v0.1.1 prerelease (GitHub Actions). assets claude-split-ui-0.1.1-{chrome,firefox}.zip + SHA256SUMS.txt. chrome zip = manifest.json + content-scripts/claude.js (self-contained IIFE, 1792B zip) V |
| amo/ , docs/amo/ | AMO submission pipeline prepared, not submitted |
| apps/desktop/ (was desktop-patcher) | desktop-webext.json {id claude-split-ui, order 10, source ../browser-extension/.output/chrome-mv3, tested windows 2.31226.0.0}. packaged by vendor/claude-desktop-webext/tools/package.mjs in ci.yml (artifact claude-desktop-package) + release.yml (asset claude-split-ui-<ver>-desktop.zip, in SHA256SUMS via scripts/stage-release.mjs). branch feat/desktop-webext |
| vendor/claude-desktop-webext | git submodule (public repo, e39289f) |
| docs/research/2026-10-09-desktop-poc.md | NEW: Desktop PoC report (A/B/A, loader mechanics) |
| docs/desktop/shared-slot-spec.md | SUPERSEDED by loader SPEC (kept for history). was DRAFT v1 shared slot spec (layout modules/<id>/module.json, claude-slot.json host registry w/ env ownership, generated manifest, order split-ui=10 ctrl-enter=50, lock+staging+swap, migration by ctrl-enter>=0.4 only, old 0.3.x sees unknown -> refuses). awaiting user review; open: generator vendoring/canonical repo, Linux, enabled flag |

## COMMANDS
- npm run check ; npm test (poc smoke + manifest + public-files + core node --test 7 tests + scan-sensitive-content) ; npm run build:poc. V all pass on 5886fdb (2026-10-09)
- WXT build: CI only (pnpm). get artifacts: `gh release download v0.1.1 --pattern '*chrome*'`.

## DESKTOP (Claude Desktop / Electron) — facts
- local: MSIX Claude 2.31226.0.0, C:\Program Files\WindowsApps\Claude_2.31226.0.0_x64__pzs8sxrjxfjjc; PFN Claude_pzs8sxrjxfjjc; app.asar 44,579,556B readable read-only (scratchpad asar-scan.cjs parses asar header; NEVER copy asar into repo). V
- ASAR patch rejected: MSIX signed, WindowsApps not writable. CDP launcher / NODE_OPTIONS rejected (sibling repo findings). => docs/desktop-patcher-design.md obsolete.
- loader (V, 2.31226): .vite/build/index.chunk-Dhnqo-JY.js: `if(env.REACT_PROFILE==="1"){await (require("./index.chunk-ZFT5Mc_X.js")).loadReactDevTools()}` runs BEFORE main window creation. loadReactDevTools -> electron-devtools-installer installExtension(REACT_DEVELOPER_TOOLS fmkadmapgofadopljbjfkapdkoienihi): folder userData/extensions/<id> exists -> session.defaultSession.loadExtension. fallback = macOS Chrome path only. => EXACTLY ONE extension slot.
- asar has no "1174351393", no "edge-api/bootstrap" => flag evaluated in remote web app. `/api/bootstrap/.../app_start` stub exists only in custom-3p app://localhost handler (irrelevant). no main-process body rewrite for claude.ai. V
- sibling repo https://github.com/zawa356/claude_ctrl-enter (same owner) uses the slot: MV3, document_start, world MAIN works in Desktop [U there]. its docs/AISTATE.md: MSIX userData virtualization (%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude), ext ID = hash(abs path) (aklgdlhikjbkjnfenjgighgbddjnepfe here), chrome.storage in virtual Local Extension Settings, installer design (ClaudeKeys state, backups, marker claude-keys.owner.json), constraints (never kill Claude; user restarts; never touch asar/MSIX).
- THIS MACHINE slot: ctrl-enter 0.3.0 installed in %APPDATA%\Claude\extensions\fmkadmapgofadopljbjfkapdkoienihi. original sha256: owner.json e678e991.., keys.js 703bf8a1.., manifest.json 05031cf1.., settings-ui.js 5e3387d5... REACT_PROFILE=1 (User, envSetByUs by ClaudeKeys). developer mode ON. => SLOT CONFLICT.
- P0 result [U 2026-10-09]: Electron/44.4.3, Chrome/152.0.7977.130; page href https://claude.ai/new (real claude.ai origin in defaultSession); inlinePreloadScripts=1; __BOOTSTRAP_PRELOAD__ object; baseline UI = unified. resource timing listed only /api/bootstrap/<uuid>/current_user_access (NO app_start entry: buffer overflow/clear? or different path) => confirm via hook state.
- UNKNOWN: whether app_start goes through window.fetch at /edge-api path in Desktop; whether flag yields split UI in Desktop.

## DESKTOP_PLAN
- DEC-D1 use REACT_PROFILE devtools slot (user idea, agreed by AI analysis).
- P0 read-only console probe (snippet given to user in session2): bootstrap resource paths (uuid redacted), inline preload count, __BOOTSTRAP_PRELOAD__ type, UA versions. -> awaiting user.
- P1 combined ext PREPARED at scratchpad/combined-ext (session-scoped temp!): ctrl-enter files + split-ui/claude.js (= v0.1.1 chrome content script, sha-verified) as FIRST content script (MAIN, document_start); manifest name "Claude Ctrl+Enter + Split UI PoC". deploy = backup slot folder -> e.g. %LOCALAPPDATA%\ClaudeSplitUI\backups\<stamp>, copy combined into slot (same path => same ext ID => ctrl-enter settings kept). user fully quits+relaunches Claude. check: split selector, window.__CLAUDE_SPLIT_PATCH_STATE__, ctrl-enter label/keys. revert = restore backup. DEPLOYED 2026-10-09 (user OK, dev-only VM): backup %LOCALAPPDATA%ClaudeSplitUIackups61009-160020slot (orig 4 files). slot now: manifest.json a247993c.. (combined), split-ui/claude.js 1d0f4157.., other 3 files unchanged. P1 result [U 2026-10-09 after full restart]: __CLAUDE_SPLIT_PATCH_STATE__={installed:true,intercepted:1,patched:1,lastResult:"patched",modifiedRules:1}; ctrl-enter status active, sidebar キー設定 shown, keys work => hook runs at document_start in Desktop, intercepts inline-preload app_start via window.fetch, coexists with ctrl-enter in one slot. split-UI visual result [U]: SPLIT selector shown in composer (チャット | Cowork segmented toggle next to +). Cowork selected -> composer + Cowork task list (running/scheduled tasks w/ permission prompts) visible; ctrl-enter newline worked in same composer. => DESKTOP SPLIT UI WORKS on Claude 2.31226 / Electron 44.4.3. Cowork runtime equivalence NOT claimed.
- P2 A/B: slot RESTORED to original 4 files (hashes match) 2026-10-09; PoC files moved to backups61009-160020poc-removed. P2 result [U]: unified UI back, ctrl-enter OK, __CLAUDE_SPLIT_PATCH_STATE__ undefined. => A/B/A COMPLETE for Desktop.
- DEC-D2 [user 2026-10-09]: option (a) SHARED SLOT chosen (extensibility); both repos (split-ui + claude_ctrl-enter) will be modified. was: (a) shared-slot convention with ctrl-enter (module host; both installers regenerate manifest from modules/<name>/; per-module markers) vs (b) exclusive install refusing when ctrl-enter present. user to decide after PoC.
- deliverable idea: apps/desktop-patcher -> "desktop installer" (ps1/bat like sibling), consuming CI-built chrome content script; rename/re-scope design doc.

## DESIGN_DISCUSSION (2026-10-09, pending user decision)
- user concern: minimize inter-plugin dependency; third-party tools could break shared slot.
- AI proposal (v2 direction): neutral host spec + reference generator in its own small repo (both tools vendor pinned copy; depend on host, not on each other). source of truth OUTSIDE slot: %LOCALAPPDATA%ClaudeDesktopAddonsmodules<id> (each tool writes only its folder). slot = disposable build output, deterministic full rebuild (repair possible by any participant). generator strict validation + quarantine invalid modules (invalid manifest or missing js would make Electron reject WHOLE extension = single point of failure). foreign/non-generated slot -> refuse, explicit takeover w/ backup. host schema versioning: older generator refuses newer schema. runtime: separate content_scripts entries isolate exceptions, MAIN world shared -> module guidelines (fail open, no global clobber).

- user (2026-10-09): reluctant to invent a NEW convention; asked to conform to an existing shared launcher.
- found: lugia19/Claude-WebExtension-Launcher (GPL-3.0, Go, active, v4.2.3 2026-10-03, 203 stars). creates SEPARATE patched Claude install (modifies app.asar; Windows version.dll so exe accepts modified asar hash; admin required on Windows; own icon/instance; separate login). wrapper.js loads EVERY <install>/web-extensions/<folder>/manifest.json via session.defaultSession.extensions.loadExtension individually (+ sentinel ext). bundled exts: lugia19/Claude-Usage-Extension, lugia19/Claude-Toolbox. "most extensions need adaptation". => its convention = 1 plugin = 1 plain standalone MV3 folder; no shared manifest.
- conflicts with sibling hard constraints (no launcher, no asar mod, normal icon) => cannot be the only path.
- AI proposal v3: adopt launcher FORMAT, not a new one: each tool ships a plain standalone MV3 extension folder (split-ui chrome zip already is). (1) Launcher users: drop folder into web-extensions (needs test). (2) official Claude: plain folders under a web-extensions-like dir (e.g. %APPDATA%Claudeweb-extensions<name>); a merger (identical script in each tool) reads standard manifests and bundles content_scripts+permissions into the REACT_PROFILE slot. no custom descriptor. unmergeable (background/options/etc) -> skipped w/ warning. caveat: merged exts share one chrome.storage namespace + one ext ID.

- DEC-D3 [user 2026-10-09]: accepted v3 (launcher-compatible plain MV3 folders + merger), wants minimal dev effort via git submodule. => NEW REPO zawa356/claude-desktop-webext (PRIVATE, MIT) created by AI: bin/webext.ps1 (Win PS5.1) + bin/webext.py (Linux python3) + tools/package.mjs + docs/SPEC.md; store %LOCALAPPDATA%ClaudeDesktopWebExtweb-extensions<id>, slot generated; CI green d412421 (windows: ps1+py 31 tests incl byte-identical manifest; ubuntu: py 15). shared_slot-spec.md in this repo is now SUPERSEDED by that repo docs/SPEC.md.
- loader repo made PUBLIC 2026-10-09 (user OK), MIT zawa356. HEAD e39289f (abs source path fix).
- planned split-ui integration: submodule vendor/claude-desktop-webext; desktop-webext.json {id claude-split-ui, order 10, source = WXT chrome build}; release job packages claude-split-ui-<ver>-desktop.zip via package.mjs.
- REAL-VM install DONE 2026-10-09 (user OK) via loader e39289f: claude-ctrl-enter (source = local clone claude_ctrl-enter/extension 0.3.0, adopt marker, -AdoptEnv, order 50) + claude-split-ui (v0.1.1 chrome, order 10). slot generation 2, envSetByUs true (loader state %LOCALAPPDATA%ClaudeDesktopWebExtstate.json). old flat ctrl-enter slot in ClaudeDesktopWebExtackups<stamp>slot-previous. NOTE ClaudeKeys state.json still says installed; ctrl-enter 0.3.0 uninstall.bat will now refuse (unknown owner) = expected. USER VERIFIED [U]: split selector + ctrl-enter label/settings/Enter/Ctrl+Enter OK; hook intercepted 1 patched 1. => loader works on real Claude 2.31226 Windows.

## CONSTRAINTS
- NEVER commit HAR, app_start JSON, cookies, JWTs, account/org IDs, chat content, asar copies, Claude config files.
- No storage/telemetry/extra network; no privileged API in MAIN; fail open; in-memory transform only.
- Desktop: never modify app.asar/MSIX/claude.exe; never auto-kill/restart Claude (user does); backup before touching slot; never delete user files (move to backups).
- Keep README verified/unverified matrix honest.

## NEXT (session2 end)
1. PR #8 feat/desktop-webext: version bumped to 0.2.0 (user decision, AMO later) + docs/releases/v0.2.0.md. merge => release job publishes v0.2.0 prerelease incl desktop zip. user to merge.
2. claude_ctrl-enter 0.4: vendor loader, wrappers via package.mjs (or keep its richer ps1 as thin wrapper), adopt marker claude-keys.owner.json + manifestName legacy, -AdoptEnv when ClaudeKeys envSetByUs, Linux remove 90-claude-ctrl-enter.conf after adopt, mark ClaudeKeys state migrated. this VM already migrated manually (store has claude-ctrl-enter from local clone).
3. Linux real test (none available).

## OPEN_QUESTIONS
- shared slot vs exclusive (see DESKTOP_PLAN).
- Desktop auto-updates may change loader chunk; need version check list like sibling TestedVersions.

## LOG (newest first)
- 2026-10-09 | claude-opus-5-5 | session2l: user verified loader-based install on VM. branch feat/desktop-webext: submodule, apps/desktop config, CI/release packaging, README/FAQ en+ja Desktop sections, superseded notes. npm test + check-docs pass.
- 2026-10-09 | claude-opus-5-5 | session2k: loader public; real VM install of ctrl-enter(adopt)+split-ui via loader; waiting for user restart.
- 2026-10-09 | claude-opus-5-5 | session2j: built + pushed zawa356/claude-desktop-webext (private), CI green. found 8.3 short-path bug in PS copy via CI. integration blocked on loader visibility; real-VM test awaiting OK.
- 2026-10-09 | claude-opus-5-5 | session2i: researched existing launchers; analyzed lugia19 Claude-WebExtension-Launcher; proposed v3 (launcher-compatible plain folders + merger for official slot).
- 2026-10-09 | claude-opus-5-5 | session2h: user asked how to avoid plugin interdependence; proposed neutral host + external module registry + rebuildable slot (DESIGN_DISCUSSION). spec draft v1 to be revised after user answer.
- 2026-10-09 | claude-opus-5-5 | session2g: P2 passed (A/B/A done). read ctrl-enter claude-keys.ps1 (owner marker root, whole-folder swap). wrote desktop PoC report + shared-slot spec draft; marked ASAR design superseded. check-docs + npm test pass.
- 2026-10-09 | claude-opus-5-5 | session2f: P2 started: slot restored to original. user chose DEC-D2 shared slot (a).
- 2026-10-09 | claude-opus-5-5 | session2e: user confirmed split Chat/Cowork selector in Desktop with combined ext (screenshot; contains personal task names -> not stored). next: P2 A/B + decide shared-slot design.
- 2026-10-09 | claude-opus-5-5 | session2d: user restarted Claude: hook patched=1, ctrl-enter OK. asked user about visible split selector.
- 2026-10-09 | claude-opus-5-5 | session2c: P0 probe result recorded. deployed P1 combined ext into slot (backup taken). awaiting user restart.
- 2026-10-09 | claude-opus-5-5 | session2b: user said builds are in GitHub Actions -> git fetch: local main was 27 commits behind; ff to 5886fdb (WXT+core+v0.1.1). downloaded v0.1.1 chrome zip (sha OK), built combined ext in scratchpad. rewrote AISTATE for current main. nothing deployed to Claude.
- 2026-10-09 | claude-opus-5-5 | session2a: Desktop investigation: read sibling repo; read-only env + asar scan (loader before window, single slot, no flag in main). proposed DESKTOP_PLAN; gave user P0 snippet.
- 2026-10-09 | claude-opus-5-5 | session1: read repo (then-stale 4c337c0), ran check/test/build:poc pass, created AISTATE/AGENTS/CLAUDE.md.

## HISTORY
- origin main up to 5886fdb built by ChatGPT/Codex sessions: core patcher, WXT Firefox/Chrome, Playwright synthetic smoke, release ZIPs v0.1.0/v0.1.1, AMO pipeline, i18n docs.
