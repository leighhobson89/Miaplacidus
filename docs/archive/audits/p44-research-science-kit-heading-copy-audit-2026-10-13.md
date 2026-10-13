# P-44 Research Science Kit heading copy audit

**Date:** 13 October 2026  
**Scope:** Visible heading for the Science Kit building in Research > Science Buildings.

## Source mapping

Cosmic Forge `drawTab3Content.js:124–128` renders `tab3ScienceKitRowLabel` as the Science Kit row label. Its six locale values, all including the source colon, are at `localization.json:2073, 4696, 7319, 9942, 12565, 15188`.

## Remake mapping

`src/app/EconomyPanes.tsx:2410–2430` renders the Science Kit card heading through `techName(locale, id)`, which reads `ECONOMY_BUILDING_NAMES.scienceKit` from `src/content/economyBuildingNames.ts:20–27`. Those six values now preserve the source heading punctuation. The purchase command, costs, and Research/Science Buildings ownership are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.