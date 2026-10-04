# Feature parity ledger

Source taxonomy: Cosmic Forge `tests/docs/functional-areas.json` at the audit snapshot. The folders under `tests/e2e/` adapt its 50 areas: `save-load-cloud` is replaced by `save-slots`. This is an **evidence ledger, not a second work checklist**. Each feature row below records its current evidence status. The [one master checklist](master-checklist.md) controls work; its seven linked packages contain task IDs. For each area, record source rules/data, normal and failure paths, persistence/rebirth effect, six-language UI, focused tests and a current browser result in its area README or feature plan. Original-game save import, Electron and analytics are excluded by the [decision record](open-decisions.md); other shipped gameplay remains in scope.

## Source extraction baseline — 2 October 2026

Foundation tasks F-01–F-10 have complete source/documentation evidence against Cosmic Forge commit `93e32669c3b35e76cdd4cf82725c14e7215b2fbc`. See the [source contract](../audit/foundation-source-contract.md), [economy](../audit/foundation-economy.md), [space/interstellar](../audit/foundation-space.md), [meta/endgame](../audit/foundation-meta.md), and [test matrix](../audit/foundation-test-plan.md). F-19–F-30 provide engine infrastructure. M-01 adds current player-facing evidence for a Hydrogen-only slice; see the partial evidence below. The broader functional-area rows remain open because their full feature scope has not been implemented.

## Toolchain and project-structure work (F-11-F-18)

Scaffolding, local tooling, dependency boundaries and typed catalogue IDs are recorded in the completed [toolchain/project-structure plan](../archive/plans/2026-10-02-toolchain-project-structure.md). These foundation tasks establish implementation infrastructure only. They do not establish player-observable parity: every functional-area row below remains **Not started** until its game behavior is implemented and checked. A successful shell build, typecheck or import-boundary check does not change an area status.

## Engine/simulation substrate (F-19-F-30)

The scoped state tree, deterministic command boundary, precision helpers, injected clock/random source, timer policy, ordered resource transaction, derived snapshot store and recovery path are recorded in the completed [engine/simulation plan](../archive/plans/2026-10-02-engine-and-simulation-core.md). This is implementation infrastructure. The Hydrogen-only slice has current partial evidence under M-01; broader functional-area rows remain open.

## Hydrogen vertical slice evidence (M-01)

This evidence covers the first playable slice and does not close any broad feature area below.

| Area                     | Current evidence                                                                                                                                                                                 | Still open in the broad area                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `app-boot`               | Fresh named run reaches Hydrogen with $10, 50 RP, 0/150 Hydrogen, nine semantic tabs, a stable active pane, and only Hydrogen unlocked. Spanish boot locale and local-only requests are checked. | Empty/missing storage, offline startup, demo/build gates, save-slot selection and all other progression starts. |
| `resources`              | Manual +1 collection, $0.02/unit sale, whole-unit sale behavior, 149-Hydrogen storage purchase and 150-to-300 capacity are checked through controls and selectors.                               | The other seven resources, full sale/storage cases, fusion and all downstream economy paths.                    |
| `autobuyers`             | One Hydrogen compressor costs 50, produces 2/s, advances through the injected clock and pauses without further production. The 50/57/65 price recurrence is unit-tested.                         | Other Hydrogen tiers, all other resource/compound buyers, energy, allocations and cap/recovery interactions.    |
| `precision` / `rounding` | Hydrogen fractional sale settlement, two-cent value arithmetic, repeated price ceiling and atomic affordability checks have focused unit evidence.                                               | Cross-system currency/quantity behavior, all resource scales, notation and compound rounding.                   |
| `localization`           | All six first-slice catalogues pass key/placeholder parity; the browser switches live through all six languages and keeps a stable `lang` value.                                                 | Full-game catalogue parity, translation review and long-text/layout review across all screens.                  |
| `ui-navigation`          | Nine stable tab/pane IDs, locked placeholders and arrow-key tab movement are checked; the Hydrogen control and long German labels stay usable at 390px width without document overflow.          | All game panes, focus paths, themes, touch flows and full responsive layouts.                                   |
| `performance`            | Seed `314159`, 1280×720 Chrome run records first-slice frame/heap/DOM/listener metrics; the target late-game fixture design is documented.                                                       | Long-run and late-game measurements, cross-browser matrix and release thresholds.                               |

The reproducible spec commands, outcomes, and measured baseline are in each populated [browser area README](../../tests/e2e/README.md) and the [M-01 completion record](../archive/plans/2026-10-02-hydrogen-vertical-slice.md). M-01 provides partial evidence for the listed areas; full-area status stays open until normal and failure paths across the full game are implemented and checked.

## Local saves evidence (M-02)

