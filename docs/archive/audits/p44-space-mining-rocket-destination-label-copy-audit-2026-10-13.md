# P-44 Space Mining Rocket destination-label copy audit

**Date:** 13 October 2026

**Scope:** the Rocket child page's travel destination row label, across all six locales.

Cosmic Forge labels this row with `tab6TravelToRowLabel` ([`localization.json:1858,4481,7104,9727,12350,14973`](../../../../cosmicForge/cosmicForge/localization.json#L1858)); the target renders `rocketMessages.destination` followed by a colon in [`SpaceMiningPane.tsx:445`](../../../src/app/SpaceMiningPane.tsx), with values in [`rocketMessages.ts`](../../../src/i18n/rocketMessages.ts).

| Locale | Cosmic Forge row label | MIAPLACIDUS row label |
| --- | --- | --- |
| en | Travel To: | Travel To: |
| es | Viajar A: | Viajar A: |
| pt | Viajar Para: | Viajar Para: |
| de | Reisen Nach: | Reisen Nach: |
| it | Viaggia Verso: | Viaggia Verso: |
| fr | Voyager Vers: | Voyager Vers: |

Only the displayed row label changed. The destination choice, travel action, child ownership, and mechanics are unchanged.

Static source-catalogue and renderer comparison only. No tests, builds, typechecks, formatters, or browser checks were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
