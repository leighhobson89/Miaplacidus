import { expect, test, type Page } from "../_harness/fixtures";
import { createStarCatalogue } from "../../../src/content/starCatalogue";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { megastructureText } from "../../../src/i18n/megastructureMessages";
import { translate } from "../../../src/i18n/messages";
import {
  SPACE_NOTIFICATION_MESSAGES,
  spaceNotificationText,
} from "../../../src/i18n/spaceNotificationMessages";

type ArrivalFixture = "space-starship-o-arrival" | "space-starship-factory-arrival";

async function startArrivalFixture(
  page: Page,
  fixture: ArrivalFixture,
  locale: LocaleId,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=${locale}&economyFixture=${fixture}`);
  await page.getByLabel(translate(locale, "app.pioneer")).fill("Arrival Narrative Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function finishFixtureVoyage(page: Page) {
  const destinationId = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
  );
  if (!destinationId) throw new Error("Arrival narrative fixture has no starship destination.");
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  return createStarCatalogue().find((star) => star.id === destinationId)!;
}

test("shows the source-backed O-type and factory-star narratives at arrival in all locales @p44-arrival-narratives", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });

  for (const locale of LOCALE_IDS) {
    await test.step(`${locale}: O-type arrival`, async () => {
      await startArrivalFixture(page, "space-starship-o-arrival", locale);
      const destination = await finishFixtureVoyage(page);
      expect(destination.starType).toBe("O");
      const notice = page.locator(
        '[data-testid="game-notification"][data-classification="starshipNarrative"]',
      );
      const expected = `${SPACE_NOTIFICATION_MESSAGES[locale].oTypeStarReachedHeader}\n\n${spaceNotificationText(locale, "oTypeStarReachedText", { star: destination.name })}`;
      await expect(notice).toHaveText(expected);
      await expect(notice).toHaveAttribute("aria-atomic", "true");
      await expect(page.getByTestId("notification-stack")).toHaveAttribute("aria-live", "polite");
      const scrollState = await notice.evaluate((element) => ({
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        pointerEvents: getComputedStyle(element).pointerEvents,
      }));
      expect(scrollState.scrollHeight).toBeGreaterThan(scrollState.clientHeight);
      expect(scrollState.pointerEvents).toBe("auto");
      await notice.hover();
      await page.mouse.wheel(0, 500);
      await expect.poll(() => notice.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 320);
    });

    await test.step(`${locale}: factory-star arrival`, async () => {
      await startArrivalFixture(page, "space-starship-factory-arrival", locale);
      const destination = await finishFixtureVoyage(page);
      expect(destination.name).toBe("Sirius");
      const notice = page.locator(
        '[data-testid="game-notification"][data-classification="starshipNarrative"]',
      );
      const expected = `MEGASTRUCTURE\n\n${spaceNotificationText(locale, "factoryStarReachedText", {
        star: destination.name,
        structure: megastructureText(locale).structureNames.dysonSphere,
      })}`;
      await expect(notice).toHaveText(expected);
      await expect(notice).toHaveAttribute("aria-atomic", "true");
      await expect(page.getByTestId("notification-stack")).toHaveAttribute("aria-live", "polite");
      await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 320);
    });
  }
});
