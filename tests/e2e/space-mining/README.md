# Space Mining browser tests

This area owns browser specs for the Space Mining section's Telescope, Asteroids, Mining, Launch Pad, and Rocket child-page presentation/copy contexts. Telescope gameplay journeys and genuinely mixed journeys remain in `../space-telescope/`. Rocket-only assembly, fueling, and travel coverage lives in `../rockets/`; Space Mining page-specific viewport, copy, and presentation checks stay here.

## Current specs

- `p06-launch-pad-affordance.spec.ts` checks the localized Iron shortfall, its accessible reason, recovery after collecting the missing amount, and exact payment through the visible Build action.
- `e57-launch-pad-cost-locale-context.spec.ts` checks the Launch Pad quote and action at 390px and 320px in all six locales. Its reviewed French capture is `e57-launch-pad-cost-fr-320.png`.
- `e57-space-mining-content-locale-context.spec.ts` checks localized Asteroid rarity, reservation and depletion rows, asteroid selection, Mining balances and rates, and the boost control at 390px and 320px. Reviewed French captures are `e57-asteroids-fr-320.png` and `e57-mining-fr-320.png`.
- `e57-space-mining-narrow-locale-context.spec.ts` checks the Telescope quote and Rocket part/travel contexts in six locales at 390px and 320px. Its reviewed French Telescope capture is `e57-space-telescope-cost-fr-320.png`.
- `p13-space-mining-narrow-context.spec.ts` checks Rocket fueling and Telescope survey controls at 320px.
- `p45-space-mining-copy.spec.ts` checks Telescope, Launch Pad, Asteroid, Mining, and Rocket notices and status copy in all locales.
- `p7-space-mining-source-label-locales.spec.ts` checks the Telescope and Auto Telescope labels, all four Telescope help routes, Launch Pad page label/help and build-row help, Rocket fuel-pump heading/description, and in-orbit destination label on their owning routes in all six locales. It also checks each default Rocket Miner name on the Launch Pad assembly cards. **AUTHORED, NOT RUN** for Phase 8 V-59.
- `p7-space-mining-source-tooltip-locales.spec.ts` checks Mining, Asteroids, and Launch Pad page-header help, the Mining rate help, and Rocket fuel/travel row help on their owning routes in all six locales. **AUTHORED, NOT RUN** for Phase 8 V-59.
- `p51-space-mining-visual.spec.ts` checks the Telescope quote and location tooltip at 320px and 390px in French.
- `space-mining-presentation.spec.ts` owns the Space Mining locale/theme/content matrix and presentation captures, including its reviewed snapshots.

### Phase 7 source labels

Cosmic Forge `drawTab6Content.js` routes `tab6SpaceTelescopeRowLabel` to the Telescope row, `tab6AutoSpaceTelescopeName` and `tab6AutoSpaceTelescopeRowLabel` to the conditional Auto Telescope row, and `tab6LaunchPadRowLabel` to the Launch Pad page. MIAPLACIDUS resolves these through `spaceMessages.ts#telescopeTitle/autoTitle/autoRowLabel` and `rocketMessages.ts#launchPadTitle` on the corresponding child pages. Rocket `tab6FuelRowLabel`, `tab6TravelToRowLabel`, and `tab6RocketDescriptionWithPower` resolve to the localized `pumpTitle`, `destination`, and `rocketPageDescription` fields in `rocketMessages.ts`; the active Rocket renderer owns all three routes. The four source keys `rocketMinerName1`–`rocketMinerName4` appear as separate Launch Pad assembly-card headings. MIAPLACIDUS routes each to the populated `rocketMessages.ts#rocketMinerLabel` template with its matching slot index; the remake uses one indexed template for the four source-specific names. Values are populated for all six locales. The row-to-page/heading changes and indexed-name adaptation are recorded in the Phase 7 crosswalk.

The source `tab6SortByRowLabel` remains open: Cosmic Forge attaches rarity, distance, complexity, and Antimatter sort actions to its Asteroids list, while the current remake has no matching sort control. It is not classified as a label-only adaptation. The source-key inventory keeps it unreviewed until the route/behavior has an explicit disposition.

[`p7-space-mining-source-label-locales.spec.ts`](p7-space-mining-source-label-locales.spec.ts) checks Telescope, Auto Telescope, Launch Pad, and Rocket page copy, including the direct Launch Pad build-row help and all four indexed Rocket Miner headings, in all six locales. **AUTHORED, NOT RUN** for Phase 8 V-59.

