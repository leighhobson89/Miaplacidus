# P-44 Research Tech Tree researched-status copy audit

**Date:** 13 October 2026

**Scope:** the researched-node status text and its accessible label, across all six locales.

Cosmic Forge uses `textResearched` for a completed Technology node (`ui.js:9879`). The source translations are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L2532). MIAPLACIDUS now uses a scoped `researchTechResearched` message for both the visible Tech Tree status and the node's ARIA label in [`EconomyPanes.tsx:2213,2240`](../../../src/app/EconomyPanes.tsx), with the six-locale values in [`economyMessages.ts`](../../../src/i18n/economyMessages.ts).

| Locale | Cosmic Forge `textResearched` | MIAPLACIDUS `researchTechResearched` |
| --- | --- | --- |
| en | RESEARCHED | RESEARCHED |
| es | INVESTIGADO | INVESTIGADO |
| pt | INVESTIGADO | INVESTIGADO |
| de | ERFORSCHT | ERFORSCHT |
| it | RICERCATO | RICERCATO |
| fr | RECHERCHÉ | RECHERCHÉ |

The correction is limited to the researched Tech Tree node state. The broader Research building copy, Tech Tree page ownership, prerequisites, costs, and research behavior are unchanged.

Static source-to-renderer comparison only. No tests, builds, typechecks, formatters, or browser checks were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
