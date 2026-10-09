# Shared Claude Desktop extension slot — specification (draft v1)

> **Superseded (2026-10-09):** replaced by the [claude-desktop-webext](https://github.com/zawa356/claude-desktop-webext) loader and its [SPEC](https://github.com/zawa356/claude-desktop-webext/blob/main/docs/SPEC.md). Kept for history.

## 1. Background

Claude Desktop loads exactly one unpacked extension, from `%APPDATA%\Claude\extensions\fmkadmapgofadopljbjfkapdkoienihi` (Linux: `~/.config/Claude/extensions/...`), when `REACT_PROFILE=1` ([PoC report](../research/2026-10-09-desktop-poc.md)). This spec lets several independent tools ("modules") share that one folder (the "slot") without overwriting each other.

Fixed facts that must not change:

- **Slot path.** Chromium derives the unpacked extension ID, and therefore `chrome.storage`, from the absolute folder path. The slot must stay at this path, and `manifest.json` must never gain a `key`, or claude_ctrl-enter users lose their settings.
- **Do not touch Claude itself.** No tool modifies `app.asar`, the MSIX package or `claude.exe`, and no tool closes or restarts Claude.

## 2. Slot layout

```text
fmkadmapgofadopljbjfkapdkoienihi/
  manifest.json              GENERATED. Never edited by hand or by a module directly.
  claude-slot.json           Host registry (schema below). Its presence = "shared slot format".
  modules/
    claude-ctrl-enter/
      module.json            Module descriptor, owned by that tool.
      keys.js
      settings-ui.js
    claude-split-ui/
      module.json
      claude.js
```

- A module may write **only** inside `modules/<its id>/`. Every module may regenerate `manifest.json` and `claude-slot.json` by following section 4.
- Module IDs match `^[a-z0-9][a-z0-9-]{1,40}$`. Reserved: `claude-ctrl-enter`, `claude-split-ui`.
- A module must not leave files directly under the slot root, except the two shared files.

### 2.1 `module.json`

```json
{
  "schema": 1,
  "id": "claude-split-ui",
  "tool": "claude-split-ui",
  "version": "0.2.0",
  "order": 10,
  "permissions": [],
  "content_scripts": [
    { "js": ["claude.js"], "matches": ["https://claude.ai/*"], "run_at": "document_start", "world": "MAIN", "all_frames": false }
  ]
}
```

- `js` paths are relative to the module folder. The generator rewrites them to `modules/<id>/<file>`.
- `order` is an integer from 0 to 1000; lower values are injected first. split-ui uses **10**, because its fetch hook must install before any page script. claude_ctrl-enter uses **50**. Ties are sorted by `id`.
- `permissions` is limited to an allow-list: `storage` for now. Anything else makes the generator refuse. `host_permissions`, `background`, `web_accessible_resources` and `key` are not allowed in v1.
- Allowed `content_scripts` keys: `js`, `matches`, `run_at`, `world`, `all_frames`. `matches` must be a subset of `https://claude.ai/*`.

### 2.2 `claude-slot.json`

```json
{
  "schema": 1,
  "generation": 7,
  "generatedAt": "2026-10-09T07:00:00Z",
  "generatedBy": "claude-split-ui 0.2.0",
  "modules": ["claude-ctrl-enter", "claude-split-ui"],
  "env": { "setByHost": true, "previous": null }
}
```

- `env.setByHost`: `true` if `REACT_PROFILE` was absent before the first module was installed. `previous`: the raw value and registry kind before installation, if any, kept so it can be restored.
- `REACT_PROFILE` ownership lives here, not in each tool's private state. It is removed only when the **last** module leaves and `setByHost` is true and the value is still `1`.

### 2.3 Generated `manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Claude Desktop add-ons (claude-ctrl-enter, claude-split-ui)",
  "version": "1.0.7",
  "description": "Shared local extension slot. Generated; do not edit.",
  "permissions": ["storage"],
  "content_scripts": [ /* modules sorted by (order, id), each entry with js paths prefixed */ ]
}
```

- `version` = `1.0.<generation>`.
- `permissions` = sorted union of all module permissions. Order matters in Chromium: content scripts listed earlier inject first, so `content_scripts` keeps each module's entries in module order.

## 3. Owner detection

These states extend `Get-TargetOwner` in claude_ctrl-enter:

| Slot state | Meaning | Allowed action |
|---|---|---|
| missing | nothing installed | create shared slot |
| `claude-slot.json` present, valid | shared slot | add / update / remove own module |
| root `claude-keys.owner.json`, no `claude-slot.json` | claude_ctrl-enter ≤ 0.3.x flat layout | **only claude_ctrl-enter ≥ 0.4** may migrate it (section 5); other tools refuse with the message "update claude_ctrl-enter first" |
| manifest name "Claude Enter Patch - Load Probe" | claude_ctrl-enter prototype | as above |
| manifest name contains "React Developer Tools" | real React DevTools | refuse (never overwrite) |
| anything else / invalid `claude-slot.json` | unknown | refuse |

The MSIX virtual userData (`%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\extensions\<id>`) is checked as well. If anything is there, every tool refuses, as claude_ctrl-enter does today.

## 4. Write procedure (install, update, uninstall of a module)

1. **Lock:** create `extensions\.<id>.lock` exclusively and write `{tool, pid, createdAt}` into it. If it exists and is less than 10 minutes old, refuse. If it is older, report it and require `-Force`.
2. **Read and validate** the current slot (section 3) and every `modules/*/module.json`. If another module's descriptor is invalid, keep its folder untouched, leave it out of the manifest and warn. Never delete another module.
3. **Stage:** copy the whole slot to `extensions\.<id>.staging-<stamp>` and verify SHA-256 of every file. Apply only the caller's change, in `modules/<own id>/`.
4. **Generate** `manifest.json` and `claude-slot.json` into the staging folder (`generation + 1`).
5. **Swap:** move the current slot to `<tool state dir>\backups\<stamp>\previous`, then rename staging to the slot path. Both moves stay inside the user profile.
6. **Environment:** if this is the first module and `REACT_PROFILE` is not `1`, set it in the User scope and record `env` in `claude-slot.json` (rewrite in place after the swap, or prepare it in staging).
7. **Unlock.**
8. **On failure:** roll back (restore `previous`, restore the environment), move the staging folder to `backups\<stamp>\failed`, and exit 1. If the rollback itself fails, exit 3.

Uninstalling the last module moves the whole slot to `backups\<stamp>\removed` and handles `REACT_PROFILE` per section 2.2. Nothing is ever deleted; files are only moved to backups.

Each tool keeps its own `state.json` (for example `%LOCALAPPDATA%\ClaudeKeys`, `%LOCALAPPDATA%\ClaudeSplitUI`) for its version, timestamps and backups. The host registry is authoritative for the environment variable.

## 5. Migration from claude_ctrl-enter 0.3.x (flat layout)

Performed only by claude_ctrl-enter ≥ 0.4 (install or update), using the same procedure as section 4:

1. In staging, move `keys.js` and `settings-ui.js` to `modules/claude-ctrl-enter/` and write its `module.json`. Drop the root `claude-keys.owner.json`.
2. Create `claude-slot.json` with `env.setByHost` = its current `state.json` `envSetByUs` (or the prototype legacy rule), and `previous` from its state.
3. Generate `manifest.json`. The slot path is unchanged, so the extension ID and `chrome.storage` settings carry over.

**Compatibility with old installers:** after migration the root marker is gone. claude_ctrl-enter 0.3.x then classifies the slot as `unknown` and refuses to install or uninstall. It fails safe, and split-ui is never wiped by an old installer. Release notes must tell users to update to ≥ 0.4.

## 6. Diagnostics (each tool's `diagnose`)

Must report:
- slot format (missing / shared / flat legacy / foreign)
- `generation`, the module list with versions and orders
- whether the own module is present and its file hashes match `module.json`
- `REACT_PROFILE` (User/Machine) against the `env` record
- the virtual userData check
- the Claude version against the tool's tested list

Diagnostics are read-only.

## 7. Conformance

Both repositories ship identical tests against shared fixtures: input slot trees → expected `manifest.json` and `claude-slot.json`, plus the refusal cases. The generator implementations, PowerShell (Windows) and bash (Linux, claude_ctrl-enter), must produce byte-identical manifests for those fixtures (2-space JSON indentation, LF, UTF-8 without BOM, trailing newline).

## 8. Open points

- **Generator location.** (a) Vendor an identical `claude-slot.ps1` / `claude-slot.sh` into both repos and check it by hash in CI, or (b) implement it twice and rely on conformance tests. Recommendation: (a), with the canonical copy in one repo.
- **Which repo owns the canonical spec and generator.**
- **Linux support** in claude-split-ui (claude_ctrl-enter already has a bash installer).
- **Disabling a module without uninstalling it** (`"enabled": false` in `module.json`), useful for A/B tests.
