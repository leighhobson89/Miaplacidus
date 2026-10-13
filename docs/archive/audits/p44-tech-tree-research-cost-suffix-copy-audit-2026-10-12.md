# P-44 Tech Tree Research cost suffix copy audit

**Date:** 12 October 2026

**Scope:** the currency suffix shown beside each Tech Tree node cost, across all six locales.

Cosmic Forge's Technology option uses `textResearchPointsSuffix` in its row descriptions; the source mapping is visible at [`drawTab3Content.js:283`](../../../../cosmicForge/cosmicForge/drawTab3Content.js#L283), and the locale values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L2077). The owner-directed remake consolidates the source Technology option into its Tech Tree page. Its node-cost renderer now uses the dedicated `researchCostSuffix` in [`EconomyPanes.tsx:2267`](../../../src/app/EconomyPanes.tsx#L2267), with values in [`economyMessages.ts`](../../../src/i18n/economyMessages.ts).

| Locale | Cosmic Forge `textResearchPointsSuffix` | MIAPLACIDUS `researchCostSuffix` |
| --- | --- | --- |
| en | Research | Research |
| es | de Investigación | de Investigación |
| pt | de Investigação | de Investigação |
| de | Forschung | Forschung |
| it | di Ricerca | di Ricerca |
| fr | de Recherche | de Recherche |

The previous target label was the broader “points.” The correction changes only the displayed cost suffix. The Research and Tech Tree page structure and technology costs/actions are unchanged.

Static source-to-renderer review only. No tests, builds, typechecks, formatting, or browser checks were run; P-44 remains open for the remaining catalogue and rendered-locale evidence.
