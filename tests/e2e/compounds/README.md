# Compounds E2E coverage

Compounds is a separate Cosmic Forge source area and has its own focused runner directory. The P-05 mobile-action case visits each compound page and exercises its visible create, sell, storage, and autobuyer controls with touch and keyboard input.

## Phase 7 localized source route

Cosmic Forge `drawTab4Content.js` places localized `textAuto` (`Auto:`) beside each compound auto-create toggle; `game.js` shows that pair when the auto-create perk is unlocked. MIAPLACIDUS adapts this to the localized `economyMessages.ts#automaticCreation` checkbox label in the active Compound child page. The route is `App.tsx` selected Compound child → `EconomyPanes.tsx` `CompoundPanel` → `CompoundCatalogue` → `CompoundGoodPane` → `CompoundAutobuyerDetails`; the renderer reads the current `state.settings.locale`. The target label is populated in English, Spanish, Portuguese, German, Italian, and French.

`p45-compound-result-locale.spec.ts` includes a focused six-locale assertion for this route (`@p7-text-auto`). It checks the rendered Diesel Compound child against the selected locale's target label. The spec is **AUTHORED, NOT RUN**.

## Phase 7 compound production-rate tooltip

Cosmic Forge `ui.js#setupProductionRateTooltips` routes a Compound's production-rate tooltip through `buildAllocationLines`; for `category === 'compounds'`, its sole allocation row is `tooltipAllocationToStorage` populated with that Compound's displayed net rate. MIAPLACIDUS renders the corresponding one-row tooltip beside each active Compound rate in `EconomyPanes.tsx#EconomicGoodHero` / `CompoundProductionRateTooltip`, using the localized `resourceAllocationBreakdownMessages.ts#storage` template. The route is only the Compound net rate to storage; it does not include the Resource-only allocation, autosell, or per-compound-consumption breakdown.

`tooltipAutoCreationLabel` and `tooltipAllocationThrottledBy` are separate source rows from `ui.js#buildAutoCreateGenerationLine`. The current target tooltip shows the simulated auto-create output rate when that Compound's auto-create toggle is on and names the ingredient limiting it when the preview identifies one. The storage-rate row remains separate. The route is rendered by `EconomyPanes.tsx#CompoundProductionRateTooltip` through `resourceAllocationBreakdownMessages.ts`.

`p7-compound-production-rate-storage-locale.spec.ts` checks the selected-locale storage row, auto-create rate, and conditional limiting-resource row on Diesel's active rate in all six locales. It is **AUTHORED, NOT RUN**; no tests or validation were run for this addition.

## Phase 7 Compound creation quantity presets

Cosmic Forge `constantsAndGlobalVars.js` defines the per-Compound options
`compoundCreateFillToCapacity`, `compoundCreateMaxPossible`, and
`compoundCreateUpTo75/67/50/33`; `drawTab4Content.js` places those options in
each Compound creation quantity selector. The active MIAPLACIDUS
`EconomyPanes.tsx#CompoundGoodPane` has a numeric Amount spinbutton and Create
action but no quantity-preset selector. The numeric Amount field is a remake
control, not a destination for these source preset labels, so no replacement
selector or unused localization keys were added. The selected-locale Amount
and Create controls are covered by
[`../economy/p7-resource-row-action-locales.spec.ts`](../economy/p7-resource-row-action-locales.spec.ts),
authored but not run.

Compound autobuyer `textAdd`, `textPerSecond`, and `textQuantity` source routes
are documented in the [Economy README](../economy/README.md#phase-7-resource-and-compound-autobuyer-add-rate-copy)
and covered by
[`p7-autobuyer-add-rate-locales.spec.ts`](../economy/p7-autobuyer-add-rate-locales.spec.ts)
(**AUTHORED, NOT RUN**).

## Phase 7 source resource short labels

Cosmic Forge's `resourceShortIron`, `resourceShortCarbon`,
`resourceShortSodium`, `resourceShortNeon`, `resourceShortHydrogen`,
`resourceShortOxygen`, and `resourceShortSilicon` are read by
`game.js#setCompoundRecipePricesAfterRepeatables`,
`resourceDataObject.js#addPermanentCompoundsModifiersBackIn`, and
`achievements.js` while rebuilding the six quantity-preset labels configured
in `constantsAndGlobalVars.js` and rendered by `drawTab4Content.js`.
MIAPLACIDUS has no quantity-preset selector: `EconomyPanes.tsx#CompoundGoodPane`
uses a numeric Amount field and renders ingredient recipes with full localized
resource names. The source abbreviations therefore have no direct target UI
route, and no replacement preset or unused shorthand catalogue was added.

[`p7-resource-short-labels-locales.spec.ts`](p7-resource-short-labels-locales.spec.ts)
checks that the seven resources appear by their selected-locale full names
across the six active Compound recipes in every locale. This covers the
current recipe presentation; it does not claim that the source quantity
presets exist in MIAPLACIDUS. The spec is **AUTHORED, NOT RUN**.

## Deterministic setup

The spec starts a clean `storage-all` fixture, then uses the test-only engine gateway to grant deterministic stock and room for one create action. It verifies that the auto-create toggle changes state before buying or creating. Test stock is prepared through the engine boundary; gameplay outcomes are checked through visible controls and state changes.

Run with:

```powershell
npm.cmd run test:e2e:focused -- tests/e2e/compounds/p05-compound-actions.spec.ts
```

## Focused result — 14 October 2026

The P-05 case passed **1/1 in 11.9 seconds** in installed Chrome on port 6553. The Resources and Compounds split then passed together in default Chromium, **2/2 in 21.6 seconds** on port 6554. Both widths (320px and 390px) stayed within the viewport, and every measured interactive target met the 44px minimum. Output is under `%TEMP%\miaplacidus-p05-compounds-6553` and `%TEMP%\miaplacidus-p05-resource-compounds-6554`.


## Economy catchall migration (14 October 2026)
Compound-owned cases from the retired Economy catchall now live in [`economy-compounds.spec.ts`](economy-compounds.spec.ts), [`economy-compounds-navigation.spec.ts`](economy-compounds-navigation.spec.ts), [`p45-compound-result-locale.spec.ts`](p45-compound-result-locale.spec.ts), and [`p45-water-storage-shortfall-locale.spec.ts`](p45-water-storage-shortfall-locale.spec.ts).

The canonical Compounds folder passed **8/8** in installed Chrome on 14 October 2026, with snapshot updates disabled.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6429'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/compounds
```
