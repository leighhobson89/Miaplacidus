# Phase 3 — resources, power, research and compounds

**Outcome:** the complete early/mid-game loop behaves like current Cosmic Forge, with clearer feedback and a single authoritative calculation path. Sources: `resourceDataObject.js`, `game.js`, `drawTab1Content.js` through `drawTab4Content.js`, `precision.js`, `docs/buildUpgradeable.md` and the corresponding old E2E areas.

## Work through M-03 in player order

1. Start with the Hydrogen resource loop: collection, storage, sale and Increase All Storage (**E-01–E-10**).
2. Buy the first Science Kit and Hydrogen buyer together, make the first research purchase, and open the Research technology gates (**E-11, E-30–E-34**); return to automation for tiers gated by research and energy (**E-12, E-14–E-20**).
3. Unlock and balance the Energy grid (**E-21–E-29**); continue through economy-facing technology effects and purchase integrity (**E-35, E-37–E-38**).
4. Unlock the six compound recipes and their automated paths (**E-39–E-47**).
5. Finish with precision, player-facing states, source comparisons, and economy save/reload (**E-48–E-56**).

The ID numbers remain stable for audit links; this order follows the playable route. A few outcomes that need systems introduced in later phases have been reassigned in the handoff list below and do not block the M-03 gate.

## Hydrogen start: resource catalogue, gain and sale

- [x] **E-01** Port hydrogen, helium, carbon, neon, oxygen, sodium, silicon and iron definitions with exact unlocks and starting values.
- [x] **E-02** Port manual gain amount, input handling and storage-cap behavior for each material.
- [x] **E-03** Port sale values, quantity controls, Sell and Sell All, including documented fractional-remnant differences.
- [x] **E-04** Compute cash gain from model quantities; preview and payout must agree at precision boundaries.
- [x] **E-05** Port per-material storage upgrades, cost/consumption rule and cap scaling.
- [x] **E-06** Port Increase All Storage and its purchase order, affordability and within-run capacity growth. Rebirth carryover is tracked by **G-05/G-08**.
- [x] **E-07** Port bulk purchase/Buy Max rules and their affordability limits.
- [x] **E-08** Port resource reveal conditions, side-menu rate/stock readouts and ready/blocked feedback.
- [x] **E-09** Apply current economy-owned permanent multipliers at their source gates exactly once. Star-type and megastructure interactions are assigned to **I-23/I-49** and **G-14/G-39**.
- [x] **E-10** Capture exact source examples for beginning, full storage, sale and upgrade thresholds.

## Research bootstrap and technology gates

Buy the first Hydrogen compressor alongside the Science Kit as each becomes affordable; the higher, gated producer tiers follow in the next section.

- [x] **E-11** Port all resource autobuyer tiers, quantities, base rates, prices and price scaling; start with the Hydrogen buyer here.
- [x] **E-30** Port starting research quantity and all science building tiers, costs, rates and power use.
- [x] **E-31** Port manual/repeatable research purchases and research automation controls.
- [x] **E-32** Extract every technology key, price, prerequisite, reveal position and unlock effect from current data.
- [x] **E-33** Implement prerequisite checks and purchase atomicity with no reliance on English tech names.
- [x] **E-34** Port the technology list, tree layout, ready/locked states and confirmation/notification paths.
- [x] **E-37** Ensure a duplicate tech purchase cannot charge twice or grant an effect twice.
- [x] **E-38** Test missing prerequisite, exact research cost, competing purchase, save/reload and language switch.

## Resource automation and production allocation

Start with the Hydrogen buyer after the first research unlock. Revisit the gated tiers after completing the Energy steps below.

- [x] **E-12** Port tier unlock prerequisites, research/energy gates and active/on-off state.
- [x] **E-14** Port autosell unlock and its controls for each resource.
- [x] **E-15** Port cash/compound/retained-stock allocation shares and allowed input ranges.
- [x] **E-16** Make each production tick account for generated units exactly once across autosell, crafting, fuel and stock.
- [x] **E-17** Decide and document the old tick-order edge cases before fixing order-dependent behavior in the new engine.
- [x] **E-18** Clamp at cap after net gains/consumption using the approved rule; never report phantom production.
- [x] **E-19** Update rate displays from the same derived totals used by simulation.
- [x] **E-20** Check stopped/disabled tiers, full stores, power loss, tiny float rates and very large rates in focused tests.

## Energy and battery

