# Meta progression contract — rebirth and AP perks

**Status:** completed and archived 4 October 2026. Covers G-01–G-08. The source baseline is [the meta/endgame catalogue](../../audit/foundation-meta.md), cross-checked against the pinned Cosmic Forge `game.js`, `resourceDataObject.js` and the current MIAPLACIDUS state/space engine. The source remains read-only.

## Rule contract

- A run becomes rebirth-eligible when its conquest-specific gate is complete and a destination star exists. MIAPLACIDUS currently represents that gate with the once-per-run settlement/AP flag and the last newly settled system. The newly settled destination becomes the next run's starting system. Rebirth grants one GP for that new system, plus one for each extra system settled by an active Expansionist ability; the GP wallet is adjusted for prior GP spending.
- Reject rebirth while an active battle or travel timer is running. A failed command returns the original state unchanged.
- Rebirth is one immutable transition. It creates fresh run resources/buildings/research, resets run timers and exploration activity, increments the rebirth count, and retains AP, GP, purchased AP perks, philosophy selection, player settings and lifetime statistics. Casino CP resets to zero, and active Wheel/Higher-or-Lower claims clear; casino history, lifetime counters, configured odds and game-win IDs persist.
- Keep the settled-system history and the just-settled star's generated profile. Initialize weather for that star through the existing deterministic weather path. Preserve the source-generated AP profile and do not award its AP again during rebirth. GP is granted at rebirth, not at settlement. The source confirmation uses the localized warning, exact AP carry-over line, and GP gain line only after Cosmic Rip unlock; the AP/GP lines are red at zero AP and green otherwise.
- Preserve only source-listed automation choices: allocation percentages/enablement, compound auto-creation, the research auto-buyer choice, and the auto-telescope enabled/mode choice when that permanent perk is owned. Reset other run-level toggles with their run state.
- Purchased AP perks retain their source pricing: one-time base prices, `baseCost × multiplier^level` repeatables, and Nano Brokers' `[15, 30, 50]` ladder. Apply each perk through the existing permanent perk IDs so the economy and space modifiers continue to use the same authoritative list.
- On rebirth, Little Bag of Hydrogen grants 50 Hydrogen. Non-Exhaustive Resources unlocks all eight materials and gives enough starter stock for one Tier 1 buyer of each, expanding capacity when that stock exceeds the base cap. Jumpstart Research grants technologies priced at or below 4,200 whose prerequisites are also in that grant set; it grants no research points or technology costing more than 4,200.

## State ownership and reset matrix

| Owner | Fields | Rebirth behavior |
|---|---|---|
| Run | pioneer identity, cash/research, material/compound quantities and capacities, unlocked resources/compounds, buildings/buyers, current simulation clock/random stream/timers, surveys/rockets/starship/battle/weather and current-run counters | Replace from the initial-run factory. Carry the last settled star profile into the new run, set it as `currentSystemId`, initialize its weather, and then apply purchased starter perks. Reset the one-run AP award flag. |
| Run automation preferences | resource allocation, compound auto-creation, research auto-buyer and auto-telescope enabled/mode | Preserve the source-listed choices. Copy telescope mode/enabled only when the permanent auto-telescope perk is owned. Reset other run toggles. |
| Permanent | rebirth count, AP balance, GP balance, purchased perk IDs/levels, philosophy choice, settled-system history, O-type plant assignments, casino history/lifetime counters/configured odds/game-win IDs | Preserve these fields; increment rebirth count and award GP from the newly settled system count, adjusted for recorded GP spending. AP purchases spend AP exactly once. Reset casino CP to zero and clear unclaimed/unfinished Wheel and Higher-or-Lower actions. |
| Settings | locale, theme, notation, sound, reduced motion | Preserve unchanged. |
| Lifetime statistics | cash earned, goods produced, antimatter mined, foreground active milliseconds, accepted-command count, completed timers | Preserve; `lifetimeActiveMs` accumulates only foreground elapsed time and is used by the 50-hour achievement. The rebirth command increments the accepted-command count once like every accepted command. |

## UI and failure states

Tab 7 becomes available after a system is settled (or on a later rebirth). Its AP balance and the 16 stable perk rows are derived from engine state; GP is shown with Cosmic Rip rather than on this pane. Costs, levels and maxed state come from the same catalogue used by command validation. The rebirth confirmation uses source text and carry-over values before dispatching the single `meta.rebirth` command. A locked control identifies the missing award/destination or active battle/travel and does not dispatch. Commands recheck every precondition even if a control was stale.

## Focused acceptance coverage

- Unit: unavailable first run; travel and battle blocking; first and second rebirth; chosen new-system identity/profile; reset versus retained fields; all starter perks; AP exact-cost/insufficient/maxed paths; Nano Brokers ladder; versioned save envelope round-trip of rebirth state.
- Browser: visible Tab 7, AP spend, confirmation/cancel, second rebirth, new-system and perk state. Save/reload is checked using the normal local slot path.
- Source mapping and current results belong in `tests/e2e/ascendency/README.md` and the meta rows of the parity ledger. A browser result is not recorded as passing when the Playwright browser executable is unavailable.

## Observed source paths

- `game.js`: `calculateAscendencyPoints`, `settleSystemAfterBattle`, `rebirthPreconditionsMet`, `rebirth`.
- `resourceDataObject.js`: `ascendencyBuffs`, `getAscendencyBuffCost`, `REBIRTH_PERSISTED_AUTOMATION`, and `resetResourceDataObjectOnRebirthAndAddApAndPermanentBuffsBack`.
- MIAPLACIDUS: `src/engine/spaceMechanics.ts` settlement/AP award; `src/content/ascendency.ts` perk definitions/costs; `src/engine/metaProgression.ts` atomic reset and purchase; `src/app/AscendencyPane.tsx` player controls.

Any change to a source value or reset rule must be recorded here with a player-facing reason and a focused acceptance case before the parity claim changes.
