import type { PhilosophyId } from "./ids";

export const PHILOSOPHY_REPEATABLE_IDS = [
  "efficientAssembly",
  "laserMining",
  "massCompoundAssembly",
  "energyDrones",
  "hangarAutomation",
  "syntheticPlating",
  "antimatterEngineMinaturization",
  "laserIntensityResearch",
  "stellarWhispers",
  "stellarInsightManifold",
  "asteroidDwellers",
  "ascendencyPhilosophy",
  "spaceElevator",
  "launchPadMassProduction",
  "asteroidAttractors",
  "warpDrive",
] as const;

export type PhilosophyRepeatableId = (typeof PHILOSOPHY_REPEATABLE_IDS)[number];
export type PhilosophyAbilityId =
  | "spaceStorageTankResearch"
  | "fleetHolograms"
  | "voidSeers"
  | "rapidExpansion";

export interface PhilosophyPathDefinition {
  readonly abilityId: PhilosophyAbilityId;
  readonly repeatables: readonly PhilosophyRepeatableId[];
}

export const PHILOSOPHY_PATHS: Readonly<Record<PhilosophyId, PhilosophyPathDefinition>> = {
  constructor: {
    abilityId: "spaceStorageTankResearch",
    repeatables: ["efficientAssembly", "laserMining", "massCompoundAssembly", "energyDrones"],
  },
  supremacist: {
    abilityId: "fleetHolograms",
    repeatables: [
      "hangarAutomation",
      "syntheticPlating",
      "antimatterEngineMinaturization",
      "laserIntensityResearch",
    ],
  },
  voidborn: {
    abilityId: "voidSeers",
    repeatables: [
      "stellarWhispers",
      "stellarInsightManifold",
      "asteroidDwellers",
      "ascendencyPhilosophy",
    ],
  },
  expansionist: {
    abilityId: "rapidExpansion",
    repeatables: ["spaceElevator", "launchPadMassProduction", "asteroidAttractors", "warpDrive"],
  },
};

export const INITIAL_PHILOSOPHY_RANKS: Readonly<Record<PhilosophyRepeatableId, number>> = {
  efficientAssembly: 0,
  laserMining: 0,
  massCompoundAssembly: 0,
  energyDrones: 0,
  hangarAutomation: 0,
  syntheticPlating: 0,
  antimatterEngineMinaturization: 0,
  laserIntensityResearch: 0,
  stellarWhispers: 0,
  stellarInsightManifold: 0,
  asteroidDwellers: 0,
  ascendencyPhilosophy: 0,
  spaceElevator: 0,
  launchPadMassProduction: 0,
  asteroidAttractors: 0,
  warpDrive: 0,
};

export const PHILOSOPHY_ABILITY_RESEARCH_COST = 500_000;
export const PHILOSOPHY_REPEATABLE_BASE_COST = 10_000;
export const PHILOSOPHY_RESEARCH_COST_GROWTH = 1.13;

export function isPhilosophyRepeatableId(value: unknown): value is PhilosophyRepeatableId {
  return (
    typeof value === "string" && PHILOSOPHY_REPEATABLE_IDS.includes(value as PhilosophyRepeatableId)
  );
}

export function philosophyForRepeatable(repeatableId: PhilosophyRepeatableId): PhilosophyId {
  return (Object.keys(PHILOSOPHY_PATHS) as PhilosophyId[]).find((philosophyId) =>
    PHILOSOPHY_PATHS[philosophyId].repeatables.includes(repeatableId),
  )!;
}
