import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { saveNowFromSettings } from "../_harness/save-controls";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { philosophyText } from "../../../src/i18n/philosophyMessages";

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
  await dismissTutorialOfferIfPresent(page);
}

test("chooses a path after first star study and restores its ability and repeatable after reload @philosophy", async ({
  page,
}, testInfo) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build Space Telescope", exact: true }).click();
  const studyStars = page.getByRole("button", { name: "Study Stars", exact: true });
  await studyStars.click();
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
  const notificationSetting = (enabled: boolean) =>
    page.evaluate((notificationsEnabled) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { notificationsEnabled },
      }),
    enabled);
  expect(await notificationSetting(false)).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled))
    .toBe(false);
  await expect(
    page.getByTestId("notification-stack").getByTestId("game-notification"),
  ).toHaveCount(0);
  expect(await notificationSetting(true)).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled))
    .toBe(true);  await page.getByTestId("philosophy-choice").getByRole("button", { name: "Expansionist" }).click();
  const selectionNotice = page
    .getByTestId("game-notification")
    .filter({ hasText: "You are an EXPANSIONIST!" });
  await expect(selectionNotice).toHaveCount(1);
  await expect(selectionNotice).toHaveClass(/notification-warning/);
  await expect(selectionNotice).toHaveAttribute("data-classification", "special");

  await page.getByRole("tab", { name: "Research" }).click();
  await page.getByRole("tab", { name: "Philosophy" }).click();
  const philosophy = page.getByTestId("philosophy-pane");
  await expect(philosophy).toContainText("Expansionist");
  await expect(philosophy.locator('[data-philosophy-art="expansionist"]')).toBeVisible();
  await expect(selectionNotice).toBeHidden();
  await captureVisualCheckpoint(page, testInfo, "philosophy-selected-path-artwork");
  await philosophy
    .locator('[data-philosophy-ability="rapidExpansion"]')
    .getByRole("button", { name: philosophyText("en").abilityAction, exact: true })
    .click();
  const rapidExpansionNotice = page.getByTestId("game-notification").filter({
    hasText: "ABILITY: You now have a chance of capturing up to 3 nearby Systems for every 1!",
  });
  await expect(rapidExpansionNotice).toHaveCount(1);
  await expect(rapidExpansionNotice).toHaveClass(/notification-info/);
  await expect(rapidExpansionNotice).toHaveAttribute("data-classification", "tech");
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

test("returns focus to the star-study action after the philosophy choice @p16-focus", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build Space Telescope", exact: true }).click();
  const studyStars = page.getByRole("button", { name: "Study Stars", exact: true });
  await studyStars.click();
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "timer.complete", timerId: "survey:star-study" }),
    ),
  ).toBe(true);

  const choice = page.getByTestId("philosophy-choice");
  await expect(choice).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Choose your civilization's philosophy" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(choice).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Choose your civilization's philosophy" }),
  ).toBeFocused();
  expect(
    await page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        choicePending: state.run.philosophyChoicePending,
        philosophyId: state.permanent.philosophyId,
      };
    }),
  ).toEqual({ choicePending: true, philosophyId: null });

  await choice.getByRole("button", { name: "Expansionist", exact: true }).click();
  await expect(choice).toHaveCount(0);
  await expect(studyStars).toBeFocused();
});
