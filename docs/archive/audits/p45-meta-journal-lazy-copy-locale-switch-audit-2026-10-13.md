# P-45 Meta Journal lazy-copy locale-switch audit — 13 October 2026

## Scope

This records a locale-routing fix for lazy-loaded source News Ticker copy shown in the Meta Journal. It is not a translation-quality review.

## Target behavior

- `MetaJournalPane.tsx:48-69` captures the requested locale with the loaded `LocaleNewsCopy` and uses that copy only when its locale still matches the selected game locale.
- While a locale change is loading its copy, the pane passes no stale-locale source copy to `newsEntryText`; the existing locale-aware message path supplies the interim value.
- The effect discards a superseded asynchronous result when the component changes locale or becomes inactive.
- `sourceNewsCopy.ts` remains the data owner for the six locale variants. This change does not alter news entries, claims, mechanics, or the News Ticker route.

## Status

Static code-path review only; no tests or browser checks were run. This closes the identified stale-locale transition defect in this component, but not P-45's six-locale route sweep, required-key coverage, or other locale-routing review. No Phase 6 checklist or estimate subtask is closed by this slice.
