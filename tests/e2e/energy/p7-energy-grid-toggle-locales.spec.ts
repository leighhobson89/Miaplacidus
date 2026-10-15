import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { translate } from "../../../src/i18n/messages";

async function startBulkEnergyFixture(
  page: import("@playwright/test").Page,
  locale: (typeof LOCALE_IDS)[number],
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261016&testLocale=${locale}&economyFixture=bulk-energy`);
  await page.getByLabel(translate(locale, "app.pioneer")).fill(`P-7 Energy Grid Toggle ${locale}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("Cosmic Forge grid power labels follow the selected locale @p7-energy-grid-toggle-locales @energy @locale", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const locale of LOCALE_IDS) {
    await startBulkEnergyFixture(page, locale);
    await page.locator("#tab-energy").click();
    await page.locator("#tab-energy-power").click();

    const gridToggle = page.getByTestId("economy-energy").locator(".energy-master-switch");
    await expect(gridToggle).toHaveText(economyLabel(locale, "deactivatePower"));
    await gridToggle.click();
    await expect(gridToggle).toHaveText(economyLabel(locale, "activatePower"));
    await gridToggle.click();
    await expect(gridToggle).toHaveText(economyLabel(locale, "deactivatePower"));
  }
});
