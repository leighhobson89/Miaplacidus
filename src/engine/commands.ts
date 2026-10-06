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
import {
  MEGASTRUCTURE_TECHNOLOGY_IDS,
  TECHNOLOGY_BY_ID,
  TECHNOLOGY_CATALOG,
} from "../content/technology";
import { ROCKET_IDS } from "../content/space";
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
import {
  isSpaceCommand,
  type SpaceCommand,
  type SpaceCommandFailure,
  type SpaceEvent,
} from "./spaceCommands";
import {
  applySpaceCommand,
  advanceSpaceMining,
  advanceRocketFuel,
  checkSpacePreconditions,
  completeSpaceJourneys,
  completeSpaceWeatherCycle,
  completeSpaceBattles,
  completeSpaceSurveys,
  prepareSpaceSurveyPower,
} from "./spaceMechanics";
import {
  applyMetaProgressionCommand,
  checkMetaProgressionCommand,
  isMetaProgressionCommand,
  type MetaProgressionCommand,
  type MetaProgressionEvent,
  type MetaProgressionFailure,
} from "./metaProgression";
import { advanceGalacticMarket } from "./galacticMarket";
import { applyAchievementBoundary, type AchievementUnlockedEvent } from "./achievements";
import { isThemeId } from "../content/themes";
import { isCurrencyId } from "../content/currency";
import {
  RANDOM_EVENT_IDS,
  NEWS_CATEGORIES,
  type NewsCategory,
  type RandomEventId,
} from "../content/metaSignals";
import {
  advanceRandomEvents,
  forceRandomEvent,
  randomEventEligible,
  type RandomEventEngineEvent,
} from "./randomEvents";
import {
  activateNewsWacky,
  advanceNewsTicker,
  checkNewsWackyActivation,
  checkNewsPrizeClaim,
  claimNewsPrize,
  forceNewsTicker,
  type NewsTickerEvent,
} from "./newsTicker";
import {
  applyPhilosophyCommand,
  checkPhilosophyCommand,
  isPhilosophyCommand,
  philosophyCompoundRecipe,
  philosophyRepeatableRank,
  type PhilosophyCommand,
  type PhilosophyEvent,
  type PhilosophyFailure,
} from "./philosophy";
import {
  applyCasinoCommand,
  checkCasinoCommand,
  isCasinoCommand,
  type CasinoCommand,
  type CasinoEvent,
  type CasinoFailure,
} from "./galacticCasino";
import {
  applyBlackHoleCommand,
  checkBlackHoleCommand,
  completeBlackHoleTimers,
  finishBlackHoleWarp,
  isBlackHoleCommand,
  type BlackHoleCommand,
  type BlackHoleEvent,
  type BlackHoleFailure,
} from "./blackHole";
import {
  applyMegastructureTechnology,
  megastructureBatteryCapacityMultiplier,
  megastructureResearchAvailable,
  miaplacidusForceFieldLevel,
} from "./megastructures";
import {
  advanceCosmicRip,
  applyCosmicRipCommand,
  checkCosmicRipCommand,
  isCosmicRipCommand,
  type CosmicRipCommand,
  type CosmicRipEvent,
  type CosmicRipFailure,
} from "./cosmicRip";

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
  | { readonly type: "navigation.attention.initialize"; readonly pageIds: readonly string[] }
  | { readonly type: "navigation.attention.discover"; readonly pageIds: readonly string[] }
  | { readonly type: "navigation.attention.clear"; readonly pageId: string }
  | { readonly type: "random.draw"; readonly purpose: string }
  | { readonly type: "onboarding.complete" }
  | { readonly type: "random-event.force"; readonly eventId: RandomEventId }
  | { readonly type: "news.ticker.force"; readonly category?: NewsCategory; readonly id?: number }
  | { readonly type: "news.prize.claim"; readonly id: number }
  | { readonly type: "news.wacky.activate"; readonly id: number }
  | MetaProgressionCommand
  | PhilosophyCommand
  | CasinoCommand
  | BlackHoleCommand
  | CosmicRipCommand
  | SpaceCommand;

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
      readonly code: "insufficient-antimatter";
      readonly messageKey: "engine.purchase.insufficient-antimatter";
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
  | {
      readonly code: "no-stock";
      readonly messageKey: "ui.hydrogen.no-stock";
      readonly goodId: EconomicGoodId;
    }
  | { readonly code: "autobuyer-unavailable"; readonly messageKey: "ui.hydrogen.autobuyer-locked" }
  | { readonly code: "transition-failed"; readonly messageKey: "engine.error.recovered" }
  | MetaProgressionFailure
  | PhilosophyFailure
  | CasinoFailure
  | BlackHoleFailure
  | CosmicRipFailure
  | SpaceCommandFailure;

export type PreconditionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly failure: CommandFailure };

