# P-44 Settings News Ticker punctuation copy audit — 13 October 2026

**Scope:** compare the Settings > Game Options News Ticker row label, including punctuation, with the active MIAPLACIDUS checkbox caption in all six locales.

Cosmic Forge creates the option row with `labelText: localize('tab9NewsTickerRowLabel', getLanguage())` in [`drawTab9Content.js:461-465`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L461-L465). The source localization value includes a colon in every locale:

| Locale | `tab9NewsTickerRowLabel` |
| --- | --- |
| en | `News Ticker Feature:` |
| es | `Teletipo de Noticias:` |
| pt | `Teletipo de Notícias:` |
| de | `Nachrichtenticker:` |
| it | `Ticker delle Notizie:` |
| fr | `Bandeau d'Actualités:` |

MIAPLACIDUS renders `settingsText(locale, "newsTicker")` as the checkbox caption in [`SettingsPane.tsx:595`](../../../src/app/SettingsPane.tsx#L595). The six values in [`settingsMessages.ts`](../../../src/i18n/settingsMessages.ts) now preserve the source colon. The Settings control, destination, and behavior are unchanged.

This supersedes the 12 October copy audit's punctuation adaptation, which omitted the colon for the inline checkbox. Static source/catalogue/renderer comparison only; no tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open.
