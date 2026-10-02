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

**F-01–F-30 implementation complete (2 October 2026).** F-01–F-10 record source inspection and extraction; F-11–F-18 establish the app/toolchain scaffold and stable IDs; F-19–F-30 implement the scoped engine and simulation core. This is still engine infrastructure, not a player-facing parity result. See the [F-19–F-30 completion record](../../archive/plans/2026-10-02-engine-and-simulation-core.md). F-31–F-42 and the full M-01 exit gate remain open.

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

**Verification note:** no unit or browser test files were added or run for F-19–F-30; the focused rule specs remain F-39 and the browser specs remain F-40. Infrastructure checks are recorded in the engine completion plan.

## First vertical slice and test tools

- [ ] **F-31** Render a semantic nine-tab shell with locked placeholders and stable pane IDs.
- [ ] **F-32** Implement Hydrogen manual gain, quantity/cap readout, sell, storage purchase, cash and one autobuyer through real engine commands.
- [ ] **F-33** Show affordability and disabled reasons from selectors, never parsed DOM text.
- [ ] **F-34** Wire English plus five other locale catalogues to the first slice; all visible text uses stable message keys.
- [ ] **F-35** Add Playwright config, local web server, failure traces/screenshots/video and focused area selection.
- [ ] **F-36** Add a clean-save browser fixture, fake clock/seed controls and page/console error capture.
- [ ] **F-37** Add test-only scenario commands through the engine boundary; ensure release builds omit them.
- [ ] **F-38** Recreate the useful debug scenario menu and searchable variable view only in development/test modes.
- [ ] **F-39** Add pure tests for precision, tick ordering, purchase atomicity, timers and first-slice unlocks.
- [ ] **F-40** Add browser tests for boot, Hydrogen loop, keyboard use, locale switch and the first save-ready state.
- [ ] **F-41** Record a repeatable baseline frame/heap measurement for the first slice and a late-game target fixture design.
- [ ] **F-42** Update the parity ledger with evidence for implemented portions; leave every unfinished area open.

**Exit gate:** a fresh run plays from the name screen through the Hydrogen slice; engine tests prove its rules; browser tests drive real controls; no CDN, cloud-save call or production debug access is needed for play. The save flow is completed in [phase 2](02-local-saves.md).
