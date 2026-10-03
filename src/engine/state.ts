import {
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  FIXED_UPGRADE_IDS,
  GALAXY_SEED_DEFAULT,
  LOCALE_IDS,
  MATERIAL_IDS,
  PHILOSOPHY_IDS,
  autobuyerUpgradeId,
  isSystemId,
  isEconomicGoodId,
  isEventId,
  isUpgradeId,
  type EconomicGoodId,
  type AutobuyerUpgradeId,
  type CompoundId,
  type FixedUpgradeId,
  type LocaleId,
  type MaterialId,
  type PhilosophyId,
  type SystemId,
  type TechId,
  type UpgradeId,
} from "../content/ids";
import { TECHNOLOGY_CATALOG } from "../content/technology";
import { INITIAL_GOODS } from "../content/economy";
import {
  ASTEROID_RARITIES,
  ROCKET_FUEL_CAPACITY,
  ROCKET_IDS,
  ROCKET_PART_REQUIREMENTS,
  SPACE_WEATHER_CONDITIONS,
  STARSHIP_MODULES,
  STARSHIP_MODULE_IDS,
  PLAYER_FLEETS,
  PLAYER_FLEET_IDS,
  ENEMY_FLEET_IDS,
  SPACE_BATTLE_PHASES,
  FLEET_COMBAT_REPEATABLE_FACTOR,
  createInitialPlayerFleets,
  createInitialStarSystemBattleState,
  createInitialStarshipModules,
  createInitialSpaceState,
  STAR_WEATHER_TYPES,
  STAR_ANOMALY_IDS,
  STAR_ATTITUDES,
  STAR_DIPLOMACY_MESSAGE_IDS,
  STAR_CIVILIZATION_LEVELS,
  STAR_LIFEFORM_TRAITS,
  STAR_THREAT_LEVELS,
  type RocketId,
  type SpaceState,
  type StarSystemProfile,
} from "../content/space";
import { createStarCatalogue, starTypeForSystem } from "../content/starCatalogue";
import { O_TYPE_POWER_PLANT_IDS, type OTypePowerPlantId } from "../content/starTypeRules";
import { createClockState } from "./clock";
import { createRandomState } from "./random";
import { permanentPerkPurchaseCount } from "../content/economyRules";
import { hasControlCharacter } from "./spaceRules";
import { timerPolicyFor } from "./timers";
import { TIMER_DOMAINS, type ClockState, type TimerMap } from "./runtimeTypes";
import {
  createMigratedStarWeatherTimer,
  initializeStarWeather,
  STAR_WEATHER_TIMER_ID,
} from "./weather";
import {
  createInitialStarSystemProfiles,
  ensureDiscoveredStarSystemProfiles,
} from "./starSystemProfiles";

export interface GoodState {
  readonly quantity: number;
  readonly storageCapacity: number;
  readonly saleValue: number;
}

export interface RunState {
  readonly pioneerName: string;
  readonly hydrogenAutobuyerEnabled: boolean;
  readonly cash: number;
  readonly researchPoints: number;
  readonly goods: Readonly<Record<EconomicGoodId, GoodState>>;
  readonly unlockedResources: readonly MaterialId[];
  readonly upgrades: Readonly<Partial<Record<UpgradeId, number>>>;
  readonly timers: TimerMap;
  readonly clock: ClockState;
  readonly random: ReturnType<typeof createRandomState>;
  readonly economy: EconomyState;
  readonly space: SpaceState;
  readonly philosophyAbilityActive: boolean;
}

export interface ResourceAllocationState {
  readonly enabled: boolean;
  readonly cashShare: number;
  readonly compoundShare: number;
}

export interface PowerState {
  readonly quantity: number;
  readonly capacity: number;
  readonly gridEnabled: boolean;
  readonly deficitMs: number;
  readonly tripped: boolean;
  readonly infinitePower: boolean;
  readonly environmentalMultiplier: number;
}

export interface EconomyState {
  readonly unlockedCompounds: readonly CompoundId[];
  readonly researchedTechnologies: readonly TechId[];
  readonly revealedTechnologies: readonly TechId[];
  readonly autobuyerEnabled: Readonly<Record<AutobuyerUpgradeId, boolean>>;
  readonly buildingEnabled: Readonly<Record<FixedUpgradeId, boolean>>;
  readonly resourceAllocation: Readonly<Record<MaterialId, ResourceAllocationState>>;
  readonly autoCreateEnabled: Readonly<Record<CompoundId, boolean>>;
  readonly researchAutobuyerEnabled: boolean;
  readonly power: PowerState;
}

export interface PermanentState {
  readonly rebirthCount: number;
  readonly ascendencyPoints: number;
  readonly gloryPoints: number;
  readonly acquiredPerks: readonly string[];
  readonly philosophyId: PhilosophyId | null;
  readonly settledSystemIds: readonly string[];
  readonly oTypePowerPlantAssignments: Readonly<Record<OTypePowerPlantId, SystemId | null>>;
}

export interface SettingsState {
  readonly locale: LocaleId;
  readonly themeId: string;
  readonly notation: "standard" | "scientific";
  readonly soundEnabled: boolean;
  readonly reducedMotion: boolean;
}

export interface StatisticsState {
  readonly lifetimeCashEarned: number;
  readonly lifetimeGoodsProduced: number;
  readonly lifetimeAntimatterMined: number;
  readonly acceptedCommands: number;
  readonly completedTimers: number;
}

export interface GameState {
  readonly schemaVersion: 20;
  readonly run: RunState;
  readonly permanent: PermanentState;
  readonly settings: SettingsState;
  readonly statistics: StatisticsState;
}

export type LegacyRunStateV1 = Omit<RunState, "economy" | "space" | "philosophyAbilityActive">;
export type LegacyPermanentState = Omit<PermanentState, "philosophyId">;
export interface LegacyGameStateV1 {
  readonly schemaVersion: 1;
  readonly run: LegacyRunStateV1;
  readonly permanent: LegacyPermanentState;
  readonly settings: SettingsState;
  readonly statistics: Omit<StatisticsState, "lifetimeAntimatterMined">;
}

export type LegacyPowerStateV2 = Omit<PowerState, "infinitePower" | "environmentalMultiplier">;
export type LegacyEconomyStateV2 = Omit<EconomyState, "power"> & {
  readonly power: LegacyPowerStateV2;
};
export type LegacyRunStateV2 = Omit<RunState, "economy" | "space" | "philosophyAbilityActive"> & {
  readonly economy: LegacyEconomyStateV2;
};
export interface LegacyGameStateV2 {
  readonly schemaVersion: 2;
  readonly run: LegacyRunStateV2;
  readonly permanent: LegacyPermanentState;
  readonly settings: SettingsState;
  readonly statistics: Omit<StatisticsState, "lifetimeAntimatterMined">;
}

export type LegacyRunStateV3 = Omit<RunState, "space" | "philosophyAbilityActive">;
export interface LegacyGameStateV3 {
  readonly schemaVersion: 3;
  readonly run: LegacyRunStateV3;
  readonly permanent: LegacyPermanentState;
  readonly settings: SettingsState;
  readonly statistics: Omit<StatisticsState, "lifetimeAntimatterMined">;
}

