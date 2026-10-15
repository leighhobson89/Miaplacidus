# Autosell browser coverage

These focused browser cases exercise the player-facing resource production
allocation slider and automatic sale behavior:

- `player-set allocations sell only new Hydrogen and Carbon production` checks
  keyboard and pointer adjustment of both allocation handles, sale shares for
  all eight Resources, purchased Hydrogen and Carbon producers, and resulting
  cash and stock quantities.
- `mobile touch can drag a resource allocation handle` uses Pixel 7 touch input
  to drag the Cash share handle and checks its accessible value and the Compound
  share readout.

The tests use the shared fixture and slider helpers in
[`../_harness/economyFixtures.ts`](../_harness/economyFixtures.ts). Their two
visual checkpoints were moved unchanged from the former mixed Economy spec.
The six-compound automation journey remains in Economy because it spans Resource
production, Compound creation, and Autobuyers.

Run the focused cases with installed Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6578'
$testOutput = Join-Path $env:TEMP 'miaplacidus-autosell-move-confirm-20261014'
npm.cmd run test:e2e:focused -- tests/e2e/autosell/auto-sell.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$testOutput" --grep '@autosell'
```

On 14 October 2026, both cases passed **2/2 in 18.0s** with snapshot updates
disabled. Test output is in `%TEMP%\miaplacidus-autosell-move-confirm-20261014`.