# Galactic Casino browser tests

The casino fixture unlocks the Galaxy tab and supplies enough cash, stock, and unlocked goods to use the player controls.

Run the click-driven casino check with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL = "chrome"
$env:MIAPLACIDUS_DISABLE_VIDEO = "1"
npm.cmd run test:e2e:focused -- tests/e2e/galactic-casino/galactic-casino.spec.ts
```

The test checks CP purchase settlement, Wheel special-prize flow, Double or Nothing, Higher or Lower cash-out after save/reload and a locale change, Void Seer, and a visual checkpoint.

Verification: focused casino unit tests passed (12/12); Chrome browser scenario passed (1/1) on 4 October 2026. The casino screenshot baseline was added after visual review. The section's single full unit-suite run passed 146/146 before later source-parity fixes; only the affected casino and meta-progression unit specs were rerun afterward.
