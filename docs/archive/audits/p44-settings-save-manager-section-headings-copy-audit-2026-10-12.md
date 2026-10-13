# P-44 Settings Save & Loading section-heading copy audit

**Date:** 12 October 2026

**Scope:** the Export Save and Import Save section headings, across all six locales.

Cosmic Forge renders `tab9ExportSaveRowLabel` and `tab9ImportSaveRowLabel` as the row labels above the corresponding controls in [`drawTab9Content.js:631-680`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L631-L680); the six locale values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1758). MIAPLACIDUS renders separate headings for those sections in [`SaveManager.tsx:376,418`](../../../src/app/SaveManager.tsx#L376), using the six-locale `export` and `import` strings in [`saveMessages.ts`](../../../src/i18n/saveMessages.ts).

| Locale | Cosmic Forge Export / Import row labels | MIAPLACIDUS Export / Import headings |
| --- | --- | --- |
| en | Export Save: / Import Save: | Export Save / Import Save |
| es | Exportar Partida: / Importar Partida: | Exportar Partida / Importar Partida |
| pt | Exportar Partida: / Importar Partida: | Exportar Partida / Importar Partida |
| de | Spielstand Exportieren: / Spielstand Importieren: | Spielstand Exportieren / Spielstand Importieren |
| it | Esporta Salvataggio: / Importa Salvataggio: | Esporta Salvataggio / Importa Salvataggio |
| fr | Exporter la Sauvegarde: / Importer la Sauvegarde: | Exporter la Sauvegarde / Importer la Sauvegarde |

The target omits the source row-label colon because these strings are standalone section headings and accessible labels. The clipboard Export and Import actions, file operations, save format, and Settings ownership are unchanged; the clipboard-export button already uses the source `buttonExport` copy.

Static source-to-renderer review only. No tests, builds, typechecks, formatting, or browser checks were run; P-44 remains open for the remaining catalogue and rendered-locale evidence.

## Export heading punctuation follow-up (13 October 2026)

The earlier statement that both target headings omit source punctuation is superseded: Export Save and Import Save now preserve their source colons in all six locales. See the [Export Save heading punctuation audit](p44-settings-export-save-heading-punctuation-audit-2026-10-13.md) and [Import Save heading punctuation audit](p44-settings-import-save-heading-punctuation-audit-2026-10-13.md). No tests or browser review were run.
