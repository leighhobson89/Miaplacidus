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
import { expandResearchProduction } from "../_harness/economyShared";

test("Bulk Purchasing buys the affordable power plants and spends only their exact costs @energy @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "bulk-energy");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-power").click();
  const powerPlant = page.locator('[data-building-id="powerPlant1"]');
  await expect(powerPlant.getByRole("button", { name: "Buy max" })).toBeEnabled();
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  const expectedPlan = buildingBuyMaxPlan(before, "powerPlant1");
  await powerPlant.getByRole("button", { name: "Buy max" }).click();
  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  const beforeCount = before.run.upgrades.powerPlant1 ?? 0;
  const afterCount = after.run.upgrades.powerPlant1 ?? 0;
  expect(afterCount - beforeCount).toBe(expectedPlan.count);
  expect(after.run.cash).toBeCloseTo(before.run.cash - expectedPlan.cash, 6);
  for (const material of expectedPlan.materials) {
    expect(before.run.goods[material.goodId].quantity - after.run.goods[material.goodId].quantity).toBe(
      material.amount,
    );
  }
  await expect(powerPlant).toContainText(`Owned: ${afterCount}`);
  await expect(page.getByTestId("cash-balance")).toHaveText(formatCurrency("en", after.run.cash));
  await page.getByRole("button", { name: /Turn power grid off/i }).click();
  await expect(page.getByRole("button", { name: /Turn power grid on/i })).toBeVisible();
  await expect(powerPlant.getByRole("checkbox", { name: "Power Plant" })).toBeChecked();
  await page.getByRole("button", { name: /Turn power grid on/i }).click();
  await expect(page.getByRole("button", { name: /Turn power grid off/i })).toBeVisible();
  await expect(powerPlant.getByRole("checkbox", { name: "Power Plant" })).toBeChecked();
  await captureVisualCheckpoint(page, testInfo, "economy-bulk-power-building");
});

test("Energy compares live generator mix with consumption accessibly @energy @accessibility", async ({
  page,
}) => {
  await startEconomyFixture(page, "power-buildings");
  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-power").click();
  for (const [paneId, buildingId] of [
    ["energy-power", "powerPlant1"],
    ["energy-power", "powerPlant2"],
    ["energy-power", "powerPlant3"],
  ] as const) {
    await page.locator(`#tab-${paneId}`).click();
    await page
      .locator(`[data-building-id="${buildingId}"] .economy-building-actions button`)
      .first()
      .click();
  }
  await page.locator("#tab-research").click();
  await expandResearchProduction(page);
  await page
    .locator('[data-building-id="scienceLab"] .economy-building-actions button')
    .first()
    .click();
  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-summary").click();

  const chart = page.getByRole("figure", { name: "Power generation mix" });
  await expect(chart).toBeVisible();
  const liveState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const livePower = createEconomyTickPlan(liveState);
  const localizeRate = (rate: number) =>
    formatNumber(liveState.settings.locale, rate, 2, liveState.settings.notation);
  for (const id of ["powerPlant1", "powerPlant2", "powerPlant3"] as const) {
    await expect(chart.getByTestId(`energy-generation-${id}`)).toHaveText(
      localizeRate(livePower.generationByPlantPerSecond[id]),
    );
  }
  await expect(chart.getByTestId("energy-generation-total")).toHaveText(
    `${localizeRate(livePower.generationPerSecond)} kJ/s`,
  );
  await expect(chart.getByTestId("energy-consumption-total")).toHaveText(
    `${localizeRate(livePower.demandPerSecond)} kJ/s`,
  );
  const expectedPlantDescription = (["powerPlant1", "powerPlant2", "powerPlant3"] as const)
    .map(
      (id) =>
        `${ECONOMY_BUILDING_NAMES[id].en}: ${localizeRate(livePower.generationByPlantPerSecond[id])} kJ/s`,
    )
    .join("; ");
  const expectedDescription = `${expectedPlantDescription}. Total generation: ${localizeRate(livePower.generationPerSecond)} kJ/s. Total consumption: ${localizeRate(livePower.demandPerSecond)} kJ/s.`;
  await expect(chart).toHaveAccessibleDescription(expectedDescription);

  await page.locator("#tab-energy-power").click();
  await page.getByRole("button", { name: /Turn power grid off/i }).click();
  await page.locator("#tab-energy-summary").click();
  await expect(chart.getByTestId("energy-generation-powerPlant1")).toHaveText("0");
  await expect(chart.getByTestId("energy-generation-powerPlant2")).toHaveText("0");
  await expect(chart.getByTestId("energy-generation-powerPlant3")).toHaveText("0");
  await expect(chart.getByTestId("energy-generation-total")).toHaveText("0 kJ/s");
  await expect(chart.getByTestId("energy-consumption-total")).toHaveText("0 kJ/s");
  await expect(chart).toContainText("Power grid off: active generators are producing 0 kJ/s.");
});

