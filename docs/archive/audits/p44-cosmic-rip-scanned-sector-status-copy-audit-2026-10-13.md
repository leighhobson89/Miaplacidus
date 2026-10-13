# P-44 Cosmic Rip scanned-sector status copy audit

**Date:** 13 October 2026

**Scope:** the completed-scan status displayed on Cosmic Rip sector controls, across all six locales.

Cosmic Forge refreshes scanned sector controls with `textSectorScanned` ([`game.js:1782`](../../../../cosmicForge/cosmicForge/game.js#L1782)); the source translations are in [`localization.json:1801`](../../../../cosmicForge/cosmicForge/localization.json#L1801) and the corresponding locale entries. MIAPLACIDUS uses the scoped `sectorScanned` message in both the scanned sector's visible status and its accessible name ([`CosmicRipPane.tsx:364,378`](../../../src/app/CosmicRipPane.tsx); [`cosmicRipMessages.ts`](../../../src/i18n/cosmicRipMessages.ts)).

| Locale | Cosmic Forge `textSectorScanned` | MIAPLACIDUS `sectorScanned` |
| --- | --- | --- |
| en | SCANNED! | SCANNED! |
| es | ¡ESCANEADO! | ¡ESCANEADO! |
| pt | ANALISADO! | ANALISADO! |
| de | GESCANNT! | GESCANNT! |
| it | SCANSIONATO! | SCANSIONATO! |
| fr | SCANNÉ! | SCANNÉ! |

The correction is limited to the completed-scan label and accessible text. Sector scan costs, status transitions, and navigation are unchanged.

Static source-to-renderer comparison only. No tests, builds, typechecks, formatters, or browser checks were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
