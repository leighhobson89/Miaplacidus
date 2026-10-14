import { expect, test } from "../_harness/fixtures";

test("manual Compound creation shows one accepted-action notice and updates its balances @notifications @p08-compound-create", async ({ page }) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=full");
  await page.getByLabel("Pioneer name").fill("Compound Notice Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const notices = page.getByTestId("notification-stack").getByTestId("game-notification");
  await page.locator("#tab-settings").click();
  const notificationsToggle = page.locator("#settings-notifications");
  await expect(notificationsToggle).toBeChecked();
  await notificationsToggle.uncheck();
  await expect(notices).toHaveCount(0);
  await notificationsToggle.check();
  await expect(notificationsToggle).toBeChecked();

  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-diesel").click();
  const diesel = page.locator('[data-compound-id="diesel"]');
  await expect(diesel).toBeVisible();
  await diesel.locator(".compound-autobuyer-section > summary").click();
  const autoCreate = diesel.locator(".compound-autobuyer-section input[type=checkbox]");
  if (await autoCreate.isChecked()) await autoCreate.uncheck();

  await expect(notices).toHaveCount(0);
  const before = await page.evaluate(() => {
    const { goods } = window.miaplacidusTest!.getState().run;
    return { diesel: goods.diesel.quantity, hydrogen: goods.hydrogen.quantity, carbon: goods.carbon.quantity };
  });
  await diesel.getByRole("button", { name: "Create Diesel", exact: true }).click();

  await expect(notices).toHaveCount(1);
  const notice = notices.first();
  await expect(notice).toHaveAttribute("data-classification", "create");
  await expect(notice).toHaveClass(/notification-info/);
  await expect(notice).toHaveText("You created 1 Diesel from 26 Hydrogen and 12 Carbon");
  await expect
    .poll(() => page.evaluate(() => {
      const { goods } = window.miaplacidusTest!.getState().run;
      return { diesel: goods.diesel.quantity, hydrogen: goods.hydrogen.quantity, carbon: goods.carbon.quantity };
    }))
    .toEqual({ diesel: before.diesel + 1, hydrogen: before.hydrogen - 26, carbon: before.carbon - 12 });

  await page.waitForTimeout(100);
  await expect(notices).toHaveCount(1);
});

test("automatic Compound production stays silent @notifications @p08-compound-create", async ({ page }) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
      .filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=full");
  await page.getByLabel("Pioneer name").fill("Automatic Compound Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const notices = page.locator('[data-testid="game-notification"][data-classification="create"]');
  const startQuantity = await page.evaluate(() => window.miaplacidusTest!.getState().run.goods.diesel.quantity);
  const accepted = await page.evaluate(() => {
    const test = window.miaplacidusTest!;
    return [
      test.dispatch({ type: "economy.allocation.set", goodId: "hydrogen", cashShare: 0, compoundShare: 100, enabled: true }),
      test.dispatch({ type: "hydrogen.autobuyer.purchase" }),
      test.dispatch({ type: "hydrogen.autobuyer.toggle", enabled: true }),
      test.dispatch({ type: "economy.allocation.set", goodId: "carbon", cashShare: 0, compoundShare: 100, enabled: true }),
      test.dispatch({ type: "economy.autobuyer.purchase", goodId: "carbon", tier: 1 }),
      test.dispatch({ type: "economy.autobuyer.toggle", goodId: "carbon", tier: 1, enabled: true }),
      test.dispatch({ type: "economy.autoCreate.toggle", goodId: "diesel", enabled: true }),
    ];
  });
  expect(accepted).toEqual([true, true, true, true, true, true, true]);

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.diesel.quantity))
    .toBeGreaterThan(startQuantity);
  await expect(notices).toHaveCount(0);
});
