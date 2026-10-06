import {
  ANTIMATTER_BOOST_MULTIPLIER,
  ASTEROID_SCAN_TIMER_ID,
  ASTEROID_SEARCH_GROWTH,
  MINIMUM_ASTEROID_SEARCH_DURATION_MS,
  MAX_UNINTERACTED_ASTEROIDS,
  LAUNCH_PAD_COST,
  ROCKET_FUEL_CAPACITY,
  ROCKET_FUEL_PUMP_BASE_COST,
  ROCKET_FUEL_PUMP_RATE_PER_SECOND,
  ROCKET_IDS,
  ROCKET_PART_REQUIREMENTS,
  ROCKET_TRAVEL_MS_PER_DISTANCE_UNIT,
  FLEET_ENVOY_COST,
  SPACE_WEATHER_CONDITIONS,
  STARSHIP_WARP_REMAINING_MS,
  STAR_STUDY_TIMER_ID,
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
  PLAYER_FLEETS,
  PLAYER_FLEET_IDS,
  ENEMY_FLEET_IDS,
  VOID_PILLAGE_POWER_PER_SECOND,
  VOID_PILLAGE_TIMER_ID,
  TELESCOPE_COST,
  type RocketId,
  type SpacePurchaseCost,
  type TelescopeSurvey,
} from "../content/space";
import { COMPOUND_IDS, GALAXY_SEED_DEFAULT, type SystemId } from "../content/ids";
import {
  createStarCatalogue,
  distanceBetweenStars,
  HOME_SYSTEM_NAME,
  starTypeForSystem,
} from "../content/starCatalogue";
import { antimatterRequiredForDistance } from "./starData";
import { createStarMapModel } from "./starMap";
import { ensureDiscoveredStarSystemProfiles } from "./starSystemProfiles";
import {
  generateAncientManuscriptAtStudyMilestone,
  reportAncientManuscriptsAtSystem,
} from "./ancientManuscripts";
import { rollBlackHoleDiscovery } from "./blackHole";
import { generateStarSystemEncounter } from "./starSystemEncounters";
import { antimatterStarTypeMultiplier } from "../content/starTypeRules";
import { O_TYPE_POWER_PLANT_IDS, type OTypePowerPlantId } from "../content/starTypeRules";
import { permanentPerkPurchaseCount } from "../content/economyRules";
import { philosophyDiscountedSpaceCost, philosophyRepeatableRank } from "./philosophy";
import { canAfford, settleSpend } from "./precision";
import { nextRandom } from "./random";
import { addLifetimeCount } from "./statistics";
import { createSystemRandom } from "./systemRandom";
import { resolveDiplomacyChoice } from "./diplomacy";
import {
  megastructureAntimatterRatePerSecond as permanentMegastructureAntimatterRate,
  miaplacidusForceFieldLevel,
} from "./megastructures";
import {
  playerFleetBuildCost,
  playerFleetUnitStats,
  totalPlayerFleetPower,
} from "./fleetMechanics";
import type { GameState } from "./state";
import { advanceTimers, createTimer, createTimerId, type TimerEvent } from "./timers";
import {
  asteroidSearchDuration,
  generateAsteroid,
  pruneAsteroids,
  rocketPartCost,
  asteroidExtractionRatePerSecond,
  hasControlCharacter,
  starStudyDuration,
  starshipTravelDurationMs,
  rocketTravelDurationMs,
  isStarshipReady,
  starshipModulePartCost,
  voidPillageDuration,
  voidPillageRewards,
} from "./spaceRules";
import type { ClockStep } from "./clock";
import type { TickPlan } from "./transactions";
import type { SpaceCommand, SpaceCommandFailure, SpaceEvent } from "./spaceCommands";
import type { EngineEvent, PreconditionResult } from "./commands";
import {
  advanceStarWeatherCycle,
  currentWeatherForSystem,
  weatherBlocksRocketLaunch,
  STAR_WEATHER_TIMER_ID,
} from "./weather";

export interface SpaceTransition {
  readonly state: GameState;
  readonly events: readonly (SpaceEvent | TimerEvent)[];
}

function reject(failure: SpaceCommandFailure): PreconditionResult {
  return { ok: false, failure };
}

function hasSpaceMiningTechnology(state: GameState): boolean {
  return state.run.economy.researchedTechnologies.includes("atmosphericTelescopes");
}

function hasRocketFuelTechnology(state: GameState): boolean {
  return state.run.economy.researchedTechnologies.includes("advancedFuels");
}

function hasAutoTelescopePerk(state: GameState): boolean {
  return (
    state.run.space.autoTelescopeUnlocked ||
    permanentPerkPurchaseCount(state.permanent.acquiredPerks, "autoSpaceTelescope") > 0
  );
}

function canPillageVoid(state: GameState): boolean {
  return (
    state.permanent.rebirthCount > 0 &&
    state.permanent.philosophyId === "voidborn" &&
    state.run.philosophyAbilityActive
  );
}

function rocketIsActive(rocket: GameState["run"]["space"]["rockets"][RocketId]): boolean {
  return rocket.phase === "outbound" || rocket.phase === "mining" || rocket.phase === "returning";
}

function megastructureAntimatterRatePerSecond(state: GameState): number {
  return permanentMegastructureAntimatterRate(state);
}

function rocketJourneyTimerId(rocketId: RocketId) {
  return createTimerId("travel", `${rocketId}-asteroid-journey`);
}

const STARSHIP_BATTLE_TIMER_ID = createTimerId("battle", "starship-combat");

export function starshipTravelPlan(state: GameState, systemId: string) {
  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const current =
    catalogue.find((star) => star.id === state.run.space.currentSystemId) ??
    catalogue.find(
      (star) =>
        star.name.toLocaleLowerCase("en") ===
        state.run.space.currentSystemId.toLocaleLowerCase("en"),
    );
  const destination = catalogue.find((star) => star.id === systemId);
  if (!current || !destination || current.id === destination.id) return null;
  const selectable = createStarMapModel(
    catalogue,
    current.id,
    state.run.space.starStudyRange,
    miaplacidusForceFieldLevel(state),
  ).find((star) => star.id === destination.id && star.selectable);
  if (!selectable) return null;
  const distance = distanceBetweenStars(current, destination);
  const quantumEnginePurchases = permanentPerkPurchaseCount(
    state.permanent.acquiredPerks,
    "quantumEngines",
  );
  const warpDrivePurchases =
    permanentPerkPurchaseCount(state.permanent.acquiredPerks, "warpDrive") +
    philosophyRepeatableRank(state, "warpDrive");
  return {
    distanceLy: distance,
    durationMs: starshipTravelDurationMs(distance, quantumEnginePurchases, warpDrivePurchases),
    antimatter: antimatterRequiredForDistance(distance),
  };
}

function isUndisclosedFactorySystem(state: GameState, systemId: string): boolean {
  return state.permanent.megastructures.ancientManuscripts.some(
    (record) => record.factorySystemId === systemId && !record.reported,
  );
}

function diplomacyIsAvailable(state: GameState): boolean {
  const starship = state.run.space.starship;
  const systemId = starship.destinationSystemId;
  if (starship.phase !== "orbiting" || systemId === null || !state.run.space.fleetEnvoyBuilt)
    return false;
  const encounter = state.run.space.systemEncounters.find((entry) => entry.systemId === systemId);
  if (
    !encounter ||
    encounter.civilizationLevel === "none" ||
    encounter.civilizationLevel === "unsentient" ||
    encounter.enemyFleets.air + encounter.enemyFleets.land + encounter.enemyFleets.sea <= 0 ||
    encounter.warReady ||
    encounter.warMode ||
    state.permanent.megastructures.ancientManuscripts.some(
      (record) => record.factorySystemId === systemId,
    )
  )
    return false;
  const star = createStarCatalogue(GALAXY_SEED_DEFAULT).find((entry) => entry.id === systemId);
  return star !== undefined && star.starType !== "O";
}

function currentEncounter(state: GameState) {
  const systemId = state.run.space.starship.destinationSystemId;
  return systemId === null
    ? undefined
    : state.run.space.systemEncounters.find((entry) => entry.systemId === systemId);
}

function enemyFleetCount(encounter: NonNullable<ReturnType<typeof currentEncounter>>): number {
  return encounter.enemyFleets.air + encounter.enemyFleets.land + encounter.enemyFleets.sea;
}

function encounterCanSettle(encounter: NonNullable<ReturnType<typeof currentEncounter>>): boolean {
  return (
    encounter.battle.phase === "victory" ||
    encounter.attitude === "surrendered" ||
    encounter.civilizationLevel === "none" ||
    encounter.civilizationLevel === "unsentient" ||
    enemyFleetCount(encounter) === 0
  );
}

function supremacistFleetAbilityActive(state: GameState): boolean {
  return (
    state.permanent.philosophyId === "supremacist" &&
    state.permanent.rebirthCount > 0 &&
    state.run.philosophyAbilityActive
  );
}

function canVassalize(
  state: GameState,
  encounter: NonNullable<ReturnType<typeof currentEncounter>>,
) {
  const playerPower = totalPlayerFleetPower(state.run.space.playerFleetCombatTotals).attackPower;
  const enemyPower = enemyFleetCount(encounter);
  const standardCheck =
    playerPower > enemyPower * 1.5 &&
    encounter.lifeformTraits[0] !== "aggressive" &&
    encounter.currentImpression >= 95;
  const empoweredCheck = supremacistFleetAbilityActive(state) && playerPower > enemyPower * 3;
  return standardCheck || empoweredCheck;
}

function startRocketTravel(
  state: GameState,
  rocketId: RocketId,
  asteroidId: string,
  direction: "outbound" | "returning",
): SpaceTransition {
  const asteroid = state.run.space.asteroids.find((entry) => entry.id === asteroidId)!;
  const timerId = rocketJourneyTimerId(rocketId);
  const asteroidAttractorPurchases =
    permanentPerkPurchaseCount(state.permanent.acquiredPerks, "asteroidAttractors") +
    philosophyRepeatableRank(state, "asteroidAttractors");
  const timer = createTimer({
    id: timerId,
    domain: "travel",
    durationMs: rocketTravelDurationMs(
      asteroid.distance,
      ROCKET_TRAVEL_MS_PER_DISTANCE_UNIT,
      asteroidAttractorPurchases,
    ),
  });
  const asteroids = state.run.space.asteroids.map((entry) =>
    entry.id === asteroidId ? { ...entry, reservedBy: rocketId, interacted: true } : entry,
  );
  const rocket = state.run.space.rockets[rocketId];
  return {
    state: {
      ...state,
      run: {
        ...state.run,
        timers: { ...state.run.timers, [timer.id]: timer },
        space: {
          ...state.run.space,
          asteroids,
          selectedAsteroidId: asteroidId,
          rockets: {
            ...state.run.space.rockets,
            [rocketId]: { ...rocket, phase: direction, targetAsteroidId: asteroidId, timerId },
          },
        },
      },
    },
    events: [{ type: "space.rocket.travel-started", rocketId, asteroidId, direction }],
  };
}

