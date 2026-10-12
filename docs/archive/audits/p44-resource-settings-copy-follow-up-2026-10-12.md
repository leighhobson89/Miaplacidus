# P-44 Resources, Compounds, and Save export copy follow-up

**Date:** 12 October 2026  
**Scope:** Resource and Compound storage buttons, plus the Settings Save & Loading clipboard-export action. Cosmic Forge was read only.

| Cosmic Forge source control | MIAPLACIDUS key and renderer | Correction |
|---|---|---|
| Resource and Compound storage buttons use `buttonIncreaseStorage` (`drawTab1Content.js:136,411,694,970,1246,1497,1773,2024`; `drawTab4Content.js:136,436,728,1019,1604`). The six locale values are `Increase Storage`, `Aumentar Almacenamiento`, `Aumentar Armazenamento`, `Lager Erhöhen`, `Aumenta Stoccaggio`, and `Augmenter Stockage` (`localization.json:1407,4030,6653,9276,11899,14522`). | `economyMessages.increaseStorage`, used by the Resource and Compound storage controls in `EconomyPanes.tsx:301,324,464,1311`. | Updated the target key in all six locales to match the source capitalization and wording. Storage capacity and purchase behavior are unchanged.
| Settings Save & Loading's clipboard export uses `buttonExport` (`drawTab9Content.js:634-642`; six locale entries at `localization.json:1760,4383,7006,9629,12252,14875`). | `saveMessages.copy`, rendered by the clipboard-copy button in `SaveManager.tsx:376-380`. | Changed the target action caption to `Export`, `Exportar`, `Exportar`, `Exportieren`, `Esporta`, and `Exporter`, matching the source. The action still copies the portable save code to the clipboard.

These are copy-only changes. Resource and Compound groups, Settings destinations, and save/export behavior are unchanged. P-44 remains open for the broader source catalogue and rendered-locale acceptance evidence. No tests, builds, typechecks, formatters, or browser review were run.
