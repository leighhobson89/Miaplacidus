# P-44 Galactic Black Hole charging-status copy audit

**Date:** 13 October 2026  
**Scope:** Visible Black Hole status while a charge is active.

## Source mapping

Cosmic Forge `game.js:4187–4188` fills the status indicator from `buttonBlackHoleCharging`. The same six source values are recorded in `localization.json:2070, 4693, 7316, 9939, 12562, 15185`.

## Remake mapping

`src/app/BlackHolePane.tsx:230–242` renders `copy.charging` as the charge-progress description and accessible progress label, while retaining its remaining-time display. `src/i18n/blackHoleMessages.ts:57, 105, 151, 199, 247, 295` now uses the source charging-status wording in all six locales. The primary action button has a separate `chargingAction` key; charge timing and progress behavior are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.