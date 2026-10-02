import type { EconomicGoodId, UpgradeId } from "../content/ids";
import type { GameState, GoodState } from "./state";
import { checkPurchase, type PurchaseCommand, type PreconditionResult } from "./commands";

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
