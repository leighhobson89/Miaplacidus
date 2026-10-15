# Test workspace

Browser coverage is organized and run by canonical functional area. See the [completed E2E area plan and regression report](../docs/archive/plans/2026-10-15-e2e-functional-area-coverage-and-refactor.md) and [area folder index](e2e/README.md). `npm run test:e2e:area -- <area>` isolates one folder; `npm run test:e2e` runs all manifest areas separately. E2E output is written under the OS Temp folder. Unit tests remain in `tests/unit/`.

`e2e/` holds player-click browser tests grouped by functional area. `e2e/_harness/` contains shared fixtures, screenshot checks and the development/test-only debug gateway. `unit/` contains pure engine and persistence tests. `fixtures/` documents deterministic sanitized state families; the save migration fixtures are generated in test code and contain no player data.

The E2E area restructuring and single full-regression recovery goal is complete; the archived plan records its final structure, result, and focused recoveries. See the [parity ledger](../docs/plans/feature-parity-checklist.md), [test harness plan](../docs/plans/test-harness.md), and populated [browser area READMEs](e2e/README.md) for evidence.

Use `npm run test:unit:focused -- <spec>` and `npm run test:e2e:focused -- <spec-or-grep>` while developing. The full-suite and release run remain separate phase gates.
