import { expect, test } from "../_harness/fixtures";
import { STAR_STUDY_TIMER_ID } from "../../../src/content/space";
import type { LocaleId } from "../../../src/content/ids";
import { spaceNotificationText } from "../../../src/i18n/spaceNotificationMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";

test("announces Star Study completion while another tab is selected @space-telescope @p20-announcements", async ({
  page,
}) => {
  const locale: LocaleId = "de";
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=${locale}&economyFixture=space-telescope`);
  await page.locator("#pioneer-name").fill("Star Study Cross Tab Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  await page.locator("#tab-space-mining").click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: spaceText(locale, "telescopeBuild") }).click();
  await page.getByRole("button", { name: spaceText(locale, "studyStars") }).click();

  const beforeCompletion = await page.evaluate((timerId) => {
    const state = window.miaplacidusTest!.getState();
    const timer = state.run.timers[timerId];
    return {
      remainingMs: timer ? Math.max(0, timer.durationMs - timer.elapsedMs) : null,
      starStudyRange: state.run.space.starStudyRange,
    };
  }, STAR_STUDY_TIMER_ID);
  expect(beforeCompletion.remainingMs).not.toBeNull();

  const hydrogenTab = page.locator("#tab-hydrogen");
  await hydrogenTab.click();
  await expect(hydrogenTab).toHaveAttribute("aria-selected", "true");
  await page.evaluate(
    (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
    beforeCompletion.remainingMs!,
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBeNull();

  const afterCompletion = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.starStudyRange,
  );
  expect(afterCompletion).toBeGreaterThan(beforeCompletion.starStudyRange);
  await expect(hydrogenTab).toHaveAttribute("aria-selected", "true");

  const notificationRegion = page.getByTestId("notification-stack");
  const completionNotice = notificationRegion
    .getByRole("status")
    .filter({ hasText: spaceNotificationText(locale, "starStudyComplete") });
  await expect(notificationRegion).toHaveAttribute("aria-live", "polite");
  await expect(completionNotice).toHaveCount(1);
  await expect(completionNotice).toHaveAttribute("aria-atomic", "true");
  await expect(completionNotice).toHaveText(spaceNotificationText(locale, "starStudyComplete"));
});
