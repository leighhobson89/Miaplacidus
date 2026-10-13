# P-44 Interstellar Fleet Hangar Scout label audit

**Date:** 13 October 2026

**Scope:** the Scout fleet-card label on Interstellar > Fleet Hangar in all six locales.

Cosmic Forge's `fleetShipScout` label is localized in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json). MIAPLACIDUS renders `fleetScout` on the Scout fleet card in [`StarshipPane.tsx:808`](../../../src/app/StarshipPane.tsx#L808), from [`starshipMessages.ts`](../../../src/i18n/starshipMessages.ts). The German remake label was changed from `Aufklärer` to the source `Späher`; the other five already matched.

| Locale | Cosmic Forge `fleetShipScout` | MIAPLACIDUS `fleetScout` |
| --- | --- | --- |
| en | Scout | Scout |
| es | Explorador | Explorador |
| pt | Explorador | Explorador |
| de | Späher | Späher |
| it | Esploratore | Esploratore |
| fr | Éclaireur | Éclaireur |

This is a copy-only correction. Fleet Hangar remains its own Interstellar child separate from Starship, and fleet behavior is unchanged. Static source-to-renderer comparison only; no tests, builds, or browser review were run. P-44 remains open.
