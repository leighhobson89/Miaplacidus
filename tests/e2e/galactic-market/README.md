# Galactic Market

The browser case opens the Galactic Market child pane under the Galactic tab, selects Hydrogen and Helium using the visible controls, compares the preview with the settled stock change, verifies the trade history, and captures the post-trade screen. Rule boundary cases remain in `tests/unit/meta-progression.spec.ts`.

Focused commands: `npm run test:unit:focused -- tests/unit/meta-progression.spec.ts` and `npm run test:e2e:focused -- tests/e2e/galactic-market/galactic-market.spec.ts`.

Verification: the meta-progression unit area passed (15/15). On 5 October 2026, the focused Chrome trade journey passed 1/1 after regenerating the obsolete screenshot baseline, then passed again without snapshot updates. The reviewed screenshot now shows Galactic Market as a Galactic child alongside the AP/CP header and current trade controls; the former flattened menu and pioneer table are gone.

8 October 2026 notification follow-up: the trade journey verifies the localized success toast uses the accepted trade quantities after commission, has the `special` classification and info styling, and clears duplicate inline success feedback. The focused Galactic Market and Cosmic Rip browser areas passed together 9/9 in installed Chrome in 37.8 seconds (exit 0). The Market screenshot was refreshed after the temporary five-second notice disappeared and visually reviewed.

8 October 2026 P-65 Galactic identity matrix: a deterministic all-unlocked meta fixture exposes the six child pages currently declared by `GALACTIC_PANE_IDS`: Rebirth (`option1`), Galactic Market (`option2`), Galactic Casino (`option6`), Ascendency Perks (`option3`), Megastructures (`option4`), and Black Hole (`option5`). Rebirth is available because the fixture includes a destination encounter; Megastructures have reported manuscripts/capture state; Black Hole is marked discovered. The focused Chrome matrix checks each page's selected child tab/source identity, localized tab and h2 title, intended artwork (megastructure, asteroid, star-system, or black-hole illustration), Hydrogen title scale, and pane/document bounds at 1280px, 390px, and 320px in all six locales and nine themes (972 page combinations). It passed 1/1 in installed Chrome in 2.8 minutes. Resources and Compounds were not changed. Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line -g "@galactic-identity-matrix" tests/e2e/galactic-market/galactic-market.spec.ts
```

9 October 2026 P-66 visual review: Galactic Rebirth now has desktop Terminal and phone Light captures in `tests/e2e/galactic-market/p66-rebirth-visual.spec.ts-snapshots/`. Review found the default upgrade-card grid compressed the Ascendency Points and Rebirth labels into a 2.5rem track, with the action overlapping its label. A Rebirth-specific two-column template in `src/styles.css` gives the copy flexible width and keeps the button in its own column. Both refreshed captures were reviewed, and the focused browser case passed 1/1 after the fix.

**P-16 liquidation-dialog focus follow-up (9 October 2026):** the Rebirth
confirmation now restores focus to its `Liquidate all assets` trigger after
Cancel or Escape. The test first reproduced focus being lost when the dialog
was removed; a small trigger ref and post-close focus restore fixed it. The
focused installed-Chrome P-16 batch passed all four selected paths in 13.7
seconds, including both Market close routes, Star Data's Show on map focus,
keyboard tab movement, and toast auto-dismiss. See the
[notification README](../notifications/README.md) for the exact command.

**P-16 successful liquidation focus (9 October 2026):** a focused browser case
completes the irreversible liquidation, confirms the now-disabled action, and
checks focus moves to the Rebirth liquidation heading. The associated installed-
Chrome P-16 batch passed 9/9 selected routes in 29.8 seconds on port 4261; the
dialog route also verifies Cancel and Escape return focus to its trigger while
a trade notice remains behind the modal.

**P-41 adjusted unit-price notation (9 October 2026):** the focused browser
case selects Hydrogen and Helium and checks Galactic Market's visible
four-decimal Hydrogen unit price against its active market state in Condensed,
Standard, and Scientific notation. It also confirms Scientific renders
differently from Standard for this sub-dollar price. Installed Chrome passed
1/1 in 7.6 seconds on port 4305; no market or gameplay behavior changed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4305'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-market/p41-market-currency.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 Market Lockdown reason notation (9 October 2026):** a focused visible
case forces the normal 30-minute Market Lockdown and verifies both the disabled
trade and AP-sale controls expose their localized countdown through
`aria-describedby` in Condensed, Standard, and Scientific. After a ten-minute
injected clock advance, state and both visible reasons update from 30 to 20
minutes (Scientific `3E1` to `2E1`). Installed Chrome passed 1/1 in 7.9
seconds on port 4310. Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4310'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-market/p41-market-lockdown.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

**P-41 AP-sale preview notation (9 October 2026):** the focused browser case
selects a 10-AP sale and compares its visible cash preview with the active AP
sale price in Condensed, Standard, and Scientific notation, then verifies the
successful sale feedback uses the same formatted payout. Scientific differs
from Standard for the multi-million payout. The focused rerun of the AP-sale
and liquidation cases passed 2/2 in 11.5 seconds on port 4314. Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4314'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-market/p41-market-currency.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'P-41 formats the Galactic Market AP sale preview|P-41 formats the Galactic Market liquidation value'
```

