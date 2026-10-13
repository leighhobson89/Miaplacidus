# P-44 Space Mining no-power status-copy audit

**Date:** 13 October 2026  
**Scope:** Source-to-remake localized Telescope status shown while telescope power is unavailable.

## Source mapping

Cosmic Forge `ui.js:8719` returns the localized `textNoPower` status when telescope power is off. Its six values are in `localization.json:2511, 5134, 7757, 10380, 13003, 15626`: `No Power`, `Sin energía`, `Sem energia`, `Keine Energie`, `Senza energia`, and `Pas d'énergie`.

## Remake mapping

MIAPLACIDUS selects `spaceText(locale, "surveyPowerBlocked")` for the visible survey status in `src/app/SpaceMiningPane.tsx:631–638`. The six values in `src/i18n/spaceMessages.ts:41, 149, 253, 357, 459, 564` now match the source status wording.

Power gating and the red-disabled status presentation are unchanged. This was a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.
