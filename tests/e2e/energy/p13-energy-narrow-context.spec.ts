import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { formatNumber } from "../../../src/app/numberFormatting";
import {
  NARROW_VIEWPORTS,
  expectNoHorizontalOverflow,
  formattedCash,
  getState,
  startEconomyFixture,
} from "../_harness/economyNarrowContext";

test("Energy live balances and priced Battery I action fit at narrow widths @p13-energy-context", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(NARROW_VIEWPORTS[0]);
  await startEconomyFixture(page, "power-buildings");
  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-batteries").click();

  const energyPane = page.getByTestId("economy-energy");
  const battery = page.locator('[data-building-id="battery1"]');
  const purchase = battery.locator(".economy-building-actions button").first();
  const initial = await getState(page);
  const initialCash = initial.run.cash;
  const initialCapacity = initial.run.economy.power.capacity;
  await expect(battery).toBeVisible();
  await expect(battery.locator("p").nth(1)).toContainText("$");
  await expect(purchase).toBeEnabled();
  await purchase.click();

  const purchased = await getState(page);
  expect(purchased.run.cash).toBeLessThan(initialCash);
  expect(purchased.run.economy.power.capacity).toBeGreaterThan(initialCapacity);
  await expect(battery).toContainText("Owned: 1");

  for (const viewport of NARROW_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await expect(page.locator("#tab-energy")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#tab-energy-batteries")).toHaveAttribute("aria-selected", "true");
    await expect(energyPane).toBeVisible();
    await expect(battery).toBeVisible();
    await expect(battery.locator("p").nth(1)).toContainText("$");
    await expect(purchase).toBeVisible();
    await expect(page.getByTestId("cash-balance")).toHaveText(formattedCash(purchased));
    await expect(page.getByTestId("research-balance")).toHaveText(
      formatNumber("en", purchased.run.researchPoints, 0, purchased.settings.notation),
    );

    await expectNoHorizontalOverflow(page, viewport.width, [
      ["Energy pane", "#pane-energy"],
      ["Battery I card", '[data-building-id="battery1"]'],
      ["Battery I price", '[data-building-id="battery1"] p:nth-of-type(2)'],
      ["Battery I purchase control", '[data-building-id="battery1"] .economy-building-actions'],
      ["Research Points balance", '[data-testid="top-stat-rp"]'],
      ["Cash balance", '[data-testid="top-stat-cash"]'],
    ]);
    await captureVisualCheckpoint(page, testInfo, `p13-energy-battery-price-${viewport.width}`);

    await page.locator("#tab-energy-summary").click();
    const powerCapacity = page.getByTestId("power-quantity").locator("xpath=following-sibling::strong");
    await expect(page.getByTestId("power-quantity")).toBeVisible();
    await expect(powerCapacity).toHaveText(
      formatNumber("en", purchased.run.economy.power.capacity, 0, purchased.settings.notation),
    );
    await expectNoHorizontalOverflow(page, viewport.width, [
      ["Energy Summary pane", "#pane-energy"],
      ["Stored power amount", '[data-testid="power-quantity"]'],
      ["Research Points balance", '[data-testid="top-stat-rp"]'],
      ["Cash balance", '[data-testid="top-stat-cash"]'],
    ]);
    await page.locator("#tab-energy-batteries").click();
  }
});
