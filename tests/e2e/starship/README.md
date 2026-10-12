# Starship

Coverage for starship module cost display and payment, required-module readiness, the optional stellar scanner, diplomacy, and Fleet Hangar controls. The Cosmic Forge Fleet Hangar is a separate Interstellar page with a build button for each fleet class; the remake keeps that one-button-per-class flow while using native buttons with visible keyboard focus and full-width touch targets. `space-starship` and `space-diplomacy` are test-only fixtures with ample stock so the UI and engine can exercise real purchases.

Run all cases with `npm.cmd run test:e2e:focused -- tests/e2e/starship/starship.spec.ts`. Fleet keyboard and touch cases only: `npm.cmd run test:e2e:focused -- tests/e2e/starship/starship.spec.ts --grep @fleet-controls`.

## Current evidence

The `@fleet-controls` cases passed in Chrome (2/2) with `MIAPLACIDUS_BROWSER_CHANNEL=chrome`, `MIAPLACIDUS_DISABLE_VIDEO=1`, and one worker. The keyboard case verified Tab reachability, `:focus-visible`, Enter activation, and the 44px target. The mobile emulation case verified touch activation at 390px, the same target height, and no horizontal overflow. The default Chromium launch was unavailable in this environment, so the passing run used the installed Chrome channel.

5 October 2026 P-06 affordance follow-up: module parts, Envoy, fleet ships, starship launch, scan, diplomacy, battle and settlement controls now expose localized selector/precondition reasons through `aria-describedby` when disabled; existing engine-computed purchase/travel costs remain visible. The `builds an Envoy and records message and harmony effects @starship` case now asserts that a locked diplomacy button references its localized reason. Focused unit coverage for the Casino purchase selector lives in `tests/unit/action-affordance-selectors.spec.ts`. Browser verification is queued with the root agent; no browser was run for this slice.

8 October 2026 P-20 follow-up (historical layout, superseded by P-64): scanning an orbiting destination replaced the scan action with a localized life-detection summary on Starship. That earlier placement has since been superseded: Starship retains the scan action and generic completion notice, while the saved life-detection details are shown on Colonise. P-64 focused validation is pending.

6 October 2026 P-06 affordability follow-up: the focused `@starship-affordability` journey passed 1/1 in installed Chrome using `MIAPLACIDUS_BROWSER_CHANNEL=chrome`, `MIAPLACIDUS_DISABLE_VIDEO=1`, and one worker. At 7,999 Hydrogen against the 8,000 Envoy cost, the disabled Build Envoy button points to the visible Hydrogen shortfall with `aria-describedby`; collecting one Hydrogen through the UI reaches exact material stock, enables the button, and building the Envoy consumes all three materials and the 2,000 cash cost. The first reporter attempt asserted no gameplay failure but hit a Playwright trace-cleanup `ENOENT`; the clean line-reporter rerun passed 1/1 in 8.6 seconds.

6 October 2026 P-06 Starship fuel boundary follow-up: `@starship-fuel-shortfall` passed 1/1 in installed Chrome in 14.4 seconds with one worker. Starting from the ready Starship fixture and selecting Sirius, the case checks that one antimatter below the displayed travel requirement disables Launch and points to the localized shortfall through `aria-describedby`. At exact stock, Launch enables; cancelling its warning leaves the ship unlaunched and preserves all antimatter. The test shapes two isolated, checksummed copies of the saved fixture through the UI boundary, without changing production code or shared fixtures.

5 October 2026 P-07 follow-up: the Starship page now shows the live remaining duration during travel, in addition to the prelaunch estimate. The focused launch-and-tick Chrome case passed 1/1 and confirmed the displayed milliseconds decrease while the ship is travelling; it is part of the five-case Starship/Space Mining countdown run.

