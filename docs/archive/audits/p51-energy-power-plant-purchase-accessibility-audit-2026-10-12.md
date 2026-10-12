# P-51 Energy Power plant purchase context audit — 12 October 2026

## Cosmic Forge source UI

In `cosmicForge/cosmicForge/drawTab2Content.js`, plant purchase buttons announce the generation effect: the standard plants use `buttonAddRateKjPerSecond` (for example, lines 183 and 363), while the Solar Power Plant uses `buttonAddMaxRateKjPerSecond` (line 273). The plant row also supplies its price, fuel information, and other guidance.

## MIAPLACIDUS target UI

The active Power child in `src/app/EconomyPanes.tsx` names single purchases “Buy.” Its cards separately display the plant name, current generation/fuel rate, plant-specific guidance, price, and Buy Max count/cost/result preview. Before this change, the purchase controls referenced only their conditional affordability reasons.

## Correction

Single-purchase controls now reference the plant name, displayed generation/fuel rate, plant-specific guidance, price, and any affordability reason. Buy Max also references its count/cost/result preview and bulk affordability reason. Existing visible copy and power behavior are unchanged.

For Solar, the source purchase label calls its value a maximum rate and the source displays weather-adjusted current output separately. The target's adjacent per-plant figure is calculated from the content rate, the optimized-grid perk, and the stored environmental multiplier. It is not the same as the source maximum-rate formula or the target tick plan's effective Solar generation, which also applies O-type, weather, news, and megastructure modifiers. The target labels the action "Buy" and now labels the adjacent figure "Nominal output per plant" in all six locales, making the value's role explicit without changing its formula. See the P-44 crosswalk for the remaining formula distinction. No plant rate or environmental calculation changed here.

This was a static source/renderer comparison. No tests, builds, typechecks, formatting checks, or browser review were run. P-51 remains open for the remaining six-locale, price-row, tooltip, modal, layout, and rendered evidence.
