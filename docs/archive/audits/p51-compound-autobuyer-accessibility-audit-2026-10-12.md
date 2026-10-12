# P-51 Compound autobuyer purchase context audit — 12 October 2026

## Cosmic Forge source UI

`cosmicForge/cosmicForge/drawTab4Content.js` builds the Compound autobuyer rows. For example, the Diesel Tier 1 purchase button at lines 165–185 is named with its effect (`Add {rate} {compound} per second`); the row description carries its price. Other Compound tiers use the same effect-label pattern. `ui.js:3592–3666` adds a separate localized Buy Max action when bulk purchasing is unlocked.

## MIAPLACIDUS target UI

The active Compound child renderer calls `CompoundAutobuyerDetails` from `src/app/EconomyPanes.tsx`. Its purchase controls display `Buy · {price}` or `Buy Max`; the tier/rate summary, existing localized action help, affordability reason, and Buy Max total-cost/rate preview are separate text.

## Correction

The target now assigns stable IDs to the tier/rate summary, localized action help, affordability reason, and Buy Max preview. The single-purchase button describes the summary, action help, and any reason. Buy Max describes the same context plus its total-cost/rate preview. The visible prices, calculations, and purchase behavior are unchanged.

This was a static source/renderer comparison. No tests, builds, typechecks, formatting checks, or browser review were run. P-51 remains open for the remaining six-locale, price-row, tooltip, modal, layout, and rendered evidence.
