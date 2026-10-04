import { ACHIEVEMENT_NAMES } from "./achievementNames.generated";
import type { EconomicGoodId } from "./ids";

export type AchievementId = keyof typeof ACHIEVEMENT_NAMES;

export const ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENT_NAMES) as AchievementId[];

export type AchievementReward =
  | { readonly type: "none" }
  | {
      readonly type: "cash" | "ascendency-points" | "glory-points" | "antimatter";
      readonly amount: number;
    }
  | {
      readonly type: "good";
      readonly goodId: EconomicGoodId;
      readonly amount: number;
      readonly cap: true;
    }
  | { readonly type: "double-resources" | "double-compounds"; readonly cap: true }
  | {
      readonly type: "resource-rate";
      readonly multiplier: number;
      readonly permanentBonus?: number;
    }
  | { readonly type: "sale-value" | "compound-recipe-cost"; readonly multiplier: number };

export interface AchievementDefinition {
  readonly id: AchievementId;
  readonly area: "economy" | "space" | "meta" | "casino" | "events" | "news" | "endgame";
  readonly resetOnRebirth: boolean;
  readonly reward: AchievementReward;
}

const runOnly = new Set<AchievementId>([
  "collect50Hydrogen",
  "collect1000Hydrogen",
  "collect5000Carbon",
  "collect50000Iron",
  "collect100Precipitation",
  "fuseElement",
  "createSteel",
  "createTitanium",
  "unlockCompounds",
  "researchTechnology",
  "achieve100FusionEfficiency",
  "buildPowerPlant",
  "buildSolarPowerPlant",
  "gain100Cash",
  "gain10000Cash",
  "gain100000Cash",
  "gain1000000Cash",
  "discoverLegendaryAsteroid",
  "have4RocketsMiningAntimatter",
  "tripPower",
  "discoverAsteroid",
  "launchRocket",
  "mineAllAntimatterAsteroid",
  "studyStar",
  "studyStarMoreThan5LYAway",
  "studyStarMoreThan20LYAway",
  "launchStarship",
  "initiateDiplomacyWithAlienRace",
  "spendAP",
  "haveFleetSizeOf50EachShipType",
]);

const rewardById: Partial<Record<AchievementId, AchievementReward>> = {
  collect50Hydrogen: { type: "cash", amount: 10 },
  collect1000Hydrogen: { type: "cash", amount: 25 },
  collect5000Carbon: { type: "cash", amount: 150 },
  collect50000Iron: { type: "cash", amount: 1_800 },
  collect100Precipitation: { type: "cash", amount: 1_000 },
  fuseElement: { type: "cash", amount: 40 },
  createSteel: { type: "compound-recipe-cost", multiplier: 0.8 },
  createTitanium: { type: "compound-recipe-cost", multiplier: 0.8 },
  unlockCompounds: { type: "cash", amount: 200 },
  researchTechnology: { type: "cash", amount: 30 },
  researchAllTechnologies: { type: "ascendency-points", amount: 1 },
  achieve100FusionEfficiency: { type: "cash", amount: 500 },
  have50HoursWithOnePioneer: { type: "ascendency-points", amount: 50 },
  buildPowerPlant: { type: "resource-rate", multiplier: 1.1 },
  buildSolarPowerPlant: { type: "resource-rate", multiplier: 1.2 },
  collect100TitaniumAsPrecipitation: { type: "ascendency-points", amount: 50 },
  gain100Cash: { type: "sale-value", multiplier: 1.1 },
  gain10000Cash: { type: "sale-value", multiplier: 1.2 },
  gain100000Cash: { type: "sale-value", multiplier: 1.2 },
  gain1000000Cash: { type: "sale-value", multiplier: 1.5 },
  seeAllNewsTickers: { type: "resource-rate", multiplier: 1, permanentBonus: 0.2 },
  activateAllWackyNewsTickers: { type: "compound-recipe-cost", multiplier: 0.8 },
  discoverLegendaryAsteroid: { type: "cash", amount: 75_000 },
  have4RocketsMiningAntimatter: { type: "cash", amount: 100_000 },
  tripPower: { type: "resource-rate", multiplier: 1.1 },
  discoverAsteroid: { type: "compound-recipe-cost", multiplier: 0.95 },
  launchRocket: { type: "resource-rate", multiplier: 1.1 },
  mineAllAntimatterAsteroid: { type: "antimatter", amount: 150 },
  studyStar: { type: "compound-recipe-cost", multiplier: 0.95 },
  studyStarMoreThan5LYAway: { type: "compound-recipe-cost", multiplier: 0.9 },
  studyStarMoreThan20LYAway: { type: "compound-recipe-cost", multiplier: 0.85 },
  launchStarship: { type: "cash", amount: 10_000 },
  performGalacticMarketTransaction: { type: "ascendency-points", amount: 1 },
  trade10APForCash: { type: "ascendency-points", amount: 5 },
  initiateDiplomacyWithAlienRace: { type: "resource-rate", multiplier: 1.1 },
  bullyEnemyIntoSubmission: { type: "ascendency-points", amount: 1 },
  vassalizeEnemy: { type: "ascendency-points", amount: 1 },
  conquerEnemy: { type: "ascendency-points", amount: 1 },
  conquerHiveMindEnemy: { type: "ascendency-points", amount: 2 },
  conquerBelligerentEnemy: { type: "ascendency-points", amount: 3 },
  conquerEnemyWithoutScanning: { type: "ascendency-points", amount: 2 },
  settleUnoccupiedSystem: { type: "cash", amount: 50_000 },
  discoverSystemWithNoLife: { type: "cash", amount: 75_000 },
  rebirth: { type: "resource-rate", multiplier: 1, permanentBonus: 0.3 },
  conquer10StarSystems: { type: "ascendency-points", amount: 10 },
  conquer50StarSystems: { type: "ascendency-points", amount: 100 },
  discoverBlackHole: { type: "cash", amount: 1_000_000 },
  activateBlackHoleOver10x: { type: "double-resources", cap: true },
  findAncientManuscript: { type: "double-compounds", cap: true },
  conquerMegastructureSystem: { type: "cash", amount: 1_000_000 },
  bringDownMiaplacideanForceField: { type: "ascendency-points", amount: 100 },
  haveFleetSizeOf50EachShipType: { type: "good", goodId: "titanium", amount: 1_000_000, cap: true },
  winAllCasinoGames: { type: "glory-points", amount: 1 },
  completeRunOnMiaplacidus: { type: "glory-points", amount: 1 },
};

