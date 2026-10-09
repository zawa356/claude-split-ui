# FAQ and troubleshooting

[English](FAQ.md) · [日本語](i18n/FAQ.ja.md)

## Does this unlock Cowork or paid features?
No. It only changes a client-side interface flag in the observed bootstrap response. Server authorization, subscriptions and desktop capabilities are unaffected.

## Is this an official Anthropic extension?
No. It is an independent, experimental research project.

## Is Chrome supported?
Yes, the WXT Chrome build passed a basic manual split/restore test using **Load unpacked**. It is not yet available from the Chrome Web Store.

## Is Claude Desktop supported?
No. A reversible Electron patcher is only planned.

## Troubleshooting

### The UI is still unified
Confirm the temporary add-on is loaded in `about:debugging`, reload Claude, disable any Firefox Network Override, and verify the current Claude release still uses the same flag. The upstream may have changed; there is no guarantee of compatibility.

### I cannot load the extension
Download and extract the Actions artifact ZIP, then extract the bundled WXT ZIP inside it. For Firefox, select the inner extension's **manifest.json** via `about:debugging`. For Chrome, select the folder containing that manifest via **Load unpacked** in `chrome://extensions/`. Firefox temporary add-ons must be loaded again after browser restart.

### I want to revert
Remove the temporary extension and reload Claude. No server-side setting is changed.

### Can I submit debug logs?
Only synthetic or thoroughly redacted logs. Never share a HAR, raw bootstrap response, authentication header, session cookie, account UUID, or private conversation.
