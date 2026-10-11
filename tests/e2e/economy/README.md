# Economy browser coverage (M-03)

This area uses Playwright in Chrome with real clicks through the Resources, Energy, Research, and Compounds panels. Most later-system cases start from a named, deterministic fixture so the test can focus on the action under test. Fresh progression begins with a real Hydrogen save, buys the Science Kit and compressor through their controls, unlocks Energy and Compounds, and reaches the first Helium and Carbon child pages through the resource rail. That path checks source order, Energy's initial Energy Storage page, `New` badge clearing, and child-page restoration after switching main tabs. Automatic-sale and compound-creation cases buy/enable producers, operate the source-style two-handle segmented allocation slider with pointer/touch dragging or 5% keyboard steps, and advance the injected clock.

## Run

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/economy/economy.spec.ts --workers=1
```

To run the repository's complete click-driven browser suite with the same Chrome settings, use `npx.cmd playwright test tests/e2e --workers=1` instead.

The shared browser fixture records page errors, console errors, and external requests. `captureVisualCheckpoint` attaches a full-page screenshot, requires the app-ready surface to have a non-white background, and compares the screenshot to its checked-in baseline with a 5% pixel-difference allowance.

Pure model and transaction evidence is in [`tests/unit/economy.spec.ts`](../../unit/economy.spec.ts). The source values and observed legacy rules are in [`foundation-economy.md`](../../../docs/audit/foundation-economy.md); the explicit remake tick order and intentional deterministic allocation rule are in [`economy-contract.md`](../../../docs/plans/economy-contract.md).

## Fixed source comparisons

| Scenario        | Cosmic Forge reference                                          | Remake expectation                                                                        | Evidence                                                                                                                           |
| --------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Fresh stock     | $10 cash, 50 RP, zero ordinary materials, Hydrogen capacity 150 | Fresh run retains those balances and cap                                                  | [`hydrogen-boot.spec.ts`](../app-boot/hydrogen-boot.spec.ts), [`foundation-economy.md`](../../../docs/audit/foundation-economy.md) |
| Hydrogen Tier 1 | 50 Hydrogen, then repeated prices 57 and 65; output 2/s         | Per-step ceil pricing; 10 seconds produces 20 Hydrogen while enabled                      | [`economy.spec.ts`](../../unit/economy.spec.ts), [`hydrogen-compressor.spec.ts`](../autobuyers/hydrogen-compressor.spec.ts)        |
| Science Kit     | $5 purchase, 0.5 RP/s                                           | Visible rate is 0.5 RP/s; one fixed 10-second scenario produces 5 RP                      | `economy.spec.ts`, economy browser screenshots                                                                                     |
| Basic Plant 1   | $300 + 100 Carbon; 5 kJ/s; burns 3 Carbon/s                     | One plant produces 5 kJ/s and consumes 30 Carbon over 10 seconds                          | `economy.spec.ts`, `economy-all-energy-buildings.png`                                                                              |
| Water storage   | 99 Water + 30 Concrete; capacity 100 to 200                     | Both inputs are required; an affordable purchase consumes both and doubles Water capacity | `economy.spec.ts`, `economy-water-storage-expanded.png`, `economy-water-storage-blocked.png`                                       |
| Sale and cap    | Sale credits exact removed units; producers clamp at capacity   | Preview and cash use the same whole-unit quantity; a full store reports 0 net rate        | `economy.spec.ts`, `economy-resource-catalogue.png`                                                                                |

The intentional numerical deviation is production ordering: the remake computes a deterministic transaction and splits shared recipe input budgets evenly. The legacy source uses timer callbacks and mutable object iteration, so competing consumers can depend on update order. Tests cover the declared remake rule and the source comparison fixtures above.

## Evidence boundary

The current E2E area covers a fresh Hydrogen route through the first Research purchase, Energy unlock and Diesel compound unlock; all eight material pages and six compound cards; every individual material and compound storage control; the single Hydrogen stock display and shared Compressor/tier Autobuyers disclosure; Fusion grouped with selling, including first-discovery and subsequent efficiency notices; removal of the duplicate bulk storage action; all autobuyer tiers and pause/resume controls; Water's secondary Concrete cost; all plant, battery, and science building cards; Power All and plant toggles; manual and automated technology purchases with accessible completion announcements; the manual completion announcement and economy screens in all six locales; permanent multipliers; Dyson infinite power; allocation controls for all eight resources; focused keyboard and pointer operation of the segmented cash/compound slider; all six automatic compound recipes from newly produced inputs; battery charge/discharge/recharge; energy trip/recovery; six-language screenshots of Hydrogen, Research, Energy, and Diesel Compound; 390px document-width checks for Hydrogen, Research, Energy, and all six Compound child panes in all six locales (the clean 8 October no-update Chrome run passed 1/1 in 1m 36s, verifying all 36 Compound child/locale checks; no mobile screenshots were added); localized Resource and Compound child-page headings/heroes at desktop width; notation; and economy save/reload. The save/reload case changes a resource balance and storage capacity, buys an autobuyer and power buildings, changes research, compound automation, an allocation share, locale, and notation, then compares all 14 material/compound balances and capacities plus the full upgrade/economy state after reload.

The Tech Tree zoom case verifies both prerequisite edges into Advanced Power Generation, captures a screenshot panned to those dependencies, and confirms ArrowRight/ArrowDown scroll the named viewport on both axes after zooming. The complete graph, theme, and narrow-viewport review remains open under P-60.

The M-03 economy and research gate is complete. Rebirth carryover and repeatable-price restoration (former E-06/E-13/E-36/E-56) belong to M-05; telescope/rocket demand and star/weather/space modifiers (E-09/E-25/E-26/E-35) belong to M-04/M-05; the exhaustive row/tooltip/modal/dynamic-cost language review (E-57) belongs to M-06. The [chronological economy checklist](../../../docs/plans/build-checklist/03-economy.md) links each follow-up to its owner. Their implementation remains open in those later phases and is not counted as M-03 evidence.

## Focused allocation verification (5 October 2026)

- Four desktop/mobile-emulated Chrome journeys passed **4/4** for 5% keyboard steps, pointer/touch dragging, allocation readouts, and production/automation using the resource allocation slider. The reviewed `economy-production-allocation-slider.png` screenshot records the themed segments and both handles; the nested compound pane screenshots were refreshed and passed on rerun.

**P-14 allocation keyboard/touch check (9 October 2026):** the new dedicated
`allocation-input.spec.ts` case passed **1/1** in installed Chrome at a 390×844
CSS-pixel viewport with Pixel 7 touch emulation. It verifies the fieldset's
accessible group name and keyboard instructions, both named horizontal slider
handles and their value ranges/readouts, a 5% ArrowRight adjustment, a real
touch-emulated drag, and no document-width overflow. Moving the cash handle to
the compound boundary brings the second handle along and reduces the compound
share to zero; this matches Cosmic Forge's `normaliseBoundaries`/`setBoundary`
behavior, so no implementation correction was needed. Dedicated P-14 Star Map keyboard/touch and Fleet Hangar keyboard/touch runs passed on 9 October; see their area READMEs for evidence.

Run this focused case with installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
$env:MIAPLACIDUS_TEST_PORT = "4237"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "@p14-allocation-inputs" tests/e2e/economy/allocation-input.spec.ts
```

## Latest verification (3 October 2026)

- `npx.cmd playwright test tests/e2e --workers=1` with Chrome: **51 passed**, including all **30 economy browser cases**. Each visual checkpoint attached a full-page screenshot and compared it with its baseline at a 5% pixel-difference allowance.
- After strengthening the economy save/reload assertions to compare all balances, capacities, upgrades and automation state: the focused E-56 browser case **passed** and its reviewed screenshot baseline was updated.
- `npm.cmd run test:unit`: **43 passed**.
- `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run check:boundaries`, `npm.cmd run format:check`, and `npm.cmd run build`: all passed.

## Focused navigation update (5 October 2026)

- `npm.cmd run test:e2e:focused -- --workers=1 tests/e2e/economy/economy.spec.ts -g "fresh Hydrogen progression unlocks Energy" --update-snapshots` reported **1 passed** in Chrome. It exercises a fresh Hydrogen save through technology unlocks, Energy/Compounds, the ordered Helium/Carbon child pages, Energy Storage as its default child, badge clearing, and child-page restoration after switching tabs. The Playwright process hung after reporting the pass and was interrupted during browser shutdown.
- The same focused command without `--update-snapshots` also reported **1 passed** against the refreshed baselines. It had the same post-pass browser shutdown hang and was interrupted.
- The journey exposed old flattened-resource and nested-technology-button selectors left over from before the Tech Tree and child-page redesign. They now follow the actual button and panel structure. The obsolete exact-cash assertion now checks the progression threshold, and the four affected screenshot baselines show the current Tech Tree and resource-page layouts.

