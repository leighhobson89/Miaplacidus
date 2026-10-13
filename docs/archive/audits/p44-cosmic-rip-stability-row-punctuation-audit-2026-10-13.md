# P-44 Cosmic Rip stability-row punctuation audit

**Date:** 13 October 2026  
**Scope:** Source-to-remake label punctuation for the Cosmic Rip stabilization progress row.

## Source mapping

Cosmic Forge `drawTab8Content.js:855` binds the stability row label to `tab8CosmicRipRowLabel`. Its six values are in `localization.json:1807, 4430, 7053, 9676, 12299, 14922`; each includes the source colon.

## Remake mapping

MIAPLACIDUS renders the localized `stabilityLabel` beside the progress value in `src/app/CosmicRipPane.tsx:474–487`, and reuses it as the progress element's accessible name. The six values in `src/i18n/cosmicRipMessages.ts:365, 435, 511, 585, 658, 733` now preserve the source colon. The tooltip label uses the same string without adding a second colon.

Stability calculations and Cosmic Rip page ownership are unchanged. This was a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.