function canPowerTelescope(state: GameState): boolean {
  const power = state.run.economy.power;
  return (
    power.infinitePower ||
    (power.gridEnabled && !power.tripped && (power.quantity > 0 || power.capacity > 0))
  );
}

export function checkSpacePurchaseCost(
  state: GameState,
  cost: SpacePurchaseCost,
): PreconditionResult {
  if (
    !Number.isFinite(cost.cash) ||
    cost.cash < 0 ||
    (cost.antimatter !== undefined && (!Number.isFinite(cost.antimatter) || cost.antimatter < 0)) ||
    cost.materials.some((item) => !Number.isFinite(item.amount) || item.amount < 0)
  ) {
    return {
      ok: false,
      failure: { code: "invalid-cost", messageKey: "engine.error.invalid-cost" },
    };
  }
  if (!canAfford(state.run.cash, cost.cash)) {
    return {
      ok: false,
      failure: {
        code: "insufficient-cash",
        messageKey: "engine.purchase.insufficient-cash",
        required: cost.cash,
      },
    };
  }
  if (cost.antimatter !== undefined && !canAfford(state.run.space.antimatter, cost.antimatter)) {
    return {
      ok: false,
      failure: {
        code: "insufficient-antimatter",
        messageKey: "engine.purchase.insufficient-antimatter",
        required: cost.antimatter,
      },
    };
  }
  for (const item of cost.materials) {
    if (!canAfford(state.run.goods[item.goodId].quantity, item.amount)) {
      return {
        ok: false,
        failure: {
          code: "insufficient-material",
          messageKey: "engine.purchase.insufficient-material",
          goodId: item.goodId,
          required: item.amount,
        },
      };
    }
  }
  return { ok: true };
}

function purchaseFailure(state: GameState, cost: SpacePurchaseCost): PreconditionResult | null {
  const result = checkSpacePurchaseCost(state, cost);
  return result.ok ? null : result;
}

