# P-44 Interstellar Starship travel action copy audit

**Date:** 13 October 2026  
**Scope:** Cosmic Forge's unlaunched Starship destination action and the matching MIAPLACIDUS control.

Cosmic Forge creates the destination action in `../../../../cosmicForge/cosmicForge/ui.js:6558-6563` and binds its visible caption to `buttonTravel`. The source localization values are `Travel`, `Viajar`, `Viajar`, `Reisen`, `Viaggia`, and `Voyager` for English, Spanish, Portuguese, German, Italian, and French (`../../../../cosmicForge/cosmicForge/localization.json:1862,4485,7108,9731,12354,14977`).

MIAPLACIDUS renders the unlaunched action in `../../../src/app/StarshipPane.tsx:548-566` and binds it to `starshipText(locale, "launch")`. The six `launch` values in `../../../src/i18n/starshipMessages.ts:43,217,391,564,743,917` now match the source values above. The click still opens the existing launch-warning confirmation; the Starship destination, Star Data, and Fleet Hangar remain distinct Interstellar pages.

This is a static source-to-renderer copy comparison. No tests, builds, typechecks, formatting, or browser renders were run. P-44 remains open for the remaining catalogue inventory and rendered review.
