# P-55 Energy All Time unavailable-value audit

**Date:** 12 October 2026  
**Scope:** All Time cells for Power, Total Energy, Total Production, Total Consumption, and Total Battery Storage in Statistics.

Cosmic Forge's five `getStat*AllTime` getters call `localize('textNotApplicable')` (`constantsAndGlobalVars.js:5182,5190,5201,5209,5217`). The source locale values are `N/A` (English), `N/D` (Spanish), `N/D` (Portuguese), `K.A.` (German), `N/D` (Italian), and `S.O.` (French) (`localization.json:1907,4530,7153,9776,12399,15022`).

MIAPLACIDUS already uses one localized `notApplicable` value for the five live Energy rows through `energyUnavailable` in `src/app/SettingsStatisticsPane.tsx`. Updated that catalogue in `src/i18n/energyStatisticsMessages.ts` to the source abbreviations. The five rows retain their live Current Run values, All Time unavailable scope, source order, and owner-page links. The separate Interstellar values and other localized unavailable copy are unchanged.

Static source/renderer and locale-catalogue review only. No tests, builds, typechecks, formatting, or browser checks were run. P-55 remains open for the remaining row-by-row and controlled-value comparisons.
