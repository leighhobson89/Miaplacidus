# Resources: Hydrogen slice

## Rule matrix

| Rule              | Normal path                                                                                                                                       | Failure/boundary path                                                                                                | Evidence                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Manual collection | Each accepted action adds 1 Hydrogen and updates the quantity/cap readout.                                                                        | Collection is disabled at the 150-Hydrogen cap.                                                                      | `hydrogen-loop.spec.ts`, `hydrogen.spec.ts`. |
| Sale              | Sell all whole units at $0.02 each; 3 units add $0.06 to $10.00 starting cash. USD remains the game currency when the interface language changes. | Sale is disabled with no whole unit available; a fractional remainder under 1 settles to zero as in the source rule. | `hydrogen-loop.spec.ts`, `hydrogen.spec.ts`. |
| Storage           | With 149 Hydrogen, buy one expansion for 149 and raise cap from 150 to 300.                                                                       | 148.99 cannot afford the purchase; rejection leaves state and events unchanged.                                      | `hydrogen-loop.spec.ts`, `p45-hydrogen-storage-result.spec.ts`, `hydrogen.spec.ts`. |

The source contract records fresh Hydrogen capacity/sale value and the reference storage behavior in [`foundation-economy.md`](../../../docs/audit/foundation-economy.md), grounded in `resourceDataObject.js` and `game.js`.

## Deterministic setup and debug commands

The browser fixture clears storage, uses seed `314159`, and starts a new named run. The storage test opens Test Lab and uses **Hydrogen storage ready**; it prepares 149 units by dispatching normal collect commands through the engine store. The manual sale case drives only player controls.

Run the resource browser cases with `npm run test:e2e:focused -- tests/e2e/resources`. Pure affordability, failure, sale precision and transaction-order checks are in `npm run test:unit:focused -- tests/unit/hydrogen.spec.ts tests/unit/foundation-engine.spec.ts`.

The six-locale Hydrogen storage purchase result case is [`p45-hydrogen-storage-result.spec.ts`](p45-hydrogen-storage-result.spec.ts). The P-14 keyboard/touch allocation case is owned by the [Automation area](../automation/README.md).

## Observed result

2 October 2026: 2/2 browser tests passed with screenshot baselines for collected Hydrogen, post-sale balance and expanded storage. The 11 focused unit tests also passed. These results cover Hydrogen only; seven other resources, fusion and the rest of the economy remain open. See the [M-01 record](../../../docs/archive/plans/2026-10-02-hydrogen-vertical-slice.md).

5 October 2026: the Chrome `navigation-hierarchy.spec.ts` area passed 2/2. It checks source-ordered Gases/Solids links, hides Solids before a solid is unlocked, and confirms Resources rail collapse choices survive reload/resume. Its 390px visual checkpoint was refreshed after inspecting the mobile layout; both the Resources rail and game page stay within the viewport.

9 October 2026 P-05 keyboard action follow-up: Cosmic Forge's Hydrogen storage action is configured with `disableKeyboardForButton: true` in `cosmicForge/cosmicForge/drawTab1Content.js` (the `hydrogenIncreaseStorageRow` action); the remake uses a semantic button. The new `@p05` browser case prepares 149 Hydrogen with normal collect commands through the test gateway, tabs from Collect to Increase storage, activates it with Enter, and confirms capacity rises to 300 while stock falls to zero. The focused installed-Chrome command `npm.cmd run test:e2e:focused -- tests/e2e/resources/hydrogen-loop.spec.ts --workers=1 --retries=0 --trace=off --reporter=line -g @p05` passed 1/1. Manual Hydrogen collection by keyboard is also covered in `tests/e2e/app-boot/hydrogen-boot.spec.ts`; the broader P-05 action audit remains open.

14 October 2026 navigation hierarchy rerun: the mobile fixture now dismisses
and verifies removal of the first-run tutorial before its screenshot. The
reviewed `resource-groups-mobile.png` baseline was refreshed for the current
Resource and Hydrogen page layout. The collapse-state assertions after reload
are scoped to the Resources rail because the Compounds rail has its own group
controls with the same test IDs. The full spec passed 2/2 without snapshot
updates on rerun.

```powershell
$navigationOutput = Join-Path $env:TEMP 'miaplacidus-resource-navigation-full-20261014'
.\node_modules\.bin\playwright.cmd test tests/e2e/resources/navigation-hierarchy.spec.ts --workers=1 --reporter=list --output=$navigationOutput
```
