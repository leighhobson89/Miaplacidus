# `save-migration` browser and unit evidence

Migration and failure recovery cover the Hydrogen-only slice. The shared save spec imports a generated schema-v0 MIAPLACIDUS code through the visible manager, previews the migrated schema-v1 run, starts it, and captures a screenshot. Other browser cases damage a committed head or simulate quota exhaustion, then verify recovery or reload of the prior generation.

Pure format, checksum, future-version, migration-rung and atomic-write rules live in [`local-saves.spec.ts`](../../unit/local-saves.spec.ts). Fixtures are generated from small deterministic states; no player data or Cosmic Forge saves are included.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-slots/save-slots.spec.ts --grep save-migration --workers=1
npm.cmd run test:unit:focused -- tests/unit/local-saves.spec.ts
```

The version-zero fixture is synthetic and was never a shipped MIAPLACIDUS format. The current schema is version 1; there are no previously released MIAPLACIDUS save versions to import.
