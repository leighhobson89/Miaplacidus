# P-44 Settings News Ticker label copy audit — 12 October 2026

Compared Cosmic Forge's Game Options `tab9NewsTickerRowLabel` with the MIAPLACIDUS inline News Ticker checkbox label. The six target values now match the source wording and capitalization while omitting the source row colon, which does not fit the inline checkbox structure.

| Locale | Checkbox label |
|---|---|
| English | `News Ticker Feature` |
| Spanish | `Teletipo de Noticias` |
| Portuguese | `Teletipo de Notícias` |
| German | `Nachrichtenticker` |
| Italian | `Ticker delle Notizie` |
| French | `Bandeau d'Actualités` |

The Settings control, destination, and behavior are unchanged. Source evidence: `../../../../cosmicForge/cosmicForge/drawTab9Content.js` and `tab9NewsTickerRowLabel` in `../../../../cosmicForge/cosmicForge/localization.json`. Target evidence: the checkbox in `src/app/SettingsPane.tsx` and `newsTicker` in `src/i18n/settingsMessages.ts`.

Static source/catalogue and renderer review only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.

**Superseded punctuation note (13 October 2026):** a direct source-row recheck found that the actual `tab9NewsTickerRowLabel` includes a colon and is passed as the option row's label text. MIAPLACIDUS now preserves that colon in the checkbox caption. See the [punctuation follow-up audit](p44-settings-news-ticker-punctuation-copy-audit-2026-10-13.md); the 12 October table records the earlier wording-only adaptation.
