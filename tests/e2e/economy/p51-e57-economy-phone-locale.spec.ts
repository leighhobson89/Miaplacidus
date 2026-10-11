import type { Locator, Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { COMPOUND_IDS, LOCALE_IDS, MATERIAL_IDS } from "../../../src/content/ids";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { setGameLocale } from "../_harness/settings-controls";

const PHONE_320 = { width: 320, height: 740 } as const;
const PHONE_390 = { width: 390, height: 844 } as const;
type PhoneViewport = typeof PHONE_320 | typeof PHONE_390;

async function startEconomyFixture(
  page: Page,
  locale: string,
  fixture: "storage-all" | "water-storage-short",
  viewport: PhoneViewport,
): Promise<void> {
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261009&testLocale=${locale}&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("P-51 Economy Phone Review");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function expectInsidePhone(
  element: Locator,
  description: string,
  viewportWidth: number,
): Promise<void> {
  const bounds = await element.boundingBox();
  expect(bounds, `${description} has rendered bounds`).not.toBeNull();
  expect(bounds!.x, `${description} stays inside the left edge`).toBeGreaterThanOrEqual(-1);
  expect(
    bounds!.x + bounds!.width,
    `${description} stays inside the right edge`,
  ).toBeLessThanOrEqual(viewportWidth + 1);
}

async function expectDocumentFits(
  page: Page,
  description: string,
  viewportWidth: number,
): Promise<void> {
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width, `${description} document width`).toBeLessThanOrEqual(viewportWidth);
}

async function expectNoPageTooltipOrModal(panel: Locator, description: string): Promise<void> {
  await expect(
    panel.locator('[role="tooltip"]:visible'),
    `${description} visible tooltips`,
  ).toHaveCount(0);
  await expect(
    panel.locator('dialog:visible, [role="dialog"]:visible'),
    `${description} visible modals`,
  ).toHaveCount(0);
}

async function expandAllEconomyDetails(container: Locator): Promise<void> {
  const closed = container.locator("details:not([open]) > summary:visible");
  while ((await closed.count()) > 0) await closed.first().click();
}

async function reviewEconomyRowsAtWidth(
  page: Page,
  testInfo: TestInfo,
  viewport: PhoneViewport,
): Promise<void> {
  const width = viewport.width;
  const captureSuffix = width === 320 ? "phone" : "390px";
  await startEconomyFixture(page, "en", "storage-all", viewport);

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    await page.locator("#tab-hydrogen").click();
    for (const id of MATERIAL_IDS) {
      const tab = page.locator(`#tab-resources-${id}`);
      await tab.click();
      await expect(tab, `${locale} ${id} selected`).toHaveAttribute("aria-selected", "true");

      const panel = page.locator(`#panel-resources-${id}`);
      const resource = id === "hydrogen" ? panel : panel.locator(`[data-resource-id="${id}"]`);
      await expect(panel, `${locale} ${id} panel`).toBeVisible();
      await expect(resource.locator(".pane-heading h2")).toHaveText(economyGoodName(locale, id));
      await expect(resource.locator(".hydrogen-hero")).toBeVisible();
      await expect(resource.locator(".hydrogen-storage-card .cost-line")).toBeVisible();
      await expect(resource.locator(".hydrogen-sale-controls .card-copy strong")).toBeVisible();
      await expect(resource.locator(".collect-button")).toBeVisible();
      await expect(
        resource.locator(".hydrogen-sale-controls > .card-controls > button"),
      ).toBeVisible();
      await expectNoPageTooltipOrModal(panel, `${locale} ${id}`);
      await expandAllEconomyDetails(resource);
      await expect(resource.locator(".economy-tier").first()).toBeVisible();

      await expectInsidePhone(resource.locator(".hydrogen-hero"), `${locale} ${id} hero`, width);
      await expectInsidePhone(
        resource.locator(".hydrogen-storage-card"),
        `${locale} ${id} storage row`,
        width,
      );
      await expectInsidePhone(
        resource.locator(".hydrogen-storage-card .cost-line"),
        `${locale} ${id} storage cost`,
        width,
      );
      await expectInsidePhone(
        resource.locator(".hydrogen-storage-card .card-controls button"),
        `${locale} ${id} storage action`,
        width,
      );
      await expectInsidePhone(
        resource.locator(".hydrogen-sale-controls"),
        `${locale} ${id} sale row`,
        width,
      );
      const resourceTierCount = await resource.locator(".economy-tier").count();
      for (let tier = 0; tier < resourceTierCount; tier += 1) {
        await expectInsidePhone(
          resource.locator(".economy-tier").nth(tier),
          `${locale} ${id} Autobuyer tier ${tier + 1}`,
          width,
        );
        const tierActions = resource.locator(".economy-tier").nth(tier).locator(".text-button");
        for (let action = 0; action < (await tierActions.count()); action += 1) {
          await expectInsidePhone(
            tierActions.nth(action),
            `${locale} ${id} Autobuyer tier ${tier + 1} action ${action + 1}`,
            width,
          );
        }
      }
      const allocation = resource.locator(".allocation-slider-group");
      if ((await allocation.count()) > 0)
        await expectInsidePhone(allocation, `${locale} ${id} allocation controls`, width);
      await expectDocumentFits(page, `${locale} ${id} Resource`, width);

      const saleSelect = resource.locator(".hydrogen-sale-controls > .card-controls > select");
      const salePreview = resource.locator(".hydrogen-sale-controls .card-copy strong");
      await saleSelect.selectOption("all");
      const allUnitsPreview = await salePreview.textContent();
      await saleSelect.selectOption("1");
      await expect(salePreview).not.toHaveText(allUnitsPreview ?? "");

      if (id === "silicon") {
        await captureVisualCheckpoint(
          page,
          testInfo,
          `p51-e57-resource-silicon-${locale}-${captureSuffix}`,
        );
      }
    }

    await page.locator("#tab-compounds").click();
    for (const id of COMPOUND_IDS) {
      const tab = page.locator(`#tab-compounds-${id}`);
      await tab.click();
      await expect(tab, `${locale} ${id} selected`).toHaveAttribute("aria-selected", "true");

      const panel = page.locator(`#panel-compounds-${id}`);
      const compound = panel.locator(`[data-compound-id="${id}"]`);
      await expect(panel, `${locale} ${id} panel`).toBeVisible();
      await expect(compound.locator(".pane-heading h2")).toHaveText(economyGoodName(locale, id));
      await expect(compound.locator(".hydrogen-hero")).toBeVisible();
      await expect(compound.locator(".compound-recipe")).toBeVisible();
      await expect(compound.locator(".compound-create-row")).toBeVisible();
      await expect(compound.locator(`[data-testid="compound-${id}-preview"]`)).toBeVisible();
      await expect(compound.locator(".hydrogen-sale-controls .card-copy strong")).toBeVisible();
      await expect(compound.locator(".hydrogen-storage-card .cost-line")).toBeVisible();
      await expect(
        compound.getByRole("button", {
          name: `${economyLabel(locale, "create")} ${economyGoodName(locale, id)}`,
          exact: true,
        }),
      ).toBeVisible();
      await expectNoPageTooltipOrModal(panel, `${locale} ${id}`);
      await expandAllEconomyDetails(compound);
      await expect(compound.locator(".economy-tier").first()).toBeVisible();

      await expectInsidePhone(compound.locator(".hydrogen-hero"), `${locale} ${id} hero`, width);
      await expectInsidePhone(
        compound.locator(".hydrogen-storage-card"),
        `${locale} ${id} storage row`,
        width,
      );
      await expectInsidePhone(
        compound.locator(".hydrogen-storage-card .cost-line"),
        `${locale} ${id} storage cost`,
        width,
      );
      await expectInsidePhone(
        compound.locator(".hydrogen-storage-card .card-controls button"),
        `${locale} ${id} storage action`,
        width,
      );
      await expectInsidePhone(
        compound.locator(".hydrogen-sale-controls"),
        `${locale} ${id} sale row`,
        width,
      );
      await expectInsidePhone(
        compound.locator(".compound-create-controls"),
        `${locale} ${id} create row`,
        width,
      );
      await expectInsidePhone(
        compound.locator(".compound-create-row"),
        `${locale} ${id} recipe cost row`,
        width,
      );
      const compoundTierCount = await compound.locator(".economy-tier").count();
      for (let tier = 0; tier < compoundTierCount; tier += 1) {
        await expectInsidePhone(
          compound.locator(".economy-tier").nth(tier),
          `${locale} ${id} Autobuyer tier ${tier + 1}`,
          width,
        );
        const tierActions = compound.locator(".economy-tier").nth(tier).locator(".text-button");
        for (let action = 0; action < (await tierActions.count()); action += 1) {
          await expectInsidePhone(
            tierActions.nth(action),
            `${locale} ${id} Autobuyer tier ${tier + 1} action ${action + 1}`,
            width,
          );
        }
      }
      await expectDocumentFits(page, `${locale} ${id} Compound`, width);

      const amountInput = compound.getByRole("spinbutton", {
        name: `${economyLabel(locale, "amount")} ${economyGoodName(locale, id)}`,
      });
      const creationPreview = compound.locator(`[data-testid="compound-${id}-preview"]`);
      await amountInput.fill("1");
      const oneUnitPreview = await creationPreview.textContent();
      await amountInput.fill("10");
      await expect(creationPreview).not.toHaveText(oneUnitPreview ?? "");

      const saleSelect = compound.getByLabel(
        `${economyLabel(locale, "saleAmount")} ${economyGoodName(locale, id)}`,
      );
      const salePreview = compound.locator(".hydrogen-sale-controls .card-copy strong");
      await saleSelect.selectOption("all");
      const allUnitsPreview = await salePreview.textContent();
      await saleSelect.selectOption("1");
      await expect(salePreview).not.toHaveText(allUnitsPreview ?? "");

      if (id === "diesel") {
        await captureVisualCheckpoint(
          page,
          testInfo,
          `p51-e57-compound-diesel-${locale}-${captureSuffix}`,
        );
      }
    }
  }

  const resourcePurchaseTargets = [
    "silicon",
    "sodium",
    "carbon",
    "iron",
    "neon",
    "oxygen",
  ] as const;
  const compoundPurchaseTargets = ["diesel", "glass", "steel", "titanium", "water", null] as const;
  for (const [index, locale] of LOCALE_IDS.entries()) {
    await setGameLocale(page, locale);
    const resourceId = resourcePurchaseTargets[index]!;
    await page.locator("#tab-hydrogen").click();
    await page.locator(`#tab-resources-${resourceId}`).click();
    const resourceStorage = page
      .locator(`#panel-resources-${resourceId} [data-resource-id="${resourceId}"]`)
      .locator(".hydrogen-storage-card");
    const resourceInitialCost = await resourceStorage.locator(".cost-line").textContent();
    await expect(resourceStorage.locator(".card-controls button")).toBeEnabled();
    await resourceStorage.locator(".card-controls button").click();
    await expect(resourceStorage.locator(".cost-line")).not.toHaveText(resourceInitialCost ?? "");

    const compoundId = compoundPurchaseTargets[index] ?? "concrete";
    if (compoundPurchaseTargets[index] === null) {
      await page.evaluate(() =>
        window.miaplacidusTest!.applyDebugAction("give-1m-all-resources-compounds"),
      );
    }
    await page.locator("#tab-compounds").click();
    await page.locator(`#tab-compounds-${compoundId}`).click();
    const compoundStorage = page
      .locator(`#panel-compounds-${compoundId} [data-compound-id="${compoundId}"]`)
      .locator(".hydrogen-storage-card");
    const compoundInitialCost = await compoundStorage.locator(".cost-line").textContent();
    const compoundStorageButton = compoundStorage.getByRole("button", {
      name: economyLabel(locale, "increaseStorage"),
    });
    await expect(compoundStorageButton).toBeEnabled();
    await compoundStorageButton.click();
    await expect(compoundStorage.locator(".cost-line")).not.toHaveText(compoundInitialCost ?? "");
  }
}