export function checkSpacePreconditions(
  state: GameState,
  command: SpaceCommand,
): PreconditionResult {
  if (command.type === "space.asteroid.select") {
    if (
      command.asteroidId !== null &&
      !state.run.space.asteroids.some((asteroid) => asteroid.id === command.asteroidId)
    ) {
      return reject({
        code: "space-invalid-selection",
        messageKey: "space.reason.invalid-selection",
      });
    }
    return { ok: true };
  }
  if (command.type === "space.launch-pad.build") {
    if (!state.run.economy.researchedTechnologies.includes("rocketComposites"))
      return reject({
        code: "space-launch-pad-tech-locked",
        messageKey: "space.reason.launch-pad-tech-locked",
      });
    if (state.run.space.launchPadBuilt)
      return reject({
        code: "space-launch-pad-built",
        messageKey: "space.reason.launch-pad-built",
      });
    return (
      purchaseFailure(
        state,
        philosophyDiscountedSpaceCost(state, LAUNCH_PAD_COST, "efficientAssembly", 0.01, true),
      ) ?? { ok: true }
    );
  }
  if (command.type === "space.starship.module.build") {
    if (state.run.space.starship.phase !== "unlaunched")
      return reject({
        code: "space-starship-already-launched",
        messageKey: "space.reason.starship-already-launched",
      });
    if (!STARSHIP_MODULE_IDS.includes(command.moduleId))
      return reject({
        code: "space-invalid-starship-module",
        messageKey: "space.reason.invalid-starship-module",
      });
    const definition = STARSHIP_MODULES[command.moduleId];
    if (!state.run.economy.researchedTechnologies.includes(definition.technology))
      return reject({
        code: "space-starship-module-locked",
        messageKey: "space.reason.starship-module-locked",
      });
    const builtParts = state.run.space.starshipModules[command.moduleId].builtParts;
    if (builtParts >= definition.parts)
      return reject({
        code: "space-starship-module-complete",
        messageKey: "space.reason.starship-module-complete",
      });
    return (
      purchaseFailure(
        state,
        starshipModulePartCost(
          command.moduleId,
          builtParts,
          permanentPerkPurchaseCount(state.permanent.acquiredPerks, "spaceElevator") +
            philosophyRepeatableRank(state, "spaceElevator"),
        ),
      ) ?? {
        ok: true,
      }
    );
  }
  if (command.type === "space.starship.destination.select") {
    if (state.run.space.starship.phase !== "unlaunched")
      return reject({
        code: "space-starship-already-launched",
        messageKey: "space.reason.starship-already-launched",
      });
    if (
      command.systemId !== null &&
      (isUndisclosedFactorySystem(state, command.systemId) ||
        !starshipTravelPlan(state, command.systemId))
    )
      return reject({
        code: "space-starship-destination-invalid",
        messageKey: "space.reason.starship-destination-invalid",
      });
    return { ok: true };
  }
  if (command.type === "space.starship.launch") {
    if (state.run.space.starship.phase !== "unlaunched")
      return reject({
        code: "space-starship-already-launched",
        messageKey: "space.reason.starship-already-launched",
      });
    if (!isStarshipReady(state.run.space))
      return reject({
        code: "space-starship-incomplete",
        messageKey: "space.reason.starship-incomplete",
      });
    const destinationId = state.run.space.starship.destinationSystemId;
    if (destinationId && isUndisclosedFactorySystem(state, destinationId))
      return reject({
        code: "space-starship-destination-invalid",
        messageKey: "space.reason.starship-destination-invalid",
      });
    const plan = destinationId ? starshipTravelPlan(state, destinationId) : null;
    if (!plan)
      return reject({
        code: "space-starship-destination-invalid",
        messageKey: "space.reason.starship-destination-invalid",
      });
    if (!state.run.economy.researchedTechnologies.includes("FTLTravelTheory"))
      return reject({
        code: "space-starship-ftl-required",
        messageKey: "space.reason.starship-ftl-required",
      });
    return (
      purchaseFailure(state, { cash: 0, antimatter: plan.antimatter, materials: [] }) ?? {
        ok: true,
      }
    );
  }
  if (command.type === "space.starship.system.scan") {
    const starship = state.run.space.starship;
    const destinationId = starship.destinationSystemId;
    const scannerBuiltParts = state.run.space.starshipModules.stellarScanner.builtParts;
    const alreadyScanned = state.run.space.systemEncounters.some(
      (encounter) => encounter.systemId === destinationId,
    );
    return starship.phase === "orbiting" &&
      destinationId !== null &&
      scannerBuiltParts >= STARSHIP_MODULES.stellarScanner.parts &&
      !alreadyScanned
      ? { ok: true }
      : {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
  }
  if (command.type === "space.envoy.build") {
    if (
      state.run.space.starshipModules.fleetHangar.builtParts < STARSHIP_MODULES.fleetHangar.parts ||
      !state.run.economy.researchedTechnologies.includes("starshipFleets")
    )
      return reject({
        code: "space-envoy-module-required",
        messageKey: "space.reason.envoy-module-required",
      });
    if (state.run.space.fleetEnvoyBuilt)
      return reject({ code: "space-envoy-built", messageKey: "space.reason.envoy-built" });
    return purchaseFailure(state, FLEET_ENVOY_COST) ?? { ok: true };
  }
  if (command.type === "space.fleet.build") {
    if (!PLAYER_FLEET_IDS.includes(command.fleetId))
      return reject({ code: "space-invalid-fleet", messageKey: "space.reason.invalid-fleet" });
    if (
      state.run.space.starshipModules.fleetHangar.builtParts < STARSHIP_MODULES.fleetHangar.parts ||
      !state.run.economy.researchedTechnologies.includes("starshipFleets")
    )
      return reject({
        code: "space-fleet-hangar-required",
        messageKey: "space.reason.fleet-hangar-required",
      });
    if (state.run.space.playerFleets[command.fleetId] >= PLAYER_FLEETS[command.fleetId].maxQuantity)
      return reject({
        code: "space-fleet-at-capacity",
        messageKey: "space.reason.fleet-at-capacity",
      });
    return purchaseFailure(state, playerFleetBuildCost(state, command.fleetId)) ?? { ok: true };
  }
  if (command.type === "space.diplomacy.choose") {
    const encounter = currentEncounter(state);
    const available = diplomacyIsAvailable(state);
    const playerPower = totalPlayerFleetPower(state.run.space.playerFleetCombatTotals).attackPower;
    const validChoice =
      command.choice === "message" ||
      command.choice === "harmony" ||
      (command.choice === "bully" &&
        encounter !== undefined &&
        playerPower > enemyFleetCount(encounter)) ||
      (command.choice === "vassalize" && encounter !== undefined && canVassalize(state, encounter));
    return validChoice && available
      ? { ok: true }
      : reject({
          code: "space-diplomacy-unavailable",
          messageKey: "space.reason.diplomacy-unavailable",
        });
  }
  if (command.type === "space.diplomacy.enter-war") {
    const encounter = currentEncounter(state);
    return state.run.space.starship.phase === "orbiting" &&
      encounter !== undefined &&
      encounter.warReady &&
      !encounter.warMode &&
      enemyFleetCount(encounter) > 0
      ? { ok: true }
      : reject({
          code: "space-diplomacy-unavailable",
          messageKey: "space.reason.diplomacy-unavailable",
        });
  }
  if (command.type === "space.battle.engage") {
    const encounter = currentEncounter(state);
    const playerShips = PLAYER_FLEET_IDS.reduce(
      (sum, fleetId) => sum + state.run.space.playerFleets[fleetId],
      0,
    );
    return state.run.space.starship.phase === "orbiting" &&
      encounter !== undefined &&
      encounter.warMode &&
      !encounter.warReady &&
      encounter.battle.phase !== "inProgress" &&
      encounter.battle.phase !== "victory" &&
      enemyFleetCount(encounter) > 0 &&
      playerShips > 0 &&
      state.run.timers[STARSHIP_BATTLE_TIMER_ID] === undefined
      ? { ok: true }
      : reject({
          code: "space-diplomacy-unavailable",
          messageKey: "space.reason.diplomacy-unavailable",
        });
  }
  if (command.type === "space.system.settle") {
    const encounter = currentEncounter(state);
    const systemId = state.run.space.starship.destinationSystemId;
    return state.run.space.starship.phase === "orbiting" &&
      systemId !== null &&
      encounter !== undefined &&
      encounterCanSettle(encounter) &&
      !state.permanent.settledSystemIds.includes(systemId)
      ? { ok: true }
      : reject({
          code: "space-diplomacy-unavailable",
          messageKey: "space.reason.diplomacy-unavailable",
        });
  }
  if (command.type === "space.starship.travel.warp") {
    const starship = state.run.space.starship;
    const timer = starship.timerId ? state.run.timers[starship.timerId] : null;
    return starship.phase === "travelling" && timer?.status === "running"
      ? { ok: true }
      : {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
  }
  if (command.type === "space.antimatter-boost.set-active")
    return typeof command.active === "boolean"
      ? { ok: true }
      : {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
  if (command.type === "space.weather.set-condition")
    return SPACE_WEATHER_CONDITIONS.includes(command.condition)
      ? { ok: true }
      : reject({
          code: "space-invalid-weather",
          messageKey: "space.reason.invalid-weather",
        });
  if (
    command.type === "space.rocket.part.build" ||
    command.type === "space.rocket.rename" ||
    command.type === "space.rocket.pump.purchase" ||
    command.type === "space.rocket.launch" ||
    command.type === "space.rocket.travel" ||
    command.type === "space.rocket.pump.set-enabled"
  ) {
    if (!ROCKET_IDS.includes(command.rocketId))
      return reject({ code: "space-invalid-rocket", messageKey: "space.reason.invalid-rocket" });
    const rocket = state.run.space.rockets[command.rocketId];
    if (command.type === "space.rocket.travel") {
      if (!state.run.space.launchPadBuilt)
        return reject({
          code: "space-launch-pad-required",
          messageKey: "space.reason.launch-pad-required",
        });
      if (rocket.phase !== "orbit")
        return reject({
          code: "space-rocket-not-orbiting",
          messageKey: "space.reason.rocket-not-orbiting",
        });
      const asteroid = state.run.space.asteroids.find(
        (entry) =>
          entry.id === command.asteroidId && entry.systemId === state.run.space.currentSystemId,
      );
      if (!asteroid || asteroid.depleted || asteroid.reservedBy !== null)
        return reject({
          code: "space-asteroid-unavailable",
          messageKey: "space.reason.asteroid-unavailable",
        });
      return { ok: true };
    }
    if (command.type === "space.rocket.rename") {
      const name = command.name.trim();
      return name.length > 0 && [...name].length <= 12 && !hasControlCharacter(name)
        ? { ok: true }
        : reject({
            code: "space-invalid-rocket-name",
            messageKey: "space.reason.invalid-rocket-name",
          });
    }
    if (command.type === "space.rocket.part.build") {
      if (!state.run.space.launchPadBuilt)
        return reject({
          code: "space-launch-pad-required",
          messageKey: "space.reason.launch-pad-required",
        });
      if (rocket.builtParts >= ROCKET_PART_REQUIREMENTS[command.rocketId])
        return reject({
          code: "space-rocket-complete",
          messageKey: "space.reason.rocket-complete",
        });
      return (
        purchaseFailure(
          state,
          rocketPartCost(
            rocket.builtParts,
            permanentPerkPurchaseCount(state.permanent.acquiredPerks, "launchPadMassProduction") +
              philosophyRepeatableRank(state, "launchPadMassProduction"),
          ),
        ) ?? { ok: true }
      );
    }
    if (command.type === "space.rocket.pump.purchase") {
      if (!hasRocketFuelTechnology(state))
        return reject({
          code: "space-fuel-tech-locked",
          messageKey: "space.reason.fuel-tech-locked",
        });
      if (
        rocket.builtParts < ROCKET_PART_REQUIREMENTS[command.rocketId] ||
        rocket.phase !== "ready"
      )
        return reject({
          code: "space-rocket-incomplete",
          messageKey: "space.reason.rocket-incomplete",
        });
      if (rocketIsActive(rocket))
        return reject({ code: "space-rocket-active", messageKey: "space.reason.rocket-active" });
      if (rocket.fuelPumpPurchased)
        return reject({
          code: "space-fuel-pump-purchased",
          messageKey: "space.reason.fuel-pump-purchased",
        });
      return (
        purchaseFailure(state, {
          cash: ROCKET_FUEL_PUMP_BASE_COST[command.rocketId],
          materials: [],
        }) ?? { ok: true }
      );
    }
    if (command.type === "space.rocket.launch") {
      if (!state.run.space.launchPadBuilt)
        return reject({
          code: "space-launch-pad-required",
          messageKey: "space.reason.launch-pad-required",
        });
      if (
        rocket.phase !== "ready" ||
        rocket.builtParts !== ROCKET_PART_REQUIREMENTS[command.rocketId]
      )
        return reject({
          code: "space-rocket-incomplete",
          messageKey: "space.reason.rocket-incomplete",
        });
      if (rocket.fuelQuantity < ROCKET_FUEL_CAPACITY[command.rocketId])
        return reject({
          code: "space-rocket-fuel-empty",
          messageKey: "space.reason.rocket-fuel-empty",
        });
      if (weatherBlocksRocketLaunch(state.run.space))
        return reject({
          code: "space-weather-blocked",
          messageKey: "space.reason.weather-blocked",
        });
      return { ok: true };
    }
    if (typeof command.enabled !== "boolean")
      return {
        ok: false,
        failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
      };
    if (!command.enabled) return { ok: true };
    if (!hasRocketFuelTechnology(state))
      return reject({
        code: "space-fuel-tech-locked",
        messageKey: "space.reason.fuel-tech-locked",
      });
    if (!rocket.fuelPumpPurchased)
      return reject({
        code: "space-fuel-pump-required",
        messageKey: "space.reason.fuel-pump-required",
      });
    if (rocket.builtParts < ROCKET_PART_REQUIREMENTS[command.rocketId] || rocket.phase !== "ready")
      return reject({
        code: "space-rocket-incomplete",
        messageKey: "space.reason.rocket-incomplete",
      });
    if (rocketIsActive(rocket))
      return reject({ code: "space-rocket-active", messageKey: "space.reason.rocket-active" });
    if (rocket.fuelQuantity >= ROCKET_FUEL_CAPACITY[command.rocketId])
      return reject({
        code: "space-rocket-fuel-full",
        messageKey: "space.reason.rocket-fuel-full",
      });
    const power = state.run.economy.power;
    if (!power.infinitePower && (!power.gridEnabled || power.tripped))
      return reject({ code: "space-no-grid", messageKey: "space.reason.no-grid" });
    return { ok: true };
  }
  if (command.type === "space.telescope.build") {
    if (!hasSpaceMiningTechnology(state))
      return reject({
        code: "space-technology-locked",
        messageKey: "space.reason.technology-locked",
      });
    if (state.run.space.telescopeBuilt)
      return reject({ code: "space-telescope-built", messageKey: "space.reason.telescope-built" });
    return (
      purchaseFailure(
        state,
        philosophyDiscountedSpaceCost(state, TELESCOPE_COST, "efficientAssembly", 0.01, true),
      ) ?? { ok: true }
    );
  }
  if (
    command.type === "space.telescope.scan.start" ||
    command.type === "space.telescope.study.start" ||
    command.type === "space.telescope.pillage.start"
  ) {
    if (command.type === "space.telescope.pillage.start" && !canPillageVoid(state))
      return reject({
        code: "space-pillage-locked",
        messageKey: "space.reason.pillage-locked",
      });
    if (!hasSpaceMiningTechnology(state))
      return reject({
        code: "space-technology-locked",
        messageKey: "space.reason.technology-locked",
      });
    if (!state.run.space.telescopeBuilt)
      return reject({
        code: "space-telescope-required",
        messageKey: "space.reason.telescope-required",
      });
    if (state.run.space.activeSurvey !== null)
      return reject({ code: "space-survey-active", messageKey: "space.reason.survey-active" });
    if (!canPowerTelescope(state))
      return reject({ code: "space-no-power", messageKey: "space.reason.no-power" });
    return { ok: true };
  }
  if (command.type === "space.telescope.auto.set-enabled") {
    if (!hasAutoTelescopePerk(state))
      return reject({
        code: "space-automation-locked",
        messageKey: "space.reason.automation-locked",
      });
    if (!state.run.space.telescopeBuilt)
      return reject({
        code: "space-telescope-required",
        messageKey: "space.reason.telescope-required",
      });
    if (typeof command.enabled !== "boolean")
      return {
        ok: false,
        failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
      };
    return { ok: true };
  }
  if (command.type === "space.telescope.auto.set-mode") {
    if (!hasAutoTelescopePerk(state))
      return reject({
        code: "space-automation-locked",
        messageKey: "space.reason.automation-locked",
      });
    if (!state.run.space.telescopeBuilt)
      return reject({
        code: "space-telescope-required",
        messageKey: "space.reason.telescope-required",
      });
    if (!(["asteroids", "stars", "pillageVoid"] as const).includes(command.mode))
      return reject({ code: "space-invalid-mode", messageKey: "space.reason.invalid-mode" });
    if (command.mode === "pillageVoid" && !canPillageVoid(state))
      return reject({
        code: "space-automation-unavailable",
        messageKey: "space.reason.automation-unavailable",
      });
    return { ok: true };
  }
  return {
    ok: false,
    failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
  };
}

function beginSurvey(state: GameState, survey: TelescopeSurvey): SpaceTransition {
  const isAsteroidSurvey = survey === "asteroids";
  const duration =
    survey === "asteroids"
      ? asteroidSearchDuration(
          state.run.space.telescopeBaseSearchDurationMs,
          state.run.random,
          permanentPerkPurchaseCount(state.permanent.acquiredPerks, "asteroidDwellers") +
            philosophyRepeatableRank(state, "asteroidDwellers"),
        )
      : survey === "stars"
        ? starStudyDuration(
            state.run.random,
            permanentPerkPurchaseCount(state.permanent.acquiredPerks, "stellarInsightManifold") +
              philosophyRepeatableRank(state, "stellarInsightManifold"),
          )
        : voidPillageDuration(state.run.random);
  const scanSpeedLevel = permanentPerkPurchaseCount(
    state.permanent.acquiredPerks,
    "fasterAsteroidScan",
  );
  const adjustedDuration = isAsteroidSurvey
    ? Math.max(MINIMUM_ASTEROID_SEARCH_DURATION_MS, duration.durationMs * 0.75 ** scanSpeedLevel)
    : duration.durationMs;
  const timerId = createTimerId(
    "survey",
    survey === "asteroids" ? "asteroid-scan" : survey === "stars" ? "star-study" : "void-pillage",
  );
  const timer = createTimer({
    id: timerId,
    domain: "survey",
    durationMs: adjustedDuration,
  });
  return {
    state: {
      ...state,
      run: {
        ...state.run,
        random: duration.random,
        timers: { ...state.run.timers, [timer.id]: timer },
        space: {
          ...state.run.space,
          activeSurvey: survey,
          surveyPowerBlocked: false,
        },
      },
    },
    events: [{ type: "space.survey.started", survey }],
  };
}

export function applySpacePurchaseCost(state: GameState, cost: SpacePurchaseCost) {
  const goods = { ...state.run.goods };
  for (const item of cost.materials) {
    goods[item.goodId] = {
      ...goods[item.goodId],
      quantity: settleSpend(goods[item.goodId].quantity, item.amount),
    };
  }
  return {
    ...state.run,
    cash: settleSpend(state.run.cash, cost.cash),
    goods,
    space: {
      ...state.run.space,
      antimatter:
        cost.antimatter === undefined
          ? state.run.space.antimatter
          : settleSpend(state.run.space.antimatter, cost.antimatter),
    },
  };
}

function payCost(state: GameState, cost: SpacePurchaseCost) {
  return applySpacePurchaseCost(state, cost);
}

const PLAYER_BATTLE_TARGETS: Readonly<
  Record<(typeof PLAYER_FLEET_IDS)[number], readonly (typeof ENEMY_FLEET_IDS)[number][]>
> = {
  scout: ["air", "sea"],
  marauder: ["land", "sea"],
  landStalker: ["air", "land"],
  navalStrafer: ["sea", "land"],
};
const ENEMY_BATTLE_TARGETS: Readonly<
  Record<(typeof ENEMY_FLEET_IDS)[number], readonly (typeof PLAYER_FLEET_IDS)[number][]>
> = {
  air: ["scout", "marauder", "landStalker"],
  land: ["scout", "marauder", "navalStrafer"],
  sea: ["landStalker", "navalStrafer"],
};

function fleetCountAtHealth(healthPool: number, unitHealth: number, maximum: number): number {
  return Math.min(maximum, Math.ceil(Math.max(0, healthPool) / Math.max(1, unitHealth)));
}

function selectLowestHealthTarget<T extends string>(
  preferred: readonly T[],
  pools: Readonly<Record<T, number>>,
  unitHealth: Readonly<Record<T, number>>,
  count: (id: T) => number,
): T | null {
  const candidates = preferred.filter((id) => count(id) > 0);
  const targetTypes =
    candidates.length > 0
      ? candidates
      : (Object.keys(pools).filter((id) => count(id as T) > 0) as T[]);
  return targetTypes.reduce<T | null>((selected, id) => {
    if (selected === null) return id;
    return pools[id] / unitHealth[id] < pools[selected] / unitHealth[selected] ? id : selected;
  }, null);
}

function battleEnemyUnitHealth(
  encounter: NonNullable<ReturnType<typeof currentEncounter>>,
): number {
  return encounter.lifeformTraits.includes("hiveMind") ? 50 : 100;
}

function playerHealthPoolsForCurrentFleets(
  state: GameState,
): Readonly<Record<(typeof PLAYER_FLEET_IDS)[number], number>> {
  return Object.fromEntries(
    PLAYER_FLEET_IDS.map((fleetId) => [
      fleetId,
      state.run.space.playerFleets[fleetId] * playerFleetUnitStats(state, fleetId).maxHealth,
    ]),
  ) as Record<(typeof PLAYER_FLEET_IDS)[number], number>;
}

function enemyHealthPoolsForEncounter(
  encounter: NonNullable<ReturnType<typeof currentEncounter>>,
): Readonly<Record<(typeof ENEMY_FLEET_IDS)[number], number>> {
  const health = battleEnemyUnitHealth(encounter);
  return Object.fromEntries(
    ENEMY_FLEET_IDS.map((fleetId) => [fleetId, encounter.enemyFleets[fleetId] * health]),
  ) as Record<(typeof ENEMY_FLEET_IDS)[number], number>;
}

function rapidExpansionSystems(state: GameState, destinationSystemId: SystemId) {
  let random = state.run.random;
  const allowedRoll = nextRandom(random);
  random = allowedRoll.state;
  const maximum = Math.floor(allowedRoll.value * 4);
  if (maximum === 0) return { systemIds: [] as SystemId[], random };

  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const destination = catalogue.find((star) => star.id === destinationSystemId);
  if (!destination) return { systemIds: [] as SystemId[], random };
  const unavailable = new Set([
    ...state.permanent.settledSystemIds,
    ...state.run.expansionistExtraSystemIds,
    state.run.space.currentSystemId,
    destinationSystemId,
  ]);
  const manuscriptSystems = new Set(
    state.permanent.megastructures.ancientManuscripts.map((record) => record.factorySystemId),
  );
  let candidates = catalogue
    .filter((star) => !unavailable.has(star.id) && star.starType !== "O")
    .filter((star) => !manuscriptSystems.has(star.id))
    .map((star) => ({ star, distance: distanceBetweenStars(destination, star) }))
    .filter((entry) => entry.distance <= 10);
  const fleetPower = totalPlayerFleetPower(state.run.space.playerFleetCombatTotals).attackPower;
  const captured: SystemId[] = [];
  const settlementCapacity = Math.max(
    0,
    100 - state.permanent.settledSystemIds.length - 1 - state.run.expansionistExtraSystemIds.length,
  );
  const count = Math.min(maximum, candidates.length, settlementCapacity);
  for (let index = 0; index < count; index += 1) {
    const selection = nextRandom(random);
    random = selection.state;
    const candidateIndex = Math.floor(selection.value * candidates.length);
    const candidate = candidates.splice(candidateIndex, 1)[0]!;
    const fleetScore = Math.min(fleetPower / 275, 1) * 50;
    const distanceScore =
      candidate.distance < 1
        ? 50
        : candidate.distance >= 10
          ? 0
          : (1 - (candidate.distance - 1) / 9) * 50;
    const roll = nextRandom(random);
    random = roll.state;
    if (roll.value * 100 <= fleetScore + distanceScore) captured.push(candidate.star.id);
  }
  return { systemIds: captured, random };
}

function resolveBattleRound(state: GameState, systemId: SystemId): SpaceTransition {
  const encounterIndex = state.run.space.systemEncounters.findIndex(
    (entry) => entry.systemId === systemId,
  );
  const encounter = state.run.space.systemEncounters[encounterIndex];
  if (!encounter || encounter.battle.phase !== "inProgress") return { state, events: [] };

  const enemyHealth = battleEnemyUnitHealth(encounter);
  const playerUnitHealth = Object.fromEntries(
    PLAYER_FLEET_IDS.map((fleetId) => [fleetId, playerFleetUnitStats(state, fleetId).maxHealth]),
  ) as Record<(typeof PLAYER_FLEET_IDS)[number], number>;
  const enemyPools = { ...encounter.battle.enemyHealthPool };
  const playerPools = { ...encounter.battle.playerHealthPool };
  const playerCount = (fleetId: (typeof PLAYER_FLEET_IDS)[number]) =>
    fleetCountAtHealth(
      playerPools[fleetId],
      playerUnitHealth[fleetId],
      state.run.space.playerFleets[fleetId],
    );
  const enemyCount = (fleetId: (typeof ENEMY_FLEET_IDS)[number]) =>
    fleetCountAtHealth(enemyPools[fleetId], enemyHealth, encounter.enemyFleets[fleetId]);

  const attackAnomalyModifier = encounter.anomalies.reduce((sum, anomaly) => {
    if (anomaly === "plasmaInstability") return sum + 15;
    if (anomaly === "energyDampeningField") return sum - 15;
    return sum;
  }, 0);
  const baseEnemyDamagePerPlayer = Math.max(0, 0.2 - 0.001 * encounter.defenseRating) * 60;
  for (const fleetId of PLAYER_FLEET_IDS) {
    const count = playerCount(fleetId);
    if (count === 0) continue;
    const targetId = selectLowestHealthTarget(
      PLAYER_BATTLE_TARGETS[fleetId],
      enemyPools,
      Object.fromEntries(ENEMY_FLEET_IDS.map((id) => [id, enemyHealth])) as Record<
        (typeof ENEMY_FLEET_IDS)[number],
        number
      >,
      enemyCount,
    );
    if (targetId === null) continue;
    const stats = playerFleetUnitStats(state, fleetId);
    const bonusApplies =
      targetId === stats.bonusAgainstType &&
      !encounter.lifeformTraits.includes(stats.bonusRemovedByTrait);
    const bonus = bonusApplies ? 1 + stats.bonusPercentage / 100 : 1;
    const damage = count * baseEnemyDamagePerPlayer * (1 + attackAnomalyModifier / 100) * bonus;
    enemyPools[targetId] = Math.max(0, enemyPools[targetId] - damage);
  }

  let damageDealtToPlayers = 0;
  const playerTargetHealth = Object.fromEntries(
    PLAYER_FLEET_IDS.map((fleetId) => [fleetId, playerUnitHealth[fleetId]]),
  ) as Record<(typeof PLAYER_FLEET_IDS)[number], number>;
  for (const fleetId of ENEMY_FLEET_IDS) {
    const count = enemyCount(fleetId);
    if (count === 0) continue;
    const targetId = selectLowestHealthTarget(
      ENEMY_BATTLE_TARGETS[fleetId],
      playerPools,
      playerTargetHealth,
      playerCount,
    );
    if (targetId === null) continue;
    const damage = Math.min(playerPools[targetId], count * 0.1 * 60);
    playerPools[targetId] = Math.max(0, playerPools[targetId] - damage);
    damageDealtToPlayers += damage;
  }
  if (encounter.lifeformTraits.includes("powerSiphon") && damageDealtToPlayers > 0) {
    let healing = damageDealtToPlayers * 0.25;
    for (const fleetId of ENEMY_FLEET_IDS) {
      if (healing <= 0) break;
      const capacity = Math.max(
        0,
        encounter.enemyFleets[fleetId] * enemyHealth - enemyPools[fleetId],
      );
      const gained = Math.min(healing, capacity);
      enemyPools[fleetId] += gained;
      healing -= gained;
    }
  }

  const nextFleetCounts = { ...state.run.space.playerFleets };
  const nextCombatTotals = { ...state.run.space.playerFleetCombatTotals };
  for (const fleetId of PLAYER_FLEET_IDS) {
    const oldCount = state.run.space.playerFleets[fleetId];
    const newCount = fleetCountAtHealth(playerPools[fleetId], playerUnitHealth[fleetId], oldCount);
    if (newCount < oldCount) {
      const totals = state.run.space.playerFleetCombatTotals[fleetId];
      const ratio = oldCount === 0 ? 0 : newCount / oldCount;
      nextFleetCounts[fleetId] = newCount;
      nextCombatTotals[fleetId] = {
        attackPower: totals.attackPower * ratio,
        defensePower: totals.defensePower * ratio,
      };
    }
  }

  const nextEnemyFleets = Object.fromEntries(
    ENEMY_FLEET_IDS.map((fleetId) => [
      fleetId,
      fleetCountAtHealth(enemyPools[fleetId], enemyHealth, encounter.enemyFleets[fleetId]),
    ]),
  ) as typeof encounter.enemyFleets;
  const playersRemain = PLAYER_FLEET_IDS.some((fleetId) => nextFleetCounts[fleetId] > 0);
  const enemiesRemain = ENEMY_FLEET_IDS.some((fleetId) => nextEnemyFleets[fleetId] > 0);
  const result: "victory" | "defeat" | null = !playersRemain
    ? "defeat"
    : !enemiesRemain
      ? "victory"
      : null;
  const battle = {
    phase: result ?? "inProgress",
    round: encounter.battle.round + 1,
    playerHealthPool: playerPools,
    enemyHealthPool: enemyPools,
  } as const;
  const nextEncounter = {
    ...encounter,
    enemyFleets: nextEnemyFleets,
    warReady: result === "defeat",
    warMode: result === null,
    battle,
  };
  const encounters = [...state.run.space.systemEncounters];
  encounters[encounterIndex] = nextEncounter;
  const timers =
    result === null
      ? state.run.timers
      : Object.fromEntries(
          Object.entries(state.run.timers).filter(([id]) => id !== STARSHIP_BATTLE_TIMER_ID),
        );
  const nextState: GameState = {
    ...state,
    run: {
      ...state.run,
      timers,
      space: {
        ...state.run.space,
        playerFleets: nextFleetCounts,
        playerFleetCombatTotals: nextCombatTotals,
        systemEncounters: encounters,
      },
    },
  };
  let battleState = nextState;
  if (
    result === "victory" &&
    state.permanent.philosophyId === "expansionist" &&
    state.run.philosophyAbilityActive
  ) {
    const expansion = rapidExpansionSystems(state, systemId);
    battleState = {
      ...nextState,
      run: {
        ...nextState.run,
        random: expansion.random,
        expansionistExtraSystemIds: [
          ...nextState.run.expansionistExtraSystemIds,
          ...expansion.systemIds,
        ].slice(0, 3),
      },
    };
  }
  return {
    state: battleState,
    events: [
      ...(result === null
        ? [{ type: "space.battle.round", systemId, round: battle.round } as const]
        : [
            {
              type: "space.battle.finished",
              systemId,
              result,
              scannerBuilt:
                state.run.space.starshipModules.stellarScanner.builtParts >=
                STARSHIP_MODULES.stellarScanner.parts,
            } as const,
          ]),
    ],
  };
}

export function applySpaceCommand(state: GameState, command: SpaceCommand): SpaceTransition {
  if (command.type === "space.asteroid.select") {
    const asteroids = state.run.space.asteroids.map((asteroid) =>
      asteroid.id === command.asteroidId ? { ...asteroid, interacted: true } : asteroid,
    );
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: { ...state.run.space, asteroids, selectedAsteroidId: command.asteroidId },
        },
      },
      events: [{ type: "space.asteroid.selected", asteroidId: command.asteroidId }],
    };
  }
  if (command.type === "space.telescope.build") {
    const run = payCost(
      state,
      philosophyDiscountedSpaceCost(state, TELESCOPE_COST, "efficientAssembly", 0.01, true),
    );
    return {
      state: {
        ...state,
        run: { ...run, space: { ...run.space, telescopeBuilt: true } },
      },
      events: [{ type: "space.telescope.built" }],
    };
  }
  if (command.type === "space.launch-pad.build") {
    const run = payCost(
      state,
      philosophyDiscountedSpaceCost(state, LAUNCH_PAD_COST, "efficientAssembly", 0.01, true),
    );
    return {
      state: { ...state, run: { ...run, space: { ...run.space, launchPadBuilt: true } } },
      events: [{ type: "space.launch-pad.built" }],
    };
  }
  if (command.type === "space.starship.module.build") {
    const module = state.run.space.starshipModules[command.moduleId];
    const run = payCost(
      state,
      starshipModulePartCost(
        command.moduleId,
        module.builtParts,
        permanentPerkPurchaseCount(state.permanent.acquiredPerks, "spaceElevator") +
          philosophyRepeatableRank(state, "spaceElevator"),
      ),
    );
    const builtParts = module.builtParts + 1;
    return {
      state: {
        ...state,
        run: {
          ...run,
          space: {
            ...run.space,
            starshipModules: {
              ...run.space.starshipModules,
              [command.moduleId]: { builtParts },
            },
          },
        },
      },
      events: [
        { type: "space.starship.module.part.built", moduleId: command.moduleId, builtParts },
      ],
    };
  }
  if (command.type === "space.starship.destination.select")
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            starship: { ...state.run.space.starship, destinationSystemId: command.systemId },
          },
        },
      },
      events: [{ type: "space.starship.destination.selected", systemId: command.systemId }],
    };
  if (command.type === "space.starship.launch") {
    const systemId = state.run.space.starship.destinationSystemId!;
    const plan = starshipTravelPlan(state, systemId)!;
    const timerId = createTimerId("travel", "starship-journey");
    const timer = createTimer({ id: timerId, domain: "travel", durationMs: plan.durationMs });
    const run = payCost(state, { cash: 0, antimatter: plan.antimatter, materials: [] });
    return {
      state: {
        ...state,
        run: {
          ...run,
          timers: { ...state.run.timers, [timerId]: timer },
          space: {
            ...run.space,
            starship: {
              ...run.space.starship,
              phase: "travelling",
              timerId,
              durationMs: plan.durationMs,
              antimatterSpent: plan.antimatter,
              travelDistanceLy: plan.distanceLy,
            },
          },
        },
        statistics: {
          ...state.statistics,
          lifetimeStarshipsLaunched: addLifetimeCount(
            state.statistics.lifetimeStarshipsLaunched,
            1,
          ),
        },
      },
      events: [
        {
          type: "space.starship.launched",
          systemId,
          durationMs: plan.durationMs,
          antimatterSpent: plan.antimatter,
        },
      ],
    };
  }
  if (command.type === "space.starship.travel.warp") {
    const starship = state.run.space.starship;
    const timer = state.run.timers[starship.timerId!]!;
    const durationMs = timer.elapsedMs + STARSHIP_WARP_REMAINING_MS;
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          timers: {
            ...state.run.timers,
            [timer.id]: { ...timer, durationMs },
          },
        },
      },
      events: [
        {
          type: "space.starship.travel.shortened",
          systemId: starship.destinationSystemId!,
          remainingMs: STARSHIP_WARP_REMAINING_MS,
        },
      ],
    };
  }
  if (command.type === "space.starship.system.scan") {
    const systemId = state.run.space.starship.destinationSystemId!;
    const destination = createStarCatalogue(GALAXY_SEED_DEFAULT).find(
      (star) => star.id === systemId,
    )!;
    const isFactorySystem = state.permanent.megastructures.ancientManuscripts.some(
      (record) => record.factorySystemId === systemId,
    );
    const generatedEncounter = generateStarSystemEncounter(destination, isFactorySystem);
    const impressionBonus = philosophyRepeatableRank(state, "stellarWhispers");
    const initialImpression = Math.min(100, generatedEncounter.initialImpression + impressionBonus);
    const encounter = {
      ...generatedEncounter,
      initialImpression,
      currentImpression: initialImpression,
    };
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            systemEncounters: [...state.run.space.systemEncounters, encounter],
          },
        },
      },
      events: [{ type: "space.starship.system.scanned", systemId }],
    };
  }
  if (command.type === "space.envoy.build") {
    const run = payCost(state, FLEET_ENVOY_COST);
    return {
      state: {
        ...state,
        run: { ...run, space: { ...run.space, fleetEnvoyBuilt: true } },
      },
      events: [{ type: "space.envoy.built" }],
    };
  }
  if (command.type === "space.fleet.build") {
    const cost = playerFleetBuildCost(state, command.fleetId);
    const stats = playerFleetUnitStats(state, command.fleetId);
    const run = payCost(state, cost);
    const quantity = run.space.playerFleets[command.fleetId] + 1;
    const previousTotals = run.space.playerFleetCombatTotals[command.fleetId];
    const destinationId = run.space.starship.destinationSystemId;
    const encounterIndex = run.space.systemEncounters.findIndex(
      (entry) => entry.systemId === destinationId && entry.battle.phase === "defeat",
    );
    const systemEncounters = [...run.space.systemEncounters];
    if (encounterIndex >= 0) {
      const encounter = systemEncounters[encounterIndex]!;
      systemEncounters[encounterIndex] = {
        ...encounter,
        battle: {
          ...encounter.battle,
          playerHealthPool: {
            ...encounter.battle.playerHealthPool,
            [command.fleetId]: encounter.battle.playerHealthPool[command.fleetId] + stats.maxHealth,
          },
        },
      };
    }
    return {
      state: {
        ...state,
        run: {
          ...run,
          space: {
            ...run.space,
            playerFleets: { ...run.space.playerFleets, [command.fleetId]: quantity },
            playerFleetCombatTotals: {
              ...run.space.playerFleetCombatTotals,
              [command.fleetId]: {
                attackPower: previousTotals.attackPower + stats.attackPower,
                defensePower: previousTotals.defensePower + stats.defensePower,
              },
            },
            systemEncounters,
          },
        },
      },
      events: [{ type: "space.fleet.built", fleetId: command.fleetId, quantity }],
    };
  }
  if (command.type === "space.diplomacy.enter-war") {
    const systemId = state.run.space.starship.destinationSystemId!;
    const encounterIndex = state.run.space.systemEncounters.findIndex(
      (entry) => entry.systemId === systemId,
    );
    const systemEncounters = [...state.run.space.systemEncounters];
    systemEncounters[encounterIndex] = {
      ...systemEncounters[encounterIndex]!,
      warReady: false,
      warMode: true,
    };
    return {
      state: { ...state, run: { ...state.run, space: { ...state.run.space, systemEncounters } } },
      events: [{ type: "space.diplomacy.war-entered", systemId }],
    };
  }
  if (command.type === "space.battle.engage") {
    const systemId = state.run.space.starship.destinationSystemId!;
    const encounterIndex = state.run.space.systemEncounters.findIndex(
      (entry) => entry.systemId === systemId,
    );
    const encounter = state.run.space.systemEncounters[encounterIndex]!;
    const resuming = encounter.battle.phase === "defeat";
    const battle = {
      phase: "inProgress" as const,
      round: encounter.battle.round,
      playerHealthPool: resuming
        ? encounter.battle.playerHealthPool
        : playerHealthPoolsForCurrentFleets(state),
      enemyHealthPool: resuming
        ? encounter.battle.enemyHealthPool
        : enemyHealthPoolsForEncounter(encounter),
    };
    const systemEncounters = [...state.run.space.systemEncounters];
    systemEncounters[encounterIndex] = { ...encounter, battle };
    const timer = createTimer({
      id: STARSHIP_BATTLE_TIMER_ID,
      domain: "battle",
      durationMs: 250,
      repeat: true,
    });
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          timers: { ...state.run.timers, [timer.id]: timer },
          space: { ...state.run.space, systemEncounters },
        },
      },
      events: [{ type: "space.battle.started", systemId }],
    };
  }
  if (command.type === "space.system.settle") {
    const systemId = state.run.space.starship.destinationSystemId!;
    const encounterIndex = state.run.space.systemEncounters.findIndex(
      (entry) => entry.systemId === systemId,
    );
    const encounter = state.run.space.systemEncounters[encounterIndex]!;
    const factorySystem = state.permanent.megastructures.ancientManuscripts.some(
      (record) => record.factorySystemId === systemId,
    );
    const systemType = starTypeForSystem(systemId);
    const availableOTypePlants = O_TYPE_POWER_PLANT_IDS.filter(
      (plantId) => state.permanent.oTypePowerPlantAssignments[plantId] === null,
    );
    const oTypePlantId: OTypePowerPlantId | undefined =
      systemType === "O" && availableOTypePlants.length > 0
        ? availableOTypePlants[
            Math.floor(
              createSystemRandom(`${systemId}:o-type-power-plant`)() * availableOTypePlants.length,
            )
          ]
        : undefined;
    const accessMultiplier =
      encounter.battle.phase === "victory" || encounter.attitude === "surrendered" ? 2 : 1;
    const specialSystemMultiplier = factorySystem || systemType === "O" ? 2 : 1;
    const baseAscendencyPoints = Math.floor(
      (state.run.space.systemProfiles.find((profile) => profile.systemId === systemId)
        ?.ascendencyPoints ?? 1) *
        accessMultiplier *
        specialSystemMultiplier,
    );
    const philosophyAscendencyBonus =
      state.permanent.philosophyId === "voidborn" && state.permanent.rebirthCount > 0
        ? permanentPerkPurchaseCount(state.permanent.acquiredPerks, "ascendencyPhilosophy") +
          philosophyRepeatableRank(state, "ascendencyPhilosophy")
        : 0;
    const ascendencyPoints = state.run.space.ascendencyAwardedThisRun
      ? 0
      : baseAscendencyPoints + philosophyAscendencyBonus;
    const settledSystemIds = [...state.permanent.settledSystemIds, systemId];
    const previousManuscripts = state.permanent.megastructures.ancientManuscripts;
    const reportedManuscripts = reportAncientManuscriptsAtSystem(previousManuscripts, systemId);
    const newlyReportedManuscripts = reportedManuscripts.filter(
      (record) =>
        record.manuscriptSystemId === systemId &&
        !previousManuscripts.some(
          (previous) => previous.manuscriptSystemId === systemId && previous.reported,
        ),
    );
    const manuscriptRewardClaimed =
      state.permanent.megastructures.manuscriptRewardClaimed || newlyReportedManuscripts.length > 0;
    const conquestRewardClaimed =
      state.permanent.megastructures.conquestRewardClaimed || factorySystem;
    const miaplacidusStoryPending =
      state.permanent.megastructures.miaplacidusStoryPending ||
      (createStarCatalogue(GALAXY_SEED_DEFAULT).find((star) => star.id === systemId)?.name ===
        HOME_SYSTEM_NAME &&
        encounter.battle.phase === "victory" &&
        !state.permanent.megastructures.miaplacidusStoryShown);
    const goods = { ...state.run.goods };
    if (
      newlyReportedManuscripts.length > 0 &&
      !state.permanent.megastructures.manuscriptRewardClaimed
    ) {
      for (const compoundId of COMPOUND_IDS) {
        const good = goods[compoundId];
        goods[compoundId] = {
          ...good,
          quantity: Math.min(good.storageCapacity, Math.floor(good.quantity * 2)),
        };
      }
    }
    const systemEncounters = [...state.run.space.systemEncounters];
    systemEncounters[encounterIndex] = {
      ...encounter,
      warReady: false,
      warMode: false,
    };
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          cash:
            state.run.cash +
            (factorySystem && !state.permanent.megastructures.conquestRewardClaimed
              ? 1_000_000
              : 0),
          goods,
          space: {
            ...state.run.space,
            ascendencyAwardedThisRun: true,
            systemEncounters,
          },
        },
        permanent: {
          ...state.permanent,
          ascendencyPoints: state.permanent.ascendencyPoints + ascendencyPoints,
          settledSystemIds,
          megastructures: {
            ...state.permanent.megastructures,
            ancientManuscripts: reportedManuscripts,
            manuscriptRewardClaimed,
            conquestRewardClaimed,
            miaplacidusStoryPending,
          },
          oTypePowerPlantAssignments: oTypePlantId
            ? { ...state.permanent.oTypePowerPlantAssignments, [oTypePlantId]: systemId }
            : state.permanent.oTypePowerPlantAssignments,
        },
        statistics: {
          ...state.statistics,
          lifetimeAscendencyPointsGained: addLifetimeCount(
            state.statistics.lifetimeAscendencyPointsGained,
            ascendencyPoints,
          ),
        },
      },
      events: [
        {
          type: "space.system.settled",
          systemId,
          ascendencyPoints,
          ...(oTypePlantId ? { oTypePlantId } : {}),
        },
        ...newlyReportedManuscripts.map((record) => ({
          type: "space.manuscript.reported" as const,
          manuscriptSystemId: record.manuscriptSystemId,
          factorySystemId: record.factorySystemId,
          megastructureId: record.megastructureId,
        })),
        ...(miaplacidusStoryPending && !state.permanent.megastructures.miaplacidusStoryPending
          ? ([{ type: "space.miaplacidus.story-ready" as const }] as const)
          : []),
      ],
    };
  }
  if (command.type === "space.diplomacy.choose") {
    const systemId = state.run.space.starship.destinationSystemId!;
    const encounterIndex = state.run.space.systemEncounters.findIndex(
      (entry) => entry.systemId === systemId,
    );
    const encounter = state.run.space.systemEncounters[encounterIndex]!;
    let randomState = state.run.random;
    const resolution = resolveDiplomacyChoice(
      encounter,
      command.choice,
      () => {
        const next = nextRandom(randomState);
        randomState = next.state;
        return next.value;
      },
      {
        playerAttackPower: totalPlayerFleetPower(state.run.space.playerFleetCombatTotals)
          .attackPower,
        supremacistAbilityActive: supremacistFleetAbilityActive(state),
      },
    );
    const systemEncounters = [...state.run.space.systemEncounters];
    systemEncounters[encounterIndex] = resolution.encounter;
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          random: randomState,
          space: { ...state.run.space, systemEncounters },
        },
      },
      events: [
        {
          type: "space.diplomacy.resolved",
          systemId,
          choice: command.choice,
          outcome: resolution.outcome,
        },
      ],
    };
  }
  if (command.type === "space.rocket.part.build") {
    const rocket = state.run.space.rockets[command.rocketId];
    const run = payCost(
      state,
      rocketPartCost(
        rocket.builtParts,
        permanentPerkPurchaseCount(state.permanent.acquiredPerks, "launchPadMassProduction") +
          philosophyRepeatableRank(state, "launchPadMassProduction"),
      ),
    );
    const builtParts = rocket.builtParts + 1;
    const completedRocket = builtParts === ROCKET_PART_REQUIREMENTS[command.rocketId];
    return {
      state: {
        ...state,
        run: {
          ...run,
          space: {
            ...run.space,
            rockets: {
              ...run.space.rockets,
              [command.rocketId]: {
                ...rocket,
                builtParts,
                phase: completedRocket ? "ready" : "assembly",
              },
            },
          },
        },
        statistics: completedRocket
          ? {
              ...state.statistics,
              lifetimeRocketsBuilt: addLifetimeCount(state.statistics.lifetimeRocketsBuilt, 1),
            }
          : state.statistics,
      },
      events: [{ type: "space.rocket.part.built", rocketId: command.rocketId, builtParts }],
    };
  }
  if (command.type === "space.rocket.rename") {
    const rocket = state.run.space.rockets[command.rocketId];
    const name = command.name.trim();
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            rockets: { ...state.run.space.rockets, [command.rocketId]: { ...rocket, name } },
          },
        },
      },
      events: [{ type: "space.rocket.renamed", rocketId: command.rocketId, name }],
    };
  }
  if (command.type === "space.rocket.pump.purchase") {
    const run = payCost(state, {
      cash: ROCKET_FUEL_PUMP_BASE_COST[command.rocketId],
      materials: [],
    });
    const rocket = state.run.space.rockets[command.rocketId];
    return {
      state: {
        ...state,
        run: {
          ...run,
          space: {
            ...run.space,
            rockets: {
              ...state.run.space.rockets,
              [command.rocketId]: { ...rocket, fuelPumpPurchased: true, fuelPumpEnabled: true },
            },
          },
        },
      },
      events: [{ type: "space.rocket.pump.purchased", rocketId: command.rocketId }],
    };
  }
  if (command.type === "space.rocket.launch") {
    const rocket = state.run.space.rockets[command.rocketId];
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            rockets: {
              ...state.run.space.rockets,
              [command.rocketId]: { ...rocket, phase: "orbit", fuelPumpEnabled: false },
            },
          },
        },
        statistics: {
          ...state.statistics,
          lifetimeRocketsLaunched: addLifetimeCount(state.statistics.lifetimeRocketsLaunched, 1),
        },
      },
      events: [{ type: "space.rocket.launched", rocketId: command.rocketId }],
    };
  }
  if (command.type === "space.rocket.travel")
    return startRocketTravel(state, command.rocketId, command.asteroidId, "outbound");
  if (command.type === "space.antimatter-boost.set-active")
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: { ...state.run.space, antimatterBoostActive: command.active },
        },
      },
      events: [{ type: "space.antimatter-boost.changed", active: command.active }],
    };
  if (command.type === "space.weather.set-condition")
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            currentSystemWeather: command.condition,
            weatherSystemId: state.run.space.currentSystemId,
            severeWeatherPeriodCount: 0,
            currentPrecipitationRate:
              command.condition === "rain" || command.condition === "heavyRain" ? 1 : 0,
          },
        },
      },
      events: [{ type: "space.weather.changed", condition: command.condition }],
    };
  if (command.type === "space.rocket.pump.set-enabled") {
    const rocket = state.run.space.rockets[command.rocketId];
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            rockets: {
              ...state.run.space.rockets,
              [command.rocketId]: { ...rocket, fuelPumpEnabled: command.enabled },
            },
          },
        },
      },
      events: [
        { type: "space.rocket.pump.changed", rocketId: command.rocketId, enabled: command.enabled },
      ],
    };
  }
  if (command.type === "space.telescope.scan.start") return beginSurvey(state, "asteroids");
  if (command.type === "space.telescope.study.start") return beginSurvey(state, "stars");
  if (command.type === "space.telescope.pillage.start") return beginSurvey(state, "pillageVoid");
  if (command.type === "space.telescope.auto.set-enabled") {
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: { ...state.run.space, autoTelescopeEnabled: command.enabled },
        },
      },
      events: [{ type: "space.auto-telescope.changed", enabled: command.enabled }],
    };
  }
  if (command.type === "space.telescope.auto.set-mode") {
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: { ...state.run.space, autoTelescopeMode: command.mode },
        },
      },
      events: [],
    };
  }
  return { state, events: [] };
}

