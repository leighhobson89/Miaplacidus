import {
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  type CompoundId,
  type EconomicGoodId,
  type MaterialId,
} from "../content/ids";
import { createEconomyTickPlan } from "../engine/economySimulation";
import { philosophyCompoundRecipe } from "../engine/philosophy";
import { transactResources } from "../engine/transactions";
import type { GameState } from "../engine/state";

export interface CompoundAutoCreateStatus {
  readonly rate: number;
  readonly throttledBy: EconomicGoodId | null;
}

const statusByState = new WeakMap<GameState, ReadonlyMap<CompoundId, CompoundAutoCreateStatus>>();

export function compoundsUsingMaterial(state: GameState, materialId: MaterialId): CompoundId[] {
  return COMPOUND_IDS.filter((compoundId) =>
    philosophyCompoundRecipe(state, compoundId).some((input) => input.goodId === materialId),
  );
}

export function compoundAutoCreateStatus(
  state: GameState,
  compoundId: CompoundId,
): CompoundAutoCreateStatus {
  let statusByCompound = statusByState.get(state);
  if (!statusByCompound) {
    statusByCompound = calculateStatuses(state);
    statusByState.set(state, statusByCompound);
  }
  return statusByCompound.get(compoundId) ?? { rate: 0, throttledBy: null };
}

function calculateStatuses(state: GameState): ReadonlyMap<CompoundId, CompoundAutoCreateStatus> {
  const economyTick = createEconomyTickPlan(state);
  const transaction = transactResources(
    state.run.goods,
    state.run.cash,
    1_000,
    economyTick.tickPlan,
  );
  const produced = new Map<EconomicGoodId, number>();
  const fuelBurned = new Map<EconomicGoodId, number>();
  const sold = new Map<EconomicGoodId, number>();
  const created = new Map<CompoundId, number>();
  for (const event of transaction.events) {
    if (event.type === "resource.produced") {
      produced.set(event.goodId, (produced.get(event.goodId) ?? 0) + event.amount);
    } else if (event.type === "resource.fuel-burned") {
      fuelBurned.set(event.goodId, (fuelBurned.get(event.goodId) ?? 0) + event.amount);
    } else if (event.type === "resource.sold") {
      sold.set(event.goodId, (sold.get(event.goodId) ?? 0) + event.amount);
    } else if (
      event.type === "compound.created" &&
      COMPOUND_IDS.includes(event.goodId as CompoundId)
    ) {
      const compoundId = event.goodId as CompoundId;
      created.set(compoundId, (created.get(compoundId) ?? 0) + event.amount);
    }
  }

  const quantities = new Map<EconomicGoodId, number>(
    ECONOMIC_GOOD_IDS.map((goodId) => [
      goodId,
      Math.max(
        0,
        state.run.goods[goodId].quantity +
          (produced.get(goodId) ?? 0) -
          (fuelBurned.get(goodId) ?? 0) -
          (sold.get(goodId) ?? 0),
      ),
    ]),
  );
  const compoundBudgets = new Map<MaterialId, number>();
  for (const materialId of Object.keys(
    economyTick.tickPlan.productionAllocation ?? {},
  ) as MaterialId[]) {
    const allocation = economyTick.tickPlan.productionAllocation?.[materialId];
    if (!allocation?.enabled) continue;
    const newProduction = Math.max(
      0,
      (produced.get(materialId) ?? 0) -
        Math.min(produced.get(materialId) ?? 0, fuelBurned.get(materialId) ?? 0),
    );
    compoundBudgets.set(materialId, (newProduction * allocation.compoundShare) / 100);
  }

  const demands = [...(economyTick.tickPlan.crafting ?? [])].sort(
    (left, right) =>
      (left.priority ?? 0) - (right.priority ?? 0) ||
      (left.outputId < right.outputId ? -1 : left.outputId > right.outputId ? 1 : 0),
  );
  const consumerCount = new Map<EconomicGoodId, number>();
  for (const demand of demands) {
    if (!demand.inputBudgeted) continue;
    for (const inputId of new Set(demand.inputs.map((input) => input.goodId))) {
      consumerCount.set(inputId, (consumerCount.get(inputId) ?? 0) + 1);
    }
  }

  const statuses = new Map<CompoundId, CompoundAutoCreateStatus>();
  for (const demand of demands) {
    if (!COMPOUND_IDS.includes(demand.outputId as CompoundId)) continue;
    const compoundId = demand.outputId as CompoundId;
    const output = quantities.get(compoundId) ?? 0;
    let creatable = Math.max(0, state.run.goods[compoundId].storageCapacity - output);
    const ratios = new Map<EconomicGoodId, number>();
    for (const input of demand.inputs) {
      ratios.set(input.goodId, (ratios.get(input.goodId) ?? 0) + input.unitsPerOutput);
    }

    let throttledBy: EconomicGoodId | null = null;
    for (const [inputId, ratio] of ratios) {
      if (ratio <= 0) continue;
      const consumers = consumerCount.get(inputId) ?? 0;
      const share =
        consumers > 0 ? (compoundBudgets.get(inputId as MaterialId) ?? 0) / consumers : 0;
      const permits = Math.min(share, quantities.get(inputId) ?? 0) / ratio;
      if (permits < creatable) {
        creatable = permits;
        throttledBy = inputId;
      }
    }

    const amountCreated = created.get(compoundId) ?? 0;
    statuses.set(compoundId, {
      rate: amountCreated,
      throttledBy,
    });
    for (const [inputId, ratio] of ratios) {
      quantities.set(
        inputId,
        Math.max(0, (quantities.get(inputId) ?? 0) - amountCreated * ratio),
      );
    }
    quantities.set(compoundId, output + amountCreated);
  }
  return statuses;
}
