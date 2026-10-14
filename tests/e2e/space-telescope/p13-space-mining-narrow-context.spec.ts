import { expect, test } from "../_harness/fixtures";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import {
  ROCKET_FUEL_CAPACITY,
  ROCKET_FUEL_PUMP_BASE_COST,
  TELESCOPE_COST,
} from "../../../src/content/space";
import { ASTEROID_SCAN_TIMER_ID } from "../../../src/content/space";
import { displayCurrency } from "../../../src/engine/precision";
import { rocketText } from "../../../src/i18n/rocketMessages";
import { spaceText } from "../../../src/i18n/spaceMessages";

async function startSpaceFixture(
  page: import("@playwright/test").Page,
  fixture: "space-rocket-fuel-pump" | "space-telescope",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("P13 Space Mining");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

function cashValue(state: Awaited<ReturnType<typeof getState>>) {
  return formatCurrency(
    "en",
    Number(displayCurrency(state.run.cash)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
}

async function getState(page: import("@playwright/test").Page) {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

async function expectNarrowBounds(
  page: import("@playwright/test").Page,
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
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewportWidth: document.documentElement.clientWidth,
      elements: items.map(([name, selector]) => [name, rect(selector)] as const),
    };
  }, selectors);
  expect(bounds.documentWidth).toBeLessThanOrEqual(bounds.viewportWidth);
  for (const [name, rect] of bounds.elements) {
    expect(rect.left, `${name} left edge`).toBeGreaterThanOrEqual(-1);
    expect(rect.right, `${name} right edge`).toBeLessThanOrEqual(bounds.viewportWidth + 1);
  }
}

test("Rocket fuel cost, balance, ETA, progress, and pause action fit at 320px @p13-space-mining-narrow-context", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await startSpaceFixture(page, "space-rocket-fuel-pump");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();

  const stateBefore = await getState(page);
  const cashBalance = page.getByTestId("cash-balance");
  const antimatterBalance = page.getByTestId("top-stat-antimatter").locator(".top-stat-value");
  const rocket = page.getByTestId("rocket-card-rocket1");
  const pumpCost = formatCurrency(
    "en",
    ROCKET_FUEL_PUMP_BASE_COST.rocket1,
    stateBefore.settings.currencyId ?? "usd",
    0,
    stateBefore.settings.notation,
  );
  await expect(cashBalance).toHaveText(cashValue(stateBefore));
  await expect(antimatterBalance).toHaveText(
    formatNumber("en", stateBefore.run.space.antimatter, 0, stateBefore.settings.notation),
  );
  await expect(rocket.locator(".cost-line")).toContainText(pumpCost);
  const buyPump = rocket.getByRole("button", { name: "Buy fuel pump" });
  await expect(buyPump).toBeEnabled();
  await expectNarrowBounds(page, [
    ["Space Mining page", '[data-testid="space-mining-pane"]'],
    ["Cash balance", '[data-testid="top-stat-cash"]'],
    ["Antimatter balance", '[data-testid="top-stat-antimatter"]'],
    ["Rocket card", '[data-testid="rocket-card-rocket1"]'],
    ["pump cost", '[data-testid="rocket-card-rocket1"] .cost-line'],
    ["pump purchase action", '[data-testid="rocket-card-rocket1"] button'],
  ]);

  await buyPump.click();
  const afterPurchase = await getState(page);
  expect(afterPurchase.run.space.rockets.rocket1.fuelPumpPurchased).toBe(true);
  expect(afterPurchase.run.cash).toBeLessThan(stateBefore.run.cash);
  await expect(cashBalance).toHaveText(cashValue(afterPurchase));
  const fuelEta = rocket.getByTestId("rocket-fuel-eta-rocket1");
  const fuelProgress = rocket.getByRole("progressbar", {
    name: rocketText("en", "fuelLevel"),
    exact: true,
  });
  const pauseFueling = rocket.getByRole("button", { name: rocketText("en", "pauseFueling") });
  await expect(fuelEta).toBeVisible();
  await expect(fuelEta).toContainText("Time to full:");
  await expect(fuelProgress).toBeVisible();
  await expect(fuelProgress).toHaveAttribute("max", `${ROCKET_FUEL_CAPACITY.rocket1}`);
  await expect(pauseFueling).toBeVisible();
  await expect(pauseFueling).toHaveAttribute("aria-pressed", "true");
  const initialEta = Number(await fuelEta.getAttribute("data-remaining-ms"));
  const initialProgress = await fuelProgress.evaluate(
    (element) => (element as HTMLProgressElement).value,
  );
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  const fuelingState = await getState(page);
  expect(fuelingState.run.space.rockets.rocket1.fuelQuantity).toBeGreaterThan(
    afterPurchase.run.space.rockets.rocket1.fuelQuantity,
  );
  await expect
    .poll(async () => Number(await fuelEta.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialEta);
  await expect
    .poll(() => fuelProgress.evaluate((element) => (element as HTMLProgressElement).value))
    .toBeGreaterThan(initialProgress);
  await expectNarrowBounds(page, [
    ["Space Mining page", '[data-testid="space-mining-pane"]'],
    ["Cash balance", '[data-testid="top-stat-cash"]'],
    ["Antimatter balance", '[data-testid="top-stat-antimatter"]'],
    ["Rocket card", '[data-testid="rocket-card-rocket1"]'],
    ["fuel progress", '[data-testid="rocket-fuel-progress-rocket1"]'],
    ["fuel ETA", '[data-testid="rocket-fuel-eta-rocket1"]'],
    ["pause fueling action", '[data-testid="rocket-card-rocket1"] button'],
  ]);
});

test("Telescope search cost, balances, timer, progress, and status fit at 320px @p13-space-mining-narrow-context", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await startSpaceFixture(page, "space-telescope");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();

  const telescope = page.getByTestId("space-mining-pane");
  const stateBeforeBuild = await getState(page);
  const costList = telescope.getByRole("list", { name: spaceText("en", "telescopeCost") });
  const telescopeButton = telescope.getByRole("button", {
    name: spaceText("en", "telescopeBuild"),
    exact: true,
  });
  await expect(page.getByTestId("cash-balance")).toHaveText(cashValue(stateBeforeBuild));
  await expect(costList).toBeVisible();
  await expect(costList).toContainText(
    formatCurrency(
      "en",
      TELESCOPE_COST.cash,
      stateBeforeBuild.settings.currencyId ?? "usd",
      0,
      stateBeforeBuild.settings.notation,
    ),
  );
  for (const material of TELESCOPE_COST.materials) {
    await expect(costList).toContainText(
      `${formatNumber("en", material.amount, 0, stateBeforeBuild.settings.notation)} ${economyGoodName("en", material.goodId)}`,
    );
  }
  await expect(telescopeButton).toBeEnabled();
  await expectNarrowBounds(page, [
    ["Telescope pane", '[data-testid="space-mining-pane"]'],
    ["Cash balance", '[data-testid="top-stat-cash"]'],
    ["telescope cost", ".space-cost-list"],
    ["build Telescope action", "#panel-space-mining button.primary-button"],
  ]);

  await telescopeButton.click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.telescopeBuilt))
    .toBe(true);
  await expect(telescope.getByTestId("space-survey-status")).toHaveText(
    spaceText("en", "surveyIdle"),
  );
  const scanButton = telescope.getByRole("button", {
    name: spaceText("en", "scanAsteroids"),
    exact: true,
  });
  await expect(scanButton).toBeEnabled();
  await scanButton.click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBe("asteroids");
  await expect
    .poll(() =>
      page.evaluate(
        (timerId) => window.miaplacidusTest!.getState().run.timers[timerId]?.status,
        ASTEROID_SCAN_TIMER_ID,
      ),
    )
    .toBe("running");

  const surveyState = await getState(page);
  const surveyStatus = telescope.getByTestId("space-survey-status");
  const countdown = telescope.getByTestId("space-survey-countdown");
  const progress = telescope.getByRole("progressbar", {
    name: spaceText("en", "surveySearching"),
    exact: true,
  });
  await expect(page.getByTestId("cash-balance")).toHaveText(cashValue(surveyState));
  await expect(surveyStatus).toHaveText(spaceText("en", "surveySearching"));
  await expect(countdown).toContainText(
    spaceText("en", "surveyTimeRemaining", { time: "" }).trim(),
  );
  await expect(progress).toBeVisible();
  await expect(progress).toHaveAttribute("max", "100");
  const initialRemaining = Number(await countdown.getAttribute("data-remaining-ms"));
  const initialProgress = await progress.evaluate(
    (element) => (element as HTMLProgressElement).value,
  );
  await expect(scanButton).toBeDisabled();
  await expect(scanButton).toHaveAttribute("aria-describedby", "telescope-scan-reason");
  await expect(telescope.locator("#telescope-scan-reason")).toBeVisible();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await countdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialRemaining);
  await expect
    .poll(() => progress.evaluate((element) => (element as HTMLProgressElement).value))
    .toBeGreaterThan(initialProgress);
  await expectNarrowBounds(page, [
    ["Telescope pane", '[data-testid="space-mining-pane"]'],
    ["Cash balance", '[data-testid="top-stat-cash"]'],
    ["search status", '[data-testid="space-survey-status"]'],
    ["search countdown", '[data-testid="space-survey-countdown"]'],
    ["search progress", '[data-testid="space-survey-progress"]'],
    ["disabled scan action", "#space-scan-asteroids"],
    ["scan reason", "#telescope-scan-reason"],
  ]);
});