## Focused fusion notification verification (5 October 2026)

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts -g "first fusion discovery reports stored yield" --workers=1
```

This passed **1/1** in system Chrome with video disabled. The player journey researched Hydrogen Fusion, discovered Helium and checked generated/stored quantities, then fused Hydrogen again and checked the later efficiency-loss notice.
- `npm.cmd run test:unit:focused -- tests/unit/economy.spec.ts` passed **22/22**; the discovery event flag and rendered placeholder/quantity copy are covered, with all six locale templates checked. `npm.cmd run typecheck` passed.

## Full-storage automatic-production status (5 October 2026)

The Hydrogen hero, material cards, and compound cards show localized red-disabled text when an enabled automatic producer is blocked by a full output store. The notice is omitted for paused producers, stores below capacity, or a full store without blocked production; it also detects automatic compound creation when the output is full. The focused economy unit suite passed **28/28**, including six-locale copy checks, and the focused Chrome interaction passed **1/1** after the `storage-production` fixture was added to the app's test-only allowlist. Typecheck and targeted formatting passed.

## Research and Tech Tree visual capture (5 October 2026)

The Energy journey now captures Research buildings and the Tech Tree as separate pages. The Research capture shows the science buildings and locked research automation; the Tech Tree capture shows the graph without the Research building cards. Energy, Research, Tech Tree, and Compounds captures were visually reviewed at 1280px in Terminal. The focused Chrome journey passed 1/1 while refreshing those baselines and passed 1/1 again without snapshot updates. The active Tech Tree viewport intentionally shows a scrollable subset of the wider graph; this does not close the broader theme and narrow-viewport review under P-60/P-56.

## P-65 Research and Energy identity follow-up (8 October 2026)

The `@p65-identity` Chrome check visits Research, Tech Tree, Energy Summary, Batteries, and Power at 1280px and 390px. For each page it asserts exactly one visible title with the expected page name, one visible artwork row with its intended emblem, a consistent large-title size across the five pages at that width, and no document-level horizontal overflow. The focused no-update run passed 1/1 in 8.0 seconds. I also reviewed ten diagnostic captures, one per page and viewport; the title and artwork treatment remained consistent, with no visual defect identified in this slice. Broader theme and locale review remains open.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- --workers=1 --trace=off tests/e2e/economy/presentation-layout.spec.ts -g "P-65 Research and Energy panes keep one heading"
```

## Hydrogen hero and Fusion layout review (5 October 2026)

The `economy-fresh-hydrogen-compressor.png` and `economy-hydrogen-fusion-open.png` baselines were refreshed and visually reviewed at 1280px in Terminal. Sell controls sit without a separate card border inside the Hydrogen hero; the unlocked Fusion controls remain visible as a full-width section below Sell with a fine separator and no disclosure toggle. Hydrogen storage is the first full-width panel below the hero. The compressor screenshot shows no inline purchase-complete message. Both focused Chrome journeys passed 1/1 during snapshot refresh and again without snapshot updates; the active-Fusion journey also asserts the panel geometry and absence of a collapse control.

## P-56 six-locale Compound phone checks (8 October 2026)

The existing six-locale economy journey still checks localized headings and heroes for every material Resource and all six Compound child pages at its desktop viewport. After moving to 390×844, it now selects each Compound child in each locale and asserts that the matching tab is selected, that its pane, localized heading, and Hydrogen-style hero are visible, and that the document does not scroll wider than 390px. This adds 36 child-page/locale checks and does not add mobile screenshot baselines. Detailed Diesel recipe/action checks and the per-locale Compound screenshots remain Diesel-only.

The no-update focused run first stopped at the existing `economy-scientific-notation.png` screenshot assertion: the baseline was 1280×1422 while the current full-page screenshot was 1280×1389 after the status-header layout change. The focused snapshot-refresh command regenerated the existing desktop screenshot checkpoints. I reviewed all six refreshed Diesel Compound locale screenshots; long translated Run Time labels are still truncated in some locales at 1280px and remain a P-56/P-59 issue.

The snapshot-refresh run did not emit a final Playwright pass/fail summary before it was interrupted; the subsequent clean no-update Chrome rerun below supersedes that incomplete attempt. The Hydrogen and Diesel heading locators were narrowed to the source-matched page headings after the run exposed ambiguity in the older broad selectors.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts -g "notation and language controls update live economy and technology readouts" --reporter=line --workers=1 --retries=0 --trace=off
```

Clean no-update Chrome result (8 October 2026): the command above exited 0 with `1 passed (1.6m)`. It selected each of the six Compound children in each of the six locales at 390px and verified the selected tab, visible pane, localized heading and hero, and document width no greater than 390px (36 child/locale checks). No mobile screenshots were added. The wider P-56 theme/viewport screenshot review remains open.

## P-56 Hydrogen and Diesel visual matrix (10 October 2026)

`p56-resource-compound-visual-matrix.spec.ts` fills the combined theme/locale/
viewport gap for the shared Resource/Compound layout. It checks the Hydrogen
Resource page and long-copy Diesel Compound page across six locales, nine
themes, and 1280x900/390x844/320x740 (162 locale/theme/viewport combinations,
324 page states). Each state verifies the localized page heading, Hydrogen-
style hero and stock, storage/sale actions, and Diesel recipe/create controls;
it also checks visible content bounds, text fit, and document horizontal
overflow. The Hydrogen Compressor copy column must remain at least 120px wide
at phone widths. Screen-reader-only text is excluded from visual text-fit
measurements.

The first French/Space/320px capture exposed the Hydrogen Compressor card's
third grid column squeezing its title and description into one or two words
per line. The phone breakpoint now removes that unused third track for the
card, leaving a two-column icon/copy layout with controls below. The focused
rerun passed **1/1 in 2.7 minutes** in installed Chrome on port 6208. I reviewed
all six captures: English Terminal desktop, German Light phone, and French
Space 320px for both pages. The updated French Compressor copy has usable line
width; Diesel's recipe, create and sale controls also remain contained. No
Compound layout change was needed.

Captures are in
`test-results-p56-resource-compound-visual-6208/economy-p56-resource-compo-31d85-ompound-visual-presentation-chrome/`:
`p56-resource-hydrogen-en-terminal-1280.png`,
`p56-compound-diesel-en-terminal-1280.png`,
`p56-resource-hydrogen-de-light-390.png`,
`p56-compound-diesel-de-light-390.png`,
`p56-resource-hydrogen-fr-space-320.png`, and
`p56-compound-diesel-fr-space-320.png`.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6208'; npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-resource-compound-visual-6208 tests/e2e/economy/p56-resource-compound-visual-matrix.spec.ts
```

## Hydrogen-matched Resource and Compound spacing follow-up (8 October 2026)

The P-63 browser journey compares heading-to-hero and tab-navigation-to-heading gaps on all eight Resource and six Compound pages at desktop and 390px. The original mobile Compound baseline was stale after the P-59 mobile status row expanded the header; the 390px page height changed from 1,936px to 2,012px while the economy-page spacing remained consistent. Refreshed and reviewed the three Resource/Compound screenshots. The focused no-update Chrome run passed 1/1 in 11.8 seconds with a clean exit when the `dev:test` server ran separately and Playwright reused it.

```powershell
# Terminal 1
npm.cmd run dev:test -- --host 127.0.0.1 --port 4173 --strictPort

# Terminal 2
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts -g "material and compound pages share the Hydrogen layout" --reporter=line --workers=1 --retries=0 --trace=off
```

## P-65/P-66 Energy presentation matrix (8 October 2026)

The `@energy-presentation-matrix` Chrome case visits Energy Summary, Batteries, and Power at 1280px, 390px, and 320px across all nine themes and six locales (486 page/theme/locale/viewport combinations). It checks the page order; localized tab/title agreement; one visible title and lightning artwork row; a shared title scale across the three pages; panel association; viewport bounds for the Energy pane, panel, title, and artwork; and panel/document horizontal overflow. It also checks the source mapping once per run: Energy Summary has no source option, Batteries maps to `option1`, and Power groups `option2`, `option3`, and `option4`. The no-update installed-Chrome run passed 1/1 in 1.5 minutes. This matrix generates no screenshots, so it records responsive bounds and identity assertions rather than broad visual review.

## P-65 Research, Tech Tree, and Philosophy presentation matrix (8 October 2026)

The focused Research matrix now visits Science Buildings, Tech Tree, and the Expansionist Philosophy page at 1280px, 390px, and 320px across all nine themes and six locales (486 page/theme/locale/viewport combinations). The additional Philosophy coverage contributes 324 combinations. The setup follows the established UI journey: build the Space Telescope, complete Star Study, and choose Expansionist. The matrix checks ordered child tabs and source option identities, localized selected-tab labels and page titles, selected main/child state, both directions of panel association, each page's laboratory, technology, or Expansionist artwork, title scale against Hydrogen, and page/panel/artwork/document horizontal bounds. No Resource, Compound, or Energy implementation was changed. The no-update installed-Chrome run passed 1/1 in 2.0 minutes. The matrix adds no screenshots; it verifies rendered identity and bounds rather than full visual appearance.

The sandboxed npm launch returned `spawn EPERM`; for the successful run the test server was started directly with `node ./node_modules/vite/bin/vite.js --mode test --host 127.0.0.1 --port 4173 --strictPort`, then Chrome was launched via Playwright's CLI:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/economy/research-presentation-matrix.spec.ts
```

```powershell
# Terminal 1
npm.cmd run dev:test -- --host 127.0.0.1 --port 4173 --strictPort

