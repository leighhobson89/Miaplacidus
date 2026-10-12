# P-44 Galactic Casino wheel spin label audit — 12 October 2026

Compared the Cosmic Forge wheel action with the corresponding MIAPLACIDUS wheel control. The source uses `buttonSpinWheel`; the separate Casino child page renders `casinoMessages.spin` on its wheel button.

| Locale | Cosmic Forge `buttonSpinWheel` | MIAPLACIDUS wheel button |
|---|---|---|
| English | `SPIN WHEEL` | `SPIN WHEEL` |
| Spanish | `GIRAR LA RULETA` | `GIRAR LA RULETA` |
| Portuguese | `GIRAR A RODA` | `GIRAR A RODA` |
| German | `RAD DREHEN` | `RAD DREHEN` |
| Italian | `GIRA LA RUOTA` | `GIRA LA RUOTA` |
| French | `TOURNER LA ROUE` | `TOURNER LA ROUE` |

The wheel action label now matches the source in all six locales. The entry cost remains separate explanatory copy, and the game action and navigation are unchanged. Casino remains a distinct child page under Galactic. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab7Content.js:507` and the `buttonSpinWheel` entries in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the wheel button in `src/app/GalacticCasinoPane.tsx` and `spin` in `src/i18n/casinoMessages.ts`.

Static source/catalogue review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
