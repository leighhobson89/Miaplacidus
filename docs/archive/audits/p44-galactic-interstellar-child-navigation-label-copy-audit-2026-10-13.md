# P-44 Galactic and Interstellar child navigation source audit

**Date:** 13 October 2026

**Scope:** source option labels, child page ownership, and current MIAPLACIDUS route/render bindings for Galactic and Interstellar. Source UI evidence was read from Cosmic Forge markup, runtime ordering, and localized catalogues; target evidence was read from the active navigation metadata and renderer. This was a static source-to-code comparison, not a live browser review.

## Source label corrections

Cosmic Forge places these labels on actual child rows in [`index.html`](../../../../cosmicForge/cosmicForge/index.html#L682) and localizes their `data-loc` keys in [`localization.json`](../../../../cosmicForge/cosmicForge/localization.json). MIAPLACIDUS now uses separate navigation/heading strings for the same controls across all six locales.

| Source label key | en | es | pt | de | it | fr | MIAPLACIDUS destination |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `headerMainRebirth` | Rebirth | Renacimiento | Renascimento | Wiedergeburt | Rinascita | Renaissance | Galactic > Rebirth (`option1`, `RebirthPane`) |
| `headerMainGalacticMarket` | Galactic Market | Mercado Galáctico | Mercado Galáctico | Galaktischer Markt | Mercato Galattico | Marché Galactique | Galactic > Market (`option2`, `GalacticMarketPane`) |
| `headerMainAscendencyPerks` | Ascendency Perks | Beneficios de Ascendencia | Benefícios de Ascendência | Aufstiegsboni | Vantaggi di Ascendenza | Avantages d'Ascendance | Galactic > Ascendency Perks (`option3`) |
| `headerMainBlackHole` | Black Hole | Agujero Negro | Buraco Negro | Schwarzes Loch | Buco Nero | Trou Noir | Galactic > Black Hole (`option5`, `BlackHolePane`) |
| `headerMainStarMap` | Star Map | Mapa Estelar | Mapa Estelar | Sternenkarte | Mappa Stellare | Carte des Étoiles | Interstellar > Star Map (`option1`, map view) |
| `headerMainColonise` | Colonise | Colonizar | Colonizar | Kolonisieren | Colonizzare | Coloniser | Interstellar > Colonise (`option5`, Starship pane) |

The Galactic Market label change is in `MARKET_COPY.heading` in [`metaMessages.ts`](../../../src/i18n/metaMessages.ts). Rebirth uses the new `rebirthTabLabel` rather than the action-button phrase; Colonise uses `coloniseTabLabel` rather than its existing action label. Ascendency, Star Map, and Black Hole now use the source row wording in their localized title keys. These are text-only changes in [`presentationNavigation.ts`](../../../src/app/presentationNavigation.ts), [`starshipMessages.ts`](../../../src/i18n/starshipMessages.ts), [`starMapMessages.ts`](../../../src/i18n/starMapMessages.ts), and [`blackHoleMessages.ts`](../../../src/i18n/blackHoleMessages.ts).

## Ownership and renderer crosswalk

Cosmic Forge visibly orders Galactic rows as Rebirth (`option1`), Market (`option2`), Casino (`option6`), Ascendency Perks (`option3`), Megastructures (`option4`), and Black Hole (`option5`) in [`index.html:681-740`](../../../../cosmicForge/cosmicForge/index.html#L681). The target builds this same order in [`presentationNavigation.ts:224-278`](../../../src/app/presentationNavigation.ts), inserts Casino after Market only when its gate is met, and routes Casino to its own `GalacticCasinoPane` ([`App.tsx:2906`](../../../src/app/App.tsx#L2906)). Casino remains a separate child and its label already matched the source.

The source Interstellar menu is Star Map (`option1`), Star Data (`option2`), Star Ship (`option3`), Fleet Hangar (`option4`), and Colonise (`option5`) ([`index.html:489-546`](../../../../cosmicForge/cosmicForge/index.html#L489)). The target preserves the five distinct IDs and source order in [`presentationNavigation.ts:385-451`](../../../src/app/presentationNavigation.ts); `App.tsx:2930-2938` renders the map view only on Star Map and the data-table view only on Star Data. Star Data, Starship, and Fleet Hangar labels already match the mapped source wording, with the approved player-facing `Starship` spelling retained.

The source runtime orders unlocked top-level tabs by `checkOrderOfTabs()` priorities (`ui.js:10376-10400`), resolving to Resources, Compounds, Research, Energy, Space Mining, Interstellar, Galactic, Cosmic Rip, Settings. MIAPLACIDUS `GAME_TABS` preserves that sequence and appends Miaplaedia (`App.tsx:206-216`); availability filtering removes locked gameplay destinations without reordering survivors (`App.tsx:1768-1773`). The seven source documents retain individual Miaplaedia IDs and source option IDs (`presentationNavigation.ts:280-333`), and `App.tsx:3031-3045` renders each as its own section.

This correction changes labels only. Child gates, source option IDs, destination renderers, and the separate Casino and Star Data pages remain intact. No route change was indicated. No tests or browser renders were run; the P-44 catalogue and rendered-locale review remains open. See the active [presentation navigation contract](../../plans/presentation-navigation-contract.md).
