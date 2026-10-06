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

The current E2E area covers a fresh Hydrogen route through the first Research purchase, Energy unlock and Diesel compound unlock; all eight material pages and six compound cards; every individual material and compound storage control; the single Hydrogen stock display and shared Compressor/tier Autobuyers disclosure; Fusion grouped with selling, including first-discovery and subsequent efficiency notices; removal of the duplicate bulk storage action; all autobuyer tiers and pause/resume controls; Water's secondary Concrete cost; all plant, battery, and science building cards; Power All and plant toggles; manual and automated technology purchases with accessible completion announcements; the manual completion announcement and economy screens in all six locales; permanent multipliers; Dyson infinite power; allocation controls for all eight resources; focused keyboard and pointer operation of the segmented cash/compound slider; all six automatic compound recipes from newly produced inputs; battery charge/discharge/recharge; energy trip/recovery; six-language screenshots of Hydrogen, Research, Energy, and Compounds; 390px document-width checks for those four tabs in all six locales; localized Energy and Compound child-page labels; notation; and economy save/reload. The save/reload case changes a resource balance and storage capacity, buys an autobuyer and power buildings, changes research, compound automation, an allocation share, locale, and notation, then compares all 14 material/compound balances and capacities plus the full upgrade/economy state after reload.

The Tech Tree zoom case verifies both prerequisite edges into Advanced Power Generation, captures a screenshot panned to those dependencies, and confirms ArrowRight/ArrowDown scroll the named viewport on both axes after zooming. The complete graph, theme, and narrow-viewport review remains open under P-60.

The M-03 economy and research gate is complete. Rebirth carryover and repeatable-price restoration (former E-06/E-13/E-36/E-56) belong to M-05; telescope/rocket demand and star/weather/space modifiers (E-09/E-25/E-26/E-35) belong to M-04/M-05; the exhaustive row/tooltip/modal/dynamic-cost language review (E-57) belongs to M-06. The [chronological economy checklist](../../../docs/plans/build-checklist/03-economy.md) links each follow-up to its owner. Their implementation remains open in those later phases and is not counted as M-03 evidence.

## Focused allocation verification (5 October 2026)

- Four desktop/mobile-emulated Chrome journeys passed **4/4** for 5% keyboard steps, pointer/touch dragging, allocation readouts, and production/automation using the resource allocation slider. The reviewed `economy-production-allocation-slider.png` screenshot records the themed segments and both handles; the nested compound pane screenshots were refreshed and passed on rerun.

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

## Hydrogen hero and Fusion layout review (5 October 2026)

The `economy-fresh-hydrogen-compressor.png` and `economy-hydrogen-fusion-open.png` baselines were refreshed and visually reviewed at 1280px in Terminal. Sell controls sit without a separate card border inside the Hydrogen hero; the unlocked Fusion controls remain visible as a full-width section below Sell with a fine separator and no disclosure toggle. Hydrogen storage is the first full-width panel below the hero. The compressor screenshot shows no inline purchase-complete message. Both focused Chrome journeys passed 1/1 during snapshot refresh and again without snapshot updates; the active-Fusion journey also asserts the panel geometry and absence of a collapse control.