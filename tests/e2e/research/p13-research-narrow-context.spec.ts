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

test("Research live balances and priced Science Kit action fit at narrow widths @p13-research-context", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(NARROW_VIEWPORTS[0]);
  await startEconomyFixture(page, "research");
  await page.locator("#tab-research").click();
  await page.locator("#tab-research-science-buildings").click();

  const researchPane = page.getByTestId("economy-research");
  const scienceKit = page.locator('[data-building-id="scienceKit"]');
  const purchase = scienceKit.locator(".economy-building-actions button").first();
  const initial = await getState(page);
  const initialResearchPoints = initial.run.researchPoints;
  const initialCash = initial.run.cash;
  await expect(scienceKit).toBeVisible();
  await expect(scienceKit.locator(":scope > p").nth(3)).toContainText("$");
  await expect(purchase).toBeEnabled();

  for (const viewport of NARROW_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await expect(page.locator("#tab-research")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#tab-research-science-buildings")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(researchPane).toBeVisible();
    await expect(scienceKit).toBeVisible();
    await expect(scienceKit.locator(":scope > p").nth(3)).toContainText("$");
    await expect(purchase).toBeVisible();
    await expect(purchase).toBeEnabled();
    await expect(page.getByTestId("cash-balance")).toHaveText(formattedCash(initial));
    await expect(page.getByTestId("research-balance")).toHaveText(
      formatNumber("en", initial.run.researchPoints, 0, initial.settings.notation),
    );
    await expect(page.getByTestId("research-points")).toHaveText(
      formatNumber("en", initial.run.researchPoints, 0, initial.settings.notation),
    );
    await expect(page.getByTestId("research-rate")).toBeVisible();

    await expectNoHorizontalOverflow(page, viewport.width, [
      ["Research pane", "#pane-research"],
      ["Science Kit card", '[data-building-id="scienceKit"]'],
      ["Science Kit price", '[data-building-id="scienceKit"] > p:nth-of-type(4)'],
      ["Science Kit purchase control", '[data-building-id="scienceKit"] .economy-building-actions'],
      ["Research Points balance", '[data-testid="top-stat-rp"]'],
      ["Cash balance", '[data-testid="top-stat-cash"]'],
    ]);
    await captureVisualCheckpoint(page, testInfo, `p13-research-live-price-${viewport.width}`);
  }

  await purchase.click();
  const purchased = await getState(page);
  expect(purchased.run.cash).toBeLessThan(initialCash);
  expect(purchased.run.upgrades.scienceKit).toBe(initial.run.upgrades.scienceKit + 1);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(5_000));
  const live = await getState(page);
  expect(live.run.researchPoints).toBeGreaterThan(initialResearchPoints);
  for (const viewport of NARROW_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await expect(page.getByTestId("cash-balance")).toHaveText(formattedCash(live));
    await expect(page.getByTestId("research-balance")).toHaveText(
      formatNumber("en", live.run.researchPoints, 0, live.settings.notation),
    );
    await expect(page.getByTestId("research-points")).toHaveText(
      formatNumber("en", live.run.researchPoints, 0, live.settings.notation),
    );
    await expectNoHorizontalOverflow(page, viewport.width, [
      ["Research pane", "#pane-research"],
      ["Research Points balance", '[data-testid="top-stat-rp"]'],
      ["Cash balance", '[data-testid="top-stat-cash"]'],
    ]);
  }
});
