import type { LocaleId } from "../content/ids";
import { GALAXY_SEED_DEFAULT } from "../content/ids";
import { createStarCatalogue } from "../content/starCatalogue";
import type { EngineEvent } from "../engine/commands";
import type { GameState } from "../engine/state";
import {
  spaceNotificationText,
  type SpaceNotificationMessageKey,
} from "../i18n/spaceNotificationMessages";
import type { GameNotificationType } from "./NotificationStack";

export type SpaceNotificationClassification = "starShip" | "rocket" | "weather" | "battle";

export interface SpaceEventNotice {
  readonly message: string;
  readonly classification: SpaceNotificationClassification;
  readonly type: GameNotificationType;
}

const starNames = new Map<string, string>(
  createStarCatalogue(GALAXY_SEED_DEFAULT).map(({ id, name }) => [id, name]),
);

function systemName(systemId: string): string {
  return starNames.get(systemId) ?? (systemId === "spica" ? "Spica" : systemId);
}

function formatNotice(
  locale: LocaleId,
  key: SpaceNotificationMessageKey,
  classification: SpaceNotificationClassification,
  type: GameNotificationType,
  values: Readonly<Record<string, string | number>> = {},
): SpaceEventNotice {
  return { message: spaceNotificationText(locale, key, values), classification, type };
}

export function createSpaceEventNoticeHandler(
  getLocale: () => LocaleId,
  getState: () => GameState,
  notify: (notice: SpaceEventNotice) => void,
): (events: readonly EngineEvent[]) => void {
  const initialWeather = getState().run.space;
  let previousWeatherSystemId = initialWeather.weatherSystemId;
  let previousWeatherCondition = initialWeather.currentSystemWeather;

  return (events) => {
    for (const event of events) {
      const state = getState();
      if (event.type === "space.weather.changed") {
        const weatherSystemId = state.run.space.weatherSystemId;
        const changed =
          weatherSystemId !== previousWeatherSystemId ||
          event.condition !== previousWeatherCondition;
        previousWeatherSystemId = weatherSystemId;
        previousWeatherCondition = event.condition;
        if (!changed) continue;
      }
      if (state.settings.notificationsEnabled === false) continue;
      const notice = spaceEventNotice(getLocale(), event, state);
      if (notice) notify(notice);
    }
  };
}

/** Maps only meaningful space milestones. Progress and ordinary weather cycles stay silent. */
export function spaceEventNotice(
  locale: LocaleId,
  event: EngineEvent,
  state: GameState,
): SpaceEventNotice | null {
  const space = state.run.space;
  switch (event.type) {
    case "space.starship.launched":
      return formatNotice(locale, "starshipLaunched", "starShip", "info", {
        system: systemName(event.systemId),
      });
    case "space.starship.arrived":
      return formatNotice(locale, "starshipArrived", "starShip", "success", {
        system: systemName(event.systemId),
      });
    case "space.rocket.launched": {
      const rocket = space.rockets[event.rocketId]?.name ?? event.rocketId;
      return formatNotice(locale, "rocketLaunched", "rocket", "info", { rocket });
    }
    case "space.rocket.travel-started": {
      const rocket = space.rockets[event.rocketId]?.name ?? event.rocketId;
      return formatNotice(
        locale,
        event.direction === "outbound" ? "rocketOutbound" : "rocketReturning",
        "rocket",
        "info",
        {
          rocket,
          asteroid:
            space.asteroids.find(({ id }) => id === event.asteroidId)?.name ?? event.asteroidId,
        },
      );
    }
    case "space.rocket.arrived":
    case "space.rocket.returned": {
      const rocket = space.rockets[event.rocketId]?.name ?? event.rocketId;
      const asteroid =
        space.asteroids.find(({ id }) => id === event.asteroidId)?.name ?? event.asteroidId;
      return formatNotice(
        locale,
        event.type === "space.rocket.arrived" ? "rocketArrived" : "rocketReturned",
        "rocket",
        "success",
        { rocket, asteroid },
      );
    }
    case "space.weather.changed": {
      const key: SpaceNotificationMessageKey | null =
        event.condition === "rain"
          ? "rain"
          : event.condition === "heavyRain"
            ? "heavyRain"
            : event.condition === "volcano"
              ? "volcano"
              : null;
      if (!key) return null;
      return formatNotice(locale, key, "weather", "warning", {
        system: systemName(space.weatherSystemId),
      });
    }
    case "space.battle.finished":
      return formatNotice(
        locale,
        event.result === "victory" ? "battleVictory" : "battleDefeat",
        "battle",
        event.result === "victory" ? "success" : "error",
        { system: systemName(event.systemId) },
      );
    default:
      return null;
  }
}
