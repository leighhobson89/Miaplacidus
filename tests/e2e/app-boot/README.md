# App boot and navigation: Hydrogen slice

## Rule matrix

| Rule                     | Normal path                                                                                                                                                                                              | Failure/boundary path                                                                      | Evidence                                            |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Fresh run identity       | Enter a pioneer name and locale, press Start, and reach the Hydrogen pane directly with $10, 50 RP, 0/150 Hydrogen and Hydrogen as the only unlocked resource. Miaplaedia has no briefing replay button. | Blank names are blocked by the required input. Locked main gameplay tabs are absent.       | `hydrogen-boot.spec.ts`, unit initialization check. |
| Stable navigation        | Keep visible tabs in source order; Settings and Miaplaedia stay last, and arrow keys move only among visible tabs.                                                                                       | Locked destinations have no top-level tab or placeholder.                                  | `hydrogen-boot.spec.ts`.                            |
| First save-ready state   | Start creates the first safe local checkpoint and exposes stable language-independent engine state. The save status is visible.                                                                          | No slot is read or created before the confirmed name reaches Start.                        | Fresh-run state assertions; M-02 save-slot tests.   |
| Locale and mobile layout | Switch through all six Hydrogen translations; the document language follows. At 390px, the long German labels and collect control remain usable with no document-level horizontal overflow.              | Shared fixture fails on page/console errors or any request outside the local app origin.   | `hydrogen-boot.spec.ts`, shared fixture.            |
| Startup rendering        | The welcome form and first Hydrogen pane render as visible, non-white screens and match screenshot baselines; a new save opens directly into play.                                                       | A server that cannot compile TypeScript shows launch instructions instead of a blank page. | `hydrogen-boot.spec.ts`, committed screenshots.     |

## Deterministic setup and debug commands

The shared fixture clears local/session storage, uses seed `314159` and English, enters `Hydrogen Pioneer`, and starts through the real form. The explicit Spanish first-run test uses seed `90210` and verifies the first Hydrogen screen and the removed Miaplaedia replay control. The Cosmic Forge scenario menu opens with NumpadSubtract (`-`); the Test Lab keeps its separate dialog on NumpadAdd (`+`). Scenario controls are documented in the [debug menu area](../debug-menu/README.md), [autobuyer](../autobuyers/README.md), and [resource](../resources/README.md) READMEs.

Run with `npm run test:e2e:focused -- tests/e2e/app-boot/hydrogen-boot.spec.ts`. Add `MIAPLACIDUS_BROWSER_CHANNEL=chrome` when using an installed Chrome instead of Playwright's bundled browser.

## Observed result

2 October 2026: 5/5 app-boot tests passed in Chrome. The startup, first-run, collected Hydrogen and legacy locked-Energy screens have checked-in historical screenshot baselines; the locked-Energy image predates the current rule that omits unavailable main tabs. The failure-path test confirms an uncompiled/static entry shows Vite instructions instead of a white screen. The current `@ui-navigation` assertions supersede that legacy locked-tab behavior. See the [M-01 record](../../../docs/archive/plans/2026-10-02-hydrogen-vertical-slice.md) and [M-02 record](../../../docs/archive/plans/2026-10-02-local-saves.md).

4 October 2026: the focused `@ui-navigation` area passed 4/4 cases in installed Chrome 154. The fresh-run checks confirmed the filtered sequence `Resources`, `Research`, `Settings`, `Miaplaedia`, absence of the Energy tab, keyboard movement through that visible order, Galactic Casino under Galactic, and Rocket 1 appearing without Rocket 2–4 after Rocket 1 is built. The startup and Hydrogen screenshots were regenerated for the current Terminal theme and startup art after visual comparison.

4 October 2026: the focused `@progression` Chrome case passed 1/1. It opened each visible tab from a technology-unlocked fixture and a later Galactic/Cosmic Rip fixture, checking that missing tabs do not change the relative source order. Both states have checked-in screenshots.

5 October 2026: the focused `navigation-progression.spec.ts` Chrome case passed 1/1 after refreshing its screenshots for the current shell. It checked every visible main tab in technology and meta unlock states, confirmed Space Mining opens on Launch Pad when available, selected Telescope when Launch Pad remained locked, and confirmed Rocket 1–4 child panes remain hidden before construction. The current Miaplaedia screenshot has no opening briefing replay control.

