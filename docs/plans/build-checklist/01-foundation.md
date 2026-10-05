# Phase 1 — foundation and source extraction

**Outcome:** a running typed browser shell and deterministic game engine that can support the full Cosmic Forge ruleset. This phase includes an initial playable vertical slice, not the rest of the game. Reference: [architecture audit](../../audit/architecture.md), [state and simulation audit](../../audit/state-and-simulation.md), [reuse decisions](../reuse-decisions.md).

## Source contract and content extraction

- [x] **F-01** Freeze a reference Cosmic Forge commit/hash for parity work and record changes found after the audit snapshot. Evidence: [source contract](../../audit/foundation-source-contract.md#f-01--reference-snapshot).
- [x] **F-02** Walk all nine current tab menus and list each pane, action, visible value, gate and modal in a traceable inventory. Evidence: [source contract](../../audit/foundation-source-contract.md#f-02--navigation-identity-and-nine-tab-inventory) and the three domain catalogues.
- [x] **F-03** Map every root runtime module and tab renderer to new engine, catalogue, UI, adapter or excluded cloud-save ownership. Evidence: [root-module crosswalk](../../audit/foundation-source-contract.md#f-03--current-root-module-ownership-and-extraction-destination).
- [x] **F-04** Extract all resource and compound keys, starting quantities, caps, sale values, upgrade tiers and price formulas into a reviewable catalogue. Evidence: [economy catalogue](../../audit/foundation-economy.md).
- [x] **F-05** Extract all buildings, batteries, research upgrades, technology prerequisites and unlock effects. Evidence: [economy catalogue](../../audit/foundation-economy.md) and [space/interstellar catalogue](../../audit/foundation-space.md).
- [x] **F-06** Extract star seeds/types/system traits, weather tables, asteroid classes, rocket/starship parts and fleet units. Evidence: [space/interstellar catalogue](../../audit/foundation-space.md).
- [x] **F-07** Extract permanent perks, philosophies, repeatables, achievements, events, casino prizes and Cosmic Rip content. Evidence: [meta/endgame catalogue](../../audit/foundation-meta.md).
- [x] **F-08** Map each rule's current source function, affected save fields, translation keys and matching old test area. Evidence: F-08 crosswalks in all three domain catalogues.
- [x] **F-09** Record numerical examples and representative early, mid, travel, rebirth and endgame scenarios from the reference game. Evidence: F-09 sections in all three domain catalogues and [planned test examples](../../audit/foundation-test-plan.md).
- [x] **F-10** Identify deliberate legacy quirks separately from bugs or stale GDD claims; require a recorded decision before changing a rule. Evidence: [source contract](../../audit/foundation-source-contract.md#f-10--behavior-differences-that-require-an-explicit-decision) and F-10 sections in the domain catalogues.

**M-01 foundation complete (2 October 2026).** F-01–F-10 record source inspection and extraction; F-11–F-18 establish the app/toolchain scaffold and stable IDs; F-19–F-30 implement the scoped engine and simulation core; F-31–F-42 deliver and verify the Hydrogen-only vertical slice. See the [engine completion record](../../archive/plans/2026-10-02-engine-and-simulation-core.md) and [Hydrogen slice completion record](../../archive/plans/2026-10-02-hydrogen-vertical-slice.md). Broader feature areas remain open in the parity ledger.

## Toolchain and project structure

- [x] **F-11** Scaffold Vite + React + strict TypeScript inside IncrementalGame without importing Cosmic Forge runtime modules. Evidence: [completion record](../../archive/plans/2026-10-02-toolchain-project-structure.md), [app entry](../../../src/main.tsx), [Vite config](../../../vite.config.ts).
- [x] **F-12** Add explicit `dev`, `build`, `typecheck`, focused unit and focused E2E commands and document their purpose. Evidence: [package scripts](../../../package.json), [test harness plan](../test-harness.md).
- [x] **F-13** Define directories for `engine`, `content`, `persistence`, `i18n`, `ui`, `audio`, `assets` and test helpers. Evidence: [source ownership guide](../../../src/README.md), [completion record](../../archive/plans/2026-10-02-toolchain-project-structure.md).
- [x] **F-14** Configure module boundaries so engine code cannot import React, browser DOM or audio code. Evidence: [Oxlint rules](../../../.oxlintrc.json), [CI workflow](../../../.github/workflows/ci.yml).
- [x] **F-15** Add TypeScript/format/lint rules and an import-boundary check that runs in CI. Evidence: [TypeScript config](../../../tsconfig.json), [Oxlint rules](../../../.oxlintrc.json), [Oxfmt config](../../../.oxfmtrc.json), [CI workflow](../../../.github/workflows/ci.yml).
- [x] **F-16** Bundle runtime dependencies locally; boot must not require a CDN. Evidence: [completion record](../../archive/plans/2026-10-02-toolchain-project-structure.md), [app entry](../../../src/main.tsx).
- [x] **F-17** Define development, test and default full-browser modes; reserve an explicit opt-in demo flag with no demo restriction in the normal build. Evidence: [Vite config](../../../vite.config.ts), [build metadata](../../../src/app/buildInfo.ts), [completion record](../../archive/plans/2026-10-02-toolchain-project-structure.md).
- [x] **F-18** Define stable catalogue IDs and typed references for resources, upgrades, techs, systems, actions and events. Evidence: [catalogue IDs](../../../src/content/ids.ts), [typed catalogue reference](../../../src/content/index.ts).

## Engine and state model

- [x] **F-19** Split save state into run, permanent, settings and statistics scopes with initial-state factories. Evidence: [scoped state and validation](../../../src/engine/state.ts).
- [x] **F-20** Define commands/actions, precondition results, state transitions, selectors and domain events. Evidence: [engine commands and selectors](../../../src/engine/commands.ts), [stable action IDs](../../../src/content/ids.ts).
- [x] **F-21** Make purchase commands atomic across cash and up to three material costs. Evidence: [purchase preconditions and reducer](../../../src/engine/commands.ts).
- [x] **F-22** Port the old precision/affordability policy to pure typed functions and record any approved differences. Evidence: [typed precision helpers](../../../src/engine/precision.ts), [source comparison](../../archive/plans/2026-10-02-engine-and-simulation-core.md#command-boundary-and-purchases).
- [x] **F-23** Create an injectable clock with wall time, simulation time, pause/resume and bounded elapsed steps. Evidence: [clock contract](../../../src/engine/clock.ts).
- [x] **F-24** Create an injectable seeded random source for stars, weather, events, casino and battles. Evidence: [seeded random source](../../../src/engine/random.ts).
- [x] **F-25** Define timer IDs, repeat/completion semantics and idempotent completion commands. Evidence: [timer policy and completion](../../../src/engine/timers.ts).
- [x] **F-26** Define which timers progress during hidden-tab time, offline gains and black-hole time warp. Evidence: [timer policies](../../../src/engine/timers.ts), [clock/offline contract](../../../src/engine/clock.ts).
- [x] **F-27** Define an ordered resource transaction tick for production, fuel, crafting, sales and storage clamps. Evidence: [resource transaction](../../../src/engine/transactions.ts).
- [x] **F-28** Publish coarse/derived snapshots for React; avoid one React state update per simulation timer. Evidence: [snapshot store](../../../src/engine/store.ts), [React subscription](../../../src/ui/useGameSnapshot.ts).
- [x] **F-29** Make state transitions deterministic from state, command, clock input and random seed. Evidence: [pure transition boundary](../../../src/engine/commands.ts), [random state](../../../src/engine/random.ts).
- [x] **F-30** Define error boundaries and recovery that leave a valid playable state after a rejected command. Evidence: [state recovery](../../../src/engine/store.ts), [render recovery](../../../src/ui/GameErrorBoundary.tsx).

**Verification note:** F-19–F-30 has focused unit evidence recorded in the engine completion plan. The first player-facing slice has its own rule and browser evidence under F-39/F-40 below.

## First vertical slice and test tools

- [x] **F-31** Render the initial semantic nine-source-tab shell with locked placeholders and stable pane IDs. This was the foundation baseline; M-06's current navigation policy omits locked main tabs, uses names-only labels, and appends Miaplaedia after Settings. Evidence: [app shell](../../../src/app/App.tsx), [boot/navigation browser tests](../../../tests/e2e/app-boot/hydrogen-boot.spec.ts), and the [current navigation contract](../presentation-navigation-contract.md).
- [x] **F-32** Implement Hydrogen manual gain, quantity/cap readout, sell, storage purchase, cash and one autobuyer through real engine commands. Evidence: [Hydrogen commands](../../../src/engine/commands.ts), [content rules](../../../src/content/hydrogen.ts), and [Hydrogen pane](../../../src/app/App.tsx).
- [x] **F-33** Show affordability and disabled reasons from selectors, never parsed DOM text. Evidence: [purchase and action selectors](../../../src/engine/selectors.ts).
- [x] **F-34** Wire English plus five other locale catalogues to the first slice; all visible text uses stable message keys. Evidence: [six typed catalogues](../../../src/i18n/messages.ts), [key/placeholder parity unit test](../../../tests/unit/hydrogen.spec.ts), and the six-locale browser check.
- [x] **F-35** Add Playwright config, local web server, failure traces/screenshots/video and focused area selection. Evidence: [Playwright configuration](../../../playwright.config.ts) and package scripts.
- [x] **F-36** Add a clean-run browser fixture, fake clock/seed controls and page/console/network error capture. Evidence: [browser fixture](../../../tests/e2e/_harness/fixtures.ts) and [injected test clock](../../../src/app/App.tsx).
- [x] **F-37** Add test-only scenario commands through the engine boundary; ensure release builds omit them. Evidence: [debug scenario gateway](../../../src/app/testing/DebugTools.tsx), normal command batching in the [engine store](../../../src/engine/store.ts), and production bundle inspection in the [completion record](../../archive/plans/2026-10-02-hydrogen-vertical-slice.md).
- [x] **F-38** Recreate the useful debug scenario menu and searchable variable view only in development/test modes. Evidence: [development/test-only debug tools](../../../src/app/testing/DebugTools.tsx).
- [x] **F-39** Add pure tests for precision, tick ordering, purchase atomicity, timers and first-slice unlocks. Evidence: [Hydrogen rule specs](../../../tests/unit/hydrogen.spec.ts) and [foundation engine specs](../../../tests/unit/foundation-engine.spec.ts); 11 focused tests passed.
- [x] **F-40** Add browser tests for boot, Hydrogen loop, keyboard use, locale switch and the first save-ready state. Evidence: [boot/navigation/localization/responsive and visual startup tests](../../../tests/e2e/app-boot/hydrogen-boot.spec.ts), [resource tests](../../../tests/e2e/resources/hydrogen-loop.spec.ts), and [compressor test](../../../tests/e2e/autobuyers/hydrogen-compressor.spec.ts); all 8 focused UI browser tests passed with screenshot comparisons. A named, valid Hydrogen run is ready for Phase 2 save integration; save storage/export is not part of M-01.
- [x] **F-41** Record a repeatable baseline frame/heap measurement for the first slice and a late-game target fixture design. Evidence: [performance spec](../../../tests/e2e/performance/hydrogen-baseline.spec.ts) and [fixture design](../../../tests/fixtures/README.md).
- [x] **F-42** Update the parity ledger with evidence for implemented portions; leave every unfinished area open. Evidence: [Hydrogen-only parity evidence](../feature-parity-checklist.md#hydrogen-vertical-slice-evidence-m-01).

**Exit gate passed (2 October 2026):** a fresh named run plays from the name screen through the Hydrogen slice; focused engine and browser tests prove its rules; no external request is made; production output contains no debug chunk or gateway identifier. The save flow remains in [phase 2](02-local-saves.md).
