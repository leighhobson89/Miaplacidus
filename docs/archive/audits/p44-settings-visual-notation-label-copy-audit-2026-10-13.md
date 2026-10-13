# P-44 Settings Visual notation label copy audit

**Date:** 13 October 2026

**Scope:** the Settings > Visual notation control label and accessible name in all six locales.

Cosmic Forge renders `tab9NotationRowLabel` for the notation selector in [`drawTab9Content.js:205-214`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L205-L214), with localized values in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json). The source label is `Notation:` in English, German, and French; `Notación:` in Spanish; `Notação:` in Portuguese; and `Notazione:` in Italian.

MIAPLACIDUS renders `settingsText(locale, "notation")` as both the visible label and `aria-label` for `#settings-notation` in [`SettingsPane.tsx:274-279`](../../../src/app/SettingsPane.tsx#L274-L279). The `notation` values in [`settingsMessages.ts`](../../../src/i18n/settingsMessages.ts) now match the source in all six locales.

| Locale | Cosmic Forge `tab9NotationRowLabel` | MIAPLACIDUS `notation` |
| --- | --- | --- |
| en | Notation: | Notation: |
| es | Notación: | Notación: |
| pt | Notação: | Notação: |
| de | Notation: | Notation: |
| it | Notazione: | Notazione: |
| fr | Notation: | Notation: |

This changes only the row label and accessible name. The selected notation behavior and Settings > Visual ownership are unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open for the wider catalogue and rendered-locale evidence.
