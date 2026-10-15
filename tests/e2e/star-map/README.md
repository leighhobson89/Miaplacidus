# Star Map

Browser coverage for the Interstellar map, study visibility, search feedback, home-system gate, and pointer/keyboard pan and zoom behavior. The catalogue math and discovery model are also covered in `tests/unit/star-catalogue.spec.ts`.

The focused Chrome area passed 4/4 on 5 October 2026. The keyboard case zooms in, focuses the map, and confirms ArrowRight and ArrowDown change the view box. Star Data navigation is scoped through the Interstellar section tab list, and its table controls are scoped to the sibling Star Data panel.

The Star Map tests also assert that an unreported factory system is absent from Star Data, disabled map markers expose an accessible reason, Star Data actions have row-specific names, sort direction is announced, and the selected route's antimatter/AP preview matches its Star Data row. The deterministic Star Data journey captures the restored, unfiltered table as `star-data-unfiltered`; the focused Chrome journey passed 1/1 both during snapshot generation and without snapshot updates. The full-page 1280px Terminal screenshot was reviewed: filters and sort controls remain above the complete route and destination table. Its 390×844 checkpoint passed 1/1 during snapshot generation and again without updates. The mobile capture was reviewed: the localized scroll cue precedes the table, horizontal scrolling stays within its keyboard-focusable table region, and the page itself has no horizontal overflow. A separate 390×844 touch-emulated Chrome case passed for Star Map markers and zoom/reset controls. Unit coverage checks hidden-factory filtering and selector-backed route values.

8 October 2026 P-14 presentation follow-up: focused Chrome checks cover weather glyphs paired with percentages, Star Map visibility only on the Map child (Star Data remains available separately), and the selected route's distance/antimatter label at the line midpoint with its green-ready affordability class. Keyboard Enter activates zoom-in, zoom-out, and reset; the 390�844 touch case verifies touch-drag panning while zoomed. The behavior checks passed in the focused Star Map/Starship batch (6/8 overall before the two failing assertions were corrected); the corrected child-tab visibility case then passed 1/1. The Starship README records the scan-threshold test adjustment and evidence.

8 October 2026 P-14 red-disabled route follow-up: the focused Chrome case passed 1/1 in 16.1 seconds. It saves the selected Sirius route, creates an isolated checksummed save with antimatter one below the computed travel requirement, then verifies the route is unaffordable and the midpoint distance/antimatter label remains visible with red-disabled styling (line stroke and label fill match the route color). Production behavior and fixtures were not changed.

8 October 2026 P-65 Star Data identity follow-up: the weather glyph/chance Chrome journey now also checks for exactly one visible 'Star Data' heading and one visible artwork row with the star-system illustration. The focused case passed 1/1 in 20.2 seconds; broader theme, locale, and viewport review remains open under P-65/P-56.

9 October 2026 P-66 visual review: the Star Map canvas now has durable 1280x900 Terminal and 390x844 Light captures named `phase6-star-map-terminal-desktop.png` and `phase6-star-map-light-mobile.png`. Both were reviewed; the study-range heading, map, search control, selected-system panel, and zoom controls fit their desktop and phone layouts. The focused `@p66-visual-review` run passed without snapshot updates; files are in `tests/e2e/star-map/star-map.spec.ts-snapshots/`.

9 October 2026 P-14 keyboard pan regression: the focused map test now checks all four arrow keys at a zoomed view, verifies each direction pans, and confirms the view returns to its starting zoomed bounds while focus stays on the map. The installed-Chrome single-case run passed 1/1 in 5.2 seconds. Existing map tests cover Enter activation of zoom/reset, phone touch targets and marker selection, and touch-drag panning; Fleet Hangar keyboard/touch coverage is recorded in tests/e2e/starship/README.md.

**P-14 touch/keyboard sign-off (9 October 2026):** the combined installed-Chrome control matrix passed 4/4 touch cases and 3/3 keyboard cases, covering marker selection, touch pan/zoom, four-direction keyboard pan, Enter zoom/reset, and the shared allocation/Casino journeys. The marker touch test now scrolls the chosen marker into the viewport before dispatching a touch emulation tap; this avoids testing an off-screen target. Fleet Hangar keyboard/touch passed 2/2 separately; see the Starship README.

