# Security and privacy

This project is unofficial and experimental. It does not bypass authentication, subscription entitlements, or server-side access controls.

Do not submit HAR archives, bootstrap JSON captures, cookies, access tokens, authorization headers, session identifiers, email addresses, account IDs, or user content to issues or pull requests.

The extension changes one client-side feature definition in memory. It does not transmit telemetry, collect user data, or store API responses.

The Claude Desktop package does not patch Claude. It never modifies `app.asar`, the MSIX package or binaries. It installs the same extension through the [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) loader, which:

- backs up whatever it replaces,
- refuses to overwrite a real React DevTools install or a slot owned by another tool,
- rolls back on failure,
- never deletes files (it moves them to backups).

Proprietary Claude application files must never be added to this repository.

The automated token-pattern scanner is only a heuristic; manually inspect every public change before publishing.
