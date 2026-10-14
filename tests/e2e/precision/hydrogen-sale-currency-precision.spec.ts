import { expect, test } from "../_harness/fixtures";

async function startHydrogenSaleCurrencyFixture(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=hydrogen-sale-currency-tail");
  await page.getByLabel("Pioneer name").fill("Hydrogen Currency Precision Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}

test("P-41 formats a binary-tail Hydrogen sale preview and notice as currency @p41-currency-precision", async ({
  page,
}) => {
  await startHydrogenSaleCurrencyFixture(page);
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const hydrogen = state.run.goods.hydrogen;
  const rawProceeds = hydrogen.quantity * hydrogen.saleValue;
  expect(hydrogen.quantity).toBe(330);
  expect(hydrogen.saleValue).toBe(0.02);
  expect(rawProceeds).toBe(6.6000000000000005);
  expect(state.settings.notation).toBe("condensed");

  const salePreview = page.locator(".hydrogen-sale-controls .card-copy strong");
  await expect(salePreview).toHaveText("$6.60");
  await expect(salePreview).not.toContainText("6.6000000000000005");

  await page.getByRole("button", { name: "Sell", exact: true }).click();
  const saleNotice = page
    .getByTestId("notification-stack")
    .getByTestId("game-notification")
    .filter({ hasText: "You sold 330 Hydrogen" });
  await expect(saleNotice).toHaveCount(1, { timeout: 10_000 });
  await expect(saleNotice).toHaveText("You sold 330 Hydrogen for $6.60!");
  await expect(saleNotice).not.toContainText("6.6000000000000005");
});
