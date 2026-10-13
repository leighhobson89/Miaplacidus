# P-44 Energy plant and battery heading punctuation audit — 13 October 2026

Cosmic Forge uses `tab2PowerPlant1RowLabel` through `tab2PowerPlant3RowLabel` and `tab2Battery1RowLabel` through `tab2Battery3RowLabel` for its six source rows ([`drawTab2Content.js:26-29, 68-71, 110-113, 161-164, 251-254, 341-344`](../../../../cosmicForge/cosmicForge/drawTab2Content.js#L26)). Their localized names and trailing colons are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1689).

MIAPLACIDUS's Energy Power and Batteries cards already used the matching six-locale `techName(locale, id)` names but omitted the source colon in the card headings. The headings now append the colon ([`EconomyPanes.tsx:2787-2790, 2951-2954`](../../../src/app/EconomyPanes.tsx#L2787); [`economyBuildingNames.ts`](../../../src/content/economyBuildingNames.ts)). This corrects punctuation only; Power and Batteries remain separate Energy destinations, and card actions and mechanics are unchanged.

Static source-to-renderer comparison only. No tests or browser rendering were run; P-44 remains open for the broader source-key catalogue and rendered-locale review.
