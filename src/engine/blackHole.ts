import {
  BLACK_HOLE_BASE_CHARGE_MS,
  BLACK_HOLE_MINIMUM_CHARGE_MS,
  BLACK_HOLE_POWER_INCREMENT,
  BLACK_HOLE_HIGH_POWER_INCREMENT,
  BLACK_HOLE_DURATION_INCREMENT_MS,
  BLACK_HOLE_PRICE_MULTIPLIER,
  BLACK_HOLE_RECHARGE_FACTOR,
  type BlackHoleUpgradeId,
} from "../content/blackHole";
import { nextRandom } from "./random";
import { canAfford, settleSpend } from "./precision";
import { createTimer, createTimerId, type TimerEvent } from "./timers";
import type { GameState } from "./state";

export const BLACK_HOLE_CHARGE_TIMER_ID = createTimerId("black-hole", "charge");

export type BlackHoleCommand =
  | { readonly type: "black-hole.research" }
  | { readonly type: "black-hole.upgrade"; readonly upgradeId: BlackHoleUpgradeId }
  | { readonly type: "black-hole.activate" };

export type BlackHoleFailure = {
  readonly code:
    | "black-hole-undiscovered"
    | "black-hole-already-researched"
    | "black-hole-not-researched"
    | "black-hole-insufficient-research"
    | "black-hole-upgrade-maxed"
    | "black-hole-charge-running"
    | "black-hole-warp-running";
  readonly messageKey:
    | "blackHole.error.undiscovered"
    | "blackHole.error.already-researched"
    | "blackHole.error.not-researched"
    | "blackHole.error.insufficient-research"
    | "blackHole.error.upgrade-maxed"
    | "blackHole.error.charge-running"
    | "blackHole.error.warp-running";
};

export type BlackHoleEvent =
  | {
      readonly type: "black-hole.discovery-checked";
      readonly probability: number;
      readonly discovered: boolean;
    }
  | { readonly type: "black-hole.researched" }
  | { readonly type: "black-hole.upgrade-purchased"; readonly upgradeId: BlackHoleUpgradeId }
  | { readonly type: "black-hole.charge-started"; readonly durationMs: number }
  | { readonly type: "black-hole.charge-completed" }
  | {
      readonly type: "black-hole.warp-activated";
      readonly durationMs: number;
      readonly multiplier: number;
    }
  | { readonly type: "black-hole.warp-ended" };

export interface BlackHoleTransition {
  readonly state: GameState;
  readonly events: readonly BlackHoleEvent[];
}

export interface BlackHoleDiscoveryTransition {
  readonly state: GameState;
  readonly events: readonly Extract<
    BlackHoleEvent,
    { readonly type: "black-hole.discovery-checked" }
  >[];
}

export function isBlackHoleCommand(value: { readonly type: string }): value is BlackHoleCommand {
  return (
    value.type === "black-hole.research" ||
    value.type === "black-hole.upgrade" ||
    value.type === "black-hole.activate"
  );
}

function chargeDurationMs(state: GameState): number {
  return Math.max(
    BLACK_HOLE_MINIMUM_CHARGE_MS,
    Math.round(BLACK_HOLE_BASE_CHARGE_MS * state.permanent.blackHole.rechargeMultiplier),
  );
}

export function blackHoleUpgradePrice(state: GameState, upgradeId: BlackHoleUpgradeId): number {
  return state.permanent.blackHole[`${upgradeId}Price`];
}

function chargeTimerRunning(state: GameState): boolean {
  return state.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]?.status === "running";
}

function affordableResearch(state: GameState, required: number): boolean {
  return canAfford(state.run.researchPoints, required);
}

export function checkBlackHoleCommand(
  state: GameState,
  command: BlackHoleCommand,
): BlackHoleFailure | null {
  const hole = state.permanent.blackHole;
  if (!hole.discovered) {
    return { code: "black-hole-undiscovered", messageKey: "blackHole.error.undiscovered" };
  }
  if (command.type === "black-hole.research") {
    if (hole.researched)
      return {
        code: "black-hole-already-researched",
        messageKey: "blackHole.error.already-researched",
      };
    return affordableResearch(state, hole.researchPrice)
      ? null
      : {
          code: "black-hole-insufficient-research",
          messageKey: "blackHole.error.insufficient-research",
        };
  }
  if (!hole.researched)
    return { code: "black-hole-not-researched", messageKey: "blackHole.error.not-researched" };
  if (command.type === "black-hole.upgrade") {
    if (command.upgradeId === "duration" || command.upgradeId === "recharge") {
      if (hole.alwaysOn || chargeDurationMs(state) <= BLACK_HOLE_MINIMUM_CHARGE_MS)
        return { code: "black-hole-upgrade-maxed", messageKey: "blackHole.error.upgrade-maxed" };
    }
    return affordableResearch(state, blackHoleUpgradePrice(state, command.upgradeId))
      ? null
      : {
          code: "black-hole-insufficient-research",
          messageKey: "blackHole.error.insufficient-research",
        };
  }
  if (hole.alwaysOn)
    return { code: "black-hole-upgrade-maxed", messageKey: "blackHole.error.upgrade-maxed" };
  if (state.run.blackHoleWarpActive || state.run.timeWarp.remainingMs > 0)
    return { code: "black-hole-warp-running", messageKey: "blackHole.error.warp-running" };
  if (!state.run.blackHoleChargeReady && chargeTimerRunning(state))
    return { code: "black-hole-charge-running", messageKey: "blackHole.error.charge-running" };
  return null;
}

