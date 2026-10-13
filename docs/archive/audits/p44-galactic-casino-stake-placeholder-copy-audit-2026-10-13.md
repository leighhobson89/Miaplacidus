# P-44 Galactic Casino stake placeholder copy audit

**Date:** 13 October 2026  
**Scope:** the Double or Nothing stake input in Galactic Casino.

Cosmic Forge creates the stake text field in `../../../../cosmicForge/cosmicForge/drawTab7Content.js:441` and uses the `placeholderStake` localization key. Its six values are `Stake`, `Apuesta`, `Aposta`, `Einsatz`, `Puntata`, and `Mise` (`../../../../cosmicForge/cosmicForge/localization.json:1976,4599,7222,9845,12468,15091`).

MIAPLACIDUS renders the control in `../../../src/app/GalacticCasinoPane.tsx:541-550` and binds its visible/accessibility label to `casinoText(locale, "stake")`. The six `stake` values in `../../../src/i18n/casinoMessages.ts:147,278,410,542,674,806` now match the source placeholder values without an added currency suffix; the existing CP amount preview remains separate. Casino remains a distinct Galactic child, and stake validation and game behavior are unchanged.

This is a static source-to-renderer copy comparison. No tests, builds, typechecks, formatting, or browser renders were run. P-44 remains open for the remaining catalogue inventory and rendered review.
