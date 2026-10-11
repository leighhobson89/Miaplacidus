import { expect, test, type Page } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { displayCurrency } from "../../../src/engine/precision";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";

const NARROW_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function startEconomyFixture(page: Page, fixture: "research" | "power-buildings"): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
      (key): key is string => key?.startsWith(prefix) ?? false,
    );
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261009&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(`P-13 ${fixture} context`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });
}

function formattedCash(state: Awaited<ReturnType<typeof getState>>): string {
  return formatCurrency(
    "en",
    Number(displayCurrency(state.run.cash)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
}

async function getState(page: Page) {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

async function expectNoHorizontalOverflow(
  page: Page,
  width: number,
  selectors: readonly [string, string][],
): Promise<void> {
  const bounds = await page.evaluate((selected) => {
    const rect = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Expected visible narrow-context element: ${selector}`);
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right };
    };
    return {
      documentWidth: document.documentElement.scrollWidth,
      elements: selected.map(([name, selector]) => [name, rect(selector)] as const),
    };
  }, selectors);
  expect(bounds.documentWidth, `${width}px document width`).toBeLessThanOrEqual(width);
  for (const [name, rect] of bounds.elements) {
    expect(rect.left, `${width}px ${name} left edge`).toBeGreaterThanOrEqual(-1);
    expect(rect.right, `${width}px ${name} right edge`).toBeLessThanOrEqual(width + 1);
  }
}

test("Research live balances and priced Science Kit action fit at narrow widths @p13-research-context", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(NARROW_VIEWPORTS[0]);
  await startEconomyFixture(page, "research");
  await page.locator("#tab-research").click();
  await page.locator("#tab-research-science-buildings").click();

  const researchPane = page.getByTestId("economy-research");
  const scienceKit = page.locator('[data-building-id="scienceKit"]');
  const purchase = scienceKit.getByRole("button", { name: "Buy", exact: true });
  const initial = await getState(page);
  const initialResearchPoints = initial.run.researchPoints;
  const initialCash = initial.run.cash;
  await expect(scienceKit).toBeVisible();
  await expect(scienceKit.locator("p").nth(2)).toContainText("$");
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
    await expect(scienceKit.locator("p").nth(2)).toContainText("$");
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
      ["Science Kit price", '[data-building-id="scienceKit"] p:nth-of-type(3)'],
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

test("Energy live balances and priced Battery I action fit at narrow widths @p13-energy-context", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(NARROW_VIEWPORTS[0]);
  await startEconomyFixture(page, "power-buildings");
  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-batteries").click();

  const energyPane = page.getByTestId("economy-energy");
  const battery = page.locator('[data-building-id="battery1"]');
  const purchase = battery.getByRole("button", { name: "Buy", exact: true });
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
