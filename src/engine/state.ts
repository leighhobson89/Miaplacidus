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
import {
  INITIAL_PHILOSOPHY_RANKS,
  PHILOSOPHY_REPEATABLE_IDS,
  type PhilosophyRepeatableId,
} from "../content/philosophy";
import {
  MEGASTRUCTURE_IDS,
  MEGASTRUCTURE_TECHNOLOGY_IDS,
  TECHNOLOGY_CATALOG,
} from "../content/technology";
import { INITIAL_GOODS } from "../content/economy";
import {
  createInitialGalacticMarketState,
  type GalacticMarketState,
} from "../content/galacticMarket";
import {
  CASINO_GAME_IDS,
  createInitialCasinoRunStats,
  createInitialCasinoState,
  type CasinoRunStats,
  type CasinoState,
} from "../content/galacticCasino";
import {
  BLACK_HOLE_BASE_CHARGE_MS,
  BLACK_HOLE_BASE_POWER,
  BLACK_HOLE_BASE_WARP_MS,
  BLACK_HOLE_MINIMUM_CHARGE_MS,
  BLACK_HOLE_RESEARCH_PRICE,
  BLACK_HOLE_UPGRADE_BASE_PRICES,
} from "../content/blackHole";
import {
  COSMIC_RIP_SECTOR_COUNT,
  COSMIC_RIP_TECHNOLOGIES,
  type CosmicRipTechnologyId,
} from "../content/cosmicRip";
import { ACHIEVEMENT_IDS, type AchievementId } from "../content/achievements";
import { DEFAULT_THEME_ID, THEME_IDS, isThemeId, type ThemeId } from "../content/themes";
import { isCurrencyId, type CurrencyId } from "../content/currency";
import {
  MANUSCRIPT_CLUE_NEWS_IDS,
  NEWS_CATEGORIES,
  ONE_OFF_NEWS_IDS,
  RANDOM_EVENT_IDS,
  createInitialNewsTickerProgress,
  createInitialRandomEventProgress,
  createRandomEventCounts,
  type ManuscriptClueNewsId,
  type NewsTickerProgress,
  type RandomEventProgress,
} from "../content/metaSignals";
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
  type AncientManuscriptRecord,
  type RocketId,
  type SpaceState,
  type StarSystemProfile,
} from "../content/space";
import {
  createStarCatalogue,
  distanceBetweenStars,
  starTypeForSystem,
} from "../content/starCatalogue";
import { O_TYPE_POWER_PLANT_IDS, type OTypePowerPlantId } from "../content/starTypeRules";
import { createClockState } from "./clock";
import { createRandomState } from "./random";
import { permanentPerkPurchaseCount } from "../content/economyRules";
import { nextRandomInteger } from "./random";
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
  readonly researchPointsEarnedThisRun: number;
  readonly scienceKitsBuiltThisRun: number;
  readonly scienceClubsBuiltThisRun: number;
  readonly scienceLabsBuiltThisRun: number;
  readonly energyTripsThisRun: number;
  readonly basicPowerPlantsBuiltThisRun: number;
  readonly advancedPowerPlantsBuiltThisRun: number;
  readonly solarPowerPlantsBuiltThisRun: number;
  readonly sodiumIonBatteriesBuiltThisRun: number;
  readonly battery2BuiltThisRun: number;
  readonly battery3BuiltThisRun: number;
  readonly goods: Readonly<Record<EconomicGoodId, GoodState>>;
  readonly goodsProducedThisRun: Readonly<Record<EconomicGoodId, number>>;
  readonly unlockedResources: readonly MaterialId[];
  readonly upgrades: Readonly<Partial<Record<UpgradeId, number>>>;
  readonly timers: TimerMap;
  readonly clock: ClockState;
  readonly random: ReturnType<typeof createRandomState>;
  readonly economy: EconomyState;
  readonly space: SpaceState;
  readonly philosophyAbilityActive: boolean;
  readonly philosophyChoicePending: boolean;
  readonly expansionistExtraSystemIds: readonly SystemId[];
  readonly marketLiquidatedThisRun: boolean;
  readonly marketLockdownRemainingMs: number;
  readonly casinoStats: CasinoRunStats;
  readonly timeWarp: { readonly multiplier: number; readonly remainingMs: number };
  readonly blackHoleChargeReady: boolean;
  readonly blackHoleWarpActive: boolean;
  readonly achievements: RunAchievementProgress;
  readonly randomEvents: RandomEventProgress;
  readonly newsTicker: NewsTickerProgress;
  readonly navigationAttentionIds: readonly string[];
  readonly navigationAttentionInitialized: boolean;
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
  readonly navigationVisitedIds: readonly string[];
  readonly ascendencyPoints: number;
  readonly gloryPoints: number;
  readonly acquiredPerks: readonly string[];
  readonly philosophyId: PhilosophyId | null;
  readonly philosophyRepeatableRanks: Readonly<Record<PhilosophyRepeatableId, number>>;
  readonly settledSystemIds: readonly string[];
  readonly oTypePowerPlantAssignments: Readonly<Record<OTypePowerPlantId, SystemId | null>>;
  readonly galacticMarket: GalacticMarketState;
  readonly galacticCasino: CasinoState;
  readonly blackHole: BlackHoleProgress;
  readonly megastructures: MegastructureProgress;
  readonly cosmicRip: CosmicRipProgress;
  readonly achievements: PermanentAchievementProgress;
}

export interface AchievementBonusState {
  readonly resourceRateMultiplier: number;
  readonly resourceRateAdditive: number;
  readonly compoundRecipeCostMultiplier: number;
}

export interface RunAchievementProgress {
  readonly unlockedIds: readonly AchievementId[];
  readonly bonuses: AchievementBonusState;
}

export interface PermanentAchievementProgress {
  readonly unlockedIds: readonly AchievementId[];
  readonly bonuses: AchievementBonusState;
  readonly themeIdsTried: readonly ThemeId[];
}

export function createInitialAchievementBonusState(): AchievementBonusState {
  return { resourceRateMultiplier: 1, resourceRateAdditive: 0, compoundRecipeCostMultiplier: 1 };
}

export function createInitialRunAchievementProgress(): RunAchievementProgress {
  return { unlockedIds: [], bonuses: createInitialAchievementBonusState() };
}

export function createInitialPermanentAchievementProgress(): PermanentAchievementProgress {
  return {
    unlockedIds: [],
    bonuses: createInitialAchievementBonusState(),
    themeIdsTried: [DEFAULT_THEME_ID],
  };
}

export interface CosmicRipProgress {
  readonly unlocked: boolean;
  readonly scannerRestored: boolean;
  readonly ripLocationSectorIndex: number | null;
  readonly scannedSectorIndexes: readonly number[];
  readonly ripFound: boolean;
  readonly telemetryData: number;
  readonly sensorBuoyCount: number;
  readonly ripResearchOrbiterCount: number;
  readonly researchedTechnologyIds: readonly CosmicRipTechnologyId[];
  readonly activeResearchTechnologyId: CosmicRipTechnologyId | null;
  readonly researchElapsedMs: number;
  readonly closed: boolean;
}

export function createInitialCosmicRipProgress(): CosmicRipProgress {
  return {
    unlocked: false,
    scannerRestored: false,
    ripLocationSectorIndex: null,
    scannedSectorIndexes: [],
    ripFound: false,
    telemetryData: 0,
    sensorBuoyCount: 0,
    ripResearchOrbiterCount: 0,
    researchedTechnologyIds: [],
    activeResearchTechnologyId: null,
    researchElapsedMs: 0,
    closed: false,
  };
}

export interface MegastructureProgress {
  readonly ancientManuscripts: readonly AncientManuscriptRecord[];
  readonly manuscriptCluesShown: Readonly<
    Partial<Record<SystemId, readonly ManuscriptClueNewsId[]>>
  >;
  readonly researchedTechnologyIds: readonly TechId[];
  readonly manuscriptRewardClaimed: boolean;
  readonly conquestRewardClaimed: boolean;
  readonly forceFieldRewardClaimed: boolean;
  readonly miaplacidusStoryPending: boolean;
  readonly miaplacidusStoryShown: boolean;
}

export function createInitialMegastructureProgress(): MegastructureProgress {
  return {
    ancientManuscripts: [],
    manuscriptCluesShown: {},
    researchedTechnologyIds: [],
    manuscriptRewardClaimed: false,
    conquestRewardClaimed: false,
    forceFieldRewardClaimed: false,
    miaplacidusStoryPending: false,
    miaplacidusStoryShown: false,
  };
}

export interface BlackHoleProgress {
  readonly discovered: boolean;
  readonly discoveryProbability: number;
  readonly researched: boolean;
  readonly researchPrice: number;
  readonly durationPrice: number;
  readonly powerPrice: number;
  readonly rechargePrice: number;
  readonly durationMs: number;
  readonly power: number;
  readonly rechargeMultiplier: number;
  readonly alwaysOn: boolean;
}

export function createInitialBlackHoleProgress(): BlackHoleProgress {
  return {
    discovered: false,
    discoveryProbability: 0,
    researched: false,
    researchPrice: BLACK_HOLE_RESEARCH_PRICE,
    durationPrice: BLACK_HOLE_UPGRADE_BASE_PRICES.duration,
    powerPrice: BLACK_HOLE_UPGRADE_BASE_PRICES.power,
    rechargePrice: BLACK_HOLE_UPGRADE_BASE_PRICES.recharge,
    durationMs: BLACK_HOLE_BASE_WARP_MS,
    power: BLACK_HOLE_BASE_POWER,
    rechargeMultiplier: 1,
    alwaysOn: false,
  };
}

export type NumberNotation = "condensed" | "standard" | "scientific";

export interface SettingsState {
  readonly locale: LocaleId;
  readonly themeId: ThemeId;
  readonly currencyId?: CurrencyId;
  readonly notation: NumberNotation;
  readonly soundEnabled: boolean;
  /** Optional audio preferences are absent in saves created before the controls were split. */
  readonly backgroundAudioEnabled?: boolean;
  readonly soundEffectsEnabled?: boolean;
  readonly backgroundAudioVolume?: number;
  readonly soundEffectsVolume?: number;
  readonly customPointerEnabled?: boolean;
  readonly pointerTrailEnabled?: boolean;
  readonly weatherEffectsEnabled?: boolean;
  readonly reducedMotion: boolean;
  /** Optional for compatibility with saves written before the news toggle was introduced. */
  readonly newsTickerEnabled?: boolean;
  /** Optional for compatibility with saves written before the notification toggle was introduced. */
  readonly notificationsEnabled?: boolean;
}

export interface StatisticsState {
  readonly lifetimeCashEarned: number;
  readonly lifetimeGoodsProduced: number;
  readonly lifetimeGoodsProducedByGood: Readonly<Record<EconomicGoodId, number>>;
  readonly lifetimeResearchPointsEarned: number;
  readonly lifetimeScienceKitsBuilt: number;
  readonly lifetimeScienceClubsBuilt: number;
  readonly lifetimeScienceLabsBuilt: number;
  readonly lifetimeEnergyTrips: number;
  readonly lifetimeBasicPowerPlantsBuilt: number;
  readonly lifetimeAdvancedPowerPlantsBuilt: number;
  readonly lifetimeSolarPowerPlantsBuilt: number;
  readonly lifetimeSodiumIonBatteriesBuilt: number;
  readonly lifetimeBattery2Built: number;
  readonly lifetimeBattery3Built: number;
  readonly lifetimeAntimatterMined: number;
  readonly lifetimeAscendencyPointsGained: number;
  readonly lifetimeGalacticPointsSpent: number;
  readonly lifetimeCosmicRipTelemetryDataEarned: number;
  readonly lifetimeAsteroidsDiscovered: number;
  readonly lifetimeLegendaryAsteroidsDiscovered: number;
  readonly lifetimeAsteroidsMined: number;
  readonly lifetimeRocketsBuilt: number;
  readonly lifetimeRocketsLaunched: number;
  readonly lifetimeStarshipsLaunched: number;
  readonly lifetimeStarshipDistanceTravelled: number;
  readonly lifetimeActiveMs: number;
  readonly acceptedCommands: number;
  readonly completedTimers: number;
  readonly lifetimeRandomEventCounts: Readonly<Record<(typeof RANDOM_EVENT_IDS)[number], number>>;
}

