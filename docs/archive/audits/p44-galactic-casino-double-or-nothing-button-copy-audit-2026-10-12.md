# P-44 Galactic Casino Double or Nothing button-copy audit — 12 October 2026

Compared the Double or Nothing action button in Cosmic Forge's Casino renderer with the corresponding target game card. Source calls `buttonSpin`; the MIAPLACIDUS card now uses a dedicated `doubleOrNothingSpin` message so it remains distinct from the longer wheel action label.

| Locale | Cosmic Forge `buttonSpin` | MIAPLACIDUS Double or Nothing button |
|---|---|---|
| English | `SPIN` | `SPIN` |
| Spanish | `GIRAR` | `GIRAR` |
| Portuguese | `GIRAR` | `GIRAR` |
| German | `DREHEN` | `DREHEN` |
| Italian | `GIRA` | `GIRA` |
| French | `TOURNER` | `TOURNER` |

The target action copy now matches all six source values. Casino remains a distinct child page under Galactic; the wheel keeps its separate `buttonSpinWheel` wording. No game action or navigation changed. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab7Content.js:452` and the six-locale `buttonSpin` values in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the Double or Nothing button in `src/app/GalacticCasinoPane.tsx` and `doubleOrNothingSpin` in `src/i18n/casinoMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
