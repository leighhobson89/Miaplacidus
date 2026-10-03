import {
  LOCALE_IDS,
  MATERIAL_IDS,
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  isEconomicGoodId,
  isEventId,
  isTechId,
  isUpgradeId,
  type AutobuyerTier,
  type CompoundId,
  type EconomicGoodId,
  type EventId,
  type FixedUpgradeId,
  type MaterialId,
  type UpgradeId,
  autobuyerUpgradeId,
  storageUpgradeId,
} from "../content/ids";
import { advanceClock, pauseClock, resumeClock, type ClockInput } from "./clock";
import { canAfford, settleSpend } from "./precision";
import { nextRandom } from "./random";
import { hydrogenAutobuyerCount, hydrogenAutobuyerPrice } from "../content/hydrogen";
import {
  COMPOUND_CATALOG,
  ECONOMY_PRICE_MULTIPLIER,
  MATERIAL_CATALOG,
  SCIENCE_BUILDINGS,
  ENERGY_BUILDINGS,
  type BuyerTierDefinition,
  type CompoundDefinition,
  type MaterialDefinition,
} from "../content/economy";
import { TECHNOLOGY_BY_ID, TECHNOLOGY_CATALOG } from "../content/technology";
import {
  affordablePurchaseCount,
  permanentPerkPurchaseCount,
  scaledPriceAfterPurchases,
  selectedSaleAmount,
  stockAfterSale,
  storageCapacityAfterPurchase,
  storagePurchaseCost,
} from "../content/economyRules";
import {
  createInitialGameState,
  isValidGameState,
  type GameState,
  type GoodState,
  type SettingsState,
} from "./state";
import { advanceTimers, completeTimer, createTimer, type TimerEvent } from "./timers";
import {
  transactResources,
  type PurchaseCost,
  type ResourceTransactionEvent,
  type TickPlan,
} from "./transactions";
import type { TimerDomain, TimerId } from "./runtimeTypes";

export interface PurchaseCommand {
  readonly type: "upgrade.purchase";
  readonly upgradeId: UpgradeId;
  readonly count?: number;
  readonly cost: PurchaseCost;
}

export type GameCommand =
  | PurchaseCommand
  | { readonly type: "resource.collect"; readonly goodId: MaterialId }
  | {
      readonly type: "resource.sell";
      readonly goodId: EconomicGoodId;
      readonly amount: number | "all" | "threeQuarters" | "twoThirds" | "half" | "oneThird";
    }
  | { readonly type: "storage.purchase"; readonly goodId: EconomicGoodId }
  | { readonly type: "economy.storage.increaseAll" }
  | { readonly type: "hydrogen.autobuyer.purchase" }
  | { readonly type: "hydrogen.autobuyer.toggle"; readonly enabled: boolean }
  | {
      readonly type: "economy.autobuyer.purchase";
      readonly goodId: EconomicGoodId;
      readonly tier: AutobuyerTier;
    }
  | {
      readonly type: "economy.autobuyer.buyMax";
      readonly goodId: EconomicGoodId;
      readonly tier: AutobuyerTier;
    }
  | {
      readonly type: "economy.autobuyer.toggle";
      readonly goodId: EconomicGoodId;
      readonly tier: AutobuyerTier;
      readonly enabled: boolean;
    }
  | {
      readonly type: "economy.compound.create";
      readonly goodId: CompoundId;
      readonly amount: number;
    }
  | {
      readonly type: "economy.fuse";
      readonly sourceId: MaterialId;
      readonly targetId: MaterialId;
      readonly amount: number;
    }
  | { readonly type: "economy.research"; readonly technologyId: import("../content/ids").TechId }
  | { readonly type: "economy.building.purchase"; readonly buildingId: FixedUpgradeId }
  | { readonly type: "economy.building.buyMax"; readonly buildingId: FixedUpgradeId }
  | {
      readonly type: "economy.building.toggle";
      readonly buildingId: FixedUpgradeId;
      readonly enabled: boolean;
    }
  | {
      readonly type: "economy.allocation.set";
      readonly goodId: MaterialId;
      readonly cashShare: number;
      readonly compoundShare: number;
      readonly enabled: boolean;
    }
  | {
      readonly type: "economy.autoCreate.toggle";
      readonly goodId: CompoundId;
      readonly enabled: boolean;
    }
  | { readonly type: "economy.power.toggle"; readonly enabled: boolean }
  | { readonly type: "economy.research.autobuyer.toggle"; readonly enabled: boolean }
  | {
      readonly type: "clock.advance";
      readonly input: ClockInput;
      readonly tickPlan?: TickPlan;
      readonly offlineTickPlan?: TickPlan;
    }
  | { readonly type: "clock.pause" }
  | { readonly type: "clock.resume" }
  | {
      readonly type: "timer.add";
      readonly timerId: TimerId;
      readonly domain: TimerDomain;
      readonly durationMs: number;
      readonly repeat?: boolean;
      readonly paused?: boolean;
      readonly eventId?: EventId;
      readonly goodId?: EconomicGoodId;
    }
  | { readonly type: "timer.pause"; readonly timerId: TimerId }
  | { readonly type: "timer.resume"; readonly timerId: TimerId }
  | { readonly type: "timer.complete"; readonly timerId: TimerId }
  | { readonly type: "settings.update"; readonly patch: Partial<SettingsState> }
  | { readonly type: "random.draw"; readonly purpose: string };

export type CommandFailure =
  | { readonly code: "invalid-state"; readonly messageKey: "engine.error.invalid-state" }
  | { readonly code: "invalid-command"; readonly messageKey: "engine.error.invalid-command" }
  | { readonly code: "invalid-cost"; readonly messageKey: "engine.error.invalid-cost" }
  | {
      readonly code: "insufficient-cash";
      readonly messageKey: "engine.purchase.insufficient-cash";
      readonly required: number;
    }
  | {
      readonly code: "insufficient-material";
      readonly messageKey: "engine.purchase.insufficient-material";
      readonly goodId: EconomicGoodId;
      readonly required: number;
    }
  | {
      readonly code: "timer-exists";
      readonly messageKey: "engine.timer.already-exists";
      readonly timerId: TimerId;
    }
  | {
      readonly code: "timer-missing";
      readonly messageKey: "engine.timer.not-found";
      readonly timerId: TimerId;
    }
  | { readonly code: "invalid-settings"; readonly messageKey: "engine.settings.invalid" }
  | { readonly code: "inventory-full"; readonly messageKey: "ui.hydrogen.inventory-full" }
  | { readonly code: "no-stock"; readonly messageKey: "ui.hydrogen.no-stock" }
  | { readonly code: "autobuyer-unavailable"; readonly messageKey: "ui.hydrogen.autobuyer-locked" }
  | { readonly code: "transition-failed"; readonly messageKey: "engine.error.recovered" };

export type PreconditionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly failure: CommandFailure };

export type EngineEvent =
  | { readonly type: "purchase.completed"; readonly upgradeId: UpgradeId; readonly count: number }
  | { readonly type: "resource.collected"; readonly goodId: MaterialId; readonly amount: number }
  | {
      readonly type: "storage.increased";
      readonly goodId: EconomicGoodId;
      readonly capacity: number;
    }
  | { readonly type: "hydrogen.autobuyer.changed"; readonly enabled: boolean }
  | { readonly type: "clock.paused" }
  | { readonly type: "clock.resumed" }
  | { readonly type: "timer.paused"; readonly timerId: TimerId }
  | { readonly type: "timer.resumed"; readonly timerId: TimerId }
  | { readonly type: "settings.changed"; readonly settings: SettingsState }
  | { readonly type: "random.drawn"; readonly purpose: string; readonly value: number }
  | TimerEvent
  | ResourceTransactionEvent;

