# MIAPLACIDUS master build checklist

**This is the one checklist to follow and direct the remake.** Start with the earliest open gate; open its linked detailed work package and assign work by task ID (for example `S-22`). The detailed files supply the many small implementation tasks; the [parity ledger](feature-parity-checklist.md) records evidence by functional area. Update this file when a phase gate is accepted. Do not infer completion from old Cosmic Forge test results.

## Product contract

Rebuild the shipped Cosmic Forge game from scratch as **MIAPLACIDUS** with the same mechanics and feature breadth: nine tabs, progression through the Cosmic Rip ending, six languages, themes, events, achievements, onboarding, audio and offline play. Make all visual and audio assets anew. Deliver a responsive browser game for desktop and mobile; no Electron. Use independent `localStorage` saves, LZString text/file exchange and future migrations for **MIAPLACIDUS saves only**. Prefill the last pioneer, but load the **confirmed name on Start**. Do not add cloud saving or analytics. Full game is the default; a demo can be built only with an explicit flag. See the [owner's decisions](open-decisions.md) and [save contract](local-save-contract.md).

## Phase gates

- [ ] **M-01 — Reference and foundation.** Complete [F-01 through F-42](build-checklist/01-foundation.md): freeze a source reference, extract a traceable rules/content catalogue, scaffold the typed browser architecture and deterministic engine, add the functional-area harness, and prove a playable Hydrogen slice. Evidence: source map, focused pure/browser tests and a clean first-run walkthrough.
- [ ] **M-02 — Local saves and identity.** Complete [S-01 through S-58](build-checklist/02-local-saves.md): multi-slot storage, last-pioneer prefill, Confirm/Start selection, autosave, LZString code/file exchange, quota/conflict recovery and versioned migrations for saves created here. Evidence: independent two-pioneer round trip, exported restore, failure-path tests and no cloud route.
- [ ] **M-03 — Economy and research.** Complete [E-01 through E-57](build-checklist/03-economy.md): eight resources, sale/automation/storage, energy, research/technology, six compounds and precision policy. Evidence: source comparison scenarios, focused area tests and save/rebirth checks.
- [ ] **M-04 — Space and interstellar.** Complete [I-01 through I-55](build-checklist/04-space-interstellar.md): telescope, asteroids, four rockets, antimatter, star map, travel, fleet, diplomacy, battle, settlement and weather. Evidence: a complete journey through friendly and hostile branches, timer recovery and focused area tests.
- [ ] **M-05 — Meta systems and endgame.** Complete [G-01 through G-60](build-checklist/05-meta-endgame.md): rebirth, AP/GP, market/casino, four philosophies, black hole, manuscripts, megastructures, Miaplacidus ending, Cosmic Rip, achievements, events and news. Evidence: two-run progression and each ending route, including adverse branches.
- [ ] **M-06 — Presentation and localization.** Complete [P-01 through P-57](build-checklist/06-presentation.md) throughout phases 1–5: all nine tabs, responsive/mobile and keyboard controls, new art/audio, nine themes, onboarding/help/settings, six complete locales and the owner's quick translation OK. Evidence: screen inventory and visual/accessibility review across representative widths/locales.
- [ ] **M-07 — Verification and browser release.** Complete [V-01 through V-58](build-checklist/07-verification-release.md): current evidence in every applicable functional area, long-run/offline/performance checks, production debug exclusion, browser release and a separately flagged optional demo. Evidence: release artifact, documented test results, known deviations and owner acceptance.

## How to mark progress

1. Pick one open task ID from the linked phase file. Create or update a small feature contract with Cosmic Forge source references, new state ownership, UI states, failure cases and focused tests.
2. Implement and verify that slice in MIAPLACIDUS. Record command/result and any approved balance difference. Update the relevant area in the [parity ledger](feature-parity-checklist.md) and its test-area README when evidence exists.
3. Check the detailed task only when its implementation and relevant focused checks are reviewable. Mark `M-0x` complete only when all required linked tasks and its evidence gate are satisfied. Phase 6 runs alongside the gameplay phases, but its master gate closes before release.
4. If a task changes scope, edit the [decision record](open-decisions.md), contract, detailed task and this master gate in the same change. Keep a single project control point here.

**Source extraction, toolchain and engine substrate complete; playable slices remain open:** F-01–F-10 extraction, F-11–F-18 scaffold, and F-19–F-30 engine/simulation implementation are recorded in the [foundation package](build-checklist/01-foundation.md). F-31–F-42 and the M-01 exit gate remain open. The engine substrate does not count as player-facing parity evidence; focused rule specs and browser specs remain F-39 and F-40.
