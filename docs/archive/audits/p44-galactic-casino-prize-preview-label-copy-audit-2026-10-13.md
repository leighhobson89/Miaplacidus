# P-44 Galactic Casino prize-preview label audit

**Date:** 13 October 2026  
**Scope:** Source-to-remake label and punctuation for the Higher or Lower current-prize preview.

## Source mapping

Cosmic Forge `drawTab7Content.js:1625–1628` renders localized `labelPrize` immediately before the Higher or Lower prize preview. Its six values are in `localization.json:2014, 4637, 7260, 9883, 12506, 15129`: `Prize:`, `Premio:`, `Prémio:`, `Preis:`, `Premio:`, and `Prix:`.

## Remake mapping

MIAPLACIDUS renders `casinoText(locale, "currentPrize")` immediately before the preview in `src/app/GalacticCasinoPane.tsx:764–767`. The six `currentPrize` catalogue values in `src/i18n/casinoMessages.ts:174, 305, 437, 569, 701, 833` now match the source including its colon; the renderer no longer appends a second colon.

This changes copy and punctuation only. Prize calculation, Higher or Lower behavior, and Casino's ownership as a distinct Galactic child remain unchanged. This was a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.