<a id="p-13-narrow-star-map-context-9-october-2026"></a> **P-13 narrow Star Map context (9 October 2026):** the focused route case selects Sirius at 390px and 320px and checks that the current Antimatter balance, selected-system panel, required travel cost, and enabled destination action remain visible. It also checks that the status card and selection panel stay within the viewport and the document has no horizontal overflow. Installed Chrome passed **1/1 in 7.8 seconds** on port 4498. This verifies the selected-route slice of P-13; broad theme and locale screenshot review remains under P-51/P-56.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4498'; node .\node_modules\playwright\cli.js test --pass-with-no-tests tests/e2e/star-map/star-map.spec.ts -g '@p13-context' --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-16 programmatic navigation focus follow-up (9 October 2026):** choosing
`Show on map` from Star Data selects the Map child and moves keyboard focus to
the Star Map panel. The new no-screenshot focused Chrome case passed as part
of the four-case P-16 run (13.7 seconds); its command is recorded in the
[notification README](../notifications/README.md).

**P-41 Star Map route notation (9 October 2026):** a focused real-control case
selects Sirius and checks the visible route distance, antimatter travel cost,
and potential AP against the active route in Condensed, Standard, and
Scientific notation. Scientific fuel differs from Standard; the installed-
Chrome two-case run passed 2/2 in 13.2 seconds on port 4325, alongside the
Black Hole Research Point price check. The companion evidence is in the
[Black Hole README](../black-hole/README.md).

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4325'; npm.cmd run test:e2e:focused -- tests/e2e/star-map/p41-star-map-notation.spec.ts tests/e2e/black-hole/p41-black-hole-price-notation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-65 narrow Star Data visual review (9 October 2026):** a durable full-page
capture checks the French Star Data title and star-system artwork at 320×740 in
the Frosty theme. The heading matches Hydrogen's title size; the document,
heading, panel, and artwork stay within the viewport. I reviewed the capture:
the translated title and framed illustration are fully visible, the
description wraps cleanly, and the long data table remains inside its own
scroll region with no page-level horizontal overflow. The baseline is
`p65-star-data-visual-review.spec.ts-snapshots/p65-star-data-fr-frosty-320.png`.
The snapshot-generation run passed 1/1 in 6.3 seconds; the no-update run passed
1/1 in 5.7 seconds, both using installed Chrome on port 4330.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4330'; npm.cmd run test:e2e:focused -- tests/e2e/star-map/p65-star-data-visual-review.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --update-snapshots
```

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4330'; npm.cmd run test:e2e:focused -- tests/e2e/star-map/p65-star-data-visual-review.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-05 Star Map action targets (9 October 2026):** the 390x844 touch-emulated
Chrome case verifies a search result can be selected from its enlarged hit area
and a discovered destination can be set from the Star Data table using a touch
just above the visible button bounds. The search result and destination hit
areas meet 44px height; the test activates one destination by keyboard Enter
and a second by touch just above its visible button, confirming selected-route
state each time. Installed Chrome passed 1/1 as part of a five-case regression
batch (5/5 in 15.2s) on port 4603. The Star Data row's visible styling is
unchanged; its destination hit area is extended with a transparent
pseudo-element. P-05 remains open for the remaining mechanics action families.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_PORT='4603'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/star-map/p05-map-actions-touch.spec.ts
```

**E-57 Star Map and Star Data narrow-locale review (10 October 2026):** the selected Sirius route is checked for localized distance, Antimatter, AP, destination action context, and accessible map-marker labels. Star Data checks all nine translated table headers, filter/sort controls, every row's localized map/destination action labels and disabled reason, weather SVG and localized title/percentage, and the horizontal table scroller. Checks cover `en`, `es`, `pt`, `de`, `it`, and `fr` at 390px and 320px. The table remains inside its own scroll region and the document does not overflow. The focused case passed as part of the six-case installed-Chrome E-57 run (6/6 in 1.8 minutes, port 4679); no page-component or shared-CSS correction was needed.

Focused command: `$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4679'; node .\node_modules\playwright\cli.js test --pass-with-no-tests tests/e2e/space-mining/e57-space-mining-narrow-locale-context.spec.ts tests/e2e/star-map/e57-star-map-data-narrow-locale-context.spec.ts tests/e2e/starship/e57-interstellar-narrow-locale-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line`

## P-56 Star Map visual matrix (10 October 2026)