function startCharge(state: GameState): BlackHoleTransition {
  const durationMs = chargeDurationMs(state);
  const timer = createTimer({ id: BLACK_HOLE_CHARGE_TIMER_ID, domain: "black-hole", durationMs });
  const timers = { ...state.run.timers, [BLACK_HOLE_CHARGE_TIMER_ID]: timer };
  return {
    state: {
      ...state,
      run: { ...state.run, timers, blackHoleChargeReady: false },
    },
    events: [{ type: "black-hole.charge-started", durationMs }],
  };
}

export function resumeBlackHoleCharge(state: GameState): BlackHoleTransition {
  if (
    !state.permanent.blackHole.researched ||
    state.permanent.blackHole.alwaysOn ||
    chargeTimerRunning(state)
  )
    return { state, events: [] };
  return startCharge(state);
}

export function applyBlackHoleCommand(
  state: GameState,
  command: BlackHoleCommand,
): BlackHoleTransition {
  if (command.type === "black-hole.research") {
    const researched = {
      ...state.permanent.blackHole,
      researched: true,
    };
    const paid: GameState = {
      ...state,
      run: {
        ...state.run,
        researchPoints: settleSpend(state.run.researchPoints, researched.researchPrice),
      },
      permanent: { ...state.permanent, blackHole: researched },
    };
    const charging = startCharge(paid);
    return {
      state: charging.state,
      events: [{ type: "black-hole.researched" }, ...charging.events],
    };
  }
  if (command.type === "black-hole.upgrade") {
    const hole = state.permanent.blackHole;
    const price = blackHoleUpgradePrice(state, command.upgradeId);
    const nextPrice = Math.ceil(price * BLACK_HOLE_PRICE_MULTIPLIER);
    let updated = { ...hole };
    if (command.upgradeId === "power") {
      const increase =
        hole.power >= 50 ? BLACK_HOLE_HIGH_POWER_INCREMENT : BLACK_HOLE_POWER_INCREMENT;
      updated = { ...updated, power: hole.power + increase, powerPrice: nextPrice };
    } else if (command.upgradeId === "duration") {
      updated = {
        ...updated,
        durationMs: hole.durationMs + BLACK_HOLE_DURATION_INCREMENT_MS,
        durationPrice: nextPrice,
      };
    } else {
      const nextRechargeMultiplier = Math.max(
        BLACK_HOLE_MINIMUM_CHARGE_MS / BLACK_HOLE_BASE_CHARGE_MS,
        hole.rechargeMultiplier * BLACK_HOLE_RECHARGE_FACTOR,
      );
      updated = {
        ...updated,
        rechargeMultiplier: nextRechargeMultiplier,
        rechargePrice: nextPrice,
        alwaysOn:
          Math.round(BLACK_HOLE_BASE_CHARGE_MS * nextRechargeMultiplier) <=
          BLACK_HOLE_MINIMUM_CHARGE_MS,
      };
    }
    let timers = state.run.timers;
    if (command.upgradeId === "recharge") {
      const oldTimer = timers[BLACK_HOLE_CHARGE_TIMER_ID];
      if (updated.alwaysOn) {
        const cleared = { ...timers };
        delete cleared[BLACK_HOLE_CHARGE_TIMER_ID];
        timers = cleared;
      } else if (oldTimer?.status === "running") {
        const progress = oldTimer.elapsedMs / oldTimer.durationMs;
        const durationMs = Math.max(
          BLACK_HOLE_MINIMUM_CHARGE_MS,
          Math.round(BLACK_HOLE_BASE_CHARGE_MS * updated.rechargeMultiplier),
        );
        timers = {
          ...timers,
          [BLACK_HOLE_CHARGE_TIMER_ID]: {
            ...oldTimer,
            durationMs,
            elapsedMs: Math.min(durationMs - 1, Math.round(durationMs * progress)),
          },
        };
      }
    }
    const nextState: GameState = {
      ...state,
      run: {
        ...state.run,
        timers,
        blackHoleChargeReady: updated.alwaysOn ? false : state.run.blackHoleChargeReady,
        researchPoints: settleSpend(state.run.researchPoints, price),
      },
      permanent: { ...state.permanent, blackHole: updated },
    };
    return {
      state: nextState,
      events: [{ type: "black-hole.upgrade-purchased", upgradeId: command.upgradeId }],
    };
  }
  if (state.run.blackHoleChargeReady) {
    const instability = state.run.randomEvents.activeEffects.find(
      (effect) => effect.id === "blackHoleInstability",
    );
    const durationMs = Math.round(
      state.permanent.blackHole.durationMs * (instability?.durationMultiplier ?? 1),
    );
    const multiplier = state.permanent.blackHole.power * (instability?.powerMultiplier ?? 1);
    const timers = { ...state.run.timers };
    delete timers[BLACK_HOLE_CHARGE_TIMER_ID];
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          timers,
          blackHoleChargeReady: false,
          blackHoleWarpActive: true,
          timeWarp: { multiplier, remainingMs: durationMs },
        },
      },
      events: [{ type: "black-hole.warp-activated", durationMs, multiplier }],
    };
  }
  return startCharge(state);
}

