# P-44 Research Science Lab heading copy audit

**Date:** 13 October 2026  
**Scope:** Visible heading for the Science Lab building in Research > Science Buildings.

## Source mapping

Cosmic Forge `drawTab3Content.js:216–220` renders `tab3ScienceLabRowLabel`. Its six locale values, each with a trailing colon, are at `localization.json:2075, 4698, 7321, 9944, 12567, 15190`.

## Remake mapping

`src/app/EconomyPanes.tsx:2410–2430` renders the Science Lab card heading through `techName(locale, id)`, which reads `ECONOMY_BUILDING_NAMES.scienceLab` from `src/content/economyBuildingNames.ts:36–42`. Those six values now preserve the source punctuation. Purchase behavior and Research/Science Buildings ownership are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.