export interface EngineResult {
  readonly accepted: boolean;
  readonly state: GameState;
  readonly events: readonly EngineEvent[];
  readonly failure?: CommandFailure;
}

function reject(state: GameState, failure: CommandFailure): EngineResult {
  return { accepted: false, state, events: [], failure };
}

function success(
  state: GameState,
  events: readonly EngineEvent[] = [],
  fallbackState: GameState = state,
): EngineResult {
  if (!isValidGameState(state)) {
    return reject(fallbackState, {
      code: "transition-failed",
      messageKey: "engine.error.recovered",
    });
  }
  return { accepted: true, state, events };
}

function invalidCost(cost: PurchaseCost): boolean {
  if (cost.cash !== undefined && (!Number.isFinite(cost.cash) || cost.cash < 0)) {
    return true;
  }
  const materials = cost.materials ?? [];
  return (
    materials.length > 3 ||
    materials.some((entry) => !Number.isFinite(entry.amount) || entry.amount < 0) ||
    !Number.isFinite(materials.reduce((total, entry) => total + entry.amount, 0))
  );
}

function materialCosts(cost: PurchaseCost): Map<MaterialId, number> {
  const totals = new Map<MaterialId, number>();
  for (const entry of cost.materials ?? []) {
    totals.set(entry.goodId, (totals.get(entry.goodId) ?? 0) + entry.amount);
  }
  return totals;
}

function technologyUnlocked(state: GameState, techId: string | null | undefined): boolean {
  return (
    !techId ||
    state.run.economy.researchedTechnologies.includes(techId as import("../content/ids").TechId)
  );
}

function goodUnlocked(state: GameState, goodId: EconomicGoodId): boolean {
  return MATERIAL_IDS.includes(goodId as MaterialId)
    ? state.run.unlockedResources.includes(goodId as MaterialId)
    : state.run.economy.unlockedCompounds.includes(goodId as CompoundId);
}

function canAffordMaterials(
  state: GameState,
  cash: number,
  materials: readonly { readonly goodId: EconomicGoodId; readonly amount: number }[],
): boolean {
  return (
    canAfford(state.run.cash, cash) &&
    materials.every(({ goodId, amount }) => canAfford(state.run.goods[goodId].quantity, amount))
  );
}

function buildingCost(
  state: GameState,
  buildingId: FixedUpgradeId,
  owned = state.run.upgrades[buildingId] ?? 0,
) {
  if (buildingId in SCIENCE_BUILDINGS) {
    return {
      cash: scaledPriceAfterPurchases(
        SCIENCE_BUILDINGS[buildingId as keyof typeof SCIENCE_BUILDINGS].price,
        owned,
      ),
      materials: [] as readonly { goodId: EconomicGoodId; amount: number }[],
    };
  }
  const base = ENERGY_BUILDINGS[buildingId as keyof typeof ENERGY_BUILDINGS].price;
  return {
    cash: scaledPriceAfterPurchases(base.cash, owned),
    materials: base.materials.map((entry) => ({
      ...entry,
      amount: scaledPriceAfterPurchases(entry.amount, owned),
    })),
  };
}

export interface BuildingBuyMaxPlan {
  readonly count: number;
  readonly cash: number;
  readonly materials: readonly { readonly goodId: EconomicGoodId; readonly amount: number }[];
}

export function buildingBuyMaxPlan(
  state: GameState,
  buildingId: FixedUpgradeId,
): BuildingBuyMaxPlan {
  const owned = state.run.upgrades[buildingId] ?? 0;
  const remaining = new Map<EconomicGoodId, number>(
    ECONOMIC_GOOD_IDS.map((id) => [id, state.run.goods[id].quantity]),
  );
  const spent = new Map<EconomicGoodId, number>();
  let cashRemaining = state.run.cash;
  let cashSpent = 0;
  let count = 0;
  while (count < 10_000) {
    const cost = buildingCost(state, buildingId, owned + count);
    if (!Number.isFinite(cost.cash) || !canAfford(cashRemaining, cost.cash)) break;
    const fitsMaterials = cost.materials.every((entry) =>
      canAfford(remaining.get(entry.goodId) ?? 0, entry.amount),
    );
    if (!fitsMaterials) break;
    cashRemaining = settleSpend(cashRemaining, cost.cash);
    cashSpent += cost.cash;
    for (const entry of cost.materials) {
      remaining.set(entry.goodId, settleSpend(remaining.get(entry.goodId) ?? 0, entry.amount));
      spent.set(entry.goodId, (spent.get(entry.goodId) ?? 0) + entry.amount);
    }
    count += 1;
  }
  return {
    count,
    cash: cashSpent,
    materials: [...spent].map(([goodId, amount]) => ({ goodId, amount })),
  };
}

function materialDefinition(goodId: MaterialId): MaterialDefinition {
  return MATERIAL_CATALOG[goodId] as MaterialDefinition;
}

function compoundDefinition(goodId: CompoundId): CompoundDefinition {
  return COMPOUND_CATALOG[goodId] as CompoundDefinition;
}

function buyerDefinition(
  goodId: EconomicGoodId,
  tier: AutobuyerTier,
): BuyerTierDefinition | undefined {
  return MATERIAL_IDS.includes(goodId as MaterialId)
    ? materialDefinition(goodId as MaterialId).buyerTiers[tier - 1]
    : compoundDefinition(goodId as CompoundId).buyerTiers[tier - 1];
}

function buyerTierTechnology(tier: AutobuyerTier): import("../content/ids").TechId | null {
  if (tier === 2) return "quantumComputing";
  if (tier === 4) return "rocketComposites";
  return null;
}

function nanoBrokersLevel(state: GameState): number {
  return state.permanent.acquiredPerks.reduce((level, perk) => {
    if (perk === "nanoBrokers") return Math.max(level, 1);
    if (!perk.startsWith("nanoBrokers:")) return level;
    const parsed = Number(perk.slice("nanoBrokers:".length));
    return Number.isInteger(parsed) ? Math.max(level, Math.min(3, parsed)) : level;
  }, 0);
}

function hasPermanentPerk(state: GameState, perkId: string): boolean {
  return state.permanent.acquiredPerks.includes(perkId);
}

function storageCosts(
  state: GameState,
  goodId: EconomicGoodId,
): readonly { readonly goodId: EconomicGoodId; readonly amount: number }[] {
  const capacity = state.run.goods[goodId].storageCapacity;
  return goodId === "water"
    ? [
        { goodId, amount: storagePurchaseCost(capacity) },
        { goodId: "concrete", amount: capacity * 0.3 },
      ]
    : [{ goodId, amount: storagePurchaseCost(capacity) }];
}

function canBuyStorage(state: GameState, goodId: EconomicGoodId): boolean {
  const capacity = state.run.goods[goodId].storageCapacity;
  const purchases = permanentPerkPurchaseCount(state.permanent.acquiredPerks, "efficientStorage");
  return (
    goodUnlocked(state, goodId) &&
    Number.isFinite(storageCapacityAfterPurchase(capacity, purchases)) &&
    storageCosts(state, goodId).every(({ goodId: inputId, amount }) =>
      canAfford(state.run.goods[inputId].quantity, amount),
    )
  );
}

function compoundUnlocksForTechnology(
  technologyId: import("../content/ids").TechId,
): readonly CompoundId[] {
  return COMPOUND_IDS.filter((id) => COMPOUND_CATALOG[id].unlockTechId === technologyId);
}

function buildingTech(buildingId: FixedUpgradeId): string | null {
  return buildingId in SCIENCE_BUILDINGS
    ? SCIENCE_BUILDINGS[buildingId as keyof typeof SCIENCE_BUILDINGS].techId
    : ENERGY_BUILDINGS[buildingId as keyof typeof ENERGY_BUILDINGS].techId;
}

