# Phase 2 — local saves, startup and migration

**Outcome:** each pioneer owns an independent local slot; the confirmed name loads only on Start; exports remain portable. Follow the [local save contract](../local-save-contract.md). Source reference: Cosmic Forge `ui.js`, `descriptions.js`, `saveLoadGame.js`, `constantsAndGlobalVars.js`, `patches.js`, `tests/e2e/save-load-local`, `save-migration` and `migration`.

## Save schema and storage adapter

- [ ] **S-01** Define a versioned save envelope containing format, schema version, slot ID, pioneer display name, timestamps, revision and scoped game state.
- [ ] **S-02** Define validation for every required run, permanent, settings and statistics field; reject impossible/unknown values deliberately.
- [ ] **S-03** Define namespaced slot-generation keys, a committed head pointer per stable opaque slot ID, an index cache, last-started pointer and global boot preferences.
- [ ] **S-04** Implement a storage interface with real `localStorage` and an in-memory test double.
- [ ] **S-05** Add LZString `compressToUTF16`/`decompressFromUTF16` for slot payloads and verify Unicode names/content round-trip.
- [ ] **S-06** Add an integrity check and size limits before parsing or accepting a decompressed payload.
- [ ] **S-07** Serialize only authoritative engine state, not DOM text, derived values, audio handles or timers with live callbacks.
- [ ] **S-08** Store durable timer IDs, elapsed/remaining time and clock anchors needed for reload/offline continuation.
- [ ] **S-09** Write and verify a new immutable slot generation, atomically switch its head pointer, then update index metadata; preserve the prior generation on any pre-commit/quota failure.
- [ ] **S-10** Rebuild the index from committed slot heads and validated payloads; keep corrupt heads and orphan generations visible for recovery.
- [ ] **S-11** Handle a missing, corrupt or stale last-started pointer without choosing a different slot silently.
- [ ] **S-12** Prevent this app from deleting or rewriting unrelated origin storage keys.
- [ ] **S-13** Make the current active slot ID explicit in session state; autosave cannot target a prefilled or merely typed name.

## Name screen and multiple slots

- [ ] **S-14** Prefill the last successfully started pioneer's display name; use a generated name when no usable pointer exists.
- [ ] **S-15** Show all local slots with pioneer name, last saved/played time and a clear selection affordance.
- [ ] **S-16** Let selecting a slot fill the editable name field without loading or starting it.
- [ ] **S-17** Validate trimmed names, Unicode normalization, length and illegal/ambiguous values with localized feedback.
- [ ] **S-18** Define a locale-independent normalized lookup key while preserving the exact display spelling.
- [ ] **S-19** Reject duplicate normalized names or route to the one existing slot; never silently overwrite or fork it.
- [ ] **S-20** On Confirm, freeze the entered name and language as a pending startup selection; create no slot and load no state yet.
- [ ] **S-21** If the name changes after Confirm, require reconfirmation before Start.
- [ ] **S-22** On Start, resolve only the confirmed pending name; load that matching slot or create a fresh pioneer if no match exists.
- [ ] **S-23** If the matching slot is corrupt, stop with recovery choices; never load the prefilled or another saved pioneer.
- [ ] **S-24** Update last-started metadata only after the intended slot reaches playable state.
- [ ] **S-25** Run onboarding only for a truly new slot or the old game's equivalent first-run state; a resumed slot keeps its progress.
- [ ] **S-26** Add a save manager for switch, rename, create, export and delete actions with explicit confirmation where progress could be lost.
- [ ] **S-27** Keep slot IDs stable across rename and reordering; update metadata and embedded pioneer name together.
- [ ] **S-28** On deletion of the active/last-started slot, close it safely and choose a valid prefill without starting another slot.

## Autosave and portable exchange

