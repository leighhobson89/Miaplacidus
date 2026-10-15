import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { ENERGY_BUILDINGS } from "../../../src/content/economy";
import { ECONOMY_BUILDING_NAMES } from "../../../src/content/economyBuildingNames";
import { LOCALE_IDS } from "../../../src/content/ids";
import { formatNumber } from "../../../src/app/numberFormatting";
import { formatEconomyMessage, economyLabel } from "../../../src/i18n/economyMessages";
import { setGameLocale } from "../_harness/settings-controls";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

const batteryHelpById = {
  battery1: "battery1Help",
  battery2: "battery2Help",
  battery3: "battery3Help",
} as const;

const plantHelpTooltipById = {
  powerPlant1: "powerPlant1Help",
  powerPlant2: "powerPlant2Help",
  powerPlant3: "powerPlant3Help",
} as const;

async function startFullEconomyFixture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261008&testLocale=en&economyFixture=full");
  await page.getByLabel("Pioneer name").fill("Energy Tier Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test(
  "Cosmic Forge Tab 2 Energy rows, section copy, and source action labels follow the selected locale @p7-energy-tier-copy-locales @energy @locale",
  async ({ page }) => {
    test.setTimeout(120_000);
    await startFullEconomyFixture(page);
    await page.locator("#tab-energy").click();
    await page.locator("#tab-energy-power").click();
    for (const plantId of ["powerPlant1", "powerPlant2", "powerPlant3"] as const) {
      const plant = page.locator(`[data-building-id="${plantId}"]`);
      await plant.locator(".economy-building-actions button").first().click();
    }

    for (const locale of LOCALE_IDS) {
      await setGameLocale(page, locale);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await page.locator("#tab-energy").click();

      const energy = page.getByTestId("economy-energy");
      await page.locator("#tab-energy-summary").click();
      const generationRows = energy.locator(".energy-generation-legend li");
      await expect(generationRows).toHaveCount(3);
      const plantIds = ["powerPlant1", "powerPlant2", "powerPlant3"] as const;
      for (const [index, plantId] of plantIds.entries()) {
        await expect(generationRows.nth(index).locator("span").nth(1)).toHaveText(
          ECONOMY_BUILDING_NAMES[plantId][locale],
        );
      }

      await expect(page.locator("#tab-energy-batteries")).toContainText(
        economyLabel(locale, "energyStorage"),
      );
      await page.locator("#tab-energy-batteries").click();
      await expect(energy.locator(".economy-section-heading p")).toHaveText(
        economyLabel(locale, "batteryStorageHelp"),
      );
      const energyState = await page.evaluate(() => window.miaplacidusTest!.getState());
      for (const batteryId of ["battery1", "battery2", "battery3"] as const) {
        const battery = energy.locator(`[data-building-id="${batteryId}"]`);
        await expect(battery).toBeVisible();
        await expect(battery.locator("h3")).toHaveText(
          `${ECONOMY_BUILDING_NAMES[batteryId][locale]}:`,
        );
        const batteryHelpTrigger = battery.getByTestId(`energy-${batteryId}-help-trigger`);
        await batteryHelpTrigger.focus();
        const batteryHelpTooltip = page.getByTestId(`energy-${batteryId}-help`);
        await expect(batteryHelpTooltip).toBeVisible();
        await expect(batteryHelpTooltip).toHaveText(
          economyLabel(locale, batteryHelpById[batteryId]),
        );
        await expect(battery.locator("p").first()).toContainText(
          economyLabel(locale, "capacity"),
        );
        await expect(
          battery.locator(".economy-building-actions button").first(),
        ).toHaveAccessibleName(
          formatEconomyMessage(locale, "addEnergyCapacity", {
            capacity: formatNumber(
              locale,
              Math.floor(ENERGY_BUILDINGS[batteryId].capacity / 1000),
              2,
              energyState.settings.notation,
            ),
          }),
        );
      }

      await expect(page.locator("#tab-energy-power")).toContainText(
        economyLabel(locale, "energyPower"),
      );
      await page.locator("#tab-energy-power").click();
      const plantHelpById = {
        powerPlant1: "powerPlantSupplyHelp",
        powerPlant2: "solarPowerPlantRenewable",
        powerPlant3: "advancedPowerPlantHelp",
      } as const;
      for (const plantId of plantIds) {
        const plant = energy.locator(`[data-building-id="${plantId}"]`);
        await expect(plant).toBeVisible();
        await expect(plant.locator("h3")).toHaveText(
          `${ECONOMY_BUILDING_NAMES[plantId][locale]}:`,
        );
        const plantHelpTrigger = plant.getByTestId(
          `energy-building-${plantId}-help-trigger`,
        );
        await plantHelpTrigger.focus();
        const plantHelpTooltip = page.getByTestId(`energy-building-${plantId}-help`);
        await expect(plantHelpTooltip).toBeVisible();
        await expect(plantHelpTooltip).toHaveText(
          economyLabel(locale, plantHelpTooltipById[plantId]),
        );
        await expect(plant.locator(`#energy-building-${plantId}-purchase-help`)).toHaveText(
          economyLabel(locale, plantHelpById[plantId]),
        );
        const rateKey =
          plantId === "powerPlant2" ? "addMaxPowerPlantRate" : "addPowerPlantRate";
        const labelTemplate = formatEconomyMessage(locale, rateKey, { rate: "__RATE__" });
        const [beforeRate, afterRate] = labelTemplate.split("__RATE__");
        await expect(
          plant.locator(".economy-building-actions button").first(),
        ).toHaveAccessibleName(
          new RegExp(
            `^${escapeRegExp(beforeRate ?? "")}.+${escapeRegExp(afterRate ?? "")}$`,
            "u",
          ),
        );
        const plantToggle = plant.locator(".economy-toggle");
        const plantToggleInput = plantToggle.locator('input[type="checkbox"]');
        await expect(plantToggle).toHaveText(economyLabel(locale, "deactivatePowerPlant"));
        await plantToggleInput.uncheck();
        await expect(plantToggle).toHaveText(economyLabel(locale, "activatePowerPlant"));
        await plantToggleInput.check();
      }
    }
  },
);
