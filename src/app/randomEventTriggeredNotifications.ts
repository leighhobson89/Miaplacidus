import { ECONOMY_BUILDING_NAMES } from "../content/economyBuildingNames";
import type { LocaleId } from "../content/ids";
import type { RandomEventHistoryEntry } from "../content/metaSignals";
import type { EngineEvent } from "../engine/commands";
import type { GameState } from "../engine/state";
import { randomEventDescriptionTemplate } from "../i18n/randomEventDescriptionMessages";
import {
  randomEventStartDialogStockLossReason,
  randomEventStartDialogText,
} from "../i18n/randomEventStartDialogMessages";
import type { RandomEventDialogCopy } from "../i18n/randomEventDialogTypes";
import { localizedRocketUserName } from "../i18n/rocketMessages";
import { randomEventTriggerNotificationText } from "../i18n/randomEventTriggerNotificationMessages";
import { formatNumber } from "./numberFormatting";
import type { GameNotificationType } from "./NotificationStack";
import { economyGoodName } from "./economyDisplay";

export interface RandomEventTriggeredNotice {
  readonly message: string;
  readonly classification: "default";
  readonly type: GameNotificationType;
  readonly durationMs: number;
}

export function createRandomEventTriggeredNoticeHandler(
  getLocale: () => LocaleId,
  getState: () => GameState,
  notify: (notice: RandomEventTriggeredNotice) => void,
  showResultDialog: (dialog: RandomEventDialogCopy) => void = () => {},
): (events: readonly EngineEvent[]) => void {
  return (events) => {
    const triggered = events.filter(
      (event): event is Extract<EngineEvent, { readonly type: "random-event.triggered" }> =>
        event.type === "random-event.triggered",
    );
    if (triggered.length === 0) return;

    const state = getState();
    const locale = getLocale();
    const history = state.run.randomEvents.history.slice(-triggered.length);

    triggered.forEach((event, index) => {
      const entry = history[index];
      const matchedEntry = entry?.id === event.id ? entry : undefined;
      const startDialog = randomEventStartDialogText(
        locale,
        event.id,
        matchedEntry
          ? startDialogValues(locale, state, matchedEntry)
          : fallbackStartDialogValues(locale, event.id),
      );
      if (startDialog) showResultDialog(startDialog);

      if (state.settings.notificationsEnabled === false) return;
      notify({
        message: randomEventTriggerNotificationText(
          locale,
          event.id,
          matchedEntry,
          matchedEntry?.id === "supplyChainDisruption" &&
            matchedEntry.details?.kind === "supplyChainDisruption"
            ? economyGoodName(locale, matchedEntry.details.goodId)
            : undefined,
        ),
        classification: "default",
        type: "info",
        durationMs: 5000,
      });
    });
  };
}

function startDialogValues(
  locale: LocaleId,
  state: GameState,
  entry: RandomEventHistoryEntry,
): Readonly<Record<string, string | number>> {
  const details = entry.details;
  const formatAmount = (value: number) =>
    formatNumber(
      locale,
      state.settings.notation === "standard" ? Math.floor(value) : value,
      0,
      state.settings.notation,
    );
  const minutes =
    entry.durationMs === undefined
      ? "?"
      : formatNumber(locale, Math.round(entry.durationMs / 60_000), 0, state.settings.notation);

  switch (entry.id) {
    case "powerPlantExplosion":
    case "batteryExplosion":
      return {
        destroyedBuilding:
          details?.kind === "buildingDestroyed"
            ? ECONOMY_BUILDING_NAMES[details.buildingId][locale]
            : ECONOMY_BUILDING_NAMES[
                entry.id === "powerPlantExplosion" ? "powerPlant" : "battery"
              ][locale],
      };
    case "scienceTheft":
      return {
        amountStolen: formatAmount(
          details?.kind === "researchHalved" ? details.amount : 0,
        ),
      };
    case "researchBreakthrough":
      return {
        amountGained: formatAmount(
          details?.kind === "researchDoubled" ? details.amount : 0,
        ),
      };
    case "rocketInstantArrival":
      return {
        rocketName:
          details?.kind === "rocketInstantArrival"
            ? localizedRocketUserName(locale, details.rocketName)
            : randomEventDescriptionTemplate(locale, "eventDescRocketFallbackName"),
      };
    case "starshipLostInSpace":
    case "galacticMarketLockdown":
      return {};
    case "antimatterReaction":
      return {
        rocketName:
          details?.kind === "antimatterReaction"
            ? localizedRocketUserName(locale, details.rocketName)
            : randomEventDescriptionTemplate(locale, "eventDescRocketFallbackName"),
        asteroidName:
          details?.kind === "antimatterReaction"
            ? details.asteroidName
            : randomEventDescriptionTemplate(locale, "eventDescAsteroidFallbackName"),
        antimatterLost:
          details?.kind === "antimatterReaction" ? formatAmount(details.antimatterLost) : "?",
      };
    case "stockLoss":
      return {
        itemName:
          details?.kind === "stockLoss"
            ? economyGoodName(locale, details.goodId)
            : randomEventDescriptionTemplate(locale, "eventDescStockFallbackName"),
        lostPercent: details?.kind === "stockLoss" ? String(details.lostPercent) : "?",
        reason: randomEventStartDialogStockLossReason(locale),
      };
    case "endlessSummer":
    case "blackHoleInstability":
      return { minutes };
    case "minerBrokeDown":
      return {
        rocketName:
          details?.kind === "minerBrokeDown"
            ? localizedRocketUserName(locale, details.rocketName)
            : randomEventDescriptionTemplate(locale, "eventDescRocketFallbackName"),
      };
    case "supplyChainDisruption":
      return {
        itemName:
          details?.kind === "supplyChainDisruption"
            ? economyGoodName(locale, details.goodId)
            : randomEventDescriptionTemplate(locale, "eventDescStockFallbackName"),
        percentDown: details?.kind === "supplyChainDisruption" ? String(details.percentDown) : "?",
      };
  }
}

function fallbackStartDialogValues(
  locale: LocaleId,
  eventId: Parameters<typeof randomEventStartDialogText>[1],
): Readonly<Record<string, string | number>> {
  const defaultRocketName = randomEventDescriptionTemplate(
    locale,
    "eventDescRocketFallbackName",
  );
  switch (eventId) {
    case "powerPlantExplosion":
      return { destroyedBuilding: ECONOMY_BUILDING_NAMES.powerPlant[locale] };
    case "batteryExplosion":
      return { destroyedBuilding: ECONOMY_BUILDING_NAMES.battery[locale] };
    case "scienceTheft":
      return { amountStolen: "?" };
    case "researchBreakthrough":
      return { amountGained: "?" };
    case "rocketInstantArrival":
    case "minerBrokeDown":
      return { rocketName: defaultRocketName };
    case "starshipLostInSpace":
    case "galacticMarketLockdown":
      return {};
    case "antimatterReaction":
      return {
        rocketName: defaultRocketName,
        asteroidName: randomEventDescriptionTemplate(locale, "eventDescAsteroidFallbackName"),
        antimatterLost: "?",
      };
    case "stockLoss":
      return {
        itemName: randomEventDescriptionTemplate(locale, "eventDescStockFallbackName"),
        lostPercent: "?",
        reason: randomEventStartDialogStockLossReason(locale),
      };
    case "endlessSummer":
    case "blackHoleInstability":
      return { minutes: "?" };
    case "supplyChainDisruption":
      return {
        itemName: randomEventDescriptionTemplate(locale, "eventDescStockFallbackName"),
        percentDown: "?",
      };
  }
}
