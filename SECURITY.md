# Security considerations

- Only load this experimental extension on a Claude account you control.
- Never upload or commit full `/app_start` JSON responses, HAR captures, cookies, JWTs, access tokens, or chat content.
- The page's `MAIN` world is untrusted: no privileged browser-extension APIs or secrets should be exposed there.
- The patch should be restricted to a same-origin `/edge-api/bootstrap/.../app_start` response and should fail open (pass through the unmodified original) if the schema is unknown.
- A stored HAR or fixed JSON override is **not** an acceptable production implementation. A dynamic response transformation avoids pinning stale account/session data.
- A future Electron patcher must back up the original ASAR, check compatibility before patching, support rollback, and never redistribute Anthropic application binaries.
- Report security issues through a private channel to the repository maintainers; do not post live tokens in public issues.