export interface GameState {
  readonly schemaVersion: 44;
  readonly run: RunState;
  readonly permanent: PermanentState;
  readonly settings: SettingsState;
  readonly statistics: StatisticsState;
}

export type LegacyRunStateV1 = Omit<
  RunState,
  | "economy"
  | "space"
  | "energyTripsThisRun"
  | "basicPowerPlantsBuiltThisRun"
  | "advancedPowerPlantsBuiltThisRun"
  | "solarPowerPlantsBuiltThisRun"
  | "sodiumIonBatteriesBuiltThisRun"
  | "battery2BuiltThisRun"
  | "battery3BuiltThisRun"
  | "goodsProducedThisRun"
  | "philosophyAbilityActive"
  | "philosophyChoicePending"
  | "expansionistExtraSystemIds"
  | "casinoStats"
  | "blackHoleChargeReady"
  | "blackHoleWarpActive"
  | "achievements"
  | "randomEvents"
  | "newsTicker"
>;
export type LegacyPermanentState = Omit<
  PermanentState,
  | "navigationVisitedIds"
  | "philosophyId"
  | "philosophyRepeatableRanks"
  | "galacticCasino"
  | "blackHole"
  | "megastructures"
  | "cosmicRip"
  | "achievements"
>;
export interface LegacyGameStateV1 {
  readonly schemaVersion: 1;
  readonly run: LegacyRunStateV1;
  readonly permanent: LegacyPermanentState;
  readonly settings: SettingsState;
  readonly statistics: Omit<
    StatisticsState,
    | "lifetimeGoodsProducedByGood"
    | "lifetimeResearchPointsEarned"
    | "lifetimeScienceKitsBuilt"
    | "lifetimeScienceClubsBuilt"
    | "lifetimeScienceLabsBuilt"
    | "lifetimeEnergyTrips"
    | "lifetimeBasicPowerPlantsBuilt"
    | "lifetimeAdvancedPowerPlantsBuilt"
    | "lifetimeSolarPowerPlantsBuilt"
    | "lifetimeSodiumIonBatteriesBuilt"
    | "lifetimeBattery2Built"
    | "lifetimeBattery3Built"
    | "lifetimeAntimatterMined"
    | "lifetimeAscendencyPointsGained"
    | "lifetimeAsteroidsDiscovered"
    | "lifetimeLegendaryAsteroidsDiscovered"
    | "lifetimeAsteroidsMined"
    | "lifetimeRocketsBuilt"
    | "lifetimeRocketsLaunched"
    | "lifetimeStarshipsLaunched"
    | "lifetimeActiveMs"
  >;
}

export type LegacyPowerStateV2 = Omit<PowerState, "infinitePower" | "environmentalMultiplier">;
export type LegacyEconomyStateV2 = Omit<EconomyState, "power"> & {
  readonly power: LegacyPowerStateV2;
};
export type LegacyRunStateV2 = Omit<
  RunState,
  | "economy"
  | "space"
  | "energyTripsThisRun"
  | "basicPowerPlantsBuiltThisRun"
  | "advancedPowerPlantsBuiltThisRun"
  | "solarPowerPlantsBuiltThisRun"
  | "sodiumIonBatteriesBuiltThisRun"
  | "battery2BuiltThisRun"
  | "battery3BuiltThisRun"
  | "goodsProducedThisRun"
  | "philosophyAbilityActive"
  | "philosophyChoicePending"
  | "expansionistExtraSystemIds"
  | "blackHoleChargeReady"
  | "blackHoleWarpActive"
  | "achievements"
  | "randomEvents"
  | "newsTicker"
> & {
  readonly economy: LegacyEconomyStateV2;
};
export interface LegacyGameStateV2 {
  readonly schemaVersion: 2;
  readonly run: LegacyRunStateV2;
  readonly permanent: LegacyPermanentState;
  readonly settings: SettingsState;
  readonly statistics: Omit<
    StatisticsState,
    | "lifetimeGoodsProducedByGood"
    | "lifetimeResearchPointsEarned"
    | "lifetimeScienceKitsBuilt"
    | "lifetimeScienceClubsBuilt"
    | "lifetimeScienceLabsBuilt"
    | "lifetimeEnergyTrips"
    | "lifetimeBasicPowerPlantsBuilt"
    | "lifetimeAdvancedPowerPlantsBuilt"
    | "lifetimeSolarPowerPlantsBuilt"
    | "lifetimeSodiumIonBatteriesBuilt"
    | "lifetimeBattery2Built"
    | "lifetimeBattery3Built"
    | "lifetimeAntimatterMined"
    | "lifetimeAscendencyPointsGained"
    | "lifetimeAsteroidsDiscovered"
    | "lifetimeLegendaryAsteroidsDiscovered"
    | "lifetimeAsteroidsMined"
    | "lifetimeRocketsBuilt"
    | "lifetimeRocketsLaunched"
    | "lifetimeStarshipsLaunched"
    | "lifetimeActiveMs"
  >;
}

export type LegacyRunStateV3 = Omit<
  RunState,
  | "space"
  | "energyTripsThisRun"
  | "basicPowerPlantsBuiltThisRun"
  | "advancedPowerPlantsBuiltThisRun"
  | "solarPowerPlantsBuiltThisRun"
  | "sodiumIonBatteriesBuiltThisRun"
  | "battery2BuiltThisRun"
  | "battery3BuiltThisRun"
  | "goodsProducedThisRun"
  | "philosophyAbilityActive"
  | "philosophyChoicePending"
  | "expansionistExtraSystemIds"
  | "blackHoleChargeReady"
  | "blackHoleWarpActive"
  | "achievements"
  | "randomEvents"
  | "newsTicker"
>;
export interface LegacyGameStateV3 {
  readonly schemaVersion: 3;
  readonly run: LegacyRunStateV3;
  readonly permanent: LegacyPermanentState;
  readonly settings: SettingsState;
  readonly statistics: Omit<
    StatisticsState,
    | "lifetimeGoodsProducedByGood"
    | "lifetimeResearchPointsEarned"
    | "lifetimeScienceKitsBuilt"
    | "lifetimeScienceClubsBuilt"
    | "lifetimeScienceLabsBuilt"
    | "lifetimeEnergyTrips"
    | "lifetimeBasicPowerPlantsBuilt"
    | "lifetimeAdvancedPowerPlantsBuilt"
    | "lifetimeSolarPowerPlantsBuilt"
    | "lifetimeSodiumIonBatteriesBuilt"
    | "lifetimeBattery2Built"
    | "lifetimeBattery3Built"
    | "lifetimeAntimatterMined"
    | "lifetimeAscendencyPointsGained"
    | "lifetimeAsteroidsDiscovered"
    | "lifetimeLegendaryAsteroidsDiscovered"
    | "lifetimeAsteroidsMined"
    | "lifetimeRocketsBuilt"
    | "lifetimeRocketsLaunched"
    | "lifetimeStarshipsLaunched"
    | "lifetimeActiveMs"
  >;
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

function createGoodProductionCounts(): Record<EconomicGoodId, number> {
  return Object.fromEntries(ECONOMIC_GOOD_IDS.map((id) => [id, 0])) as Record<
    EconomicGoodId,
    number
  >;
}

function validGoodProductionCounts(
  value: unknown,
): value is Readonly<Record<EconomicGoodId, number>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const expectedKeys = [...ECONOMIC_GOOD_IDS].sort();
  return (
    keys.length === expectedKeys.length &&
    keys.every((key, index) => key === expectedKeys[index]) &&
    ECONOMIC_GOOD_IDS.every((id) => Number.isFinite(record[id]) && Number(record[id]) >= 0)
  );
}

export function createInitialGameState(options: InitialStateOptions = {}): GameState {
  const seed = options.seed ?? GALAXY_SEED_DEFAULT;
  const tickerIntervalMs = nextRandomInteger(
    createRandomState((seed ^ 0xa511e9b3) >>> 0),
    20_000,
    35_000,
  ).value;
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
    schemaVersion: 44,
    run: {
      pioneerName: options.pioneerName?.trim() || "Pioneer",
      hydrogenAutobuyerEnabled: true,
      cash: 10,
      researchPoints: 50,
      researchPointsEarnedThisRun: 0,
      scienceKitsBuiltThisRun: 0,
      scienceClubsBuiltThisRun: 0,
      scienceLabsBuiltThisRun: 0,
      energyTripsThisRun: 0,
      basicPowerPlantsBuiltThisRun: 0,
      advancedPowerPlantsBuiltThisRun: 0,
      solarPowerPlantsBuiltThisRun: 0,
      sodiumIonBatteriesBuiltThisRun: 0,
      battery2BuiltThisRun: 0,
      battery3BuiltThisRun: 0,
      goods,
      goodsProducedThisRun: createGoodProductionCounts(),
      unlockedResources: ["hydrogen"],
      upgrades: {},
      timers: {},
      clock: createClockState(),
      random: createRandomState(seed),
      economy: createInitialEconomyState(),
      space: {
        ...createInitialSpaceState(),
        systemProfiles: createInitialStarSystemProfiles(),
      },
      philosophyAbilityActive: false,
      philosophyChoicePending: false,
      expansionistExtraSystemIds: [],
      marketLiquidatedThisRun: false,
      marketLockdownRemainingMs: 0,
      casinoStats: createInitialCasinoRunStats(),
      timeWarp: { multiplier: 1, remainingMs: 0 },
      blackHoleChargeReady: false,
      blackHoleWarpActive: false,
      achievements: createInitialRunAchievementProgress(),
      randomEvents: createInitialRandomEventProgress(),
      newsTicker: { ...createInitialNewsTickerProgress(), remainingMs: tickerIntervalMs },
      navigationAttentionIds: [],
      navigationAttentionInitialized: false,
    },
    permanent: {
      rebirthCount: 0,
      navigationVisitedIds: [],
      ascendencyPoints: 0,
      gloryPoints: 0,
      acquiredPerks: [],
      philosophyId: null,
      philosophyRepeatableRanks: { ...INITIAL_PHILOSOPHY_RANKS },
      settledSystemIds: [startingSystemId],
      oTypePowerPlantAssignments: { powerPlant1: null, powerPlant2: null, powerPlant3: null },
      galacticMarket: createInitialGalacticMarketState(seed),
      galacticCasino: createInitialCasinoState(),
      blackHole: createInitialBlackHoleProgress(),
      megastructures: createInitialMegastructureProgress(),
      cosmicRip: createInitialCosmicRipProgress(),
      achievements: createInitialPermanentAchievementProgress(),
    },
    settings: {
      locale: options.locale ?? "en",
      themeId: DEFAULT_THEME_ID,
      currencyId: "usd",
      notation: "condensed",
      soundEnabled: false,
      backgroundAudioEnabled: false,
      soundEffectsEnabled: false,
      backgroundAudioVolume: 0.5,
      soundEffectsVolume: 0.5,
      customPointerEnabled: true,
      pointerTrailEnabled: false,
      weatherEffectsEnabled: true,
      reducedMotion: false,
      newsTickerEnabled: true,
      notificationsEnabled: true,
    },
    statistics: {
      lifetimeCashEarned: 0,
      lifetimeGoodsProduced: 0,
      lifetimeGoodsProducedByGood: createGoodProductionCounts(),
      lifetimeResearchPointsEarned: 0,
      lifetimeScienceKitsBuilt: 0,
      lifetimeScienceClubsBuilt: 0,
      lifetimeScienceLabsBuilt: 0,
      lifetimeEnergyTrips: 0,
      lifetimeBasicPowerPlantsBuilt: 0,
      lifetimeAdvancedPowerPlantsBuilt: 0,
      lifetimeSolarPowerPlantsBuilt: 0,
      lifetimeSodiumIonBatteriesBuilt: 0,
      lifetimeBattery2Built: 0,
      lifetimeBattery3Built: 0,
      lifetimeAntimatterMined: 0,
      lifetimeAscendencyPointsGained: 0,
      lifetimeGalacticPointsSpent: 0,
      lifetimeCosmicRipTelemetryDataEarned: 0,
      lifetimeAsteroidsDiscovered: 0,
      lifetimeLegendaryAsteroidsDiscovered: 0,
      lifetimeAsteroidsMined: 0,
      lifetimeRocketsBuilt: 0,
      lifetimeRocketsLaunched: 0,
      lifetimeStarshipsLaunched: 0,
      lifetimeStarshipDistanceTravelled: 0,
      lifetimeActiveMs: 0,
      acceptedCommands: 0,
      completedTimers: 0,
      lifetimeRandomEventCounts: createRandomEventCounts(),
    },
  };
  return initializeStarWeather(initialState);
}

