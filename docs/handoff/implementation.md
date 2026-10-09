> **Historical handoff (archive):** The branch and acceptance state below describe a past development phase. The current main branch contains both Firefox and Chrome WXT implementations, both basic real-browser tests passed, and the AMO pipeline is prepared but not yet submitted.

# Development handoff

Repository: `claude-split-ui`, branch `feat/wxt-extension`.

## Objectives

- Maintain a single pnpm/WXT codebase for Chrome and Firefox.
- Preserve the Firefox PoC as the known-good reference.
- Keep all response modification in-memory and fail open.
- Add a separate Electron desktop patcher later, with backup and restore.
- Build/test with GitHub Actions; do not claim runtime support based on compilation alone.

## Acceptance criteria

- Feature `1174351393` has `defaultValue=false` and every boolean `rules[].force=false`.
- No `tracks[].result.value` or unrelated feature changes.
- No token, HAR, bootstrap response or personal data in the repo.
- Firefox and Chrome both show split UI after installation/reload and unified UI after removal/reload.
- Browser bundles are reproducible and manifest permission surface stays minimal.
- PR is not merged until CI succeeds and manual runtime results are recorded.

## Known limitations

The server can remove or repurpose the feature at any time. The observed split UI is not evidence that all desktop Cowork capabilities or entitlements are enabled. Electron packaging/signature/update compatibility remains uninvestigated.
