# E2E functional-area coverage and refactor plan

**Status:** Active plan, 14 October 2026. Phase 6 is closed by owner direction. Finish this test-structure and recovery goal before starting Phase 7.

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
- The only full MIAPLACIDUS regression result currently on record remains **476/612 passed, 136 failed**. Later focused reruns have passed many saved failures, but no new all-area aggregate has been recorded. Do not treat the old count as the current per-area result or report the suite green until the refactored areas are checked.

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
- Added `scripts/run-e2e-areas.mjs`; `npm run test:e2e` now runs each canonical folder in a separate Playwright process and writes JSON, HTML, traces, and failure artifacts under OS Temp. It rejects root-level specs, unlisted populated folders, and manifest areas without specs. `npm run test:e2e:populated` is available during the migration.
- Moved five single-area Rocket and Space Mining specs, their matching snapshots, and reviewed French captures into `rockets/` and `space-mining/`. Mixed Telescope, Rocket, and Mining journeys remain in `space-telescope/` pending finer case ownership.
- A prior notification-focus failure was a test race around an asynchronously rendered result modal; the corrected focused case passed 1/1. Ten saved Cosmic Rip cases also passed focused Chrome reruns without new snapshot updates.
- No new all-area regression has been run after this restructuring. The 476/612 result and 136 failure artifacts remain the historical baseline; every recovered case still needs to be distinguished from unresolved saved failures, and missing functional areas remain work.

## Known direct-coverage holes

The following source areas have no dedicated runnable target spec today. Some behavior is exercised indirectly in a combined folder; that is useful interim evidence but does not satisfy area isolation. Each area must receive a focused spec with deterministic setup and real player controls where a UI exists.

| Area | Known hole to cover in the dedicated area |
| --- | --- |
| `antimatter` | Mining rate, boosts, star-type and ascendency modifiers, depletion, and persistence of mined totals. |
| `audio` | Background loop and SFX routing, user mute/volume settings, focus loss, and audio disposal. Feature-specific cue assertions stay with their gameplay area. |
| `automation` | Purchased automation controls, selected modes, and which settings survive rebirth. |
| `autosell` | Allocation slider arithmetic, fuel deduction, cash/storage split, competing compound ceilings and the Nano Brokers unlock path. |
| `colonise` | Settlement preconditions, cancelled/accepted outcomes, ownership transition, one-time rewards and the post-settlement route. |
| `compounds` | Recipe costs, create result, sell/storage behavior, Water plus Concrete storage, precipitation and automatic creation. |
| `demo-build` | Demo flag gating, omitted full-game features and test/developer controls absent from production. |
| `diplomacy` | Impression changes and each negotiation result/refusal branch before conquest. |
| `energy` | Plant fuel burn, grid capacity, battery charge/discharge, deficit pause/resume and rebirth behavior. |
| `fleet-hangar` | Ship-class construction, costs, count limits and the fleet-strength value consumed by battle. |
| `migration` | Current MIAPLACIDUS version-ladder replay, rung effects, idempotence and continued play after import; do not import Cosmic Forge saves. |
| `notation` | Every supported notation mode across quantities, costs, rates, timers, rewards and Statistics, including narrow layouts. |
| `offline-gains` | Elapsed-time payment formula, flooring, cap/fuel handling, once-only application, timers and focus return. |
| `precision` | Display-versus-purchase agreement just below, at and above affordability boundaries. |
| `research` | Research-building output and power demand, technology reveal/prerequisite gates, purchases and resulting unlocks. |
| `rockets` | Part/module pricing, assembly, naming, fueling, launch refusal, outbound/return timing, arrival and reuse. |
| `rounding` | Cross-area ceiling/floor rules where a displayed price, resource change and accepted command must agree. |
| `save-load-local` | Exact export/import round trips through code, clipboard and file controls; malformed input must preserve the active run. |
| `save-migration` | Versioned MIAPLACIDUS save upgrades, missing/invalid fields, idempotence and preservation of run/permanent scopes. |
| `space-mining` | Survey result, asteroid selection, extraction, boost, depletion, antimatter accounting and return trip. |
| `star-types` | B/F/O modifiers and the six neutral star types, checked at rule and player-visible outcome boundaries. |
| `statistics` | This Run/Lifetime scopes, reset and rebirth behavior, event totals, save/reload, and current rendered values. |
| `technology` | Reveal thresholds, explicit prerequisites, repeatable purchases, unlock effects and dependency rendering. |
| `ui-navigation` | Ordered top-level and child routes, hidden/locked tabs, keyboard and focus behavior, and route persistence. |

## Existing populated-area crosswalk

The direct counts below are a file inventory, not coverage proof. The area READMEs and spec assertions must be checked against the corresponding source taxonomy cases before the folder is considered complete.

