# FAQ and troubleshooting

[English](FAQ.md) · [日本語](i18n/FAQ.ja.md)

## Does this unlock Cowork or paid features?
No. It only changes a client-side interface flag in the observed bootstrap response. Server authorization, subscriptions and desktop capabilities are unaffected.

## Is this an official Anthropic extension?
No. It is an independent, experimental research project.

## Is Chrome supported?
Yes, the WXT Chrome build passed a basic manual split/restore test using **Load unpacked**. It is not yet available from the Chrome Web Store.

## Is Claude Desktop supported?
Yes, on Windows (basic manual test with Claude 2.31226). It is installed with the `claude-split-ui-<version>-desktop.zip` package through the [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) loader; Claude itself is not modified. Linux uses the same package but is untested.

## Troubleshooting

### The UI is still unified
Confirm the temporary add-on is loaded in `about:debugging`, reload Claude, disable any Firefox Network Override, and verify the current Claude release still uses the same flag. The upstream may have changed; there is no guarantee of compatibility.

### I cannot load the extension
Download the appropriate browser ZIP from [GitHub Releases](https://github.com/zawa356/claude-split-ui/releases/latest) and extract it once. For Firefox, select the extracted **manifest.json** via `about:debugging`. For Chrome, select the folder containing that manifest via **Load unpacked** in `chrome://extensions/`. Firefox temporary add-ons must be loaded again after browser restart.

### I want to revert
Remove the temporary extension and reload Claude. No server-side setting is changed.

### Can I submit debug logs?
Only synthetic or thoroughly redacted logs. Never share a HAR, raw bootstrap response, authentication header, session cookie, account UUID, or private conversation.