export function checkPurchase(state: GameState, command: PurchaseCommand): PreconditionResult {
  if (!isUpgradeId(command.upgradeId)) {
    return {
      ok: false,
      failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
    };
  }
  if (invalidCost(command.cost)) {
    return {
      ok: false,
      failure: { code: "invalid-cost", messageKey: "engine.error.invalid-cost" },
    };
  }
  if ((command.cost.materials ?? []).some((entry) => !MATERIAL_IDS.includes(entry.goodId))) {
    return {
      ok: false,
      failure: { code: "invalid-cost", messageKey: "engine.error.invalid-cost" },
    };
  }
  const count = command.count ?? 1;
  if (!Number.isSafeInteger(count) || count <= 0) {
    return {
      ok: false,
      failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
    };
  }
  if (!Number.isSafeInteger((state.run.upgrades[command.upgradeId] ?? 0) + count)) {
    return {
      ok: false,
      failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
    };
  }
  const cashCost = command.cost.cash ?? 0;
  if (!canAfford(state.run.cash, cashCost)) {
    return {
      ok: false,
      failure: {
        code: "insufficient-cash",
        messageKey: "engine.purchase.insufficient-cash",
        required: cashCost,
      },
    };
  }
  for (const [goodId, required] of materialCosts(command.cost)) {
    if (!canAfford(state.run.goods[goodId].quantity, required)) {
      return {
        ok: false,
        failure: {
          code: "insufficient-material",
          messageKey: "engine.purchase.insufficient-material",
          goodId,
          required,
        },
      };
    }
  }
  return { ok: true };
}

function isValidTickPlan(plan: TickPlan | undefined): boolean {
  if (plan === undefined) return true;
  if (!plan || typeof plan !== "object") return false;
  if (
    (plan.productionPerSecond !== undefined &&
      (!plan.productionPerSecond ||
        typeof plan.productionPerSecond !== "object" ||
        Array.isArray(plan.productionPerSecond))) ||
    (plan.salesPerSecond !== undefined &&
      (!plan.salesPerSecond ||
        typeof plan.salesPerSecond !== "object" ||
        Array.isArray(plan.salesPerSecond))) ||
    (plan.power !== undefined &&
      (!Number.isFinite(plan.power.generationPerSecond) ||
        plan.power.generationPerSecond < 0 ||
        !Number.isFinite(plan.power.demandPerSecond) ||
        plan.power.demandPerSecond < 0)) ||
    (plan.researchPerSecond !== undefined &&
      (!Number.isFinite(plan.researchPerSecond) || plan.researchPerSecond < 0))
  )
    return false;
  for (const [id, rate] of Object.entries(plan.productionPerSecond ?? {})) {
    if (!isEconomicGoodId(id) || !Number.isFinite(rate) || rate < 0) return false;
  }
  for (const [id, rate] of Object.entries(plan.salesPerSecond ?? {})) {
    if (!isEconomicGoodId(id) || !Number.isFinite(rate) || rate < 0) return false;
  }
  if (plan.fuel !== undefined) {
    if (!Array.isArray(plan.fuel)) return false;
    if (
      plan.fuel.some(
        (entry) =>
          !entry ||
          !isEconomicGoodId(entry.goodId) ||
          !Number.isFinite(entry.unitsPerSecond) ||
          entry.unitsPerSecond < 0 ||
          (entry.energyPerFuel !== undefined &&
            (!Number.isFinite(entry.energyPerFuel) || entry.energyPerFuel < 0)),
      )
    ) {
      return false;
    }
  }
  if (plan.crafting !== undefined) {
    if (!Array.isArray(plan.crafting)) return false;
    for (const demand of plan.crafting) {
      if (
        !demand ||
        !isEconomicGoodId(demand.outputId) ||
        !Number.isFinite(demand.unitsPerSecond) ||
        demand.unitsPerSecond < 0 ||
        (demand.inputBudgeted !== undefined && typeof demand.inputBudgeted !== "boolean") ||
        (demand.priority !== undefined && !Number.isFinite(demand.priority)) ||
        !Array.isArray(demand.inputs) ||
        demand.inputs.some(
          (input: { readonly goodId: EconomicGoodId; readonly unitsPerOutput: number }) =>
            !input ||
            !isEconomicGoodId(input.goodId) ||
            !Number.isFinite(input.unitsPerOutput) ||
            input.unitsPerOutput < 0,
        )
      ) {
        return false;
      }
    }
  }
  return true;
}

function isValidClockInput(input: ClockInput): boolean {
  return (
    input !== null &&
    typeof input === "object" &&
    Number.isFinite(input.wallNowMs) &&
    input.wallNowMs >= 0 &&
    typeof input.foreground === "boolean" &&
    (input.offlineElapsedMs === undefined ||
      (Number.isFinite(input.offlineElapsedMs) && input.offlineElapsedMs >= 0)) &&
    (input.timeWarpMultiplier === undefined ||
      (Number.isFinite(input.timeWarpMultiplier) && input.timeWarpMultiplier > 0)) &&
    (input.blackHolePower === undefined ||
      (Number.isFinite(input.blackHolePower) && input.blackHolePower > 0)) &&
    (input.blackHoleAlwaysOn === undefined || typeof input.blackHoleAlwaysOn === "boolean")
  );
}

