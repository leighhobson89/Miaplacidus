# P-44 Resource collect action label audit

**Date:** 13 October 2026  
**Scope:** the collect action shown on Resource cards and the full Resource page.

Cosmic Forge binds its Resource header action to `buttonGainOne` in `../../../../cosmicForge/cosmicForge/drawTab1Content.js:26-28`. The six source values are `Gain 1`, `Ganar 1`, `Ganhar 1`, `1 gewinnen`, `Guadagna 1`, and `Gagner 1` (`../../../../cosmicForge/cosmicForge/localization.json:30,2653,5276,7899,10522,13145`).

MIAPLACIDUS renders both Resource collect controls through `t("collect")` in `../../../src/app/EconomyPanes.tsx:450,583`. The typed `collect` values in `../../../src/i18n/economyMessages.ts:210,412,613,820,1023,1228` now match the six source values. This correction is limited to Resource action captions; page routes, storage limits, and collection behavior are unchanged.

This is a static source-to-renderer copy comparison. No tests, builds, typechecks, formatting, or browser renders were run. P-44 remains open for the remaining catalogue inventory and rendered review.