8 October 2026 P-14 Starship presentation follow-up: the focused Chrome prelaunch-hidden scan check passed 1/1 with the scanner built, and the unit rule suite passed 19/19, including rejection below 70% travel and acceptance at the 70% threshold with encounter creation. The existing orbiting-scan Chrome E2E also passed 1/1 as recorded in the P-20 note above. The long-advance threshold E2E was interrupted by the valid `starshipLostInSpace` random event at 69% travel, which reset the ship to unlaunched; this is a test interruption, not a scan-gate failure. A test-only probability reduction remained valid but did not prevent the event, so threshold behavior is covered deterministically at the unit boundary. The focused Star Map/Starship visual batch passed 6/8 initially; after correcting the child-tab selectors, that case passed 1/1. No production event rules were changed.

8 October 2026 P-64 presentation update: the child page is now labelled Starship; completed module cards disappear, the travel summary moves above the illustration when the required modules are ready, and the builder stays available for unlocked incomplete modules such as Stellar Scanner. Required/Optional badges have been removed. Scanning stays on Starship, while the saved encounter report is presented on Colonise as soon as the destination has a scan. Progress bars cover Starship travel, rocket fueling and asteroid journeys, telescope surveys, Black Hole charge and warp, and timed Cosmic Rip research. After correcting the Starship scan-threshold fixture, the full four-spec Starship/Space Mining/Black Hole/Cosmic Rip batch passed 31/31 in installed Chrome on 8 October. It covers the no-badge/module-builder layout, travel timers, scan/report relocation, Rocket and Telescope timer states, Black Hole charge/warp, and Cosmic Rip research. Broader accessibility and six-locale presentation review remains open.

P-64 timer accessibility assertion follow-up (8 October 2026): Starship travel now locates its timer by the exact accessible `progressbar` name and checks the native current and maximum values, visible localized countdown, and live advancement. Focused installed Chrome command passed 1/1:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/starship/starship.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g "shows the starship's live journey countdown"
```

P-64 six-locale Starship accessibility follow-up (8 October 2026): the focused `@starship-locale` installed-Chrome run passed 2/2 with one worker. Across `en`, `es`, `pt`, `de`, `it`, and `fr`, `@starship-locale-timers` checks the authored localized countdown and progressbar accessible name, native current/max values, and that progress advances while travelling. `@starship-locale-report` checks that every Colonise report label and life-detection status has authored locale copy, then verifies all labels, status, locale-formatted population, defense, and patience readings, and localized civilization, threat, attitude, lifeform-trait, and anomaly readings in the browser. An initial combined invocation hit a transient `ERR_CONNECTION_REFUSED` before the second case loaded; the standalone report rerun and final combined rerun passed.

The Colonise scan report now translates its source-defined civilization, threat, attitude, lifeform-trait, and anomaly identifiers through exhaustive locale tables. The generated race name remains intact as a proper/source label.

9 October 2026 P-66 Starship/Colonise review: compared the current Interstellar
navigation and page rendering with Cosmic Forge's Interstellar options in
`cosmicForge/cosmicForge/index.html` and the owner-directed page identity in
`docs/plans/build-checklist/06-presentation.md`. The remake retains source
option positions 3 (Starship) and 5 (Colonise), with the requested remake label
`Starship` (the source spells it `Star Ship`). After launch, Starship has no
illustration or frame; its heading comes before the orbit status, which is on
the heading row rather than above it. Colonise uses the surface-with-flag SVG.
The Terminal desktop captures for unlaunched Starship, launched Starship, and
Colonise were visually reviewed and match those criteria. Existing browser
coverage checks the exact page/tab labels, these presentation states, and
responsive bounds across nine themes, six locales, and 1280px/390px/320px.
No presentation discrepancy was found, so no production or test change was
needed. A fresh focused rerun was attempted, but Playwright could not start in
this environment (`spawn EPERM`); the latest recorded P-66 layout run remains
5/5 passing on 9 October, and the broader Interstellar matrix remains 1/1
passing as recorded above.

9 October 2026 P-16 dialog focus follow-up: the focused installed-Chrome
`cancels the point-of-no-return prompt and arrives through the saved voyage
timer` case passed 1/1 in 10.8 seconds with clean exit. After both the visible
Cancel action and Escape, the native warning closes, focus returns to Launch,
and the ship remains unlaunched with antimatter unchanged. The same journey
then confirms the launch action still works after the two cancellations.

Focused command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/starship/starship.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g "cancels the point-of-no-return prompt"
```

