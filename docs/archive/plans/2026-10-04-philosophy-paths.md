# Philosophy paths contract

**Status:** Complete - 4 October 2026 (G-25-G-30).

## Source and scope

Observed behavior is from the locked Cosmic Forge audit snapshot:

- `../../../cosmicForge/cosmicForge/game.js` completes the choice prompt after the first star study, charges research for path technologies, and applies path abilities.
- `../../../cosmicForge/cosmicForge/resourceDataObject.js` defines the four paths, 500,000 research abilities, 10,000 research repeatables, repeatable multipliers, and rebirth restoration.
- `../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js` defines the 1.13 research price growth.
- `../../../cosmicForge/cosmicForge/drawTab3Content.js` renders the philosophy choice and path research controls.
- `../../audit/foundation-meta.md` records the extracted effects and source cross-links.

## State and command contract

- The selected path is permanent for a save. A new run has no choice pending; completion of its first star study sets a run-local pending choice only while the permanent path is unset.
- Selection is a one-time command accepted only while that pending choice exists. Selecting a path is irreversible and exposes that path's ability and four repeatables.
- Ability purchase costs 500,000 research, is available once per run, and resets with the run. Its effect lasts until rebirth.
- Each repeatable begins at 10,000 research and advances its own price by `ceil(previousPrice × 1.13)`. Repeatable ranks and current prices persist with the save and across rebirths.
- Commands reject the wrong path, a repeated selection/ability, a rank overflow, and insufficient research without changing state.
- Save schema adds pending-choice state and stable path/rank IDs. Migration from v22 initializes zero ranks and reconstructs a pending choice for a save that already studied stars but has no selected philosophy.

## Path effects

| Path | Ability | Repeatables |
|---|---|---|
| Constructor | Storage purchases scale by ×5 rather than ×2 for this run. | `efficientAssembly`: telescope/launch-pad cost −1% per rank; `laserMining`: resource buyer prices −5% per rank; `massCompoundAssembly`: recipe inputs −5% per rank (minimum 1); `energyDrones`: energy and research building prices −5% per rank. |
| Supremacist | From rebirth 1 onward, vassalize at more than 3× enemy fleet power without trait/impression checks. | `hangarAutomation`: fleet prices −5%; `syntheticPlating`: new fleet health +5%; `antimatterEngineMinaturization`: new fleet speed +5%; `laserIntensityResearch`: new fleet attack +5%. |
| Voidborn | Enables telescope Void-pillage actions. | `stellarWhispers`: starting alien impression +1 point; `stellarInsightManifold`: star-study time −1%; `asteroidDwellers`: asteroid-search time −1%; `ascendencyPhilosophy`: +1 AP per rank after the first rebirth. |
| Expansionist | Conquest may settle up to three nearby additional systems; peaceful settlement does not trigger it. | `spaceElevator`: starship-part cost −5%; `launchPadMassProduction`: rocket-part cost −5%; `asteroidAttractors`: rocket travel time −5%; `warpDrive`: starship travel time −5%. |

## UI and failure states

- The first completed star study presents four localized choices with a short effect summary. Choice controls are keyboard operable and unavailable after one is chosen.
- The selected path panel shows its permanent name, run ability purchase status/cost, each repeatable's current rank and next cost, and affordability.
- The ability purchase and repeatable rows show disabled reasons when research is insufficient or the ability is already active.
- All player-facing labels and summaries are defined for `en`, `es`, `pt`, `de`, `it`, and `fr`.

## Acceptance checks

- Unit tests cover path-locking, choice and ability costs, each repeatable's quote/rank changes, effect application, invalid purchases, the first-study prompt gate, save validation/migration, and rebirth retention/reset scopes.
- Browser coverage chooses a path after its first star study, buys its ability/repeatable, reloads, and checks the selected path and purchase state. A localization pass checks all six locales.
- Run the full unit suite once for this work section. If it reveals a test failure and the fix is local, rerun only the affected test area(s).

## Implementation and evidence

Saved ranks feed the affected engine rules directly: [commands](../../../src/engine/commands.ts) handles resource/building prices, compound recipes, and storage; [space mechanics](../../../src/engine/spaceMechanics.ts) handles survey durations, telescope/launch-pad/part prices, travel, Voidborn pillage, initial impression, vassalization, and expansion captures; [fleet mechanics](../../../src/engine/fleetMechanics.ts) handles ship prices and new-ship combat stats; [meta progression](../../../src/engine/metaProgression.ts) settles Expansionist captures and adds their GP.

Evidence run on 4 October 2026:

- `npm.cmd run typecheck` - passed.
- `npm.cmd run test:unit` - one run, 154/155 passed; the sole failure was the legacy save-size fixture omitting the new permanent rank object. Added the initial rank record and reran only `tests/unit/local-saves.spec.ts` - 32 passed.
- `npm.cmd run test:unit:focused -- tests/unit/philosophy.spec.ts tests/unit/diplomacy.spec.ts` - 19 passed after final all-path rebirth/reload, six-locale, storage, and threshold coverage was added.
- `$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/philosophies/philosophies.spec.ts` - passed in system Chrome. The test finishes the active star-study timer through the ordinary `timer.complete` engine command boundary, then researches the path ability and repeatable, saves, reloads, and verifies restoration.

No visual baseline was changed. Browser evidence and reproduction commands are recorded in [`tests/e2e/philosophies/README.md`](../../../tests/e2e/philosophies/README.md).
