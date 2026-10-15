# Energy browser coverage

Energy-focused browser cases live here. Tests use shared scenario setup from
the E2E harness when they need an Energy fixture; independent Research cases
belong in the [Research area](../research/README.md). Cross-area journey cases formerly in the Economy catchall now have their primary feature owners listed below.

Installed Chrome passed the complete Energy area **15/15 in 3.0 minutes** on
14 October 2026 (port 6442), with snapshot updates disabled. The run includes
the all-locale/theme/viewport presentation matrix and did not require snapshot
changes.

- `energy-presentation-matrix.spec.ts` covers Energy page identity, ordering,
  artwork, bounds, power switch states, and desktop/phone captures.
- `p45-energy-locales.spec.ts` covers localized Energy purchase reasons and grid-trip feedback.
- `p13-energy-narrow-context.spec.ts` verifies Battery I affordability, purchase effects on Power capacity, and visible balances at 390px and 320px.

Run this area with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/energy --project=chrome --workers=1 --retries=0
```

The Energy matrix snapshots are in
[`energy-presentation-matrix.spec.ts-snapshots/`](energy-presentation-matrix.spec.ts-snapshots/).
Historical review notes and exact earlier commands remain in the economy README.

## P-13 Battery purchase context (14 October 2026)

The focused case checks Battery I's visible price and enabled action, purchases
it through the Energy pane, verifies cash is spent and Power capacity increases,
then checks Research Points and Power balances plus layout bounds at 390px and
320px. The original two screenshots were moved unchanged from the former mixed
Research/Energy spec into this area. Installed Chrome passed **1/1 in 6.4s** on
port 6531 with no snapshot update:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6531'
npm.cmd run test:e2e:focused -- tests/e2e/energy/p13-energy-narrow-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```


## Economy catchall migration (14 October 2026)
Energy-owned cases from the retired Economy catchall now live in [`economy-energy.spec.ts`](economy-energy.spec.ts), [`e57-research-energy-cost-context.spec.ts`](e57-research-energy-cost-context.spec.ts), and [`p45-energy-copy.spec.ts`](p45-energy-copy.spec.ts). Research-owned cases are in the [Research area](../research/README.md).
