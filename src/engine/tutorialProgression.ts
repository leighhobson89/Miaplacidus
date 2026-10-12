import { INITIAL_GOODS } from "../content/economy";
import { hydrogenAutobuyerCount } from "../content/hydrogen";
import type { ProgressionTutorialStepId } from "../content/tutorial";
import type { GameState } from "./state";

/** Checks the game-state milestones that let the guided tutorial advance itself. */
export function isProgressionTutorialMilestoneSatisfied(
  state: GameState,
  stepId: ProgressionTutorialStepId,
): boolean {
  switch (stepId) {
    case "collectHydrogen":
      return state.run.goods.hydrogen.quantity >= 50;
    case "sellHydrogen":
      return state.run.goods.hydrogen.quantity >= 300;
    case "sellHydrogenAction":
    case "explainCashStat":
    case "confirmHydrogenStorageUpgrade":
    case "helpAutobuyerAlong":
      return false;
    case "buyHydrogenAutobuyer":
      return hydrogenAutobuyerCount(state.run.upgrades) > 0;
    case "buildScienceKit":
      return state.run.scienceKitsBuiltThisRun >= 3;
    case "pauseScienceKit":
      // The guided player may start the tutorial after buying other research
      // buildings. Pausing the kits must count even when those buildings still
      // produce RP; their production is explained in the following step.
      return (
        state.run.scienceKitsBuiltThisRun >= 3 &&
        !state.run.economy.buildingEnabled.scienceKit
      );
    case "resumeScienceKit":
      return (
        state.run.scienceKitsBuiltThisRun >= 3 &&
        state.run.economy.buildingEnabled.scienceKit
      );
    case "increaseHydrogenStorage":
      return state.run.goods.hydrogen.storageCapacity > INITIAL_GOODS.hydrogen.storageCapacity;
    case "explainResearchRate":
    case "inspectHydrogenStorage":
    case "explainTechnologyOptions":
    case "exploreTechTree":
    case "inspectScienceClub":
    case "visitVisualSettings":
    case "visitAudioSettings":
    case "readAudioSettings":
    case "visitMiaplaediaGetStarted":
    case "visitMiaplaediaStory":
    case "visitMiaplaediaConceptsEarly":
    case "visitMiaplaediaConceptsMid":
    case "visitMiaplaediaConceptsLate":
    case "chooseDarkTheme":
    case "completeGuidedTour":
      return false;
    case "researchKnowledgeSharing":
      return state.run.economy.researchedTechnologies.includes("knowledgeSharing");
  }
}
