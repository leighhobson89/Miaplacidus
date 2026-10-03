import {
  COMPOUND_CATALOG,
  ENERGY_BUILDINGS,
  MATERIAL_CATALOG,
  SCIENCE_BUILDINGS,
} from "../content/economy";
import {
  ECONOMIC_GOOD_IDS,
  MATERIAL_IDS,
  autobuyerUpgradeId,
  type EconomicGoodId,
  type MaterialId,
} from "../content/ids";
import { repeatedPerkMultiplier } from "../content/economyRules";
import type { GameState } from "./state";
import {
  transactResources,
  type CraftingDemand,
  type FuelDemand,
  type TickPlan,
} from "./transactions";

export interface EconomyTickPlan {
  readonly tickPlan: TickPlan;
  readonly researchPerSecond: number;
  readonly generationPerSecond: number;
  readonly demandPerSecond: number;
  readonly unavailablePerSecond: number;
  readonly netRatesPerSecond: Readonly<Partial<Record<EconomicGoodId, number>>>;
}

function owned(state: GameState, id: string): number {
  return state.run.upgrades[id as keyof typeof state.run.upgrades] ?? 0;
}

function nanoBrokersLevel(state: GameState): number {
  return state.permanent.acquiredPerks.reduce((level, perk) => {
    if (perk === "nanoBrokers") return Math.max(level, 1);
    if (!perk.startsWith("nanoBrokers:")) return level;
    const parsed = Number(perk.slice("nanoBrokers:".length));
    return Number.isInteger(parsed) ? Math.max(level, Math.min(3, parsed)) : level;
  }, 0);
}

function netRates(
  transaction: ReturnType<typeof transactResources>,
  startingGoods: GameState["run"]["goods"],
): Partial<Record<EconomicGoodId, number>> {
  return Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((id) => [
      id,
      transaction.goods[id].quantity - startingGoods[id].quantity,
    ]),
  );
}

