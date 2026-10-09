# Privacy

[English](PRIVACY.md) · [日本語](i18n/PRIVACY.ja.md)

The Firefox/Chrome WXT extension and earlier Firefox PoC run **locally inside your browser** and match only `https://claude.ai/*`. They wrap a narrow same-origin bootstrap `fetch` response, changing selected boolean values in one client-side UI feature definition. Requests and unrelated responses pass through. These extensions do not add background network requests, transmit telemetry, store response bodies, read or persist conversations, or collect account credentials.

The Firefox add-on declares `browser_specific_settings.gecko.data_collection_permissions.required: ["none"]`. No cookie, storage, or broad host extension permissions are requested. This describes the reviewed source code; **it is not an independent security audit**. MAIN-world scripts share the web page's execution context and Claude may change its behavior.

Never post HAR archives, raw bootstrap API responses, account UUIDs, session cookies, credentials or private conversations to GitHub Issues/PRs. Consult [SECURITY.md](../SECURITY.md) for security reports.
