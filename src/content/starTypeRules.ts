import type { StarType } from "./starCatalogue";

export const B_TYPE_AUTOBUYER_BONUS_PER_SECOND = {
  1: 2,
  2: 8,
  3: 25,
  4: 80,
} as const;
export const F_TYPE_ANTIMATTER_RATE_MULTIPLIER = 1.5;
export const O_TYPE_POWER_PLANT_MULTIPLIER = 8;
export const O_TYPE_POWER_PLANT_IDS = ["powerPlant1", "powerPlant2", "powerPlant3"] as const;
export type OTypePowerPlantId = (typeof O_TYPE_POWER_PLANT_IDS)[number];

export type AutoBuyerTier = keyof typeof B_TYPE_AUTOBUYER_BONUS_PER_SECOND;

export function bTypeAutoBuyerBonusPerSecond(tier: AutoBuyerTier): number {
  return B_TYPE_AUTOBUYER_BONUS_PER_SECOND[tier];
}

export function antimatterStarTypeMultiplier(starType: StarType): number {
  return starType === "F" ? F_TYPE_ANTIMATTER_RATE_MULTIPLIER : 1;
}

/** O-type power bonuses apply only after settlement and while the save's mechanic is enabled. */
export function oTypePowerPlantMultiplier(
  starType: StarType,
  settled: boolean,
  mechanicEnabled = true,
): number {
  return starType === "O" && settled && mechanicEnabled ? O_TYPE_POWER_PLANT_MULTIPLIER : 1;
}
