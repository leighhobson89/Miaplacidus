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

test("compound storage shortfall is localized for the first Water purchase @p45-economy-shortfall-locale @compounds", async ({
  page,
}) => {
  await startEconomyFixture(page, "water-storage-short");
  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-water").click();
  const water = page.locator('#panel-compounds-water [data-compound-id="water"]');
  const storage = water.locator(".hydrogen-storage-card");
  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const concreteName = economyGoodName(locale, "concrete");
    const storageButton = storage.getByRole("button", {
      name: economyLabel(locale, "increaseStorage"),
    });
    await expect(storageButton).toBeDisabled();
    const describedBy = await storageButton.getAttribute("aria-describedby");
    expect(describedBy, `${locale} disabled storage action description`).toBeTruthy();
    const reasonId = describedBy?.split(/\s+/).at(-1);
    expect(reasonId, `${locale} storage reason is associated with its action`).toBe(
      "good-water-storage-reason",
    );
    const reason = storage.locator(`#${reasonId}`);
    await expect(reason).toHaveText(
      formatEconomyMessage(locale, "needGoodAmount", { amount: "30", good: concreteName }),
    );
    await expect(storage.locator(".cost-line")).toContainText(concreteName);
    await expect(water).not.toContainText("???");
  }
});
