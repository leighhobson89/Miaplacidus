import { ECONOMIC_GOOD_IDS, type EconomicGoodId, type MaterialId } from "../content/ids";
import type { GoodState } from "./state";

export interface FuelDemand {
  readonly goodId: EconomicGoodId;
  readonly unitsPerSecond: number;
}

export interface CraftingDemand {
  readonly outputId: EconomicGoodId;
  readonly unitsPerSecond: number;
  readonly inputs: readonly { readonly goodId: EconomicGoodId; readonly unitsPerOutput: number }[];
  /** Lower values run first. Ties are resolved by output ID. */
  readonly priority?: number;
}

export interface TickPlan {
  readonly productionPerSecond?: Partial<Record<EconomicGoodId, number>>;
  readonly fuel?: readonly FuelDemand[];
  readonly crafting?: readonly CraftingDemand[];
  readonly salesPerSecond?: Partial<Record<EconomicGoodId, number>>;
}

export type ResourceTransactionEvent =
  | { readonly type: "resource.produced"; readonly goodId: EconomicGoodId; readonly amount: number }
  | {
      readonly type: "resource.fuel-burned";
      readonly goodId: EconomicGoodId;
      readonly amount: number;
    }
  | { readonly type: "compound.created"; readonly goodId: EconomicGoodId; readonly amount: number }
  | {
      readonly type: "resource.sold";
      readonly goodId: EconomicGoodId;
      readonly amount: number;
      readonly cash: number;
    }
  | { readonly type: "storage.clamped"; readonly goodId: EconomicGoodId; readonly amount: number };

export interface ResourceTransactionResult {
  readonly goods: Readonly<Record<EconomicGoodId, GoodState>>;
  readonly cash: number;
  readonly cashRaised: number;
  readonly goodsProduced: number;
  readonly events: readonly ResourceTransactionEvent[];
}

function checkedRate(value: number, description: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${description} must be a finite non-negative rate.`);
  }
  return value;
}

function checkedAmount(value: number, description: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${description} must be finite and non-negative.`);
  }
  return value;
}

function compareIds(left: EconomicGoodId, right: EconomicGoodId): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function transactResources(
  goods: Readonly<Record<EconomicGoodId, GoodState>>,
  cash: number,
  elapsedMs: number,
  plan: TickPlan,
): ResourceTransactionResult {
  checkedAmount(cash, "Cash");
  checkedAmount(elapsedMs, "Elapsed time");
  const seconds = elapsedMs / 1000;
  if (seconds === 0) {
    return { goods, cash, cashRaised: 0, goodsProduced: 0, events: [] };
  }

  const next = { ...goods } as Record<EconomicGoodId, GoodState>;
  const events: ResourceTransactionEvent[] = [];
  let goodsProduced = 0;

  // 1. Land each producer's output. Keep excess available to consumers until the final clamp.
  for (const goodId of ECONOMIC_GOOD_IDS) {
    const amount =
      checkedRate(plan.productionPerSecond?.[goodId] ?? 0, `Production for ${goodId}`) * seconds;
    if (amount > 0) {
      next[goodId] = { ...next[goodId], quantity: next[goodId].quantity + amount };
      goodsProduced += amount;
      events.push({ type: "resource.produced", goodId, amount });
    }
  }

  // 2. Fuel has first claim on produced stock; a shortage burns only what exists.
  const fuel = [...(plan.fuel ?? [])].sort((a, b) => compareIds(a.goodId, b.goodId));
  for (const demand of fuel) {
    const requested = checkedRate(demand.unitsPerSecond, `Fuel use for ${demand.goodId}`) * seconds;
    const amount = Math.min(requested, next[demand.goodId].quantity);
    if (amount > 0) {
      next[demand.goodId] = {
        ...next[demand.goodId],
        quantity: next[demand.goodId].quantity - amount,
      };
      events.push({ type: "resource.fuel-burned", goodId: demand.goodId, amount });
    }
  }

  // 3. Craft in explicit priority order, then stable ID order. Inputs cannot be spent twice.
  const crafting = [...(plan.crafting ?? [])].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0) || compareIds(a.outputId, b.outputId),
  );
  for (const demand of crafting) {
    const requested =
      checkedRate(demand.unitsPerSecond, `Crafting rate for ${demand.outputId}`) * seconds;
    const output = next[demand.outputId];
    let amount = Math.min(requested, Math.max(0, output.storageCapacity - output.quantity));
    const inputRatios = new Map<EconomicGoodId, number>();
    for (const input of demand.inputs) {
      checkedRate(input.unitsPerOutput, `Recipe input for ${demand.outputId}`);
      const combinedRatio = (inputRatios.get(input.goodId) ?? 0) + input.unitsPerOutput;
      if (!Number.isFinite(combinedRatio)) {
        throw new RangeError(`Recipe input for ${demand.outputId} is too large.`);
      }
      inputRatios.set(input.goodId, combinedRatio);
    }
    for (const [goodId, ratio] of inputRatios) {
      if (ratio > 0) amount = Math.min(amount, next[goodId].quantity / ratio);
    }
    if (amount <= 0) {
      continue;
    }
    for (const [goodId, ratio] of inputRatios) {
      const consumed = amount * ratio;
      next[goodId] = {
        ...next[goodId],
        quantity: Math.max(0, next[goodId].quantity - consumed),
      };
    }
    next[demand.outputId] = {
      ...next[demand.outputId],
      quantity: next[demand.outputId].quantity + amount,
    };
    goodsProduced += amount;
    events.push({ type: "compound.created", goodId: demand.outputId, amount });
  }

  // 4. Sales consume remaining stock and credit cash once from the exact amount removed.
  let cashRaised = 0;
  for (const goodId of ECONOMIC_GOOD_IDS) {
    const rate = checkedRate(plan.salesPerSecond?.[goodId] ?? 0, `Sales for ${goodId}`);
    const requested = rate * seconds;
    const amount = Math.min(requested, next[goodId].quantity);
    if (amount > 0) {
      const earned = amount * next[goodId].saleValue;
      next[goodId] = { ...next[goodId], quantity: next[goodId].quantity - amount };
      cashRaised += earned;
      events.push({ type: "resource.sold", goodId, amount, cash: earned });
    }
  }

  // 5. Clamp every inventory once, after all consumers had the same ordered pass.
  for (const goodId of ECONOMIC_GOOD_IDS) {
    const good = next[goodId];
    const quantity = Math.min(good.storageCapacity, Math.max(0, good.quantity));
    if (quantity !== good.quantity) {
      events.push({ type: "storage.clamped", goodId, amount: good.quantity - quantity });
      next[goodId] = { ...good, quantity };
    }
    if (!Number.isFinite(next[goodId].quantity)) {
      throw new RangeError(`Transaction produced a non-finite quantity for ${goodId}.`);
    }
  }
  if (!Number.isFinite(cash + cashRaised) || !Number.isFinite(goodsProduced)) {
    throw new RangeError("Transaction overflowed a game balance.");
  }

  return {
    goods: next,
    cash: cash + cashRaised,
    cashRaised,
    goodsProduced,
    events,
  };
}

export interface PurchaseCost {
  readonly cash?: number;
  readonly materials?: readonly { readonly goodId: MaterialId; readonly amount: number }[];
}
