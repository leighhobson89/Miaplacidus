# Test workspace

`e2e/` holds player-click browser tests grouped by functional area. `e2e/_harness/` contains shared fixtures, screenshot checks and the development/test-only debug gateway. `unit/` contains pure engine and persistence tests. `fixtures/` documents deterministic sanitized state families; the save migration fixtures are generated in test code and contain no player data.

The Hydrogen slice and M-02 save flows have focused passing evidence. The full game areas remain open; see the [parity ledger](../docs/plans/feature-parity-checklist.md), the [test harness plan](../docs/plans/test-harness.md), and the populated [browser area READMEs](e2e/README.md).

Use `npm run test:unit:focused -- <spec>` and `npm run test:e2e:focused -- <spec-or-grep>` while developing. The full-suite and release run remain separate phase gates.
