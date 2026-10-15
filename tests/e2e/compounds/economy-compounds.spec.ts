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
import { expectGoodStock } from "../_harness/economyShared";

test("all six compound storage upgrades are usable, including shared Water inputs @compounds @resources @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "storage-compounds");
  await page.getByRole("tab", { name: /Compounds/ }).click();

  for (const id of ["diesel", "glass", "steel", "concrete", "water", "titanium"] as const) {
    await page.locator(`#tab-compounds-${id}`).click();
    const card = page.locator(`[data-compound-id="${id}"]`);
    const startingCapacity = await page.evaluate(
      (goodId) => window.miaplacidusTest!.getState().run.goods[goodId].storageCapacity,
      id,
    );
    const storage = card.getByRole("button", { name: "Increase storage" });
    await expect(storage).toBeEnabled();
    await storage.click();
    await expect(card.locator(".capacity-line")).toContainText(
      formatNumber("en", startingCapacity * 2),
    );
    if (id === "concrete") {
      await card.getByRole("spinbutton", { name: "Amount Concrete" }).fill("30");
      await card.getByRole("button", { name: "Create Concrete" }).click();
      await expectGoodStock(card, 30, 100);
    }
  }
  await expectGoodStock(page.locator('[data-compound-id="water"]'), 0, 200);
  await expectGoodStock(page.locator('[data-compound-id="concrete"]'), 0, 100);
  await captureVisualCheckpoint(page, testInfo, "economy-all-compound-storage");
});

test("Water storage explains and charges its Water and Concrete costs @resources @compounds @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "water-storage");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  await page.locator("#tab-compounds-water").click();
  const water = page.locator('[data-compound-id="water"]');
  const storage = water.getByRole("button", { name: /^Increase storage/i });
  await expect(storage).toBeEnabled();
  await expect(water.locator('[data-testid="storage-card-water"] .cost-line')).toContainText(
    "99 H₂O + 30 Concrete",
  );
  await storage.click();
  await expectGoodStock(water, 0, 200);
  await expectGoodStock(page.locator('[data-compound-id="concrete"]'), 0, 50);
  await captureVisualCheckpoint(page, testInfo, "economy-water-storage-expanded");
});

test("Water storage stays disabled until both displayed inputs are affordable @resources @compounds @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "water-storage-short");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  await page.locator("#tab-compounds-water").click();
  const water = page.locator('[data-compound-id="water"]');
  const storage = water.getByRole("button", { name: /^Increase storage/i });
  await expect(storage).toBeDisabled();
  await expect(water.locator('[data-testid="storage-card-water"] .cost-line')).toContainText(
    "99 H₂O + 30 Concrete",
  );
  await expectGoodStock(page.locator('[data-compound-id="concrete"]'), 29, 50);
  await captureVisualCheckpoint(page, testInfo, "economy-water-storage-blocked");
});

test("all six compound cards support creation, sale, and storage controls @compounds", async ({ page }) => {
  await startEconomyFixture(page, "full");
  const compoundIds = ["diesel", "glass", "steel", "concrete", "water", "titanium"];
  await page.getByRole("tab", { name: /Compounds/ }).click();
  await expect(page.locator("[data-compound-id]")).toHaveCount(compoundIds.length);
  for (const id of compoundIds) {
    await page.locator("#tab-compounds-" + id).click();
    const card = page.locator("[data-compound-id=\"" + id + "\"]");
    await expect(card).toBeVisible();
    const heading = id[0].toUpperCase() + id.slice(1);
    await expect(card.getByRole("button", { name: "Create " + heading })).toBeEnabled();
    await card.getByRole("button", { name: "Create " + heading }).click();
    await expectGoodStock(card, 1_501);
    await card.getByLabel("Sale amount " + heading).selectOption("1");
    await card.getByRole("button", { name: new RegExp("Sell " + heading) }).click();
    await expectGoodStock(card, 1_500);
    if (id === "glass") {
      await card.getByLabel("Sale amount " + heading).selectOption("all");
      await card.getByRole("button", { name: new RegExp("Sell " + heading) }).click();
      await expectGoodStock(card, 0, 100_000);
    }
    await expect(card.getByRole("button", { name: "Increase storage" })).toBeDisabled();
  }
});


