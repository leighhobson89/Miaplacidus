import { expect, test } from "../_harness/fixtures";
import { SCIENCE_BUILDINGS } from "../../../src/content/economy";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import type { GameState } from "../../../src/engine/state";
import { formatNumber } from "../../../src/app/numberFormatting";
import { researchActionHelp } from "../../../src/i18n/researchActionHelpMessages";
import { translate } from "../../../src/i18n/messages";

/** Phase 7 selected-locale route coverage. AUTHORED, NOT RUN. */
async function startResearchFixture(
  page: import("@playwright/test").Page,
  locale: LocaleId,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261016&testLocale=${locale}&economyFixture=research`);
  await page.getByLabel(translate(locale, "app.pioneer")).fill(`P-7 Research Help ${locale}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("Science Kit, Science Club, and Science Lab help use the selected locale @p7-locale @research", async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const locale of LOCALE_IDS) {
    await startResearchFixture(page, locale);
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-science-buildings").click();

    const buildings = page.locator("#panel-research-science-buildings");
    await expect(buildings).toBeVisible();

    for (const buildingId of ["scienceKit", "scienceClub"] as const) {
      const expectedHelp = researchActionHelp(locale, buildingId);
      expect(expectedHelp.trim(), `${locale} ${buildingId} source help`).not.toBe("");
      await expect(
        buildings.locator(`[data-building-id="${buildingId}"] .economy-action-description`),
      ).toHaveText(expectedHelp);
    }

    const state = (await page.evaluate(() =>
      window.miaplacidusTest!.getState(),
    )) as GameState;
    const scienceLabHelp = researchActionHelp(locale, "scienceLab");
    expect(scienceLabHelp.trim(), `${locale} Science Lab source help`).not.toBe("");
    const livePowerRate = formatNumber(
      locale,
      SCIENCE_BUILDINGS.scienceLab.energyPerSecond,
      2,
      state.settings.notation,
    );
    const expectedScienceLabHelp = `${scienceLabHelp} ${livePowerRate} kJ / s`;
    await expect(
      buildings.locator('[data-building-id="scienceLab"] .economy-action-description'),
    ).toHaveText(expectedScienceLabHelp);
  }
});