export type EngineEvent =
  | { readonly type: "purchase.completed"; readonly upgradeId: UpgradeId; readonly count: number }
  | { readonly type: "resource.collected"; readonly goodId: MaterialId; readonly amount: number }
  | {
      readonly type: "economy.fusion.completed";
      readonly sourceId: MaterialId;
      readonly targetId: MaterialId;
      readonly firstDiscovery: boolean;
      readonly amount: number;
      readonly idealAmount: number;
      readonly generatedAmount: number;
      readonly efficiencyLost: number;
      readonly storageLost: number;
    }
  | {
      readonly type: "technology.researched";
      readonly technologyId: import("../content/ids").TechId;
    }
  | { readonly type: "megastructure.force-field-breached" }
  | { readonly type: "onboarding.completed" }
  | {
      readonly type: "storage.increased";
      readonly goodId: EconomicGoodId;
      readonly capacity: number;
    }
  | { readonly type: "hydrogen.autobuyer.changed"; readonly enabled: boolean }
  | { readonly type: "economy.power.tripped" }
  | { readonly type: "clock.paused" }
  | { readonly type: "clock.resumed" }
  | { readonly type: "timer.paused"; readonly timerId: TimerId }
  | { readonly type: "timer.resumed"; readonly timerId: TimerId }
  | { readonly type: "settings.changed"; readonly settings: SettingsState }
  | { readonly type: "random.drawn"; readonly purpose: string; readonly value: number }
  | CasinoEvent
  | BlackHoleEvent
  | CosmicRipEvent
  | PhilosophyEvent
  | MetaProgressionEvent
  | SpaceEvent
  | TimerEvent
  | ResourceTransactionEvent
  | AchievementUnlockedEvent
  | RandomEventEngineEvent
  | NewsTickerEvent;

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

