import {
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  MATERIAL_IDS,
  autobuyerUpgradeId,
} from "../../content/ids";
import { COMPOUND_CATALOG, MATERIAL_CATALOG } from "../../content/economy";
import { TECHNOLOGY_CATALOG } from "../../content/technology";
import { createInitialGameState, type GameState } from "../../engine/state";

type EconomyFixtureKind =
  | "full"
  | "research"
  | "infinite-power"
  | "power-deficit"
  | "battery-cycle"
  | "storage"
  | "storage-efficient"
  | "storage-each"
  | "storage-compounds"
  | "storage-all"
  | "water-storage"
  | "water-storage-short"
  | "save"
  | "bulk-hydrogen"
  | "bulk-science"
  | "bulk-energy"
  | "power-buildings"
  | "buyer-tiers"
  | "compound-automation"
  | "multipliers";

/** Test-only start states used by click-driven browser tests to reach later economy systems. */
export function createEconomyFixture(
  kind: EconomyFixtureKind,
  locale: GameState["settings"]["locale"],
): GameState {
  const base = createInitialGameState({
    pioneerName: "Economy Test Pioneer",
    seed: 20261003,
    locale,
  });
  if (kind === "storage") {
    return {
      ...base,
      run: {
        ...base.run,
        goods: { ...base.run.goods, hydrogen: { ...base.run.goods.hydrogen, quantity: 149 } },
      },
    };
  }
  const upgrades: Record<string, number> = { ...base.run.upgrades };
  for (const id of ECONOMIC_GOOD_IDS)
    for (const tier of [1, 2, 3, 4] as const) upgrades[autobuyerUpgradeId(id, tier)] = 0;
  if (kind === "power-deficit") {
    upgrades[autobuyerUpgradeId("hydrogen", 2)] = 1;
    upgrades["powerPlant1"] = 0;
    upgrades["powerPlant2"] = 0;
    upgrades["powerPlant3"] = 0;
  }
  if (kind === "compound-automation")
    for (const id of MATERIAL_IDS) upgrades[autobuyerUpgradeId(id, 1)] = 1;

  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((id) => [
      id,
      {
        ...base.run.goods[id],
        quantity:
          kind === "compound-automation"
            ? MATERIAL_IDS.includes(id as (typeof MATERIAL_IDS)[number])
              ? 10_000
              : 0
            : kind === "storage-each"
              ? Math.max(0, base.run.goods[id].storageCapacity - 1)
              : kind === "storage-compounds"
                ? id === "hydrogen"
                  ? 250
                  : id === "silicon"
                    ? 150
                    : id === "water"
                      ? 99
                      : id === "concrete"
                        ? 49
                        : Math.max(0, base.run.goods[id].storageCapacity - 1)
                : kind === "buyer-tiers"
                  ? 100_000_000
                  : kind === "power-buildings"
                    ? 50_000
                    : kind === "storage-all"
                      ? id === "concrete"
                        ? 30_000
                        : 99_999
                      : ["water-storage", "water-storage-short"].includes(kind) && id === "water"
                        ? 99
                        : kind === "water-storage" && id === "concrete"
                          ? 30
                          : kind === "water-storage-short" && id === "concrete"
                            ? 29
                            : kind === "save" && id === "iron"
                              ? 1_500
                              : id === "hydrogen"
                                ? kind === "bulk-hydrogen"
                                  ? 150
                                  : 2_000
                                : id === "carbon"
                                  ? 2_000
                                  : 1_500,
        storageCapacity:
          kind === "save" && id === "iron"
            ? 1_501
            : kind === "compound-automation"
              ? 100_000
              : kind === "storage-each"
                ? base.run.goods[id].storageCapacity
                : kind === "storage-compounds"
                  ? id === "hydrogen"
                    ? 300
                    : base.run.goods[id].storageCapacity
                  : kind === "buyer-tiers"
                    ? 100_000_000
                    : 100_000,
      },
    ]),
  ) as GameState["run"]["goods"];
  const completeResearch = kind !== "research";
  const researchedTechnologies = completeResearch
    ? TECHNOLOGY_CATALOG.filter(
        (tech) =>
          !(kind === "save" && tech.id === "fusionEfficiencyIII") &&
          !(kind === "infinite-power" && tech.id === "dysonSpherePower"),
      ).map((tech) => tech.id)
    : [];
  const revealedTechnologies = completeResearch
    ? TECHNOLOGY_CATALOG.map((tech) => tech.id)
    : (["knowledgeSharing"] as const);
  const unlockedResources = completeResearch ? [...MATERIAL_IDS] : (["hydrogen"] as const);
  const unlockedCompounds = completeResearch ? [...COMPOUND_IDS] : [];
  const storageCapacity = 1_665_000;
  const initialPoints = kind === "research" ? 150 : kind === "infinite-power" ? 200_000 : 1_000_000;
  const cash =
    kind === "research"
      ? 10
      : kind === "bulk-science"
        ? 11
        : kind === "bulk-energy"
          ? 639
          : 1_000_000_000;
  const power =
    kind === "power-deficit"
      ? {
          quantity: 0,
          capacity: 15_000,
          gridEnabled: true,
          deficitMs: 0,
          tripped: false,
          infinitePower: false,
          environmentalMultiplier: 1,
        }
      : kind === "battery-cycle"
        ? {
            quantity: 100,
            capacity: 100,
            gridEnabled: true,
            deficitMs: 0,
            tripped: false,
            infinitePower: false,
            environmentalMultiplier: 1,
          }
        : {
            quantity: kind === "infinite-power" ? 0 : storageCapacity,
            capacity: storageCapacity,
            gridEnabled: true,
            deficitMs: 0,
            tripped: false,
            infinitePower: false,
            environmentalMultiplier: kind === "multipliers" ? 0.5 : 1,
          };
  const autobuyerEnabled = { ...base.run.economy.autobuyerEnabled };
  if (kind === "multipliers") autobuyerEnabled[autobuyerUpgradeId("hydrogen", 1)] = true;
  const researchReadyRun =
    kind === "research"
      ? {
          ...base.run,
          cash,
          researchPoints: initialPoints,
          upgrades: { ...base.run.upgrades, scienceKit: 1 },
          economy: { ...base.run.economy, revealedTechnologies: ["knowledgeSharing"] as const },
        }
      : null;
  if (researchReadyRun)
    return {
      ...base,
      run: researchReadyRun,
      permanent: { ...base.permanent, acquiredPerks: ["roboticResearchAutomation"] },
    };
  const resourceAllocation = Object.fromEntries(
    MATERIAL_IDS.map((id) => [
      id,
      kind === "compound-automation"
        ? base.run.economy.resourceAllocation[id]
        : { enabled: true, cashShare: 25, compoundShare: 25 },
    ]),
  ) as GameState["run"]["economy"]["resourceAllocation"];
  const autoCreateEnabled = Object.fromEntries(
    COMPOUND_IDS.map((id) => [id, kind !== "compound-automation"]),
  ) as GameState["run"]["economy"]["autoCreateEnabled"];
  const buildingEnabled = Object.fromEntries(
    [
      "scienceKit",
      "scienceClub",
      "scienceLab",
      "powerPlant1",
      "powerPlant2",
      "powerPlant3",
      "battery1",
      "battery2",
      "battery3",
    ].map((id) => [id, kind === "multipliers" && id === "powerPlant2"]),
  ) as GameState["run"]["economy"]["buildingEnabled"];
  if (kind === "multipliers") {
    upgrades[autobuyerUpgradeId("hydrogen", 1)] = 1;
    upgrades["powerPlant2"] = 1;
  }
  const state: GameState = {
    ...base,
    run: {
      ...base.run,
      cash,
      researchPoints: initialPoints,
      goods,
      unlockedResources,
      upgrades,
      economy: {
        ...base.run.economy,
        unlockedCompounds,
        researchedTechnologies,
        revealedTechnologies,
        autobuyerEnabled,
        buildingEnabled,
        resourceAllocation,
        autoCreateEnabled,
        power,
      },
    },
    permanent: {
      ...base.permanent,
      acquiredPerks:
        kind === "multipliers"
          ? ["nanoBrokers:3", "bulkPurchasing", "smartAutoBuyers:2", "optimizedPowerGrids"]
          : ["nanoBrokers:3", "bulkPurchasing"],
    },
  };
  if (kind === "water-storage" || kind === "water-storage-short") {
    return {
      ...state,
      run: {
        ...state.run,
        goods: {
          ...state.run.goods,
          water: {
            ...state.run.goods.water,
            storageCapacity: base.run.goods.water.storageCapacity,
          },
          concrete: {
            ...state.run.goods.concrete,
            storageCapacity: base.run.goods.concrete.storageCapacity,
          },
        },
      },
    };
  }
  if (kind === "storage-efficient") {
    return {
      ...base,
      run: {
        ...base.run,
        goods: { ...base.run.goods, hydrogen: { ...base.run.goods.hydrogen, quantity: 149 } },
      },
      permanent: { ...base.permanent, acquiredPerks: ["efficientStorage"] },
    };
  }
  // Keep fixture literals tied to the catalogue so a source row omission fails during editing.
  void MATERIAL_CATALOG;
  void COMPOUND_CATALOG;
  return state;
}
