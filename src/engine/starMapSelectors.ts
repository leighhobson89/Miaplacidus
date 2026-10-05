import type { SystemId } from "../content/ids";
import { checkPreconditions, type CommandFailure } from "./commands";
import { starshipTravelPlan } from "./spaceMechanics";
import type { GameState } from "./state";

export interface StarDestinationRoutePreview {
  readonly distanceLy: number;
  readonly antimatterRequired: number;
  readonly ascendencyPoints: number | null;
}

export interface StarDestinationSelection {
  readonly enabled: boolean;
  readonly failure?: CommandFailure;
  readonly route: StarDestinationRoutePreview | null;
}

/** Returns the engine-validated travel affordance and its current route costs. */
export function selectStarDestination(
  state: GameState,
  systemId: SystemId,
): StarDestinationSelection {
  const precondition = checkPreconditions(state, {
    type: "space.starship.destination.select",
    systemId,
  });
  const plan = starshipTravelPlan(state, systemId);
  const profile = state.run.space.systemProfiles.find((entry) => entry.systemId === systemId);

  return {
    enabled: precondition.ok,
    ...(precondition.ok ? {} : { failure: precondition.failure }),
    route: plan
      ? {
          distanceLy: plan.distanceLy,
          antimatterRequired: plan.antimatter,
          ascendencyPoints: profile?.ascendencyPoints ?? null,
        }
      : null,
  };
}
