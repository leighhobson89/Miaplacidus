import { describe, expect, it } from "vitest";
import { createStarCatalogue } from "../../src/content/starCatalogue";
import { LOCALE_IDS } from "../../src/content/ids";
import type { StarSystemProfile } from "../../src/content/space";
import { transition } from "../../src/engine/commands";
import { createEconomyTickPlan } from "../../src/engine/economySimulation";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { decodePortable, encodePortable } from "../../src/persistence/codec";
import { makeEnvelope } from "../../src/persistence/schema";
import { spaceText } from "../../src/i18n/spaceMessages";
import {
  currentWeatherForSystem,
  STAR_WEATHER_TIMER_ID,
  WEATHER_WINDOW_MIN_MS,
} from "../../src/engine/weather";

const startingStar = createStarCatalogue().find((star) => star.name === "Spica")!;

function withProfile(state: GameState, profile: StarSystemProfile): GameState {
  return {
    ...state,
    run: {
      ...state.run,
      space: {
        ...state.run.space,
        systemProfiles: [
          ...state.run.space.systemProfiles.filter((entry) => entry.systemId !== profile.systemId),
          profile,
        ],
      },
    },
  };
}

function withWeather(
  state: GameState,
  condition: GameState["run"]["space"]["currentSystemWeather"],
): GameState {
  return {
    ...state,
    run: {
      ...state.run,
      space: {
        ...state.run.space,
        currentSystemWeather: condition,
        weatherSystemId: state.run.space.currentSystemId,
        currentPrecipitationRate: condition === "rain" || condition === "heavyRain" ? 4 : 0,
      },
    },
  };
}

function fixedWeatherProfile(
  systemId: StarSystemProfile["systemId"],
  weatherChances: StarSystemProfile["weatherChances"],
): StarSystemProfile {
  return {
    systemId,
    weatherChances,
    precipitationGoodId: "water",
    ascendencyPoints: 1,
    ascendencyDistanceLy: 0,
  };
}

