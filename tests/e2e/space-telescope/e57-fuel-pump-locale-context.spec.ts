import type { Page, TestInfo } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { ROCKET_FUEL_PUMP_BASE_COST } from "../../../src/content/space";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { setGameLocale } from "../_harness/settings-controls";

const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
] as const;

async function startFuelPumpFixture(page: Page, viewport: (typeof VIEWPORTS)[number]) {
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261010&testLocale=en&economyFixture=space-rocket-fuel-pump");
  await page.getByLabel("Pioneer name").fill("E-57 Fuel Pump Locale Review");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function expectPageBounds(
  page: Page,
  width: number,
  items: readonly (readonly [string, string])[],
): Promise<void> {
  const result = await page.evaluate((selectors) => {
    const boxes = selectors.map(([name, selector]) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Expected visible fuel-pump element: ${selector}`);
      const rect = element.getBoundingClientRect();
      return [name, { left: rect.left, right: rect.right }] as const;
    });
    return {
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewportWidth: document.documentElement.clientWidth,
      boxes,
    };
  }, items);
  expect(result.viewportWidth).toBe(width);
  expect(result.documentWidth).toBeLessThanOrEqual(width);
  for (const [name, box] of result.boxes) {
    expect(box.left, `${name} left bound`).toBeGreaterThanOrEqual(-1);
    expect(box.right, `${name} right bound`).toBeLessThanOrEqual(width + 1);
  }
}

async function reviewFuelPumpAtWidth(
  page: Page,
  testInfo: TestInfo,
  viewport: (typeof VIEWPORTS)[number],
): Promise<void> {
  await startFuelPumpFixture(page, viewport);

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-space-mining").click();
    await page.locator("#tab-space-mining-rocket-1").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const rocket = page.getByTestId("rocket-card-rocket1");
    const cost = formatCurrency(
      locale,
      ROCKET_FUEL_PUMP_BASE_COST.rocket1,
      state.settings.currencyId ?? "usd",
      0,
      state.settings.notation,
    );
    const costRow = rocket.locator(".cost-line");
    const purchase = rocket.getByRole("button", {
      name: rocketText(locale, "buyPump"),
      exact: true,
    });
    await expect(costRow).toContainText(`${rocketText(locale, "pumpCost")}:`);
    await expect(costRow).toContainText(cost);
    await expect(purchase).toBeVisible();
    await expect(purchase).toBeEnabled();
    await expect(rocket.getByText(rocketText(locale, "pumpTitle"), { exact: true })).toBeVisible();
    await expectPageBounds(page, viewport.width, [
      ["Space Mining page", '[data-testid="space-mining-pane"]'],
      ["Rocket card", '[data-testid="rocket-card-rocket1"]'],
      ["fuel-pump quote", '[data-testid="rocket-card-rocket1"] .cost-line'],
      ["fuel-pump purchase action", '[data-testid="rocket-card-rocket1"] button'],
    ]);

    if (locale === "fr") {
      await captureVisualCheckpoint(page, testInfo, `e57-fuel-pump-fr-${viewport.width}`);
    }
  }
}

for (const viewport of VIEWPORTS) {
  test(`Rocket fuel-pump quote and purchase action fit at ${viewport.width}px in all six locales @p54-e57-fuel-pump`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);
    await reviewFuelPumpAtWidth(page, testInfo, viewport);
  });
}