test("all power plant and battery tiers can be bought and controlled @energy @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "power-buildings");
  await page.getByRole("tab", { name: /Energy/ }).click();
  const initialCapacity = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.economy.power.capacity,
  );
  for (const id of [
    "powerPlant1",
    "powerPlant2",
    "powerPlant3",
    "battery1",
    "battery2",
    "battery3",
  ] as const) {
    await page
      .locator(id.startsWith("powerPlant") ? "#tab-energy-power" : "#tab-energy-batteries")
      .click();
    const card = page.locator(`[data-building-id="${id}"]`);
    await card.locator(".economy-building-actions button").first().click();
    await expect(card).toContainText("Owned: 1");
  }
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.capacity))
    .toBe(initialCapacity + 1_665_000);
  await page.locator("#tab-energy-power").click();
  const plants = ["powerPlant1", "powerPlant2", "powerPlant3"] as const;
  for (const id of plants) {
    await expect(page.locator(`[data-building-id="${id}"]`).getByRole("checkbox")).toBeChecked();
  }
  await page.getByRole("button", { name: /Turn power grid off/i }).click();
  for (const id of plants) {
    await expect(page.locator(`[data-building-id="${id}"]`).getByRole("checkbox")).toBeChecked();
  }
  await page.getByRole("button", { name: /Turn power grid on/i }).click();
  for (const id of plants) {
    await expect(page.locator(`[data-building-id="${id}"]`).getByRole("checkbox")).toBeChecked();
  }
  await captureVisualCheckpoint(page, testInfo, "economy-all-energy-buildings");
});

test("permanent production bonuses are reflected in the visible rates @energy @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "multipliers");
  const hydrogen = page.locator('[data-resource-id="hydrogen"]');
  await expect(hydrogen.getByTestId("hydrogen-rate")).toContainText("5.55");
  await expect(page.locator(".autobuyer-card")).toContainText("+4.5 per second");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-power").click();
  await expect(page.locator('[data-building-id="powerPlant2"]')).toContainText("+13.5 kJ/s");
  await captureVisualCheckpoint(page, testInfo, "economy-permanent-production-multipliers");
});

