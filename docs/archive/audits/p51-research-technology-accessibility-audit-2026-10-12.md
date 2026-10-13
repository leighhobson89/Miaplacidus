# P-51 Research and Technology prerequisite accessibility audit — 12 October 2026

## Cosmic Forge source UI

The Technology option builds each research row with a localized technology heading, a Research action, and a row description containing its price in Research Points and localized prerequisite names (`../../../../cosmicForge/cosmicForge/drawTab3Content.js:73-76,301-315`). For example, Fusion Theory has a 500-point appearance threshold, costs 750 Research Points, and lists Knowledge Sharing as its prerequisite (`../../../../cosmicForge/cosmicForge/resourceDataObject.js:876-878`).

## MIAPLACIDUS target UI

The Tech Tree keeps revealed technologies keyboard-focusable and marks unavailable actions with `aria-disabled`; the control references a tooltip containing its cost, prerequisite names, and status (`../../src/app/EconomyPanes.tsx:2215-2247`). The engine reveals technologies once current Research Points exceed their reveal threshold (`../../src/engine/commands.ts:2537-2544`), while the catalogue separately stores each price and prerequisite (`../../src/content/technology.ts:68-75`). A revealed node can therefore have both an unmet prerequisite and an RP shortfall. Before this change, its status showed the shortfall alone, and the tooltip named prerequisites without identifying which prerequisite remained unmet.

## Correction

The renderer now names every unmet prerequisite in the node status and combines that reason with any current/required/shortfall Research Points. The same status remains in the referenced tooltip, so assistive technology receives both blockers without changing the focusable node or research action. Added localized prerequisite copy for all six supported locales in `../../src/i18n/economyMessages.ts`.

This was a static source/renderer comparison. No tests, builds, typechecks, formatting checks, or browser review were run. P-51 remains open for broader E-57 review.
