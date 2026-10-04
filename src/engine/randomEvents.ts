import { RANDOM_EVENT_IDS, type RandomEventId } from "../content/metaSignals";
import { FIXED_UPGRADE_IDS, ECONOMIC_GOOD_IDS, MATERIAL_IDS, COMPOUND_IDS } from "../content/ids";
import { ENERGY_BUILDINGS } from "../content/economy";
import {
  createInitialPlayerFleets,
  createInitialPlayerFleetCombatTotals,
  createInitialSpaceState,
  createInitialStarshipModules,
} from "../content/space";
import { advanceStarWeatherCycle, STAR_WEATHER_TIMER_ID } from "./weather";
import { megastructureBatteryCapacityMultiplier } from "./megastructures";
import { nextRandom, nextRandomInteger } from "./random";
import { completeSpaceJourneys } from "./spaceMechanics";
import { completeTimer } from "./timers";
import type { TimerId } from "./runtimeTypes";
import type { GameState } from "./state";

const NEGATIVE_EVENTS = new Set<RandomEventId>([
  "powerPlantExplosion",
  "batteryExplosion",
  "scienceTheft",
  "antimatterReaction",
  "stockLoss",
  "starshipLostInSpace",
]);

function hasActiveEffect(state: GameState, id: RandomEventId): boolean {
  return state.run.randomEvents.activeEffects.some((effect) => effect.id === id);
}

function stockLossCandidates(state: GameState): readonly (typeof ECONOMIC_GOOD_IDS)[number][] {
  const unlocked = ECONOMIC_GOOD_IDS.filter((goodId) =>
    MATERIAL_IDS.includes(goodId as (typeof MATERIAL_IDS)[number])
      ? state.run.unlockedResources.includes(goodId as (typeof MATERIAL_IDS)[number])
      : state.run.economy.unlockedCompounds.includes(goodId as (typeof COMPOUND_IDS)[number]),
  ).filter(
    (goodId) => state.run.goods[goodId].quantity > 0 && state.run.goods[goodId].storageCapacity > 0,
  );
  if (unlocked.length === 0) return [];
  const aboveHalf = unlocked.filter(
    (goodId) => state.run.goods[goodId].quantity / state.run.goods[goodId].storageCapacity >= 0.5,
  );
  if (aboveHalf.length > 0) return aboveHalf;
  const highestFill = Math.max(
    ...unlocked.map(
      (goodId) => state.run.goods[goodId].quantity / state.run.goods[goodId].storageCapacity,
    ),
  );
  return unlocked.filter(
    (goodId) =>
      state.run.goods[goodId].quantity / state.run.goods[goodId].storageCapacity === highestFill,
  );
}

function supplyChainCandidates(state: GameState): readonly (typeof ECONOMIC_GOOD_IDS)[number][] {
  return ECONOMIC_GOOD_IDS.filter((goodId) => {
    const isUnlocked = MATERIAL_IDS.includes(goodId as (typeof MATERIAL_IDS)[number])
      ? state.run.unlockedResources.includes(goodId as (typeof MATERIAL_IDS)[number])
      : state.run.economy.unlockedCompounds.includes(goodId as (typeof COMPOUND_IDS)[number]);
    if (!isUnlocked) return false;
    return [1, 2, 3, 4].some(
      (tier) =>
        (state.run.upgrades[
          `autobuyer:${goodId}:tier:${tier}` as keyof typeof state.run.upgrades
        ] ?? 0) > 0,
    );
  });
}

export type RandomEventEngineEvent =
  | {
      readonly type: "random-event.triggered";
      readonly id: RandomEventId;
      readonly negative: boolean;
    }
  | { readonly type: "random-event.ended"; readonly id: RandomEventId };

