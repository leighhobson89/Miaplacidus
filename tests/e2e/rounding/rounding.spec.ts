import { expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";

test("Water storage quote, exact affordability boundary, and charged amounts agree @rounding", async ({
  page,
}) => {
  await startEconomyFixture(page, "water-storage-short");
  await page.getByRole("tab", { name: /Compounds/ }).click();

  await page.locator("#tab-compounds-water").click();
  const water = page.locator('[data-compound-id="water"]');
  const storage = water.getByRole("button", { name: "Increase storage" });
  const quote = water.locator('[data-testid="storage-card-water"] .cost-line');
  await expect(quote).toContainText("99");
  await expect(quote).toContainText("30 Concrete");
  await expect(storage).toBeDisabled();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.concrete.quantity))
    .toBe(29);

  await page.locator("#tab-compounds-concrete").click();
  const concrete = page.locator('[data-compound-id="concrete"]');
  await concrete.getByRole("button", { name: "Create Concrete" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.concrete.quantity))
    .toBe(30);

  await page.locator("#tab-compounds-water").click();
  await expect(storage).toBeEnabled();
  await storage.click();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const goods = window.miaplacidusTest!.getState().run.goods;
        return {
          water: goods.water.quantity,
          waterCapacity: goods.water.storageCapacity,
          concrete: goods.concrete.quantity,
        };
      }),
    )
    .toEqual({ water: 0, waterCapacity: 200, concrete: 0 });
});
