# P-44 Settings Mouse Trail label audit

**Date:** 13 October 2026  
**Scope:** the Mouse Trail toggle label in Settings > Game Options.

Cosmic Forge binds the visible row label to `tab9MouseTrailRowLabel` in `../../../../cosmicForge/cosmicForge/drawTab9Content.js:296-300`. Its six source values are `Mouse Trail:`, `Rastro del Ratón:`, `Rasto do Rato:`, `Mausspur:`, `Scia del Mouse:`, and `Traînée de Souris:` (`../../../../cosmicForge/cosmicForge/localization.json:1728,4351,6974,9597,12220,14843`).

MIAPLACIDUS renders the checkbox caption in `../../../src/app/SettingsPane.tsx:389` through `settingsText(locale, "pointerTrail")`. The six `pointerTrail` values in `../../../src/i18n/settingsMessages.ts:105,170,235,300,365,430` now preserve the source colon. The setting behavior and six Settings destinations are unchanged.

This is a static source-to-renderer copy comparison. No tests, builds, typechecks, formatting, or browser renders were run. P-44 remains open for the remaining catalogue inventory and rendered review.
