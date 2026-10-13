# P-51 Energy Battery purchase context audit — 12 October 2026

## Cosmic Forge source UI

The three battery rows in `cosmicForge/cosmicForge/drawTab2Content.js` name each purchase action with the added capacity (`buttonAddCapacityMj`), then show its price in the row description. For example, Battery 1 is at lines 26–58; Batteries 2 and 3 repeat that structure at lines 68–100 and 110–142.

## MIAPLACIDUS target UI

At the initial P-51 review, the active Batteries child in `src/app/EconomyPanes.tsx` named single purchases only “Buy.” The card separately showed its battery name, capacity, and current price. Buy Max showed its total-cost/capacity preview in separate text. The disabled reasons and InfoTooltip were already associated with their controls. The localized action-label follow-up below records the current button copy.

## Correction

The single-purchase button references the battery name, capacity, cost, and any affordability reason. Buy Max references the same details plus its total-cost/capacity preview and any bulk affordability reason. This control-context change does not alter calculations, purchases, or tooltip behavior.

## Localized action label follow-up (12 October 2026)

The source single-purchase label says `Add {capacity} MJ`. An earlier accessibility implementation used the remake's displayed kJ unit in its action label; the later [P-44 capacity-button correction](p44-energy-battery-capacity-button-copy-audit-2026-10-12.md) changed it to the source MJ unit and the source floor conversion in all six locales. The adjacent capacity readout stays in kJ. The number is formatted for the active locale. Battery name, capacity, price, and failure reason remain associated with the purchase control, and Buy Max references its cost/capacity preview and any bulk failure reason. These changes do not alter the child mapping or purchase behavior.

This was a static source/renderer comparison. No tests, builds, typechecks, formatting checks, or browser review were run. P-51 remains open for the remaining six-locale, price-row, tooltip, modal, layout, and rendered evidence.
