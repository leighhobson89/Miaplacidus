# Statistics E2E ownership

This directory owns browser cases whose primary assertions concern Statistics values, scopes, calculations, or display. A case may navigate through Settings > Statistics while still belonging here when its target is the Statistics data contract.

## Current area run (14 October 2026)

The complete Statistics area passed **2/2** in installed Chrome on port 6445,
with no snapshot updates. The cases cover notation default/change and all 13
Random Event rows in This Run and Lifetime scopes.

## P-55 Random Event counts (14 October 2026)

`p55-random-event-stat-values.spec.ts` forces two Research Breakthrough events, then verifies all 13 event rows show the correct current-run and lifetime counts. The moved canonical-path case passed **1/1 in 7.0 seconds** in installed Chrome on port 6514. Artifacts are in `%TEMP%\miaplacidus-statistics-p55-event-values-6514`.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'; $env:MIAPLACIDUS_DISABLE_VIDEO='1'; $env:MIAPLACIDUS_TEST_PORT='6514'; npm.cmd run test:e2e:focused -- tests/e2e/statistics/p55-random-event-stat-values.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$env:TEMP\miaplacidus-statistics-p55-event-values-6514"
```


## Economy catchall migration (14 October 2026)
The P-41 Statistics notation case formerly in the Economy catchall now lives in [`economy-statistics.spec.ts`](economy-statistics.spec.ts).
