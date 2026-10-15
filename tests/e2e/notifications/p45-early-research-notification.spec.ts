import { expect, test } from "../_harness/fixtures";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { ECONOMY_BUILDING_NAMES } from "../../../src/content/economyBuildingNames";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { philosophyCompoundRecipe } from "../../../src/engine/philosophy";
import { formatNumber } from "../../../src/app/numberFormatting";
import { economyLabel, formatEconomyMessage } from "../../../src/i18n/economyMessages";
import { translate } from "../../../src/i18n/messages";
import { technologyNotificationText } from "../../../src/i18n/technologyNotificationMessages";

async function startEconomyFixture(
  page: import("@playwright/test").Page,
  fixture: "research" | "storage-all" | "water-storage-short",
  locale: LocaleId = "en",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=${locale}&economyFixture=${fixture}`);
  await page.getByLabel(translate(locale, "app.pioneer")).fill(`P-45 ${fixture} Pioneer`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function setLocale(page: import("@playwright/test").Page, locale: LocaleId): Promise<void> {
  await page.evaluate((nextLocale) => {
    window.miaplacidusTest!.dispatch({ type: "settings.update", patch: { locale: nextLocale } });
  }, locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test("first research completion notice uses the active locale @p45-early-research-notification @notifications", async ({
  page,
}) => {
  for (const locale of LOCALE_IDS) {
    await startEconomyFixture(page, "research", locale);
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-tech-tree").click();
    const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
    await expect(knowledgeSharing).toBeVisible();
    await expect(knowledgeSharing).toHaveAttribute("aria-disabled", "false");
    await knowledgeSharing.click();
    await expect(page.getByTestId("game-notification").last()).toHaveText(
      technologyNotificationText(
        locale,
        "knowledgeSharing",
        TECHNOLOGY_NAMES.knowledgeSharing[locale],
      ),
    );
  }
});
