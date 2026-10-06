import { describe, expect, it } from "vitest";
import { COMPOUND_IDS, ECONOMIC_GOOD_IDS, MATERIAL_IDS } from "../../src/content/ids";
import { TECHNOLOGY_CATALOG } from "../../src/content/technology";
import { transition } from "../../src/engine/commands";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";
import type { TickPlan } from "../../src/engine/transactions";

const buildingHistory = [
  {
    buildingId: "powerPlant1",
    runField: "basicPowerPlantsBuiltThisRun",
    lifetimeField: "lifetimeBasicPowerPlantsBuilt",
  },
  {
    buildingId: "powerPlant3",
    runField: "advancedPowerPlantsBuiltThisRun",
    lifetimeField: "lifetimeAdvancedPowerPlantsBuilt",
  },
  {
    buildingId: "powerPlant2",
    runField: "solarPowerPlantsBuiltThisRun",
    lifetimeField: "lifetimeSolarPowerPlantsBuilt",
  },
  {
    buildingId: "battery1",
    runField: "sodiumIonBatteriesBuiltThisRun",
    lifetimeField: "lifetimeSodiumIonBatteriesBuilt",
  },
  {
    buildingId: "battery2",
    runField: "battery2BuiltThisRun",
    lifetimeField: "lifetimeBattery2Built",
  },
  {
    buildingId: "battery3",
    runField: "battery3BuiltThisRun",
    lifetimeField: "lifetimeBattery3Built",
  },
] as const;

const energyHistoryFields = [
  { runField: "energyTripsThisRun", lifetimeField: "lifetimeEnergyTrips" },
  ...buildingHistory.map(({ runField, lifetimeField }) => ({ runField, lifetimeField })),
] as const;

function energyPurchaseReadyState(): GameState {
  const initial = createInitialGameState({ pioneerName: "Energy History", seed: 771 });
  const goods = Object.fromEntries(
    ECONOMIC_GOOD_IDS.map((id) => [
      id,
      { ...initial.run.goods[id], quantity: 500_000, storageCapacity: 1_000_000 },
    ]),
  ) as GameState["run"]["goods"];
  const researchedTechnologies = TECHNOLOGY_CATALOG.map(({ id }) => id);
  return {
    ...initial,
    run: {
      ...initial.run,
      cash: 10_000_000,
      goods,
      unlockedResources: [...MATERIAL_IDS],
      economy: {
        ...initial.run.economy,
        unlockedCompounds: [...COMPOUND_IDS],
        researchedTechnologies,
        revealedTechnologies: researchedTechnologies,
      },
    },
    permanent: { ...initial.permanent, acquiredPerks: ["bulkPurchasing"] },
  };
}

function historySnapshot(state: GameState): readonly number[] {
  return [
    state.run.energyTripsThisRun,
    state.run.basicPowerPlantsBuiltThisRun,
    state.run.advancedPowerPlantsBuiltThisRun,
    state.run.solarPowerPlantsBuiltThisRun,
    state.run.sodiumIonBatteriesBuiltThisRun,
    state.run.battery2BuiltThisRun,
    state.run.battery3BuiltThisRun,
    state.statistics.lifetimeEnergyTrips,
    state.statistics.lifetimeBasicPowerPlantsBuilt,
    state.statistics.lifetimeAdvancedPowerPlantsBuilt,
    state.statistics.lifetimeSolarPowerPlantsBuilt,
    state.statistics.lifetimeSodiumIonBatteriesBuilt,
    state.statistics.lifetimeBattery2Built,
    state.statistics.lifetimeBattery3Built,
  ];
}

function stateWithHistoryCounter(
  state: GameState,
  scope: "run" | "statistics",
  field: string,
  value: number,
): GameState {
  return scope === "run"
    ? ({ ...state, run: { ...state.run, [field]: value } } as GameState)
    : ({ ...state, statistics: { ...state.statistics, [field]: value } } as GameState);
}

