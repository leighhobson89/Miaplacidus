# P-44 Interstellar visible-copy audit (12 October 2026)

Compared Cosmic Forge's Interstellar menu and Star Data renderer/locales with the current MIAPLACIDUS route and renderer. Star Data remains a separate Interstellar child; the Star Map canvas remains on the Star Map child.

| Source UI key and owner | Target key and owner | Change |
|---|---|---|
| `headerMainStarData` for Cosmic Forge's Star Data child label (`index.html:505-511`; name lookup in `ui.js:3421` and child route in `ui.js:10799-10805`) | `starMapMessages.dataView`, used for the Interstellar child label and target page heading (`presentationNavigation.ts:409-411`; `App.tsx:2775-2783`; `StarMapPane.tsx:1088-1123`) | Matched all six source labels: `Star Data`, `Datos Estelares`, `Dados Estelares`, `Sterndaten`, `Dati Stellari`, `Données des Étoiles`. This restores exact capitalization in Spanish, Portuguese, and Italian and the source wording in French. No placeholders. Source locale entries are `cosmicForge/cosmicForge/localization.json:1593,4216,6839,9462,12085,14708`. |
| `textStarFuel` on the Star Data table (`cosmicForge/cosmicForge/drawTab5Content.js:676`) | `starMapMessages.fuel` in the Star Data table header (`StarMapPane.tsx:238`) | Replaced resource-only labels with the source's fuel-column labels in `en/es/pt/de/it/fr` order: `Fuel (AM)`, `Combustible (AM)`, `Combustível (AM)`, `Treibstoff (AM)`, `Carburante (AM)`, `Carburant (AM)`. No placeholders. Source locale entries are `cosmicForge/cosmicForge/localization.json:1878,4501,7124,9747,12370,14993`. |

The page ownership audit found no navigation or renderer mismatch. The changes are limited to these two six-locale copy keys. No tests, builds, browser checks, or source-tree edits were made. P-44 remains open for the wider source catalogue and rendered-locale review.
