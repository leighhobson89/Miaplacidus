# P-44 Research Science Club heading copy audit

**Date:** 13 October 2026  
**Scope:** Visible heading for the Science Club building in Research > Science Buildings.

## Source mapping

Cosmic Forge `drawTab3Content.js:170–174` renders `tab3ScienceClubRowLabel`. Its six locale values, each with a trailing colon, are at `localization.json:2074, 4697, 7320, 9943, 12566, 15189`.

## Remake mapping

`src/app/EconomyPanes.tsx:2410–2430` renders the Science Club card heading through `techName(locale, id)`, which reads `ECONOMY_BUILDING_NAMES.scienceClub` from `src/content/economyBuildingNames.ts:28–34`. Those six values now preserve the source punctuation. Purchase behavior and Research/Science Buildings ownership are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.