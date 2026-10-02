# Feature parity ledger

Source taxonomy: Cosmic Forge `tests/docs/functional-areas.json` at the audit snapshot. The folders under `tests/e2e/` adapt its 50 areas: `save-load-cloud` is replaced by `save-slots`. This is an **evidence ledger, not a second work checklist**. All feature rows begin **not started**. The [one master checklist](master-checklist.md) controls work; its seven linked packages contain task IDs. For each area, record source rules/data, normal and failure paths, persistence/rebirth effect, six-language UI, focused tests and a current browser result in its future area README or feature plan. Original-game save import, Electron and analytics are excluded by the [decision record](open-decisions.md); other shipped gameplay remains in scope.

## Source extraction baseline — 2 October 2026

Foundation tasks F-01–F-10 have complete source/documentation evidence against Cosmic Forge commit `93e32669c3b35e76cdd4cf82725c14e7215b2fbc`. See the [source contract](../audit/foundation-source-contract.md), [economy](../audit/foundation-economy.md), [space/interstellar](../audit/foundation-space.md), [meta/endgame](../audit/foundation-meta.md), and [planned test matrix](../audit/foundation-test-plan.md). This records what the reference does and what to verify later; it does not mark any remake feature row evidenced. Runtime implementation and current remake test results remain not started.

## Toolchain and project-structure work (F-11-F-18)

Scaffolding, local tooling, dependency boundaries and typed catalogue IDs are recorded in the completed [toolchain/project-structure plan](../archive/plans/2026-10-02-toolchain-project-structure.md). These foundation tasks establish implementation infrastructure only. They do not establish player-observable parity: every functional-area row below remains **Not started** until its game behavior is implemented and checked. A successful shell build, typecheck or import-boundary check does not change an area status.

## Foundation

- **Not started** — `app-boot` — clean start, missing storage/network, build gates and first playable screen.
- **Not started** — `save-load-local` — autosave, LZString text/file export/import, clipboard paths, failure recovery.
- **Not started** — `save-slots` — multiple local saves, prefilled last pioneer, confirmed-name selection on Start, rename/delete/conflicts.
- **Not started** — `save-migration` — malformed, missing and future MIAPLACIDUS fields; atomic failure.
- **Not started** — `migration` — each shipped MIAPLACIDUS version rung with a representative playable save.
- **Not started** — `settings` — preference persistence, sound, language, theme, notation.
- **Not started** — `offline-gains` — elapsed time cap/rate and all affected simulation domains.

## Core economy

- **Not started** — `resources` — eight materials, gain, storage, sale and visible rates.
- **Not started** — `autobuyers` — tiers, costs, energy use, pause/restart and storage cap.
- **Not started** — `autosell` — allocation and sale paths, competing consumers, retained stock.
- **Not started** — `energy` — plants, batteries, fuel, trip and recovery.
- **Not started** — `research` — generation and upgrade affordability.
- **Not started** — `technology` — prerequisites, unlocks, tree and repeatable technologies.
- **Not started** — `compounds` — six recipes, manual/automatic creation, costs and caps.
- **Not started** — `precision` — tolerance, affordability, spend and displayed quantity.
- **Not started** — `rounding` — cross-system sale/price/rate/notation edges.

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

- **Not started** — `rebirth` — preconditions, reset, carryover and second run.
- **Not started** — `automation` — automation settings survive/reconfigure at the right scope.
- **Not started** — `ascendency` — AP earning/spending and perk effects.
- **Not started** — `galactic-market` — rates, transactions, history/lockdowns.
- **Not started** — `galactic-casino` — CP purchase, all games, prizes and timer convergence.
- **Not started** — `philosophies` — four paths, abilities, repeatables and permanence.
- **Not started** — `achievements` — full catalogue, rewards, images, persistence and rebirth.

## Endgame

- **Not started** — `black-hole` — discovery, charge, activation, time warp and affected timers.
- **Not started** — `megastructures` — manuscripts/clues, guardians, tech, force field, end route.
- **Not started** — `cosmic-rip` — GP, scanner, sectors, telemetry, research and closure.

## Simulation and ambience

- **Not started** — `weather` — transitions, system identity, production, precipitation, launch gates.
- **Not started** — `random-events` — trigger weights, instant/timed effects, history and recovery.
- **Not started** — `news-ticker` — lore, clues, prizes, category selection and timing.
- **Not started** — `audio` — effects, ambience, preferences and unavailable audio.

## Presentation and shell

- **Not started** — `onboarding` — prompts, tutorial, resume/skip and language.
- **Not started** — `cosmicopedia` — help, story and current feature explanations.
- **Not started** — `statistics` — run/lifetime counters and resets.
- **Not started** — `ui-navigation` — nine tabs, option rows, unlock/attention indicators.
- **Not started** — `notifications` — queues, classification, placement and clear-all.
- **Not started** — `notation` — number modes across every relevant pane.
- **Not started** — `localization` — all six catalogues, dynamic text, live switch and layout.
- **Not started** — `performance` — late-game frame, heap, nodes, listeners, idle stability.
- **Not started** — `demo-build` — optional flagged browser demo; default full build and debug gates.

## Acceptance record template

For a completed row, write: source code/version; extracted rule/data catalogue; intentional deviations; pure test command/result; Playwright area command/result; save/offline/rebirth impact; locale and viewport review; reviewer/date. Set its status to **evidenced** only when the new game has current evidence. A row may be **deferred** only by updating the stated product scope and recording the reason in the [decision record](open-decisions.md). The optional demo row may remain **planned** until a flagged demo is chosen.