const areaById: Partial<Record<AchievementId, AchievementDefinition["area"]>> = {
  seeAllNewsTickers: "news",
  activateAllWackyNewsTickers: "news",
  discoverLegendaryAsteroid: "space",
  have4RocketsMiningAntimatter: "space",
  tripPower: "economy",
  discoverAsteroid: "space",
  launchRocket: "space",
  mineAllAntimatterAsteroid: "space",
  studyStar: "space",
  studyStarMoreThan5LYAway: "space",
  studyStarMoreThan20LYAway: "space",
  launchStarship: "space",
  initiateDiplomacyWithAlienRace: "space",
  bullyEnemyIntoSubmission: "space",
  vassalizeEnemy: "space",
  conquerEnemy: "space",
  conquerHiveMindEnemy: "space",
  conquerBelligerentEnemy: "space",
  conquerEnemyWithoutScanning: "space",
  settleUnoccupiedSystem: "space",
  discoverSystemWithNoLife: "space",
  settleSystem: "space",
  liquidateAllAssets: "meta",
  rebirth: "meta",
  conquer10StarSystems: "meta",
  conquer50StarSystems: "meta",
  studyAllStarsInOneRun: "space",
  adoptPhilosophy: "meta",
  discoverBlackHole: "endgame",
  activateBlackHoleOver10x: "endgame",
  findAncientManuscript: "endgame",
  conquerMegastructureSystem: "endgame",
  bringDownMiaplacideanForceField: "endgame",
  completeGame: "endgame",
  completeRunOnMiaplacidus: "endgame",
  haveFleetSizeOf50EachShipType: "space",
  tryAllThemes: "meta",
  buyCasinoPoints: "casino",
  winAllCasinoGames: "casino",
  winWheelSpecialPrize: "casino",
  restoreNearSpaceScannerArray: "endgame",
  findCosmicRip: "endgame",
  gain1MTelemetryData: "endgame",
  closeCosmicRip: "endgame",
  suffer5NegativeEvents: "events",
  enjoyEndlessSummer: "events",
  completeOnboarding: "meta",
};

export const ACHIEVEMENT_CATALOGUE: readonly AchievementDefinition[] = ACHIEVEMENT_IDS.map(
  (id) => ({
    id,
    area: areaById[id] ?? "economy",
    resetOnRebirth: runOnly.has(id),
    reward: rewardById[id] ?? { type: "none" },
  }),
);

export function achievementName(
  id: AchievementId,
  locale: keyof (typeof ACHIEVEMENT_NAMES)[AchievementId],
): string {
  return ACHIEVEMENT_NAMES[id][locale];
}
