> **Superseded (2026-10-09):** Patching `app.asar` is not feasible for the signed MSIX build. The Desktop target now loads the WXT content script through Claude Desktop's React DevTools extension slot. See the [Desktop PoC report](research/2026-10-09-desktop-poc.md) and the [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) loader.

# Electron Desktop patcher — design only

The desktop patcher is not implemented and must not be represented as working.

- Discover the locally installed Claude Desktop application version and ASAR entry point.
- Detect compatibility against a supported version list before writing.
- Create a verified backup of the original application archive and record hashes.
- Apply a minimal, reversible local patch only to the user's own installation.
- Verify resulting archive integrity and provide one-command rollback.
- Handle updates that replace the patched archive; never silently repatch an unknown version.
- Do not redistribute proprietary ASAR archives or bundled application code.
- Expect code-signature validation and OS protections to affect feasibility.
