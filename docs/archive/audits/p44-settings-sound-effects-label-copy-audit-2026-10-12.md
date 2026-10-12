# P-44 Settings Game Options sound-effects label audit — 12 October 2026

Compared Cosmic Forge's Game Options sound-effects checkbox with the MIAPLACIDUS Settings renderer. The source row reads `tab9SfxRowLabel`; the remake renders `settingsMessages.soundEffects` beside the inline checkbox in `SettingsPane.tsx`.

| Locale | Cosmic Forge source label | MIAPLACIDUS checkbox label |
|---|---|---|
| English | `Sound Effects:` | `Sound Effects` |
| Spanish | `Efectos de Sonido:` | `Efectos de Sonido` |
| Portuguese | `Efeitos Sonoros:` | `Efeitos Sonoros` |
| German | `Soundeffekte:` | `Soundeffekte` |
| Italian | `Effetti Sonori:` | `Effetti Sonori` |
| French | `Effets Sonores:` | `Effets Sonores` |

The target wording and capitalization now match in all six locales; the source colon is omitted for the inline checkbox-label structure. Settings destinations and sound behavior are unchanged. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab9Content.js:537` and `tab9SfxRowLabel` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the checkbox in `src/app/SettingsPane.tsx` and `soundEffects` in `src/i18n/settingsMessages.ts`.

Static source/catalogue review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
