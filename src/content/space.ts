import type { CompoundId, MaterialId, SystemId, TechId } from "./ids";

export const ROCKET_IDS = ["rocket1", "rocket2", "rocket3", "rocket4"] as const;
export type RocketId = (typeof ROCKET_IDS)[number];

export const ASTEROID_RARITIES = ["common", "uncommon", "rare", "legendary"] as const;
export type AsteroidRarity = (typeof ASTEROID_RARITIES)[number];

export const ASTEROID_SCAN_TIMER_ID = "survey:asteroid-scan";
export const STAR_STUDY_TIMER_ID = "survey:star-study";
export const VOID_PILLAGE_TIMER_ID = "survey:void-pillage";
export const INITIAL_ASTEROID_SEARCH_MS = 60_000;
export const STAR_STUDY_DURATION_MS = 400_000;
export const VOID_PILLAGE_DURATION_MS = 500_000;
export const STARSHIP_TRAVEL_MS_PER_LIGHT_YEAR = 360_000;
/** Casino travel warp leaves two seconds on the ordinary starship journey timer. */
export const STARSHIP_WARP_REMAINING_MS = 2_000;
export const VOID_PILLAGE_POWER_PER_SECOND = 1.1;
export const MINIMUM_ASTEROID_SEARCH_DURATION_MS = 5_000;
export const ASTEROID_SEARCH_GROWTH = 1.07;
export const ASTEROID_UNSUCCESSFUL_SCAN_CHANCE = 0.07;
export const MAX_UNINTERACTED_ASTEROIDS = 100;
export const ANTIMATTER_BASE_MAX_RATE_PER_SECOND = 0.4;
export const ANTIMATTER_BOOST_MULTIPLIER = 2;

export interface SpacePurchaseCost {
  readonly cash: number;
  readonly antimatter?: number;
  readonly materials: readonly {
    readonly goodId: MaterialId | CompoundId;
    readonly amount: number;
  }[];
}

export const TELESCOPE_COST: SpacePurchaseCost = {
  cash: 10_000,
  materials: [
    { goodId: "iron", amount: 20_000 },
    { goodId: "glass", amount: 12_000 },
    { goodId: "silicon", amount: 20_000 },
  ],
};

export const LAUNCH_PAD_COST: SpacePurchaseCost = {
  cash: 40_000,
  materials: [
    { goodId: "iron", amount: 1_000 },
    { goodId: "titanium", amount: 700 },
    { goodId: "concrete", amount: 12_000 },
  ],
};

export const ROCKET_PART_BASE_COST: SpacePurchaseCost = {
  cash: 1_000,
  materials: [
    { goodId: "glass", amount: 1_000 },
    { goodId: "titanium", amount: 700 },
    { goodId: "steel", amount: 3_000 },
  ],
};

export const ROCKET_PART_REQUIREMENTS: Readonly<Record<RocketId, number>> = {
  rocket1: 12,
  rocket2: 17,
  rocket3: 22,
  rocket4: 27,
};

export const ROCKET_FUEL_CAPACITY: Readonly<Record<RocketId, number>> = {
  rocket1: 10_000,
  rocket2: 12_000,
  rocket3: 14_000,
  rocket4: 16_000,
};

export const ROCKET_FUEL_PUMP_BASE_COST: Readonly<Record<RocketId, number>> = {
  rocket1: 5_000,
  rocket2: 6_000,
  rocket3: 7_000,
  rocket4: 8_000,
};

export const ROCKET_FUEL_PUMP_POWER: Readonly<Record<RocketId, number>> = {
  rocket1: 0.7,
  rocket2: 0.8,
  rocket3: 0.9,
  rocket4: 1,
};

/** The source rate is 0.02 per 10 ms tick, or 2 units per second. */
export const ROCKET_FUEL_PUMP_RATE_PER_SECOND = 2;
export const ROCKET_TRAVEL_DISTANCE_MIN = 30_000;
export const ROCKET_TRAVEL_DISTANCE_MAX = 570_000;
export const ROCKET_TRAVEL_MS_PER_DISTANCE_UNIT = 5;

export interface AsteroidState {
  readonly id: string;
  readonly name: string;
  readonly systemId: string;
  readonly distance: number;
  readonly rarity: AsteroidRarity;
  readonly extractionEase: number;
  readonly remainingAntimatter: number;
  readonly totalAntimatter: number;
  readonly reservedBy: RocketId | null;
  readonly depleted: boolean;
  readonly interacted: boolean;
}

