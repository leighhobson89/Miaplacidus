# P-44 Energy Storage help copy audit — 13 October 2026

Cosmic Forge binds the Energy Storage description to `headerDescEnergyStorage` in [`descriptions.js`](../../../../cosmicForge/cosmicForge/descriptions.js#L452). The source text explains that buildings beyond level one require energy and that energy can be stored there (`localization.json:73, 2696, 5319, 7942, 10565, 13188`).

MIAPLACIDUS renders `batteryStorageHelp` on the Batteries page (`src/app/EconomyPanes.tsx:2679`). The target's extra sentence about storing surplus energy and supplying it when generators fall short has been removed in all six locales; the remaining description matches the source copy. Battery mechanics and the owner-directed Energy page structure are unchanged.

This is a static source-to-renderer comparison. No tests or browser rendering were run; P-44 remains open for the wider localization and presentation review.