/** A star study raises the accumulated chance, then immediately rolls it. */
export function rollBlackHoleDiscovery(state: GameState): BlackHoleDiscoveryTransition {
  const hole = state.permanent.blackHole;
  if (state.permanent.rebirthCount < 1 || hole.discovered) return { state, events: [] };
  const probability = Math.min(100, hole.discoveryProbability + 3);
  const draw = nextRandom(state.run.random);
  const discovered = draw.value * 100 < probability;
  return {
    state: {
      ...state,
      run: { ...state.run, random: draw.state },
      permanent: {
        ...state.permanent,
        blackHole: { ...hole, discoveryProbability: probability, discovered },
      },
    },
    events: [{ type: "black-hole.discovery-checked", probability, discovered }],
  };
}

/** Applies normal, idempotent timer completion effects at command boundaries. */
export function completeBlackHoleTimers(
  state: GameState,
  events: readonly TimerEvent[],
): BlackHoleTransition {
  const chargeCompleted = events.some(
    (event) => event.timerId === BLACK_HOLE_CHARGE_TIMER_ID && event.type === "timer.completed",
  );
  return chargeCompleted && !state.run.blackHoleChargeReady
    ? {
        state: { ...state, run: { ...state.run, blackHoleChargeReady: true } },
        events: [{ type: "black-hole.charge-completed" }],
      }
    : { state, events: [] };
}

export function finishBlackHoleWarp(
  state: GameState,
  elapsedAfterWarpMs: number,
): BlackHoleTransition {
  if (!state.run.blackHoleWarpActive || state.run.timeWarp.remainingMs > 0)
    return { state, events: [] };
  const reset: GameState = {
    ...state,
    run: {
      ...state.run,
      blackHoleWarpActive: false,
      timeWarp: { multiplier: 1, remainingMs: 0 },
    },
  };
  if (reset.permanent.blackHole.alwaysOn)
    return { state: reset, events: [{ type: "black-hole.warp-ended" }] };
  const charging = startCharge(reset);
  const timer = charging.state.run.timers[BLACK_HOLE_CHARGE_TIMER_ID]!;
  if (elapsedAfterWarpMs < timer.durationMs) {
    return {
      state: {
        ...charging.state,
        run: {
          ...charging.state.run,
          timers: {
            ...charging.state.run.timers,
            [BLACK_HOLE_CHARGE_TIMER_ID]: { ...timer, elapsedMs: elapsedAfterWarpMs },
          },
        },
      },
      events: [{ type: "black-hole.warp-ended" }, ...charging.events],
    };
  }
  return {
    state: {
      ...charging.state,
      run: {
        ...charging.state.run,
        blackHoleChargeReady: true,
        timers: {
          ...charging.state.run.timers,
          [BLACK_HOLE_CHARGE_TIMER_ID]: {
            ...timer,
            elapsedMs: timer.durationMs,
            completionCount: 1,
            status: "complete",
          },
        },
      },
    },
    events: [
      { type: "black-hole.warp-ended" },
      ...charging.events,
      { type: "black-hole.charge-completed" },
    ],
  };
}
