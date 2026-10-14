import { expect, test } from "../_harness/fixtures";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { displayCurrency } from "../../../src/engine/precision";
import { starshipTravelPlan } from "../../../src/engine/spaceMechanics";
import { starshipText } from "../../../src/i18n/starshipMessages";

async function startReadyStarship(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-starship-ready");
  await page.getByLabel("Pioneer name").fill("P13 Narrow Starship");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("build-launch-pad-scanner-rockets"),
    ),
  ).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.launchPadBuilt))
    .toBe(true);
}

async function expectNarrowBounds(
  page: import("@playwright/test").Page,
  width: number,
  selectors: readonly (readonly [string, string])[],
): Promise<void> {
  const bounds = await page.evaluate((items) => {
    const rect = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Expected visible narrow-context element: ${selector}`);
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right };
    };
    return {
      documentWidth: document.documentElement.scrollWidth,
      elements: items.map(([name, selector]) => [name, rect(selector)] as const),
    };
  }, selectors);
  expect(bounds.documentWidth, `${width}px document width`).toBeLessThanOrEqual(width);
  for (const [name, rect] of bounds.elements) {
    expect(rect.left, `${width}px ${name} left edge`).toBeGreaterThanOrEqual(-1);
    expect(rect.right, `${width}px ${name} right edge`).toBeLessThanOrEqual(width + 1);
  }
}

test("Starship keeps travel cost, currency, ETA, progress, and action context visible at narrow widths @p13-starship-narrow-context", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startReadyStarship(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();
  await page.locator("#tab-interstellar-starship").click();

  const starship = page.getByTestId("starship-pane");
  const summary = starship.locator(".starship-travel-summary");
  const initialState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destinationId = initialState.run.space.starship.destinationSystemId;
  expect(destinationId).not.toBeNull();
  const plan = starshipTravelPlan(initialState, destinationId!);
  expect(plan).not.toBeNull();
  const cash = formatCurrency(
    "en",
    Number(displayCurrency(initialState.run.cash)),
    initialState.settings.currencyId ?? "usd",
    2,
    initialState.settings.notation,
  );
  const antimatter = formatNumber(
    "en",
    initialState.run.space.antimatter,
    0,
    initialState.settings.notation,
  );
  const fuel = formatNumber("en", plan!.antimatter, 2, initialState.settings.notation);
  const time = formatNumber(
    "en",
    Math.floor(plan!.durationMs / 1000),
    0,
    initialState.settings.notation,
  );

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(starship).toBeVisible();
    await expect(page.getByTestId("cash-balance")).toHaveText(cash);
    await expect(page.getByTestId("top-stat-antimatter").locator(".top-stat-value")).toHaveText(
      antimatter,
    );
    await expect(summary).toBeVisible();
    await expect(summary.locator(".space-cost-list")).toContainText(
      `${starshipText("en", "fuelCost")}: ${fuel}`,
    );
    await expect(summary).toContainText(`${time} s`);
    await expect(summary.getByRole("button", { name: "Travel" })).toBeEnabled();
    await expectNarrowBounds(page, viewport.width, [
      ["Starship pane", '[data-testid="starship-pane"]'],
      ["Cash balance", '[data-testid="top-stat-cash"]'],
      ["Antimatter balance", '[data-testid="top-stat-antimatter"]'],
      ["fuel and ETA summary", ".starship-travel-summary"],
      ["launch action", ".starship-travel-summary button"],
    ]);
  }

  await summary.getByRole("button", { name: "Travel" }).click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: starshipText("en", "confirmLaunch") })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");

  const travellingState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const countdown = starship.getByTestId("starship-journey-countdown");
  const progress = starship.getByRole("progressbar", {
    name: starshipText("en", "journeyProgress"),
    exact: true,
  });
  expect(travellingState.run.space.antimatter).toBe(
    initialState.run.space.antimatter - plan!.antimatter,
  );
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.getByTestId("cash-balance")).toHaveText(cash);
    await expect(page.getByTestId("top-stat-antimatter").locator(".top-stat-value")).toHaveText(
      formatNumber(
        "en",
        travellingState.run.space.antimatter,
        0,
        travellingState.settings.notation,
      ),
    );
    await expect(countdown).toBeVisible();
    await expect(countdown).toContainText("Journey time remaining:");
    await expect(progress).toBeVisible();
    await expect(progress).toHaveAttribute("max", "100");
    await expect(summary.getByRole("button", { name: "Travel" })).toHaveCount(0);
    await expectNarrowBounds(page, viewport.width, [
      ["Starship pane", '[data-testid="starship-pane"]'],
      ["Cash balance", '[data-testid="top-stat-cash"]'],
      ["Antimatter balance", '[data-testid="top-stat-antimatter"]'],
      ["voyage countdown", '[data-testid="starship-journey-countdown"]'],
      ["voyage progress", '[data-testid="starship-travel-progress"]'],
    ]);
  }
});