5 October responsive follow-up: all visible tabs in both progression fixtures passed document-width assertions at 390px, including Galactic Casino and Cosmic Rip child pages.

5 October keyboard follow-up: the focused Chrome case passed 1/1 with a full progression fixture. It verified End and ArrowRight wraparound across main tabs, ArrowRight and End across the eight Resources children, and that focus stays on the selected destination. The checked-in `navigation-keyboard-resource-children` screenshot records the selected Iron page. Save management now stays inline in Settings → Saving and Loading, so no modal opener or Escape-to-close behavior is expected.

5 October source destination identity follow-up: the `navigation-progression.spec.ts` area now also checks Compounds' rendered child pages and their `data-source-option-id` values against Cosmic Forge: Diesel/1, Water/5, Glass/2, Concrete/4, Steel/3, Titanium/6, grouped as Liquids then Solids. The full focused navigation-progression file passed 3/3 in Chrome; its screenshots were refreshed after removing the duplicate Resources rail heading.

5 October tab ownership follow-up: source side menus are scoped to their parent tab. The Chrome progression route now confirms the Resources stock rail is visible only on Resources across every visible tab in technology and meta unlock fixtures; other content uses the full content width. The refreshed progression screenshots were visually reviewed.

5 October Hydrogen pane cleanup: first-run and six-locale browser checks assert the Hydrogen page has no redundant `Resources` heading or `Hydrogen starts unlocked` intro beneath its dedicated overview. Its Spanish screenshot baseline is refreshed from the current live pane.

The `single-save-navigation-route.spec.ts` journey extends that early progression on one local pioneer: it starts a fresh run through the name form, collects Hydrogen, buys a Science Kit, researches Knowledge Sharing, saves and resumes the same slot, then applies the test-only late-game navigation checkpoint to that active save. It saves and resumes the same slot again before using keyboard navigation and actions through Interstellar, Galactic (with Casino third in its child order), and Cosmic Rip. The checkpoint is deterministic navigation integration coverage; it does not claim natural late-game progression, which remains covered by the focused gameplay areas.

**Immediate-DOM diagnostic and regression check (8 October 2026):** the Cosmic Rip tab's rect was `{x:971.5,y:-174.7,width:135.8,height:63}`, outside the viewport, so center-point hit testing returned no element; `elementsFromPoint` was empty and no overlay or pointer-events blocker was present. A synchronous `aria-selected` read immediately after click observed the prior Galactic Casino selection because React had not committed yet; the awaited selected-state assertion then passed. The follow-up route now uses keyboard traversal from selected Galactic to Cosmic Rip. Its clean installed-Chrome run passed 1/1 in 47.3 seconds (exit 0), with no snapshot updates; Chrome exited cleanly and port 4173 closed. The focused journey needs its 60-second test timeout. This did not reproduce a navigation blocker. It ran after the Hilo code change but does not exercise Hilo-specific behavior. This individual journey is a seeded late-game check and does not establish natural progression; see the fresh natural navigation follow-up below.

**Fresh natural navigation follow-up (8 October 2026):** `natural-navigation-progression.spec.ts` starts from the shared fresh-save form and uses only visible Science Kit, Hydrogen collection/compressor/storage/sale, Knowledge Sharing, and Science Club controls plus the injected test clock. It reaches Basic Power Generation without an economy fixture or debug action. The Chrome journey passed 1/1 in 16.0 seconds (exit 0). It verifies the initial filtered tab sequence, absence of locked Energy/Compounds/later panes, Energy's insertion between Research and Settings after unlock, the Energy child source order (Summary, Batteries/option1, Power/options2–4), and the selected Summary tab's ARIA association to the Energy panel. Port 4173 was closed after the run. The 9 October continuation below adds natural Interstellar unlock; Galactic/Casino and Cosmic Rip progression remain open under P-10.

Focused command: `$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; npm.cmd run test:e2e:focused -- tests/e2e/app-boot/natural-navigation-progression.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line`.

**P-10 natural Interstellar unlock follow-up (9 October 2026):** the fresh-save path continues beyond Energy by researching Stellar Cartography through the visible Tech Tree, then verifies that Interstellar appears in source order while still-locked Compounds, Space Mining, Galactic, and Cosmic Rip stay hidden. It opens Interstellar's visible Star Map child and checks its selected tab/panel association. This remains an ordinary fresh run using visible controls and the injected test clock; it uses no economy fixture or debug action. The focused installed-Chrome natural-navigation journey passed 1/1 in 14.6 seconds with a clean exit. P-10 stays open for natural progression into Galactic/Casino and Cosmic Rip.

