# Phase 5 — meta progression and endgame

**Outcome:** every shipped long-run system and ending is reachable through ordinary play and recoverable after save/reload. Use Cosmic Forge `game.js`, `resourceDataObject.js`, `casino.js`, `cosmicRip.js`, `achievements.js`, `events.js`, the tab 7/8/9 renderers and matching E2E areas as behavioral evidence. This package expands [M-05](../master-checklist.md). Balance improvements are allowed when recorded and tested.

## Rebirth and permanent progression

- [x] **G-01** Extract the exact rebirth preconditions, confirmation text, reward calculation and reset order. See the [rebirth/AP contract](../../archive/plans/2026-10-04-meta-rebirth.md); browser evidence remains part of G-08.
- [x] **G-02** Assign every state field a run, permanent, settings or lifetime-statistics owner; document the reset/carryover matrix in the [rebirth/AP contract](../../archive/plans/2026-10-04-meta-rebirth.md).
- [x] **G-03** Implement rebirth as one validated command with an atomic state transition and no partial reset.
- [x] **G-04** Port starting-system selection and generation after rebirth, including source identity and discovery behavior.
- [x] **G-05** Port the old rules for retained resources, storage, technologies, automation and settings, including starter-perk exceptions. Philosophy repeatable ranks/prices are tracked in **G-28**. Closes the rebirth carryover follow-ups from **E-06/E-13/E-36**.
- [x] **G-06** Keep spent/earned AP, GP and perk effects consistent across rebirth and save/export reload.
- [x] **G-07** Prevent rebirth while a blocking battle or travel is active; explain the locked state in the UI.
- [x] **G-08** Test first and second rebirth from deterministic fixtures, including exact reset, economy save/reload and carryover, and new-system effects. Closes the rebirth verification follow-up from **E-56**.

## Currencies, market and ascendency

- [x] **G-09** Catalogue each AP source, amount, one-time guard and display location. See the [AP/GP and market contract](../../archive/plans/2026-10-04-meta-currency.md); runtime award paths remain owned by the later G-tasks.
- [x] **G-10** Catalogue each GP source, amount, one-time guard and display location. See the [AP/GP and market contract](../../archive/plans/2026-10-04-meta-currency.md); GP refund achievements and Cosmic Rip sinks remain owned by their later G-tasks.
- [x] **G-11** Port Galactic Market unlocks, trade pairs, exchange rates, fees, histories and lockdown states.
- [x] **G-12** Make market preview, affordability, spend and receipt agree at precision boundaries.
- [x] **G-13** Port every ascendency perk ID, cost, prerequisites, level cap, repeatability and effect.
- [x] **G-14** Apply permanent perk modifiers exactly once to each affected system, including after reload and rebirth; include the cross-system multiplier follow-up from **E-09**.
- [x] **G-15** Test exact-cost, insufficient-currency, max-level, disabled-market and rapid repeated purchase paths.
- [x] **G-16** Test AP/GP source and sink totals over a two-run journey with no duplicate awards.

## Galactic casino

- [x] **G-17** Extract CP purchase price, wallet behavior, unlocks and all game entry rules. See the [casino contract](../../archive/plans/2026-10-04-meta-casino.md).
- [x] **G-18** Port Double or Nothing outcomes, limits, stakes, loss/win settlement and visible history.
- [x] **G-19** Port Wheel of Fortune sectors, costs, outcomes and prize application.
- [x] **G-20** Port Higher or Lower deck/range, guessing, ties, rewards and failure state.
- [x] **G-21** Port Void Seer choice/outcome rules and its long-run or timer effects.
- [x] **G-22** Make random draws injectable and seed-recorded; verify odds/probability tables against source content.
- [x] **G-23** Route telescope/travel/timer-finishing casino prizes through normal completion commands.
- [x] **G-24** Test insufficient CP, duplicate click, reload mid-outcome, locale switch and deterministic wins/losses.

## Philosophies and repeatables

- [x] **G-25** Extract all Constructor, Supremacist, VoidBorn and Expansionist unlock gates and initial choice rules. See the [completed philosophy contract](../../archive/plans/2026-10-04-philosophy-paths.md).
- [x] **G-26** Port each path's active ability, duration/cooldown, cost and interaction with the simulation clock.
- [x] **G-27** Port each path's passive modifiers to economy, space, diplomacy, fleet and endgame rules; include the later-system technology effects from **E-35**.
- [x] **G-28** Port repeatable philosophy upgrades, scaling costs, caps and persistence scope; include **E-36** cost scaling and current-price restoration after rebirth.
- [x] **G-29** Prevent incompatible path selection or double grant according to source rules; display choice consequences.
- [x] **G-30** Test each path in an otherwise identical seeded scenario, including rebirth and save/reload.

