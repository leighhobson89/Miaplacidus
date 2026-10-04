# Ascendency and rebirth

The browser area verifies ordinary UI access to the permanent AP balance, exact-cost perk spending and visible level changes. Unit coverage exercises deterministic rebirth boundaries and exact perk costs.

`ascendency.spec.ts` uses the test-only `meta-rebirth-ready` fixture to prepare a pioneer with AP. The fixture is set up before the player interaction; the perk purchase is performed through the visible controls. The rebirth flow is covered in the matching [`rebirth` area](../rebirth/README.md).

Focused commands: `npm run test:unit:focused -- tests/unit/meta-progression.spec.ts` and `npm run test:e2e:focused -- tests/e2e/ascendency/ascendency.spec.ts`.

Verification: meta-progression unit area passed (15/15); Chrome exact-cost perk browser case passed (1/1) on 4 October 2026. Source cost ladders and all sixteen IDs are checked against `docs/audit/foundation-meta.md`; G-14 cross-system effects are covered by the portable-save and post-rebirth assertions in `tests/unit/meta-progression.spec.ts`. G-16 source totals include ordinary and Expansionist rebirth awards, casino and Miaplacidus achievement refunds, AP trades, and each Cosmic Rip GP sink.
