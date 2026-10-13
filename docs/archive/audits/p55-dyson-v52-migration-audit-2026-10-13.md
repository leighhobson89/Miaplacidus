# P-55 Dyson rebirth migration audit — 13 October 2026

**Owner direction:** preserve Cosmic Forge's Energy behavior after rebirth, including on saves migrated from older MIAPLACIDUS schemas.

Cosmic Forge restores initial plant rates on rebirth and replays Optimized Power Grids, but does not replay Dyson Sphere stage 2's 1.25× rate mutation (`resourceDataObject.js:3887-3891`; `game.js:15627-15639`, `16059-16067`). The permanent Dyson research therefore remains owned while the rate mutation is absent on a reborn run.

MIAPLACIDUS already clears `run.dysonPlantRateBoostActiveThisRun` in `restoreMegastructureProgressOnRebirth` (`src/engine/megastructures.ts`). The v52→v53 migration previously inferred that flag from permanent technology alone, which could restore the boost for a legacy save whose `rebirthCount` was positive. It now enables the flag only when the save has `rebirthCount === 0` and Dyson stage 2 is researched (`src/engine/state.ts`, `upgradeGameStateV52`). A save after rebirth keeps the permanent technology and leaves the run boost inactive. A missing or unknown rebirth count defaults the flag off.

This static migration-path review supersedes the earlier audit note that preserved the legacy boost through the current run after migration. No tests, builds, typechecks, formatting, or browser checks were run. Migration fixtures and matched post-rebirth runtime values remain unverified; P-55 stays open.
