> **Historical handoff (archive):** This document reflects the planning stage before WXT implementation and before Firefox/Chrome real-browser smoke tests. For current status see [README](../../README.md), [WXT validation](../research/wxt-migration.md), and [AMO publishing](../amo/AMO.md). Claims below about unimplemented WXT variants or Firefox-PoC-only releases are superseded.

# Handoff to Claude Code / Codex

## Goal

Maintain a single MIT-licensed monorepo for a small unofficial client-side feature-flag patch that restores a split Chat/Cowork UI. Deliver (1) Firefox extension, (2) Chromium extension, and (3) Claude Desktop patcher. **Verified implementation at handoff: Firefox MV3 PoC only.** Do not assume other targets are working.

## Verified base

- `poc/firefox-mv3/bootstrap-hook.js` and `manifest.json` were loaded via `about:debugging` on Firefox 157.0.1 and correctly restored the split UI with Network Override disabled.
- Removing the extension and reloading restored unified UI.
- Read `docs/research/2026-10-09-feature-flag-analysis.md` before editing.
- Preserve verified PoC as a regression baseline; create new code under `packages/core` / `apps/browser-extension`.

## Implementation target: shared transform

Design a pure function (TypeScript) that accepts a parsed JSON value, identifies **only structurally valid** GrowthBook feature-definition objects for key `1174351393`, and returns a modified copy plus `{ matched, ruleCount }` without modifying inputs. Fail open on unknown schema; retain unrelated flags and fields exactly. Do not log raw responses. The current PoC recursively scans the JSON; optimize without assuming the nesting path is fixed unless tests demonstrate stability. Add cases for missing feature, multiple definitions, non-boolean `force`, response errors, and malformed JSON.

## Implementation target: WXT

- WXT supports browser-specific builds, but do **not** assume Firefox MV2 and MV3 injection timing are equivalent. The original tested extension uses Firefox **MV3** `document_start` `MAIN` world.
- Upstream Claude HTML performs `fetch()` from an **inline** bootstrap script before external bundles. A hook installed at `document_idle` is too late. Verify `document_start` injection ordering in each target browser.
- Match same-origin `/edge-api/bootstrap/(?:UUID/)?app_start/?` rather than hardcoding UUIDs. Handle `fetch(url)` and `fetch(Request)` correctly.
- Return a new `Response` with appropriately preserved status/headers and safe body serialization; avoid stale `content-length`/`content-encoding` transport headers. Validate `url`, `redirected`, `type`, body-locking and clone behavior. Retain request behavior and avoid introducing fetch loops.
- Do not require cookies, broad host permissions, third-party telemetry, or remotely hosted script. No privilege-bearing extension API in page MAIN world.
- Browser matrix: Firefox MV3 real launch (must match manual PoC), Chrome MV3 real launch, versions/builds logged without user identifiers.

## Acceptance tests

1. On original unified account/build, extension disabled + full refresh = unified UI.
2. Extension enabled + full refresh = split UI, Chat/Cowork switch present.
3. Extension disabled + full refresh = unified UI again.
4. Cowork route and a harmless file creation smoke test still work; do not claim old runtime unless explicitly proven.
5. If feature flag or endpoint is absent/unknown: page behaves normally (fail open) and does not crash.
6. No authentication or response content stored on disk or sent elsewhere.
7. CI covers pure unit tests, extension bundle compilation, format/lint checks, and release ZIP generation; automated smoke tests **supplement**, not replace, real browser verification.

## Desktop patcher (later phase)

Known prior reverse-engineering observation: Windows Claude Desktop `app.asar` reported package `@ant/desktop` version `2.26454.2`, entry `.vite/build/index.pre.js` in the explored build. **Not proof** of how the web renderer or preload is currently instantiated. Determine actual window/webContents lifecycle before implementing injection. Support safe, version-aware instrumentation of the early fetch with opt-in patch and rollback. Original ASAR backup and hash check mandatory. Do not redistribute proprietary vendor binaries or tamper with account authorizations.

## Public repository safeguards

- NEVER add captured HARs, login/session cookies, the user's override JSON, JWTs, real account IDs, private chats, or full authenticated bootstrap responses.
- Document only minimal redacted samples and test fixtures with artificial identifiers.
- Keep verified/unverified feature matrix honest in README and Release notes.
- Public `v*` tag publishes a prerelease for the tested Firefox PoC only until both WXT targets have completed real browser testing.

## Suggested next PRs

1. `refactor/core-feature-patcher`: pure transformation + tests; compare output against original PoC.
2. `feat/wxt-browser`: WXT MV3 manifest/entrypoint + Firefox browser verification.
3. `test/chrome-mv3`: Chrome UI/route regression checks; update compatibility matrix.
4. `feat/desktop-patcher`: reversible Electron integration + strict version checks.
