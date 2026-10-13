# P-44 Cosmic Rip header-help copy audit

**Date:** 13 October 2026  
**Scope:** Header help for the top-level Cosmic Rip page.

## Source mapping

Cosmic Forge binds `infoTooltipCosmicRipHeader` to the Cosmic Rip header in `descriptions.js:529`. Its six localized values are in `localization.json:313, 2936, 5559, 8182, 10805, 13428`.

## Remake mapping

`src/app/CosmicRipPane.tsx:210–213` renders `copy.headerHelp`; `src/i18n/cosmicRipMessages.ts:368, 438, 514, 589, 661, 737` now uses the source wording in all six locales. Cosmic Rip child ownership and mechanics are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.