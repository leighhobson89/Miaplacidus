import type { EconomicGoodId } from "./ids";

export const COSMIC_RIP_SECTOR_COUNT = 9;
export const COSMIC_RIP_SCANNER_REPAIR_GP = 10;
export const COSMIC_RIP_SCAN_GP = 1;
export const COSMIC_RIP_CLOSURE_GP = 1;
export const COSMIC_RIP_PRICE_MULTIPLIER = 1.13;

export const COSMIC_RIP_UPGRADES = {
  sensorBuoy: {
    cash: 500_000,
    goods: { titanium: 100_000, silicon: 600_000 },
    telemetryPerSecond: 0.04,
  },
  ripResearchOrbiter: {
    cash: 1_000_000,
    goods: { helium: 1_000_000, sodium: 1_000_000, steel: 500_000 },
    telemetryPerSecond: 0.07,
  },
} as const satisfies Record<
  string,
  {
    readonly cash: number;
    readonly goods: Partial<Record<EconomicGoodId, number>>;
    readonly telemetryPerSecond: number;
  }
>;

export const COSMIC_RIP_TECHNOLOGIES = [
  {
    id: "stabilizerArray",
    revealAt: 5_000,
    telemetryCost: 10_000,
    durationMs: 60_000,
    requires: null,
  },
  {
    id: "quantumContainmentField",
    revealAt: 12_000,
    telemetryCost: 15_000,
    durationMs: 120_000,
    requires: "stabilizerArray",
  },
  {
    id: "dimensionalAnchorMatrix",
    revealAt: 16_000,
    telemetryCost: 25_000,
    durationMs: 180_000,
    requires: "quantumContainmentField",
  },
  {
    id: "singularityStabilizer",
    revealAt: 30_000,
    telemetryCost: 40_000,
    durationMs: 240_000,
    requires: "dimensionalAnchorMatrix",
  },
  {
    id: "realityWeaveRegulator",
    revealAt: 40_000,
    telemetryCost: 60_000,
    durationMs: 300_000,
    requires: "singularityStabilizer",
  },
] as const;

export type CosmicRipTechnologyId = (typeof COSMIC_RIP_TECHNOLOGIES)[number]["id"];
export type CosmicRipUpgradeId = keyof typeof COSMIC_RIP_UPGRADES;
