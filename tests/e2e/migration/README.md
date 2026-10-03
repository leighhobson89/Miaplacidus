# `migration` evidence

The test-only v0 envelope omits the statistics block and declares schema version 0. The one-way migration validates its exact fields and checksum, adds the v1 statistics defaults, recalculates the v1 envelope checksum and returns a playable Hydrogen state. Unit coverage checks this ladder; browser coverage imports the same kind of code and starts the resulting slot through Confirm/Start.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-slots/save-slots.spec.ts --grep migration --workers=1
npm.cmd run test:unit:focused -- tests/unit/local-saves.spec.ts
```

No MIAPLACIDUS schema version has shipped yet. When one does, add a sanitized, versioned fixture and an additional migration rung before changing the current schema.
