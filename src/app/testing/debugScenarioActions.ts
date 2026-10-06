import {
  autobuyerUpgradeId,
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  MATERIAL_IDS,
  type LocaleId,
  type TechId,
} from "../../content/ids";
import type { RandomEventId } from "../../content/metaSignals";
import {
  FLEET_COMBAT_REPEATABLE_FACTOR,
  PLAYER_FLEETS,
  PLAYER_FLEET_IDS,
  ROCKET_IDS,
  ROCKET_PART_REQUIREMENTS,
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
  MAX_UNINTERACTED_ASTEROIDS,
  type AsteroidState,
} from "../../content/space";
import { TECHNOLOGY_CATALOG } from "../../content/technology";
import { permanentPerkPurchaseCount } from "../../content/economyRules";
import { forceNewsTicker } from "../../engine/newsTicker";
import { forceRandomEvent } from "../../engine/randomEvents";
import { ensureDiscoveredStarSystemProfiles } from "../../engine/starSystemProfiles";
import { generateAsteroid, pruneAsteroids } from "../../engine/spaceRules";
import type { GameState } from "../../engine/state";
import type { NewsCategory } from "../../content/metaSignals";

export const DEBUG_TIMEWARP_DURATIONS_MS = [1_000, 2_000, 3_000, 4_000, 5_000, 20_000] as const;
export const DEBUG_TIMEWARP_MULTIPLIERS = [2, 5, 10, 20, 50, 200] as const;

export type DebugScenarioId =
  | "set-language"
  | "timewarp"
  | "trigger-event"
  | "prepare-run-starship-launch"
  | "clear-weather"
  | "give-1b"
  | "give-100"
  | "give-1b-all-resources-compounds"
  | "give-1m-all-resources-compounds"
  | "give-1m-research"
  | "grant-all-techs"
  | "add-10-asteroids"
  | "study-star"
  | "build-launch-pad-scanner-rockets"
  | "gain-10000-antimatter"
  | "add-100-ap"
  | "unlock-all-tabs"
  | "add-fleets-envoy"
  | "build-starship"
  | "hold-enter-to-gain"
  | "add-10000-cp"
  | "reset-gp-spent"
  | "play-miaplacidus-cinematic"
  | "play-end-game-cinematic"
  | "set-news-ticker";

export type DebugNewsCategory =
  | "random"
  | "oneOff"
  | "prize"
  | "wackyEffects"
  | "feedback"
  | "manuscriptClue";
export type DebugNewsInterval = "default" | 10_000 | 20_000;

export interface DebugScenarioOptions {
  readonly locale?: LocaleId;
  readonly holdEnterEnabled?: boolean;
  readonly timewarpDurationMs?: (typeof DEBUG_TIMEWARP_DURATIONS_MS)[number];
  readonly timewarpMultiplier?: (typeof DEBUG_TIMEWARP_MULTIPLIERS)[number];
  readonly eventId?: RandomEventId;
  readonly newsCategory?: DebugNewsCategory;
  readonly newsInterval?: DebugNewsInterval;
}

const GRANTABLE_TECHNOLOGY_IDS = TECHNOLOGY_CATALOG.filter(
  (technology) => !("special" in technology && technology.special === "megastructure"),
).map((technology) => technology.id);

function withResearch(state: GameState, ids: readonly TechId[]): GameState {
  const researched = new Set([...state.run.economy.researchedTechnologies, ...ids]);
  const revealed = new Set([...state.run.economy.revealedTechnologies, ...ids]);
  return {
    ...state,
    run: {
      ...state.run,
      economy: {
        ...state.run.economy,
        researchedTechnologies: [...researched],
        revealedTechnologies: [...revealed],
      },
    },
  };
}

function withAutobuyerTier(state: GameState, tier: 1 | 4): GameState {
  const upgrades = { ...state.run.upgrades };
  for (const goodId of ECONOMIC_GOOD_IDS) upgrades[autobuyerUpgradeId(goodId, tier)] = 1;
  return { ...state, run: { ...state.run, upgrades } };
}

