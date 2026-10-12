# P-44 Save/Import Follow-up — 2026-10-11

Reviewed the remaining save and import UI messages against Cosmic Forge's six-language catalogue and save/load flow. This pass excluded the already corrected `not-found` route and clipboard messages. No additional player-facing text or placement defect was verified, so this pass makes no code or translation changes.

## Crosswalk findings

- The only matching source catalogue entries without rows in `tests/unit/save-message-crosswalk.spec.ts` are `headerMainSavingLoading` and `headerDescSavingLoading`. They are already owned by `settingsMessages.ts` as `savingSection` and `savingSectionDescription`; the heading and description preserve the source meaning in all six locales.
- Import validation routes empty, unmarked, malformed, integrity-failed, future-version, duplicate-name, and invalid-name cases to distinct typed messages. The remake's preview step and explicit choice to import as new or replace a matching local save intentionally adapt the source's immediate-load flow.
- Replacement reports `loaded` only when the active slot is replaced; importing into another slot reports `imported`, and importing as a new pioneer explains how to select it later. These outcomes match which save becomes active.
- Local save status, empty pioneer list, lock/revision conflict, storage-capacity warning, and recovery-generation copy belong to the remake's local-slot model. Cloud-only feedback, app exit, and obsolete onboarding/demo restrictions remain intentionally excluded as recorded in the existing crosswalk.

No tests, builds, typechecks, formatters, or browser runs were performed.