export function randomEventEligible(state: GameState, id: RandomEventId): boolean {
  switch (id) {
    case "powerPlantExplosion":
      return FIXED_UPGRADE_IDS.some(
        (upgradeId) =>
          upgradeId.startsWith("powerPlant") && (state.run.upgrades[upgradeId] ?? 0) > 0,
      );
    case "batteryExplosion":
      return ["battery3", "battery2", "battery1"].some(
        (upgradeId) => (state.run.upgrades[upgradeId as keyof typeof state.run.upgrades] ?? 0) > 0,
      );
    case "scienceTheft":
      return state.run.researchPoints > 1;
    case "researchBreakthrough":
      return true;
    case "rocketInstantArrival":
      return Object.values(state.run.space.rockets).some(
        (rocket) =>
          (rocket.phase === "outbound" || rocket.phase === "returning") && rocket.timerId !== null,
      );
    case "starshipLostInSpace":
      return (
        state.run.space.starship.phase === "travelling" &&
        state.run.space.starship.destinationSystemId !== null
      );
    case "antimatterReaction":
      return Object.values(state.run.space.rockets).some(
        (rocket) => rocket.phase === "mining" && rocket.targetAsteroidId !== null,
      );
    case "stockLoss":
      return stockLossCandidates(state).length > 0;
    case "galacticMarketLockdown":
      return (
        (state.permanent.rebirthCount > 0 || state.run.space.ascendencyAwardedThisRun) &&
        !hasActiveEffect(state, id)
      );
    case "endlessSummer":
      return !hasActiveEffect(state, id);
    case "minerBrokeDown":
      return (
        !hasActiveEffect(state, id) &&
        Object.values(state.run.space.rockets).some((rocket) => rocket.phase === "mining")
      );
    case "supplyChainDisruption":
      return !hasActiveEffect(state, id) && supplyChainCandidates(state).length > 0;
    case "blackHoleInstability":
      return (
        state.permanent.blackHole.discovered &&
        state.permanent.blackHole.researched &&
        !hasActiveEffect(state, id)
      );
  }
}

function drawIndex(
  state: GameState,
  length: number,
): { readonly index: number; readonly state: GameState } {
  const draw = nextRandomInteger(state.run.random, 0, Math.max(0, length - 1));
  return { index: draw.value, state: { ...state, run: { ...state.run, random: draw.state } } };
}

function withActiveEffect(
  state: GameState,
  id: RandomEventId,
  durationMs: number,
  multiplier = 1,
  targetId: string | null = null,
  powerMultiplier = 1,
  durationMultiplier = 1,
): GameState {
  const activeEffects = [
    ...state.run.randomEvents.activeEffects.filter((effect) => effect.id !== id),
    {
      id,
      remainingMs: durationMs,
      multiplier,
      targetId,
      powerMultiplier,
      durationMultiplier,
      nextShiftInMs: id === "blackHoleInstability" ? 60_000 : 0,
    },
  ];
  return {
    ...state,
    run: { ...state.run, randomEvents: { ...state.run.randomEvents, activeEffects } },
  };
}

