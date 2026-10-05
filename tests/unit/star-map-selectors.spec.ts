import { describe, expect, it } from "vitest";
import { createStarCatalogue, findStartingSystem } from "../../src/content/starCatalogue";
import { selectStarDestination } from "../../src/engine/starMapSelectors";
import { starshipTravelPlan } from "../../src/engine/spaceMechanics";
import { ensureDiscoveredStarSystemProfiles } from "../../src/engine/starSystemProfiles";
import { createInitialGameState, isValidGameState, type GameState } from "../../src/engine/state";

describe("star map destination selector", () => {
  it("returns the current engine denial reason for an undiscovered destination", () => {
    const state = createInitialGameState({ seed: 81 });
    const sirius = createStarCatalogue().find((star) => star.name === "Sirius")!;

    expect(selectStarDestination(state, sirius.id)).toMatchObject({
      enabled: false,
      failure: { code: "space-starship-destination-invalid" },
      route: null,
    });
  });

  it("returns the exact travel fuel and profile AP for a discovered route", () => {
    const initial = createInitialGameState({ seed: 82 });
    const catalogue = createStarCatalogue();
    const start = findStartingSystem(catalogue)!;
    const destination = catalogue.find((star) => star.name === "Sirius")!;
    const profiles = ensureDiscoveredStarSystemProfiles(
      initial.run.space.systemProfiles,
      start.id,
      200,
    );
    const state: GameState = {
      ...initial,
      run: {
        ...initial.run,
        space: {
          ...initial.run.space,
          currentSystemId: start.id,
          starStudyRange: 200,
          systemProfiles: profiles,
        },
      },
    };
    expect(isValidGameState(state)).toBe(true);

    const plan = starshipTravelPlan(state, destination.id);
    const profile = profiles.find((entry) => entry.systemId === destination.id);
    const selection = selectStarDestination(state, destination.id);

    expect(plan).not.toBeNull();
    expect(profile).toBeDefined();
    expect(selection).toEqual({
      enabled: true,
      route: {
        distanceLy: plan!.distanceLy,
        antimatterRequired: plan!.antimatter,
        ascendencyPoints: profile!.ascendencyPoints,
      },
    });
  });
});