# Terminal 2
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:TEMP 'miaplacidus-playwright-browsers'
$env:MIAPLACIDUS_BROWSER_CHANNEL = 'chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO = '1'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/economy/energy-presentation-matrix.spec.ts
```

## P-65 Tech Tree scroll and screenshot follow-up (9 October 2026)

The Tech Tree zoom case now checks that the graph overflows horizontally but not vertically at the default 100% zoom, then confirms vertical overflow and keyboard scrolling on both axes at 160%. The existing dependency-edge screenshot was stale from before the current artwork row and shared title layout; I reviewed the current capture and refreshed only `technology-tree-dependency-edges.png`. The focused installed-Chrome test passed 1/1 in 6.5 seconds. This verifies the scroll-axis behavior for the full-research fixture; broader theme, locale, and narrow-viewport screenshot review remains open under P-56/P-65.

## P-65 Research, Energy, and Tech Tree screenshot refresh (9 October 2026)

The current Energy Summary, Science Buildings, and Tech Tree screenshots now show the separate Energy pages, large shared page headings, and current lightning/laboratory/technology artwork rows. I reviewed all three captures at 1280px in Terminal and cleared the incidental focused weather tooltip before capture. The focused Chrome action journey passed 1/1 during refresh and 1/1 without snapshot updates. The Compound capture was not changed; broader cross-theme and narrow-screen visual review remains open under P-56/P-65. P-66 desktop/phone Energy evidence is recorded below.

## P-65 Research and Energy representative theme screenshots (9 October 2026)

I captured and reviewed Science Buildings, Tech Tree, Energy Summary, Batteries, and Power in three representative uncovered combinations: Supernova/German at 320x740, Galaxy/Portuguese at 1280x900, and Space/French at 320x740 (15 screenshots total). The focused capture run passed 1/1 in installed Chrome in 6.3 seconds. Titles retain Hydrogen's large page-title scale, and each page keeps its laboratory, technology, or lightning artwork row. The narrow French Tech Tree title wraps onto two lines without clipping; the Research and Energy card layouts stack at phone width, and the desktop Portuguese energy cards and labels remain within the page. The screenshots showed no concrete visual defect, so this review required no source change or additional regression. The existing all-theme, all-locale, three-width matrices remain geometry and identity checks, not screenshots; broader visual review remains open under P-56/P-65.

## P-65 Energy Summary and Batteries baseline comparison (9 October 2026)

I reviewed the existing 1280x900 Terminal and 390x844 Light captures for Energy
Summary and Batteries, and compared their heading and content framing with the
signed-off Hydrogen/Compound captures `economy-hydrogen-style-material-layouts.png`,
`economy-hydrogen-style-compound-layouts.png`, and
`economy-hydrogen-style-mobile-compounds.png`. Both Energy page titles appear at
the same large-title scale as the Resource/Compound headings. Each has one
lightning artwork row below the title. Summary's demand, storage, generation
mix, and power-source values stay inside the page; Batteries shows three cards,
each with one Buy/Buy max pair and its own cost/reason copy. On phone, Summary's
mix rows remain inside their panel and the three battery cards stack with their
buttons within the card edges. I saw no duplicate page title or extra copy of
the battery purchase controls, and no visible page-content clipping in these
captures.

The reviewed Energy files are in
`tests/e2e/economy/energy-presentation-matrix.spec.ts-snapshots/`:

- `phase6-energy-summary-terminal-desktop.png`
- `phase6-energy-summary-light-mobile.png`
- `phase6-energy-batteries-terminal-desktop.png`
- `phase6-energy-batteries-light-mobile.png`

This visual sample is English in Terminal desktop and Light phone themes only;
it does not inspect open tooltips/modals or prove hidden scroll bounds. The
broader P-65 theme/locale visual matrix remains open.

## P-65/P-66 Power master-switch visual follow-up (9 October 2026)

The focused `@p66-visual-review` case now captures both Power switch states at
1280px in Terminal and 390px in Dark. It asserts the lightning artwork remains
visible in both states, the full-width switch uses the matching Activate or
Deactivate label, all three station cards remain available, and the duplicate
grid checkbox is absent. I reviewed all four screenshots: the three cards fit
in desktop columns and stack at phone width, with no visible clipping. The
focused installed-Chrome snapshot pass covered all three new Space Mining and
Power visual cases; the final no-update run passed 3/3 in 11.2 seconds.

The durable images are in
`tests/e2e/economy/energy-presentation-matrix.spec.ts-snapshots/`:

- `phase6-energy-power-active-terminal-desktop.png`
- `phase6-energy-power-inactive-terminal-desktop.png`
- `phase6-energy-power-active-dark-mobile.png`
- `phase6-energy-power-inactive-dark-mobile.png`

Run the focused screenshot cases in installed Chrome with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4181'; node ./node_modules/playwright/cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g '@p66-visual-review' tests/e2e/space-telescope/space-mining-presentation.spec.ts tests/e2e/economy/energy-presentation-matrix.spec.ts
```

9 October 2026 P-66 durable Energy review: `energy-presentation-matrix.spec.ts`
now retains clean full-page Energy Summary and Batteries screenshots at 1280x900
Terminal and 390x844 Light. All four captures were reviewed: each page shows
the lightning artwork, the Summary remains legible at phone width, and battery
cards stack without clipping. The existing active/inactive Power screenshots
cover 1280px Terminal and 390px Dark. The focused Energy/Settings visual run
passed 3/3 without snapshot updates. New files are
`tests/e2e/economy/energy-presentation-matrix.spec.ts-snapshots/phase6-energy-{summary,batteries}-{terminal-desktop,light-mobile}.png`.

## P-41 number display inventory and boundary evidence (9 October 2026)

The source-wide display classification is:

- **Game quantities and currency:** quantities, balances, costs, production rates, rewards, and statistic counters route through `src/app/numberFormatting.ts` or `src/app/currencyFormatting.ts`. The active saved notation is passed by the app, economy, interstellar, meta-progression, status, save-preview, and Statistics views. Timers use `src/app/timeFormatting.ts` through the runtime, status bar, Black Hole, Starship, Space Mining, Cosmic Rip, and Meta Journal views.
- **Percentages:** audio and effect volume uses localized percent formatting in `SettingsPane.tsx`; allocation and probability/efficiency percentages are bounded UI values in `EconomyPanes.tsx`, `MetaJournalPane.tsx`, `GalacticCasinoPane.tsx`, `GalacticMarketPane.tsx`, `StarMapPane.tsx`, and `TopStatusBar.tsx`. They do not represent game-scale quantities. The Tech Tree zoom label is a bounded display scale.
- **Storage size:** the Save Manager's app/remaining-data sizes are localized integer KB in `SaveManager.tsx`, not game quantities.
- **Debug FPS:** `DebugTools.tsx` shows diagnostic frames per second to one decimal with `toFixed(1)`; it is not player economy data.
- **Numerical precision rather than display:** `toFixed` in engine/content code rounds simulation telemetry, star distances, and internal comparison values before they are stored or compared; it is not user-facing formatting.
- **Localized message paths:** `metaMessages.ts` and `metaSignalMessages.ts` retain locale-only fallback formatters for direct callers, while the live Market lock, News Ticker, and Meta Journal callers pass the saved notation. Casino message paths now receive the current state for Wheel countdowns and prizes, Higher or Lower awards, and Void Seer antimatter. Their unit-level locale/notation coverage is recorded below. Visible News Ticker and Casino special-prize amount integration is verified; broader message-display visual review remains open.

The `notation-coverage` test-only fixture seeds five active Hydrogen tier-4 autobuyers (a displayed rate above 999/s), a 1,999-day running Run Time, and a 1,999-day lifetime active time. Three focused installed-Chrome cases passed **3/3 in 10.5s**: the Hydrogen rate matches Condensed, Standard, and Scientific; changing notation while the long Run Time is visible preserves clock advancement; and the Statistics resource-stock boundary uses the default Condensed setting and changes to Standard formatting. The Settings Statistics case now also checks the lifetime Time played value across all three notations (1/1 in 7.7s; see its README). The focused number and time formatter unit suites passed **6/6**. These checks add boundary evidence without changing simulation behavior; broad visual review of timer/countdown presentations and currency precision edges remains open.

**9 October 2026 P-41 notation integration and visual follow-up:** the Market-lock countdown and News Ticker prize/AP text receive the saved notation at their live call sites; Meta Journal reuses the same news formatter. Galactic Casino prize labels and notification amounts also receive it. Casino Wheel time-reduction seconds, special-prize quantities, Higher or Lower numeric awards/counts, and Void Seer antimatter format from the active locale and notation. The earlier focused five-file unit run passed **53/53**, covering Market countdown, news/AP text, Casino amounts, and number-formatting edges in Condensed, Standard, and Scientific across all six locales. TypeScript and formatting checks passed this turn. The visible News Ticker prize-amount case passed **1/1** in installed Chrome on port 4210; the visible Casino special-prize 100,000 Research option passed **1/1** on port 4215. The combined P-41 subset across economy, News Ticker, and Galactic Casino passed **5/5** on Chrome port 4217. Economy checks assert a >999/s rate and cash amount in all three notations, exact live Run Time text in all three notations while preserving clock advancement, and the Statistics resource-stock boundary from default Condensed to Standard. The Run Time value and cash value also expose their complete formatted strings through accessible tooltips in all three notations.

The Run Time visual journey now has three reviewed screenshot baselines: `economy.spec.ts-snapshots/p41-runtime-condensed.png`, `economy.spec.ts-snapshots/p41-runtime-standard.png`, and `economy.spec.ts-snapshots/p41-runtime-scientific.png`. The focused no-update screenshot baseline check passed **1/1** in Chrome on port 4214. These captures and tooltip assertions verify the Run Time presentation only; other countdown/timer displays and currency-precision paths still need broad visual review. Exact commands:

