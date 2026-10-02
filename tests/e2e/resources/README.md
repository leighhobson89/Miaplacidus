# Resources: Hydrogen slice

## Rule matrix

| Rule              | Normal path                                                                                                                                       | Failure/boundary path                                                                                                | Evidence                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Manual collection | Each accepted action adds 1 Hydrogen and updates the quantity/cap readout.                                                                        | Collection is disabled at the 150-Hydrogen cap.                                                                      | `hydrogen-loop.spec.ts`, `hydrogen.spec.ts`. |
| Sale              | Sell all whole units at $0.02 each; 3 units add $0.06 to $10.00 starting cash. USD remains the game currency when the interface language changes. | Sale is disabled with no whole unit available; a fractional remainder under 1 settles to zero as in the source rule. | `hydrogen-loop.spec.ts`, `hydrogen.spec.ts`. |
| Storage           | With 149 Hydrogen, buy one expansion for 149 and raise cap from 150 to 300.                                                                       | 148.99 cannot afford the purchase; rejection leaves state and events unchanged.                                      | `hydrogen-loop.spec.ts`, `hydrogen.spec.ts`. |

The source contract records fresh Hydrogen capacity/sale value and the reference storage behavior in [`foundation-economy.md`](../../../docs/audit/foundation-economy.md), grounded in `resourceDataObject.js` and `game.js`.

## Deterministic setup and debug commands

The browser fixture clears storage, uses seed `314159`, and starts a new named run. The storage test opens Test Lab and uses **Hydrogen storage ready**; it prepares 149 units by dispatching normal collect commands through the engine store. The manual sale case drives only player controls.

Run with `npm run test:e2e:focused -- tests/e2e/resources/hydrogen-loop.spec.ts`. Pure affordability, failure, sale precision and transaction-order checks are in `npm run test:unit:focused -- tests/unit/hydrogen.spec.ts tests/unit/foundation-engine.spec.ts`.

## Observed result

2 October 2026: 2/2 browser tests passed with screenshot baselines for collected Hydrogen, post-sale balance and expanded storage. The 11 focused unit tests also passed. These results cover Hydrogen only; seven other resources, fusion and the rest of the economy remain open. See the [M-01 record](../../../docs/archive/plans/2026-10-02-hydrogen-vertical-slice.md).
