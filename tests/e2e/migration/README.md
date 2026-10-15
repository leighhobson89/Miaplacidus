# `migration` evidence

Installed Chrome passed the area-owned v54-to-v55 migration case 1/1 on 14
October 2026 (7.6 seconds, port 6448), with no snapshot update.

The browser case imports a synthetic version 54 save through the live Save Manager and exercises the v54→v55 migration. It verifies that the missing Megastructure availability-notice guard defaults to `false`, survives a reload, and leaves a playable Hydrogen run. The older synthetic v0 import journey belongs to [`save-migration`](../save-migration/README.md); focused unit coverage in [`local-saves.spec.ts`](../../unit/local-saves.spec.ts) exercises the migration ladder.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npx.cmd playwright test tests/e2e/migration/migration.spec.ts --workers=1
npm.cmd run test:unit:focused -- tests/unit/local-saves.spec.ts
```

Schema 55 is the current development format. The v54→v55 migration adds the persisted Megastructure availability-notice guard. The browser fixture is generated from a deterministic current state with that field removed; it does not claim to represent a previously released user save.