**P-41 Starship cash-cost notation (9 October 2026):** the first Structural
module part's cash quote now has a focused visible check against the current
cost in Condensed, Standard, and Scientific. It passed as part of the
three-area installed-Chrome run (3/3 in 15.7 seconds on port 4312). The shared
command is recorded in the [Space Telescope README](../space-telescope/README.md).

**P-41 Fleet Envoy cash-cost coverage (9 October 2026):** the available Fleet
Envoy purchase quote is also checked against its current cash cost in all three
notations. Together with the Structural part quote, the Starship cases passed
in the focused 9/9 installed-Chrome currency batch on port 4320.

9 October 2026 P-15 semantics and focus review: a focused `@p15 @accessibility`
case verifies the main landmark and one h1, the Game sections and Pages in this
section navigation names, top-level and child tab/panel associations, one roving
tab stop per tablist, h2 page titles, and Tab movement from the selected Star Map
and Fleet Hangar tabs into their panels. The first pass exposed Fleet Hangar's
page title at h3 despite no h2 page parent; Starship/Fleet/Colonise titles are
now h2, with nested section and fleet-card headings at h3/h4. CSS retains their
previous sizes and margins. The focused Chrome case passed 1/1 in 6.1 seconds;
the existing Fleet keyboard/touch cases passed 2/2 in 7.8 seconds. At the
time of this route-specific entry, cross-screen landmark/focus review remained
open; its completed acceptance is recorded in the app-boot README. Manual
screen-reader announcements remain tracked under P-20.

9 October 2026 P-13 narrow Starship context: the focused journey uses a debug
fixture action to add the Launch Pad to the ready-ship fixture, so the normal
Antimatter status value is visible. After selecting Sirius, it checks the live
Cash and Antimatter balances, destination, required Antimatter, flight ETA, and
enabled Launch action at 390px and 320px. It then launches and checks the live
remaining-time readout and progress bar stay within the Starship panel at both
widths, that the document does not overflow, and that launch consumes exactly
the displayed fuel. The installed-Chrome run passed 1/1 in 7.0 seconds on port
4480. No screenshot was needed because the acceptance is visibility, value, and
geometry based.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4480'; node .\node_modules\playwright\cli.js test tests/e2e/starship/p13-starship-narrow-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```


## E-57 Starship and settlement narrow-locale review (10 October 2026)

Three focused browser cases check all six locales at 390px and 320px: current Starship module-part quotes; the live travel distance/Antimatter quote and localized point-of-no-return modal; Fleet Envoy and all fleet-unit quotes plus localized build actions; and the full Colonise scan-report labels/readings, diplomacy actions, and disabled reasons. The modal stays inside the viewport, Fleet rows remain legible, and the Colonise report and diplomacy controls stay within the page. Existing `p49-starship-invariants.spec.ts` also confirms travel cost does not change when switching locales; the new cases add narrow-width modal, quote, Fleet, report, and diplomacy checks. The full six-case E-57 installed-Chrome group passed 6/6 in 1.8 minutes on port 4679. No page-component or shared-CSS change was needed.

Focused command: `$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4679'; node .\node_modules\playwright\cli.js test --pass-with-no-tests tests/e2e/space-telescope/e57-space-mining-narrow-locale-context.spec.ts tests/e2e/star-map/e57-star-map-data-narrow-locale-context.spec.ts tests/e2e/starship/e57-interstellar-narrow-locale-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line`

