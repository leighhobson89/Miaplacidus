import { autobuyerUpgradeId } from "./ids";

export const HYDROGEN_MANUAL_GAIN = 1;
export const HYDROGEN_STORAGE_MULTIPLIER = 2;
export const HYDROGEN_STORAGE_PRICE_OFFSET = 1;
export const HYDROGEN_AUTOBUYER_RATE = 2;
export const HYDROGEN_AUTOBUYER_INITIAL_PRICE = 50;
export const HYDROGEN_AUTOBUYER_PRICE_MULTIPLIER = 1.13;

export function hydrogenAutobuyerCount(
  upgrades: Readonly<Partial<Record<string, number>>>,
): number {
  return upgrades[autobuyerUpgradeId("hydrogen", 1)] ?? 0;
}

/** The source raises each next price by 13% and rounds each step upward. */
export function hydrogenAutobuyerPrice(owned: number): number {
  if (!Number.isSafeInteger(owned) || owned < 0) return Number.POSITIVE_INFINITY;
  let price = HYDROGEN_AUTOBUYER_INITIAL_PRICE;
  for (let index = 0; index < owned; index += 1) {
    price = Math.ceil(price * HYDROGEN_AUTOBUYER_PRICE_MULTIPLIER);
    if (!Number.isFinite(price)) return Number.POSITIVE_INFINITY;
  }
  return price;
}

export function hydrogenProductionRate(owned: number, enabled: boolean): number {
  return enabled ? owned * HYDROGEN_AUTOBUYER_RATE : 0;
}

export function hydrogenTickPlan(owned: number, enabled: boolean) {
  return { productionPerSecond: { hydrogen: hydrogenProductionRate(owned, enabled) } } as const;
}
