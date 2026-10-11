# Manuscript, megastructure and homecoming coverage

The deterministic route starts with the reported Galactic Memory Archive factory at three of four field milestones. The test then applies the named `late-game-homecoming-continuation` scenario, which preserves the mature progression and clears the current-run AP-awarded marker so the Colonise route is available. From there it researches the final stage-three technology in Galactic / Megastructures, verifies the field opens and the once-only AP reward is paid, then uses the Interstellar map, Starship, and Colonise panes to travel, scan, fight, and settle Miaplacidus. It advances the four-page homecoming story through its accessible dialog. This is a **late-game continuation fixture**, not a natural full-playthrough test: the scenario establishes late-game prerequisites, while the megastructure completion, travel, scan, colonisation, battle, homecoming acknowledgement, and Cosmic Rip unlock are exercised through visible UI controls.

After acknowledging homecoming, the browser journey verifies that Cosmic Rip appears in the main navigation. Its child navigation initially contains only Situation because the scanner has not been restored and the Rip has not been located. Scanner Array and Rip remain hidden until the player owns the corresponding progress.

Cosmic Forge's [`diplomacy-journey.spec.js`](../../../../cosmicForge/cosmicForge/tests/e2e/diplomacy/diplomacy-journey.spec.js) checks that an orbiting, unscanned destination offers scanning from its Star Ship page and hides the scan control after scanning. The source [`game.js`](../../../../cosmicForge/cosmicForge/game.js) and [`drawTab5Content.js`](../../../../cosmicForge/cosmicForge/drawTab5Content.js) keep destination scan results in Star Ship; the remake intentionally moves saved life-detection details to Colonise. The scan action and generic completion notice remain on Starship, and Colonise becomes visible as soon as the selected destination has a saved scan. This supersedes the earlier P-04 arrangement in which the report was on Starship and Colonise's gate remained independent. The focused Starship scan/report journey passed as part of the 31/31 P-64 browser batch on 8 October.

`tests/unit/megastructures.spec.ts` and the M-05 unit area cover clue reporting and duplicate rewards, research prerequisites and exact prices, permanent modifiers, force-field milestones, save migration, guardian encounters and stage restoration after rebirth. The observed ending route is the homecoming story after the Miaplacidus battle; it does not set `completeGame`. Cosmic Rip closure remains that game's completion action, as recorded in [the archived endgame contract](../../../docs/archive/plans/2026-10-04-meta-endgame.md).

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/megastructures/megastructures.spec.ts` passed 1 browser journey after the story dialog cleanup. The once-only G-31–G-42 unit suite passed 20 files / 205 tests.

Verification record (7 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/megastructures/megastructures.spec.ts -g 'reveals Rebirth after a destination scan' --workers=1 --retries=0 --trace=off --reporter=line` passed 1/1 focused navigation case with the visible Starship scan control.

Verification record (8 October 2026): the focused system-Chrome no-update run of `tests/e2e/megastructures/megastructures.spec.ts` passed 1/1 in 21.3 seconds with clean exit using the seeded `late-game-homecoming-continuation` fixture. It drives launch, scan, Colonise, battle, settlement and story acknowledgement through the UI; it verifies the source-gated Colonise action after scanning, Cosmic Rip becoming visible after story acknowledgement, and Situation being the only initial Cosmic Rip child while Scanner Array and Rip remain gated. The `miaplacidus-homecoming-complete.png` baseline was refreshed and visually reviewed for the current Terminal shell; this was the only snapshot refreshed for the route. This remains a seeded continuation, not natural progression.

**P-16 homecoming-story focus (9 October 2026):** a separate focused case
loads a save with the story pending, verifies Continue is initially focused and
Escape cannot dismiss the staged dialog, advances all four pages, then checks
the acknowledged story closes with focus on the newly revealed Cosmic Rip
main tab. This test forces only the pending-story flag in a saved envelope; it
does not repeat the natural late-game route. The combined installed-Chrome
P-16 batch passed 9/9 selected routes in 29.8 seconds on port 4261.

**P-45 homecoming-story locale coverage (9 October 2026):** the seeded
`late-game-homecoming-continuation` journey now switches through all six
locales on each of the four visible story pages. It checks the document
language, localized title, chapter counter, page text, and Continue label,
then advances through the final acknowledgement and verifies Cosmic Rip is
unlocked. The focused installed-Chrome journey passed 1/1 in 9.0 seconds after
refreshing and visually reviewing `miaplacidus-homecoming-complete.png`. The
test restores English after the locale loop so the saved visual checkpoint
remains readable as one language. Its final child-page assertion uses the
stable `#pane-cosmic-rip` ID, independent of the selected locale.

**P-45 homecoming feedback follow-up (10 October 2026):** while the homecoming
dialog is open, the same six-locale loop also checks the underlying Starship
settlement confirmation. This exposed that the confirmation stored its first
rendered language; Starship now renders the semantic settlement state in the
current locale. The focused installed-Chrome continuation passed 1/1 in
14.2 seconds on port 4935.