Visual checkpoint: [e57-starship-launch-modal-fr-390.png](e57-starship-launch-modal-fr-390.png), generated by the follow-up focused Chrome Starship run (3/3 in 22.5 seconds, port 4681). Review confirms the French point-of-no-return heading, body, fuel quote, and both actions fit within the 390px modal without clipping.

## P-05 Space and Interstellar mechanics actions (10 October 2026)

`p05-space-actions.spec.ts` measures visible mechanics buttons, inputs, selects, disclosures, and sliders at 320px and 390px across all Space Mining pages, Starship, Fleet Hangar, Colonise, launch confirmation, and Auto Telescope. It checks document width at each route. Keyboard paths cover Star Study, rocket renaming, diplomacy, Auto Telescope selection/enable, and launch-dialog cancellation; touch paths cover asteroid selection, Fleet Envoy construction, Auto Telescope disable, destination selection, and launch-dialog cancellation. All measured targets meet 44×44 CSS pixels after page-scoped fixes. The focused installed-Chrome case passed **1/1** on port 4665; it also passed within the seven-case P-05 group (**7/7 in 47.9 seconds**) on port 4670.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4665'; node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/starship/`p05-space-actions.spec.ts`
```

## P-44 arrival narratives (10 October 2026)

Cosmic Forge calls `modalOStarReachedHeader` / `modalOStarReachedText` when the
Starship arrives at an O-type system, and `modalStarshipArrivedFactoryStarText`
when the destination is a reported factory star. MIAPLACIDUS has the same
arrival event and enough state to distinguish these routes: the star catalogue
provides spectral type, while each reported manuscript record provides a
factory-system ID and localized megastructure ID. The full source narratives
are now wired to those contexts in all six locales. The source span around the
O-star name becomes plain text, and its HTML line breaks become readable
paragraphs.

The target keeps arrival copy in its notification system instead of opening a
blocking source-style popup. The O-type popup's source once-per-star guard has
no persisted equivalent, so the target may show it again on a later visit.
Factory structure assignment is already recorded when the manuscript is
reported, before arrival; arrival only reads that known record. Narrative
notices remain visible for 20 seconds and can scroll inside their card on
phone screens.

Validation: `tests/unit/space-event-notifications.spec.ts` passed 14/14,
including full copy parity against the source text for all six locales. The
installed-Chrome `p44-arrival-narratives.spec.ts` case passed 1/1 on port 5341,
exercising both arrival branches in all six locales at 320px and checking the
readable scroll region, accessible live notice, and document width. Typecheck
passed.

```powershell
npm.cmd run test:unit:focused -- tests/unit/space-event-notifications.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5341'; node .\node_modules\playwright\cli.js test tests/e2e/starship/p44-arrival-narratives.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-06 purchase selector and affordability follow-up (10 October 2026)

Starship module-part, Envoy, and Fleet unit purchase affordances now use the
public `selectEconomyAction` selector for their enabled state and failure
reason. This keeps the UI aligned with the engine's action contract; displayed
prices and gameplay gates are unchanged. The new
`@p06-starship-purchase-affordances` browser cases verify the full Structural
part quote and its localized shortfall at a below-quote Silicon balance,
recovery after collecting enough Silicon, and exact material/cash deductions.
The Scout case performs the same shortfall/recovery and exact-purchase checks
for Fleet Hangar. Unit tests
also check that one-unit-short balances return the expected material failure
and that exact stock enables both actions.

