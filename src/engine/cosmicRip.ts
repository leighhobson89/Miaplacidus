import {
  COSMIC_RIP_CLOSURE_GP,
  COSMIC_RIP_PRICE_MULTIPLIER,
  COSMIC_RIP_SCAN_GP,
  COSMIC_RIP_SCANNER_REPAIR_GP,
  COSMIC_RIP_SECTOR_COUNT,
  COSMIC_RIP_TECHNOLOGIES,
  COSMIC_RIP_UPGRADES,
  type CosmicRipTechnologyId,
  type CosmicRipUpgradeId,
} from "../content/cosmicRip";
import { HOME_SYSTEM_NAME, createStarCatalogue } from "../content/starCatalogue";
import { nextRandom } from "./random";
import { canAfford, settleSpend } from "./precision";
import { addLifetimeCount } from "./statistics";
import type { GameState } from "./state";

export const CosmicRipCommandType = "cosmic-rip." as const;

export type CosmicRipCommand =
  | { readonly type: "cosmic-rip.scanner.restore" }
  | { readonly type: "cosmic-rip.sector.scan"; readonly sectorIndex: number }
  | { readonly type: "cosmic-rip.upgrade.purchase"; readonly upgradeId: CosmicRipUpgradeId }
  | { readonly type: "cosmic-rip.tech.start"; readonly technologyId: CosmicRipTechnologyId }
  | { readonly type: "cosmic-rip.close" };

export type CosmicRipFailure = {
  readonly code:
    | "cosmic-rip-locked"
    | "cosmic-rip-home-required"
    | "cosmic-rip-scanner-restored"
    | "cosmic-rip-scanner-required"
    | "cosmic-rip-sector-invalid"
    | "cosmic-rip-sector-scanned"
    | "cosmic-rip-insufficient-gp"
    | "cosmic-rip-insufficient-cost"
    | "cosmic-rip-not-found"
    | "cosmic-rip-upgrade-invalid"
    | "cosmic-rip-research-running"
    | "cosmic-rip-tech-locked"
    | "cosmic-rip-tech-hidden"
    | "cosmic-rip-tech-researched"
    | "cosmic-rip-close-incomplete"
    | "cosmic-rip-already-closed";
  readonly messageKey: `cosmicRip.error.${string}`;
};

export type CosmicRipEvent =
  | { readonly type: "cosmic-rip.unlocked" }
  | { readonly type: "cosmic-rip.scanner-restored" }
  | {
      readonly type: "cosmic-rip.sector-scanned";
      readonly sectorIndex: number;
      readonly found: boolean;
    }
  | { readonly type: "cosmic-rip.upgrade-purchased"; readonly upgradeId: CosmicRipUpgradeId }
  | { readonly type: "cosmic-rip.research-started"; readonly technologyId: CosmicRipTechnologyId }
  | {
      readonly type: "cosmic-rip.technology-researched";
      readonly technologyId: CosmicRipTechnologyId;
    }
  | { readonly type: "cosmic-rip.closed" };

export interface CosmicRipTransition {
  readonly state: GameState;
  readonly events: readonly CosmicRipEvent[];
}

const technologyForId = (id: CosmicRipTechnologyId) =>
  COSMIC_RIP_TECHNOLOGIES.find((technology) => technology.id === id)!;

function recordGalacticPointsSpent(state: GameState, amount: number): GameState {
  return {
    ...state,
    statistics: {
      ...state.statistics,
      lifetimeGalacticPointsSpent: addLifetimeCount(
        state.statistics.lifetimeGalacticPointsSpent,
        amount,
      ),
    },
  };
}

export function isCosmicRipCommand(value: { readonly type: string }): value is CosmicRipCommand {
  return value.type.startsWith(CosmicRipCommandType);
}

function failure(code: CosmicRipFailure["code"]): CosmicRipFailure {
  return { code, messageKey: `cosmicRip.error.${code.replace("cosmic-rip-", "")}` };
}

function hasHomeSystemSettled(state: GameState): boolean {
  const homeId = createStarCatalogue().find((star) => star.name === HOME_SYSTEM_NAME)?.id;
  return !!homeId && state.permanent.settledSystemIds.includes(homeId);
}

function upgradeCost(state: GameState, upgradeId: CosmicRipUpgradeId) {
  const definition = COSMIC_RIP_UPGRADES[upgradeId];
  const count = state.permanent.cosmicRip[`${upgradeId}Count`];
  const scale = COSMIC_RIP_PRICE_MULTIPLIER ** count;
  return {
    cash: Math.ceil(definition.cash * scale),
    goods: Object.fromEntries(
      Object.entries(definition.goods).map(([goodId, amount]) => [
        goodId,
        Math.ceil(amount * scale),
      ]),
    ) as Partial<Record<keyof GameState["run"]["goods"], number>>,
  };
}

export function cosmicRipUpgradeCost(
  state: GameState,
  upgradeId: CosmicRipUpgradeId,
): ReturnType<typeof upgradeCost> {
  return upgradeCost(state, upgradeId);
}

