# Cosmic Rip browser area

## P-65 Meta page identity

`p65-meta-identity.spec.ts` contains both Cosmic Rip identity cases moved from
the theme-presentation catch-all. The desktop/phone case checks the shared page
title, Cosmic Rip artwork, Hydrogen title scale, and content bounds; it keeps
the `p65-cosmic-rip-{1280,390}.png` diagnostic captures as Playwright output
attachments. The child-page matrix checks Situation, Near Space Scanner Array,
and Cosmic Rip in six locales, nine themes, and three viewport widths (486
combinations), including tab/title identity and pane/page/document bounds.
Both cases passed in the seven-case installed-Chrome split batch on port 6716;
the matrix completed without snapshot updates. The combined batch had one
separate Black Hole fixture failure, which passed after its fixture correction.
Outputs are under `%TEMP%\miaplacidus-p65-meta-identity-split-20261014`.

`cosmic-rip.spec.ts` drives the normal tab and command path from a deterministic, already-located Rip. It restores the in-game telemetry network, completes all five timed technologies through the test clock, closes the Rip, and verifies the saved ending after reload. `cosmic-rip.spec.ts` also captures the closed state for the visual checkpoint.

The fixture skips the long Miaplacidus route while leaving scanner, research, GP spending, save, and closure controls in the production UI. The route gate itself is covered by the Miaplacidus journey in `tests/e2e/megastructures/` and the acknowledgement command unit test.

The Cosmic Rip theme case now lives here rather than in the theme-presentation catch-all. It verifies sector controls follow the active theme surface and passed at its canonical path in default Chromium: **1/1 in 6.6 seconds** on port 6557.

P-06 affordance coverage is also in `cosmic-rip.spec.ts`: deterministic fixtures check the 10 GP scanner restore and 1 GP closure costs, and visible localized precondition reasons with `aria-describedby` for scanner restore, sector scans, telemetry purchases, locked technology research, and closure. Source ownership is preserved: the disabled 10-GP restore reason is on Situation; Near Space Scanner Array stays hidden before restoration and, after restoration, contains scanning/sector controls and their precondition reason; Cosmic Rip actions appear after discovery. Sector accessible names include the 1 GP scan cost in all six locales. Upgrade cash uses the selected currency and material names localize in all six locales; the rapidly changing telemetry wallet is not an `aria-live` region.

The scanner sector reason uses a separate scanner-restored, Rip-not-yet-found, zero-GP fixture so the disabled scan control is available under Near Space Scanner Array before the Rip child page is unlocked. Upgrade and research precondition checks use the found-Rip fixture, and closure checks use Situation, which owns the close action and closed ending.

Verification record (4 October 2026): Chrome `npm.cmd run test:e2e:focused -- tests/e2e/cosmic-rip/cosmic-rip.spec.ts` passed 1 browser journey after status output styling was aligned with the existing visual baseline. The once-only G-43–G-50 unit suite passed 20 files / 207 tests. The Chrome channel was used because the bundled Chromium executable is not installed.

P-07 follow-up (5 October 2026): the `@timers` case starts the first Cosmic Rip technology through its visible research control and confirms the localized remaining-time text appears while the Rip page stays selected. The focused Chrome timer run passed this case and the Hilo status case (2/2), using installed Chrome with video capture disabled.

P-06 source-ownership verification (5 October 2026): source Tab 8 places scanner restoration under Situation (`option1`), scanner/sector actions under Near Space Scanner Array (`option2`, revealed after repair), and Cosmic Rip actions under Cosmic Rip (`option3`, revealed after discovery). The remake now follows that progression without changing permanent state or source tab order; placing restore inside the gated scanner page had made it unreachable. `npm.cmd run test:unit:focused -- tests/unit/cosmic-rip.spec.ts` passed 16/16, and four focused Chrome affordance cases passed 4/4, checking the disabled 10-GP restore reason and `aria-describedby` on Situation, scanner-page visibility before/after repair, and the sector-scan reason. Implementation typecheck and formatting passed. Playwright exited 0 after its test-owned Vite server (PID 20724) was stopped; port 4173 was confirmed closed.

