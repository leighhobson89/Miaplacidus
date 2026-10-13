# P-44 Interstellar Starship destination heading audit

**Date:** 13 October 2026

**Scope:** the destination-summary heading on Interstellar > Starship in all six locales.

Cosmic Forge renders source key `tab5TravellingToRowLabel` for the destination row in [`drawTab5Content.js:946`](../../../../cosmicForge/cosmicForge/drawTab5Content.js#L946). MIAPLACIDUS now uses the same wording in its Starship-only destination summary at [`StarshipPane.tsx:502`](../../../src/app/StarshipPane.tsx#L502), through `travellingTo` in [`starshipMessages.ts`](../../../src/i18n/starshipMessages.ts).

| Locale | Cosmic Forge `tab5TravellingToRowLabel` | MIAPLACIDUS `travellingTo` |
| --- | --- | --- |
| en | Travelling To: | Travelling To: |
| es | Viajando A: | Viajando A: |
| pt | A Viajar Para: | A Viajar Para: |
| de | Unterwegs Nach: | Unterwegs Nach: |
| it | In Viaggio Verso: | In Viaggio Verso: |
| fr | En Route Vers: | En Route Vers: |

Starship remains a distinct Interstellar child separate from Star Map and Star Data. The heading correction does not change travel behavior or routing. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open.
