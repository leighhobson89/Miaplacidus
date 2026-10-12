# P-20 Save Manager conflict announcements (12 October 2026)

## Route and source comparison

The local-save contract defines a single writer for each active slot. A tab
that loses the write race must stop autosaving and leave the competing
revision intact; this lock behavior is remake-specific. Cosmic Forge's
`saveLoadGame.js` saves its current local game state and exposes save/import
controls, but has no per-slot writer lock or cross-tab conflict announcement
to reproduce.

In MIAPLACIDUS, `App.tsx` listens for a `storage` event on the active slot's
head key. It pauses writes and records a localized conflict. The persistent
app-level `save-conflict-announcement` is a polite, atomic status region, so
the lock-loss message remains available after navigating away from Settings
→ Saving and Loading. The visible conflict banner provides Reload and Export
actions without another live role.

When Saving and Loading was active at the time of a conflict, its save-state
`output` also exposed the same text as a polite status. That produced two
simultaneous live announcements for one storage event. The save-state display
now remains visible but loses its status role and live semantics while writes
are paused; the persistent app-level status is the sole live route for that
conflict. Ordinary saved/unsaved status continues to use the localized polite
status semantics.

The existing two-tab browser case changes the stale tab to Hydrogen before the
owner advances the save head, then opens Saving and Loading to inspect the
visible conflict. Its assertion now checks that the local save-state text has
no live semantics during lock loss while the persistent app-level region keeps
the localized announcement. This updates an existing assertion only; no tests,
builds, typechecks, formatters, or browser runs were performed. Manual
screen-reader speech, timing, and pronunciation verification remain open under
P-20.
