import { expect, test, type Locator, type Page } from "../_harness/fixtures";
import { COMPOUND_IDS, MATERIAL_IDS } from "../../../src/content/ids";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2.625,
  isMobile: true,
  hasTouch: true,
});

async function startFullEconomyFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=storage-all");
  await page.getByLabel("Pioneer name").fill("P-05 Economy Action Audit");
  await page.getByTestId("start-game").tap();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function expandMechanicsDetails(container: Locator): Promise<void> {
  const closed = container.locator("details:not([open]) > summary:visible");
  while ((await closed.count()) > 0) await closed.first().tap();
}

async function expectMechanicsTargetsAtLeast44px(
  container: Locator,
  label: string,
): Promise<number> {
  const documentBounds = await container.evaluate((element) => ({
    documentWidth: element.ownerDocument.documentElement.scrollWidth,
    viewportWidth: element.ownerDocument.defaultView?.innerWidth ?? 0,
  }));
  expect(
    documentBounds.documentWidth,
    `${label} document width should fit its viewport`,
  ).toBeLessThanOrEqual(documentBounds.viewportWidth);
  const targets = await container
    .locator(
      "button:visible, select:visible, input[type=number]:visible, summary:visible, [role=slider]:visible, .economy-toggle:visible",
    )
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          label:
            node.getAttribute("aria-label") ??
            node.textContent?.trim().replace(/\s+/g, " ").slice(0, 42) ??
            node.tagName,
          className: typeof node.className === "string" ? node.className : "",
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
        };
      }),
    );
  for (const target of targets) {
    expect(
      target.width,
      `${label} ${target.className || target.label} hit area width`,
    ).toBeGreaterThanOrEqual(44);
    expect(
      target.height,
      `${label} ${target.className || target.label} hit area height`,
    ).toBeGreaterThanOrEqual(44);
  }
  return targets.length;
}

async function goodQuantity(page: Page, id: string): Promise<number> {
  return page.evaluate(
    (goodId) => window.miaplacidusTest!.getState().run.goods[goodId]!.quantity,
    id,
  );
}

async function cash(page: Page): Promise<number> {
  return page.evaluate(() => window.miaplacidusTest!.getState().run.cash);
}

async function goodCapacity(page: Page, id: string): Promise<number> {
  return page.evaluate(
    (goodId) => window.miaplacidusTest!.getState().run.goods[goodId]!.storageCapacity,
    id,
  );
}

test("Resource and Compound actions meet target size and keyboard/touch reachability at 320px and 390px @p05-economy-actions @touch @keyboard", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await startFullEconomyFixture(page);
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

    await page.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("give-1m-all-resources-compounds"),
    );
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

  expect(targetCount).toBeGreaterThan(200);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
});
