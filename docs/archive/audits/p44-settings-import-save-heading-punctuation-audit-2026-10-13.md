# P-44 Settings Import Save heading punctuation audit (13 October 2026)

Cosmic Forge renders `tab9ImportSaveRowLabel` above the import field in [`drawTab9Content.js:670-674`](../../../../cosmicForge/cosmicForge/drawTab9Content.js#L670). MIAPLACIDUS now uses the source wording, including its colon, for the Import Save section heading in [`SaveManager.tsx:427-429`](../../../src/app/SaveManager.tsx), backed by the six-locale `import` message in [`saveMessages.ts`](../../../src/i18n/saveMessages.ts). The target's separate field label remains associated with the textarea.

| Locale | Source/target Import Save heading |
| --- | --- |
| en | Import Save: |
| es | Importar Partida: |
| pt | Importar Partida: |
| de | Spielstand Importieren: |
| it | Importa Salvataggio: |
| fr | Importer la Sauvegarde: |

The earlier target heading omitted the source punctuation; that adaptation is superseded. This changes only the heading copy; import controls and behavior are unchanged.

Static source-to-renderer comparison only. No tests, builds, typechecks, formatting, or browser review were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
