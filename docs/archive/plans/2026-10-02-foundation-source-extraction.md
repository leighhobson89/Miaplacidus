# Foundation source extraction plan (F-01–F-10)

**Status:** complete (2 October 2026). **Scope:** source audit and catalogue work only; engine/UI implementation remains in F-11 onward. This work uses the read-only Cosmic Forge source at `../cosmicForge/cosmicForge/` and the product rules in [`AGENTS.md`](../../../AGENTS.md) and [`open-decisions.md`](../../plans/open-decisions.md).

## Handoff contract

1. **Architect:** freeze the exact source commit; walk all nine tab menus; map every root runtime module to an intended MIAPLACIDUS boundary; distinguish current source behavior, fixed defects, stale docs and explicit product deltas.
2. **Documentation specialist:** produce source-linked catalogues for resources/compounds/buildings/technology, space/interstellar content, and meta/endgame content. Each domain records pane actions/readouts/gates/feedback, current rule identifiers, representative save fields and proposed scopes, translation key families, matching Cosmic Forge test areas, and numerical examples.
3. **Test engineer:** make no specs in this audit-only phase. Record the focused future unit/E2E acceptance matrix and distinguish old test leads from remake results.
4. **Integration/review:** keep all edits within IncrementalGame, check links and task coverage, update the control documents, and archive this completed plan with the source snapshot and validation limits.

## Acceptance

- [x] F-01–F-10 in [`01-foundation.md`](../../plans/build-checklist/01-foundation.md) have source-backed evidence and are checked only after review.
- [x] All nine tab menus have pane IDs, actions, visible values, gates and modal/feedback coverage.
- [x] Catalogues are complete enough to review all requested resource, technology, star, weather, asteroid, fleet, meta, achievement, event, casino and Cosmic Rip definitions/formulas.
- [x] Each rule family points to source identifiers, affected fields/scopes, localization key families, and relevant old test areas.
- [x] Beginning, mid-game, travel, rebirth and endgame examples are recorded with arithmetic and modifiers/randomness noted.
- [x] Legacy quirks, current defects, stale GDD claims and owner-approved scope exclusions are separate; no gameplay change is silently approved.
- [x] Checklists, parity evidence status, roadmap, documentation indexes and the planned test matrix are updated.

## Evidence and limits

Evidence belongs in [`foundation-source-contract.md`](../../audit/foundation-source-contract.md), the three domain catalogues, and the [`foundation-test-plan.md`](../../audit/foundation-test-plan.md). A green historical Cosmic Forge test is never a remake result. This phase does not create or run specs because MIAPLACIDUS has no runtime implementation yet; source behavior is a static trace, and any ambiguous branch remains labeled for implementation-time verification.

**Outcome at completion:** Cosmic Forge HEAD `93e32669c3b35e76cdd4cf82725c14e7215b2fbc` matches the audit snapshot; no post-snapshot source changes were found and its worktree is clean. F-01–F-10 are complete. No source files were changed, no remake specs were added or run, and no Cosmic Forge suite was run. At that point F-11–F-42 remained open. F-11–F-18 have since been completed in the [toolchain/project-structure plan](2026-10-02-toolchain-project-structure.md); F-19–F-42 and the M-01 exit gate remain open.