function validGalacticMarketState(value: unknown): value is GalacticMarketState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const market = value as Partial<GalacticMarketState>;
  const exactKeys = (record: object, expected: readonly string[]) => {
    const actual = Object.keys(record).sort();
    const keys = [...expected].sort();
    return actual.length === keys.length && actual.every((key, index) => key === keys[index]);
  };
  if (
    !exactKeys(value, [
      "goods",
      "commissionPercent",
      "apBuyPrice",
      "apSellPrice",
      "cycleRemainingMs",
      "biasTickRemainingMs",
      "nextTradeId",
      "history",
    ]) ||
    !market.goods ||
    typeof market.goods !== "object" ||
    Array.isArray(market.goods) ||
    !exactKeys(market.goods, ECONOMIC_GOOD_IDS) ||
    !Array.isArray(market.history) ||
    market.history.length > 30 ||
    !Number.isFinite(market.commissionPercent) ||
    market.commissionPercent! < 10 ||
    market.commissionPercent! > 80 ||
    !Number.isSafeInteger(market.apBuyPrice) ||
    market.apBuyPrice! < 1_000_000 ||
    market.apBuyPrice! > 1_600_000 ||
    !Number.isSafeInteger(market.apSellPrice) ||
    market.apSellPrice! < 60_000 ||
    market.apSellPrice! > 140_000 ||
    !Number.isFinite(market.cycleRemainingMs) ||
    market.cycleRemainingMs! < 1 ||
    market.cycleRemainingMs! > 240_000 ||
    !Number.isFinite(market.biasTickRemainingMs) ||
    market.biasTickRemainingMs! < 1 ||
    market.biasTickRemainingMs! > 10_000 ||
    !Number.isSafeInteger(market.nextTradeId) ||
    market.nextTradeId! < 1
  ) {
    return false;
  }
  for (const goodId of ECONOMIC_GOOD_IDS) {
    const entry = market.goods[goodId];
    if (
      !entry ||
      !exactKeys(entry, ["marketBias", "tradeVolume", "eventModifier"]) ||
      !Number.isFinite(entry.marketBias) ||
      Math.abs(entry.marketBias) > 1_000_000_000_000 ||
      !Number.isFinite(entry.tradeVolume) ||
      entry.tradeVolume < -1_000_000 ||
      entry.tradeVolume > 10_000_000 ||
      !Number.isFinite(entry.eventModifier) ||
      Math.abs(entry.eventModifier) > 100
    ) {
      return false;
    }
  }
  let previousId = 0;
  for (const trade of market.history) {
    if (
      !trade ||
      typeof trade !== "object" ||
      !exactKeys(trade, [
        "id",
        "simulationMs",
        "outgoingGoodId",
        "outgoingQuantity",
        "commissionQuantity",
        "incomingGoodId",
        "incomingQuantity",
      ]) ||
      !Number.isSafeInteger(trade.id) ||
      trade.id <= previousId ||
      trade.id >= market.nextTradeId! ||
      !Number.isFinite(trade.simulationMs) ||
      trade.simulationMs < 0 ||
      !isEconomicGoodId(trade.outgoingGoodId) ||
      !Number.isSafeInteger(trade.outgoingQuantity) ||
      trade.outgoingQuantity <= 0 ||
      !Number.isSafeInteger(trade.commissionQuantity) ||
      trade.commissionQuantity < 0 ||
      !isEconomicGoodId(trade.incomingGoodId) ||
      !Number.isSafeInteger(trade.incomingQuantity) ||
      trade.incomingQuantity <= 0
    ) {
      return false;
    }
    previousId = trade.id;
  }
  return true;
}

function validBlackHoleProgress(value: unknown): value is BlackHoleProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const hole = value as Partial<BlackHoleProgress>;
  const keys = [
    "alwaysOn",
    "discovered",
    "discoveryProbability",
    "durationMs",
    "durationPrice",
    "power",
    "powerPrice",
    "rechargeMultiplier",
    "rechargePrice",
    "researchPrice",
    "researched",
  ];
  return (
    Object.keys(value).sort().join("|") === keys.sort().join("|") &&
    typeof hole.discovered === "boolean" &&
    Number.isFinite(hole.discoveryProbability) &&
    hole.discoveryProbability! >= 0 &&
    hole.discoveryProbability! <= 100 &&
    typeof hole.researched === "boolean" &&
    Number.isFinite(hole.researchPrice) &&
    hole.researchPrice! >= 0 &&
    Number.isFinite(hole.durationPrice) &&
    hole.durationPrice! >= 0 &&
    Number.isFinite(hole.powerPrice) &&
    hole.powerPrice! >= 0 &&
    Number.isFinite(hole.rechargePrice) &&
    hole.rechargePrice! >= 0 &&
    Number.isFinite(hole.durationMs) &&
    hole.durationMs! >= 0 &&
    Number.isFinite(hole.power) &&
    hole.power! > 0 &&
    Number.isFinite(hole.rechargeMultiplier) &&
    hole.rechargeMultiplier! >= BLACK_HOLE_MINIMUM_CHARGE_MS / BLACK_HOLE_BASE_CHARGE_MS &&
    hole.rechargeMultiplier! <= 1 &&
    typeof hole.alwaysOn === "boolean" &&
    (!hole.researched || hole.discovered) &&
    (!hole.alwaysOn || (hole.researched && hole.rechargeMultiplier! <= 0.1))
  );
}

function validCosmicRipProgress(value: unknown): value is CosmicRipProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rip = value as Partial<CosmicRipProgress>;
  const keys = [
    "unlocked",
    "scannerRestored",
    "ripLocationSectorIndex",
    "scannedSectorIndexes",
    "ripFound",
    "telemetryData",
    "sensorBuoyCount",
    "ripResearchOrbiterCount",
    "researchedTechnologyIds",
    "activeResearchTechnologyId",
    "researchElapsedMs",
    "closed",
  ];
  const technologyIds = COSMIC_RIP_TECHNOLOGIES.map((technology) => technology.id);
  const locationValid =
    rip.ripLocationSectorIndex === null ||
    (Number.isSafeInteger(rip.ripLocationSectorIndex) &&
      rip.ripLocationSectorIndex! >= 0 &&
      rip.ripLocationSectorIndex! < COSMIC_RIP_SECTOR_COUNT);
  const scannedValid =
    Array.isArray(rip.scannedSectorIndexes) &&
    rip.scannedSectorIndexes.length <= COSMIC_RIP_SECTOR_COUNT &&
    rip.scannedSectorIndexes.every(
      (index) => Number.isSafeInteger(index) && index >= 0 && index < COSMIC_RIP_SECTOR_COUNT,
    ) &&
    new Set(rip.scannedSectorIndexes).size === rip.scannedSectorIndexes.length;
  const researchedValid =
    Array.isArray(rip.researchedTechnologyIds) &&
    rip.researchedTechnologyIds.every((id) => technologyIds.includes(id)) &&
    new Set(rip.researchedTechnologyIds).size === rip.researchedTechnologyIds.length;
  const activeId = rip.activeResearchTechnologyId;
  const activeValid =
    activeId === null ||
    (typeof activeId === "string" && technologyIds.includes(activeId as CosmicRipTechnologyId));
  const activeTechnology =
    typeof activeId === "string"
      ? COSMIC_RIP_TECHNOLOGIES.find((technology) => technology.id === activeId)
      : undefined;
  return (
    Object.keys(value).sort().join("|") === keys.sort().join("|") &&
    typeof rip.unlocked === "boolean" &&
    typeof rip.scannerRestored === "boolean" &&
    locationValid &&
    scannedValid &&
    typeof rip.ripFound === "boolean" &&
    Number.isFinite(rip.telemetryData) &&
    rip.telemetryData! >= 0 &&
    Number.isSafeInteger(rip.sensorBuoyCount) &&
    rip.sensorBuoyCount! >= 0 &&
    Number.isSafeInteger(rip.ripResearchOrbiterCount) &&
    rip.ripResearchOrbiterCount! >= 0 &&
    researchedValid &&
    activeValid &&
    Number.isFinite(rip.researchElapsedMs) &&
    rip.researchElapsedMs! >= 0 &&
    typeof rip.closed === "boolean" &&
    (!rip.scannerRestored || (rip.unlocked && rip.ripLocationSectorIndex !== null)) &&
    (!rip.ripFound || rip.scannerRestored) &&
    (!rip.ripFound ||
      (rip.ripLocationSectorIndex !== null &&
        rip.scannedSectorIndexes?.includes(rip.ripLocationSectorIndex))) &&
    (!rip.closed ||
      (researchedValid && rip.researchedTechnologyIds.length === technologyIds.length)) &&
    (activeId === null ||
      (activeId !== undefined &&
        !rip.researchedTechnologyIds?.includes(activeId as CosmicRipTechnologyId) &&
        rip.researchElapsedMs! < (activeTechnology?.durationMs ?? 0)))
  );
}

function validAchievementProgress(
  value: unknown,
  permanent = false,
): value is RunAchievementProgress | PermanentAchievementProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const progress = value as Partial<RunAchievementProgress>;
  const bonuses = progress.bonuses;
  return (
    Object.keys(value).sort().join("|") ===
      (permanent ? "bonuses|themeIdsTried|unlockedIds" : "bonuses|unlockedIds") &&
    Array.isArray(progress.unlockedIds) &&
    progress.unlockedIds.length <= ACHIEVEMENT_IDS.length &&
    progress.unlockedIds.every((id) => ACHIEVEMENT_IDS.includes(id)) &&
    new Set(progress.unlockedIds).size === progress.unlockedIds.length &&
    (!permanent ||
      (Array.isArray((progress as Partial<PermanentAchievementProgress>).themeIdsTried) &&
        (progress as Partial<PermanentAchievementProgress>).themeIdsTried!.length <=
          THEME_IDS.length &&
        (progress as Partial<PermanentAchievementProgress>).themeIdsTried!.every(isThemeId) &&
        new Set((progress as Partial<PermanentAchievementProgress>).themeIdsTried).size ===
          (progress as Partial<PermanentAchievementProgress>).themeIdsTried!.length)) &&
    !!bonuses &&
    Object.keys(bonuses).sort().join("|") ===
      "compoundRecipeCostMultiplier|resourceRateAdditive|resourceRateMultiplier" &&
    Number.isFinite(bonuses.resourceRateMultiplier) &&
    bonuses.resourceRateMultiplier > 0 &&
    bonuses.resourceRateMultiplier <= 1_000_000 &&
    Number.isFinite(bonuses.resourceRateAdditive) &&
    bonuses.resourceRateAdditive >= 0 &&
    bonuses.resourceRateAdditive <= 1_000_000 &&
    Number.isFinite(bonuses.compoundRecipeCostMultiplier) &&
    bonuses.compoundRecipeCostMultiplier > 0 &&
    bonuses.compoundRecipeCostMultiplier <= 1_000_000
  );
}

