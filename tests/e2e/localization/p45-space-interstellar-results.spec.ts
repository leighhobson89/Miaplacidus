import { expect, test, type Page } from "../_harness/fixtures";
import { formatNumber } from "../../../src/app/numberFormatting";
import { createStarCatalogue } from "../../../src/content/starCatalogue";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { STAR_STUDY_TIMER_ID, VOID_PILLAGE_TIMER_ID } from "../../../src/content/space";
import type { GameState } from "../../../src/engine/state";
import { spaceNotificationText } from "../../../src/i18n/spaceNotificationMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";
import { starshipText } from "../../../src/i18n/starshipMessages";

async function startFixture(
  page: Page,
  fixture: "space-telescope" | "space-voidborn-pillage" | "space-starship-scanning",
  locale: LocaleId,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=${locale}&economyFixture=${fixture}`);
  await page.locator("#pioneer-name").fill(`P-45 Route Copy ${locale}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function completeTimer(page: Page, timerId: string): Promise<GameState> {
  const remainingMs = await page.evaluate((id) => {
    const state = window.miaplacidusTest!.getState();
    const timer = state.run.timers[id];
    if (!timer) throw new Error(`Missing active P-45 timer ${id}`);
    return Math.max(0, timer.durationMs - timer.elapsedMs);
  }, timerId);
  await page.evaluate(
    (milliseconds) => window.miaplacidusTest!.advanceBy(milliseconds + 1),
    remainingMs,
  );
  return page.evaluate(() => window.miaplacidusTest!.getState()) as Promise<GameState>;
}

test("Space Star Study and Void Pillage completion copy is rendered in all locales @p45-space-results", async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const locale of LOCALE_IDS) {
    await startFixture(page, "space-telescope", locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-telescope").click();
    await page
      .getByRole("button", { name: spaceText(locale, "telescopeBuild"), exact: true })
      .click();
    await page.getByRole("button", { name: spaceText(locale, "studyStars"), exact: true }).click();

    const studied = await completeTimer(page, STAR_STUDY_TIMER_ID);
    const feedback = page.getByTestId("space-feedback");
    await expect(feedback).toHaveText(
      spaceText(locale, "feedbackStudyComplete", {
        range: formatNumber(locale, studied.run.space.starStudyRange, 0, studied.settings.notation),
      }),
    );
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: spaceNotificationText(locale, "starStudyComplete") }),
    ).toHaveText(spaceNotificationText(locale, "starStudyComplete"));

    await startFixture(page, "space-voidborn-pillage", locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-telescope").click();
    await page.getByRole("button", { name: spaceText(locale, "pillageVoid"), exact: true }).click();
    await completeTimer(page, VOID_PILLAGE_TIMER_ID);
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: spaceNotificationText(locale, "voidPillageComplete") }),
    ).toContainText(spaceNotificationText(locale, "voidPillageComplete"));
  }
});

test("Interstellar scan completion notification and Colonise result are localized @p45-interstellar-results", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const locale of LOCALE_IDS) {
    await startFixture(page, "space-starship-scanning", locale);
    await page.locator("#tab-interstellar").click();
    await page.locator("#tab-interstellar-starship").click();
    const starship = page.getByTestId("starship-pane");
    const before = (await page.evaluate(() => window.miaplacidusTest!.getState())) as GameState;
    const destinationId = before.run.space.starship.destinationSystemId;
    expect(destinationId).not.toBeNull();
    const destinationName = createStarCatalogue().find((star) => star.id === destinationId)!.name;
    await starship.getByTestId("starship-scan-system-button").click();
    await expect(starship.getByTestId("starship-scan-complete")).toContainText(
      starshipText(locale, "scanComplete"),
    );
    await expect(
      page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({
          hasText: spaceNotificationText(locale, "starshipSystemScanned", {
            star: destinationName,
          }),
        }),
    ).toHaveText(spaceNotificationText(locale, "starshipSystemScanned", { star: destinationName }));

    const scanned = (await page.evaluate(() => window.miaplacidusTest!.getState())) as GameState;
    const encounter = scanned.run.space.systemEncounters.find(
      (item) => item.systemId === destinationId,
    );
    expect(encounter).toBeDefined();
    await page.locator("#tab-interstellar-colonise").click();
    const report = starship.getByTestId("starship-colonise-scan-report");
    await expect(report.getByTestId("starship-system-scan-results")).toHaveText(
      starshipText(locale, encounter!.lifeDetected ? "lifeDetected" : "noLifeDetected"),
    );
    await expect(report).not.toContainText("???");
  }
});
