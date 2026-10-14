import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { displayCurrency } from "../../../src/engine/precision";
import { marketText } from "../../../src/i18n/metaMessages";

test("P-45 Galactic Market AP sale results render in all locales @p45-market-ap-sale", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-market-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-market").click();

  const market = page.locator(".galactic-market-pane");
  const sale = market.locator(".upgrade-card").nth(1);
  const feedback = market.locator(".live-feedback");
  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    const quantity = 1;
    const price = before.permanent.galacticMarket.apSellPrice;
    expect(
      before.permanent.ascendencyPoints,
      `${locale} sale affordability`,
    ).toBeGreaterThanOrEqual(quantity);
    const expectedPayout = formatCurrency(
      locale,
      Number(displayCurrency(quantity * price)),
      before.settings.currencyId ?? "usd",
      0,
      before.settings.notation,
    );

    await sale.getByLabel(marketText(locale, "sellAp")).selectOption(String(quantity));
    await expect(sale.locator(".card-copy > p").nth(1)).toContainText(expectedPayout);
    const sellButton = sale.getByRole("button", {
      name: marketText(locale, "sellApAction"),
      exact: true,
    });
    await expect(sellButton).toBeEnabled();
    await sellButton.click();

    await expect
      .poll(() =>
        page.evaluate(() => {
          const state = window.miaplacidusTest!.getState();
          return {
            ascendencyPoints: state.permanent.ascendencyPoints,
            cash: state.run.cash,
          };
        }),
      )
      .toEqual({
        ascendencyPoints: before.permanent.ascendencyPoints - quantity,
        cash: before.run.cash + quantity * price,
      });
    await expect(feedback).toHaveText(
      `${formatNumber(locale, quantity, 0, before.settings.notation)} AP · ${expectedPayout}`,
    );
  }
});
