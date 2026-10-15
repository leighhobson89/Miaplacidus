# E2E functional-area coverage and refactor plan

**Status:** Complete, 15 October 2026. Phase 6 is closed by owner direction. The one authorized full regression and focused recovery of every reported failure are complete; no Phase 7 work was started.

## Goal and rules

Make the runnable browser suite area-owned and source-traceable. Every player-facing E2E spec belongs under exactly one `tests/e2e/<area>/` directory, and every supported area has at least one focused spec. `tests/unit/` remains the only place for tests outside the E2E area folders. `tests/e2e/_harness/` is helper code and contains no specs.

Use Cosmic Forge's functional-area taxonomy and its `tests/e2e/<area>/` layout as the baseline, not its historical green flags as proof. Keep the remake's owner-approved differences: local save slots instead of cloud saves, and Miaplaedia as the target name for the source Cosmicopedia. Do not add original-save import, cloud calls, or translation-quality acceptance. Phase 7 localization refinement stays out of scope.

The decisive choice for a failed expectation is made against current owner decisions and the active renderer/engine contract. Correct game code when the implemented behavior is wrong; rewrite a test only when its expectation conflicts with an owner-approved behavior or the current product contract. Never change an assertion only to make a run green.

## Inventory at the start of this plan

- MIAPLACIDUS has **205 runnable `*.spec.ts` files in 30 populated folders**. There are no runnable spec files directly under `tests/e2e/`; all current E2E specs are already nested.
- The directory tree has 25 folders without runnable specs. This includes the empty `cosmicopedia` alias (the current three specs live in `miaplaedia`) and 24 source areas without a dedicated spec. `save-load-cloud` is intentionally excluded.
- Five populated folders do not match source area IDs: `debug-menu`, `economy`, `save-slots`, `status-bar`, and `theme-presentation`. `miaplaedia` is the deliberate target-name alias for source `cosmicopedia`.
- The 28-spec `economy` folder combines Resources, Compounds, Autobuyers, Auto-Sell, Energy, Research, Technology and cross-cutting number presentation. `space-telescope` also contains Rocket and Asteroid/Mining flows; `starship` contains Fleet Hangar, Diplomacy and Colonise flows; Settings contains Statistics checks; and `theme-presentation` combines Settings, navigation and domain screenshots.
- Playwright currently discovers `**/*.spec.ts` recursively from `tests/e2e`. `MIAPLACIDUS_TEST_AREA` filters by a title tag regex, not by directory ownership. This does not provide the source runner's separate per-area execution or a guarantee that an area selection includes exactly that area's files.
- Cosmic Forge's pinned test snapshot contains **103 `.spec.js` files across 50 functional areas**. Its area runner executes populated folders separately and produces an aggregate report. The target should adopt that isolation and report model, with report artifacts kept outside the repository.
- The plan began with a historical full regression of **476/612 passed, 136 failed**. That baseline was superseded by the single full regression run recorded below; it is retained here only as historical context.

## Canonical area ownership

Keep one directory for each in-scope source area, using the target folder names below. Add the three target-only areas that represent real MIAPLACIDUS behavior. Retire the two catch-all folders after all specs, snapshots and links have been moved.

| Source area or target feature | Canonical target folder | Ownership rule |
| --- | --- | --- |
| Every Cosmic Forge functional area except `save-load-cloud` | The same area ID | Keep source areas separately testable; split broad files by the player behavior they exercise. |
| `cosmicopedia` | `miaplaedia` | Keep the target's player-facing name and cover all seven source prose/help documents and their navigation. Remove the empty duplicate `cosmicopedia` directory. |
| Local multi-slot save manager | `save-slots` | Target-only area for slot selection, recovery, conflicts, capacity and save-manager actions. |
| Persistent status display | `status-bar` | Target-only area for the always-visible cash, rate and transient-state display. |
| Test-only scenario and inspector tools | `debug-menu` | Keep isolated from player feature specs; verify the test/development gate and production exclusion. |
| Combined economy specs | Split among `resources`, `compounds`, `autobuyers`, `autosell`, `automation`, `energy`, `research`, `technology`, `antimatter`, `precision`, `rounding`, and `notation` | Put each spec beside the behavior it exercises; split multi-area journeys where they assert independent contracts. |
| Combined theme/presentation specs | `settings`, `ui-navigation`, or the affected domain area | Settings owns theme controls; navigation owns tab and child-page behavior; each feature area owns its own rendered content and screenshots. |
| Statistics checks currently under Settings | `statistics` | Settings owns its controls and destinations; Statistics owns its counters, scopes, reset rules and rendered values. |
| Space Telescope combined cases | `space-telescope`, `space-mining`, `rockets`, or `antimatter` | Telescope owns survey actions; Mining owns asteroid extraction and depletion; Rockets owns construction and travel; Antimatter owns resource accounting and modifiers. |
| Starship combined cases | `starship`, `fleet-hangar`, `diplomacy`, `colonise`, or `star-types` | Keep travel/building, fleet composition, negotiation, settlement and stellar modifiers independently selectable. Battle stays in `battle`. |
| Locale catalog and language-switch infrastructure | `localization` | Keep catalog completeness, locale selection and cross-route identity here. Domain outcomes and page-specific localized states remain with their functional owner. |
| Shared notification stack and focus behavior | `notifications` | Keep stack layout, dismissal, queueing, focus and shared lifetime here. Feature-triggered notices remain asserted in their source feature where they affect that action's outcome. |
| Cross-area visual matrix | `settings`, `ui-navigation`, or the affected domain area | Retire `theme-presentation`; do not centralize unrelated page visuals into one catch-all suite. |

