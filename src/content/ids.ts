export const MATERIAL_IDS = [
  "hydrogen",
  "helium",
  "carbon",
  "neon",
  "oxygen",
  "sodium",
  "silicon",
  "iron",
] as const;

export type MaterialId = (typeof MATERIAL_IDS)[number];

export const COMPOUND_IDS = ["diesel", "glass", "steel", "concrete", "water", "titanium"] as const;

export type CompoundId = (typeof COMPOUND_IDS)[number];

// Solar is a source-defined internal resource, separate from the eight ordinary materials.
export const INTERNAL_RESOURCE_IDS = ["solar"] as const;

export type InternalResourceId = (typeof INTERNAL_RESOURCE_IDS)[number];
export type ResourceId = MaterialId | InternalResourceId;
export type EconomicGoodId = MaterialId | CompoundId;

const RESOURCE_ID_SET: ReadonlySet<string> = new Set([...MATERIAL_IDS, ...INTERNAL_RESOURCE_IDS]);
const COMPOUND_ID_SET: ReadonlySet<string> = new Set(COMPOUND_IDS);

export function isResourceId(value: unknown): value is ResourceId {
  return typeof value === "string" && RESOURCE_ID_SET.has(value);
}

export function isCompoundId(value: unknown): value is CompoundId {
  return typeof value === "string" && COMPOUND_ID_SET.has(value);
}

export function isEconomicGoodId(value: unknown): value is EconomicGoodId {
  if (isResourceId(value)) {
    return value !== "solar";
  }

  return isCompoundId(value);
}

export const FIXED_UPGRADE_IDS = [
  "scienceKit",
  "scienceClub",
  "scienceLab",
  "powerPlant1",
  "powerPlant2",
  "powerPlant3",
  "battery1",
  "battery2",
  "battery3",
] as const;

export type FixedUpgradeId = (typeof FIXED_UPGRADE_IDS)[number];
export type AutobuyerTier = 1 | 2 | 3 | 4;
export type AutobuyerUpgradeId = `autobuyer:${EconomicGoodId}:tier:${AutobuyerTier}`;
export type StorageUpgradeId = `storage:${EconomicGoodId}`;
export type UpgradeId = FixedUpgradeId | AutobuyerUpgradeId | StorageUpgradeId;

export function autobuyerUpgradeId(
  goodId: EconomicGoodId,
  tier: AutobuyerTier,
): AutobuyerUpgradeId {
  return `autobuyer:${goodId}:tier:${tier}`;
}

export function storageUpgradeId(goodId: EconomicGoodId): StorageUpgradeId {
  return `storage:${goodId}`;
}

export const TECH_IDS = [
  "knowledgeSharing",
  "fusionTheory",
  "hydrogenFusion",
  "heliumFusion",
  "carbonFusion",
  "basicPowerGeneration",
  "sodiumIonPowerStorage",
  "solarPowerGeneration",
  "giganticTurbines",
  "advancedPowerGeneration",
  "rocketComposites",
  "advancedFuels",
  "planetaryNavigation",
  "neonFusion",
  "oxygenFusion",
  "compounds",
  "siliconFusion",
  "aggregateMixing",
  "steelFoundries",
  "nanoTubeTechnology",
  "hydroCarbons",
  "stellarCartography",
  "quantumComputing",
  "scienceLaboratories",
  "nobleGasCollection",
  "neutronCapture",
  "glassManufacture",
  "atmosphericTelescopes",
  "fusionEfficiencyI",
  "fusionEfficiencyII",
  "fusionEfficiencyIII",
  "orbitalConstruction",
  "antimatterEngines",
  "FTLTravelTheory",
  "lifeSupportSystems",
  "starshipFleets",
  "stellarScanners",
  "dysonSphereUnderstanding",
  "dysonSphereCapabilities",
  "dysonSphereDisconnect",
  "dysonSpherePower",
  "dysonSphereConnect",
  "celestialProcessingCoreUnderstanding",
  "celestialProcessingCoreCapabilities",
  "celestialProcessingCoreDisconnect",
  "celestialProcessingCorePower",
  "celestialProcessingCoreConnect",
  "plasmaForgeUnderstanding",
  "plasmaForgeCapabilities",
  "plasmaForgeDisconnect",
  "plasmaForgePower",
  "plasmaForgeConnect",
  "galacticMemoryArchiveUnderstanding",
  "galacticMemoryArchiveCapabilities",
  "galacticMemoryArchiveDisconnect",
  "galacticMemoryArchivePower",
  "galacticMemoryArchiveConnect",
] as const;

