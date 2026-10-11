import { ECONOMY_BUILDING_NAMES } from "../content/economyBuildingNames";
import type { RandomEventHistoryEntry } from "../content/metaSignals";
import type { LocaleId } from "../content/ids";
import { randomEventDescriptionTemplate } from "../i18n/randomEventDescriptionMessages";
import { economyGoodName } from "./economyDisplay";
import { formatNumber, type NumberNotation } from "./numberFormatting";

/** Renders the source event description from locale-independent, event-time history details. */
export function randomEventHistoryDescription(
  locale: LocaleId,
  entry: RandomEventHistoryEntry,
  notation: NumberNotation,
): string {
  const details = entry.details;
  const amount = (value: number) => formatNumber(locale, value, 0, notation);
  switch (entry.id) {
    case "powerPlantExplosion":
      return details?.kind === "buildingDestroyed"
        ? randomEventDescriptionTemplate(locale, "eventDescBuildingDestroyed", {
            building: ECONOMY_BUILDING_NAMES[details.buildingId][locale],
          })
        : randomEventDescriptionTemplate(locale, "eventDescPowerPlantDestroyed");
    case "batteryExplosion":
      return details?.kind === "buildingDestroyed"
        ? randomEventDescriptionTemplate(locale, "eventDescBuildingDestroyed", {
            building: ECONOMY_BUILDING_NAMES[details.buildingId][locale],
          })
        : randomEventDescriptionTemplate(locale, "eventDescBatteryDestroyed");
    case "scienceTheft":
      return details?.kind === "researchHalved" && details.amount > 0
        ? randomEventDescriptionTemplate(locale, "eventDescResearchHalvedAmount", {
            amount: amount(details.amount),
          })
        : randomEventDescriptionTemplate(locale, "eventDescResearchHalved");
    case "researchBreakthrough":
      return details?.kind === "researchDoubled" && details.amount > 0
        ? randomEventDescriptionTemplate(locale, "eventDescResearchDoubledAmount", {
            amount: amount(details.amount),
          })
        : randomEventDescriptionTemplate(locale, "eventDescResearchDoubled");
    case "rocketInstantArrival":
      return details?.kind === "rocketInstantArrival"
        ? randomEventDescriptionTemplate(locale, "eventDescRocketInstantArrivalNamed", {
            rocketName: details.rocketName,
          })
        : randomEventDescriptionTemplate(locale, "eventDescRocketInstantArrival");
    case "antimatterReaction": {
      const rocketName = details?.kind === "antimatterReaction"
        ? details.rocketName
        : randomEventDescriptionTemplate(locale, "eventDescRocketFallbackName");
      const asteroidName = details?.kind === "antimatterReaction"
        ? details.asteroidName
        : randomEventDescriptionTemplate(locale, "eventDescAsteroidFallbackName");
      const lossText =
        details?.kind === "antimatterReaction" && details.antimatterLost > 0
          ? randomEventDescriptionTemplate(locale, "eventDescAntimatterLoss", {
              amount: amount(details.antimatterLost),
            })
          : "";
      return randomEventDescriptionTemplate(locale, "eventDescAntimatterReaction", {
        rocketName,
        asteroidName,
        lossText,
      });
    }
    case "stockLoss": {
      const goodName =
        details?.kind === "stockLoss"
          ? economyGoodName(locale, details.goodId)
          : randomEventDescriptionTemplate(locale, "eventDescStockFallbackName");
      return details?.kind === "stockLoss" && details.lostPercent > 0
        ? randomEventDescriptionTemplate(locale, "eventDescStockLossPercent", {
            lostPercent: String(details.lostPercent),
            itemName: goodName,
          })
        : randomEventDescriptionTemplate(locale, "eventDescStockLossGeneric", {
            itemName: goodName,
          });
    }
    case "starshipLostInSpace":
      return randomEventDescriptionTemplate(locale, "eventDescStarshipLost");
    case "galacticMarketLockdown":
      return randomEventDescriptionTemplate(locale, "eventDescGalacticMarketOffline");
    case "endlessSummer":
      return randomEventDescriptionTemplate(locale, "eventDescWeatherSunny");
    case "minerBrokeDown":
      return details?.kind === "minerBrokeDown"
        ? randomEventDescriptionTemplate(locale, "eventDescMinerRateZeroNamed", {
            rocketName: details.rocketName,
          })
        : randomEventDescriptionTemplate(locale, "eventDescMinerRateZero");
    case "supplyChainDisruption":
      return details?.kind === "supplyChainDisruption"
        ? randomEventDescriptionTemplate(locale, "eventDescProductionReducedNamed", {
            itemName: economyGoodName(locale, details.goodId),
            percentDown: String(details.percentDown),
          })
        : randomEventDescriptionTemplate(locale, "eventDescProductionReduced", {
            percentDown: "?",
          });
    case "blackHoleInstability":
      return randomEventDescriptionTemplate(locale, "eventDescBlackHoleShifting");
  }
}
