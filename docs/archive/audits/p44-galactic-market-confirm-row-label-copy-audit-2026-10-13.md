# P-44 Galactic Market confirmation-row label audit

**Date:** 13 October 2026  
**Scope:** Source-to-remake label placement and six-locale copy for the Galactic Market trade summary row.

## Source mapping

Cosmic Forge `drawTab7Content.js:314–321` creates the `galacticMarketTradeSummaryAndConfirmRow` and binds its visible `labelText` to `tab7ConfirmRowLabel`. The six source values are in `localization.json:1960, 4583, 7206, 9829, 12452, 15075`: `Confirm:`, `Confirmar:`, `Confirmar:`, `Bestätigen:`, `Conferma:`, and `Confirmer:`.

## Remake mapping

MIAPLACIDUS renders `marketText(locale, "confirmRowLabel")` above the outgoing, incoming, commission, and confirm-action values in `src/app/GalacticMarketPane.tsx:262–273`. The typed key and all six values are in `src/i18n/metaMessages.ts:581–590, 629–909` and match the source strings.

This restores the source row label without changing trade calculations or behavior. Galactic Casino remains its own child page. This was a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.
