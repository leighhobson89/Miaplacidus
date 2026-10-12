# P-44 Galactic Casino Higher or Lower start-button copy audit — 12 October 2026

Compared Cosmic Forge's idle Higher or Lower action with the MIAPLACIDUS game-start button. The target `start` key now matches source `buttonPlay` in all six locales:

| Locale | Start button |
|---|---|
| English | `PLAY` |
| Spanish | `JUGAR` |
| Portuguese | `JOGAR` |
| German | `SPIELEN` |
| Italian | `GIOCA` |
| French | `JOUER` |

MIAPLACIDUS retains its separate accessible entry-cost description and its existing start action. The active-round cash-out control remains distinct. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab7Content.js:1404,1560` and `buttonPlay` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the idle action in `src/app/GalacticCasinoPane.tsx` and `start` in `src/i18n/casinoMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