- [ ] **S-29** Persist a new slot at its first safe checkpoint and visibly indicate whether it has reached storage.
- [ ] **S-30** Port autosave frequency/toggle controls; specify onboarding, battle and temporary-warp pauses, and define demo-specific behavior only if a flagged demo is built.
- [ ] **S-31** Save on explicit user request and defined lifecycle checkpoints without duplicate offline rewards or partial state.
- [ ] **S-32** Add a `MIA1:`-style MIAPLACIDUS version marker and LZString `compressToEncodedURIComponent` portable code format.
- [ ] **S-33** Produce the same code for text view, clipboard and `.txt` download from one snapshot.
- [ ] **S-34** Import from pasted text, clipboard where permitted, and local `.txt` picker; preserve the supplied original on failure.
- [ ] **S-35** Accept only marked MIAPLACIDUS codes; reject unprefixed Cosmic Forge codes and unknown formats with a clear localized explanation.
- [ ] **S-36** Preview imported pioneer, version, run and conflict before changing current state or storage.
- [ ] **S-37** Offer explicit replace, new-name slot or cancel on an import conflict; require an export opportunity before replace/delete.
- [ ] **S-38** Make import commit atomic from the player's perspective; failure leaves current run and all slots intact.
- [ ] **S-39** Validate malformed, truncated, huge, wrong-codec, future-version and checksum-failing codes with localized errors.

## New-game migrations, quota and concurrent tabs

- [ ] **S-40** Establish MIAPLACIDUS schema version 1, a migration registry and a policy for preserving saves created by earlier releases of this game.
- [ ] **S-41** Implement and test a one-way migration registry with a synthetic earlier-schema fixture; require a new validated rung for each later MIAPLACIDUS schema change.
- [ ] **S-42** Keep sanitized fixtures for every shipped MIAPLACIDUS version and test the migration ladder through a playable state.
- [ ] **S-43** Reject original Cosmic Forge codes and unsupported future MIAPLACIDUS versions without modifying slots or losing the supplied code.
- [ ] **S-44** Measure representative compressed early/mid/endgame saves and define warnings that include temporary space for the previous and new generations.
- [ ] **S-45** Catch `QuotaExceededError`, `SecurityError` and unavailable storage; preserve the previous slot and offer export.
- [ ] **S-46** Keep the game playable as an unsaved temporary session when localStorage is blocked, with a visible unsaved warning.
- [ ] **S-47** Never evict an old slot automatically; show size and guide the player to export/delete intentionally.
- [ ] **S-48** Maintain a per-slot revision and a single-writer policy across tabs; treat storage events as notifications, not an atomic lock.
- [ ] **S-49** On a revision conflict, pause writes and offer reload, export this session or save it under a new name.
- [ ] **S-50** Reconcile interrupted payload/index writes, orphaned slots and stale metadata on the next boot.

## Verification

- [ ] **S-51** Unit-test slot lookup, normalization, index rebuild, codecs, schema checks and atomic import.
- [ ] **S-52** Unit-test quota/security failures and two-tab revision conflicts using a fake storage adapter.
- [ ] **S-53** Browser-test two pioneers with distinct progress, switch between them, reload and verify last-name prefill.
- [ ] **S-54** Browser-test editing the prefill and confirming a different name; Start must load only that confirmed name.
- [ ] **S-55** Browser-test cancel-before-Start, new-slot onboarding, rename/delete conflicts and export/import round trips.
- [ ] **S-56** Browser-test save/reload during timers, after one and two rebirths, and with storage blocked.
- [ ] **S-57** Test file/text/clipboard byte equivalence and restore in a fresh profile.
- [ ] **S-58** Verify no runtime or build artifact contains a cloud-save UI route, Supabase save call or account lookup.

**Exit gate:** two local pioneers can be played independently; prefill never overrides confirmed selection; MIAPLACIDUS portable codes round-trip safely; quota/corruption/conflict cases preserve prior progress; new-game versioning is ready for future migrations; no cloud saving exists. Evidence belongs in `save-load-local`, `save-slots`, `save-migration` and `migration`.
