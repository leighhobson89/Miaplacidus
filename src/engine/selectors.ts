import type {
  AutobuyerTier,
  CompoundId,
  EconomicGoodId,
  FixedUpgradeId,
  MaterialId,
  UpgradeId,
} from "../content/ids";
import { autobuyerUpgradeId } from "../content/ids";
import type { GameState, GoodState } from "./state";
import {
  checkPreconditions,
  checkPurchase,
  buildingBuyMaxPlan,
  buildingCost,
  type GameCommand,
  type CommandFailure,
  type PurchaseCommand,
  type PreconditionResult,
} from "./commands";
import { COMPOUND_CATALOG, MATERIAL_CATALOG, SCIENCE_BUILDINGS } from "../content/economy";
import type { RandomEventId } from "../content/metaSignals";
import {
  affordablePurchaseCount,
  fusionEfficiencyRange,
  fusionYield,
  selectedSaleAmount,
  type SaleSelection,
} from "../content/economyRules";
import { philosophyRepeatableRank, philosophyCompoundRecipe } from "./philosophy";
import {
  HYDROGEN_AUTOBUYER_RATE,
  HYDROGEN_STORAGE_PRICE_OFFSET,
  hydrogenAutobuyerCount,
  hydrogenAutobuyerPrice,
} from "../content/hydrogen";
import { displayQuantity } from "./precision";
import {
  permanentPerkPurchaseCount,
  repeatedPerkMultiplier,
  storageCapacityAfterPurchase,
} from "../content/economyRules";
import { createEconomyTickPlan } from "./economySimulation";
import { CASINO_CP_BASE_COST, CASINO_CP_VALUES } from "../content/galacticCasino";
import type { CasinoCommand } from "./galacticCasino";
import { enemyFleetPower, totalPlayerFleetPower } from "./fleetMechanics";
import { isStarshipReady } from "./spaceRules";

export interface GameSnapshot {
  readonly pioneerName: string;
  readonly cash: number;
  readonly researchPoints: number;
  readonly goods: Readonly<Record<EconomicGoodId, GoodState>>;
  readonly unlockedResources: GameState["run"]["unlockedResources"];
  readonly upgrades: GameState["run"]["upgrades"];
  readonly timers: GameState["run"]["timers"];
  readonly paused: boolean;
  readonly simulationMs: number;
  readonly locale: GameState["settings"]["locale"];
  readonly themeId: GameState["settings"]["themeId"];
  readonly currencyId: GameState["settings"]["currencyId"];
  readonly notation: GameState["settings"]["notation"];
  readonly soundEnabled: boolean;
  readonly hydrogenAutobuyerCount: number;
  readonly hydrogenAutobuyerEnabled: boolean;
  readonly hydrogenAutobuyerRatePerSecond: number;
  readonly hydrogenProductionPerSecond: number;
  readonly hydrogenProductionBlockedByStorage: boolean;
  readonly revision: number;
}

export function selectGameSnapshot(state: GameState): GameSnapshot {
  const economyTick = createEconomyTickPlan(state);
  return {
    pioneerName: state.run.pioneerName,
    cash: state.run.cash,
    researchPoints: state.run.researchPoints,
    goods: state.run.goods,
    unlockedResources: state.run.unlockedResources,
    upgrades: state.run.upgrades,
    timers: state.run.timers,
    paused: state.run.clock.paused,
    simulationMs: state.run.clock.simulationMs,
    locale: state.settings.locale,
    themeId: state.settings.themeId,
    currencyId: state.settings.currencyId,
    notation: state.settings.notation,
    soundEnabled: state.settings.soundEnabled,
    hydrogenAutobuyerCount: hydrogenAutobuyerCount(state.run.upgrades),
    hydrogenAutobuyerEnabled: state.run.hydrogenAutobuyerEnabled,
    hydrogenAutobuyerRatePerSecond:
      HYDROGEN_AUTOBUYER_RATE *
      repeatedPerkMultiplier(state.permanent.acquiredPerks, "smartAutoBuyers", 1.5),
    hydrogenProductionPerSecond: economyTick.netRatesPerSecond.hydrogen ?? 0,
    hydrogenProductionBlockedByStorage: economyTick.capacityBlockedGoodIds.includes("hydrogen"),
    revision: state.statistics.acceptedCommands,
  };
}

