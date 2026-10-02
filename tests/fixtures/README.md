# Fixture plan

## M-01 late-game target fixture design

The first measurable baseline is the fresh Hydrogen screen. For a later performance comparison, prepare a deterministic **pre-Cosmic-Rip closure** state, not a synthetic DOM-only screen. This is a target design; no late-game feature state or fixture is implemented by M-01.

The fixture builder should:

1. Start from a validated, versioned MIAPLACIDUS state with a fixed seed and named run.
2. Establish the relevant progression using normal engine commands, grouped at the store notification boundary. Do not assign balances or progression from a UI helper.
3. Reach the source-backed closure-ready boundary: scanner restored, at least one valid sector available, all five Cosmic Rip technologies researched, and the required GP/telemetry balances present. Keep one repeatable seeded star/map and document exact content IDs when the engine models ship.
4. Validate the resulting state with the authoritative schema and save a sanitized fixture with explicit fixture version, seed, locale and builder command log.
5. Measure that fixture in the same browser, viewport and sample interval as the fresh Hydrogen baseline. Keep gameplay/assertion checks separate from performance data.

The source acceptance details are in [`foundation-meta.md`](../../docs/audit/foundation-meta.md) and [`foundation-test-plan.md`](../../docs/audit/foundation-test-plan.md); the current minimum Cosmic Rip costs and closure gates are the authoritative figures. The target must be refreshed against typed MIAPLACIDUS rules when the endgame is implemented.

## Later fixture families

As their schemas exist, add sanitized and versioned start, mid-game, interstellar, rebirth and endgame fixtures. Phase 2 adds local save migration/slot fixtures and an in-memory `Storage` fake. Never add Cosmic Forge save payloads, production-service requests or unvalidated ad hoc game-state mutation.
