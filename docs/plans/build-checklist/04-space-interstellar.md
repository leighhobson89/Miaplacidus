# Phase 4 Ã¢â‚¬â€ space mining and interstellar play

**Outcome:** telescope to asteroid/antimatter to starship to settlement/conquest is playable, including failure and retry branches. Sources: `drawTab5Content.js`, `drawTab6Content.js`, `game.js`, `resourceDataObject.js`, current star/rocket/fleet tests and the GDD. Preserve stable star/system identities across localization and saves.

## Telescope, asteroids and rockets

- [x] **I-01** Port telescope build costs, unlocks, power requirements and upgrade levels.
- [x] **I-02** Port asteroid search timer, scan result distribution and discovery notification.
- [x] **I-03** Port star-study timer, range/efficiency modifiers and studied-state rewards.
- [x] **I-04** Port auto-telescope modes and their power/unlock gates.
- [x] **I-05** Port asteroid types, size/quality, resources and legendary discovery/naming behavior.
- [x] **I-06** Port asteroid listing, selection, depletion and safe removal/pruning rules.
- [x] **I-07** Port launch pad construction and part-by-part costs.
- [x] **I-08** Port all four rocket slots, part requirements and rename controls.
- [x] **I-09** Port rocket fuel generation, power demand, optimization upgrades and launch readiness.
- [x] **I-10** Port outbound/return timers, travel direction, mining progress and reset for another journey.
- [x] **I-11** Port weather launch blocks and correct readiness feedback for bad conditions.
- [x] **I-12** Port rocket boost/automation controls and their unlocks.
- [x] **I-13** Port temporary timer-finish effects through the ordinary journey completion command.
- [x] **I-14** Test interrupted or reloaded search, fuel, flight and return without duplicate rewards.
- [x] **I-15** Test four simultaneous rockets against separate targets and shared antimatter stock.

## Antimatter and space economy

- [x] **I-16** Port antimatter unlock, quantities, rates, extraction caps and boost settings.
- [x] **I-17** Port asteroid depletion and antimatter accounting to run/lifetime statistics.
- [x] **I-18** Port antimatter purchase/spend gates for starship and later endgame systems.
- [x] **I-19** Port relevant technology, star, philosophy and megastructure effects on scans, mining and travel; apply each once.
- [x] **I-20** Test full/empty asteroid, insufficient power, exhausted fuel and exact-cost launch paths.

I-18 uses one exact-cost checker and payment path for the starship fuel charge; a one-unit shortfall is rejected, an exact balance is consumed once, and repeat launch is blocked. Focused coverage is in `tests/unit/starship-economy.spec.ts`. I-19 applies Expansionist and Voidborn repeatable counts from saved perk state to part costs, survey durations and travel timers. Dyson-family disconnect research produces the shared 0.15 antimatter-per-second source bonus once, and updates run/lifetime mining totals. The settled O-type power effect is owned by I-23/I-45, and per-destination megastructure/anomaly records by I-27/I-37. Philosophy repeatable purchase progression remains tracked under G-28; its saved counts are already consumed by these Phase 4 effects.

I-16–I-20 full unit suite passed 88/88 tests. The Chrome E2E run reported all 57 cases passing, then stayed alive after its final case and was stopped manually before Playwright wrote a summary.

I-01Ã¢â‚¬â€œI-15 implementation and persistence coverage are complete. The focused rule area passed 14 tests. The full unit run passed 83/83 tests, and every one of the 57 browser cases reported passing in Chrome with video capture disabled. Playwright remained alive after its last case and was stopped manually; its server had already exited. The new starship economy test also passes as a focused check.

## Stars, map and travel

I-21's seed-80 catalogue, stable slot IDs, nominal geometry and source-compatible 3D distance function are recorded in the [star catalogue contract](../star-catalogue-contract.md).

