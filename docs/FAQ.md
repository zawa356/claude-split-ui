# FAQ and troubleshooting

[English](FAQ.md) · [日本語](i18n/FAQ.ja.md)

## Does this unlock Cowork or paid features?
No. It only changes a client-side interface flag in the observed bootstrap response. Server authorization, subscriptions and desktop capabilities are unaffected.

## Is this an official Anthropic extension?
No. It is an independent, experimental research project.

## Is Chrome supported?
A WXT Chrome build candidate exists, but it has not yet passed the real browser A/B/A validation. The original Firefox MV3 PoC is the only manually verified implementation.

## Is Claude Desktop supported?
No. A reversible Electron patcher is only planned.

## Troubleshooting

### The UI is still unified
Confirm the temporary add-on is loaded in `about:debugging`, reload Claude, disable any Firefox Network Override, and verify the current Claude release still uses the same flag. The upstream may have changed; there is no guarantee of compatibility.

### I cannot load the extension
Select the **manifest.json** file inside `poc/firefox-mv3/`, not the ZIP. Firefox temporary add-ons must be loaded again after browser restart.

### I want to revert
Remove the temporary extension and reload Claude. No server-side setting is changed.

### Can I submit debug logs?
Only synthetic or thoroughly redacted logs. Never share a HAR, raw bootstrap response, authentication header, session cookie, account UUID, or private conversation.