The focused `p56-star-map-visual-matrix.spec.ts` case checks the selected
Sirius route, distance and Antimatter quote, route label, zoom action, map
heading, selected-system card, and document/panel bounds across six locales,
nine themes, and 1280px, 390px, and 320px widths (162 combinations). It also
asserts that the Power status button and battery-duration text stay inside
their stat card. Installed Chrome passed the baseline generation **1/1 in
1.3 minutes** and the clean no-update run **1/1 in 1.2 minutes** on port 5360.
I reviewed the Terminal desktop, French Light phone, and German Space 320px
captures. The route and selected-system details remain contained. The first
geometry pass found the Power button overflowed its card by about 14px for a
long translated state; at 320px its countdown also overlapped the adjacent
stat. The Power value now wraps its duration within the card. The per-theme
capture names are `p56-star-map-{en-terminal-desktop,fr-frosty-phone,de-space-narrow}.png`.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
$env:MIAPLACIDUS_TEST_PORT = '5360'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-star-map-visual-5360 tests/e2e/star-map/p56-star-map-visual-matrix.spec.ts
```

**P-45 Star Map/Star Data locale audit (10 October 2026):** the existing
`e57-star-map-data-narrow-locale-context.spec.ts` already supplies the
requested visible route coverage: in all six locales at 390px and 320px it
checks the Star Map heading and search label, selected Sirius destination,
localized distance/Antimatter/AP values and route labels, plus the enabled
localized Set Destination action. Its Star Data sweep checks translated table
headers, filters/sort controls, every row's localized map/destination actions
and disabled reasons, and weather glyph labels. The clean installed-Chrome
E-57 batch passed **6/6 in 1.8 minutes** on port 4679, so no duplicate browser
assertion or app change was needed. Starship scan-result locale continuation
is recorded in the [Starship README](../starship/README.md).

### P-45 scan and study result copy (10 October 2026)

The source-to-remake result path is already covered by
`tests/e2e/localization/p45-space-interstellar-results.spec.ts`; no extra test
was needed. Cosmic Forge completes Star Study and raises
`notificationStarStudyComplete` in `game.js:13455-13462`, and emits
`notificationSystemScanned` after the scan action in `drawTab5Content.js:978`.
The corresponding typed six-locale copy is in `spaceMessages.ts`,
`spaceNotificationMessages.ts`, and `starshipMessages.ts`. The browser case
starts Star Study through its visible control and checks the range feedback
and global completion notice in each locale. It also scans the selected
destination through the Starship control, checks the localized completion
status and global notice, then opens Colonise and checks the saved localized
life/no-life result. The fresh installed-Chrome rerun passed **2/2 in 46.2
seconds** on isolated port 5387. This establishes six-locale scan/study
outcome copy; it does not repeat the separate E-57 map/table heading and
route-context checks.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5387'; npm.cmd run test:e2e:focused -- tests/e2e/localization/p45-space-interstellar-results.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-star-study-scan-5387
```

## P-51 Star Data and Starship phone visual review (10 October 2026)

The focused French Terminal case checks Star Data and its rightmost destination
action column at 320px and 390px. It opens the live location/weather tooltip,
checks the tooltip's six content rows and viewport bounds, scrolls the wide
Star Data table fully to the right, and asserts destination buttons and all
disabled reasons stay within the table's own scroller. It then opens the
Starship launch confirmation, checks the translated fuel quote, dialog and
actions fit the viewport, and cancels without launching. The 320px captures
`p51-star-data-fr-terminal-320-table-end-weather-tooltip` and
`p51-starship-fr-terminal-320-launch-dialog` were visually reviewed; the
rightmost actions are reachable and the dialog's long warning wraps without
clipping. The test passed **1/1 in 9.2 seconds** in installed Chrome on port
5037. Existing E-57 checks still cover all six locales at both phone widths.

The first measured 320px French table had a 393px final column because its
disabled reason inherited `white-space: nowrap`; at maximum horizontal scroll,
the destination button began at x=-76 outside the scroller. A scoped rule for
`.star-data-table td:last-child .control-reason` now wraps those reasons. The
focused regression confirms every destination action and reason fits within
the scroller at its right edge. No gameplay or localization behavior changed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_TEST_AREA='star-map'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5037'
npm.cmd run test:e2e:focused -- tests/e2e/star-map/p51-interstellar-narrow-visual.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-44 Star Data and scan report source tooltips (10 October 2026)

The six Cosmic Forge `infoTooltipStarShipScan*` descriptions are now typed in
all six locales. AP and weather/precipitation help appears beside the matching
Star Data table headings. Civilization type, threat, defense, and enemy fleet
help appears beside those readings in the Colonise scan report, where the
owner-directed scan data now lives. Each info control has a localized
accessible name, opens on keyboard focus or hover, and positions its tooltip
inside the viewport.