function grantAllTechnologies(state: GameState): GameState {
  const researched = withAutobuyerTier(withResearch(state, GRANTABLE_TECHNOLOGY_IDS), 4);
  return {
    ...researched,
    run: {
      ...researched.run,
      researchPoints: researched.run.researchPoints + 1_000_000,
      unlockedResources: [...MATERIAL_IDS],
      economy: {
        ...researched.run.economy,
        unlockedCompounds: [...COMPOUND_IDS],
      },
    },
  };
}

function grantGoods(state: GameState, quantity: number, autobuyerTier: 1 | 4): GameState {
  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((goodId) => [
      goodId,
      { ...state.run.goods[goodId], quantity, storageCapacity: quantity },
    ]),
  ) as GameState["run"]["goods"];
  const stateWithBuyers = withAutobuyerTier(state, autobuyerTier);
  return {
    ...stateWithBuyers,
    run: {
      ...stateWithBuyers.run,
      goods,
      unlockedResources: [...MATERIAL_IDS],
      economy: { ...stateWithBuyers.run.economy, unlockedCompounds: [...COMPOUND_IDS] },
    },
  };
}

function addAsteroids(state: GameState): GameState {
  let random = state.run.random;
  let sequence = state.run.space.nextAsteroidSequence;
  const existingNames = new Set(state.run.space.asteroids.map((asteroid) => asteroid.name));
  const added: AsteroidState[] = [];
  let attempts = 0;
  let legendary = 0;
  while (added.length < 10 && attempts < 1_000) {
    attempts += 1;
    const generated = generateAsteroid(
      {
        sequence,
        systemId: state.run.space.currentSystemId,
        commanderName: state.run.pioneerName,
        existingNames,
        scannerBoostLevel: permanentPerkPurchaseCount(
          state.permanent.acquiredPerks,
          "asteroidScannerBoost",
        ),
      },
      random,
    );
    random = generated.random;
    if (!generated.asteroid) continue;
    added.push(generated.asteroid);
    existingNames.add(generated.asteroid.name);
    sequence += 1;
    if (generated.asteroid.rarity === "legendary") legendary += 1;
  }
  if (added.length !== 10) return state;
  const asteroids = pruneAsteroids(
    [...state.run.space.asteroids, ...added],
    MAX_UNINTERACTED_ASTEROIDS,
  );
  return {
    ...state,
    run: {
      ...state.run,
      random,
      space: { ...state.run.space, asteroids, nextAsteroidSequence: sequence },
    },
    statistics: {
      ...state.statistics,
      lifetimeAsteroidsDiscovered: state.statistics.lifetimeAsteroidsDiscovered + 10,
      lifetimeLegendaryAsteroidsDiscovered:
        state.statistics.lifetimeLegendaryAsteroidsDiscovered + legendary,
    },
  };
}

function studyStar(state: GameState): GameState {
  const increment =
    2 ** permanentPerkPurchaseCount(state.permanent.acquiredPerks, "deeperStarStudy");
  const range = state.run.space.starStudyRange + increment * 5;
  const systemProfiles = ensureDiscoveredStarSystemProfiles(
    state.run.space.systemProfiles,
    state.run.space.currentSystemId,
    range,
  );
  const chooseDefaultPhilosophy =
    state.permanent.rebirthCount === 0 && state.permanent.philosophyId === null;
  return {
    ...state,
    run: {
      ...state.run,
      philosophyChoicePending: chooseDefaultPhilosophy ? false : state.run.philosophyChoicePending,
      space: { ...state.run.space, starStudyRange: range, systemProfiles },
    },
    permanent: chooseDefaultPhilosophy
      ? { ...state.permanent, philosophyId: "voidborn" }
      : state.permanent,
  };
}

