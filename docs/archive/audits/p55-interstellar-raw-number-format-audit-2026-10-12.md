# P-55 Interstellar raw-number display audit

**Date:** 12 October 2026  
**Status:** Implemented; static source and renderer comparison only.

Cosmic Forge returns Star Study Range and Star Ship Distance Travelled as raw JavaScript values followed by the localized light-year unit (`constantsAndGlobalVars.js:5313-5318,5329-5331`). Its Statistics renderer only applies the selected number notation to headers listed in `ui.js:5123-5133`; neither light-year row nor Enemy Total Defence Remaining is in that list. Enemy Total Defence Remaining reads the current weighted enemy fleet power or zero (`constantsAndGlobalVars.js:5515-5517`) and is likewise rendered raw.

MIAPLACIDUS previously formatted both light-year rows and Enemy Total Defence Remaining through its selected notation. `SettingsStatisticsPane.tsx` now converts all three values with `String(value)` while retaining the localized light-year unit. The owner-selected Star Ship Distance Travelled value scopes and reset behavior remain unchanged, as do the selected Enemy Total Defence Overcome semantics. Existing rendered-row expectations match the raw display rule.

No value selectors, scopes, units, or gameplay rules changed. Tests, builds, typechecks, formatters, and browser checks were not run. P-55 remains open for the other Statistics groups and controlled source-value comparisons.