```powershell
npm.cmd exec vitest run -- tests/unit/meta-signals.spec.ts tests/unit/action-affordance-selectors.spec.ts tests/unit/casino-event-notifications.spec.ts tests/unit/casino-hilo-void-notifications.spec.ts tests/unit/number-formatting.spec.ts
npm.cmd run typecheck
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4210'; node ./node_modules/playwright/cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'P-41 ticker prize amounts' tests/e2e/news-ticker/news-ticker.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4215'; node ./node_modules/playwright/cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'P-41 Casino special-prize quantities' tests/e2e/galactic-casino/galactic-casino.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4214'; node ./node_modules/playwright/cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'P-41 keeps the long Run Time timer' tests/e2e/economy/economy.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4217'; node ./node_modules/playwright/cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'P-41' tests/e2e/economy/economy.spec.ts tests/e2e/news-ticker/news-ticker.spec.ts tests/e2e/galactic-casino/galactic-casino.spec.ts
```

P-41 remains open for broader visual review of other timer/countdown and currency-precision paths. The visible News Ticker prize and Casino special-prize amounts, plus Run Time and cash tooltip values, are verified across all three notations. The source-wide audit classifies bounded percentages, Save Manager KB, debug FPS and internal numeric precision separately from game quantities.

**P-41 live timer and currency precision follow-up (9 October 2026):**
`p41-timer-presentation.spec.ts` adds a real outbound Space Mining Rocket journey.
It reads the active timer's remaining milliseconds and checks the visible
countdown against `formatDuration` after selecting Condensed, Standard, and
Scientific. The focused installed-Chrome run passed **1/1** while generating
the three durable captures; the no-update rerun passed **1/1**. I reviewed all
three images: the Rocket card and countdown remain visible, with `1m 15s` in
Condensed/Standard and `1E0m 2E1s` in Scientific. The time formatter applies
the selected notation to each duration component. The focused
`number-formatting.spec.ts` unit run passed **5/5**, including the
`$6.6000000000000005` floating-tail boundary for all six locales and all three
notations. The existing economy cash journey also checks the formatted cash
balance and accessible tooltip in all three notations. A source scan found no
game cash display bypass: the balance, sale preview/notice, economy costs,
Cosmic Rip costs, save preview, and Statistics cash value use the shared
currency formatter; Casino Points use the shared number formatter. The only
visible-app `toFixed` matches are Debug Tools FPS readings, not game currency.
The earlier Standard desktop capture showed the top-status Cash tile
ellipsizing the large balance, while its accessible tooltip retained the
complete formatted value. The Cash tile now keeps the owner's same 50% flex
basis and growth as Run Time, with a 142px desktop minimum and 12.48px value
size so the full Standard amount fits. Phone sizing and tooltip placement remain
unchanged. A focused P-51 browser case checks the exact live Standard amount in
Terminal and Light at 1280px, retains its tooltip, checks the one-row layout,
and keeps the 390px tooltip in view without document overflow. This closes the
specific top-status Cash clipping finding; the broader P-51 review remains
open. See the [status-bar browser evidence](../status-bar/README.md#p-51-standard-cash-visibility-9-october-2026).
The reviewed 1280px captures measure Run Time at 102.6/103.0px, Cash at 142px,
Event at 307.9/309.1px, RP at 123.2/123.6px, GP at 22.9/24.5px, and AP at
22.9/24.2px (Terminal/Light). All cards remain on one row; Cash and Event text
are fully visible, and the status-bar README links both captures. The focused
P-51 case passed 1/1 after snapshot generation and again without updates.

The large Rocket artwork has inconsistent full-page capture output. In the
focused installed-Chrome route after waiting 250ms for the SVG to settle, its
DOM stayed unchanged before and after the element and full-page captures in all
three notations: row 1200×145.594px (`display:grid`), SVG 224×126px
(`display:block`, `visibility:visible`, `opacity:1`, `fill:none`, `stroke:none`,
viewBox `0 0 320 180`), and three nonzero paths with bounds 53.287×72.800px,
86.800×39.900px, and 12.600×16.100px. The first two paths have dark fills and
white strokes; the third has no fill and a white stroke. The fresh diagnostic element crops and
full-page captures all visibly show the Rocket in Condensed, Standard, and
Scientific. The separately refreshed durable countdown screenshots show it in
Condensed but appear blank in Standard and Scientific; the small Rocket remains
visible in each journey card. This points to capture inconsistency, not a
notation-driven disappearance. I made no production art change. After the
earlier header-related refresh, I did not update these countdown baselines
again. P-41 remains open for wider timer/currency visual review.

The Rocket captures are in
`tests/e2e/economy/p41-timer-presentation.spec.ts-snapshots/`:

- `p41-rocket-countdown-condensed.png`
- `p41-rocket-countdown-standard.png`
- `p41-rocket-countdown-scientific.png`
- `p41-rocket-artwork-condensed.png`
- `p41-rocket-artwork-standard.png`
- `p41-rocket-artwork-scientific.png`

The one-run live-route diagnostics were captured under
`test-results/economy-p41-timer-presenta-b81a8-every-notation-p41-notation-chrome/`:
`p41-live-rocket-art-row-{condensed,standard,scientific}.png` and
`p41-live-rocket-full-page-{condensed,standard,scientific}.png`. The no-update
Chrome run passed 1/1 in 9.6s and logged identical DOM metrics before and after
both captures for each notation.

Focused Chrome commands:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4251'; npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line --update-snapshots=all tests/e2e/economy/p41-timer-presentation.spec.ts
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4277'; npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/economy/p41-timer-presentation.spec.ts
npm.cmd exec vitest run -- tests/unit/number-formatting.spec.ts
npx.cmd oxfmt --check tests/e2e/economy/p41-timer-presentation.spec.ts
```

## P-65 durable Research screenshot review (9 October 2026)

`p65-research-visual-review.spec.ts` adds six checked-in page captures for Science Buildings, Tech Tree, and the Expansionist Philosophy destination. Each destination has a desktop and 390px phone capture, sampled across Terminal, Light, Dark, Galaxy, and Space themes and English, French, German, Portuguese, Spanish, and Italian locales. I reviewed all six images: the laboratory, technology, and Expansionist artwork rows match their titles; the 390px cards stack without page-level clipping; and the Tech Tree graph stays inside its horizontally scrollable viewport. The fixture disables notifications before its setup journey so achievements and build notices cannot perturb the screenshots. The Tech Tree's localized pan instruction appears directly above its viewport; adding it increases the German desktop page capture by 24px, with no overlap or page-width overflow. The screenshot baseline was refreshed after visual review. The focused installed-Chrome snapshot run passed 1/1, followed by a clean no-update run at 1/1. The final paired no-update Research/Black Hole Chrome run passed 2/2; the Galactic child/Cosmic Rip identity checks passed 2/2. I also reviewed the existing Energy Summary/Batteries captures and both Power switch states from the durable P-66 evidence: Summary remains readable at phone width, the battery cards stack, and all three Power stations fit desktop columns and phone cards with the lightning row retained. Their sample themes/locales are Terminal English desktop, Light English phone, and Dark phone. No presentation defect requiring a source change was found.

Durable Research images are in `tests/e2e/economy/p65-research-visual-review.spec.ts-snapshots/`:

- `p65-research-science-buildings-terminal-en-desktop.png`
- `p65-research-science-buildings-light-fr-phone.png`
- `p65-research-tech-tree-dark-de-desktop.png`
- `p65-research-tech-tree-terminal-pt-phone.png`
- `p65-research-philosophy-galaxy-es-desktop.png`
- `p65-research-philosophy-space-it-phone.png`

The broader Research identity matrix remains the all-theme/all-locale/three-width assertion-only check documented above; this screenshot sample adds visual review rather than replacing that matrix.

## P-65 Research and Tech Tree screenshot review (9 October 2026)

I inspected the existing Science Buildings and Tech Tree screenshots at
1280x900 desktop and 390x844 phone widths. Research/Recherche and
Technologiebaum/Árvore tecnológica use the same large page-title scale as the
Hydrogen/Compound baseline captures. The laboratory and technology emblems each
appear once in a centered framed artwork row. Science Building cards stack on
phone; long French card titles wrap, and the visible card buttons remain inside
their cards.

The Tech Tree screenshots show the bordered graph viewport inside the page
bounds. Desktop and phone both expose the minus, zoom slider, plus, and reset
controls. At the saved 100% view, only part of the graph is in the viewport;
some nodes are visibly cut at its right edge. The localized instruction above
the viewport now tells players to scroll horizontally and use arrow/Page Up/Page
Down keys; the P-65 Research screenshots confirm that it remains readable at
390px. Focused zoom/keyboard-pan coverage also verifies horizontal scrolling at
100% and both-axis scrolling at 160%; graph cropping is internal, not document
overflow. The earlier screenshots without that cue are superseded by the
refreshed six-image set above.

The reviewed files are in
`tests/e2e/economy/p65-research-visual-review.spec.ts-snapshots/`:

- `p65-research-science-buildings-terminal-en-desktop.png`
- `p65-research-science-buildings-light-fr-phone.png`
- `p65-research-tech-tree-dark-de-desktop.png`
- `p65-research-tech-tree-terminal-pt-phone.png`

The sample covers English/Terminal, French/Light, German/Dark, and
Portuguese/Terminal at one desktop and one phone width. It does not establish
the graph's live pan behavior or the broader P-65 theme/locale visual matrix.

## P-51/E-57 Resource and Compound phone review (9 October 2026)

`p51-e57-economy-phone-locale.spec.ts` reviews all eight Resource pages and six
Compound pages at 320x740 in English, Spanish, Portuguese, German, Italian, and
French (84 page/locale combinations). It checks each selected tab and localized
heading; the hero, sale, storage and create controls; sale and creation preview
changes; all expanded Autobuyer tiers; the Resource allocation group; relevant
control/card bounds; and document width. It also buys a different Resource and
Compound storage upgrade in each locale and confirms the displayed next cost
changes. The French Concrete cost check uses the existing test gateway to seed
the required stock after the screenshot review.

Resource and Compound pages render economy guidance inline; they have no
page-scoped tooltip or modal for these controls. The checks confirm no such
surface appears and verify Water's localized dual Water/Concrete storage cost
and `aria-describedby` disabled reason in a 320px shortfall state across all six
locales. The existing status-bar README covers the separate top-stat tooltip
phone checks.

I reviewed 12 full-page 320px screenshots (Resource Silicon and Compound
Diesel in each locale). Their action rows, translated sale/create previews,
storage prices, and Autobuyer details fit without clipping. No presentation
defect was found, so this slice changed no app source. The snapshot-refresh run
passed 2/2 in installed Chrome; the final no-update run passed 2/2 in 49.4s.

Durable screenshots are in
`tests/e2e/economy/p51-e57-economy-phone-locale.spec.ts-snapshots/`:

- `p51-e57-resource-silicon-{en,es,pt,de,it,fr}-phone.png`
- `p51-e57-compound-diesel-{en,es,pt,de,it,fr}-phone.png`

The final no-update Chrome command was:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4252'
node ./node_modules/playwright/cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/economy/p51-e57-economy-phone-locale.spec.ts
```

This closes the focused Resource/Compound 320px slice. P-51/E-57's wider
all-screen, tooltip, modal, theme, and locale review remains broader than this
economy-page evidence.

## P-54 E-57 Resource and Compound 390px review (10 October 2026)

The existing deterministic `storage-all` fixture and six-locale assertions now
also run at 390px. For every one of the eight Resource and six Compound pages,
the focused case checks the visible storage quote and purchase control, sale
preview, expanded Autobuyer tier rows and their actions, Compound recipe/create
row and changing preview, selected child, and all measured content bounds. The
Water dual-input storage cost and disabled reason are checked separately in all
six locales at 390px. The French 390px Resource Silicon and Compound Diesel
captures were reviewed; the translated values and controls wrap within their
cards. The combined installed-Chrome no-update batch passed **6/6 in 2.1
minutes** on isolated port 4828. This includes the prior 320px cases and the
fuel-pump cases documented in the [Space Mining README](../space-telescope/README.md#p-54-e-57-fuel-pump-quote-at-narrow-widths-10-october-2026).

New six-locale 390px captures are in
`p51-e57-economy-phone-locale.spec.ts-snapshots/`:
`p51-e57-resource-silicon-{en,es,pt,de,it,fr}-390px.png` and
`p51-e57-compound-diesel-{en,es,pt,de,it,fr}-390px.png`.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4828'
node .\node_modules\playwright\cli.js test tests/e2e/economy/p51-e57-economy-phone-locale.spec.ts tests/e2e/space-telescope/e57-fuel-pump-locale-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-e57-phone-costs-4828
```

**P-65 Tech Tree pan cue (9 October 2026):** the Tech Tree now displays
localized instructions for scrolling inside the graph and using keyboard
scrolling, and the viewport references that instruction with
`aria-describedby`. The existing two-axis scroll case now asserts the visible
instruction and accessible relationship. The focused installed-Chrome case
passed 1/1 while refreshing `technology-tree-dependency-edges.png` and 1/1 on
the no-update rerun; I reviewed the updated capture. TypeScript and targeted
formatting passed. Broad visual review remains open under P-56/P-65.

**P-51 German phone screenshot review (9 October 2026):** I inspected the
existing 320px full-page `p51-e57-resource-silicon-de-phone.png` and
`p51-e57-compound-diesel-de-phone.png`. The Resource hero's quantity,
capacity, and production values remain inside the card; gather, sell, fusion,
storage, and Autobuyer controls stay within their panels. On Diesel, the
quantity field and create/sell buttons fit; the recipe inputs, full-storage
reason, and Autobuyer cost/prerequisite copy wrap within the pane. No clipping
or overlapping value/button was visible in these two captured states.

These screenshots do not display an open tooltip or modal, and they cover only
one Resource and one Compound page in German/Terminal at 320px. They therefore
do not establish tooltip/modal layout or the full E-57 all-row, locale, theme,
and viewport review; P-51 remains open. Exact files are in the screenshot
directory above: `p51-e57-resource-silicon-de-phone.png` and
`p51-e57-compound-diesel-de-phone.png`.

## E-57 Research, Energy, and Philosophy phone review (10 October 2026)

`e57-tech-tree-tooltip-locale.spec.ts` adds three focused Chrome cases. Across
English, Spanish, Portuguese, German, Italian, and French at 320px and 390px,
the Tech Tree case opens the Knowledge Sharing tooltip by hover and keyboard
Tab focus, checks localized title and description, and keeps its bounds inside
the scroll viewport. It found the tooltip 358px beyond the right edge at 320px;
a mobile-only Tech Tree tooltip rule now places it below the node and inside
the viewport. Desktop positioning remains unchanged.

The cost-row case checks every Science building price, all 37 standard Tech
Tree node costs, all three Battery prices, and all three Power Plant prices at
both phone widths and all six locales. It verifies card bounds and no
horizontal text overflow. It also buys one Science building, Battery, and
Power Plant and confirms each next-price row changes. Research > Science
Buildings and Tech Tree, Energy > Summary, Batteries, and Power showed no
modal. The separate Philosophy Choice modal appears after the telescope star
study flow; there is no ability-purchase confirmation modal.

The Philosophy case checks the choice dialog and all six path cards in every
locale and phone width, then selects Expansionist and checks the ability and
four repeatable cost rows. It confirms a repeatable purchase changes its next
price and an ability purchase completes without a modal. The German Constructor
card had 8px of horizontal text overflow at 320px; the choice-card summary now
uses `overflow-wrap: anywhere`. The captured German 320px dialog was visually
reviewed after the fix: the long word wraps within the card and all content
stays inside the dialog. The selected Philosophy path also showed no modal.

The focused Chrome run passed **3/3 in 33.6 seconds** after both wrapping
fixes. TypeScript passed. The command was:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4710'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/economy/e57-tech-tree-tooltip-locale.spec.ts
```

After the P-05 44px action-target changes, the existing Resource/Compound full-page
screenshots were stale: every one of the 12 locale captures had changed height.
I refreshed only those changed visual checkpoints and reran the focused suite
without snapshot updates; it passed 2/2 in 47.9 seconds on installed Chrome at
port 4715. All captures remain 320px wide. Silicon heights are EN 3579, ES 3639,
PT 3439, DE 3409, IT 3493, and FR 3493px; Diesel heights are EN 3216, ES 3240,
PT 3070, DE 3081, IT 3055, and FR 3070px. I visually reviewed the full English
Silicon and German Diesel captures, including the hero, gather/create, sale,
storage, and Autobuyer rows. Text and controls stay inside their panels; no
clipping or overlap was found. The 84 Resource/Compound page-locale combinations
remain passing.

## P-06 Hydrogen compressor Buy Max preview (9 October 2026)

The Hydrogen compressor's Buy Max action now displays the selector's affordable
count, total Hydrogen cost, and production increase. When no compressor is
affordable, its disabled reason reports the next cost and current Hydrogen
balance in all six locales. The focused browser case asserts the 150-Hydrogen
plan (two compressors costing 107 total) and the remaining 43-Hydrogen
shortfall for the next 65-Hydrogen compressor. It passed 1/1 in installed Chrome
with and without snapshot updates; I reviewed the refreshed screenshot. The
Buy Max preview/reason now occupy the full description column, and the purchase
buttons have a readable-width column. Laser Mining discounts now use the same
price for the dedicated Hydrogen purchase, generic purchase, Buy Max preview,
and Buy Max command; fractional prices and shortfalls retain two decimal places
when needed. The focused Hydrogen unit file passed 7/7, including the rank-1
discount and discounted bulk command.

Verification command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4294'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'Bulk Purchasing buys the affordable Hydrogen compressors' tests/e2e/economy/economy.spec.ts
```

**P-41 Starship timer notation follow-up (9 October 2026):** the focused
installed-Chrome `@p41-starship-notation` case passed 1/1. It launched a
Starship through the visible map and compared the live travel countdown with
the shared duration formatter in Condensed, Standard, and Scientific. The
combined Rocket/Starship run also executed the existing Rocket screenshot case;
Starship passed, but Rocket failed because its current full-page capture is
1280x1216 while the stored screenshot is 1280x992. The Rocket artwork remained
visible and structurally unchanged before and after capture in the logged
measurements. I did not refresh that screenshot baseline. The Rocket-specific
capture inconsistency remains separate from number formatting.
**P-41 Compound recipe notation follow-up (9 October 2026):** the two
Compound recipe-summary renderers now format input quantities with the
selected notation. The focused installed-Chrome `@p41-compound-recipe` case
passed 1/1; it derives Diesel's active recipe from the game state and compares
the visible input text in Condensed, Standard, and Scientific. This confirms
the recipe summary follows the same display rule as nearby creation previews
without altering recipe calculations.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_AREA='p41-compound-recipe'
npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```
**P-41 Space Mining timer notation follow-up (9 October 2026):** the focused
installed-Chrome `@p41-space-timers` case passed 1/1. It reads the remaining
milliseconds for the Launch Pad weather-change timer and the Telescope survey
countdown, then checks each visible localized timer string against
`formatDuration` in Condensed, Standard, and Scientific. The same fixture keeps
the telescope, Launch Pad, weather timer, and active survey available while
changing notation. Cosmic Rip/Black Hole, top-row, and journal/statistics
durations still need visible review. Fuel ETA and returning-Rocket coverage is
recorded below.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_AREA='p41-space-timers'
npm.cmd run test:e2e:focused -- tests/e2e/economy/p41-timer-presentation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 Rocket fueling and return countdowns (9 October 2026):** focused
installed-Chrome coverage confirms the Rocket fuel ETA and returning journey
countdown follow Condensed, Standard, and Scientific formatting. The fuel test
builds Rocket 1 and starts its pump through the UI; the return test uses the
deterministic returning-Rocket fixture. Both passed (2/2).

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4258'
npm.cmd run test:e2e:focused -- tests/e2e/economy/p41-timer-presentation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'P-41 formats the Rocket fueling ETA|P-41 formats a returning Rocket countdown'
```

Cosmic Rip timers, top-row event/battery/time-warp values, and
journal and other Statistics durations remain to be visibly checked across
notation modes. Black Hole charge and time-warp timer values were separately verified
in the [Black Hole browser README](../black-hole/README.md).

**P-41 Hydrogen sale currency precision (9 October 2026):** a test-only
fixture starts with 330 Hydrogen at its normal sale value of $0.02 each, so the
engine proceeds are the raw JavaScript value `6.6000000000000005`. The visible
sale preview and accepted sale notice both show `$6.60`, without exposing the
binary tail. The focused installed-Chrome case passed 1/1 in 5.0 seconds:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4304'; npm.cmd run test:e2e:focused -- tests/e2e/economy/hydrogen-sale-currency-precision.spec.ts --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 Titanium compound sale notation (9 October 2026):** the focused
installed-Chrome case checks the visible sale preview against the current
`selectGoodSale` proceeds and `formatCurrency` output in Condensed, Standard,
and Scientific. It passed **1/1 in 8.6 seconds** on port 4321; no sale or
economy rule changed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4321'
npm.cmd run test:e2e:focused -- tests/e2e/economy/p41-compound-sale-currency.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 Hydrogen sale preview and accepted notice notation (9 October 2026):**
the deterministic Space Telescope fixture supplies one million Hydrogen, so
the visible Hydrogen sale preview and generic accepted-sale notice exercise a
large payout. The browser journey starts a fresh fixture for each mode, checks
the cash and quantity text in Condensed, Standard, and Scientific, then confirms
the sale settles the Hydrogen stock to zero. Installed Chrome passed 1/1 in
9.5 seconds on port 4323; no sale behavior changed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4323'
npm.cmd run test:e2e:focused -- tests/e2e/economy/p41-hydrogen-sale-notation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 Energy and Research building cash-cost notation (9 October 2026):**
the Battery III and Science Lab purchase cards are checked against the engine's
`buildingCost` in Condensed, Standard, and Scientific notation. Scientific
differs from Standard for both prices. The focused installed-Chrome case passed
1/1 in 9.9 seconds on port 4324; no purchase behavior changed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4324'
npm.cmd run test:e2e:focused -- tests/e2e/economy/p41-building-currency-costs.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 Research, Power, and Battery Buy Max cash notation (9 October 2026):**
the Buy Max previews for Science Lab, Power Plant I, and Battery I are compared
with their selector-derived total cash costs in Condensed, Standard, and
Scientific notation. The run also confirms each Buy Max plan is enabled and
has an affordable count; Scientific differs from Standard for all three
previews. The first run found an ambiguous Energy main-tab locator; scoping it
to the main navigation made the Research, Power, and Battery journeys
unambiguous. The final installed-Chrome run compares the actual rendered
preview text and passed **1/1 in 9.5 seconds** on port 4420.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4420'
node .\node_modules\playwright\cli.js test --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/economy/p41-building-buymax-currency-costs.spec.ts
```

**P-20 power-trip announcement follow-up (9 October 2026):** the Energy Summary's visible `role="alert"` disappears from the accessibility tree when another main tab is selected, so a grid deficit could trip without announcing its completion. `TopStatusBar` now keeps an initially empty localized assertive, atomic alert mounted across pages and fills it when the grid trips. The focused `economy.spec.ts` journey leaves Resources selected, advances the deterministic clock through the deficit grace period, and verifies the alert text plus the `TRIPPED` status; it then returns to Energy and confirms the visible trip alert and recovery flow. Installed Chrome passed 1/1 in 6.3 seconds. The battery-cycle fixture only shows continuous charge/discharge, with no discrete completion event; no announcement was added for those changing quantities.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g 'energy deficit announces a grid trip'
```

**P-20 unaffordable Research and Energy purchases (9 October 2026):** source
and Cosmic Forge comparison found no failed-purchase event to announce: the
purchase controls are disabled before dispatch and expose a linked reason. The
focused Chrome case checks the Science Kit and Power Plant controls' disabled
state, visible `aria-describedby` reason, and accessible description when cash
is insufficient. It passed 1/1 in 7 seconds. Since these actions cannot be
submitted while unaffordable, no cross-tab failure notification route or engine
change is needed. Manual screen-reader behavior remains unverified by this
browser assertion.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g 'unaffordable research and energy purchases expose linked reasons before submission'
```

**P-41 Resource and Compound holding/rate notation (9 October 2026):** the
focused browser case checks every visible Resource and Compound quantity,
capacity, and production rate in Condensed, Standard, and Scientific formats.
Installed Chrome passed 1/1 in 12.6 seconds on port 4467; typecheck passed.
This broadens the holdings/rates slice while the remaining visible price and
reward call-site audit stays open.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4467'
npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'P-41 formats every visible Resource and Compound holding and rate in every notation'
```

**P-41 closing source audit (9 October 2026):** the final source sweep found no
live gameplay quantity, balance, cost, production-rate, reward, statistic, or
timer display bypassing the selected-notation formatters. Direct locale-only
formatting remains limited to bounded percentages and Save Manager KB sizes;
Debug Tools FPS and engine `toFixed` uses are diagnostics/internal precision.
The locale-only fallback callbacks in `metaMessages.ts` and
`metaSignalMessages.ts` are replaced by active-state notation formatters at the
Market, News Ticker, and Meta Journal call sites. Focused integration coverage
now exercises every Resource/Compound quantity, capacity, and production rate
in Condensed, Standard, and Scientific, alongside the previously recorded
visible price/reward, active timer, and Statistics cases. No numeric game rule
or simulation value changed.

## P-13 Research and Energy live context at narrow widths (9 October 2026)

The focused `p13-research-energy-narrow-context.spec.ts` checks the Research
Science Kit price and enabled purchase control at 390px and 320px, then verifies
that spending Cash and advancing the simulation updates both the top RP balance
and the Research page's RP value while Research stays selected. Its Energy case
checks the Battery I price/control, buys one battery, verifies the Cash balance
updates, and confirms the increased capacity on Energy Summary. Both cases
assert the visible balances and action context stay within the viewport without
horizontal page overflow. The six Research/Energy captures were visually
reviewed. Installed Chrome passed snapshot generation **2/2** (within 3/3
cases in 10.4 seconds on port 4527) and the clean no-update rerun **2/2**
(within 3/3 in 9.6 seconds on port 4528); `npm.cmd run typecheck` passed.
Captures are `p13-{research-live-price,energy-battery-price}-{390,320}.png`
beside the spec. The narrow Megastructure stage and Galactic Market trade
contexts are now covered by focused cases in their own area folders.

## P-13 Resource and Compound action context at 320px (9 October 2026)

The existing `p51-e57-economy-phone-locale.spec.ts` checks all eight Resource
and six Compound pages at 320px in all six locales, including visible storage
prices, collect/sell/create controls, changing previews, and card/document
bounds. This dedicated `p13-resource-compound-narrow-context.spec.ts` case
adds the live run context: it asserts current resource/compound quantities and
Cash/RP balances, Hydrogen's storage and sale price, and the collect, sell, and
fusion controls, then performs each action and checks the balances update. It
also verifies Diesel's recipe/create preview, storage price, sale preview, and
create/sell actions against its live stock and Cash balance. All relevant
elements remain within the viewport with no page-level horizontal overflow.

The Hydrogen and Diesel captures were visually reviewed at 320x740; the
Hydrogen fusion controls, quote, and action, plus the Diesel recipe, create and
sale context all fit without clipping. Installed Chrome passed snapshot
generation 1/1 on port 4540 and a clean no-update run 1/1 on port 4541;
`npm.cmd run typecheck` passed. Captures are
`p13-{hydrogen,diesel}-actions-320.png` beside the spec.

Together with the previously recorded narrow Star Map, Black Hole, Casino,
Cosmic Rip, Research/Energy, Starship, Space Mining/Rocket, Galactic Market,
and Megastructure cases, this covers every narrow gameplay context identified
in the current P-13 audit. These action-focused checks do not establish a
full theme/locale visual matrix for every page.

## P-05 Tech Tree zoom action targets (9 October 2026)

The focused installed-Chrome case checks the zoom-out, zoom slider, zoom-in,
and reset controls at 390px. Each target is at least 44px wide and tall. It
also follows the natural keyboard sequence from the range to Zoom out, then
through Zoom and Zoom in to Reset zoom, checking visible keyboard focus and
that Enter changes the zoom value. Touch emulation taps Zoom out,
Zoom in, and Reset zoom and checks the displayed value after each action. The
case passed **1/1 in 6.0 seconds** on port 4594. The first measurement found
39px-tall controls at the mobile font scale; the zoom row now uses explicit
44px minimum dimensions. P-05 remains open for other mechanics action
families.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4594'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/economy/economy.spec.ts --grep '@p05-tech-tree-zoom'
```

## P-05 Resource and Compound mechanics targets (9 October 2026)

The focused `p05-resource-compound-actions.spec.ts` visits all eight Resource
and six Compound pages at 320px and 390px with touch emulation. It measures
every visible mechanics button, select, number input, disclosure summary,
allocation slider, and toggle label and requires a 44×44 CSS-pixel minimum.
Keyboard journeys activate collection, all resource allocation sliders,
compound creation, and automatic-creation toggles. Touch journeys sell from
each page and use storage/autobuyer controls when enabled by the fixture. The
case passed **1/1 in 22.5 seconds** on installed Chrome at port 4630. The first
measurement found sale/storage buttons at 39.2px, tier text buttons at 32px,
selects at 37.6px, fusion number inputs at 20px, details summaries at 15px,
auto toggles at 22px, and allocation handles at 40px. Page-scoped CSS now
gives the Resource and Compound mechanics controls (including the separately
rendered Hydrogen page) a 44px minimum while preserving their existing text
and color styles. The fixture leaves Hydrogen storage unaffordable and some
autobuyer/fusion controls disabled; these are measured but only activated when
enabled. P-05 remains open for Research/Energy, Space, and Meta action families.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4630'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/economy/p05-resource-compound-actions.spec.ts
```

## P-05 Research and Energy mechanics targets (9 October 2026)

The focused `p05-research-energy-actions.spec.ts` measures visible mechanics
targets at 320px and 390px across Research > Science Buildings, Tech Tree,
Philosophy, Energy > Summary, Batteries, and Power. Science/power purchase
buttons, science building toggles, philosophy actions, energy master switch,
and power-building toggles are included. Keyboard coverage activates a Science
building toggle, researches Knowledge Sharing, purchases the Philosophy
ability, toggles the power grid and power plant; touch coverage purchases
Science and Battery/Power Plant actions and operates the power grid. Research
autobuyer is included in target measurements in its locked state. The initial
source/layout audit found 39.2px purchase/master-switch buttons, 32px Research
building text buttons, and 22px building/autobuyer toggle labels. Scoped
Research/Energy page CSS raises those action hit areas to at least 44px without
changing the shared button styles. Installed Chrome passed **1/1 in 9.0
seconds** on port 4643; all measured visible targets met 44×44 CSS pixels.
P-05 remains open for Space and Meta mechanics actions.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4643'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/economy/p05-research-energy-actions.spec.ts
```

## P-08 Power Plant sale route audit (9 October 2026)

Cosmic Forge provides a Sell One action for each plant. `sellBuilding()`
refunds 40% of the current cash price and shows the localized sale notice with
the source defaults: info severity, `default` classification, and 3000ms.
The remake does not currently expose a Power Plant sale action or a sale
command; Energy > Power offers purchase and on/off controls. A focused Chrome
case buys each of the three plant types and verifies there is no Sell control,
so there is no accepted sale result to notify. It passed **1/1 in 6.2 seconds**
on port 4546. Keep the source notice conditional until a sale action is added;
then route the actual refund from that accepted result without changing the
source category. See the [notification route audit](../../../docs/audit/notification-route-audit.md).

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4546'
npm.cmd run test:e2e:focused -- tests/e2e/economy/economy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g '@p08-notifications'
```

## P-20 normal research completion announcement (9 October 2026)

The focused browser route researches Knowledge Sharing through the visible
Tech Tree action and checks the resulting tech notice's text, implicit
`role="status"`, `aria-atomic="true"`, and its polite global notification
container. It passed **1/1** in the two-route installed-Chrome P-20 run on port
4632. These assertions establish DOM/live-region semantics, not audible
screen-reader output.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4632'
node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'announces Cosmic Rip research completion|normal research completion reaches the polite atomic' tests/e2e/cosmic-rip/cosmic-rip.spec.ts tests/e2e/economy/economy.spec.ts
```

## P-54 Energy chart clean rerun (10 October 2026)

The previously recorded Energy chart / post-rebirth Casino focused batch had
passed its assertions but hung during shutdown. The two cases were rerun with
installed Chrome on isolated port 4826. `Energy compares live generator mix
with consumption accessibly` passed 1/1; together with the Casino case the
process completed **2/2 in 8.7 seconds**, exit 0, with clean server/browser
shutdown. This supersedes the older unclean runner status.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4826'
node .\node_modules\playwright\cli.js test tests/e2e/economy/economy.spec.ts tests/e2e/galactic-casino/galactic-casino.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p54-energy-casino-4826 --grep 'Energy compares live generator mix with consumption accessibly|rebirth keeps Casino hidden until this run awards AP while CP stays visible'
```

## P-29 Resource and Compound audio cues (10 October 2026)

The dedicated `audio-cues.spec.ts` uses installed Chrome with a local Audio
mock and deterministic UI fixtures. It checks Hydrogen collect/sell and Diesel
create/sell, then checks Hydrogen storage expansion and autobuyer purchase.
Each accepted action plays exactly one expected cue: generic `clickButton` for
collect/create/autobuyer purchase, `kaching` for either sale, and
`increaseStorage` for storage. The stock, capacity, and autobuyer count change
as expected. The final run passed **3/3 in 9.1 seconds** on port 4934. The
matching source crosswalk and remaining P-29 cue families are in the
[Settings audio README](../settings/README.md).

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_AREA='p29-economy-audio'
$env:MIAPLACIDUS_TEST_PORT='4934'
npm.cmd run test:e2e:focused -- tests/e2e/economy/audio-cues.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-29 power feedback audio evidence (10 October 2026)

The Settings audio route suite now drives the Energy power-deficit fixture until
the visible status becomes `TRIPPED`, then asserts the ordered source pair
`powerOff.mp3`, `powerTripped.mp3`. It also checks exactly one `powerOff.mp3`
for manual deactivation and one `powerOn.mp3` for activation. Installed Chrome
passed both master/plant switch cases **2/2 in 8.4 seconds** on port 4941. The
complete Settings audio route spec passed **4/4 in 12.6 seconds** on port 4942.
The audio dispatch unit test additionally verifies silent battery charging and
discharging while the balance changes; battery transitions have no source cue.
See [Settings audio evidence](../settings/README.md) for the power/weather
crosswalk and command.

## P-45 startup and early-economy copy (10 October 2026)

The focused `p45-early-economy-locales.spec.ts` uses the existing
`storage-all` fixture to compare visible Hydrogen labels, the Diesel Compound
recipe/input names and create label, Science Kit, Tech Tree, and Knowledge
Sharing names against the active six-locale catalogues. It also follows the
existing `water-storage-short` fixture and checks the exact localized disabled
storage reason and the named Concrete shortfall in each locale. A separate
`research` fixture drives the first Knowledge Sharing completion and checks
the resulting notification text in all six locales. The startup picker route
in the [Save Slots README](../save-slots/README.md) verifies localized
new/resume labels and duplicate-name validation.

The isolated installed-Chrome run passed **4/4 in 21.6 seconds** on port 4975.
No untranslated or placeholder copy was found in the checked startup,
Hydrogen, Diesel, Science Kit, Tech Tree, disabled Water-storage, or first
research-notification surfaces. This slice does not close P-45: later Energy,
Space Mining, Interstellar, Galactic/meta, Settings/Events/Statistics, and
Miaplaedia route copy still needs a full six-locale startup-to-ending audit.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4975'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/save-slots/p50-start-picker-date-locale.spec.ts tests/e2e/economy/p45-early-economy-locales.spec.ts --grep '@p45-'
```

## P-45 Energy route copy (10 October 2026)

The existing E-57 Research/Energy review in
`e57-tech-tree-tooltip-locale.spec.ts` checks Science, Tech Tree, Battery, and
Power prices at 320px and 390px in `en`, `es`, `pt`, `de`, `it`, and `fr`,
including changed next prices after purchases. It confirms these Research and
Energy pages have no modal path; Philosophy is the separate dialog path. The
new `p45-energy-locales.spec.ts` fills the Energy-copy gap: it verifies the
linked insufficient-Cash reason after Buy Max exhausts the budget in all six
locales and both phone widths, then triggers a grid trip in each locale and
checks the global announcement and Energy Summary alert when returning to that
page. No Energy translation defect was found.

The combined Energy, Space, and Interstellar result cases passed **4/4 in 1.1
minutes** in installed Chrome on port 5072. P-45 Energy can be rerun with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5072'
node .\node_modules\playwright\cli.js test tests/e2e/economy/p45-energy-locales.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-route-locales-5072
```

## P-45 Research and Energy visible action/status copy (10 October 2026)

`p45-research-energy-copy.spec.ts` adds six-locale assertions for the visible
Research and Energy action/status rows that were not covered by the existing
locale and presentation checks. With the `research` fixture it checks Science
Kit naming, Buy and Pause/Resume actions, the linked insufficient-Cash reason,
Research Autobuyer, and Knowledge Sharing's Ready-to-Researched status and
accessible action label. With `bulk-energy`, it checks the Energy Summary
heading, generation/consumption/storage labels and chart labels; the Power
grid's deactivate/activate action and localized grid-off status; Power Plant
and Battery I actions, Pause/Resume state, and linked insufficient-Cash
reasons. The Research path also checks the successful visible Science Kit
purchase in each locale: the displayed price matches the engine cost, the
Owned count rises by one, Cash falls by exactly that price, and the rendered
RP rate matches the post-purchase simulation state before the existing
insufficient-Cash check. All expected strings come from the typed six-locale
catalogues and source mappings. No missing or incorrect fallback was found,
so app copy was unchanged.

The latest installed-Chrome run passed **2/2 in 22.0 seconds** on port 5398.
TypeScript typecheck and the focused Oxfmt check passed. Rerun the focused
locale coverage with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5398'
npm.cmd run test:e2e:focused -- tests/e2e/economy/p45-research-energy-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results/p45-research-energy-copy-5398
```

## P-51 Research and Energy phone visual sample (10 October 2026)

`p51-research-energy-narrow-visual.spec.ts` checks Science Kit and Battery I
cards with live Cash/RP balances at 320px and 390px in French Terminal and
French Light. At every combination it opens the RP production tooltip and
checks its bounds, plus the card, localized cost row, purchase action, and page
fit. It then buys one Science Kit and one Battery I and confirms each next
price updates. Installed Chrome passed **1/1 in the two-spec 9.3-second run**
on port 5056. `p51-research-fr-320-terminal.png`,
`p51-research-fr-390-light.png`, `p51-energy-fr-320-terminal.png`, and
`p51-energy-fr-390-light.png` were reviewed: long French labels and cost
previews wrap within their cards; no clipping, cropping, or horizontal page
overflow appeared. These pages do not have a modal route; the RP tooltip is
the page-family overlay checked here. No app-code fix was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5056'
node .\node_modules\playwright\cli.js test tests/e2e/space-telescope/p51-space-mining-visual.spec.ts tests/e2e/economy/p51-research-energy-narrow-visual.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p51-space-research-visual
```

## P-44 Research and Energy source tooltip crosswalk (10 October 2026)

The Cosmic Forge tooltip registry contains 21 distinct `infoTooltip*` keys in
each of `en`, `es`, `pt`, `de`, `it`, and `fr`. None belongs to Science
Buildings, Tech Tree, Energy Summary, Batteries, or Power, and the source does
not render an info control on those pages. The target has no exact source
tooltip copy to wire for those five surfaces.

The only Research-route key is `infoTooltipPhilosophyHeader`. Its source help
appears beside the Philosophy title; the remake has no matching info icon and
places the information in the localized Philosophy page, ability and
repeatable-upgrade content. This is an intentional content-placement
adaptation. `infoTooltipAutoCreateAllocation` applies to Resource/Compound
allocation and is outside this slice.

The nine nearby source `headerDesc*` keys (`Research`, `ResearchUpgrades`,
`Technology`, `TechTree`, `Energy`, `EnergyStorage`, `PowerPlant`,
`AdvancedPowerPlant`, and `SolarPowerPlant`) exist in all six locales, but are
section-description straps rather than tooltips. The remake splits Research
into Science Buildings and Tech Tree, and Energy into Energy Summary, Batteries
and Power. Research's live RP/rate, Science Building cards, node details,
Energy Summary chart and generator/battery cards carry the useful context;
the source's short straps are not copied as subtitles. The Tech Tree pan help
is a target-specific keyboard/scroll instruction, not a translation of
`headerDescTechTree`.

Current target-native browser checks remain the relevant evidence: the Tech
Tree node tooltip and Research/Energy phone text paths in
`e57-tech-tree-tooltip-locale.spec.ts`, and the Research Points production
tooltip in `../status-bar/status-bar.spec.ts`. Those checks verify
localized remake behavior, not source tooltip parity. The new
`p44-research-philosophy-help.spec.ts` case checks the adapted Philosophy
summary, ability and repeatable-upgrade content in all six locales at 320px;
installed Chrome passed **1/1 in 6.5 seconds** on port 5349. No source-tooltip
browser assertion was added for the five named pages because they have no
source tooltip key or matching info control. P-44 remains open for its other
source families.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5349'
node .\node_modules\playwright\cli.js test tests/e2e/economy/p44-research-philosophy-help.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p44-research-energy-help
```

## P-55 Energy Times Tripped Statistics row (10 October 2026)

Cosmic Forge increments the current-run and All Time counters once when the
grid automatically transitions from on to off. Recovery does not count, and
a later trip increments again; rebirth resets only the run count. Both values
are saved and restored. MIAPLACIDUS uses the same false-to-tripped boundary
and scopes. The focused deterministic journey verified trip, continued trip,
recovery, retrip, portable save/load, and rebirth; a six-locale Statistics
display assertion checks the run/lifetime values. The four focused unit cases
passed **4/4**. No source mismatch or runtime change was found. See the
[Statistics parity evidence](../../docs/plans/statistics-presentation-parity.md#p-55-energy-times-tripped-source-comparison-10-october-2026).

## P-44 Auto-creation allocation help (10 October 2026)

The source's `infoTooltipAutoCreateAllocation` help sits beside the automatic
compound-creation setting. MIAPLACIDUS now explains that each ingredient's
compound share is split evenly among the compounds with automatic creation
enabled. The help is shown beside the setting in both legacy and current
Compound views, is included in the checkbox description, and is localized in
all six languages. The separate Resource allocation slider help remains
unchanged and continues to describe its drag and keyboard controls.

`p44-auto-create-allocation-help.spec.ts` checked the rendered Compound helper
and unchanged Resource allocation help through all six locales at 320px,
including the description association and page-width bound. Installed Chrome
passed **1/1 in 9.7 seconds** on isolated port 5381. Typecheck and the focused
localization validator passed; the validator passed **4/4**, and formatting
passed for the four changed code/test files. The source crosswalk and original
gap are in the [P-44 handoff](../../../docs/plans/build-checklist/phase-6-handoff-2026-10-07.md#p-44-remaining-cosmic-forge-infotooltip-inventory-10-october-2026).

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5381'
node .\node_modules\playwright\cli.js test tests/e2e/economy/p44-auto-create-allocation-help.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p44-auto-create-help-5381
```

## P-45 Resource and Compound visible copy (10 October 2026)

The existing early-economy locale checks covered Hydrogen and Diesel labels and
the Water storage shortfall, while the P-51 phone review visited all eight
Resources and six Compounds in each locale but did not assert most rendered
action/status strings. `p45-resource-compound-copy.spec.ts` fills that gap using
the documented `storage-all` fixture. For `en`, `es`, `pt`, `de`, `it`, and
`fr`, it checks all Resource and Compound tab names, page headings, Resource
quantity/capacity/production labels, collection and storage actions, sale
controls and preview labels, compound recipe inputs, creation previews, amount
labels, autobuyer controls, and the per-locale Hydrogen sale notification. It
fills each Resource to capacity and verifies the disabled collection reason;
the existing `p45-early-economy-locales.spec.ts` continues to verify the
insufficient-Concrete Water storage reason in all six locales. No product-copy
defect was found and no app copy was changed.

Installed Chrome passed **1/1 in 26.4 seconds** on port 5118. Typecheck and the
focused Oxfmt check passed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5118'
node .\node_modules\playwright\cli.js test tests/e2e/economy/p45-resource-compound-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-resource-compound-copy-5118
```

An independent no-update installed-Chrome rerun passed **1/1 in 25.8 seconds**
on port 5180:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='5180'
npm.cmd run test:e2e:focused -- tests/e2e/economy/p45-resource-compound-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-resource-compound-copy-5180
```

### P-45 Compound creation result feedback (10 October 2026)

The visible-copy case checked the Compound creation control and recipe preview
but did not submit a create action; existing P-08 browser coverage verified the
success notice only in English. The new `@p45-compound-result` case uses the
`full` fixture, disables Diesel auto-creation, and creates one Diesel through
the visible control in each of the six locales. It checks the localized
success notice including compound and ingredient names, its `create`
classification, and the resulting output/input balance changes. Installed
Chrome passed **1/1 in 21.7 seconds** on isolated port 5389. No application
copy change was needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5389'; npm.cmd run test:e2e:focused -- tests/e2e/economy/p45-resource-compound-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-compound-result-5389 -g "Compound creation success feedback"
```

### P-45 manual Hydrogen collection result (10 October 2026)

The new `@p45-hydrogen-collection-result` case uses `bulk-hydrogen`, which
starts at 150 Hydrogen with storage available. In every locale it clicks the
visible Collect Hydrogen control, verifies the displayed stock increments by
one, and confirms the production rate remains unchanged. Successful manual
collection has no notification path; the visible stock amount is its result.
This checks a successful below-cap collection separately from the existing
full-storage disabled-reason case. Installed Chrome passed **1/1 in 7.3
seconds** on isolated port 5391.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5391'; npm.cmd run test:e2e:focused -- tests/e2e/economy/p45-resource-compound-copy.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p45-hydrogen-collection-5391 -g "manual Hydrogen collection updates"
```

### P-45 Hydrogen storage purchase result (10 October 2026)

The six-locale case starts each isolated browser context with the shared
`Hydrogen Pioneer` fresh-save fixture, selects the Hydrogen route, and uses the
existing deterministic storage-ready test scenario. It clicks the visible
localized storage button, then checks the displayed quote and exact state
delta: 149 Hydrogen is consumed and capacity increases from 150 to 300. The
pioneer identity, active local save-slot ID, and selected route are checked
before purchase; the same pioneer and slot identities and selected route are
checked afterward. The final installed-Chrome run passed **6/6 in 14.3
seconds** on isolated port 5397. Setup uses the existing test scenario hook;
the upgrade itself goes through the normal visible localized control.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5397'; npm.cmd run test:e2e:focused -- tests/e2e/economy/p45-hydrogen-storage-result.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results/p45-hydrogen-storage-5397
```
