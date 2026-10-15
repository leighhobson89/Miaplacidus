# Browser test areas

The completed area ownership, coverage review, and regression recovery are recorded in the [archived functional-area plan](../../docs/archive/plans/2026-10-15-e2e-functional-area-coverage-and-refactor.md). The canonical manifest owns all **267 runnable E2E spec files across 52 areas**; a 14 October structural census found no root-level or unlisted specs and no empty manifest areas. `_harness` is helper code, and `tests/unit/` remains separate. The `theme-presentation` and `economy/` catch-all folders have no runnable specs. `economy/` remains as a historical index with 31 retained, unreferenced screenshot files; its README explains their status. The P-05 mobile Resource and Compound action matrix now lives in separate [`resources`](resources/README.md) and [`compounds`](compounds/README.md) areas. Responsive child-rail coverage lives in [`ui-navigation`](ui-navigation/README.md). The canonical folder list is in [`functional-areas.json`](functional-areas.json); `npm run test:e2e:area -- <area>` runs one folder and `npm run test:e2e` runs the manifest areas separately.

The folders adapt Cosmic Forge's functional areas; `save-slots` replaces the excluded `save-load-cloud` area. Focused Hydrogen-slice coverage exists for [`app-boot`](app-boot/README.md), [`resources`](resources/README.md), [`autobuyers`](autobuyers/README.md), [`automation`](automation/README.md), [`research`](research/README.md), [`technology`](technology/README.md), [`energy`](energy/README.md), and [`performance`](performance/README.md). The standalone cross-screen value checks are in [`notation`](notation/README.md) and [`precision`](precision/README.md), and the dedicated cue check is in [`audio`](audio/README.md). M-02 adds [`save-slots`](save-slots/README.md), dedicated save/reload in [`save-load-local`](save-load-local/README.md), and separate versioned-save upgrade specs in [`save-migration`](save-migration/README.md) and [`migration`](migration/README.md). Phase 5 adds a partial [`black-hole`](black-hole/README.md) player journey. Current theme controls and dropdown checks belong to [`settings`](settings/README.md); historical mixed-area evidence remains in [`theme-presentation`](theme-presentation/README.md). Settings Statistics checks are also documented in Settings, guide-to-pane checks are in [`miaplaedia`](miaplaedia/README.md), and shell ticker checks are in [`news-ticker`](news-ticker/README.md); these browser tests do not close broader game feature areas.

New focused feature slices cover [`antimatter`](antimatter/README.md) boost and depletion accounting, [`star-types`](star-types/README.md) current-star mining modifiers, [`offline-gains`](offline-gains/README.md) resume accrual, and [`rounding`](rounding/README.md) quote/affordability/charge agreement. [`demo-build`](demo-build/README.md) runs against a compiled production demo artifact to check its build marker, playable collection, and exclusion of development test dialogs. Future coverage additions should use the canonical folder ownership in the [archived refactor plan](../../docs/archive/plans/2026-10-15-e2e-functional-area-coverage-and-refactor.md).

The shared Playwright fixture is in [`_harness/fixtures.ts`](_harness/fixtures.ts). It clears only this app's storage namespace, fixes seed and locale, and reports page/console errors or external requests. Browser specs use visible controls and capture screenshots against checked-in baselines. A white screen, missing content or major layout break fails the visual check. Scenario setup uses the development/test-only engine command boundary. No cloud-save calls belong in the remake.

## P-54 presentation evidence reconciliation (10 October 2026)

This matrix reconciles the named P-54 browser areas and current six-language
E-57 screen-family evidence. “Clean” means the recorded focused run exited
successfully; earlier hangs/failures are retained as history in their area
README, with the later clean run identified as superseding evidence.

| P-54 browser area | Current evidence | Status |
| --- | --- | --- |
| UI navigation | [`app-boot`](app-boot/README.md): full `hydrogen-boot.spec.ts` area, 6/6 in 16.5s, clean exit (port 4318); the child-panel association check is also recorded there. | Clean |
| Star Map | [`star-map`](star-map/README.md): current E-57 Star Map/Data case in the six-case Chrome run, 6/6 (port 4679), plus focused touch/keyboard checks. | Clean |
| Onboarding | [`app-boot`](app-boot/README.md): fresh/resumed start and first-run flows included in the 6/6 run; [`save-slots`](save-slots/README.md) records the no-briefing/no-replay journey. | Clean |
| Cosmicopedia | [`miaplaedia`](miaplaedia/README.md): `@cosmicopedia` 10/10 in 59.1s, clean exit (port 4812); prior shutdown hang did not recur. | Clean, superseding rerun |
| Statistics | [`settings`](settings/README.md): complete Statistics area 16/16 in 55.0s (port 4496), including current 86-card display and six-locale Cosmic Rip labels; desktop/mobile captures reviewed. | Clean |
| Settings | [`settings`](settings/README.md): Settings preferences/accessibility and audio routes have focused passing Chrome evidence; six-locale tab semantics passed 1/1, all six locale labels checked. | Clean for focused P-54 scope |
| News Ticker | [`news-ticker`](news-ticker/README.md): full current browser area 26/26; behavior and refreshed visual captures reviewed. | Clean |
| Notifications | [`notifications`](notifications/README.md): installed Chrome 14/14, Market-lockdown 1/1, 12 focused unit/localization files 77/77, typecheck clean. | Clean |
| Notation | [`notation`](notation/README.md), [`precision`](precision/README.md), [`economy`](economy/README.md), [`status-bar`](status-bar/README.md), and [`settings`](settings/README.md): P-41 source audit and focused rendered-value cases cover quantities, costs, rewards, timers, and Statistics in all three notation choices. | Clean for P-54 scope |
| Audio | [`audio`](audio/README.md) and [`settings`](settings/README.md): dedicated cue check, route checks 3/3, native-select check 1/1, and audio dispatch units 23/23; this does not claim the separate broad source-callsite crosswalk is complete. | Clean for P-54 scope |
| Localization | [`localization`](localization/README.md): P-49 live-route/price invariants pass across six locales; E-57's named screen families now have six-locale responsive row, tooltip, modal, and dynamic-cost evidence below. | Clean for focused P-54 scope; broader P-45/P-51 translation review remains open |

