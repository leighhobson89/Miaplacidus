import { expect, test } from "../_harness/fixtures";
import { saveNowFromSettings } from "../_harness/save-controls";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

async function startSpaceFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("miaplacidus:fixture-cleared") === "yes") return;
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
    sessionStorage.setItem("miaplacidus:fixture-cleared", "yes");
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Philosophy Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("chooses a path after first star study and restores its ability and repeatable after reload @philosophy", async ({
  page,
}, testInfo) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build telescope" }).click();
  await page.getByRole("button", { name: "Study stars", exact: true }).click();
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "timer.complete",
        timerId: "survey:star-study",
      }),
    ),
  ).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => ({
        pending: window.miaplacidusTest!.getState().run.philosophyChoicePending,
        survey: window.miaplacidusTest!.getState().run.space.activeSurvey,
        range: window.miaplacidusTest!.getState().run.space.starStudyRange,
        timer: window.miaplacidusTest!.getState().run.timers["survey:star-study"]?.status,
      })),
    )
    .toEqual({ pending: true, survey: null, range: 1, timer: "complete" });
  await expect(page.getByTestId("philosophy-choice")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Choose your civilization's philosophy" }),
  ).toBeFocused();
  await expect(page.getByTestId("philosophy-choice").locator("[data-philosophy-art]")).toHaveCount(
    4,
  );
  const philosophyChoices = page.getByTestId("philosophy-choice");
  for (const name of ["Constructor", "Supremacist", "Voidborn", "Expansionist"]) {
    await expect(philosophyChoices.getByRole("button", { name, exact: true })).toBeInViewport({
      ratio: 1,
    });
  }
  await captureVisualCheckpoint(page, testInfo, "philosophy-path-choice-artwork");
  await page.getByTestId("philosophy-choice").getByRole("button", { name: "Expansionist" }).click();

  await page.getByRole("tab", { name: "Research" }).click();
  await page.getByRole("tab", { name: "Philosophy" }).click();
  const philosophy = page.getByTestId("philosophy-pane");
  await expect(philosophy).toContainText("Expansionist");
  await expect(philosophy.locator('[data-philosophy-art="expansionist"]')).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "philosophy-selected-path-artwork");
  await philosophy
    .locator('[data-philosophy-ability="rapidExpansion"]')
    .getByRole("button", { name: "Research" })
    .click();
  await philosophy
    .locator('[data-philosophy-repeatable="warpDrive"]')
    .getByRole("button", { name: "Research" })
    .click();
  const readProgress = () =>
    page.evaluate(() => ({
      path: window.miaplacidusTest!.getState().permanent.philosophyId,
      ability: window.miaplacidusTest!.getState().run.philosophyAbilityActive,
      rank: window.miaplacidusTest!.getState().permanent.philosophyRepeatableRanks.warpDrive,
    }));
  await expect.poll(readProgress).toEqual({ path: "expansionist", ability: true, rank: 1 });

  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await page.getByLabel("Pioneer name").click();
  await page.getByRole("option", { name: /Philosophy Pioneer/ }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Research" }).click();
  await page.getByRole("tab", { name: "Philosophy" }).click();
  await expect(page.getByTestId("philosophy-pane")).toContainText("Expansionist");
  await expect.poll(readProgress).toEqual({ path: "expansionist", ability: true, rank: 1 });
});