function trigger(
  stateValue: GameState,
  id: RandomEventId,
): { readonly state: GameState; readonly events: readonly RandomEventEngineEvent[] } | null {
  if (!randomEventEligible(stateValue, id)) return null;
  let state = stateValue;
  if (id === "scienceTheft")
    state = {
      ...state,
      run: {
        ...state.run,
        researchPoints: Math.max(
          0,
          state.run.researchPoints - Math.ceil(state.run.researchPoints / 2),
        ),
      },
    };
  else if (id === "researchBreakthrough")
    state = {
      ...state,
      run: { ...state.run, researchPoints: Math.floor(state.run.researchPoints * 2) },
    };
  else if (id === "powerPlantExplosion" || id === "batteryExplosion") {
    const candidates = (
      id === "powerPlantExplosion"
        ? ["powerPlant1", "powerPlant2", "powerPlant3"]
        : ["battery3", "battery2", "battery1"]
    ).filter(
      (upgradeId) => (state.run.upgrades[upgradeId as keyof typeof state.run.upgrades] ?? 0) > 0,
    );
    if (candidates.length === 0) return null;
    const pick =
      id === "batteryExplosion" ? { index: 0, state } : drawIndex(state, candidates.length);
    state = pick.state;
    const upgradeId = candidates[pick.index]! as keyof typeof state.run.upgrades;
    const upgrades = {
      ...state.run.upgrades,
      [upgradeId]: Math.max(0, (state.run.upgrades[upgradeId] ?? 0) - 1),
    };
    if (id === "powerPlantExplosion") {
      const buildingEnabled = { ...state.run.economy.buildingEnabled };
      if (upgrades[upgradeId] === 0)
        buildingEnabled[upgradeId as "powerPlant1" | "powerPlant2" | "powerPlant3"] = false;
      state = {
        ...state,
        run: { ...state.run, upgrades, economy: { ...state.run.economy, buildingEnabled } },
      };
    } else {
      const capacityDelta =
        ENERGY_BUILDINGS[upgradeId as "battery1" | "battery2" | "battery3"].capacity *
        megastructureBatteryCapacityMultiplier(state) *
        state.run.newsTicker.powerCapacityMultiplier;
      const power = state.run.economy.power;
      const capacity = Math.max(0, power.capacity - capacityDelta);
      state = {
        ...state,
        run: {
          ...state.run,
          upgrades,
          economy: {
            ...state.run.economy,
            power: { ...power, capacity, quantity: Math.min(power.quantity, capacity) },
          },
        },
      };
    }
  } else if (id === "rocketInstantArrival") {
    const ids = Object.entries(state.run.space.rockets)
      .filter(
        ([, rocket]) =>
          (rocket.phase === "outbound" || rocket.phase === "returning") && rocket.timerId !== null,
      )
      .map(([rocketId]) => rocketId);
    if (ids.length === 0) return null;
    const pick = drawIndex(state, ids.length);
    state = pick.state;
    const rocket =
      state.run.space.rockets[ids[pick.index] as keyof typeof state.run.space.rockets]!;
    const timer = rocket.timerId
      ? completeTimer(state.run.timers, rocket.timerId as TimerId)
      : { timers: state.run.timers, events: [] };
    const completed = completeSpaceJourneys(
      { ...state, run: { ...state.run, timers: timer.timers } },
      timer.events,
    );
    state = completed.state;
  } else if (id === "starshipLostInSpace") {
    const timerId = state.run.space.starship.timerId;
    const timers = { ...state.run.timers };
    if (timerId) delete timers[timerId];
    state = {
      ...state,
      run: {
        ...state.run,
        timers,
        space: {
          ...state.run.space,
          starship: createInitialSpaceState().starship,
          starshipModules: createInitialStarshipModules(),
          playerFleets: createInitialPlayerFleets(),
          playerFleetCombatTotals: createInitialPlayerFleetCombatTotals(),
          fleetEnvoyBuilt: false,
        },
      },
    };
  } else if (id === "antimatterReaction") {
    const ids = Object.entries(state.run.space.rockets)
      .filter(([, rocket]) => rocket.phase === "mining" && rocket.targetAsteroidId !== null)
      .map(([rocketId]) => rocketId);
    if (ids.length === 0) return null;
    const pick = drawIndex(state, ids.length);
    state = pick.state;
    const rocketId = ids[pick.index] as keyof typeof state.run.space.rockets;
    const rocket = state.run.space.rockets[rocketId]!;
    const targetId = rocket.targetAsteroidId;
    const asteroid = state.run.space.asteroids.find((entry) => entry.id === targetId);
    const antimatterLost = asteroid
      ? Math.max(0, asteroid.totalAntimatter - asteroid.remainingAntimatter)
      : 0;
    state = {
      ...state,
      run: {
        ...state.run,
        space: {
          ...state.run.space,
          asteroids: state.run.space.asteroids.filter((candidate) => candidate.id !== targetId),
          antimatter: Math.max(0, state.run.space.antimatter - antimatterLost),
          rockets: {
            ...state.run.space.rockets,
            [rocketId]: {
              ...rocket,
              phase: "ready",
              targetAsteroidId: null,
              fuelQuantity: 0,
              fuelPumpEnabled: false,
              timerId: null,
            },
          },
        },
      },
    };
  } else if (id === "stockLoss") {
    const goods = stockLossCandidates(state);
    const goodPick = drawIndex(state, goods.length);
    state = goodPick.state;
    const goodId = goods[goodPick.index]!;
    const rate = nextRandom(state.run.random);
    const loss = 0.4 + rate.value * 0.4;
    state = {
      ...state,
      run: {
        ...state.run,
        random: rate.state,
        goods: {
          ...state.run.goods,
          [goodId]: {
            ...state.run.goods[goodId],
            quantity: Math.round(state.run.goods[goodId].quantity * (1 - loss)),
          },
        },
      },
    };
  } else if (id === "galacticMarketLockdown") {
    state = { ...state, run: { ...state.run, marketLockdownRemainingMs: 30 * 60_000 } };
    state = withActiveEffect(state, id, 30 * 60_000);
  } else if (id === "endlessSummer") {
    const weatherTimer = state.run.timers[STAR_WEATHER_TIMER_ID];
    state = {
      ...state,
      run: {
        ...state.run,
        timers: weatherTimer
          ? {
              ...state.run.timers,
              [STAR_WEATHER_TIMER_ID]: { ...weatherTimer, durationMs: 10_000, elapsedMs: 0 },
            }
          : state.run.timers,
        space: {
          ...state.run.space,
          currentSystemWeather: "clear",
          currentPrecipitationRate: 0,
          weatherCycleCount: 0,
        },
      },
    };
    const duration = nextRandomInteger(state.run.random, 40 * 60_000, 50 * 60_000);
    state = { ...state, run: { ...state.run, random: duration.state } };
    state = withActiveEffect(state, id, duration.value);
  } else if (id === "minerBrokeDown") {
    const miningRockets = Object.entries(state.run.space.rockets)
      .filter(([, rocket]) => rocket.phase === "mining")
      .map(([rocketId]) => rocketId);
    if (miningRockets.length === 0) return null;
    const pick = drawIndex(state, miningRockets.length);
    state = withActiveEffect(pick.state, id, 15 * 60_000, 0, miningRockets[pick.index]!);
  } else if (id === "supplyChainDisruption") {
    const candidates = supplyChainCandidates(state);
    if (candidates.length === 0) return null;
    const target = drawIndex(state, candidates.length);
    const percent = nextRandomInteger(target.state.run.random, 60, 80);
    state = { ...target.state, run: { ...target.state.run, random: percent.state } };
    state = withActiveEffect(
      state,
      id,
      15 * 60_000,
      1 - percent.value / 100,
      candidates[target.index]!,
    );
  } else if (id === "blackHoleInstability") {
    const duration = nextRandomInteger(state.run.random, 15 * 60_000, 25 * 60_000);
    const power = nextRandom(duration.state);
    const durationRoll = nextRandom(power.state);
    const roundHundredth = (value: number) => Math.round(value * 100) / 100;
    const powerMultiplier = roundHundredth(power.value + 0.5);
    const activeHole = state.permanent.blackHole.alwaysOn;
    const durationMultiplier = activeHole ? 1 : roundHundredth(durationRoll.value + 0.5);
    state = { ...state, run: { ...state.run, random: durationRoll.state } };
    state = withActiveEffect(
      state,
      id,
      duration.value,
      powerMultiplier,
      null,
      powerMultiplier,
      durationMultiplier,
    );
  }

  const probabilities = {
    ...state.run.randomEvents.probabilities,
    [id]: Math.max(0.01, state.run.randomEvents.probabilities[id] * 0.9),
  };
  const negative = NEGATIVE_EVENTS.has(id);
  const history = [
    ...state.run.randomEvents.history,
    { id, simulationMs: state.run.clock.simulationMs, negative },
  ].slice(-100);
  state = {
    ...state,
    run: { ...state.run, randomEvents: { ...state.run.randomEvents, probabilities, history } },
  };
  return { state, events: [{ type: "random-event.triggered", id, negative }] };
}

