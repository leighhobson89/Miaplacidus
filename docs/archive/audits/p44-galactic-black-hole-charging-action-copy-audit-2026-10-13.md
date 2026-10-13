# P-44 Galactic Black Hole charging-action copy audit

**Date:** 13 October 2026  
**Scope:** Localized active Black Hole charge action text.

## Source mapping

Cosmic Forge `game.js:4385` assigns the active charge button the `buttonBlackHoleCharging` localization key. Its values are `Charging...`, `Cargando...`, `A carregar...`, `Lädt...`, `In carica...`, and `Chargement...` in `localization.json:2070, 4693, 7316, 9939, 12562, 15185`.

## Remake mapping

The primary action in `src/app/BlackHolePane.tsx:329–338` selects `copy.chargingAction` while charging or warping; the six locale entries are in `src/i18n/blackHoleMessages.ts:58, 106, 152, 200, 248, 296`. Idle charge and ready/activate actions use separate keys. The action's command and Galactic child ownership are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.