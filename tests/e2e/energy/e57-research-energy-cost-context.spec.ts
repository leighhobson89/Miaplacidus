import { expect, test } from "../_harness/fixtures";
import type { TestInfo } from "@playwright/test";
import { LOCALE_IDS, PHILOSOPHY_IDS, type LocaleId } from "../../../src/content/ids";
import { SCIENCE_BUILDINGS } from "../../../src/content/economy";
import { PHILOSOPHY_PATHS } from "../../../src/content/philosophy";
import { TECHNOLOGY_DESCRIPTIONS } from "../../../src/content/technologyDescriptions";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { philosophyText } from "../../../src/i18n/philosophyMessages";
import { economyLabel } from "../../../src/i18n/economyMessages";

const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
] as const;

async function startEconomyFixture(
  page: import("@playwright/test").Page,
  fixture: "space-telescope" | "storage-all",
  pioneer: string,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(pioneer);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.dispatch === "function"))
    .toBe(true);
}

async function setLocale(page: import("@playwright/test").Page, locale: LocaleId): Promise<void> {
  await page.evaluate((nextLocale: LocaleId) => {
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: nextLocale },
    });
  }, locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

async function expectNoHorizontalOverflow(
  element: import("@playwright/test").Locator,
  context: string,
): Promise<void> {
  const dimensions = await element.evaluate((node) => ({
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
  }));
  expect(dimensions.scrollWidth, `${context} has no horizontal text overflow`).toBeLessThanOrEqual(
    dimensions.clientWidth + 1,
  );
}

async function expectInsideViewport(
  element: import("@playwright/test").Locator,
  width: number,
  context: string,
): Promise<void> {
  const bounds = await element.boundingBox();
  expect(bounds, `${context} has rendered bounds`).not.toBeNull();
  expect(bounds!.x, `${context} stays inside the viewport's left edge`).toBeGreaterThanOrEqual(-1);
  expect(
    bounds!.x + bounds!.width,
    `${context} stays inside the viewport's right edge`,
  ).toBeLessThanOrEqual(width + 1);
}

test("Research and Energy dynamic cost rows fit all phone locales @e57-economy-costs @ui @energy", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startEconomyFixture(page, "storage-all", "E-57 Research Energy Costs Pioneer");

  const scienceIds = Object.keys(SCIENCE_BUILDINGS) as (keyof typeof SCIENCE_BUILDINGS)[];
  const batteryIds = ["battery1", "battery2", "battery3"] as const;
  const plantIds = ["powerPlant1", "powerPlant2", "powerPlant3"] as const;

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const locale of LOCALE_IDS) {
      await setLocale(page, locale);

      await page.locator("#tab-research").click();
      await page.locator("#tab-research-science-buildings").click();
      const sciencePanel = page.locator("#panel-research-science-buildings");
      await expect(sciencePanel).toBeVisible();
      await expect(page.locator('dialog[open], [role="dialog"]:visible')).toHaveCount(0);
      for (const id of scienceIds) {
        const card = sciencePanel.locator(`[data-building-id="${id}"]`);
        const price = card.locator(":scope > p").nth(3);
        await expect(card, `${locale} ${id} card`).toBeVisible();
        await expect(price, `${locale} ${id} cash price`).toHaveText(/\S/);
        await expectInsideViewport(card, viewport.width, `${locale} ${id} Research card`);
        await expectNoHorizontalOverflow(card, `${locale} ${id} Research card`);

        if (viewport.width === 320 && locale === LOCALE_IDS[0] && id === scienceIds[0]) {
          const initialPrice = await price.textContent();
          await card.locator(".economy-building-actions button").first().click();
          await expect(price).not.toHaveText(initialPrice ?? "");
        }
      }

      await page.locator("#tab-research-tech-tree").click();
      const tree = page.locator("#panel-research-tech-tree");
      const technologyCosts = tree.locator(".technology-map-node-cost");
      await expect(technologyCosts).toHaveCount(37);
      await expect(page.locator('dialog[open], [role="dialog"]:visible')).toHaveCount(0);
      for (let index = 0; index < (await technologyCosts.count()); index += 1) {
        const cost = technologyCosts.nth(index);
        await expect(cost, `${locale} Tech Tree cost ${index + 1}`).toContainText(
          economyLabel(locale, "researchCostSuffix"),
        );
        await expectNoHorizontalOverflow(cost, `${locale} Tech Tree cost ${index + 1}`);
      }

      await page.locator("#tab-energy").click();
      await page.locator("#tab-energy-summary").click();
      await expect(page.locator("#panel-energy")).toBeVisible();
      await expect(page.locator('dialog[open], [role="dialog"]:visible')).toHaveCount(0);

      await page.locator("#tab-energy-batteries").click();
      const batteryCards = page.locator("#panel-energy [data-building-id]");
      await expect(batteryCards).toHaveCount(batteryIds.length);
      await expect(page.locator('dialog[open], [role="dialog"]:visible')).toHaveCount(0);
      for (const [index, id] of batteryIds.entries()) {
        const card = page.locator(`#panel-energy [data-building-id="${id}"]`);
        const price = card.locator(`#battery-${id}-cost`);
        await expect(card, `${locale} ${id} Battery card`).toBeVisible();
        await expect(price, `${locale} ${id} cash/material price`).toContainText(/\d/);
        await expectInsideViewport(card, viewport.width, `${locale} ${id} Battery card`);
        await expectNoHorizontalOverflow(card, `${locale} ${id} Battery card`);
        if (viewport.width === 320 && locale === LOCALE_IDS[0] && index === 0) {
          const initialPrice = await price.textContent();
          await card.locator(".economy-building-actions button").first().click();
          await expect(price).not.toHaveText(initialPrice ?? "");
        }
      }

      await page.locator("#tab-energy-power").click();
      const powerCards = page.locator("#panel-energy [data-building-id]");
      await expect(powerCards).toHaveCount(plantIds.length);
      await expect(page.locator('dialog[open], [role="dialog"]:visible')).toHaveCount(0);
      for (const [index, id] of plantIds.entries()) {
        const card = page.locator(`#panel-energy [data-building-id="${id}"]`);
        const price = card.locator(`#energy-building-${id}-cost`);
        await expect(card, `${locale} ${id} Power card`).toBeVisible();
        await expect(price, `${locale} ${id} cash/material price`).toContainText(/\d/);
        await expectInsideViewport(card, viewport.width, `${locale} ${id} Power card`);
        await expectNoHorizontalOverflow(card, `${locale} ${id} Power card`);
        if (viewport.width === 320 && locale === LOCALE_IDS[0] && index === 0) {
          const initialPrice = await price.textContent();
          await card.locator(".economy-building-actions button").first().click();
          await expect(price).not.toHaveText(initialPrice ?? "");
        }
      }
    }
  }
});