**P-10 natural Galactic/Casino gate audit (9 October 2026):** the fresh route still stops at Star Map before any new system is visited or settled, so no first Starship arrival has occurred (`rebirthCount=0`, and the only settled system is the current start system). That is the current progression boundary: Cosmic Forge and the corrected remake reveal Galactic and Casino on first-run Starship arrival, before settlement awards AP. This natural-navigation run still stops at Star Map, so the locked-tab result remains correct. The source has no Star Map, News, Settings, or Galactic Market action that substitutes for the required Starship journey.

**P-12 selected-tab phone visibility (9 October 2026):** the focused progressive-unlock Chrome case selects each of the eight available main tabs at 390px and checks that its tab bounds stay inside the horizontal navigation rail (1px tolerance for fractional-pixel layout), while the page itself remains within 390px. Selecting Miaplaedia also must advance the rail's `scrollLeft`, verifying the previously reported right-edge clipping behavior. The no-update installed-Chrome run passed 1/1 in 13.3 seconds; this confirms selected-tab visibility for the technology-unlock navigation state, not the full cross-theme/locale responsive matrix.

**P-65 selected Miaplaedia rail capture (9 October 2026):** the Chrome case now records a durable 390px full-page checkpoint after Miaplaedia is selected. Its tab label and NEW badge fit inside the scrolled rail, and the document has no horizontal overflow. The focused no-update rerun passed 1/1 in 18.8 seconds. It waits for transient achievement notices to clear before saving navigation screenshots; broader visual coverage remains open.