The same six-locale spec now checks Cosmic Forge's `spaceBuildTelescopeContent1`,
`spaceTelescopeSearchAsteroidContent1`, `spaceTelescopeInvestigateStarContent1`,
and `spaceTelescopePhilosophyBoostContent1` against the visible Build Telescope,
Search Asteroid, Investigate Star, and Philosophy Boost help tooltips. The target
routes are `spaceMessages.ts#telescopeBuildHelp`, `telescopeScanHelp`,
`telescopeStudyHelp`, and `telescopePillageHelp` in `SpaceMiningPane.tsx`. Build
help is checked before constructing the Telescope; Search Asteroid and
Investigate Star help are checked after the visible build action; Philosophy
Boost help is checked with the existing `space-voidborn-pillage` fixture, where
the target conditionally exposes that route. The three power placeholders use
the locale-formatted target rates (0.4, 0.7, and 1.1 kJ/s). All four source keys
and target help entries are populated in en/es/pt/de/it/fr. This coverage is
**AUTHORED, NOT RUN**; no tests, build, typecheck, formatter, or browser checks
were run for the addition.

### Phase 7 Rocket and Antimatter row tooltips

Cosmic Forge `drawTab6Content.js` creates the `antimatterSvgRow` Mining row;
`descriptions.js` supplies its `antimatterSvgContent1` text, which tells the
player to hold the Antimatter rate bar to raise production. MIAPLACIDUS keeps
the help on the Mining rate readout and adapts the instruction to its separate
hold-to-boost button through `spaceMessages.ts#antimatterBoostHelp` in
`SpaceMiningPane.tsx`.

For each Rocket, Cosmic Forge's `drawTab6Content.js#createRocketUI` creates
distinct `spaceRocket*AutoBuyerRow` and `spaceRocket*TravelRow` rows;
`descriptions.js` routes their copy through `spaceRocketAutoBuyerContent1` and
`spaceRocketTravelContent1`. MIAPLACIDUS preserves those row owners on each
Rocket child page: `rocketMessages.ts#rocketFuelHelp` is shown beside the fuel
pump heading while the Rocket is ready, with the selected locale's formatted
per-Rocket power, and `rocketMessages.ts#rocketTravelHelp` is shown beside the
destination row while it is in orbit. The existing page intro remains separate
page-level workflow guidance.

`p7-space-mining-source-tooltip-locales.spec.ts` checks all three row help
routes in en/es/pt/de/it/fr, including the Rocket 1 power placeholder and the
visible pump-to-launch transition before the travel row appears. Target copy is
populated for all six locales. This is **AUTHORED, NOT RUN**; no tests, builds,
typechecks, formatting, or validation were run.

Cosmic Forge `rocketDescription` is attached to Rocket child pages by `descriptions.js` and `ui.js`; its owner-approved adaptation is MIAPLACIDUS `rocketMessages.ts#rocketPageDescription`, rendered as the visible `.pane-intro` by `SpaceMiningPane.tsx`. The P7 spec asserts that target text in all six locales on Rocket 1. This is an adaptation: the source says to build the Launch Pad, while the target Rocket page is available after construction and explains the live fueling, launch, and travel workflow.

Cosmic Forge `spaceBuildLaunchPadContent1` is routed through `descriptions.js#spaceBuildLaunchPadRow` and `game.js#getRowMainDescriptionLabel` to the Launch Pad construction row. MIAPLACIDUS now routes it directly to `spaceMessages.ts#launchPadBuildHelp`, rendered by the accessible `InfoTooltip` beside the visible Build Launch Pad action in `SpaceMiningPane.tsx`. The six-locale P7 spec focuses the help trigger and checks the tooltip text before construction. Values are populated in en/es/pt/de/it/fr. This direct source-to-target route is **AUTHORED, NOT RUN**; no tests, build, typecheck, formatter, or browser checks were run for this addition. The page-level `rocketMessages.ts#launchPadHeaderHelp/launchPadHelp` remains separate page help.

### Phase 7 source header-tooltip routes

