import {
  PHILOSOPHY_ABILITY_RESEARCH_COST,
  PHILOSOPHY_PATHS,
  PHILOSOPHY_REPEATABLE_BASE_COST,
  PHILOSOPHY_RESEARCH_COST_GROWTH,
  isPhilosophyRepeatableId,
  type PhilosophyRepeatableId,
} from "../content/philosophy";
import { PHILOSOPHY_IDS, type EconomicGoodId, type PhilosophyId } from "../content/ids";
import { canAfford, settleSpend } from "./precision";
import type { SpacePurchaseCost } from "../content/space";
import { COMPOUND_CATALOG } from "../content/economy";
import type { CompoundId } from "../content/ids";
import type { GameState } from "./state";
import { achievementCompoundCostMultiplier } from "./achievements";

export type PhilosophyCommand =
  | { readonly type: "philosophy.select"; readonly philosophyId: PhilosophyId }
  | { readonly type: "philosophy.ability.purchase" }
  | {
      readonly type: "philosophy.repeatable.purchase";
      readonly repeatableId: PhilosophyRepeatableId;
    };

export type PhilosophyFailure = {
  readonly code:
    | "choice-not-pending"
    | "philosophy-already-chosen"
    | "philosophy-not-chosen"
    | "wrong-philosophy-path"
    | "ability-already-active"
    | "insufficient-research"
    | "invalid-philosophy-command";
  readonly required?: number;
  readonly messageKey: "philosophy.failure";
};

export type PhilosophyEvent =
  | { readonly type: "philosophy.selected"; readonly philosophyId: PhilosophyId }
  | { readonly type: "philosophy.ability.activated"; readonly philosophyId: PhilosophyId }
  | {
      readonly type: "philosophy.repeatable.purchased";
      readonly philosophyId: PhilosophyId;
      readonly repeatableId: PhilosophyRepeatableId;
      readonly rank: number;
      readonly cost: number;
    };

export function isPhilosophyCommand(value: { readonly type: string }): value is PhilosophyCommand {
  return (
    value.type === "philosophy.select" ||
    value.type === "philosophy.ability.purchase" ||
    value.type === "philosophy.repeatable.purchase"
  );
}

export function philosophyRepeatableRank(
  state: GameState,
  repeatableId: PhilosophyRepeatableId,
): number {
  return state.permanent.philosophyRepeatableRanks[repeatableId];
}

export function philosophyRepeatablePrice(
  state: GameState,
  repeatableId: PhilosophyRepeatableId,
): number {
  const rank = philosophyRepeatableRank(state, repeatableId);
  let price = PHILOSOPHY_REPEATABLE_BASE_COST;
  for (let index = 0; index < rank; index += 1) {
    const next = Math.ceil(price * PHILOSOPHY_RESEARCH_COST_GROWTH);
    if (!Number.isSafeInteger(next)) return Number.POSITIVE_INFINITY;
    price = next;
  }
  return price;
}

export function philosophyDiscountedSpaceCost(
  state: GameState,
  cost: SpacePurchaseCost,
  repeatableId: PhilosophyRepeatableId,
  reductionPerRank: number,
  linear = false,
): SpacePurchaseCost {
  const rank = philosophyRepeatableRank(state, repeatableId);
  const multiplier = linear
    ? Math.max(0, 1 - reductionPerRank * rank)
    : (1 - reductionPerRank) ** rank;
  return {
    ...cost,
    cash: cost.cash * multiplier,
    ...(cost.antimatter === undefined ? {} : { antimatter: cost.antimatter * multiplier }),
    materials: cost.materials.map((entry) => ({ ...entry, amount: entry.amount * multiplier })),
  };
}

