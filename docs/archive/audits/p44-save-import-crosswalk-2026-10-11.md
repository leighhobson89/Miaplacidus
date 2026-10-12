# P-44 Save and Import Crosswalk — 2026-10-11

Audited Cosmic Forge's save/export/import localization against MIAPLACIDUS save selection, Save Manager, portable import/export, conflict handling, recovery, and empty/error states.

## Correction

- Local missing-save and recovery-generation failures use `SaveError("not-found", ...)` in `src/persistence/repository.ts` and `src/app/App.tsx`. The typed route in `saveErrorText` previously sent these failures to the generic retry message. Added `errNotFound` in all six locales and routed `not-found` to it, using the source wording from Cosmic Forge's `notificationNoSavedGameDataFound`.
- Extended `tests/unit/save-message-crosswalk.spec.ts` to assert the source-key mapping and the typed `not-found` error route in every supported locale.

## Mapping notes

- Local slot selection, duplicate-name conflicts, lock/revision conflicts, recovery, portable code preview, and import-as-new/replace are remake-specific UI; their copy stays typed in `saveMessages.ts` and is intentionally adapted to local storage.
- Cosmic Forge cloud save/load, cloud account, Electron exit, and onboarding save-lock messages remain excluded where the corresponding surface or behavior does not exist in the remake.
- Empty local pioneer-list copy remains distinct from a missing save: it describes the absence of *other* saved pioneers, while `errNotFound` reports a failed lookup/load/recovery action.

No save mechanics changed. No tests, builds, typechecks, formatters, or browser runs were performed.
