# P-51 Resource and Compound storage purchase context audit — 12 October 2026

## Cosmic Forge source UI

Cosmic Forge creates storage controls and their price rows separately. The Helium row uses a localized Increase Storage button and displays the current storage price beside it (`cosmicForge/cosmicForge/drawTab1Content.js:405-440`). The Compound Diesel row follows the same pattern (`cosmicForge/cosmicForge/drawTab4Content.js:130-162`).

## MIAPLACIDUS target UI

The active Resource and Compound child pages share `GoodStorageCard` in `src/app/EconomyPanes.tsx`. It displays localized storage guidance, the current-to-next capacity, and the dynamic cost. Water also displays its secondary Concrete cost. Before this correction, the purchase button described only its affordability reason.

## Correction

The button now references the localized good identity, optional storage guidance, capacity transition, full displayed cost, and any current failure reason through `aria-describedby`. Visible copy, calculations, and purchase behavior are unchanged.

This was a static source/renderer review. No tests, builds, typechecks, formatting checks, or browser review were run. P-51 remains open for the broader six-locale price-row, tooltip, modal, dynamic-cost, and layout evidence under E-57.
