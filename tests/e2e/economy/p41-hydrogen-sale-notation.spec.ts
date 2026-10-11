import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { selectGoodSale } from "../../../src/engine/selectors";

async function startHydrogenSaleFixture(page: Page): Promise<void> {
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("P-41 Hydrogen Sale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}

test("P-41 formats the Hydrogen sale preview and accepted sale notice in every notation @p41-hydrogen-sale-notation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });

  const renderedPayouts: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await startHydrogenSaleFixture(page);
    await setNumberNotation(page, notation);

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const sale = selectGoodSale(state, "hydrogen", "all");
    expect(sale.amount).toBe(1_000_000);
    const expectedCash = formatCurrency(
      "en",
      sale.proceeds,
      state.settings.currencyId ?? "usd",
      2,
      notation,
    );
    const preview = page.locator(".hydrogen-sale-controls:visible .card-copy strong");
    await expect(preview).toHaveText(expectedCash);
    renderedPayouts[notation] = expectedCash;

    await page.getByRole("button", { name: "Sell", exact: true }).click();
    const expectedAmount = formatNumber("en", sale.amount, 2, notation);
    const notice = page
      .getByTestId("notification-stack")
      .getByTestId("game-notification")
      .filter({ hasText: "You sold" });
    await expect(notice).toHaveText(`You sold ${expectedAmount} Hydrogen for ${expectedCash}!`);
    expect(
      (await page.evaluate(() => window.miaplacidusTest!.getState())).run.goods.hydrogen.quantity,
    ).toBe(0);
  }

  expect(renderedPayouts.condensed).not.toBe(renderedPayouts.standard);
  expect(renderedPayouts.scientific).not.toBe(renderedPayouts.standard);
});
