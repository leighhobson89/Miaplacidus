import { describe, expect, it } from "vitest";
import {
  COMPOUND_CATALOG,
  ECONOMY_PRICE_MULTIPLIER,
  MATERIAL_CATALOG,
} from "../../src/content/economy";
import {
  affordablePurchaseCount,
  fusionEfficiencyRange,
  fusionYield,
  nextScaledPrice,
  repeatedPerkMultiplier,
  saleCash,
  selectedSaleAmount,
  stockAfterSale,
  storageCapacityAfterPurchase,
  storagePurchaseCost,
} from "../../src/content/economyRules";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import { buildingBuyMaxPlan, checkPreconditions, transition } from "../../src/engine/commands";
import { transactResources } from "../../src/engine/transactions";
import { autobuyerUpgradeId } from "../../src/content/ids";
import { TECHNOLOGY_CATALOG } from "../../src/content/technology";
import { TECH_IDS } from "../../src/content/ids";
import { createEconomyTickPlan } from "../../src/engine/economySimulation";
import { TECHNOLOGY_NAMES } from "../../src/content/technologyNames";
import { TECHNOLOGY_DESCRIPTIONS } from "../../src/content/technologyDescriptions";
import { ECONOMY_BUILDING_NAMES } from "../../src/content/economyBuildingNames";
import { economyGoodName } from "../../src/app/EconomyPanes";

