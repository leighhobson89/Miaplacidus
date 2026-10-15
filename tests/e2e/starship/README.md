# Starship

Coverage for Starship module cost display and payment, required-module readiness, the optional Stellar Scanner, travel, diplomacy, and mixed Interstellar journeys. Standalone Fleet Hangar construction and keyboard/touch cases live in [Fleet Hangar](../fleet-hangar/README.md). The Fleet Hangar remains a separate Interstellar page with a build button for each fleet class. `space-starship` and `space-diplomacy` are test-only fixtures with ample stock so the UI and engine can exercise real purchases.

Run the Starship and mixed-route cases with `npm.cmd run test:e2e:focused -- tests/e2e/starship/starship.spec.ts`. Fleet Hangar keyboard and touch cases only: `npm.cmd run test:e2e:focused -- tests/e2e/fleet-hangar/fleet-hangar.spec.ts --grep @fleet-controls`.

## Current evidence

The relocated `@fleet-controls` cases passed in Chrome (2/2) with `MIAPLACIDUS_BROWSER_CHANNEL=chrome`, `MIAPLACIDUS_DISABLE_VIDEO=1`, and one worker; see the [Fleet Hangar README](../fleet-hangar/README.md). The keyboard case verified Tab reachability, `:focus-visible`, Enter activation, and the 44px target. The mobile emulation case verified touch activation at 390px, the same target height, and no horizontal overflow. The default Chromium launch was unavailable in this environment, so the passing run used the installed Chrome channel.

5 October 2026 P-06 affordance follow-up: module parts, Envoy, fleet ships, starship launch, scan, diplomacy, battle and settlement controls now expose localized selector/precondition reasons through `aria-describedby` when disabled; existing engine-computed purchase/travel costs remain visible. The `builds an Envoy and records message and harmony effects @starship` case now asserts that a locked diplomacy button references its localized reason. Focused unit coverage for the Casino purchase selector lives in `tests/unit/action-affordance-selectors.spec.ts`. Browser verification is queued with the root agent; no browser was run for this slice.

8 October 2026 P-20 follow-up (historical layout, superseded by P-64): scanning an orbiting destination replaced the scan action with a localized life-detection summary on Starship. That earlier placement has since been superseded: Starship retains the scan action and generic completion notice, while the saved life-detection details are shown on Colonise. P-64 focused validation is pending.

6 October 2026 P-06 affordability follow-up: the focused `@starship-affordability` journey passed 1/1 in installed Chrome using `MIAPLACIDUS_BROWSER_CHANNEL=chrome`, `MIAPLACIDUS_DISABLE_VIDEO=1`, and one worker. At 7,999 Hydrogen against the 8,000 Envoy cost, the disabled Build Envoy button points to the visible Hydrogen shortfall with `aria-describedby`; collecting one Hydrogen through the UI reaches exact material stock, enables the button, and building the Envoy consumes all three materials and the 2,000 cash cost. The first reporter attempt asserted no gameplay failure but hit a Playwright trace-cleanup `ENOENT`; the clean line-reporter rerun passed 1/1 in 8.6 seconds. The case now lives in the [Fleet Hangar area](../fleet-hangar/README.md).

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

Focused command: `$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4679'; node .\node_modules\playwright\cli.js test --pass-with-no-tests tests/e2e/space-mining/e57-space-mining-narrow-locale-context.spec.ts tests/e2e/star-map/e57-star-map-data-narrow-locale-context.spec.ts tests/e2e/starship/e57-interstellar-narrow-locale-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line`

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
for Fleet Hangar; that browser case now lives in the [Fleet Hangar area]
(../fleet-hangar/README.md). Unit tests also check that one-unit-short
balances return the expected material failure
and that exact stock enables both actions.