export interface TopStatusEventSelection {
  readonly eventId: RandomEventId | null;
  readonly active: boolean;
  readonly remainingMs: number | null;
}

/**
 * Mirrors Cosmic Forge's AP anticipated counter: scanned systems with an
 * Industrial or Spacefaring civilization contribute that system profile's
 * base ascendency value once during the current run.
 */
export function selectRunApAnticipated(state: GameState): number {
  const eligibleSystemIds = new Set(
    state.run.space.systemEncounters
      .filter(
        ({ civilizationLevel }) =>
          civilizationLevel === "industrial" || civilizationLevel === "spacefaring",
      )
      .map(({ systemId }) => systemId),
  );
  const ascendencyPointsBySystemId = new Map(
    state.run.space.systemProfiles.map(({ systemId, ascendencyPoints }) => [
      systemId,
      ascendencyPoints,
    ]),
  );

  let total = 0;
  for (const systemId of eligibleSystemIds) {
    total += ascendencyPointsBySystemId.get(systemId) ?? 0;
  }
  return total;
}

export interface InterstellarStatisticsSelection {
  readonly starStudyRange: number;
  readonly starshipBuilt: boolean;
  readonly distanceTravelledThisRun: number;
  readonly distanceTravelledLifetime: number;
  readonly systemScanned: boolean;
  readonly fleetAttackStrength: number;
  readonly envoy: number;
  readonly scout: number;
  readonly marauder: number;
  readonly landStalker: number;
  readonly navalStrafer: number;
  readonly enemyName: string | null;
  readonly enemyDefenceRemaining: number | null;
  readonly blackHoleDiscovered: boolean;
  readonly blackHoleAlwaysActive: boolean;
  readonly blackHoleStrength: number;
  readonly apFromStarVoyage: number;
}

/** Projects source-ordered live Interstellar Statistics values from engine state. */
export function selectInterstellarStatistics(state: GameState): InterstellarStatisticsSelection {
  const space = state.run.space;
  const destinationId = space.starship.destinationSystemId;
  const encounter = destinationId
    ? (space.systemEncounters.find(({ systemId }) => systemId === destinationId) ?? null)
    : null;
  return {
    starStudyRange: space.starStudyRange,
    starshipBuilt: isStarshipReady(space),
    distanceTravelledThisRun: space.starshipDistanceTravelledThisRun,
    distanceTravelledLifetime: state.statistics.lifetimeStarshipDistanceTravelled,
    systemScanned: encounter !== null,
    fleetAttackStrength: Math.floor(
      totalPlayerFleetPower(space.playerFleetCombatTotals).attackPower,
    ),
    envoy: space.fleetEnvoyBuilt ? 1 : 0,
    scout: space.playerFleets.scout,
    marauder: space.playerFleets.marauder,
    landStalker: space.playerFleets.landStalker,
    navalStrafer: space.playerFleets.navalStrafer,
    enemyName: encounter?.raceName ?? null,
    enemyDefenceRemaining: encounter ? enemyFleetPower(encounter.enemyFleets) : null,
    blackHoleDiscovered: state.permanent.blackHole.discovered,
    blackHoleAlwaysActive: state.permanent.blackHole.alwaysOn,
    blackHoleStrength: state.permanent.blackHole.power,
    apFromStarVoyage: selectRunApAnticipated(state),
  };
}

/** Picks the newest active event, falling back to the latest recorded event. */
export function selectTopStatusEvent(state: GameState): TopStatusEventSelection {
  const { history, activeEffects } = state.run.randomEvents;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const eventId = history[index]!.id;
    const activeEffect = activeEffects.find(
      (effect) => effect.id === eventId && effect.remainingMs > 0,
    );
    if (activeEffect) {
      return { eventId, active: true, remainingMs: activeEffect.remainingMs };
    }
  }

  let latestActiveEffect: (typeof activeEffects)[number] | undefined;
  for (let index = activeEffects.length - 1; index >= 0; index -= 1) {
    if (activeEffects[index]!.remainingMs > 0) {
      latestActiveEffect = activeEffects[index];
      break;
    }
  }
  if (latestActiveEffect) {
    return {
      eventId: latestActiveEffect.id,
      active: true,
      remainingMs: latestActiveEffect.remainingMs,
    };
  }

  const latestHistory = history[history.length - 1];
  return latestHistory
    ? { eventId: latestHistory.id, active: false, remainingMs: null }
    : { eventId: null, active: false, remainingMs: null };
}