**P-41 liquidation-value notation (9 October 2026):** the visible liquidation
value in the Rebirth card now matches the current liquidation preview in
Condensed, Standard, and Scientific. Scientific differs from Standard. The
focused installed-Chrome case passed 1/1 in 7.1 seconds on port 4313. Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4313'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-market/p41-market-currency.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line -g 'P-41 formats the Galactic Rebirth liquidation value'
```

**P-41 liquidation confirmation value (9 October 2026):** for Condensed,
Standard, and Scientific, the browser case opens the confirmation dialog,
checks its displayed cash value against the same current liquidation preview
shown on the Rebirth card, and cancels without liquidating. The complete
focused P-41 currency batch passed 9/9 in installed Chrome in 40.8 seconds on
port 4320. The AP sale case in the same batch also verifies its formatted
cash-payout feedback after sale.

**P-13 Galactic Market narrow trade context (9 October 2026):** the focused
`p13-market-narrow-context.spec.ts` case selects Hydrogen for Helium and a
quantity of 10, then checks the live quote (10 Hydrogen given, 18 Helium
received, 1 Hydrogen commission), Cash/RP balances, and enabled trade action at
390px and 320px. It completes the trade and verifies the actual inventory
change and success notification match the quote. Both captures were visually
reviewed: the quote, selectors, quantity, and action remain inside the Market
card without document overflow; the tab rails remain horizontally scrollable.
Installed Chrome passed the snapshot run and clean no-update rerun, 2/2 each,
on ports 4538 and 4539; `npm.cmd run typecheck` passed. Captures are
`p13-market-trade-quote-{390,320}.png` beside the spec. This samples English
Terminal and does not cover long translated labels or every theme.


## P-05 Meta mechanics actions (10 October 2026)

`p05-meta-actions.spec.ts` measures all visible mechanics buttons, inputs, selects, and toggle labels at 320px and 390px across Ascendency Perks, Galactic Market, Casino, Megastructures, Black Hole, Rebirth and its confirmation, Event Journal claims, and all Cosmic Rip subpages. Every measured target is at least 44×44 CSS pixels and each route fits its viewport. The Black Hole fixture reaches the live pane; keyboard Enter researches it at 320px and touch purchases its Power upgrade at 390px. Rebirth is activated by keyboard/touch and dismissed with Escape; Event Journal prize claiming is tested by keyboard/touch. The installed-Chrome case passed **1/1 in 12.3 seconds** on port 4663 and passed again within the seven-case P-05 group (**7/7 in 47.9 seconds**) on port 4670.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='4663'; node .\node_modules\playwright\cli.js test --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/galactic-market/`p05-meta-actions.spec.ts`
```

## P-45 localized Market action feedback (10 October 2026)

`tests/e2e/localization/p45-market-casino-results.spec.ts` performs the
Hydrogen-for-Helium trade in all six locales and checks the rendered global
notice against the current quote, including commission and localized good
names. It then forces a Market lockdown and checks both the visible offline
notice and the linked disabled-trade reason with its live localized countdown
in every locale. The combined focused Meta run passed 9/9 in installed Chrome
on port 5077; no translation mismatch was found.

## P-54 E-57 localized Market rows and Rebirth liquidation dialog (10 October 2026)