8 October 2026 notification follow-up: the empty-sector scan browser case now asserts the localized notice in the live `cosmicRip` notification region. The Cosmic Rip area and Galactic Market area passed together 9/9 in installed Chrome in 37.8 seconds (exit 0). The Condensed-default Cosmic Rip cost expectation was updated before that clean run.

8 October 2026 P-64 follow-up: the active Cosmic Rip technology journey exposes its accessible research progress bar and remaining time; the focused timer case passed 1/1. The overall stability percentage remains a separate progress indicator. The saved closed-state journey asserts that it remains visible at 100%; the focused run passed 1/1, and `tests/unit/cosmic-rip.spec.ts` passed 17/17 for stability progression. The refreshed visual baseline was reviewed. The complete Starship/Space Mining/Black Hole/Cosmic Rip browser batch passed 31/31 in installed Chrome after the Starship scan-threshold test switched to its ready-ship fixture.

P-64 timer accessibility assertion follow-up (8 October 2026): active technology research is located through its exact accessible `progressbar` name, and the native current/maximum values are asserted alongside the formatted visible remaining-time text and live advancement. Focused installed Chrome command passed 1/1:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/cosmic-rip/cosmic-rip.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g "shows active research countdown while the Cosmic Rip page stays selected"
```

8 October 2026 P-64 completion slice: the active-research case now checks localized progress-bar accessible names in all six locales. The all-stage journey verifies the progressbar name and native current/maximum range before starting each of the five technology timers. The earlier closed-state screenshot differed because the shared page title styling changed; visual review confirmed the new title scale, and the baseline was refreshed. Both focused Chrome journeys passed (2/2).

P-64 all-stage localization follow-up (8 October 2026): the all-five-technology journey now switches through all six locales while each research timer is active, checks its exact localized progressbar accessible name, restores English, and then completes that timer. Per-technology native current/max assertions are retained before locale switching. Focused installed-Chrome journey passed 1/1.

P-07 completion presentation follow-up (9 October 2026): after each of the five Cosmic Rip research timers completes, the browser journey now verifies the active progressbar has been removed and that the technology card displays its localized Researched state. This is checked alongside the existing engine completion state and saved closed-rip journey. The focused installed-Chrome timer group, including this journey, passed 3/3 across Cosmic Rip, Star Study/Void Pillage, and natural weather expiry (see the Space Telescope README for the command).

9 October 2026 P-66 visual review: Situation, Near Space Scanner Array, and Cosmic Rip each have 1280x900 Terminal and 390x844 Light captures. The shared Cosmic Rip illustration and outer title remain consistent while the selected page heading and content change; all six images were reviewed with no clipped child content. The focused `@p66-visual-review` run passed without snapshot updates. Files are in `tests/e2e/cosmic-rip/cosmic-rip.spec.ts-snapshots/` with the `phase6-cosmic-rip-{situation,scanner-array,rip}-{terminal-desktop,light-mobile}.png` names.

P-41 number-notation follow-up (9 October 2026): the active technology
research journey changes notation during the visible countdown and checks its
text against the shared `formatCountdown` output in Condensed, Standard, and
Scientific. The focused installed-Chrome journey passed 1/1. Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4261'
npm.cmd run test:e2e:focused -- tests/e2e/cosmic-rip/cosmic-rip.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'shows active research countdown while the Cosmic Rip page stays selected'
```

**P-41 Cosmic Rip cash-cost notation (9 October 2026):** the Sensor Buoy
upgrade's live cash cost now has a focused visible assertion against the
current engine quote in Condensed, Standard, and Scientific. It passed as part
of the three-area installed-Chrome run (3/3 in 15.7 seconds on port 4312). The
shared command is recorded in the [Space Telescope README](../space-telescope/README.md).

