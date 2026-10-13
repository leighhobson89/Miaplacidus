# P-44 Galactic Megastructure research action copy audit — 13 October 2026

Cosmic Forge renders the Megastructures diagram and information table from `drawTab7Content.js` (`createMegaStructureDiagram()` / `createMegaStructureTable()`, around lines 1832–1855). The technology action uses the generic localized `buttonResearch` key, whose six values are Research, Investigar, Investigar, Erforschen, Ricerca, and Rechercher.

MIAPLACIDUS renders the next-stage action through `MegastructurePane.tsx` and `megastructureMessages.ts`. Its former labels (“Research stage” and localized equivalents) added wording absent from the source. The action now uses the source values in all six locales. Stage descriptions and names remain distinct; no research mechanics or page ownership changed. The target's insufficient-Research and missing-prerequisite helper sentences are additional copy for its custom next-stage control: the source Megastructures page has no equivalent localized sentence, though it shows price/prerequisite details and disabled/red styling. The Galactic power-grid toggle is not part of this renderer.

This was a static source-to-renderer comparison. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for the rest of the source catalogue and rendered review.
