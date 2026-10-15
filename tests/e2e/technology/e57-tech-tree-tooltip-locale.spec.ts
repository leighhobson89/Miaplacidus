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

test("Tech Tree node tooltip opens with localized details at phone widths @e57-economy-tooltip @ui @technology", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=storage-all");
  await page.getByLabel("Pioneer name").fill("E-57 Tech Tooltip Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.dispatch === "function"))
    .toBe(true);

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize(viewport);
    for (const locale of LOCALE_IDS) {
      await page.evaluate((nextLocale: LocaleId) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        });
      }, locale);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);

      await page.locator("#tab-research").click();
      await page.locator("#tab-research-tech-tree").click();
      const tree = page.locator("#panel-research-tech-tree");
      const node = tree.locator('[data-technology-id="knowledgeSharing"]');
      const tooltip = node.locator(".technology-map-tooltip");

      await expect(tree).toBeVisible();
      await expect(node).toBeVisible();
      await node.scrollIntoViewIfNeeded();
      await node.hover();
      await expect(tooltip).toBeVisible();
      await expect(tooltip.locator("strong")).toHaveText(TECHNOLOGY_NAMES.knowledgeSharing[locale]);
      await expect(tooltip.locator(".technology-map-tooltip-description")).toHaveText(
        TECHNOLOGY_DESCRIPTIONS.knowledgeSharing[locale].replace(/\s*\/\s*\/\s*/g, "\n"),
      );
      await expect(tree.locator('dialog:visible, [role="dialog"]:visible')).toHaveCount(0);

      const bounds = await tooltip.boundingBox();
      const nodeBounds = await node.boundingBox();
      const viewportBounds = await page.getByTestId("technology-tree-viewport").boundingBox();
      expect(bounds, `${locale} ${viewport.width}px tooltip has rendered bounds`).not.toBeNull();
      expect(nodeBounds, `${locale} ${viewport.width}px node has rendered bounds`).not.toBeNull();
      expect(
        viewportBounds,
        `${locale} ${viewport.width}px Tech Tree viewport has rendered bounds`,
      ).not.toBeNull();
      expect(
        bounds!.x,
        `${locale} ${viewport.width}px tooltip is not clipped left`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        bounds!.x + bounds!.width,
        `${locale} ${viewport.width}px tooltip stays inside the Tech Tree viewport (node ${JSON.stringify(nodeBounds)})`,
      ).toBeLessThanOrEqual(viewportBounds!.x + viewportBounds!.width);
      expect(
        bounds!.x,
        `${locale} ${viewport.width}px tooltip stays inside the Tech Tree viewport`,
      ).toBeGreaterThanOrEqual(viewportBounds!.x);

      await page.mouse.move(0, 0);
      await node.focus();
      await page.keyboard.press("Tab");
      const keyboardNode = tree.locator(".technology-map-node:focus-visible");
      await expect(keyboardNode, `${locale} keyboard focus reaches a Tech Tree node`).toHaveCount(
        1,
      );
      await expect(
        keyboardNode.locator(".technology-map-tooltip"),
        `${locale} keyboard-focused Tech Tree tooltip`,
      ).toBeVisible();
    }
  }
});