export interface ResearchProductionBreakdown {
  readonly scienceKits: number;
  readonly scienceClubs: number;
  readonly poweredScienceLabs: number;
  readonly megastructureOtherBonus: number;
  readonly total: number;
}

/** Mirrors the simulation's enabled-building and power rules for live RP details. */
export function selectResearchProductionBreakdown(state: GameState): ResearchProductionBreakdown {
  const owned = (id: keyof typeof SCIENCE_BUILDINGS) => state.run.upgrades[id] ?? 0;
  const enabledCount = (id: keyof typeof SCIENCE_BUILDINGS) =>
    state.run.economy.buildingEnabled[id] ? owned(id) : 0;
  const gridRunning = state.run.economy.power.gridEnabled && !state.run.economy.power.tripped;
  const scienceKits = enabledCount("scienceKit") * SCIENCE_BUILDINGS.scienceKit.ratePerSecond;
  const scienceClubs = enabledCount("scienceClub") * SCIENCE_BUILDINGS.scienceClub.ratePerSecond;
  const poweredScienceLabs = gridRunning
    ? enabledCount("scienceLab") * SCIENCE_BUILDINGS.scienceLab.ratePerSecond
    : 0;
  const total = createEconomyTickPlan(state).researchPerSecond;

  return {
    scienceKits,
    scienceClubs,
    poweredScienceLabs,
    megastructureOtherBonus: Math.max(0, total - scienceKits - scienceClubs - poweredScienceLabs),
    total,
  };
}

export function selectGood(state: GameState, goodId: EconomicGoodId): GoodState {
  return state.run.goods[goodId];
}

export function selectUpgradeCount(state: GameState, upgradeId: UpgradeId): number {
  return state.run.upgrades[upgradeId] ?? 0;
}

export function selectPurchase(state: GameState, command: PurchaseCommand): PreconditionResult {
  return checkPurchase(state, command);
}

export interface EconomyActionSelection {
  readonly enabled: boolean;
  readonly failure?: CommandFailure;
}

/** A render-safe view of the engine's current action precondition. */
export function selectEconomyAction(
  state: GameState,
  command: GameCommand,
): EconomyActionSelection {
  const result = checkPreconditions(state, command);
  return result.ok ? { enabled: true } : { enabled: false, failure: result.failure };
}

export interface CasinoPointPurchasePlan extends EconomyActionSelection {
  readonly cost: number;
  readonly available: number;
}

/** Returns the exact engine-priced payment preview for buying Casino points. */
export function selectCasinoPointPurchase(
  state: GameState,
  goodId: EconomicGoodId | "cash",
  amount: number,
): CasinoPointPurchasePlan {
  const validAmount = Number.isSafeInteger(amount) && amount > 0;
  const cost = validAmount
    ? Math.ceil((amount * CASINO_CP_BASE_COST) / CASINO_CP_VALUES[goodId])
    : 0;
  const available = goodId === "cash" ? state.run.cash : state.run.goods[goodId].quantity;
  const action = selectEconomyAction(state, { type: "casino.points.buy", goodId, amount });
  return { ...action, cost, available };
}

/** CP required by each casino action that charges an entry amount. */
export function selectCasinoEntryCost(command: CasinoCommand): number | null {
  switch (command.type) {
    case "casino.double-or-nothing.play":
      return command.stake;
    case "casino.wheel.spin":
      return 1;
    case "casino.higher-lower.start":
      return 5;
    case "casino.void-seer.play":
      return ({ 1: 7, 2: 10, 3: 15 } as const)[command.tier];
    default:
      return null;
  }
}

export interface SaleSelectionView extends EconomyActionSelection {
  readonly amount: number;
  readonly proceeds: number;
}

export function selectGoodSale(
  state: GameState,
  goodId: EconomicGoodId,
  requested: SaleSelection,
): SaleSelectionView {
  const amount = selectedSaleAmount(state.run.goods[goodId].quantity, requested);
  const action = selectEconomyAction(state, {
    type: "resource.sell",
    goodId,
    amount: requested,
  });
  return {
    ...action,
    amount,
    proceeds: amount * state.run.goods[goodId].saleValue,
  };
}

