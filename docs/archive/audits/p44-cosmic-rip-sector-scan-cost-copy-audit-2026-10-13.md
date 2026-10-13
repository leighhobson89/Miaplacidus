# P-44 Cosmic Rip sector scan cost copy audit

**Date:** 13 October 2026

**Scope:** the scan-cost message on each unscanned Cosmic Rip sector control, including its accessible status, in all six locales.

Cosmic Forge renders `textSectorScanCost` on each unscanned-sector overlay and substitutes the formatted cost (`drawTab8Content.js:513`). Its localized source values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1802):

| Locale | Cosmic Forge `textSectorScanCost` | MIAPLACIDUS `sectorScanCost` |
| --- | --- | --- |
| en | Scan {cost} GP | Scan {cost} GP |
| es | Escanear {cost} GP | Escanear {cost} GP |
| pt | Analisar {cost} GP | Analisar {cost} GP |
| de | Scannen {cost} GP | Scannen {cost} GP |
| it | Scansiona {cost} GP | Scansiona {cost} GP |
| fr | Scanner {cost} GP | Scanner {cost} GP |

MIAPLACIDUS substitutes the current formatted cost through `sectorScanCost` and uses it both for the visible button text and the accessible status of unscanned sectors ([`CosmicRipPane.tsx:133,364-379`](../../../src/app/CosmicRipPane.tsx#L133)). The corrected catalogue entry is in [`cosmicRipMessages.ts`](../../../src/i18n/cosmicRipMessages.ts). Scanned sectors keep their separate completed-status label, documented in the [scanned-sector audit](p44-cosmic-rip-scanned-sector-status-copy-audit-2026-10-13.md).

The copy correction does not change scan cost, eligibility, or Cosmic Rip navigation. Static source-to-renderer comparison only; no tests, builds, or rendered browser review were run. P-44 remains open for the wider catalogue and rendered-locale evidence.
