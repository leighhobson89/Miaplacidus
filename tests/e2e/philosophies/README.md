# Philosophies

The first completed star study opens a permanent one-path choice. The Research tab then exposes the selected path's run ability and four repeatables.

## Evidence

- `philosophies.spec.ts` uses the telescope and study controls, selects Expansionist, researches Rapid Expansion and Warp Drive, saves, reloads, and checks that the path, active ability and permanent rank return.
- `tests/unit/philosophy.spec.ts` checks all four paths, exact ability/repeatable costs, wrong-path and duplicate-selection rejection, Constructor storage scaling, rebirth reset/retention, v22 migration, save round-trip, and all six locale records.
- `tests/unit/diplomacy.spec.ts` checks the strict Supremacist threshold above 3× fleet power.

Run the focused evidence with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
npm.cmd run test:e2e:focused -- tests/e2e/philosophies/philosophies.spec.ts
npm.cmd run test:unit:focused -- tests/unit/philosophy.spec.ts tests/unit/diplomacy.spec.ts
```

The browser path uses the normal `timer.complete` engine command boundary to finish the study. It does not wait the several game minutes represented by the study timer.
