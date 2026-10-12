# P-44 Settings Weather Effects label copy audit — 12 October 2026

Compared Cosmic Forge's Visual Options `tab9WeatherEffectsRowLabel` with the MIAPLACIDUS Weather Effects checkbox. The six target labels now match the source wording and capitalization; the source colon is omitted for the inline checkbox.

| Locale | Checkbox label |
|---|---|
| English | `Weather Effects` |
| Spanish | `Efectos Meteorológicos` |
| Portuguese | `Efeitos Meteorológicos` |
| German | `Wettereffekte` |
| Italian | `Effetti Meteo` |
| French | `Effets Météo` |

The control and its Settings destination are unchanged. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab9Content.js:337` and `tab9WeatherEffectsRowLabel` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the checkbox in `src/app/SettingsPane.tsx` and `weatherEffects` in `src/i18n/settingsMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
