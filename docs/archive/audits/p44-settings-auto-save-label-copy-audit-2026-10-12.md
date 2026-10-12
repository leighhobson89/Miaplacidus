# P-44 Settings Auto Save label copy audit — 12 October 2026

Compared Cosmic Forge's `tab9AutoSaveRowLabel` and toggle with the MIAPLACIDUS Save & Loading auto-save checkbox. The six target labels now match the source wording and capitalization; the target omits the source row colon for its inline checkbox.

| Locale | Checkbox label |
|---|---|
| English | `Auto Save` |
| Spanish | `Guardado Automático` |
| Portuguese | `Guardado Automático` |
| German | `Automatisches Speichern` |
| Italian | `Salvataggio Automatico` |
| French | `Sauvegarde Automatique` |

The checkbox, save interval, behavior, and Settings destination are unchanged. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab9Content.js:579-617` and `tab9AutoSaveRowLabel` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the checkbox in `src/app/SettingsPane.tsx` and `autoSave` in `src/i18n/saveMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