The Hydrogen slice has complete save-system gate evidence, while the four broad feature areas remain partial because their full game breadth is still open. See the [M-02 completion record](../archive/plans/2026-10-02-local-saves.md) and [local save contract](local-save-contract.md).

| Area              | Current evidence                                                                                                                                                          | Still open in the broad area                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `save-load-local` | Hydrogen state survives autosave/reload; live state exports through clipboard, text and `.txt`; fresh-profile restore and quota/blocked-storage paths are browser-tested. | Full-game state coverage, offline gains and all later gameplay domains.               |
| `save-slots`      | Two pioneers retain independent Hydrogen progress; Confirm/Start, prefill, switching, rename, save-as-new, delete, conflict and damaged-save recovery are browser-tested. | Full-game progression and all cross-system state boundaries.                          |
| `save-migration`  | Strict v1 validation rejects malformed, future and Cosmic Forge payloads; synthetic v0 migrates to a playable v1 slot; failed writes preserve the prior generation.       | Fixtures for each future shipped MIAPLACIDUS schema and full-game migration coverage. |
| `migration`       | A synthetic earlier schema runs through the migration registry and reaches playable Hydrogen state.                                                                       | One fixture and playable-state check per future shipped MIAPLACIDUS release.          |

The focused browser evidence uses player clicks and screenshot baseline comparison. It checks that the app surface is present and not white, and reports page errors, console errors and unexpected external requests. The Hydrogen briefing is shown once for new slots and its completion survives reload; the full tutorial remains in M-06. Rebirth persistence uses imported fixtures because the rebirth mechanic belongs to M-05.

## Economy evidence (M-03 partial, 3 October 2026)

The [economy browser README](../../tests/e2e/economy/README.md) records source comparisons, screenshot checkpoints, test instructions and the remaining evidence boundary. The slice covers a fresh Hydrogen route through the first Research purchase, Energy unlock and Diesel compound unlock; click paths for all eight materials and six compounds; every autobuyer and storage tier; energy and research buildings; manual and automated research completion announcements; manual completion feedback in all six locales; all six automatic compound recipes; save/reload; and screenshots for Hydrogen, Research, Energy and Compounds in all six locales. Unit rules and ten-second source comparisons are in [`tests/unit/economy.spec.ts`](../../tests/unit/economy.spec.ts), with source values in the [economy audit](../audit/foundation-economy.md) and deterministic tick policy in the [economy contract](economy-contract.md).

The M-03 economy and research phase gate is complete. M-04 and M-05 have closed the rebirth carryover, repeatable-price restoration (**E-06/E-13/E-36/E-56**) and later space/weather/power/technology integration (**E-09/E-25/E-26/E-35**) follow-ups. The exhaustive six-language UI review (**E-57**) remains assigned to M-06; broader economy-related area status stays partial until that presentation review is complete.

## Foundation

- **Not started** — `app-boot` — clean start, missing storage/network, build gates and first playable screen.
- **Partial (M-02 Hydrogen evidence)** — `save-load-local` — remaining: full-game state coverage, offline gains and later gameplay domains.
- **Partial (M-02 Hydrogen evidence)** — `save-slots` — remaining: full-game progression and cross-system state boundaries.
- **Partial (M-02 Hydrogen evidence)** — `save-migration` — remaining: fixtures for future shipped schema versions and full-game migration coverage.
- **Partial (M-02 Hydrogen evidence)** — `migration` — remaining: a migration fixture and playable-state check for each future shipped release.
- **Partial (M-05 evidence)** — `settings` — locale, nine themes, notation, sound preference and reduced motion persist; settings now exposes achievements and the meta journal. Audio playback and full M-06 visual/accessibility review remain.
- **Not started** — `offline-gains` — elapsed time cap/rate and all affected simulation domains.

## Core economy

- **Partial (M-03 evidence)** — `resources` — eight materials, gain, storage, sale and visible rates.
- **Partial (M-03 evidence)** — `autobuyers` — tiers, costs, energy use, pause/restart and storage cap.
- **Partial (M-03 evidence)** — `autosell` — allocation and sale paths, competing consumers, retained stock.
- **Partial (M-03 evidence)** — `energy` — plants, batteries, fuel, trip and recovery.
- **Partial (M-03 evidence)** — `research` — generation and upgrade affordability.
- **Partial (M-03 evidence)** — `technology` — prerequisites, unlocks, tree and repeatable technologies.
- **Partial (M-03 evidence)** — `compounds` — six recipes, manual/automatic creation, costs and caps.
- **Partial (M-03 evidence)** — `precision` — tolerance, affordability, spend and displayed quantity.
- **Partial (M-03 evidence)** — `rounding` — cross-system sale/price/rate/notation edges.

## Space operations

