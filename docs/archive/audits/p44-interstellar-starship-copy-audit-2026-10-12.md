# P-44 Interstellar Starship, Fleet Hangar, and Colonise copy audit — 12 October 2026

Compared Cosmic Forge's Interstellar child UI with the current navigation catalogue, `App.tsx` routes, `StarshipPane` renderer, and six-locale message catalogue. Source options 3, 4, and 5 map to separate target child IDs `interstellar-starship`, `interstellar-fleet-hangar`, and `interstellar-colonise`; they share the `StarshipPane` component but pass different view values. Source options 1 and 2 remain the separate Star Map and Star Data children.

| Source control or heading | Cosmic Forge key | MIAPLACIDUS target key/owner |
|---|---|---|
| Star Ship heading | `headerMainStarShip` | `starshipMessages.title` in `StarshipPane` |
| Built-parts progress label | `textBuilt` | `starshipMessages.parts`; the JSX no longer adds a duplicate colon |
| Module names and build action | `starShipModule*`, `buttonBuildModule` | `MODULE_LABELS`, `starshipMessages.buildPart` |
| Fleet Hangar heading | `headerMainFleetHangar` | `starshipMessages.fleetHangar` |
| System scan action | `buttonScanSystem` | `starshipMessages.scanSystem` |
| Envoy heading/build action | `fleetShipEnvoy`, `buttonBuild` | `starshipMessages.envoyTitle`, `starshipMessages.buildEnvoy` |
| Colonise heading and diplomacy/conquest/settlement actions | `headerMainColonise`, `buttonPassive`, `buttonHarmony`, `buttonBully`, `buttonVassalize`, `buttonConquest`, `buttonSettle` | `starshipMessages.colonise` and the corresponding action labels |
| Fleet build, quantity, and unit names | `buttonBuild`, `textQuantity`, `fleetShip*` | `starshipMessages.buildFleetShip`, `fleetQuantity`, and fleet-unit labels |

The visible labels now use the source's localized wording across `en`, `es`, `pt`, `de`, `it`, and `fr`. These are presentation changes only; commands, costs, progression, and navigation are unchanged.

Source UI evidence: `../../../cosmicForge/cosmicForge/index.html:492-545` and `../../../cosmicForge/cosmicForge/drawTab5Content.js:904,971,1340-1366,1429-1466`. Source locale keys are in `../../../cosmicForge/cosmicForge/localization.json` (English block around lines 1594-1934 and corresponding five locale blocks). Target ownership evidence: `src/app/presentationNavigation.ts`, `src/app/App.tsx`, and `src/app/StarshipPane.tsx`; target copy is in `src/i18n/starshipMessages.ts`.

No tests, builds, typechecks, formatters, or browser checks were run. P-44 remains open for broader catalogue and rendered-copy review.
