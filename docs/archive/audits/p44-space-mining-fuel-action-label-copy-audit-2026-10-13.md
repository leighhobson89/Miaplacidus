# P-44 Space Mining fuel action label copy audit — 13 October 2026

Cosmic Forge labels the rocket-fueling action with `buttonFuelRocket` in [`drawTab6Content.js`](../../../../cosmicForge/cosmicForge/drawTab6Content.js#L1266). MIAPLACIDUS's visible Start Fueling control and its accepted-action feedback both use the typed `startFueling` message (`src/app/SpaceMiningPane.tsx:356, 417-423`).

The six target values now match the corresponding source translations: `Fuel Rocket`, `Repostar Cohete`, `Abastecer Foguetão`, `Rakete Betanken`, `Rifornisci Razzo`, and `Ravitailler la Fusée` (`src/i18n/rocketMessages.ts:26, 89, 147, 205, 264, 323`). The rocket destination label was checked separately and already matched visually because the target renders its colon outside the translated label. No fueling or navigation behavior changed.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
