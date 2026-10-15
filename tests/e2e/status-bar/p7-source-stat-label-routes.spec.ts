import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { topStatusText } from "../../../src/i18n/topStatusMessages";
import { translate } from "../../../src/i18n/messages";

test("routes Cosmic Forge HUD stat labels to localized status destinations @p7-source-stat-label-routes @status-bar @locale", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });

  for (const locale of LOCALE_IDS) {
    await page.goto(`/?testSeed=20261016&testLocale=${locale}&economyFixture=space-late-game`);
    await page.getByLabel(translate(locale, "app.pioneer")).fill(`P-7 HUD labels ${locale}`);
    await page.getByTestId("start-game").click();
    await expect(page.locator("[data-app-ready]")).toBeVisible();
    await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

    const localizedLabels = [
      ["top-stat-cash", "cash"],
      ["top-stat-energy", "energy"],
      ["top-stat-power", "powered"],
      ["top-stat-antimatter", "antimatter"],
      ["top-stat-ap", "ascendencyPointsShortLabel"],
    ] as const;
    for (const [testId, messageKey] of localizedLabels) {
      const stat = page.getByTestId(testId);
      await expect(stat).toBeVisible();
      await expect(stat.locator(".top-stat-label")).toHaveText(topStatusText(locale, messageKey));
    }

    const power = page.getByTestId("top-stat-power");
    await power.locator(".top-stat-value").focus();
    await expect(power.getByRole("tooltip")).toContainText(topStatusText(locale, "battery"));
    await power.locator(".top-stat-value").evaluate((element) => element.blur());
  }
});
