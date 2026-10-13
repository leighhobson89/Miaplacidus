# P-44 Galactic Casino header-description copy audit

**Date:** 13 October 2026

**Scope:** the Galactic Casino header description across all six locales.

Cosmic Forge selects `headerDescGalacticCasino` for the Casino header in [`descriptions.js:484`](../../../../cosmicForge/cosmicForge/descriptions.js#L484). The localized source values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json). The text ends with the separator ` - ` in every locale.

MIAPLACIDUS renders `casinoHeaderDescription(locale)` beneath the Casino title in [`GalacticCasinoPane.tsx:428`](../../../src/app/GalacticCasinoPane.tsx#L428). Its [`CASINO_HEADER_DESCRIPTION`](../../../src/i18n/casinoMessages.ts) values now preserve the source separator.

| Locale | Cosmic Forge `headerDescGalacticCasino` | MIAPLACIDUS `casinoHeaderDescription` |
| --- | --- | --- |
| en | Here you can gamble your hard earned products for instant gratification - | Here you can gamble your hard earned products for instant gratification - |
| es | Aquí puedes apostar tus productos duramente ganados por gratificación instantánea - | Aquí puedes apostar tus productos duramente ganados por gratificación instantánea - |
| pt | Aqui podes apostar os teus produtos arduamente conquistados por gratificação instantânea - | Aqui podes apostar os teus produtos arduamente conquistados por gratificação instantânea - |
| de | Hier kannst du deine hart verdienten Produkte für sofortige Befriedigung verspielen - | Hier kannst du deine hart verdienten Produkte für sofortige Befriedigung verspielen - |
| it | Qui puoi giocare d'azzardo i tuoi prodotti duramente guadagnati per gratificazione immediata - | Qui puoi giocare d'azzardo i tuoi prodotti duramente guadagnati per gratificazione immediata - |
| fr | Ici tu peux jouer tes produits durement gagnés pour une gratification instantanée - | Ici tu peux jouer tes produits durement gagnés pour une gratification instantanée - |

This is a copy-only correction. Casino controls, mechanics, and its distinct Galactic child-page ownership are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open.