export function cosmicRipTelemetryRate(state: GameState): number {
  const progress = state.permanent.cosmicRip;
  return (
    progress.sensorBuoyCount * COSMIC_RIP_UPGRADES.sensorBuoy.telemetryPerSecond +
    progress.ripResearchOrbiterCount * COSMIC_RIP_UPGRADES.ripResearchOrbiter.telemetryPerSecond
  );
}

export function checkCosmicRipCommand(
  state: GameState,
  command: CosmicRipCommand,
): CosmicRipFailure | null {
  const progress = state.permanent.cosmicRip;
  if (command.type === "cosmic-rip.scanner.restore") {
    if (!progress.unlocked) return failure("cosmic-rip-locked");
    if (!hasHomeSystemSettled(state)) return failure("cosmic-rip-home-required");
    if (progress.scannerRestored) return failure("cosmic-rip-scanner-restored");
    return state.permanent.gloryPoints >= COSMIC_RIP_SCANNER_REPAIR_GP
      ? null
      : failure("cosmic-rip-insufficient-gp");
  }
  if (!progress.unlocked) return failure("cosmic-rip-locked");
  if (!progress.scannerRestored) return failure("cosmic-rip-scanner-required");
  if (command.type === "cosmic-rip.sector.scan") {
    if (
      !Number.isSafeInteger(command.sectorIndex) ||
      command.sectorIndex < 0 ||
      command.sectorIndex >= COSMIC_RIP_SECTOR_COUNT
    )
      return failure("cosmic-rip-sector-invalid");
    if (progress.scannedSectorIndexes.includes(command.sectorIndex))
      return failure("cosmic-rip-sector-scanned");
    return state.permanent.gloryPoints >= COSMIC_RIP_SCAN_GP
      ? null
      : failure("cosmic-rip-insufficient-gp");
  }
  if (command.type === "cosmic-rip.upgrade.purchase") {
    if (!progress.ripFound) return failure("cosmic-rip-not-found");
    if (!Object.hasOwn(COSMIC_RIP_UPGRADES, command.upgradeId))
      return failure("cosmic-rip-upgrade-invalid");
    const cost = upgradeCost(state, command.upgradeId);
    const affordable =
      canAfford(state.run.cash, cost.cash) &&
      Object.entries(cost.goods).every(([goodId, amount]) =>
        canAfford(state.run.goods[goodId as keyof GameState["run"]["goods"]].quantity, amount!),
      );
    return affordable ? null : failure("cosmic-rip-insufficient-cost");
  }
  if (command.type === "cosmic-rip.tech.start") {
    if (!progress.ripFound) return failure("cosmic-rip-not-found");
    if (progress.closed) return failure("cosmic-rip-already-closed");
    if (progress.activeResearchTechnologyId !== null) return failure("cosmic-rip-research-running");
    const tech = COSMIC_RIP_TECHNOLOGIES.find((candidate) => candidate.id === command.technologyId);
    if (!tech) return failure("cosmic-rip-tech-locked");
    if (progress.researchedTechnologyIds.includes(command.technologyId))
      return failure("cosmic-rip-tech-researched");
    if (progress.telemetryData < tech.revealAt) return failure("cosmic-rip-tech-hidden");
    if (tech.requires && !progress.researchedTechnologyIds.includes(tech.requires))
      return failure("cosmic-rip-tech-locked");
    if (progress.telemetryData < tech.telemetryCost) return failure("cosmic-rip-insufficient-cost");
    return state.permanent.gloryPoints >= 1 ? null : failure("cosmic-rip-insufficient-gp");
  }
  if (progress.closed) return failure("cosmic-rip-already-closed");
  return progress.researchedTechnologyIds.length === COSMIC_RIP_TECHNOLOGIES.length
    ? state.permanent.gloryPoints >= COSMIC_RIP_CLOSURE_GP
      ? null
      : failure("cosmic-rip-insufficient-gp")
    : failure("cosmic-rip-close-incomplete");
}

