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

test("Compound creation success feedback is rendered in all locales @p45-compound-result @compounds", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page, "full");
  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-diesel").click();

  const diesel = page.locator('#panel-compounds-diesel [data-compound-id="diesel"]');
  const autoCreateSection = diesel.locator(".compound-autobuyer-section");
  await autoCreateSection.locator("summary").click();
  const autoCreate = autoCreateSection.locator("input[type=checkbox]");
  if (await autoCreate.isChecked()) await autoCreate.uncheck();
  const notifications = page.getByTestId("notification-stack").getByTestId("game-notification");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    await expect(notifications).toHaveCount(0, { timeout: 20_000 });
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const recipe = philosophyCompoundRecipe(state, "diesel");
    const expectedParts = new Intl.ListFormat(locale, {
      style: "long",
      type: "conjunction",
    }).format(
      recipe.map(
        ({ goodId, amount }) =>
          `${formatNumber(locale, amount, 0, state.settings.notation)} ${economyGoodName(locale, goodId)}`,
      ),
    );
    const expectedNotice = formatEconomyMessage(locale, "compoundCreatedNotice", {
      amount: formatNumber(locale, 1, 0, state.settings.notation),
      compound: economyGoodName(locale, "diesel"),
      parts: expectedParts,
    });
    const before = {
      diesel: state.run.goods.diesel.quantity,
    };

    await diesel
      .getByRole("button", {
        name: `${economyLabel(locale, "create")} ${economyGoodName(locale, "diesel")}`,
        exact: true,
      })
      .click();

    const notice = notifications.filter({ hasText: expectedNotice }).last();
    await expect(notice).toHaveAttribute("data-classification", "create");
    await expect(notice).toHaveText(expectedNotice);
    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.run.goods.diesel.quantity).toBeCloseTo(before.diesel + 1, 8);
    for (const { goodId, amount } of recipe)
      expect(after.run.goods[goodId].quantity).toBeCloseTo(
        state.run.goods[goodId].quantity - amount,
        8,
      );
  }
});

test("Cosmic Forge textAuto reaches the Compound automatic-creation label in all locales @p7-text-auto @compounds @localization", async ({
  page,
}) => {
  await startEconomyFixture(page, "full");
  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-diesel").click();

  const diesel = page.locator('#panel-compounds-diesel [data-compound-id="diesel"]');
  const autoCreateSection = diesel.locator(".compound-autobuyer-section");
  const summary = autoCreateSection.locator("summary");
  if (!(await autoCreateSection.evaluate((element) => element.hasAttribute("open"))))
    await summary.click();
  const autoCreateLabel = autoCreateSection.locator("label.economy-toggle");

  for (const locale of LOCALE_IDS) {
    await setLocale(page, locale);
    const targetLabel = economyLabel(locale, "automaticCreation");
    expect(targetLabel.trim(), `${locale} automaticCreation should be populated`).not.toBe("");
    await expect(autoCreateLabel).toContainText(targetLabel);
  }
});
