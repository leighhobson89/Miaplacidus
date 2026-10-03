import { GALAXY_SEED_DEFAULT } from "../content/ids";
import {
  SPACE_WEATHER_CONDITIONS,
  type SpaceState,
  type SpaceWeatherCondition,
  type StarSystemProfile,
  type StarWeatherType,
} from "../content/space";
import { createStarCatalogue } from "../content/starCatalogue";
import type { GameState } from "./state";
import { createSystemRandom } from "./systemRandom";
import { createTimer, createTimerId } from "./timers";

export const STAR_WEATHER_TIMER_ID = createTimerId("weather", "star-system-cycle");
export const WEATHER_WINDOW_MIN_MS = 60_000;
export const WEATHER_SEVERE_STREAK_BEFORE_RELIEF = 3;

function weatherProfile(space: SpaceState): StarSystemProfile | undefined {
  const identity = space.currentSystemId.trim().toLocaleLowerCase("en");
  const star = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
    (entry) =>
      entry.id === space.currentSystemId || entry.name.toLocaleLowerCase("en") === identity,
  );
  return space.systemProfiles.find((profile) => profile.systemId === star?.id);
}

function currentProfileSystemId(space: SpaceState): string {
  const identity = space.currentSystemId.trim().toLocaleLowerCase("en");
  return (
    createStarCatalogue(GALAXY_SEED_DEFAULT).find(
      (entry) =>
        entry.id === space.currentSystemId || entry.name.toLocaleLowerCase("en") === identity,
    )?.id ?? space.currentSystemId
  );
}

function conditionFor(weather: StarWeatherType): SpaceWeatherCondition {
  return weather === "sunny" ? "clear" : weather;
}

function selectWeather(
  chances: Readonly<Record<StarWeatherType, number>>,
  random: () => number,
): StarWeatherType {
  const roll = random() * 100;
  let cumulative = 0;
  for (const type of ["sunny", "cloudy", "rain", "volcano"] as const) {
    cumulative += chances[type];
    if (roll < cumulative) return type;
  }
  return "sunny";
}

function weatherChances(space: SpaceState): Readonly<Record<StarWeatherType, number>> {
  return weatherProfile(space)?.weatherChances ?? { sunny: 25, cloudy: 25, rain: 25, volcano: 25 };
}

function applyNextWeatherCycle(state: GameState): GameState {
  const space = state.run.space;
  const resolvedSystemId = currentProfileSystemId(space);
  const sameSystem = space.weatherSystemId === space.currentSystemId;
  const cycleCount = sameSystem ? space.weatherCycleCount : 0;
  const previousSevereCount = sameSystem ? space.severeWeatherPeriodCount : 0;
  const random = createSystemRandom(
    `${state.run.random.seed}:${resolvedSystemId}:weather:${cycleCount}`,
  );
  let weather = selectWeather(weatherChances(space), random);
  const forceRelief =
    (weather === "rain" || weather === "volcano") &&
    previousSevereCount >= WEATHER_SEVERE_STREAK_BEFORE_RELIEF;
  if (forceRelief) weather = "cloudy";

  const severe = weather === "rain" || weather === "volcano";
  const durationMs = forceRelief
    ? WEATHER_WINDOW_MIN_MS
    : (Math.floor(random() * 3) + 1) * WEATHER_WINDOW_MIN_MS;
  const currentPrecipitationRate = weather === "rain" ? Math.floor(random() * 4) + 1 : 0;
  const timer = createTimer({
    id: STAR_WEATHER_TIMER_ID,
    domain: "weather",
    durationMs,
  });
  return {
    ...state,
    run: {
      ...state.run,
      timers: { ...state.run.timers, [timer.id]: timer },
      space: {
        ...space,
        currentSystemWeather: conditionFor(weather),
        weatherSystemId: space.currentSystemId,
        weatherCycleCount: cycleCount + 1,
        severeWeatherPeriodCount: severe
          ? Math.min(WEATHER_SEVERE_STREAK_BEFORE_RELIEF, previousSevereCount + 1)
          : 0,
        currentPrecipitationRate,
      },
    },
  };
}

export function initializeStarWeather(state: GameState): GameState {
  return applyNextWeatherCycle(state);
}

export function advanceStarWeatherCycle(state: GameState): GameState {
  return applyNextWeatherCycle(state);
}

export function createMigratedStarWeatherTimer() {
  return createTimer({
    id: STAR_WEATHER_TIMER_ID,
    domain: "weather",
    durationMs: WEATHER_WINDOW_MIN_MS,
  });
}

export function currentWeatherForSystem(space: SpaceState): SpaceWeatherCondition {
  return space.weatherSystemId === space.currentSystemId ? space.currentSystemWeather : "clear";
}

export function weatherGenerationMultiplier(space: SpaceState): number {
  switch (currentWeatherForSystem(space)) {
    case "cloudy":
      return 0.6;
    case "rain":
    case "heavyRain":
      return 0.4;
    case "volcano":
      return 0.05;
    default:
      return 1;
  }
}

export function weatherBlocksRocketLaunch(space: SpaceState): boolean {
  const weather = currentWeatherForSystem(space);
  return weather === "rain" || weather === "heavyRain" || weather === "volcano";
}

export function precipitationForCurrentWeather(space: SpaceState): {
  readonly goodId: StarSystemProfile["precipitationGoodId"];
  readonly unitsPerSecond: number;
} | null {
  const weather = currentWeatherForSystem(space);
  const profile = weatherProfile(space);
  if (
    !profile ||
    (weather !== "rain" && weather !== "heavyRain") ||
    space.currentPrecipitationRate <= 0 ||
    !SPACE_WEATHER_CONDITIONS.includes(weather)
  ) {
    return null;
  }
  return { goodId: profile.precipitationGoodId, unitsPerSecond: space.currentPrecipitationRate };
}