The resulting runnable area set is the 49 in-scope Cosmic Forge areas plus `save-slots`, `status-bar`, and `debug-menu`. `_harness` and the root README are not runnable areas. Cloud-save coverage and tests for importing Cosmic Forge saves stay excluded by owner decision.

## Progress after the initial inventory

- Added `tests/e2e/functional-areas.json` with the 52 canonical runnable areas, the Cosmicopedia-to-Miaplaedia alias, and explicit Cloud Save exclusion.
- Rechecked the source and target area manifests on 14 October: after excluding `save-load-cloud` and mapping `cosmicopedia` to `miaplaedia`, all 49 source areas map exactly to target folders, with no missing or extra source IDs; the three additional folders are target-only (`debug-menu`, `save-slots`, and `status-bar`).
- Added `scripts/run-e2e-areas.mjs`; `npm run test:e2e` now runs each canonical folder in a separate Playwright process and writes JSON, HTML, traces, and failure artifacts under OS Temp. It rejects root-level specs, unlisted populated folders, and manifest areas without specs. `npm run test:e2e:populated` is available during the migration.
- Moved five single-area Rocket and Space Mining specs, their matching snapshots, and reviewed French captures into `rockets/` and `space-mining/`. Mixed Telescope, Rocket, and Mining journeys remain in `space-telescope/` pending finer case ownership.
- Moved 11 clearly single-domain specs out of `economy/`: two Energy specs, Hydrogen storage to `resources/`, Hydrogen allocation to `automation/`, five notation specs to `notation/`, one precision spec to `precision/`, and audio cues to `audio/`. Their Energy matrix and timer snapshot directories moved with their specs. The P-13 Research/Energy narrow-context file is split into canonical `research/` and `energy/` cases with shared fixture helpers. The P-05 mobile Resource/Compound journey is now split into canonical areas with a shared harness helper; 11 economy catch-all specs remain after moving the two dedicated Research cases.
- Extracted four standalone Fleet Hangar test cases into `fleet-hangar/`; their assertions were preserved, and no exclusive snapshots needed to move. Inventory-cap and fleet-strength/readiness coverage are still gaps.
- All 14 saved notification failures now have focused passing evidence: 13/14 in the recovery batch, then the Starship arrival-focus race passed 1/1 after the test waited for and dismissed its separate result modal. See the [Notifications README](../../../tests/e2e/notifications/README.md).
- The eight saved News Ticker failures (seven activated-effect captures and one prize-ticker visual) passed unchanged against existing snapshots in installed Chrome, 8/8 in 14.7 seconds on port 6412. No app or assertion change was needed; see the [News Ticker README](../../../tests/e2e/news-ticker/README.md).
- The five saved Save Slots failures have focused passing evidence recorded in the [Save Slots README](../../../tests/e2e/save-slots/README.md); a current-worktree rerun of the saved-at-date case also passed 1/1 in Chrome on port 6428.
- Three moved Rocket/Space Mining cases were rerun at their canonical paths and passed 3/3 in installed Chrome on port 6490. This covers the moved Rocket fuel-pump cases and Space Mining launch-pad affordance; other moved cases remain separately tracked.
- Split the P-13 narrow-context journey into dedicated Research and Energy specs, moving the four original screenshots unchanged with their assertions. The Research Science Kit case passed 1/1 in 5.9s on port 6530 and the Energy Battery I case passed 1/1 in 6.4s, both in installed Chrome without snapshot updates.
- The saved P-36 Onboarding failure was caused by a non-exact text locator matching both the tutorial paragraph and its live announcement. The current spec already uses an exact locator; the focused Chrome rerun passed 1/1 in 7.8s on port 6550 with no app or test changes. Added the area README and recorded the recovery.
- All seven saved Galactic Casino failure cases passed together in installed Chrome, 7/7 on port 6521 with no snapshot updates; exact command and result are in the [Casino README](../../../tests/e2e/galactic-casino/README.md).
- Saved App Boot and Megastructures screenshot failures passed focused no-update reruns in installed Chrome: 1/1 each on ports 6506 and 6452. Their old failure artifacts predate reviewed snapshot refreshes; current screenshots matched. See the [App Boot](../../../tests/e2e/app-boot/README.md) and [Megastructures](../../../tests/e2e/megastructures/README.md) READMEs.
- Three saved Miaplaedia screenshot failures passed 3/3 without updates in both installed Chrome (14.5s, port 6523) and default Chromium (13.8s, port 6524) after one stale Early Concepts capture was reviewed and refreshed. The [Miaplaedia README](../../../tests/e2e/miaplaedia/README.md) records the evidence.
- The saved Philosophies batch passed its focused cases after selector and screenshot corrections; one visual baseline was replaced after review because it omitted visible choice-card text. The updated path-choice case then passed its no-update rerun. See the [Philosophies README](../../../tests/e2e/philosophies/README.md).
- The two saved Random Events failures passed focused Chrome reruns, 1/1 each on ports 6507 and 6508. No locale values changed; the screenshot matched the current 1280x810 page after visual review. See the [Random Events README](../../../tests/e2e/random-events/README.md).
- Split the P-05 Resource and Compound mobile action matrix into separate canonical specs. The original sale attempt used an empty-stock fixture, so the Sell action correctly remained disabled; the tests now prepare stock through the test gateway. Resource/Compound passed 1/1 each in installed Chrome (ports 6552/6553), then 2/2 together in default Chromium (21.6s, port 6554). No gameplay code changed.
- The saved Economy first-research case passed 1/1 in current default Chromium (14.0s, port 6555). Its old failure artifact expected the tech notification to sit above the Tech Tree; the current assertion checks the intended fixed floating position, superseding that stale failure without an app or test change.
- Moved the P-12 Settings/Miaplaedia child-rail case from `app-boot` to canonical `ui-navigation`; it passed at the new path in default Chromium, 1/1 in 13.5s on port 6556. The [UI Navigation README](../../../tests/e2e/ui-navigation/README.md) records the area ownership and rerun.
- Moved the Statistics-only Random Event counter case from `settings` to canonical `statistics`; the moved case passed 1/1 in installed Chrome in 7.0s on port 6514. The [Statistics README](../../../tests/e2e/statistics/README.md) records the behavior and result.
- Moved two single-area research specs and their six P-65 screenshots from `economy` to `research` unchanged. Both passed at the new paths, 2/2 in 11.7s in installed Chrome on port 6571; the Economy and archived audit links were corrected.
- Moved the Cosmic Rip theme-surface case from `theme-presentation` to `cosmic-rip`; it passed at its canonical path in default Chromium, 1/1 in 6.6s on port 6557. No app or screenshot change was needed.
- Moved durable timer and offline-clock save/reload coverage out of `save-slots` into `save-load-local`, taking its screenshot baseline with it. The canonical focused Chrome run passed 1/1 in 11.0s on port 6720 with no assertion or application changes.
- Moved the synthetic v0 portable-save import case into `save-migration` and added a dedicated `migration` browser case for the current v54→v55 save upgrade. Both canonical paths passed together in installed Chrome, 2/2 in 9.3s on port 6721; the moved v0 screenshot baseline was preserved. The new migration case verifies its defaulted Megastructure notice guard remains false after reload.
- Added the dedicated `offline-gains` browser path through Save now, a 60-second away interval, startup resume and another reload. It verifies the 33.4% simulation/timer accrual, unchanged active time, Run Time and one three-second toast; installed Chrome passed 1/1 in 8.0s on port 6521.
- Added a source-matched offline floor boundary for passive Hydrogen production and Research: the browser save produces 1.336 Hydrogen in its seeded B-type system (floored to 1) and 1.002 Research (floored to 1); the unit case separately checks a base 2/s Hydrogen gain of 0.668 (floored to 0). The focused browser case passed 1/1, the economy unit file passed 31/31, and typecheck/format checks passed. Foreground fractional production remains covered. Energy, Cosmic Rip telemetry, Rocket fuel, and input-budgeted compound crafting remain outside this floor fix.
- Added an `antimatter` browser case around the keyboard-held Mining boost. It verifies the rate doubles while held, extraction matches the asteroid depletion, and any 150-Antimatter achievement payout is accounted for separately. The first focused attempts exposed that the selected fixture asteroid depletes and grants that valid reward; the corrected case passed 1/1 in 6.2s in Chrome on port 6724.
- Added a dedicated `rounding` case for the Water storage quote and exact 29/30 Concrete affordability boundary. Creating one Concrete through the UI enables the purchase, which then charges exactly 30 and raises Water capacity to 200; the canonical area runner passed 1/1 in 7.1s in installed Chrome on port 6751.
- Added a production `demo-build` browser area. The canonical runner builds the demo artifact, serves it through Vite Preview, and checks its demo marker, live Hydrogen collection, and absence of development test dialogs; the focused run passed 1/1 in 3.4s in installed Chrome on port 6750. The build's chunk-size advisory remains informational.
- Added the canonical `star-types` area and corrected F-type asteroid Mining to use the current star system for both the displayed rate and actual extraction, matching Cosmic Forge even when the asteroid originated elsewhere. The canonical area runner passed the Star Types case 1/1 in 8.6s on port 6752; the existing Antimatter case also passed 1/1 after the change, and `npm run typecheck` passed.
- Retired the `theme-presentation` test catch-all by moving its Settings, Miaplaedia, navigation, Star Map, Interstellar, Technology, Casino, Save Slots and domain screenshots into canonical areas. The split run passed 18/18 in Chrome after visual review refreshed only the Starship and Colonise captures; their follow-up screenshot run passed 2/2 in 7.6s on port 5140. No product code changed.
- The nine saved failures in `space-telescope.spec.ts` passed focused installed-Chrome reruns, 9/9 on port 6714. The two saved Black Hole contexts passed 2/2 in 43.8s on port 6715, without snapshot updates.
- Space recovery is complete: all 15 original saved Space failure contexts passed focused reruns (9 functional contexts across reruns, then the corrected P-45 case 1/1 on port 6744; 6 presentation contexts 6/6 on port 6743). Five additional titles in the migrated Space Mining specs passed 5/5 on port 6745, with no snapshot updates. The P-45 test now checks the current global-notice contract, and the audio cue test dismisses the random-event dialog before launch.
- The canonical Settings P-66 cases passed 2/2 in 15.5s on port 6513 after one desktop screenshot was visually reviewed and refreshed; all other matrix captures matched.
- The 14 October post-migration structural census found **267 runnable specs in 52 canonical areas**, with all 52 areas populated, no root-level specs, and no unlisted folder containing a runnable spec. Both `theme-presentation` and `economy` are retired as runnable catch-alls. The `economy/` historical index retains 31 unreferenced screenshots; the other 74 old screenshots were removed only after their contents matched canonical copies byte-for-byte.
- Ten saved Cosmic Rip cases passed focused Chrome reruns without new snapshot updates. The ten saved Galactic Market/Rebirth failures are already recorded as passing across focused runs in the [Market README](../../../tests/e2e/galactic-market/README.md#14-october-focused-regression-recovery).
- The one authorized full combined regression completed in installed Chrome on 14 October: **44/52 areas passed; 631 passed, 14 failed, 0 flaky, 0 skipped (645 total)**. The area reports are under `%TEMP%\miaplacidus-e2e-2026-10-14T20-51-38-491Z`.
- All 14 failures from that run have focused passing evidence. App Boot's two P-12 selected-child scrolling cases passed after the rail behavior/assertion correction; the broader App Boot plus UI Navigation set passed **24/24**. Galactic Market's queued-dialog case passed **1/1** after the test waited for native close and queue advancement. The Notifications locale screenshot, Settings status-header screenshot, and Starship unlaunched screenshot each passed after visual review of their refreshed baselines; the Settings Energy statistics locale case passed unchanged. The full Space Mining presentation spec passed **8/8** after batching its repeated measurement reads. Star Map's E-57 and P-56 cases passed **2/2**, and the tooltip/weather-glyph cases passed **2/2** after batching repeated browser reads. Starship arrival narratives passed unchanged **1/1**, and Status Bar localized stat ordering passed unchanged **1/1**.
- No second combined full-suite run was made, per the owner's instruction. Every one of the 645 runnable cases has passing evidence from the original full run or its focused failure recovery; the 14 original failures are not counted as a post-fix aggregate rerun. Focused artifacts remain in OS Temp, not the repository.
- The first canonical Economy migration batch accounted for 70 cases: 65 from the final 13 legacy specs plus five cases in four specs retired earlier. Its initial run passed 54/70; the 16 failures were screenshot assertions against old baselines. Across 23 source/canonical screenshot comparison cases, the current rendered pairs were byte-identical; the mismatch came from baselines predating the current layout. After visual review and canonical baseline refresh, the 12-case canonical visual verification passed 12/12 without update mode. The title-first compound layout assertion also passed 1/1 after its expected order was corrected. A source/canonical notification screenshot pair matched byte-for-byte.
- After removing the last unowned specs, current no-update installed-Chrome reruns passed **Resources 23/23** (including P-56) and **Compounds 8/8**. Full area commands and results are recorded in the [Resources](../../../tests/e2e/resources/README.md) and [Compounds](../../../tests/e2e/compounds/README.md) READMEs. The area runner itself was not used for these two runs because Windows process launch returned `spawn EPERM` before tests started; direct focused Playwright runs completed successfully.
- The canonical Autobuyers folder passed **9/9** in installed Chrome on 14 October with snapshot updates disabled, including the migrated six-locale auto-create help and the current automation behavior cases; see its [area README](../../../tests/e2e/autobuyers/README.md).
- The canonical Notifications folder passed **34/34** in installed Chrome without snapshot updates. One stale English Research completion capture was refreshed after visual review of the current Tech Tree viewport; the full area passed after the refresh. See its [area README](../../../tests/e2e/notifications/README.md).
- The Research Tech Tree screenshot variance was caused by capturing before the graph's asynchronous measurement settled. Added a shared font/layout wait to Technology and P-65 Research visual captures; the P-65 spec passed 1/1 on port 6440, then the full Research area passed **12/12** in 3.8 minutes on port 6441 with no baseline updates. See the [Research README](../../../tests/e2e/research/README.md).
- The complete Energy area passed **15/15** in installed Chrome in 3.0 minutes on port 6442; all locale/theme/viewport and device captures matched, with no snapshot updates. See the [Energy README](../../../tests/e2e/energy/README.md).
- The Localization area passed **36/36** in installed Chrome in 3.9 minutes on port 6443 with no snapshot updates; the run covers populated locale values, live label changes, and numeric/state invariants. Translation refinement remains Phase 7 work. See the [Localization README](../../../tests/e2e/localization/README.md).
- The Notation area passed **14/14** in installed Chrome in 27.5 seconds on port 6444 with snapshots unchanged, and the Statistics area passed **2/2** on port 6445. These checks cover notation formatting/layout, Statistics notation settings, and all 13 Random Event current-run/lifetime rows. See the [Notation](../../../tests/e2e/notation/README.md) and [Statistics](../../../tests/e2e/statistics/README.md) READMEs.
- Save/Load Local passed **4/4** on port 6447 after its malformed-import invariant was corrected to exclude `acceptedCommands`, which the periodic `clock.advance` increments independently of the UI import handler. Committed slot heads and the remaining gameplay state are still compared exactly. See the [Save/Load Local README](../../../tests/e2e/save-load-local/README.md).
- The complete Save Slots area passed **29/29** in 58.5 seconds on port 6453. The P-46 six-locale import-error flow previously timed out because `clock.runFor(3300)` replayed animation frames for each of its queued toasts; replacing it with `clock.fastForward(3300)` preserved timer expiration and brought the isolated case to 16.4 seconds, then the full area passed. The separate synthetic v0 and v54-to-v55 migration areas each passed 1/1 on ports 6449 and 6448. See the [Save Slots](../../../tests/e2e/save-slots/README.md), [Save Migration](../../../tests/e2e/save-migration/README.md), and [Migration](../../../tests/e2e/migration/README.md) READMEs.
- The complete Technology folder passed **7/7** in installed Chrome after the first capture exposed a graph-measurement timing race. Its screenshot case now waits for loaded fonts and stable measured Tech Tree dimensions; the existing baselines matched, so none were changed. See its [area README](../../../tests/e2e/technology/README.md).
- The complete Galactic Casino area passed **23/23** in installed Chrome on port 6460 with no snapshot updates. The P-54/E-57 Market locale sweep passed 1/1 after its timeout was raised to cover the exhaustive two-viewport catalogue check, and the broader Galactic child identity matrix passed 1/1 with the existing narrow Rebirth title scale represented in the expectation. The single full run passed all other Market cases; its one queued-dialog failure then passed focused **1/1**. The Market area was not rerun as a group after that focused recovery, in line with the one-full-run limit; see the [Casino](../../../tests/e2e/galactic-casino/README.md) and [Market](../../../tests/e2e/galactic-market/README.md) READMEs.
- The complete Black Hole area passed **27/27** in installed Chrome on port 6461 with snapshot assertions enabled and updates disabled; no failures or changes. See the [Black Hole README](../../../tests/e2e/black-hole/README.md).
- The complete Space Telescope area passed **26/26** in installed Chrome on port 6857 with no snapshot updates; it has no screenshot expectations. See the [Space Telescope README](../../../tests/e2e/space-telescope/README.md).
- The complete Rockets area passed **4/4** in installed Chrome on port 6858 with no snapshot updates; it has no screenshot expectations. See the [Rockets README](../../../tests/e2e/rockets/README.md).
- The five additional titles in the moved Space Mining/Space Telescope specs also passed focused checks, 5/5, separate from the 14 failures in the 14 October full run.

## Economy catch-all retirement map

The following former `tests/e2e/economy/` sources were retired after their runnable cases were reconciled with canonical area files. Case ownership follows the behavior under test; a multi-area source was split where it independently asserted more than one feature.

| Former source | Canonical destinations |
| --- | --- |
| `e57-tech-tree-tooltip-locale.spec.ts` | `technology/e57-tech-tree-tooltip-locale.spec.ts`; `energy/e57-research-energy-cost-context.spec.ts`; `philosophies/e57-philosophy-cost-context.spec.ts` |
| `economy.spec.ts` | `resources/economy-resources.spec.ts`; `compounds/economy-compounds.spec.ts` and `economy-compounds-navigation.spec.ts`; `autobuyers/economy-autobuyers.spec.ts`; `autosell/auto-sell.spec.ts`; `energy/economy-energy.spec.ts`; `research/economy-research.spec.ts`; `technology/economy-technology.spec.ts`; `notifications/economy-notifications.spec.ts`; `localization/economy-localization.spec.ts`; `notation/economy-notation.spec.ts`; `statistics/economy-statistics.spec.ts`; `save-load-local/economy-save-load.spec.ts`; `ui-navigation/economy-navigation.spec.ts`; `megastructures/economy-megastructures.spec.ts` |
| `p05-research-energy-actions.spec.ts` | `research/p05-research-energy-actions.spec.ts` |
| `p13-resource-compound-narrow-context.spec.ts` | `resources/p13-resource-compound-narrow-context.spec.ts` |
| `p44-auto-create-allocation-help.spec.ts` | `autobuyers/p44-auto-create-allocation-help.spec.ts` |
| `p45-early-economy-locales.spec.ts` | `localization/p45-early-economy-locales.spec.ts`; `compounds/p45-water-storage-shortfall-locale.spec.ts`; `notifications/p45-early-research-notification.spec.ts` |
| `p45-research-energy-copy.spec.ts` | `research/p45-research-copy.spec.ts`; `energy/p45-energy-copy.spec.ts` |
| `p45-resource-compound-copy.spec.ts` | `localization/p45-resource-compound-copy.spec.ts`; `compounds/p45-compound-result-locale.spec.ts`; `resources/p45-hydrogen-collection-result.spec.ts` |
| `p51-e57-economy-phone-locale.spec.ts` | `localization/p51-e57-economy-phone-locale.spec.ts` |
| `p51-research-energy-narrow-visual.spec.ts` | `research/p51-research-energy-narrow-visual.spec.ts` |
| `p56-resource-compound-visual-matrix.spec.ts` | `resources/p56-resource-compound-visual-matrix.spec.ts` |
| `presentation-layout.spec.ts` | `ui-navigation/p65-economy-presentation-layout.spec.ts` |
| `research-presentation-matrix.spec.ts` | `research/research-presentation-matrix.spec.ts` |

Four earlier sources were already retired during the migration and are included in the 70-case reconciliation above: `p05-resource-compound-actions.spec.ts` became the Resources and Compounds P-05 action specs; `p13-research-energy-narrow-context.spec.ts` became the Research and Energy narrow-context specs; `p44-research-philosophy-help.spec.ts` moved to Research; and `p65-research-visual-review.spec.ts` moved to Research with its six reviewed screenshots.

## Known direct-coverage holes

The following source areas still have direct behavioral gaps. Some now have dedicated specs, while other behavior is exercised indirectly in a combined folder; indirect evidence does not satisfy area isolation. Add focused cases for the remaining gaps with deterministic setup and real player controls where a UI exists.

| Area | Known hole to cover in the dedicated area |
| --- | --- |
| `antimatter` | A direct case checks boost-rate doubling, extraction/depletion accounting and the separate achievement payout; Ascendency modifiers and mined-total persistence remain. The F-type current-star modifier is covered in `star-types`. |
| `audio` | The dedicated cue case covers source click, sale, storage-upgrade, and Hydrogen-compressor sounds; background loop and SFX routing, mute/volume settings, focus loss, audio disposal, and feature-specific cue assertions remain. |
| `automation` | The allocation input has a dedicated spec; purchased automation controls, selected modes, and which settings survive rebirth remain. |
| `autosell` | Allocation slider arithmetic, fuel deduction, cash/storage split, competing compound ceilings and the Nano Brokers unlock path. |
| `colonise` | Settlement preconditions, cancelled/accepted outcomes, ownership transition, one-time rewards and the post-settlement route. |
| `compounds` | The canonical P-05 mobile action case now covers each compound page, create/sell/storage/autobuyer controls, keyboard/touch activation and 320px/390px bounds; recipe-cost precision, Water plus Concrete storage, precipitation and automatic creation remain. |
| `demo-build` | A production-artifact case now verifies demo metadata, playable Hydrogen collection and absent development test dialogs; broader demo-only feature gating still needs direct coverage. |
| `diplomacy` | A focused Harmony case now verifies an impression shift closes the vassalization gate, alongside existing success/failure and bully outcomes. Other message/harmony result and refusal branches remain. The Diplomacy folder passes 4/4. |
| `energy` | Presentation, localized grid-trip, and a P-13 Battery I purchase/Power-capacity narrow case exist; plant fuel burn, battery charge/discharge, deficit pause/resume and rebirth behavior remain. |
| `fleet-hangar` | Ship-class construction, costs, count limits and the fleet-strength value consumed by battle. |
| `migration` | A direct v54→v55 browser import and reload check now covers the latest upgrade; broader rung effects and idempotence remain in unit coverage. Do not import Cosmic Forge saves. |
| `notation` | Direct cases now cover Resource/Compound quantities and rates, building/sale prices, timers, achievement rewards/notices, and Statistics values across all three modes; the Statistics case also checks 320px overflow. The complete Notation folder passes 14/14. |
| `offline-gains` | Direct cases now check the 33.4% timer/resume path and floor boundaries for passive Hydrogen and Research gains. Energy, telemetry, Rocket fuel and input-budgeted compound floors, cap/fuel handling and focus return remain. |
| `precision` | A dedicated Hydrogen sale case covers a binary-tail display/result; display-versus-purchase agreement just below, at and above affordability boundaries remains. |
| `resources` | The canonical P-05 mobile action case now covers all eight materials' collect/sale/storage/autobuyer/fusion/allocation controls and 320px/390px bounds; production-rate and resource-specific rule outcomes need more direct coverage. |
| `research` | A P-13 Science Kit purchase and live Research Point output case now exists; additional building output/power demand, technology reveal/prerequisite gates and resulting unlock coverage remain. |
| `rockets` | Part/module pricing, assembly, naming, fueling, outbound/return timing, arrival and reuse. The source-owned Weather gate is now directly covered: Rain and Volcano block a full Rocket launch, while Clear enables it; the focused case passed 1/1 in Chrome on 14 October 2026. |
| `rounding` | A dedicated case covers the Water storage quote, exact affordability boundary and charged amount; more cross-area ceiling/floor seams still need direct cases. |
| `save-load-local` | `portable-save-round-trip.spec.ts` verifies exact portable-code export/import in a separate profile and that malformed input preserves the active run and committed slot heads. Clipboard and file-control round trips remain. |
| `save-migration` | Versioned MIAPLACIDUS save upgrades, missing/invalid fields, idempotence and preservation of run/permanent scopes. |
| `space-mining` | Survey result, asteroid selection, extraction, boost, depletion, antimatter accounting and return trip. |
| `star-types` | A direct case checks the F-type current-star bonus against visible rate and actual extraction while the asteroid remains associated with Spica; B/O and neutral star-type effects still need player-visible coverage. |
| `statistics` | This Run/Lifetime scopes, reset and rebirth behavior, event totals, save/reload, and current rendered values. |
| `technology` | Reveal thresholds, explicit prerequisites, repeatable purchases, unlock effects and dependency rendering. |
| `ui-navigation` | Ordered top-level and child routes, hidden/locked tabs, keyboard and focus behavior, and route persistence. |

## Area ownership and coverage work queue

The manifest is the authoritative runnable folder list. This table tracks the populated source areas and catch-all folders that need a split or a direct-coverage follow-up; it does not use file counts as coverage proof. Every moved spec must retain its assertions, snapshot evidence, and local README commands.

| Area or current folder | Ownership / coverage action |
| --- | --- |
| `achievements` | Crosswalk the full achievement catalogue, reward triggers, notice routes and rebirth persistence. |
| `app-boot` | Keep cold start and start selection here; the P-12 Settings/Miaplaedia child-rail case now lives in `ui-navigation`. Continue moving standalone child-route/focus cases there. Natural progression remains distinct from seeded-route coverage. |
| `audio` | A dedicated cue case now exists; extend source audio routes, settings, focus loss and disposal. |
| `autobuyers` | Preserve compressor coverage and add source tiers, throughput, power, compound gate and star modifiers. |
| `automation` | Keep Hydrogen allocation input here; add purchased automation settings and rebirth persistence. |
| `battle` | Cover win/loss, casualty and AP branches; preserve owner-directed audio cadence checks. |
| `black-hole` | Keep charge, upgrades, warp duration, expiry, cross-tab routes and action outcomes together. |
| `cosmic-rip` | Keep scanner, sectors, tech, restore, closure and rebirth/save continuation in this feature area. |
| `economy` | Retired as a runnable catch-all. Its cases now belong to canonical feature areas; the historical README and 31 unreferenced screenshots remain outside runner discovery. |
| `energy` | Keep direct Power Plant and battery cases here; add grid, fuel, capacity and rebirth behavior. |
| `fleet-hangar` | Four standalone construction, affordability, keyboard and touch cases now exist; add inventory and battle-readiness behavior. |
| `galactic-casino` | Cover four games, CP stakes, special prizes, distinct result notices, timing and rebirth entry. |
| `galactic-market` | Keep trade selection, AP sale, lockdown, distinct notices and post-rebirth state together. Ten saved failures have focused passing evidence. |
| `localization` | Retain populated-value and language-routing checks; no translation-quality or Phase 7 locale-fit sweep in this goal. |
| `megastructures` | Keep manuscripts, each structure track, stage costs, milestones, force-field and endgame links. |
| `miaplaedia` | Verify all seven source documents and child navigation; keep owner-approved identity text. |
| `news-ticker` | Keep rotation, category, preference and reduced-motion cases; confirm each claim/result path is observable. |
| `notifications` | All 14 saved failure cases now have focused passing evidence; retain shared stack geometry, lifetime, dismissal, focus and queue tests. |
| `notation` | Keep notation owned by its source values/screens; direct all-mode quantity/rate, price/timer, reward, and 320px Statistics coverage now exists in canonical areas. |
| `onboarding` | Verify source sequence, action/read gates, skip/finish, save-resume, keyboard and focus behavior. |
| `performance` | Keep performance-only measurements separate from correctness areas; do not use them as substitutes for functional checks. |
| `philosophies` | Keep path selection, costs, choices, persistent effects and result notices together. |
| `random-events` | Keep trigger, active effect, expiry, history, rebirth and save/load outcomes together. |
| `rebirth` | Cover eligibility, cancellation, exactly-once transition, run reset, persistent scopes and second rebirth. |
| `resources` | Keep Resource-specific behavior here; the former Economy catch-all cases are now in canonical feature folders. |
| `research` | A dedicated P-13 narrow-context case now verifies the Science Kit purchase and live Research Point output; add the remaining research and unlock contracts. |
| `rockets` | Dedicated Rocket assembly/travel specs exist. `weather-rocket-launch-gates.spec.ts` covers full fuel, Rain/Volcano refusal, Clear-weather enablement and launch into orbit, matching the source-owned `rockets-live.spec.js` behavior. Construction naming, outbound/return, arrival and reuse remain. |
| `save-slots` | Keep target-specific slot selection, conflict, recovery, capacity and read-only states. Move generic export/import and version upgrades to their matching save areas. |
| `settings` | One Statistics-only case has moved to `statistics`; continue moving Statistics and audio-owned specs out. Keep the six Settings destinations, preferences and persistence. |
| `space-mining` | Dedicated Launch Pad and Asteroid/Mining locale/affordance specs now exist; add survey, extraction, depletion, antimatter and return behavior. |
| `space-telescope` | Keep telescope survey, star study, Void Pillage and telescope automation; split Rocket and Mining cases. |
| `star-map` | Keep map modes, search, route selection and Star Data navigation; put per-type rule effects in `star-types`. Six saved failures have focused passing evidence. |
| `starship` | Keep modules, scan, destination selection and travel; split Fleet Hangar, Diplomacy and Colonise ownership. |
| `statistics` | One Random Event counter case now has direct Statistics ownership; move the remaining Statistics-owned checks out of Settings. |
| `status-bar` | Keep only the target-specific shared display and route-independent visibility/formatting behavior. |
| `theme-presentation` | Retired catch-all with no runnable specs; its README retains historical move evidence. |
| `ui-navigation` | A P-12 Settings/Miaplaedia child-rail case is now canonical here; move remaining independent route/focus tests from app boot and theme presentation. |
| `weather` | `weather-energy-effects.spec.ts` verifies visible solar output at the source's clear/cloudy/rain/volcano multipliers and five seconds of rain precipitation. The Weather folder passed 4/4; source-driven cycle transitions remain. Rocket launch gating is owned and covered in the Rockets area. |

## Execution plan and acceptance

1. **Lock the manifest.** Create one machine-readable area manifest with source ID, target directory, group, and any owner-approved exclusion/alias. Check every manifest folder has a spec and every E2E spec has exactly one manifest owner.
2. **Reconcile actual test cases.** For each source area, compare `functional-areas.json` and its source specs with the current target specs and area README. Mark each source behavior as direct, adapted by owner decision, or missing. Do not use the source generator's historical green status as evidence.
3. **Move and split safely.** Move each spec, its `*-snapshots` directory, and area-owned README material together. Update snapshot paths, imports, README links and any scripts. Split a multi-area test if it independently proves multiple area contracts; avoid duplicate journeys that race on shared state.
4. **Fill the gaps.** Add the missing area-owned specs using deterministic fixtures and visible controls. Keep pure calculation coverage in `tests/unit/`; browser checks assert the user-visible result and a small number of state facts only where needed.
5. **Enforce discovery and reports.** Add a per-area runner based on the manifest, matching the source suite's failure isolation and aggregate reporting. Reject direct-root specs, unowned specs, unknown area folders and empty in-scope area folders. Put generated reports and raw output in the system Temp directory, not the repository.
6. **Recover tests by area.** Run the combined suite once when authorized. For every failure, compare the assertion with the current owner decision and source/remake contract; make the justified test or implementation correction and rerun only the affected focused cases or area. Record the single full-run result and all focused recoveries; do not repeat the combined run solely to verify fixes.
7. **Close the goal before Phase 7.** Acceptance requires all manifest areas to contain focused specs, every E2E spec to be area-owned, no full-suite spec discovered outside those directories, unit tests kept separately, identified coverage holes recorded, and passing evidence for every case from the single full run or focused recovery. A second combined run is not required. This goal is complete with those conditions met; do not include Phase 7 localization refinement.

## Read-only source references

- [`functional-areas.json`](../../../../cosmicForge/cosmicForge/tests/docs/functional-areas.json) defines the 50 source areas, their groups and expected behavior cases.
- [`tests/e2e/`](../../../../cosmicForge/cosmicForge/tests/e2e/) contains the source area specs.
- [`run-e2e.mjs`](../../../../cosmicForge/cosmicForge/tests/run-e2e.mjs) isolates populated folders and writes the aggregate report.
- [`running-tests.md`](../../../../cosmicForge/cosmicForge/tests/docs/running-tests.md) documents full, per-area and focused runs.
- The target test discovery and current commands are in [`playwright.config.ts`](../../../playwright.config.ts), [`package.json`](../../../package.json), and [`test-harness.md`](../../plans/test-harness.md).
