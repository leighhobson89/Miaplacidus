# P-44 Energy Batteries capacity-button copy audit — 12 October 2026

Compared the three battery purchase controls in Cosmic Forge's Energy Storage option with the MIAPLACIDUS Energy > Batteries renderer. All source buttons use `buttonAddCapacityMj`, replacing `{capacity}` with `Math.floor(capacity / 1000)`. The remake now uses the same message wording, MJ unit, and floor conversion for its battery purchase control.

| Locale | Cosmic Forge source message | MIAPLACIDUS button message |
|---|---|---|
| English | `Add {capacity} MJ` | `Add {capacity} MJ` |
| Spanish | `Añadir {capacity} MJ` | `Añadir {capacity} MJ` |
| Portuguese | `Adicionar {capacity} MJ` | `Adicionar {capacity} MJ` |
| German | `{capacity} MJ Hinzufügen` | `{capacity} MJ Hinzufügen` |
| Italian | `Aggiungi {capacity} MJ` | `Aggiungi {capacity} MJ` |
| French | `Ajouter {capacity} MJ` | `Ajouter {capacity} MJ` |

The target computes the same floored MJ quantity and then uses its normal locale-aware number formatter. Purchase behavior, costs, battery definitions, page ownership, and the distinct Energy Summary/Batteries/Power destinations are unchanged. Source evidence: the `buttonAddCapacityMj` rows and three Energy Storage buttons in `../../../../cosmicForge/cosmicForge/drawTab2Content.js:32-116`, with localized values in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: `src/app/EconomyPanes.tsx` and `addEnergyCapacity` in `src/i18n/economyMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
