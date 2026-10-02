# Local save contract for the remake

**Status:** approved product direction; implementation has not started. **Scope:** multiple local saves, autosave, LZString text and file export/import, and versioning for saves created in MIAPLACIDUS. No Cosmic Forge save import, cloud save feature, account, network request or cloud migration is part of the new game. This document is the authority for the save tasks and tests.

## Relationship to Cosmic Forge

Cosmic Forge currently stores the last pioneer name under `saveName` in `localStorage`; it fills the name field from that value, then [the name handler](../../../cosmicForge/cosmicForge/ui.js) commits the typed name and tries a cloud lookup before its later Start screen. Its [save module](../../../cosmicForge/cosmicForge/saveLoadGame.js) already uses LZString for portable codes. The remake keeps the recognizable pioneer-name flow and compressed portable saves, replaces the lookup with **local save slots**, and performs the selected load when **Start** is pressed. The prefill itself must never determine which save loads.

## Player flow

1. On boot, read the slot index and last successfully started slot. Prefill that slot's **display name**. If it is missing, use the last confirmed name if valid; otherwise offer a generated Pioneer name. Show the available local saves in a selectable list with last-played/updated information.
2. The player may keep the prefill, type another name, or select a saved slot. A name is trimmed and validated. A selected slot fills the name field but does not start or load it.
3. Pressing **Confirm** commits the entered name and language to a *pending startup selection* and shows the existing intro/Start step. It does **not** load a save, create a slot, overwrite another slot, or change the last-started pointer. If the name is edited again, reconfirm it.
4. Pressing **Start** resolves the **confirmed pending name** against the slot index. If one slot matches, validate/decompress/migrate it and enter that game. If none matches, create a fresh run under that name, then enter onboarding. Do not fall back to the prefilled name or an arbitrary slot when the chosen name is missing or corrupt.
5. Only after a successful load or new-game creation, set the active slot ID and last-started pointer. Autosaves always target that active slot. The same slot reappears on later boots; the player can choose a different name and load that slot instead.

Use a stable opaque slot ID for storage keys. A player's display name is the lookup label, never a storage key. Compare names using one documented, locale-independent normalization rule (trim, Unicode normalize, case-insensitive key); preserve original spelling for display. Reject an attempted duplicate normalized name or route explicitly to the existing slot. Never silently overwrite it. A rename changes the label of one slot without changing its ID or history.

## Proposed storage layout

| Key | Contents | Recovery role |
|---|---|---|
| `miaplacidus:v1:index` | Small JSON catalogue: slot ID, display/lookup name, created/updated times, schema version, revision, compressed size | Fast list and name resolution; rebuild from committed slot heads if stale. |
| `miaplacidus:v1:head:<id>` | Commit ID of the active, validated payload for this slot | One-key commit pointer; an incomplete write cannot replace the previous payload. |
| `miaplacidus:v1:slot:<id>:<commitId>` | LZString `compressToUTF16` of a versioned save envelope | Immutable payload generation, authoritative only when its head points to it. |
| `miaplacidus:v1:lastStartedSlot` | ID of the last slot that successfully reached play | Prefill only; never selects without confirmation. |
| `miaplacidus:v1:preferences` | Global presentation preferences that should work before a slot loads | Locale/theme/accessibility boot settings, with per-save overrides specified separately. |

The save envelope includes `format`, `schemaVersion`, `slotId`, `pioneerName`, `savedAt`, `revision`, game state split into `run`, `permanent`, `settings`, `statistics`, and an integrity check over the canonical payload. The storage namespace version describes the key layout; `schemaVersion` describes the game-state format and has its own migration ladder. The index is a cache; committed slot heads and validated envelopes are authoritative. Do not use `localStorage.clear()`, since the origin can contain unrelated application data. Keep all keys namespaced and versioned.