function validRandomEventProgress(value: unknown): value is RandomEventProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const progress = value as Partial<RandomEventProgress>;
  const exact = (record: object, keys: readonly string[]) =>
    Object.keys(record).sort().join("|") === [...keys].sort().join("|");
  return (
    exact(value, [
      "elapsedMs",
      "intervalMs",
      "halfwayAttempted",
      "probabilities",
      "history",
      "eventCountsThisRun",
      "activeEffects",
    ]) &&
    Number.isFinite(progress.elapsedMs) &&
    progress.elapsedMs! >= 0 &&
    Number.isFinite(progress.intervalMs) &&
    progress.intervalMs! >= 45 * 60_000 &&
    progress.intervalMs! <= 75 * 60_000 &&
    typeof progress.halfwayAttempted === "boolean" &&
    !!progress.probabilities &&
    exact(progress.probabilities, RANDOM_EVENT_IDS) &&
    RANDOM_EVENT_IDS.every(
      (id) =>
        Number.isFinite(progress.probabilities![id]) &&
        progress.probabilities![id] >= 0.01 &&
        progress.probabilities![id] <= 0.5,
    ) &&
    Array.isArray(progress.history) &&
    progress.history.length <= 100 &&
    validRandomEventCounts(progress.eventCountsThisRun) &&
    progress.history.every(
      (entry) =>
        entry &&
        exact(entry, ["id", "simulationMs", "negative"]) &&
        RANDOM_EVENT_IDS.includes(entry.id) &&
        Number.isFinite(entry.simulationMs) &&
        entry.simulationMs >= 0 &&
        typeof entry.negative === "boolean",
    ) &&
    Array.isArray(progress.activeEffects) &&
    progress.activeEffects.length <= RANDOM_EVENT_IDS.length &&
    progress.activeEffects.every(
      (entry) =>
        entry &&
        exact(entry, [
          "id",
          "remainingMs",
          "multiplier",
          "targetId",
          "powerMultiplier",
          "durationMultiplier",
          "nextShiftInMs",
        ]) &&
        RANDOM_EVENT_IDS.includes(entry.id) &&
        Number.isFinite(entry.remainingMs) &&
        entry.remainingMs > 0 &&
        Number.isFinite(entry.multiplier) &&
        entry.multiplier >= 0 &&
        entry.multiplier <= 10 &&
        (entry.targetId === null || typeof entry.targetId === "string") &&
        Number.isFinite(entry.powerMultiplier) &&
        entry.powerMultiplier >= 0 &&
        entry.powerMultiplier <= 10 &&
        Number.isFinite(entry.durationMultiplier) &&
        entry.durationMultiplier >= 0 &&
        entry.durationMultiplier <= 10 &&
        Number.isFinite(entry.nextShiftInMs) &&
        entry.nextShiftInMs >= 0 &&
        entry.nextShiftInMs <= 60_000 &&
        (entry.id === "blackHoleInstability" ? entry.nextShiftInMs > 0 : entry.nextShiftInMs === 0),
    )
  );
}

function validRandomEventCounts(
  value: unknown,
): value is Record<(typeof RANDOM_EVENT_IDS)[number], number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const counts = value as Record<string, unknown>;
  return (
    Object.keys(counts).sort().join("|") === [...RANDOM_EVENT_IDS].sort().join("|") &&
    RANDOM_EVENT_IDS.every((id) => Number.isSafeInteger(counts[id]) && Number(counts[id]) >= 0)
  );
}

function addLegacyOneOffOffers(value: unknown): NewsTickerProgress {
  const saved =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const ids = Array.isArray(saved["offeredOneOffIds"])
    ? saved["offeredOneOffIds"]
    : [
        ...(Array.isArray(saved["seenIds"]) ? saved["seenIds"] : []),
        ...(Array.isArray(saved["claimedPrizeIds"]) ? saved["claimedPrizeIds"] : []),
      ];
  const offeredOneOffIds = Array.from(
    new Set(
      ids.filter(
        (id): id is number =>
          Number.isSafeInteger(id) &&
          ONE_OFF_NEWS_IDS.includes(id as (typeof ONE_OFF_NEWS_IDS)[number]),
      ),
    ),
  );
  return {
    ...createInitialNewsTickerProgress(),
    ...saved,
    offeredOneOffIds,
  } as unknown as NewsTickerProgress;
}

function legacyManuscriptClueHistory(megastructuresValue: unknown, newsTickerValue: unknown) {
  const megastructures =
    megastructuresValue &&
    typeof megastructuresValue === "object" &&
    !Array.isArray(megastructuresValue)
      ? (megastructuresValue as Record<string, unknown>)
      : {};
  const records = Array.isArray(megastructures["ancientManuscripts"])
    ? megastructures["ancientManuscripts"]
    : [];
  const manuscriptSystemIds = new Set(
    records.flatMap((raw) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
      const id = (raw as Record<string, unknown>)["manuscriptSystemId"];
      return isSystemId(id) ? [id] : [];
    }),
  );
  const history: Record<string, number[]> = {};
  const addShown = (systemId: unknown, clueId: unknown) => {
    if (
      !isSystemId(systemId) ||
      !manuscriptSystemIds.has(systemId) ||
      !Number.isSafeInteger(clueId) ||
      !MANUSCRIPT_CLUE_NEWS_IDS.includes(clueId as ManuscriptClueNewsId)
    )
      return;
    const ids = (history[systemId] ??= []);
    if (!ids.includes(clueId as number)) ids.push(clueId as number);
  };

  const savedHistory = megastructures["manuscriptCluesShown"];
  if (savedHistory && typeof savedHistory === "object" && !Array.isArray(savedHistory)) {
    for (const [systemId, rawIds] of Object.entries(savedHistory)) {
      if (Array.isArray(rawIds)) for (const id of rawIds) addShown(systemId, id);
    }
  }

  const newsTicker =
    newsTickerValue && typeof newsTickerValue === "object" && !Array.isArray(newsTickerValue)
      ? (newsTickerValue as Record<string, unknown>)
      : {};
  const entries = Array.isArray(newsTicker["entries"]) ? newsTicker["entries"] : [];
  for (const raw of entries) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const entry = raw as Record<string, unknown>;
    if (entry["category"] === "manuscriptClue") addShown(entry["clueSystemId"], entry["id"]);
  }
  return history as MegastructureProgress["manuscriptCluesShown"];
}

function validManuscriptClueHistory(
  value: unknown,
  manuscripts: readonly AncientManuscriptRecord[],
): value is MegastructureProgress["manuscriptCluesShown"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const manuscriptSystemIds = new Set(
    (manuscripts as readonly unknown[]).flatMap((raw) => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
      const systemId = (raw as Record<string, unknown>)["manuscriptSystemId"];
      return isSystemId(systemId) ? [systemId] : [];
    }),
  );
  const entries = Object.entries(value);
  return (
    entries.length <= 4 &&
    entries.every(
      ([systemId, ids]) =>
        isSystemId(systemId) &&
        manuscriptSystemIds.has(systemId) &&
        Array.isArray(ids) &&
        ids.length <= MANUSCRIPT_CLUE_NEWS_IDS.length &&
        ids.every(
          (id) =>
            Number.isSafeInteger(id) &&
            MANUSCRIPT_CLUE_NEWS_IDS.includes(id as ManuscriptClueNewsId),
        ) &&
        new Set(ids).size === ids.length,
    )
  );
}

function validNewsTickerProgress(value: unknown): value is NewsTickerProgress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const progress = value as Partial<NewsTickerProgress>;
  const exact = (record: object, keys: readonly string[]) =>
    Object.keys(record).sort().join("|") === [...keys].sort().join("|");
  return (
    exact(value, [
      "remainingMs",
      "entries",
      "seenIds",
      "activatedWackyIds",
      "claimedPrizeIds",
      "offeredOneOffIds",
      "resourceStorageMultiplier",
      "compoundStorageMultiplier",
      "powerCapacityMultiplier",
      "powerPlantRateMultiplier",
      "autoBuyerRateMultiplier",
    ]) &&
    Number.isFinite(progress.remainingMs) &&
    progress.remainingMs! >= 0 &&
    progress.remainingMs! <= 75_000 &&
    Array.isArray(progress.entries) &&
    progress.entries.length <= 50 &&
    progress.entries.every(
      (entry) =>
        entry &&
        (exact(entry, ["id", "category", "textKey", "simulationMs", "prizeGoodId", "claimed"]) ||
          exact(entry, [
            "id",
            "category",
            "textKey",
            "simulationMs",
            "prizeGoodId",
            "prizeAmount",
            "clueSystemId",
            "claimed",
          ])) &&
        Number.isSafeInteger(entry.id) &&
        NEWS_CATEGORIES.includes(entry.category) &&
        typeof entry.textKey === "string" &&
        Number.isFinite(entry.simulationMs) &&
        entry.simulationMs >= 0 &&
        (entry.prizeGoodId === null || typeof entry.prizeGoodId === "string") &&
        (entry.prizeAmount === undefined ||
          entry.prizeAmount === null ||
          (Number.isFinite(entry.prizeAmount) &&
            entry.prizeAmount > 0 &&
            (entry.claimed || Number.isSafeInteger(entry.prizeAmount)))) &&
        (entry.clueSystemId === undefined ||
          entry.clueSystemId === null ||
          typeof entry.clueSystemId === "string") &&
        typeof entry.claimed === "boolean",
    ) &&
    [
      progress.seenIds,
      progress.activatedWackyIds,
      progress.claimedPrizeIds,
      progress.offeredOneOffIds,
    ].every(
      (ids) =>
        Array.isArray(ids) &&
        ids.length <= 500 &&
        ids.every(Number.isSafeInteger) &&
        new Set(ids).size === ids.length,
    ) &&
    progress.offeredOneOffIds!.every((id) =>
      ONE_OFF_NEWS_IDS.includes(id as (typeof ONE_OFF_NEWS_IDS)[number]),
    ) &&
    [
      progress.resourceStorageMultiplier,
      progress.compoundStorageMultiplier,
      progress.powerCapacityMultiplier,
      progress.powerPlantRateMultiplier,
      progress.autoBuyerRateMultiplier,
    ].every(
      (multiplier) =>
        Number.isFinite(multiplier) && Number(multiplier) >= 1 && Number(multiplier) <= 1_000_000,
    )
  );
}

function validCasinoStats(value: unknown): value is CasinoRunStats {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const expected = [
    "cpSpent",
    "doubleOrNothingPlayed",
    "doubleOrNothingWon",
    "wheelPlayed",
    "wheelWon",
    "wheelSpecialWon",
    "higherLowerPlayed",
    "higherLowerWon",
    "voidSeerPlayed",
    "voidSeerWon",
  ];
  const record = value as Record<string, unknown>;
  return (
    Object.keys(record).sort().join("|") === [...expected].sort().join("|") &&
    expected.every((key) => Number.isSafeInteger(record[key]) && Number(record[key]) >= 0) &&
    Number(record["doubleOrNothingWon"]) <= Number(record["doubleOrNothingPlayed"]) &&
    Number(record["wheelWon"]) <= Number(record["wheelPlayed"]) &&
    Number(record["wheelSpecialWon"]) <= Number(record["wheelWon"]) &&
    Number(record["higherLowerWon"]) <= Number(record["higherLowerPlayed"]) &&
    Number(record["voidSeerWon"]) <= Number(record["voidSeerPlayed"])
  );
}

