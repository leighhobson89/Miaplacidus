# Autobuyers: Hydrogen compressor slice

## Phase 7 localized source Autobuyer routes

`p7-source-autobuyer-locales.spec.ts` checks the source-named Autobuyer rows and
their descriptions in all six locales using the full economy fixture. The
Cosmic Forge uses each Material or Compound tier's `nameUpgrade` key from
`resourceDataObject.js` for row labels in `drawTab1Content.js` and
`drawTab4Content.js`. In MIAPLACIDUS, Resource summaries on their active
Resource pages and Compound summaries on their active Compound pages render
the localized Autobuyer name followed by the localized `buyTier` label and
tier number. Hydrogen Tier 1 is the exception: its dedicated heading is
`#hydrogen-autobuyer-title`, populated by the localized Hydrogen Compressor
name, and the current remake does not show a visible tier numeral in that
heading. The spec checks this heading separately. `descriptions.js` routes the matching
`optionDesc{Good}AutoBuyer{Tier}Content1` values for eight Materials and six
Compounds, plus `optionDescResearchAutoBuyerContent1`. The Hydrogen tier 1
label and help use `#hydrogen-autobuyer-title` and `#hydrogen-autobuyer-help`;
other Material and Compound rows use their `*-autobuyer-{tier}-summary` and
`*-autobuyer-{tier}-help` IDs. Research help is checked at
`data-testid="research-autobuyer-help"` in the Science Buildings pane.

The source `localization.json` values for every active key are present in all
six locales. The all-locale row-name assertions are **AUTHORED, NOT RUN** for
Phase 8 V-59. `autoBuyerNameSolarAB1` through `autoBuyerNameSolarAB4` are omitted
because the inspected source UI has no rendered Autobuyer route for those
keys. The shared full fixture pre-unlocks Materials, Compounds, and Nano
Brokers III, so the spec can inspect each row without gameplay progression.
Execution is deferred to Phase 8.

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

14 October 2026 focused recovery: the Test Lab helper now opens its lazily mounted dialog before waiting for it, and this case expands the collapsed Hydrogen Autobuyers section before buying. The pause/resume assertion uses the tier button's accessible name and `aria-pressed` state. The three snapshots were reviewed against the current Terminal renderer and refreshed; the focused case passed **1/1** both while refreshing and again without update mode on port 4199. All runner artifacts were written under system Temp.


## Economy catchall migration (14 October 2026)
Autobuyer-owned cases from the retired Economy catchall now live in [`economy-autobuyers.spec.ts`](economy-autobuyers.spec.ts) and [`p44-auto-create-allocation-help.spec.ts`](p44-auto-create-allocation-help.spec.ts).

The canonical Autobuyers folder passed **9/9** in installed Chrome on 14 October 2026, with snapshot updates disabled.

```powershell
$env:MIAPLACIDUS_BROWSER_CHANNEL='chrome'
$env:MIAPLACIDUS_DISABLE_VIDEO='1'
$env:MIAPLACIDUS_TEST_PORT='6431'
npm.cmd run test:e2e:focused -- --workers=1 --retries=0 --trace=off --reporter=line tests/e2e/autobuyers
```
