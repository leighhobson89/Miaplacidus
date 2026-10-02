# Engine and simulation core (F-19–F-30)

**Implementation status: complete (2 October 2026).** This contract establishes the first authoritative state tree, deterministic transition boundary, time/random/timer primitives, ordered resource transaction, React snapshot adapter and recovery path. It is engine infrastructure; it does not yet make a player-facing feature playable. The controlling task list is the [Phase 1 checklist](../../plans/build-checklist/01-foundation.md), and the wider phase remains open until F-31–F-42 are complete.

## Scope and source basis

Keep game rules pure and typed, with immutable content definitions and one authoritative state object. Do not import Cosmic Forge runtime code. The source behavior used here is observed in the frozen reference commit from the [foundation source contract](../../audit/foundation-source-contract.md).

No balance or product-scope change was approved in this slice. The precision policy is ported from the source; the fixed F-27 transaction order is an engine contract whose numerical outcomes remain subject to the planned scenario checks before parity status can change.

| Concern | Observed source behavior | MIAPLACIDUS contract |
|---|---|---|
| Starting economy | [foundation-economy.md F-04/F-09](../../audit/foundation-economy.md): $10, 50 RP, zero goods, Hydrogen cap 150; the eight materials and six compounds have extracted starting caps and sale prices. | `createInitialGameState()` uses those values from the small immutable `INITIAL_GOODS` catalogue. Only Hydrogen is initially unlocked. |
| Precision | [`precision.js`](../../../../cosmicForge/cosmicForge/precision.js) uses absolute tolerance `1e-9`, relative tolerance `1e-13`, shared affordability, floor-for-holdings, ceiling-for-costs, truncated currency and adaptive upgrade-step formatting. | Pure typed equivalents live in `engine/precision.ts`; prices remain the caller's responsibility and are not silently rounded in the purchase reducer. |
| Time and timers | [`timerManagerDelta.js`](../../../../cosmicForge/cosmicForge/timerManagerDelta.js) scales timer deltas, supports repeated completions after a large delta, and invokes completion once for a one-shot. [`game.js`](../../../../cosmicForge/cosmicForge/game.js) uses animation-frame deltas, forces the time multiplier to 1 while hidden/unfocused, and calls the offline path on return. | Wall input is injected. Foreground catch-up processes at most four 250 ms slices per call and carries the remaining elapsed time as a scalar backlog. Hidden/offline time is processed in one analytical step. Completion counts are arithmetic, not an unbounded loop. |
| Offline gains | `constantsAndGlobalVars.js` sets `OFFLINE_GAINS_RATE = 0.334`; `offlineGains()` calculates gains from elapsed wall seconds and `nerfOfflineGains()` applies that rate. No gameplay duration cap was found in the inspected function. | Apply rate `0.334` to offline-eligible timers and supplied transaction rates. There is no practical gameplay cap; `Number.MAX_SAFE_INTEGER` milliseconds is only a representation bound. Offline duration does not receive black-hole or temporary warp multipliers. |
| Production allocation | `runProductionAllocation()` is a post-update hook over entries accrued by several independent production timers; fuel has already been recorded, auto-crafting follows allocation, and storage paths clamp stock. This is not one source-wide transaction pass. | F-27 defines a deterministic remake transaction order: production → fuel → crafting → sales → storage clamp. This is a new engine contract whose numerical parity must be checked against the extracted scenarios before later economy areas are declared evidenced. |

## State ownership and initial factories

`GameState` contains four explicit scopes:

- **run:** pioneer name, cash, research points, current goods, unlocked resources, purchased upgrades, timers, clock state and seeded random cursor. Rebirth work will reset this scope.
- **permanent:** rebirth count, AP, GP and acquired permanent perks.
- **settings:** locale, theme, notation, sound and reduced-motion preference.
- **statistics:** lifetime cash/goods totals and accepted command/timer counts.

`createInitialGameState()` creates a fresh complete state without sharing mutable nested records. `isValidGameState()` checks balances, capacities, locale/settings, upgrade IDs, timer identity/policy and random/clock ranges. Save parsing and migrations remain in Phase 2.

## Command boundary and purchases

`GameCommand` uses stable action IDs and explicit inputs. `checkPreconditions()` returns a typed pass or a stable failure code/message key; `transition()` returns the next state and domain events. Selectors expose affordability and derived view snapshots without consulting DOM text. Commands receive all time input and their random cursor from state, so a command can be replayed from the same state and inputs. A clock command can supply a separate `offlineTickPlan` when offline resource rates differ from foreground production/sales.

An upgrade purchase checks cash and up to three material costs before constructing any changed object. Repeated cost entries are aggregated. A rejected purchase returns the exact prior state and no events; an accepted purchase settles every cost and grants the upgrade in one transition. Batch `count` is the grant quantity, and the command's supplied cost is the total batch cost.

