import { describe, expect, it } from "vitest";
import {
  STAR_NAME_CATALOGUE,
  STAR_TYPE_IDS,
  bTypeAutoBuyerBonusPerSecond,
  createStarCatalogue,
  oTypePowerPlantMultiplier,
  starTypeForSystem,
} from "../../src/content";
import { autobuyerUpgradeId } from "../../src/content/ids";
import type { AsteroidState } from "../../src/content/space";
import {
  advanceSpaceMining,
  antimatterMiningRatePerSecond,
  createInitialGameState,
} from "../../src/engine";
import type { GameState } from "../../src/engine/state";
import { createEconomyTickPlan } from "../../src/engine/economySimulation";

describe("star type rules", () => {
  it("keeps the source type set and default galaxy distribution", () => {
    const generated = createStarCatalogue();
    expect(STAR_TYPE_IDS).toEqual(["A", "B", "F", "G", "K", "M", "O"]);
    expect(STAR_NAME_CATALOGUE.length).toBe(100);
    const counts = Object.fromEntries(
      STAR_TYPE_IDS.map((type) => [
        type,
        generated.filter((star) => star.starType === type).length,
      ]),
    );
    expect(counts).toEqual({ A: 22, B: 25, F: 14, G: 6, K: 24, M: 6, O: 3 });
  });

  it("resolves star types from names and stable system IDs, with the source fallback", () => {
    expect(starTypeForSystem("canopus")).toBe("F");
    expect(starTypeForSystem("Regulus")).toBe("O");
    expect(starTypeForSystem("system:80:0")).toBe("K");
    expect(starTypeForSystem("unlisted-system")).toBe("A");
  });

  it("adds the B-type flat bonus per owned resource autobuyer and leaves compounds alone", () => {
    const state = createInitialGameState();
    const resourceTier = autobuyerUpgradeId("hydrogen", 1);
    const compoundTier = autobuyerUpgradeId("glass", 1);
    const withOwnedBuyers = (systemId: string) => ({
      ...state,
      run: {
        ...state.run,
        upgrades: { [resourceTier]: 3, [compoundTier]: 1 },
        space: { ...state.run.space, currentSystemId: systemId },
      },
    });

    const bType = createEconomyTickPlan(withOwnedBuyers("Rigel")).tickPlan.productionPerSecond;
    const neutral = createEconomyTickPlan(withOwnedBuyers("Sirius")).tickPlan.productionPerSecond;
    expect((bType.hydrogen ?? 0) - (neutral.hydrogen ?? 0)).toBe(
      3 * bTypeAutoBuyerBonusPerSecond(1),
    );
    expect((bType.glass ?? 0) - (neutral.glass ?? 0)).toBe(0);
  });

  it("applies the F-type 1.5 mining bonus from each asteroid's saved system", () => {
    const base = createInitialGameState();
    const asteroidFor = (systemId: string): AsteroidState => ({
      id: `asteroid-${systemId}`,
      name: "Test rock",
      systemId,
      distance: 100_000,
      rarity: "common",
      extractionEase: 1,
      remainingAntimatter: 100,
      totalAntimatter: 100,
      reservedBy: "rocket1",
      depleted: false,
      interacted: true,
    });
    const miningStateFor = (systemId: string) => {
      const asteroid = asteroidFor(systemId);
      return {
        ...base,
        run: {
          ...base.run,
          space: {
            ...base.run.space,
            asteroids: [asteroid],
            rockets: {
              ...base.run.space.rockets,
              rocket1: {
                ...base.run.space.rockets.rocket1,
                phase: "mining" as const,
                targetAsteroidId: asteroid.id,
              },
            },
          },
        },
      };
    };

    const neutral = antimatterMiningRatePerSecond(miningStateFor("Sirius"));
    const fType = antimatterMiningRatePerSecond(miningStateFor("Canopus"));
    expect(neutral).toBeCloseTo(0.4);
    expect(fType).toBeCloseTo(0.6);
    expect(fType / neutral).toBeCloseTo(1.5);

    const neutralMining = advanceSpaceMining(miningStateFor("Sirius"), { rocket1: 1000 });
    const fTypeMining = advanceSpaceMining(miningStateFor("Canopus"), { rocket1: 1000 });
    expect(neutralMining.state.run.space.antimatter).toBeCloseTo(0.4);
    expect(fTypeMining.state.run.space.antimatter).toBeCloseTo(0.6);
  });

  it("limits the O-type plant bonus to settled O systems and enabled saves", () => {
    expect(oTypePowerPlantMultiplier("O", true)).toBe(8);
    expect(oTypePowerPlantMultiplier("O", false)).toBe(1);
    expect(oTypePowerPlantMultiplier("O", true, false)).toBe(1);
    expect(oTypePowerPlantMultiplier("B", true)).toBe(1);
  });

  it("applies each saved O-type settlement bonus to its matching plant", () => {
    const base = createInitialGameState();
    const oTypeSystemId = createStarCatalogue().find((star) => star.starType === "O")!.id;
    const enabled = (
      plantId: "powerPlant1" | "powerPlant2" | "powerPlant3",
      withOTypeAssignment = true,
    ): GameState => ({
      ...base,
      run: {
        ...base.run,
        upgrades: { powerPlant1: 1, powerPlant2: 1, powerPlant3: 1 },
        economy: {
          ...base.run.economy,
          buildingEnabled: { ...base.run.economy.buildingEnabled, [plantId]: true },
          power: { ...base.run.economy.power, gridEnabled: true },
        },
      },
      permanent: {
        ...base.permanent,
        settledSystemIds: [...base.permanent.settledSystemIds, oTypeSystemId],
        oTypePowerPlantAssignments: {
          ...base.permanent.oTypePowerPlantAssignments,
          [plantId]: withOTypeAssignment ? oTypeSystemId : null,
        },
      },
    });
    const plant1 = createEconomyTickPlan(enabled("powerPlant1")).tickPlan.power.generationPerSecond;
    const plant2 = createEconomyTickPlan(enabled("powerPlant2")).tickPlan.power.generationPerSecond;
    const plant3 = createEconomyTickPlan(enabled("powerPlant3")).tickPlan.power.generationPerSecond;
    const baseline1 = createEconomyTickPlan(enabled("powerPlant1", false)).tickPlan.power
      .generationPerSecond;
    const baseline2 = createEconomyTickPlan(enabled("powerPlant2", false)).tickPlan.power
      .generationPerSecond;
    const baseline3 = createEconomyTickPlan(enabled("powerPlant3", false)).tickPlan.power
      .generationPerSecond;

    expect(plant1).toBeCloseTo(baseline1 * 8);
    expect(plant2).toBeCloseTo(baseline2 * 8);
    expect(plant3).toBeCloseTo(baseline3 * 8);
  });
});
