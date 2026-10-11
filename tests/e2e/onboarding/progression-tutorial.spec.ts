import { expect, test } from "../_harness/fixtures";

const stepsBeforeTechnologyOptions = [
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
] as const;

test("P-36 explains technology options before the Tech Tree and enforces both read gates @onboarding @p36", async ({
  page,
}) => {
  await page.clock.install();
  await page.addInitScript(() => {
    const appPrefix = "miaplacidus:v1:";
    for (const storage of [localStorage, sessionStorage]) {
      const appKeys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
        (key): key is string => key?.startsWith(appPrefix) ?? false,
      );
      for (const key of appKeys) storage.removeItem(key);
    }
  });
  await page.goto("/?testSeed=21736&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Tutorial Gate Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.getByRole("heading", { name: "Hydrogen", exact: true, level: 2 })).toBeVisible();

  await page.getByRole("button", { name: "Start tutorial" }).click();
  const priorAdvances = await page.evaluate((stepIds) => {
    const dispatch = window.miaplacidusTest!.dispatch;
    return stepIds.map((stepId) => dispatch({ type: "tutorial.advance", stepId }));
  }, stepsBeforeTechnologyOptions);
  expect(priorAdvances).toEqual(stepsBeforeTechnologyOptions.map(() => true));

  const tutorialTitle = page.getByRole("heading", { name: "Technology options", exact: true });
  const continueButton = page.getByRole("button", { name: "Continue", exact: true });
  await expect(tutorialTitle).toBeVisible();
  await expect(page.getByText("Here you can view and select technologies to research.")).toBeVisible();
  await expect(continueButton).toBeDisabled();

  await page.getByRole("button", { name: "Open Tech Tree", exact: true }).click();
  await expect(page.locator("#panel-research-tech-tree")).toBeVisible();
  await expect(page.locator("#progression-tutorial-read-hint-explainTechnologyOptions")).toBeVisible();
  await expect(continueButton).toBeDisabled();
  await page.clock.runFor(2_999);
  await expect(continueButton).toBeDisabled();
  await page.clock.runFor(1);
  await expect(continueButton).toBeEnabled();

  await continueButton.click();
  await expect(page.getByRole("heading", { name: "Explore the Tech Tree", exact: true })).toBeVisible();
  await expect(page.locator("#panel-research-tech-tree")).toBeVisible();
  await expect(page.locator("#progression-tutorial-read-hint-exploreTechTree")).toBeVisible();
  await expect(continueButton).toBeDisabled();
  await page.clock.runFor(3_999);
  await expect(continueButton).toBeDisabled();
  await page.clock.runFor(1);
  await expect(continueButton).toBeEnabled();
});
