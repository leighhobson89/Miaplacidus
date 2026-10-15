# `save-load-local` browser evidence

This area verifies player-driven save and reload behavior through the Hydrogen slice, durable timer recovery, offline clock anchors, and exact portable-code exchange. Save-manager selection, conflict handling, slot recovery and capacity remain in the [`save-slots` area](../save-slots/README.md).

Coverage includes durable timer recovery, offline clock anchors, portable export/import, malformed input recovery, and their saved/reloaded state. Save-slot lifecycle remains owned by `save-slots`.

Run on Windows with Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-load-local/save-load-local.spec.ts --workers=1
```

The visual baseline is stored beside the spec. This area runs independently from save-slot management.


## Economy catchall migration (14 October 2026)
The economy save/reload journey formerly in the Economy catchall now lives in [`economy-save-load.spec.ts`](economy-save-load.spec.ts).

## Portable round-trip and malformed input (14 October 2026)

[`portable-save-round-trip.spec.ts`](portable-save-round-trip.spec.ts) verifies that a portable export imported as a new save in a separate browser profile persists the exact exported game state. Its malformed-code case confirms that the entered text remains available for retry and the active run plus committed slot heads stay unchanged. Both focused cases passed in installed Chrome (2/2).

Focused command and result:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6845'
$env:MIAPLACIDUS_TEST_OUTPUT_DIR=Join-Path $env:TEMP 'miaplacidus-save-load-local-roundtrip-20261014-final-verify\results'
$env:MIAPLACIDUS_TEST_REPORT_DIR=Join-Path $env:TEMP 'miaplacidus-save-load-local-roundtrip-20261014-final-verify\report'
.\node_modules\.bin\playwright.cmd test tests/e2e/save-load-local/portable-save-round-trip.spec.ts --workers=1
```

Result: **2 passed**. Playwright output and report were kept under `%TEMP%\miaplacidus-save-load-local-roundtrip-20261014-final-verify`.

## Complete area rerun (14 October 2026)

The complete area passed **4/4** in installed Chrome in 23.3 seconds on port
6447. The first run exposed a timing-sensitive snapshot: `acceptedCommands`
increments on the app's periodic `clock.advance`, so the malformed-import
preservation assertion now excludes this live clock counter along with the
clock anchor and active milliseconds. Game state and committed slot heads
remain compared exactly.
