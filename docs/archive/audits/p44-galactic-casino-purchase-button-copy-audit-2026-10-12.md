# P-44 Galactic Casino CP purchase-button copy audit — 12 October 2026

Compared Cosmic Forge's `buttonBuy` action with the MIAPLACIDUS CP purchase button. The button now uses the source's localized wording and capitalization in all six locales:

| Locale | Button label |
|---|---|
| English | `BUY` |
| Spanish | `COMPRAR` |
| Portuguese | `COMPRAR` |
| German | `KAUFEN` |
| Italian | `ACQUISTA` |
| French | `ACHETER` |

The CP purchase section heading remains separate, and the price preview, purchase behavior, and Galactic Casino child-page ownership are unchanged. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab7Content.js:405` and `buttonBuy` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the CP purchase button in `src/app/GalacticCasinoPane.tsx` and `buy` in `src/i18n/casinoMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