export function completeSpaceJourneys(
  state: GameState,
  timerEvents: readonly EngineEvent[],
): SpaceTransition {
  const completedIds = new Set(
    timerEvents
      .filter((event) => event.type === "timer.completed")
      .map((event) => String(event.timerId)),
  );
  let nextState = state;
  const events: (SpaceEvent | TimerEvent)[] = [];
  const starship = nextState.run.space.starship;
  if (
    starship.phase === "travelling" &&
    starship.timerId !== null &&
    completedIds.has(starship.timerId) &&
    starship.destinationSystemId !== null
  ) {
    const routeDistanceLy =
      starship.travelDistanceLy ??
      starshipTravelPlan(nextState, starship.destinationSystemId)?.distanceLy ??
      0;
    const runDistance = Number(
      (nextState.run.space.starshipDistanceTravelledThisRun + routeDistanceLy).toFixed(2),
    );
    const lifetimeDistance = Number(
      (nextState.statistics.lifetimeStarshipDistanceTravelled + routeDistanceLy).toFixed(2),
    );
    nextState = {
      ...nextState,
      run: {
        ...nextState.run,
        space: {
          ...nextState.run.space,
          starshipDistanceTravelledThisRun: runDistance,
          starship: {
            ...starship,
            phase: "orbiting",
            timerId: null,
            travelDistanceLy: null,
          },
        },
      },
      statistics: {
        ...nextState.statistics,
        lifetimeStarshipDistanceTravelled: lifetimeDistance,
      },
    };
    events.push({ type: "space.starship.arrived", systemId: starship.destinationSystemId });
  }
  for (const rocketId of ROCKET_IDS) {
    const rocket = nextState.run.space.rockets[rocketId];
    if (!rocket.timerId || !completedIds.has(rocket.timerId)) continue;
    const asteroidId = rocket.targetAsteroidId;
    if (!asteroidId) continue;
    if (rocket.phase === "outbound") {
      nextState = {
        ...nextState,
        run: {
          ...nextState.run,
          space: {
            ...nextState.run.space,
            antimatterUnlocked: true,
            asteroidsMinedThisRun: addLifetimeCount(nextState.run.space.asteroidsMinedThisRun, 1),
            rockets: {
              ...nextState.run.space.rockets,
              [rocketId]: { ...rocket, phase: "mining", timerId: null },
            },
          },
        },
        statistics: {
          ...nextState.statistics,
          lifetimeAsteroidsMined: addLifetimeCount(nextState.statistics.lifetimeAsteroidsMined, 1),
        },
      };
      events.push({ type: "space.rocket.arrived", rocketId, asteroidId });
      continue;
    }
    if (rocket.phase === "returning") {
      const asteroids = nextState.run.space.asteroids.map((asteroid) =>
        asteroid.id === asteroidId && asteroid.reservedBy === rocketId
          ? { ...asteroid, reservedBy: null }
          : asteroid,
      );
      nextState = {
        ...nextState,
        run: {
          ...nextState.run,
          space: {
            ...nextState.run.space,
            asteroids,
            rockets: {
              ...nextState.run.space.rockets,
              [rocketId]: {
                ...rocket,
                fuelQuantity: 0,
                fuelPumpEnabled: false,
                phase: "ready",
                targetAsteroidId: null,
                journeyCount: rocket.journeyCount + 1,
                timerId: null,
              },
            },
          },
        },
      };
      events.push({ type: "space.rocket.returned", rocketId, asteroidId });
    }
  }
  return { state: nextState, events };
}

