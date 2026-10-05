# MIAPLACIDUS documentation

## Start here

1. [Audit method and scope](audit/README.md) — evidence, snapshot, and limits.
2. [Architecture and code inventory](audit/architecture.md) — boot, state, rendering, simulation, and module boundaries.
3. [Source inventory](audit/source-inventory.md) — module-by-module extraction guide and asset scale.
4. [State and simulation](audit/state-and-simulation.md) — clocks, ordering, saves and rebirth seams.
5. [Mechanics and content](audit/mechanics-and-content.md) — the complete feature domains to preserve.
6. [Persistence, localization, and distribution](audit/persistence-localization-distribution.md) — contracts that can lose progress or block translation.
7. [Quality and risk register](audit/quality-and-risks.md) — prioritized rebuild hazards.
8. [Existing tests and debug tools](audit/testing-and-debug.md) — the proven test style and its limitations.
9. [Foundation source contract and catalogues](audit/foundation-source-contract.md) — F-01–F-10 reference lock, tab inventory, module map and behavior distinctions.
10. [Foundation test plan](audit/foundation-test-plan.md) — source-derived acceptance checks; implemented Hydrogen coverage is tracked in the test harness and E2E area docs.

## Execution documents

- [Rebuild roadmap](plans/rebuild-roadmap.md) — phases, checkpoints, and architecture recommendation.
- [Master build checklist](plans/master-checklist.md) — the single project control checklist; links to detailed work packages.
- [Detailed work packages](plans/build-checklist/README.md) — task IDs for each phase.
- [Local save contract](plans/local-save-contract.md) — multi-slot startup, autosave, import/export and recovery rules.
- [Feature parity ledger](plans/feature-parity-checklist.md) — area-by-area evidence status, not a second work queue.
- [Bug tracker](bugs.md) — player-reported defects and their current investigation status.
- [Reuse and replacement decisions](plans/reuse-decisions.md) — what to port, adapt, or redesign.
- [Test harness plan](plans/test-harness.md) — implemented M-01 browser coverage, visual baselines and focused test commands.
- [Run and deploy guide](run-and-deploy.md) — start the Vite development server, preview the production build and publish `dist/` to a static host.
- [Completed F-11–F-18 toolchain plan](archive/plans/2026-10-02-toolchain-project-structure.md) — app scaffold, module rules, build modes and typed catalogue IDs.
- [Completed F-19–F-30 engine/simulation plan](archive/plans/2026-10-02-engine-and-simulation-core.md) — scoped state, commands, clocks, timers, transactions, snapshots and recovery.
- [Product decisions](plans/open-decisions.md) — the owner's settled scope, delivery and save choices.

Treat these as living documents. Cite a source path when changing a parity claim. Complete detailed tasks and master gates only after focused evidence and a playable check, where applicable. Keep the Cosmic Forge source unchanged.
