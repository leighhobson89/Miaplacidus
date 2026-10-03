import { MATERIAL_CATALOG } from "./economy";
import type { MaterialId } from "./ids";

export type SaleSelection = "all" | "threeQuarters" | "twoThirds" | "half" | "oneThird" | number;

const SALE_FRACTIONS: Readonly<Record<Exclude<SaleSelection, "all" | number>, number>> = {
  threeQuarters: 0.75,
  twoThirds: 2 / 3,
  half: 0.5,
  oneThird: 1 / 3,
};

export function nextScaledPrice(currentPrice: number, multiplier = 1.13): number {
  if (
    !Number.isFinite(currentPrice) ||
    currentPrice < 0 ||
    !Number.isFinite(multiplier) ||
    multiplier < 1
  ) {
    return Number.POSITIVE_INFINITY;
  }
  const next = Math.ceil(currentPrice * multiplier);
  return Number.isSafeInteger(next) ? next : Number.POSITIVE_INFINITY;
}

export function scaledPriceAfterPurchases(
  initialPrice: number,
  purchases: number,
  multiplier = 1.13,
): number {
  if (!Number.isSafeInteger(purchases) || purchases < 0) return Number.POSITIVE_INFINITY;
  let price = initialPrice;
  for (let index = 0; index < purchases; index += 1) {
    price = nextScaledPrice(price, multiplier);
    if (!Number.isFinite(price)) return Number.POSITIVE_INFINITY;
  }
  return price;
}

export function affordablePurchaseCount(
  initialPrice: number,
  owned: number,
  available: number,
  multiplier = 1.13,
  maximumPurchases = 10_000,
): { readonly count: number; readonly totalCost: number } {
  if (
    !Number.isSafeInteger(owned) ||
    owned < 0 ||
    !Number.isFinite(available) ||
    available < 0 ||
    !Number.isSafeInteger(maximumPurchases) ||
    maximumPurchases < 0
  )
    return { count: 0, totalCost: 0 };
  let count = 0;
  let totalCost = 0;
  let price = scaledPriceAfterPurchases(initialPrice, owned, multiplier);
  while (count < maximumPurchases && Number.isFinite(price) && totalCost + price <= available) {
    totalCost += price;
    count += 1;
    price = nextScaledPrice(price, multiplier);
  }
  return { count, totalCost };
}

export function nextAutobuyerPrice(goodId: MaterialId, tier: 1 | 2 | 3 | 4, owned: number): number {
  const basePrice = MATERIAL_CATALOG[goodId].buyerTiers[tier - 1]?.price;
  return basePrice === undefined
    ? Number.POSITIVE_INFINITY
    : scaledPriceAfterPurchases(basePrice, owned);
}

export function storagePurchaseCost(capacity: number): number {
  return Number.isFinite(capacity) && capacity >= 0
    ? Math.max(0, capacity - 1)
    : Number.POSITIVE_INFINITY;
}

export function permanentPerkPurchaseCount(perks: readonly string[], perkId: string): number {
  return perks.reduce((count, perk) => {
    if (perk === perkId) return Math.max(count, 1);
    if (!perk.startsWith(`${perkId}:`)) return count;
    const value = Number(perk.slice(perkId.length + 1));
    return Number.isSafeInteger(value) && value > 0 ? Math.max(count, value) : count;
  }, 0);
}

export function repeatedPerkMultiplier(
  perks: readonly string[],
  perkId: string,
  multiplierPerPurchase: number,
): number {
  const count = permanentPerkPurchaseCount(perks, perkId);
  return Number.isFinite(multiplierPerPurchase) && multiplierPerPurchase >= 1
    ? multiplierPerPurchase ** count
    : 1;
}

export function storageCapacityAfterPurchase(
  capacity: number,
  efficientStoragePurchases = 0,
): number {
  if (
    !Number.isFinite(capacity) ||
    capacity < 0 ||
    !Number.isSafeInteger(efficientStoragePurchases) ||
    efficientStoragePurchases < 0
  ) {
    return Number.POSITIVE_INFINITY;
  }
  // The source scales its base ×2 storage factor by (purchases + 1).
  return capacity * 2 * (1 + Math.min(3, efficientStoragePurchases));
}

/**
 * Sale previews use exactly the amount the click command will sell. The source
 * presents percentage choices against whole available stock.
 */
export function selectedSaleAmount(stock: number, selection: SaleSelection): number {
  if (!Number.isFinite(stock) || stock <= 0) return 0;
  const wholeStock = Math.floor(stock + Number.EPSILON * Math.abs(stock) * 4);
  if (selection === "all") return wholeStock;
  const requested =
    typeof selection === "number"
      ? Number.isSafeInteger(selection) && selection > 0
        ? selection
        : 0
      : Math.floor(wholeStock * SALE_FRACTIONS[selection]);
  return Math.min(wholeStock, requested);
}

/** Source sale handling clears a sub-unit remainder after a successful sale. */
export function stockAfterSale(stock: number, amount: number): number {
  const remaining = Math.max(0, stock - amount);
  return remaining < 1 ? 0 : remaining;
}

export function saleCash(stock: number, selection: SaleSelection, unitValue: number): number {
  return selectedSaleAmount(stock, selection) * unitValue;
}

export function fusionEfficiencyRange(researched: readonly string[]): readonly [number, number] {
  if (researched.includes("fusionEfficiencyIII")) return [1, 1];
  if (researched.includes("fusionEfficiencyII")) return [0.6, 0.8];
  if (researched.includes("fusionEfficiencyI")) return [0.4, 0.6];
  return [0.2, 0.3];
}

export function fusionYield(inputAmount: number, ratio: number, efficiency: number): number {
  if (
    !Number.isSafeInteger(inputAmount) ||
    inputAmount <= 0 ||
    !Number.isFinite(ratio) ||
    ratio <= 0 ||
    !Number.isFinite(efficiency) ||
    efficiency < 0 ||
    efficiency > 1
  ) {
    return 0;
  }
  return Math.floor(inputAmount * ratio * efficiency);
}