export type TechId = (typeof TECH_IDS)[number];
const TECH_ID_SET: ReadonlySet<string> = new Set(TECH_IDS);

export function isTechId(value: unknown): value is TechId {
  return typeof value === "string" && TECH_ID_SET.has(value);
}

export const EVENT_IDS = [
  "powerPlantExplosion",
  "batteryExplosion",
  "scienceTheft",
  "researchBreakthrough",
  "rocketInstantArrival",
  "starshipLostInSpace",
  "antimatterReaction",
  "stockLoss",
  "galacticMarketLockdown",
  "endlessSummer",
  "minerBrokeDown",
  "supplyChainDisruption",
  "blackHoleInstability",
] as const;

export type EventId = (typeof EVENT_IDS)[number];
const EVENT_ID_SET: ReadonlySet<string> = new Set(EVENT_IDS);

export function isEventId(value: unknown): value is EventId {
  return typeof value === "string" && EVENT_ID_SET.has(value);
}

export const ACTION_IDS = [
  "resource.collect",
  "resource.sell",
  "upgrade.purchase",
  "technology.research",
  "system.scan",
  "event.resolve",
] as const;

export type ActionId = (typeof ACTION_IDS)[number];
const ACTION_ID_SET: ReadonlySet<string> = new Set(ACTION_IDS);

export function isActionId(value: unknown): value is ActionId {
  return typeof value === "string" && ACTION_ID_SET.has(value);
}

export const GALAXY_SEED_DEFAULT = 80;
export const GALAXY_STAR_COUNT = 100;

declare const systemIdBrand: unique symbol;
export type SystemId = string & { readonly [systemIdBrand]: "SystemId" };

export function systemIdForStar(galaxySeed: number, starSlot: number): SystemId {
  if (!Number.isSafeInteger(galaxySeed) || galaxySeed < 0) {
    throw new RangeError("Galaxy seed must be a non-negative safe integer.");
  }

  if (!Number.isSafeInteger(starSlot) || starSlot < 0 || starSlot >= GALAXY_STAR_COUNT) {
    throw new RangeError(`Star slot must be an integer from 0 to ${GALAXY_STAR_COUNT - 1}.`);
  }

  return `system:${galaxySeed}:${starSlot}` as SystemId;
}

export function isSystemId(value: unknown): value is SystemId {
  if (typeof value !== "string") {
    return false;
  }

  const match = /^system:(0|[1-9]\d*):(0|[1-9]\d*)$/.exec(value);

  if (!match) {
    return false;
  }

  const galaxySeed = Number(match[1]);
  const starSlot = Number(match[2]);

  return (
    Number.isSafeInteger(galaxySeed) &&
    Number.isSafeInteger(starSlot) &&
    starSlot < GALAXY_STAR_COUNT
  );
}

const FIXED_UPGRADE_ID_SET: ReadonlySet<string> = new Set(FIXED_UPGRADE_IDS);

export function isUpgradeId(value: unknown): value is UpgradeId {
  if (typeof value !== "string") {
    return false;
  }

  if (FIXED_UPGRADE_ID_SET.has(value)) {
    return true;
  }

  const autobuyerMatch = /^autobuyer:(.+):tier:([1-4])$/.exec(value);
  if (autobuyerMatch && isEconomicGoodId(autobuyerMatch[1])) {
    return true;
  }

  const storageMatch = /^storage:(.+)$/.exec(value);
  return storageMatch !== null && isEconomicGoodId(storageMatch[1]);
}

export type CatalogueReference =
  | { readonly kind: "resource"; readonly id: ResourceId }
  | { readonly kind: "compound"; readonly id: CompoundId }
  | { readonly kind: "upgrade"; readonly id: UpgradeId }
  | { readonly kind: "technology"; readonly id: TechId }
  | { readonly kind: "system"; readonly id: SystemId }
  | { readonly kind: "action"; readonly id: ActionId }
  | { readonly kind: "event"; readonly id: EventId };
