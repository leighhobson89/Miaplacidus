import { ECONOMIC_GOOD_IDS, type EconomicGoodId, type MaterialId } from "../content/ids";
import type { GoodState } from "./state";

export interface FuelDemand {
  readonly goodId: EconomicGoodId;
  readonly unitsPerSecond: number;
  readonly energyPerFuel?: number;
}

export interface CraftingDemand {
  readonly outputId: EconomicGoodId;
  readonly unitsPerSecond: number;
  readonly inputs: readonly { readonly goodId: EconomicGoodId; readonly unitsPerOutput: number }[];
  readonly inputBudgeted?: boolean;
  /** Lower values run first. Ties are resolved by output ID. */
  readonly priority?: number;
}

export interface PrecipitationDemand {
  readonly goodId: EconomicGoodId;
  readonly unitsPerSecond: number;
}

export interface TickPlan {
  readonly productionPerSecond?: Partial<Record<EconomicGoodId, number>>;
  readonly fuel?: readonly FuelDemand[];
  readonly crafting?: readonly CraftingDemand[];
  readonly precipitation?: PrecipitationDemand;
  readonly salesPerSecond?: Partial<Record<EconomicGoodId, number>>;
  readonly productionAllocation?: Partial<
    Record<
      MaterialId,
      { readonly enabled: boolean; readonly cashShare: number; readonly compoundShare: number }
    >
  >;
  readonly power?: { readonly generationPerSecond: number; readonly demandPerSecond: number };
  readonly researchPerSecond?: number;
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
      readonly type: "precipitation.collected";
      readonly goodId: EconomicGoodId;
      readonly amount: number;
    }
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
  readonly precipitationCollected: number;
  readonly fueledGenerationPerSecond: number;
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
    return {
      goods,
      cash,
      cashRaised: 0,
      goodsProduced: 0,
      precipitationCollected: 0,
      fueledGenerationPerSecond: 0,
      events: [],
    };
  }

  const next = { ...goods } as Record<EconomicGoodId, GoodState>;
  const events: ResourceTransactionEvent[] = [];
  const compoundBudgets = new Map<MaterialId, number>();
  const cashBudgets = new Map<MaterialId, number>();
  const newlyProduced = new Map<MaterialId, number>();
  let goodsProduced = 0;
  let precipitationCollected = 0;
  let fueledGeneration = 0;

  // 1. Land each producer's output. Keep excess available to consumers until the final clamp.
  for (const goodId of ECONOMIC_GOOD_IDS) {
    const amount =
      checkedRate(plan.productionPerSecond?.[goodId] ?? 0, `Production for ${goodId}`) * seconds;
    if (amount > 0) {
      next[goodId] = { ...next[goodId], quantity: next[goodId].quantity + amount };
      if (goodId in (plan.productionAllocation ?? {}))
        newlyProduced.set(goodId as MaterialId, amount);
      goodsProduced += amount;
      events.push({ type: "resource.produced", goodId, amount });
    }
  }

  // 2. Fuel has first claim on produced stock; a shortage burns only what exists.
  const fuel = [...(plan.fuel ?? [])].sort((a, b) => compareIds(a.goodId, b.goodId));
  for (const demand of fuel) {
    const requested = checkedRate(demand.unitsPerSecond, `Fuel use for ${demand.goodId}`) * seconds;
    if (demand.energyPerFuel !== undefined)
      checkedRate(demand.energyPerFuel, `Fuel generation for ${demand.goodId}`);
    const amount = Math.min(requested, next[demand.goodId].quantity);
    if (demand.energyPerFuel !== undefined)
      fueledGeneration += (amount / seconds) * demand.energyPerFuel;
    if (amount > 0) {
      next[demand.goodId] = {
        ...next[demand.goodId],
        quantity: next[demand.goodId].quantity - amount,
      };
      if (newlyProduced.has(demand.goodId as MaterialId)) {
        const id = demand.goodId as MaterialId;
        newlyProduced.set(id, Math.max(0, (newlyProduced.get(id) ?? 0) - amount));
      }
      events.push({ type: "resource.fuel-burned", goodId: demand.goodId, amount });
    }
  }

  // 3. Fuel is removed before the remaining new output is allocated to cash and compounds.
  for (const [id, amount] of newlyProduced) {
    const allocation = plan.productionAllocation?.[id];
    if (!allocation?.enabled) continue;
    cashBudgets.set(id, (amount * allocation.cashShare) / 100);
    compoundBudgets.set(id, (amount * allocation.compoundShare) / 100);
  }

  // 4. Cash allocation is serviced before compound inputs, matching the source hook.
  let cashRaised = 0;
  for (const goodId of ECONOMIC_GOOD_IDS) {
    const rate = checkedRate(plan.salesPerSecond?.[goodId] ?? 0, `Sales for ${goodId}`);
    const requested = rate * seconds;
    const allocation = plan.productionAllocation?.[goodId as MaterialId];
    const budget = allocation?.enabled
      ? (cashBudgets.get(goodId as MaterialId) ?? 0)
      : Number.POSITIVE_INFINITY;
    const amount = Math.min(requested, budget, next[goodId].quantity);
    if (amount > 0) {
      const earned = amount * next[goodId].saleValue;
      next[goodId] = { ...next[goodId], quantity: next[goodId].quantity - amount };
      cashRaised += earned;
      if (allocation?.enabled) cashBudgets.set(goodId as MaterialId, Math.max(0, budget - amount));
      events.push({ type: "resource.sold", goodId, amount, cash: earned });
    }
  }

  // 5. Craft in explicit priority order, then stable ID order. Inputs cannot be spent twice.
  const crafting = [...(plan.crafting ?? [])].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0) || compareIds(a.outputId, b.outputId),
  );
  const consumersByInput = new Map<EconomicGoodId, number>();
  for (const demand of crafting) {
    if (!demand.inputBudgeted) continue;
    for (const goodId of new Set(demand.inputs.map((input) => input.goodId))) {
      consumersByInput.set(goodId, (consumersByInput.get(goodId) ?? 0) + 1);
    }
  }
  for (const demand of crafting) {
    const output = next[demand.outputId];
    const availableOutput = Math.max(0, output.storageCapacity - output.quantity);
    const requested = demand.inputBudgeted
      ? availableOutput
      : checkedRate(demand.unitsPerSecond, `Crafting rate for ${demand.outputId}`) * seconds;
    let amount = Math.min(requested, availableOutput);
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
      if (ratio > 0) {
        amount = Math.min(amount, next[goodId].quantity / ratio);
        const allocation = plan.productionAllocation?.[goodId as MaterialId];
        if (demand.inputBudgeted) {
          const consumers = consumersByInput.get(goodId) ?? 0;
          const budget =
            consumers > 0 ? (compoundBudgets.get(goodId as MaterialId) ?? 0) / consumers : 0;
          amount = Math.min(amount, budget / ratio);
        } else if (allocation?.enabled) {
          amount = Math.min(amount, (compoundBudgets.get(goodId as MaterialId) ?? 0) / ratio);
        }
      }
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
      if (!demand.inputBudgeted && compoundBudgets.has(goodId as MaterialId)) {
        const id = goodId as MaterialId;
        compoundBudgets.set(id, Math.max(0, (compoundBudgets.get(id) ?? 0) - consumed));
      }
    }
    next[demand.outputId] = {
      ...next[demand.outputId],
      quantity: next[demand.outputId].quantity + amount,
    };
    goodsProduced += amount;
    events.push({ type: "compound.created", goodId: demand.outputId, amount });
  }

  const precipitation = plan.precipitation;
  if (precipitation) {
    const requested = checkedRate(precipitation.unitsPerSecond, "Precipitation rate") * seconds;
    const good = next[precipitation.goodId];
    const amount = Math.min(requested, Math.max(0, good.storageCapacity - good.quantity));
    if (amount > 0) {
      next[precipitation.goodId] = { ...good, quantity: good.quantity + amount };
      goodsProduced += amount;
      precipitationCollected = amount;
      events.push({ type: "precipitation.collected", goodId: precipitation.goodId, amount });
    }
  }

  // 6. Clamp every inventory once, after all consumers had the same ordered pass.
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
    precipitationCollected,
    fueledGenerationPerSecond: fueledGeneration,
    events,
  };
}

export interface PurchaseCost {
  readonly cash?: number;
  readonly materials?: readonly { readonly goodId: MaterialId; readonly amount: number }[];
}