export function completeSpaceWeatherCycle(
  state: GameState,
  timerEvents: readonly EngineEvent[],
): SpaceTransition {
  if (
    !timerEvents.some(
      (event) => event.type === "timer.completed" && event.timerId === STAR_WEATHER_TIMER_ID,
    )
  ) {
    return { state, events: [] };
  }
  const nextState = advanceStarWeatherCycle(state);
  const condition = currentWeatherForSystem(nextState.run.space);
  return {
    state: nextState,
    events: [{ type: "space.weather.changed", condition }],
  };
}

/** Resolve completed short battle ticks against saved class-level health pools. */
export function completeSpaceBattles(
  state: GameState,
  timerEvents: readonly EngineEvent[],
): SpaceTransition {
  const completions = timerEvents.reduce(
    (sum, event) =>
      event.type === "timer.completed" && event.timerId === STARSHIP_BATTLE_TIMER_ID
        ? sum + event.completions
        : sum,
    0,
  );
  if (completions === 0) return { state, events: [] };
  let nextState = state;
  const events: (SpaceEvent | TimerEvent)[] = [];
  const systemId = nextState.run.space.starship.destinationSystemId;
  if (systemId === null) return { state, events };
  for (let index = 0; index < Math.min(completions, 100); index += 1) {
    const encounter = nextState.run.space.systemEncounters.find(
      (entry) => entry.systemId === systemId,
    );
    if (!encounter || encounter.battle.phase !== "inProgress") break;
    const transition = resolveBattleRound(nextState, systemId);
    nextState = transition.state;
    events.push(...transition.events);
  }
  const battle = nextState.run.space.systemEncounters.find((entry) => entry.systemId === systemId);
  const timer = nextState.run.timers[STARSHIP_BATTLE_TIMER_ID];
  if (battle?.battle.phase === "inProgress" && timer?.status === "complete") {
    nextState = {
      ...nextState,
      run: {
        ...nextState.run,
        timers: {
          ...nextState.run.timers,
          [STARSHIP_BATTLE_TIMER_ID]: { ...timer, status: "running", elapsedMs: 0 },
        },
      },
    };
  }
  return { state: nextState, events };
}