Focused command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4298'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line -g 'progressive unlock states keep main tabs in source order' tests/e2e/app-boot/navigation-progression.spec.ts
```

The source-grounded natural route from this boundary is a substantial late-game chain, not a one-control unlock: research Nano Tube Technology and Noble Gas Collection to enable Carbon Fusion; continue through Neon/Oxygen/Silicon Fusion and Steel Foundries to unlock Neutron Capture; research Glass Manufacture, Atmospheric Telescopes, Quantum Computing, HydroCarbons, and Advanced Power/Fuels; then Neutron Capture + Nano Tube Technology + Steel Foundries unlock Rocket Composites and the Launch Pad. Build and fuel a rocket, travel to an asteroid and mine Antimatter. Research Planetary Navigation and Orbital Construction, then FTL Travel Theory, Antimatter Engines, Life Support Systems, and Starship Fleets; build the required Structural, Life Support, Antimatter Engine, and Fleet Hangar modules. Launch to a studied destination, scan it, resolve any required encounter, and settle it. First-run Starship arrival reveals Galactic and its Casino child before an AP award; a later settlement awards AP once per run. Casino remains child `option6` between Market (`option2`) and Ascendency Perks (`option3`). Research prerequisites/costs are in [foundation-economy.md](../../../docs/audit/foundation-economy.md), and rocket/starship costs and settlement rules are in [foundation-space.md](../../../docs/audit/foundation-space.md).

This audit did not claim natural Casino reachability: the current natural browser route has not completed the prerequisite research, resource production, rocket antimatter mining, Starship construction, travel, and first-arrival chain. Fixture-based navigation verifies Casino remains its own Galactic child and retains source option identity/order; P-10 still needs a natural late-game journey to verify first-arrival visibility and source ownership. Settlement is a later AP-award step.

**P-10 fresh-save gate rerun (9 October 2026):** after adding explicit Galactic Casino and Cosmic Rip absence/state checks, the focused installed-Chrome run of `natural-navigation-progression.spec.ts` passed 1/1 in 15.1 seconds on port 4311. It begins from the real new-save form and buys/researches through visible controls with only the injected test clock accelerating elapsed time. The journey reaches the visible Star Map before any Starship arrival, then proves there is no settlement/AP award or rebirth, Cosmic Rip is locked, and Galactic, Galactic Casino, and Cosmic Rip navigation entries are absent. The test uses no late-game state fixture or debug action.

The remaining natural Galactic/Casino gate is the full space and first-arrival chain, so this test does not label the tabs reachable from the current short path. Source costs show why: Rocket 1 takes 12 escalating parts and 10,000 antimatter; even the un-escalated material floor across its parts, Launch Pad, and the four mandatory Starship modules is at least 102,000 Glass, 252,000 Steel, 91,100 Titanium, 200,000 Oxygen, 150,000 Water, 160,000 Neon, and 90,000 Silicon. Part prices grow by 1.13 per purchase, before rocket fuel, required technology, and Starship travel. First Starship arrival reveals Galactic and its Casino child; scan and settlement remain necessary for AP and later progression. Cosmic Rip is a later gate: its tab requires `permanent.cosmicRip.unlocked`, which is set by acknowledging the Miaplacidus story (`metaProgression.ts`), after the megastructure story progression. P-10 still needs an ordinary fresh-save journey through first Starship arrival to verify Galactic and its immediately available Casino child against the source page identity; later settlement remains AP and progression coverage. The Cosmic Rip child pages remain gated on the separate story milestone.

The natural-boundary assertions were added after the earlier 9 October run. TypeScript passed with `node.exe node_modules/typescript/bin/tsc --noEmit -p tsconfig.json`. The first focused browser run exposed that the seeded current-system ID is not the same string as the persisted initial-settlement ID, so the regression now compares settled systems with the exact initial saved list rather than assuming they match. The final installed-Chrome run passed 1/1 on port 4227; it confirms the natural journey has no rebirth or current-run AP award and adds no settlement. The first three in-sandbox attempts could not spawn Playwright's configured Vite server (`Error: spawn EPERM`); the final run used the approved elevated process runner.

**P-10 natural progression boundary audit (10 October 2026):** the fresh-save browser route still uses only visible gameplay controls and the injected test clock; it reaches Energy and then Interstellar → Star Map on the same pioneer. The boundary assertion now also confirms Star Map is the only Interstellar child: Star Data has no second system profile, Starship has no Orbital Construction research, and Fleet/Colonise remain unavailable. Rocket Composites, Antimatter mining, an AP award, and a settlement are all absent; Galactic and Casino remain hidden, and the Miaplacidus story is not pending so Cosmic Rip remains locked. The focused installed-Chrome run passed 1/1 in 15.1 seconds on port 4682, with typecheck and formatting passing.

This natural route cannot continue to Galactic/Casino through a navigation-only action: Space Mining first requires Atmospheric Telescopes, the Launch Pad requires Rocket Composites, and the rocket/antimatter/Starship/travel chain is required to reach the first arrival that unlocks both pages. Scanning and settlement remain necessary for the actual current-run AP award and later progression. Cosmic Rip requires a later Miaplacidus homecoming victory and story acknowledgement. Existing fixture-based coverage is the nearest end-to-end evidence for the far side: `single-save-navigation-route.spec.ts` verifies Galactic/Casino/Cosmic Rip page navigation after a test-only late-game checkpoint, while `megastructures.spec.ts` drives the UI through homecoming, settlement, story acknowledgement, and Cosmic Rip using its seeded continuation. Neither is natural progression; no fixture or debug action was added to the natural route. P-10 remains open for full natural late-game progression.

Focused command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4682'; node .\node_modules\playwright\cli.js test tests/e2e/app-boot/natural-navigation-progression.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-66 Interstellar child-panel ownership follow-up (8 October 2026):** the navigation association journey now adds Interstellar using the deterministic `space-starship-scanning` fixture, completes the optional Fleet Hangar through the test scenario action, and reveals Colonise through the visible Starship scan control. It asserts the source child order Star Map, Star Data, Starship, Fleet, Colonise, then checks each selected tab's `aria-controls` target is a visible `tabpanel` labelled by that tab. The focused installed-Chrome journey passed 1/1 in the 13.2-second rerun after adding a wait for the test gateway.

Focused command: `$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; npm.cmd run test:e2e:focused -- tests/e2e/app-boot/navigation-progression.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g "Energy, Space Mining, Interstellar, Galactic and Miaplaedia child tabs target their selected page"`.

<a id="p-56-source-to-rendered-child-navigation-audit-and-follow-up-10-october-2026"></a> **P-56 source-to-rendered child navigation audit and follow-up (10 October 2026):** compared Cosmic Forge's source rows with the navigation contract and current routes. Galactic Casino remains after Galactic Market under Galactic; the Interstellar children remain Star Map, Star Data, Starship, Fleet Hangar, Colonise; Space Mining remains Mining, Space Telescope, Asteroids, Launch Pad, then Rockets 1 through 4. The read-only audit found no placement/order mismatch and noted that browser coverage did not inspect rendered Interstellar or Space Mining `data-source-option-id` values. The gap is now covered: the Interstellar route asserts all five rendered IDs, and the Space Mining matrix checks Mining, Telescope, Asteroids, Launch Pad, and Rockets 1–4. See the focused results in the follow-up notes below and the [Space Mining evidence](../space-telescope/README.md). P-56 remains open for broader presentation review.

**P-16/P-20 navigation-change semantics follow-up (9 October 2026):** the focused
keyboard route is tagged `@p16-focus` and `@p20-announcements`. It checks the named main and
child `tablist`s, keyboard-driven focus and `aria-selected` changes, and each
selected tab's `aria-controls`/`tabpanel`/`aria-labelledby` association. These
native tab semantics expose destination and selection to assistive technology
without a redundant live announcement region. This is browser accessibility
tree coverage, not a manual screen-reader compatibility run.

The keyboard navigation case was re-run with the focused P-20 timer cases on
9 October 2026; all six selected Chrome cases passed in 41.6 seconds. The run
verified navigation changes remain exposed through focus, `aria-selected`, and
tab/panel naming and association. Manual screen-reader announcement timing and
wording remain unverified.

**P-54 app-boot focused Chrome rerun (9 October 2026):** the full
`hydrogen-boot.spec.ts` area ran in installed Chrome on port 4313 with one
worker, no retries, and video/tracing disabled. It completed in 24.0 seconds
with **4 passed and 2 failed** (exit 1). The keyboard tab-order,
startup-fallback, six-locale live Hydrogen, and 390px Hydrogen checks passed.

Investigation found both failures were stale test expectations, not player-facing
defects:

- The Spanish first-run baseline dated from the older status-row and Hydrogen
  layout. It showed the old combined stat row, the now-removed Hydrogen strapline,
  and sell/fusion in their prior panels. The current screen shows the owner's
  whole-game context row and run-stat row, plus the updated Hydrogen hero with
  integrated sell/fusion. I reviewed the 1280px current capture; no clipping or
  overlap was visible. The `hydrogen-first-run-es.png` baseline was refreshed.
- `DebugTools` mounts the Test Lab dialog only after it is opened, so the initial
  dialog-count expectation was wrong. The test now keeps the `freshGame` fixture
  active, focuses the Hydrogen Collect button, verifies the dialog is initially
  absent, then opens and closes it with NumpadAdd. The app's shortcut handler
  ignores keyboard events from text inputs by design.

The two affected cases passed in the clean installed-Chrome no-update rerun:
**2/2 in 6.1 seconds**, exit 0, port 4317 released. The full six-case area has
not yet been rerun; its four unaffected cases passed in the earlier area run.

Focused rerun command:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4317'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line --grep 'first run starts with the pioneer name screen|the Test Lab opens and closes with the keypad plus toggle' tests/e2e/app-boot/hydrogen-boot.spec.ts
```

