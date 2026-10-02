# Phase 3 — resources, power, research and compounds

**Outcome:** the complete early/mid-game loop behaves like current Cosmic Forge, with clearer feedback and a single authoritative calculation path. Sources: `resourceDataObject.js`, `game.js`, `drawTab1Content.js` through `drawTab4Content.js`, `precision.js`, `docs/buildUpgradeable.md` and the corresponding old E2E areas.

## Resource catalogue, gain and sale

- [ ] **E-01** Port hydrogen, helium, carbon, neon, oxygen, sodium, silicon and iron definitions with exact unlocks and starting values.
- [ ] **E-02** Port manual gain amount, input handling and storage-cap behavior for each material.
- [ ] **E-03** Port sale values, quantity controls, Sell and Sell All, including documented fractional-remnant differences.
- [ ] **E-04** Compute cash gain from model quantities; preview and payout must agree at precision boundaries.
- [ ] **E-05** Port per-material storage upgrades, cost/consumption rule and cap scaling.
- [ ] **E-06** Port Increase All Storage and earned storage increase persistence after rebirth.
- [ ] **E-07** Port bulk purchase/Buy Max rules and their affordability limits.
- [ ] **E-08** Port resource reveal conditions, side-menu rate/stock readouts and ready/blocked feedback.
- [ ] **E-09** Port relevant B-type/star/megastructure and permanent multipliers without applying them twice.
- [ ] **E-10** Capture exact source examples for beginning, full storage, sale and upgrade thresholds.

## Autobuyers and production allocation

- [ ] **E-11** Port all resource autobuyer tiers, quantities, base rates, prices and price scaling.
- [ ] **E-12** Port tier unlock prerequisites, research/energy gates and active/on-off state.
- [ ] **E-13** Port automation persistence across rebirth where the old game retains it.
- [ ] **E-14** Port autosell unlock and its controls for each resource.
- [ ] **E-15** Port cash/compound/retained-stock allocation shares and allowed input ranges.
- [ ] **E-16** Make each production tick account for generated units exactly once across autosell, crafting, fuel and stock.
- [ ] **E-17** Decide and document the old tick-order edge cases before fixing order-dependent behavior in the new engine.
- [ ] **E-18** Clamp at cap after net gains/consumption using the approved rule; never report phantom production.
- [ ] **E-19** Update rate displays from the same derived totals used by simulation.
- [ ] **E-20** Test stopped/disabled tiers, full stores, power loss, tiny float rates and very large rates.

## Energy

- [ ] **E-21** Port energy quantity, capacity and the storage/battery upgrade tiers.
- [ ] **E-22** Port basic, solar and advanced power plants, their costs, fuel types and output rates.
- [ ] **E-23** Port plant active/on-off controls and the Power All behavior.
- [ ] **E-24** Port fuel burn, shortages, grace period, trip and recovery behavior.
- [ ] **E-25** Port demand from autobuyers, research, telescope, rockets and other powered systems.
- [ ] **E-26** Port weather and star-type modifiers to plant production with one clear stacking rule.
- [ ] **E-27** Port infinite-power/permanent bonuses only at the source gates that grant them.
- [ ] **E-28** Make the energy panel show generated, consumed, stored and unavailable amounts consistently.
- [ ] **E-29** Test zero plants, fuel exhausted, exact balance, battery drain/recharge and restored power.

## Research and technology

- [ ] **E-30** Port starting research quantity and all science building tiers, costs, rates and power use.
- [ ] **E-31** Port manual/repeatable research purchases and research automation controls.
- [ ] **E-32** Extract every technology key, price, prerequisite, reveal position and unlock effect from current data.
- [ ] **E-33** Implement prerequisite checks and purchase atomicity with no reliance on English tech names.
- [ ] **E-34** Port the technology list, tree layout, ready/locked states and confirmation/notification paths.
- [ ] **E-35** Port tech effects on resource, power, compound, space, interstellar and meta systems.
- [ ] **E-36** Port repeatable technology cost scaling and post-rebirth price restoration.
- [ ] **E-37** Ensure a duplicate tech purchase cannot charge twice or grant an effect twice.
- [ ] **E-38** Test missing prerequisite, exact research cost, competing purchase, save/reload and language switch.

## Compounds

- [ ] **E-39** Port diesel, water, glass, steel, concrete and titanium recipes, unlocks, sale values and capacities.
- [ ] **E-40** Port manual create quantity, input validation, resource deduction and success/failure feedback.
- [ ] **E-41** Port compound storage upgrades, Sell, Sell All and Increase All Storage.
- [ ] **E-42** Port compound autobuyer tiers and power requirements.
- [ ] **E-43** Port automatic compound creation and its interaction with resource allocation shares.
- [ ] **E-44** Handle missing input, saturated output, partial available production and power loss without negative quantities.
- [ ] **E-45** Port compound rates, previews, recipe descriptions and localized material names.
- [ ] **E-46** Verify compound recipe identity remains stable when locale changes mid-run.
- [ ] **E-47** Test simultaneous fuel, autosell and crafting demands on the same resource.

## Precision, UI and verification

- [ ] **E-48** Port `canAfford`, tolerance, `settleSpend`, displayed holding/cost and currency rules from `precision.js`.
- [ ] **E-49** Ensure affordability color, enabled state, purchase and after-spend balance use the same policy.
- [ ] **E-50** Port notation modes and large-number readouts without changing source quantities.
- [ ] **E-51** Test round-number thresholds, floating drift, huge values and NaN/infinite input rejection.
- [ ] **E-52** Test early economy progression through first energy, research and compound unlock in a real browser.
- [ ] **E-53** Test all eight resource and six compound panes via user controls, including bulk and automated paths.
- [ ] **E-54** Test energy trip/recovery, technology prerequisite and compound automation in focused Playwright areas.
- [ ] **E-55** Compare representative source and remake economic outcomes over fixed simulated time and record intentional deltas.
- [ ] **E-56** Save/reload every economy system, then rebirth twice to verify reset and persisted automation/bonuses.
- [ ] **E-57** Check every economy row, tooltip, modal and dynamic cost in all six languages.

**Exit gate:** a player can progress from Hydrogen through a stable automated resource/energy/research/compound economy. Focused tests cover `resources`, `autobuyers`, `autosell`, `energy`, `research`, `technology`, `compounds`, `precision` and `rounding`.
