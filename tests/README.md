# Test workspace

Browser coverage is organized and run by canonical functional area. See the [E2E area plan](../docs/plans/e2e-functional-area-coverage-and-refactor.md) and [area folder index](e2e/README.md). `npm run test:e2e:area -- <area>` isolates one folder; `npm run test:e2e` runs all manifest areas separately and stores artifacts under the OS Temp folder. Unit tests remain in `tests/unit/`.

`e2e/` holds player-click browser tests grouped by functional area. `e2e/_harness/` contains shared fixtures, screenshot checks and the development/test-only debug gateway. `unit/` contains pure engine and persistence tests. `fixtures/` documents deterministic sanitized state families; the save migration fixtures are generated in test code and contain no player data.

The Hydrogen slice and M-02 save flows have focused passing evidence. Full functional-area isolation and coverage work is active; the [E2E area plan](../docs/plans/e2e-functional-area-coverage-and-refactor.md) tracks the remaining folders and recovery cases. See the [parity ledger](../docs/plans/feature-parity-checklist.md), [test harness plan](../docs/plans/test-harness.md), and populated [browser area READMEs](e2e/README.md) for evidence.

Use `npm run test:unit:focused -- <spec>` and `npm run test:e2e:focused -- <spec-or-grep>` while developing. The full-suite and release run remain separate phase gates.
