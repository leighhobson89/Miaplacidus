import { expect, test } from "../_harness/fixtures";

test("notifies one localized Hydrogen sale and respects the notification setting @notifications", async ({
  freshGame,
}) => {
  const game = freshGame;
  const quantity = game.getByTestId("hydrogen-quantity");
  const salePreview = game.locator(".hydrogen-sale-controls .card-copy strong");
  const collect = game.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  const notices = game.getByTestId("notification-stack").getByTestId("game-notification");

  // Keep the sale on the ordinary localized Hydrogen controls.
  for (let unit = 0; unit < 3; unit += 1) await collect.click();
  await expect(quantity).toContainText("3");
  const displayedQuantity = (await quantity.innerText()).trim().split(/\s+/)[0]!;
  const displayedCash = (await salePreview.innerText()).trim();
  await expect(salePreview).toHaveText("$0.06");
  await expect(notices).toHaveCount(0);

  await game.getByRole("button", { name: "Sell", exact: true }).click();

  await expect(quantity).toContainText("0");
  await expect(notices).toHaveCount(1);
  const saleNotice = notices.first();
  await expect(saleNotice).toContainText(/sold/i);
  await expect(saleNotice).toContainText(displayedQuantity);
  await expect(saleNotice).toContainText(displayedCash);

  // Disabling notifications clears the first notice and suppresses the next sale notice.
  await game.locator("#tab-settings").click();
  const notificationsToggle = game.getByRole("checkbox", { name: "Notifications", exact: true });
  await expect(notificationsToggle).toBeChecked();
  await notificationsToggle.uncheck();
  await expect(notificationsToggle).not.toBeChecked();
  await expect
    .poll(() =>
      game.evaluate(() => window.miaplacidusTest!.getState().settings.notificationsEnabled),
    )
    .toBe(false);
  await expect(notices).toHaveCount(0);

  await game.locator("#tab-hydrogen").click();
  await expect(
    game.getByRole("heading", { name: "Hydrogen", exact: true, level: 2 }),
  ).toBeVisible();
  for (let unit = 0; unit < 2; unit += 1) await collect.click();
  await expect(quantity).toContainText("2");
  const cashBeforeSecondSale = await game.evaluate(
    () => window.miaplacidusTest!.getState().run.cash,
  );

  await game.getByRole("button", { name: "Sell", exact: true }).click();

  await expect(quantity).toContainText("0");
  await expect
    .poll(() => game.evaluate(() => window.miaplacidusTest!.getState().run.cash))
    .toBeGreaterThan(cashBeforeSecondSale);
  await expect(notices).toHaveCount(0);
});
