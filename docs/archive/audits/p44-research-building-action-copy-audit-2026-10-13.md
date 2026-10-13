# P-44 Research building action copy audit

**Date:** 13 October 2026

**Scope:** the Science Kit, Science Club, and Science Lab purchase-button labels in all six locales.

Cosmic Forge builds each button from `buttonAddPerSecond` and `headerMainResearch` in [`drawTab3Content.js`](../../../../cosmicForge/cosmicForge/drawTab3Content.js#L130) (Science Kit), [the Science Club row](../../../../cosmicForge/cosmicForge/drawTab3Content.js#L176), and [the Science Lab row](../../../../cosmicForge/cosmicForge/drawTab3Content.js#L222). Its source data rates are 0.005, 0.08, and 0.2 per tick in [`resourceDataObject.js`](../../../../cosmicForge/cosmicForge/resourceDataObject.js#L840); [`getTimerRateRatio`](../../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js#L2393) is 100 ticks per second, producing button values 0.5, 8, and 20. The six-locale source labels are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1409). MIAPLACIDUS stores those per-second rates in [`economy.ts`](../../../src/content/economy.ts#L304) and renders the source-style action from [`EconomyPanes.tsx`](../../../src/app/EconomyPanes.tsx#L2447) with the six-locale `researchBuildingAction` template in [`economyMessages.ts`](../../../src/i18n/economyMessages.ts#L301).

| Locale | Source `buttonAddPerSecond` | Target `researchBuildingAction` | Research label |
| --- | --- | --- | --- |
| en | Add {rate} {resource} /s | Add {rate} {resource} /s | Research |
| es | Añadir {rate} {resource} /s | Añadir {rate} {resource} /s | Investigación |
| pt | Adicionar {rate} {resource} /s | Adicionar {rate} {resource} /s | Investigação |
| de | Hinzufügen {rate} {resource} /s | Hinzufügen {rate} {resource} /s | Forschung |
| it | Aggiungi {rate} {resource} /s | Aggiungi {rate} {resource} /s | Ricerca |
| fr | Ajouter {rate} {resource} /s | Ajouter {rate} {resource} /s | Recherche |

The target now interpolates the building's raw per-second rate (`0.5`, `8`, or `20`) rather than a two-decimal display value. This matches the source's rate text. Prices, purchase effects, power behavior, and the Research/Tech Tree page structure are unchanged.

Static source-to-renderer review only. No tests, builds, typechecks, formatters, or browser checks were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