describe("M-03 economy catalogue and shared rules", () => {
  it("contains all eight material and six compound source rows", () => {
    expect(Object.keys(MATERIAL_CATALOG)).toHaveLength(8);
    expect(Object.keys(COMPOUND_CATALOG)).toHaveLength(6);
    expect(MATERIAL_CATALOG.hydrogen.buyerTiers.map((tier) => tier.ratePerSecond)).toEqual([
      2, 10, 50, 250,
    ]);
    expect(COMPOUND_CATALOG.water.recipe).toEqual([
      { goodId: "hydrogen", amount: 20 },
      { goodId: "oxygen", amount: 10 },
    ]);
  });

  it("keeps all 57 source technologies addressable by stable IDs with complete rules", () => {
    expect(TECHNOLOGY_CATALOG.map((tech) => tech.id)).toEqual(TECH_IDS);
    expect(TECHNOLOGY_CATALOG).toHaveLength(57);
    const known = new Set(TECH_IDS);
    for (const tech of TECHNOLOGY_CATALOG) {
      expect(Number.isFinite(tech.price) && tech.price > 0).toBe(true);
      expect(Number.isFinite(tech.revealThreshold) && tech.revealThreshold >= 0).toBe(true);
      expect(tech.effectSummary.trim().length).toBeGreaterThan(0);
      expect(tech.requires.every((id) => known.has(id))).toBe(true);
      for (const locale of ["en", "es", "pt", "de", "it", "fr"] as const) {
        expect(TECHNOLOGY_NAMES[tech.id][locale].trim().length).toBeGreaterThan(0);
        expect(TECHNOLOGY_DESCRIPTIONS[tech.id][locale].trim().length).toBeGreaterThan(0);
      }
    }
    for (const names of Object.values(ECONOMY_BUILDING_NAMES)) {
      for (const locale of ["en", "es", "pt", "de", "it", "fr"] as const)
        expect(names[locale].trim().length).toBeGreaterThan(0);
    }
    for (const goodId of [
      "hydrogen",
      "helium",
      "carbon",
      "neon",
      "oxygen",
      "sodium",
      "silicon",
      "iron",
      "diesel",
      "glass",
      "steel",
      "concrete",
      "water",
      "titanium",
    ] as const) {
      for (const locale of ["en", "es", "pt", "de", "it", "fr"] as const)
        expect(economyGoodName(locale, goodId).trim().length).toBeGreaterThan(0);
    }
  });

  it("rounds each autobuyer price step upward and previews exactly the sold units", () => {
    expect(nextScaledPrice(50, ECONOMY_PRICE_MULTIPLIER)).toBe(57);
    expect(nextScaledPrice(57, ECONOMY_PRICE_MULTIPLIER)).toBe(65);
    expect(selectedSaleAmount(10.75, "threeQuarters")).toBe(7);
    expect(saleCash(10.75, "threeQuarters", 0.1)).toBeCloseTo(0.7);
    expect(stockAfterSale(10.75, 7)).toBe(3.75);
    expect(stockAfterSale(1.75, 1)).toBe(0);
    expect(storagePurchaseCost(150)).toBe(149);
    expect(fusionEfficiencyRange([])).toEqual([0.2, 0.3]);
    expect(fusionYield(100, 0.5, 0.2)).toBe(10);
  });

  it("uses one deterministic pass with fuel before crafting and sales", () => {
    const initial = createInitialGameState();
    const goods = {
      ...initial.run.goods,
      carbon: { ...initial.run.goods.carbon, quantity: 4 },
      diesel: { ...initial.run.goods.diesel, quantity: 0 },
      hydrogen: { ...initial.run.goods.hydrogen, quantity: 60 },
    };
    const result = transactResources(goods, 0, 1000, {
      productionPerSecond: { carbon: 2 },
      fuel: [{ goodId: "carbon", unitsPerSecond: 3 }],
      crafting: [
        {
          outputId: "diesel",
          unitsPerSecond: 1,
          inputs: [
            { goodId: "hydrogen", unitsPerOutput: 26 },
            { goodId: "carbon", unitsPerOutput: 1 },
          ],
        },
      ],
      salesPerSecond: { carbon: 1 },
    });
    expect(result.events.map((event) => event.type)).toEqual([
      "resource.produced",
      "resource.fuel-burned",
      "resource.sold",
      "compound.created",
    ]);
    expect(result.goods.carbon.quantity).toBe(1);
    expect(result.goods.diesel.quantity).toBe(1);
    expect(result.goods.hydrogen.quantity).toBe(34);
    expect(result.cash).toBeCloseTo(0.1);
  });

  it("collects only unlocked materials and keeps a generic sale preview and payout aligned", () => {
    let state = createInitialGameState();
    expect(checkPreconditions(state, { type: "resource.collect", goodId: "helium" }).ok).toBe(
      false,
    );
    state = {
      ...state,
      run: {
        ...state.run,
        goods: { ...state.run.goods, hydrogen: { ...state.run.goods.hydrogen, quantity: 12.5 } },
      },
    };
    const preview = selectedSaleAmount(state.run.goods.hydrogen.quantity, "half");
    const result = transition(state, { type: "resource.sell", goodId: "hydrogen", amount: "half" });
    expect(result.accepted).toBe(true);
    expect(result.state.run.cash - state.run.cash).toBeCloseTo(
      preview * state.run.goods.hydrogen.saleValue,
    );
    expect(result.state.run.goods.hydrogen.quantity).toBe(stockAfterSale(12.5, preview));
  });

  it("purchases research once, grants the first fusion resource, and rejects duplicate research", () => {
    const initial = createInitialGameState();
    const prerequisiteBlocked: GameState = {
      ...initial,
      run: {
        ...initial.run,
        researchPoints: 10_000,
        economy: {
          ...initial.run.economy,
          revealedTechnologies: ["knowledgeSharing", "fusionTheory", "hydrogenFusion"],
        },
      },
    };
    const rejectedForPrerequisite = transition(prerequisiteBlocked, {
      type: "economy.research",
      technologyId: "hydrogenFusion",
    });
    expect(rejectedForPrerequisite.accepted).toBe(false);
    expect(rejectedForPrerequisite.state).toBe(prerequisiteBlocked);
    expect(rejectedForPrerequisite.state.run.researchPoints).toBe(10_000);

    const researchReady: GameState = { ...initial, run: { ...initial.run, researchPoints: 150 } };
    const researched = transition(researchReady, {
      type: "economy.research",
      technologyId: "knowledgeSharing",
    });
    expect(researched.accepted).toBe(true);
    expect(researched.state.run.researchPoints).toBe(0);
    expect(
      transition(researched.state, { type: "economy.research", technologyId: "knowledgeSharing" })
        .accepted,
    ).toBe(false);
    const fusionState: GameState = {
      ...initial,
      run: {
        ...initial.run,
        goods: { ...initial.run.goods, hydrogen: { ...initial.run.goods.hydrogen, quantity: 100 } },
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["fusionTheory", "hydrogenFusion"],
          revealedTechnologies: ["knowledgeSharing", "fusionTheory", "hydrogenFusion"],
        },
      },
    };
    const fused = transition(fusionState, {
      type: "economy.fuse",
      sourceId: "hydrogen",
      targetId: "helium",
      amount: 100,
    });
    expect(fused.accepted).toBe(true);
    expect(fused.state.run.unlockedResources).toContain("helium");
    expect(fused.state.run.goods.helium.quantity).toBe(13);
    expect(isValidGameState(fused.state)).toBe(true);
  });

  it("enforces energy tier research gates and creates compounds atomically", () => {
    const initial = createInitialGameState();
    const hasHydrogen = { ...initial.run.goods.hydrogen, quantity: 1000, storageCapacity: 10_000 };
    const gated = {
      ...initial,
      run: { ...initial.run, goods: { ...initial.run.goods, hydrogen: hasHydrogen } },
    };
    expect(
      checkPreconditions(gated, { type: "economy.autobuyer.purchase", goodId: "hydrogen", tier: 2 })
        .ok,
    ).toBe(false);
    const compoundReady: GameState = {
      ...gated,
      run: {
        ...gated.run,
        goods: {
          ...gated.run.goods,
          carbon: { ...gated.run.goods.carbon, quantity: 100 },
          diesel: { ...gated.run.goods.diesel, quantity: 0 },
        },
        economy: { ...gated.run.economy, unlockedCompounds: ["diesel"] },
      },
    };
    const created = transition(compoundReady, {
      type: "economy.compound.create",
      goodId: "diesel",
      amount: 2,
    });
    expect(created.accepted).toBe(true);
    expect(created.state.run.goods.hydrogen.quantity).toBe(948);
    expect(created.state.run.goods.carbon.quantity).toBe(76);
    expect(created.state.run.goods.diesel.quantity).toBe(2);
    expect(
      transition(created.state, { type: "economy.compound.create", goodId: "diesel", amount: 100 })
        .accepted,
    ).toBe(false);
  });

  it("applies production allocation budgets after fuel so units cannot be reused", () => {
    const initial = createInitialGameState();
    const goods = {
      ...initial.run.goods,
      carbon: { ...initial.run.goods.carbon, quantity: 0 },
      steel: { ...initial.run.goods.steel, quantity: 0 },
      iron: { ...initial.run.goods.iron, quantity: 0 },
    };
    const result = transactResources(goods, 0, 1000, {
      productionPerSecond: { carbon: 10, iron: 10 },
      productionAllocation: {
        carbon: { enabled: true, cashShare: 30, compoundShare: 40 },
        iron: { enabled: true, cashShare: 0, compoundShare: 40 },
      },
      fuel: [{ goodId: "carbon", unitsPerSecond: 3 }],
      crafting: [
        {
          outputId: "steel",
          unitsPerSecond: 10,
          inputs: [
            { goodId: "iron", unitsPerOutput: 1 },
            { goodId: "carbon", unitsPerOutput: 1 },
          ],
        },
      ],
      salesPerSecond: { carbon: 3 },
    });
    expect(result.goods.carbon.quantity).toBeCloseTo(2.1);
    expect(result.goods.iron.quantity).toBeCloseTo(7.2);
    expect(result.goods.steel.quantity).toBeCloseTo(2.8);
    expect(result.cash).toBeCloseTo(0.21);
  });

  it("reports settled net rates at full storage and preserves tiny finite production", () => {
    const initial = createInitialGameState();
    const hydrogenId = autobuyerUpgradeId("hydrogen", 1);
    const fullStore: GameState = {
      ...initial,
      run: {
        ...initial.run,
        upgrades: { ...initial.run.upgrades, [hydrogenId]: 1 },
        goods: { ...initial.run.goods, hydrogen: { ...initial.run.goods.hydrogen, quantity: 150 } },
        economy: {
          ...initial.run.economy,
          autobuyerEnabled: { ...initial.run.economy.autobuyerEnabled, [hydrogenId]: true },
        },
      },
    };
    expect(createEconomyTickPlan(fullStore).netRatesPerSecond.hydrogen).toBe(0);

    const tiny = transactResources(initial.run.goods, 0, 10, {
      productionPerSecond: { hydrogen: 1e-9 },
    });
    expect(tiny.goods.hydrogen.quantity).toBeCloseTo(1e-11, 20);
    expect(tiny.goodsProduced).toBeCloseTo(1e-11, 20);
    const veryLarge = transactResources(initial.run.goods, 0, 1000, {
      productionPerSecond: { hydrogen: 1e100 },
    });
    expect(veryLarge.goods.hydrogen.quantity).toBe(150);
    expect(veryLarge.goodsProduced).toBe(1e100);
    expect(() =>
      transactResources(initial.run.goods, 0, 1000, {
        productionPerSecond: { hydrogen: Number.NaN },
      }),
    ).toThrow(RangeError);
    expect(() =>
      transactResources(initial.run.goods, 0, 1000, {
        productionPerSecond: { hydrogen: Number.POSITIVE_INFINITY },
      }),
    ).toThrow(RangeError);
  });

  it("matches the source ten-second Hydrogen, Science Kit and Plant 1 rates", () => {
    const initial = createInitialGameState();
    const hydrogenBuyer = autobuyerUpgradeId("hydrogen", 1);
    const scenario: GameState = {
      ...initial,
      run: {
        ...initial.run,
        clock: { ...initial.run.clock, wallNowMs: 0 },
        upgrades: { [hydrogenBuyer]: 1, scienceKit: 1, powerPlant1: 1 },
        goods: {
          ...initial.run.goods,
          hydrogen: { ...initial.run.goods.hydrogen, quantity: 0 },
          carbon: { ...initial.run.goods.carbon, quantity: 100 },
        },
        economy: {
          ...initial.run.economy,
          autobuyerEnabled: {
            ...initial.run.economy.autobuyerEnabled,
            [hydrogenBuyer]: true,
          },
          buildingEnabled: {
            ...initial.run.economy.buildingEnabled,
            scienceKit: true,
            powerPlant1: true,
          },
          researchedTechnologies: ["basicPowerGeneration"],
          revealedTechnologies: ["basicPowerGeneration"],
        },
      },
    };
    const plan = createEconomyTickPlan(scenario);
    expect(plan.netRatesPerSecond.hydrogen).toBe(2);
    expect(plan.researchPerSecond).toBe(0.5);
    expect(plan.generationPerSecond).toBe(5);
    let tenSeconds = scenario;
    for (let second = 1; second <= 10; second += 1) {
      const result = transition(tenSeconds, {
        type: "clock.advance",
        input: { wallNowMs: second * 1000, foreground: true },
        tickPlan: createEconomyTickPlan(tenSeconds).tickPlan,
      });
      expect(result.accepted, JSON.stringify(result.failure)).toBe(true);
      tenSeconds = result.state;
    }
    expect(tenSeconds.run.goods.hydrogen.quantity).toBe(20);
    expect(tenSeconds.run.goods.carbon.quantity).toBe(70);
    expect(tenSeconds.run.researchPoints).toBe(55);
  });

  it("reports fuel-limited plant output and a one-second power shortage accurately", () => {
    const initial = createInitialGameState();
    const powered = {
      ...initial,
      run: {
        ...initial.run,
        upgrades: { powerPlant1: 1, [autobuyerUpgradeId("hydrogen", 2)]: 1 },
        goods: {
          ...initial.run.goods,
          carbon: { ...initial.run.goods.carbon, quantity: 1.5 },
        },
        economy: {
          ...initial.run.economy,
          autobuyerEnabled: {
            ...initial.run.economy.autobuyerEnabled,
            [autobuyerUpgradeId("hydrogen", 2)]: true,
          },
          buildingEnabled: { ...initial.run.economy.buildingEnabled, powerPlant1: true },
          power: { ...initial.run.economy.power, capacity: 100, quantity: 0 },
        },
      },
    } as GameState;

    const partialFuel = createEconomyTickPlan(powered);
    expect(partialFuel.generationPerSecond).toBeCloseTo(2.5);
    expect(partialFuel.demandPerSecond).toBe(3);
    expect(partialFuel.unavailablePerSecond).toBeCloseTo(0.5);
    const transaction = transactResources(
      powered.run.goods,
      powered.run.cash,
      1000,
      partialFuel.tickPlan,
    );
    expect(transaction.goods.carbon.quantity).toBe(0);
    expect(transaction.fueledGenerationPerSecond).toBeCloseTo(2.5);

    const withoutFuel = {
      ...powered,
      run: {
        ...powered.run,
        goods: { ...powered.run.goods, carbon: { ...powered.run.goods.carbon, quantity: 0 } },
      },
    };
    expect(createEconomyTickPlan(withoutFuel).generationPerSecond).toBe(0);
  });

  it("adds battery capacity without generation and drains/recharges stored power", () => {
    const initial = createInitialGameState();
    const batteryReady: GameState = {
      ...initial,
      run: {
        ...initial.run,
        cash: 5_000,
        goods: {
          ...initial.run.goods,
          sodium: { ...initial.run.goods.sodium, quantity: 500, storageCapacity: 2_000 },
          carbon: { ...initial.run.goods.carbon, quantity: 1_000, storageCapacity: 2_000 },
        },
        unlockedResources: ["hydrogen", "carbon", "sodium"],
        economy: {
          ...initial.run.economy,
          researchedTechnologies: [
            "knowledgeSharing",
            "basicPowerGeneration",
            "sodiumIonPowerStorage",
          ],
          revealedTechnologies: [
            "knowledgeSharing",
            "basicPowerGeneration",
            "sodiumIonPowerStorage",
          ],
        },
      },
    };
    const battery = transition(batteryReady, {
      type: "economy.building.purchase",
      buildingId: "battery1",
    });
    expect(battery.accepted).toBe(true);
    expect(battery.state.run.economy.power).toMatchObject({ capacity: 15_000, quantity: 0 });

    const running: GameState = {
      ...initial,
      run: {
        ...initial.run,
        upgrades: { ...initial.run.upgrades, scienceLab: 1, powerPlant2: 1 },
        clock: { ...initial.run.clock, wallNowMs: 0 },
        economy: {
          ...initial.run.economy,
          buildingEnabled: {
            ...initial.run.economy.buildingEnabled,
            scienceLab: true,
            powerPlant2: true,
          },
          power: { ...initial.run.economy.power, quantity: 50, capacity: 100 },
        },
      },
    };
    const drain = transition(running, {
      type: "clock.advance",
      input: { wallNowMs: 1_000, foreground: true },
      tickPlan: createEconomyTickPlan(running).tickPlan,
    });
    expect(drain.state.run.economy.power.quantity).toBe(35);
    const labStopped = transition(drain.state, {
      type: "economy.building.toggle",
      buildingId: "scienceLab",
      enabled: false,
    });
    const recharge = transition(labStopped.state, {
      type: "clock.advance",
      input: { wallNowMs: 2_000, foreground: true },
      tickPlan: createEconomyTickPlan(labStopped.state).tickPlan,
    });
    expect(recharge.state.run.economy.power.quantity).toBe(55);
  });

  it("applies permanent buyer, power plant and efficient storage multipliers once", () => {
    const initial = createInitialGameState();
    const buyers: GameState = {
      ...initial,
      run: {
        ...initial.run,
        upgrades: { ...initial.run.upgrades, [autobuyerUpgradeId("hydrogen", 1)]: 1 },
        economy: {
          ...initial.run.economy,
          autobuyerEnabled: {
            ...initial.run.economy.autobuyerEnabled,
            [autobuyerUpgradeId("hydrogen", 1)]: true,
          },
        },
      },
      permanent: { ...initial.permanent, acquiredPerks: ["smartAutoBuyers:2"] },
    };
    expect(createEconomyTickPlan(buyers).netRatesPerSecond.hydrogen).toBeCloseTo(4.5);

    const solar: GameState = {
      ...initial,
      run: {
        ...initial.run,
        upgrades: { ...initial.run.upgrades, powerPlant2: 1 },
        economy: {
          ...initial.run.economy,
          researchedTechnologies: ["solarPowerGeneration"],
          buildingEnabled: { ...initial.run.economy.buildingEnabled, powerPlant2: true },
          power: { ...initial.run.economy.power, environmentalMultiplier: 0.5 },
        },
      },
      permanent: { ...initial.permanent, acquiredPerks: ["optimizedPowerGrids"] },
    };
    expect(createEconomyTickPlan(solar).generationPerSecond).toBeCloseTo(13.5);
    expect(storageCapacityAfterPurchase(100, 0)).toBe(200);
    expect(storageCapacityAfterPurchase(100, 1)).toBe(400);
    expect(storageCapacityAfterPurchase(100, 2)).toBe(600);
    expect(repeatedPerkMultiplier(["smartAutoBuyers:2"], "smartAutoBuyers", 1.5)).toBeCloseTo(2.25);

    const efficientStorage: GameState = {
      ...initial,
      run: {
        ...initial.run,
        goods: { ...initial.run.goods, hydrogen: { ...initial.run.goods.hydrogen, quantity: 149 } },
      },
      permanent: { ...initial.permanent, acquiredPerks: ["efficientStorage"] },
    };
    const expanded = transition(efficientStorage, { type: "storage.purchase", goodId: "hydrogen" });
    expect(expanded.accepted).toBe(true);
    expect(expanded.state.run.goods.hydrogen.storageCapacity).toBe(600);
  });

  it("limits Buy Max by the repeated rounded price schedule and applies purchases atomically", () => {
    expect(affordablePurchaseCount(50, 0, 150)).toEqual({ count: 2, totalCost: 107 });
    const initial = createInitialGameState();
    const hydrogen = { ...initial.run.goods.hydrogen, quantity: 150 };
    const ready = {
      ...initial,
      run: { ...initial.run, goods: { ...initial.run.goods, hydrogen } },
    };
    expect(
      checkPreconditions(ready, { type: "economy.autobuyer.buyMax", goodId: "hydrogen", tier: 1 })
        .ok,
    ).toBe(false);
    const bulkEnabled: GameState = {
      ...ready,
      permanent: { ...ready.permanent, acquiredPerks: ["bulkPurchasing"] },
    };
    const bought = transition(bulkEnabled, {
      type: "economy.autobuyer.buyMax",
      goodId: "hydrogen",
      tier: 1,
    });
    expect(bought.accepted).toBe(true);
    expect(bought.state.run.upgrades[autobuyerUpgradeId("hydrogen", 1)]).toBe(2);
    expect(bought.state.run.goods.hydrogen.quantity).toBe(43);
  });

  it("limits building Buy Max to its perk and the repeated cash/material affordability schedule", () => {
    const initial = createInitialGameState();
    const ready: GameState = {
      ...initial,
      run: { ...initial.run, cash: 11 },
      permanent: { ...initial.permanent, acquiredPerks: ["bulkPurchasing"] },
    };
    expect(buildingBuyMaxPlan(ready, "scienceKit")).toMatchObject({
      count: 2,
      cash: 11,
      materials: [],
    });
    expect(
      checkPreconditions(
        { ...ready, permanent: initial.permanent },
        { type: "economy.building.buyMax", buildingId: "scienceKit" },
      ).ok,
    ).toBe(false);
    const result = transition(ready, { type: "economy.building.buyMax", buildingId: "scienceKit" });
    expect(result.accepted).toBe(true);
    expect(result.state.run.upgrades.scienceKit).toBe(2);
    expect(result.state.run.cash).toBe(0);
  });

  it("increases every affordable unlocked storage once, and charges the extra Concrete for Water", () => {
    const initial = createInitialGameState();
    const waterReady: GameState = {
      ...initial,
      run: {
        ...initial.run,
        goods: {
          ...initial.run.goods,
          water: { ...initial.run.goods.water, quantity: 99 },
          concrete: { ...initial.run.goods.concrete, quantity: 30 },
        },
        economy: { ...initial.run.economy, unlockedCompounds: ["water"] },
      },
    };
    const water = transition(waterReady, { type: "storage.purchase", goodId: "water" });
    expect(water.accepted).toBe(true);
    expect(water.state.run.goods.water.storageCapacity).toBe(200);
    expect(water.state.run.goods.water.quantity).toBe(0);
    expect(water.state.run.goods.concrete.quantity).toBe(0);

    const shortOnConcrete: GameState = {
      ...waterReady,
      run: {
        ...waterReady.run,
        goods: {
          ...waterReady.run.goods,
          concrete: { ...waterReady.run.goods.concrete, quantity: 29 },
        },
      },
    };
    const rejectedWater = transition(shortOnConcrete, {
      type: "storage.purchase",
      goodId: "water",
    });
    expect(rejectedWater.accepted).toBe(false);
    expect(rejectedWater.state).toBe(shortOnConcrete);
    expect(
      checkPreconditions(shortOnConcrete, { type: "storage.purchase", goodId: "water" }).ok,
    ).toBe(false);

    const all = {
      ...initial,
      run: {
        ...initial.run,
        unlockedResources: [
          ...initial.run.unlockedResources,
          "helium",
          "carbon",
          "neon",
          "oxygen",
          "sodium",
          "silicon",
          "iron",
        ] as GameState["run"]["unlockedResources"],
        economy: {
          ...initial.run.economy,
          unlockedCompounds: [
            "diesel",
            "glass",
            "steel",
            "concrete",
            "water",
            "titanium",
          ] as GameState["run"]["economy"]["unlockedCompounds"],
        },
        goods: Object.fromEntries(
          Object.entries(initial.run.goods).map(([id, good]) => [
            id,
            { ...good, quantity: id === "concrete" ? 36 : good.storageCapacity - 1 },
          ]),
        ) as GameState["run"]["goods"],
      },
    };
    const increased = transition(all, { type: "economy.storage.increaseAll" });
    expect(increased.accepted).toBe(true);
    expect(increased.state.run.goods.hydrogen.storageCapacity).toBe(300);
    expect(increased.state.run.goods.hydrogen.quantity).toBe(0);
    expect(increased.state.run.goods.water.storageCapacity).toBe(200);
    expect(increased.state.run.goods.concrete.storageCapacity).toBe(50);
    expect(increased.state.run.goods.concrete.quantity).toBe(6);
    expect(isValidGameState(increased.state)).toBe(true);
  });

  it("lets the research autobuyer buy a newly revealed technology once at the exact price", () => {
    const initial = createInitialGameState();
    expect(
      checkPreconditions(initial, { type: "economy.research.autobuyer.toggle", enabled: true }).ok,
    ).toBe(false);
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        upgrades: { scienceKit: 1 },
        clock: { ...initial.run.clock, wallNowMs: 0 },
        economy: { ...initial.run.economy, researchAutobuyerEnabled: true },
      },
      permanent: { ...initial.permanent, acquiredPerks: ["roboticResearchAutomation"] },
    };
    const advanced = transition(state, {
      type: "clock.advance",
      input: { wallNowMs: 1000, foreground: true },
      tickPlan: { researchPerSecond: 150 },
    });
    expect(advanced.accepted).toBe(true);
    expect(advanced.state.run.economy.researchedTechnologies).toContain("knowledgeSharing");
    expect(advanced.state.run.researchPoints).toBe(50);
    expect(isValidGameState(advanced.state)).toBe(true);
  });
});