| Current target area | Specs | Refactor or coverage action |
| --- | ---: | --- |
| `achievements` | 6 | Crosswalk the full achievement catalogue, reward triggers, notice routes and rebirth persistence. |
| `app-boot` | 7 | Keep cold start and start selection here; move child-route/focus cases to `ui-navigation`. Natural progression to later source gates remains distinct from seeded-route coverage. |
| `ascendency` | 3 | Verify all perk costs, eligibility, effects and permanence; keep locale invariants with the price/route owner only when they assert shared localization infrastructure. |
| `autobuyers` | 1 | Preserve compressor coverage and add the source tiers, throughput, power, compound gate and star modifiers here. |
| `battle` | 1 | The saved focused checks cover current behavior, but the source area has multiple win/loss, casualty and AP branches; preserve the owner-directed audio cadence checks. |
| `black-hole` | 12 | Keep charge, upgrades, warp duration, expiry, cross-tab routes and their action outcomes together. |
| `cosmic-rip` | 6 | Keep scanner, sectors, tech, restore, closure and rebirth/save continuation in this feature area. |
| `galactic-casino` | 3 | Cover each of the four games, CP stakes, special prizes, result routes, timing and rebirth entry. |
| `galactic-market` | 11 | Keep trade selection, AP sale, lockdown, source distinct notices and post-rebirth state together. |
| `localization` | 15 | Retain populated-value and language-routing checks; no translation-quality or Phase 7 locale-fit sweep in this goal. |
| `megastructures` | 8 | Keep manuscripts, each structure track, stage costs, milestones, force-field and endgame links. |
| `miaplaedia` | 3 | Verify the seven source documents and child navigation; keep owner-approved identity text. |
| `news-ticker` | 2 | Keep rotation, category, preference and reduced-motion cases; confirm each claim/result path is observable. |
| `notifications` | 10 | Keep shared card count, lifetime, dismissal, focus and stack geometry; domain notices remain in their feature specs. |
| `onboarding` | 1 | Verify source-sequence mapping, action/read gates, skip/finish, save-resume, keyboard and focus behavior. |
| `performance` | 6 | Keep performance-only measurements separate from correctness areas; do not use them as substitutes for functional checks. |
| `philosophies` | 4 | Keep path selection, costs, choices, persistent effects and result notices together. |
| `random-events` | 6 | Keep trigger, active effect, expiry, history, rebirth and save/load outcomes together. |
| `rebirth` | 2 | Cover eligibility, cancellation, exactly-once transition, run reset, persistent scopes and second rebirth. |
| `resources` | 2 | Split Resource behaviors out of `economy`; cover production, storage, sale, fusion and resource-specific autobuyers. |
| `save-slots` | 10 | Keep target-specific slot selection, conflict, recovery, capacity and read-only states. Move generic export/import and version-upgrade checks to their matching save areas. |
| `settings` | 10 | Move Statistics specs out. Keep only the six Settings destinations, preference controls and their persistence. |
| `space-telescope` | 17 | Split rocket and mining ownership; retain telescope survey, star study, Void Pillage and telescope automation cases. |
| `star-map` | 8 | Keep map modes, search, route selection and Star Data navigation; put per-type rule effects in `star-types`. |
| `starship` | 11 | Split Fleet Hangar, Diplomacy and Colonise ownership; retain modules, scan, destination selection and travel. |
| `status-bar` | 4 | Keep only the target-specific shared display component and route-independent visibility/formatting behavior. |
| `weather` | 1 | Add missing state/effect transitions, precipitation and preference behavior while retaining the overlay check. |
| `debug-menu` | 1 | Keep test-tool checks isolated and assert production exclusion; do not use it as player-flow coverage. |
| `economy` | 28 | Retire after specs and snapshots are assigned to individual source areas. |
| `theme-presentation` | 6 | Retire after theme settings, navigation and feature visuals are placed with their owners. |

## Execution plan and acceptance

1. **Lock the manifest.** Create one machine-readable area manifest with source ID, target directory, group, and any owner-approved exclusion/alias. Check every manifest folder has a spec and every E2E spec has exactly one manifest owner.
2. **Reconcile actual test cases.** For each source area, compare `functional-areas.json` and its source specs with the current target specs and area README. Mark each source behavior as direct, adapted by owner decision, or missing. Do not use the source generator's historical green status as evidence.
3. **Move and split safely.** Move each spec, its `*-snapshots` directory, and area-owned README material together. Update snapshot paths, imports, README links and any scripts. Split a multi-area test if it independently proves multiple area contracts; avoid duplicate journeys that race on shared state.
4. **Fill the gaps.** Add the missing area-owned specs using deterministic fixtures and visible controls. Keep pure calculation coverage in `tests/unit/`; browser checks assert the user-visible result and a small number of state facts only where needed.
5. **Enforce discovery and reports.** Add a per-area runner based on the manifest, matching the source suite's failure isolation and aggregate reporting. Reject direct-root specs, unowned specs, unknown area folders and empty in-scope area folders. Put generated reports and raw output in the system Temp directory, not the repository.
6. **Recover tests by area.** Run each area in isolation after its files settle. For every failure, compare the assertion with the current owner decision and source/remake contract; then make the justified test or implementation correction and rerun only that area. Keep the previous single full-run result clearly marked as historical.
7. **Close the goal before Phase 7.** Acceptance requires all manifest areas to contain focused specs, every E2E spec to be area-owned, no full-suite spec discovered outside those directories, every area run green, unit tests kept separately, and the coverage ledger/readmes updated. Do not begin Phase 7 localization refinement as part of this goal.

## Read-only source references

- [`functional-areas.json`](../../../cosmicForge/cosmicForge/tests/docs/functional-areas.json) defines the 50 source areas, their groups and expected behavior cases.
- [`tests/e2e/`](../../../cosmicForge/cosmicForge/tests/e2e/) contains the source area specs.
- [`run-e2e.mjs`](../../../cosmicForge/cosmicForge/tests/run-e2e.mjs) isolates populated folders and writes the aggregate report.
- [`running-tests.md`](../../../cosmicForge/cosmicForge/tests/docs/running-tests.md) documents full, per-area and focused runs.
- The target test discovery and current commands are in [`playwright.config.ts`](../../playwright.config.ts), [`package.json`](../../package.json), and [`test-harness.md`](test-harness.md).
