# P-44 random-event start-dialog audit

**Date:** 12 October 2026  
**Scope:** Source-backed result dialogs opened after successful random-event starts.

Cosmic Forge calls `showEventModal(picked, modalReplacements)` after every successful random-event trigger (`../../../../cosmicForge/cosmicForge/events.js:294-647, 1380-1431`). Its `showEventModal` maps all 13 event IDs to localized `modalEvent*Header` and `modalEvent*Text` keys, then presents a confirm-only popup with `buttonOk` (`../../../../cosmicForge/cosmicForge/ui.js:15390-15429,15448-15495`). The modal strings and placeholders are present in all six locale blocks of `localization.json`.

MIAPLACIDUS now routes all 13 `random-event.triggered` IDs into the same FIFO result-dialog queue used for timed-event expiry results. Each start copy is keyed by event ID and preserves the six source locale strings. Dynamic values come from the matched event-history entry: destroyed building, research amount, rocket name, asteroid name, Antimatter amount, lost-stock amount/item, event duration, miner target, or disrupted good and percentage. Default rocket names and good/building names use the target's localized name catalogues; quantities use the selected remake notation, with standard notation flooring values like Cosmic Forge's normal notation. Target event durations are shown in rounded whole minutes. A zero-gain Research Breakthrough displays `+0`, matching the source. If history is unavailable, fallbacks use localized generic descriptions: the source `eventDescRocketFallbackName` for an unidentified rocket and generic Power Plant/Battery labels rather than asserting Rocket 1 or a specific building tier.

An independent static comparison matched all 13 event titles, summaries, body lines, placeholder names, and tones in all six locales. The target `OK` label matches source `buttonOk` in all six locales.

## Source-key to target-catalogue crosswalk

The shared destination for every row is `App.tsx` → `createRandomEventTriggeredNoticeHandler` → `randomEventStartDialogText` → the global `RandomEventResultDialog` queue. The modal is owned by the global result layer because Cosmic Forge's `showEventModal` is a global UI handler; it is not folded into a tab or child-page renderer. The target body splits source text before and after `<br><br>` into `summary` and `lines`, while keeping each row's placeholders in the same localized event definition.

| Event ID | Cosmic Forge source keys | Source placeholders | MIAPLACIDUS destination |
| --- | --- | --- | --- |
| `powerPlantExplosion` | `modalEventPowerPlantExplosionHeader`, `modalEventPowerPlantExplosionText` | `{destroyedBuilding}` | `randomEventStartDialogMessages[locale].powerPlantExplosion.title`, `.summary`, `.lines` |
| `batteryExplosion` | `modalEventBatteryExplosionHeader`, `modalEventBatteryExplosionText` | `{destroyedBuilding}` | `randomEventStartDialogMessages[locale].batteryExplosion.title`, `.summary`, `.lines` |
| `scienceTheft` | `modalEventScienceTheftHeader`, `modalEventScienceTheftText` | `{amountStolen}` | `randomEventStartDialogMessages[locale].scienceTheft.title`, `.summary`, `.lines` |
| `researchBreakthrough` | `modalEventResearchBreakthroughHeader`, `modalEventResearchBreakthroughText` | `{amountGained}` | `randomEventStartDialogMessages[locale].researchBreakthrough.title`, `.summary`, `.lines` |
| `rocketInstantArrival` | `modalEventRocketInstantArrivalHeader`, `modalEventRocketInstantArrivalText` | `{rocketName}` | `randomEventStartDialogMessages[locale].rocketInstantArrival.title`, `.summary`, `.lines` |
| `starshipLostInSpace` | `modalEventStarshipLostInSpaceHeader`, `modalEventStarshipLostInSpaceText` | none | `randomEventStartDialogMessages[locale].starshipLostInSpace.title`, `.summary`, `.lines` |
| `antimatterReaction` | `modalEventAntimatterReactionHeader`, `modalEventAntimatterReactionText` | `{rocketName}`, `{asteroidName}`, `{antimatterLost}` | `randomEventStartDialogMessages[locale].antimatterReaction.title`, `.summary`, `.lines` |
| `stockLoss` | `modalEventStockLossHeader`, `modalEventStockLossText`; `stockLossReasonStorage`, `stockLossReasonTheft`, `stockLossReasonContainment`, `stockLossReasonSupplyChain` | `{lostPercent}`, `{itemName}`, `{reason}` | `randomEventStartDialogMessages[locale].stockLoss.title`, `.summary`, `.lines`; `stockLossReasons[locale]` |
| `galacticMarketLockdown` | `modalEventGalacticMarketLockdownHeader`, `modalEventGalacticMarketLockdownText` | none | `randomEventStartDialogMessages[locale].galacticMarketLockdown.title`, `.summary`, `.lines` |
| `endlessSummer` | `modalEventEndlessSummerHeader`, `modalEventEndlessSummerText` | `{minutes}` | `randomEventStartDialogMessages[locale].endlessSummer.title`, `.summary`, `.lines` |
| `minerBrokeDown` | `modalEventMinerBrokeDownHeader`, `modalEventMinerBrokeDownText` | `{rocketName}` | `randomEventStartDialogMessages[locale].minerBrokeDown.title`, `.summary`, `.lines` |
| `supplyChainDisruption` | `modalEventSupplyChainDisruptionHeader`, `modalEventSupplyChainDisruptionText` | `{itemName}`, `{percentDown}` | `randomEventStartDialogMessages[locale].supplyChainDisruption.title`, `.summary`, `.lines` |
| `blackHoleInstability` | `modalEventBlackHoleInstabilityHeader`, `modalEventBlackHoleInstabilityText` | `{minutes}` | `randomEventStartDialogMessages[locale].blackHoleInstability.title`, `.summary`, `.lines` |

`buttonOk` maps to `confirmLabels[locale]` and is shared by start and expiry results.

The source's red-disabled, green-ready, and warning-orange emphasis maps to the target's semantic text classes. Warp Anomaly colors only its rocket-name placeholder green; the rest of that line stays in normal text. Supply Chain Disruption and Black Hole Instability use the warning color.

The start-result dialog is queued regardless of the notification preference, matching the separate source modal. Its existing five-second toast remains preference-gated. Start and expiry results share one dialog instance, wait for any other open modal, dismiss through OK or native Escape/cancel, and restore focus after the queue drains. No simulation rule or simulation PRNG state changed.

**Stock Loss reason mapping:** Cosmic Forge's `stockLoss` trigger picks one of four causes and returns it with the event result (`events.js:529-549,1184-1192`). MIAPLACIDUS now selects one matching localized cause for the start dialog in each of the six locales via `randomEventStartDialogStockLossReason`; this uses `Math.random()` for presentation and does not consume `state.run.random`. The target event-history schema still stores the lost good and percentage but not the chosen reason, so the reason exists only in the prepared dialog copy.

**Starship Lost navigation adaptation:** Cosmic Forge resets its current Interstellar `star map`, `fleet hangar`, or `colonise` pane to the `intro` view after the event (`ui.js:15428-15440`). The remake has no Interstellar intro child. Losing the Starship removes the now-locked Fleet Hangar and Colonise destinations, and the existing selected-pane resolver falls back to the first eligible child, Star Map; an already selected Star Map remains selected. Star Data remains a separate child and is not reset. This preserves the owner's target page ownership and child set while documenting the source difference.

Source start-modal coverage is now implemented, but rendered review and the broader P-44 message-key/page-owner crosswalk remain open. Static inspection confirmed the four source reason strings are represented in the target helper for all six locales; no tests, builds, typechecks, formatters, or browser checks were run.