export function applyCosmicRipCommand(
  state: GameState,
  command: CosmicRipCommand,
): CosmicRipTransition {
  const progress = state.permanent.cosmicRip;
  if (command.type === "cosmic-rip.scanner.restore") {
    const draw = nextRandom(state.run.random);
    return {
      state: recordGalacticPointsSpent(
        {
          ...state,
          run: { ...state.run, random: draw.state },
          permanent: {
            ...state.permanent,
            gloryPoints: state.permanent.gloryPoints - COSMIC_RIP_SCANNER_REPAIR_GP,
            cosmicRip: {
              ...progress,
              scannerRestored: true,
              ripLocationSectorIndex: Math.floor(draw.value * COSMIC_RIP_SECTOR_COUNT),
            },
          },
        },
        COSMIC_RIP_SCANNER_REPAIR_GP,
      ),
      events: [{ type: "cosmic-rip.scanner-restored" }],
    };
  }
  if (command.type === "cosmic-rip.sector.scan") {
    const scannedSectorIndexes = [...progress.scannedSectorIndexes, command.sectorIndex];
    const found = command.sectorIndex === progress.ripLocationSectorIndex;
    return {
      state: recordGalacticPointsSpent(
        {
          ...state,
          permanent: {
            ...state.permanent,
            gloryPoints: state.permanent.gloryPoints - COSMIC_RIP_SCAN_GP,
            cosmicRip: { ...progress, scannedSectorIndexes, ripFound: progress.ripFound || found },
          },
        },
        COSMIC_RIP_SCAN_GP,
      ),
      events: [{ type: "cosmic-rip.sector-scanned", sectorIndex: command.sectorIndex, found }],
    };
  }
  if (command.type === "cosmic-rip.upgrade.purchase") {
    const cost = upgradeCost(state, command.upgradeId);
    const goods = { ...state.run.goods };
    for (const [goodId, amount] of Object.entries(cost.goods)) {
      const good = goods[goodId as keyof typeof goods];
      goods[goodId as keyof typeof goods] = {
        ...good,
        quantity: settleSpend(good.quantity, amount!),
      };
    }
    return {
      state: {
        ...state,
        run: { ...state.run, cash: settleSpend(state.run.cash, cost.cash), goods },
        permanent: {
          ...state.permanent,
          cosmicRip: {
            ...progress,
            [command.upgradeId + "Count"]: progress[`${command.upgradeId}Count`] + 1,
          },
        },
      },
      events: [{ type: "cosmic-rip.upgrade-purchased", upgradeId: command.upgradeId }],
    };
  }
  if (command.type === "cosmic-rip.tech.start") {
    const technology = technologyForId(command.technologyId);
    return {
      state: recordGalacticPointsSpent(
        {
          ...state,
          permanent: {
            ...state.permanent,
            gloryPoints: state.permanent.gloryPoints - 1,
            cosmicRip: {
              ...progress,
              telemetryData: progress.telemetryData - technology.telemetryCost,
              activeResearchTechnologyId: command.technologyId,
              researchElapsedMs: 0,
            },
          },
        },
        1,
      ),
      events: [{ type: "cosmic-rip.research-started", technologyId: command.technologyId }],
    };
  }
  return {
    state: recordGalacticPointsSpent(
      {
        ...state,
        permanent: {
          ...state.permanent,
          gloryPoints: state.permanent.gloryPoints - COSMIC_RIP_CLOSURE_GP,
          cosmicRip: { ...progress, closed: true },
        },
      },
      COSMIC_RIP_CLOSURE_GP,
    ),
    events: [{ type: "cosmic-rip.closed" }],
  };
}

export function unlockCosmicRip(state: GameState): CosmicRipTransition {
  const progress = state.permanent.cosmicRip;
  if (progress.unlocked) return { state, events: [] };
  return {
    state: {
      ...state,
      permanent: {
        ...state.permanent,
        cosmicRip: { ...progress, unlocked: true },
      },
    },
    events: [{ type: "cosmic-rip.unlocked" }],
  };
}

/** Advances the source telemetry rate and the saved, warpable tech research timer. */
export function advanceCosmicRip(state: GameState, elapsedMs: number): CosmicRipTransition {
  if (!state.permanent.cosmicRip.unlocked || elapsedMs <= 0) return { state, events: [] };
  const progress = state.permanent.cosmicRip;
  const seconds = elapsedMs / 1000;
  const technologyId = progress.activeResearchTechnologyId;
  const telemetryRate = cosmicRipTelemetryRate(state);
  const telemetryData = Number((progress.telemetryData + telemetryRate * seconds).toFixed(8));
  const telemetryEarned =
    telemetryRate > 0 ? Math.max(0, telemetryData - progress.telemetryData) : 0;
  const statistics =
    telemetryEarned > 0
      ? {
          ...state.statistics,
          lifetimeCosmicRipTelemetryDataEarned: Math.min(
            Number.MAX_SAFE_INTEGER,
            state.statistics.lifetimeCosmicRipTelemetryDataEarned + telemetryEarned,
          ),
        }
      : state.statistics;
  let nextProgress = {
    ...progress,
    telemetryData,
  };
  if (!technologyId) {
    return {
      state: {
        ...state,
        permanent: { ...state.permanent, cosmicRip: nextProgress },
        statistics,
      },
      events: [],
    };
  }
  const technology = technologyForId(technologyId);
  const researchElapsedMs = progress.researchElapsedMs + elapsedMs;
  if (researchElapsedMs < technology.durationMs) {
    nextProgress = { ...nextProgress, researchElapsedMs };
    return {
      state: {
        ...state,
        permanent: { ...state.permanent, cosmicRip: nextProgress },
        statistics,
      },
      events: [],
    };
  }
  nextProgress = {
    ...nextProgress,
    researchedTechnologyIds: [...progress.researchedTechnologyIds, technologyId],
    activeResearchTechnologyId: null,
    researchElapsedMs: 0,
  };
  return {
    state: {
      ...state,
      permanent: { ...state.permanent, cosmicRip: nextProgress },
      statistics,
    },
    events: [{ type: "cosmic-rip.technology-researched", technologyId }],
  };
}

export function completeGame(state: GameState): boolean {
  return state.permanent.cosmicRip.closed;
}