- [x] **I-21** Extract seeded/generated star catalogue, nominal map geometry and deterministic generation inputs.
- [x] **I-22** Port Spica start, Miaplacidus home and all special destinations/system flags.
- [x] **I-23** Port star type distribution and B/F/O production and space effects plus neutral types; apply star modifiers once.
  - B-type resource production, F-type asteroid extraction, and O-type settled power-plant assignments now feed their production paths once.
- [x] **I-24** Port star discovery, study, search, selection, labels and distance calculations.
- [x] **I-25** Draw the map with stable coordinates and responsive zoom/pan behavior without changing travel distances.
- [x] **I-26** Port star-data tables, sort/filter/direct targeting and reveal rules.

I-24 discovery/search/selection and its map browser scenario passed the full suite. I-25's zoom and drag pan were verified in Chrome; viewport movement preserves selection and travel distance. The Miaplacidus milestone is modelled, but its durable run state belongs with settlement progression in I-45.

The Star Data view now reads persisted per-system profiles, supports name/type filtering and the source sort fields, derives distance and antimatter fuel from the current system, and can focus a row on the map. Star study now stores up to four hidden manuscript/factory assignments, using the original 20% between-milestone chance and guaranteed 5/20/35/45 light-year milestones. Unreported factory systems are omitted from name search and cannot be selected or launched toward; their Star Data marker remains hidden. The idempotent report transition and its user-facing sort/filter/direct-target flow pass in `tests/e2e/star-map/star-map.spec.ts`. Save schema v20 stores profiles, clues, scans, diplomacy/war state, fleet quantities, class-level battle health, once-per-run AP awards, settled-system ownership, durable O-type plant assignments and the active per-system weather cycle; older versions receive migration defaults and best-effort power reconstruction for fleets already present. Weather chances, precipitation and stored AP are generated per system without consuming the main simulation RNG. A built Stellar Scanner can scan an orbiting destination once; the saved encounter preserves life, civilization, population, threat, defense, fleets and up to two source anomaly effects. O-type and unrevealed factory systems use hard-mode generation, while Miaplacidus uses its fixed hostile profile. I-27's generated data lifecycle is in place; live weather transitions and resource effects are tracked under I-48/I-49.

The I-27 checkpoint passed 92/92 unit tests. Chrome reported all 60 E2E cases passing, including the one-time system scan and the NumpadSubtract Test Lab flow, then remained alive after its final case and was stopped manually before it wrote a summary.

- [x] **I-27** Port system weather/resources/anomalies/hostility generation and persist it per star.
- [x] **I-28** Port destination validation, range, time, cost and travel timer setup.
- [x] **I-29** Test map geometry, selection and calculated distance against fixed source scenarios.

## Starship and arrival

- [x] **I-30** Port each starship module, part costs, construction states and final readiness.
- [x] **I-31** Preserve the launch point-of-no-return warning and cancellation path.
- [x] **I-32** Port launch, orbiting, travelling, arrival and post-arrival states as explicit transitions.
- [x] **I-33** Port fuel/antimatter cost and travel speed modifiers from upgrades/philosophies.
- [x] **I-34** Resume travel after save/reload and offline return with one arrival event.
- [x] **I-35** Make casino/black-hole travel shortening reach the normal arrival path.
- [x] **I-36** Test insufficient parts/fuel, duplicate launch, cancelled launch, time warp and destination changes.

I-28 and I-30 through I-36 now have focused coverage. The source-compatible destination quote and module price/readiness rules are implemented; an E2E scenario verifies Space Elevator's compounded discount in the UI and charge, builds the four required modules, and leaves the scanner optional. A second E2E scenario cancels and confirms the point-of-no-return dialog, pays the quoted antimatter, and reaches orbit through the saved timer. Engine coverage checks per-module research locks, insufficient modules/fuel, destination immutability after launch, Quantum Engines/Warp Drive travel times, casino-style two-second warp, and Black Hole clock acceleration through the same one-time arrival event. Save schema v11 stores module part counts and v12 stores the journey. The focused Chrome scenarios and focused starship engine tests passed; the full I30–I36 checkpoint follows below.

