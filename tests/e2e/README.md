# Browser test areas

Each folder below represents one adapted Cosmic Forge functional area, with `save-slots` replacing the removed `save-load-cloud` area. Empty folders remain intentional and are not passing. Four areas currently contain focused Hydrogen-slice specs and rule-matrix READMEs: [`app-boot`](app-boot/README.md), [`resources`](resources/README.md), [`autobuyers`](autobuyers/README.md), and [`performance`](performance/README.md). Their evidence is partial and does not close the broad parity areas.

The shared Playwright fixture is in [`_harness/fixtures.ts`](_harness/fixtures.ts). Test pages clear local/session storage, use fixed seed and locale, and fail if the app makes an external request or emits a page/console error. Browser specs drive real controls; scenario setup uses the development/test-only engine command boundary. Each visible Hydrogen flow captures a screenshot attachment and compares it to a checked-in visual baseline. A white screen, missing content or major layout break fails the browser run. No cloud-save calls belong in the remake.

When a change adds or alters an interactive player flow, include an end-to-end test that uses the visible controls and captures a visual checkpoint after the action. Keep pure rule boundaries in unit tests as well; UI and screenshot checks do not replace them.

See the [master checklist](../../docs/plans/master-checklist.md) for work order, [parity ledger](../../docs/plans/feature-parity-checklist.md) for area evidence and [harness plan](../../docs/plans/test-harness.md) for setup design.
