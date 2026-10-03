import type { EconomicGoodId, UpgradeId } from "../content/ids";
import type { GameState, GoodState } from "./state";
import {
  checkPreconditions,
  checkPurchase,
  type GameCommand,
  type PurchaseCommand,
  type PreconditionResult,
} from "./commands";
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
  readonly notation: GameState["settings"]["notation"];
  readonly soundEnabled: boolean;
  readonly hydrogenAutobuyerCount: number;
  readonly hydrogenAutobuyerEnabled: boolean;
  readonly hydrogenAutobuyerRatePerSecond: number;
  readonly hydrogenProductionPerSecond: number;
  readonly revision: number;
}

export function selectGameSnapshot(state: GameState): GameSnapshot {
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
    notation: state.settings.notation,
    soundEnabled: state.settings.soundEnabled,
    hydrogenAutobuyerCount: hydrogenAutobuyerCount(state.run.upgrades),
    hydrogenAutobuyerEnabled: state.run.hydrogenAutobuyerEnabled,
    hydrogenAutobuyerRatePerSecond:
      HYDROGEN_AUTOBUYER_RATE *
      repeatedPerkMultiplier(state.permanent.acquiredPerks, "smartAutoBuyers", 1.5),
    hydrogenProductionPerSecond: createEconomyTickPlan(state).netRatesPerSecond.hydrogen ?? 0,
    revision: state.statistics.acceptedCommands,
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
