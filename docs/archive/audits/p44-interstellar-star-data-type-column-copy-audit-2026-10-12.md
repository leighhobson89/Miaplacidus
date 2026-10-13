# P-44 Interstellar Star Data type-column copy audit

**Date:** 12 October 2026

**Scope:** the Star Data table's star-type column heading, across all six locales.

Cosmic Forge renders the Star Data table with `textStarType` in [`drawTab5Content.js:658`](../../../../cosmicForge/cosmicForge/drawTab5Content.js#L658). Its source values are in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json#L1875). MIAPLACIDUS previously reused the broader Star Map label (“Star type”) in the Star Data column. The table now uses a separate `dataType` message in [`StarMapPane.tsx:225`](../../../src/app/StarMapPane.tsx#L225), localized in [`starMapMessages.ts`](../../../src/i18n/starMapMessages.ts).

| Locale | Cosmic Forge `textStarType` | MIAPLACIDUS `dataType` |
| --- | --- | --- |
| en | Type | Type |
| es | Tipo | Tipo |
| pt | Tipo | Tipo |
| de | Typ | Typ |
| it | Tipo | Tipo |
| fr | Type | Type |

The change is limited to the Star Data column header; other descriptive Star Map labels remain unchanged. Navigation keeps `interstellar-star-map` and `interstellar-star-data` as separate child IDs mapped to source options 1 and 2 in [`presentationNavigation.ts:402-410`](../../../src/app/presentationNavigation.ts#L402-L410). `App.tsx` passes `view="data"` only for the Star Data child, so the map is shown on the Star Map child and the table is shown on Star Data. Starship remains a separate Interstellar destination.

Static source-to-renderer review only. No tests, builds, typechecks, formatting, or browser checks were run; P-44 remains open for the remaining catalogue and rendered-locale evidence.
