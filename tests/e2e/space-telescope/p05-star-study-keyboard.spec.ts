import { expect, test } from "../_harness/fixtures";
import { STAR_STUDY_TIMER_ID } from "../../../src/content/space";
import { spaceText } from "../../../src/i18n/spaceMessages";

async function startSpaceTelescopeFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Star Study Keyboard Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("keyboard users can start Star Study from the adjacent survey control @p05-star-study-keyboard", async ({
  page,
}) => {
  await startSpaceTelescopeFixture(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: spaceText("en", "telescopeBuild") }).click();

  const scan = page.locator("#space-scan-asteroids");
  const study = page.locator("#telescope-study-stars");
  await expect(scan).toBeEnabled();
  await scan.focus();
  await expect(scan).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(study).toBeFocused();
  expect(await study.evaluate((button) => button.matches(":focus-visible"))).toBe(true);
  const target = await study.boundingBox();
  expect(target?.width).toBeGreaterThanOrEqual(44);
  expect(target?.height).toBeGreaterThanOrEqual(44);

  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await page.keyboard.press("Enter");
  await expect(study).toBeDisabled();
  await expect(page.getByTestId("space-survey-status")).toHaveText(
    spaceText("en", "surveyStudying"),
  );
  await expect(
    page.getByRole("progressbar", {
      name: spaceText("en", "surveyStudying"),
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByTestId("space-survey-countdown")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate((timerId) => {
        const state = window.miaplacidusTest!.getState();
        return {
          activeSurvey: state.run.space.activeSurvey,
          timerStatus: state.run.timers[timerId]?.status,
        };
      }, STAR_STUDY_TIMER_ID),
    )
    .toEqual({ activeSurvey: "stars", timerStatus: "running" });
  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.run.space.starStudyRange).toBe(before.run.space.starStudyRange);
});