**P-45 Megastructure page visible-copy follow-up (10 October 2026):** a focused
six-locale Chrome case checks the page title, introduction, force-field
readout, four reported manuscript messages, all four structure names, every
stage name, researched status, stage progress, and Research action labels. It
passed 1/1 in 7.5 seconds on port 5183. Typecheck and focused Oxfmt passed; that
initial visible-copy pass found no issue. A later comparison against the source
catalogue found Spanish and Portuguese page-title differences, corrected and
verified in the source-title follow-up below. The existing prerequisite-reason
check also covers its localized missing-technology, unsettled-factory, and
wrong-factory states.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5183'; npm.cmd run test:e2e:focused -- tests/e2e/megastructures/p45-megastructure-page-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-megastructure-copy-5183
```

**P-45 Megastructure source-title follow-up (10 October 2026):** the source
`localization.json` values for `headerMainMegastructures` are recorded as
hardcoded expectations in the focused case: Megastructures,
Megaestructuras, Megaestruturas, Megastrukturen, Megastrutture, and
Mégastructures. The check compares each value with the remake catalogue and
the rendered page heading and child-tab label. It exposed and corrected the
Spanish and Portuguese title spellings. Installed Chrome passed **1/1 in 7.1
seconds** on isolated port 5637; `npm.cmd run typecheck`, Oxfmt, and
`git diff --check` passed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5637'
npm.cmd run test:e2e:focused -- tests/e2e/megastructures/p45-megastructure-page-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-megastructure-copy-5637
```

**P-45 Megastructure research-result localization (10 October 2026):** the
new `p45-megastructure-research-result.spec.ts` reuses the deterministic
`meta-megastructure-route` fixture, researches Archive Stage 3 through its
visible action, and checks the accepted RP deduction and permanent stage ID.
It then switches through all six locales and verifies the researched badge,
3/5 progress, current RP balance, localized Stage 4 name and cost, and the
disabled Stage 4 action's exact RP shortfall. The force-field milestone is
also checked at 4/4. Installed Chrome passed **1/1 in 6.9 seconds** on
isolated port 5641; typecheck and focused Oxfmt passed. No app copy or
presentation change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5641'
npm.cmd run test:e2e:focused -- tests/e2e/megastructures/p45-megastructure-research-result.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-megastructure-research-result-5641
```

Focused command: `node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'late-game continuation fixture' tests/e2e/megastructures/megastructures.spec.ts` with the Chrome channel, video disabled, and test port 4935.

Focused verification command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4294'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'late-game continuation fixture' tests/e2e/megastructures/megastructures.spec.ts
```

**P-41 notation check (9 October 2026):** the visible captured total, force-field ratio, all four researched-stage ratios, and Research Tech Tree totals are verified in Condensed, Standard, and Scientific notation. The focused installed-Chrome regression passed 1/1 as part of the 3/3 P-41 count batch on port 4265.

**P-13 Megastructure stage research context at narrow widths (9 October
2026):** the focused `p13-megastructure-narrow-context.spec.ts` case checks
Galactic Memory Archive stage 3's 150K RP cost, live Cash/RP balances, and
enabled research action at 390px and 320px. After researching it, the case
checks the updated 3/5 progress, 4/4 field milestone, new RP balance, and the
next stage's disabled action with its 200K RP requirement and 50K shortfall.
All four captures were visually reviewed; the stage cards, costs, progress,
reason, and actions fit their pane without clipping or page overflow. Installed
Chrome passed the snapshot run and clean no-update rerun, 2/2 each, on ports
4538 and 4539; `npm.cmd run typecheck` passed. Captures are
`p13-megastructure-stage-{ready,progress}-{390,320}.png` beside the spec. This
uses English Terminal and a seeded stage state; it does not cover long
translated labels or every theme.

**P-47 stage-progress plural localization (9 October 2026):** the Megastructure
track used the plural “stages researched” for every progress count, including
1/5. Its typed message catalogue now has singular and other forms in all six
locales, selected through `Intl.PluralRules`; both values still use the saved
notation formatter. The focused six-locale unit case passed 1/1, and the P-41
installed-Chrome progress/notation case passed 1/1 on port 4689. A separate
P-13 narrow-width rerun reached the last screenshot and differed from its
320px full-page baseline by 1px in height (2,856px vs 2,855px); it made no
snapshot changes.

## P-54 E-57 localized Megastructure stage context (10 October 2026)

