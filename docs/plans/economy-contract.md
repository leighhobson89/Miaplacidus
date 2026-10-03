# Economy implementation contract (M-03)

**Reference:** the read-only Cosmic Forge snapshot and extracted catalogue in [foundation-economy.md](../audit/foundation-economy.md). This contract governs the remake implementation; source quirks called out below remain visible as intentional decisions.

## Scope

Implement the eight ordinary resources, six compounds, production tiers and their controls, production allocation, energy and fuel, research buildings, all 57 technology entries, their economy-facing effects, save/reload behavior, and player-facing screens. Solar remains an internal power resource and is not an ordinary material. Later space, interstellar, meta, and endgame screens may consume technology unlock flags when their phases add those systems.

## Shared rules

- Definitions and localized names live in content/catalogue modules. The engine owns quantities, capacities, prices, ownership, unlocks, enabled states, and research progress. Rates and affordances are derived from that same state.
- Manual gain is one unit for each unlocked ordinary resource and stops at capacity. Manual sell and storage controls are available in each unlocked pane. Sale selection and preview use the same quantity rule; only whole units are sold and fractional remainder is retained unless the source's selected sale amount consumes the last whole-unit boundary.
- Storage costs the current capacity minus one unit of the stored good, then multiplies capacity by the active storage factor. Water also consumes 30% of its current capacity in Concrete. Increase All Storage reserves and purchases Water first so a Concrete upgrade cannot spend Water's input; every later upgrade is checked against the remaining stock.
- Autobuyer prices advance by repeated `ceil(current × 1.13)`. Purchases and multi-resource deductions are atomic. A displayed action is enabled by the same affordability check that executes it.
- Technology reveal uses the source's strict `research > threshold`; purchase additionally requires every technology-ID prerequisite and the exact research price. Technology IDs and effect dispatch never depend on translated names.
- Save schema changes use a validated migration rung. M-03 fields may not turn an existing M-02 slot into an unreadable save.

## Deterministic production step

The source runs resource and compound buyers on its timer manager and calls `runProductionAllocation` as a post-update hook. Resource production is recorded before allocation; plant fuel is deducted and recorded; allocation then reserves the configured cash share, budgets compound inputs, runs auto-creation, and refreshes the rates. The source iterates mutable object keys, so multiple consumers can otherwise depend on construction order.

The remake makes that ordering explicit and deterministic:

1. Compute every eligible resource and compound buyer output from the tick's starting ownership, activation, power, and modifiers.
2. Apply plant fuel demand before discretionary allocation. Burn only stock that exists; shortages never make a balance negative and are visible to the power trip logic.
3. Allocate each resource's newly produced, post-fuel amount to cash first, then compounds. Clamp cash share to 0–100%; clamp compound share to the remaining percentage. Existing stored stock is not auto-sold.
4. Create compounds in the catalogue's declared order. Shared input budgets are divided evenly across active recipes that need the same material; each recipe is limited by its input budget, actual stock, and output capacity.
5. Apply output sales/credits and clamp all inventories to `[0, capacity]` once. No unit can be spent by fuel, a recipe, and a sale more than once.
6. Derive displayed rates from the same settled transaction and powered building totals used by simulation.

**Intentional delta:** this replaces source timer/object enumeration order with a documented stable order. Competing compound consumers share a material budget evenly. Tests cover simultaneous fuel, auto-sell, recipes, full storage, fractional production, and input shortage.

## Energy and research

- Energy is a separate balance with explicit capacity. Plants generate only while the grid and plant are active; fuel plants burn their configured material, while Solar Plant output is weather-modifiable. Batteries add capacity but do not generate energy.
- Power demand comes from active resource/compound tiers, Science Labs, and later powered systems. The grid's displayed generation, demand, net rate, stored energy, and shortage status are derived from these same values.
- The source's first energy/research data and grace/trip behavior remain the baseline. Any simplification or missing later-system demand is listed in the completion record and linked to its owning later gate.
- Science Kits and Clubs continue without grid power; Labs require it. The Science Kit purchase charges $5; the source's RP suffix on its price is a display defect.

## Verification and release evidence

Every economy action must be reachable through visible controls with localized labels, costs, disabled reasons, and live values. The browser suite exercises player clicks, saves/reloads and screenshots across resource, energy, research/technology, and compound screens. Its shared harness rejects a missing or all-white app surface, browser/console errors, and unexpected network requests. Pure tests compare fixed source scenarios, affordability boundaries, tick allocation, power trips/recovery, and save migration.
