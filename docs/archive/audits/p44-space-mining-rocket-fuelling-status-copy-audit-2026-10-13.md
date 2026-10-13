# P-44 Space Mining active rocket-fuelling status copy audit

**Date:** 13 October 2026

Cosmic Forge's `drawTab6Content.js` calls `setFuellingVisibility()` for each Rocket child page; its active status uses `textFuelling` (`drawTab6Content.js:1158`). The source values are `Fuelling...`, `Repostando...`, `A abastecer...`, `Wird betankt...`, `Rifornimento...`, and `Ravitaillement...`.

`src/app/SpaceMiningPane.tsx:146-148,276` binds the active fuel-pump state to `rocketText(locale, "fuelling")` in the rocket status pill. The six `fuelling` values in `src/i18n/rocketMessages.ts` now match the source. Fueling behavior and Rocket child ownership are unchanged. Static source/catalogue/renderer comparison; no tests or browser checks were run. P-44 remains open.
