# P-55 Resource collection capacity-boundary audit

**Date:** 12 October 2026  
**Scope:** Resource production statistics when a manual +1 collection is attempted with less than one unit of storage remaining.

Cosmic Forge's Resource control calls `gain(1, ...)` (`drawTab1Content.js:30`). In the `resource` branch, `gain` accepts the click whenever current quantity is below storage capacity, then adds one unit and calls `addToResourceAllTimeStat` with that amount (`game.js:10258-10264`). If the remaining capacity is a positive fraction below one, the source accepts the action and increments This Run and All Time production while the quantity can exceed the nominal capacity.

MIAPLACIDUS preflight for `resource.collect` requires `quantity + 1 <= storageCapacity` (`src/engine/commands.ts:842-855`). Its state validator also rejects any good quantity above capacity (`src/engine/state.ts:2328-2337`). At the same near-capacity state, the remake rejects the action and leaves both production counters unchanged.

The eight Resource and six Compound Statistics row mappings, labels, units, scopes, save behavior, and rebirth behavior otherwise match the statically reviewed source paths. This is an accepted-action/storage-boundary difference that affects whether a source-equivalent production counter can change; resolving it requires an owner decision about the remake's capacity invariant. No gameplay change was made. No tests, builds, typechecks, formatting, or browser checks were run. P-55 remains open.

**Owner decision (12 October 2026):** keep the documented remake behavior. MIAPLACIDUS continues to require the full +1 unit to fit within capacity, preserving its quantity-capacity invariant; the source's fractional-overflow edge remains an intentional remake difference. No gameplay change is planned.
