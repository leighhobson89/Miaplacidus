# Ascendency and rebirth

The browser area verifies ordinary UI access to the permanent AP balance, exact-cost perk spending and visible level changes. It also checks that disabled perk purchases expose selector-derived AP shortfalls to keyboard and screen-reader users in all six locales. Unit coverage exercises deterministic rebirth boundaries and exact perk costs.

`ascendency.spec.ts` uses the test-only `meta-rebirth-ready` fixture to prepare a pioneer with AP. The fixture is set up before the player interaction; the perk purchase is performed through the visible controls. The rebirth flow is covered in the matching [`rebirth` area](../rebirth/README.md).

Focused commands: `npm run test:unit:focused -- tests/unit/meta-progression.spec.ts` and `npm run test:e2e:focused -- tests/e2e/ascendency/ascendency.spec.ts`.

Verification: meta-progression unit area passed (15/15). On 5 October 2026, the focused Chrome Ascendency suite passed 2/2: exact-cost perk purchase and disabled AP-shortfall reasons verified in all six locales, with the disabled control linked to its localized explanation. Source cost ladders and all sixteen IDs are checked against docs/audit/foundation-meta.md; G-14 cross-system effects are covered by the portable-save and post-rebirth assertions in tests/unit/meta-progression.spec.ts. G-16 source totals include ordinary and Expansionist rebirth awards, casino and Miaplacidus achievement refunds, AP trades, and each Cosmic Rip GP sink.
