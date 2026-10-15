import { expect, test } from "../_harness/fixtures";
import {
  cash,
  expandMechanicsDetails,
  expectMechanicsTargetsAtLeast44px,
  goodCapacity,
  goodQuantity,
  startFullEconomyFixture,
} from "../_harness/economyMobileActions";
import { COMPOUND_IDS } from "../../../src/content/ids";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});

test("Compound actions meet target size and keyboard/touch reachability at 320px and 390px @p05-compound-actions @touch @keyboard", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await startFullEconomyFixture(page, "P-05 Compound Action Audit");
  await page.evaluate(() =>
    window.miaplacidusTest!.applyDebugAction("give-1m-all-resources-compounds"),
  );
  let targetCount = 0;

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator("#tab-compounds").tap();
    for (const id of COMPOUND_IDS) {
      await page.locator(`#tab-compounds-${id}`).tap();
      const panel = page.locator(`#panel-compounds-${id}`);
      const good = panel.locator(`[data-compound-id="${id}"]`);
      await expect(good).toBeVisible();
      await expandMechanicsDetails(good);
      targetCount += await expectMechanicsTargetsAtLeast44px(good, `${width}px Compound ${id}`);

      const autoCreate = good.locator(".compound-autobuyer-section .economy-toggle input");
      await autoCreate.focus();
      const wasChecked = await autoCreate.isChecked();
      await page.keyboard.press("Space");
      await expect(autoCreate).toBeChecked({ checked: !wasChecked });

      const saleSelect = good.locator(".hydrogen-sale-controls .card-controls select");
      await saleSelect.selectOption("1");
      const beforeSale = await cash(page);
      await good.locator(".hydrogen-sale-controls .card-controls .secondary-button").tap();
      await expect.poll(() => cash(page)).toBeGreaterThan(beforeSale);

      const amount = good.getByRole("spinbutton");
      await amount.fill("1");
      const beforeCreate = await goodQuantity(page, id);
      const create = good.locator(".compound-create-row .primary-button");
      await create.focus();
      await expect(create).toBeFocused();
      await page.keyboard.press("Enter");
      await expect.poll(() => goodQuantity(page, id)).toBeGreaterThan(beforeCreate);

      const storage = good.locator(".hydrogen-storage-card .card-controls button");
      if (await storage.isEnabled()) {
        const beforeStorage = await goodCapacity(page, id);
        await storage.tap();
        await expect.poll(() => goodCapacity(page, id)).toBeGreaterThan(beforeStorage);
      }

      const buyTier = good.locator(".economy-tier .text-button").first();
      if ((await buyTier.count()) && (await buyTier.isEnabled())) await buyTier.tap();
    }
  }

  expect(targetCount).toBeGreaterThan(80);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});
