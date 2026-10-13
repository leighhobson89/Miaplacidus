import { useEffect, useRef, useState } from "react";
import type { LocaleId } from "../content/ids";
import type { GameState } from "../engine/state";
import { isProgressionTutorialMilestoneSatisfied } from "../engine/tutorialProgression";
import { PROGRESSION_TUTORIAL_STEP_IDS, type ProgressionTutorialStepId } from "../content/tutorial";
import { tutorialText, type TutorialMessageKey } from "../i18n/tutorialMessages";
import type { MiaplaediaPaneId } from "./presentationNavigation";

export type ProgressionTutorialCommand =
  | { readonly type: "tutorial.start" }
  | { readonly type: "tutorial.dismiss" }
  | { readonly type: "tutorial.advance"; readonly stepId: ProgressionTutorialStepId }
  | { readonly type: "tutorial.complete" };

type TutorialStepDefinition = {
  readonly title: TutorialMessageKey;
  readonly body: TutorialMessageKey;
  readonly destinationLabel: TutorialMessageKey;
  readonly destination:
    | "resources"
    | "research"
    | "techTree"
    | "visualSettings"
    | "audioSettings"
    | MiaplaediaPaneId;
  readonly requiresOpenDestination?: boolean;
  readonly minimumReadMs?: number;
};

