# P-44 Settings Visual Currency label copy audit — 12 October 2026

Compared Cosmic Forge's Visual Currency row label with the MIAPLACIDUS Currency select. The source uses `tab9CurrencyRowLabel`; the target uses `settingsMessages.currency` on that select label only.

| Locale | Cosmic Forge source label | MIAPLACIDUS select label |
|---|---|---|
| English | `Currency:` | `Currency:` |
| Spanish | `Moneda:` | `Moneda:` |
| Portuguese | `Moeda:` | `Moeda:` |
| German | `Währung:` | `Währung:` |
| Italian | `Valuta:` | `Valuta:` |
| French | `Devise:` | `Devise:` |

The localized wording and row colon now match in all six locales. The target's currency selector and behavior remain unchanged. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab9Content.js:169` and `tab9CurrencyRowLabel` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the select label in `src/app/SettingsPane.tsx` and `currency` in `src/i18n/settingsMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
