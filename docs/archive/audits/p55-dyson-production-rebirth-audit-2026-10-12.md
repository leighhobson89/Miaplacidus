# P-55 Dyson Total Production after rebirth audit

**Date:** 12 October 2026  
**Scope:** whether the source Statistics Total Production value retains Dyson's 1.25× plant-rate effect after rebirth.

Cosmic Forge's Total Production getter sums each plant's current `quantity × rate`, multiplies by `TIMER_RATE_RATIO`, and floors once (`constantsAndGlobalVars.js:5194-5199`; ratio `:51-52`). Dyson Sphere stage 2 multiplies each stored plant rate by 1.25 when the milestone is completed (`game.js:16057-16068`).

On rebirth, Cosmic Forge clones `resourceDataRebirthCopy` back into live `resourceData` (`resourceDataObject.js:3816,3887-3891`). Its rebirth sequence explicitly replays each acquired Optimized Power Grids purchase against stored rates (`game.js:15634-15637`), but the inspected sequence does not replay the Dyson plant-rate mutation. The source code path therefore indicates that installed plant rates can lose the 1.25× Dyson modifier after rebirth even though the Dyson technology remains researched. A before/after value comparison in a running source save has not been performed.

MIAPLACIDUS currently derives the 1.25× modifier from permanent Dyson technology in `megastructurePowerPlantMultiplier()` and applies it to each installed plant in `selectStatisticsEnergyProduction()` on every run. This may report a higher Total Production value than Cosmic Forge after rebirth. No code change was made pending an owner choice between retaining the documented remake behavior, matching the source's apparent rebirth behavior, or deferring this discrepancy. The selector's source-value acceptance remains open under P-55. No tests, builds, typechecks, formatting, or browser checks were run.

## Owner decision and implementation update

On 12 October, the owner directed MIAPLACIDUS to match Cosmic Forge. The plant-rate multiplier now depends on `run.dysonPlantRateBoostActiveThisRun`: researching Dyson stage 2 enables it for the current run, and the fresh state created by rebirth leaves it false while restoring the permanent technology. The shared multiplier affects both live plant generation and the Energy Total Production selector.

Save schema v53 persists this run flag. V52 migration initializes it from permanent Dyson stage-two ownership to preserve the existing run's displayed behavior; v52 did not record when the one-time rate mutation happened, so a migrated save may retain the modifier through the current run even if source rebirth would have removed it. A subsequent rebirth uses the source-matched reset. Current schema v54 adds the stage-one battery-capacity flag and the matching grid-reset behavior; see the [Energy rebirth audit](p55-energy-rebirth-audit-2026-10-12.md). Exact paired live values and rendered review remain open under P-55. No tests, builds, typechecks, formatting, or browser checks were run.

## Migration follow-up (13 October 2026)

The v52→v53 migration now checks `permanent.rebirthCount`: it restores the run-scoped 1.25× effect only for first-run saves with researched stage 2. Saves after a rebirth retain the permanent technology without replaying its plant-rate mutation. This supersedes the earlier migration behavior described above; see the [migration audit](p55-dyson-v52-migration-audit-2026-10-13.md). Matched runtime values remain open, and no tests or browser checks were run.
