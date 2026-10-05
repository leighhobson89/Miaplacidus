# `migration` evidence

The test-only v0 envelope omits the statistics block and declares schema version 0. The one-way migration validates its exact fields and checksum, adds the v1 statistics defaults, recalculates the current envelope checksum and returns a playable Hydrogen state. Unit coverage checks this ladder; browser coverage imports the same kind of code and starts the resulting slot directly into gameplay.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-slots/save-slots.spec.ts --grep migration --workers=1
npm.cmd run test:unit:focused -- tests/unit/local-saves.spec.ts
```

No MIAPLACIDUS release schema has shipped yet. The current development schema is version 32; its v31 migration adds run and all-time random-event counts. Existing v31 saves can restore only the latest 100 event records for the active run, and start all-time event totals at zero. When a release schema ships, add a sanitized, versioned fixture for it before changing the migration ladder.