export function createEconomyTickPlan(state: GameState): EconomyTickPlan {
  const productionPerSecond: Partial<Record<EconomicGoodId, number>> = {};
  const poweredProduction: { goodId: EconomicGoodId; rate: number }[] = [];
  const fuel: FuelDemand[] = [];
  const productionAllocation: NonNullable<TickPlan["productionAllocation"]> = {};
  let demandPerSecond = 0;
  const gridRunning = state.run.economy.power.gridEnabled && !state.run.economy.power.tripped;
  const autoBuyerMultiplier = repeatedPerkMultiplier(
    state.permanent.acquiredPerks,
    "smartAutoBuyers",
    1.5,
  );
  const powerPlantMultiplier = repeatedPerkMultiplier(
    state.permanent.acquiredPerks,
    "optimizedPowerGrids",
    1.35,
  );

  for (const goodId of ECONOMIC_GOOD_IDS) {
    const isMaterial = MATERIAL_IDS.includes(goodId as MaterialId);
    const tiers = isMaterial
      ? MATERIAL_CATALOG[goodId as MaterialId].buyerTiers
      : COMPOUND_CATALOG[goodId as keyof typeof COMPOUND_CATALOG].buyerTiers;
    let freeRate = 0;
    let poweredRate = 0;
    for (const tier of [1, 2, 3, 4] as const) {
      const upgradeId = autobuyerUpgradeId(goodId, tier);
      const count = owned(state, upgradeId);
      if (count <= 0 || !state.run.economy.autobuyerEnabled[upgradeId]) continue;
      const definition = tiers[tier - 1]!;
      const rate = definition.ratePerSecond * count * autoBuyerMultiplier;
      if (definition.energyPerSecond > 0) {
        poweredRate += rate;
        if (gridRunning) demandPerSecond += definition.energyPerSecond * count;
      } else {
        freeRate += rate;
      }
    }
    productionPerSecond[goodId] = freeRate;
    if (poweredRate > 0) poweredProduction.push({ goodId, rate: poweredRate });
    if (isMaterial)
      productionAllocation[goodId as MaterialId] =
        state.run.economy.resourceAllocation[goodId as MaterialId];
  }

  let generationPerSecond = 0;
  if (gridRunning && state.run.economy.buildingEnabled.powerPlant1) {
    const count = owned(state, "powerPlant1");
    if (count > 0) {
      const definition = ENERGY_BUILDINGS.powerPlant1;
      const rate = definition.ratePerSecond * count * powerPlantMultiplier;
      generationPerSecond += rate;
      fuel.push({
        goodId: definition.fuel!.goodId,
        unitsPerSecond: definition.fuel!.unitsPerSecond * count,
        energyPerFuel: rate / definition.fuel!.unitsPerSecond,
      });
    }
  }
  if (gridRunning && state.run.economy.buildingEnabled.powerPlant2) {
    generationPerSecond +=
      ENERGY_BUILDINGS.powerPlant2.ratePerSecond *
      owned(state, "powerPlant2") *
      state.run.economy.power.environmentalMultiplier *
      powerPlantMultiplier;
  }
  if (gridRunning && state.run.economy.buildingEnabled.powerPlant3) {
    const count = owned(state, "powerPlant3");
    if (count > 0) {
      const definition = ENERGY_BUILDINGS.powerPlant3;
      const rate = definition.ratePerSecond * count * powerPlantMultiplier;
      generationPerSecond += rate;
      fuel.push({
        goodId: definition.fuel!.goodId,
        unitsPerSecond: definition.fuel!.unitsPerSecond * count,
        energyPerFuel: rate / definition.fuel!.unitsPerSecond,
      });
    }
  }

  const scienceCount = (id: keyof typeof SCIENCE_BUILDINGS) =>
    state.run.economy.buildingEnabled[id] ? owned(state, id) : 0;
  let researchPerSecond = scienceCount("scienceKit") * SCIENCE_BUILDINGS.scienceKit.ratePerSecond;
  researchPerSecond += scienceCount("scienceClub") * SCIENCE_BUILDINGS.scienceClub.ratePerSecond;
  const labCount = scienceCount("scienceLab");
  const labDemand = gridRunning ? SCIENCE_BUILDINGS.scienceLab.energyPerSecond * labCount : 0;
  demandPerSecond += labDemand;

  if (gridRunning) {
    for (const entry of poweredProduction) {
      productionPerSecond[entry.goodId] = (productionPerSecond[entry.goodId] ?? 0) + entry.rate;
    }
    researchPerSecond += labCount * SCIENCE_BUILDINGS.scienceLab.ratePerSecond;
  }

  const crafting: CraftingDemand[] = [];
  if (gridRunning && nanoBrokersLevel(state) >= 2) {
    Object.keys(COMPOUND_CATALOG).forEach((rawId, priority) => {
      const goodId = rawId as keyof typeof COMPOUND_CATALOG;
      if (!state.run.economy.autoCreateEnabled[goodId]) return;
      crafting.push({
        outputId: goodId,
        unitsPerSecond: 0,
        inputBudgeted: true,
        priority,
        inputs: COMPOUND_CATALOG[goodId].recipe.map((input) => ({
          goodId: input.goodId,
          unitsPerOutput: input.amount,
        })),
      });
    });
  }

  const salesPerSecond: Partial<Record<EconomicGoodId, number>> = {};
  if (nanoBrokersLevel(state) >= 1) {
    for (const goodId of MATERIAL_IDS) {
      const allocation = state.run.economy.resourceAllocation[goodId];
      if (allocation.enabled && allocation.cashShare > 0) {
        salesPerSecond[goodId] = ((productionPerSecond[goodId] ?? 0) * allocation.cashShare) / 100;
      }
    }
  }

  const tickPlan: TickPlan = {
    productionPerSecond,
    fuel,
    crafting,
    salesPerSecond,
    productionAllocation,
    power: { generationPerSecond, demandPerSecond },
    researchPerSecond,
  };
  const preview = transactResources(state.run.goods, state.run.cash, 1000, tickPlan);
  const fuelGenerationPotential = fuel.reduce(
    (total, demand) => total + demand.unitsPerSecond * (demand.energyPerFuel ?? 0),
    0,
  );
  const effectiveGenerationPerSecond = gridRunning
    ? Math.max(0, generationPerSecond - fuelGenerationPotential) + preview.fueledGenerationPerSecond
    : 0;
  const unavailablePerSecond =
    gridRunning && !state.run.economy.power.infinitePower
      ? Math.max(
          0,
          demandPerSecond - effectiveGenerationPerSecond - state.run.economy.power.quantity,
        )
      : 0;
  return {
    tickPlan,
    researchPerSecond,
    generationPerSecond: effectiveGenerationPerSecond,
    demandPerSecond,
    unavailablePerSecond,
    netRatesPerSecond: netRates(preview, state.run.goods),
  };
}