## Black hole, manuscripts and megastructures

- [x] **G-31** Port black-hole discovery, unlock and prerequisite chain.
- [x] **G-32** Port black-hole charge source, cap, rate, storage and visible progress.
- [x] **G-33** Port black-hole research/upgrades and exact costs/effects.
- [x] **G-34** Specify and implement which named timers advance under time warp and which do not.
- [x] **G-35** Process all warp completions through idempotent normal commands, including offline return and reload.
- [x] **G-36** Extract all manuscript/clue locations, rewards, duplicate guards and narrative order.
- [x] **G-37** Port megastructure discovery, star eligibility, five ordered research stages, source costs and timing. Record any remake construction simplifications.
- [x] **G-38** Port guardian/defense encounters, failure/retry and affected fleet/starship state.
- [x] **G-39** Port megastructure technology unlocks, bonuses and save/rebirth ownership; apply the megastructure modifier follow-ups from **E-09/E-35** once.
- [x] **G-40** Port the Miaplacidus force-field requirements, breach, Master AI sequence and ending state.
- [x] **G-41** Test missing clue/part, exact cost, time-warp completion, lost guardian fight and repeat ending attempt.
- [x] **G-42** Record the shipped end route separately from outdated GDD assumptions and verify it in a full browser journey.

## Cosmic Rip

- [x] **G-43** Extract Cosmic Rip unlock, story situation and scanner restoration costs/steps.
- [x] **G-44** Port sector catalogue, scan order/eligibility, scan timers and outcome generation.
- [x] **G-45** Port in-game telemetry production, storage, costs and UI; it is a gameplay resource, not player analytics.
- [x] **G-46** Port scanner upgrades, research catalogue, GP gates and cross-system modifiers.
- [x] **G-47** Port rip instability/progress rules, completion requirements, closure action and rewards.
- [x] **G-48** Guard one-time sector and closure rewards across reload, warp, offline return and rebirth.
- [x] **G-49** Test blocked/available scanner, interrupted scan, exact GP spend and complete closure route.
- [x] **G-50** Verify the Cosmic Rip tab remains reachable and translated in the default full build.

## Achievements, events and news

- [x] **G-51** Extract the complete shipped achievement catalogue, triggers, counters, rewards and persistence scope.
- [x] **G-52** Rebuild achievement artwork and badges as new assets mapped by stable IDs.
- [x] **G-53** Apply achievement triggers once at a defined event boundary and prevent reward duplication.
- [x] **G-54** Port random event tables, weights, prerequisites, instant/timed effects and end conditions.
- [x] **G-55** Port event history, choices and recovery after reload/offline return.
- [x] **G-56** Port news categories, story clues, prize rules, timing and duplicate guards.
- [x] **G-57** Seed and force events/news in development tests via the normal engine command boundary.
- [x] **G-58** Test achievement/event/news interactions across languages, save/reload and two rebirths.
- [x] **G-59** Compare fixed Cosmic Forge source scenarios for each meta domain and record approved balance differences.
- [x] **G-60** Update all meta/endgame parity areas with current source mapping, focused results and playable evidence.

## Completion evidence (4 October 2026)

- G-31–G-42: one full unit suite passed (20 files, 205 tests). Focused Chrome journeys cover Black Hole and the normal Miaplacidus homecoming route, including guardian failure/retry rules in the unit area.
- G-43–G-50: one full unit suite passed (20 files, 207 tests). The focused Cosmic Rip Chrome journey passed, including restore, research, closure, reload and six locales.
- G-51–G-60: one full unit suite passed (20 files, 213 tests). Focused Chrome achievements and random-events/news journeys both passed; the tests cover all nine themes, permanent rewards, claim-once behavior, saved journals and all six locales.
- Cross-section evidence for rebirth, AP/GP and market/casino spending, all four philosophies, manuscript/megastructure recovery, and the source-supported endings is linked from the completed contracts in [the archive](../../archive/plans/). Phase 5 differences and remaining presentation work stay visible in the [parity ledger](../feature-parity-checklist.md) and Phase 6.

**Exit gate passed:** the rebirth-to-ending route, including long-run currencies, all four philosophies, casino games, Miaplacidus homecoming, Cosmic Rip closure, adverse guardian recovery and achievement/event/news persistence, has current unit and browser evidence. Presentation polish and the production release remain in M-06 and M-07.
