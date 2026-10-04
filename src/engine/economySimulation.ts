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
import { starTypeForSystem } from "../content/starCatalogue";
import { bTypeAutoBuyerBonusPerSecond, oTypePowerPlantMultiplier } from "../content/starTypeRules";
import {
  ROCKET_FUEL_CAPACITY,
  ROCKET_FUEL_PUMP_POWER,
  ROCKET_IDS,
  VOID_PILLAGE_POWER_PER_SECOND,
} from "../content/space";
import { repeatedPerkMultiplier } from "../content/economyRules";
import { precipitationForCurrentWeather, weatherGenerationMultiplier } from "./weather";
import type { GameState } from "./state";
import { philosophyCompoundRecipe } from "./philosophy";
import { achievementResourceRateMultiplier } from "./achievements";
import { activeRandomEventMultiplierForTarget } from "./randomEvents";
import {
  megastructurePowerPlantMultiplier,
  megastructureResearchRateBonus,
  megastructureResourceRateMultiplier,
} from "./megastructures";
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
  const autoBuyerMultiplier =
    repeatedPerkMultiplier(state.permanent.acquiredPerks, "smartAutoBuyers", 1.5) *
    state.run.newsTicker.autoBuyerRateMultiplier;
  const powerPlantMultiplier = repeatedPerkMultiplier(
    state.permanent.acquiredPerks,
    "optimizedPowerGrids",
    1.35,
  );
  const resourceRateMultiplier =
    megastructureResourceRateMultiplier(state) * achievementResourceRateMultiplier(state);
  const currentSystemType = starTypeForSystem(state.run.space.currentSystemId);
  const currentSystemIsBType = currentSystemType === "B";
  const powerPlantMultiplierFor = (plantId: "powerPlant1" | "powerPlant2" | "powerPlant3") => {
    const assignedSystemId = state.permanent.oTypePowerPlantAssignments[plantId];
    return (
      powerPlantMultiplier *
      oTypePowerPlantMultiplier(
        assignedSystemId === null ? currentSystemType : starTypeForSystem(assignedSystemId),
        assignedSystemId !== null && state.permanent.settledSystemIds.includes(assignedSystemId),
      )
    );
  };

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
      const typeBonus =
        isMaterial && currentSystemIsBType ? bTypeAutoBuyerBonusPerSecond(tier) * count : 0;
      const rate =
        (definition.ratePerSecond * count * autoBuyerMultiplier * resourceRateMultiplier +
          typeBonus) *
        activeRandomEventMultiplierForTarget(state, "supplyChainDisruption", goodId);
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
      const rate =
        definition.ratePerSecond *
        count *
        powerPlantMultiplierFor("powerPlant1") *
        state.run.newsTicker.powerPlantRateMultiplier *
        megastructurePowerPlantMultiplier(state);
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
      weatherGenerationMultiplier(state.run.space) *
      powerPlantMultiplierFor("powerPlant2") *
      state.run.newsTicker.powerPlantRateMultiplier *
      megastructurePowerPlantMultiplier(state);
  }
  if (gridRunning && state.run.economy.buildingEnabled.powerPlant3) {
    const count = owned(state, "powerPlant3");
    if (count > 0) {
      const definition = ENERGY_BUILDINGS.powerPlant3;
      const rate =
        definition.ratePerSecond *
        count *
        powerPlantMultiplierFor("powerPlant3") *
        state.run.newsTicker.powerPlantRateMultiplier *
        megastructurePowerPlantMultiplier(state);
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
  const surveyTimerId =
    state.run.space.activeSurvey === "asteroids"
      ? "survey:asteroid-scan"
      : state.run.space.activeSurvey === "stars"
        ? "survey:star-study"
        : state.run.space.activeSurvey === "pillageVoid"
          ? "survey:void-pillage"
          : null;
  const surveyTimerRunning =
    surveyTimerId !== null && state.run.timers[surveyTimerId]?.status === "running";
  if (gridRunning && !state.run.space.surveyPowerBlocked && surveyTimerRunning) {
    demandPerSecond +=
      state.run.space.activeSurvey === "asteroids"
        ? 0.4
        : state.run.space.activeSurvey === "stars"
          ? 0.7
          : VOID_PILLAGE_POWER_PER_SECOND;
  }
  if (gridRunning && state.run.economy.researchedTechnologies.includes("advancedFuels")) {
    for (const rocketId of ROCKET_IDS) {
      const rocket = state.run.space.rockets[rocketId];
      if (rocket.fuelPumpEnabled && rocket.fuelQuantity < ROCKET_FUEL_CAPACITY[rocketId]) {
        demandPerSecond += ROCKET_FUEL_PUMP_POWER[rocketId];
      }
    }
  }

  if (gridRunning) {
    for (const entry of poweredProduction) {
      productionPerSecond[entry.goodId] = (productionPerSecond[entry.goodId] ?? 0) + entry.rate;
    }
    researchPerSecond += labCount * SCIENCE_BUILDINGS.scienceLab.ratePerSecond;
  }
  researchPerSecond += megastructureResearchRateBonus(state);

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
        inputs: philosophyCompoundRecipe(state, goodId).map((input) => ({
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

  const precipitationCandidate = precipitationForCurrentWeather(state.run.space);
  const precipitation =
    precipitationCandidate &&
    state.run.economy.unlockedCompounds.includes(precipitationCandidate.goodId)
      ? precipitationCandidate
      : undefined;
  const tickPlan: TickPlan = {
    productionPerSecond,
    ...(precipitation ? { precipitation } : {}),
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