Validation: focused installed-Chrome browser run passed **2/2** on isolated
port 4834; focused selector unit run passed **2/2**; `npm.cmd run typecheck`
passed; Oxfmt check passed for the changed component and specs. A first browser
attempt exposed test setup issues (fractional sale amount and a non-unique
locator); the corrected fresh-port run passed cleanly.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4834'; node .\node_modules\playwright\cli.js test tests/e2e/starship/starship.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --grep '@p06-starship-purchase-affordances' --output=test-results-p06-starship-affordance-4834
```

## P-29 Starship launch and arrival audio (10 October 2026)

The source plays `starShipLaunch` from the confirmed launch handler in
`cosmicForge/cosmicForge/ui.js:6601` and `starShipArrive` when its travel timer
completes in `cosmicForge/cosmicForge/game.js:11260`. The remake maps
`space.starship.launched` and `space.starship.arrived` to those same cues. A new
unit case verifies both mappings; the visible Chrome case confirms the
point-of-no-return launch action and full voyage each produce exactly one
matching Starship cue. One source-matched `eventAlarm` also occurred during
travel because the voyage crossed a random-event timer; the browser assertion
allows that independent alarm only when random-event history confirms it. The
focused run passed **1/1 in 11.0 seconds** on port 4944; the unit run passed
**1/1**.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4944'
npm.cmd run test:e2e:focused -- tests/e2e/starship/audio-cues.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
npm.cmd run test:unit:focused -- tests/unit/starship-audio-cues.spec.ts
```

## P-45 Interstellar route copy (10 October 2026)

Existing E-57 coverage checks all six locales at 320px and 390px for Starship
module/Fleet quotes, the live travel quote, the localized point-of-no-return
dialog, Colonise scan-report labels/readings, diplomacy actions, and disabled
reasons. Separate Starship locale cases verify travel countdown/progress and
Colonise scan values. The new
`tests/e2e/localization/p45-space-interstellar-results.spec.ts` drives a scan
in each locale and checks its localized notification, Starship completion
status, and saved life/no-life result on Colonise. All six route results
matched their catalogues; no source correction was required. The combined
four-case P-45 Chrome run passed **4/4 in 1.1 minutes** on port 5072.

## P-44 Starship, Fleet, and Colonise source crosswalk (10 October 2026)

