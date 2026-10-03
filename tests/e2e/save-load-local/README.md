# `save-load-local` browser evidence

This area verifies player-driven save and reload behavior through the Hydrogen slice. Its specs live in the shared [`save-slots` suite](../save-slots/save-slots.spec.ts) so name selection, slot persistence, portable exchange and failure recovery use one browser harness.

Coverage includes two pioneers with independent progress, switching from the save manager while retaining Confirm/Start, prefill after reload, durable timers, live-state export, clipboard/text/`.txt` equivalence, import into an empty browser profile, and quota recovery. Each scenario uses visible controls and saves a screenshot baseline.

Run on Windows with Chrome:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-slots/save-slots.spec.ts --grep save-load-local --workers=1
```

The same tests also carry `@save-slots` tags. Current screenshot evidence is stored beside the shared spec.