export function philosophyCompoundRecipe(
  state: GameState,
  compoundId: CompoundId,
): readonly { readonly goodId: EconomicGoodId; readonly amount: number }[] {
  const rank = philosophyRepeatableRank(state, "massCompoundAssembly");
  return COMPOUND_CATALOG[compoundId].recipe.map((entry) => {
    let amount: number = entry.amount;
    for (let index = 0; index < rank && amount > 1; index += 1)
      amount = Math.max(1, Math.ceil(amount * 0.95));
    return {
      ...entry,
      amount: Math.max(1, Math.ceil(amount * achievementCompoundCostMultiplier(state))),
    };
  });
}

function failure(code: PhilosophyFailure["code"], required?: number): PhilosophyFailure {
  return {
    code,
    ...(required === undefined ? {} : { required }),
    messageKey: "philosophy.failure",
  };
}

export function checkPhilosophyCommand(
  state: GameState,
  command: PhilosophyCommand,
): PhilosophyFailure | null {
  if (command.type === "philosophy.select") {
    if (!PHILOSOPHY_IDS.includes(command.philosophyId))
      return failure("invalid-philosophy-command");
    if (state.permanent.philosophyId !== null) return failure("philosophy-already-chosen");
    return state.run.philosophyChoicePending ? null : failure("choice-not-pending");
  }
  const philosophyId = state.permanent.philosophyId;
  if (philosophyId === null) return failure("philosophy-not-chosen");
  if (command.type === "philosophy.ability.purchase") {
    if (state.run.philosophyAbilityActive) return failure("ability-already-active");
    return canAfford(state.run.researchPoints, PHILOSOPHY_ABILITY_RESEARCH_COST)
      ? null
      : failure("insufficient-research", PHILOSOPHY_ABILITY_RESEARCH_COST);
  }
  if (!isPhilosophyRepeatableId(command.repeatableId)) return failure("invalid-philosophy-command");
  if (!PHILOSOPHY_PATHS[philosophyId].repeatables.includes(command.repeatableId))
    return failure("wrong-philosophy-path");
  const rank = philosophyRepeatableRank(state, command.repeatableId);
  if (!Number.isSafeInteger(rank + 1)) return failure("invalid-philosophy-command");
  const cost = philosophyRepeatablePrice(state, command.repeatableId);
  return Number.isFinite(cost) && canAfford(state.run.researchPoints, cost)
    ? null
    : failure(Number.isFinite(cost) ? "insufficient-research" : "invalid-philosophy-command", cost);
}

export function applyPhilosophyCommand(
  state: GameState,
  command: PhilosophyCommand,
): { readonly state: GameState; readonly events: readonly PhilosophyEvent[] } {
  if (command.type === "philosophy.select") {
    return {
      state: {
        ...state,
        run: { ...state.run, philosophyChoicePending: false },
        permanent: { ...state.permanent, philosophyId: command.philosophyId },
      },
      events: [{ type: "philosophy.selected", philosophyId: command.philosophyId }],
    };
  }
  const philosophyId = state.permanent.philosophyId!;
  if (command.type === "philosophy.ability.purchase") {
    return {
      state: {
        ...state,
        run: {
          ...state.run,
          researchPoints: settleSpend(state.run.researchPoints, PHILOSOPHY_ABILITY_RESEARCH_COST),
          philosophyAbilityActive: true,
        },
      },
      events: [{ type: "philosophy.ability.activated", philosophyId }],
    };
  }
  const cost = philosophyRepeatablePrice(state, command.repeatableId);
  const rank = state.permanent.philosophyRepeatableRanks[command.repeatableId] + 1;
  return {
    state: {
      ...state,
      run: {
        ...state.run,
        researchPoints: settleSpend(state.run.researchPoints, cost),
      },
      permanent: {
        ...state.permanent,
        philosophyRepeatableRanks: {
          ...state.permanent.philosophyRepeatableRanks,
          [command.repeatableId]: rank,
        },
      },
    },
    events: [
      {
        type: "philosophy.repeatable.purchased",
        philosophyId,
        repeatableId: command.repeatableId,
        rank,
        cost,
      },
    ],
  };
}