export function antimatterMiningRatePerSecond(state: GameState): number {
  const miningUpgradeLevel = permanentPerkPurchaseCount(
    state.permanent.acquiredPerks,
    "enhancedMining",
  );
  const boostMultiplier = state.run.space.antimatterBoostActive ? ANTIMATTER_BOOST_MULTIPLIER : 1;
  const rocketRate = ROCKET_IDS.reduce((total, rocketId) => {
    const breakdown = state.run.randomEvents.activeEffects.find(
      (effect) => effect.id === "minerBrokeDown",
    );
    if (breakdown && (breakdown.targetId === null || breakdown.targetId === rocketId)) return total;
    const rocket = state.run.space.rockets[rocketId];
    if (rocket.phase !== "mining" || !rocket.targetAsteroidId) return total;
    const asteroid = state.run.space.asteroids.find(
      (entry) => entry.id === rocket.targetAsteroidId,
    );
    if (!asteroid || asteroid.depleted || asteroid.remainingAntimatter <= 0) return total;
    return (
      total +
      asteroidExtractionRatePerSecond(asteroid.extractionEase) *
        antimatterStarTypeMultiplier(starTypeForSystem(asteroid.systemId)) *
        (1 + 0.25 * miningUpgradeLevel) *
        boostMultiplier
    );
  }, 0);
  return rocketRate + megastructureAntimatterRatePerSecond(state);
}

