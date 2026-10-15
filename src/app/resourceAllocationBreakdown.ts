import { COMPOUND_IDS, type CompoundId, type MaterialId } from "../content/ids";
import { createEconomyTickPlan } from "../engine/economySimulation";
import { philosophyCompoundRecipe } from "../engine/philosophy";
import { transactResources } from "../engine/transactions";
import type { GameState } from "../engine/state";

interface CachedAllocationPreview {
  readonly events: ReturnType<typeof transactResources>["events"];
  readonly economyTick: ReturnType<typeof createEconomyTickPlan>;
}

const previewByState = new WeakMap<GameState, CachedAllocationPreview>();
const breakdownByState = new WeakMap<
  GameState,
  Map<MaterialId, ResourceAllocationBreakdown | null>
>();

export interface CompoundAllocationDraw {
  readonly compoundId: CompoundId;
  readonly rate: number;
}

export interface ResourceAllocationBreakdown {
  readonly allocatable: number;
  readonly soldForCash: number;
  readonly compoundCeiling: number;
  readonly compoundDraws: readonly CompoundAllocationDraw[];
  readonly unusedCompoundShare: number;
  readonly storage: number;
  readonly autoSellIncome: number;
}

function nanoBrokersLevel(state: GameState): number {
  return state.permanent.acquiredPerks.reduce((level, perk) => {
    if (perk === "nanoBrokers") return Math.max(level, 1);
    if (!perk.startsWith("nanoBrokers:")) return level;
    const parsed = Number(perk.slice("nanoBrokers:".length));
    return Number.isInteger(parsed) ? Math.max(level, Math.min(3, parsed)) : level;
  }, 0);
}

export function resourceAllocationBreakdown(
  state: GameState,
  goodId: MaterialId,
): ResourceAllocationBreakdown | null {
  let stateBreakdowns = breakdownByState.get(state);
  if (!stateBreakdowns) {
    stateBreakdowns = new Map();
    breakdownByState.set(state, stateBreakdowns);
  }
  if (stateBreakdowns.has(goodId)) return stateBreakdowns.get(goodId) ?? null;
  if (nanoBrokersLevel(state) < 1) {
    stateBreakdowns.set(goodId, null);
    return null;
  }

  let cachedPreview = previewByState.get(state);
  if (!cachedPreview) {
    const economyTick = createEconomyTickPlan(state);
    const preview = transactResources(state.run.goods, state.run.cash, 1_000, economyTick.tickPlan);
    cachedPreview = { economyTick, events: preview.events };
    previewByState.set(state, cachedPreview);
  }
  const { economyTick, events } = cachedPreview;
  const gross = economyTick.tickPlan.productionPerSecond?.[goodId] ?? 0;
  const fuel = events.reduce(
    (sum, event) =>
      event.type === "resource.fuel-burned" && event.goodId === goodId
        ? sum + event.amount
        : sum,
    0,
  );
  const allocatable = Math.max(0, gross - fuel);
  const soldForCash = events.reduce(
    (sum, event) =>
      event.type === "resource.sold" &&
      event.goodId === goodId &&
      event.origin === "automatic"
        ? sum + event.amount
        : sum,
    0,
  );
  const autoSellIncome = events.reduce(
    (sum, event) =>
      event.type === "resource.sold" &&
      event.goodId === goodId &&
      event.origin === "automatic"
        ? sum + event.cash
        : sum,
    0,
  );
  const allocation = state.run.economy.resourceAllocation[goodId];
  const compoundCeiling =
    nanoBrokersLevel(state) >= 2 && allocation.enabled
      ? (allocatable * allocation.compoundShare) / 100
      : 0;
  const activeConsumers = COMPOUND_IDS.filter(
    (compoundId) =>
      state.run.economy.autoCreateEnabled[compoundId] &&
      philosophyCompoundRecipe(state, compoundId).some((input) => input.goodId === goodId),
  );
  const compoundDraws = activeConsumers.map((compoundId) => {
    const inputRate =
      economyTick.tickPlan.crafting
        ?.find((demand) => demand.outputId === compoundId)
        ?.inputs.filter((input) => input.goodId === goodId)
        .reduce((sum, input) => sum + input.unitsPerOutput, 0) ??
      philosophyCompoundRecipe(state, compoundId)
        .filter((input) => input.goodId === goodId)
        .reduce((sum, input) => sum + input.amount, 0);
    const created = events.reduce(
      (sum, event) =>
        event.type === "compound.created" && event.goodId === compoundId
          ? sum + event.amount
          : sum,
      0,
    );
    return { compoundId, rate: created * inputRate };
  }).filter((draw) => draw.rate > 0);
  const divertedToCompounds = compoundDraws.reduce((sum, draw) => sum + draw.rate, 0);
  const unusedCompoundShare = Math.max(0, compoundCeiling - divertedToCompounds);

  const breakdown = {
    allocatable,
    soldForCash,
    compoundCeiling,
    compoundDraws,
    unusedCompoundShare,
    storage: Math.max(0, allocatable - soldForCash - divertedToCompounds),
    autoSellIncome,
  };
  stateBreakdowns.set(goodId, breakdown);
  return breakdown;
}
