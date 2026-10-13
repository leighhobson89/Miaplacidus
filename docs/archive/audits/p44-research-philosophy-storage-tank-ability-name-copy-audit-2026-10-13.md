# P-44 Research Philosophy storage-tank ability name audit

**Date:** 13 October 2026  
**Scope:** Constructor ability name for Space Storage Tank Research.

## Source mapping

Cosmic Forge `drawTab3Content.js:2724` renders localized `techNameSpaceStorageTankResearch` followed by a colon in the Philosophy ability row. The six source values are at `localization.json:2120, 4743, 7366, 9989, 12612, 15235`.

## Remake mapping

`src/app/PhilosophyPane.tsx` renders `copy.abilities[path.abilityId].name` for this Constructor ability. The six `spaceStorageTankResearch.name` values in `src/i18n/philosophyMessages.ts:84, 203, 338, 466, 588, 723` now match the source name and trailing colon. The effect, unlock behavior, and page ownership are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.