**P-41 second Cosmic Rip upgrade cost (9 October 2026):** the Rip Research
Orbiter cash quote is checked in the same three notations alongside Sensor
Buoy. Both visible upgrade values matched their current engine costs in the
focused 9/9 installed-Chrome currency batch on port 4320.

## P-13 active Cosmic Rip research context at narrow widths (9 October 2026)

The focused `p13-cosmic-rip-narrow-context.spec.ts` journey starts Stabilizer
Array research from the visible control, advances 15 seconds, and checks the
RP and Cash status values, the current 10K telemetry / 60-second / 1-GP cost,
the active Researching state, progress value, and 45-second remaining label at
390px and 320px. Each capture was visually reviewed; the tested card, wallet,
progress, and balances stay inside the viewport with no document overflow.
Installed Chrome passed the snapshot-generation run **1/1** (within 3/3 cases
in 10.4 seconds on port 4527) and the clean no-update run **1/1** (within 3/3
in 9.6 seconds on port 4528). `npm.cmd run typecheck` passed. The reviewed
captures are `p13-cosmic-rip-active-research-{390,320}.png` beside the spec.
This completes the identified P-13 narrow-context cases together with the
Megastructure and Galactic Market coverage. These captures use English Terminal
and do not cover long translated labels or the broader theme/locale matrix,
which remains under P-51/P-56.

## P-20 Cosmic Rip research completion announcement (9 October 2026)

