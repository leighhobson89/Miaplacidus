# Phase 4 — space mining and interstellar play

**Outcome:** telescope to asteroid/antimatter to starship to settlement/conquest is playable, including failure and retry branches. Sources: `drawTab5Content.js`, `drawTab6Content.js`, `game.js`, `resourceDataObject.js`, current star/rocket/fleet tests and the GDD. Preserve stable star/system identities across localization and saves.

## Telescope, asteroids and rockets

- [ ] **I-01** Port telescope build costs, unlocks, power requirements and upgrade levels.
- [ ] **I-02** Port asteroid search timer, scan result distribution and discovery notification.
- [ ] **I-03** Port star-study timer, range/efficiency modifiers and studied-state rewards.
- [ ] **I-04** Port auto-telescope modes and their power/unlock gates.
- [ ] **I-05** Port asteroid types, size/quality, resources and legendary discovery/naming behavior.
- [ ] **I-06** Port asteroid listing, selection, depletion and safe removal/pruning rules.
- [ ] **I-07** Port launch pad construction and part-by-part costs.
- [ ] **I-08** Port all four rocket slots, part requirements and rename controls.
- [ ] **I-09** Port rocket fuel generation, power demand, optimization upgrades and launch readiness.
- [ ] **I-10** Port outbound/return timers, travel direction, mining progress and reset for another journey.
- [ ] **I-11** Port weather launch blocks and correct readiness feedback for bad conditions.
- [ ] **I-12** Port rocket boost/automation controls and their unlocks.
- [ ] **I-13** Port temporary timer-finish effects through the ordinary journey completion command.
- [ ] **I-14** Test interrupted or reloaded search, fuel, flight and return without duplicate rewards.
- [ ] **I-15** Test four simultaneous rockets against separate targets and shared antimatter stock.

## Antimatter and space economy

- [ ] **I-16** Port antimatter unlock, quantities, rates, extraction caps and boost settings.
- [ ] **I-17** Port asteroid depletion and antimatter accounting to run/lifetime statistics.
- [ ] **I-18** Port antimatter purchase/spend gates for starship and later endgame systems.
- [ ] **I-19** Port any star/philosophy/megastructure effects on scans, mining and travel.
- [ ] **I-20** Test full/empty asteroid, insufficient power, exhausted fuel and exact-cost launch paths.

## Stars, map and travel

- [ ] **I-21** Extract seeded/generated star catalogue, nominal map geometry and deterministic generation inputs.
- [ ] **I-22** Port Spica start, Miaplacidus home and all special destinations/system flags.
- [ ] **I-23** Port star type distribution and the B/F/O effects plus neutral types.
- [ ] **I-24** Port star discovery, study, search, selection, labels and distance calculations.
- [ ] **I-25** Draw the map with stable coordinates and responsive zoom/pan behavior without changing travel distances.
- [ ] **I-26** Port star-data tables, sort/filter/direct targeting and reveal rules.
- [ ] **I-27** Port system weather/resources/anomalies/hostility generation and persist it per star.
- [ ] **I-28** Port destination validation, range, time, cost and travel timer setup.
- [ ] **I-29** Test map geometry, selection and calculated distance against fixed source scenarios.

## Starship and arrival

- [ ] **I-30** Port each starship module, part costs, construction states and final readiness.
- [ ] **I-31** Preserve the launch point-of-no-return warning and cancellation path.
- [ ] **I-32** Port launch, orbiting, travelling, arrival and post-arrival states as explicit transitions.
- [ ] **I-33** Port fuel/antimatter cost and travel speed modifiers from upgrades/philosophies.
- [ ] **I-34** Resume travel after save/reload and offline return with one arrival event.
- [ ] **I-35** Make casino/black-hole travel shortening reach the normal arrival path.
- [ ] **I-36** Test insufficient parts/fuel, duplicate launch, cancelled launch, time warp and destination changes.

## Diplomacy, fleets and conquest

- [ ] **I-37** Port lifeform/attitude/impression generation and persistence for destination systems.
- [ ] **I-38** Port scan, envoy, message, diplomacy choices and their impression effects.
- [ ] **I-39** Port vassalization, bullying/failed diplomacy and forced-war transitions.
- [ ] **I-40** Port all fleet ship types, build prices, quantity limits and hangar upgrades.
- [ ] **I-41** Port fleet attack, armor, speed, health and philosophy/star bonuses.
- [ ] **I-42** Port enemy fleet generation, defense rating, battle readiness and encounter display.
- [ ] **I-43** Port battle loop, damage/attrition, win and loss consequences.
- [ ] **I-44** Preserve lost-battle recovery: rebuild/retry without losing the starship or corrupting the destination.
- [ ] **I-45** Port colonization/settlement choices, ownership, rewards and AP/GP effects.
- [ ] **I-46** Prevent duplicate settlement, vassalization, battle victory or currency awards.
- [ ] **I-47** Test hostile/friendly/unoccupied arrivals and each diplomacy/war branch through real controls.

## Weather and system-wide verification

- [ ] **I-48** Port per-system weather chances, timing, severe-streak relief and current-condition display.
- [ ] **I-49** Port weather effects on plant output, precipitation, telescope/mining and rocket launch.
- [ ] **I-50** Credit precipitation only when material actually enters a store, once per event/tick.
- [ ] **I-51** Test clear/rain/volcano transitions, full storage, power-off and system change.
- [ ] **I-52** Save/reload every space and travel timer, then verify system state after rebirth.
- [ ] **I-53** Test late-game resource amounts and four-rocket activity without frame or heap regression.
- [ ] **I-54** Run six-language sweeps for the map, dynamic star names, telescope, fleet and battle UI.
- [ ] **I-55** Compare fixed source scenarios for scan, star type, travel, battle and settlement outcomes.

**Exit gate:** a player can build space infrastructure, mine antimatter, study and target stars, launch a starship, negotiate or fight, and settle/conquer a system. Focused areas: `space-telescope`, `space-mining`, `rockets`, `antimatter`, `star-map`, `star-types`, `starship`, `fleet-hangar`, `diplomacy`, `battle`, `colonise`, `weather`.