const STEP_DEFINITIONS: Readonly<Record<ProgressionTutorialStepId, TutorialStepDefinition>> = {
  collectHydrogen: {
    title: "step.collectHydrogen.title",
    body: "step.collectHydrogen.body",
    destinationLabel: "openResources",
    destination: "resources",
  },
  sellHydrogen: {
    title: "step.sellHydrogen.title",
    body: "step.sellHydrogen.body",
    destinationLabel: "openResources",
    destination: "resources",
  },
  sellHydrogenAction: {
    title: "step.sellHydrogenAction.title",
    body: "step.sellHydrogenAction.body",
    destinationLabel: "openResources",
    destination: "resources",
  },
  explainCashStat: {
    title: "step.explainCashStat.title",
    body: "step.explainCashStat.body",
    destinationLabel: "openResources",
    destination: "resources",
    requiresOpenDestination: true,
    minimumReadMs: 3000,
  },
  buyHydrogenAutobuyer: {
    title: "step.buyHydrogenAutobuyer.title",
    body: "step.buyHydrogenAutobuyer.body",
    destinationLabel: "openResources",
    destination: "resources",
  },
  buildScienceKit: {
    title: "step.buildScienceKit.title",
    body: "step.buildScienceKit.body",
    destinationLabel: "openResearch",
    destination: "research",
  },
  pauseScienceKit: {
    title: "step.pauseScienceKit.title",
    body: "step.pauseScienceKit.body",
    destinationLabel: "openResearch",
    destination: "research",
  },
  explainResearchRate: {
    title: "step.explainResearchRate.title",
    body: "step.explainResearchRate.body",
    destinationLabel: "openResearch",
    destination: "research",
    requiresOpenDestination: true,
    minimumReadMs: 4000,
  },
  resumeScienceKit: {
    title: "step.resumeScienceKit.title",
    body: "step.resumeScienceKit.body",
    destinationLabel: "openResearch",
    destination: "research",
  },
  inspectHydrogenStorage: {
    title: "step.inspectHydrogenStorage.title",
    body: "step.inspectHydrogenStorage.body",
    destinationLabel: "openResources",
    destination: "resources",
    requiresOpenDestination: true,
    minimumReadMs: 4000,
  },
  increaseHydrogenStorage: {
    title: "step.increaseHydrogenStorage.title",
    body: "step.increaseHydrogenStorage.body",
    destinationLabel: "openResources",
    destination: "resources",
  },
  confirmHydrogenStorageUpgrade: {
    title: "step.confirmHydrogenStorageUpgrade.title",
    body: "step.confirmHydrogenStorageUpgrade.body",
    destinationLabel: "openResources",
    destination: "resources",
    requiresOpenDestination: true,
    minimumReadMs: 3000,
  },
  helpAutobuyerAlong: {
    title: "step.helpAutobuyerAlong.title",
    body: "step.helpAutobuyerAlong.body",
    destinationLabel: "openResources",
    destination: "resources",
    requiresOpenDestination: true,
    minimumReadMs: 3000,
  },
  explainTechnologyOptions: {
    title: "step.explainTechnologyOptions.title",
    body: "step.explainTechnologyOptions.body",
    destinationLabel: "openTechTree",
    destination: "techTree",
    requiresOpenDestination: true,
    minimumReadMs: 3000,
  },
  exploreTechTree: {
    title: "step.exploreTechTree.title",
    body: "step.exploreTechTree.body",
    destinationLabel: "openTechTree",
    destination: "techTree",
    requiresOpenDestination: true,
    minimumReadMs: 4000,
  },
  researchKnowledgeSharing: {
    title: "step.researchKnowledgeSharing.title",
    body: "step.researchKnowledgeSharing.body",
    destinationLabel: "openTechTree",
    destination: "techTree",
  },
  inspectScienceClub: {
    title: "step.inspectScienceClub.title",
    body: "step.inspectScienceClub.body",
    destinationLabel: "openResearch",
    destination: "research",
    requiresOpenDestination: true,
    minimumReadMs: 4000,
  },
  visitVisualSettings: {
    title: "step.visitVisualSettings.title",
    body: "step.visitVisualSettings.body",
    destinationLabel: "openVisualSettings",
    destination: "visualSettings",
    requiresOpenDestination: true,
    minimumReadMs: 4000,
  },
  chooseDarkTheme: {
    title: "step.chooseDarkTheme.title",
    body: "step.chooseDarkTheme.body",
    destinationLabel: "openVisualSettings",
    destination: "visualSettings",
  },
  visitAudioSettings: {
    title: "step.visitAudioSettings.title",
    body: "step.visitAudioSettings.body",
    destinationLabel: "openAudioSettings",
    destination: "audioSettings",
  },
  readAudioSettings: {
    title: "step.readAudioSettings.title",
    body: "step.readAudioSettings.body",
    destinationLabel: "openAudioSettings",
    destination: "audioSettings",
    requiresOpenDestination: true,
    minimumReadMs: 4000,
  },
  visitMiaplaediaGetStarted: {
    title: "step.visitMiaplaediaGetStarted.title",
    body: "step.visitMiaplaediaGetStarted.body",
    destinationLabel: "openGetStarted",
    destination: "miaplaedia-get-started",
    requiresOpenDestination: true,
    minimumReadMs: 4000,
  },
  visitMiaplaediaStory: {
    title: "step.visitMiaplaediaStory.title",
    body: "step.visitMiaplaediaStory.body",
    destinationLabel: "openStory",
    destination: "miaplaedia-story",
    requiresOpenDestination: true,
    minimumReadMs: 4000,
  },
  visitMiaplaediaConceptsEarly: {
    title: "step.visitMiaplaediaConceptsEarly.title",
    body: "step.visitMiaplaediaConceptsEarly.body",
    destinationLabel: "openEarlyConcepts",
    destination: "miaplaedia-concepts-early",
    requiresOpenDestination: true,
  },
  visitMiaplaediaConceptsMid: {
    title: "step.visitMiaplaediaConceptsMid.title",
    body: "step.visitMiaplaediaConceptsMid.body",
    destinationLabel: "openMidConcepts",
    destination: "miaplaedia-concepts-mid",
    requiresOpenDestination: true,
  },
  visitMiaplaediaConceptsLate: {
    title: "step.visitMiaplaediaConceptsLate.title",
    body: "step.visitMiaplaediaConceptsLate.body",
    destinationLabel: "openLateConcepts",
    destination: "miaplaedia-concepts-late",
    requiresOpenDestination: true,
  },
  completeGuidedTour: {
    title: "step.completeGuidedTour.title",
    body: "step.completeGuidedTour.body",
    destinationLabel: "openLateConcepts",
    destination: "miaplaedia-concepts-late",
    requiresOpenDestination: true,
    minimumReadMs: 4000,
  },
};