export function createInitialEconomyState(hydrogenAutobuyerEnabled = true): EconomyState {
  const autobuyerEnabled = Object.fromEntries(
    ECONOMIC_GOOD_IDS.flatMap((goodId) =>
      ([1, 2, 3, 4] as const).map((tier) => [autobuyerUpgradeId(goodId, tier), true]),
    ),
  ) as Record<AutobuyerUpgradeId, boolean>;
  autobuyerEnabled[autobuyerUpgradeId("hydrogen", 1)] = hydrogenAutobuyerEnabled;
  const buildingEnabled = Object.fromEntries(
    FIXED_UPGRADE_IDS.map((id) => [id, !id.startsWith("powerPlant")]),
  ) as Record<FixedUpgradeId, boolean>;
  const resourceAllocation = Object.fromEntries(
    MATERIAL_IDS.map((id) => [id, { enabled: false, cashShare: 0, compoundShare: 100 }]),
  ) as Record<MaterialId, ResourceAllocationState>;
  const autoCreateEnabled = Object.fromEntries(COMPOUND_IDS.map((id) => [id, false])) as Record<
    CompoundId,
    boolean
  >;
  return {
    unlockedCompounds: [],
    researchedTechnologies: [],
    revealedTechnologies: ["knowledgeSharing"],
    autobuyerEnabled,
    buildingEnabled,
    resourceAllocation,
    autoCreateEnabled,
    researchAutobuyerEnabled: false,
    power: {
      quantity: 0,
      capacity: 0,
      gridEnabled: true,
      deficitMs: 0,
      tripped: false,
      infinitePower: false,
      environmentalMultiplier: 1,
    },
  };
}

export interface InitialStateOptions {
  readonly pioneerName?: string;
  readonly seed?: number;
  readonly locale?: LocaleId;
}

export function createInitialGameState(options: InitialStateOptions = {}): GameState {
  const startingSystemId =
    createStarCatalogue(GALAXY_SEED_DEFAULT).find((star) => star.initiallySettled)?.id ??
    "system:0:0";
  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((id) => [
      id,
      {
        quantity: 0,
        storageCapacity: INITIAL_GOODS[id].storageCapacity,
        saleValue: INITIAL_GOODS[id].saleValue,
      },
    ]),
  ) as Record<EconomicGoodId, GoodState>;

  const initialState: GameState = {
    schemaVersion: 20,
    run: {
      pioneerName: options.pioneerName?.trim() || "Pioneer",
      hydrogenAutobuyerEnabled: true,
      cash: 10,
      researchPoints: 50,
      goods,
      unlockedResources: ["hydrogen"],
      upgrades: {},
      timers: {},
      clock: createClockState(),
      random: createRandomState(options.seed ?? GALAXY_SEED_DEFAULT),
      economy: createInitialEconomyState(),
      space: {
        ...createInitialSpaceState(),
        systemProfiles: createInitialStarSystemProfiles(),
      },
      philosophyAbilityActive: false,
    },
    permanent: {
      rebirthCount: 0,
      ascendencyPoints: 0,
      gloryPoints: 0,
      acquiredPerks: [],
      philosophyId: null,
      settledSystemIds: [startingSystemId],
      oTypePowerPlantAssignments: { powerPlant1: null, powerPlant2: null, powerPlant3: null },
    },
    settings: {
      locale: options.locale ?? "en",
      themeId: "midnight",
      notation: "standard",
      soundEnabled: true,
      reducedMotion: false,
    },
    statistics: {
      lifetimeCashEarned: 0,
      lifetimeGoodsProduced: 0,
      lifetimeAntimatterMined: 0,
      acceptedCommands: 0,
      completedTimers: 0,
    },
  };
  return initializeStarWeather(initialState);
}