export interface CompoundCreationSelection extends EconomyActionSelection {
  readonly outputAmount: number;
  readonly requiredInputs: readonly { readonly goodId: EconomicGoodId; readonly amount: number }[];
}

export function selectCompoundCreation(
  state: GameState,
  goodId: CompoundId,
  amount: number,
): CompoundCreationSelection {
  const recipe = philosophyCompoundRecipe(state, goodId);
  const validAmount = Number.isSafeInteger(amount) && amount > 0;
  return {
    ...selectEconomyAction(state, { type: "economy.compound.create", goodId, amount }),
    outputAmount: validAmount ? amount : 0,
    requiredInputs: recipe.map((input) => ({
      goodId: input.goodId,
      amount: input.amount * amount,
    })),
  };
}

export interface FusionPreviewSelection {
  readonly validTarget: boolean;
  readonly canFuse: boolean;
  readonly sourceAvailable: number;
  readonly minimumYield: number;
  readonly maximumYield: number;
  readonly freeStorage: number;
  readonly minimumStored: number;
  readonly maximumStored: number;
}

/** Shows the efficiency interval without consuming randomness or changing game state. */
export function selectFusionPreview(
  state: GameState,
  sourceId: MaterialId,
  targetId: MaterialId,
  amount: number,
): FusionPreviewSelection {
  const sourceDefinition = MATERIAL_CATALOG[
    sourceId
  ] as import("../content/economy").MaterialDefinition;
  const output = sourceDefinition.fusionOutputs?.find((entry) => entry.goodId === targetId);
  const validAmount = Number.isSafeInteger(amount) && amount > 0;
  const [minimumEfficiency, maximumEfficiency] = fusionEfficiencyRange(
    state.run.economy.researchedTechnologies,
  );
  const firstDiscovery = !state.run.unlockedResources.includes(targetId);
  const minimumYield =
    output && validAmount
      ? firstDiscovery
        ? Math.ceil((amount * output.ratio) / 4)
        : fusionYield(amount, output.ratio, minimumEfficiency)
      : 0;
  const maximumYield =
    output && validAmount
      ? firstDiscovery
        ? minimumYield
        : fusionYield(amount, output.ratio, maximumEfficiency)
      : 0;
  const target = state.run.goods[targetId];
  const source = state.run.goods[sourceId];
  const canFuse = Boolean(
    output &&
    validAmount &&
    amount <= source.quantity &&
    state.run.unlockedResources.includes(sourceId) &&
    sourceDefinition.fusionTechId &&
    state.run.economy.researchedTechnologies.includes(
      sourceDefinition.fusionTechId as import("../content/ids").TechId,
    ),
  );
  const freeStorage = Math.max(0, target.storageCapacity - target.quantity);
  return {
    validTarget: Boolean(output),
    canFuse,
    sourceAvailable: source.quantity,
    minimumYield,
    maximumYield,
    freeStorage,
    minimumStored: Math.min(minimumYield, freeStorage),
    maximumStored: Math.min(maximumYield, freeStorage),
  };
}

export interface AutobuyerBuyMaxSelection extends EconomyActionSelection {
  readonly count: number;
  readonly totalCost: number;
  readonly ratePerSecond: number;
}

export function selectAutobuyerBuyMax(
  state: GameState,
  goodId: EconomicGoodId,
  tier: AutobuyerTier,
): AutobuyerBuyMaxSelection {
  const definition =
    goodId in MATERIAL_CATALOG
      ? MATERIAL_CATALOG[goodId as MaterialId].buyerTiers[tier - 1]!
      : COMPOUND_CATALOG[goodId as CompoundId].buyerTiers[tier - 1]!;
  const upgradeId = autobuyerUpgradeId(goodId, tier);
  const discount =
    goodId in MATERIAL_CATALOG ? 0.95 ** philosophyRepeatableRank(state, "laserMining") : 1;
  const available = state.run.goods[goodId].quantity;
  const plan = affordablePurchaseCount(
    definition.price * discount,
    state.run.upgrades[upgradeId] ?? 0,
    available,
  );
  const action = selectEconomyAction(state, {
    type: "economy.autobuyer.buyMax",
    goodId,
    tier,
  });
  return {
    ...action,
    count: action.enabled ? plan.count : 0,
    totalCost: action.enabled ? plan.totalCost : 0,
    ratePerSecond: definition.ratePerSecond,
  };
}

