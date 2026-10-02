import {
  ECONOMIC_GOOD_IDS,
  GALAXY_SEED_DEFAULT,
  LOCALE_IDS,
  MATERIAL_IDS,
  isEconomicGoodId,
  isEventId,
  isUpgradeId,
  type EconomicGoodId,
  type LocaleId,
  type MaterialId,
  type UpgradeId,
} from "../content/ids";
import { INITIAL_GOODS } from "../content/economy";
import { createClockState } from "./clock";
import { createRandomState } from "./random";
import { timerPolicyFor } from "./timers";
import { TIMER_DOMAINS, type ClockState, type TimerMap } from "./runtimeTypes";

export interface GoodState {
  readonly quantity: number;
  readonly storageCapacity: number;
  readonly saleValue: number;
}

export interface RunState {
  readonly pioneerName: string;
  readonly hydrogenAutobuyerEnabled: boolean;
  readonly cash: number;
  readonly researchPoints: number;
  readonly goods: Readonly<Record<EconomicGoodId, GoodState>>;
  readonly unlockedResources: readonly MaterialId[];
  readonly upgrades: Readonly<Partial<Record<UpgradeId, number>>>;
  readonly timers: TimerMap;
  readonly clock: ClockState;
  readonly random: ReturnType<typeof createRandomState>;
}

export interface PermanentState {
  readonly rebirthCount: number;
  readonly ascendencyPoints: number;
  readonly gloryPoints: number;
  readonly acquiredPerks: readonly string[];
}

export interface SettingsState {
  readonly locale: LocaleId;
  readonly themeId: string;
  readonly notation: "standard" | "scientific";
  readonly soundEnabled: boolean;
  readonly reducedMotion: boolean;
}

export interface StatisticsState {
  readonly lifetimeCashEarned: number;
  readonly lifetimeGoodsProduced: number;
  readonly acceptedCommands: number;
  readonly completedTimers: number;
}

export interface GameState {
  readonly schemaVersion: 1;
  readonly run: RunState;
  readonly permanent: PermanentState;
  readonly settings: SettingsState;
  readonly statistics: StatisticsState;
}

export interface InitialStateOptions {
  readonly pioneerName?: string;
  readonly seed?: number;
  readonly locale?: LocaleId;
}

export function createInitialGameState(options: InitialStateOptions = {}): GameState {
  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((id) => [
      id,
      {
        quantity: 0,
        storageCapacity: INITIAL_GOODS[id].storageCapacity,
        saleValue: INITIAL_GOODS[id].saleValue,
      },
    ]),
  ) as Record<EconomicGoodId, GoodState>;

  return {
    schemaVersion: 1,
    run: {
      pioneerName: options.pioneerName?.trim() || "Pioneer",
      hydrogenAutobuyerEnabled: true,
      cash: 10,
      researchPoints: 50,
      goods,
      unlockedResources: ["hydrogen"],
      upgrades: {},
      timers: {},
      clock: createClockState(),
      random: createRandomState(options.seed ?? GALAXY_SEED_DEFAULT),
    },
    permanent: {
      rebirthCount: 0,
      ascendencyPoints: 0,
      gloryPoints: 0,
      acquiredPerks: [],
    },
    settings: {
      locale: options.locale ?? "en",
      themeId: "midnight",
      notation: "standard",
      soundEnabled: true,
      reducedMotion: false,
    },
    statistics: {
      lifetimeCashEarned: 0,
      lifetimeGoodsProduced: 0,
      acceptedCommands: 0,
      completedTimers: 0,
    },
  };
}