function buildLaunchPadScannerAndRockets(state: GameState): GameState {
  const next = withResearch(state, ["rocketComposites"]);
  let rocketsBuilt = 0;
  const rockets = Object.fromEntries(
    ROCKET_IDS.map((id) => {
      const rocket = next.run.space.rockets[id];
      if (rocket.builtParts < ROCKET_PART_REQUIREMENTS[id]) rocketsBuilt += 1;
      return [id, { ...rocket, builtParts: ROCKET_PART_REQUIREMENTS[id] }];
    }),
  ) as GameState["run"]["space"]["rockets"];
  return {
    ...next,
    run: {
      ...next.run,
      space: {
        ...next.run.space,
        telescopeBuilt: true,
        launchPadBuilt: true,
        rockets,
      },
    },
    statistics: {
      ...next.statistics,
      lifetimeRocketsBuilt: next.statistics.lifetimeRocketsBuilt + rocketsBuilt,
    },
  };
}

function buildStarship(state: GameState): GameState {
  const technologyIds = STARSHIP_MODULE_IDS.map((id) => STARSHIP_MODULES[id].technology);
  const next = withResearch(state, technologyIds);
  const starshipModules = Object.fromEntries(
    STARSHIP_MODULE_IDS.map((id) => [id, { builtParts: STARSHIP_MODULES[id].parts }]),
  ) as GameState["run"]["space"]["starshipModules"];
  return {
    ...next,
    run: {
      ...next.run,
      space: { ...next.run.space, starshipModules, telescopeBuilt: true },
    },
  };
}

function addFleetsAndEnvoy(state: GameState): GameState {
  const requiredModulesBuilt = STARSHIP_MODULE_IDS.filter(
    (id) => STARSHIP_MODULES[id].requiredForTravel,
  ).every((id) => state.run.space.starshipModules[id].builtParts >= STARSHIP_MODULES[id].parts);
  if (!requiredModulesBuilt) return state;
  const multiplier =
    FLEET_COMBAT_REPEATABLE_FACTOR **
    permanentPerkPurchaseCount(state.permanent.acquiredPerks, "laserIntensityResearch");
  const playerFleets = { ...state.run.space.playerFleets };
  const playerFleetCombatTotals = { ...state.run.space.playerFleetCombatTotals };
  for (const fleetId of PLAYER_FLEET_IDS) {
    const definition = PLAYER_FLEETS[fleetId];
    const current = playerFleets[fleetId];
    const added = Math.min(30, definition.maxQuantity - current);
    playerFleets[fleetId] = current + added;
    playerFleetCombatTotals[fleetId] = {
      attackPower:
        playerFleetCombatTotals[fleetId].attackPower +
        added * definition.baseAttackStrength * multiplier,
      defensePower:
        playerFleetCombatTotals[fleetId].defensePower + added * definition.defenseStrength,
    };
  }
  return {
    ...state,
    run: {
      ...state.run,
      space: { ...state.run.space, playerFleets, playerFleetCombatTotals, fleetEnvoyBuilt: true },
    },
  };
}

function debugNewsCategory(
  category: DebugNewsCategory | undefined,
): NewsCategory | undefined | null {
  if (category === undefined || category === "random") return undefined;
  if (category === "feedback") return null;
  if (category === "wackyEffects") return "wacky";
  return category;
}

function prepareRunForStarshipLaunch(state: GameState): GameState {
  let next: GameState = {
    ...state,
    run: { ...state.run, cash: state.run.cash + 1_000_000_000 },
  };
  next = grantGoods(next, 1_000_000_000, 4);
  next = grantAllTechnologies(next);
  next = buildLaunchPadScannerAndRockets(next);
  next = addAsteroids(next);
  next = studyStar(next);
  next = {
    ...next,
    run: {
      ...next.run,
      space: {
        ...next.run.space,
        antimatter: next.run.space.antimatter + 80_000,
        antimatterUnlocked: true,
      },
    },
  };
  next = buildStarship(next);
  return addFleetsAndEnvoy(next);
}

/**
 * Applies a development scenario through typed remake state/services. Null marks
 * a rejected selection or an intentionally unsupported option.
 */
