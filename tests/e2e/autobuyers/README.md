# Autobuyers: Hydrogen compressor slice

## Rule matrix

| Rule                      | Normal path                                                                                                       | Failure/boundary path                                                            | Evidence                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| First Hydrogen compressor | Buy at 50 Hydrogen; advertised output is 2 Hydrogen/s.                                                            | Purchase selector and engine command reject insufficient stock without spending. | `hydrogen-compressor.spec.ts`, `hydrogen.spec.ts`. |
| Repeat price              | Repeated 1.13 scaling with ceiling produces 50, 57, then 65 Hydrogen.                                             | Affordability is checked from engine state, not button text.                     | `hydrogen.spec.ts`.                                |
| Run/pause                 | Advance the injected clock by 10 seconds to produce 20 Hydrogen; pause, advance another 10 seconds and retain 20. | A paused buyer shows 0/s and makes no new production.                            | `hydrogen-compressor.spec.ts`.                     |

The reference source contract documents the Hydrogen compressor and repeated purchase-price behavior in [`foundation-economy.md`](../../../docs/audit/foundation-economy.md), based on `resourceDataObject.js` and `game.js`.

## Deterministic setup and debug commands

The shared fixture uses seed `314159` and a fresh named run. **Hydrogen ready to buy** dispatches 50 normal `resource.collect` commands as a batched notification through the engine store. **Advance 10 seconds** advances the injected clock through bounded clock commands. Each command is written to the replay log.

Run with `npm run test:e2e:focused -- tests/e2e/autobuyers/hydrogen-compressor.spec.ts`; unit rules are in `tests/unit/hydrogen.spec.ts`.

## Observed result

2 October 2026: 1/1 compressor browser test passed; it produced exactly 20 units in 10 seconds and remained at 20 after pause. Screenshot baselines cover the active, producing and paused states. First-slice price, stock and atomicity checks passed in the focused unit run. This does not cover the other Hydrogen tiers or other buyer systems.
