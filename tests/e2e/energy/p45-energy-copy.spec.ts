import { expect, test } from "../_harness/fixtures";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { ENERGY_BUILDINGS } from "../../../src/content/economy";
import { ECONOMY_BUILDING_NAMES } from "../../../src/content/economyBuildingNames";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { buildingCost } from "../../../src/engine/commands";
import { createEconomyTickPlan } from "../../../src/engine/economySimulation";
import { displayCurrency } from "../../../src/engine/precision";
import { selectEconomyAction } from "../../../src/engine/selectors";
import type { GameState } from "../../../src/engine/state";
import { economyLabel, formatEconomyMessage } from "../../../src/i18n/economyMessages";
import { translate } from "../../../src/i18n/messages";

async function startEconomyFixture(
  page: import("@playwright/test").Page,
  fixture: "research" | "bulk-energy",
  locale: LocaleId,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=${locale}&economyFixture=${fixture}`);
  await page.getByLabel(translate(locale, "app.pioneer")).fill(`P-45 Research Energy ${locale}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

function insufficientCashReason(
  locale: LocaleId,
  state: GameState,
  buildingId: "scienceKit" | "powerPlant1" | "battery1",
): string {
  const purchase = selectEconomyAction(state, {
    type: "economy.building.purchase",
    buildingId,
  });
  expect(purchase.enabled).toBe(false);
  expect(purchase.failure?.code).toBe("insufficient-cash");
  const requiredCash = formatCurrency(
    locale,
    Number(displayCurrency(purchase.failure!.required)),
    state.settings.currencyId ?? "usd",
    2,
    state.settings.notation,
  );
  return formatEconomyMessage(locale, "needCashAmount", { amount: requiredCash });
}

test("Energy Summary, Batteries, and Power status and actions stay localized in all six locales @p45-research-energy-copy @energy", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const locale of LOCALE_IDS) {
    await startEconomyFixture(page, "bulk-energy", locale);
    await page.locator("#tab-energy").click();
    await page.locator("#tab-energy-summary").click();

    const energyPanel = page.locator("#panel-energy");
    const heading = energyPanel.locator(".economy-section-heading");
    await expect(heading.locator("h2")).toHaveText(economyLabel(locale, "energySummary"));
    await expect(heading.locator("p").nth(0)).toContainText(economyLabel(locale, "generated"));
    await expect(heading.locator("p").nth(0)).toContainText(economyLabel(locale, "consumed"));
    await expect(heading.locator("p").nth(1)).toContainText(economyLabel(locale, "unavailable"));
    await expect(heading.locator("p").nth(2)).toContainText(economyLabel(locale, "stored"));
    await expect(heading.locator("p").nth(2)).toContainText(economyLabel(locale, "capacity"));

    const generationChart = energyPanel.locator(".energy-generation-chart");
    await expect(generationChart.locator("figcaption")).toHaveText(
      economyLabel(locale, "generationMix"),
    );
    await expect(generationChart.locator(".energy-generation-chart-row").nth(0)).toContainText(
      economyLabel(locale, "generationTotal"),
    );
    await expect(generationChart.locator(".energy-generation-chart-row").nth(1)).toContainText(
      economyLabel(locale, "energyConsumption"),
    );

    await page.locator("#tab-energy-power").click();
    const powerButton = energyPanel.locator(".energy-master-switch");
    await expect(powerButton).toHaveText(economyLabel(locale, "deactivatePower"));
    await powerButton.click();
    await expect(powerButton).toHaveText(economyLabel(locale, "activatePower"));
    await page.locator("#tab-energy-summary").click();
    await expect(energyPanel.locator(".energy-generation-state")).toHaveText(
      economyLabel(locale, "powerGridOff"),
    );
    await page.locator("#tab-energy-power").click();
    await powerButton.click();
    await expect(powerButton).toHaveText(economyLabel(locale, "deactivatePower"));

    const plant = energyPanel.locator('[data-building-id="powerPlant1"]');
    const plantBuy = plant.locator(".economy-building-actions button").first();
    await expect(plantBuy).toBeEnabled();
    await expect(plantBuy).toHaveAccessibleName(
      formatEconomyMessage(locale, "addPowerPlantRate", {
        rate: String(ENERGY_BUILDINGS.powerPlant1.ratePerSecond),
      }),
    );
    let plantPurchases = 0;
    while (plantPurchases < 6 && (await plantBuy.isEnabled())) {
      await plantBuy.click();
      plantPurchases += 1;
    }
    expect(plantPurchases).toBeGreaterThan(0);
    await expect(plantBuy).toBeDisabled();
    const state = (await page.evaluate(() => window.miaplacidusTest!.getState())) as GameState;
    await expect(page.locator("#energy-building-powerPlant1-reason")).toHaveText(
      insufficientCashReason(locale, state, "powerPlant1"),
    );
    const plantToggle = plant.locator(".economy-toggle");
    const plantToggleInput = plantToggle.locator("input");
    const plantStartsEnabled = await plantToggleInput.isChecked();
    await expect(plantToggle).toContainText(
      economyLabel(locale, plantStartsEnabled ? "deactivatePowerPlant" : "activatePowerPlant"),
    );
    await plantToggleInput.setChecked(!plantStartsEnabled);
    await expect(plantToggleInput).toHaveJSProperty("checked", !plantStartsEnabled);
    await expect(plantToggle).toContainText(
      economyLabel(locale, plantStartsEnabled ? "activatePowerPlant" : "deactivatePowerPlant"),
    );

    await page.locator("#tab-energy-batteries").click();
    const battery = energyPanel.locator('[data-building-id="battery1"]');
    const batteryBuy = battery.locator(".economy-building-actions button").first();
    await expect(battery.locator("h3")).toHaveText(`${ECONOMY_BUILDING_NAMES.battery1[locale]}:`);
    const batteryState = (await page.evaluate(() =>
      window.miaplacidusTest!.getState(),
    )) as GameState;
    await expect(batteryBuy).toHaveAccessibleName(
      formatEconomyMessage(locale, "addEnergyCapacity", {
        capacity: formatNumber(
          locale,
          Math.floor(ENERGY_BUILDINGS.battery1.capacity / 1000),
          2,
          batteryState.settings.notation,
        ),
      }),
    );
    await expect(batteryBuy).toBeDisabled();
    await expect(page.locator("#battery-battery1-reason")).toHaveText(
      insufficientCashReason(locale, batteryState, "battery1"),
    );
    await expect(batteryBuy).toHaveAttribute("aria-describedby", /battery-battery1-reason/);
  }
});