export function ProgressionTutorial({
  state,
  locale,
  selectedTabId,
  activePaneId,
  onCommand,
  onOpenResources,
  onOpenResearch,
  onOpenTechTree,
  onOpenVisualSettings,
  onOpenAudioSettings,
  onOpenMiaplaediaPane,
}: {
  readonly state: GameState;
  readonly locale: LocaleId;
  readonly selectedTabId: string;
  readonly activePaneId: string;
  readonly onCommand: (command: ProgressionTutorialCommand) => void;
  readonly onOpenResources: () => void;
  readonly onOpenResearch: () => void;
  readonly onOpenTechTree: () => void;
  readonly onOpenVisualSettings: () => void;
  readonly onOpenAudioSettings: () => void;
  readonly onOpenMiaplaediaPane: (paneId: MiaplaediaPaneId) => void;
}) {
  const tutorial = state.permanent.progressionTutorial;
  const stepId = tutorial.stepId;
  const lastAutoAdvancedStep = useRef<ProgressionTutorialStepId | null>(null);
  const lastAnnouncedStep = useRef<ProgressionTutorialStepId | null>(null);
  const [stepAnnouncement, setStepAnnouncement] = useState("");
  const stepIndex = stepId ? PROGRESSION_TUTORIAL_STEP_IDS.indexOf(stepId) : -1;
  const milestoneSatisfied = stepId
    ? isProgressionTutorialMilestoneSatisfied(state, stepId)
    : false;
  const step = stepId ? STEP_DEFINITIONS[stepId] : null;
  const [readReadyStepId, setReadReadyStepId] = useState<ProgressionTutorialStepId | null>(null);

  useEffect(() => {
    if (tutorial.status !== "active" || !stepId || !step) {
      lastAnnouncedStep.current = null;
      setStepAnnouncement("");
      return;
    }
    if (lastAnnouncedStep.current === stepId) return;

    lastAnnouncedStep.current = stepId;
    const progress = tutorialText(locale, "stepProgress")
      .replace("{step}", String(stepIndex + 1))
      .replace("{total}", String(PROGRESSION_TUTORIAL_STEP_IDS.length));
    setStepAnnouncement(
      `${progress}. ${tutorialText(locale, step.title)}. ${tutorialText(locale, step.body)}`,
    );
  }, [locale, step, stepId, stepIndex, tutorial.status]);

  const destinationIsOpen = (() => {
    if (!step) return false;
    switch (step.destination) {
      case "resources":
        return selectedTabId === "hydrogen" && activePaneId === "resources-hydrogen";
      case "research":
        return selectedTabId === "research" && activePaneId === "research-science-buildings";
      case "techTree":
        return selectedTabId === "research" && activePaneId === "research-tech-tree";
      case "visualSettings":
        return selectedTabId === "settings" && activePaneId === "settings-visual";
      case "audioSettings":
        return selectedTabId === "settings" && activePaneId === "settings-game-options";
      default:
        return selectedTabId === "miaplaedia" && activePaneId === step.destination;
    }
  })();

  useEffect(() => {
    if (tutorial.status !== "active" || !stepId || !step?.minimumReadMs) {
      setReadReadyStepId(stepId);
      return;
    }
    if (!destinationIsOpen) {
      setReadReadyStepId(null);
      return;
    }

    setReadReadyStepId(null);
    const timer = window.setTimeout(() => setReadReadyStepId(stepId), step.minimumReadMs);
    return () => window.clearTimeout(timer);
  }, [destinationIsOpen, locale, step, stepId, tutorial.status]);

  useEffect(() => {
    if (tutorial.status !== "active" || !stepId || lastAutoAdvancedStep.current === stepId) return;
    if (!milestoneSatisfied) return;

    lastAutoAdvancedStep.current = stepId;
    if (stepIndex === PROGRESSION_TUTORIAL_STEP_IDS.length - 1) {
      onCommand({ type: "tutorial.complete" });
    } else {
      onCommand({ type: "tutorial.advance", stepId });
    }
  }, [milestoneSatisfied, onCommand, stepId, stepIndex, tutorial.status]);

  if (tutorial.status === "available") {
    return (
      <aside className="progression-tutorial" aria-labelledby="progression-tutorial-title">
        <div className="progression-tutorial-copy">
          <h2 id="progression-tutorial-title">{tutorialText(locale, "title")}</h2>
          <p>{tutorialText(locale, "offer")}</p>
        </div>
        <div className="progression-tutorial-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => onCommand({ type: "tutorial.start" })}
          >
            {tutorialText(locale, "start")}
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => onCommand({ type: "tutorial.dismiss" })}
          >
            {tutorialText(locale, "noThanks")}
          </button>
        </div>
      </aside>
    );
  }

  if (tutorial.status !== "active" || !stepId || stepIndex < 0) return null;

  if (!step) return null;
  const stepText = (key: TutorialMessageKey) => tutorialText(locale, key);
  const openDestination = () => {
    switch (step.destination) {
      case "resources":
        onOpenResources();
        break;
      case "research":
        onOpenResearch();
        break;
      case "techTree":
        onOpenTechTree();
        break;
      case "visualSettings":
        onOpenVisualSettings();
        break;
      case "audioSettings":
        onOpenAudioSettings();
        break;
      default:
        onOpenMiaplaediaPane(step.destination);
        break;
    }
  };
  const destinationStepSatisfied =
    step.requiresOpenDestination === true &&
    destinationIsOpen &&
    (!step.minimumReadMs || readReadyStepId === stepId);
  const canContinue = milestoneSatisfied || destinationStepSatisfied;
  const stepBodyId = `progression-tutorial-body-${stepId}`;
  const readHintId = `progression-tutorial-read-hint-${stepId}`;
  const showReadHint =
    Boolean(step.minimumReadMs) && destinationIsOpen && readReadyStepId !== stepId;
  const continueDescription = showReadHint ? `${stepBodyId} ${readHintId}` : stepBodyId;
  const advance = () => {
    if (!canContinue) return;
    if (stepIndex === PROGRESSION_TUTORIAL_STEP_IDS.length - 1) {
      onCommand({ type: "tutorial.complete" });
    } else {
      onCommand({ type: "tutorial.advance", stepId });
    }
  };
  const progress = stepText("stepProgress")
    .replace("{step}", String(stepIndex + 1))
    .replace("{total}", String(PROGRESSION_TUTORIAL_STEP_IDS.length));

  return (
    <aside
      className="progression-tutorial"
      aria-labelledby="progression-tutorial-title"
    >
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {stepAnnouncement}
      </div>
      <div className="progression-tutorial-copy">
        <p className="progression-tutorial-progress">{progress}</p>
        <h2 id="progression-tutorial-title">{stepText(step.title)}</h2>
        <p id={stepBodyId}>{stepText(step.body)}</p>
        {showReadHint ? (
          <p id={readHintId} className="progression-tutorial-read-hint">
            {stepText("readHint")}
          </p>
        ) : null}
      </div>
      <div className="progression-tutorial-actions">
        <button className="secondary-button" type="button" onClick={openDestination}>
          {stepText(step.destinationLabel)}
        </button>
        <button
          className="text-button"
          type="button"
          onClick={advance}
          disabled={!canContinue}
          aria-describedby={continueDescription}
        >
          {stepText(stepIndex === PROGRESSION_TUTORIAL_STEP_IDS.length - 1 ? "finish" : "continue")}
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => onCommand({ type: "tutorial.dismiss" })}
        >
          {stepText("skip")}
        </button>
      </div>
    </aside>
  );
}