function validCasinoState(value: unknown): value is CasinoState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const casino = value as Partial<CasinoState>;
  const expected = [
    "casinoPoints",
    "gamesWon",
    "baseWinProbability",
    "wheelSpecialPending",
    "higherLower",
    "nextHistoryId",
    "history",
    "lifetimeStats",
  ];
  if (
    Object.keys(value).sort().join("|") !== [...expected].sort().join("|") ||
    !Number.isSafeInteger(casino.casinoPoints) ||
    casino.casinoPoints! < 0 ||
    !Array.isArray(casino.gamesWon) ||
    casino.gamesWon.some((id) => !CASINO_GAME_IDS.includes(id)) ||
    new Set(casino.gamesWon).size !== casino.gamesWon.length ||
    !Number.isFinite(casino.baseWinProbability) ||
    casino.baseWinProbability! < 0 ||
    casino.baseWinProbability! > 1 ||
    typeof casino.wheelSpecialPending !== "boolean" ||
    !Number.isSafeInteger(casino.nextHistoryId) ||
    casino.nextHistoryId! < 1 ||
    !Array.isArray(casino.history) ||
    casino.history.length > 30 ||
    !validCasinoStats(casino.lifetimeStats)
  )
    return false;
  if (casino.higherLower !== null) {
    const round = casino.higherLower;
    if (
      !round ||
      typeof round !== "object" ||
      Object.keys(round).sort().join("|") !== "deck|index|prizeKey" ||
      !Array.isArray(round.deck) ||
      round.deck.length !== 9 ||
      !Number.isSafeInteger(round.index) ||
      round.index! < 0 ||
      round.index! > 8 ||
      (round.prizeKey !== null && typeof round.prizeKey !== "string")
    )
      return false;
    const cards = new Set<string>();
    for (let index = 0; index < round.deck.length; index += 1) {
      const card = round.deck[index];
      if (
        !card ||
        typeof card !== "object" ||
        Object.keys(card).sort().join("|") !== "rank|suit" ||
        !Number.isInteger(card.rank) ||
        card.rank < 2 ||
        card.rank > 14 ||
        !["clubs", "diamonds", "hearts", "spades"].includes(card.suit)
      )
        return false;
      const key = `${card.rank}:${card.suit}`;
      if (cards.has(key) || (index > 0 && round.deck[index - 1]?.rank === card.rank)) return false;
      cards.add(key);
    }
    if (round.index! < 2 !== (round.prizeKey === null)) return false;
  }
  let previousId = 0;
  for (const entry of casino.history) {
    if (
      !entry ||
      typeof entry !== "object" ||
      Object.keys(entry).sort().join("|") !== "cpAwarded|cpSpent|gameId|id|result" ||
      !Number.isSafeInteger(entry.id) ||
      entry.id <= previousId ||
      entry.id >= casino.nextHistoryId! ||
      !CASINO_GAME_IDS.includes(entry.gameId) ||
      typeof entry.result !== "string" ||
      entry.result.length > 160 ||
      !Number.isSafeInteger(entry.cpSpent) ||
      entry.cpSpent < 0 ||
      !Number.isSafeInteger(entry.cpAwarded) ||
      entry.cpAwarded < 0
    )
      return false;
    previousId = entry.id;
  }
  return true;
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
  const validSettingsShape = (record: object): boolean => {
    if (!record || typeof record !== "object" || Array.isArray(record)) return false;
    const actual = Object.keys(record);
    const allowed = new Set([
      "locale",
      "themeId",
      "currencyId",
      "notation",
      "soundEnabled",
      "reducedMotion",
      "newsTickerEnabled",
      "notificationsEnabled",
      "backgroundAudioEnabled",
      "soundEffectsEnabled",
      "backgroundAudioVolume",
      "soundEffectsVolume",
      "customPointerEnabled",
      "pointerTrailEnabled",
      "weatherEffectsEnabled",
    ]);
    return (
      ["locale", "themeId", "notation", "soundEnabled", "reducedMotion"].every((key) =>
        actual.includes(key),
      ) && actual.every((key) => allowed.has(key))
    );
  };
  if (!exactKeys(value, ["schemaVersion", "run", "permanent", "settings", "statistics"]))
    return false;
  const state = value as Partial<GameState>;
  if (
    state.schemaVersion !== 44 ||
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
      "researchPointsEarnedThisRun",
      "scienceKitsBuiltThisRun",
      "scienceClubsBuiltThisRun",
      "scienceLabsBuiltThisRun",
      "energyTripsThisRun",
      "basicPowerPlantsBuiltThisRun",
      "advancedPowerPlantsBuiltThisRun",
      "solarPowerPlantsBuiltThisRun",
      "sodiumIonBatteriesBuiltThisRun",
      "battery2BuiltThisRun",
      "battery3BuiltThisRun",
      "goods",
      "goodsProducedThisRun",
      "unlockedResources",
      "upgrades",
      "timers",
      "clock",
      "random",
      "economy",
      "space",
      "philosophyAbilityActive",
      "philosophyChoicePending",
      "expansionistExtraSystemIds",
      "marketLiquidatedThisRun",
      "marketLockdownRemainingMs",
      "casinoStats",
      "timeWarp",
      "blackHoleChargeReady",
      "blackHoleWarpActive",
      "achievements",
      "randomEvents",
      "newsTicker",
      "navigationAttentionIds",
      "navigationAttentionInitialized",
    ]) ||
    !exactKeys(permanent, [
      "rebirthCount",
      "navigationVisitedIds",
      "ascendencyPoints",
      "gloryPoints",
      "acquiredPerks",
      "philosophyId",
      "philosophyRepeatableRanks",
      "settledSystemIds",
      "oTypePowerPlantAssignments",
      "galacticMarket",
      "galacticCasino",
      "blackHole",
      "megastructures",
      "cosmicRip",
      "achievements",
    ]) ||
    !validSettingsShape(settings) ||
    !exactKeys(statistics, [
      "lifetimeCashEarned",
      "lifetimeGoodsProduced",
      "lifetimeGoodsProducedByGood",
      "lifetimeResearchPointsEarned",
      "lifetimeScienceKitsBuilt",
      "lifetimeScienceClubsBuilt",
      "lifetimeScienceLabsBuilt",
      "lifetimeEnergyTrips",
      "lifetimeBasicPowerPlantsBuilt",
      "lifetimeAdvancedPowerPlantsBuilt",
      "lifetimeSolarPowerPlantsBuilt",
      "lifetimeSodiumIonBatteriesBuilt",
      "lifetimeBattery2Built",
      "lifetimeBattery3Built",
      "lifetimeAntimatterMined",
      "lifetimeAscendencyPointsGained",
      "lifetimeGalacticPointsSpent",
      "lifetimeCosmicRipTelemetryDataEarned",
      "lifetimeAsteroidsDiscovered",
      "lifetimeLegendaryAsteroidsDiscovered",
      "lifetimeAsteroidsMined",
      "lifetimeRocketsBuilt",
      "lifetimeRocketsLaunched",
      "lifetimeStarshipsLaunched",
      "lifetimeStarshipDistanceTravelled",
      "lifetimeActiveMs",
      "acceptedCommands",
      "completedTimers",
      "lifetimeRandomEventCounts",
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
      "starshipDistanceTravelledThisRun",
      "launchPadBuilt",
      "asteroids",
      "asteroidsMinedThisRun",
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
      "travelDistanceLy",
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
    !exactKeys(run.goods, ECONOMIC_GOOD_IDS) ||
    !validGoodProductionCounts(run.goodsProducedThisRun) ||
    !validGoodProductionCounts(statistics.lifetimeGoodsProducedByGood) ||
    !validRandomEventProgress(run.randomEvents) ||
    !validNewsTickerProgress(run.newsTicker) ||
    !Array.isArray(run.navigationAttentionIds) ||
    run.navigationAttentionIds.some((id) => typeof id !== "string" || id.length === 0) ||
    new Set(run.navigationAttentionIds).size !== run.navigationAttentionIds.length ||
    !Array.isArray(permanent.navigationVisitedIds) ||
    permanent.navigationVisitedIds.some((id) => typeof id !== "string" || id.length === 0) ||
    new Set(permanent.navigationVisitedIds).size !== permanent.navigationVisitedIds.length ||
    typeof run.navigationAttentionInitialized !== "boolean"
  )
    return false;
  if (
    typeof run.pioneerName !== "string" ||
    typeof run.hydrogenAutobuyerEnabled !== "boolean" ||
    !Number.isFinite(run.cash) ||
    run.cash < 0 ||
    !Number.isFinite(run.researchPoints) ||
    run.researchPoints < 0 ||
    !Number.isFinite(run.researchPointsEarnedThisRun) ||
    run.researchPointsEarnedThisRun < 0 ||
    !Number.isSafeInteger(run.scienceKitsBuiltThisRun) ||
    run.scienceKitsBuiltThisRun < 0 ||
    !Number.isSafeInteger(run.scienceClubsBuiltThisRun) ||
    run.scienceClubsBuiltThisRun < 0 ||
    !Number.isSafeInteger(run.scienceLabsBuiltThisRun) ||
    run.scienceLabsBuiltThisRun < 0 ||
    !Number.isSafeInteger(run.energyTripsThisRun) ||
    run.energyTripsThisRun < 0 ||
    !Number.isSafeInteger(run.basicPowerPlantsBuiltThisRun) ||
    run.basicPowerPlantsBuiltThisRun < 0 ||
    !Number.isSafeInteger(run.advancedPowerPlantsBuiltThisRun) ||
    run.advancedPowerPlantsBuiltThisRun < 0 ||
    !Number.isSafeInteger(run.solarPowerPlantsBuiltThisRun) ||
    run.solarPowerPlantsBuiltThisRun < 0 ||
    !Number.isSafeInteger(run.sodiumIonBatteriesBuiltThisRun) ||
    run.sodiumIonBatteriesBuiltThisRun < 0 ||
    !Number.isSafeInteger(run.battery2BuiltThisRun) ||
    run.battery2BuiltThisRun < 0 ||
    !Number.isSafeInteger(run.battery3BuiltThisRun) ||
    run.battery3BuiltThisRun < 0 ||
    typeof run.goods !== "object" ||
    run.goods === null ||
    !Array.isArray(run.unlockedResources) ||
    !Array.isArray(run.economy.unlockedCompounds) ||
    !Array.isArray(run.economy.researchedTechnologies) ||
    !Array.isArray(run.economy.revealedTechnologies) ||
    typeof run.economy.researchAutobuyerEnabled !== "boolean" ||
    typeof run.philosophyAbilityActive !== "boolean" ||
    typeof run.philosophyChoicePending !== "boolean" ||
    (run.philosophyChoicePending && permanent.philosophyId !== null) ||
    (run.philosophyAbilityActive && permanent.philosophyId === null) ||
    !Array.isArray(run.expansionistExtraSystemIds) ||
    run.expansionistExtraSystemIds.length > 3 ||
    !run.expansionistExtraSystemIds.every(isSystemId) ||
    new Set(run.expansionistExtraSystemIds).size !== run.expansionistExtraSystemIds.length ||
    !Array.isArray(permanent.settledSystemIds) ||
    run.expansionistExtraSystemIds.some((id) => permanent.settledSystemIds.includes(id)) ||
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
    !Number.isFinite(run.space.starshipDistanceTravelledThisRun) ||
    run.space.starshipDistanceTravelledThisRun < 0 ||
    typeof run.space.launchPadBuilt !== "boolean" ||
    !Number.isSafeInteger(run.space.asteroidsMinedThisRun) ||
    run.space.asteroidsMinedThisRun < 0 ||
    !Array.isArray(run.space.asteroids) ||
    !Array.isArray(run.space.systemProfiles) ||
    run.space.systemProfiles.length > 100 ||
    !permanent.megastructures ||
    !exactKeys(permanent.megastructures, [
      "ancientManuscripts",
      "manuscriptCluesShown",
      "researchedTechnologyIds",
      "manuscriptRewardClaimed",
      "conquestRewardClaimed",
      "forceFieldRewardClaimed",
      "miaplacidusStoryPending",
      "miaplacidusStoryShown",
    ]) ||
    !Array.isArray(permanent.megastructures.ancientManuscripts) ||
    permanent.megastructures.ancientManuscripts.length > 4 ||
    !validManuscriptClueHistory(
      permanent.megastructures.manuscriptCluesShown,
      permanent.megastructures.ancientManuscripts,
    ) ||
    !Array.isArray(permanent.megastructures.researchedTechnologyIds) ||
    permanent.megastructures.researchedTechnologyIds.length > MEGASTRUCTURE_TECHNOLOGY_IDS.length ||
    permanent.megastructures.researchedTechnologyIds.some(
      (id) => !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(id),
    ) ||
    new Set(permanent.megastructures.researchedTechnologyIds).size !==
      permanent.megastructures.researchedTechnologyIds.length ||
    typeof permanent.megastructures.manuscriptRewardClaimed !== "boolean" ||
    typeof permanent.megastructures.conquestRewardClaimed !== "boolean" ||
    typeof permanent.megastructures.forceFieldRewardClaimed !== "boolean" ||
    typeof permanent.megastructures.miaplacidusStoryPending !== "boolean" ||
    typeof permanent.megastructures.miaplacidusStoryShown !== "boolean" ||
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
  for (const record of permanent.megastructures.ancientManuscripts) {
    if (
      !record ||
      !exactKeys(record, [
        "position",
        "manuscriptSystemId",
        "factorySystemId",
        "megastructureId",
        "reported",
      ]) ||
      !Number.isSafeInteger(record.position) ||
      record.position < 1 ||
      record.position > 4 ||
      manuscriptPositions.has(record.position) ||
      !isSystemId(record.manuscriptSystemId) ||
      manuscriptSites.has(record.manuscriptSystemId) ||
      !isSystemId(record.factorySystemId) ||
      factorySites.has(record.factorySystemId) ||
      !MEGASTRUCTURE_IDS.includes(record.megastructureId) ||
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
    (starship.travelDistanceLy !== null &&
      (!Number.isFinite(starship.travelDistanceLy) || starship.travelDistanceLy < 0)) ||
    (starship.phase === "unlaunched" &&
      (starship.timerId !== null ||
        starship.durationMs !== 0 ||
        starship.antimatterSpent !== 0 ||
        starship.travelDistanceLy !== null)) ||
    (starship.phase !== "unlaunched" &&
      (starship.destinationSystemId === null ||
        starship.durationMs <= 0 ||
        starship.antimatterSpent <= 0)) ||
    (starship.phase === "orbiting" && starship.travelDistanceLy !== null) ||
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
  if (
    typeof run.marketLiquidatedThisRun !== "boolean" ||
    !Number.isFinite(run.marketLockdownRemainingMs) ||
    run.marketLockdownRemainingMs < 0 ||
    !validCasinoStats(run.casinoStats) ||
    !run.timeWarp ||
    Object.keys(run.timeWarp).sort().join("|") !== "multiplier|remainingMs" ||
    !Number.isFinite(run.timeWarp.multiplier) ||
    run.timeWarp.multiplier <= 0 ||
    run.timeWarp.multiplier > 1_000_000 ||
    !Number.isFinite(run.timeWarp.remainingMs) ||
    run.timeWarp.remainingMs < 0 ||
    typeof run.blackHoleChargeReady !== "boolean" ||
    typeof run.blackHoleWarpActive !== "boolean" ||
    (run.blackHoleWarpActive && run.timeWarp.remainingMs <= 0) ||
    !validGalacticMarketState(permanent.galacticMarket) ||
    !validCasinoState(permanent.galacticCasino) ||
    !validBlackHoleProgress(permanent.blackHole) ||
    !validCosmicRipProgress(permanent.cosmicRip) ||
    !validAchievementProgress(run.achievements) ||
    !validAchievementProgress(permanent.achievements, true)
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
    permanent.philosophyRepeatableRanks !== null &&
    typeof permanent.philosophyRepeatableRanks === "object" &&
    !Array.isArray(permanent.philosophyRepeatableRanks) &&
    exactKeys(permanent.philosophyRepeatableRanks, PHILOSOPHY_REPEATABLE_IDS) &&
    PHILOSOPHY_REPEATABLE_IDS.every(
      (repeatableId) =>
        Number.isSafeInteger(permanent.philosophyRepeatableRanks[repeatableId]) &&
        permanent.philosophyRepeatableRanks[repeatableId] >= 0,
    ) &&
    LOCALE_IDS.includes(settings.locale) &&
    isThemeId(settings.themeId) &&
    (settings.currencyId === undefined || isCurrencyId(settings.currencyId)) &&
    (settings.notation === "condensed" ||
      settings.notation === "standard" ||
      settings.notation === "scientific") &&
    typeof settings.soundEnabled === "boolean" &&
    (settings.backgroundAudioEnabled === undefined ||
      typeof settings.backgroundAudioEnabled === "boolean") &&
    (settings.soundEffectsEnabled === undefined ||
      typeof settings.soundEffectsEnabled === "boolean") &&
    (settings.backgroundAudioVolume === undefined ||
      (Number.isFinite(settings.backgroundAudioVolume) &&
        settings.backgroundAudioVolume >= 0 &&
        settings.backgroundAudioVolume <= 1)) &&
    (settings.soundEffectsVolume === undefined ||
      (Number.isFinite(settings.soundEffectsVolume) &&
        settings.soundEffectsVolume >= 0 &&
        settings.soundEffectsVolume <= 1)) &&
    (settings.customPointerEnabled === undefined ||
      typeof settings.customPointerEnabled === "boolean") &&
    (settings.pointerTrailEnabled === undefined ||
      typeof settings.pointerTrailEnabled === "boolean") &&
    (settings.weatherEffectsEnabled === undefined ||
      typeof settings.weatherEffectsEnabled === "boolean") &&
    typeof settings.reducedMotion === "boolean" &&
    (settings.newsTickerEnabled === undefined || typeof settings.newsTickerEnabled === "boolean") &&
    (settings.notificationsEnabled === undefined ||
      typeof settings.notificationsEnabled === "boolean") &&
    Number.isFinite(statistics.lifetimeCashEarned) &&
    statistics.lifetimeCashEarned >= 0 &&
    Number.isFinite(statistics.lifetimeGoodsProduced) &&
    statistics.lifetimeGoodsProduced >= 0 &&
    Number.isFinite(statistics.lifetimeResearchPointsEarned) &&
    statistics.lifetimeResearchPointsEarned >= run.researchPointsEarnedThisRun &&
    Number.isSafeInteger(statistics.lifetimeScienceKitsBuilt) &&
    statistics.lifetimeScienceKitsBuilt >= run.scienceKitsBuiltThisRun &&
    Number.isSafeInteger(statistics.lifetimeScienceClubsBuilt) &&
    statistics.lifetimeScienceClubsBuilt >= run.scienceClubsBuiltThisRun &&
    Number.isSafeInteger(statistics.lifetimeScienceLabsBuilt) &&
    statistics.lifetimeScienceLabsBuilt >= run.scienceLabsBuiltThisRun &&
    Number.isSafeInteger(statistics.lifetimeEnergyTrips) &&
    statistics.lifetimeEnergyTrips >= run.energyTripsThisRun &&
    Number.isSafeInteger(statistics.lifetimeBasicPowerPlantsBuilt) &&
    statistics.lifetimeBasicPowerPlantsBuilt >= run.basicPowerPlantsBuiltThisRun &&
    Number.isSafeInteger(statistics.lifetimeAdvancedPowerPlantsBuilt) &&
    statistics.lifetimeAdvancedPowerPlantsBuilt >= run.advancedPowerPlantsBuiltThisRun &&
    Number.isSafeInteger(statistics.lifetimeSolarPowerPlantsBuilt) &&
    statistics.lifetimeSolarPowerPlantsBuilt >= run.solarPowerPlantsBuiltThisRun &&
    Number.isSafeInteger(statistics.lifetimeSodiumIonBatteriesBuilt) &&
    statistics.lifetimeSodiumIonBatteriesBuilt >= run.sodiumIonBatteriesBuiltThisRun &&
    Number.isSafeInteger(statistics.lifetimeBattery2Built) &&
    statistics.lifetimeBattery2Built >= run.battery2BuiltThisRun &&
    Number.isSafeInteger(statistics.lifetimeBattery3Built) &&
    statistics.lifetimeBattery3Built >= run.battery3BuiltThisRun &&
    Number.isFinite(statistics.lifetimeAntimatterMined) &&
    statistics.lifetimeAntimatterMined >= 0 &&
    statistics.lifetimeAntimatterMined >= run.space.antimatterMinedThisRun &&
    Number.isSafeInteger(statistics.lifetimeAscendencyPointsGained) &&
    statistics.lifetimeAscendencyPointsGained >= 0 &&
    Number.isSafeInteger(statistics.lifetimeGalacticPointsSpent) &&
    statistics.lifetimeGalacticPointsSpent >= 0 &&
    Number.isFinite(statistics.lifetimeCosmicRipTelemetryDataEarned) &&
    statistics.lifetimeCosmicRipTelemetryDataEarned >= 0 &&
    Number.isSafeInteger(statistics.lifetimeAsteroidsDiscovered) &&
    statistics.lifetimeAsteroidsDiscovered >= 0 &&
    Number.isSafeInteger(statistics.lifetimeLegendaryAsteroidsDiscovered) &&
    statistics.lifetimeLegendaryAsteroidsDiscovered >= 0 &&
    statistics.lifetimeLegendaryAsteroidsDiscovered <= statistics.lifetimeAsteroidsDiscovered &&
    Number.isSafeInteger(statistics.lifetimeAsteroidsMined) &&
    statistics.lifetimeAsteroidsMined >= 0 &&
    statistics.lifetimeAsteroidsMined >= run.space.asteroidsMinedThisRun &&
    Number.isSafeInteger(statistics.lifetimeRocketsBuilt) &&
    statistics.lifetimeRocketsBuilt >= 0 &&
    Number.isSafeInteger(statistics.lifetimeRocketsLaunched) &&
    statistics.lifetimeRocketsLaunched >= 0 &&
    Number.isSafeInteger(statistics.lifetimeStarshipsLaunched) &&
    statistics.lifetimeStarshipsLaunched >= 0 &&
    Number.isFinite(statistics.lifetimeStarshipDistanceTravelled) &&
    statistics.lifetimeStarshipDistanceTravelled >= run.space.starshipDistanceTravelledThisRun &&
    Number.isFinite(statistics.lifetimeActiveMs) &&
    statistics.lifetimeActiveMs >= 0 &&
    Number.isSafeInteger(statistics.acceptedCommands) &&
    statistics.acceptedCommands >= 0 &&
    Number.isSafeInteger(statistics.completedTimers) &&
    statistics.completedTimers >= 0 &&
    validRandomEventCounts(statistics.lifetimeRandomEventCounts)
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
  const { ancientManuscripts: legacyManuscripts, ...spaceWithoutManuscripts } = spaceState;
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
  const legacyStructureByPosition = [
    "celestialProcessingCore",
    "plasmaForge",
    "galacticMemoryArchive",
    "dysonSphere",
  ] as const;
  const ancientManuscripts = Array.isArray(legacyManuscripts)
    ? legacyManuscripts.slice(0, 4).flatMap((rawRecord, index) => {
        if (!rawRecord || typeof rawRecord !== "object" || Array.isArray(rawRecord)) return [];
        const record = rawRecord as Record<string, unknown>;
        const position = record["position"];
        const manuscriptSystemId = record["manuscriptSystemId"];
        const factorySystemId = record["factorySystemId"];
        if (
          !Number.isSafeInteger(position) ||
          Number(position) < 1 ||
          Number(position) > 4 ||
          !isSystemId(manuscriptSystemId) ||
          !isSystemId(factorySystemId) ||
          manuscriptSystemId === factorySystemId
        ) {
          return [];
        }
        const positionNumber = Number(position) as 1 | 2 | 3 | 4;
        const megastructureId = MEGASTRUCTURE_IDS.includes(
          record["megastructureId"] as (typeof MEGASTRUCTURE_IDS)[number],
        )
          ? (record["megastructureId"] as (typeof MEGASTRUCTURE_IDS)[number])
          : (legacyStructureByPosition[positionNumber - 1] ?? legacyStructureByPosition[index]!);
        return [
          {
            position: positionNumber,
            manuscriptSystemId,
            factorySystemId,
            megastructureId,
            reported: record["reported"] === true,
          },
        ];
      })
    : [];
  const legacyResearchedTechs =
    runState["economy"] && typeof runState["economy"] === "object"
      ? (runState["economy"] as Record<string, unknown>)["researchedTechnologies"]
      : undefined;
  const researchedTechnologyIds = Array.isArray(legacyResearchedTechs)
    ? [
        ...new Set(
          legacyResearchedTechs.filter((id): id is TechId =>
            MEGASTRUCTURE_TECHNOLOGY_IDS.includes(id as TechId),
          ),
        ),
      ]
    : [];
  const megastructures: MegastructureProgress = {
    ancientManuscripts,
    manuscriptCluesShown: {},
    researchedTechnologyIds,
    manuscriptRewardClaimed: false,
    conquestRewardClaimed: false,
    forceFieldRewardClaimed: false,
    miaplacidusStoryPending: false,
    miaplacidusStoryShown: false,
  };
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
  const settingsState =
    value["settings"] && typeof value["settings"] === "object" && !Array.isArray(value["settings"])
      ? (value["settings"] as Record<string, unknown>)
      : {};
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
    schemaVersion: 31,
    run: {
      ...runState,
      timers: weatherTimers,
      philosophyAbilityActive: runState["philosophyAbilityActive"] ?? false,
      philosophyChoicePending:
        typeof runState["philosophyChoicePending"] === "boolean"
          ? runState["philosophyChoicePending"]
          : permanentState["philosophyId"] == null && starStudyRange > 0,
      expansionistExtraSystemIds: Array.isArray(runState["expansionistExtraSystemIds"])
        ? runState["expansionistExtraSystemIds"].filter(isSystemId).slice(0, 3)
        : [],
      marketLiquidatedThisRun: runState["marketLiquidatedThisRun"] ?? false,
      marketLockdownRemainingMs: runState["marketLockdownRemainingMs"] ?? 0,
      casinoStats: runState["casinoStats"] ?? createInitialCasinoRunStats(),
      timeWarp: runState["timeWarp"] ?? { multiplier: 1, remainingMs: 0 },
      blackHoleChargeReady: runState["blackHoleChargeReady"] ?? false,
      blackHoleWarpActive: runState["blackHoleWarpActive"] ?? false,
      achievements: runState["achievements"] ?? createInitialRunAchievementProgress(),
      randomEvents: runState["randomEvents"] ?? createInitialRandomEventProgress(),
      newsTicker: addLegacyOneOffOffers(runState["newsTicker"]),
      space: {
        ...spaceWithoutManuscripts,
        systemProfiles,
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
      philosophyRepeatableRanks: Object.fromEntries(
        PHILOSOPHY_REPEATABLE_IDS.map((repeatableId) => {
          const ranks = permanentState["philosophyRepeatableRanks"];
          const rank =
            ranks !== null && typeof ranks === "object" && !Array.isArray(ranks)
              ? (ranks as Record<string, unknown>)[repeatableId]
              : undefined;
          return [
            repeatableId,
            typeof rank === "number" && Number.isSafeInteger(rank) && rank >= 0 ? rank : 0,
          ];
        }),
      ),
      settledSystemIds,
      oTypePowerPlantAssignments,
      galacticMarket:
        (permanentState["galacticMarket"] as GalacticMarketState | undefined) ??
        createInitialGalacticMarketState(),
      galacticCasino: permanentState["galacticCasino"] ?? createInitialCasinoState(),
      blackHole: permanentState["blackHole"] ?? createInitialBlackHoleProgress(),
      megastructures,
      cosmicRip: createInitialCosmicRipProgress(),
      achievements: (() => {
        const saved = permanentState["achievements"];
        const themeId = isThemeId(settingsState["themeId"])
          ? settingsState["themeId"]
          : DEFAULT_THEME_ID;
        if (!saved || typeof saved !== "object" || Array.isArray(saved))
          return createInitialPermanentAchievementProgress();
        const achievement = saved as Record<string, unknown>;
        return {
          ...achievement,
          themeIdsTried: Array.isArray(achievement["themeIdsTried"])
            ? achievement["themeIdsTried"]
            : [themeId],
        };
      })(),
    },
    settings: {
      ...settingsState,
      themeId: isThemeId(settingsState["themeId"]) ? settingsState["themeId"] : DEFAULT_THEME_ID,
      currencyId: isCurrencyId(settingsState["currencyId"]) ? settingsState["currencyId"] : "usd",
    },
    statistics: {
      ...statisticsState,
      lifetimeAntimatterMined: statisticsState["lifetimeAntimatterMined"] ?? antimatter,
      lifetimeActiveMs: statisticsState["lifetimeActiveMs"] ?? 0,
    },
  } as unknown as GameState;
  return upgradeMetaSignalsAndThemes(upgraded as unknown as Record<string, unknown>);
}

function legacyStarshipTravelDistance(space: Record<string, unknown>): number | null {
  const rawStarship = space["starship"];
  if (!rawStarship || typeof rawStarship !== "object" || Array.isArray(rawStarship)) return null;
  const starship = rawStarship as Record<string, unknown>;
  if (starship["phase"] !== "travelling" || typeof starship["destinationSystemId"] !== "string")
    return null;
  const catalogue = createStarCatalogue(GALAXY_SEED_DEFAULT);
  const currentSystemId = space["currentSystemId"];
  const origin =
    typeof currentSystemId === "string"
      ? catalogue.find(
          (star) =>
            star.id === currentSystemId ||
            star.name.toLocaleLowerCase("en") === currentSystemId.toLocaleLowerCase("en"),
        )
      : undefined;
  const destination = catalogue.find((star) => star.id === starship["destinationSystemId"]);
  return origin && destination ? distanceBetweenStars(origin, destination) : null;
}

function upgradeMetaSignalsAndThemes(value: Record<string, unknown>): GameState | null {
  const run = value["run"];
  const permanent = value["permanent"];
  const settings = value["settings"];
  const statistics = value["statistics"];
  if (
    !run ||
    typeof run !== "object" ||
    Array.isArray(run) ||
    !permanent ||
    typeof permanent !== "object" ||
    Array.isArray(permanent) ||
    !settings ||
    typeof settings !== "object" ||
    Array.isArray(settings) ||
    !statistics ||
    typeof statistics !== "object" ||
    Array.isArray(statistics)
  )
    return null;
  const runState = run as Record<string, unknown>;
  const permanentState = permanent as Record<string, unknown>;
  const settingsState = settings as Record<string, unknown>;
  const statisticsState = statistics as Record<string, unknown>;
  const savedSpace = runState["space"];
  const spaceState =
    savedSpace && typeof savedSpace === "object" && !Array.isArray(savedSpace)
      ? (savedSpace as Record<string, unknown>)
      : {};
  const starshipState =
    spaceState["starship"] &&
    typeof spaceState["starship"] === "object" &&
    !Array.isArray(spaceState["starship"])
      ? (spaceState["starship"] as Record<string, unknown>)
      : (createInitialSpaceState().starship as unknown as Record<string, unknown>);
  const themeId = isThemeId(settingsState["themeId"]) ? settingsState["themeId"] : DEFAULT_THEME_ID;
  const achievement = permanentState["achievements"];
  const randomEvents = runState["randomEvents"];
  const randomEventState =
    randomEvents && typeof randomEvents === "object" && !Array.isArray(randomEvents)
      ? (randomEvents as Record<string, unknown>)
      : {};
  const randomEventHistory = Array.isArray(randomEventState["history"])
    ? randomEventState["history"]
    : [];
  const activeEffects =
    randomEvents &&
    typeof randomEvents === "object" &&
    Array.isArray((randomEvents as Record<string, unknown>)["activeEffects"])
      ? (
          (randomEvents as Record<string, unknown>)["activeEffects"] as readonly Record<
            string,
            unknown
          >[]
        ).map((effect) => ({
          ...effect,
          nextShiftInMs: effect["id"] === "blackHoleInstability" ? 60_000 : 0,
        }))
      : [];
  const candidate = {
    ...value,
    schemaVersion: 44,
    settings: {
      ...settingsState,
      themeId,
      currencyId: isCurrencyId(settingsState["currencyId"]) ? settingsState["currencyId"] : "usd",
    },
    run: {
      ...runState,
      researchPointsEarnedThisRun:
        Number.isFinite(runState["researchPointsEarnedThisRun"]) &&
        Number(runState["researchPointsEarnedThisRun"]) >= 0
          ? Number(runState["researchPointsEarnedThisRun"])
          : 0,
      scienceKitsBuiltThisRun:
        Number.isSafeInteger(runState["scienceKitsBuiltThisRun"]) &&
        Number(runState["scienceKitsBuiltThisRun"]) >= 0
          ? Number(runState["scienceKitsBuiltThisRun"])
          : 0,
      scienceClubsBuiltThisRun:
        Number.isSafeInteger(runState["scienceClubsBuiltThisRun"]) &&
        Number(runState["scienceClubsBuiltThisRun"]) >= 0
          ? Number(runState["scienceClubsBuiltThisRun"])
          : 0,
      scienceLabsBuiltThisRun:
        Number.isSafeInteger(runState["scienceLabsBuiltThisRun"]) &&
        Number(runState["scienceLabsBuiltThisRun"]) >= 0
          ? Number(runState["scienceLabsBuiltThisRun"])
          : 0,
      energyTripsThisRun: 0,
      basicPowerPlantsBuiltThisRun: 0,
      advancedPowerPlantsBuiltThisRun: 0,
      solarPowerPlantsBuiltThisRun: 0,
      sodiumIonBatteriesBuiltThisRun: 0,
      battery2BuiltThisRun: 0,
      battery3BuiltThisRun: 0,
      goodsProducedThisRun: validGoodProductionCounts(runState["goodsProducedThisRun"])
        ? runState["goodsProducedThisRun"]
        : createGoodProductionCounts(),
      randomEvents:
        randomEvents && typeof randomEvents === "object"
          ? {
              ...randomEventState,
              activeEffects,
              eventCountsThisRun: validRandomEventCounts(randomEventState["eventCountsThisRun"])
                ? randomEventState["eventCountsThisRun"]
                : createRandomEventCounts(randomEventHistory),
            }
          : createInitialRandomEventProgress(),
      navigationAttentionIds: Array.isArray(runState["navigationAttentionIds"])
        ? runState["navigationAttentionIds"].filter(
            (id): id is string => typeof id === "string" && id.length > 0,
          )
        : [],
      navigationAttentionInitialized: runState["navigationAttentionInitialized"] === true,
      newsTicker: addLegacyOneOffOffers(runState["newsTicker"]),
      space: {
        ...spaceState,
        starshipDistanceTravelledThisRun: 0,
        starship: {
          ...starshipState,
          travelDistanceLy: legacyStarshipTravelDistance(spaceState),
        },
        asteroidsMinedThisRun:
          Number.isSafeInteger(spaceState["asteroidsMinedThisRun"]) &&
          Number(spaceState["asteroidsMinedThisRun"]) >= 0
            ? Number(spaceState["asteroidsMinedThisRun"])
            : 0,
      },
    },
    permanent: {
      ...permanentState,
      navigationVisitedIds: Array.isArray(permanentState["navigationVisitedIds"])
        ? [...new Set(
            (permanentState["navigationVisitedIds"] as unknown[]).filter(
              (id): id is string => typeof id === "string" && id.length > 0,
            ),
          )]
        : [],
      megastructures: (() => {
        const saved = permanentState["megastructures"];
        const megastructures =
          saved && typeof saved === "object" && !Array.isArray(saved)
            ? (saved as Record<string, unknown>)
            : {};
        return {
          ...createInitialMegastructureProgress(),
          ...megastructures,
          manuscriptCluesShown: legacyManuscriptClueHistory(megastructures, runState["newsTicker"]),
        };
      })(),
      achievements:
        achievement && typeof achievement === "object" && !Array.isArray(achievement)
          ? {
              ...(achievement as Record<string, unknown>),
              themeIdsTried: Array.isArray(
                (achievement as Record<string, unknown>)["themeIdsTried"],
              )
                ? (achievement as Record<string, unknown>)["themeIdsTried"]
                : [themeId],
            }
          : createInitialPermanentAchievementProgress(),
    },
    statistics: {
      ...statisticsState,
      lifetimeGoodsProducedByGood: validGoodProductionCounts(
        statisticsState["lifetimeGoodsProducedByGood"],
      )
        ? statisticsState["lifetimeGoodsProducedByGood"]
        : createGoodProductionCounts(),
      lifetimeResearchPointsEarned:
        Number.isFinite(statisticsState["lifetimeResearchPointsEarned"]) &&
        Number(statisticsState["lifetimeResearchPointsEarned"]) >= 0
          ? Number(statisticsState["lifetimeResearchPointsEarned"])
          : 0,
      lifetimeScienceKitsBuilt:
        Number.isSafeInteger(statisticsState["lifetimeScienceKitsBuilt"]) &&
        Number(statisticsState["lifetimeScienceKitsBuilt"]) >= 0
          ? Number(statisticsState["lifetimeScienceKitsBuilt"])
          : 0,
      lifetimeScienceClubsBuilt:
        Number.isSafeInteger(statisticsState["lifetimeScienceClubsBuilt"]) &&
        Number(statisticsState["lifetimeScienceClubsBuilt"]) >= 0
          ? Number(statisticsState["lifetimeScienceClubsBuilt"])
          : 0,
      lifetimeScienceLabsBuilt:
        Number.isSafeInteger(statisticsState["lifetimeScienceLabsBuilt"]) &&
        Number(statisticsState["lifetimeScienceLabsBuilt"]) >= 0
          ? Number(statisticsState["lifetimeScienceLabsBuilt"])
          : 0,
      lifetimeEnergyTrips: 0,
      lifetimeBasicPowerPlantsBuilt: 0,
      lifetimeAdvancedPowerPlantsBuilt: 0,
      lifetimeSolarPowerPlantsBuilt: 0,
      lifetimeSodiumIonBatteriesBuilt: 0,
      lifetimeBattery2Built: 0,
      lifetimeBattery3Built: 0,
      lifetimeRandomEventCounts: validRandomEventCounts(
        statisticsState["lifetimeRandomEventCounts"],
      )
        ? statisticsState["lifetimeRandomEventCounts"]
        : createRandomEventCounts(),
      lifetimeAscendencyPointsGained: statisticsState["lifetimeAscendencyPointsGained"] ?? 0,
      lifetimeGalacticPointsSpent: statisticsState["lifetimeGalacticPointsSpent"] ?? 0,
      lifetimeCosmicRipTelemetryDataEarned:
        statisticsState["lifetimeCosmicRipTelemetryDataEarned"] ?? 0,
      lifetimeAsteroidsDiscovered: statisticsState["lifetimeAsteroidsDiscovered"] ?? 0,
      lifetimeLegendaryAsteroidsDiscovered:
        statisticsState["lifetimeLegendaryAsteroidsDiscovered"] ?? 0,
      lifetimeAsteroidsMined: statisticsState["lifetimeAsteroidsMined"] ?? 0,
      lifetimeRocketsBuilt: statisticsState["lifetimeRocketsBuilt"] ?? 0,
      lifetimeRocketsLaunched: statisticsState["lifetimeRocketsLaunched"] ?? 0,
      lifetimeStarshipsLaunched: statisticsState["lifetimeStarshipsLaunched"] ?? 0,
      lifetimeStarshipDistanceTravelled: statisticsState["lifetimeStarshipDistanceTravelled"] ?? 0,
    },
  };
  return isValidGameState(candidate) ? (candidate as unknown as GameState) : null;
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

/** Adds persistent Galactic Market state and rebirth-local market flags in v21. */
export function upgradeGameStateV20(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 20) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds the saved Galactic Casino wallet, active round, history and counters in v22. */
export function upgradeGameStateV21(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 21) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds philosophy choice state and repeatable ranks introduced in v23. */
export function upgradeGameStateV22(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 22) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Moves manuscript discoveries to permanent scope and adds durable megastructure ownership. */
export function upgradeGameStateV24(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 24) return null;
  const candidate = upgradeToCurrentState(legacy);
  return candidate && isValidGameState(candidate) ? candidate : null;
}

/** Adds permanent Cosmic Rip progress to existing v25 saves. */
export function upgradeGameStateV25(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (
    legacy["schemaVersion"] !== 25 ||
    !legacy["permanent"] ||
    typeof legacy["permanent"] !== "object"
  )
    return null;
  const permanent = legacy["permanent"] as Record<string, unknown>;
  const run = legacy["run"] as Record<string, unknown>;
  const candidate = {
    ...legacy,
    schemaVersion: 30,
    statistics: { ...(legacy["statistics"] as Record<string, unknown>), lifetimeActiveMs: 0 },
    run: {
      ...run,
      achievements: createInitialRunAchievementProgress(),
      randomEvents: createInitialRandomEventProgress(),
      newsTicker: createInitialNewsTickerProgress(),
    },
    permanent: {
      ...permanent,
      cosmicRip: createInitialCosmicRipProgress(),
      achievements: createInitialPermanentAchievementProgress(),
    },
  };
  return upgradeMetaSignalsAndThemes(candidate);
}

/** Adds run and permanent achievement records to version 26 Cosmic Rip saves. */
export function upgradeGameStateV26(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (
    legacy["schemaVersion"] !== 26 ||
    !legacy["run"] ||
    typeof legacy["run"] !== "object" ||
    !legacy["permanent"] ||
    typeof legacy["permanent"] !== "object"
  )
    return null;
  const run = legacy["run"] as Record<string, unknown>;
  const permanent = legacy["permanent"] as Record<string, unknown>;
  const candidate = {
    ...legacy,
    schemaVersion: 30,
    statistics: { ...(legacy["statistics"] as Record<string, unknown>), lifetimeActiveMs: 0 },
    run: {
      ...run,
      achievements: createInitialRunAchievementProgress(),
      randomEvents: createInitialRandomEventProgress(),
      newsTicker: createInitialNewsTickerProgress(),
    },
    permanent: { ...permanent, achievements: createInitialPermanentAchievementProgress() },
  };
  return upgradeMetaSignalsAndThemes(candidate);
}

/** Adds persistent event and news history to version 27 achievement saves. */
export function upgradeGameStateV27(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 27 || !legacy["run"] || typeof legacy["run"] !== "object")
    return null;
  const run = legacy["run"] as Record<string, unknown>;
  const candidate = {
    ...legacy,
    schemaVersion: 30,
    statistics: { ...(legacy["statistics"] as Record<string, unknown>), lifetimeActiveMs: 0 },
    run: {
      ...run,
      randomEvents: createInitialRandomEventProgress(),
      newsTicker: createInitialNewsTickerProgress(),
    },
  };
  return upgradeMetaSignalsAndThemes(candidate);
}

/** Adds targeted random-event effects to version 28 event/news saves. */
export function upgradeGameStateV28(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 28 || !legacy["run"] || typeof legacy["run"] !== "object")
    return null;
  const run = legacy["run"] as Record<string, unknown>;
  const existing = run["randomEvents"] as Partial<RandomEventProgress> | undefined;
  const initial = createInitialRandomEventProgress();
  const activeEffects = Array.isArray(existing?.activeEffects)
    ? existing.activeEffects.map((raw) => {
        const effect = raw as Partial<RandomEventProgress["activeEffects"][number]>;
        return {
          ...effect,
          targetId: effect.targetId ?? null,
          powerMultiplier:
            effect.powerMultiplier ??
            (effect.id === "blackHoleInstability" ? (effect.multiplier ?? 1) : 1),
          durationMultiplier: effect.durationMultiplier ?? 1,
        };
      })
    : initial.activeEffects;
  const candidate = {
    ...legacy,
    schemaVersion: 30,
    statistics: { ...(legacy["statistics"] as Record<string, unknown>), lifetimeActiveMs: 0 },
    run: {
      ...run,
      randomEvents: { ...initial, ...existing, activeEffects },
    },
  };
  return upgradeMetaSignalsAndThemes(candidate);
}

/** Adds durable event counters to v31 saves. Older all-time event totals were not stored. */
export function upgradeGameStateV31(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 31) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds durable navigation attention IDs in v33; v32 saves start with no pending badges. */
export function upgradeGameStateV32(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 32) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds one-time first-access initialization in v34; v33 pending badges remain intact. */
export function upgradeGameStateV33(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 33) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds lifetime source Statistics counters to v34 saves. */
export function upgradeGameStateV34(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 34) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds scoped Space Mining counters to v35 saves. */
export function upgradeGameStateV35(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 35) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds per-good current-run and lifetime production counters to v36 saves. */
export function upgradeGameStateV36(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 36) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds lifetime Cosmic Rip resource counters to v37 saves without inferring old history. */
export function upgradeGameStateV37(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  const statistics = legacy["statistics"];
  if (
    legacy["schemaVersion"] !== 37 ||
    !statistics ||
    typeof statistics !== "object" ||
    Array.isArray(statistics)
  )
    return null;
  const candidate = {
    ...legacy,
    schemaVersion: 38,
    statistics: {
      ...(statistics as Record<string, unknown>),
      lifetimeGalacticPointsSpent: 0,
      lifetimeCosmicRipTelemetryDataEarned: 0,
    },
  };
  return upgradeGameStateV38(candidate);
}

/** Records v38 one-off offers separately from claims, preserving seen offers. */
export function upgradeGameStateV38(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 38) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds Research history counters to v39 saves without inferring past production or builds. */
export function upgradeGameStateV39(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 39) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds per-manuscript News Ticker clue history to v40 saves. */
export function upgradeGameStateV40(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 40) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds Energy Statistics history to v41 saves without inferring pre-v42 activity. */
export function upgradeGameStateV41(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  const run = legacy["run"];
  const statistics = legacy["statistics"];
  if (
    legacy["schemaVersion"] !== 41 ||
    !run ||
    typeof run !== "object" ||
    Array.isArray(run) ||
    !statistics ||
    typeof statistics !== "object" ||
    Array.isArray(statistics)
  )
    return null;
  const candidate = {
    ...legacy,
    schemaVersion: 42,
    run: {
      ...(run as Record<string, unknown>),
      energyTripsThisRun: 0,
      basicPowerPlantsBuiltThisRun: 0,
      advancedPowerPlantsBuiltThisRun: 0,
      solarPowerPlantsBuiltThisRun: 0,
      sodiumIonBatteriesBuiltThisRun: 0,
      battery2BuiltThisRun: 0,
      battery3BuiltThisRun: 0,
    },
    statistics: {
      ...(statistics as Record<string, unknown>),
      lifetimeEnergyTrips: 0,
      lifetimeBasicPowerPlantsBuilt: 0,
      lifetimeAdvancedPowerPlantsBuilt: 0,
      lifetimeSolarPowerPlantsBuilt: 0,
      lifetimeSodiumIonBatteriesBuilt: 0,
      lifetimeBattery2Built: 0,
      lifetimeBattery3Built: 0,
    },
  };
  return upgradeGameStateV42(candidate);
}

/** Adds Starship distance history to v42 saves without inferring completed journeys. */
export function upgradeGameStateV42(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  const run = legacy["run"];
  const permanent = legacy["permanent"];
  const statistics = legacy["statistics"];
  if (
    legacy["schemaVersion"] !== 42 ||
    !run ||
    typeof run !== "object" ||
    Array.isArray(run) ||
    !permanent ||
    typeof permanent !== "object" ||
    Array.isArray(permanent) ||
    !statistics ||
    typeof statistics !== "object" ||
    Array.isArray(statistics)
  )
    return null;
  const runState = run as Record<string, unknown>;
  const rawSpace = runState["space"];
  if (!rawSpace || typeof rawSpace !== "object" || Array.isArray(rawSpace)) return null;
  const space = rawSpace as Record<string, unknown>;
  const rawStarship = space["starship"];
  if (!rawStarship || typeof rawStarship !== "object" || Array.isArray(rawStarship)) return null;
  const candidate = {
    ...legacy,
    schemaVersion: 44,
    run: {
      ...runState,
      space: {
        ...space,
        starshipDistanceTravelledThisRun: 0,
        starship: {
          ...(rawStarship as Record<string, unknown>),
          travelDistanceLy: legacyStarshipTravelDistance(space),
        },
      },
    },
    statistics: {
      ...(statistics as Record<string, unknown>),
      lifetimeStarshipDistanceTravelled: 0,
    },
    permanent: {
      ...(permanent as Record<string, unknown>),
      navigationVisitedIds: [],
    },
  };
  return isValidGameState(candidate) ? (candidate as unknown as GameState) : null;
}

/** Adds save-wide navigation visit history to v43 saves. */
export function upgradeGameStateV43(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  const permanent = legacy["permanent"];
  if (
    legacy["schemaVersion"] !== 43 ||
    !permanent ||
    typeof permanent !== "object" ||
    Array.isArray(permanent)
  )
    return null;
  const permanentState = permanent as Record<string, unknown>;
  const candidate = {
    ...legacy,
    schemaVersion: 44,
    permanent: {
      ...permanentState,
      navigationVisitedIds: Array.isArray(permanentState["navigationVisitedIds"])
        ? [...new Set(
            (permanentState["navigationVisitedIds"] as unknown[]).filter(
              (id): id is string => typeof id === "string" && id.length > 0,
            ),
          )]
        : [],
    },
  };
  return isValidGameState(candidate) ? (candidate as unknown as GameState) : null;
}

/** Adds permanent theme history and minute-based instability timing to v30 saves. */
export function upgradeGameStateV30(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 30) return null;
  return upgradeMetaSignalsAndThemes(legacy);
}

/** Adds durable foreground active time for the 50-hour achievement in v30. */
export function upgradeGameStateV29(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (
    legacy["schemaVersion"] !== 29 ||
    !legacy["statistics"] ||
    typeof legacy["statistics"] !== "object" ||
    Array.isArray(legacy["statistics"])
  )
    return null;
  const statistics = legacy["statistics"] as Record<string, unknown>;
  const candidate = {
    ...legacy,
    schemaVersion: 30,
    statistics: { ...statistics, lifetimeActiveMs: 0 },
  };
  return upgradeMetaSignalsAndThemes(candidate);
}

/** Adds persistent Black Hole progression and run-local charge state introduced in v24. */
export function upgradeGameStateV23(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (legacy["schemaVersion"] !== 23) return null;
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
