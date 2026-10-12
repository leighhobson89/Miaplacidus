# P-51 Energy Battery purchase context audit — 12 October 2026

## Cosmic Forge source UI

The three battery rows in `cosmicForge/cosmicForge/drawTab2Content.js` name each purchase action with the added capacity (`buttonAddCapacityMj`), then show its price in the row description. For example, Battery 1 is at lines 26–58; Batteries 2 and 3 repeat that structure at lines 68–100 and 110–142.

## MIAPLACIDUS target UI

At the initial P-51 review, the active Batteries child in `src/app/EconomyPanes.tsx` named single purchases only “Buy.” The card separately showed its battery name, capacity, and current price. Buy Max showed its total-cost/capacity preview in separate text. The disabled reasons and InfoTooltip were already associated with their controls. The localized action-label follow-up below records the current button copy.

## Correction

The single-purchase button references the battery name, capacity, cost, and any affordability reason. Buy Max references the same details plus its total-cost/capacity preview and any bulk affordability reason. This control-context change does not alter calculations, purchases, or tooltip behavior.

## Localized action label follow-up (12 October 2026)

The source single-purchase label says `Add {capacity} MJ`. The remake now states the matching effect directly on each active Batteries child purchase button in all six locales, using the remake's displayed kJ unit (`Add {capacity} kJ`, with localized wording elsewhere). The number is formatted for the active locale and uses the same capacity as the card. This corrects the visible action-copy gap without changing the child mapping, purchase behavior, or capacity calculation.

This was a static source/renderer comparison. No tests, builds, typechecks, formatting checks, or browser review were run. P-51 remains open for the remaining six-locale, price-row, tooltip, modal, layout, and rendered evidence.
