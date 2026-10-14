# P-45 random-event locale coverage audit - 13 October 2026

## Scope

Static source-to-remake check of random-event catalogue value presence and the selected-locale code paths used by event notices, expiry results, active effects, and Events Journal history. This is a bounded P-45/Phase 7 acceptance slice; it does not establish that every event state has been rendered in a browser.

## Cosmic Forge evidence

`cosmicForge/cosmicForge/localization.json` contains 82 relevant event-prefixed entries in each of `en`, `es`, `pt`, `de`, `it`, and `fr`: 26 `eventDesc*`, 13 `randomEventTrigger*`, 36 start/end `modalEvent*`, and 7 `notificationRandomEvent*` keys. The source JSON values in this scope are non-empty. `drawTab9Content.js:993-1032` renders the active-event and event-history sections with the current source language; `ui.js` supplies the source event descriptions, trigger notices, and result dialogs.

## MIAPLACIDUS evidence

- `src/i18n/randomEventDescriptionMessages.ts` is a six-locale typed record for the 26 description keys, with populated entries in each locale.
- `src/i18n/randomEventStartDialogMessages.ts` covers all 13 event IDs with populated six-locale entries. `randomEventEndDialogMessages.ts` and `randomEventEndNotificationMessages.ts` cover the five timed expiry effects. `randomEventTriggerNotificationMessages.ts` has the named trigger cases plus a populated generic event-name fallback.
- `src/app/MetaJournalPane.tsx:48,197,234` passes `state.settings.locale` to active-effect and history descriptions. `src/app/randomEventTriggeredNotifications.ts:39,56` selects the current locale for trigger notices; expiry notices use the current locale in `src/app/randomEventEndNotifications.ts`.
- The unused `src/i18n/randomEventEndDetailMessages.ts` Black Hole detail duplicates information already present in the active expiry dialog's summary/result. It is not an active route with a missing visible value.

## Result and limits

The static catalogue-presence and selected-locale routing subtask is complete for this family. The remaining P-45 work is to exercise trigger, active-effect, expiry, and history states in all six locales and record runtime route evidence, along with the other unfinished gameplay and ending routes. No translation-quality review is required. No tests, builds, typechecks, or browser renders were run.