**P-54 app-boot final Chrome rerun (9 October 2026):** after correcting the
Spanish first-run screenshot and Test Lab shortcut expectation, the complete
six-case `hydrogen-boot.spec.ts` area passed in installed Chrome: **6/6 in
16.5 seconds**, exit 0, on port 4318. No snapshot updates were requested. This
supersedes the earlier partial result above; all six focused app-boot cases
now pass together.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='4318'
node .\node_modules\playwright\cli.js test --pass-with-no-tests --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/app-boot/hydrogen-boot.spec.ts
```

**P-12 all-theme phone navigation matrix (9 October 2026):** the new focused
Chrome case visits all ten main tabs at 390×844 in all nine themes, verifies
each selected tab is fully inside the horizontal main rail, and checks the
document never exceeds the viewport. In every available child-navigation
rail, it selects the last visible child, checks its bounds inside the rail, and
confirms an overflowing rail scrolls to the selected child. Miaplaedia
selection also checks that the main rail scrolls. The installed-Chrome matrix
passed 1/1 in 43.2 seconds on port 4360. This adds the cross-theme 390px sweep.
At the time of this 9 October entry, P-12 remained open for other widths and
locales; its later sign-off is recorded below.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4360'; npm.cmd run test:e2e:focused -- tests/e2e/app-boot/p12-mobile-theme-navigation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-12 narrow/tablet child-navigation follow-up (9 October 2026):** a
focused installed-Chrome regression opens Settings and Miaplaedia from an
all-tabs fixture at 320×740 and 768×740. It visits all six Settings and seven
Miaplaedia destinations at both widths, verifies selected main/child tabs stay
inside their rails, child tabs wrap without horizontal rail scrolling, each
selected tab controls the visible labelled panel, panels begin after the nav,
and the document stays within the viewport. All checks passed **1/1 in 10.4
seconds** on distinct port 4386. The tested layout had no demonstrated defect,
so no application CSS was changed. This adds narrow/tablet navigation evidence.
At the time of this 9 October entry, P-12 remained open for broader touch,
visual, theme, and locale review; its later sign-off is recorded below.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4386'; node .\node_modules\playwright\cli.js test tests/e2e/ui-navigation/p12-settings-miaplaedia-responsive-navigation.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-12 responsive stress-width sign-off evidence (9 October 2026):** the
focused installed-Chrome `p12-responsive-stress.spec.ts` run passed **2/2 in
10.0 seconds** on port 4388. At both 320px and 768px, Resources and Compounds
render their active navigation rail above the content in a single grid column
without document overflow. At 320px, every visible child tablist across the ten
unlocked main panes selected its last destination, exposed the associated
tabpanel, and kept the selected tab in its rail; overflowing rails scrolled to
the selection and the document stayed within 320px. Together with the four
breakpoint top-level matrix, all-theme 390px child-rail matrix, 320/768
Settings/Miaplaedia wrap check, and focused Tech Tree/Star Data internal-scroll
checks, this covers the P-12 functional acceptance. Broader theme/locale
screenshots remain under P-51/P-56.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4388'; node .\node_modules\playwright\cli.js test tests/e2e/app-boot/p12-responsive-stress.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-15 cross-screen navigation semantics and focus (9 October 2026)

The focused installed-Chrome `@p15` regression checks the main landmark and
single h1, all available main tab/panel associations, visible page or section
headings, and every child tab/panel association across Resources, Compounds,
Research, Energy, Space Mining, Interstellar, Galactic, Cosmic Rip, and
Miaplaedia. It also checks ArrowRight focus transfer in grouped Compound and
Research navigation and in Cosmic Rip. The run passed **1/1 in 14.6 seconds**
on distinct port 4609. It exposed three Cosmic Rip child tabpanels labelled by
their inner titles or an aria-label instead of their controlling tabs; the
existing tab IDs now name those panels while the visible h3 headings remain
unchanged. Typecheck passed and Oxfmt reports both touched files formatted.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4609'; node .\node_modules\playwright\cli.js test tests/e2e/app-boot/navigation-progression.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --grep '@p15'
```

