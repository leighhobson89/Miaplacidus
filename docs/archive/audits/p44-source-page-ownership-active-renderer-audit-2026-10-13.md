# P-44 source-page ownership and active-renderer check

**Date:** 13 October 2026  
**Scope:** Direct comparison of Cosmic Forge's visible parent/child options with the current MIAPLACIDUS navigation metadata and React render paths. This is a static source-to-renderer check; it is not a browser review.

## Top-level tabs

Cosmic Forge `index.html:65–73` declares its nine parent tabs. Its runtime priority in `ui.js:10376–10400` orders unlocked destinations as Resources, Compounds, Research, Energy, Space Mining, Interstellar, Galactic, Cosmic Rip, and Settings. The target's `GAME_TABS` in `src/app/App.tsx:206–216` uses that owner-directed order and appends Miaplaedia; `App.tsx:1813–1818` filters unavailable tabs while preserving that order. The tab label render uses the localized name key without a numeric prefix.

## Distinct child pages and documents

| Source UI evidence | Current target mapping and renderer | Result |
| --- | --- | --- |
| Galactic rows in `index.html:681–740`: Rebirth (`option1`), Market (`option2`), Casino (`option6`), Ascendency Perks (`option3`), Megastructures (`option4`), Black Hole (`option5`). | `src/app/presentationNavigation.ts:230–278` retains those IDs/order and conditionally places Casino after Market. `src/app/App.tsx:2982–2984` routes Casino to its own `GalacticCasinoPane`. | Casino remains its own Galactic child. |
| Interstellar rows in `index.html:489–546`: Star Map (`option1`), Star Data (`option2`), Star Ship (`option3`), Fleet Hangar (`option4`), Colonise (`option5`). | `presentationNavigation.ts:385–451` retains the five child IDs. `App.tsx:3008–3017` gives Star Map and Star Data separate `view` values; only the Map child receives `view="map"`. | Star Data remains a distinct Interstellar child; its table view does not include the Star Map. |
| Cosmicopedia rows in `index.html:829–864`: Get Started (`option4`), Story (`option12`), Concepts Early (`option5`), Mid (`option6`), Late (`option7`), End Goal (`option13`), Philosophies (`option11`). | `presentationNavigation.ts:280–333` maps seven separate Miaplaedia IDs to those source option IDs. `App.tsx:3118–3133` creates a separate section and `MiaplaediaPane` render for each selected ID. | All seven source documents remain individual Miaplaedia children. |
| Settings rows in `index.html:870–912`: Achievements (`option10`), Events (`option14`), Statistics (`option8`), Visual (`option1`), Game Options (`option3`), Saving/Loading (`option2`). Contact and Exit Game are separate source-only entries. | `presentationNavigation.ts:335–376` defines six separate Settings destinations with those six IDs; `App.tsx:3138–3147` renders the Settings pane. | Settings retains six real destinations. Contact and Exit Game remain excluded under the owner decisions. |

## Owner-directed groupings

Cosmic Forge Research shows Research (`option1`), Technology (`option2`), Tech Tree (`option3`), and Philosophy (`option4`) as separate rows in `index.html:313–352`. The target keeps Science Buildings (`option1`) and Philosophy (`option4`) distinct and combines Technology plus Tech Tree as the owner's approved Tech Tree destination (`presentationNavigation.ts:139–160`; `EconomyPanes.tsx:2361–2563`).

Cosmic Forge Energy exposes Energy Storage (`option1`) and three power-plant options (`option2`–`option4`) in `index.html:234–273`. The target keeps the owner-directed Energy Summary page new and distinct, maps Batteries to `option1`, and groups the three plant options on Power (`presentationNavigation.ts:113–135`; `EconomyPanes.tsx:2618–2888`).

No source-to-target ownership or renderer mismatch was found in these paths. No code or estimates changed, and no tests or browser renders were run. The outstanding locale/copy review remains separate from this structural evidence.