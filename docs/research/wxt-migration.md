# WXT migration and validation status

## Proven baseline

The Firefox MV3 PoC in `poc/firefox-mv3/` was manually tested with Firefox 157.0.1. After disabling Firefox DevTools Network Override, enabling the temporary extension and reloading `claude.ai/new` restored the split Chat/Cowork UI. Removing the extension and reloading restored the unified UI. This is an A/B/A observation, not a guarantee of future compatibility.

## Shared implementation

`packages/core/src/index.mjs` performs a narrow, in-memory JSON transformation on the observed same-origin `/edge-api/bootstrap/.../app_start` endpoint. It changes only the feature definition keyed `1174351393`: `defaultValue` and boolean `rules[].force` to `false`. Tracking metadata, entitlements, cookies and other features are unchanged. Unexpected payloads pass through unmodified.

`apps/browser-extension/` uses WXT, MV3, `document_start`, and MAIN world for both Firefox and Chrome. Both WXT variants passed a minimal real-browser split/restore observation (extension enabled → split UI; removed/disabled → unified UI after reload). This verifies the basic selector behavior only; it does not prove complete Cowork functionality or future compatibility.

## Verification ladder (status at v0.1.1 preparation)

1. Run pure transformation unit tests with synthetic fixture data.
2. Build Firefox and Chrome using GitHub Actions and inspect generated manifests.
3. Confirm early injection in a synthetic browser harness; do not require a Claude login.
4. **Done:** Load WXT Firefox output temporarily, repeat the original A/B/A test.
5. **Done:** Load WXT Chrome output unpacked, repeat A/B/A.
6. Test feature absent, malformed bootstrap, non-200 HTTP, and future schema drift.

A CI green build alone does not establish real browser behavior.

## Privacy

Never commit HAR files, raw bootstrap responses, session cookies, auth tokens, UUIDs from a real account, email addresses or user messages. Only synthetic fixtures are permitted.
