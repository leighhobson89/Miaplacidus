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
import { expectGoodStock, expandResearchProduction } from "../_harness/economyShared";

test("resource, research, power, compound, language and notation changes survive save and reload @save-load-local @resources @research @energy @compounds", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "save");
  const carbon = page.locator('[data-resource-id="carbon"]');
  await page.locator("#tab-resources-carbon").click();
  await carbon.getByRole("button", { name: "Gain 1", exact: true }).click();
  await page.locator("#tab-resources-hydrogen").click();
  await expandHydrogenAutobuyers(page.locator('[data-resource-id="hydrogen"]'));
  await page.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await expect(page.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  const hydrogenAutobuyer = page.locator(".autobuyer-card button[aria-pressed='true']");
  await hydrogenAutobuyer.click();
  const iron = page.locator('[data-resource-id="iron"]');
  await page.locator("#tab-resources-iron").click();
  await iron.getByRole("button", { name: /^Increase storage/i }).click();
  await expectGoodStock(iron, 0, 3_002);
  await page.getByRole("tab", { name: /Research/ }).click();
  await expandResearchProduction(page);
  const scienceKit = page.locator('[data-building-id="scienceKit"]');
  await scienceKit.locator(".economy-building-actions button").first().click();
  const scienceKitToggle = scienceKit.locator("button[aria-pressed]");
  await expect(scienceKitToggle).toHaveAttribute("aria-pressed", "true");
  await scienceKitToggle.click();
  await expect(scienceKitToggle).toHaveAttribute("aria-pressed", "false");
  await page.locator("#tab-research-tech-tree").click();
  await page.locator('[data-technology-id="fusionEfficiencyIII"]').click();
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-power").click();
  const plant = page.locator('[data-building-id="powerPlant1"]');
  await plant.locator(".economy-building-actions button").first().click();
  await page.locator("#tab-energy-batteries").click();
  const battery = page.locator('[data-building-id="battery1"]');
  await battery.locator(".economy-building-actions button").first().click();
  await page.locator("#tab-energy-power").click();
  await plant.getByRole("checkbox").uncheck();
  await page.getByRole("button", { name: "Turn power grid off" }).click();
  await page.getByRole("tab", { name: /Compounds/ }).click();
  const diesel = page.locator('[data-compound-id="diesel"]');
  const buyers = diesel.locator("details").filter({ hasText: "Buy tier 1" });
  await buyers.locator("summary").click();
  await buyers.getByLabel("Automatic creation").uncheck();
  await page.getByRole("button", { name: "Turn power grid on" }).click();
  await expect(diesel.getByRole("button", { name: "Create Diesel" })).toBeEnabled();
  await diesel.getByRole("button", { name: "Create Diesel" }).click();
  await page.getByRole("button", { name: "Turn power grid off" }).click();
  await page.getByRole("tab", { name: /Resources/ }).click();
  await page.locator("#tab-resources-carbon").click();
  const carbonAllocation = carbon.locator("details").filter({ hasText: "Production allocation" });
  await carbonAllocation.locator("summary").click();
  await setAllocationSlider(carbonAllocation, "Cash share", 40);
  await setNumberNotation(page, "scientific");
  await setGameLocale(page, "fr");
  const beforeSave = await page.evaluate(() => {
    const { run } = window.miaplacidusTest!.getState();
    return {
      cash: run.cash,
      researchPoints: run.researchPoints,
      hydrogenAutobuyerEnabled: run.hydrogenAutobuyerEnabled,
      goods: run.goods,
      upgrades: run.upgrades,
      economy: run.economy,
    };
  });
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-saves").click();
  await page.getByTestId("save-now").click();
  await page.reload();
  await page.locator("#start-locale").selectOption("fr");
  await page.locator("#pioneer-name").fill("Economy save");
  await page.getByRole("option").filter({ hasText: "Economy save" }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  const restored = await page.evaluate(() => window.miaplacidusTest?.getState());
  expect(restored?.settings).toMatchObject({ locale: "fr", notation: "scientific" });
  expect(restored?.run.cash).toBe(beforeSave.cash);
  expect(restored?.run.researchPoints).toBe(beforeSave.researchPoints);
  expect(restored?.run.hydrogenAutobuyerEnabled).toBe(beforeSave.hydrogenAutobuyerEnabled);
  expect(restored?.run.upgrades).toEqual(beforeSave.upgrades);
  expect(restored?.run.goods).toEqual(beforeSave.goods);
  expect(restored?.run.economy).toEqual(beforeSave.economy);
  expect(restored?.run.upgrades[autobuyerUpgradeId("hydrogen", 1)]).toBe(1);
  expect(restored?.run.upgrades["storage:iron"]).toBe(1);
  expect(restored?.run.goods.iron.storageCapacity).toBe(3_002);
  expect(restored?.run.hydrogenAutobuyerEnabled).toBe(false);
  expect(restored?.run.economy.buildingEnabled.scienceKit).toBe(false);
  expect(restored?.run.economy.buildingEnabled.powerPlant1).toBe(false);
  expect(restored?.run.economy.power.gridEnabled).toBe(false);
  await captureVisualCheckpoint(page, testInfo, "economy-save-reloaded");
});