describe("Energy Statistics counters", () => {
  it("counts each accepted single building purchase and the exact Buy Max quantity", () => {
    let state = energyPurchaseReadyState();
    expect(isValidGameState(state)).toBe(true);

    for (const { buildingId, runField, lifetimeField } of buildingHistory) {
      const result = transition(state, { type: "economy.building.purchase", buildingId });
      expect(result.accepted, JSON.stringify(result.failure)).toBe(true);
      expect(result.events).toContainEqual({
        type: "purchase.completed",
        upgradeId: buildingId,
        count: 1,
      });
      expect(result.state.run[runField]).toBe(state.run[runField] + 1);
      expect(result.state.statistics[lifetimeField]).toBe(state.statistics[lifetimeField] + 1);
      state = result.state;
    }

    const beforeBulk = state.run.basicPowerPlantsBuiltThisRun;
    const lifetimeBeforeBulk = state.statistics.lifetimeBasicPowerPlantsBuilt;
    const bulk = transition(state, { type: "economy.building.buyMax", buildingId: "powerPlant1" });
    const purchaseCount = bulk.events.find((event) => event.type === "purchase.completed");
    expect(bulk.accepted, JSON.stringify(bulk.failure)).toBe(true);
    expect(purchaseCount).toMatchObject({ type: "purchase.completed", count: expect.any(Number) });
    if (!purchaseCount || purchaseCount.type !== "purchase.completed")
      throw new Error("Buy Max did not report its accepted purchase count.");
    expect(purchaseCount.count).toBeGreaterThan(1);
    expect(bulk.state.run.basicPowerPlantsBuiltThisRun).toBe(beforeBulk + purchaseCount.count);
    expect(bulk.state.statistics.lifetimeBasicPowerPlantsBuilt).toBe(
      lifetimeBeforeBulk + purchaseCount.count,
    );
    expect(isValidGameState(bulk.state)).toBe(true);
  });

  it("does not count rejected purchases, sales, or power/building toggles", () => {
    const initial = energyPurchaseReadyState();
    const noCash: GameState = { ...initial, run: { ...initial.run, cash: 0 } };
    const rejectedSingle = transition(noCash, {
      type: "economy.building.purchase",
      buildingId: "powerPlant1",
    });
    const rejectedBulk = transition(
      { ...initial, permanent: { ...initial.permanent, acquiredPerks: [] } },
      { type: "economy.building.buyMax", buildingId: "powerPlant1" },
    );
    expect(rejectedSingle.accepted).toBe(false);
    expect(rejectedBulk.accepted).toBe(false);
    expect(historySnapshot(rejectedSingle.state)).toEqual(historySnapshot(noCash));
    expect(historySnapshot(rejectedBulk.state)).toEqual(historySnapshot(initial));

    const purchased = transition(initial, {
      type: "economy.building.purchase",
      buildingId: "powerPlant1",
    });
    expect(purchased.accepted).toBe(true);
    const sold = transition(purchased.state, {
      type: "resource.sell",
      goodId: "hydrogen",
      amount: "all",
    });
    const gridOff = transition(sold.state, { type: "economy.power.toggle", enabled: false });
    const plantOff = transition(gridOff.state, {
      type: "economy.building.toggle",
      buildingId: "powerPlant1",
      enabled: false,
    });
    expect(sold.accepted).toBe(true);
    expect(gridOff.accepted).toBe(true);
    expect(plantOff.accepted).toBe(true);
    expect(historySnapshot(sold.state)).toEqual(historySnapshot(purchased.state));
    expect(historySnapshot(gridOff.state)).toEqual(historySnapshot(purchased.state));
    expect(historySnapshot(plantOff.state)).toEqual(historySnapshot(purchased.state));
  });

  it("counts each transition into the tripped state once, including after recovery", () => {
    const initial = createInitialGameState({ pioneerName: "Trip Counter", seed: 91 });
    let state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        energyTripsThisRun: 1,
        clock: { ...initial.run.clock, wallNowMs: 0 },
        economy: {
          ...initial.run.economy,
          power: {
            ...initial.run.economy.power,
            capacity: 15_000,
            gridEnabled: true,
            deficitMs: 9_000,
            tripped: false,
          },
        },
      },
      statistics: { ...initial.statistics, lifetimeEnergyTrips: 3 },
    };
    const deficitTick: TickPlan = { power: { generationPerSecond: 0, demandPerSecond: 2 } };
    const trip = () =>
      transition(state, {
        type: "clock.advance",
        input: { wallNowMs: state.run.clock.wallNowMs + 1_000, foreground: true },
        tickPlan: deficitTick,
      });

    const firstTrip = trip();
    expect(firstTrip.accepted).toBe(true);
    expect(firstTrip.state.run.economy.power.tripped).toBe(true);
    expect(firstTrip.events.filter((event) => event.type === "economy.power.tripped")).toHaveLength(
      1,
    );
    expect(firstTrip.state.run.energyTripsThisRun).toBe(2);
    expect(firstTrip.state.statistics.lifetimeEnergyTrips).toBe(4);
    state = firstTrip.state;

    const stillTripped = trip();
    expect(stillTripped.state.run.energyTripsThisRun).toBe(2);
    expect(stillTripped.state.statistics.lifetimeEnergyTrips).toBe(4);
    expect(stillTripped.events.filter((event) => event.type === "economy.power.tripped")).toHaveLength(
      0,
    );
    state = stillTripped.state;

    const recovered = transition(state, { type: "economy.power.toggle", enabled: false });
    state = transition(recovered.state, { type: "economy.power.toggle", enabled: true }).state;
    expect(state.run.economy.power.tripped).toBe(false);
    state = {
      ...state,
      run: {
        ...state.run,
        economy: {
          ...state.run.economy,
          power: { ...state.run.economy.power, deficitMs: 9_000 },
        },
      },
    };
    const secondTrip = trip();
    expect(secondTrip.state.run.economy.power.tripped).toBe(true);
    expect(secondTrip.events.filter((event) => event.type === "economy.power.tripped")).toHaveLength(
      1,
    );
    expect(secondTrip.state.run.energyTripsThisRun).toBe(3);
    expect(secondTrip.state.statistics.lifetimeEnergyTrips).toBe(5);
    expect(isValidGameState(secondTrip.state)).toBe(true);
  });

  it("requires each run and lifetime counter to be a safe integer with lifetime at least run", () => {
    const initial = createInitialGameState({ pioneerName: "Validate Energy History", seed: 13 });
    for (const { runField, lifetimeField } of energyHistoryFields) {
      for (const invalid of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
        expect(
          isValidGameState(stateWithHistoryCounter(initial, "run", runField, invalid)),
          `run.${runField} = ${invalid}`,
        ).toBe(false);
        expect(
          isValidGameState(stateWithHistoryCounter(initial, "statistics", lifetimeField, invalid)),
          `statistics.${lifetimeField} = ${invalid}`,
        ).toBe(false);
      }

      const runProgress = stateWithHistoryCounter(initial, "run", runField, 2);
      const belowRun = stateWithHistoryCounter(runProgress, "statistics", lifetimeField, 1);
      expect(isValidGameState(belowRun), `${lifetimeField} cannot trail ${runField}`).toBe(false);
    }
  });
});
