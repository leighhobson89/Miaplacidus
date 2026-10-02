# Code quality and risk register

Priorities here express **remake impact**, not a fresh severity verdict on Cosmic Forge. Evidence is static unless stated otherwise. The old [large UI audit](../../../cosmicForge/cosmicForge/docs/largeUIRefactor.md) and [player feedback plan](../../../cosmicForge/cosmicForge/docs/player-feedback-improvement-plan.md) contain useful historical findings, including items already fixed. Recheck each against current code before calling it an outstanding old-game bug.

| Priority | Finding and evidence | Remake action / acceptance |
|---|---|---|
| Critical | Mutable state is distributed across [constantsAndGlobalVars.js](../../../cosmicForge/cosmicForge/constantsAndGlobalVars.js), [resourceDataObject.js](../../../cosmicForge/cosmicForge/resourceDataObject.js), and [game.js](../../../cosmicForge/cosmicForge/game.js), with cyclic imports and direct UI coupling. | Define a typed state tree, immutable catalogue, commands and selectors. Each rule has one owner. Verify deterministic transitions without a browser. |
| Critical | Save restore and rebirth touch many independent fields and old migration rungs; version `0.992`, min `0.93` in the original. | New MIAPLACIDUS schema validation, atomic import, future same-game migration fixtures, explicit reset/carryover matrix, corrupt-save recovery. No old-game import. |
| High | Current render paths still use text/HTML as operational data; the [UI audit](../../../cosmicForge/cosmicForge/docs/largeUIRefactor.md) gives concrete examples. | Model is authoritative. All prices, rates, gates and IDs come from selectors, not DOM strings or translated labels. |
| High | [game.js](../../../cosmicForge/cosmicForge/game.js) uses a requestAnimationFrame loop with many feature checks, DOM queries and independent timers. | Fixed or bounded simulation step, one clock policy, subscribed/derived UI state, measured late-game frame and heap budgets. |
| High | Resource producers, fuel, crafting and autosell are ordered through multiple delta timers; the [feedback plan](../../../cosmicForge/cosmicForge/docs/player-feedback-improvement-plan.md) flags the absent unified resource tick as P8. | One documented transaction order per tick; test conservation, caps and allocation with competing consumers. |
| High | Runtime libraries are loaded from public CDNs in [index.html](../../../cosmicForge/cosmicForge/index.html) and save/analytics modules. | Bundle dependencies; boot and local saves remain usable with network unavailable. |
| High | The old single-name/cloud path does not satisfy multiple local saves; `localStorage` has quota and is shared across tabs. | Use slot IDs, a recoverable index, confirmed-name lookup on Start, quota handling and revision conflict checks. See [local save contract](../plans/local-save-contract.md). |
| High | HTML insertion is common in [ui.js](../../../cosmicForge/cosmicForge/ui.js), including notifications, tooltips and dynamic content. This is a trust-boundary risk if player content reaches those paths. | Render text as text, sanitize deliberately supported markup, add focused injection checks for names and imports. |
| Medium | Localization has six large flat tables and dynamic key families; old [status](../../../cosmicForge/cosmicForge/docs/localization/status.md) leaves human layout review open. | Typed key/placeholder validation and six-locale browser sweeps, including late-game and narrow layouts. |
| Medium | The old UI audit's theme/layout concern is confirmed in current [styles.css](../../../cosmicForge/cosmicForge/styles.css): `misty` has no selector, and the only `@media` rule is for reduced motion. | Complete every theme's tokens and responsive layout; keyboard/focus/contrast checks and screenshots at representative widths. |
| Medium | Debug access depends on build flags and a pioneer-name path (`Test1981`); the [build guide](../../../cosmicForge/cosmicForge/docs/making-a-build.md) explains a browser flag exposure route. | New explicit development/test build gate; scenario controls unavailable in production. |
| Medium | `game.js` and `ui.js` are very large (about 736 KB and 586 KB). Adding a new upgrade historically touches many files. | Thin domain modules and data-driven content. Change one feature without changing unrelated tabs. |
| Medium | Old [coverage report](../../../cosmicForge/cosmicForge/tests/docs/coverage-report.md) is generated and says 50 green, but its text has stale/inconsistent counts. | Generate coverage from executable results and maintain a separate parity ledger with source evidence. |
| Medium | The old [feedback plan](../../../cosmicForge/cosmicForge/docs/player-feedback-improvement-plan.md) still leaves megastructure battle balance (P15) and spacing/UI refactor (P12/P13) open on paper. | Treat their numerical balance as a design review; run source/current play checks before claiming a defect or carrying a fix. |

## Behavior to preserve carefully

The F-10 distinctions between an intentional source quirk, a confirmed defect, a stale GDD claim and an owner-approved scope change are captured in the [foundation source contract](foundation-source-contract.md) and its domain catalogues.

- The shared [precision.js](../../../cosmicForge/cosmicForge/precision.js) rule aligns displayed holdings/costs and purchase eligibility. Record edge cases before changing numeric type or formatting.
- Casino prizes that finish travel/telescope tasks use their normal completion logic, according to [GDD.md](../../../cosmicForge/cosmicForge/docs/GDD.md). Do not award only the visible prize while leaving timers/state stale.
- Persistent currencies, philosophy and achievements span rebirths. Test a **second** rebirth, not just one reset.
- Weather and random events can change resource/energy/rocket behavior while the player is offline or time-warped. Specify which clocks and effects advance.
- Language switching, notation and themes are presentation preferences; no numeric game state should change when they change.

## Suggested quality gates

1. **Rule parity:** pure tests for each catalogue formula, threshold, reset rule and timer completion. Compare recorded source examples, not the old DOM.
2. **Playable parity:** Playwright area test drives real controls and verifies observable state changes. Add a debug scenario only after the ordinary route works.
3. **Persistence:** round-trip, corrupt/future/earlier MIAPLACIDUS versions, offline interval and two rebirths. Preserve the prior save on failure.
4. **Localization:** all six catalogues have equal key and placeholder sets; browser sweep sees no raw keys, clipped controls or inaccessible focus.
5. **Performance:** repeatable late-game fixture, frame percentiles, long idle/listener/node/heap checks. The old [performance specs](../../../cosmicForge/cosmicForge/tests/e2e/performance/performance.spec.js) provide baseline test ideas; set new budgets against the new implementation and target devices.
6. **Release:** local-only boot, multi-slot save/import/export smoke tests, debug gating, desktop/mobile browser checks and default-full/optional-flagged-demo artifact checks with no cloud-save or analytics code.

## Audit limits and follow-up probes

This audit did not run a profiler, accessibility scanner, cloud security audit, full test suite, or manual playthrough. It did not verify every historical known-issue resolution. Before implementation of each domain, extract its numeric content and state schema from the current module, collect a representative scenario, and document any intentional change from Cosmic Forge. The [parity ledger](../plans/feature-parity-checklist.md) records domain evidence; the [master checklist](../plans/master-checklist.md) controls work.
