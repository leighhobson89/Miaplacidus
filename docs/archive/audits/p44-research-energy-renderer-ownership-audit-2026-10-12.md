# P-44 Research and Energy renderer ownership audit — 12 October 2026

## Scope

Compared Cosmic Forge's source menu DOM, option handlers, and active page renderer branches with MIAPLACIDUS's current child mapping and App renderer routes. The source checkout is read-only. This is a static ownership review, not a rendered browser review.

## Source menus, handlers, and page renderers

Cosmic Forge Research (`../../../cosmicForge/cosmicForge/index.html:303-354`) declares Research (`option1`), Technology (`option2`), Tech Tree (`option3`), and Philosophy (`option4`). Philosophy starts with the `invisible` class. The option handlers select each corresponding heading and call `updateContent` (`../../../cosmicForge/cosmicForge/ui.js:10666-10708`); the tab dispatcher sends `tab3` to `drawTab3Content` (`ui.js:3543-3548`). Its active branches are separate for Research, Technology, Tech Tree, and Philosophy (`../../../cosmicForge/cosmicForge/drawTab3Content.js:85,94,262,2685,2717`).

Cosmic Forge Energy (`../../../cosmicForge/cosmicForge/index.html:219-276`) declares Energy Storage (`option1`), Power Plant (`option2`), Solar Power Plant (`option3`), and Advanced Power Plant (`option4`). The three plant rows begin hidden and are revealed by their progression gates. The four handlers select distinct source headings (`../../../cosmicForge/cosmicForge/ui.js:10622-10665`), and the tab dispatcher sends `tab2` to `drawTab2Content` (`ui.js:3537-3542`). The active renderer has independent branches for Energy Storage, Power Plant, Solar Power Plant, and Advanced Power Plant (`../../../cosmicForge/cosmicForge/drawTab2Content.js:22,153,242,332`). The source also places a central Power switch and generation/consumption chart outside that child menu (`index.html:277-295`).

## Current MIAPLACIDUS mapping and routes

`src/app/presentationNavigation.ts:113-163` maps the source options as follows:

| Source option | Target destination | Ownership result |
| --- | --- | --- |
| Research `option1` | `research-science-buildings` | Separate Research page |
| Technology `option2` and Tech Tree `option3` | `research-tech-tree` | One Tech Tree page, as owner-directed |
| Philosophy `option4` | `research-philosophy` | Separate page, conditional on a chosen philosophy |
| Energy Storage `option1` | `energy-batteries` | Batteries page |
| Power Plant `option2`, Solar Power Plant `option3`, Advanced Power Plant `option4` | `energy-power` | Plants grouped on Power, as owner-directed |
| No source child option | `energy-summary` | Remake-only summary page |

`App.tsx:1687-1694,2727-2769` builds these child lists, renders each selected child rail, and passes the active pane to `EconomyPanes`. `EconomyPanes.tsx:331-342` routes Research and Energy to their respective panels. The Research panel has separate `tabpanel` sections for Science Buildings, Tech Tree, and Philosophy (`EconomyPanes.tsx:2338,2515,2543`). The Energy panel title and content are selected by the three target IDs (`EconomyPanes.tsx:2579-2591`); Summary shows generation/consumption information (`2620-2660`), Power owns the master switch and plant cards (`2662-2679`), and Batteries owns battery cards (`2836-2840`).

## Finding and limits

No unintended child ownership or renderer mismatch was found. Research remains distinct from Tech Tree; source Technology and Tech Tree are consolidated into the target Tech Tree by owner direction. Batteries maps to source Energy Storage, the three source plant options stay together on the target Power page by owner direction, and the target Energy Summary is explicitly additional. The source central Power switch/chart are represented in the target Power and Summary views.

No code, tests, shared checklist, parity ledger, or crosswalk changed. No tests, builds, typechecks, formatting checks, or browser checks were run. P-44 remains open for the broader locale and rendered presentation review.