export function rocketFuelRatePerSecond(state: GameState): number {
  const optimizationCount = permanentPerkPurchaseCount(
    state.permanent.acquiredPerks,
    "rocketFuelOptimization",
  );
  return ROCKET_FUEL_PUMP_RATE_PER_SECOND * (1 + optimizationCount);
}

export function advanceSpaceMining(
  state: GameState,
  elapsedByRocket: Partial<Record<RocketId, number>>,
  elapsedMs: number,
): SpaceTransition {
  let nextState = state;
  const events: (SpaceEvent | TimerEvent)[] = [];
  for (const rocketId of ROCKET_IDS) {
    const breakdown = nextState.run.randomEvents.activeEffects.find(
      (effect) => effect.id === "minerBrokeDown",
    );
    if (breakdown && (breakdown.targetId === null || breakdown.targetId === rocketId)) continue;
    const rocketElapsedMs = elapsedByRocket[rocketId] ?? 0;
    if (rocketElapsedMs <= 0) continue;
    const rocket = nextState.run.space.rockets[rocketId];
    if (rocket.phase !== "mining" || !rocket.targetAsteroidId) continue;
    const asteroidIndex = nextState.run.space.asteroids.findIndex(
      (entry) => entry.id === rocket.targetAsteroidId,
    );
    if (asteroidIndex < 0) continue;
    const asteroid = nextState.run.space.asteroids[asteroidIndex]!;
    const miningUpgradeLevel = permanentPerkPurchaseCount(
      nextState.permanent.acquiredPerks,
      "enhancedMining",
    );
    const boostMultiplier = nextState.run.space.antimatterBoostActive
      ? ANTIMATTER_BOOST_MULTIPLIER
      : 1;
    const ratePerSecond =
      asteroidExtractionRatePerSecond(asteroid.extractionEase) *
      antimatterStarTypeMultiplier(starTypeForSystem(asteroid.systemId)) *
      (1 + 0.25 * miningUpgradeLevel) *
      boostMultiplier;
    const amount = Math.min(asteroid.remainingAntimatter, ratePerSecond * (rocketElapsedMs / 1000));
    const remainingAntimatter = Math.max(0, asteroid.remainingAntimatter - amount);
    const depleted = remainingAntimatter === 0;
    const asteroids = [...nextState.run.space.asteroids];
    asteroids[asteroidIndex] = { ...asteroid, remainingAntimatter, depleted };
    nextState = {
      ...nextState,
      run: {
        ...nextState.run,
        space: {
          ...nextState.run.space,
          asteroids,
          antimatterUnlocked: nextState.run.space.antimatterUnlocked || amount > 0,
          antimatterBoostActive: depleted ? false : nextState.run.space.antimatterBoostActive,
          antimatter: nextState.run.space.antimatter + amount,
          antimatterMinedThisRun: nextState.run.space.antimatterMinedThisRun + amount,
        },
      },
      statistics: {
        ...nextState.statistics,
        lifetimeAntimatterMined: nextState.statistics.lifetimeAntimatterMined + amount,
      },
    };
    if (amount > 0)
      events.push({ type: "space.asteroid.mined", rocketId, asteroidId: asteroid.id, amount });
    if (depleted) {
      const miningElapsedMs = ratePerSecond > 0 ? (amount / ratePerSecond) * 1000 : rocketElapsedMs;
      const returnElapsedMs = Math.max(0, rocketElapsedMs - miningElapsedMs);
      const returning = startRocketTravel(nextState, rocketId, asteroid.id, "returning");
      nextState = returning.state;
      events.push(...returning.events);
      if (returnElapsedMs > 0) {
        const returnTimerId = nextState.run.space.rockets[rocketId].timerId!;
        const returnTimer = nextState.run.timers[returnTimerId]!;
        const timerStep = advanceTimers({ [returnTimerId]: returnTimer }, [
          {
            phase: "offline",
            elapsedMs: returnElapsedMs,
            warpedElapsedMs: returnElapsedMs,
            offlineElapsedMs: returnElapsedMs,
          },
        ]);
        nextState = {
          ...nextState,
          run: { ...nextState.run, timers: { ...nextState.run.timers, ...timerStep.timers } },
        };
        const returnCompletion = completeSpaceJourneys(nextState, timerStep.events);
        nextState = returnCompletion.state;
        events.push(...timerStep.events, ...returnCompletion.events);
      }
    }
  }
  const megastructureAntimatter =
    (megastructureAntimatterRatePerSecond(nextState) * elapsedMs) / 1000;
  if (megastructureAntimatter > 0) {
    nextState = {
      ...nextState,
      run: {
        ...nextState.run,
        space: {
          ...nextState.run.space,
          antimatterUnlocked: true,
          antimatter: nextState.run.space.antimatter + megastructureAntimatter,
          antimatterMinedThisRun:
            nextState.run.space.antimatterMinedThisRun + megastructureAntimatter,
        },
      },
      statistics: {
        ...nextState.statistics,
        lifetimeAntimatterMined:
          nextState.statistics.lifetimeAntimatterMined + megastructureAntimatter,
      },
    };
  }
  return { state: nextState, events };
}

