# `save-migration` browser and unit evidence

Installed Chrome passed the area-owned synthetic v0 import case 1/1 on 14
October 2026 (7.1 seconds, port 6449), with no snapshot update.

Migration and failure recovery cover the Hydrogen-only slice. The area-owned browser spec imports a generated schema-v0 MIAPLACIDUS code through the visible manager, previews the migrated current-schema run, starts it, and captures a screenshot. Save-slot damage and quota recovery remain in [`save-slots`](../save-slots/README.md). The `migration` area separately checks a version 54 state upgrade through the same player-visible import flow.

Pure format, checksum, future-version, migration-rung and atomic-write rules live in [`local-saves.spec.ts`](../../unit/local-saves.spec.ts). Fixtures are generated from small deterministic states; no player data or Cosmic Forge saves are included.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/save-migration/save-migration.spec.ts --workers=1
npm.cmd run test:unit:focused -- tests/unit/local-saves.spec.ts
```

The version-zero fixture is synthetic and was never a shipped MIAPLACIDUS format. The current schema is version 55; no previously released MIAPLACIDUS save versions are imported.