## Clock, randomness, timer semantics and time-warp policy

- `ClockSource` injects wall-time samples; state separately records wall sample, accumulated simulation time, paused state, hidden elapsed time and foreground backlog.
- Pause stops simulation/offline progression. Wall timers continue on wall deltas and are not warped. Foreground steps are at most 250 ms, up to four per call; additional elapsed time is retained and drained on later advances.
- Returning from a hidden tab converts the recorded hidden interval to offline time at 0.334. Offline calculations are analytical and capped only by safe JavaScript millisecond representation. The caller can also provide elapsed time since the last saved wall sample at startup.
- `TimerDomain` gives stable ID namespaces and a central policy table. Autobuyer, production, research, travel, survey, black-hole and Cosmic Rip timers progress offline. Battle and casino timers do not. Simulation timers may receive temporary or always-on black-hole warp only while foregrounded; the warp multiplier is never applied during offline return. Wall timers follow real wall deltas regardless of simulation pause/warp.
- A timer needs at least 1 ms duration. One-shot timers enter `complete` and emit one completion event. Repeating timers retain modulo remainder and report the number of elapsed completions in one event. Manually completing an already completed timer is an idempotent no-op.
- `RandomState` is `{ seed, draws }`. A pure 32-bit mixing function derives each sample from that pair, advances the draw count once and can be seeded at state creation. Stars, weather, events, casino and battles will consume this same explicit source through future commands.

## Resource transaction and React publication

Each `clock.advance` applies each simulation interval in this fixed order:

1. Land producer output without clamping so consumers can use it in the same interval.
2. Burn requested fuel, limited to available stock.
3. Craft in ascending explicit priority, then stable output ID order; aggregate recipe inputs so one stock unit cannot satisfy duplicate recipe entries twice.
4. Sell available stock at its stored value and credit only the amount actually removed.
5. Clamp every good to `[0, storageCapacity]` once and emit overflow events.

`createGameStore()` owns the current and last-valid state outside React. It can accept every bounded engine advance while publishing derived snapshots no more than four times per second; non-clock actions publish immediately. `useGameSnapshot()` subscribes with `useSyncExternalStore`, so simulation timers do not each force a React update.

## Recovery behavior

Precondition failures and caught transition errors preserve the prior valid state and return no domain events. Every successful candidate is validated before commit; an invalid candidate is rejected and the supplied last-known-valid state is returned. `GameStore` starts from a valid fresh state if its initial input is invalid and restores its last valid snapshot on recovery. `GameErrorBoundary` contains render failures and offers a keyboard-accessible Continue action that restores the valid store state before rendering again.

## Focused checks still planned

No unit or browser spec was added for this slice. F-39 and F-40 remain open and should add focused coverage for: source precision boundaries; exact/short multi-cost purchases and no partial charge; seeded repeatability; pause, hidden return, offline rate and warp policy; bounded catch-up; one-shot and repeating timer completion; transaction competition/order/cap/sale income; coarse snapshot frequency; and rejected-command/error recovery invariants. The parity ledger remains unchanged for every player-facing area.

## Infrastructure checks

| Command | Result |
|---|---|
| `npm.cmd run typecheck` | Passed. |
| `npm.cmd run lint` | Passed. |
| `npm.cmd run format:check` | Passed. |
| `npm.cmd run check:boundaries` | Passed; the engine import/global restrictions reported no violations. |
| `npm.cmd run build` | Passed; Vite produced the full production bundle (31 modules). |
| Unit and E2E suites | Not run; their focused specs remain F-39 and F-40. |

## Implementation map

| Contract | Files |
|---|---|
| State scopes and initial goods | [`state.ts`](../../../src/engine/state.ts), [`economy.ts`](../../../src/content/economy.ts) |
| Commands, preconditions, events, atomic purchase | [`commands.ts`](../../../src/engine/commands.ts), [`precision.ts`](../../../src/engine/precision.ts) |
| Clock and deterministic randomness | [`clock.ts`](../../../src/engine/clock.ts), [`random.ts`](../../../src/engine/random.ts) |
| Timer IDs, policy and completion semantics | [`runtimeTypes.ts`](../../../src/engine/runtimeTypes.ts), [`timers.ts`](../../../src/engine/timers.ts) |
| Ordered transaction and selectors | [`transactions.ts`](../../../src/engine/transactions.ts), [`selectors.ts`](../../../src/engine/selectors.ts) |
| Coarse snapshots and UI recovery | [`store.ts`](../../../src/engine/store.ts), [`useGameSnapshot.ts`](../../../src/ui/useGameSnapshot.ts), [`GameErrorBoundary.tsx`](../../../src/ui/GameErrorBoundary.tsx) |
