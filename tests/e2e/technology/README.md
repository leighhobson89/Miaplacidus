# Technology browser coverage

The canonical `technology/` area now owns these three focused Research and Tech Tree cases extracted from the mixed Economy spec:

- `technology research purchase is atomic while locked energy and compounds tabs stay omitted` checks the initial Tech Tree, an atomic Knowledge Sharing purchase, Research production automation, and omission of locked Energy and Compounds tabs.
- `Tech Tree reveals affordable prerequisite-locked research and hides unaffordable nodes` checks that unavailable research stays hidden until affordable, then shows its prerequisite and cost while remaining disabled until the prerequisite is researched.
- `Tech Tree zoom keeps the wide graph inside a two-axis scroll viewport` checks dependency highlighting, pan instructions, horizontal overflow at default zoom, vertical overflow at 160%, and keyboard scrolling on both axes.

The tests use the shared economy fixture in [`../_harness/economyFixtures.ts`](../_harness/economyFixtures.ts). Their three existing screenshots moved unchanged from `economy.spec.ts-snapshots/` to `technology.spec.ts-snapshots/`:

- `economy-research-ready.png`
- `economy-research-unlocked.png`
- `technology-tree-dependency-edges.png`

Run only these cases in installed Chrome with:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6582'
$testOutput = Join-Path $env:TEMP 'miaplacidus-technology-extraction-20261014'
npm.cmd run test:e2e:focused -- tests/e2e/technology/technology.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$testOutput"
```

On 14 October 2026, the focused Chrome run passed **3/3 in 11.2s**. Snapshot updates were disabled; the three moved baseline hashes match their pre-move versions. Output is in `%TEMP%\miaplacidus-technology-extraction-20261014`.

## Economy catchall migration (14 October 2026)
Tech Tree cases formerly in the Economy catchall now live in [`economy-technology.spec.ts`](economy-technology.spec.ts) and [`e57-tech-tree-tooltip-locale.spec.ts`](e57-tech-tree-tooltip-locale.spec.ts).

On 14 October 2026, the complete Technology folder passed **7/7** in installed Chrome with snapshot updates disabled. The atomic Research screenshot now waits for fonts and the measured Tech Tree stage dimensions to settle before capture; the Ready and Unlocked baselines matched without refresh.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6439'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/technology
```
