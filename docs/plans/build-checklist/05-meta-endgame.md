# Phase 5 — meta progression and endgame

**Outcome:** every shipped long-run system and ending is reachable through ordinary play and recoverable after save/reload. Use Cosmic Forge `game.js`, `resourceDataObject.js`, `casino.js`, `cosmicRip.js`, `achievements.js`, `events.js`, the tab 7/8/9 renderers and matching E2E areas as behavioral evidence. This package expands [M-05](../master-checklist.md). Balance improvements are allowed when recorded and tested.

## Rebirth and permanent progression

- [ ] **G-01** Extract the exact rebirth preconditions, confirmation text, reward calculation and reset order.
- [ ] **G-02** Assign every state field a run, permanent, settings or lifetime-statistics owner; document the complete reset/carryover matrix.
- [ ] **G-03** Implement rebirth as one validated command with an atomic state transition and no partial reset.
- [ ] **G-04** Port starting-system selection and generation after rebirth, including source identity and discovery behavior.
- [ ] **G-05** Port the old rules for retained resources, storage, technologies, automation, philosophy repeatable levels/prices and settings, including exceptions. Closes the rebirth carryover follow-ups from **E-06/E-13/E-36**.
- [ ] **G-06** Keep spent/earned AP, GP and perk effects consistent across rebirth and reload.
- [ ] **G-07** Prevent rebirth while a blocking battle, travel or other source-defined condition is active; explain why in UI.
- [ ] **G-08** Test first and second rebirth from deterministic fixtures, including exact reset, economy save/reload and carryover, and new-system effects. Closes the rebirth verification follow-up from **E-56**.

## Currencies, market and ascendency

- [ ] **G-09** Catalogue each AP source, amount, one-time guard and display location.
- [ ] **G-10** Catalogue each GP source, amount, one-time guard and display location.
- [ ] **G-11** Port Galactic Market unlocks, trade pairs, exchange rates, fees, histories and lockdown states.
- [ ] **G-12** Make market preview, affordability, spend and receipt agree at precision boundaries.
- [ ] **G-13** Port every ascendency perk ID, cost, prerequisites, level cap, repeatability and effect.
- [ ] **G-14** Apply permanent perk modifiers exactly once to each affected system, including after reload and rebirth; include the cross-system multiplier follow-up from **E-09**.
- [ ] **G-15** Test exact-cost, insufficient-currency, max-level, disabled-market and rapid repeated purchase paths.
- [ ] **G-16** Test AP/GP source and sink totals over a two-run journey with no duplicate awards.

## Galactic casino

- [ ] **G-17** Extract CP purchase price, wallet behavior, unlocks and all game entry rules.
- [ ] **G-18** Port Double or Nothing outcomes, limits, stakes, loss/win settlement and visible history.
- [ ] **G-19** Port Wheel of Fortune sectors, costs, outcomes and prize application.
- [ ] **G-20** Port Higher or Lower deck/range, guessing, ties, rewards and failure state.
- [ ] **G-21** Port Void Seer choice/outcome rules and its long-run or timer effects.
- [ ] **G-22** Make random draws injectable and seed-recorded; verify odds/probability tables against source content.
- [ ] **G-23** Route telescope/travel/timer-finishing casino prizes through normal completion commands.
- [ ] **G-24** Test insufficient CP, duplicate click, reload mid-outcome, locale switch and deterministic wins/losses.

## Philosophies and repeatables

- [ ] **G-25** Extract all Constructor, Supremacist, VoidBorn and Expansionist unlock gates and initial choice rules.
- [ ] **G-26** Port each path's active ability, duration/cooldown, cost and interaction with the simulation clock.
- [ ] **G-27** Port each path's passive modifiers to economy, space, diplomacy, fleet and endgame rules; include the later-system technology effects from **E-35**.
- [ ] **G-28** Port repeatable philosophy upgrades, scaling costs, caps and persistence scope; include **E-36** cost scaling and current-price restoration after rebirth.
- [ ] **G-29** Prevent incompatible path selection or double grant according to source rules; display choice consequences.
- [ ] **G-30** Test each path in an otherwise identical seeded scenario, including rebirth and save/reload.

## Black hole, manuscripts and megastructures

- [ ] **G-31** Port black-hole discovery, unlock and prerequisite chain.
- [ ] **G-32** Port black-hole charge source, cap, rate, storage and visible progress.
- [ ] **G-33** Port black-hole research/upgrades and exact costs/effects.
- [ ] **G-34** Specify and implement which named timers advance under time warp and which do not.
- [ ] **G-35** Process all warp completions through idempotent normal commands, including offline return and reload.
- [ ] **G-36** Extract all manuscript/clue locations, rewards, duplicate guards and narrative order.
- [ ] **G-37** Port megastructure discovery, star eligibility, construction stages, resource/currency costs and timers.
- [ ] **G-38** Port guardian/defense encounters, failure/retry and affected fleet/starship state.
- [ ] **G-39** Port megastructure technology unlocks, bonuses and save/rebirth ownership; apply the megastructure modifier follow-ups from **E-09/E-35** once.
- [ ] **G-40** Port the Miaplacidus force-field requirements, breach, Master AI sequence and ending state.
- [ ] **G-41** Test missing clue/part, exact cost, time-warp completion, lost guardian fight and repeat ending attempt.
- [ ] **G-42** Record the shipped end route separately from outdated GDD assumptions and verify it in a full browser journey.

## Cosmic Rip

- [ ] **G-43** Extract Cosmic Rip unlock, story situation and scanner restoration costs/steps.
- [ ] **G-44** Port sector catalogue, scan order/eligibility, scan timers and outcome generation.
- [ ] **G-45** Port in-game telemetry production, storage, costs and UI; it is a gameplay resource, not player analytics.
- [ ] **G-46** Port scanner upgrades, research catalogue, GP gates and cross-system modifiers.
- [ ] **G-47** Port rip instability/progress rules, completion requirements, closure action and rewards.
- [ ] **G-48** Guard one-time sector and closure rewards across reload, warp, offline return and rebirth.
- [ ] **G-49** Test blocked/available scanner, interrupted scan, exact GP spend and complete closure route.
- [ ] **G-50** Verify the Cosmic Rip tab remains reachable and translated in the default full build.

## Achievements, events and news

- [ ] **G-51** Extract the complete shipped achievement catalogue, triggers, counters, rewards and persistence scope.
- [ ] **G-52** Rebuild achievement artwork and badges as new assets mapped by stable IDs.
- [ ] **G-53** Apply achievement triggers once at a defined event boundary and prevent reward duplication.
- [ ] **G-54** Port random event tables, weights, prerequisites, instant/timed effects and end conditions.
- [ ] **G-55** Port event history, choices and recovery after reload/offline return.
- [ ] **G-56** Port news categories, story clues, prize rules, timing and duplicate guards.
- [ ] **G-57** Seed and force events/news in development tests via the normal engine command boundary.
- [ ] **G-58** Test achievement/event/news interactions across languages, save/reload and two rebirths.
- [ ] **G-59** Compare fixed Cosmic Forge source scenarios for each meta domain and record approved balance differences.
- [ ] **G-60** Update all meta/endgame parity areas with current source mapping, focused results and playable evidence.

**Exit gate:** a player can rebirth twice, spend long-run currencies, use all four philosophies and casino games, finish the shipped Miaplacidus route and close the Cosmic Rip. Achievement, event and news coverage is evidenced in the relevant functional-area folders.