| E-57 screen family | Current evidence | Status |
| --- | --- | --- |
| Resources and Compounds | The older [`economy`](economy/README.md) matrix records 84 page/locale combinations at 320px and 390px, including storage, sale, Autobuyer, recipe/create and Water dual-cost behavior (6/6 on port 4828). Their canonical folders now own all runnable cases. Current focused Chrome reruns passed Resources 23/23 and Compounds 8/8 on 14 October 2026; the older P-05 action pair also passed 2/2 in default Chromium on port 6554. | Both canonical areas passed |
| Research, Energy, Philosophy | [`economy`](economy/README.md): the six-locale Tech Tree tooltip and price matrix plus Science, Battery/Power, and Philosophy costs; [`technology`](technology/README.md): three standalone Tech Tree flows, 3/3 in 11.2s (port 6582), with existing screenshot baselines unchanged. | Clean |
| Star Map and Star Data | [`star-map`](star-map/README.md): route cost and all nine localized Star Data headers/rows/actions; part of 6/6 in 1.8m (port 4679), six locales at 320/390. | Clean |
| Starship, Fleet, Colonise | [`starship`](starship/README.md): module and travel quotes, point-of-no-return modal, all fleet-unit quotes, colonisation report/actions; part of the same 6/6 run, six locales at 320/390. | Clean |
| Telescope, Rockets, Launch Pad | [`space-telescope`](space-telescope/README.md): Telescope/Rocket-part quotes and progress in six locales at 320/390 (part of 6/6, port 4679); Launch Pad quote 1/1 (port 4817); fuel-pump quote/action at 320/390 in all six locales (part of 6/6, port 4828). French captures at both widths were reviewed. | Clean |
| Asteroids and Mining | [`space-telescope`](space-telescope/README.md): all visible rarity/reservation/depletion/distance/Antimatter values and Mining balances/rates/totals/actions; 1/1 in 10.7s (port 4825), six locales at 320/390; French/320 captures reviewed. | Clean |
| Galactic Market | [`galactic-market`](galactic-market/README.md): visible trade rows, all AP-sale quantities, liquidation preview and dialog; part of Meta/Endgame 13/13 in 57.5s (port 4809), six locales at 320/390. | Clean |
| Galactic Casino | [`galactic-casino`](galactic-casino/README.md): CP-purchase options, game entry/stake costs, Void Seer tiers, tooltip; Meta/Endgame 13/13 (port 4809), six locales at 320/390. The post-rebirth navigation case was rerun separately, 1/1 in the clean 2/2 batch (port 4826). | Clean |
| Ascendency and Rebirth | [`ascendency`](ascendency/README.md): all 16 perk prices and localized Rebirth dialog; included in Meta/Endgame 13/13, six locales at 320/390. | Clean |
| Megastructures | [`megastructures`](megastructures/README.md): all four tracks' visible active-stage costs/progress; included in Meta/Endgame 13/13, six locales at 320/390. | Clean |
| Black Hole | [`black-hole`](black-hole/README.md): initial research and all three upgrade prices plus active timer/progress; included in Meta/Endgame 13/13, six locales at 320/390. | Clean |
| Cosmic Rip | [`cosmic-rip`](cosmic-rip/README.md): all five technology rows, telemetry upgrades, nine scanner sectors, repair and closure costs; included in Meta/Endgame 13/13, six locales at 320/390. | Clean |

The Energy chart and post-rebirth Casino navigation cases had an older recorded
shutdown hang. They were rerun together in installed Chrome on isolated port
4826: **2/2 passed in 8.7s**, exit 0 with clean shutdown. This supersedes that
unclean runner status; detailed area notes are in the [Economy](economy/README.md)
and [Casino](galactic-casino/README.md) READMEs. The two formerly open responsive
families now have focused six-locale evidence. This reconciliation found no
remaining coverage gap among the named P-54 browser areas and E-57 screen
families. The associated checklist status remains a separate phase-tracking
update; the focused areas that passed should not be rerun solely to replace
their current evidence.

When a change adds or alters an interactive player flow, include a click-driven end-to-end test and capture a visual checkpoint after the action. Keep pure rule boundaries in unit tests as well; UI and screenshots do not replace them.

See the [master checklist](../../docs/plans/master-checklist.md) for work order, [parity ledger](../../docs/plans/feature-parity-checklist.md) for area evidence, and [harness plan](../../docs/plans/test-harness.md) for setup details.
