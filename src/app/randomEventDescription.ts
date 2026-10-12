import { ECONOMY_BUILDING_NAMES } from "../content/economyBuildingNames";
import type { ActiveRandomEvent, RandomEventHistoryEntry } from "../content/metaSignals";
import { ECONOMIC_GOOD_IDS, type LocaleId } from "../content/ids";
import { ROCKET_IDS, type RocketId } from "../content/space";
import { randomEventDescriptionTemplate } from "../i18n/randomEventDescriptionMessages";
import { localizedRocketUserName } from "../i18n/rocketMessages";
import { economyGoodName } from "./economyDisplay";
import { formatNumber, type NumberNotation } from "./numberFormatting";

/** Renders the source event description from locale-independent, event-time history details. */
export function randomEventHistoryDescription(
  locale: LocaleId,
  entry: RandomEventHistoryEntry,
  notation: NumberNotation,
): string {
  const details = entry.details;
  const amount = (value: number) =>
    notation === "normal"
      ? formatNumber(locale, Math.floor(value), 0, notation)
      : formatNumber(locale, value, 0, notation);
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
            rocketName: localizedRocketUserName(locale, details.rocketName),
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
        rocketName: localizedRocketUserName(locale, rocketName),
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
            rocketName: localizedRocketUserName(locale, details.rocketName),
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

/** Renders the source's live detail for active timed effects without changing saved history. */
export function randomEventActiveEffectDescription(
  locale: LocaleId,
  entry: RandomEventHistoryEntry,
  effect: ActiveRandomEvent,
  rockets: Readonly<Record<RocketId, { readonly name: string }>>,
  notation: NumberNotation,
): string {
  if (entry.id !== effect.id || effect.remainingMs <= 0)
    return randomEventHistoryDescription(locale, entry, notation);

  if (effect.id === "minerBrokeDown") {
    const rocketId = ROCKET_IDS.find((id) => id === effect.targetId);
    const rocketName = rocketId ? rockets[rocketId]?.name : undefined;
    if (rocketName) {
      return randomEventDescriptionTemplate(locale, "eventDescMinerRateZeroNamed", {
        rocketName: localizedRocketUserName(locale, rocketName),
      });
    }
  }

  if (effect.id === "supplyChainDisruption") {
    const percentDown = Math.round((1 - effect.multiplier) * 100);
    if (Number.isInteger(percentDown) && percentDown >= 60 && percentDown <= 80) {
      const goodId = ECONOMIC_GOOD_IDS.find((id) => id === effect.targetId);
      if (goodId) {
        return randomEventDescriptionTemplate(locale, "eventDescProductionReducedNamed", {
          itemName: economyGoodName(locale, goodId),
          percentDown: String(percentDown),
        });
      }
      return randomEventDescriptionTemplate(locale, "eventDescProductionReduced", {
        percentDown: String(percentDown),
      });
    }
  }

  return randomEventHistoryDescription(locale, entry, notation);
}
