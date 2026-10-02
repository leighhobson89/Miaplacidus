# State, time and reset seams

This document records the most delicate engine contracts found in the current source. It is a static trace, not a full numerical specification; each feature phase must extract exact formulas and test them.

Foundation extraction adds source-backed state/scope examples in the [economy](foundation-economy.md), [space/interstellar](foundation-space.md), and [meta/endgame](foundation-meta.md) catalogues. Their proposed `run`/`permanent`/`settings`/`statistics` labels are MIAPLACIDUS ownership recommendations, not schema declarations in Cosmic Forge.

## Three places that hold game state

1. [resourceDataObject.js](../../../cosmicForge/cosmicForge/resourceDataObject.js) exports mutable `resourceData`, `starSystems`, `galacticCasino`, `galacticMarket`, `ascendencyBuffs`, `achievementsData` and related stores. Generic `get...DataObject`/`set...DataObject` helpers accept section keys and nested paths. This allows a broad set of callers to change state without a typed command boundary.
2. [constantsAndGlobalVars.js](../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js) exports hundreds of getters/setters and holds global progression, unlocks, UI preferences, statistics and restore logic. A count of `export let/const/function` declarations in the snapshot is roughly 659, illustrating the exposed surface; it is not a count of distinct save fields.
3. The DOM itself carries some operational strings and state classes. [game.js](../../../cosmicForge/cosmicForge/game.js) selects `.notation` elements each frame and passes their HTML into formatter paths, while [ui.js](../../../cosmicForge/cosmicForge/ui.js) rebuilds panes and updates controls. The prior [UI audit](../../../cosmicForge/cosmicForge/docs/largeUIRefactor.md) cites concrete parsing and translated-text comparisons.

The new engine should have one normalized state tree, stable IDs, commands, selectors and an event/effect boundary. A UI row shows state; it does not define it.

## Clock and ordering

[timerManagerDelta.js](../../../cosmicForge/cosmicForge/timerManagerDelta.js) stores timers in a `Map`; `update(deltaMs, multiplier)` scales the delta, updates timers in map order, removes completed timers, then calls post-update hooks. A repeating timer can tick more than once when a large delta crosses multiple durations. [timerManager.js](../../../cosmicForge/cosmicForge/timerManager.js) uses `setInterval` for a separate wall-clock path. [gameLoop()](../../../cosmicForge/cosmicForge/game.js) runs on animation frames and uses `performance.now()`. Its effective multiplier is forced to 1 when the document is hidden or unfocused; black-hole always-on and temporary warp otherwise alter it. It then runs production/allocation refresh, weather, achievements, purchases, dozens of feature checks and UI scans.

Offline return is a separate path in `game.js`: `offlineGains()` computes resource, compound, energy, research, telemetry, fuel and antimatter changes, and restarts or advances active work such as rockets, starship travel, telescope tasks, black-hole charging and Cosmic Rip research. `OFFLINE_GAINS_RATE` is `0.334` in the current constants. The remake must specify its exact rate, duration cap and affected systems before porting; a single blanket multiplier would miss those completion paths.

`runProductionAllocation` is registered as a delta-timer post-update hook, according to the current game-loop comment. That means it also runs when tests or debug tools advance the timer manager directly. The absence of a single resource transaction means independent timer order and intermediate clamping can matter. The old [feedback plan](../../../cosmicForge/cosmicForge/docs/player-feedback-improvement-plan.md) describes this as P8; treat it as a design target to resolve, not permission to alter observed balances silently.

The remake clock contract must answer: which effects use simulation vs real elapsed time; whether a background tab earns normal/offline/warped gains; how many updates a long sleep can trigger; timer order; what happens if the player pauses, saves during warp, or closes the page mid-travel; and how casino prizes complete timers. Give each timer a durable purpose/ID and make completion idempotent. Use a bounded step or explicit analytical integration for long offline intervals so a resumed tab does not run an unbounded loop.

## Save and rebirth

[saveLoadGame.js](../../../cosmicForge/cosmicForge/saveLoadGame.js) suppresses autosave in the demo, during a non-always-on time warp, and while battle is ongoing. It serializes a snapshot and compresses it with `LZString`. [constantsAndGlobalVars.js](../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js) restores many global fields; `resourceDataObject.js` migrates structured stores with `patches.js`. There is no single visible schema declaration. New saves should validate the whole object and commit atomically after migration.

Rebirth's data reset starts from `resourceDataRebirthCopy = structuredClone(resourceData)` in [resourceDataObject.js](../../../cosmicForge/cosmicForge/resourceDataObject.js), then re-adds AP, black-hole progress, Cosmic Rip state, philosophy repeatables, megastructure techs, permanent bonuses and selected automation settings. `REBIRTH_PERSISTED_AUTOMATION` enumerates several settings, including allocation shares and compound auto-create. The new model should encode ownership rather than manually reconstructing it across multiple modules. A two-rebirth test should check each permanent and run-scoped representative.

## Non-negotiable invariants to formalize

- A purchase either deducts all costs and grants the item once, or changes nothing. Displayed affordability and actual deduction agree.
- Quantity stays finite and within its defined bounds after a normal tick, offline return, time warp, import and rebirth. Any intentional overflow or uncapped currency is explicit.
- Production allocation accounts for each produced unit once, under competing sale/craft/fuel consumers.
- A timer completion side effect occurs once. Repeated callbacks, reload and prize-triggered finish cannot double-award.
- Save import failure preserves the current run and the original imported payload for recovery.
- Rebirth carries only the declared permanent/settings fields, resets run fields, and applies permanent bonuses exactly once.
- Locale/theme/notation changes do not mutate economic state or alter IDs.