export function applyDebugScenario(
  state: GameState,
  action: DebugScenarioId,
  options: DebugScenarioOptions = {},
): GameState | null {
  switch (action) {
    case "set-language":
      return options.locale
        ? { ...state, settings: { ...state.settings, locale: options.locale } }
        : null;
    case "timewarp": {
      const duration = options.timewarpDurationMs ?? 5_000;
      const multiplier = options.timewarpMultiplier ?? 50;
      if (
        !DEBUG_TIMEWARP_DURATIONS_MS.includes(duration) ||
        !DEBUG_TIMEWARP_MULTIPLIERS.includes(multiplier)
      )
        return null;
      return { ...state, run: { ...state.run, timeWarp: { multiplier, remainingMs: duration } } };
    }
    case "trigger-event": {
      if (!options.eventId) return null;
      return forceRandomEvent(state, options.eventId)?.state ?? null;
    }
    case "prepare-run-starship-launch":
      return prepareRunForStarshipLaunch(state);
    case "clear-weather":
      return {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            currentSystemWeather: "clear",
            severeWeatherPeriodCount: 0,
            currentPrecipitationRate: 0,
          },
        },
      };
    case "give-1b":
      return { ...state, run: { ...state.run, cash: state.run.cash + 1_000_000_000 } };
    case "give-100":
      return { ...state, run: { ...state.run, cash: 100 } };
    case "give-1b-all-resources-compounds":
      return grantGoods(state, 1_000_000_000, 4);
    case "give-1m-all-resources-compounds":
      return grantGoods(state, 1_000_000, 1);
    case "give-1m-research":
      return {
        ...state,
        run: { ...state.run, researchPoints: state.run.researchPoints + 1_000_000 },
      };
    case "grant-all-techs":
      return grantAllTechnologies(state);
    case "add-10-asteroids":
      return addAsteroids(state);
    case "study-star":
      return studyStar(state);
    case "build-launch-pad-scanner-rockets":
      return buildLaunchPadScannerAndRockets(state);
    case "gain-10000-antimatter":
      return {
        ...state,
        run: {
          ...state.run,
          space: {
            ...state.run.space,
            antimatter: state.run.space.antimatter + 10_000,
            antimatterUnlocked: true,
          },
        },
      };
    case "add-100-ap":
      return {
        ...state,
        permanent: {
          ...state.permanent,
          ascendencyPoints: Math.floor(state.permanent.ascendencyPoints + 100),
        },
      };
    case "unlock-all-tabs": {
      const next = withResearch(state, [
        "basicPowerGeneration",
        "compounds",
        "stellarCartography",
        "atmosphericTelescopes",
      ]);
      return {
        ...next,
        run: { ...next.run, space: { ...next.run.space, ascendencyAwardedThisRun: true } },
        permanent: {
          ...next.permanent,
          cosmicRip: { ...next.permanent.cosmicRip, unlocked: true },
        },
      };
    }
    case "add-fleets-envoy":
      return addFleetsAndEnvoy(state);
    case "build-starship":
      return buildStarship(state);
    case "hold-enter-to-gain":
      return state;
    case "add-10000-cp":
      return {
        ...state,
        permanent: {
          ...state.permanent,
          galacticCasino: {
            ...state.permanent.galacticCasino,
            casinoPoints: state.permanent.galacticCasino.casinoPoints + 10_000,
          },
        },
      };
    case "reset-gp-spent": {
      const trackedSpend = state.statistics.lifetimeGalacticPointsSpent;
      return {
        ...state,
        permanent: { ...state.permanent, gloryPoints: state.permanent.gloryPoints + trackedSpend },
        statistics: { ...state.statistics, lifetimeGalacticPointsSpent: 0 },
      };
    }
    case "play-miaplacidus-cinematic":
    case "play-end-game-cinematic":
      return null;
    case "set-news-ticker": {
      const category = debugNewsCategory(options.newsCategory);
      if (category === null) return null;
      const forced = forceNewsTicker(state, category);
      if (!forced) return null;
      const interval = options.newsInterval ?? "default";
      return {
        ...forced.state,
        run: {
          ...forced.state.run,
          newsTicker: {
            ...forced.state.run.newsTicker,
            remainingMs:
              interval === "default" ? forced.state.run.newsTicker.remainingMs : interval,
          },
        },
      };
    }
  }
}