export function checkPreconditions(state: GameState, command: GameCommand): PreconditionResult {
  if (!isValidGameState(state)) {
    return {
      ok: false,
      failure: { code: "invalid-state", messageKey: "engine.error.invalid-state" },
    };
  }
  switch (command.type) {
    case "upgrade.purchase":
      return checkPurchase(state, command);
    case "resource.collect": {
      const good = state.run.goods[command.goodId];
      return MATERIAL_IDS.includes(command.goodId) &&
        state.run.unlockedResources.includes(command.goodId) &&
        good.quantity + 1 <= good.storageCapacity
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "inventory-full",
              messageKey: "ui.hydrogen.inventory-full",
            },
          };
    }
    case "resource.sell": {
      if (
        !isEconomicGoodId(command.goodId) ||
        (typeof command.amount === "number" &&
          (!Number.isSafeInteger(command.amount) || command.amount <= 0)) ||
        (typeof command.amount === "string" &&
          !["all", "threeQuarters", "twoThirds", "half", "oneThird"].includes(command.amount))
      ) {
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      }
      return goodUnlocked(state, command.goodId) &&
        selectedSaleAmount(state.run.goods[command.goodId].quantity, command.amount) > 0
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "no-stock", messageKey: "ui.hydrogen.no-stock" },
          };
    }
    case "storage.purchase": {
      if (!isEconomicGoodId(command.goodId) || !goodUnlocked(state, command.goodId)) {
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      }
      const target = state.run.goods[command.goodId];
      const cost = storagePurchaseCost(target.storageCapacity);
      const materials: { goodId: EconomicGoodId; amount: number }[] = [
        { goodId: command.goodId, amount: cost },
      ];
      if (command.goodId === "water")
        materials.push({ goodId: "concrete", amount: target.storageCapacity * 0.3 });
      if (
        !Number.isFinite(
          storageCapacityAfterPurchase(
            target.storageCapacity,
            permanentPerkPurchaseCount(state.permanent.acquiredPerks, "efficientStorage"),
          ),
        ) ||
        !Number.isSafeInteger((state.run.upgrades[storageUpgradeId(command.goodId)] ?? 0) + 1)
      ) {
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      }
      return materials.every(({ goodId, amount }) =>
        canAfford(state.run.goods[goodId].quantity, amount),
      )
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "insufficient-material",
              messageKey: "engine.purchase.insufficient-material",
              goodId:
                materials.find(
                  ({ goodId, amount }) => !canAfford(state.run.goods[goodId].quantity, amount),
                )?.goodId ?? (command.goodId as MaterialId),
              required:
                materials.find(
                  ({ goodId, amount }) => !canAfford(state.run.goods[goodId].quantity, amount),
                )?.amount ?? cost,
            },
          };
    }
    case "economy.storage.increaseAll":
      return ECONOMIC_GOOD_IDS.some((goodId) => canBuyStorage(state, goodId))
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "insufficient-material",
              messageKey: "engine.purchase.insufficient-material",
              goodId: "hydrogen",
              required: 0,
            },
          };
    case "hydrogen.autobuyer.purchase": {
      const owned = hydrogenAutobuyerCount(state.run.upgrades);
      const cost = hydrogenAutobuyerPrice(owned);
      if (!Number.isSafeInteger(owned + 1) || !Number.isFinite(cost)) {
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      }
      return canAfford(state.run.goods.hydrogen.quantity, cost)
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "insufficient-material",
              messageKey: "engine.purchase.insufficient-material",
              goodId: "hydrogen",
              required: cost,
            },
          };
    }
    case "hydrogen.autobuyer.toggle":
      return typeof command.enabled === "boolean" && hydrogenAutobuyerCount(state.run.upgrades) > 0
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "autobuyer-unavailable",
              messageKey: "ui.hydrogen.autobuyer-locked",
            },
          };
    case "economy.autobuyer.purchase": {
      if (
        !isEconomicGoodId(command.goodId) ||
        ![1, 2, 3, 4].includes(command.tier) ||
        !goodUnlocked(state, command.goodId)
      )
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      if (COMPOUND_IDS.includes(command.goodId as CompoundId) && nanoBrokersLevel(state) < 3)
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      const def = buyerDefinition(command.goodId, command.tier);
      if (!def || !technologyUnlocked(state, buyerTierTechnology(command.tier)))
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      const upgradeId = autobuyerUpgradeId(command.goodId, command.tier);
      const owned = state.run.upgrades[upgradeId] ?? 0;
      const price = scaledPriceAfterPurchases(def.price, owned, ECONOMY_PRICE_MULTIPLIER);
      return Number.isFinite(price) && canAfford(state.run.goods[command.goodId].quantity, price)
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "insufficient-material",
              messageKey: "engine.purchase.insufficient-material",
              goodId: command.goodId as MaterialId,
              required: price,
            },
          };
    }
    case "economy.autobuyer.buyMax": {
      if (
        !isEconomicGoodId(command.goodId) ||
        ![1, 2, 3, 4].includes(command.tier) ||
        !goodUnlocked(state, command.goodId) ||
        !hasPermanentPerk(state, "bulkPurchasing") ||
        !technologyUnlocked(state, buyerTierTechnology(command.tier))
      )
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      if (COMPOUND_IDS.includes(command.goodId as CompoundId) && nanoBrokersLevel(state) < 3)
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      const definition = buyerDefinition(command.goodId, command.tier);
      if (!definition)
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      const upgradeId = autobuyerUpgradeId(command.goodId, command.tier);
      const owned = state.run.upgrades[upgradeId] ?? 0;
      return affordablePurchaseCount(
        definition.price,
        owned,
        state.run.goods[command.goodId].quantity,
      ).count > 0
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "insufficient-material",
              messageKey: "engine.purchase.insufficient-material",
              goodId: command.goodId,
              required: scaledPriceAfterPurchases(definition.price, owned),
            },
          };
    }
    case "economy.autobuyer.toggle":
      return isEconomicGoodId(command.goodId) &&
        [1, 2, 3, 4].includes(command.tier) &&
        typeof command.enabled === "boolean" &&
        goodUnlocked(state, command.goodId) &&
        (state.run.upgrades[autobuyerUpgradeId(command.goodId, command.tier)] ?? 0) > 0
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "autobuyer-unavailable", messageKey: "ui.hydrogen.autobuyer-locked" },
          };
    case "economy.compound.create": {
      if (
        !COMPOUND_IDS.includes(command.goodId) ||
        !Number.isSafeInteger(command.amount) ||
        command.amount <= 0 ||
        !state.run.economy.unlockedCompounds.includes(command.goodId)
      )
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      const output = state.run.goods[command.goodId];
      const recipe = compoundDefinition(command.goodId).recipe;
      const enoughInputs = recipe.every((input) =>
        canAfford(state.run.goods[input.goodId].quantity, input.amount * command.amount),
      );
      return enoughInputs && output.quantity + command.amount <= output.storageCapacity
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "insufficient-material",
              messageKey: "engine.purchase.insufficient-material",
              goodId:
                recipe.find(
                  (input) =>
                    !canAfford(
                      state.run.goods[input.goodId].quantity,
                      input.amount * command.amount,
                    ),
                )?.goodId ?? recipe[0]!.goodId,
              required:
                recipe.find(
                  (input) =>
                    !canAfford(
                      state.run.goods[input.goodId].quantity,
                      input.amount * command.amount,
                    ),
                )?.amount ?? command.amount,
            },
          };
    }
    case "economy.fuse": {
      const sourceDefinition = materialDefinition(command.sourceId);
      const validTarget = sourceDefinition.fusionOutputs?.some(
        (output) => output.goodId === command.targetId,
      );
      const techId = sourceDefinition.fusionTechId;
      return validTarget &&
        Number.isSafeInteger(command.amount) &&
        command.amount > 0 &&
        technologyUnlocked(state, techId) &&
        goodUnlocked(state, command.sourceId) &&
        state.run.goods[command.sourceId].quantity >= command.amount
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    }
    case "economy.research": {
      const definition = TECHNOLOGY_BY_ID[command.technologyId];
      if (
        !isTechId(command.technologyId) ||
        !definition ||
        state.run.economy.researchedTechnologies.includes(command.technologyId) ||
        !state.run.economy.revealedTechnologies.includes(command.technologyId) ||
        !definition.requires.every((id) => state.run.economy.researchedTechnologies.includes(id))
      )
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      return state.run.researchPoints >= definition.price
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "insufficient-cash",
              messageKey: "engine.purchase.insufficient-cash",
              required: definition.price,
            },
          };
    }
    case "economy.building.purchase": {
      if (
        !isUpgradeId(command.buildingId) ||
        !technologyUnlocked(state, buildingTech(command.buildingId))
      )
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      const cost = buildingCost(state, command.buildingId);
      return canAffordMaterials(state, cost.cash, cost.materials)
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "insufficient-cash",
              messageKey: "engine.purchase.insufficient-cash",
              required: cost.cash,
            },
          };
    }
    case "economy.building.buyMax": {
      if (
        !isUpgradeId(command.buildingId) ||
        !hasPermanentPerk(state, "bulkPurchasing") ||
        !technologyUnlocked(state, buildingTech(command.buildingId))
      )
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      const plan = buildingBuyMaxPlan(state, command.buildingId);
      if (plan.count <= 0)
        return {
          ok: false,
          failure: {
            code: "insufficient-cash",
            messageKey: "engine.purchase.insufficient-cash",
            required: buildingCost(state, command.buildingId).cash,
          },
        };
      if (command.buildingId.startsWith("battery")) {
        const baseCapacity = (
          ENERGY_BUILDINGS[command.buildingId as "battery1" | "battery2" | "battery3"] as {
            readonly capacity: number;
          }
        ).capacity;
        if (!Number.isFinite(state.run.economy.power.capacity + baseCapacity * plan.count))
          return {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
      }
      return { ok: true };
    }
    case "economy.building.toggle":
      return isUpgradeId(command.buildingId) &&
        typeof command.enabled === "boolean" &&
        (state.run.upgrades[command.buildingId] ?? 0) > 0
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "economy.allocation.set":
      return MATERIAL_IDS.includes(command.goodId) &&
        typeof command.enabled === "boolean" &&
        Number.isFinite(command.cashShare) &&
        command.cashShare >= 0 &&
        command.cashShare <= 100 &&
        Number.isFinite(command.compoundShare) &&
        command.compoundShare >= 0 &&
        command.compoundShare <= 100 &&
        command.cashShare + command.compoundShare <= 100
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "economy.autoCreate.toggle":
      return COMPOUND_IDS.includes(command.goodId) &&
        typeof command.enabled === "boolean" &&
        state.run.economy.unlockedCompounds.includes(command.goodId) &&
        nanoBrokersLevel(state) >= 2
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "economy.power.toggle":
      return typeof command.enabled === "boolean"
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "economy.research.autobuyer.toggle":
      return typeof command.enabled === "boolean" &&
        hasPermanentPerk(state, "roboticResearchAutomation")
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "timer.add":
      if (
        !command.timerId.startsWith(`${command.domain}:`) ||
        !/^[a-zA-Z0-9._-]+$/.test(command.timerId.slice(command.domain.length + 1))
      ) {
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      }
      if (state.run.timers[command.timerId]) {
        return {
          ok: false,
          failure: {
            code: "timer-exists",
            messageKey: "engine.timer.already-exists",
            timerId: command.timerId,
          },
        };
      }
      if (!Number.isFinite(command.durationMs) || command.durationMs < 1) {
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      }
      if (
        (command.eventId !== undefined && !isEventId(command.eventId)) ||
        (command.goodId !== undefined && !isEconomicGoodId(command.goodId))
      ) {
        return {
          ok: false,
          failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
        };
      }
      return { ok: true };
    case "timer.pause":
    case "timer.resume":
    case "timer.complete":
      return state.run.timers[command.timerId]
        ? { ok: true }
        : {
            ok: false,
            failure: {
              code: "timer-missing",
              messageKey: "engine.timer.not-found",
              timerId: command.timerId,
            },
          };
    case "settings.update":
      return validateSettingsPatch(command.patch)
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-settings", messageKey: "engine.settings.invalid" },
          };
    case "clock.advance":
      return isValidClockInput(command.input) &&
        isValidTickPlan(command.tickPlan) &&
        isValidTickPlan(command.offlineTickPlan)
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "clock.pause":
    case "clock.resume":
      return { ok: true };
    case "random.draw":
      return typeof command.purpose === "string" && command.purpose.length > 0
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
  }
}

