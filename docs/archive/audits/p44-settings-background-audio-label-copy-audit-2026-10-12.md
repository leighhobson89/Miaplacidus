# P-44 Settings Game Options background-audio label audit — 12 October 2026

Compared Cosmic Forge's Game Options background-audio toggle with the MIAPLACIDUS Settings renderer. The source row uses `tab9BackgroundAudioRowLabel`; the target uses `settingsMessages.backgroundAudio` for the inline checkbox label.

| Locale | Cosmic Forge source label | MIAPLACIDUS checkbox label |
|---|---|---|
| English | `Background Ambience Sound:` | `Background Ambience Sound` |
| Spanish | `Sonido Ambiental de Fondo:` | `Sonido Ambiental de Fondo` |
| Portuguese | `Som Ambiente de Fundo:` | `Som Ambiente de Fundo` |
| German | `Hintergrundatmosphäre:` | `Hintergrundatmosphäre` |
| Italian | `Suono Ambientale di Sottofondo:` | `Suono Ambientale di Sottofondo` |
| French | `Ambiance Sonore de Fond:` | `Ambiance Sonore de Fond` |

The target wording and capitalization now match all six source locales. It omits the source row's trailing colon because the label is rendered inline with the checkbox. Settings destination ownership and toggle behavior are unchanged. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab9Content.js:492-503` and `tab9BackgroundAudioRowLabel` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the Game Options panel and checkbox in `src/app/SettingsPane.tsx`, using `backgroundAudio` in `src/i18n/settingsMessages.ts`.

Static source/catalogue review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
