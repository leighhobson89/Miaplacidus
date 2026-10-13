# P-44 Galactic Black Hole ready-state action copy audit

**Date:** 13 October 2026  
**Scope:** Primary button label while the Black Hole charge is ready to activate.

## Source mapping

Cosmic Forge `game.js:4395` sets the ready charge button from `buttonBlackHoleActivate`. The six source labels are at `localization.json:2071, 4694, 7317, 9940, 12563, 15186`.

## Remake mapping

`src/app/BlackHolePane.tsx:329–338` already binds `copy.activate` while `state.run.blackHoleChargeReady` is true. The six `activate` values in `src/i18n/blackHoleMessages.ts:53, 101, 147, 195, 243, 291` now match the source. Charge state and activation command are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.