The focused `@p20-announcements` journey starts the first Cosmic Rip research
timer, changes the selected main page to Resources, completes the timer through
the deterministic clock, and verifies the localized completion message is
exposed as an atomic `role="status"` in the polite global notification region
while Resources remains selected. Installed Chrome passed **1/1** in the
focused two-route P-20 run on port 4632. This verifies DOM/live-region
semantics only; no spoken screen-reader behavior was evaluated.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4632'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'announces Cosmic Rip research completion|normal research completion reaches the polite atomic' tests/e2e/cosmic-rip/cosmic-rip.spec.ts tests/e2e/notifications/economy-notifications.spec.ts
```

## P-54 E-57 localized Cosmic Rip costs and actions (10 October 2026)

p54-e57-cosmic-rip-locale-context.spec.ts checks all five technology telemetry/time/GP price rows, both telemetry-upgrade cash/material rows, and active research status/countdown/progress at 390px and 320px in all six locales. Separate fixtures check all nine scanner sectors (eight 1-GP scan actions and the located sector), the 10-GP scanner repair action, and the 1-GP closure action with its unavailable reason. Each test checks the translated visible cost and narrow-screen bounds. French 320px captures are attached for the technology, scanner, repair, and closure views; the scanner layout was visually reviewed and remains legible without horizontal overflow. All four cases passed in the combined installed-Chrome E-57 Meta/Endgame batch, 13/13 in 57.5 seconds on port 4809.

## P-28 closed Cosmic Rip artwork (10 October 2026)

The saved closed state now includes original, static SVG artwork showing the
stabilized rift as a sealed stellar orbit. Its strokes, star, and surfaces use
the active theme variables. The accessible closure message remains an output;
the illustration is hidden from assistive technology and is not focusable or
animated. The focused saved-ending journey checks these properties and verifies
the artwork stays inside its container at 320px and 390px. The same journey now
checks visible fill/stroke, artwork bounds, and resolved theme tokens at
1280 x 720 and 390 x 844 across all nine themes. Terminal desktop plus Light and
Supernova phone captures were visually reviewed; the closure art and message
remain contained and readable. The five-family installed-Chrome P-28 batch
passed 5/5 on port 4980.
Named captures are attached in the generated Playwright report at
`playwright-report/index.html`; this focused art matrix does not replace P-56's
broader screenshot review.

## P-45 Cosmic Rip closure localization (10 October 2026)

Six focused installed-Chrome cases start from a closure-ready fixture, switch
to one supported locale, close the Rip through its visible action, and assert
both the exact localized closed-state text and the rendered achievement notice
in the polite global notification region. The fixture suppresses unrelated
setup notices and re-enables notifications before the closure action. This
rendered-copy review corrected the Spanish “Rasco” typo, replaced English
“Cosmic Rip” in the Portuguese and Italian closure notices with their localized
names, and corrected the feminine article in French. All six cases passed 6/6
in 13.3 seconds on port 4933.

Focused command: `node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'p45-ending-localization' tests/e2e/cosmic-rip/cosmic-rip.spec.ts` with the Chrome channel, video disabled, and test port 4933.

## P-38 source-backed Cosmic Rip next objective (10 October 2026)

The `@p38-objectives` journey verifies the objective row is absent before the
scanner is restored, then shows the scan instruction while the Rip is
undiscovered. After locating it, the row advances through all five technologies
in source order and then the closure objective; closure retains that final
objective. Every stage is asserted in all six supported locales. The journey
also scans an empty sector first and confirms the scan objective remains until
the target sector is found. Its test-only fixture exposes the Cosmic Rip route
without changing production gameplay state or rules.

This follows the source gate and progression in
`../../../cosmicForge/cosmicForge/drawTab8Content.js` and
`../../../cosmicForge/cosmicForge/game.js`: the row appears after scanner restoration,
uses the scan objective until discovery, and then follows the ordered build
stages through closure. The source-wide midgame review found no explicit
Miaplaedia objective row to mirror: revealed Tech Tree entries expose their
prerequisites, and Megastructure shows its next stage directly. No additional
midgame objective copy was inferred.

The cross-system P-38 audit searched all nine source gameplay-tab renderers and
onboarding for live objective/next-step guidance. Cosmic Rip is the only explicit
objective row; ordinary progression uses local action guidance. Installed-Chrome
checks passed **3/3 in 13.6 seconds** on port 5127: this six-locale objective
journey, the Tech Tree case that reveals an affordable prerequisite-locked item
while hiding an unaffordable item, and the Megastructure case that preserves a
disabled next-stage research requirement and shortfall. This confirms the
remake exposes the source's current-goal/next-unlock guidance without revealing
later content or adding an unsupported global objective.

Combined regression command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5127'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/cosmic-rip/cosmic-rip.spec.ts tests/e2e/technology/technology.spec.ts tests/e2e/megastructures/megastructures.spec.ts --grep '(@p38-objectives|Tech Tree reveals affordable prerequisite-locked research|shows the research point requirement and shortfall for a disabled next stage)'
```