The focused `p44-star-scan-info-tooltips.spec.ts` Chrome case passed **1/1 in
18.9 seconds** at 320×900 on port 5338. It checks all six source-mapped
tooltips' text and accessible labels in `en`, `es`, `pt`, `de`, `it`, and `fr`,
and asserts all six popup rectangles remain within the viewport. The first
run found a narrow-screen edge overflow and a placement error after page
scrolling; the shared tooltip positioning now clamps and corrects against the
measured viewport rectangle. Initial sandbox startup returned `spawn EPERM`;
the installed-Chrome retry passed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5338'
node .\node_modules\playwright\cli.js test tests/e2e/star-map/p44-star-scan-info-tooltips.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p44-star-scan-info-5338
```

## P-44 Star Data help inventory (10 October 2026)

The 10 October consolidation note was superseded by the 11 October correction:
the Star Data Weather column uses the distinct
`starMapMessages.starDataWeatherHelp` mapped from
`infoTooltipStarLegendWeather`; `starshipMessages.scanWeatherHelp` stays with
the separate Starship scan help. The current Phase 7 recheck is recorded
below. `infoTooltipStarLegendName` is adapted to the target's explicit sort
selector and per-row Show on map buttons, which
`e57-star-map-data-narrow-locale-context.spec.ts` checks in all six locales at
320px and 390px. The 10 October note recorded that the then-current remake
lacked the source map modes. The active `StarMapPane` now has separate Normal,
Distance, Studied, and In Range controls plus the localized `mapModesHelp`
tooltip. The six-locale `interstellar-localization.spec.ts` now asserts these
labels and help copy; the updated assertion is **NOT RUN** for Phase 7. The
full source-key dispositions are in the [P-44 handoff](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-remaining-cosmic-forge-infotooltip-inventory-10-october-2026).


The latest installed-Chrome rerun of `p44-star-scan-info-tooltips.spec.ts`
passed **1/1 in 19.6 seconds** on port 5455, including the weather tooltip and
all six locales. This run confirms the existing control is still reachable and
localized; no code change was made.

## 14 October 2026 focused failure follow-up

The saved full-run manifest showed three Star Map failures: E-57 compared
header text that still included the `i` tooltip icons; the P-56 and P-65 visual
captures differed from their baselines; and the Star Data/map cases had stale
fixture and accessible-name expectations. E-57 now strips the tooltip control
wrappers before comparing the nine localized headers. The weather-glyph case
uses the discovered-system fixture and checks settled rows when present without
requiring this fixture to create one. The Star Data route journey now expects
the rendered row action name `Show this Star on the Star Map: {star}`.

Refreshed visual baselines cover the P-56 Terminal desktop, Frosty phone, and
Space 320px views; the P-65 French Frosty 320px Star Data page; the P-66
Terminal desktop and Light mobile maps; and the Star Data unfiltered desktop
and mobile views. I reviewed these captures: the map heading, mode/search
controls, route/selected-system panels, table headings, and scrollable table
remain visible in their respective layouts. The E-57 localized route and table
checks passed across six locales at 390px and 320px. The full P-56 matrix passed
all 162 locale/theme/viewport combinations with its existing geometry checks.

The snapshot-refresh run updated the eight captures, then exposed one remaining
stale accessible-name assertion in the Star Data route journey; after correcting
it, the focused no-update Chrome batch passed **6/6 in 2.8 minutes** on port
4884. This batch contains only E-57, P-56, P-65, P-66, the Star Data weather
glyph case, and the Star Data filter/sort/map-focus journey; the full suite was
not rerun.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4884'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-star-map-focused-verify-20261014 tests/e2e/star-map/e57-star-map-data-narrow-locale-context.spec.ts tests/e2e/star-map/p56-star-map-visual-matrix.spec.ts tests/e2e/star-map/p65-star-data-visual-review.spec.ts tests/e2e/star-map/star-map.spec.ts --grep "@e57-star-map|@p56-visual-matrix|@p65-visual-review|@p66-visual-review|Star Data pairs each system's weather glyph|filters and sorts Star Data, targets a discovered system, and focuses it on the map"
```

## Phase 7 Star Data weather-help route correction (15 October 2026)

The current renderer had drifted from the 11 October P-44 correction: the Star
Data Weather tooltip called `starshipText(locale, "scanWeatherHelp")`, which
belongs to the distinct Starship scan surface, even though
`starMapMessages.starDataWeatherHelp` is populated in all six locales and has a
source-parity unit assertion. `StarMapPane.tsx` now renders the Star Data
message, and `p44-star-scan-info-tooltips.spec.ts` expects that exact selected-
locale value while retaining the Starship scan tooltip mapping. The route spec
is **NOT RUN** for Phase 7; Phase 8 V-59 owns execution. No test, build, or
typecheck was run for this correction.

