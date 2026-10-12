# P-44 Galactic Casino Higher or Lower cash-out button copy audit — 12 October 2026

Compared Cosmic Forge's active Higher or Lower cash-out action with the MIAPLACIDUS active-round button. Target `cashOut` now matches source `buttonCashOut` in all six locales:

| Locale | Cash-out button |
|---|---|
| English | `CASH OUT` |
| Spanish | `RETIRARSE` |
| Portuguese | `SAIR` |
| German | `AUSZAHLEN` |
| Italian | `INCASSA` |
| French | `ENCAISSER` |

The source result notification remains a separate message, and the target keeps its current-round prize context, cash-out eligibility, and action behavior. Casino remains its own Galactic child page. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab7Content.js:1427` and `buttonCashOut` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the active-round control in `src/app/GalacticCasinoPane.tsx` and `cashOut` in `src/i18n/casinoMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
