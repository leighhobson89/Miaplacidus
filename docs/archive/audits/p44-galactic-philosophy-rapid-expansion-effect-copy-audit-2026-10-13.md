# P-44 Philosophy Rapid Expansion effect copy audit

**Date:** 13 October 2026  
**Scope:** the Rapid Expansion ability effect shown in the Philosophy choice and selected-ability cards.

Cosmic Forge's Research tab renders Philosophy entries through `../../../../cosmicForge/cosmicForge/drawTab3Content.js`; `../../../../cosmicForge/cosmicForge/descriptions.js:1451-1453` binds the Rapid Expansion row to `techPhilosophyRapidExpansionContent1`. The six source values (`../../../../cosmicForge/cosmicForge/localization.json:585,3208,5831,8454,11077,13700`) explain that conquering one system gives a **chance** to conquer up to three extra systems.

MIAPLACIDUS binds `copy.abilities[path.abilityId].effect` in `../../../src/app/PhilosophyPane.tsx:73-75,144-146` and displays it on the choice cards and selected ability card. `rapidExpansion.effect` in `../../../src/i18n/philosophyMessages.ts:99,219,353,481,604,739` now preserves both the chance and the up-to-three-additional-systems limit in all six locales. The source's ability name remains represented by the target's separate Ability heading and Rapid Expansion name; no mechanics or destination changed.

This is a static source-to-renderer copy comparison. No tests, builds, typechecks, formatting, or browser renders were run. P-44 remains open for the remaining catalogue inventory and rendered review.