The I30–I36 full checkpoint passed 89/89 unit tests. Chrome reported all 59 E2E cases passing, including both starship scenarios. Playwright remained alive after the final case and was stopped manually before it wrote a summary.

## Diplomacy, fleets and conquest

- [x] **I-37** Port lifeform/attitude/impression generation and persistence for destination systems.
- [x] **I-38** Port scan, envoy, message, diplomacy choices and their impression effects.
- [x] **I-39** Port vassalization, bullying/failed diplomacy and forced-war transitions.
- [x] **I-40** Port all fleet ship types, build prices, quantity limits and hangar upgrades.
- [x] **I-41** Port fleet attack, armor, speed, health and philosophy/star bonuses.
- [x] **I-42** Port enemy fleet generation, defense rating, battle readiness and encounter display.
- [x] **I-43** Port battle loop, damage/attrition, win and loss consequences.
- [x] **I-44** Preserve lost-battle recovery: rebuild/retry without losing the starship or corrupting the destination.
- [x] **I-45** Port colonization/settlement choices, ownership, rewards and AP/GP effects.
- [x] **I-46** Prevent duplicate settlement, vassalization, battle victory or currency awards.
- [x] **I-47** Test hostile/friendly/unoccupied arrivals and each diplomacy/war branch through real controls.

The diplomacy, fleet, battle, recovery and settlement implementation passed the full unit checkpoint (112/112 tests). Real-control coverage for hostile, friendly, unoccupied, diplomacy, war and retry paths passed in `tests/e2e/battle/battle.spec.ts` and `tests/e2e/starship/starship.spec.ts` using Chrome.

## Weather and system-wide verification

- [x] **I-48** Port per-system weather chances, timing, severe-streak relief and current-condition display.
- [x] **I-49** Port weather effects on plant output, precipitation, telescope/mining and rocket launch; define stacking with star modifiers.
- [x] **I-50** Credit precipitation only when material actually enters a store, once per event/tick.
- [x] **I-51** Test clear/rain/volcano transitions, full storage, power-off and system change.
- [x] **I-52** Save/reload every space and travel timer, then verify system state after rebirth.
- [x] **I-53** Test late-game resource amounts and four-rocket activity without frame or heap regression.
- [x] **I-54** Run six-language sweeps for the map, dynamic star names, telescope, fleet and battle UI.
- [x] **I-55** Compare fixed source scenarios for scan, star type, travel, battle and settlement outcomes.

Weather uses each saved star profile's weighted chances and a wall-clock window of one to three minutes. After three consecutive rain or volcano windows, the next severe draw becomes one minute of cloudy relief. Power Plant 2 stacks weather efficiency with the environmental and settled O-type modifiers; rain precipitation is credited only for units accepted by revealed storage. The original has no additional weather modifier for telescope surveys or antimatter mining, while rain/volcano block rocket launches and leave fuel pumping unchanged. Schema v20 migrates earlier saves with a durable weather timer and a neutral, zero-precipitation default.

The I-48–I-55 full unit checkpoint passed 123/123 tests, and the final Chrome E2E checkpoint passed 71/71 tests. The six-locale map, telescope, weather, fleet and battle sweep passed. With four active rockets, the final performance run recorded 52.99 FPS, 30.69 MiB JavaScript heap, 10,423 DOM nodes and 1,296 event listeners. Fixed source scenarios remain covered in `tests/unit/star-type-rules.spec.ts`, `tests/unit/starship-economy.spec.ts`, `tests/unit/space-rules.spec.ts` and `tests/unit/battle.spec.ts`.

**Exit gate:** a player can build space infrastructure, mine antimatter, study and target stars, launch a starship, negotiate or fight, and settle/conquer a system. Focused areas: `space-telescope`, `space-mining`, `rockets`, `antimatter`, `star-map`, `star-types`, `starship`, `fleet-hangar`, `diplomacy`, `battle`, `colonise`, `weather`.