export function isValidGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") {
    return false;
  }
  const exactKeys = (record: object, expected: readonly string[]) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) return false;
    const actual = Object.keys(record).sort();
    const keys = [...expected].sort();
    return actual.length === keys.length && actual.every((key, index) => key === keys[index]);
  };
  if (!exactKeys(value, ["schemaVersion", "run", "permanent", "settings", "statistics"]))
    return false;
  const state = value as Partial<GameState>;
  if (
    state.schemaVersion !== 20 ||
    !state.run ||
    !state.permanent ||
    !state.settings ||
    !state.statistics
  ) {
    return false;
  }
  const { run, permanent, settings, statistics } = state;
  if (
    !exactKeys(run, [
      "pioneerName",
      "hydrogenAutobuyerEnabled",
      "cash",
      "researchPoints",
      "goods",
      "unlockedResources",
      "upgrades",
      "timers",
      "clock",
      "random",
      "economy",
      "space",
      "philosophyAbilityActive",
    ]) ||
    !exactKeys(permanent, [
      "rebirthCount",
      "ascendencyPoints",
      "gloryPoints",
      "acquiredPerks",
      "philosophyId",
      "settledSystemIds",
      "oTypePowerPlantAssignments",
    ]) ||
    !exactKeys(settings, ["locale", "themeId", "notation", "soundEnabled", "reducedMotion"]) ||
    !exactKeys(statistics, [
      "lifetimeCashEarned",
      "lifetimeGoodsProduced",
      "lifetimeAntimatterMined",
      "acceptedCommands",
      "completedTimers",
    ]) ||
    !exactKeys(run.clock, [
      "wallNowMs",
      "simulationMs",
      "paused",
      "foreground",
      "hiddenElapsedMs",
      "pendingForegroundMs",
    ]) ||
    !exactKeys(run.random, ["seed", "draws"]) ||
    !exactKeys(run.economy, [
      "unlockedCompounds",
      "researchedTechnologies",
      "revealedTechnologies",
      "autobuyerEnabled",
      "buildingEnabled",
      "resourceAllocation",
      "autoCreateEnabled",
      "researchAutobuyerEnabled",
      "power",
    ]) ||
    !exactKeys(run.space, [
      "currentSystemId",
      "telescopeBuilt",
      "telescopeBaseSearchDurationMs",
      "activeSurvey",
      "surveyPowerBlocked",
      "autoTelescopeUnlocked",
      "autoTelescopeEnabled",
      "autoTelescopeMode",
      "starStudyRange",
      "launchPadBuilt",
      "asteroids",
      "selectedAsteroidId",
      "nextAsteroidSequence",
      "voidPillageCompletions",
      "antimatter",
      "antimatterUnlocked",
      "antimatterMinedThisRun",
      "antimatterBoostActive",
      "ascendencyAwardedThisRun",
      "currentSystemWeather",
      "weatherSystemId",
      "weatherCycleCount",
      "severeWeatherPeriodCount",
      "currentPrecipitationRate",
      "precipitationCollectedThisRun",
      "systemProfiles",
      "ancientManuscripts",
      "systemEncounters",
      "fleetEnvoyBuilt",
      "playerFleets",
      "playerFleetCombatTotals",
      "starshipModules",
      "starship",
      "rockets",
    ]) ||
    !exactKeys(run.economy.power, [
      "quantity",
      "capacity",
      "gridEnabled",
      "deficitMs",
      "tripped",
      "infinitePower",
      "environmentalMultiplier",
    ]) ||
    !exactKeys(run.space.rockets, ROCKET_IDS) ||
    !exactKeys(run.space.playerFleets, PLAYER_FLEET_IDS) ||
    !exactKeys(run.space.playerFleetCombatTotals, PLAYER_FLEET_IDS) ||
    !exactKeys(run.space.starshipModules, STARSHIP_MODULE_IDS) ||
    !exactKeys(run.space.starship, [
      "destinationSystemId",
      "phase",
      "timerId",
      "durationMs",
      "antimatterSpent",
    ]) ||
    !exactKeys(run.economy.autobuyerEnabled, [
      ...ECONOMIC_GOOD_IDS.flatMap((id) =>
        [1, 2, 3, 4].map((tier) => `autobuyer:${id}:tier:${tier}`),
      ),
    ]) ||
    !exactKeys(run.economy.buildingEnabled, FIXED_UPGRADE_IDS) ||
    !exactKeys(run.economy.resourceAllocation, MATERIAL_IDS) ||
    !exactKeys(run.economy.autoCreateEnabled, COMPOUND_IDS) ||
    MATERIAL_IDS.some(
      (id) =>
        !run.economy.resourceAllocation[id] ||
        !exactKeys(run.economy.resourceAllocation[id], ["enabled", "cashShare", "compoundShare"]),
    ) ||
    !exactKeys(run.goods, ECONOMIC_GOOD_IDS)
  )
    return false;
  if (
    typeof run.pioneerName !== "string" ||
    typeof run.hydrogenAutobuyerEnabled !== "boolean" ||
    !Number.isFinite(run.cash) ||
    run.cash < 0 ||
    !Number.isFinite(run.researchPoints) ||
    run.researchPoints < 0 ||
    typeof run.goods !== "object" ||
    run.goods === null ||
    !Array.isArray(run.unlockedResources) ||
    !Array.isArray(run.economy.unlockedCompounds) ||
    !Array.isArray(run.economy.researchedTechnologies) ||
    !Array.isArray(run.economy.revealedTechnologies) ||
    typeof run.economy.researchAutobuyerEnabled !== "boolean" ||
    typeof run.philosophyAbilityActive !== "boolean" ||
    typeof run.space.currentSystemId !== "string" ||
    run.space.currentSystemId.length === 0 ||
    typeof run.space.telescopeBuilt !== "boolean" ||
    !Number.isFinite(run.space.telescopeBaseSearchDurationMs) ||
    run.space.telescopeBaseSearchDurationMs < 1 ||
    (run.space.activeSurvey !== null &&
      !["asteroids", "stars", "pillageVoid"].includes(run.space.activeSurvey)) ||
    typeof run.space.surveyPowerBlocked !== "boolean" ||
    typeof run.space.autoTelescopeUnlocked !== "boolean" ||
    typeof run.space.autoTelescopeEnabled !== "boolean" ||
    !["asteroids", "stars", "pillageVoid"].includes(run.space.autoTelescopeMode) ||
    !Number.isFinite(run.space.starStudyRange) ||
    run.space.starStudyRange < 0 ||
    typeof run.space.launchPadBuilt !== "boolean" ||
    !Array.isArray(run.space.asteroids) ||
    !Array.isArray(run.space.systemProfiles) ||
    run.space.systemProfiles.length > 100 ||
    !Array.isArray(run.space.ancientManuscripts) ||
    run.space.ancientManuscripts.length > 4 ||
    !Array.isArray(run.space.systemEncounters) ||
    run.space.systemEncounters.length > 100 ||
    (run.space.selectedAsteroidId !== null && typeof run.space.selectedAsteroidId !== "string") ||
    !Number.isSafeInteger(run.space.nextAsteroidSequence) ||
    run.space.nextAsteroidSequence < 1 ||
    !Number.isSafeInteger(run.space.voidPillageCompletions) ||
    run.space.voidPillageCompletions < 0 ||
    !Number.isFinite(run.space.antimatter) ||
    run.space.antimatter < 0 ||
    typeof run.space.antimatterUnlocked !== "boolean" ||
    !Number.isFinite(run.space.antimatterMinedThisRun) ||
    run.space.antimatterMinedThisRun < 0 ||
    typeof run.space.antimatterBoostActive !== "boolean" ||
    typeof run.space.ascendencyAwardedThisRun !== "boolean" ||
    typeof run.space.weatherSystemId !== "string" ||
    run.space.weatherSystemId.trim().length === 0 ||
    !Number.isSafeInteger(run.space.weatherCycleCount) ||
    run.space.weatherCycleCount < 0 ||
    !Number.isSafeInteger(run.space.severeWeatherPeriodCount) ||
    run.space.severeWeatherPeriodCount < 0 ||
    run.space.severeWeatherPeriodCount > 3 ||
    !Number.isFinite(run.space.currentPrecipitationRate) ||
    run.space.currentPrecipitationRate < 0 ||
    run.space.currentPrecipitationRate > 4 ||
    !Number.isFinite(run.space.precipitationCollectedThisRun) ||
    run.space.precipitationCollectedThisRun < 0 ||
    typeof run.space.fleetEnvoyBuilt !== "boolean" ||
    PLAYER_FLEET_IDS.some(
      (fleetId) =>
        !Number.isSafeInteger(run.space.playerFleets[fleetId]) ||
        run.space.playerFleets[fleetId] < 0 ||
        run.space.playerFleets[fleetId] > PLAYER_FLEETS[fleetId].maxQuantity ||
        !run.space.playerFleetCombatTotals[fleetId] ||
        !exactKeys(run.space.playerFleetCombatTotals[fleetId], ["attackPower", "defensePower"]) ||
        !Number.isFinite(run.space.playerFleetCombatTotals[fleetId].attackPower) ||
        run.space.playerFleetCombatTotals[fleetId].attackPower < 0 ||
        !Number.isFinite(run.space.playerFleetCombatTotals[fleetId].defensePower) ||
        run.space.playerFleetCombatTotals[fleetId].defensePower < 0,
    ) ||
    !SPACE_WEATHER_CONDITIONS.includes(run.space.currentSystemWeather) ||
    typeof run.economy.power.gridEnabled !== "boolean" ||
    typeof run.economy.power.tripped !== "boolean" ||
    typeof run.economy.power.infinitePower !== "boolean" ||
    !Number.isFinite(run.economy.power.quantity) ||
    !Number.isFinite(run.economy.power.capacity) ||
    !Number.isFinite(run.economy.power.deficitMs) ||
    !Number.isFinite(run.economy.power.environmentalMultiplier) ||
    run.economy.power.quantity < 0 ||
    run.economy.power.capacity < 0 ||
    run.economy.power.quantity > run.economy.power.capacity ||
    run.economy.power.deficitMs < 0 ||
    run.economy.power.environmentalMultiplier < 0 ||
    typeof run.upgrades !== "object" ||
    run.upgrades === null ||
    typeof run.timers !== "object" ||
    run.timers === null ||
    !run.clock ||
    !run.random
  ) {
    return false;
  }
  const profileIds = new Set<string>();
  for (const profile of run.space.systemProfiles) {
    if (
      !profile ||
      !exactKeys(profile, [
        "systemId",
        "weatherChances",
        "precipitationGoodId",
        "ascendencyPoints",
        "ascendencyDistanceLy",
      ]) ||
      !isSystemId(profile.systemId) ||
      profileIds.has(profile.systemId) ||
      !exactKeys(profile.weatherChances, STAR_WEATHER_TYPES) ||
      STAR_WEATHER_TYPES.some(
        (weather) =>
          !Number.isSafeInteger(profile.weatherChances[weather]) ||
          profile.weatherChances[weather] < 0 ||
          profile.weatherChances[weather] > 100,
      ) ||
      STAR_WEATHER_TYPES.reduce((sum, weather) => sum + profile.weatherChances[weather], 0) !==
        100 ||
      !["titanium", "water", "glass", "diesel", "concrete", "steel"].includes(
        profile.precipitationGoodId,
      ) ||
      !Number.isSafeInteger(profile.ascendencyPoints) ||
      profile.ascendencyPoints < 1 ||
      profile.ascendencyPoints > 50 ||
      !Number.isFinite(profile.ascendencyDistanceLy) ||
      profile.ascendencyDistanceLy < 0
    ) {
      return false;
    }
    profileIds.add(profile.systemId);
  }
  const manuscriptPositions = new Set<number>();
  const manuscriptSites = new Set<string>();
  const factorySites = new Set<string>();
  for (const record of run.space.ancientManuscripts) {
    if (
      !record ||
      !exactKeys(record, ["position", "manuscriptSystemId", "factorySystemId", "reported"]) ||
      !Number.isSafeInteger(record.position) ||
      record.position < 1 ||
      record.position > 4 ||
      manuscriptPositions.has(record.position) ||
      !isSystemId(record.manuscriptSystemId) ||
      manuscriptSites.has(record.manuscriptSystemId) ||
      !isSystemId(record.factorySystemId) ||
      factorySites.has(record.factorySystemId) ||
      record.manuscriptSystemId === record.factorySystemId ||
      typeof record.reported !== "boolean"
    ) {
      return false;
    }
    manuscriptPositions.add(record.position);
    manuscriptSites.add(record.manuscriptSystemId);
    factorySites.add(record.factorySystemId);
  }
  const encounterIds = new Set<string>();
  for (const encounter of run.space.systemEncounters) {
    if (
      !encounter ||
      !exactKeys(encounter, [
        "systemId",
        "lifeDetected",
        "civilizationLevel",
        "lifeformTraits",
        "raceName",
        "populationEstimate",
        "threatLevel",
        "defenseRating",
        "enemyFleets",
        "anomalies",
        "initialImpression",
        "currentImpression",
        "latestDifferenceInImpression",
        "attitude",
        "triedToBully",
        "patience",
        "lastDiplomacyMessage",
        "warReady",
        "warMode",
        "battle",
      ]) ||
      !isSystemId(encounter.systemId) ||
      encounterIds.has(encounter.systemId) ||
      typeof encounter.lifeDetected !== "boolean" ||
      !STAR_CIVILIZATION_LEVELS.includes(encounter.civilizationLevel) ||
      !Array.isArray(encounter.lifeformTraits) ||
      encounter.lifeformTraits.length !== 3 ||
      encounter.lifeformTraits.some(
        (trait: unknown) => !STAR_LIFEFORM_TRAITS.some((allowed) => allowed === trait),
      ) ||
      typeof encounter.raceName !== "string" ||
      encounter.raceName.length < 1 ||
      encounter.raceName.length > 64 ||
      hasControlCharacter(encounter.raceName) ||
      !Number.isSafeInteger(encounter.populationEstimate) ||
      encounter.populationEstimate < 0 ||
      encounter.populationEstimate > 400_000_000 ||
      !STAR_THREAT_LEVELS.includes(encounter.threatLevel) ||
      !Number.isFinite(encounter.defenseRating) ||
      encounter.defenseRating < 0 ||
      encounter.defenseRating > 120 ||
      !exactKeys(encounter.enemyFleets, ["air", "land", "sea"]) ||
      ![encounter.enemyFleets.air, encounter.enemyFleets.land, encounter.enemyFleets.sea].every(
        (fleetCount) => Number.isSafeInteger(fleetCount) && fleetCount >= 0 && fleetCount <= 1_000,
      ) ||
      !Array.isArray(encounter.anomalies) ||
      encounter.anomalies.length > 2 ||
      encounter.anomalies.some(
        (anomaly: unknown) => !STAR_ANOMALY_IDS.some((allowed) => allowed === anomaly),
      ) ||
      new Set(encounter.anomalies).size !== encounter.anomalies.length ||
      !Number.isFinite(encounter.initialImpression) ||
      encounter.initialImpression < 0 ||
      encounter.initialImpression > 100 ||
      !Number.isFinite(encounter.currentImpression) ||
      encounter.currentImpression < 0 ||
      encounter.currentImpression > 100 ||
      !Number.isFinite(encounter.latestDifferenceInImpression) ||
      Math.abs(encounter.latestDifferenceInImpression) > 100 ||
      !STAR_ATTITUDES.includes(encounter.attitude) ||
      typeof encounter.triedToBully !== "boolean" ||
      !Number.isSafeInteger(encounter.patience) ||
      encounter.patience < 0 ||
      encounter.patience > 6 ||
      (encounter.lastDiplomacyMessage !== null &&
        !STAR_DIPLOMACY_MESSAGE_IDS.includes(encounter.lastDiplomacyMessage)) ||
      typeof encounter.warReady !== "boolean" ||
      typeof encounter.warMode !== "boolean" ||
      !encounter.battle ||
      !exactKeys(encounter.battle, ["phase", "round", "playerHealthPool", "enemyHealthPool"]) ||
      !SPACE_BATTLE_PHASES.includes(encounter.battle.phase) ||
      !Number.isSafeInteger(encounter.battle.round) ||
      encounter.battle.round < 0 ||
      !exactKeys(encounter.battle.playerHealthPool, PLAYER_FLEET_IDS) ||
      PLAYER_FLEET_IDS.some(
        (fleetId) =>
          !Number.isFinite(encounter.battle.playerHealthPool[fleetId]) ||
          encounter.battle.playerHealthPool[fleetId] < 0,
      ) ||
      !exactKeys(encounter.battle.enemyHealthPool, ENEMY_FLEET_IDS) ||
      ENEMY_FLEET_IDS.some(
        (fleetId) =>
          !Number.isFinite(encounter.battle.enemyHealthPool[fleetId]) ||
          encounter.battle.enemyHealthPool[fleetId] < 0,
      ) ||
      (encounter.warReady && encounter.warMode)
    ) {
      return false;
    }
    encounterIds.add(encounter.systemId);
  }
  const inProgressBattles = run.space.systemEncounters.filter(
    (encounter) => encounter.battle.phase === "inProgress",
  );
  const battleTimers = Object.values(run.timers).filter((timer) => timer.domain === "battle");
  if (
    inProgressBattles.length > 1 ||
    battleTimers.length > 1 ||
    (inProgressBattles.length === 1 &&
      (battleTimers.length !== 1 ||
        battleTimers[0]?.id !== "battle:starship-combat" ||
        (battleTimers[0].status !== "running" && battleTimers[0].status !== "paused"))) ||
    (inProgressBattles.length === 0 && battleTimers.length > 0)
  ) {
    return false;
  }
  for (const moduleId of STARSHIP_MODULE_IDS) {
    const module = run.space.starshipModules[moduleId];
    if (
      !module ||
      !exactKeys(module, ["builtParts"]) ||
      !Number.isSafeInteger(module.builtParts) ||
      module.builtParts < 0 ||
      module.builtParts > STARSHIP_MODULES[moduleId].parts
    )
      return false;
  }
  const starship = run.space.starship;
  if (
    (starship.destinationSystemId !== null && !isSystemId(starship.destinationSystemId)) ||
    !["unlaunched", "travelling", "orbiting"].includes(starship.phase) ||
    (starship.timerId !== null && typeof starship.timerId !== "string") ||
    !Number.isFinite(starship.durationMs) ||
    starship.durationMs < 0 ||
    !Number.isFinite(starship.antimatterSpent) ||
    starship.antimatterSpent < 0 ||
    (starship.phase === "unlaunched" &&
      (starship.timerId !== null || starship.durationMs !== 0 || starship.antimatterSpent !== 0)) ||
    (starship.phase !== "unlaunched" &&
      (starship.destinationSystemId === null ||
        starship.durationMs <= 0 ||
        starship.antimatterSpent <= 0)) ||
    (starship.phase === "travelling") !== (starship.timerId !== null)
  )
    return false;
  if (starship.timerId !== null) {
    const timer = run.timers[starship.timerId];
    if (
      !timer ||
      timer.domain !== "travel" ||
      (timer.status !== "running" && timer.status !== "paused")
    )
      return false;
  }
  const asteroidIds = new Set<string>();
  const asteroidNames = new Set<string>();
  for (const asteroid of run.space.asteroids) {
    if (
      !asteroid ||
      !exactKeys(asteroid, [
        "id",
        "name",
        "systemId",
        "distance",
        "rarity",
        "extractionEase",
        "remainingAntimatter",
        "totalAntimatter",
        "reservedBy",
        "depleted",
        "interacted",
      ]) ||
      typeof asteroid.id !== "string" ||
      !/^asteroid-[1-9][0-9]*$/.test(asteroid.id) ||
      asteroidIds.has(asteroid.id) ||
      typeof asteroid.name !== "string" ||
      asteroid.name.length === 0 ||
      asteroidNames.has(asteroid.name) ||
      typeof asteroid.systemId !== "string" ||
      asteroid.systemId.length === 0 ||
      !Number.isFinite(asteroid.distance) ||
      asteroid.distance < 0 ||
      !ASTEROID_RARITIES.includes(asteroid.rarity) ||
      !Number.isInteger(asteroid.extractionEase) ||
      asteroid.extractionEase < 1 ||
      asteroid.extractionEase > 6 ||
      !Number.isFinite(asteroid.remainingAntimatter) ||
      !Number.isFinite(asteroid.totalAntimatter) ||
      asteroid.remainingAntimatter < 0 ||
      asteroid.totalAntimatter < 0 ||
      asteroid.remainingAntimatter > asteroid.totalAntimatter ||
      (asteroid.reservedBy !== null && !ROCKET_IDS.includes(asteroid.reservedBy)) ||
      typeof asteroid.depleted !== "boolean" ||
      typeof asteroid.interacted !== "boolean" ||
      asteroid.depleted !== (asteroid.remainingAntimatter === 0)
    ) {
      return false;
    }
    asteroidIds.add(asteroid.id);
    asteroidNames.add(asteroid.name);
    if (asteroid.reservedBy !== null) {
      const reserver = run.space.rockets[asteroid.reservedBy as RocketId];
      if (
        !reserver ||
        reserver.targetAsteroidId !== asteroid.id ||
        !["outbound", "mining", "returning"].includes(reserver.phase)
      )
        return false;
    }
  }
  if (
    (run.space.selectedAsteroidId !== null && !asteroidIds.has(run.space.selectedAsteroidId)) ||
    run.space.nextAsteroidSequence <=
      [...asteroidIds].reduce((largest, id) => Math.max(largest, Number(id.slice(9))), 0)
  ) {
    return false;
  }
  for (const id of ROCKET_IDS) {
    const rocket = run.space.rockets[id];
    if (
      !rocket ||
      !exactKeys(rocket, [
        "name",
        "builtParts",
        "fuelQuantity",
        "fuelPumpPurchased",
        "fuelPumpEnabled",
        "phase",
        "targetAsteroidId",
        "journeyCount",
        "timerId",
      ]) ||
      typeof rocket.name !== "string" ||
      rocket.name.trim().length === 0 ||
      [...rocket.name].length > 12 ||
      hasControlCharacter(rocket.name) ||
      !Number.isSafeInteger(rocket.builtParts) ||
      rocket.builtParts < 0 ||
      rocket.builtParts > ROCKET_PART_REQUIREMENTS[id] ||
      !Number.isFinite(rocket.fuelQuantity) ||
      rocket.fuelQuantity < 0 ||
      rocket.fuelQuantity > ROCKET_FUEL_CAPACITY[id] ||
      !Number.isSafeInteger(rocket.journeyCount) ||
      rocket.journeyCount < 0 ||
      !["assembly", "ready", "orbit", "outbound", "mining", "returning"].includes(rocket.phase) ||
      typeof rocket.fuelPumpPurchased !== "boolean" ||
      typeof rocket.fuelPumpEnabled !== "boolean" ||
      (rocket.targetAsteroidId !== null && !asteroidIds.has(rocket.targetAsteroidId)) ||
      (rocket.timerId !== null && typeof rocket.timerId !== "string") ||
      (rocket.phase === "outbound" || rocket.phase === "returning") !== (rocket.timerId !== null) ||
      ["outbound", "mining", "returning"].includes(rocket.phase) !==
        (rocket.targetAsteroidId !== null) ||
      (rocket.phase === "mining" && rocket.targetAsteroidId === null) ||
      (rocket.phase !== "assembly" && rocket.builtParts === 0)
    ) {
      return false;
    }
    if (
      ["outbound", "mining", "returning"].includes(rocket.phase) &&
      !run.space.asteroids.some(
        (asteroid) => asteroid.id === rocket.targetAsteroidId && asteroid.reservedBy === id,
      )
    )
      return false;
    if (rocket.timerId !== null) {
      const timer = run.timers[rocket.timerId];
      if (
        !timer ||
        timer.domain !== "travel" ||
        (timer.status !== "running" && timer.status !== "paused")
      ) {
        return false;
      }
    }
  }
  if (
    (run.space.activeSurvey === "asteroids" && !run.timers["survey:asteroid-scan"]) ||
    (run.space.activeSurvey === "stars" && !run.timers["survey:star-study"]) ||
    (run.space.activeSurvey === "pillageVoid" && !run.timers["survey:void-pillage"]) ||
    (run.space.activeSurvey !== null && !run.space.telescopeBuilt)
  ) {
    return false;
  }
  if (run.space.activeSurvey !== null) {
    const timerId =
      run.space.activeSurvey === "asteroids"
        ? "survey:asteroid-scan"
        : run.space.activeSurvey === "stars"
          ? "survey:star-study"
          : "survey:void-pillage";
    const timer = run.timers[timerId];
    if (
      !timer ||
      timer.domain !== "survey" ||
      (timer.status !== "running" && timer.status !== "paused")
    ) {
      return false;
    }
  }
  for (const id of ECONOMIC_GOOD_IDS) {
    const good = run.goods[id];
    if (
      !good ||
      !exactKeys(good, ["quantity", "storageCapacity", "saleValue"]) ||
      !Number.isFinite(good.quantity) ||
      !Number.isFinite(good.storageCapacity) ||
      !Number.isFinite(good.saleValue) ||
      good.quantity < 0 ||
      good.quantity > good.storageCapacity ||
      good.storageCapacity < 0 ||
      good.saleValue < 0
    ) {
      return false;
    }
  }
  if (run.unlockedResources.some((id) => !MATERIAL_IDS.includes(id))) {
    return false;
  }
  const validTechIds = new Set(TECHNOLOGY_CATALOG.map((technology) => technology.id));
  if (
    run.economy.unlockedCompounds.some((id) => !COMPOUND_IDS.includes(id)) ||
    run.economy.researchedTechnologies.some((id) => !validTechIds.has(id)) ||
    run.economy.revealedTechnologies.some((id) => !validTechIds.has(id)) ||
    new Set(run.economy.researchedTechnologies).size !==
      run.economy.researchedTechnologies.length ||
    new Set(run.economy.revealedTechnologies).size !== run.economy.revealedTechnologies.length ||
    run.economy.researchedTechnologies.some(
      (id) => !run.economy.revealedTechnologies.includes(id),
    ) ||
    run.economy.autobuyerEnabled === null ||
    Object.values(run.economy.autobuyerEnabled).some((enabled) => typeof enabled !== "boolean") ||
    run.economy.autobuyerEnabled[autobuyerUpgradeId("hydrogen", 1)] !==
      run.hydrogenAutobuyerEnabled ||
    Object.values(run.economy.buildingEnabled).some((enabled) => typeof enabled !== "boolean") ||
    Object.values(run.economy.autoCreateEnabled).some((enabled) => typeof enabled !== "boolean") ||
    MATERIAL_IDS.some((id) => {
      const allocation = run.economy.resourceAllocation[id];
      return (
        typeof allocation.enabled !== "boolean" ||
        !Number.isFinite(allocation.cashShare) ||
        allocation.cashShare < 0 ||
        allocation.cashShare > 100 ||
        !Number.isFinite(allocation.compoundShare) ||
        allocation.compoundShare < 0 ||
        allocation.compoundShare > 100
      );
    })
  ) {
    return false;
  }
  if (
    typeof run.clock.paused !== "boolean" ||
    typeof run.clock.foreground !== "boolean" ||
    !Number.isFinite(run.clock.simulationMs) ||
    run.clock.simulationMs < 0 ||
    !Number.isFinite(run.clock.hiddenElapsedMs) ||
    run.clock.hiddenElapsedMs < 0 ||
    !Number.isFinite(run.clock.pendingForegroundMs) ||
    run.clock.pendingForegroundMs < 0 ||
    (run.clock.wallNowMs !== null &&
      (!Number.isFinite(run.clock.wallNowMs) || run.clock.wallNowMs < 0)) ||
    !Number.isSafeInteger(run.random.seed) ||
    run.random.seed < 0 ||
    run.random.seed > 0xffff_ffff ||
    !Number.isSafeInteger(run.random.draws) ||
    run.random.draws < 0
  ) {
    return false;
  }
  for (const [id, timer] of Object.entries(run.timers)) {
    const timerKeys = [
      "id",
      "domain",
      "durationMs",
      "elapsedMs",
      "repeat",
      "completionCount",
      "status",
      "policy",
    ];
    if (timer && timer.eventId !== undefined) timerKeys.push("eventId");
    if (timer && timer.goodId !== undefined) timerKeys.push("goodId");
    if (
      !timer ||
      !exactKeys(timer, timerKeys) ||
      !exactKeys(timer.policy, ["phase", "offlineEligible", "warpable"]) ||
      typeof timer.id !== "string" ||
      timer.id !== id ||
      typeof timer.domain !== "string" ||
      !TIMER_DOMAINS.includes(timer.domain) ||
      !timer.id.startsWith(`${timer.domain}:`) ||
      !Number.isFinite(timer.durationMs) ||
      timer.durationMs < 1 ||
      !Number.isFinite(timer.elapsedMs) ||
      timer.elapsedMs < 0 ||
      timer.elapsedMs > timer.durationMs ||
      typeof timer.repeat !== "boolean" ||
      !Number.isSafeInteger(timer.completionCount) ||
      timer.completionCount < 0 ||
      !["running", "paused", "complete"].includes(timer.status) ||
      !timer.policy ||
      timer.policy.phase !== timerPolicyFor(timer.domain).phase ||
      timer.policy.offlineEligible !== timerPolicyFor(timer.domain).offlineEligible ||
      timer.policy.warpable !== timerPolicyFor(timer.domain).warpable ||
      (timer.status === "complete" && timer.elapsedMs !== timer.durationMs) ||
      (timer.status !== "complete" && timer.elapsedMs >= timer.durationMs) ||
      !/^[a-zA-Z0-9._-]+$/.test(timer.id.slice(timer.domain.length + 1)) ||
      (timer.eventId !== undefined && !isEventId(timer.eventId)) ||
      (timer.goodId !== undefined && !isEconomicGoodId(timer.goodId))
    ) {
      return false;
    }
  }
  const weatherTimers = Object.values(run.timers).filter((timer) => timer.domain === "weather");
  if (
    weatherTimers.length !== 1 ||
    weatherTimers[0]?.id !== STAR_WEATHER_TIMER_ID ||
    weatherTimers[0].repeat
  ) {
    return false;
  }
  for (const [id, count] of Object.entries(run.upgrades)) {
    if (!isUpgradeId(id) || !Number.isSafeInteger(count) || count < 0) return false;
  }
  return (
    Number.isSafeInteger(permanent.rebirthCount) &&
    permanent.rebirthCount >= 0 &&
    Number.isFinite(permanent.ascendencyPoints) &&
    permanent.ascendencyPoints >= 0 &&
    Number.isFinite(permanent.gloryPoints) &&
    permanent.gloryPoints >= 0 &&
    Array.isArray(permanent.acquiredPerks) &&
    permanent.acquiredPerks.every((perk) => typeof perk === "string") &&
    Array.isArray(permanent.settledSystemIds) &&
    permanent.settledSystemIds.length <= 100 &&
    permanent.settledSystemIds.every(isSystemId) &&
    new Set(permanent.settledSystemIds).size === permanent.settledSystemIds.length &&
    permanent.oTypePowerPlantAssignments !== null &&
    typeof permanent.oTypePowerPlantAssignments === "object" &&
    !Array.isArray(permanent.oTypePowerPlantAssignments) &&
    exactKeys(permanent.oTypePowerPlantAssignments, O_TYPE_POWER_PLANT_IDS) &&
    O_TYPE_POWER_PLANT_IDS.every((plantId) => {
      const assignedSystemId = permanent.oTypePowerPlantAssignments[plantId];
      return (
        assignedSystemId === null ||
        (isSystemId(assignedSystemId) &&
          starTypeForSystem(assignedSystemId) === "O" &&
          permanent.settledSystemIds.includes(assignedSystemId))
      );
    }) &&
    new Set(Object.values(permanent.oTypePowerPlantAssignments).filter(Boolean)).size ===
      Object.values(permanent.oTypePowerPlantAssignments).filter(Boolean).length &&
    (permanent.philosophyId === null || PHILOSOPHY_IDS.includes(permanent.philosophyId)) &&
    LOCALE_IDS.includes(settings.locale) &&
    typeof settings.themeId === "string" &&
    (settings.notation === "standard" || settings.notation === "scientific") &&
    typeof settings.soundEnabled === "boolean" &&
    typeof settings.reducedMotion === "boolean" &&
    Number.isFinite(statistics.lifetimeCashEarned) &&
    statistics.lifetimeCashEarned >= 0 &&
    Number.isFinite(statistics.lifetimeGoodsProduced) &&
    statistics.lifetimeGoodsProduced >= 0 &&
    Number.isFinite(statistics.lifetimeAntimatterMined) &&
    statistics.lifetimeAntimatterMined >= 0 &&
    statistics.lifetimeAntimatterMined >= run.space.antimatterMinedThisRun &&
    Number.isSafeInteger(statistics.acceptedCommands) &&
    statistics.acceptedCommands >= 0 &&
    Number.isSafeInteger(statistics.completedTimers) &&
    statistics.completedTimers >= 0
  );
}