export type TelescopeSurvey = "asteroids" | "stars" | "pillageVoid";
export type TelescopeMode = TelescopeSurvey;
export const SPACE_WEATHER_CONDITIONS = [
  "clear",
  "cloudy",
  "rain",
  "heavyRain",
  "volcano",
] as const;
export type SpaceWeatherCondition = (typeof SPACE_WEATHER_CONDITIONS)[number];
export const STAR_WEATHER_TYPES = ["sunny", "cloudy", "rain", "volcano"] as const;
export type StarWeatherType = (typeof STAR_WEATHER_TYPES)[number];

/** Static generated facts that belong to a star and must survive system changes. */
export interface StarSystemProfile {
  readonly systemId: SystemId;
  readonly weatherChances: Readonly<Record<StarWeatherType, number>>;
  readonly precipitationGoodId: CompoundId;
  readonly ascendencyPoints: number;
  /** Distance from the then-current system when AP was first generated. */
  readonly ascendencyDistanceLy: number;
}

/** A manuscript reveals the factory system only after its discovery system is settled. */
export interface AncientManuscriptRecord {
  readonly position: 1 | 2 | 3 | 4;
  readonly manuscriptSystemId: SystemId;
  readonly factorySystemId: SystemId;
  readonly megastructureId:
    | "dysonSphere"
    | "celestialProcessingCore"
    | "plasmaForge"
    | "galacticMemoryArchive";
  readonly reported: boolean;
}

export const STAR_CIVILIZATION_LEVELS = [
  "none",
  "unsentient",
  "industrial",
  "spacefaring",
  "robotic",
] as const;
export type StarCivilizationLevel = (typeof STAR_CIVILIZATION_LEVELS)[number];

export const STAR_THREAT_LEVELS = ["none", "low", "moderate", "high", "extreme"] as const;
export type StarThreatLevel = (typeof STAR_THREAT_LEVELS)[number];

export const STAR_ATTITUDES = [
  "none",
  "receptive",
  "neutral",
  "reserved",
  "belligerent",
  "scared",
  "surrendered",
] as const;
export type StarAttitude = (typeof STAR_ATTITUDES)[number];
export type DiplomacyChoice = "message" | "harmony" | "bully" | "vassalize";
export const STAR_DIPLOMACY_MESSAGE_IDS = [
  "messageReceptive",
  "messageNeutral",
  "messageReserved",
  "messageBelligerent",
  "harmonyReceptive",
  "harmonyRebuff",
  "harmonyBelligerent",
  "bullyScared",
  "bullySurrendered",
  "bullyAttack",
  "bullyLaugh",
  "vassalized",
  "vassalizationFailed",
] as const;
export type StarDiplomacyMessageId = (typeof STAR_DIPLOMACY_MESSAGE_IDS)[number];
export type StarDiplomacyOutcome =
  | "receptive"
  | "neutral"
  | "reserved"
  | "belligerent"
  | "rebuff"
  | "scared"
  | "surrendered"
  | "attack"
  | "laugh"
  | "vassalized"
  | "vassalizationFailed";

export const STAR_LIFEFORM_TRAITS = [
  "notApplicable",
  "aggressive",
  "diplomatic",
  "terrans",
  "aquatic",
  "aerialians",
  "armored",
  "hiveMind",
  "powerSiphon",
  "hypercharge",
  "mechanized",
] as const;
export type StarLifeformTrait = (typeof STAR_LIFEFORM_TRAITS)[number];

export const STAR_ANOMALY_IDS = [
  "electromagneticSurge",
  "fortifiedMagneticField",
  "plasmaInstability",
  "energyDampeningField",
  "atmosphericDisturbance",
  "highAltitudeJetStreams",
  "seismicInstability",
  "tectonicShift",
  "deepOceanCurrents",
  "darkMatterFlux",
  "stalwart",
  "brokenForceField",
  "aiMasterRace",
] as const;
export type StarAnomalyId = (typeof STAR_ANOMALY_IDS)[number];

/** Generated only when a built Stellar Scanner scans a destination. */
export interface StarSystemEncounter {
  readonly systemId: SystemId;
  readonly lifeDetected: boolean;
  readonly civilizationLevel: StarCivilizationLevel;
  readonly lifeformTraits: readonly [StarLifeformTrait, StarLifeformTrait, StarLifeformTrait];
  readonly raceName: string;
  readonly populationEstimate: number;
  readonly threatLevel: StarThreatLevel;
  readonly defenseRating: number;
  readonly enemyFleets: Readonly<{
    readonly air: number;
    readonly land: number;
    readonly sea: number;
  }>;
  readonly anomalies: readonly StarAnomalyId[];
  readonly initialImpression: number;
  readonly currentImpression: number;
  readonly latestDifferenceInImpression: number;
  readonly attitude: StarAttitude;
  readonly triedToBully: boolean;
  readonly patience: number;
  readonly lastDiplomacyMessage: StarDiplomacyMessageId | null;
  readonly warReady: boolean;
  readonly warMode: boolean;
  readonly battle: StarSystemBattleState;
}

