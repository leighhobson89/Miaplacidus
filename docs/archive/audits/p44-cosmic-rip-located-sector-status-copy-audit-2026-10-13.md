# P-44 Cosmic Rip located-sector status copy audit — 13 October 2026

**Scope:** compare the found-state Situation status and sector placeholder with Cosmic Forge's active Cosmic Rip renderer.

Cosmic Forge updates the Situation status row in [`game.js:1546-1577`](../../../../cosmicForge/cosmicForge/game.js#L1546-L1577). When the Rip has been found and no later research status takes precedence, it formats `textLocatedInSector` with the found sector name. The scanner's sector list is the nine stable IDs initialized in [`drawTab8Content.js:424-430`](../../../../cosmicForge/cosmicForge/drawTab8Content.js#L424-L430).

| Locale | `textLocatedInSector` |
| --- | --- |
| en | `Located in Sector {sector}` |
| es | `Localizado en el sector {sector}` |
| pt | `Localizado no setor {sector}` |
| de | `Im Sektor {sector} lokalisiert` |
| it | `Localizzato nel settore {sector}` |
| fr | `Localisé dans le secteur {sector}` |

MIAPLACIDUS adds `locatedInSector` to [`cosmicRipMessages.ts`](../../../src/i18n/cosmicRipMessages.ts) and binds it in [`CosmicRipPane.tsx:136-149`](../../../src/app/CosmicRipPane.tsx#L136-L149). The pane substitutes the same `MIAPLAC-*` sector ID and renders the status in the Situation panel at line 266. Later technology-status copy retains precedence, and the separate scanner discovery narrative is unchanged.

Static source/catalogue/renderer comparison only. No tests, builds, typechecks, formatting, or browser checks were run. P-44 remains open.
