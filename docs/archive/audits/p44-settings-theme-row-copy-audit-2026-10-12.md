# P-44 Settings theme-row copy audit — 12 October 2026

Compared Cosmic Forge's Visual settings theme row with `SettingsPane.tsx` and `settingsMessages.ts`. The nine theme option labels and the row description already matched their source entries. The row label was missing the source colon in every locale; added it to the target `theme` label, which is also used for the select's accessible name.

| Locale | Source `tab9ThemeRowLabel` | Target `theme` |
|---|---|---|
| English | `Theme:` | `Theme:` |
| Spanish | `Tema:` | `Tema:` |
| Portuguese | `Tema:` | `Tema:` |
| German | `Design:` | `Design:` |
| Italian | `Tema:` | `Tema:` |
| French | `Thème:` | `Thème:` |

Source UI evidence: `../../../../cosmicForge/cosmicForge/drawTab9Content.js:128-149`; source locale keys in `../../../../cosmicForge/cosmicForge/localization.json` include `tab9ThemeRowLabel`, `dropdownTheme*`, and `tab9ThemeRowDescription`. Target evidence: `src/app/SettingsPane.tsx` and `src/i18n/settingsMessages.ts` (`theme`, `themes`, and `themeRowDescription`).

The nine theme options, their order, theme behavior, and six Settings destinations are unchanged. No tests, builds, typechecks, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
