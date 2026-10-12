# P-44 Top Status copy audit — 12 October 2026

## Scope and evidence

Compared the source Top Status markup, dynamic Antimatter label, tooltip construction, and target `TopStatusBar.tsx` renderer against all six locale blocks (`en`, `es`, `pt`, `de`, `it`, `fr`). `index.html` declares the Cash, Energy, Powered, and Battery labels at [the status strip](../../../../cosmicForge/cosmicForge/index.html#L27). Its Antimatter cell starts with a literal label, then [`updateAntimatterStat()`](../../../../cosmicForge/cosmicForge/game.js#L5064) uses localized `statLabelAntimatter` after unlock or on later runs. The cash tooltip uses `tooltipCashLabel` in [`ui.js`](../../../../cosmicForge/cosmicForge/ui.js#L8016); `buildEnergyTooltipContent()` uses the net, generated, consumed, Generators, and Consumers keys ([`ui.js`](../../../../cosmicForge/cosmicForge/ui.js#L7637)). Source locale values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1628).

In the remake, `CashBalance` uses separate `cash` and `cashTooltip` keys. The energy tooltip renders its five source headings in `TopStatusBar.tsx`, and the Antimatter row uses `antimatter`. The owner-directed source stat3/stat4 combination remains a single keyboard-operable `Power` status/toggle, with battery details in its value and tooltip; it has no separate Powered or Battery label in the remake ([navigation contract](../../plans/presentation-navigation-contract.md#top-status-strip)). The target's different Antimatter visibility gate is also the documented presentation decision in that contract.

## Corrections and dispositions

The cash label and power-tooltip headings had source-copy drift. The visible cash label now follows `statLabelCash`, while its tooltip uses the distinct source `tooltipCashLabel`; this preserves Spanish `Efectivo` versus `Dinero` and Italian `Contante` versus `Denaro`. The five energy-tooltip headings now follow their source keys in all six locales. The target omits source trailing colons on top-stat labels, and its tooltip adds separators in the renderer; `cashTooltip` retains the source colon because it is a standalone heading.

| Target key → Cosmic Forge key | EN | ES | PT | DE | IT | FR |
| --- | --- | --- | --- | --- | --- | --- |
| `cash` → `statLabelCash` | Cash | Efectivo | Dinheiro | Bargeld | Contante | Argent |
| `cashTooltip` → `tooltipCashLabel` | Cash: | Dinero: | Dinheiro: | Bargeld: | Denaro: | Argent: |
| `energy` → `statLabelEnergy` | Energy | Energía | Energia | Energie | Energia | Énergie |
| `antimatter` → `statLabelAntimatter` | Antimatter | Antimateria | Antimatéria | Antimaterie | Antimateria | Antimatière |
| `net` → `tooltipNetEnergyLabel` | Net Energy | Energía neta | Energia líquida | Nettoenergie | Energia netta | Énergie nette |
| `generated` → `tooltipTotalGeneratedLabel` | Total Generated | Total generado | Total gerado | Insgesamt erzeugt | Totale generato | Total produit |
| `consumed` → `tooltipTotalConsumedLabel` | Total Consumed | Total consumido | Total consumido | Insgesamt verbraucht | Totale consumato | Total consommé |
| `generators` → `tooltipHeadingGenerators` | Generators | Generadores | Geradores | Erzeuger | Generatori | Générateurs |
| `consumers` → `tooltipHeadingConsumers` | Consumers | Consumidores | Consumidores | Verbraucher | Consumatori | Consommateurs |

The target `Power` label remains the owner-directed combination of source stat3 and stat4; it is not treated as a direct copy of `statLabelPowered`. No separate Battery label is rendered. The dynamically localized Antimatter label already matches its source values. The target omits some source punctuation by design, while the colon after tooltip headings is supplied by the renderer.

No tests, builds, typechecks, browser work, or save interaction were run; this was a static source-to-renderer and localization comparison.
