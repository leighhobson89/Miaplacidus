import {
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  FIXED_UPGRADE_IDS,
  GALAXY_SEED_DEFAULT,
  LOCALE_IDS,
  MATERIAL_IDS,
  autobuyerUpgradeId,
  isEconomicGoodId,
  isEventId,
  isUpgradeId,
  type EconomicGoodId,
  type AutobuyerUpgradeId,
  type CompoundId,
  type FixedUpgradeId,
  type LocaleId,
  type MaterialId,
  type TechId,
  type UpgradeId,
} from "../content/ids";
import { TECHNOLOGY_CATALOG } from "../content/technology";
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
  readonly economy: EconomyState;
}

export interface ResourceAllocationState {
  readonly enabled: boolean;
  readonly cashShare: number;
  readonly compoundShare: number;
}

export interface PowerState {
  readonly quantity: number;
  readonly capacity: number;
  readonly gridEnabled: boolean;
  readonly deficitMs: number;
  readonly tripped: boolean;
  readonly infinitePower: boolean;
  readonly environmentalMultiplier: number;
}

export interface EconomyState {
  readonly unlockedCompounds: readonly CompoundId[];
  readonly researchedTechnologies: readonly TechId[];
  readonly revealedTechnologies: readonly TechId[];
  readonly autobuyerEnabled: Readonly<Record<AutobuyerUpgradeId, boolean>>;
  readonly buildingEnabled: Readonly<Record<FixedUpgradeId, boolean>>;
  readonly resourceAllocation: Readonly<Record<MaterialId, ResourceAllocationState>>;
  readonly autoCreateEnabled: Readonly<Record<CompoundId, boolean>>;
  readonly researchAutobuyerEnabled: boolean;
  readonly power: PowerState;
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
  readonly schemaVersion: 3;
  readonly run: RunState;
  readonly permanent: PermanentState;
  readonly settings: SettingsState;
  readonly statistics: StatisticsState;
}

export type LegacyRunStateV1 = Omit<RunState, "economy">;
export interface LegacyGameStateV1 {
  readonly schemaVersion: 1;
  readonly run: LegacyRunStateV1;
  readonly permanent: PermanentState;
  readonly settings: SettingsState;
  readonly statistics: StatisticsState;
}

export type LegacyPowerStateV2 = Omit<PowerState, "infinitePower" | "environmentalMultiplier">;
export type LegacyEconomyStateV2 = Omit<EconomyState, "power"> & {
  readonly power: LegacyPowerStateV2;
};
export type LegacyRunStateV2 = Omit<RunState, "economy"> & {
  readonly economy: LegacyEconomyStateV2;
};
export interface LegacyGameStateV2 {
  readonly schemaVersion: 2;
  readonly run: LegacyRunStateV2;
  readonly permanent: PermanentState;
  readonly settings: SettingsState;
  readonly statistics: StatisticsState;
}

