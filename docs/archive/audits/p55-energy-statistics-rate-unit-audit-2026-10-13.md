# P-55 Energy Statistics rate-unit audit — 13 October 2026

**Scope:** compare the displayed unit for the live Energy Statistics rates with Cosmic Forge.

Cosmic Forge's `getStatTotalProduction()` and `getStatTotalConsumption()` append the literal `kJ / s` to their values (`constantsAndGlobalVars.js:5194-5206`). The live Energy value also uses this spacing in `game.js:12353-12366`.

MIAPLACIDUS previously rendered `kJ/s` for numeric Total Energy, Total Production, and Total Consumption values in `SettingsStatisticsPane.tsx`. It now uses `energyStatisticRateUnit(locale)` from `energyStatisticsMessages.ts`, with the source literal `kJ / s` defined for all six supported locales. In the Infinite Power state, Total Energy continues to show the source status `∞ DYSON ∞`; the Power status row, value scopes, and Statistics navigation are unchanged.

This was a static source-to-renderer comparison. No tests, builds, typechecks, formatting, or browser checks were run. Matched source/remake values and rendered review remain open under P-55.