Validation: focused installed-Chrome browser run passed **2/2** on isolated
port 4834; focused selector unit run passed **2/2**; `npm.cmd run typecheck`
passed; Oxfmt check passed for the changed component and specs. A first browser
attempt exposed test setup issues (fractional sale amount and a non-unique
locator); the corrected fresh-port run passed cleanly.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4834'; node .\node_modules\playwright\cli.js test tests/e2e/starship/starship.spec.ts tests/e2e/fleet-hangar/fleet-hangar.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --grep '@p06-starship-purchase-affordances' --output=test-results-p06-starship-affordance-4834
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
targets; the [phase handoff crosswalk](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-starship-fleet-and-colonise-source-crosswalk-10-october-2026)
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

Still unresolved for P-44 is the source factory-star arrival narrative (no matching target message). The six
`infoTooltipStarShipScan*` strings map to AP/weather help in the Star Data
table and to AP, precipitation/weather, civilization, threat, defense, and
enemy-fleet help in the Colonise scan report; see the [Star Map README](../star-map/README.md#p-44-star-data-and-scan-report-source-tooltips-10-october-2026)
for the six-locale tooltip evidence. The Phase 7 route-complete assertions in
that spec are **AUTHORED; NOT RUN** and include all six report fields.

## Phase 7 O-type arrival result dialog (NOT RUN; Phase 8)

Cosmic Forge `game.js` opens `modalOStarReachedHeader` and
`modalOStarReachedText` after an O-type system arrival. MIAPLACIDUS already
renders the six-locale narrative as a floating Starship notice through
`spaceNotificationMessages.ts#oTypeStarReachedHeader|oTypeStarReachedText`;
it now also presents that same copy in the source-style result dialog through
`spaceProgressionDialogMessages.ts#oTypeStarReachedDialog`. The source `X`
placeholder is replaced by the resolved system name, and source paragraph
breaks are retained.

`p44-arrival-narratives.spec.ts` now checks both the notice and result dialog
for all six locales. The updated case is **NOT RUN** after adding the modal;
the earlier P-44 pass predates this change.

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
See the [Statistics parity record](../../../docs/plans/statistics-presentation-parity.md#interstellar-system-scanned-scope-comparison-updated-12-october-2026).

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

14 October 2026 focused failure recovery: the thirteen failed-manifest
Starship behavior cases passed **13/13 in 1.5 minutes** on port 6420. This
covered narrow Fleet/Colonise layouts, 44px actions, arrival notices, module
build results, scan reports and persistence, diplomacy, affordability, and
keyboard activation. The six failed P-56 Interstellar visual cases also passed
in the subsequent **7/7 no-update** visual run on port 6424, which included the
P-66 review. I refreshed and reviewed the six French/Terminal/390px P-56
captures. Review found single-letter final-line wraps beside the status pill in
French `Vaisseau Stellaire` and `Coloniser` headings; all text remains inside
the pane, but those wraps need a source-level layout follow-up. No game source
was changed in this test-only recovery slice.

## P-66 unlaunched Starship presentation

`phase6-tab-layout.spec.ts` checks the unlaunched Starship title, artwork, and
framed card at desktop width. Its reviewed baseline is in
`phase6-tab-layout.spec.ts-snapshots/`. The case moved from Theme Presentation
without assertion changes; no tests were run during the move.

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/starship/phase6-tab-layout.spec.ts
```

14 October 2026 P-66 canonical visual split: the Starship capture case now
lives in `phase6-interstellar-visual-review.spec.ts` with its four reviewed
snapshots in the adjacent snapshot directory. The focused three-area run passed
**3/3 in 16.3 seconds** in installed Chrome on port 6517. Starship passed 1/1;
all four snapshots matched without updates. Colonise setup scans the selected
destination before the page becomes available. The previous combined run's
single Colonise failure was caused by the split setup omitting that scan; no
application change or baseline refresh was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6517'; npm.cmd run test:e2e:focused -- tests/e2e/starship/phase6-interstellar-visual-review.spec.ts tests/e2e/fleet-hangar/phase6-interstellar-visual-review.spec.ts tests/e2e/colonise/phase6-interstellar-visual-review.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-interstellar-split-p66-6517"
```

## Phase 7 computed Starship and fleet names (AUTHORED; NOT RUN)

[`p7-computed-starship-names-locales.spec.ts`](p7-computed-starship-names-locales.spec.ts)
checks all five module card headings on the visible Starship page, then uses the
existing `build-starship` test fixture action to reveal Fleet Hangar and checks
the Envoy heading and all four fleet names there in each of the six locales.
Cosmic Forge constructs the names in `drawTab5Content.js` with
`starShipModule${id.slice(2)}` and `fleetShip${id.slice('fleet'.length)}`. The
source keys are `starShipModuleStructural`, `starShipModuleLifeSupport`,
`starShipModuleAntimatterEngine`, `starShipModuleFleetHangar`,
`starShipModuleStellarScanner`, `fleetShipEnvoy`, `fleetShipScout`,
`fleetShipMarauder`, `fleetShipLandStalker`, and `fleetShipNavalStrafer`.
MIAPLACIDUS renders module names through `starshipText(locale, moduleId)` in
`[data-testid="starship-module-${moduleId}"] h3`; the Fleet Hangar route renders
`starshipText(locale, "envoyTitle")` in its heading and the four mapped
`fleetScout`, `fleetMarauder`, `fleetLandStalker`, and `fleetNavalStrafer` keys
in `[data-testid="starship-fleet-${fleetId}"] h4`.

## Phase 7 Colonise and Fleet Hangar source help (AUTHORED; NOT RUN)

`p7-colonise-and-fleet-source-help-locales.spec.ts` checks the selected-locale
Colonise diplomacy and reception help, plus the Envoy and four fleet-unit
descriptions on the separate Fleet Hangar child page. The six-locale assertions
also require explicit target catalogue values for every mapped message.

Source evidence: `descriptions.js` defines `diplomacyOptionsRow` and
`receptionStatusRow` help content, and `drawTab5Content.js` creates those rows
on the Colonise view; the target routes these separately to the Colonise
diplomacy help tooltip and the scan report's Attitude help tooltip. The same
source file defines the five `spaceFleet*BuildRow` descriptions, while
`game.js#getFleetResourceDescriptionElements` attaches those descriptions to
the Fleet Hangar purchase rows. MIAPLACIDUS keeps all five descriptions under
its distinct Fleet Hangar page: `envoyDescription` and each unit's
`fleet*Description` appear beside their matching Envoy or fleet card. The
Envoy wording is adapted to its current target action, which opens diplomacy
channels rather than exposing a separate information-gathering mission.
`diplomacyOptionsHelp`, `receptionStatusHelp`, `envoyDescription`, and the four
unit descriptions have explicit values in all six target locales. No browser
test, build, typecheck, or validation command was run for this authored spec.

This route coverage is authored for Phase 8 V-59 and marked **NOT RUN**. It
leaves Interstellar's Starship and Fleet Hangar as separate child destinations.

## Phase 7 Starship, Fleet Hangar, and Colonise page copy (AUTHORED; NOT RUN)

[`p7-interstellar-page-copy-locales.spec.ts`](p7-interstellar-page-copy-locales.spec.ts)
covers the three distinct source tab-5 destinations across `LOCALE_IDS` (`en`,
`es`, `pt`, `de`, `it`, and `fr`). Cosmic Forge declares them separately in
`index.html` as `headerMainStarShip` / `option3`, `headerMainFleetHangar` /
`option4`, and `headerMainColonise` / `option5`; MIAPLACIDUS keeps separate
`interstellar-starship`, `interstellar-fleet-hangar`, and `interstellar-colonise`
routes, rendered by `StarshipPane` with distinct `view` values.
The separate navigation labels are checked in
[`p7-navigation-label-routing.spec.ts`](../localization/p7-navigation-label-routing.spec.ts):
`headerMainStarShip` maps to `title`, `headerMainFleetHangar` to `fleetHangar`,
and `headerMainColonise` to `coloniseTabLabel`.

The same all-locale spec follows Cosmic Forge's `launchStarShipWarningHeader`
and `launchStarShipWarningText` from the confirmed destination's Travel action
into the source warning modal. The active MIAPLACIDUS launch dialog uses
`pointOfNoReturnTitle` and `pointOfNoReturn` for its heading and irreversible
run-reset warning. These are populated selected-locale adaptations; the target
also adds its current destination fuel quote and optional megastructure warning.
This route coverage is **AUTHORED, NOT RUN**.

This spec checks the Starship heading (`title`) and source header help
(`headerDescStarShip` maps to `starshipHeaderHelp`),
travel and scan labels (`tab5TravellingToRowLabel` maps to `travellingTo`,
`tab5PerformSystemScanRowLabel` maps to `performSystemScan`, and source
`buttonScanSystem` maps to `scanSystem`), plus scan help. Cosmic Forge's
`tab5ScanSystemDescription` is covered by the selected-locale target
`scanActionHelp` tooltip. For Fleet Hangar it checks the heading,
`fleetHangarHelpLabel`, and `infoTooltipFleetHangarHeader` maps to
`fleetHangarHeaderHelp`. It also checks source
`headerDescFleetHangar` / `tab5FleetHangarDescription` copy through
`fleetHangarDescription`, including the locale-formatted live fleet strength.
For Colonise it checks the heading, dynamic
`headerDescColonise` maps to `coloniseHeaderHelp`, source
`tab5ColoniseDescription` maps to `coloniseDescription` with the fixture star
and fleet strength, and `tab5RelationsRowLabel` maps to the target diplomacy
section heading `diplomacyTitle`.

The same spec scans the fixture's orbiting Sirius destination and checks the
reachable Colonise report in all six locales. Source `tab5StarNameRowLabel`
maps to the target Star Map `sortName` label; `tab5CivilizationRowLabel` and
`labelType` map to the report's separate race-name and `civilization` fields.
`tab5PopulationRowLabel` and `labelTraits` map to `population` and
`lifeformTraits`; `tab5ThreatLevelRowLabel` and `labelDefense` map to
`threat` and `defense`. `tab5EnemyFleetsRowLabel`,
`tab5AnomaliesRowLabel`, and `tab5AttitudeRowLabel` map to `enemyFleets`,
`anomalies`, and `attitude`; nested source `labelThreat` becomes its own
`threat` report row. Source
`tab5IntelligenceRowLabel` is a grouped row; the remake presents its
civilization, defense, and trait readings as separate report fields with no
standalone “Intelligence” heading. Source `labelFleetAir`, `labelFleetLand`,
and `labelFleetSea` are represented by the localized air/land/sea order in the
target `enemyFleets` label. Source `tab5AttitudeRowLabel` combines attitude
with a nested threat reading; the target gives them separate `attitude` and
`threat` rows and also retains separate `impression` and `patience` fields.
Source `tab5RelationsRowLabel` continues to map to the target diplomacy
section heading `diplomacyTitle`. The scan outcome uses target `lifeDetected`
/ `noLifeDetected` statuses instead of a bare Yes/No label. The test checks
visible report labels, system and race names, localized readings, and scan
outcome for each locale. Coverage is **AUTHORED, NOT RUN** for Phase 8 V-59.

Fixture routes are `space-starship-scanning` for the Starship page, then the
existing `build-starship` setup action to expose Fleet Hangar, and
`space-battle-victory` for the scanned Sirius Colonise destination. Locale
values are populated in `starshipMessages.ts` and `starMapMessages.ts` for all
six IDs. This spec is
authored for Phase 7 and **NOT RUN**; no test, browser, build, or type check was
performed for this slice.

The same Phase 7 spec also covers source scan and Colonise description branches
where the remake has deterministic active routes. Cosmic Forge's
`game.js` writes `tab5ScanResultsAnalyse` or `tab5ScanResultsNoScanner` into
`descriptionContentTab5` after a completed scan, selected by whether a Stellar
Scanner is fitted. The scanner-present text is an instructional prompt; the
remake has no direct equivalent prompt. Its Colonise route presents the
structured `scanReport` heading and report fields instead, so no new
instructional copy is inferred. The blind-scan fixture checks the existing
`scanLimited` notice on both the Starship scan and Colonise report routes, plus
the report's unknown `???` outcome, in all six locales. This maps
`tab5ScanResultsNoScanner` to the remake's explicit limited-reading notice.

For battle, source `tab5BattleDescription` is set in the `getWarMode()` branch
with player and enemy fleet power values. The test enters war from the existing
`space-battle-victory` fixture and checks the live Colonise description in each
locale; the active target renderer uses `coloniseBattleDescription` and formats
the enemy value from the current enemy-fleet composition. Source
`tab5SettleNoResistance` is set when civilization is None/Unsentient or the
enemy fleet total is zero. The `space-unoccupied` route checks the current
`coloniseNoResistance` description and title in all locales. Although the
target message catalog also contains `settleNoResistance`, the active
`StarshipPane` renderer uses `coloniseNoResistance` for this branch.

Source `tab5BuildFleetsToEngage` is selected when patience is exhausted and
player fleet attack power is zero. The active target branch maps to
`coloniseBuildFleets` under the same state condition and renders the localized
zero fleet-power value alongside it, but current deterministic fixtures do not
produce both exhausted patience and zero player attack power while resistance
remains. This branch is documented but has no runtime locale assertion in this
slice. The added no-scanner, battle-description, and no-resistance route
assertions are **AUTHORED, NOT RUN**; no test, browser, build, or type check was
performed.

Cosmic Forge `spaceStarShipStellarScannerContent1` is the help copy on the
Starship system-scan row. It maps to the selected-locale `scanActionHelp`
InfoTooltip beside the target's scan action; the same control also covers the
separately keyed `tab5ScanSystemDescription`. Source
`spaceStarShipDestinationReminderContent1` maps to `noDestination` in the
Starship travel summary when the player has not selected a destination. The
all-locale destination-reminder assertion is in this spec and is **AUTHORED,
NOT RUN**. Both target strings already have populated values in all six
locales.

## Phase 7 war-entry confirmation (AUTHORED; NOT RUN)

Cosmic Forge `ui.js#showEnterWarModeModal` receives the `chooseWar` and
`noScanner` paths from its diplomacy caller. The all-six-locale
[`p7-war-mode-confirmation-locales.spec.ts`](p7-war-mode-confirmation-locales.spec.ts)
checks the active Colonise route for both states. The target dialog uses the
source `enterWarModeModalHeader` and the distinct
`enterwarModeModalBackOutText` or `enterwarModeModalNoBackOutText` copy, with
the source `battleAttackingBlind` notice on the no-scanner branch. Confirm
dispatches the existing `space.diplomacy.enter-war` command; cancelling the
scanner-complete dialog leaves diplomacy and combat state unchanged. Like the
source modal, the blind branch has no cancel action. All six locale values are
authored in `src/i18n/warModeMessages.ts`.

The ten remaining `showEnterWarModeModal` result keys are not routed through
source-style dialogs:

- `enterWarModeModalPatience`: the source adjusts enemy fleet counts from the
  total impression delta and enters war; the target only reaches `warReady`
  and records the latest impression change.
- `enterWarModeInsultedText`: the target's `bullyAttack` analogue boosts
  defense by 10%, but renders its own diplomacy message and leaves war entry
  to the explicit action.
- `enterWarModeScaredText`: the target also halves enemy fleets, but the source
  describes desertion and immediately continues into war.
- `enterWarModeSurrenderText`: the target disbands enemy fleets but waits for
  the separate settlement action instead of settling immediately.
- `enterWarModeNotVassalizedText`: the target has a `vassalizationFailed`
  message, while the source confirmation also starts war.
- `enterWarModeModalLaughAtProspect`: the target's `bullyLaugh` message covers
  the impression loss, but there is no source-style result dialog.
- `enterWarModeModalLaughAndEnterWar`: the source closes diplomacy and starts
  war; the target keeps war entry explicit.
- `enterWarModeModalImproveToReceptive`, `enterWarModeModalNeutral`, and
  `enterWarModeModalReserved`: the target has corresponding diplomacy outcomes,
  persistent messages, and impression readings, but no result dialogs.

These branches need a separate owner-directed behavior mapping before their
source result-dialog keys can be routed without changing or misrepresenting
gameplay.

The spec is **AUTHORED, NOT RUN**. No test, build, typecheck, formatter,
validation, or browser check was run for this slice.
