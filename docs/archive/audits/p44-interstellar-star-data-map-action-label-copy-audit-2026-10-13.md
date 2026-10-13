# P-44 Interstellar Star Data map-action label audit (13 October 2026)

Cosmic Forge adds a per-row action to each unsettled Star Data entry. `createStarShowOnMapButton` assigns `tooltipShowStarOnMap` as the source control's `title` and accessible name, and its click handler selects that star on the map ([`drawTab5Content.js:219-241,848-850`](../../../../cosmicForge/cosmicForge/drawTab5Content.js#L219)). MIAPLACIDUS now uses the same localized phrase for the visible action in the Star Data table ([`StarMapPane.tsx:319-325`](../../../src/app/StarMapPane.tsx)); its accessible name appends the specific star name. The table's `Map` column heading is a separate concise target label because the source does not render an equivalent column heading.

| Locale | Source `tooltipShowStarOnMap` and target action |
| --- | --- |
| en | Show this Star on the Star Map |
| es | Mostrar esta Estrella en el Mapa Estelar |
| pt | Mostrar esta Estrela no Mapa Estelar |
| de | Diesen Stern auf der Sternenkarte zeigen |
| it | Mostra questa Stella sulla Mappa Stellare |
| fr | Afficher cette Étoile sur la Carte Stellaire |

This is a label-only correction. The destination action still selects the corresponding system and returns to the Star Map child. Star Data remains its own Interstellar child; the map is shown only on the Star Map child.

Static source-to-renderer comparison only. No tests, builds, typechecks, formatting, or browser review were run; P-44 remains open for the broader catalogue and rendered-locale evidence.
