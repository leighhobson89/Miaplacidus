export const PROGRESSION_TUTORIAL_STEP_IDS = [
  "collectHydrogen",
  "buyHydrogenAutobuyer",
  "buildScienceKit",
  "pauseScienceKit",
  "explainResearchRate",
  "resumeScienceKit",
  "inspectHydrogenStorage",
  "increaseHydrogenStorage",
  "confirmHydrogenStorageUpgrade",
  "helpAutobuyerAlong",
  "sellHydrogen",
  "sellHydrogenAction",
  "explainCashStat",
  "explainTechnologyOptions",
  "exploreTechTree",
  "researchKnowledgeSharing",
  "inspectScienceClub",
  "visitVisualSettings",
  "openThemeDropdown",
  "chooseDarkTheme",
  "visitAudioSettings",
  "readAudioSettings",
  "visitMiaplaediaGetStarted",
  "visitMiaplaediaStory",
  "visitMiaplaediaConceptsEarly",
  "visitMiaplaediaConceptsMid",
  "visitMiaplaediaConceptsLate",
  "completeGuidedTour",
] as const;

export type ProgressionTutorialStepId = (typeof PROGRESSION_TUTORIAL_STEP_IDS)[number];
export type ProgressionTutorialStatus = "available" | "active" | "dismissed" | "completed";

export interface ProgressionTutorialState {
  readonly status: ProgressionTutorialStatus;
  readonly stepId: ProgressionTutorialStepId | null;
}

export function createInitialProgressionTutorialState(): ProgressionTutorialState {
  return { status: "available", stepId: null };
}

export function createDismissedProgressionTutorialState(): ProgressionTutorialState {
  return { status: "dismissed", stepId: null };
}

export function isProgressionTutorialStepId(value: unknown): value is ProgressionTutorialStepId {
  return PROGRESSION_TUTORIAL_STEP_IDS.includes(value as ProgressionTutorialStepId);
}
