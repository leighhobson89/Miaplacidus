import { describe, expect, it } from "vitest";
import { LAUNCH_PAD_COST } from "../../src/content/space";
import { selectEconomyAction } from "../../src/engine/selectors";
import { createInitialGameState } from "../../src/engine/state";
import type { GameState } from "../../src/engine/state";
import { philosophyDiscountedSpaceCost } from "../../src/engine/philosophy";

function launchPadState(ironQuantity: number): GameState {
  const initial = createInitialGameState({ pioneerName: "Launch Pad Affordance", seed: 6010 });
  const cost = philosophyDiscountedSpaceCost(
    initial,
    LAUNCH_PAD_COST,
    "efficientAssembly",
    0.01,
    true,
  );
  const goods = { ...initial.run.goods };
  for (const material of cost.materials) {
    const good = goods[material.goodId];
    goods[material.goodId] = {
      ...good,
      quantity: material.goodId === "iron" ? ironQuantity : material.amount,
      storageCapacity: Math.max(good.storageCapacity, material.amount),
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
        researchedTechnologies: [...initial.run.economy.researchedTechnologies, "rocketComposites"],
        revealedTechnologies: [...initial.run.economy.revealedTechnologies, "rocketComposites"],
      },
    },
  };
}

describe("selector-backed Space Mining purchase affordances", () => {
  it("keeps the Launch Pad disabled below its Iron quote and enables it at the requirement", () => {
    const initial = createInitialGameState({ pioneerName: "Launch Pad Affordance", seed: 6010 });
    const ironRequirement = philosophyDiscountedSpaceCost(
      initial,
      LAUNCH_PAD_COST,
      "efficientAssembly",
      0.01,
      true,
    ).materials.find(({ goodId }) => goodId === "iron")!.amount;
    const command = { type: "space.launch-pad.build" } as const;

    const blocked = selectEconomyAction(launchPadState(ironRequirement - 1), command);
    expect(blocked.enabled).toBe(false);
    expect(blocked.failure).toMatchObject({
      code: "insufficient-material",
      goodId: "iron",
      required: ironRequirement,
    });

    expect(selectEconomyAction(launchPadState(ironRequirement), command)).toEqual({
      enabled: true,
    });
  });
});
