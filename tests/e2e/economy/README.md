# Economy browser coverage (M-03)

This area uses Playwright in Chrome with real clicks through the Resources, Energy, Research, and Compounds panels. Most later-system cases start from a named, deterministic fixture so the test can focus on the action under test. Fresh progression begins with a real Hydrogen save, buys the Science Kit and compressor through their controls, and reaches its first research purchase. Automatic-sale and compound-creation cases buy/enable producers, set visible allocation controls, and advance the injected clock.

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

The current E2E area covers a fresh Hydrogen route through the first Research purchase, Energy unlock and Diesel compound unlock; all eight material cards and six compound cards; every material and compound storage control; all autobuyer tiers and pause/resume controls; Water's secondary Concrete cost; Increase All Storage; all plant, battery, and science building cards; Power All and plant toggles; manual and automated technology purchases with accessible completion announcements; the manual completion announcement and economy screens in all six locales; permanent multipliers; Dyson infinite power; allocation controls for all eight resources; all six automatic compound recipes from newly produced inputs; battery charge/discharge/recharge; energy trip/recovery; six-language screenshots of Hydrogen, Research, Energy, and Compounds; notation; and economy save/reload. The save/reload case changes a resource balance and storage capacity, buys an autobuyer and power buildings, changes research, compound automation, an allocation share, locale, and notation, then compares all 14 material/compound balances and capacities plus the full upgrade/economy state after reload.

The M-03 economy and research gate is complete. Rebirth carryover and repeatable-price restoration (former E-06/E-13/E-36/E-56) belong to M-05; telescope/rocket demand and star/weather/space modifiers (E-09/E-25/E-26/E-35) belong to M-04/M-05; the exhaustive row/tooltip/modal/dynamic-cost language review (E-57) belongs to M-06. The [chronological economy checklist](../../../docs/plans/build-checklist/03-economy.md) links each follow-up to its owner. Their implementation remains open in those later phases and is not counted as M-03 evidence.

## Latest verification (3 October 2026)

- `npx.cmd playwright test tests/e2e --workers=1` with Chrome: **51 passed**, including all **30 economy browser cases**. Each visual checkpoint attached a full-page screenshot and compared it with its baseline at a 5% pixel-difference allowance.
- After strengthening the economy save/reload assertions to compare all balances, capacities, upgrades and automation state: the focused E-56 browser case **passed** and its reviewed screenshot baseline was updated.
- `npm.cmd run test:unit`: **43 passed**.
- `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run check:boundaries`, `npm.cmd run format:check`, and `npm.cmd run build`: all passed.
