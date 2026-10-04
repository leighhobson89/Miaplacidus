# Browser test areas

The folders adapt Cosmic Forge's functional areas; `save-slots` replaces the excluded `save-load-cloud` area. Focused Hydrogen-slice coverage exists for [`app-boot`](app-boot/README.md), [`resources`](resources/README.md), [`autobuyers`](autobuyers/README.md), and [`performance`](performance/README.md). M-02 adds [`save-slots`](save-slots/README.md) plus the evidence ledgers for [`save-load-local`](save-load-local/README.md), [`save-migration`](save-migration/README.md), and [`migration`](migration/README.md). Phase 5 adds a partial [`black-hole`](black-hole/README.md) player journey; these browser tests do not close broader game feature areas.

The shared Playwright fixture is in [`_harness/fixtures.ts`](_harness/fixtures.ts). It clears only this app's storage namespace, fixes seed and locale, and reports page/console errors or external requests. Browser specs use visible controls and capture screenshots against checked-in baselines. A white screen, missing content or major layout break fails the visual check. Scenario setup uses the development/test-only engine command boundary. No cloud-save calls belong in the remake.

When a change adds or alters an interactive player flow, include a click-driven end-to-end test and capture a visual checkpoint after the action. Keep pure rule boundaries in unit tests as well; UI and screenshots do not replace them.

See the [master checklist](../../docs/plans/master-checklist.md) for work order, [parity ledger](../../docs/plans/feature-parity-checklist.md) for area evidence, and [harness plan](../../docs/plans/test-harness.md) for setup details.
