export const ASCENDENCY_PERKS = [
  { id: "littleBagOfHydrogen", baseCost: 3, maxPurchases: 1, effect: "hydrogen-start" },
  { id: "nonExhaustiveResources", baseCost: 10, maxPurchases: 1, effect: "resource-start" },
  { id: "efficientStorage", baseCost: 10, priceMultiplier: 2, maxPurchases: 3, effect: "storage" },
  { id: "smartAutoBuyers", baseCost: 15, priceMultiplier: 2, effect: "autobuyer-efficiency" },
  { id: "jumpstartResearch", baseCost: 30, maxPurchases: 1, effect: "research-start" },
  { id: "optimizedPowerGrids", baseCost: 15, priceMultiplier: 2, effect: "power-grid" },
  {
    id: "nanoBrokers",
    baseCost: 15,
    priceLadder: [15, 30, 50],
    maxPurchases: 3,
    effect: "automation",
  },
  { id: "roboticResearchAutomation", baseCost: 20, maxPurchases: 1, effect: "research-automation" },
  {
    id: "fasterAsteroidScan",
    baseCost: 20,
    priceMultiplier: 1.2,
    maxPurchases: 4,
    effect: "asteroid-scan",
  },
  {
    id: "deeperStarStudy",
    baseCost: 50,
    priceMultiplier: 2,
    maxPurchases: 3,
    effect: "star-study",
  },
  {
    id: "asteroidScannerBoost",
    baseCost: 20,
    priceMultiplier: 1,
    maxPurchases: 2,
    effect: "asteroid-rarity",
  },
  { id: "rocketFuelOptimization", baseCost: 40, maxPurchases: 1, effect: "rocket-fuel" },
  {
    id: "enhancedMining",
    baseCost: 15,
    priceMultiplier: 2,
    maxPurchases: 4,
    effect: "antimatter-mining",
  },
  {
    id: "quantumEngines",
    baseCost: 15,
    priceMultiplier: 2,
    maxPurchases: 6,
    effect: "starship-travel",
  },
  { id: "autoSpaceTelescope", baseCost: 40, maxPurchases: 1, effect: "auto-telescope" },
  { id: "bulkPurchasing", baseCost: 3, maxPurchases: 1, effect: "bulk-purchases" },
] as const;

export type AscendencyPerkId = (typeof ASCENDENCY_PERKS)[number]["id"];

export function isAscendencyPerkId(value: unknown): value is AscendencyPerkId {
  return typeof value === "string" && ASCENDENCY_PERKS.some((perk) => perk.id === value);
}

export function ascendencyPerkLevel(perks: readonly string[], perkId: AscendencyPerkId): number {
  if (perkId === "nanoBrokers") {
    return perks.reduce((level, perk) => {
      if (perk === "nanoBrokers") return Math.max(level, 1);
      if (!perk.startsWith("nanoBrokers:")) return level;
      const parsed = Number(perk.slice("nanoBrokers:".length));
      return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= 3
        ? Math.max(level, parsed)
        : level;
    }, 0);
  }
  return perks.filter((perk) => perk === perkId).length;
}

export function ascendencyPerkCost(perks: readonly string[], perkId: AscendencyPerkId): number {
  const definition = ASCENDENCY_PERKS.find((perk) => perk.id === perkId)!;
  const level = ascendencyPerkLevel(perks, perkId);
  if (definition.id === "nanoBrokers")
    return definition.priceLadder[level] ?? Number.POSITIVE_INFINITY;
  return (
    definition.baseCost *
    (("priceMultiplier" in definition && definition.priceMultiplier) || 1) ** level
  );
}

export function ascendencyPerkMaxed(perks: readonly string[], perkId: AscendencyPerkId): boolean {
  const definition = ASCENDENCY_PERKS.find((perk) => perk.id === perkId)!;
  return "maxPurchases" in definition && definition.maxPurchases !== undefined
    ? ascendencyPerkLevel(perks, perkId) >= definition.maxPurchases
    : false;
}
