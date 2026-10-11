import { expect, test } from "../_harness/fixtures";

test("visited inactive tabs refresh on return without rendering on every simulation update @performance", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=314159&testLocale=en&economyFixture=multipliers");
  await page.getByLabel("Pioneer name").fill("Inactive Tab Render Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();

  const hydrogenQuantity = page.getByTestId("hydrogen-quantity");
  const hydrogenRailQuantity = page
    .getByTestId("resource-rail-hydrogen")
    .locator(".resource-item-copy small");
  const runTime = page.locator('[data-testid="top-stat-time"] .top-stat-value');
  const initialText = await hydrogenQuantity.innerText();
  const initialRailText = await hydrogenRailQuantity.textContent();
  const initialRunTime = await runTime.innerText();
  const initialStateQuantity = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
  );

  await page.locator("#tab-miaplaedia").click();
  const hiddenRailText = await hydrogenRailQuantity.textContent();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(300_000));
  const updatedStateQuantity = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
  );
  expect(updatedStateQuantity).toBeGreaterThan(initialStateQuantity);
  await expect(hydrogenQuantity).toHaveText(initialText);
  await expect(page.getByTestId("resource-rail")).toBeHidden();
  expect(await hydrogenRailQuantity.textContent()).toBe(hiddenRailText);
  await expect.poll(() => runTime.innerText()).not.toBe(initialRunTime);

  await page.locator("#tab-hydrogen").click();
  await expect.poll(() => hydrogenQuantity.innerText()).not.toBe(initialText);
  await expect.poll(() => hydrogenRailQuantity.textContent()).not.toBe(initialRailText);
});