function upgradeToCurrentState(value: Record<string, unknown>): GameState | null {
  const run = value["run"];
  const statistics = value["statistics"];
  const permanent = value["permanent"];
  if (
    !run ||
    typeof run !== "object" ||
    Array.isArray(run) ||
    !statistics ||
    typeof statistics !== "object" ||
    Array.isArray(statistics) ||
    !permanent ||
    typeof permanent !== "object" ||
    Array.isArray(permanent)
  )
    return null;
  const runState = run as Record<string, unknown>;
  const space = runState["space"];
  if (!space || typeof space !== "object" || Array.isArray(space)) return null;
  const spaceState = space as Record<string, unknown>;
  const currentSystemId =
    typeof spaceState["currentSystemId"] === "string" ? spaceState["currentSystemId"] : "spica";
  const savedWeatherTimers =
    runState["timers"] !== null &&
    typeof runState["timers"] === "object" &&
    !Array.isArray(runState["timers"])
      ? (runState["timers"] as Record<string, unknown>)
      : {};
  const weatherTimers = { ...savedWeatherTimers };
  weatherTimers[STAR_WEATHER_TIMER_ID] ??= createMigratedStarWeatherTimer();
  const permanentState = permanent as Record<string, unknown>;
  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const initialSettledSystemId =
    catalogue.find((star) => star.initiallySettled)?.id ?? "system:0:0";
  const migratedCurrentSystem = catalogue.find(
    (star) =>
      star.id === currentSystemId ||
      star.name.toLocaleLowerCase("en") === currentSystemId.toLocaleLowerCase("en"),
  );
  const settledSystemIds = Array.isArray(permanentState["settledSystemIds"])
    ? permanentState["settledSystemIds"]
    : [migratedCurrentSystem?.id ?? initialSettledSystemId];
  const starStudyRange =
    typeof spaceState["starStudyRange"] === "number" &&
    Number.isFinite(spaceState["starStudyRange"]) &&
    spaceState["starStudyRange"] >= 0
      ? spaceState["starStudyRange"]
      : 0;
  const existingProfiles = Array.isArray(spaceState["systemProfiles"])
    ? (spaceState["systemProfiles"] as StarSystemProfile[]).filter(
        (profile) =>
          profile !== null &&
          typeof profile === "object" &&
          typeof profile.systemId === "string" &&
          isSystemId(profile.systemId),
      )
    : [];
  const systemProfiles = ensureDiscoveredStarSystemProfiles(
    existingProfiles,
    currentSystemId,
    starStudyRange,
  );
  const antimatter =
    typeof spaceState["antimatter"] === "number" && Number.isFinite(spaceState["antimatter"])
      ? Math.max(0, spaceState["antimatter"])
      : 0;
  const migratedWeatherCondition = SPACE_WEATHER_CONDITIONS.includes(
    spaceState["currentSystemWeather"] as (typeof SPACE_WEATHER_CONDITIONS)[number],
  )
    ? (spaceState["currentSystemWeather"] as SpaceState["currentSystemWeather"])
    : "clear";
  const statisticsState = statistics as Record<string, unknown>;
  const legacyPerks = Array.isArray(permanentState["acquiredPerks"])
    ? (permanentState["acquiredPerks"] as string[]).filter((perk) => typeof perk === "string")
    : [];
  const legacyFleetCounts =
    spaceState["playerFleets"] &&
    typeof spaceState["playerFleets"] === "object" &&
    !Array.isArray(spaceState["playerFleets"])
      ? (spaceState["playerFleets"] as Record<string, unknown>)
      : createInitialPlayerFleets();
  const legacyAttackMultiplier =
    FLEET_COMBAT_REPEATABLE_FACTOR **
    permanentPerkPurchaseCount(legacyPerks, "laserIntensityResearch");
  const legacyFleetCombatTotals = Object.fromEntries(
    PLAYER_FLEET_IDS.map((fleetId) => {
      const quantity =
        typeof legacyFleetCounts[fleetId] === "number"
          ? Math.max(0, legacyFleetCounts[fleetId] as number)
          : 0;
      return [
        fleetId,
        {
          attackPower:
            quantity * PLAYER_FLEETS[fleetId].baseAttackStrength * legacyAttackMultiplier,
          defensePower: quantity * PLAYER_FLEETS[fleetId].defenseStrength,
        },
      ];
    }),
  );
  const savedOTypeAssignments = permanentState["oTypePowerPlantAssignments"];
  const validSavedAssignmentShape =
    savedOTypeAssignments !== null &&
    typeof savedOTypeAssignments === "object" &&
    !Array.isArray(savedOTypeAssignments) &&
    O_TYPE_POWER_PLANT_IDS.every((plantId) => Object.hasOwn(savedOTypeAssignments, plantId));
  const savedAssignmentRecord = validSavedAssignmentShape
    ? (savedOTypeAssignments as Record<string, unknown>)
    : null;
  const previouslySettledOTypeSystems = settledSystemIds.filter(
    (systemId): systemId is string => isSystemId(systemId) && starTypeForSystem(systemId) === "O",
  );
  const claimedOTypeSystems = new Set<string>();
  let migratedOTypeIndex = 0;
  const oTypePowerPlantAssignments = Object.fromEntries(
    O_TYPE_POWER_PLANT_IDS.map((plantId) => {
      const assigned = savedAssignmentRecord
        ? savedAssignmentRecord[plantId]
        : previouslySettledOTypeSystems[migratedOTypeIndex++];
      if (
        !isSystemId(assigned) ||
        !settledSystemIds.includes(assigned) ||
        starTypeForSystem(assigned) !== "O" ||
        claimedOTypeSystems.has(assigned)
      ) {
        return [plantId, null];
      }
      claimedOTypeSystems.add(assigned);
      return [plantId, assigned];
    }),
  ) as Record<OTypePowerPlantId, SystemId | null>;
  const upgraded = {
    ...value,
    schemaVersion: 20,
    run: {
      ...runState,
      timers: weatherTimers,
      philosophyAbilityActive: runState["philosophyAbilityActive"] ?? false,
      space: {
        ...spaceState,
        systemProfiles,
        ancientManuscripts: spaceState["ancientManuscripts"] ?? [],
        systemEncounters: Array.isArray(spaceState["systemEncounters"])
          ? spaceState["systemEncounters"].map((encounter) =>
              encounter && typeof encounter === "object" && !Array.isArray(encounter)
                ? {
                    ...encounter,
                    lastDiplomacyMessage: encounter.lastDiplomacyMessage ?? null,
                    warReady: encounter.warReady ?? false,
                    warMode: encounter.warMode ?? false,
                    battle: encounter.battle ?? createInitialStarSystemBattleState(),
                  }
                : encounter,
            )
          : [],
        fleetEnvoyBuilt: spaceState["fleetEnvoyBuilt"] ?? false,
        playerFleets: spaceState["playerFleets"] ?? createInitialPlayerFleets(),
        playerFleetCombatTotals: spaceState["playerFleetCombatTotals"] ?? legacyFleetCombatTotals,
        starshipModules: spaceState["starshipModules"] ?? createInitialStarshipModules(),
        starship: spaceState["starship"] ?? createInitialSpaceState().starship,
        voidPillageCompletions: spaceState["voidPillageCompletions"] ?? 0,
        antimatterUnlocked:
          spaceState["antimatterUnlocked"] ??
          (antimatter > 0 ||
            (typeof spaceState["antimatterMinedThisRun"] === "number" &&
              spaceState["antimatterMinedThisRun"] > 0) ||
            (spaceState["rockets"] !== null &&
              typeof spaceState["rockets"] === "object" &&
              Object.values(spaceState["rockets"]).some(
                (rocket) =>
                  rocket !== null &&
                  typeof rocket === "object" &&
                  ["mining", "returning"].includes(
                    String((rocket as Record<string, unknown>)["phase"]),
                  ),
              ))),
        antimatterMinedThisRun: spaceState["antimatterMinedThisRun"] ?? antimatter,
        ascendencyAwardedThisRun: spaceState["ascendencyAwardedThisRun"] ?? false,
        currentSystemWeather: migratedWeatherCondition,
        weatherSystemId:
          typeof spaceState["weatherSystemId"] === "string" &&
          spaceState["weatherSystemId"].trim().length > 0
            ? spaceState["weatherSystemId"]
            : currentSystemId,
        weatherCycleCount:
          Number.isSafeInteger(spaceState["weatherCycleCount"]) &&
          Number(spaceState["weatherCycleCount"]) >= 0
            ? spaceState["weatherCycleCount"]
            : 0,
        severeWeatherPeriodCount:
          Number.isSafeInteger(spaceState["severeWeatherPeriodCount"]) &&
          Number(spaceState["severeWeatherPeriodCount"]) >= 0 &&
          Number(spaceState["severeWeatherPeriodCount"]) <= 3
            ? spaceState["severeWeatherPeriodCount"]
            : 0,
        currentPrecipitationRate:
          typeof spaceState["currentPrecipitationRate"] === "number" &&
          Number.isFinite(spaceState["currentPrecipitationRate"]) &&
          spaceState["currentPrecipitationRate"] >= 0 &&
          spaceState["currentPrecipitationRate"] <= 4
            ? spaceState["currentPrecipitationRate"]
            : migratedWeatherCondition === "rain"
              ? 1
              : 0,
        precipitationCollectedThisRun:
          typeof spaceState["precipitationCollectedThisRun"] === "number" &&
          Number.isFinite(spaceState["precipitationCollectedThisRun"]) &&
          spaceState["precipitationCollectedThisRun"] >= 0
            ? spaceState["precipitationCollectedThisRun"]
            : 0,
      },
    },
    permanent: {
      ...permanentState,
      philosophyId: permanentState["philosophyId"] ?? null,
      settledSystemIds,
      oTypePowerPlantAssignments,
    },
    statistics: {
      ...statisticsState,
      lifetimeAntimatterMined: statisticsState["lifetimeAntimatterMined"] ?? antimatter,
    },
  } as unknown as GameState;
  return isValidGameState(upgraded) ? upgraded : null;
}

