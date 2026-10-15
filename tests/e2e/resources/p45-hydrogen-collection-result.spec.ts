import { expect, test } from "../_harness/fixtures";
import { economyGoodName, economyGoodPageTitle } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { COMPOUND_IDS, LOCALE_IDS, MATERIAL_IDS, type LocaleId } from "../../../src/content/ids";
import { displayCurrency } from "../../../src/engine/precision";
import { selectGoodSale } from "../../../src/engine/selectors";
import { economyLabel, formatEconomyMessage } from "../../../src/i18n/economyMessages";
import { economyActionHelp } from "../../../src/i18n/economyActionHelpMessages";
import { translate } from "../../../src/i18n/messages";
import { philosophyCompoundRecipe } from "../../../src/engine/philosophy";

async function startEconomyFixture(
  page: import("@playwright/test").Page,
  fixture: "storage-all" | "full" | "bulk-hydrogen" = "storage-all",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel(translate("en", "app.pioneer")).fill("P-45 Resource Compound Copy");
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

test("manual Hydrogen collection updates the visible stock in all locales @p45-hydrogen-collection-result @resources", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page, "bulk-hydrogen");
  await page.locator("#tab-hydrogen").click();
  await page.locator("#tab-resources-hydrogen").click();

  const hydrogen = page.locator("#panel-resources-hydrogen");
  const stock = hydrogen.getByTestId("hydrogen-quantity");
  const rate = hydrogen.getByTestId("hydrogen-rate");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const before = state.run.goods.hydrogen.quantity;
    const rateBefore = await rate.textContent();
    const collect = hydrogen.getByRole("button", {
      name: translate(locale, "hydrogen.collect"),
      exact: true,
    });
    await expect(collect).toBeEnabled();
    await expect(stock).toContainText(formatNumber(locale, before, 2, state.settings.notation));

    await collect.click();
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity),
      )
      .toBe(before + 1);
    await expect(stock).toContainText(formatNumber(locale, before + 1, 2, state.settings.notation));
    expect(await rate.textContent()).toBe(rateBefore);
  }
});
