# Research browser coverage

Research-only browser cases live here. Use visible Research controls for
building purchases, generated Research Points, and technology unlock behavior.
Shared deterministic setup for early Research and Energy fixtures lives in
[`_harness/economyNarrowContext.ts`](../_harness/economyNarrowContext.ts).

The area now covers Research buildings, Tech Tree prerequisites and purchases,
Philosophy identity/help, responsive cost context, and locale/theme presentation.
Installed Chrome passed the complete area **12/12 in 3.8 minutes** on 14
October 2026 (port 6441), with snapshot updates disabled. The Tech Tree renderer
measures its graph asynchronously; visual specs wait for fonts and stable graph
bounds before capture. The focused P-65 visual case passed 1/1 after adding that
wait, and the complete area passed without changing its baselines.

- `p13-research-narrow-context.spec.ts` checks live balances, the Science Kit
  price and purchase, Research Point production, and overflow at 390px and
  320px.

- `economy-research.spec.ts` covers fresh progression, research demand,
  prerequisite gates, purchase outcomes, and the active Research panel.
- `technology.spec.ts` covers atomic technology purchase, affordable
  prerequisite reveal, graph navigation, zoom, and dependency edges.
- `research-presentation-matrix.spec.ts` covers Research, Tech Tree, and
  Philosophy identity and layout across all locales, themes, and three widths.

Run this area with:

```powershell
npm.cmd run test:e2e:area -- research
```

The narrow-context check shares presentation setup with Energy but asserts only
Research behavior. Earlier follow-up notes about missing building-demand,
prerequisite, and unlock coverage are superseded by the cases listed above.

## P-13 Science Kit context (14 October 2026)

The focused case checks the visible Science Kit cost, purchases through the
Research pane, verifies Research Point production after advancing the fixture,
and checks balances/layout at 390px and 320px. Its two original screenshots
were moved unchanged from the former mixed Research/Energy spec. Installed
Chrome passed **1/1 in 5.9s** on port 6530 with no snapshot update:

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6530'
npm.cmd run test:e2e:focused -- tests/e2e/research/p13-research-narrow-context.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line
```

## P-44 Philosophy help and P-65 Research visual review (14 October 2026)

The relocated P-44 case checks Philosophy names, summaries, ability text, and repeatable upgrades in all six locales at 320px. The P-65 case captures Science Buildings, Tech Tree, and Expansionist Philosophy at desktop and phone widths across the reviewed theme/locale samples; its six screenshot baselines moved unchanged into this area. The two moved cases passed **2/2 in 11.7s** in installed Chrome on port 6571 with snapshot updates disabled. No product or assertion changes were needed.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6571'
$testOutput = Join-Path $env:TEMP 'miaplacidus-research-move-20261014'
npm.cmd run test:e2e:focused -- tests/e2e/research/p44-research-philosophy-help.spec.ts tests/e2e/research/p65-research-visual-review.spec.ts --project=chrome --workers=1 --retries=0 --trace=off --reporter=line --output="$testOutput"
```

P-65's six checked-in images are under `p65-research-visual-review.spec.ts-snapshots/`. Their contents were moved without refresh; the focused run confirmed them at the new path.

## Tech Tree capture stabilization (14 October 2026)

The P-65 locale/theme capture initially saw the Tech Tree viewport before its
`ResizeObserver` layout had settled, producing a taller blank graph viewport.
The visual output stabilized when the test waited for loaded fonts and two
animation frames with unchanged nonzero graph bounds. The shared
[`technologyTree.ts`](../_harness/technologyTree.ts) helper now guards the
Tech Tree screenshots in both Research and Technology specs. Installed Chrome
passed the focused P-65 case 1/1 on port 6440 and then all Research cases 12/12
on port 6441; no snapshot update was required.

## Economy catchall migration (14 October 2026)
Research-owned cases from the retired Economy catchall now live in [`economy-research.spec.ts`](economy-research.spec.ts), [`p05-research-energy-actions.spec.ts`](p05-research-energy-actions.spec.ts), [`p45-research-copy.spec.ts`](p45-research-copy.spec.ts), [`p51-research-energy-narrow-visual.spec.ts`](p51-research-energy-narrow-visual.spec.ts), and [`research-presentation-matrix.spec.ts`](research-presentation-matrix.spec.ts).