export function isValidGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") {
    return false;
  }
  const state = value as Partial<GameState>;
  if (
    state.schemaVersion !== 1 ||
    !state.run ||
    !state.permanent ||
    !state.settings ||
    !state.statistics
  ) {
    return false;
  }
  const { run, permanent, settings, statistics } = state;
  if (
    typeof run.pioneerName !== "string" ||
    typeof run.hydrogenAutobuyerEnabled !== "boolean" ||
    !Number.isFinite(run.cash) ||
    run.cash < 0 ||
    !Number.isFinite(run.researchPoints) ||
    run.researchPoints < 0 ||
    typeof run.goods !== "object" ||
    run.goods === null ||
    !Array.isArray(run.unlockedResources) ||
    typeof run.upgrades !== "object" ||
    run.upgrades === null ||
    typeof run.timers !== "object" ||
    run.timers === null ||
    !run.clock ||
    !run.random
  ) {
    return false;
  }
  for (const id of ECONOMIC_GOOD_IDS) {
    const good = run.goods[id];
    if (
      !good ||
      !Number.isFinite(good.quantity) ||
      !Number.isFinite(good.storageCapacity) ||
      !Number.isFinite(good.saleValue) ||
      good.quantity < 0 ||
      good.quantity > good.storageCapacity ||
      good.storageCapacity < 0 ||
      good.saleValue < 0
    ) {
      return false;
    }
  }
  if (run.unlockedResources.some((id) => !MATERIAL_IDS.includes(id))) {
    return false;
  }
  if (
    typeof run.clock.paused !== "boolean" ||
    typeof run.clock.foreground !== "boolean" ||
    !Number.isFinite(run.clock.simulationMs) ||
    run.clock.simulationMs < 0 ||
    !Number.isFinite(run.clock.hiddenElapsedMs) ||
    run.clock.hiddenElapsedMs < 0 ||
    !Number.isFinite(run.clock.pendingForegroundMs) ||
    run.clock.pendingForegroundMs < 0 ||
    (run.clock.wallNowMs !== null &&
      (!Number.isFinite(run.clock.wallNowMs) || run.clock.wallNowMs < 0)) ||
    !Number.isSafeInteger(run.random.seed) ||
    run.random.seed < 0 ||
    run.random.seed > 0xffff_ffff ||
    !Number.isSafeInteger(run.random.draws) ||
    run.random.draws < 0
  ) {
    return false;
  }
  for (const [id, timer] of Object.entries(run.timers)) {
    if (
      !timer ||
      typeof timer.id !== "string" ||
      timer.id !== id ||
      typeof timer.domain !== "string" ||
      !TIMER_DOMAINS.includes(timer.domain) ||
      !timer.id.startsWith(`${timer.domain}:`) ||
      !Number.isFinite(timer.durationMs) ||
      timer.durationMs < 1 ||
      !Number.isFinite(timer.elapsedMs) ||
      timer.elapsedMs < 0 ||
      timer.elapsedMs > timer.durationMs ||
      typeof timer.repeat !== "boolean" ||
      !Number.isSafeInteger(timer.completionCount) ||
      timer.completionCount < 0 ||
      !["running", "paused", "complete"].includes(timer.status) ||
      !timer.policy ||
      timer.policy.phase !== timerPolicyFor(timer.domain).phase ||
      timer.policy.offlineEligible !== timerPolicyFor(timer.domain).offlineEligible ||
      timer.policy.warpable !== timerPolicyFor(timer.domain).warpable ||
      (timer.status === "complete" && timer.elapsedMs !== timer.durationMs) ||
      (timer.status !== "complete" && timer.elapsedMs >= timer.durationMs) ||
      !/^[a-zA-Z0-9._-]+$/.test(timer.id.slice(timer.domain.length + 1)) ||
      (timer.eventId !== undefined && !isEventId(timer.eventId)) ||
      (timer.goodId !== undefined && !isEconomicGoodId(timer.goodId))
    ) {
      return false;
    }
  }
  for (const [id, count] of Object.entries(run.upgrades)) {
    if (!isUpgradeId(id) || !Number.isSafeInteger(count) || count < 0) return false;
  }
  return (
    Number.isSafeInteger(permanent.rebirthCount) &&
    permanent.rebirthCount >= 0 &&
    Number.isFinite(permanent.ascendencyPoints) &&
    permanent.ascendencyPoints >= 0 &&
    Number.isFinite(permanent.gloryPoints) &&
    permanent.gloryPoints >= 0 &&
    Array.isArray(permanent.acquiredPerks) &&
    LOCALE_IDS.includes(settings.locale) &&
    typeof settings.themeId === "string" &&
    (settings.notation === "standard" || settings.notation === "scientific") &&
    typeof settings.soundEnabled === "boolean" &&
    typeof settings.reducedMotion === "boolean" &&
    Number.isFinite(statistics.lifetimeCashEarned) &&
    statistics.lifetimeCashEarned >= 0 &&
    Number.isFinite(statistics.lifetimeGoodsProduced) &&
    statistics.lifetimeGoodsProduced >= 0 &&
    Number.isSafeInteger(statistics.acceptedCommands) &&
    statistics.acceptedCommands >= 0 &&
    Number.isSafeInteger(statistics.completedTimers) &&
    statistics.completedTimers >= 0
  );
}
