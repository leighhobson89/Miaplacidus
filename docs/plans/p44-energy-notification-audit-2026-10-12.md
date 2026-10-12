# P-44 Energy notification audit — 12 October 2026

**Scope:** compare Cosmic Forge Energy purchase and result notices with the current MIAPLACIDUS Energy routes and six locale catalogues. This is a static source/UI audit; no tests, builds, typechecks, browser sessions, or save interactions were run.

## Findings

| Action/result | Cosmic Forge source | MIAPLACIDUS target | Result |
| --- | --- | --- | --- |
| Buy power plant or battery | `drawTab2Content.js` dispatches the purchase and updates the row without a success notification. | `EconomyPanes.tsx` dispatches `economy.building.purchase`; ownership and capacity update in the Energy cards without a notice. | Matched: no source toast is missing. |
| Toggle plant or grid | The Energy rows toggle plant and grid operation without a notification. | The Energy Power page dispatches the corresponding toggle commands without a notice. | Matched. |
| Energy achievements | `achievements.js:167` emits the achievement copy with type `achievement`, classification `achievement`, and 4000 ms. Source keys include `achievementNotificationBuildPowerPlant`, `achievementNotificationBuildSolarPowerPlant`, and `achievementNotificationTripPower`. | `achievementEventNotifications.ts` routes the stable `buildPowerPlant`, `buildSolarPowerPlant`, and `tripPower` IDs through `achievementNotificationCopy.generated.ts`, with the `achievement` classification and 4000 ms; the target uses its `success` card type and achievement styling. | All three routes and durations are present. No Energy-specific string or placeholder correction was identified. |
| Sell a power plant | Each of the three source plant rows exposes a one-unit sale. `game.js:sellBuilding()` refunds 40% of the current cash price and emits `notificationSoldPowerPlant` using the default info type, default classification, and 3000 ms. | The Energy Power cards have no sale command/control; the engine has no building-sale route. | Source action and notice are absent because the target does not offer this action. This is a broader feature-coverage gap, so adding only a toast catalog entry would leave it unreachable. |

## Source locale value for plant sale

The source `notificationSoldPowerPlant` template has the same `{currency}{cash}` placeholders in all six supported locales:

| Locale | Source template |
| --- | --- |
| English | `You sold a Power Plant!  Receive: {currency}{cash}` |
| Spanish | `¡Has vendido una planta de energía! Recibes: {currency}{cash}` |
| Portuguese | `Vendeste uma central elétrica! Recebes: {currency}{cash}` |
| German | `Du hast ein Kraftwerk verkauft! Du erhältst: {currency}{cash}` |
| Italian | `Hai venduto una centrale elettrica! Ricevi: {currency}{cash}` |
| French | `Vous avez vendu une centrale électrique! Vous recevez: {currency}{cash}` |

No code change was warranted in this Energy-only slice: supported Energy purchases and toggles already match the source's silent behavior, and the only missing source notice depends on an unsupported plant-sale action. The broader P-44 economy notice audit records that limitation as well.
