import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import {
  PROGRESSION_TUTORIAL_STEP_IDS,
  type ProgressionTutorialStepId,
} from "../../../src/content/tutorial";
import { translate } from "../../../src/i18n/messages";
import { saveText } from "../../../src/i18n/saveMessages";
import { tutorialText, type TutorialMessageKey } from "../../../src/i18n/tutorialMessages";

const sourceOnboardingSteps = [
  { id: "collectHydrogen", destinationLabel: "openResources" },
  { id: "buyHydrogenAutobuyer", destinationLabel: "openResources" },
  { id: "buildScienceKit", destinationLabel: "openResearch" },
  { id: "pauseScienceKit", destinationLabel: "openResearch" },
  { id: "explainResearchRate", destinationLabel: "openResearch" },
  { id: "resumeScienceKit", destinationLabel: "openResearch" },
  { id: "inspectHydrogenStorage", destinationLabel: "openResources" },
  { id: "increaseHydrogenStorage", destinationLabel: "openResources" },
  { id: "confirmHydrogenStorageUpgrade", destinationLabel: "openResources" },
  { id: "helpAutobuyerAlong", destinationLabel: "openResources" },
  { id: "sellHydrogen", destinationLabel: "openResources" },
  { id: "sellHydrogenAction", destinationLabel: "openResources" },
  { id: "explainCashStat", destinationLabel: "openResources" },
  { id: "explainTechnologyOptions", destinationLabel: "openTechTree" },
  { id: "exploreTechTree", destinationLabel: "openTechTree" },
  { id: "researchKnowledgeSharing", destinationLabel: "openTechTree" },
  { id: "inspectScienceClub", destinationLabel: "openResearch" },
  { id: "visitVisualSettings", destinationLabel: "openVisualSettings" },
  { id: "openThemeDropdown", destinationLabel: "openVisualSettings" },
  { id: "chooseDarkTheme", destinationLabel: "openVisualSettings" },
  { id: "visitAudioSettings", destinationLabel: "openAudioSettings" },
  { id: "readAudioSettings", destinationLabel: "openAudioSettings" },
  { id: "visitMiaplaediaGetStarted", destinationLabel: "openGetStarted" },
  { id: "visitMiaplaediaStory", destinationLabel: "openStory" },
  { id: "visitMiaplaediaConceptsEarly", destinationLabel: "openEarlyConcepts" },
  { id: "visitMiaplaediaConceptsMid", destinationLabel: "openMidConcepts" },
  { id: "visitMiaplaediaConceptsLate", destinationLabel: "openLateConcepts" },
  { id: "completeGuidedTour", destinationLabel: "openLateConcepts" },
] as const satisfies readonly {
  readonly id: ProgressionTutorialStepId;
  readonly destinationLabel: TutorialMessageKey;
}[];

function stepMessageKey(
  stepId: ProgressionTutorialStepId,
  part: "title" | "body",
): TutorialMessageKey {
  return `step.${stepId}.${part}` as TutorialMessageKey;
}

test(
  "P-7 source onboarding offer, step/result copy, and controls follow all six locales @p7-onboarding-locales @localization @onboarding",
  async ({ page }) => {
    test.setTimeout(180_000);
    await page.addInitScript(() => {
      const prefix = "miaplacidus:v1:";
      for (const storage of [localStorage, sessionStorage]) {
        const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
          (key): key is string => key?.startsWith(prefix) ?? false,
        );
        for (const key of keys) storage.removeItem(key);
      }
    });

    for (const locale of LOCALE_IDS) {
      await page.goto(`/?testSeed=20261015&testLocale=${locale}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await page
        .getByLabel(translate(locale, "app.pioneer"))
        .fill(`P7 ${locale.toUpperCase()} Tutorial`);
      const startGame = page.getByTestId("start-game");
      await expect(startGame).toHaveText(saveText(locale, "startNewGame"));
      await startGame.click();

      await expect(page.locator("[data-app-ready]")).toBeVisible();
      const tutorial = page.getByRole("complementary", {
        name: tutorialText(locale, "title"),
        exact: true,
      });
      await expect(tutorial).toBeVisible();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(tutorial.getByRole("heading", { level: 2 })).toHaveText(
        tutorialText(locale, "title"),
      );
      await expect(tutorial.getByText(tutorialText(locale, "offer"), { exact: true })).toBeVisible();
      await expect(
        tutorial.getByRole("button", { name: tutorialText(locale, "noThanks"), exact: true }),
      ).toBeVisible();

      await tutorial
        .getByRole("button", { name: tutorialText(locale, "start"), exact: true })
        .click();
      await expect(tutorial.getByRole("heading", { level: 2 })).toHaveText(
        tutorialText(locale, "step.collectHydrogen.title"),
      );
      await expect(
        tutorial.getByText(tutorialText(locale, "step.collectHydrogen.body"), { exact: true }),
      ).toBeVisible();

      expect(sourceOnboardingSteps.map(({ id }) => id)).toEqual([
        ...PROGRESSION_TUTORIAL_STEP_IDS,
      ]);
      const stepHeading = tutorial.getByRole("heading", { level: 2 });
      for (const [index, step] of sourceOnboardingSteps.entries()) {
        const title = tutorialText(locale, stepMessageKey(step.id, "title"));
        const body = tutorialText(locale, stepMessageKey(step.id, "body"));
        const destination = tutorialText(locale, step.destinationLabel);
        expect(title.trim(), `${locale} ${step.id} title must be populated`).not.toBe("");
        expect(body.trim(), `${locale} ${step.id} body must be populated`).not.toBe("");
        expect(destination.trim(), `${locale} ${step.id} destination must be populated`).not.toBe("");
        await expect(stepHeading).toHaveText(title);
        await expect(tutorial.getByText(body, { exact: true })).toBeVisible();
        await expect(tutorial.getByRole("button", { name: destination, exact: true })).toBeVisible();
        await expect(
          tutorial.getByRole("button", {
            name: tutorialText(locale, step.id === "completeGuidedTour" ? "finish" : "continue"),
            exact: true,
          }),
        ).toBeVisible();
        await expect(
          tutorial.getByRole("button", { name: tutorialText(locale, "skip"), exact: true }),
        ).toBeVisible();

        const nextStep = sourceOnboardingSteps[index + 1];
        if (nextStep) {
          const accepted = await page.evaluate((stepId) =>
            window.miaplacidusTest!.dispatch({ type: "tutorial.advance", stepId }),
            step.id,
          );
          expect(accepted).toBe(true);
          await expect(stepHeading).toHaveText(
            tutorialText(locale, stepMessageKey(nextStep.id, "title")),
          );
        }
      }

      await tutorial.getByRole("button", { name: tutorialText(locale, "skip"), exact: true }).click();
      await expect(tutorial).toHaveCount(0);
    }
  },
);