- [x] **E-21** Port energy quantity, capacity and the storage/battery upgrade tiers.
- [x] **E-22** Port basic, solar and advanced power plants, their costs, fuel types and output rates.
- [x] **E-23** Port plant active/on-off controls and the Power All behavior.
- [x] **E-24** Port fuel burn, shortages, grace period, trip and recovery behavior.
- [x] **E-25** Port power demand from resource/compound autobuyers and research buildings. Telescope/rocket demand is tracked by **I-01/I-09**.
- [x] **E-27** Port infinite-power/permanent bonuses only at the source gates that grant them; cross-system modifier stacking is tracked by **I-23/I-49/G-14/G-39**.
- [x] **E-28** Make the energy panel show generated, consumed, stored and unavailable amounts consistently.
- [x] **E-29** Check zero plants, fuel exhausted, exact balance, battery drain/recharge and restored power.

## Economy-facing technology effects

- [x] **E-35** Port technology effects on current resource, power and compound systems. Space/interstellar and meta effects are tracked by **I-19/I-23/G-27/G-39**.

## Compounds

- [x] **E-39** Port diesel, water, glass, steel, concrete and titanium recipes, unlocks, sale values and capacities.
- [x] **E-40** Port manual create quantity, input validation, resource deduction and success/failure feedback.
- [x] **E-41** Port compound storage upgrades, Sell, Sell All and Increase All Storage.
- [x] **E-42** Port compound autobuyer tiers and power requirements.
- [x] **E-43** Port automatic compound creation and its interaction with resource allocation shares.
- [x] **E-44** Handle missing input, saturated output, partial available production and power loss without negative quantities.
- [x] **E-45** Port compound rates, previews, recipe descriptions and localized material names.
- [x] **E-46** Verify compound recipe identity remains stable when locale changes mid-run.
- [x] **E-47** Check simultaneous fuel, autosell and crafting demands on the same resource.

## Precision, player-facing feedback and evidence

- [x] **E-48** Port `canAfford`, tolerance, `settleSpend`, displayed holding/cost and currency rules from `precision.js`.
- [x] **E-49** Ensure affordability color, enabled state, purchase and after-spend balance use the same policy.
- [x] **E-50** Port notation modes and large-number readouts without changing source quantities.
- [x] **E-51** Check round-number thresholds, floating drift, huge values and NaN/infinite input rejection.
- [x] **E-52** Check early economy progression through first energy, research and compound unlock in a real browser.
- [x] **E-53** Check all eight resource and six compound panes via user controls, including bulk and automated paths.
- [x] **E-54** Check energy trip/recovery, technology prerequisite and compound automation in focused Playwright areas.
- [x] **E-55** Compare representative source and remake economic outcomes over fixed simulated time and record intentional deltas.
- [x] **E-56** Save/reload and compare all 14 good balances/capacities, economy upgrades and automation settings, research, building toggles, allocation shares and power state. First/second rebirth carryover is tracked by **G-05/G-08**.

## Hand-offs to later phases

These are still project work, but their owning phase introduces the required game system. Keep their progress in that phase; they are not open M-03 deliverables.

| Former economy ID | Later-phase owner | Follow-up |
| --- | --- | --- |
| **E-06, E-13, E-36, E-56** | [M-05](05-meta-endgame.md): G-05, G-08, G-28 | Verify retained storage, automation, philosophy repeatable levels/prices and economy state across first and second rebirths. |
| **E-09, E-25, E-26, E-35** | [M-04](04-space-interstellar.md): I-01, I-09, I-19, I-23, I-27, I-49 | Add telescope/rocket power demand; star/weather production modifiers; and technology/permanent effects on space systems. |
| **E-09, E-35** | [M-05](05-meta-endgame.md): G-14, G-27, G-39 | Verify ascendency, philosophy and megastructure effects reach the economy once, with their persistence rules. |
| **E-57** | [M-06](06-presentation.md): P-51, P-54, P-56 | Complete the exhaustive six-language economy review for every row, tooltip, modal and dynamic cost, with screenshot and responsive-layout evidence. |

**Exit gate:** a player can progress from Hydrogen through a stable automated resource/energy/research/compound economy. Focused tests cover `resources`, `autobuyers`, `autosell`, `energy`, `research`, `technology`, `compounds`, `precision` and `rounding`. Later-phase hand-offs above do not block this gate.

**Current gate status:** complete. All M-03-owned tasks are checked; the 43 unit tests and 51-case browser suite passed, and the E-56 save/reload case was subsequently strengthened to compare every good balance/capacity and the complete economy upgrade/state records, then passed with its reviewed screenshot baseline. Production build, lint, import-boundary and format checks also passed. Rebirth, later space/meta integration and exhaustive language review remain open under the later-phase hand-offs above. See the [economy browser evidence and run instructions](../../../tests/e2e/economy/README.md).
