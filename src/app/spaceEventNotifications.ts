import {
  COMPOUND_IDS,
  MATERIAL_IDS,
  type EconomicGoodId,
  type LocaleId,
  type MaterialId,
  type SystemId,
} from "../content/ids";
import { GALAXY_SEED_DEFAULT } from "../content/ids";
import { createStarCatalogue, starTypeForSystem } from "../content/starCatalogue";
import type { EngineEvent } from "../engine/commands";
import type { GameState } from "../engine/state";
import { STARSHIP_MODULES } from "../content/space";
import { isStarshipReady } from "../engine/spaceRules";
import { precipitationForCurrentWeather } from "../engine/weather";
import { formatNumber } from "./numberFormatting";
import { economyGoodName } from "./economyDisplay";
import { megastructureText } from "../i18n/megastructureMessages";
import { localizedRocketUserName } from "../i18n/rocketMessages";
import {
  spaceNotificationText,
  type SpaceNotificationMessageKey,
} from "../i18n/spaceNotificationMessages";
import type { RandomEventDialogCopy } from "../i18n/randomEventDialogTypes";
import {
  galacticTabUnlockDialog,
  oTypeStarReachedDialog,
} from "../i18n/spaceProgressionDialogMessages";
import type { GameNotificationType } from "./NotificationStack";

export type SpaceNotificationClassification =
  | "default"
  | "special"
  | "starShip"
  | "rocket"
  | "weather"
  | "battle"
  | "starshipNarrative";

export interface SpaceEventNotice {
  readonly message: string;
  readonly classification: SpaceNotificationClassification;
  readonly type: GameNotificationType;
  readonly durationMs: number;
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
  durationMs = 3000,
): SpaceEventNotice {
  return {
    message: spaceNotificationText(locale, key, values),
    classification,
    type,
    durationMs,
  };
}

function starshipArrivalNotice(
  locale: LocaleId,
  systemId: SystemId,
  state: GameState,
): SpaceEventNotice | null {
  const system = systemName(systemId);
  if (starTypeForSystem(systemId) === "O") {
    if (state.permanent.oTypeArrivalNarrativesNotifiedSystemIds.includes(systemId)) return null;
    return {
      message: `${spaceNotificationText(locale, "oTypeStarReachedHeader")}\n\n${spaceNotificationText(locale, "oTypeStarReachedText", { star: system })}`,
      classification: "starshipNarrative",
      type: "info",
      durationMs: 20_000,
    };
  }

  const factory = state.permanent.megastructures.ancientManuscripts.find(
    (record) => record.factorySystemId === systemId && record.reported,
  );
  if (!factory) return null;

  return {
    message: `MEGASTRUCTURE\n\n${spaceNotificationText(locale, "factoryStarReachedText", {
      star: system,
      structure: megastructureText(locale).structureNames[factory.megastructureId],
    })}`,
    classification: "starshipNarrative",
    type: "info",
    durationMs: 20_000,
  };
}

function voidPillageNotice(
  locale: LocaleId,
  gains: Readonly<Partial<Record<EconomicGoodId, number>>>,
  notation: GameState["settings"]["notation"],
): SpaceEventNotice {
  const sections = [spaceNotificationText(locale, "voidPillageComplete")];
  const resourceLines = Object.entries(gains).flatMap(([rawGoodId, amount]) => {
    if (amount === undefined || !MATERIAL_IDS.includes(rawGoodId as MaterialId)) return [];
    const goodId = rawGoodId as EconomicGoodId;
    return [`${formatNumber(locale, amount, 0, notation)} ${economyGoodName(locale, goodId)}`];
  });
  const compoundLines = Object.entries(gains).flatMap(([rawGoodId, amount]) => {
    if (amount === undefined || !COMPOUND_IDS.includes(rawGoodId as (typeof COMPOUND_IDS)[number]))
      return [];
    const goodId = rawGoodId as EconomicGoodId;
    return [`${formatNumber(locale, amount, 0, notation)} ${economyGoodName(locale, goodId)}`];
  });
  if (resourceLines.length > 0) {
    sections.push([spaceNotificationText(locale, "resourcesGained"), ...resourceLines].join("\n"));
  }
  if (compoundLines.length > 0) {
    sections.push([spaceNotificationText(locale, "compoundsGained"), ...compoundLines].join("\n"));
  }
  return {
    message: sections.join("\n\n"),
    classification: "special",
    type: "info",
    durationMs: 4000,
  };
}