p54-e57-market-locale-context.spec.ts checks every unlocked good as the outgoing trade good, paired with the next unlocked good, and verifies both currently visible .market-rate-detail rows, quote quantities, and commission in all six locales at 390px and 320px. It checks each displayed AP-sale amount (1, 5, and 10) on Galactic Market, then selects the separate Rebirth child to inspect its liquidation value/AP preview and confirmation dialog. Market pane, Rebirth pane, dialog, and document bounds are asserted for each locale/width pair. The French 320px Rebirth dialog capture is visually reviewed; the dialog and translated rows remain within the viewport. The previous test record predates the ownership move; the corrected route remains for the end-stage regression pass.

## P-51 French narrow Market visual check (10 October 2026)

`p51-market-narrow-visual.spec.ts` checks Galactic Market at 320 by 740 and
390 by 844 in French, in Terminal and Light themes. It selects a live
Hydrogen-for-Helium quote, opens the Research Points tooltip, and checks its
viewport bounds and document width. It then selects the separate Galactic >
Rebirth child and opens the liquidation confirmation without confirming it,
checks the dialog and every visible child remain within the viewport, captures
the dialog, cancels, and verifies focus returns to the trigger. Eight captures
(`p51-market-rp-tooltip-*` and
`p51-rebirth-liquidation-dialog-*`) were generated; representative 320px
Terminal/Light tooltip and dialog captures plus the 390px Light dialog capture
were visually reviewed with no clipping or contrast defect found. No app code
change was needed; this is a narrow-page sample, not full Market/theme/locale
sign-off.

Installed Chrome passed 1/1 in 8.1 seconds on port 5028:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_TEST_AREA='galactic-market'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='5028'; npm.cmd run test:e2e:focused -- tests/e2e/galactic-market/p51-market-narrow-visual.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-44 Liquidation-help disposition (10 October 2026)

