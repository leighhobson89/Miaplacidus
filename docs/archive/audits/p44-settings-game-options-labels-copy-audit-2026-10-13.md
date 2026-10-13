# P-44 Settings Game Options label copy audit

**Date:** 13 October 2026

**Scope:** the Settings > Game Options language and fullscreen control labels in all six locales.

Cosmic Forge creates the fullscreen row with `tab9ToggleFullScreenRowLabel` and a `buttonToggle` action in [`drawTab9Content.js:396-412`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L396-L412). It creates the language row with `settingsLanguageRowLabel` in [`drawTab9Content.js:428-444`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L428-L444). Both labels and the button text come from [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json).

MIAPLACIDUS displays `settingsText(locale, "fullscreen")` beside a button using `settingsText(locale, "fullscreenToggle")`, and renders `settingsLabel(locale, "language")` as both the language selector's visible label and accessible name in [`SettingsPane.tsx:436-467`](../../../src/app/SettingsPane.tsx#L436-L467). Those catalogue values in [`settingsMessages.ts`](../../../src/i18n/settingsMessages.ts) now match the source in all six locales.

| Locale | Source language label | Target language label | Source fullscreen label | Target fullscreen label | Source / target button |
| --- | --- | --- | --- | --- | --- |
| en | Language: | Language: | Toggle Full Screen: | Toggle Full Screen: | Toggle |
| es | Idioma: | Idioma: | Pantalla Completa: | Pantalla Completa: | Alternar |
| pt | Idioma: | Idioma: | Ecrã Inteiro: | Ecrã Inteiro: | Alternar |
| de | Sprache: | Sprache: | Vollbild Umschalten: | Vollbild Umschalten: | Umschalten |
| it | Lingua: | Lingua: | Schermo Intero: | Schermo Intero: | Attiva |
| fr | Langue : | Langue : | Plein Écran: | Plein Écran: | Basculer |

Game Options section headings and Audio, Sound Effects, and News Ticker wording matched in the same source/target slice. The News Ticker punctuation was checked separately afterward; its source colon is now preserved in the inline caption (see the [punctuation follow-up audit](p44-settings-news-ticker-punctuation-copy-audit-2026-10-13.md)). This changes only copy; language selection, fullscreen behavior, and the Settings destination structure are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open.