function validateSettingsPatch(patch: Partial<SettingsState>): boolean {
  if (!patch || typeof patch !== "object") return false;
  const validKeys = new Set(["locale", "themeId", "notation", "soundEnabled", "reducedMotion"]);
  if (Object.keys(patch).some((key) => !validKeys.has(key))) return false;
  if (patch.locale !== undefined && !LOCALE_IDS.includes(patch.locale)) return false;
  if (
    patch.themeId !== undefined &&
    (typeof patch.themeId !== "string" || patch.themeId.length === 0)
  )
    return false;
  if (
    patch.notation !== undefined &&
    patch.notation !== "standard" &&
    patch.notation !== "scientific"
  )
    return false;
  if (patch.soundEnabled !== undefined && typeof patch.soundEnabled !== "boolean") return false;
  if (patch.reducedMotion !== undefined && typeof patch.reducedMotion !== "boolean") return false;
  return true;
}

function incrementAccepted(state: GameState): GameState {
  return {
    ...state,
    statistics: {
      ...state.statistics,
      acceptedCommands: Math.min(Number.MAX_SAFE_INTEGER, state.statistics.acceptedCommands + 1),
    },
  };
}

export function transition(state: GameState, command: GameCommand): EngineResult {
  try {
    if (!isValidGameState(state)) {
      return reject(createInitialGameState(), {
        code: "invalid-state",
        messageKey: "engine.error.invalid-state",
      });
    }
    const precondition = checkPreconditions(state, command);
    if (!precondition.ok) {
      return reject(state, precondition.failure);
    }

    switch (command.type) {
      case "resource.collect": {
        const good = state.run.goods[command.goodId];
        const goods: Record<EconomicGoodId, GoodState> = {
          ...state.run.goods,
          [command.goodId]: { ...good, quantity: good.quantity + 1 },
        };
        return success(
          incrementAccepted({
            ...state,
            run: { ...state.run, goods },
            statistics: {
              ...state.statistics,
              lifetimeGoodsProduced: state.statistics.lifetimeGoodsProduced + 1,
            },
          }),
          [{ type: "resource.collected", goodId: command.goodId, amount: 1 }],
          state,
        );
      }
      case "resource.sell": {
        const good = state.run.goods[command.goodId];
        const amount = selectedSaleAmount(good.quantity, command.amount);
        const quantity = stockAfterSale(good.quantity, amount);
        const cashEarned = amount * good.saleValue;
        const goods: Record<EconomicGoodId, GoodState> = {
          ...state.run.goods,
          [command.goodId]: { ...good, quantity },
        };
        return success(
          incrementAccepted({
            ...state,
            run: { ...state.run, goods, cash: state.run.cash + cashEarned },
            statistics: {
              ...state.statistics,
              lifetimeCashEarned: state.statistics.lifetimeCashEarned + cashEarned,
            },
          }),
          [{ type: "resource.sold", goodId: command.goodId, amount, cash: cashEarned }],
          state,
        );
      }
      case "storage.purchase": {
        const good = state.run.goods[command.goodId];
        const cost = storagePurchaseCost(good.storageCapacity);
        const capacity = storageCapacityAfterPurchase(
          good.storageCapacity,
          permanentPerkPurchaseCount(state.permanent.acquiredPerks, "efficientStorage"),
        );
        const upgradeId = storageUpgradeId(command.goodId);
        const goods: Record<EconomicGoodId, GoodState> = { ...state.run.goods };
        goods[command.goodId] = {
          ...good,
          quantity: settleSpend(good.quantity, cost),
          storageCapacity: capacity,
        };
        if (command.goodId === "water") {
          const concrete = goods.concrete;
          goods.concrete = {
            ...concrete,
            quantity: settleSpend(concrete.quantity, good.storageCapacity * 0.3),
          };
        }
        const upgrades = {
          ...state.run.upgrades,
          [upgradeId]: (state.run.upgrades[upgradeId] ?? 0) + 1,
        };
        return success(
          incrementAccepted({ ...state, run: { ...state.run, goods, upgrades } }),
          [
            { type: "purchase.completed", upgradeId, count: 1 },
            { type: "storage.increased", goodId: command.goodId, capacity },
          ],
          state,
        );
      }
      case "economy.storage.increaseAll": {
        const goods: Record<EconomicGoodId, GoodState> = { ...state.run.goods };
        const upgrades = { ...state.run.upgrades };
        const events: EngineEvent[] = [];
        let candidate: GameState = { ...state, run: { ...state.run, goods, upgrades } };
        const storagePurchaseOrder: readonly EconomicGoodId[] = [
          "water",
          ...ECONOMIC_GOOD_IDS.filter((goodId) => goodId !== "water"),
        ];
        for (const goodId of storagePurchaseOrder) {
          if (!canBuyStorage(candidate, goodId)) continue;
          const good = goods[goodId];
          for (const cost of storageCosts(candidate, goodId)) {
            goods[cost.goodId] = {
              ...goods[cost.goodId],
              quantity: settleSpend(goods[cost.goodId].quantity, cost.amount),
            };
          }
          const capacity = storageCapacityAfterPurchase(
            good.storageCapacity,
            permanentPerkPurchaseCount(candidate.permanent.acquiredPerks, "efficientStorage"),
          );
          goods[goodId] = { ...goods[goodId], storageCapacity: capacity };
          const upgradeId = storageUpgradeId(goodId);
          upgrades[upgradeId] = (upgrades[upgradeId] ?? 0) + 1;
          events.push({ type: "storage.increased", goodId, capacity });
          candidate = { ...candidate, run: { ...candidate.run, goods, upgrades } };
        }
        return success(incrementAccepted(candidate), events, state);
      }
      case "hydrogen.autobuyer.purchase": {
        const owned = hydrogenAutobuyerCount(state.run.upgrades);
        const cost = hydrogenAutobuyerPrice(owned);
        const upgradeId = autobuyerUpgradeId("hydrogen", 1);
        const hydrogen = state.run.goods.hydrogen;
        const goods = {
          ...state.run.goods,
          hydrogen: { ...hydrogen, quantity: settleSpend(hydrogen.quantity, cost) },
        };
        const upgrades = { ...state.run.upgrades, [upgradeId]: owned + 1 };
        return success(
          incrementAccepted({ ...state, run: { ...state.run, goods, upgrades } }),
          [{ type: "purchase.completed", upgradeId, count: 1 }],
          state,
        );
      }
      case "hydrogen.autobuyer.toggle":
        return success(
          incrementAccepted({
            ...state,
            run: {
              ...state.run,
              hydrogenAutobuyerEnabled: command.enabled,
              economy: {
                ...state.run.economy,
                autobuyerEnabled: {
                  ...state.run.economy.autobuyerEnabled,
                  [autobuyerUpgradeId("hydrogen", 1)]: command.enabled,
                },
              },
            },
          }),
          [{ type: "hydrogen.autobuyer.changed", enabled: command.enabled }],
          state,
        );
      case "economy.autobuyer.purchase": {
        const definition = buyerDefinition(command.goodId, command.tier);
        if (!definition)
          return reject(state, {
            code: "invalid-command",
            messageKey: "engine.error.invalid-command",
          });
        const upgradeId = autobuyerUpgradeId(command.goodId, command.tier);
        const owned = state.run.upgrades[upgradeId] ?? 0;
        const price = scaledPriceAfterPurchases(definition.price, owned, ECONOMY_PRICE_MULTIPLIER);
        const good = state.run.goods[command.goodId];
        const goods: Record<EconomicGoodId, GoodState> = {
          ...state.run.goods,
          [command.goodId]: { ...good, quantity: settleSpend(good.quantity, price) },
        };
        const upgrades = { ...state.run.upgrades, [upgradeId]: owned + 1 };
        return success(
          incrementAccepted({ ...state, run: { ...state.run, goods, upgrades } }),
          [{ type: "purchase.completed", upgradeId, count: 1 }],
          state,
        );
      }
      case "economy.autobuyer.buyMax": {
        const definition = buyerDefinition(command.goodId, command.tier)!;
        const upgradeId = autobuyerUpgradeId(command.goodId, command.tier);
        const owned = state.run.upgrades[upgradeId] ?? 0;
        const stock = state.run.goods[command.goodId];
        const purchase = affordablePurchaseCount(definition.price, owned, stock.quantity);
        const goods = {
          ...state.run.goods,
          [command.goodId]: { ...stock, quantity: settleSpend(stock.quantity, purchase.totalCost) },
        };
        const upgrades = { ...state.run.upgrades, [upgradeId]: owned + purchase.count };
        return success(
          incrementAccepted({ ...state, run: { ...state.run, goods, upgrades } }),
          [{ type: "purchase.completed", upgradeId, count: purchase.count }],
          state,
        );
      }
      case "economy.autobuyer.toggle": {
        const upgradeId = autobuyerUpgradeId(command.goodId, command.tier);
        const autobuyerEnabled = {
          ...state.run.economy.autobuyerEnabled,
          [upgradeId]: command.enabled,
        };
        const hydrogenAutobuyerEnabled =
          command.goodId === "hydrogen" && command.tier === 1
            ? command.enabled
            : state.run.hydrogenAutobuyerEnabled;
        return success(
          incrementAccepted({
            ...state,
            run: {
              ...state.run,
              hydrogenAutobuyerEnabled,
              economy: { ...state.run.economy, autobuyerEnabled },
            },
          }),
          [],
          state,
        );
      }
      case "economy.compound.create": {
        const goods: Record<EconomicGoodId, GoodState> = { ...state.run.goods };
        const definition = COMPOUND_CATALOG[command.goodId];
        for (const input of definition.recipe)
          goods[input.goodId] = {
            ...goods[input.goodId],
            quantity: settleSpend(goods[input.goodId].quantity, input.amount * command.amount),
          };
        goods[command.goodId] = {
          ...goods[command.goodId],
          quantity: goods[command.goodId].quantity + command.amount,
        };
        return success(
          incrementAccepted({
            ...state,
            run: { ...state.run, goods },
            statistics: {
              ...state.statistics,
              lifetimeGoodsProduced: state.statistics.lifetimeGoodsProduced + command.amount,
            },
          }),
          [],
          state,
        );
      }
      case "economy.fuse": {
        const source = state.run.goods[command.sourceId];
        const goods: Record<EconomicGoodId, GoodState> = {
          ...state.run.goods,
          [command.sourceId]: { ...source, quantity: settleSpend(source.quantity, command.amount) },
        };
        const outputDefinition = materialDefinition(command.sourceId).fusionOutputs!.find(
          (entry) => entry.goodId === command.targetId,
        )!;
        const firstDiscovery = !state.run.unlockedResources.includes(command.targetId);
        const draw = nextRandom(state.run.random);
        const range = firstDiscovery
          ? ([0.25, 0.25] as const)
          : state.run.economy.researchedTechnologies.includes("fusionEfficiencyIII")
            ? ([1, 1] as const)
            : state.run.economy.researchedTechnologies.includes("fusionEfficiencyII")
              ? ([0.6, 0.8] as const)
              : state.run.economy.researchedTechnologies.includes("fusionEfficiencyI")
                ? ([0.4, 0.6] as const)
                : ([0.2, 0.3] as const);
        const efficiency = firstDiscovery ? 0.25 : range[0] + draw.value * (range[1] - range[0]);
        const yielded = firstDiscovery
          ? Math.ceil((command.amount * outputDefinition.ratio) / 4)
          : Math.floor(command.amount * outputDefinition.ratio * efficiency);
        const amount = Math.min(
          state.run.goods[command.targetId].storageCapacity -
            state.run.goods[command.targetId].quantity,
          yielded,
        );
        goods[command.targetId] = {
          ...goods[command.targetId],
          quantity: goods[command.targetId].quantity + amount,
        };
        const unlockedResources = firstDiscovery
          ? [...state.run.unlockedResources, command.targetId]
          : state.run.unlockedResources;
        return success(
          incrementAccepted({
            ...state,
            run: {
              ...state.run,
              goods,
              unlockedResources,
              random: firstDiscovery ? state.run.random : draw.state,
            },
          }),
          [{ type: "resource.collected", goodId: command.targetId, amount }],
          state,
        );
      }
      case "economy.research": {
        const technology = TECHNOLOGY_BY_ID[command.technologyId]!;
        const researchedTechnologies = [
          ...state.run.economy.researchedTechnologies,
          command.technologyId,
        ];
        const unlockedCompounds = [...state.run.economy.unlockedCompounds];
        for (const compoundId of compoundUnlocksForTechnology(command.technologyId))
          if (!unlockedCompounds.includes(compoundId)) unlockedCompounds.push(compoundId);
        const revealedTechnologies = TECHNOLOGY_CATALOG.filter(
          (entry) =>
            state.run.researchPoints - technology.price > entry.revealThreshold ||
            researchedTechnologies.includes(entry.id),
        ).map((entry) => entry.id);
        const power =
          command.technologyId === "dysonSpherePower"
            ? {
                ...state.run.economy.power,
                gridEnabled: true,
                infinitePower: true,
                quantity: state.run.economy.power.capacity,
                tripped: false,
                deficitMs: 0,
              }
            : state.run.economy.power;
        return success(
          incrementAccepted({
            ...state,
            run: {
              ...state.run,
              researchPoints: state.run.researchPoints - technology.price,
              economy: {
                ...state.run.economy,
                power,
                researchedTechnologies,
                unlockedCompounds,
                revealedTechnologies,
              },
            },
          }),
          [],
          state,
        );
      }
      case "economy.building.purchase": {
        const cost = buildingCost(state, command.buildingId);
        const cash = settleSpend(state.run.cash, cost.cash);
        const goods: Record<EconomicGoodId, GoodState> = { ...state.run.goods };
        for (const material of cost.materials)
          goods[material.goodId] = {
            ...goods[material.goodId],
            quantity: settleSpend(goods[material.goodId].quantity, material.amount),
          };
        const upgrades = {
          ...state.run.upgrades,
          [command.buildingId]: (state.run.upgrades[command.buildingId] ?? 0) + 1,
        };
        const buildingEnabled = {
          ...state.run.economy.buildingEnabled,
          [command.buildingId]: true,
        };
        let power = state.run.economy.power;
        if (command.buildingId.startsWith("battery")) {
          const capacity = (
            ENERGY_BUILDINGS[command.buildingId as "battery1" | "battery2" | "battery3"] as {
              readonly capacity: number;
            }
          ).capacity;
          const totalCapacity = power.capacity + capacity;
          power = {
            ...power,
            capacity: totalCapacity,
            quantity: power.infinitePower ? totalCapacity : power.quantity,
          };
        }
        return success(
          incrementAccepted({
            ...state,
            run: {
              ...state.run,
              cash,
              goods,
              upgrades,
              economy: { ...state.run.economy, buildingEnabled, power },
            },
          }),
          [{ type: "purchase.completed", upgradeId: command.buildingId, count: 1 }],
          state,
        );
      }
      case "economy.building.buyMax": {
        const plan = buildingBuyMaxPlan(state, command.buildingId);
        const cash = settleSpend(state.run.cash, plan.cash);
        const goods = { ...state.run.goods } as Record<EconomicGoodId, GoodState>;
        for (const material of plan.materials)
          goods[material.goodId] = {
            ...goods[material.goodId],
            quantity: settleSpend(goods[material.goodId].quantity, material.amount),
          };
        const upgrades = {
          ...state.run.upgrades,
          [command.buildingId]: (state.run.upgrades[command.buildingId] ?? 0) + plan.count,
        };
        const buildingEnabled = {
          ...state.run.economy.buildingEnabled,
          [command.buildingId]: true,
        };
        let power = state.run.economy.power;
        if (command.buildingId.startsWith("battery")) {
          const capacity =
            (
              ENERGY_BUILDINGS[command.buildingId as "battery1" | "battery2" | "battery3"] as {
                readonly capacity: number;
              }
            ).capacity * plan.count;
          const totalCapacity = power.capacity + capacity;
          power = {
            ...power,
            capacity: totalCapacity,
            quantity: power.infinitePower ? totalCapacity : power.quantity,
          };
        }
        return success(
          incrementAccepted({
            ...state,
            run: {
              ...state.run,
              cash,
              goods,
              upgrades,
              economy: { ...state.run.economy, buildingEnabled, power },
            },
          }),
          [{ type: "purchase.completed", upgradeId: command.buildingId, count: plan.count }],
          state,
        );
      }
      case "economy.building.toggle": {
        const buildingEnabled = {
          ...state.run.economy.buildingEnabled,
          [command.buildingId]: command.enabled,
        };
        const power =
          command.buildingId.startsWith("powerPlant") && !command.enabled
            ? { ...state.run.economy.power, tripped: false, deficitMs: 0 }
            : state.run.economy.power;
        return success(
          incrementAccepted({
            ...state,
            run: { ...state.run, economy: { ...state.run.economy, buildingEnabled, power } },
          }),
          [],
          state,
        );
      }
      case "economy.allocation.set": {
        const resourceAllocation = {
          ...state.run.economy.resourceAllocation,
          [command.goodId]: {
            enabled: command.enabled,
            cashShare: command.cashShare,
            compoundShare: command.compoundShare,
          },
        };
        return success(
          incrementAccepted({
            ...state,
            run: { ...state.run, economy: { ...state.run.economy, resourceAllocation } },
          }),
          [],
          state,
        );
      }
      case "economy.autoCreate.toggle": {
        const autoCreateEnabled = {
          ...state.run.economy.autoCreateEnabled,
          [command.goodId]: command.enabled,
        };
        return success(
          incrementAccepted({
            ...state,
            run: { ...state.run, economy: { ...state.run.economy, autoCreateEnabled } },
          }),
          [],
          state,
        );
      }
      case "economy.power.toggle": {
        const power = {
          ...state.run.economy.power,
          gridEnabled: state.run.economy.power.infinitePower || command.enabled,
          deficitMs: 0,
          tripped: false,
        };
        return success(
          incrementAccepted({
            ...state,
            run: { ...state.run, economy: { ...state.run.economy, power } },
          }),
          [],
          state,
        );
      }
      case "economy.research.autobuyer.toggle":
        return success(
          incrementAccepted({
            ...state,
            run: {
              ...state.run,
              economy: { ...state.run.economy, researchAutobuyerEnabled: command.enabled },
            },
          }),
          [],
          state,
        );
      case "upgrade.purchase": {
        const count = command.count ?? 1;
        const cash = settleSpend(state.run.cash, command.cost.cash ?? 0);
        const goods = { ...state.run.goods };
        for (const [goodId, required] of materialCosts(command.cost)) {
          goods[goodId] = {
            ...goods[goodId],
            quantity: settleSpend(goods[goodId].quantity, required),
          };
        }
        const upgrades = {
          ...state.run.upgrades,
          [command.upgradeId]: (state.run.upgrades[command.upgradeId] ?? 0) + count,
        };
        return success(
          incrementAccepted({ ...state, run: { ...state.run, cash, goods, upgrades } }),
          [{ type: "purchase.completed", upgradeId: command.upgradeId, count }],
          state,
        );
      }
      case "clock.advance": {
        const advanced = advanceClock(state.run.clock, command.input);
        const timerResult = advanceTimers(state.run.timers, advanced.steps);
        let nextState: GameState = {
          ...state,
          run: { ...state.run, clock: advanced.state, timers: timerResult.timers },
        };
        const events: EngineEvent[] = [...timerResult.events];
        let cashEarned = 0;
        let goodsProduced = 0;
        for (const step of advanced.steps) {
          const elapsedMs =
            step.phase === "foreground"
              ? step.warpedElapsedMs
              : step.phase === "offline"
                ? step.elapsedMs
                : 0;
          if (elapsedMs <= 0) continue;
          const tickPlan =
            step.phase === "offline"
              ? (command.offlineTickPlan ?? command.tickPlan ?? {})
              : (command.tickPlan ?? {});
          const transaction = transactResources(
            nextState.run.goods,
            nextState.run.cash,
            elapsedMs,
            tickPlan,
          );
          const seconds = elapsedMs / 1000;
          const previousPower = nextState.run.economy.power;
          const gridRunning = previousPower.gridEnabled && !previousPower.tripped;
          const fuelGenerationPerSecond = (tickPlan.fuel ?? []).reduce(
            (total, entry) => total + entry.unitsPerSecond * (entry.energyPerFuel ?? 0),
            0,
          );
          const nonFuelGenerationPerSecond = Math.max(
            0,
            (tickPlan.power?.generationPerSecond ?? 0) - fuelGenerationPerSecond,
          );
          const generation = gridRunning
            ? (nonFuelGenerationPerSecond + transaction.fueledGenerationPerSecond) * seconds
            : 0;
          const demanded = gridRunning ? (tickPlan.power?.demandPerSecond ?? 0) * seconds : 0;
          const available = previousPower.quantity + generation;
          const deficit = previousPower.infinitePower ? 0 : Math.max(0, demanded - available);
          const powerQuantity = previousPower.infinitePower
            ? previousPower.capacity
            : Math.min(previousPower.capacity, Math.max(0, available - demanded));
          const deficitMs = deficit > 0 ? previousPower.deficitMs + elapsedMs : 0;
          const power = {
            ...previousPower,
            quantity: powerQuantity,
            deficitMs,
            tripped: previousPower.infinitePower
              ? false
              : previousPower.tripped || deficitMs >= 10_000,
          };
          let researchPoints =
            nextState.run.researchPoints + (tickPlan.researchPerSecond ?? 0) * seconds;
          const researchedTechnologies = [...nextState.run.economy.researchedTechnologies];
          const unlockedResources = [...nextState.run.unlockedResources];
          const unlockedCompounds = [...nextState.run.economy.unlockedCompounds];
          const revealedBeforePurchase = TECHNOLOGY_CATALOG.filter(
            (technology) =>
              researchPoints > technology.revealThreshold ||
              researchedTechnologies.includes(technology.id),
          ).map((technology) => technology.id);
          if (
            nextState.run.economy.researchAutobuyerEnabled &&
            hasPermanentPerk(nextState, "roboticResearchAutomation")
          ) {
            for (let pass = 0; pass < TECHNOLOGY_CATALOG.length; pass += 1) {
              const nextTechnology = TECHNOLOGY_CATALOG.find(
                (technology) =>
                  revealedBeforePurchase.includes(technology.id) &&
                  !researchedTechnologies.includes(technology.id) &&
                  technology.requires.every((required) =>
                    researchedTechnologies.includes(required),
                  ) &&
                  researchPoints >= technology.price,
              );
              if (!nextTechnology) break;
              researchPoints -= nextTechnology.price;
              researchedTechnologies.push(nextTechnology.id);
              for (const id of compoundUnlocksForTechnology(nextTechnology.id))
                if (!unlockedCompounds.includes(id)) unlockedCompounds.push(id);
            }
          }
          const revealedTechnologies = TECHNOLOGY_CATALOG.filter(
            (technology) =>
              researchPoints > technology.revealThreshold ||
              researchedTechnologies.includes(technology.id),
          ).map((technology) => technology.id);
          nextState = {
            ...nextState,
            run: {
              ...nextState.run,
              goods: transaction.goods,
              cash: transaction.cash,
              researchPoints,
              unlockedResources,
              economy: {
                ...nextState.run.economy,
                power,
                researchedTechnologies,
                unlockedCompounds,
                revealedTechnologies,
              },
            },
          };
          cashEarned += transaction.cashRaised;
          goodsProduced += transaction.goodsProduced;
          events.push(...transaction.events);
        }
        nextState = {
          ...nextState,
          statistics: {
            ...nextState.statistics,
            lifetimeCashEarned: nextState.statistics.lifetimeCashEarned + cashEarned,
            lifetimeGoodsProduced: nextState.statistics.lifetimeGoodsProduced + goodsProduced,
            completedTimers: Math.min(
              Number.MAX_SAFE_INTEGER,
              nextState.statistics.completedTimers +
                timerResult.events.reduce(
                  (total, event) =>
                    total + (event.type === "timer.completed" ? event.completions : 0),
                  0,
                ),
            ),
            acceptedCommands: nextState.statistics.acceptedCommands + 1,
          },
        };
        return success(nextState, events, state);
      }
      case "clock.pause":
        return success(
          incrementAccepted({
            ...state,
            run: { ...state.run, clock: pauseClock(state.run.clock) },
          }),
          [{ type: "clock.paused" }],
          state,
        );
      case "clock.resume":
        return success(
          incrementAccepted({
            ...state,
            run: { ...state.run, clock: resumeClock(state.run.clock) },
          }),
          [{ type: "clock.resumed" }],
          state,
        );
      case "timer.add": {
        const timer = createTimer({
          id: command.timerId,
          domain: command.domain,
          durationMs: command.durationMs,
          ...(command.repeat === undefined ? {} : { repeat: command.repeat }),
          ...(command.paused === undefined ? {} : { paused: command.paused }),
          ...(command.eventId === undefined ? {} : { eventId: command.eventId }),
          ...(command.goodId === undefined ? {} : { goodId: command.goodId }),
        });
        const timers = { ...state.run.timers, [timer.id]: timer };
        return success(incrementAccepted({ ...state, run: { ...state.run, timers } }), [], state);
      }
      case "timer.pause": {
        const timer = state.run.timers[command.timerId];
        if (!timer) {
          return reject(state, {
            code: "timer-missing",
            messageKey: "engine.timer.not-found",
            timerId: command.timerId,
          });
        }
        if (timer.status !== "running") return success(incrementAccepted(state), [], state);
        const timers = {
          ...state.run.timers,
          [command.timerId]: { ...timer, status: "paused" as const },
        };
        return success(
          incrementAccepted({ ...state, run: { ...state.run, timers } }),
          [{ type: "timer.paused", timerId: command.timerId }],
          state,
        );
      }
      case "timer.resume": {
        const timer = state.run.timers[command.timerId];
        if (!timer) {
          return reject(state, {
            code: "timer-missing",
            messageKey: "engine.timer.not-found",
            timerId: command.timerId,
          });
        }
        if (timer.status !== "paused") return success(incrementAccepted(state), [], state);
        const timers = {
          ...state.run.timers,
          [command.timerId]: { ...timer, status: "running" as const },
        };
        return success(
          incrementAccepted({ ...state, run: { ...state.run, timers } }),
          [{ type: "timer.resumed", timerId: command.timerId }],
          state,
        );
      }
      case "timer.complete": {
        const completed = completeTimer(state.run.timers, command.timerId);
        const nextState = incrementAccepted({
          ...state,
          run: { ...state.run, timers: completed.timers },
          statistics: {
            ...state.statistics,
            completedTimers: Math.min(
              Number.MAX_SAFE_INTEGER,
              state.statistics.completedTimers + (completed.completed ? 1 : 0),
            ),
          },
        });
        return success(nextState, completed.events, state);
      }
      case "settings.update": {
        const settings = { ...state.settings, ...command.patch };
        return success(
          incrementAccepted({ ...state, settings }),
          [{ type: "settings.changed", settings }],
          state,
        );
      }
      case "random.draw": {
        const next = nextRandom(state.run.random);
        const nextState = incrementAccepted({
          ...state,
          run: { ...state.run, random: next.state },
        });
        return success(
          nextState,
          [{ type: "random.drawn", purpose: command.purpose, value: next.value }],
          state,
        );
      }
    }
  } catch {
    return reject(state, { code: "transition-failed", messageKey: "engine.error.recovered" });
  }
}

export function canAffordPurchaseSelector(
  state: GameState,
  command: PurchaseCommand,
): PreconditionResult {
  return checkPurchase(state, command);
}