Focused installed-Chrome run passed **1/1** in 9.7 seconds on isolated test
port 4894. `npm.cmd run typecheck` passed. Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4894'
npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/cosmic-rip/cosmic-rip.spec.ts --grep '@p38-objectives'
```

## P-44 Cosmic Rip help inventory (10 October 2026)

The source `infoTooltipCosmicRipHeader`,
`infoTooltipNearSpaceScannerArrayHeader`, and `infoTooltipSituationHeader` are
localized in all six source locales. The remake has no corresponding info
icons: it distributes state, cost, duration, and next-objective guidance beside
the relevant controls. The scanner route adapts source science-vessel telemetry
collection to its Sensor Buoy/Rip Research Orbiter telemetry network. Situation
shows current status/stability and the next objective; the final close action
is on the separate Cosmic Rip page. Existing E-57 and P-38 cases cover the
localized controls/objectives, but they do not assert a translation of the
source's long header help. See the [P-44 handoff](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-remaining-cosmic-forge-infotooltip-inventory-10-october-2026).

## P-56 Cosmic Rip visual matrix (10 October 2026)

`p56-cosmic-rip-visual-matrix.spec.ts` checks Situation, Near Space Scanner
Array, and Cosmic Rip across six locales, nine themes, and 1280px, 390px, and
320px viewports (162 presentation combinations and 486 page combinations).
It asserts localized page identity, selected page visibility, and document,
panel, and control bounds. Three representative snapshots cover English
Terminal desktop, French Frosty phone, and German Space narrow. Fixture
notifications are disabled so achievement notices do not contaminate captures.
The final installed-Chrome run passed 1/1 in 51.8 seconds on port 5417; the
generated snapshots were reviewed and showed no clipping. The German narrow
status card wraps naturally. No product defect was found in this matrix.

The same pass refreshed the existing P-66 Cosmic Rip page snapshots after the
page header and action content had changed. The test now asserts the actual
`aria-labelledby` relationship for the selected child page and suppresses
fixture-only achievement notices. All six refreshed desktop/mobile page
captures were reviewed; the no-update installed-Chrome run passed 1/1 in 8.5
seconds on port 5420. These are focused Cosmic Rip checks; P-51/P-56 remain open
for broader app coverage.

## P-45 Cosmic Rip visible-copy localization (10 October 2026)

`p45-cosmic-rip-visible-copy.spec.ts` fills the rendered-copy rows not already
asserted by the P-38 objective and P-54 cost/progress cases. In all six locales
it checks the Cosmic Rip status, title, introduction, wallet labels, stability
label/percentage/progress name, child-page tabs and headings, Situation's
located state, scanner-restored and scan guidance, and the scanner result.
On the Rip page it checks both telemetry-upgrade names and Purchase actions,
the containment heading, all five technology names and research actions, the
localized prerequisite text for a locked technology, and the Researched state
after completing the first technology.

A second fixture restores the scanner and scans a different empty sector in
each locale. It checks the localized scanned status and accessible sector name,
the miss status on both Scanner and Situation, and the exact localized Cosmic
Rip notification. Separate six-locale cases check the disabled scanner repair,
Sensor Buoy purchase, prerequisite-locked research, and final closure reasons,
including their `aria-describedby` references. The pre-existing affordance
journey already checks the sector-scan reason and accessible name in all six
locales.

The audit compared the typed `CosmicRipMessages` catalogue and its six locale
records with the source Tab 8 ownership in
`../../../cosmicForge/cosmicForge/drawTab8Content.js`: Situation owns the
scanner restoration/status guidance, Near Space Scanner Array owns sector
scanning, and Cosmic Rip owns telemetry upgrades, research, and closure. The
remake has no corresponding header info icons, as recorded in P-44, so there
are no rendered tooltips to assert. No missing or incorrect Cosmic Rip message
value was found; no app copy was changed. The existing P-56 visual matrix was
not edited.

Focused installed-Chrome coverage passed **5/5 in 34.9 seconds** on port 5574.
`npm.cmd run typecheck` and the focused Oxfmt check passed.

## 14 October 2026 focused regression recovery

The saved full-run failures for Cosmic Rip were re-resolved by current test titles and rerun in installed Chrome. The focused batch passed 10/11: both Cosmic Rip announcement/scan notification cases, P-41 notation, all three P-45 copy cases, both P-54 phone-width cases, the Cosmic Rip theme surface, and the P-65 Cosmic Rip child-page matrix passed. P-66 alone exposed stale visual baselines: the current Scanner Array and Rip pages now include the restored scanner/located-sector states, telemetry upgrades, and containment research. I reviewed the five changed desktop/mobile captures; their content and bounds match the current renderer. The P-66 update run passed 1/1 on port 4252, then the no-update confirmation passed 1/1 in 7.7 seconds on port 4253. Thus all 11 assigned saved failure cases pass across the focused batch and confirmation runs. Reports and actual screenshots are in system Temp under `miaplacidus-cosmic-rip-focused-20261014`, `miaplacidus-cosmic-rip-p66-update-20261014`, and `miaplacidus-cosmic-rip-p66-confirm-20261014`.
