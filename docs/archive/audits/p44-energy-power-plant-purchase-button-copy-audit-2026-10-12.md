# P-44 Energy Power plant purchase-button copy audit — 12 October 2026

Compared the three Power plant single-purchase buttons with Cosmic Forge. The source uses `buttonAddRateKjPerSecond` for Basic and Advanced Power Plants, and `buttonAddMaxRateKjPerSecond` for the Solar Power Plant. The corresponding six-locale target strings now match:

| Locale | Add rate | Add maximum rate |
|---|---|---|
| English | `Add {rate} kJ /s` | `Add (max) {rate} kJ /s` |
| Spanish | `Añadir {rate} kJ /s` | `Añadir (máx) {rate} kJ /s` |
| Portuguese | `Adicionar {rate} kJ /s` | `Adicionar (máx.) {rate} kJ /s` |
| German | `{rate} kJ /s Hinzufügen` | `(max) {rate} kJ /s Hinzufügen` |
| Italian | `Aggiungi {rate} kJ /s` | `Aggiungi (max) {rate} kJ /s` |
| French | `Ajouter {rate} kJ /s` | `Ajouter (max) {rate} kJ /s` |

MIAPLACIDUS binds the displayed rate to the target's equivalent rounded single-plant output, including Optimized Power Grids, the run-scoped Dyson multiplier, and the assigned settled O-type star boost. Its base rates already include the source timer ratio. Solar weather output is excluded from this action label, matching the source expression. The buy-max control and purchase mechanics are unchanged; the three Power plant pages remain owned by Energy > Power.

Source evidence: `../../../../cosmicForge/cosmicForge/drawTab2Content.js:183,273,363` and `buttonAddRateKjPerSecond` / `buttonAddMaxRateKjPerSecond` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: `src/app/EconomyPanes.tsx` and `addPowerPlantRate` / `addMaxPowerPlantRate` in `src/i18n/economyMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