export const STARSHIP_MODULE_IDS = [
  "structural",
  "lifeSupport",
  "antimatterEngine",
  "fleetHangar",
  "stellarScanner",
] as const;
export type StarshipModuleId = (typeof STARSHIP_MODULE_IDS)[number];

export interface StarshipModuleDefinition {
  readonly parts: number;
  readonly technology: TechId;
  readonly requiredForTravel: boolean;
  readonly cost: SpacePurchaseCost;
}

/** Base prices and unlocks from cosmicForge/resourceDataObject.js. */
export const STARSHIP_MODULES: Readonly<Record<StarshipModuleId, StarshipModuleDefinition>> = {
  structural: {
    parts: 20,
    technology: "orbitalConstruction",
    requiredForTravel: true,
    cost: {
      cash: 3_000,
      materials: [
        { goodId: "steel", amount: 4_000 },
        { goodId: "titanium", amount: 1_500 },
        { goodId: "silicon", amount: 4_500 },
      ],
    },
  },
  lifeSupport: {
    parts: 10,
    technology: "lifeSupportSystems",
    requiredForTravel: true,
    cost: {
      cash: 7_500,
      materials: [
        { goodId: "glass", amount: 5_000 },
        { goodId: "oxygen", amount: 20_000 },
        { goodId: "water", amount: 15_000 },
      ],
    },
  },
  antimatterEngine: {
    parts: 16,
    technology: "antimatterEngines",
    requiredForTravel: true,
    cost: {
      cash: 6_000,
      materials: [
        { goodId: "steel", amount: 3_500 },
        { goodId: "titanium", amount: 2_000 },
        { goodId: "neon", amount: 10_000 },
      ],
    },
  },
  fleetHangar: {
    parts: 1,
    technology: "starshipFleets",
    requiredForTravel: true,
    cost: {
      cash: 50_000,
      materials: [
        { goodId: "glass", amount: 40_000 },
        { goodId: "titanium", amount: 20_000 },
        { goodId: "steel", amount: 80_000 },
      ],
    },
  },
  stellarScanner: {
    parts: 8,
    technology: "stellarScanners",
    requiredForTravel: false,
    cost: {
      cash: 2_500,
      materials: [
        { goodId: "glass", amount: 1_500 },
        { goodId: "silicon", amount: 2_000 },
        { goodId: "neon", amount: 3_000 },
      ],
    },
  },
};

/** Base cost for the single diplomatic envoy from cosmicForge/resourceDataObject.js. */
export const FLEET_ENVOY_COST: SpacePurchaseCost = {
  cash: 2_000,
  materials: [
    { goodId: "hydrogen", amount: 8_000 },
    { goodId: "silicon", amount: 300 },
    { goodId: "titanium", amount: 120 },
  ],
};

export const PLAYER_FLEET_IDS = ["scout", "marauder", "landStalker", "navalStrafer"] as const;
export type PlayerFleetId = (typeof PLAYER_FLEET_IDS)[number];
export const ENEMY_FLEET_IDS = ["air", "land", "sea"] as const;
export type EnemyFleetId = (typeof ENEMY_FLEET_IDS)[number];
export const FLEET_BUILD_COST_GROWTH = 1.13;
export const HANGAR_AUTOMATION_COST_FACTOR = 0.95;
export const FLEET_COMBAT_REPEATABLE_FACTOR = 1.05;
export const PLAYER_FLEET_BASE_HEALTH = 100;
export const SPACE_BATTLE_PHASES = ["idle", "inProgress", "victory", "defeat"] as const;
export type SpaceBattlePhase = (typeof SPACE_BATTLE_PHASES)[number];

export interface StarSystemBattleState {
  readonly phase: SpaceBattlePhase;
  readonly round: number;
  readonly playerHealthPool: Readonly<Record<PlayerFleetId, number>>;
  readonly enemyHealthPool: Readonly<Record<EnemyFleetId, number>>;
}