The same static recheck confirmed that the active Star Map has four distinct
source-matched mode buttons and a `mapModesHelp` message. The all-locale
`interstellar-localization.spec.ts` now checks the selected-locale labels and
help text; it is also **NOT RUN** for Phase 7.

## Phase 7 Interstellar and Star Data locale coverage (15 October 2026)

Compared Cosmic Forge `index.html`, `drawTab5Content.js`, and `descriptions.js`
with `presentationNavigation.ts`, `StarMapPane.tsx`, and `StarshipPane.tsx`.
The source `tabHeaderInterstellar` label maps to the top-level
`messages.ts` `tab.interstellar` value. Interstellar menu keys
`headerMainStarMap` and `headerMainStarData` map to `starMapText("title")` and
`starMapText("dataView")`; they remain separate `option1` and `option2` routes
in `interstellarPaneItems()`. Their source header descriptions
`headerDescStarMap` and `headerDescStarData` map to `mapHeaderHelp` and
`dataHeaderHelp`. On Star Map, `starMapModeNormal`, `starMapModeDistance`,
`starMapModeStudied`, `starMapModeInRange`, and `infoTooltipStarMapModes` map to
`mapModeNormal`, `mapModeDistance`, `mapModeStudied`, `mapModeInRange`, and
`mapModesHelp`; `placeholderSearchStar` maps to `searchPlaceholder`.

For Star Data, source table keys `textStarName`, `textAsteroidDistance`,
`textStarType`, `textStarWeather`, `textStarPrecipitation`, `textStarFuel`,
`textStarAscendencyPoints`, and `textSettled` map to `sortName`, `distance`,
`dataType`, `weather`, `precipitation`, `fuel`, `ascendency`, and `settled` in
`starMapMessages.ts`. Sorting, filters, and row actions use the target keys
`sort*`, `filter*`, `mapColumn`, and `mapTarget`; source
`tooltipShowStarOnMap` maps to the localized per-row `mapTarget` action.
Source help keys `infoTooltipStarLegendName` and
`infoTooltipStarLegendWeather` map to `starDataNameHelp` and
`starDataWeatherHelp` on the Star Data renderer. `StarMapPane.tsx` renders the
row destination action with `starshipText("setDestination")` from
`starshipMessages.ts`; Starship and its other Interstellar children use the
same catalog in `StarshipPane.tsx`.

The focused `e57-star-map-data-narrow-locale-context.spec.ts` now checks that
the map search/mode copy and Star Data route label, header help, table heading,
name/weather tooltips, filter/sort control, row action, weather label, and help
values have explicit nonempty values in that selected locale's `messages` or
`additionalMessages` entry before asserting the rendered routes in `en`, `es`,
`pt`, `de`, `it`, and `fr` at 390px and 320px. It also checks that the
Starship-owned `setDestination` and `scanMoreInfoLabel` values are populated in
that locale.
Static inspection found the required keys already populated across all six
locales, so no application copy change was needed. The existing
`interstellar-localization.spec.ts` checks that map modes and their help render
in each locale; the selected-locale
[navigation case](../localization/p7-navigation-label-routing.spec.ts) covers
Interstellar's top-level and five child labels and is **NOT RUN**. The added
assertions and this Phase 7 coverage are **NOT RUN**; no browser, build, or
typecheck was run for this update.

### Phase 7 source tooltip route sweep (AUTHORED; NOT RUN)

The Phase 7 extension to `p44-star-scan-info-tooltips.spec.ts` now checks the
complete source help family against the active target routes in all six
locales, and first verifies each target catalog has an explicit nonempty value.
`descriptions.js` binds `infoTooltipStarMapModes` on the Star Map and
`infoTooltipStarLegendName` / `infoTooltipStarLegendWeather` on Star Data;
`StarMapPane.tsx` renders these as `mapModesHelp`, `starDataNameHelp`, and
`starDataWeatherHelp`. On the Colonise scan report, the six
`infoTooltipStarShipScan*` source keys map to `scanApHelp`, `scanWeatherHelp`,
`scanCivilizationHelp`, `scanDefenseHelp`, `scanEnemyFleetsHelp`, and
`scanThreatHelp` on their respective report fields in `StarshipPane.tsx`.
The spec opens every tooltip by keyboard focus and checks its selected-locale
label/content at 320px. The Star Data AP tooltip remains covered separately in
its table heading. The source route distinctions are retained: map modes on
Star Map, legend/name/weather on Star Data, and scan details on Colonise.

This extended assertion set is **AUTHORED; NOT RUN** for Phase 7 and belongs to
Phase 8 V-59. Its earlier P-44 execution predates the added route checks. No
test, build, typecheck, or browser run was performed for this update.
