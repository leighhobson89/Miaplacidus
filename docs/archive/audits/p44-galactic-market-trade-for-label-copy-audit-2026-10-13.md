# P-44 Galactic Market trade destination label copy audit

**Date:** 13 October 2026

**Scope:** the label between the outgoing and incoming material selectors, including the incoming selector's accessible name, across all six locales.

Cosmic Forge renders `labelFor` between the outgoing and incoming dropdowns in [`drawTab7Content.js:253`](../../../../cosmicForge/cosmicForge/drawTab7Content.js#L253). Its six localized values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json):

| Locale | Cosmic Forge `labelFor` | MIAPLACIDUS `tradeFor` |
| --- | --- | --- |
| en | For: | For: |
| es | Por: | Por: |
| pt | Por: | Por: |
| de | Für: | Für: |
| it | Per: | Per: |
| fr | Contre: | Contre: |

MIAPLACIDUS uses its typed six-locale `tradeFor` string as the incoming selector's visible label and `aria-label` in [`GalacticMarketPane.tsx:230-234`](../../../src/app/GalacticMarketPane.tsx#L230). The source-style label replaces the remake's previous “You receive” wording for this selector; the separate trade summary still explains what the player receives.

This correction changes only the incoming-selector label. Trade options, calculations, confirmation, and the separate Galactic Casino child page are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open for the broader catalogue and rendered-locale evidence.
