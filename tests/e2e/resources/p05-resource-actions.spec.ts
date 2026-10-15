import { expect, test } from "../_harness/fixtures";
import {
  cash,
  expandMechanicsDetails,
  expectMechanicsTargetsAtLeast44px,
  goodCapacity,
  goodQuantity,
  startFullEconomyFixture,
} from "../_harness/economyMobileActions";
import { COMPOUND_IDS, MATERIAL_IDS } from "../../../src/content/ids";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});

test("Resource actions meet target size and keyboard/touch reachability at 320px and 390px @p05-resource-actions @touch @keyboard", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await startFullEconomyFixture(page, "P-05 Resource Action Audit");
  await page.evaluate((compoundIds) => {
    const game = window.miaplacidusTest!;
    for (const goodId of compoundIds)
      game.dispatch({ type: "economy.autoCreate.toggle", goodId, enabled: false });
    game.applyDebugAction("give-1m-all-resources-compounds");
  }, [...COMPOUND_IDS]);
  let targetCount = 0;

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-hydrogen").tap();

    for (const id of MATERIAL_IDS) {
      await page.locator(`#tab-resources-${id}`).tap();
      const panel = page.locator(`#panel-resources-${id}`);
      const good = id === "hydrogen" ? panel : panel.locator(`[data-resource-id="${id}"]`);
      await expect(good).toBeVisible();
      await expandMechanicsDetails(good);
      targetCount += await expectMechanicsTargetsAtLeast44px(good, `${width}px Resource ${id}`);

      const saleSelect = good.locator(".hydrogen-sale-controls .card-controls select");
      await saleSelect.selectOption("1");
      const beforeSale = await cash(page);
      await good.locator(".hydrogen-sale-controls .card-controls .secondary-button").tap();
      await expect.poll(() => cash(page)).toBeGreaterThan(beforeSale);

      const collect = good.locator(".collect-button");
      const beforeCollect = await goodQuantity(page, id);
      await collect.focus();
      await expect(collect).toBeFocused();
      await page.keyboard.press("Enter");
      await expect.poll(() => goodQuantity(page, id)).toBeGreaterThan(beforeCollect);

      const storage = good.locator(".hydrogen-storage-card .card-controls button");
      if (await storage.isEnabled()) {
        const beforeStorage = await goodCapacity(page, id);
        await storage.tap();
        await expect.poll(() => goodCapacity(page, id)).toBeGreaterThan(beforeStorage);
      }

      const buyTier = good.locator(".resource-autobuyer-tiers .economy-tier .text-button").first();
      if ((await buyTier.count()) && (await buyTier.isEnabled())) {
        await buyTier.tap();
        const tierToggle = good
          .locator(".resource-autobuyer-tiers .economy-tier button[aria-pressed]")
          .first();
        await expect(tierToggle).toBeVisible();
        const wasPressed = await tierToggle.getAttribute("aria-pressed");
        await tierToggle.focus();
        await page.keyboard.press("Enter");
        await expect(tierToggle).toHaveAttribute(
          "aria-pressed",
          wasPressed === "true" ? "false" : "true",
        );
      }

      const fusion = good.locator(".resource-fusion-panel .economy-controls > button");
      if (await fusion.count()) {
        await good.locator(".resource-fusion-panel input[type=number]").fill("2");
        if (await fusion.isEnabled()) {
          const beforeFusion = await goodQuantity(page, id);
          await fusion.focus();
          await page.keyboard.press("Enter");
          await expect.poll(() => goodQuantity(page, id)).toBeLessThan(beforeFusion);
        }
      }

      const allocation = good.locator("details").filter({ hasText: "Production allocation" });
      if (await allocation.count()) {
        const cashHandle = allocation.getByRole("slider", { name: "Cash share (%)" });
        const oldValue = Number(await cashHandle.getAttribute("aria-valuenow"));
        await cashHandle.focus();
        await page.keyboard.press("ArrowRight");
        await expect(cashHandle).toHaveAttribute("aria-valuenow", String(oldValue + 5));
      }
    }
  }

  expect(targetCount).toBeGreaterThan(120);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});