Cosmic Forge `drawTab6Content.js` places `info_miningHeader`,
`info_launchPadHeader`, and `info_asteroidsHeader` beside the Mining, Launch Pad,
and Asteroids headings; `descriptions.js` resolves those IDs from
`infoTooltipMiningHeader`, `infoTooltipLaunchPadHeader`, and
`infoTooltipAsteroidsHeader`. MIAPLACIDUS keeps each help trigger on that same
Space Mining child page. Mining help is composed from
`spaceMessages.ts#miningHeaderHelp`, `#miningLayoutHelp`, and `#miningHelp`:
the remake displays combined Antimatter production, then explains that holding
the visible boost action affects Rocket mining only. Launch Pad help uses
`rocketMessages.ts#launchPadHeaderHelp` and `#launchPadHelp` to explain complete
Rocket assembly and the current Asteroids-to-Rocket destination workflow.
Asteroids help uses `spaceMessages.ts#asteroidsHeaderHelp`, `#asteroidsTableHelp`,
`#asteroidDistanceHelp`, `#asteroidComplexityHelp`, `#asteroidAntimatterHelp`,
and `#asteroidsHelp`. Complexity and available Antimatter guidance are retained;
distance is recalculated for the remake's 0.5-seconds-per-100 one-way travel
rule, and the old separate Destroyed status is omitted because the remake has no
matching state. These sections stay distinct within the active child-page help.

`p7-space-mining-source-tooltip-locales.spec.ts` checks each active route, all
populated target help fragments, and the visible Mining/Asteroids data owners in
en/es/pt/de/it/fr. It was authored for Phase 7; no tests, build, typecheck,
formatter, or browser checks were run for this addition.

## Recorded focused evidence

The Launch Pad affordability case passed 1/1 in installed Chrome on port 4835; the paired selector unit case passed 1/1. The Launch Pad locale case passed 1/1 in 6.2 seconds on port 4817. Its French 320px capture was reviewed and showed no clipping.

The Asteroids and Mining content case passed 1/1 in installed Chrome in 10.7 seconds on port 4825. The two French 320px captures were reviewed and showed the visible rows and actions inside the page bounds without horizontal overflow.

**Post-move focused Chrome verification (14 October 2026):** the current
`space-mining/` path for the Launch Pad affordability case passed 1/1 as part
of a no-update 3-case focused run. The same run checked both moved Rocket
fuel-pump locale-width cases; those results are recorded in the
[Rockets README](../rockets/README.md). All 3 cases passed in 19.6 seconds on
port 6490.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6490'; npm.cmd run test:e2e:focused -- tests/e2e/rockets/e57-fuel-pump-locale-context.spec.ts tests/e2e/space-mining/p06-launch-pad-affordance.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-moved-mining-rocket-focused-6490"
```

## Run

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/space-mining/p06-launch-pad-affordance.spec.ts tests/e2e/space-mining/e57-launch-pad-cost-locale-context.spec.ts tests/e2e/space-mining/e57-space-mining-content-locale-context.spec.ts
```

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/space-mining/e57-space-mining-narrow-locale-context.spec.ts tests/e2e/space-mining/p13-space-mining-narrow-context.spec.ts tests/e2e/space-mining/p45-space-mining-copy.spec.ts tests/e2e/space-mining/p51-space-mining-visual.spec.ts tests/e2e/space-mining/space-mining-presentation.spec.ts
```

## P-66 Space Mining child-page identity

`phase6-tab-layout.spec.ts` checks that each selected Space Mining child tab
matches the page title and that Space Telescope retains its artwork row. The
case moved from Theme Presentation without assertion changes and has no
per-spec screenshot baseline. No tests were run during the move.

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/space-mining/phase6-tab-layout.spec.ts
```

## 14 October 2026 saved failures and moved-spec verification

The 15 saved Space Mining-related full-run contexts assigned for recovery now
have clean focused evidence. The nine functional titles ran in installed
Chrome with snapshot updates disabled: eight passed in 1.3 minutes on port
6741, then the corrected Telescope/Launch Pad locale case passed 1/1 in 22.6
seconds on port 6744. The stale local-feedback expectations were changed to
assert the owner-directed empty output while retaining the global completion
notice checks. The six saved presentation titles passed 6/6 in 3.6 minutes on
port 6743. No checked-in screenshot baseline changed.