The source catalogue contains 102 selected Starship/Fleet/Colonise heading,
module, report, action, diplomacy, battle, settlement, and event keys in each
of its six locale blocks. `starshipMessages.ts`, the scan token catalogue,
`spaceNotificationMessages.ts`, and event-copy catalogues provide the remake
targets; the [phase handoff crosswalk](../../../docs/plans/build-checklist/phase-6-handoff-2026-10-07.md#p-44-starship-fleet-and-colonise-source-crosswalk-10-october-2026)
records the key-family dispositions and unresolved source descriptions.

The crosswalk found an untranslated battle-health detail: the three source
`labelFleetAir/Land/Sea` keys existed in every locale, but the enemy health row
derived English labels from raw IDs. It now renders the typed
`fleetAir`/`fleetLand`/`fleetSea` messages, and
`tests/e2e/localization/interstellar-localization.spec.ts` asserts all three
labels in the six-locale battle journey. The Fleet Hangar copy audit now maps
`infoTooltipFleetHangarHeader` to `fleetHangarHeaderHelp` and its accessible
`fleetHangarHelpLabel`; the four source combat-unit descriptions map to
`fleetScoutDescription`, `fleetMarauderDescription`,
`fleetLandStalkerDescription`, and `fleetNavalStraferDescription` below their
matching cards. `spaceFleetEnvoyBuildContent1` maps to the existing
action-accurate `envoyDescription`; the header helper also identifies Envoys as
one-time non-battle units. Its source-only “gather information” claim remains
adapted because no separate information-gathering Envoy action exists in the
remake. The helper's source `<br><br>` breaks render as paragraph breaks.

The focused `@p44-fleet-copy` installed-Chrome case passed **1/1 in 11.4
seconds** at 320px on port 5301, checking all five unit names/descriptions,
full helper text, accessible label, tooltip viewport bounds, and no horizontal
document overflow in all six locales. The six-locale enemy-label run passed
**1/1 in 16.4 seconds** on port 5299 after P-29 fixed the shared `battle`
declaration error. That route test also had stale selectors for the sibling
Star Map/Star Data tabs and Launch Pad heading; the test selectors were
corrected without changing app behavior. `npm.cmd run typecheck`, the focused
localization validation unit test (**4/4**), and Oxfmt check passed. Initial
sandbox test starts returned `spawn EPERM` before startup; installed-Chrome and
Vitest escalated retries completed normally.

Still unresolved for P-44 are the source O-type arrival and factory-star
arrival narratives (no matching target message). The six
`infoTooltipStarShipScan*` strings are now mapped to AP/weather help in Star
Data and civilization/threat/defense/enemy-fleet help in the Colonise scan
report; see the [Star Map README](../star-map/README.md#p-44-star-data-and-scan-report-source-tooltips-10-october-2026)
for the six-locale tooltip evidence.

## P-55 Star Ship Distance Travelled Statistics decision review (10 October 2026)

The source Statistics getter maps both Run and All Time to one field: current
trip progress while travelling, full distance on arrival, then reset on
rebirth. Its save/load also preserves that value. MIAPLACIDUS instead records
completed routes at arrival into separate This Run and Lifetime values; its
Statistics row omits partial in-flight distance. The source/remake distinction
and recommendation are in the [parity plan](../../../docs/plans/statistics-presentation-parity.md)
and [owner decision](../../../docs/plans/open-decisions.md#p-55-statistics-semantics-decisions-12-october-2026).

Focused display, arrival, and rebirth unit cases passed **4/4**. The existing
v42 in-flight migration case currently fails at its stale schema expectation
(45 expected, 47 current) before route-restoration assertions; no direct
current-schema roundtrip for nonzero distance totals was found. On 12 October
the owner selected the documented remake behavior: retain separate completed-
route This Run/Lifetime totals with in-flight progress on Starship. This
resolves the semantic choice; the broader P-55 controlled source-value
comparison remains open. No gameplay change was made.

## P-55 System Scanned Statistics source comparison (10 October 2026)

Cosmic Forge sets its current-run `destinationStarScanned` flag when the
destination scan report is generated, resets it on rebirth, and saves/restores
it with the run; its All Time Statistics value is Not Applicable. MIAPLACIDUS
uses the selected destination's saved encounter for the This Run Yes/No value
and Not Applicable for Lifetime. The existing orbiting-scan browser journey
verifies one successful scan and rejection of a duplicate. Focused selector,
display, and scan-transition unit cases passed 4/4 in the 10 October review.
See the [Statistics parity record](../../../docs/plans/statistics-presentation-parity.md#interstellar-system-scanned-scope-comparison-10-october-2026).

## P-55 Star Ship Built Statistics source comparison (10 October 2026)

The source's Statistics row is Yes/No for the current run and Not Applicable
for All Time. It becomes Yes when the four required module groups are complete;
Stellar Scanner is optional. The source flag remains set after launch, resets
on rebirth, and is saved/restored. MIAPLACIDUS derives this row from required
module completion and has the same visible scopes. The existing browser case
`builds required modules at discounted costs while the scanner stays optional`
checks the build boundary. A focused selector lifecycle unit passed **1/1**
with the scanner at zero, a portable save roundtrip, launch, and rebirth reset.
See the [source and selector comparison](../../../docs/plans/statistics-presentation-parity.md#p-55-star-ship-built-statistics-source-comparison-10-october-2026).

## P-45 Interstellar status and combat copy (10 October 2026)

The locale audit found every Starship message key explicitly present in each
of the six locale catalogues, so runtime English fallback is not reached for
these messages. Existing coverage already checks
Interstellar child tab/page headings across all locales, themes, and three
viewport sizes; Starship travel countdown/progress and the Colonise scan report
across all locales; narrow-width module/Fleet/launch-modal/diplomacy copy; and
the Fleet Hangar and Colonise help tooltips in all six locales. The new
`p45-interstellar-visible-copy.spec.ts` closes the remaining rendered status
and combat/settlement copy gap. It checks the Starship status pill during
construction, readiness, travel, and orbit, then checks Colonise battle idle,
war mode, in-progress, victory, and defeat copy; round/health labels; war,
battle, and settle actions; the settlement-block reason; and the settled and
completion feedback. These state changes use the documented Starship battle
fixtures and visible actions.

The focused installed-Chrome run passed **3/3 in 15.9 seconds** on port 5369.
`npm.cmd run typecheck` and the focused Oxfmt check passed. No app text or
fallback change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5369'; node .\node_modules\playwright\cli.js test tests/e2e/starship/p45-interstellar-visible-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-interstellar-visible-copy-5369
```

## P-56 Interstellar content and controls matrix (10 October 2026)

`p56-interstellar-content-visual-matrix.spec.ts` covers Starship construction,
ready-to-launch, in-flight travel, and orbit, plus Colonise idle,
battle-in-progress, victory, and defeat. Each state is checked in six locales,
nine themes, and 1280px, 390px, and 320px viewports (1,296 state/layout
combinations). Assertions cover localized state content, launch/battle/settle
controls when applicable, report rows and help tooltips, pane/control/text
bounds, and document overflow. The orbit state correctly has no launch or
construction control; it checks the completed scan content instead.

The clean no-update installed-Chrome run passed **8/8 in 5.3 minutes** on port
5179. I reviewed all eight French/Terminal/390px captures; titles, module cards,
scan reports, diplomacy actions, and battle outcomes remain within the page
pane, with no clipping or horizontal overflow. No layout correction was
needed. Broader app-wide P-51/P-56 coverage remains open.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5179'
npm.cmd run test:e2e:focused -- tests/e2e/starship/p56-interstellar-content-visual-matrix.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-interstellar-verify-5179
```

### P-56 Locale-sensitive Starship feedback (10 October 2026)

Visual review caught a stale English `Travelling to Mirfak` feedback line in
the French travel capture after the locale changed mid-run. Starship feedback
now stores typed translation keys and raw values and resolves the message
against the current locale during render. Launch and fleet failure feedback
uses this same descriptor approach. The travel matrix asserts that the live
feedback follows each locale switch; focused installed Chrome passed **1/1 in
19.8 seconds** across the locale/theme/viewport matrix on port 5182. Typecheck
and focused Oxfmt passed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5182'; npm.cmd run test:e2e:focused -- tests/e2e/starship/p56-interstellar-content-visual-matrix.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-interstellar-feedback-5182 -g "Starship travel status"
```

## P-45 Fleet Hangar purchase feedback (10 October 2026)

Existing six-locale Interstellar coverage checks Fleet Hangar headings, unit
names/descriptions, costs, purchase labels, and disabled reasons. This focused
visible-action case additionally builds a Scout ship through its button in all
six locales and verifies the resulting player quantity and polite success
feedback against the localized `fleetBuilt` message. Installed Chrome passed
**1/1 in 6.8 seconds** on isolated port 5386; no application copy change was
needed. This covers the Fleet Hangar result path only; P-45 remains open for
visible-copy review on other gameplay routes.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5386'; npm.cmd run test:e2e:focused -- tests/e2e/starship/p45-fleet-feedback-locales.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-fleet-feedback-5386
```

## P-45 Starship module build result (10 October 2026)

`p45-module-build-result.spec.ts` starts a fresh `space-starship` fixture for
each supported locale, using the existing 20261003 seed. It shapes Silicon to
one unit below the Structural part quote, collects one unit through the test
engine boundary, then clicks the visible localized **Build one part** control.
The check verifies the localized `partBuilt` message in the polite feedback
output, the visible Parts built count changing from 0/20 to 1/20, and exact
Cash and material deductions against `starshipModulePartCost`. The pioneer,
active save slot, and Starship route remain the same around the purchase. The
setup only establishes affordability; the build action uses the visible UI.
Installed Chrome passed **1/1 in 12.3 seconds** on isolated port 5401. No app
copy or behavior change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5401'
node .\node_modules\playwright\cli.js test tests/e2e/starship/p45-module-build-result.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-starship-module-result-5401
```