p54-e57-megastructure-locale-context.spec.ts runs a test-only factory-location fixture for each of the four tracks (Dyson Sphere, Celestial Processing Core, Plasma Forge, and Galactic Memory Archive). Each route checks its active next-stage name, visible dynamic RP price, progress, and enabled research action, plus the names and progress for all four tracks, at 390px and 320px in all six locales. Pane, track cards, next-stage row, and document bounds are asserted. The test fixture is gated to test mode and changes no gameplay path. All four cases passed in the combined installed-Chrome E-57 Meta/Endgame batch, 13/13 in 57.5 seconds on port 4809. French 320px captures are attached; the Archive capture was visually reviewed with the active cost visible and no horizontal overflow.

## P-28 Miaplacidus endgame scenes (10 October 2026)

The four-story homecoming journey checks each decorative scene at 1280 x 720 and
390 x 844 in all nine themes. Each scene is visible, remains within its story
dialog, resolves its theme background/border colors, and does not cause
horizontal document overflow. Representative captures cover Terminal desktop,
Light phone, Supernova desktop, and Space phone; they were visually reviewed
with no art or story text clipping. The five-family installed-Chrome P-28 batch
passed 5/5 on port 4980.
Named captures are attached in the generated Playwright report at
`playwright-report/index.html`; this focused art matrix does not replace P-56's
broader screenshot review.

## P-45 localized Megastructure prerequisite reasons (10 October 2026)

`p45-prerequisite-reasons-locales.spec.ts` checks the visible disabled Research
stage action and linked reason for missing technology, unsettled factory star,
and wrong current factory in all six locales. E-57 separately covers every
track's translated stage names, dynamic RP price, progress, and enabled action.
The combined focused Meta run passed 9/9 in installed Chrome on port 5077; no
translation mismatch was found.

## P-29 Megastructure audio routes (10 October 2026)

Cosmic Forge `game.js` stage handlers route the regular stage-3 force-field
milestone to `forcefieldTakedown`, the fourth milestone to
`forcefieldTakedownFinal`, and stage-5 capture to `megastructureCaptured`. The
remake routes accepted `technology.researched` events by track position; for
stage 3 it checks the post-research force-field level to select regular versus
final, and stage 5 selects capture. `tests/unit/megastructures.spec.ts` already
verifies actual playback for all three source MP3s.

`audio-cues.spec.ts` adds visible Chrome coverage using actual Galactic >
Megastructures research controls. The `meta-megastructure-audio` test-only
fixture starts the Archive at stage 2 with no completed force-field milestones
and enough RP for stages 3–5: the browser observes exactly one regular
force-field cue at stage 3, the ordinary generic button cue at stage 4, and
exactly one capture cue at stage 5. The existing `meta-megastructure-route`
fixture supplies three completed milestones, so its visible stage-3 research
verifies exactly one final force-field cue. These cases advance no timers and
do not modify simulation rules.

Installed Chrome passed both focused cases (2/2) on port 5016. The focused
Megastructure unit spec passed 12/12, and `npm.cmd run typecheck` passed. The
standard browser and Vitest launchers hit Windows `spawn EPERM`; both focused
test runs passed when rerun with the authorized escalated launcher. No
Megastructure cue family remains unverified in this slice.

## P-56 Megastructure content visual matrix (10 October 2026)

`p56-megastructure-content-visual-matrix.spec.ts` checks all four reported
structure cards with each track active in turn, so the matrix includes an
enabled Stage 4 action and localized dynamic 200K RP cost for Dyson Sphere,
Celestial Processing Core, Plasma Forge, and Galactic Memory Archive. Its
visual-only fixture gives every track sequential 3/5 progress and moves the
active run to each factory in turn; the active row assertion checks that the
Stage 4 label matches the Stage 4 name. Each case checks all manuscript
reports, all five localized stage names in every card, progress and researched
labels, active/inactive Research actions, visible text/control containment,
card/pane bounds, and document horizontal overflow. The matrix covers six
locales, nine themes, and 1280, 390, and 320px widths (648
locale/theme/viewport variants across four fixture cases).

Installed Chrome passed all four cases, covering 648 variants, in 8.8 minutes
on port 6325. The separate Dyson fixture verification passed 1/1 in 2.3 minutes
on port 6324. `npm.cmd run typecheck` and focused Oxfmt passed. No
Megastructure presentation defect was measured, so no product CSS was changed.

Reviewed captures are in
`p56-megastructure-content-visual-matrix.spec.ts-snapshots/`: one EN/Terminal
1280px capture for each active track, plus Galactic Memory Archive in DE/Light
at 390px and FR/Space at 320px. The long German and French manuscript, stage,
and reason copy wraps within the cards; the 200K RP active cost and full-width
actions remain visible, with no clipping, overlap, or horizontal page overflow.
This is a bounded P-56 slice and does not close the broader P-56 acceptance
scope.

Focused commands:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6325'
npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-megastructure-content-6325 tests/e2e/megastructures/p56-megastructure-content-visual-matrix.spec.ts
npm.cmd run typecheck
npm.cmd exec -- oxfmt --check tests/e2e/megastructures/p56-megastructure-content-visual-matrix.spec.ts
```
