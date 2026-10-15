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

14 October 2026 P-05 area split: the combined Resource/Compound mobile case is
now two independently runnable specs. Resources checks all eight materials;
Compounds checks all six compound pages. The original shared setup attempted
to sell from an empty fixture, where the Sell action was correctly disabled.
The Resources case now prepares stock through the test engine gateway and
disables automatic Compound creation before checking sell/collect behavior.
The Compounds case prepares stock before checking sell/create behavior. Each
case passed 1/1 in installed Chrome (Resources 14.4s on port 6552; Compounds
11.9s on port 6553). Both passed together in default Chromium, 2/2 in 21.6s
on port 6554. Both widths, 320px and 390px, passed the hit-area and overflow
checks. No gameplay implementation changed.

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/resources/p05-resource-actions.spec.ts
npm.cmd run test:e2e:focused -- tests/e2e/compounds/p05-compound-actions.spec.ts
```

```powershell
$navigationOutput = Join-Path $env:TEMP 'miaplacidus-resource-navigation-full-20261014'
.\node_modules\.bin\playwright.cmd test tests/e2e/resources/navigation-hierarchy.spec.ts --workers=1 --reporter=list --output=$navigationOutput
```


## Economy catchall migration (14 October 2026)
Resource-owned cases from the retired Economy catchall now live in [`economy-resources.spec.ts`](economy-resources.spec.ts), [`p13-resource-compound-narrow-context.spec.ts`](p13-resource-compound-narrow-context.spec.ts), [`p45-hydrogen-collection-result.spec.ts`](p45-hydrogen-collection-result.spec.ts), and [`p56-resource-compound-visual-matrix.spec.ts`](p56-resource-compound-visual-matrix.spec.ts).

The canonical Resources folder passed **23/23** in installed Chrome on 14 October 2026, with snapshot updates disabled. This includes the six-locale result cases and the full P-56 locale/theme/viewport matrix.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6430'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/resources
```

## Phase 7 production-rate allocation breakdown locale route

[`p7-production-allocation-breakdown-locales.spec.ts`](p7-production-allocation-breakdown-locales.spec.ts)
routes Cosmic Forge `ui.js#buildAllocationLines` through a separate production-
rate information tooltip in Hydrogen and all seven other Resource pages. It
checks the six-locale allocatable, cash, compound ceiling and per-compound
diversion, storage, and auto-sell income rows, including a compound share left
unused when Oxygen allocation limits an ingredient. This production breakdown
uses the active one-second simulation preview and remains separate from the
allocation slider instructions. `tooltipAllocationHeading`,
`tooltipAllocationAllocatable`, `tooltipAllocationToCash`,
`tooltipAllocationCeiling`, `tooltipResourcesDivertedToCreate`,
`tooltipAllocationToStorage`, and `tooltipAutoSellIncome` are routed through
`resourceAllocationBreakdownMessages.ts`. The spec is **AUTHORED, NOT RUN**;
execution is deferred to Phase 8. Compound-rate breakdown remains open and is
documented in the [Economy evidence](../economy/README.md#phase-7-resource-production-rate-allocation-breakdown).

## Phase 7 allocation slider guidance

The Resource allocation slider uses the source handle names, conditional
compound-off and compound-throttled guidance, and the hint to open the separate
production breakdown. The six-locale authored coverage and exact source-key
mapping are documented in the [Economy evidence](../economy/README.md#phase-7-resource-allocation-tooltip-locale-route).
The locale spec is **AUTHORED, NOT RUN**.
