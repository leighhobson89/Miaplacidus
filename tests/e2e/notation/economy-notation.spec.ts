import { expect, test } from "../_harness/fixtures";
import { expandHydrogenAutobuyers, setAllocationSlider, startEconomyFixture } from "../_harness/economyFixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { type Locator, type Page } from "@playwright/test";
import { economyGoodName } from "../../../src/app/economyDisplay";
import {
  autobuyerUpgradeId,
  COMPOUND_IDS,
  MATERIAL_IDS,
  type LocaleId,
} from "../../../src/content/ids";
import { ECONOMY_BUILDING_NAMES } from "../../../src/content/economyBuildingNames";
import { createEconomyTickPlan } from "../../../src/engine/economySimulation";
import { buildingBuyMaxPlan } from "../../../src/engine/commands";
import { philosophyCompoundRecipe } from "../../../src/engine/philosophy";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { formatDuration } from "../../../src/app/timeFormatting";
import {
  COMPOUND_CATALOG,
  ENERGY_BUILDINGS,
  MATERIAL_CATALOG,
  SCIENCE_BUILDINGS,
} from "../../../src/content/economy";
import { MEGASTRUCTURE_TECHNOLOGY_IDS, TECHNOLOGY_CATALOG } from "../../../src/content/technology";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { technologyNotificationText } from "../../../src/i18n/technologyNotificationMessages";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale, setNumberNotation } from "../_harness/settings-controls";

test("P-41 formats a production rate above 999 per second in every notation @precision @notation", async ({
  page,
}) => {
  await startEconomyFixture(page, "notation-coverage");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const hydrogenRate = createEconomyTickPlan(state).netRatesPerSecond.hydrogen;
  expect(hydrogenRate).toBeGreaterThan(999);
  const cash = state.run.cash;
  expect(cash).toBeGreaterThan(999);

  const readout = page.locator("#panel-resources-hydrogen .rate-readout strong");
  const cashReadout = page.getByTestId("cash-balance");
  const cashTooltip = page.locator("#top-stat-tooltip-cash");
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await expect(readout).toContainText(formatNumber("en", hydrogenRate, 2, notation));
    const formattedCash = formatCurrency(
      "en",
      cash,
      state.settings.currencyId ?? "usd",
      2,
      notation,
    );
    await expect(cashReadout).toHaveText(formattedCash);
    await expect(cashReadout).toHaveAttribute("aria-describedby", "top-stat-tooltip-cash");
    await expect(cashTooltip).toContainText(formattedCash);
  }
});

test("P-41 formats every visible Resource and Compound holding and rate in every notation @precision @notation", async ({
  page,
}) => {
  await startEconomyFixture(page, "full");

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);

    for (const id of MATERIAL_IDS) {
      await page.locator(`#tab-resources-${id}`).click();
      const panel = page.locator(`#panel-resources-${id}`);
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const rates = createEconomyTickPlan(state).netRatesPerSecond;
      const quantityTestId =
        id === "hydrogen" ? "hydrogen-quantity" : `economy-good-quantity-${id}`;
      const capacityTestId =
        id === "hydrogen" ? "hydrogen-capacity" : `economy-good-capacity-${id}`;
      await expect(panel.getByTestId(quantityTestId)).toContainText(
        formatNumber("en", state.run.goods[id].quantity, 2, notation),
      );
      await expect(panel.getByTestId(capacityTestId)).toHaveText(
        formatNumber("en", state.run.goods[id].storageCapacity, 0, notation),
      );
      await expect(panel.locator(".rate-readout strong")).toContainText(
        formatNumber("en", Math.abs(rates[id] ?? 0), 2, notation),
      );
    }

    await page.locator("#tab-compounds").click();
    for (const id of COMPOUND_IDS) {
      await page.locator(`#tab-compounds-${id}`).click();
      const pane = page.locator(`#pane-compounds [data-compound-id="${id}"]`);
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const rates = createEconomyTickPlan(state).netRatesPerSecond;
      await expect(pane.locator(`[data-testid="economy-good-quantity-${id}"]`)).toContainText(
        formatNumber("en", state.run.goods[id].quantity, 2, notation),
      );
      await expect(pane.locator(`[data-testid="economy-good-capacity-${id}"]`)).toHaveText(
        formatNumber("en", state.run.goods[id].storageCapacity, 0, notation),
      );
      await expect(pane.locator(".rate-readout strong")).toContainText(
        formatNumber("en", Math.abs(rates[id] ?? 0), 2, notation),
      );
    }
  }
});

test("P-41 keeps the long Run Time timer advancing during a live notation change @precision @notation", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "notation-coverage");
  const runTime = page.getByTestId("top-stat-time").locator(".top-stat-value");
  let simulationMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.clock.simulationMs,
  );
  const condensedDuration = formatDuration("en", simulationMs, "condensed");
  await expect(runTime).toHaveText(condensedDuration);
  await expect(runTime).toHaveAttribute("aria-describedby", "top-stat-tooltip-time");
  await expect(page.locator("#top-stat-tooltip-time")).toContainText(condensedDuration);
  await captureVisualCheckpoint(page, testInfo, "p41-runtime-condensed");

  await setNumberNotation(page, "standard");
  simulationMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.clock.simulationMs,
  );
  const standardDuration = formatDuration("en", simulationMs, "standard");
  await expect(runTime).toHaveText(standardDuration);
  await expect(page.locator("#top-stat-tooltip-time")).toContainText(standardDuration);
  await captureVisualCheckpoint(page, testInfo, "p41-runtime-standard");
  await setNumberNotation(page, "scientific");
  simulationMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.clock.simulationMs,
  );
  const scientificDuration = formatDuration("en", simulationMs, "scientific");
  await expect(runTime).toHaveText(scientificDuration);
  await expect(page.locator("#top-stat-tooltip-time")).toContainText(scientificDuration);
  await captureVisualCheckpoint(page, testInfo, "p41-runtime-scientific");
  const before = simulationMs;
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));

  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.clock.simulationMs))
    .toBeGreaterThan(before);
  simulationMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.clock.simulationMs,
  );
  await expect(runTime).toHaveText(formatDuration("en", simulationMs, "scientific"));
});

test("formats Compound recipe inputs using the selected notation @p41-compound-recipe @notation", async ({
  page,
}) => {
  await startEconomyFixture(page, "full");
  const diesel = page.locator('[data-compound-id="diesel"]');

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    if (notation !== "condensed") await setNumberNotation(page, notation);
    await page.locator("#tab-compounds").click();
    await expect(diesel).toBeVisible();
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const expectedRecipe = philosophyCompoundRecipe(state, "diesel")
      .map(
        (input) =>
          `${formatNumber("en", input.amount, 2, notation)} ${economyGoodName("en", input.goodId)}`,
      )
      .join(" + ");
    await expect(diesel.locator(".compound-recipe")).toContainText(expectedRecipe);
  }
});