describe("interstellar weather cycles", () => {
  it("starts with a persisted wall-clock weather window and a condition for Spica", () => {
    const state = createInitialGameState({ seed: 901 });
    const timer = state.run.timers[STAR_WEATHER_TIMER_ID];

    expect(isValidGameState(state)).toBe(true);
    expect(timer).toMatchObject({
      domain: "weather",
      policy: { phase: "wall", offlineEligible: false, warpable: false },
      repeat: false,
      status: "running",
    });
    expect(timer?.durationMs).toBeGreaterThanOrEqual(WEATHER_WINDOW_MIN_MS);
    expect(timer?.durationMs).toBeLessThanOrEqual(WEATHER_WINDOW_MIN_MS * 3);
    expect(state.run.space.weatherSystemId).toBe(state.run.space.currentSystemId);
    expect(state.run.space.currentSystemWeather).toMatch(/^(clear|cloudy|rain|volcano)$/);
  });

  it("advances its weather window while hidden and keeps the replacement timer valid", () => {
    const base = createInitialGameState({ seed: 906 });
    const state: GameState = {
      ...base,
      run: { ...base.run, clock: { ...base.run.clock, wallNowMs: 0 } },
    };
    const duration = state.run.timers[STAR_WEATHER_TIMER_ID]!.durationMs;
    const advanced = transition(state, {
      type: "clock.advance",
      input: { wallNowMs: duration, foreground: false },
    });

    expect(advanced.accepted).toBe(true);
    expect(advanced.events).toContainEqual({
      type: "space.weather.changed",
      condition: expect.any(String),
    });
    expect(advanced.state.run.timers[STAR_WEATHER_TIMER_ID]?.status).toBe("running");
    expect(advanced.state.run.timers[STAR_WEATHER_TIMER_ID]?.elapsedMs).toBe(0);
    expect(advanced.state.statistics.completedTimers).toBe(1);
  });

  it("rolls the clear, rain, and volcano conditions from the active system profile", () => {
    const cases = [
      {
        weather: "sunny",
        condition: "clear",
        chances: { sunny: 100, cloudy: 0, rain: 0, volcano: 0 },
      },
      {
        weather: "rain",
        condition: "rain",
        chances: { sunny: 0, cloudy: 0, rain: 100, volcano: 0 },
      },
      {
        weather: "volcano",
        condition: "volcano",
        chances: { sunny: 0, cloudy: 0, rain: 0, volcano: 100 },
      },
    ] as const;

    for (const { weather, condition, chances } of cases) {
      const base = createInitialGameState({ seed: 901 });
      const profiled = withProfile(base, fixedWeatherProfile(startingStar.id, chances));
      const before: GameState = {
        ...profiled,
        run: {
          ...profiled.run,
          space: {
            ...profiled.run.space,
            weatherSystemId: profiled.run.space.currentSystemId,
            weatherCycleCount: 0,
            severeWeatherPeriodCount: 0,
          },
        },
      };
      const changed = transition(before, {
        type: "timer.complete",
        timerId: STAR_WEATHER_TIMER_ID,
      });

      expect(changed.accepted).toBe(true);
      expect(changed.state.run.space.currentSystemWeather).toBe(condition);
      expect(changed.state.run.space.severeWeatherPeriodCount).toBe(
        weather === "rain" || weather === "volcano" ? 1 : 0,
      );
      if (weather === "rain") {
        expect(changed.state.run.space.currentPrecipitationRate).toBeGreaterThanOrEqual(1);
        expect(changed.state.run.space.currentPrecipitationRate).toBeLessThanOrEqual(4);
      } else {
        expect(changed.state.run.space.currentPrecipitationRate).toBe(0);
      }
    }
  });

  it("forces the original short cloudy relief after three severe windows", () => {
    const base = createInitialGameState({ seed: 902 });
    const forcedRain = withProfile(
      base,
      fixedWeatherProfile(startingStar.id, {
        sunny: 0,
        cloudy: 0,
        rain: 100,
        volcano: 0,
      }),
    );
    const streak: GameState = {
      ...forcedRain,
      run: {
        ...forcedRain.run,
        space: {
          ...forcedRain.run.space,
          weatherCycleCount: 7,
          severeWeatherPeriodCount: 3,
          currentSystemWeather: "rain",
        },
      },
    };

    const relief = transition(streak, { type: "timer.complete", timerId: STAR_WEATHER_TIMER_ID });

    expect(relief.accepted).toBe(true);
    expect(relief.state.run.space.currentSystemWeather).toBe("cloudy");
    expect(relief.state.run.space.severeWeatherPeriodCount).toBe(0);
    expect(relief.state.run.timers[STAR_WEATHER_TIMER_ID]?.durationMs).toBe(WEATHER_WINDOW_MIN_MS);
    expect(relief.events).toContainEqual({ type: "space.weather.changed", condition: "cloudy" });
  });

  it("resets the severe streak and profile cycle when the active system changes", () => {
    const base = createInitialGameState({ seed: 903 });
    const target = createStarCatalogue().find((star) => star.name === "Regulus")!;
    const targetProfile = fixedWeatherProfile(target.id, {
      sunny: 0,
      cloudy: 0,
      rain: 100,
      volcano: 0,
    });
    const withTargetProfile = withProfile(base, targetProfile);
    const changedSystem: GameState = {
      ...withTargetProfile,
      run: {
        ...withTargetProfile.run,
        space: {
          ...withTargetProfile.run.space,
          currentSystemId: target.name,
          weatherSystemId: "spica",
          weatherCycleCount: 17,
          severeWeatherPeriodCount: 3,
          currentSystemWeather: "volcano",
        },
      },
    };

    expect(currentWeatherForSystem(changedSystem.run.space)).toBe("clear");
    const next = transition(changedSystem, {
      type: "timer.complete",
      timerId: STAR_WEATHER_TIMER_ID,
    });

    expect(next.accepted).toBe(true);
    expect(next.state.run.space.currentSystemWeather).toBe("rain");
    expect(next.state.run.space.weatherSystemId).toBe(target.name);
    expect(next.state.run.space.weatherCycleCount).toBe(1);
    expect(next.state.run.space.severeWeatherPeriodCount).toBe(1);
  });

  it("stacks cloudy, rain, and volcanic efficiency on Power Plant 2", () => {
    const base = createInitialGameState({ seed: 904 });
    const runningPlant: GameState = {
      ...base,
      run: {
        ...base.run,
        upgrades: { ...base.run.upgrades, powerPlant2: 1 },
        economy: {
          ...base.run.economy,
          buildingEnabled: { ...base.run.economy.buildingEnabled, powerPlant2: true },
          power: { ...base.run.economy.power, gridEnabled: true },
        },
      },
    };
    const generation = (condition: GameState["run"]["space"]["currentSystemWeather"]) =>
      createEconomyTickPlan(withWeather(runningPlant, condition)).generationPerSecond;

    expect(generation("cloudy")).toBeCloseTo(generation("clear") * 0.6);
    expect(generation("rain")).toBeCloseTo(generation("clear") * 0.4);
    expect(generation("volcano")).toBeCloseTo(generation("clear") * 0.05);
  });

  it("credits only precipitation that fits in revealed storage, without needing power", () => {
    const base = createInitialGameState({ seed: 905 });
    const water = base.run.goods.water;
    const rainy: GameState = {
      ...withWeather(base, "rain"),
      run: {
        ...withWeather(base, "rain").run,
        clock: { ...base.run.clock, wallNowMs: 0 },
        goods: {
          ...base.run.goods,
          water: { ...water, quantity: water.storageCapacity - 0.5 },
        },
        economy: {
          ...base.run.economy,
          unlockedCompounds: ["water"],
          power: { ...base.run.economy.power, gridEnabled: false },
        },
      },
    };
    const tickPlan = createEconomyTickPlan(rainy).tickPlan;
    const ticked = transition(rainy, {
      type: "clock.advance",
      input: { wallNowMs: 1_000, foreground: true },
      tickPlan,
      offlineTickPlan: tickPlan,
    });

    expect(rainy.run.economy.power.gridEnabled).toBe(false);
    expect(ticked.accepted).toBe(true);
    expect(ticked.state.run.goods.water.quantity).toBe(water.storageCapacity);
    expect(ticked.state.run.space.precipitationCollectedThisRun).toBeCloseTo(0.5);
    expect(ticked.state.statistics.lifetimeGoodsProduced).toBeCloseTo(0.5);
    expect(ticked.events.filter((event) => event.type === "precipitation.collected")).toEqual([
      { type: "precipitation.collected", goodId: "water", amount: 0.5 },
    ]);

    const full: GameState = {
      ...ticked.state,
      run: {
        ...ticked.state.run,
        goods: {
          ...ticked.state.run.goods,
          water: { ...ticked.state.run.goods.water, quantity: water.storageCapacity },
        },
      },
    };
    const fullTickPlan = createEconomyTickPlan(full).tickPlan;
    const afterFullTick = transition(full, {
      type: "clock.advance",
      input: { wallNowMs: 2_000, foreground: true },
      tickPlan: fullTickPlan,
      offlineTickPlan: fullTickPlan,
    });
    expect(afterFullTick.accepted).toBe(true);
    expect(afterFullTick.state.run.space.precipitationCollectedThisRun).toBeCloseTo(0.5);
    expect(afterFullTick.events.some((event) => event.type === "precipitation.collected")).toBe(
      false,
    );
  });

  it("preserves an in-progress weather timer across a portable save reload", () => {
    const base = createInitialGameState({ pioneerName: "Weather Pioneer", seed: 907 });
    const state: GameState = {
      ...base,
      run: { ...base.run, clock: { ...base.run.clock, wallNowMs: 0 } },
    };
    const advanced = transition(state, {
      type: "clock.advance",
      input: { wallNowMs: 15_000, foreground: false },
    });
    const saved = makeEnvelope({
      slotId: "00000000-0000-4000-8000-000000000907",
      pioneerName: "Weather Pioneer",
      createdAt: 10,
      savedAt: 20,
      revision: 1,
      state: advanced.state,
    });
    const restored = decodePortable(encodePortable(saved));

    expect(restored.state.run.timers[STAR_WEATHER_TIMER_ID]).toEqual(
      advanced.state.run.timers[STAR_WEATHER_TIMER_ID],
    );
    expect(restored.state.run.space).toMatchObject({
      currentSystemWeather: advanced.state.run.space.currentSystemWeather,
      weatherCycleCount: advanced.state.run.space.weatherCycleCount,
      severeWeatherPeriodCount: advanced.state.run.space.severeWeatherPeriodCount,
      currentPrecipitationRate: advanced.state.run.space.currentPrecipitationRate,
    });
  });

  it("provides localized weather and precipitation status in all six supported languages", () => {
    for (const locale of LOCALE_IDS) {
      expect(spaceText(locale, "weatherChangesIn").length).toBeGreaterThan(0);
      expect(spaceText(locale, "precipitationRate").length).toBeGreaterThan(0);
      expect(spaceText(locale, "precipitationThisRun").length).toBeGreaterThan(0);
    }
    expect(new Set(LOCALE_IDS.map((locale) => spaceText(locale, "weatherChangesIn"))).size).toBe(6);
  });
});