Serialize and validate before writing. For an autosave, write a new unique payload generation for the **active slot only**, read it back and validate it, recheck the slot revision, then switch that slot's head pointer with one `localStorage` write. Update the index after the head commits. If any step before the head switch fails, the old head and payload remain playable; an uncommitted generation is recoverable or safely pruned later. If the index write fails, the next boot rebuilds it from committed heads. Plan for temporary space for both generations; quota failure must keep the old generation. Do not update `lastStartedSlot` on ordinary autosave: that pointer changes only after Start successfully loads or creates a playable slot. Rebuilding the index must not discard unrecognized keys, and a malformed slot should appear as recoverable/corrupt rather than vanish. Before destructive delete/replace/import, offer a portable export and require an explicit confirmation.

## Compression and portable formats

The [installed `lz-string` package](https://www.npmjs.com/package/lz-string) is pinned at `1.5.0`. Use `compressToUTF16`/`decompressFromUTF16` for localStorage payloads, where the output stays a JavaScript string. Use `compressToEncodedURIComponent`/`decompressFromEncodedURIComponent` for the portable text code, matching Cosmic Forge's existing mechanism. Prefix the new portable code with a MIAPLACIDUS format marker such as `MIA1:`; reject unmarked old-game codes. The downloaded `.txt` file contains the **same portable code** as the text export. Clipboard export and file download should have identical payloads for the same snapshot.

On import: inspect the MIAPLACIDUS marker; decompress; parse; validate size and schema; migrate earlier **MIAPLACIDUS** versions if needed; show pioneer name, run/version and conflicts; then explicitly choose **replace this slot**, **create a new slot under a different name**, or cancel. A new-name import gets a new local slot ID and a newly validated envelope/checksum. Do not mutate the active run or any slot until the complete import is valid and the conflict choice is confirmed. Reject old Cosmic Forge codes, truncated, wrong-codec, future-version and maliciously large payloads with a localized error and preserve the original text/file for retry. Export works even when localStorage is unavailable.

## Multiple saves and reliability

`localStorage` is synchronous and is commonly limited to about **5 MiB per origin**; a quota failure throws `QuotaExceededError` ([MDN Web Storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)). There is no promised fixed number of slots. Show compressed size and estimated remaining capacity, warn before a new save is unlikely to fit, catch write/security failures, and offer export/delete guidance. Never delete an older slot to make space automatically. If storage is blocked, permit a temporary session with text/file export and a prominent unsaved indicator.

Use a revision per slot. Another tab may change a slot while this tab is open; listen for [the `storage` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) and recheck the revision before autosave. The storage event is notification, not a cross-tab transaction lock: define a **single-writer policy** for an active slot and make a second writer read-only or pause saves until ownership is resolved. On conflict, offer reload the other revision, export this session, or save it as a new named slot. Do not silently choose a winner. On startup, scan and reconcile slots missing from the index, stale index rows, broken last-started pointers and interrupted imports. Only remove an orphan after user confirmation or a documented safe recovery policy.

Keep Cosmic Forge's user-facing save controls and sensible autosave settings. Specify the old rules around onboarding, battle and temporary time warp; define demo-specific behavior only if an optional flagged demo is produced. Saving must not double-award offline gains or change progression. A newly created slot should be persisted at the first safe checkpoint and clearly show whether it has been written; merely entering a name should not produce a phantom slot.

## Required acceptance scenarios

- Two distinct pioneers can progress and autosave independently. The last played name prefills next boot, but changing and confirming it loads the changed name on Start.
- Selecting a slot, then editing its name before Confirm, does not load the selected slot accidentally.
- A fresh confirmed name creates a new run and onboarding only when Start is pressed; cancelling before Start creates nothing.
- A duplicate normalized name cannot silently create or overwrite a second slot. Rename, delete and import conflicts are explicit.
- Export code, downloaded file and clipboard content decode to the same state; a round trip into an empty browser profile retains the pioneer name and progression.
- A code from an earlier shipped MIAPLACIDUS schema migrates into a playable current save; a Cosmic Forge code is rejected without changing data.
- Quota/security/corrupt/index mismatch failures preserve prior saves and leave export available. Two tabs do not silently overwrite each other.
- Each slot survives reload, offline return and multiple rebirths; switching slots does not carry state across players.

Implementation tasks are in [02-local-saves.md](build-checklist/02-local-saves.md). The `save-load-local`, `save-slots`, `save-migration` and `migration` test areas cover the contract.