test("Resource and Compound rows, prices, and inline reasons fit a 320px phone in all locales @p51-e57-phone @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await reviewEconomyRowsAtWidth(page, testInfo, PHONE_320);
});

test("Resource and Compound dynamic rows and action costs fit a 390px phone in all locales @p54-e57-phone @ui", async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  await reviewEconomyRowsAtWidth(page, testInfo, PHONE_390);
});

async function reviewWaterStorageAtWidth(page: Page, viewport: PhoneViewport): Promise<void> {
  await startEconomyFixture(page, "en", "water-storage-short", viewport);

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await page.locator("#tab-compounds").click();
    await page.locator("#tab-compounds-water").click();
    const panel = page.locator("#panel-compounds-water");
    const water = panel.locator('[data-compound-id="water"]');
    const storage = water.locator(".hydrogen-storage-card");
    await expect(storage.locator(".cost-line")).toContainText(economyGoodName(locale, "concrete"));
    const storageButton = storage.locator(".card-controls button");
    await expect(storageButton).toBeDisabled();
    const describedBy = await storageButton.getAttribute("aria-describedby");
    expect(describedBy, `${locale} Water storage exposes its disabled reason`).toBeTruthy();
    const reason = storage.locator(`#${describedBy}`);
    await expect(reason).toBeVisible();
    await expectNoPageTooltipOrModal(panel, `${locale} Water storage`);
    await expectInsidePhone(
      storage.locator(".cost-line"),
      `${locale} Water dual cost`,
      viewport.width,
    );
    await expectInsidePhone(reason, `${locale} Water storage reason`, viewport.width);
    await expectDocumentFits(page, `${locale} disabled Water storage`, viewport.width);
  }
}

test("Water storage's dual-input cost and disabled-action reason fit in all six locales @p51-e57-phone @ui", async ({
  page,
}) => {
  await reviewWaterStorageAtWidth(page, PHONE_320);
});

test("Water storage's dual-input cost and disabled-action reason fit at 390px in all six locales @p54-e57-phone @ui", async ({
  page,
}) => {
  await reviewWaterStorageAtWidth(page, PHONE_390);
});