function creditGoodProduction(state: GameState, goodId: EconomicGoodId, amount: number): GameState {
  if (!(amount > 0)) return state;
  return {
    ...state,
    run: {
      ...state.run,
      goodsProducedThisRun: {
        ...state.run.goodsProducedThisRun,
        [goodId]: Math.min(
          Number.MAX_SAFE_INTEGER,
          state.run.goodsProducedThisRun[goodId] + amount,
        ),
      },
    },
    statistics: {
      ...state.statistics,
      lifetimeGoodsProducedByGood: {
        ...state.statistics.lifetimeGoodsProducedByGood,
        [goodId]: Math.min(
          Number.MAX_SAFE_INTEGER,
          state.statistics.lifetimeGoodsProducedByGood[goodId] + amount,
        ),
      },
    },
  };
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

export function buildingCost(
  state: GameState,
  buildingId: FixedUpgradeId,
  owned = state.run.upgrades[buildingId] ?? 0,
) {
  const energyDroneDiscount = 0.95 ** philosophyRepeatableRank(state, "energyDrones");
  if (buildingId in SCIENCE_BUILDINGS) {
    return {
      cash: scaledPriceAfterPurchases(
        SCIENCE_BUILDINGS[buildingId as keyof typeof SCIENCE_BUILDINGS].price * energyDroneDiscount,
        owned,
      ),
      materials: [] as readonly { goodId: EconomicGoodId; amount: number }[],
    };
  }
  const base = ENERGY_BUILDINGS[buildingId as keyof typeof ENERGY_BUILDINGS].price;
  return {
    cash: scaledPriceAfterPurchases(base.cash * energyDroneDiscount, owned),
    materials: base.materials.map((entry) => ({
      ...entry,
      amount: scaledPriceAfterPurchases(entry.amount * energyDroneDiscount, owned),
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

function storageMultiplier(state: GameState, goodId: EconomicGoodId): number {
  const philosophyMultiplier =
    state.permanent.philosophyId === "constructor" && state.run.philosophyAbilityActive ? 5 : 2;
  const isMaterial = MATERIAL_IDS.includes(goodId as MaterialId);
  return (
    philosophyMultiplier *
    (isMaterial
      ? state.run.newsTicker.resourceStorageMultiplier
      : state.run.newsTicker.compoundStorageMultiplier)
  );
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
    Number.isFinite(
      storageCapacityAfterPurchase(capacity, purchases, storageMultiplier(state, goodId)),
    ) &&
    storageCosts(state, goodId).every(({ goodId: inputId, amount }) =>
      canAfford(state.run.goods[inputId].quantity, amount),
    )
  );
}

function buildingPurchaseFailure(state: GameState, buildingId: FixedUpgradeId): CommandFailure {
  const cost = buildingCost(state, buildingId);
  const missingMaterial = cost.materials.find(
    ({ goodId, amount }) => !canAfford(state.run.goods[goodId].quantity, amount),
  );
  if (missingMaterial) {
    return {
      code: "insufficient-material",
      messageKey: "engine.purchase.insufficient-material",
      goodId: missingMaterial.goodId,
      required: missingMaterial.amount,
    };
  }
  return {
    code: "insufficient-cash",
    messageKey: "engine.purchase.insufficient-cash",
    required: cost.cash,
  };
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
    (plan.precipitation !== undefined &&
      (!plan.precipitation ||
        typeof plan.precipitation !== "object" ||
        Array.isArray(plan.precipitation) ||
        !isEconomicGoodId(plan.precipitation.goodId) ||
        !Number.isFinite(plan.precipitation.unitsPerSecond) ||
        plan.precipitation.unitsPerSecond < 0)) ||
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
    (input.timeWarpRemainingMs === undefined ||
      (Number.isFinite(input.timeWarpRemainingMs) && input.timeWarpRemainingMs >= 0)) &&
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
  if (isSpaceCommand(command)) return checkSpacePreconditions(state, command);
  if (isBlackHoleCommand(command)) {
    const failure = checkBlackHoleCommand(state, command);
    return failure ? { ok: false, failure } : { ok: true };
  }
  if (isCosmicRipCommand(command)) {
    const failure = checkCosmicRipCommand(state, command);
    return failure ? { ok: false, failure } : { ok: true };
  }
  if (isCasinoCommand(command)) {
    const failure = checkCasinoCommand(state, command);
    return failure ? { ok: false, failure } : { ok: true };
  }
  if (isPhilosophyCommand(command)) {
    const failure = checkPhilosophyCommand(state, command);
    return failure ? { ok: false, failure } : { ok: true };
  }
  if (isMetaProgressionCommand(command)) {
    const failure = checkMetaProgressionCommand(state, command);
    return failure ? { ok: false, failure } : { ok: true };
  }
  if (
    command.type === "navigation.attention.initialize" ||
    command.type === "navigation.attention.discover" ||
    command.type === "navigation.attention.clear"
  )
    return { ok: true };
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
            failure: {
              code: "no-stock",
              messageKey: "ui.hydrogen.no-stock",
              goodId: command.goodId,
            },
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
            storageMultiplier(state, command.goodId),
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
      const discount = MATERIAL_IDS.includes(command.goodId as MaterialId)
        ? 0.95 ** philosophyRepeatableRank(state, "laserMining")
        : 1;
      const price = scaledPriceAfterPurchases(
        def.price * discount,
        owned,
        ECONOMY_PRICE_MULTIPLIER,
      );
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
        definition.price *
          (MATERIAL_IDS.includes(command.goodId as MaterialId)
            ? 0.95 ** philosophyRepeatableRank(state, "laserMining")
            : 1),
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
              required: scaledPriceAfterPurchases(
                definition.price *
                  (MATERIAL_IDS.includes(command.goodId as MaterialId)
                    ? 0.95 ** philosophyRepeatableRank(state, "laserMining")
                    : 1),
                owned,
              ),
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
      const recipe = philosophyCompoundRecipe(state, command.goodId);
      if (output.quantity + command.amount > output.storageCapacity)
        return {
          ok: false,
          failure: { code: "inventory-full", messageKey: "ui.hydrogen.inventory-full" },
        };
      const enoughInputs = recipe.every((input) =>
        canAfford(state.run.goods[input.goodId].quantity, input.amount * command.amount),
      );
      return enoughInputs
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
                (recipe.find(
                  (input) =>
                    !canAfford(
                      state.run.goods[input.goodId].quantity,
                      input.amount * command.amount,
                    ),
                )?.amount ?? 0) * command.amount,
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
        !megastructureResearchAvailable(state, command.technologyId) ||
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
        : { ok: false, failure: buildingPurchaseFailure(state, command.buildingId) };
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
        return { ok: false, failure: buildingPurchaseFailure(state, command.buildingId) };
      if (command.buildingId.startsWith("battery")) {
        const baseCapacity =
          (
            ENERGY_BUILDINGS[command.buildingId as "battery1" | "battery2" | "battery3"] as {
              readonly capacity: number;
            }
          ).capacity *
          megastructureBatteryCapacityMultiplier(state) *
          state.run.newsTicker.powerCapacityMultiplier;
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
    case "random-event.force":
      return RANDOM_EVENT_IDS.includes(command.eventId) &&
        randomEventEligible(state, command.eventId)
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "news.ticker.force":
      return (command.category === undefined || NEWS_CATEGORIES.includes(command.category)) &&
        (command.id === undefined || Number.isSafeInteger(command.id))
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "news.prize.claim":
      return Number.isSafeInteger(command.id) && checkNewsPrizeClaim(state, command.id)
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "news.wacky.activate":
      return Number.isSafeInteger(command.id) && checkNewsWackyActivation(state, command.id)
        ? { ok: true }
        : {
            ok: false,
            failure: { code: "invalid-command", messageKey: "engine.error.invalid-command" },
          };
    case "onboarding.complete":
      return { ok: true };
  }
}

function validateSettingsPatch(patch: Partial<SettingsState>): boolean {
  if (!patch || typeof patch !== "object") return false;
  const validKeys = new Set([
    "locale",
    "themeId",
    "currencyId",
    "notation",
    "soundEnabled",
    "backgroundAudioEnabled",
    "soundEffectsEnabled",
    "backgroundAudioVolume",
    "soundEffectsVolume",
    "customPointerEnabled",
    "pointerTrailEnabled",
    "weatherEffectsEnabled",
    "reducedMotion",
    "newsTickerEnabled",
    "notificationsEnabled",
  ]);
  if (Object.keys(patch).some((key) => !validKeys.has(key))) return false;
  if (patch.locale !== undefined && !LOCALE_IDS.includes(patch.locale)) return false;
  if (patch.themeId !== undefined && !isThemeId(patch.themeId)) return false;
  if (patch.currencyId !== undefined && !isCurrencyId(patch.currencyId)) return false;
  if (
    patch.notation !== undefined &&
    patch.notation !== "condensed" &&
    patch.notation !== "standard" &&
    patch.notation !== "scientific"
  )
    return false;
  if (patch.soundEnabled !== undefined && typeof patch.soundEnabled !== "boolean") return false;
  if (
    patch.backgroundAudioEnabled !== undefined &&
    typeof patch.backgroundAudioEnabled !== "boolean"
  )
    return false;
  if (patch.soundEffectsEnabled !== undefined && typeof patch.soundEffectsEnabled !== "boolean")
    return false;
  if (
    patch.backgroundAudioVolume !== undefined &&
    (!Number.isFinite(patch.backgroundAudioVolume) ||
      patch.backgroundAudioVolume < 0 ||
      patch.backgroundAudioVolume > 1)
  )
    return false;
  if (
    patch.soundEffectsVolume !== undefined &&
    (!Number.isFinite(patch.soundEffectsVolume) ||
      patch.soundEffectsVolume < 0 ||
      patch.soundEffectsVolume > 1)
  )
    return false;
  if (patch.customPointerEnabled !== undefined && typeof patch.customPointerEnabled !== "boolean")
    return false;
  if (patch.pointerTrailEnabled !== undefined && typeof patch.pointerTrailEnabled !== "boolean")
    return false;
  if (patch.weatherEffectsEnabled !== undefined && typeof patch.weatherEffectsEnabled !== "boolean")
    return false;
  if (patch.reducedMotion !== undefined && typeof patch.reducedMotion !== "boolean") return false;
  if (patch.newsTickerEnabled !== undefined && typeof patch.newsTickerEnabled !== "boolean")
    return false;
  if (patch.notificationsEnabled !== undefined && typeof patch.notificationsEnabled !== "boolean")
    return false;
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

function incrementScienceBuildingHistory(
  state: GameState,
  buildingId: FixedUpgradeId,
  count: number,
): GameState {
  const fields =
    buildingId === "scienceKit"
      ? (["scienceKitsBuiltThisRun", "lifetimeScienceKitsBuilt"] as const)
      : buildingId === "scienceClub"
        ? (["scienceClubsBuiltThisRun", "lifetimeScienceClubsBuilt"] as const)
        : buildingId === "scienceLab"
          ? (["scienceLabsBuiltThisRun", "lifetimeScienceLabsBuilt"] as const)
          : null;
  if (!fields) return state;
  const [runField, lifetimeField] = fields;
  return {
    ...state,
    run: {
      ...state.run,
      [runField]: Math.min(Number.MAX_SAFE_INTEGER, state.run[runField] + count),
    },
    statistics: {
      ...state.statistics,
      [lifetimeField]: Math.min(Number.MAX_SAFE_INTEGER, state.statistics[lifetimeField] + count),
    },
  };
}

function incrementEnergyBuildingHistory(
  state: GameState,
  buildingId: FixedUpgradeId,
  count: number,
): GameState {
  const fields =
    buildingId === "powerPlant1"
      ? (["basicPowerPlantsBuiltThisRun", "lifetimeBasicPowerPlantsBuilt"] as const)
      : buildingId === "powerPlant3"
        ? (["advancedPowerPlantsBuiltThisRun", "lifetimeAdvancedPowerPlantsBuilt"] as const)
        : buildingId === "powerPlant2"
          ? (["solarPowerPlantsBuiltThisRun", "lifetimeSolarPowerPlantsBuilt"] as const)
          : buildingId === "battery1"
            ? (["sodiumIonBatteriesBuiltThisRun", "lifetimeSodiumIonBatteriesBuilt"] as const)
            : buildingId === "battery2"
              ? (["battery2BuiltThisRun", "lifetimeBattery2Built"] as const)
              : buildingId === "battery3"
                ? (["battery3BuiltThisRun", "lifetimeBattery3Built"] as const)
                : null;
  if (!fields) return state;
  const [runField, lifetimeField] = fields;
  return {
    ...state,
    run: {
      ...state.run,
      [runField]: Math.min(Number.MAX_SAFE_INTEGER, state.run[runField] + count),
    },
    statistics: {
      ...state.statistics,
      [lifetimeField]: Math.min(Number.MAX_SAFE_INTEGER, state.statistics[lifetimeField] + count),
    },
  };
}

function incrementEnergyTripHistory(state: GameState): GameState {
  return {
    ...state,
    run: {
      ...state.run,
      energyTripsThisRun: Math.min(Number.MAX_SAFE_INTEGER, state.run.energyTripsThisRun + 1),
    },
    statistics: {
      ...state.statistics,
      lifetimeEnergyTrips: Math.min(
        Number.MAX_SAFE_INTEGER,
        state.statistics.lifetimeEnergyTrips + 1,
      ),
    },
  };
}

function transitionRaw(state: GameState, command: GameCommand): EngineResult {
  try {
    if (!isValidGameState(state)) {
      return reject(createInitialGameState(), {
        code: "invalid-state",
        messageKey: "engine.error.invalid-state",
      });
    }
    if (command.type === "navigation.attention.initialize") {
      if (
        !Array.isArray(command.pageIds) ||
        command.pageIds.some((pageId) => typeof pageId !== "string" || pageId.length === 0)
      )
        return reject(state, {
          code: "invalid-command",
          messageKey: "engine.error.invalid-command",
        });
      if (state.run.navigationAttentionInitialized) return success(state, [], state);
      const navigationAttentionIds = [
        ...new Set([...state.run.navigationAttentionIds, ...command.pageIds]),
      ];
      return success(
        {
          ...state,
          run: {
            ...state.run,
            navigationAttentionIds,
            navigationAttentionInitialized: true,
          },
        },
        [],
        state,
      );
    }
    if (command.type === "navigation.attention.discover") {
      if (
        !Array.isArray(command.pageIds) ||
        command.pageIds.some((pageId) => typeof pageId !== "string" || pageId.length === 0)
      )
        return reject(state, {
          code: "invalid-command",
          messageKey: "engine.error.invalid-command",
        });
      const navigationAttentionIds = [
        ...new Set([...state.run.navigationAttentionIds, ...command.pageIds]),
      ];
      if (navigationAttentionIds.length === state.run.navigationAttentionIds.length)
        return success(state, [], state);
      return success({ ...state, run: { ...state.run, navigationAttentionIds } }, [], state);
    }
    if (command.type === "navigation.attention.clear") {
      if (typeof command.pageId !== "string" || command.pageId.length === 0)
        return reject(state, {
          code: "invalid-command",
          messageKey: "engine.error.invalid-command",
        });
      const navigationAttentionIds = state.run.navigationAttentionIds.filter(
        (pageId) => pageId !== command.pageId,
      );
      if (navigationAttentionIds.length === state.run.navigationAttentionIds.length)
        return success(state, [], state);
      return success({ ...state, run: { ...state.run, navigationAttentionIds } }, [], state);
    }
    const precondition = checkPreconditions(state, command);
    if (!precondition.ok) {
      return reject(state, precondition.failure);
    }
    if (command.type === "random-event.force") {
      const applied = forceRandomEvent(state, command.eventId);
      return applied
        ? success(incrementAccepted(applied.state), applied.events, state)
        : reject(state, { code: "invalid-command", messageKey: "engine.error.invalid-command" });
    }
    if (command.type === "news.ticker.force") {
      const applied = forceNewsTicker(state, command.category, command.id);
      return applied
        ? success(incrementAccepted(applied.state), applied.events, state)
        : reject(state, { code: "invalid-command", messageKey: "engine.error.invalid-command" });
    }
    if (command.type === "news.prize.claim") {
      const applied = claimNewsPrize(state, command.id);
      if (!applied)
        return reject(state, {
          code: "invalid-command",
          messageKey: "engine.error.invalid-command",
        });
      const reward = applied.events.find((event) => event.type === "news.prize.claimed");
      let nextState = applied.state;
      if (reward?.type === "news.prize.claimed") {
        nextState = creditGoodProduction(nextState, reward.goodId, reward.amount);
        nextState = {
          ...nextState,
          statistics: {
            ...nextState.statistics,
            lifetimeGoodsProduced: nextState.statistics.lifetimeGoodsProduced + reward.amount,
          },
        };
      }
      return success(incrementAccepted(nextState), applied.events, state);
    }
    if (command.type === "news.wacky.activate") {
      const applied = activateNewsWacky(state, command.id);
      return applied
        ? success(incrementAccepted(applied.state), applied.events, state)
        : reject(state, { code: "invalid-command", messageKey: "engine.error.invalid-command" });
    }
    if (isBlackHoleCommand(command)) {
      const applied = applyBlackHoleCommand(state, command);
      return success(incrementAccepted(applied.state), applied.events, state);
    }
    if (isCosmicRipCommand(command)) {
      const applied = applyCosmicRipCommand(state, command);
      return success(incrementAccepted(applied.state), applied.events, state);
    }
    if (isCasinoCommand(command)) {
      const applied = applyCasinoCommand(state, command);
      return success(
        incrementAccepted(applied.state),
        [...applied.events, ...(applied.otherEvents ?? [])],
        state,
      );
    }
    if (isPhilosophyCommand(command)) {
      const applied = applyPhilosophyCommand(state, command);
      return success(incrementAccepted(applied.state), applied.events, state);
    }
    if (isSpaceCommand(command)) {
      const applied = applySpaceCommand(state, command);
      return success(incrementAccepted(applied.state), applied.events, state);
    }
    if (isMetaProgressionCommand(command)) {
      const applied = applyMetaProgressionCommand(state, command);
      return success(incrementAccepted(applied.state), applied.events, state);
    }

    switch (command.type) {
      case "resource.collect": {
        const good = state.run.goods[command.goodId];
        const credited = creditGoodProduction(state, command.goodId, 1);
        const goods: Record<EconomicGoodId, GoodState> = {
          ...state.run.goods,
          [command.goodId]: { ...good, quantity: good.quantity + 1 },
        };
        return success(
          incrementAccepted({
            ...credited,
            run: { ...credited.run, goods },
            statistics: {
              ...credited.statistics,
              lifetimeGoodsProduced: credited.statistics.lifetimeGoodsProduced + 1,
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
          storageMultiplier(state, command.goodId),
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
            storageMultiplier(candidate, goodId),
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
        const discount = MATERIAL_IDS.includes(command.goodId as MaterialId)
          ? 0.95 ** philosophyRepeatableRank(state, "laserMining")
          : 1;
        const price = scaledPriceAfterPurchases(
          definition.price * discount,
          owned,
          ECONOMY_PRICE_MULTIPLIER,
        );
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
        const purchase = affordablePurchaseCount(
          definition.price *
            (MATERIAL_IDS.includes(command.goodId as MaterialId)
              ? 0.95 ** philosophyRepeatableRank(state, "laserMining")
              : 1),
          owned,
          stock.quantity,
        );
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
        for (const input of philosophyCompoundRecipe(state, command.goodId))
          goods[input.goodId] = {
            ...goods[input.goodId],
            quantity: settleSpend(goods[input.goodId].quantity, input.amount * command.amount),
          };
        goods[command.goodId] = {
          ...goods[command.goodId],
          quantity: goods[command.goodId].quantity + command.amount,
        };
        const credited = creditGoodProduction(state, command.goodId, command.amount);
        return success(
          incrementAccepted({
            ...credited,
            run: { ...credited.run, goods },
            statistics: {
              ...credited.statistics,
              lifetimeGoodsProduced: credited.statistics.lifetimeGoodsProduced + command.amount,
            },
          }),
          [{ type: "compound.created", goodId: command.goodId, amount: command.amount }],
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
        const idealAmount = Math.floor(command.amount * outputDefinition.ratio);
        const amount = Math.min(
          state.run.goods[command.targetId].storageCapacity -
            state.run.goods[command.targetId].quantity,
          yielded,
        );
        const credited = creditGoodProduction(state, command.targetId, amount);
        goods[command.targetId] = {
          ...goods[command.targetId],
          quantity: goods[command.targetId].quantity + amount,
        };
        const unlockedResources = firstDiscovery
          ? [...state.run.unlockedResources, command.targetId]
          : state.run.unlockedResources;
        return success(
          incrementAccepted({
            ...credited,
            run: {
              ...credited.run,
              goods,
              unlockedResources,
              random: firstDiscovery ? credited.run.random : draw.state,
            },
          }),
          [
            { type: "resource.collected", goodId: command.targetId, amount },
            {
              type: "economy.fusion.completed",
              sourceId: command.sourceId,
              targetId: command.targetId,
              firstDiscovery,
              amount,
              idealAmount,
              generatedAmount: yielded,
              efficiencyLost: Math.max(0, idealAmount - yielded),
              storageLost: Math.max(0, yielded - amount),
            },
          ],
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
        const knownReveals = new Set(state.run.economy.revealedTechnologies);
        const revealedTechnologies = TECHNOLOGY_CATALOG.filter(
          (entry) =>
            knownReveals.has(entry.id) ||
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
        const researchedState = incrementAccepted({
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
        });
        const previousForceFieldLevel = miaplacidusForceFieldLevel(state);
        const nextState = applyMegastructureTechnology(researchedState, command.technologyId);
        const events: EngineEvent[] = [
          { type: "technology.researched", technologyId: command.technologyId },
        ];
        if (previousForceFieldLevel < 4 && miaplacidusForceFieldLevel(nextState) >= 4)
          events.push({ type: "megastructure.force-field-breached" });
        return success(nextState, events, state);
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
          const capacity =
            (
              ENERGY_BUILDINGS[command.buildingId as "battery1" | "battery2" | "battery3"] as {
                readonly capacity: number;
              }
            ).capacity *
            megastructureBatteryCapacityMultiplier(state) *
            state.run.newsTicker.powerCapacityMultiplier;
          const totalCapacity = power.capacity + capacity;
          power = {
            ...power,
            capacity: totalCapacity,
            quantity: power.infinitePower ? totalCapacity : power.quantity,
          };
        }
        return success(
          incrementAccepted(
            incrementScienceBuildingHistory(
              incrementEnergyBuildingHistory(
                {
                  ...state,
                  run: {
                    ...state.run,
                    cash,
                    goods,
                    upgrades,
                    economy: { ...state.run.economy, buildingEnabled, power },
                  },
                },
                command.buildingId,
                1,
              ),
              command.buildingId,
              1,
            ),
          ),
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
            ).capacity *
            megastructureBatteryCapacityMultiplier(state) *
            state.run.newsTicker.powerCapacityMultiplier *
            plan.count;
          const totalCapacity = power.capacity + capacity;
          power = {
            ...power,
            capacity: totalCapacity,
            quantity: power.infinitePower ? totalCapacity : power.quantity,
          };
        }
        return success(
          incrementAccepted(
            incrementScienceBuildingHistory(
              incrementEnergyBuildingHistory(
                {
                  ...state,
                  run: {
                    ...state.run,
                    cash,
                    goods,
                    upgrades,
                    economy: { ...state.run.economy, buildingEnabled, power },
                  },
                },
                command.buildingId,
                plan.count,
              ),
              command.buildingId,
              plan.count,
            ),
          ),
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
        const timedWarpActive = state.run.timeWarp.remainingMs > 0;
        const alwaysOnBlackHole = state.permanent.blackHole.alwaysOn;
        const clockInput = timedWarpActive
          ? {
              ...command.input,
              timeWarpMultiplier: state.run.timeWarp.multiplier,
              ...(alwaysOnBlackHole
                ? { blackHoleAlwaysOn: true, blackHolePower: state.permanent.blackHole.power }
                : { timeWarpRemainingMs: state.run.timeWarp.remainingMs }),
            }
          : alwaysOnBlackHole
            ? {
                ...command.input,
                blackHoleAlwaysOn: true,
                blackHolePower: state.permanent.blackHole.power,
              }
            : command.input;
        const advanced = advanceClock(state.run.clock, clockInput);
        const wallElapsedMs = advanced.steps.reduce(
          (total, step) => total + (step.phase === "wall" ? step.elapsedMs : 0),
          0,
        );
        const offlineElapsedMs = advanced.steps.reduce(
          (total, step) => total + (step.phase === "offline" ? step.offlineElapsedMs : 0),
          0,
        );
        const returnedFromHidden = !state.run.clock.foreground;
        const warpElapsedMs = returnedFromHidden
          ? Math.max(wallElapsedMs, offlineElapsedMs)
          : wallElapsedMs + offlineElapsedMs;
        const warpRemainingBefore = state.run.timeWarp.remainingMs;
        const timeWarp = timedWarpActive
          ? state.run.timeWarp.remainingMs > warpElapsedMs
            ? { ...state.run.timeWarp, remainingMs: state.run.timeWarp.remainingMs - warpElapsedMs }
            : { multiplier: 1, remainingMs: 0 }
          : state.run.timeWarp;
        const powerPrepared = prepareSpaceSurveyPower(state, command.tickPlan, advanced.steps);
        let nextState: GameState = {
          ...powerPrepared,
          run: { ...powerPrepared.run, clock: advanced.state, timeWarp },
        };
        const events: EngineEvent[] = [];
        let cashEarned = 0;
        let researchPointsEarned = 0;
        let goodsProduced = 0;
        const goodsProducedByGood = Object.fromEntries(
          ECONOMIC_GOOD_IDS.map((id) => [id, 0]),
        ) as Record<EconomicGoodId, number>;
        let precipitationCollected = 0;
        let foregroundActiveMs = 0;
        for (const step of advanced.steps) {
          if (step.phase === "foreground") foregroundActiveMs += step.elapsedMs;
          const elapsedMs =
            step.phase === "foreground"
              ? step.warpedElapsedMs
              : step.phase === "offline"
                ? step.elapsedMs
                : 0;
          const rocketsBeforeStep = nextState.run.space.rockets;
          const timersBeforeStep = nextState.run.timers;
          const timerStep = advanceTimers(nextState.run.timers, [step]);
          nextState = { ...nextState, run: { ...nextState.run, timers: timerStep.timers } };
          events.push(...timerStep.events);
          const blackHoleTimerCompletion = completeBlackHoleTimers(nextState, timerStep.events);
          nextState = blackHoleTimerCompletion.state;
          events.push(...blackHoleTimerCompletion.events);
          const surveyCompletion = completeSpaceSurveys(nextState, timerStep.events);
          nextState = surveyCompletion.state;
          events.push(...surveyCompletion.events);
          const journeyCompletion = completeSpaceJourneys(nextState, timerStep.events);
          nextState = journeyCompletion.state;
          events.push(...journeyCompletion.events);
          const weatherCompletion = completeSpaceWeatherCycle(nextState, timerStep.events);
          nextState = weatherCompletion.state;
          events.push(...weatherCompletion.events);
          const battleCompletion = completeSpaceBattles(nextState, timerStep.events);
          nextState = battleCompletion.state;
          events.push(...battleCompletion.events);
          const cosmicRipStep = advanceCosmicRip(nextState, elapsedMs);
          nextState = cosmicRipStep.state;
          events.push(...cosmicRipStep.events);
          if (step.phase === "wall") nextState = advanceGalacticMarket(nextState, step.elapsedMs);
          if (elapsedMs <= 0) continue;
          const miningElapsedByRocket: Partial<Record<(typeof ROCKET_IDS)[number], number>> = {};
          for (const rocketId of ROCKET_IDS) {
            const rocketBeforeStep = rocketsBeforeStep[rocketId];
            if (rocketBeforeStep.phase === "mining") {
              miningElapsedByRocket[rocketId] = elapsedMs;
              continue;
            }
            if (rocketBeforeStep.phase !== "outbound" || !rocketBeforeStep.timerId) continue;
            const timerBeforeStep = timersBeforeStep[rocketBeforeStep.timerId];
            if (
              timerBeforeStep &&
              timerStep.events.some(
                (event) => event.type === "timer.completed" && event.timerId === timerBeforeStep.id,
              )
            ) {
              const outboundRemainingMs = timerBeforeStep.durationMs - timerBeforeStep.elapsedMs;
              miningElapsedByRocket[rocketId] = Math.max(0, elapsedMs - outboundRemainingMs);
            }
          }
          const mining = advanceSpaceMining(nextState, miningElapsedByRocket, elapsedMs);
          nextState = mining.state;
          events.push(...mining.events);
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
          if (!previousPower.tripped && power.tripped) {
            events.push({ type: "economy.power.tripped" });
            nextState = incrementEnergyTripHistory(nextState);
          }
          const researchGain = (tickPlan.researchPerSecond ?? 0) * seconds;
          researchPointsEarned += researchGain;
          let researchPoints = nextState.run.researchPoints + researchGain;
          const researchedTechnologies = [...nextState.run.economy.researchedTechnologies];
          const unlockedResources = [...nextState.run.unlockedResources];
          const unlockedCompounds = [...nextState.run.economy.unlockedCompounds];
          const revealedBeforePurchase = new Set(
            TECHNOLOGY_CATALOG.filter(
              (technology) =>
                nextState.run.economy.revealedTechnologies.includes(technology.id) ||
                researchPoints > technology.revealThreshold ||
                researchedTechnologies.includes(technology.id),
            ).map((technology) => technology.id),
          );
          if (
            nextState.run.economy.researchAutobuyerEnabled &&
            hasPermanentPerk(nextState, "roboticResearchAutomation")
          ) {
            for (let pass = 0; pass < TECHNOLOGY_CATALOG.length; pass += 1) {
              const nextTechnology = TECHNOLOGY_CATALOG.find(
                (technology) =>
                  revealedBeforePurchase.has(technology.id) &&
                  !researchedTechnologies.includes(technology.id) &&
                  !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(technology.id) &&
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
              nextState.run.economy.revealedTechnologies.includes(technology.id) ||
              revealedBeforePurchase.has(technology.id) ||
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
              space: advanceRocketFuel(
                nextState,
                elapsedMs,
                gridRunning || previousPower.infinitePower,
              ).run.space,
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
          for (const goodId of ECONOMIC_GOOD_IDS)
            goodsProducedByGood[goodId] += transaction.goodsProducedByGood[goodId];
          precipitationCollected += transaction.precipitationCollected;
          events.push(...transaction.events);
          const eventStep = advanceRandomEvents(nextState, elapsedMs);
          nextState = eventStep.state;
          events.push(...eventStep.events);
          if (nextState.settings.newsTickerEnabled !== false) {
            const newsStep = advanceNewsTicker(nextState, elapsedMs);
            nextState = newsStep.state;
            events.push(...newsStep.events);
          }
        }
        if (
          state.run.blackHoleWarpActive &&
          warpRemainingBefore > 0 &&
          timeWarp.remainingMs === 0
        ) {
          const elapsedAfterWarpMs = returnedFromHidden
            ? Math.max(0, offlineElapsedMs - warpRemainingBefore)
            : Math.max(0, wallElapsedMs - warpRemainingBefore) +
              Math.max(0, offlineElapsedMs - Math.max(0, warpRemainingBefore - wallElapsedMs));
          const ended = finishBlackHoleWarp(nextState, elapsedAfterWarpMs);
          nextState = ended.state;
          events.push(...ended.events);
        }
        const goodsProducedThisRun = { ...nextState.run.goodsProducedThisRun };
        const lifetimeGoodsProducedByGood = {
          ...nextState.statistics.lifetimeGoodsProducedByGood,
        };
        for (const goodId of ECONOMIC_GOOD_IDS) {
          const amount = goodsProducedByGood[goodId];
          goodsProducedThisRun[goodId] = Math.min(
            Number.MAX_SAFE_INTEGER,
            goodsProducedThisRun[goodId] + amount,
          );
          lifetimeGoodsProducedByGood[goodId] = Math.min(
            Number.MAX_SAFE_INTEGER,
            lifetimeGoodsProducedByGood[goodId] + amount,
          );
        }
        nextState = {
          ...nextState,
          run: {
            ...nextState.run,
            goodsProducedThisRun,
            researchPointsEarnedThisRun: Math.min(
              Number.MAX_SAFE_INTEGER,
              nextState.run.researchPointsEarnedThisRun + researchPointsEarned,
            ),
            space: {
              ...nextState.run.space,
              precipitationCollectedThisRun:
                nextState.run.space.precipitationCollectedThisRun + precipitationCollected,
            },
          },
          statistics: {
            ...nextState.statistics,
            lifetimeCashEarned: nextState.statistics.lifetimeCashEarned + cashEarned,
            lifetimeGoodsProduced: nextState.statistics.lifetimeGoodsProduced + goodsProduced,
            lifetimeGoodsProducedByGood,
            lifetimeResearchPointsEarned: Math.min(
              Number.MAX_SAFE_INTEGER,
              nextState.statistics.lifetimeResearchPointsEarned + researchPointsEarned,
            ),
            lifetimeActiveMs: Math.min(
              Number.MAX_SAFE_INTEGER,
              nextState.statistics.lifetimeActiveMs + foregroundActiveMs,
            ),
            completedTimers: Math.min(
              Number.MAX_SAFE_INTEGER,
              nextState.statistics.completedTimers +
                events.reduce(
                  (total, event) =>
                    total +
                    (event.type === "timer.completed"
                      ? event.completions
                      : event.type === "black-hole.charge-completed"
                        ? 1
                        : 0),
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
        const timeAdvanced: GameState = {
          ...state,
          run: { ...state.run, timers: completed.timers },
        };
        const surveyCompletion = completeSpaceSurveys(timeAdvanced, completed.events);
        const journeyCompletion = completeSpaceJourneys(surveyCompletion.state, completed.events);
        const weatherCompletion = completeSpaceWeatherCycle(
          journeyCompletion.state,
          completed.events,
        );
        const battleCompletion = completeSpaceBattles(weatherCompletion.state, completed.events);
        const blackHoleCompletion = completeBlackHoleTimers(
          battleCompletion.state,
          completed.events,
        );
        const nextState = incrementAccepted({
          ...blackHoleCompletion.state,
          statistics: {
            ...blackHoleCompletion.state.statistics,
            completedTimers: Math.min(
              Number.MAX_SAFE_INTEGER,
              state.statistics.completedTimers + (completed.completed ? 1 : 0),
            ),
          },
        });
        return success(
          nextState,
          [
            ...completed.events,
            ...surveyCompletion.events,
            ...journeyCompletion.events,
            ...weatherCompletion.events,
            ...battleCompletion.events,
            ...blackHoleCompletion.events,
          ],
          state,
        );
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
      case "onboarding.complete":
        return success(incrementAccepted(state), [{ type: "onboarding.completed" }], state);
    }
  } catch {
    return reject(state, { code: "transition-failed", messageKey: "engine.error.recovered" });
  }
}

/** Apply achievements once, after an accepted command has completed its normal state transition. */
export function transition(state: GameState, command: GameCommand): EngineResult {
  const result = transitionRaw(state, command);
  if (!result.accepted) return result;
  const achievements = applyAchievementBoundary(state, result.state, result.events);
  if (!isValidGameState(achievements.state))
    return reject(state, { code: "transition-failed", messageKey: "engine.error.recovered" });
  return {
    ...result,
    state: achievements.state,
    events: [...result.events, ...achievements.events],
  };
}

export function canAffordPurchaseSelector(
  state: GameState,
  command: PurchaseCommand,
): PreconditionResult {
  return checkPurchase(state, command);
}
