# P-55 Energy rebirth behavior audit — 12 October 2026

**Owner direction:** follow Cosmic Forge's behavior after rebirth. This is a static source and target-code comparison; live values and rendered output remain unverified, so P-55 stays open.

## Source behavior

Cosmic Forge captures the original resource state as `resourceDataRebirthCopy` (`../../../../cosmicForge/cosmicForge/resourceDataObject.js:3816`). Its rebirth reset clones that snapshot back into the resource data (`../../../../cosmicForge/cosmicForge/resourceDataObject.js:3887-3891`), restoring battery and energy-storage capacities, plant counts, and plant rates to their initial values.

The rebirth path replays permanent Optimized Power Grids (`../../../../cosmicForge/cosmicForge/game.js:15627-15636`). It does not replay Dyson Sphere stages 1 or 2. Those bonuses are applied at purchase time in `applyMegaStructureBonuses` (`../../../../cosmicForge/cosmicForge/game.js:16040-16068`): stage 1 doubles the three battery capacities and energy-storage capacity; stage 2 multiplies each plant's maximum, purchased, and current rate by 1.25. Consequently, both effects reset with the source resource snapshot.

The source clears Infinite Power unless Dyson stage 5 is present (`../../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js:1384-1390`), then initializes the grid switch from the resulting Infinite Power state (`../../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js:1629-1630`). Stage 4's run-scoped power effect therefore does not reactivate after rebirth; stage 5 does.

## MIAPLACIDUS implementation

`src/engine/megastructures.ts` now tracks both Dyson mutations in `run` state. Purchasing stages 1 and 2 activates the respective run flags, and the battery-capacity and plant-rate selectors read those flags instead of deriving the effects from permanent research ownership. A fresh rebirth run starts with both flags false. `restoreMegastructureProgressOnRebirth` explicitly clears both run flags even when called with a reused run object; the restoration path clears `gridEnabled` and `infinitePower`, then restores both only for persistent stage 5. Permanent Optimized Power Grids remains applied through `acquiredPerks` after rebirth. Fresh-game defaults and permanent research ownership remain unchanged.

Save schema v54 adds the battery-capacity run flag. Existing v53 saves migrate through `upgradeGameStateV53`, which initializes the new flag from stage 1 ownership to preserve the old version's active behavior; v52 saves first pass through the existing v53 migration. Older schema paths chain into v54. The v52→v53 migration continues to preserve legacy active plant-rate behavior when stage 2 is owned, since earlier saves do not record the run in which it was researched. For a migrated save whose player already rebirthed, the former schema likewise cannot distinguish a purchase from a post-rebirth run; the existing bonus is preserved for continuity and expires on that save's next rebirth.

## Evidence boundary

Source review covered `resourceDataObject.js`, `game.js`, and `constantsAndGlobalVars.js`; target review covered `src/engine/megastructures.ts`, `src/engine/state.ts`, `src/persistence/schema.ts`, `src/persistence/migrations.ts`, and `src/persistence/codec.ts`. No tests, builds, typechecks, formatter, or browser checks were run. Matched source/remake save values, active-run battery capacity and plant output, and post-rebirth grid behavior still need later runtime evidence.

## Owner reaffirmation and path recheck (13 October 2026)

The owner reaffirmed that Energy rebirth behavior should follow Cosmic Forge. A direct path recheck confirms the source clones the initial plant/resource snapshot, replays Optimized Power Grids, and does not replay Dyson stage 2's 1.25× rate mutation (`resourceDataObject.js:3887-3890`, `game.js:15627-15639`, `3925-3946`, `16059-16067`). MIAPLACIDUS clears `dysonPlantRateBoostActiveThisRun` during `restoreMegastructureProgressOnRebirth` (`src/engine/megastructures.ts:216-224`); plant production and the Statistics Total Production selector both read that run-scoped flag (`src/engine/economySimulation.ts:163-195`, `src/engine/selectors.ts:252-265`). No additional code correction was needed. This remains a static code-path comparison; matched runtime values and rendered rebirth review are still open.

## Legacy-save migration correction (13 October 2026)

The v52→v53 migration now enables the Dyson plant-rate run flag only when `rebirthCount === 0` and stage 2 is researched. Existing saves after a rebirth keep the permanent technology without restoring the run-only rate effect. This supersedes the earlier migration note above that preserved the legacy rate boost through the current run. See the [migration audit](p55-dyson-v52-migration-audit-2026-10-13.md). No tests or runtime checks were run.