function attempt(
  stateValue: GameState,
  multiplier: number,
): { readonly state: GameState; readonly events: readonly RandomEventEngineEvent[] } {
  const eligible = RANDOM_EVENT_IDS.filter((id) => randomEventEligible(stateValue, id));
  if (eligible.length === 0) return { state: stateValue, events: [] };
  const pick = drawIndex(stateValue, eligible.length);
  const id = eligible[pick.index]!;
  const roll = nextRandom(pick.state.run.random);
  const state = { ...pick.state, run: { ...pick.state.run, random: roll.state } };
  return roll.value < state.run.randomEvents.probabilities[id] * multiplier
    ? (trigger(state, id) ?? { state, events: [] })
    : { state, events: [] };
}

export function forceRandomEvent(state: GameState, id: RandomEventId) {
  return trigger(state, id);
}

export function advanceRandomEvents(stateValue: GameState, elapsedMs: number) {
  if (elapsedMs <= 0) return { state: stateValue, events: [] as readonly RandomEventEngineEvent[] };
  let state = stateValue;
  const events: RandomEventEngineEvent[] = [];
  const endedIds: RandomEventId[] = [];
  const effects = state.run.randomEvents.activeEffects.flatMap((effect) => {
    const remainingMs = effect.remainingMs - elapsedMs;
    if (remainingMs <= 0) {
      endedIds.push(effect.id);
      events.push({ type: "random-event.ended", id: effect.id });
    }
    if (remainingMs <= 0 && effect.id !== "blackHoleInstability") return [];
    let updated = { ...effect, remainingMs: Math.max(0, remainingMs) };
    if (effect.id === "blackHoleInstability") {
      let untilShift = effect.nextShiftInMs;
      const activeElapsed = Math.min(elapsedMs, effect.remainingMs);
      while (untilShift <= activeElapsed) {
        const powerRoll = nextRandom(state.run.random);
        const durationRoll = state.permanent.blackHole.alwaysOn
          ? null
          : nextRandom(powerRoll.state);
        state = { ...state, run: { ...state.run, random: durationRoll?.state ?? powerRoll.state } };
        const roundHundredth = (value: number) => Math.round(value * 100) / 100;
        const powerMultiplier = roundHundredth(powerRoll.value + 0.5);
        updated = {
          ...updated,
          powerMultiplier,
          multiplier: powerMultiplier,
          durationMultiplier: durationRoll ? roundHundredth(durationRoll.value + 0.5) : 1,
        };
        untilShift += 60_000;
      }
      updated.nextShiftInMs = Math.max(1, untilShift - activeElapsed);
      if (remainingMs <= 0) return [];
    }
    return [updated];
  });
  state = {
    ...state,
    run: { ...state.run, randomEvents: { ...state.run.randomEvents, activeEffects: effects } },
  };
  if (endedIds.includes("endlessSummer")) state = advanceStarWeatherCycle(state);
  let elapsed = state.run.randomEvents.elapsedMs + elapsedMs;
  let interval = state.run.randomEvents.intervalMs;
  let halfway = state.run.randomEvents.halfwayAttempted;
  if (!halfway && elapsed >= interval / 2) {
    const result = attempt(state, 0.5);
    state = result.state;
    events.push(...result.events);
    halfway = true;
  }
  if (elapsed >= interval) {
    const result = attempt(state, 1);
    state = result.state;
    events.push(...result.events);
    elapsed = Math.max(0, elapsed - interval);
    const duration = nextRandomInteger(state.run.random, 45 * 60_000, 75 * 60_000);
    state = { ...state, run: { ...state.run, random: duration.state } };
    interval = duration.value;
    halfway = false;
  }
  state = {
    ...state,
    run: {
      ...state.run,
      randomEvents: {
        ...state.run.randomEvents,
        elapsedMs: elapsed,
        intervalMs: interval,
        halfwayAttempted: halfway,
      },
    },
  };
  return { state, events };
}

export function activeRandomEventMultiplier(state: GameState, id: RandomEventId): number {
  const effect = state.run.randomEvents.activeEffects.find((entry) => entry.id === id);
  return effect?.multiplier ?? 1;
}

export function activeRandomEventMultiplierForTarget(
  state: GameState,
  id: RandomEventId,
  targetId: string,
): number {
  const effect = state.run.randomEvents.activeEffects.find((entry) => entry.id === id);
  if (!effect || (effect.targetId !== null && effect.targetId !== targetId)) return 1;
  return effect.multiplier;
}

export function hasActiveRandomEvent(state: GameState, id: RandomEventId): boolean {
  return state.run.randomEvents.activeEffects.some((entry) => entry.id === id);
}