export function createInitialStarSystemBattleState(): StarSystemBattleState {
  return {
    phase: "idle",
    round: 0,
    playerHealthPool: { scout: 0, marauder: 0, landStalker: 0, navalStrafer: 0 },
    enemyHealthPool: { air: 0, land: 0, sea: 0 },
  };
}

export interface PlayerFleetCombatTotals {
  readonly attackPower: number;
  readonly defensePower: number;
}

export interface PlayerFleetDefinition {
  readonly maxQuantity: number;
  readonly baseCost: SpacePurchaseCost;
  readonly baseAttackStrength: number;
  readonly bonusPercentage: number;
  readonly bonusAgainstType: "air" | "land" | "sea";
  readonly bonusRemovedByTrait: "aerialians" | "terrans" | "aquatic";
  readonly defenseStrength: number;
  readonly speed: number;
}

/** Fleet ship prices and combat baselines from cosmicForge/resourceDataObject.js. */
export const PLAYER_FLEETS: Readonly<Record<PlayerFleetId, PlayerFleetDefinition>> = {
  scout: {
    maxQuantity: 100_000,
    baseCost: {
      cash: 5_000,
      materials: [
        { goodId: "hydrogen", amount: 14_000 },
        { goodId: "silicon", amount: 1_000 },
        { goodId: "titanium", amount: 300 },
      ],
    },
    baseAttackStrength: 2,
    bonusPercentage: 10,
    bonusAgainstType: "air",
    bonusRemovedByTrait: "aerialians",
    defenseStrength: 2,
    speed: 5,
  },
  marauder: {
    maxQuantity: 100_000,
    baseCost: {
      cash: 7_500,
      materials: [
        { goodId: "helium", amount: 14_000 },
        { goodId: "silicon", amount: 2_000 },
        { goodId: "titanium", amount: 600 },
      ],
    },
    baseAttackStrength: 4,
    bonusPercentage: 15,
    bonusAgainstType: "air",
    bonusRemovedByTrait: "aerialians",
    defenseStrength: 3,
    speed: 4,
  },
  landStalker: {
    maxQuantity: 100_000,
    baseCost: {
      cash: 9_000,
      materials: [
        { goodId: "helium", amount: 22_000 },
        { goodId: "silicon", amount: 3_000 },
        { goodId: "titanium", amount: 900 },
      ],
    },
    baseAttackStrength: 4,
    bonusPercentage: 20,
    bonusAgainstType: "land",
    bonusRemovedByTrait: "terrans",
    defenseStrength: 0,
    speed: 2,
  },
  navalStrafer: {
    maxQuantity: 100_000,
    baseCost: {
      cash: 8_000,
      materials: [
        { goodId: "hydrogen", amount: 26_000 },
        { goodId: "silicon", amount: 4_000 },
        { goodId: "titanium", amount: 1_200 },
      ],
    },
    baseAttackStrength: 6,
    bonusPercentage: 15,
    bonusAgainstType: "sea",
    bonusRemovedByTrait: "aquatic",
    defenseStrength: 0,
    speed: 1,
  },
};

export function createInitialPlayerFleets(): Readonly<Record<PlayerFleetId, number>> {
  return { scout: 0, marauder: 0, landStalker: 0, navalStrafer: 0 };
}

export function createInitialPlayerFleetCombatTotals(): Readonly<
  Record<PlayerFleetId, PlayerFleetCombatTotals>
> {
  return {
    scout: { attackPower: 0, defensePower: 0 },
    marauder: { attackPower: 0, defensePower: 0 },
    landStalker: { attackPower: 0, defensePower: 0 },
    navalStrafer: { attackPower: 0, defensePower: 0 },
  };
}

export interface StarshipModuleState {
  readonly builtParts: number;
}

export type StarshipTravelPhase = "unlaunched" | "travelling" | "orbiting";

export interface StarshipTravelState {
  readonly destinationSystemId: SystemId | null;
  readonly phase: StarshipTravelPhase;
  readonly timerId: string | null;
  readonly durationMs: number;
  readonly antimatterSpent: number;
  /** Accepted route length retained until arrival is credited to Statistics. */
  readonly travelDistanceLy: number | null;
}

export function createInitialStarshipModules(): Readonly<
  Record<StarshipModuleId, StarshipModuleState>
> {
  return Object.fromEntries(STARSHIP_MODULE_IDS.map((id) => [id, { builtParts: 0 }])) as Record<
    StarshipModuleId,
    StarshipModuleState
  >;
}

export type RocketPhase = "assembly" | "ready" | "orbit" | "outbound" | "mining" | "returning";