export interface BuildingBuyMaxSelection extends EconomyActionSelection {
  readonly count: number;
  readonly cashCost: number;
  readonly materialCosts: readonly { readonly goodId: EconomicGoodId; readonly amount: number }[];
  readonly perBuildingCost: ReturnType<typeof buildingCost>;
}

export function selectBuildingBuyMax(
  state: GameState,
  buildingId: FixedUpgradeId,
): BuildingBuyMaxSelection {
  const plan = buildingBuyMaxPlan(state, buildingId);
  const action = selectEconomyAction(state, { type: "economy.building.buyMax", buildingId });
  return {
    ...action,
    count: action.enabled ? plan.count : 0,
    cashCost: action.enabled ? plan.cash : 0,
    materialCosts: action.enabled ? plan.materials : [],
    perBuildingCost: buildingCost(state, buildingId),
  };
}

export interface HydrogenPurchaseSelection {
  readonly enabled: boolean;
  readonly cost: number;
  readonly capacityAfterPurchase?: number;
  readonly reasonKey?: string;
  readonly required?: number;
}

function purchaseSelection(
  state: GameState,
  command: Extract<
    GameCommand,
    { readonly type: "storage.purchase" | "hydrogen.autobuyer.purchase" }
  >,
  cost: number,
  capacityAfterPurchase?: number,
): HydrogenPurchaseSelection {
  const check = checkPreconditions(state, command);
  if (check.ok) {
    return {
      enabled: true,
      cost,
      ...(capacityAfterPurchase === undefined ? {} : { capacityAfterPurchase }),
    };
  }
  return {
    enabled: false,
    cost,
    reasonKey: check.failure.messageKey,
    ...(check.failure.code === "insufficient-material" ? { required: check.failure.required } : {}),
    ...(capacityAfterPurchase === undefined ? {} : { capacityAfterPurchase }),
  };
}

export function selectHydrogenStoragePurchase(state: GameState): HydrogenPurchaseSelection {
  const capacity = state.run.goods.hydrogen.storageCapacity;
  return purchaseSelection(
    state,
    { type: "storage.purchase", goodId: "hydrogen" },
    Math.max(0, capacity - HYDROGEN_STORAGE_PRICE_OFFSET),
    storageCapacityAfterPurchase(
      capacity,
      permanentPerkPurchaseCount(state.permanent.acquiredPerks, "efficientStorage"),
      state.permanent.philosophyId === "constructor" && state.run.philosophyAbilityActive ? 5 : 2,
    ),
  );
}

export function selectHydrogenAutobuyerPurchase(state: GameState): HydrogenPurchaseSelection {
  const owned = hydrogenAutobuyerCount(state.run.upgrades);
  return purchaseSelection(
    state,
    { type: "hydrogen.autobuyer.purchase" },
    hydrogenAutobuyerPrice(owned),
  );
}

export interface HydrogenSaleSelection {
  readonly enabled: boolean;
  readonly amount: number;
  readonly cash: number;
  readonly reasonKey?: string;
}

export function selectHydrogenSale(
  state: GameState,
  requested: number | "all",
): HydrogenSaleSelection {
  const check = checkPreconditions(state, {
    type: "resource.sell",
    goodId: "hydrogen",
    amount: requested,
  });
  const stock = state.run.goods.hydrogen.quantity;
  const wholeStock = displayQuantity(stock);
  const amount = requested === "all" ? wholeStock : Math.min(wholeStock, requested);
  const enabled = check.ok && amount > 0;
  return {
    enabled,
    amount,
    cash: amount * state.run.goods.hydrogen.saleValue,
    ...(enabled ? {} : { reasonKey: check.ok ? "ui.hydrogen.no-stock" : check.failure.messageKey }),
  };
}

export function selectHydrogenCollection(state: GameState): {
  enabled: boolean;
  reasonKey?: string;
} {
  const hydrogen = state.run.goods.hydrogen;
  if (!state.run.unlockedResources.includes("hydrogen")) {
    return { enabled: false, reasonKey: "ui.hydrogen.locked" };
  }
  return hydrogen.quantity + 1 <= hydrogen.storageCapacity
    ? { enabled: true }
    : { enabled: false, reasonKey: "ui.hydrogen.inventory-full" };
}
