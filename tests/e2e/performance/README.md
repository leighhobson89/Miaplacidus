# Performance baseline: first Hydrogen screen

## Measurement matrix

| Target                      | Deterministic setup                                                                                                                                        | Metric/source                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Fresh playable screen       | Seed `314159`, English, 1280×720 viewport, named run on the Hydrogen pane; sample for about 5 seconds.                                                     | App frame counter plus Chrome DevTools heap, DOM-node and event-listener metrics.          |
| Late-game comparison target | See the planned pre-Cosmic-Rip fixture in [`tests/fixtures/README.md`](../../fixtures/README.md). It is a design only until those systems are implemented. | Reuse the same browser, viewport, sample duration and metric names for a later comparison. |

Run with `npm run test:e2e:focused -- tests/e2e/performance/hydrogen-baseline.spec.ts`. The test attaches `hydrogen-baseline.json` and prints a `HYDROGEN_BASELINE` record. Add `MIAPLACIDUS_BROWSER_CHANNEL=chrome` when needed.

## Observed result

2 October 2026, Chrome 153.0.8010.12, seed `314159`, English, 1280×720, 5.067 seconds: 306 frames (60.40 FPS), 9.24 MiB JavaScript heap used / 13.35 MiB total, 1,270 DOM nodes, 210 event listeners. This is a local baseline, not a performance acceptance threshold or a late-game measurement.