export interface RocketState {
  readonly name: string;
  readonly builtParts: number;
  readonly fuelQuantity: number;
  readonly fuelPumpPurchased: boolean;
  readonly fuelPumpEnabled: boolean;
  readonly phase: RocketPhase;
  readonly targetAsteroidId: string | null;
  readonly journeyCount: number;
  readonly timerId: string | null;
}

export interface SpaceState {
  readonly currentSystemId: string;
  readonly telescopeBuilt: boolean;
  readonly telescopeBaseSearchDurationMs: number;
  readonly activeSurvey: TelescopeSurvey | null;
  readonly surveyPowerBlocked: boolean;
  readonly autoTelescopeUnlocked: boolean;
  readonly autoTelescopeEnabled: boolean;
  readonly autoTelescopeMode: TelescopeMode;
  readonly starStudyRange: number;
  readonly starshipDistanceTravelledThisRun: number;
  readonly launchPadBuilt: boolean;
  readonly asteroids: readonly AsteroidState[];
  /** Rocket arrivals at asteroids during the current run, matching the source stat counter. */
  readonly asteroidsMinedThisRun: number;
  readonly selectedAsteroidId: string | null;
  readonly nextAsteroidSequence: number;
  readonly voidPillageCompletions: number;
  readonly antimatter: number;
  readonly antimatterUnlocked: boolean;
  readonly antimatterMinedThisRun: number;
  readonly antimatterBoostActive: boolean;
  readonly ascendencyAwardedThisRun: boolean;
  readonly currentSystemWeather: SpaceWeatherCondition;
  readonly weatherSystemId: string;
  readonly weatherCycleCount: number;
  readonly severeWeatherPeriodCount: number;
  readonly currentPrecipitationRate: number;
  readonly precipitationCollectedThisRun: number;
  readonly systemProfiles: readonly StarSystemProfile[];
  readonly systemEncounters: readonly StarSystemEncounter[];
  readonly fleetEnvoyBuilt: boolean;
  readonly playerFleets: Readonly<Record<PlayerFleetId, number>>;
  readonly playerFleetCombatTotals: Readonly<Record<PlayerFleetId, PlayerFleetCombatTotals>>;
  readonly starshipModules: Readonly<Record<StarshipModuleId, StarshipModuleState>>;
  readonly starship: StarshipTravelState;
  readonly rockets: Readonly<Record<RocketId, RocketState>>;
}

export function createInitialSpaceState(): SpaceState {
  const rockets = Object.fromEntries(
    ROCKET_IDS.map((id, index) => [
      id,
      {
        name: `Rocket ${index + 1}`,
        builtParts: 0,
        fuelQuantity: 0,
        fuelPumpPurchased: false,
        fuelPumpEnabled: false,
        phase: "assembly",
        targetAsteroidId: null,
        journeyCount: 0,
        timerId: null,
      },
    ]),
  ) as Record<RocketId, RocketState>;
  return {
    currentSystemId: "spica",
    telescopeBuilt: false,
    telescopeBaseSearchDurationMs: INITIAL_ASTEROID_SEARCH_MS,
    activeSurvey: null,
    surveyPowerBlocked: false,
    autoTelescopeUnlocked: false,
    autoTelescopeEnabled: false,
    autoTelescopeMode: "asteroids",
    starStudyRange: 0,
    starshipDistanceTravelledThisRun: 0,
    launchPadBuilt: false,
    asteroids: [],
    asteroidsMinedThisRun: 0,
    selectedAsteroidId: null,
    nextAsteroidSequence: 1,
    voidPillageCompletions: 0,
    antimatter: 0,
    antimatterUnlocked: false,
    antimatterMinedThisRun: 0,
    antimatterBoostActive: false,
    ascendencyAwardedThisRun: false,
    currentSystemWeather: "clear",
    weatherSystemId: "spica",
    weatherCycleCount: 0,
    severeWeatherPeriodCount: 0,
    currentPrecipitationRate: 0,
    precipitationCollectedThisRun: 0,
    systemProfiles: [],
    systemEncounters: [],
    fleetEnvoyBuilt: false,
    playerFleets: createInitialPlayerFleets(),
    playerFleetCombatTotals: createInitialPlayerFleetCombatTotals(),
    starshipModules: createInitialStarshipModules(),
    starship: {
      destinationSystemId: null,
      phase: "unlaunched",
      timerId: null,
      durationMs: 0,
      antimatterSpent: 0,
      travelDistanceLy: null,
    },
    rockets,
  };
}
