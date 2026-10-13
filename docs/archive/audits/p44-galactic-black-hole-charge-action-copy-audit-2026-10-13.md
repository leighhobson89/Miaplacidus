# P-44 Galactic Black Hole charge-action copy audit

**Date:** 13 October 2026  
**Scope:** Source-to-remake idle charge-button wording on the Galactic Black Hole destination.

## Source mapping

Cosmic Forge `drawTab7Content.js:2130–2133` binds the idle charge button to `buttonBlackHoleCharge`. Its six values appear in `localization.json:2068, 4691, 7314, 9937, 12560, 15183`: `Charge`, `Cargar`, `Carregar`, `Laden`, `Carica`, and `Charger`.

## Remake mapping

MIAPLACIDUS binds only the idle primary-action branch to `copy.chargeAction` in `src/app/BlackHolePane.tsx:329–338`. The six-locale values are in `src/i18n/blackHoleMessages.ts:54, 101, 146, 193, 240, 287`. The separate status row retains its `startCharge` text, preserving the remake's status/action distinction.

Charging and activation behavior and Black Hole's Galactic child ownership are unchanged. This was a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.
