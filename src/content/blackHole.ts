export const BLACK_HOLE_RESEARCH_PRICE = 1_000_000;
export const BLACK_HOLE_BASE_CHARGE_MS = 300_000;
export const BLACK_HOLE_MINIMUM_CHARGE_MS = 30_000;
export const BLACK_HOLE_BASE_WARP_MS = 3_000;
export const BLACK_HOLE_BASE_POWER = 5;
export const BLACK_HOLE_POWER_INCREMENT = 2;
export const BLACK_HOLE_HIGH_POWER_INCREMENT = 0.5;
export const BLACK_HOLE_DURATION_INCREMENT_MS = 3_000;
export const BLACK_HOLE_RECHARGE_FACTOR = 0.88;
export const BLACK_HOLE_PRICE_MULTIPLIER = 1.13;
export const BLACK_HOLE_UPGRADE_BASE_PRICES = {
  duration: 600_000,
  power: 850_000,
  recharge: 900_000,
} as const;

export type BlackHoleUpgradeId = keyof typeof BLACK_HOLE_UPGRADE_BASE_PRICES;