export function advanceRocketFuel(
  state: GameState,
  elapsedMs: number,
  powered: boolean,
): GameState {
  if (
    elapsedMs <= 0 ||
    !powered ||
    !state.run.economy.researchedTechnologies.includes("advancedFuels")
  )
    return state;
  const fuelRatePerSecond = rocketFuelRatePerSecond(state);
  let changed = false;
  const rockets = { ...state.run.space.rockets };
  for (const rocketId of ROCKET_IDS) {
    const rocket = rockets[rocketId];
    if (!rocket.fuelPumpEnabled) continue;
    const capacity = ROCKET_FUEL_CAPACITY[rocketId];
    const fuelQuantity = Math.min(
      capacity,
      rocket.fuelQuantity + (fuelRatePerSecond * elapsedMs) / 1000,
    );
    rockets[rocketId] = {
      ...rocket,
      fuelQuantity,
      fuelPumpEnabled: fuelQuantity < capacity,
    };
    changed = true;
  }
  if (!changed) return state;
  return {
    ...state,
    run: {
      ...state.run,
      space: { ...state.run.space, rockets },
    },
  };
}

function surveyPowerDemandPerSecond(state: GameState): number {
  switch (state.run.space.activeSurvey) {
    case "asteroids":
      return 0.4;
    case "stars":
      return 0.7;
    case "pillageVoid":
      return VOID_PILLAGE_POWER_PER_SECOND;
    default:
      return 0;
  }
}

function simulationElapsedMs(steps: readonly ClockStep[]): number {
  return steps.reduce(
    (elapsed, step) =>
      elapsed +
      (step.phase === "foreground"
        ? step.warpedElapsedMs
        : step.phase === "offline"
          ? step.elapsedMs
          : 0),
    0,
  );
}

export function prepareSpaceSurveyPower(
  state: GameState,
  tickPlan: TickPlan | undefined,
  steps: readonly ClockStep[],
): GameState {
  const survey = state.run.space.activeSurvey;
  if (survey === null) return state;
  const timerId =
    survey === "asteroids"
      ? ASTEROID_SCAN_TIMER_ID
      : survey === "stars"
        ? STAR_STUDY_TIMER_ID
        : VOID_PILLAGE_TIMER_ID;
  const timer = state.run.timers[timerId];
  if (!timer || timer.status === "complete") return state;
  const power = state.run.economy.power;
  const elapsedMs = simulationElapsedMs(steps);
  const surveyDemand = surveyPowerDemandPerSecond(state);
  const planDemand = tickPlan?.power?.demandPerSecond;
  const planIncludesSurvey = !state.run.space.surveyPowerBlocked && timer.status === "running";
  const demandPerSecond =
    planDemand === undefined ? surveyDemand : planDemand + (planIncludesSurvey ? 0 : surveyDemand);
  const generationPerSecond = tickPlan?.power?.generationPerSecond ?? 0;
  const available = power.quantity + (generationPerSecond * elapsedMs) / 1000;
  const required = (demandPerSecond * elapsedMs) / 1000;
  const powered =
    power.infinitePower || (power.gridEnabled && !power.tripped && available + 1e-9 >= required);
  const status = powered ? "running" : "paused";
  if (timer.status === status && state.run.space.surveyPowerBlocked === !powered) return state;
  return {
    ...state,
    run: {
      ...state.run,
      timers: { ...state.run.timers, [timerId]: { ...timer, status } },
      space: { ...state.run.space, surveyPowerBlocked: !powered },
    },
  };
}

function addStarStudyRange(state: GameState): number {
  const deeperStudyLevel = permanentPerkPurchaseCount(
    state.permanent.acquiredPerks,
    "deeperStarStudy",
  );
  return state.run.space.starStudyRange + 2 ** deeperStudyLevel;
}

function completeVoidPillage(state: GameState): SpaceTransition {
  const result = voidPillageRewards(state.run.goods, state.run.random);
  const goods = { ...state.run.goods };
  for (const [rawGoodId, amount] of Object.entries(result.gains)) {
    if (amount === undefined || !Number.isFinite(amount) || amount <= 0) continue;
    const goodId = rawGoodId as keyof typeof goods;
    const good = goods[goodId];
    goods[goodId] = {
      ...good,
      quantity: Math.min(good.storageCapacity, good.quantity + amount),
    };
  }
  return {
    state: {
      ...state,
      run: {
        ...state.run,
        goods,
        random: result.random,
        space: {
          ...state.run.space,
          activeSurvey: null,
          surveyPowerBlocked: false,
          voidPillageCompletions: state.run.space.voidPillageCompletions + 1,
        },
      },
    },
    events: [{ type: "space.void-pillage.completed", gains: result.gains }],
  };
}

function surveyCompletion(state: GameState, survey: TelescopeSurvey): SpaceTransition {
  if (survey === "stars") {
    const discovery = rollBlackHoleDiscovery(state);
    const range = addStarStudyRange(state);
    const systemProfiles = ensureDiscoveredStarSystemProfiles(
      state.run.space.systemProfiles,
      state.run.space.currentSystemId,
      range,
    );
    const ancientManuscripts = generateAncientManuscriptAtStudyMilestone(
      state.permanent.megastructures.ancientManuscripts,
      state.run.space.currentSystemId,
      state.run.space.starStudyRange,
      range,
    );
    const latestManuscript = ancientManuscripts.at(-1);
    const destinationMustBeCleared =
      latestManuscript !== undefined &&
      latestManuscript.factorySystemId === state.run.space.starship.destinationSystemId &&
      state.run.space.starship.phase === "unlaunched";
    const starship = destinationMustBeCleared
      ? { ...state.run.space.starship, destinationSystemId: null }
      : state.run.space.starship;
    return {
      state: {
        ...discovery.state,
        permanent: {
          ...discovery.state.permanent,
          megastructures: {
            ...discovery.state.permanent.megastructures,
            ancientManuscripts,
          },
        },
        run: {
          ...discovery.state.run,
          space: {
            ...state.run.space,
            activeSurvey: null,
            surveyPowerBlocked: false,
            starStudyRange: range,
            systemProfiles,
            starship,
          },
          philosophyChoicePending:
            state.run.philosophyChoicePending || state.permanent.philosophyId === null,
        },
      },
      events: [...discovery.events, { type: "space.stars.studied", range }],
    };
  }
  if (survey === "pillageVoid") return completeVoidPillage(state);
  const safeAsteroidCount = state.run.space.asteroids.filter(
    (asteroid) => asteroid.reservedBy === null && !asteroid.depleted && !asteroid.interacted,
  ).length;
  if (safeAsteroidCount >= MAX_UNINTERACTED_ASTEROIDS) {
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          space: { ...state.run.space, activeSurvey: null, surveyPowerBlocked: false },
        },
      },
      events: [{ type: "space.asteroid.scan-missed" }],
    };
  }
  const scannerBoostLevel = permanentPerkPurchaseCount(
    state.permanent.acquiredPerks,
    "asteroidScannerBoost",
  );
  const generated = generateAsteroid(
    {
      sequence: state.run.space.nextAsteroidSequence,
      systemId: state.run.space.currentSystemId,
      commanderName: state.run.pioneerName,
      existingNames: new Set(state.run.space.asteroids.map((asteroid) => asteroid.name)),
      scannerBoostLevel,
    },
    state.run.random,
  );
  if (!generated.asteroid) {
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          random: generated.random,
          space: { ...state.run.space, activeSurvey: null, surveyPowerBlocked: false },
        },
      },
      events: [{ type: "space.asteroid.scan-missed" }],
    };
  }
  const asteroids = pruneAsteroids(
    [...state.run.space.asteroids, generated.asteroid],
    MAX_UNINTERACTED_ASTEROIDS,
  );
  return {
    state: {
      ...state,
      run: {
        ...state.run,
        random: generated.random,
        space: {
          ...state.run.space,
          activeSurvey: null,
          surveyPowerBlocked: false,
          telescopeBaseSearchDurationMs:
            state.run.space.telescopeBaseSearchDurationMs * ASTEROID_SEARCH_GROWTH,
          asteroids,
          nextAsteroidSequence: state.run.space.nextAsteroidSequence + 1,
        },
      },
      statistics: {
        ...state.statistics,
        lifetimeAsteroidsDiscovered: addLifetimeCount(
          state.statistics.lifetimeAsteroidsDiscovered,
          1,
        ),
        lifetimeLegendaryAsteroidsDiscovered: addLifetimeCount(
          state.statistics.lifetimeLegendaryAsteroidsDiscovered,
          generated.asteroid.rarity === "legendary" ? 1 : 0,
        ),
      },
    },
    events: [
      {
        type: "space.asteroid.discovered",
        asteroidId: generated.asteroid.id,
        name: generated.asteroid.name,
      },
    ],
  };
}

export function completeSpaceSurveys(
  state: GameState,
  timerEvents: readonly EngineEvent[],
): SpaceTransition {
  const events: (SpaceEvent | TimerEvent)[] = [];
  let nextState = state;
  const completedIds = new Set(
    timerEvents
      .filter((event) => event.type === "timer.completed")
      .map((event) => String(event.timerId)),
  );
  const survey = nextState.run.space.activeSurvey;
  if (
    survey !== null &&
    completedIds.has(
      survey === "asteroids"
        ? ASTEROID_SCAN_TIMER_ID
        : survey === "stars"
          ? STAR_STUDY_TIMER_ID
          : VOID_PILLAGE_TIMER_ID,
    )
  ) {
    const result = surveyCompletion(nextState, survey);
    nextState = result.state;
    events.push(...result.events);
  }
  if (
    nextState.run.space.autoTelescopeEnabled &&
    hasAutoTelescopePerk(nextState) &&
    (nextState.run.space.autoTelescopeMode !== "pillageVoid" || canPillageVoid(nextState)) &&
    nextState.run.space.activeSurvey === null &&
    canPowerTelescope(nextState)
  ) {
    const result = beginSurvey(nextState, nextState.run.space.autoTelescopeMode);
    nextState = result.state;
    events.push(...result.events);
  }
  return { state: nextState, events };
}
