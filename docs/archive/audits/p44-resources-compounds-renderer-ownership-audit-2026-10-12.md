# P-44 Resources and Compounds renderer ownership audit — 12 October 2026

## Scope

Compared the source menu DOM, option click handlers, and page render branches with the remake's navigation groups, App routing, and active economy renderers. Source files are read-only.

## Source menu and page destinations

Cosmic Forge Resources (`../../../../cosmicForge/cosmicForge/index.html:81-215`) has two menu groups in this visible order:

- Gases: Hydrogen (`option1`), Helium (`option2`), Neon (`option4`), Oxygen (`option5`).
- Solids: Carbon (`option3`), Silicon (`option7`), Sodium (`option6`), Iron (`option8`).

The handlers select each named page and call the tab 1 content route (`../../../../cosmicForge/cosmicForge/ui.js:10514-10620`). `drawTab1Content` has an independent heading branch for all eight pages (`../../../../cosmicForge/cosmicForge/drawTab1Content.js:48, 323, 599, 882, 1158, 1434, 1685, 1961`).

Cosmic Forge Compounds (`../../../../cosmicForge/cosmicForge/index.html:373-482`) also has two menu groups:

- Liquids: Diesel (`option1`), Water (`option5`).
- Solids: Glass (`option2`), Concrete (`option4`), Steel (`option3`), Titanium (`option6`).

The tab 4 handlers select those six named pages (`../../../../cosmicForge/cosmicForge/ui.js:10710-10784`); `drawTab4Content` has a separate heading branch for each (`../../../../cosmicForge/cosmicForge/drawTab4Content.js:24, 327, 618, 910, 1201, 1494`). Option IDs are stable route identifiers, not the visible row order.

## Remake mapping and ownership

`presentationNavigation.ts` defines Resources as Gases [Hydrogen, Helium, Neon, Oxygen] then Solids [Carbon, Silicon, Sodium, Iron], and records the matching source option IDs (`src/app/presentationNavigation.ts:27-56`). It defines Compounds as Liquids [Diesel, Water] then Solids [Glass, Concrete, Steel, Titanium], also with matching source IDs (`:58-78, 172-200`). The App builds these groups from the unlocked goods and renders separate Resources and Compounds rails with tab-local selection handlers (`src/app/App.tsx:1681-1698, 2164-2195`).

Each Resource remains its own active destination: Hydrogen is routed in the Resources tab, and the remaining resource subpanels are keyed and hidden by their individual `resources-<id>` IDs (`src/app/App.tsx:2214-2238, 2719-2726`; `src/app/EconomyPanes.tsx:331-370`). Each Compound likewise remains a separate `compounds-<id>` page; the Compound renderer activates one matching pane at a time (`src/app/EconomyPanes.tsx:1534-1560`). The parent tabs and group ownership are preserved. The remake's top-level Compounds placement follows the owner-directed navigation order.

## Finding

No confirmed child-order, source-option mapping, page-ownership, or flattening mismatch was found. No code changed. This is a static source/renderer review; no browser-rendered comparison or tests/checks/builds/formatting were run.
