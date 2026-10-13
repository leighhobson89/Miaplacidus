# P-44 Space Mining active asteroid status copy audit

**Date:** 13 October 2026  
**Scope:** Localized status while the Telescope is scanning an asteroid.

## Source mapping

Cosmic Forge `ui.js:8695–8698` selects `textScanningAsteroids` while an asteroid scan timer is active and power is available. The six values are in `localization.json:2509, 5132, 7755, 10378, 13001, 15624`.

## Remake mapping

`src/app/SpaceMiningPane.tsx:631–638` selects `surveySearching` when `space.activeSurvey === "asteroids"` (unless power is blocked, which retains the separate No Power state). The six values are in `src/i18n/spaceMessages.ts:38, 147, 252, 357, 460, 566` and now match source wording. Survey mechanics and child-page ownership are unchanged.

This is a static source/catalogue/renderer comparison; no tests or browser renders were run. P-44 remains open.