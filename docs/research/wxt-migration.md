# WXT migration and validation status

## Proven baseline

The Firefox MV3 PoC in `poc/firefox-mv3/` was manually tested with Firefox 157.0.1:

- With Firefox DevTools Network Override disabled, enabling the temporary extension and reloading `claude.ai/new` restored the split Chat/Cowork UI.
- Removing the extension and reloading restored the unified UI.

This is an A/B/A observation, not a guarantee of future compatibility.

## Shared implementation

`packages/core/src/index.mjs` performs a narrow, in-memory JSON transformation on the observed same-origin `/edge-api/bootstrap/.../app_start` endpoint. It changes only the feature definition keyed `1174351393`: `defaultValue` and boolean `rules[].force` become `false`. Tracking metadata, entitlements, cookies and other features are unchanged. Unexpected payloads pass through unmodified.

`apps/browser-extension/` uses WXT, MV3, `document_start` and the MAIN world for both Firefox and Chrome. Both WXT variants passed a minimal real-browser split/restore observation: with the extension enabled the UI was split, and after removing or disabling it and reloading it was unified again. This verifies the basic selector behavior only; it does not prove complete Cowork functionality or future compatibility.

The Chrome build is also the Claude Desktop extension. `apps/desktop/` packages it with the [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) loader ([Desktop PoC report](2026-10-09-desktop-poc.md)).

## Verification ladder (status at v0.2.1)

1. **Done (CI):** Run pure transformation unit tests with synthetic fixture data.
2. **Done (CI):** Build Firefox and Chrome using GitHub Actions and inspect generated manifests.
3. **Done (CI):** Confirm early injection in a synthetic browser harness; do not require a Claude login.
4. **Done:** Load WXT Firefox output temporarily, repeat the original A/B/A test.
5. **Done:** Load WXT Chrome output unpacked, repeat A/B/A.
6. **Done:** Claude Desktop 2.31226 on Windows: A/B/A through the extension slot, then installation through the loader alongside claude_ctrl-enter.
7. **Partly (unit tests only):** Feature absent, malformed bootstrap, non-200 HTTP. Future schema drift cannot be tested in advance.
8. **Open:** Claude Desktop on Linux.

A CI green build alone does not establish real browser behavior.

## Privacy

Never commit HAR files, raw bootstrap responses, session cookies, auth tokens, UUIDs from a real account, email addresses or user messages. Only synthetic fixtures are permitted.
