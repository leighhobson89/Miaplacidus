# P-44 Research, Interstellar, and Galactic Casino label-copy follow-up

**Date:** 12 October 2026  
**Scope:** Directly visible labels in Research Science Buildings, the Interstellar Star Map mode controls, and the Galactic Casino special-prize selector. Cosmic Forge was read only.

| Cosmic Forge source control | MIAPLACIDUS key and renderer | Correction |
|---|---|---|
| Research Science Kit, Science Club, and Science Lab counts use `textQuantity` (`drawTab3Content.js:151,197,243`; six locale entries in `localization.json:1410,4033,6656,9279,11902,14525`). | `economyMessages.researchQuantity` at `EconomyPanes.tsx:2433`. | Replaced the generic “Owned” label with the source “Quantity” label in all six locales: `Quantity`, `Cantidad`, `Quantidade`, `Menge`, `Quantità`, `Quantité`. The key is scoped to these Research counts; other pages retain their own “Owned” label.
| Star Map's Normal mode uses `starMapModeNormal` in `drawTab5Content.js:330` (`localization.json:1865,4488,7111,9734,12357,14980`). | `starMapMessages.mapModeNormal`, selected in `StarMapPane.tsx:674`. | Corrected the French value to source `Normale`; the other five locale values already matched. Star Data remains a separate Interstellar child.
| Galactic Casino's special-prize dropdown uses `casinoPrizeRocketWarp`, `casinoPrizeStarshipWarp`, `casinoPrizeTelescopeFinishAsteroidSearch`, `casinoPrizeTelescopeFinishStarStudy`, `casinoPrizeTelescopeFinishVoidPillage`, `casinoPrizeDoubleMaterial`, and `casinoPrize100kResearch` (`drawTab7Content.js:524-536`; six locale blocks in `localization.json:1987-1994,4610-4617,7233-7240,9856-9863,12479-12486,15102-15109`). | `casinoMessages.ts` special-prize entries are rendered through `specialLabel` in `GalacticCasinoPane.tsx:303-318,638-642`; dynamic names use `economyGoodName`, and the research prize uses the formatted 100,000 amount. | Matched the visible source descriptions for rocket/starship warps, all three Space Telescope outcomes, doubled material, and the 100,000 Research Points prize in all six locales. The source `{material}` placeholder maps to the remake's `{good}` before the localized good name is inserted. Casino remains a distinct Galactic child page.

These are visible-copy changes only. Research/Tech Tree, Star Map/Star Data, and Galactic/Casino page ownership, action behavior, and prize availability are unchanged. The current source-to-destination ownership evidence remains in the [presentation navigation contract](../../plans/presentation-navigation-contract.md).

Static source, catalogue, and renderer review only. No tests, builds, typechecks, formatters, or browser review were run. P-44 remains open for the broader source catalogue and rendered-locale acceptance evidence.