export function createInitialEconomyState(hydrogenAutobuyerEnabled = true): EconomyState {
  const autobuyerEnabled = Object.fromEntries(
    ECONOMIC_GOOD_IDS.flatMap((goodId) =>
      ([1, 2, 3, 4] as const).map((tier) => [autobuyerUpgradeId(goodId, tier), true]),
    ),
  ) as Record<AutobuyerUpgradeId, boolean>;
  autobuyerEnabled[autobuyerUpgradeId("hydrogen", 1)] = hydrogenAutobuyerEnabled;
  const buildingEnabled = Object.fromEntries(
    FIXED_UPGRADE_IDS.map((id) => [id, !id.startsWith("powerPlant")]),
  ) as Record<FixedUpgradeId, boolean>;
  const resourceAllocation = Object.fromEntries(
    MATERIAL_IDS.map((id) => [id, { enabled: false, cashShare: 0, compoundShare: 100 }]),
  ) as Record<MaterialId, ResourceAllocationState>;
  const autoCreateEnabled = Object.fromEntries(COMPOUND_IDS.map((id) => [id, false])) as Record<
    CompoundId,
    boolean
  >;
  return {
    unlockedCompounds: [],
    researchedTechnologies: [],
    revealedTechnologies: ["knowledgeSharing"],
    autobuyerEnabled,
    buildingEnabled,
    resourceAllocation,
    autoCreateEnabled,
    researchAutobuyerEnabled: false,
    power: {
      quantity: 0,
      capacity: 0,
      gridEnabled: true,
      deficitMs: 0,
      tripped: false,
      infinitePower: false,
      environmentalMultiplier: 1,
    },
  };
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
    schemaVersion: 3,
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
      economy: createInitialEconomyState(),
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
  const exactKeys = (record: object, expected: readonly string[]) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) return false;
    const actual = Object.keys(record).sort();
    const keys = [...expected].sort();
    return actual.length === keys.length && actual.every((key, index) => key === keys[index]);
  };
  if (!exactKeys(value, ["schemaVersion", "run", "permanent", "settings", "statistics"]))
    return false;
  const state = value as Partial<GameState>;
  if (
    state.schemaVersion !== 3 ||
    !state.run ||
    !state.permanent ||
    !state.settings ||
    !state.statistics
  ) {
    return false;
  }
  const { run, permanent, settings, statistics } = state;
  if (
    !exactKeys(run, [
      "pioneerName",
      "hydrogenAutobuyerEnabled",
      "cash",
      "researchPoints",
      "goods",
      "unlockedResources",
      "upgrades",
      "timers",
      "clock",
      "random",
      "economy",
    ]) ||
    !exactKeys(permanent, ["rebirthCount", "ascendencyPoints", "gloryPoints", "acquiredPerks"]) ||
    !exactKeys(settings, ["locale", "themeId", "notation", "soundEnabled", "reducedMotion"]) ||
    !exactKeys(statistics, [
      "lifetimeCashEarned",
      "lifetimeGoodsProduced",
      "acceptedCommands",
      "completedTimers",
    ]) ||
    !exactKeys(run.clock, [
      "wallNowMs",
      "simulationMs",
      "paused",
      "foreground",
      "hiddenElapsedMs",
      "pendingForegroundMs",
    ]) ||
    !exactKeys(run.random, ["seed", "draws"]) ||
    !exactKeys(run.economy, [
      "unlockedCompounds",
      "researchedTechnologies",
      "revealedTechnologies",
      "autobuyerEnabled",
      "buildingEnabled",
      "resourceAllocation",
      "autoCreateEnabled",
      "researchAutobuyerEnabled",
      "power",
    ]) ||
    !exactKeys(run.economy.power, [
      "quantity",
      "capacity",
      "gridEnabled",
      "deficitMs",
      "tripped",
      "infinitePower",
      "environmentalMultiplier",
    ]) ||
    !exactKeys(run.economy.autobuyerEnabled, [
      ...ECONOMIC_GOOD_IDS.flatMap((id) =>
        [1, 2, 3, 4].map((tier) => `autobuyer:${id}:tier:${tier}`),
      ),
    ]) ||
    !exactKeys(run.economy.buildingEnabled, FIXED_UPGRADE_IDS) ||
    !exactKeys(run.economy.resourceAllocation, MATERIAL_IDS) ||
    !exactKeys(run.economy.autoCreateEnabled, COMPOUND_IDS) ||
    MATERIAL_IDS.some(
      (id) =>
        !run.economy.resourceAllocation[id] ||
        !exactKeys(run.economy.resourceAllocation[id], ["enabled", "cashShare", "compoundShare"]),
    ) ||
    !exactKeys(run.goods, ECONOMIC_GOOD_IDS)
  )
    return false;
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
    !Array.isArray(run.economy.unlockedCompounds) ||
    !Array.isArray(run.economy.researchedTechnologies) ||
    !Array.isArray(run.economy.revealedTechnologies) ||
    typeof run.economy.researchAutobuyerEnabled !== "boolean" ||
    typeof run.economy.power.gridEnabled !== "boolean" ||
    typeof run.economy.power.tripped !== "boolean" ||
    typeof run.economy.power.infinitePower !== "boolean" ||
    !Number.isFinite(run.economy.power.quantity) ||
    !Number.isFinite(run.economy.power.capacity) ||
    !Number.isFinite(run.economy.power.deficitMs) ||
    !Number.isFinite(run.economy.power.environmentalMultiplier) ||
    run.economy.power.quantity < 0 ||
    run.economy.power.capacity < 0 ||
    run.economy.power.quantity > run.economy.power.capacity ||
    run.economy.power.deficitMs < 0 ||
    run.economy.power.environmentalMultiplier < 0 ||
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
      !exactKeys(good, ["quantity", "storageCapacity", "saleValue"]) ||
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
  const validTechIds = new Set(TECHNOLOGY_CATALOG.map((technology) => technology.id));
  if (
    run.economy.unlockedCompounds.some((id) => !COMPOUND_IDS.includes(id)) ||
    run.economy.researchedTechnologies.some((id) => !validTechIds.has(id)) ||
    run.economy.revealedTechnologies.some((id) => !validTechIds.has(id)) ||
    new Set(run.economy.researchedTechnologies).size !==
      run.economy.researchedTechnologies.length ||
    new Set(run.economy.revealedTechnologies).size !== run.economy.revealedTechnologies.length ||
    run.economy.researchedTechnologies.some(
      (id) => !run.economy.revealedTechnologies.includes(id),
    ) ||
    run.economy.autobuyerEnabled === null ||
    Object.values(run.economy.autobuyerEnabled).some((enabled) => typeof enabled !== "boolean") ||
    run.economy.autobuyerEnabled[autobuyerUpgradeId("hydrogen", 1)] !==
      run.hydrogenAutobuyerEnabled ||
    Object.values(run.economy.buildingEnabled).some((enabled) => typeof enabled !== "boolean") ||
    Object.values(run.economy.autoCreateEnabled).some((enabled) => typeof enabled !== "boolean") ||
    MATERIAL_IDS.some((id) => {
      const allocation = run.economy.resourceAllocation[id];
      return (
        typeof allocation.enabled !== "boolean" ||
        !Number.isFinite(allocation.cashShare) ||
        allocation.cashShare < 0 ||
        allocation.cashShare > 100 ||
        !Number.isFinite(allocation.compoundShare) ||
        allocation.compoundShare < 0 ||
        allocation.compoundShare > 100
      );
    })
  ) {
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
    const timerKeys = [
      "id",
      "domain",
      "durationMs",
      "elapsedMs",
      "repeat",
      "completionCount",
      "status",
      "policy",
    ];
    if (timer && timer.eventId !== undefined) timerKeys.push("eventId");
    if (timer && timer.goodId !== undefined) timerKeys.push("goodId");
    if (
      !timer ||
      !exactKeys(timer, timerKeys) ||
      !exactKeys(timer.policy, ["phase", "offlineEligible", "warpable"]) ||
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
    permanent.acquiredPerks.every((perk) => typeof perk === "string") &&
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

/** Validates a v1 state by applying economy defaults and validating the full v3 shape. */
export function upgradeGameStateV1(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (!legacy["run"] || typeof legacy["run"] !== "object" || Array.isArray(legacy["run"]))
    return null;
  const legacyRun = legacy["run"] as Record<string, unknown>;
  if (typeof legacyRun["hydrogenAutobuyerEnabled"] !== "boolean") return null;
  const candidate = {
    ...legacy,
    schemaVersion: 3,
    run: {
      ...legacyRun,
      economy: createInitialEconomyState(legacyRun["hydrogenAutobuyerEnabled"]),
    },
  };
  return isValidGameState(candidate) ? candidate : null;
}

/** Adds the energy fields introduced after v2 saves were written. */
export function upgradeGameStateV2(value: unknown): GameState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const legacy = value as Record<string, unknown>;
  if (
    legacy["schemaVersion"] !== 2 ||
    !legacy["run"] ||
    typeof legacy["run"] !== "object" ||
    Array.isArray(legacy["run"])
  )
    return null;
  const legacyRun = legacy["run"] as Record<string, unknown>;
  if (
    !legacyRun["economy"] ||
    typeof legacyRun["economy"] !== "object" ||
    Array.isArray(legacyRun["economy"])
  )
    return null;
  const legacyEconomy = legacyRun["economy"] as Record<string, unknown>;
  if (
    !legacyEconomy["power"] ||
    typeof legacyEconomy["power"] !== "object" ||
    Array.isArray(legacyEconomy["power"])
  )
    return null;
  const legacyPower = legacyEconomy["power"] as Record<string, unknown>;
  const oldPowerKeys = ["quantity", "capacity", "gridEnabled", "deficitMs", "tripped"];
  if (Object.keys(legacyPower).sort().join("|") !== [...oldPowerKeys].sort().join("|")) return null;
  const candidate = {
    ...legacy,
    schemaVersion: 3,
    run: {
      ...legacyRun,
      economy: {
        ...legacyEconomy,
        power: { ...legacyPower, infinitePower: false, environmentalMultiplier: 1 },
      },
    },
  };
  return isValidGameState(candidate) ? candidate : null;
}