After moving the Space Mining specs, the five remaining unrun titles in those
files also passed 5/5 in 5.2 minutes on port 6745. Across the focused runs, all
17 titles in the moved E-57, P-13, P-45, P-51, and presentation specs passed;
the results were collected across batches rather than one aggregate run.
The moved E-57 French capture path was then verified by a 1/1 rerun in 8.2
seconds on port 6746. I visually compared the generated image with the prior
capture and kept the original bytes because the visible layout matched.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6741'; npm.cmd run test:e2e:focused -- tests/e2e/space-telescope/audio-cues.spec.ts tests/e2e/space-mining/e57-space-mining-narrow-locale-context.spec.ts tests/e2e/space-telescope/p05-star-study-keyboard.spec.ts tests/e2e/space-mining/p13-space-mining-narrow-context.spec.ts tests/e2e/space-telescope/p20-star-study-cross-tab.spec.ts tests/e2e/space-mining/p45-space-mining-copy.spec.ts tests/e2e/space-mining/p51-space-mining-visual.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'rocket pump, launch, outbound travel and outbound arrival follow source cues|Rocket part cost, precondition text, and Rocket 1-4 travel progress fit narrow screens in all locales|keyboard users can start Star Study from the adjacent survey control|Telescope search cost, balances, timer, progress, and status fit at 320px|announces Star Study completion while another tab is selected|Telescope and Launch Pad actions, status, and completion notices use all locales|Asteroid scan result feedback and discovery state use all locales|Built Rocket fuel and launch status, reasons, and ready notice use all locales|P-51 Space Telescope quote and location tooltip fit French narrow layouts' --output="$env:TEMP\miaplacidus-space-mining-functional-recovery-6741"

$env:MIAPLACIDUS_TEST_PORT='6743'; npm.cmd run test:e2e:focused -- tests/e2e/space-mining/space-mining-presentation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'Space Telescope, Asteroids, and Launch Pad content, art, and bounds fit all locales and themes|child navigation to title spacing is consistent across page groups|current Tech Tree and Space Mining pages have reviewable desktop and mobile visuals|Asteroids and Launch Pad have reviewable desktop and phone visuals|Space Telescope has a reviewed phone state for its page title and artwork|Mining has reviewable desktop and phone visuals' --output="$env:TEMP\miaplacidus-space-mining-presentation-recovery-6743"

$env:MIAPLACIDUS_TEST_PORT='6745'; npm.cmd run test:e2e:focused -- tests/e2e/space-mining/e57-space-mining-narrow-locale-context.spec.ts tests/e2e/space-mining/p13-space-mining-narrow-context.spec.ts tests/e2e/space-mining/p45-space-mining-copy.spec.ts tests/e2e/space-mining/space-mining-presentation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'Space Telescope quote and one-material shortfall stay translated and readable at 390/320px|Rocket fuel cost, balance, ETA, progress, and pause action fit at 320px|Asteroid selection and zero-rate Mining warning use all locales|Mining content, identity, and bounds fit all locales and themes when antimatter is unlocked|built Rocket 1-4 identity and bounds fit all locales and themes' --output="$env:TEMP\miaplacidus-space-mining-migrated-coverage-6745"
```

## Phase 7 Telescope and Launch Pad source actions

Cosmic Forge `drawTab6Content.js` routes `buttonBuildSpaceTelescope` to the
Telescope build action and `notificationSpaceTelescopeBuilt` through the build
notice. MIAPLACIDUS uses `spaceMessages.ts#telescopeBuild` and the existing
`spaceEventNotifications.ts` → `spaceNotificationMessages.ts#telescopeBuilt`
route. The Space Telescope action rows retain Cosmic Forge's separate
`buttonScanAsteroids`, Study Stars, and conditional Void Pillage controls.
`dropdownTelescopeStudyAsteroid`, `dropdownTelescopeStudyStars`, and
`dropdownTelescopePillageVoid` each remain distinct options in the Auto
Telescope selector, with Pillage shown only for the eligible Voidborn state.
The three `textReadyTo*` source labels now appear below their matching action
while no survey is running; the active survey continues to use the remake's
shared progress display.

`buttonBuildLaunchPad` routes to `rocketMessages.ts#buildLaunchPad`, and
`notificationLaunchPadBuilt` routes through the same event-notice adapter to
`spaceNotificationMessages.ts#launchPadBuilt`. All target messages are
populated in en/es/pt/de/it/fr. The existing
`p7-space-mining-source-label-locales.spec.ts` now covers the action names,
Auto Telescope options, idle labels, and both build notices across those six
locales. It is **AUTHORED, NOT RUN**; no tests, build, typecheck, formatter, or
browser checks were run for this addition.
