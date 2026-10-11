# P-44 random-event copy audit

**Date:** 11 October 2026  
**Scope:** Random-event names, descriptions, trigger notices, and timed-effect completion notices across `en`, `es`, `pt`, `de`, `it`, and `fr`.

Compared the remake's typed catalogs (`src/i18n/metaSignalMessages.ts`, `randomEventDescriptionMessages.ts`, `randomEventTriggerNotificationMessages.ts`, and `randomEventEndNotificationMessages.ts`) with Cosmic Forge's `eventName*`, `eventDesc*`, `notificationRandomEvent*`, and timed-effect completion strings in `cosmicForge/cosmicForge/localization.json`; checked event dispatch and expiry usage in `cosmicForge/cosmicForge/events.js` and descriptions in `cosmicForge/cosmicForge/descriptions.js`.

The 13 event names, description templates and placeholders, specialized trigger notices, and five timed-effect completion notices have corresponding entries in all six remake locales. The reviewed copy preserves the source meaning; generic trigger notices intentionally derive their localized event name, while the remake's wording for remake-specific presentation/mechanics remains out of scope. A source mismatch was found in named `minerBrokeDown` trigger and expiry notices: Cosmic Forge localizes the default stored rocket name (`Rocket 1` etc.) with `rocketDefaultName`, while the remake previously passed the raw English stored value. The remake now normalizes that default name for both notice routes, preserving custom names. Portuguese uses the source spelling `Foguetão` for this notification label, distinct from the remake's Rocket pane label. A source-parity assertion was added for all six locales; it has not been run.

No tests, builds, typechecks, formatters, or browser runs were performed for this audit.
