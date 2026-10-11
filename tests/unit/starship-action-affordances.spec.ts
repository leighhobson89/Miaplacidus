import { describe, expect, it } from "vitest";
import { STARSHIP_MODULES } from "../../src/content/space";
import { createInitialGameState } from "../../src/engine/state";
import { selectEconomyAction } from "../../src/engine/selectors";
import { playerFleetBuildCost } from "../../src/engine/fleetMechanics";
import { starshipModulePartCost } from "../../src/engine/spaceRules";
import type { GameState } from "../../src/engine/state";

function stateWithCostShortfall(cost: ReturnType<typeof playerFleetBuildCost>): GameState {
  const initial = createInitialGameState({ pioneerName: "Affordance", seed: 6054 });
  const shortGood = cost.materials[0]!;
  const goods = { ...initial.run.goods };
  for (const material of cost.materials) {
    goods[material.goodId] = {
      ...goods[material.goodId],
      storageCapacity: Math.max(goods[material.goodId].storageCapacity, material.amount),
      quantity: material.amount - (material.goodId === shortGood.goodId ? 1 : 0),
    };
  }
  return {
    ...initial,
    run: {
      ...initial.run,
      cash: cost.cash,
      goods,
      economy: {
        ...initial.run.economy,
        researchedTechnologies: [
          STARSHIP_MODULES.structural.technology,
          STARSHIP_MODULES.fleetHangar.technology,
        ],
        revealedTechnologies: [
          "knowledgeSharing",
          STARSHIP_MODULES.structural.technology,
          STARSHIP_MODULES.fleetHangar.technology,
        ],
      },
      space: {
        ...initial.run.space,
        starshipModules: {
          ...initial.run.space.starshipModules,
          fleetHangar: {
            ...initial.run.space.starshipModules.fleetHangar,
            builtParts: STARSHIP_MODULES.fleetHangar.parts,
          },
        },
      },
    },
  };
}

function stateWithExactCost(
  state: GameState,
  cost: ReturnType<typeof playerFleetBuildCost>,
): GameState {
  const goods = { ...state.run.goods };
  for (const material of cost.materials) {
    goods[material.goodId] = {
      ...goods[material.goodId],
      quantity: material.amount,
    };
  }
  return { ...state, run: { ...state.run, goods } };
}

describe("selector-backed Starship and Fleet purchase affordances", () => {
  it("blocks a Starship module one material short and enables it at exact cost", () => {
    const initial = createInitialGameState({ pioneerName: "Affordance", seed: 6054 });
    const cost = starshipModulePartCost("structural", 0, 0)!;
    const shortState = stateWithCostShortfall(cost);
    const command = { type: "space.starship.module.build", moduleId: "structural" } as const;
    const blocked = selectEconomyAction(shortState, command);

    expect(blocked.enabled).toBe(false);
    expect(blocked.failure).toMatchObject({
      code: "insufficient-material",
      goodId: cost.materials[0]!.goodId,
      required: cost.materials[0]!.amount,
    });
    expect(shortState.run.goods[cost.materials[0]!.goodId].quantity).toBe(
      cost.materials[0]!.amount - 1,
    );
    expect(selectEconomyAction(stateWithExactCost(shortState, cost), command)).toEqual({
      enabled: true,
    });
    expect(initial.run.space.starshipModules.structural.builtParts).toBe(0);
  });

  it("blocks a Fleet unit one material short and enables it at exact cost", () => {
    const initial = createInitialGameState({ pioneerName: "Affordance", seed: 6055 });
    const cost = playerFleetBuildCost(initial, "scout");
    const shortState = stateWithCostShortfall(cost);
    const command = { type: "space.fleet.build", fleetId: "scout" } as const;
    const blocked = selectEconomyAction(shortState, command);

    expect(blocked.enabled).toBe(false);
    expect(blocked.failure).toMatchObject({
      code: "insufficient-material",
      goodId: cost.materials[0]!.goodId,
      required: cost.materials[0]!.amount,
    });
    expect(shortState.run.goods[cost.materials[0]!.goodId].quantity).toBe(
      cost.materials[0]!.amount - 1,
    );
    expect(selectEconomyAction(stateWithExactCost(shortState, cost), command)).toEqual({
      enabled: true,
    });
  });
});
