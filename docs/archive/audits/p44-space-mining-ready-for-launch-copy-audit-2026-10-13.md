# P-44 Space Mining ready-for-launch status copy audit

**Date:** 13 October 2026

Cosmic Forge uses `textReadyForLaunch` for the Rocket's green-ready fuel description after the tank is full, in [`drawTab6Content.js:1169-1173`](../../../../cosmicForge/cosmicForge/drawTab6Content.js#L1169). The six source values are `Ready For Launch...`, `Listo para lanzar...`, `Pronto para lançar...`, `Startbereit...`, `Pronto al lancio...`, and `Prêt au lancement...` in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1852).

MIAPLACIDUS maps the full-fuel `ready` state to its typed `readyForLaunch` message in [`SpaceMiningPane.tsx`](../../../src/app/SpaceMiningPane.tsx#L142), which appears in the Rocket status pill. The six catalogue values in [`rocketMessages.ts`](../../../src/i18n/rocketMessages.ts#L33) now match the source wording and punctuation.

This changes only status copy. Rocket fueling, launch, destination, and Space Mining page ownership are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open for the broader catalogue and rendered-locale evidence.
