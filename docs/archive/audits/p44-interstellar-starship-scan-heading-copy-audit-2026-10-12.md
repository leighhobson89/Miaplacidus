# P-44 Interstellar Starship scan heading copy audit

**Date:** 12 October 2026

**Scope:** the section heading above the Starship system-scan control, across all six locales.

Cosmic Forge renders `tab5PerformSystemScanRowLabel` before the separate `buttonScanSystem` action in `drawTab5Content.js:968-985`. MIAPLACIDUS previously used its short `scanSystem` action string for both the section heading and button. The renderer now uses a separate `performSystemScan` heading in `src/app/StarshipPane.tsx:877`, while the button keeps `scanSystem` at lines 898-902. The six-locale catalogue is `src/i18n/starshipMessages.ts`.

| Locale | Cosmic Forge `tab5PerformSystemScanRowLabel` | MIAPLACIDUS `performSystemScan` heading |
| --- | --- | --- |
| en | Perform System Scan: | Perform System Scan |
| es | Escanear el Sistema: | Escanear el Sistema |
| pt | Analisar o Sistema: | Analisar o Sistema |
| de | Systemscan Durchführen: | Systemscan Durchführen |
| it | Esegui Scansione del Sistema: | Esegui Scansione del Sistema |
| fr | Lancer le Scan du Système: | Lancer le Scan du Système |

The target omits the source row-label colon because this copy is rendered as a standalone heading. The action remains a separate control using source-matched `buttonScanSystem` copy. The source and target both keep this view under Interstellar's Starship destination; Star Map and Star Data remain separate children per the [navigation contract](../../plans/presentation-navigation-contract.md).

Static source-to-renderer review only. No tests, builds, typechecks, formatting, or browser checks were run; P-44 remains open for the remaining catalogue and rendered-locale evidence.
