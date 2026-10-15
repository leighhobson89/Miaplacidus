# Space Mining browser tests

This area owns browser specs for the Space Mining section's Telescope, Asteroids, Mining, Launch Pad, and Rocket child-page presentation/copy contexts. Telescope gameplay journeys and genuinely mixed journeys remain in `../space-telescope/`. Rocket-only assembly, fueling, and travel coverage lives in `../rockets/`; Space Mining page-specific viewport, copy, and presentation checks stay here.

## Current specs

- `p06-launch-pad-affordance.spec.ts` checks the localized Iron shortfall, its accessible reason, recovery after collecting the missing amount, and exact payment through the visible Build action.
- `e57-launch-pad-cost-locale-context.spec.ts` checks the Launch Pad quote and action at 390px and 320px in all six locales. Its reviewed French capture is `e57-launch-pad-cost-fr-320.png`.
- `e57-space-mining-content-locale-context.spec.ts` checks localized Asteroid rarity, reservation and depletion rows, asteroid selection, Mining balances and rates, and the boost control at 390px and 320px. Reviewed French captures are `e57-asteroids-fr-320.png` and `e57-mining-fr-320.png`.
- `e57-space-mining-narrow-locale-context.spec.ts` checks the Telescope quote and Rocket part/travel contexts in six locales at 390px and 320px. Its reviewed French Telescope capture is `e57-space-telescope-cost-fr-320.png`.
- `p13-space-mining-narrow-context.spec.ts` checks Rocket fueling and Telescope survey controls at 320px.
- `p45-space-mining-copy.spec.ts` checks Telescope, Launch Pad, Asteroid, Mining, and Rocket notices and status copy in all locales.
- `p51-space-mining-visual.spec.ts` checks the Telescope quote and location tooltip at 320px and 390px in French.
- `space-mining-presentation.spec.ts` owns the Space Mining locale/theme/content matrix and presentation captures, including its reviewed snapshots.

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