/** Validates a v1 state by applying economy defaults and validating the current shape. */
export function upgradeGameStateV1(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (!legacy["run"] || typeof legacy["run"] !== "object" || Array.isArray(legacy["run"]))
    return null;
  const legacyRun = legacy["run"] as Record<string, unknown>;
  if (typeof legacyRun["hydrogenAutobuyerEnabled"] !== "boolean") return null;
  const candidate = {
    ...legacy,
    schemaVersion: 6,
    run: {
      ...legacyRun,
      economy: createInitialEconomyState(legacyRun["hydrogenAutobuyerEnabled"]),
      space: createInitialSpaceState(),
    },
  };
  return upgradeToCurrentState(candidate);
}

/** Adds the energy fields introduced after v2 saves were written. */
export function upgradeGameStateV2(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (
    legacy["schemaVersion"] !== 2 ||
    !legacy["run"] ||
    typeof legacy["run"] !== "object" ||
    Array.isArray(legacy["run"])
  )
    return null;
  const legacyRun = legacy["run"] as Record<string, unknown>;
  if (
    !legacyRun["economy"] ||
    typeof legacyRun["economy"] !== "object" ||
    Array.isArray(legacyRun["economy"])
  )
    return null;
  const legacyEconomy = legacyRun["economy"] as Record<string, unknown>;
  if (
    !legacyEconomy["power"] ||
    typeof legacyEconomy["power"] !== "object" ||
    Array.isArray(legacyEconomy["power"])
  )
    return null;
  const legacyPower = legacyEconomy["power"] as Record<string, unknown>;
  const oldPowerKeys = ["quantity", "capacity", "gridEnabled", "deficitMs", "tripped"];
  if (Object.keys(legacyPower).sort().join("|") !== [...oldPowerKeys].sort().join("|")) return null;
  const candidate = {
    ...legacy,
    schemaVersion: 6,
    run: {
      ...legacyRun,
      economy: {
        ...legacyEconomy,
        power: { ...legacyPower, infinitePower: false, environmentalMultiplier: 1 },
      },
      space: createInitialSpaceState(),
    },
  };
  return upgradeToCurrentState(candidate);
}

