import {
  LOCALE_IDS,
  MATERIAL_IDS,
  isEconomicGoodId,
  isEventId,
  isUpgradeId,
  type EconomicGoodId,
  type EventId,
  type MaterialId,
  type UpgradeId,
} from "../content/ids";
import { advanceClock, pauseClock, resumeClock, type ClockInput } from "./clock";
import { canAfford, settleSpend } from "./precision";
import { nextRandom } from "./random";
import {
  createInitialGameState,
  isValidGameState,
  type GameState,
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
      readonly goodId: MaterialId;
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
  | { readonly code: "transition-failed"; readonly messageKey: "engine.error.recovered" };

export type PreconditionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly failure: CommandFailure };

export type EngineEvent =
  | { readonly type: "purchase.completed"; readonly upgradeId: UpgradeId; readonly count: number }
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
        Array.isArray(plan.salesPerSecond)))
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
          entry.unitsPerSecond < 0,
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
          const transaction = transactResources(
            nextState.run.goods,
            nextState.run.cash,
            elapsedMs,
            step.phase === "offline"
              ? (command.offlineTickPlan ?? command.tickPlan ?? {})
              : (command.tickPlan ?? {}),
          );
          nextState = {
            ...nextState,
            run: { ...nextState.run, goods: transaction.goods, cash: transaction.cash },
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
