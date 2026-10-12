# P-44 Energy Power plant rate copy audit — 12 October 2026

## Cosmic Forge source

The source presents Solar Power Plant as a distinct Energy child option. Its purchase action in `cosmicForge/cosmicForge/drawTab2Content.js:251-324` uses `buttonAddMaxRateKjPerSecond` (`:273`), whose localized label includes the maximum added rate. The value uses the plant rate, the current-system O-type boost, and the timer-rate ratio; it does not use the weather multiplier. The source's current Solar output is a separate readout (`game.js:4785-4790`; `ui.js:8528-8553`) and includes weather efficiency.

## MIAPLACIDUS renderer

The owner-directed Energy `Power` child groups the source power-plant options together. In `src/app/EconomyPanes.tsx:2573-2793`, the Solar card's purchase control says `Buy`, while its associated per-plant figure is rendered beside the card. That figure uses the plant's content rate, the `optimizedPowerGrids` perk multiplier, and the stored `environmentalMultiplier` (`:2671-2673,2741`). It does not label the figure as a maximum or as a weather-adjusted live output. The effective Solar generation in `src/engine/economySimulation.ts:175-183` also applies the assigned/current O-type multiplier, weather, News Ticker, and Megastructure modifiers.

The Power card now labels its unchanged figure **Nominal output per plant** in all six locales. This makes clear that the adjacent amount is the remake's nominal per-plant display, not an exact translation of the source maximum-rate amount or live generated output. The owner-directed Power page ownership remains unchanged. The formula difference is still documented; no power mechanics changed.

Static source/renderer trace and localized label change only. No tests, builds, typechecks, formatting, or browser review ran. P-44 and P-51 remain open.
