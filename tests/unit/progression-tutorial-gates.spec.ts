import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../src/engine/state";
import { selectResearchProductionBreakdown } from "../../src/engine/selectors";
import { isProgressionTutorialMilestoneSatisfied } from "../../src/engine/tutorialProgression";

describe("progression tutorial gates", () => {
  it("lets the pause step continue when other research buildings keep producing RP", () => {
    const initial = createInitialGameState();
    const activeKitsState = {
      ...initial,
      run: {
        ...initial.run,
        scienceKitsBuiltThisRun: 3,
        scienceClubsBuiltThisRun: 1,
        upgrades: {
          ...initial.run.upgrades,
          scienceKit: 3,
          scienceClub: 1,
        },
        economy: {
          ...initial.run.economy,
          buildingEnabled: {
            ...initial.run.economy.buildingEnabled,
            scienceKit: true,
            scienceClub: true,
          },
        },
      },
    };

    expect(isProgressionTutorialMilestoneSatisfied(activeKitsState, "pauseScienceKit")).toBe(
      false,
    );

    const pausedKitsState = {
      ...activeKitsState,
      run: {
        ...activeKitsState.run,
        economy: {
          ...activeKitsState.run.economy,
          buildingEnabled: {
            ...activeKitsState.run.economy.buildingEnabled,
            scienceKit: false,
          },
        },
      },
    };

    expect(selectResearchProductionBreakdown(pausedKitsState).total).toBeGreaterThan(0);
    expect(isProgressionTutorialMilestoneSatisfied(pausedKitsState, "pauseScienceKit")).toBe(
      true,
    );
  });
});