test("unaffordable research and energy purchases expose linked reasons before submission @research @energy @accessibility @p20-announcements", async ({
  page,
}) => {
  await startEconomyFixture(page, "research");
  await page.locator("#tab-research").click();
  await expandResearchProduction(page);

  const scienceKit = page.locator('[data-building-id="scienceKit"]');
  const sciencePurchase = scienceKit.locator(".economy-building-actions button").first();
  await expect(sciencePurchase).toBeEnabled();
  await sciencePurchase.click();
  await expect(sciencePurchase).toBeDisabled();
  await expect(sciencePurchase).toHaveAttribute(
    "aria-describedby",
    "research-building-scienceKit-reason",
  );
  const researchReason = page.locator("#research-building-scienceKit-reason");
  await expect(researchReason).toBeVisible();
  await expect(sciencePurchase).toHaveAccessibleDescription(/Need .* cash\./);

  await page.evaluate(() => {
    for (const storage of [localStorage, sessionStorage]) {
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
      for (const key of keys) {
        if (
          key?.startsWith("miaplacidus:v1:") ||
          key === "miaplacidus:test:economy-storage-cleared"
        )
          storage.removeItem(key);
      }
    }
  });
  await startEconomyFixture(page, "bulk-energy");
  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-power").click();

  const powerPlant = page.locator('[data-building-id="powerPlant1"]');
  const plantPurchase = powerPlant.locator(".economy-building-actions button").first();
  const plantBuyMax = powerPlant.getByRole("button", { name: "Buy max", exact: true });
  await expect(plantBuyMax).toBeEnabled();
  await plantBuyMax.click();
  await expect(plantBuyMax).toBeDisabled();
  await expect(plantPurchase).toBeDisabled();
  await expect(plantPurchase).toHaveAttribute(
    "aria-describedby",
    /energy-building-powerPlant1-reason/,
  );
  const energyReason = page.locator("#energy-building-powerPlant1-reason");
  await expect(energyReason).toBeVisible();
  await expect(plantPurchase).toHaveAccessibleDescription(/Need .* cash\./);
});

test("battery storage charges, drains under load, and recharges after load stops @energy @research", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "battery-cycle");
  const powerValue = page.getByTestId("top-stat-power").locator(".top-stat-value");
  await expect(powerValue).toBeVisible();
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-batteries").click();
  const battery = page.locator('[data-building-id="battery1"]');
  await battery.locator(".economy-building-actions button").first().click();
  await page.locator("#tab-energy-power").click();
  const solar = page.locator('[data-building-id="powerPlant2"]');
  await solar.locator(".economy-building-actions button").first().click();

  await page.getByRole("tab", { name: /Research/ }).click();
  await expandResearchProduction(page);
  const lab = page.locator('[data-building-id="scienceLab"]');
  await lab.locator(".economy-building-actions button").first().click();
  const labToggle = lab.locator("button[aria-pressed]");
  await expect(labToggle).toHaveAttribute("aria-pressed", "true");
  await labToggle.click();
  await expect(labToggle).toHaveAttribute("aria-pressed", "false");

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-summary").click();
  await expect(page.getByTestId("power-quantity")).toHaveText("300");
  await expect(powerValue).toHaveClass(/is-charging/);
  await captureVisualCheckpoint(page, testInfo, "economy-battery-charged");

  await page.getByRole("tab", { name: /Research/ }).click();
  await labToggle.click();
  await expect(labToggle).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-summary").click();
  await expect(page.getByTestId("power-quantity")).toHaveText("150");
  await expect(powerValue).toHaveClass(/is-discharging/);
  await captureVisualCheckpoint(page, testInfo, "economy-battery-discharged");

  await page.getByRole("tab", { name: /Research/ }).click();
  await labToggle.click();
  await expect(labToggle).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-summary").click();
  await expect(page.getByTestId("power-quantity")).toHaveText("350");
  await expect(powerValue).toHaveClass(/is-charging/);
  await captureVisualCheckpoint(page, testInfo, "economy-battery-recharged");
});

test("Energy Summary renders generator status and Power controls respond to player actions @energy", async ({ page }, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-summary").click();
  await expect(page.getByTestId("economy-energy")).toBeVisible();
  await expect(page.getByTestId("economy-energy").getByText(/Generated: .* kJ\/s/)).toBeVisible();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await captureVisualCheckpoint(page, testInfo, "economy-energy-panel");
  await page.locator("#tab-energy-power").click();
  await page.getByRole("button", { name: /Turn power grid off/i }).click();
  await page.getByRole("button", { name: /Turn power grid on/i }).click();
});