export function createSpaceEventNoticeHandler(
  getLocale: () => LocaleId,
  getState: () => GameState,
  notify: (notice: SpaceEventNotice) => void,
  markOTypeArrivalNarrativeNotified?: (systemId: SystemId) => void,
  enqueueProgressionDialog?: (dialog: RandomEventDialogCopy, onConfirm?: () => void) => void,
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
      const locale = getLocale();
      const notificationsEnabled = state.settings.notificationsEnabled !== false;
      if (notificationsEnabled) {
        const notice = spaceEventNotice(locale, event, state);
        if (notice) notify(notice);
      }
      if (event.type === "space.starship.arrived") {
        if (state.permanent.rebirthCount === 0) {
          if (enqueueProgressionDialog) {
            enqueueProgressionDialog(galacticTabUnlockDialog(locale), () => {
              if (notificationsEnabled)
                notify(formatNotice(locale, "galacticTabUnlocked", "special", "warning"));
            });
          } else if (notificationsEnabled) {
            notify(formatNotice(locale, "galacticTabUnlocked", "special", "warning"));
          }
        }
        if (
          starTypeForSystem(event.systemId) === "O" &&
          !state.permanent.oTypeArrivalNarrativesNotifiedSystemIds.includes(event.systemId)
        ) {
          if (enqueueProgressionDialog) {
            enqueueProgressionDialog(
              oTypeStarReachedDialog(locale, systemName(event.systemId)),
              () => markOTypeArrivalNarrativeNotified?.(event.systemId),
            );
          } else if (notificationsEnabled) {
            markOTypeArrivalNarrativeNotified?.(event.systemId);
          }
        }
      }
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
    case "space.starship.module.part.built":
      if (!STARSHIP_MODULES[event.moduleId].requiredForTravel || !isStarshipReady(space))
        return null;
      return formatNotice(locale, "starshipReady", "starShip", "info");
    case "space.telescope.built":
      return formatNotice(locale, "telescopeBuilt", "special", "info");
    case "space.launch-pad.built":
      return formatNotice(locale, "launchPadBuilt", "special", "info");
    case "space.starship.system.scanned":
      return formatNotice(locale, "starshipSystemScanned", "starShip", "info", {
        star: systemName(event.systemId),
      });
    case "space.stars.studied":
      return formatNotice(locale, "starStudyComplete", "special", "info");
    case "space.void-pillage.completed":
      return voidPillageNotice(locale, event.gains, state.settings.notation);
    case "space.asteroid.scan-missed":
      return formatNotice(locale, "asteroidScanMissed", "special", "warning");
    case "space.asteroid.discovered": {
      const asteroid = space.asteroids.find((entry) => entry.id === event.asteroidId);
      return formatNotice(
        locale,
        asteroid?.rarity === "legendary" ? "legendaryAsteroidDiscovered" : "asteroidDiscovered",
        "special",
        "info",
        { asteroid: event.name },
      );
    }
    case "space.starship.launched":
      return formatNotice(locale, "starshipLaunched", "starShip", "info", {
        system: systemName(event.systemId),
      });
    case "space.starship.arrived": {
      const narrative = starshipArrivalNotice(locale, event.systemId, state);
      if (narrative) return narrative;
      return formatNotice(locale, "starshipArrived", "starShip", "info", {
        star: systemName(event.systemId),
      });
    }
    case "space.rocket.launched": {
      const rocket = localizedRocketUserName(
        locale,
        space.rockets[event.rocketId]?.name ?? event.rocketId,
      );
      return formatNotice(locale, "rocketLaunched", "rocket", "info", { rocket });
    }
    case "space.rocket.fuel-ready": {
      const rocket = localizedRocketUserName(
        locale,
        space.rockets[event.rocketId]?.name ?? event.rocketId,
      );
      return formatNotice(locale, "rocketFuelReady", "rocket", "info", { rocket });
    }
    case "space.rocket.arrived":
    case "space.rocket.returned": {
      const rocket = localizedRocketUserName(
        locale,
        space.rockets[event.rocketId]?.name ?? event.rocketId,
      );
      const asteroid =
        space.asteroids.find(({ id }) => id === event.asteroidId)?.name ?? event.asteroidId;
      return formatNotice(
        locale,
        event.type === "space.rocket.arrived" ? "rocketArrived" : "rocketReturned",
        "rocket",
        "info",
        { rocket, asteroid },
      );
    }
    case "space.weather.changed": {
      const researched = state.run.economy.researchedTechnologies;
      const hasRockets = researched.includes("rocketComposites");
      if (event.condition === "rain" || event.condition === "heavyRain") {
        const precipitation = precipitationForCurrentWeather(space);
        const hasPrecipitationBenefit = Boolean(
          precipitation && state.run.economy.unlockedCompounds.includes(precipitation.goodId),
        );
        const key: SpaceNotificationMessageKey = hasRockets
          ? hasPrecipitationBenefit
            ? "weatherHeavyRainNoLaunchWithBenefit"
            : "weatherHeavyRainNoLaunch"
          : hasPrecipitationBenefit
            ? "weatherHeavyRainWithBenefit"
            : "weatherHeavyRain";
        const classification: SpaceNotificationClassification =
          hasRockets && !hasPrecipitationBenefit ? "default" : "weather";
        return formatNotice(locale, key, classification, "warning", {
          ...(hasPrecipitationBenefit && precipitation
            ? { material: economyGoodName(locale, precipitation.goodId) }
            : {}),
        });
      }
      if (event.condition === "volcano") {
        const hasSolar = researched.includes("solarPowerGeneration");
        const key: SpaceNotificationMessageKey = hasRockets
          ? hasSolar
            ? "weatherVolcanoNoLaunchAndSolar"
            : "weatherVolcanoNoLaunch"
          : hasSolar
            ? "weatherVolcanoSolarAffected"
            : "weatherVolcano";
        return formatNotice(locale, key, "weather", hasRockets || hasSolar ? "error" : "warning");
      }
      return null;
    }
    case "space.rapid-expansion.resolved": {
      switch (event.outcome.type) {
        case "peaceful-settlement":
          return formatNotice(locale, "rapidExpansionPeaceful", "battle", "info");
        case "non-conquest":
          return formatNotice(locale, "rapidExpansionNonConquest", "battle", "info");
        case "captured": {
          const count = event.outcome.systemIds.length;
          const key =
            new Intl.PluralRules(locale).select(count) === "one"
              ? "rapidExpansionCapturedOne"
              : "rapidExpansionCapturedMany";
          const localizedNames = new Intl.ListFormat(locale, {
            style: "long",
            type: "conjunction",
          }).format(event.outcome.systemIds.map(systemName));
          return formatNotice(locale, key, "battle", "info", {
            count: formatNumber(locale, count, 0, state.settings.notation),
            starNames: localizedNames,
          });
        }
        case "no-eligible-systems":
          return formatNotice(locale, "rapidExpansionNoEligible", "battle", "info");
        case "capture-failed":
          return formatNotice(locale, "rapidExpansionFailed", "battle", "info");
      }
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
