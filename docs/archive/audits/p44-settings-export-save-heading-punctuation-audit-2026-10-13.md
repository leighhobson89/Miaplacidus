# P-44 Settings Export Save heading punctuation audit (13 October 2026)

Cosmic Forge renders `tab9ExportSaveRowLabel` above the Export Save field in [`drawTab9Content.js:631-636`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L631). MIAPLACIDUS now uses the source wording, including its colon, for the Save Manager Export Save heading and textarea accessible label at [`SaveManager.tsx:385-387`](../../../src/app/SaveManager.tsx), backed by the six-locale `export` message in [`saveMessages.ts`](../../../src/i18n/saveMessages.ts).

| Locale | Source/target Export Save label |
| --- | --- |
| en | Export Save: |
| es | Exportar Partida: |
| pt | Exportar Partida: |
| de | Spielstand Exportieren: |
| it | Esporta Salvataggio: |
| fr | Exporter la Sauvegarde: |

The earlier target heading omitted the source punctuation; that adaptation is superseded for Export Save. This changes only the section label. Save generation, clipboard/file export, and import behavior are unchanged. The separate Import Save heading is outside this correction.

Static source-to-renderer comparison only. No tests, builds, typechecks, formatting, or browser review were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
