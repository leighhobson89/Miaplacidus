# P-51 Hydrogen purchase context audit — 12 October 2026

## Cosmic Forge source UI

The Hydrogen storage and tier-one AutoBuyer controls are on the Resources page. The storage row's tooltip uses localized capacity-upgrade guidance (`cosmicForge/cosmicForge/descriptions.js:619-623`), while the row shows its price beside the Increase Storage action (`drawTab1Content.js:130-165`); it does not show a numeric current-to-next capacity transition. That numeric transition is shown in MIAPLACIDUS. The AutoBuyer purchase label describes its per-second effect while the cost remains in the adjacent row (`drawTab1Content.js:167-203`).

## MIAPLACIDUS target UI

The active Hydrogen card is rendered separately from the shared Resource and Compound cards in `src/app/App.tsx`. Its purchase controls previously referenced only their affordability reason even though localized help, price, rate, storage-capacity transition, and Buy Max result were visible nearby.

## Correction

The storage action now references its localized title/help, cost, capacity transition, and any affordability reason. The tier-one AutoBuyer actions now reference the localized help, rate, price, and reason; Buy Max also references its count/cost/rate preview and bulk failure reason. The capacity label is available to assistive technology while visible wording and gameplay remain unchanged.

This was a static source/renderer review. No tests, builds, typechecks, formatting checks, or browser review were run. P-51 remains open for E-57's broader six-locale price-row, tooltip, modal, dynamic-cost, viewport, theme, and clipping review.
