# P-44 Settings custom-pointer label copy audit — 12 October 2026

Compared Cosmic Forge's Settings > Visual custom-pointer toggle with the MIAPLACIDUS checkbox renderer. Source `drawTab9Content.js` reads `tab9CustomPointerRowLabel`; the target reads the `customPointer` value from `settingsMessages.ts` inside the inline checkbox label in `SettingsPane.tsx`.

| Locale | Cosmic Forge `tab9CustomPointerRowLabel` | MIAPLACIDUS inline checkbox label |
|---|---|---|
| English | `Custom Pointer:` | `Custom Pointer` |
| Spanish | `Puntero Personalizado:` | `Puntero Personalizado` |
| Portuguese | `Ponteiro Personalizado:` | `Ponteiro Personalizado` |
| German | `Eigener Mauszeiger:` | `Eigener Mauszeiger` |
| Italian | `Puntatore Personalizzato:` | `Puntatore Personalizzato` |
| French | `Curseur Personnalisé:` | `Curseur Personnalisé` |

The localized wording and capitalization now match in all six locales. The target omits the source row label's trailing colon because it renders directly beside the toggle as an inline checkbox label. No Settings destination, control behavior, or other copy changed. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab9Content.js:258-267` and the `tab9CustomPointerRowLabel` entries in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: `src/app/SettingsPane.tsx` and the `customPointer` entries in `src/i18n/settingsMessages.ts`.

Static source/catalogue review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