This completes the P-15 semantic navigation and focus acceptance. Manual
screen-reader announcement checks remain tracked under P-20.

**P-56 Interstellar rendered source-option follow-up (10 October 2026):** the
existing deterministic five-child route now asserts each rendered tab's
`data-source-option-id` as well as its order and selected-panel association:
Star Map/option1, Star Data/option2, Starship/option3, Fleet Hangar/option4,
and Colonise/option5. The focused installed-Chrome route passed 1/1 in 15.6
seconds on port 5542. See the [navigation route](navigation-progression.spec.ts).

**P-65 Miaplaedia rail rerun (14 October 2026):** the focused
`progressive unlock states keep main tabs in source order` Chrome case passed
1/1 as part of a 4/4 Miaplaedia/App Boot run on port 6401. Its tab-order,
selected-panel, unlock, and phone-rail checks passed; the current App Boot
screenshots matched without another snapshot update. I reviewed the 1280px
source-order, 390px source-order, unlock-state, and selected-phone captures.
Miaplaedia remains last in the visible source order and selection scrolls its
full label into view. No navigation implementation defect was found.

**Saved full-run app-boot failure recovery (14 October 2026):** the saved
P-65 `progressive unlock states keep main tabs in source order` failure was a
visual-baseline mismatch: the old expected screenshot was 1280×1436 while the
current rendered page was 1280×1637. The README's earlier note records the
reviewed current baseline and a clean 4/4 rerun on port 6401. I reran only this
case without updating snapshots; installed Chrome passed **1/1 in 15.9 seconds**
on port 6506. No app or assertion change was needed, and the current baseline
matched.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6506'; npm.cmd run test:e2e:focused -- tests/e2e/app-boot/navigation-progression.spec.ts --project=chrome --grep 'progressive unlock states keep main tabs in source order' --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-app-boot-p65-6506"
```
