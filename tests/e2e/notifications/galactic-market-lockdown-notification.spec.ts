import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

test("announces the Galactic Market lockdown when its child page is selected", async ({ page }) => {
  await startMetaFixture(page, "meta-market-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();

  const notice = page
    .locator('[data-testid="game-notification"]')
    .filter({ hasText: "Galactic Market is currently offline." });
  await page.getByRole("tab", { name: "Galactic Market" }).click();
  await expect(notice).toHaveCount(0);

  const accepted = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "galacticMarketLockdown",
    }),
  );
  expect(accepted).toBe(true);
  await page.getByRole("tab", { name: "Ascendency Perks" }).click();
  await page.getByRole("tab", { name: "Galactic Market" }).click();

  await expect(notice).toHaveCount(1, { timeout: 20_000 });
  await expect(notice).toHaveText("Galactic Market is currently offline.");
  await expect(notice).toHaveAttribute("data-classification", "special");
  await expect(notice).toHaveClass(/notification-warning/);
});