/** Adds the initial space state to v3 runs while preserving all existing progress. */
export function upgradeGameStateV3(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (
    legacy["schemaVersion"] !== 3 ||
    !legacy["run"] ||
    typeof legacy["run"] !== "object" ||
    Array.isArray(legacy["run"])
  )
    return null;
  const legacyRun = legacy["run"] as Record<string, unknown>;
  if (
    !legacyRun["economy"] ||
    typeof legacyRun["economy"] !== "object" ||
    Array.isArray(legacyRun["economy"])
  )
    return null;
  const candidate = {
    ...legacy,
    schemaVersion: 6,
    run: {
      ...legacyRun,
      space: createInitialSpaceState(),
    },
  };
  return upgradeToCurrentState(candidate);
}

/** Adds extraction counters introduced in v7 while preserving all v6 progress. */
export function upgradeGameStateV6(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 6) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds philosophy identity and active-ability state introduced in v8. */
export function upgradeGameStateV7(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 7) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds the saved antimatter unlock state introduced in v9. */
export function upgradeGameStateV8(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 8) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds persistent per-system generated star facts introduced in v10. */
export function upgradeGameStateV9(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 9) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds persisted starship module construction progress introduced in v11. */
export function upgradeGameStateV10(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 10) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds durable starship destination and travel timer state introduced in v12. */
export function upgradeGameStateV11(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 11) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds hidden ancient-manuscript assignments introduced in v13. */
export function upgradeGameStateV12(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 12) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds envoy construction and durable diplomacy messages introduced in v14. */
export function upgradeGameStateV13(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 13) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds player fleet quantities introduced in v15. */
export function upgradeGameStateV14(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 14) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds saved per-class combat totals introduced in v16. */
export function upgradeGameStateV15(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 15) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds saved war readiness/mode to scanned encounters introduced in v17. */
export function upgradeGameStateV16(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 16) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds compact battle state and settled-system ownership introduced in v18. */
export function upgradeGameStateV17(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 17) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds durable O-type power-plant assignments introduced in v19. */
export function upgradeGameStateV18(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 18) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds weather-cycle state and its durable change timer introduced in v20. */
export function upgradeGameStateV19(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 19) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds transient boost and weather fields introduced in v6, then v7 mining counters. */
export function upgradeGameStateV5(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (
    legacy["schemaVersion"] !== 5 ||
    !legacy["run"] ||
    typeof legacy["run"] !== "object" ||
    Array.isArray(legacy["run"])
  )
    return null;
  const legacyRun = legacy["run"] as Record<string, unknown>;
  if (
    !legacyRun["space"] ||
    typeof legacyRun["space"] !== "object" ||
    Array.isArray(legacyRun["space"])
  )
    return null;
  const legacySpace = legacyRun["space"] as Record<string, unknown>;
  const candidate = {
    ...legacy,
    schemaVersion: 6,
    run: {
      ...legacyRun,
      space: {
        ...legacySpace,
        antimatterBoostActive: false,
        currentSystemWeather: "clear",
      },
    },
  };
  const upgraded = upgradeToCurrentState(candidate);
  return upgraded && isValidGameState(upgraded) ? upgraded : null;
}