Cosmic Forge registers `infoTooltipRebirthLiquidation` but no source renderer
uses its ID. The target places the related action in the Galactic > Rebirth
child: the asset-liquidation card displays a live liquidation value/AP preview, and its
localized confirmation prompt states that conversion uses the current AP
price. The source UI has no formula-tooltip callsite; MIAPLACIDUS supplies that
calculation help beside the action as described in the Phase 7 route below. The
existing E-57 Market locale case verifies preview and dialog copy
in all six locales at 320px/390px; the source/target distinction is recorded
in the [P-44 handoff](../../../docs/archive/audits/phase-6-handoff-2026-10-07.md#p-44-remaining-cosmic-forge-infotooltip-inventory-10-october-2026).

### Phase 7 liquidation calculation-help route

Cosmic Forge `descriptions.js` registers `infoTooltipRebirthLiquidation`, but
searching the active source renderers finds no matching `info_rebirthLiquidation`
trigger. MIAPLACIDUS adapts that source-key topic to the visible calculation
tooltip beside the liquidation action in Galactic > Rebirth:
`metaMessages.ts#liquidationHelp`, rendered by `AssetLiquidationCard.tsx`. This
tooltip explains current per-unit resource/compound value, cash at one tenth,
division by the current AP purchase price, and rounding down. The separate
source-action tooltip `marketMessages.ts#MARKET_SOURCE_HELP.liquidation` remains
beside the same Rebirth action, including its once-per-run wording; it is not
the formula-help destination. `p7-rebirth-liquidation-source-tooltip-locales.spec.ts`
checks the formula tooltip and its Rebirth ownership in all six locales. It is
**AUTHORED, NOT RUN** for Phase 8 V-59.

## P-56 Galactic Market content visual matrix (10 October 2026)

`p56-market-content-visual-matrix.spec.ts` extends the existing P-65 Market
identity-and-pane-bounds matrix with detailed trade content. It checks six
locales, nine themes, and 1280px/390px/320px viewports (162 combinations) with
a deterministic Hydrogen-for-Helium quote and quantity 10. Assertions cover
the localized heading and description, asteroid artwork, two Market cards,
live quote rows, action controls, empty history state, card/content bounds,
text fit, and document overflow. The liquidation confirmation belongs to the
separate Galactic > Rebirth child and is covered by the P-54 locale/viewport
case above.

Installed Chrome passed **1/1 in 43.7 seconds** on port 6205. No layout defect
was reproduced, so no application CSS change was needed. Reviewed Market-only captures:
`p56-market-en-terminal-1280.png`, `p56-market-de-light-390.png`,
`p56-market-pt-galaxy-1280.png`, and `p56-market-fr-space-320.png` in
`test-results-p56-market-content-visual-6205/galactic-market-p56-market-c9dcf-alactic-market-presentation-chrome/`.
The English Terminal desktop, German Light phone, Portuguese Galaxy desktop,
and French Space narrow captures show contained text/cards and no horizontal
overflow. A pre-ownership-correction liquidation capture is not evidence for
this Market matrix; the current liquidation dialog belongs to Galactic > Rebirth
and has separate P-54 coverage above. This is a bounded Market content slice
and does not close P-56.

Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6205'; npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output=test-results-p56-market-content-visual-6205 tests/e2e/galactic-market/p56-market-content-visual-matrix.spec.ts
```

### Standalone Rebirth child matrix (added 11 October 2026)

`p56-rebirth-content-visual-matrix.spec.ts` covers the separate Galactic >
Rebirth child across six locales, nine themes, and 1280px/390px/320px viewports
(162 combinations). It checks Rebirth tab/source ownership, confirms the
liquidation card is absent from Market and present in Rebirth, validates the
localized page and card headings plus megastructure artwork, and measures
horizontal viewport bounds, vertical document bounds for the page and cards,
card-content containment, and dialog viewport/content bounds. It opens the
localized liquidation dialog and cancels it in every combination; it never
confirms liquidation. Four page captures and one French Space 320px dialog
capture are attached when run. The no-update Chrome matrix passed 1/1 in the
final 14 October recovery batch on port 6827. A narrow 320px heading-size
adjustment now fits the German Rebirth card label.

Run with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; npm.cmd run test:e2e:focused -- --project=chrome --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/galactic-market/p56-rebirth-content-visual-matrix.spec.ts
```

## 14 October focused regression recovery

All ten Galactic Market/Rebirth failure titles from the saved 14 October
manifest passed across focused installed-Chrome runs. Four passed in the initial
17-case batch on port 6821; the six repaired cases passed in the final no-update
batch on port 6827. That final batch passed all seven selected cases, 7/7 in
2.7 minutes, including the Casino visual case.

The P-13 390px and 320px captures were reviewed after refresh; trade controls
and quote text stay inside the viewport. The P-66 Rebirth desktop and phone
captures were refreshed and reviewed; the liquidation card remains on Rebirth.
The P-56 Market matrix measures its two Market cards, with liquidation owned by
the separate Rebirth page. The complete 162-combination P-56 Market and Rebirth
matrices passed in the focused recovery.

## P-65 Galactic Market page identity

`p65-meta-identity.spec.ts` checks the Galactic Market child heading and shared
title treatment, asteroid illustration, Hydrogen title scale, and bounds at
1280px and 390px. It preserves the `p65-galactic-market-{1280,390}.png`
diagnostic captures as Playwright output attachments. This owner-area case
passed in the seven-case installed-Chrome split batch on port 6716 with no
snapshot updates; the focused batch's only failure was the separate Black Hole
fixture, which passed after correction. Outputs are under
`%TEMP%\miaplacidus-p65-meta-identity-split-20261014`.

## Market responsive identity and locale reruns (14 October 2026)

The broad Galactic child identity matrix passed **1/1** in installed Chrome in
6.1 minutes on port 6461 with snapshot updates disabled. It checks all six
source-owned child pages, their source option order, localized names, artwork,
responsive title sizing, and pane/document bounds across nine themes, six
locales, and three viewports. Rebirth uses its existing 24px title rule at
320px; other child pages retain the shared title scale.

The P-54/E-57 Market and Rebirth case passed **1/1** on port 6460 in 1.1
minutes with snapshot updates disabled. Its all-locale, two-phone-width
catalogue sweep exceeded Playwright's default 30-second test deadline during
the concurrent area run despite the controls being present and accessible; the
case now has a 180-second budget. The complete Galactic Market area rerun was
not repeated after the one full regression; all other Market cases passed in
that run, and its single queued-dialog failure subsequently passed focused
1/1 in installed Chrome on port 6463 with snapshots disabled. The dialog helper
now waits for the native close event and verifies the next queued result or
drained state. Playwright reports and any failure artifacts are under
`%TEMP%\miaplacidus-playwright-2026-10-14T20-18-57-152Z` and
`%TEMP%\miaplacidus-playwright-2026-10-14T20-20-08-471Z` respectively.

## Phase 7 Galactic child title and description routing — NOT RUN

`p7-galactic-child-copy-locales.spec.ts` uses the `meta-galactic-identity-matrix`
fixture and checks the Galactic tab overview plus all six source-owned child
pages in English, Spanish, Portuguese, German, Italian, and French. Cosmic
Forge's `../cosmicForge/cosmicForge/index.html` identifies Galactic with
`tabHeaderGalactic` and its children with `headerMainRebirth` (option1),
`headerMainGalacticMarket` (option2), `headerMainAscendencyPerks` (option3),
`headerMainMegastructures` (option4), `headerMainBlackHole` (option5), and
`headerMainGalacticCasino` (option6). The current owner-directed navigation
keeps Casino as its own child after Market; the separate `GalacticCasinoPane`
route remains distinct from Market. The existing
`tests/e2e/localization/p7-navigation-label-routing.spec.ts` checks the child
IDs and source option identities.

The page-copy targets are `tab.galaxy` and `economyLabel(...,
"galacticOverviewHelp")` for `headerDescGalactic`; `rebirthText(..., "title")`,
`metaText(..., "rebirthOverview")`, and `metaText(...,
"rebirthMegastructureWarning")` for `headerMainRebirth`, `headerDescRebirth`,
and `headerDescRebirthMega`; `marketText(..., "heading"|"description")` for
the Market title and `headerDescGalacticMarket`; `casinoText(..., "title"|"headerHelp")`
and `casinoHeaderDescription(...)` for the Casino title, source Casino info
tooltip, and `headerDescGalacticCasino`; `metaText(...,
"perksTitle"|"perksOverview")` for Ascendency Perks and
`headerDescAscendencyPerks` (its AP balance is shown in the separate AP card);
`megastructureText(...).title|headerHelp` for Megastructures and
`headerDescMegastructures`; and `blackHoleText(...).title|headerHelp` for Black
Hole and `headerDescBlackHole`. Active renderers are `App.tsx` routing to
`RebirthPane`, `GalacticMarketPane`, `GalacticCasinoPane`, `AscendencyPane`,
`MegastructurePane`, or `BlackHolePane`. All mapped title/help catalogues have
explicit en/es/pt/de/it/fr entries; static comparison found no missing values
requiring an application-copy change.

The new selected-locale route spec asserts page headings and descriptions/help
through the visible controls, including the megastructure-run Rebirth warning.
It is authored and **NOT RUN**; no test, build, typecheck, formatter, or browser
check was run for this Phase 7 slice.

The same selected-locale spec now checks Cosmic Forge's eight Market bias and
outlook fields through the dynamic Market help tooltip, the trade and AP-sale
help routes, and the Rebirth liquidation help route. Source liquidation's
already-used variant remains attached to the active one-per-run state. All
assertions are **NOT RUN** for Phase 8 V-59.

## Phase 7 Galactic Market row labels — AUTHORED, NOT RUN

The same six-locale `p7-galactic-child-copy-locales.spec.ts` now checks the
active Galactic Market child controls and summary against the localized
`tradeRow`, `quantity`, `confirmRowLabel`, and `sellAp` fields in
`metaMessages.ts`. These are the active renderings for Cosmic Forge's
`tab7TradeRowLabel`, `tab7QuantityRowLabel`, `tab7ConfirmRowLabel`, and
`tab7SellApRowLabel`: outgoing-good selector label, quantity input label,
trade confirmation summary label, and AP-sale section/control label. Casino's
`tab7PurchaseCpRowLabel` remains owned by the separate Galactic Casino child
and its Casino spec. The additions are **AUTHORED, NOT RUN**; no tests, build,
typecheck, formatter, or browser checks were run for this coverage.

## Phase 7 Rebirth row-description route — AUTHORED, NOT RUN

Cosmic Forge's `descriptions.js#rebirthContent1` is the active description for
the Rebirth action row: `drawTab7Content.js` creates `rebirthRow`, and
`ui.js#createOptionRow` renders that description from the row's content record.
The remake now gives the same source concept a separate help tooltip beside the
Rebirth action in `AscendencyPane.tsx`, using the six-locale
`metaMessages.ts#rebirthSourceHelp` copy. This stays distinct from the Rebirth
page overview and the confirmation dialog's more detailed reset summary.
`p7-rebirth-source-help-locales.spec.ts` checks the active tooltip and its
accessible relationship in all six locales. This coverage is AUTHORED, NOT
RUN; no tests, build, typecheck, formatter, or browser checks were run.