- **Not started** — `space-telescope` — scanning, star study, upgrades and timers.
- **Not started** — `space-mining` — asteroid discovery/classes and mining journey.
- **Not started** — `rockets` — launch pad, four rocket slots, build/fuel/flight/return/reset.
- **Not started** — `antimatter` — collection, caps, boosts and spending.

## Interstellar

- **Not started** — `star-map` — generation/seed, coordinates, navigation, distances and discovery.
- **Not started** — `star-types` — bonuses and neutral types.
- **Not started** — `starship` — parts, readiness, launch, target, travel and arrival.
- **Not started** — `fleet-hangar` — ship types, prices, composition and readiness.
- **Not started** — `diplomacy` — envoy, impression, decisions, vassalization and failures.
- **Not started** — `battle` — damage, defense, loss/retry and victory effects.
- **Not started** — `colonise` — settlement ownership and rewards.

## Meta progression

- **Complete (G-01–G-08)** — `rebirth` — two rebirths, full source carryover, starter perks, saved automation choices, destination profile/weather and Expansionist bonus systems are unit-tested.
- **Complete (G-05)** — `automation` — the source-listed resource allocations, compound creation, research auto-buyer and owned auto-telescope settings persist at the correct scope across rebirth.
- **Complete (G-09–G-16)** — `ascendency` — all sixteen IDs/costs, cross-system modifiers after portable reload/rebirth, exact AP/GP sources and sinks, duplicate guards and the Chrome purchase path are evidenced.
- **Complete (G-11–G-16)** — `galactic-market` — prices, quotes, settlement rounding, AP sales, liquidation, history, cycles and lockdown rules have focused unit and Chrome browser coverage.
- **Complete (G-17–G-24)** — `galactic-casino` — source rules, all games, saved hand reload, normal timer completion and localized player controls have unit and Chrome browser coverage.
- **Complete (G-25–G-30)** — `philosophies` — four paths, abilities, repeatables, six-language choice copy, rebirth and save/reload are evidenced in the [philosophy report](../../tests/e2e/philosophies/README.md) and archived source contract.
- **Complete (G-51–G-53, G-58, G-60)** — `achievements` — all 70 stable IDs, localized names/rewards, new badges, exactly-once rewards, theme history, save/reload and six-locale UI are tested.

## Endgame

- **Complete (G-31–G-35, G-54–G-55, G-60)** — `black-hole` — discovery, research, charge/upgrades, named timer policies, instability multipliers, save migration and recovery are unit/browser verified.
- **Complete (G-36–G-42, G-60)** — `megastructures` — manuscript clues, duplicate rewards, research tracks, permanent modifiers, guardian loss/retry, force field and source-supported homecoming route are unit/browser verified.
- **Complete (G-43–G-50, G-60)** — `cosmic-rip` — unlock, scanner, sectors, telemetry, research, GP sinks, closure, reload and six translated locales are unit/browser verified.

## Simulation and ambience

- **Not started** — `weather` — transitions, system identity, production, precipitation, launch gates.
- **Complete (G-54–G-55, G-57–G-60)** — `random-events` — eligibility, probabilities, effects, minute shifts, history, timer ends, reload, forced test commands and source comparisons are evidenced.
- **Complete (G-56–G-60)** — `news-ticker` — all categories, clue eligibility, prizes, timing, claim-once guards, saved journal and six-locale copy are unit/browser verified.
- **Not started** — `audio` — effects, ambience, preferences and unavailable audio.

## Presentation and shell

- **Partial (M-02 Hydrogen evidence)** — `onboarding` — new slots receive a localized first-run Hydrogen briefing that stays dismissed after reload; the full tutorial, skip/resume flow and all-feature coverage remain open.
- **Not started** — `cosmicopedia` — help, story and current feature explanations.
- **Not started** — `statistics` — run/lifetime counters and resets.
- **Partial (M-01/M-05 evidence)** — `ui-navigation` — nine stable tabs, keyboard movement and always-available Settings with achievement/journal sections are checked; full responsive/touch/focus review stays with M-06.
- **Not started** — `notifications` — queues, classification, placement and clear-all.
- **Not started** — `notation` — number modes across every relevant pane.
- **Not started** — `localization` — all six catalogues, dynamic text, live switch and layout.
- **Not started** — `performance` — late-game frame, heap, nodes, listeners, idle stability.
- **Not started** — `demo-build` — optional flagged browser demo; default full build and debug gates.

## Acceptance record template

For a completed row, write: source code/version; extracted rule/data catalogue; intentional deviations; pure test command/result; Playwright area command/result; save/offline/rebirth impact; locale and viewport review; reviewer/date. Set its status to **evidenced** only when the new game has current evidence. A row may be **deferred** only by updating the stated product scope and recording the reason in the [decision record](open-decisions.md). The optional demo row may remain **planned** until a flagged demo is chosen.