/** Adds interacted asteroid flags introduced in v5 while preserving the v4 space records. */
export function upgradeGameStateV4(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (
    legacy["schemaVersion"] !== 4 ||
    !legacy["run"] ||
    typeof legacy["run"] !== "object" ||
    Array.isArray(legacy["run"])
  )
    return null;
  const legacyRun = legacy["run"] as Record<string, unknown>;
  if (
    !legacyRun["space"] ||
    typeof legacyRun["space"] !== "object" ||
    Array.isArray(legacyRun["space"])
  )
    return null;
  const legacySpace = legacyRun["space"] as Record<string, unknown>;
  if (!Array.isArray(legacySpace["asteroids"])) return null;
  const asteroids = legacySpace["asteroids"] as unknown[];
  const candidate = {
    ...legacy,
    schemaVersion: 5,
    run: {
      ...legacyRun,
      space: {
        ...legacySpace,
        asteroids: asteroids.map((asteroid) =>
          asteroid && typeof asteroid === "object" && !Array.isArray(asteroid)
            ? {
                ...(asteroid as Record<string, unknown>),
                interacted: (asteroid as Record<string, unknown>)["interacted"] ?? false,
              }
            : asteroid,
        ),
      },
    },
  };
  return upgradeGameStateV5(candidate);
}
