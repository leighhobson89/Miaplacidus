# P-45 Random-event journal default Rocket names audit

**Date:** 12 October 2026  
**Scope:** Default Rocket-name localization in the Events Journal's random-event details.

Cosmic Forge obtains Rocket names through `getRocketUserName()` in `constantsAndGlobalVars.js:4171-4177`. The helper recognizes stored `Rocket 1`–`Rocket 4` values as defaults and returns the active locale's `rocketDefaultName`. Its random-event paths use that helper for instant arrival (`events.js:360-372`), Antimatter Reaction (`events.js:490-521`), and the active Miner Broke Down detail (`events.js:856-875`). The source description keys are `eventDescRocketInstantArrivalNamed`, `eventDescAntimatterReaction`, and `eventDescMinerRateZeroNamed` in `localization.json`.

MIAPLACIDUS stores the event-time Rocket name in each history detail, then `MetaJournalPane.tsx` calls `randomEventHistoryDescription()` from `randomEventDescription.ts` to render it. Before this correction, all three named-description branches passed the stored name directly, so an unrenamed Rocket appeared as English `Rocket N` in non-English journal locales. The renderer now passes the placeholder through `localizedRocketUserName(locale, ...)`, which localizes only the default pattern and leaves custom names unchanged.

| Source key | Target key | Target renderer | Placeholder |
| --- | --- | --- | --- |
| `eventDescRocketInstantArrivalNamed` | `eventDescRocketInstantArrivalNamed` | `randomEventHistoryDescription()` → `MetaJournalPane.tsx` | `{rocketName}` |
| `eventDescAntimatterReaction` | `eventDescAntimatterReaction` | `randomEventHistoryDescription()` → `MetaJournalPane.tsx` | `{rocketName}` |
| `eventDescMinerRateZeroNamed` | `eventDescMinerRateZeroNamed` | `randomEventHistoryDescription()` → `MetaJournalPane.tsx` | `{rocketName}` |

The source and target `rocketDefaultName` catalogue values match for all six locales: en `Rocket {index}`, es `Cohete {index}`, pt `Foguetão {index}`, de `Rakete {index}`, it `Razzo {index}`, fr `Fusée {index}` (`localization.json`; `rocketMessages.ts`). Custom player names remain verbatim. The event-description templates and their placeholders were not changed.

### Separate active-row discrepancy

Cosmic Forge rebuilds current active descriptions from timed-effect state on each `getTimedEffectsUiSnapshot()` call (`events.js:856-883, 1078-1091`): Miner Broke Down reads the current Rocket name, and Supply Chain Disruption reads the current good and percentage. MIAPLACIDUS previously rendered active rows from the latest history entry, which kept a renamed Rocket's trigger-time name and left pre-v47 history without `details` generic despite active target data.

The active list now uses a distinct `randomEventActiveEffectDescription()` path, gated on a matching event ID and positive remaining time. `minerBrokeDown` reads `ActiveRandomEvent.targetId`, validates it against `ROCKET_IDS`, and uses the current Rocket name through `localizedRocketUserName`. `supplyChainDisruption` validates its active multiplier by recovering an integer 60–80% reduction and uses the active `targetId` when it is an economic good; if the target is unavailable but the multiplier is valid, it uses the source generic percentage description. If current fields are absent or invalid, it safely falls back to the stored history description. Thus v47-era entries without `details` can still show a named live detail when the active effect carries sufficient state, without inventing a target or amount. Target fields come from `ActiveRandomEvent` (`metaSignals.ts`) and the event creation paths (`randomEvents.ts`); the active row call is in `MetaJournalPane.tsx`.

| Source active-detail key | Target key | Active renderer | Active fields |
| --- | --- | --- | --- |
| `eventDescMinerRateZeroNamed` | `eventDescMinerRateZeroNamed` | `randomEventActiveEffectDescription()` → active list in `MetaJournalPane.tsx` | `{rocketName}` from current `rockets[targetId].name` |
| `eventDescMinerRateZero` when no valid Rocket target is present | `eventDescMinerRateZero` | `randomEventActiveEffectDescription()` → active list in `MetaJournalPane.tsx` | no placeholder |
| `eventDescProductionReducedNamed` | `eventDescProductionReducedNamed` | `randomEventActiveEffectDescription()` → active list in `MetaJournalPane.tsx` | `{itemName}` from `targetId`; `{percentDown}` recovered from `multiplier` |
| `eventDescProductionReduced` when no valid good target is present | `eventDescProductionReduced` | `randomEventActiveEffectDescription()` → active list in `MetaJournalPane.tsx` | `{percentDown}` recovered from a valid active multiplier |

The completed-history list still calls `randomEventHistoryDescription()` and uses its saved event-time `details`; the live effect helper is never used there or after expiry. This keeps current-state reconstruction out of historical rows. The six-locale source/target description keys and placeholders are unchanged.

This was a static source-data and renderer comparison. No tests, builds, typechecks, formatting, or browser checks were run. P-45 remains open for the broader rendered locale review.
