# Test workspace

`e2e/` contains 50 empty functional-area folders mirroring Cosmic Forge's current Playwright taxonomy. `_harness/` is reserved for shared fixtures, server/report helpers and debug gateway code. `unit/` is reserved for pure simulation and migration tests. `fixtures/` is reserved for sanitized saves and deterministic scenarios. `docs/` will hold current run and coverage guidance.

No tests or executable harness scripts are present yet. The design and rollout order are in [the test harness plan](../docs/plans/test-harness.md). Runtime and test dependencies are declared in [package.json](../package.json). Source-derived scenarios for the first future remake tests are in the [foundation test plan](../docs/audit/foundation-test-plan.md); none are reported as passed.
