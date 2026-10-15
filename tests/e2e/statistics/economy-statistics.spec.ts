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

test("P-41 Statistics use default Condensed notation and update to Standard at a boundary @settings @statistics @notation", async ({
  page,
}) => {
  await startEconomyFixture(page, "notation-coverage");
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-statistics").click();
  const statistics = page.getByTestId("settings-statistics");
  const resourceStock = statistics.locator('[data-statistic-id="resourceStock"] dd');
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const totalResources = MATERIAL_IDS.reduce(
    (total, id) => total + state.run.goods[id].quantity,
    0,
  );
  expect(state.settings.notation).toBe("condensed");
  expect(totalResources).toBeGreaterThan(999);
  await expect(resourceStock).toHaveText(formatNumber("en", totalResources, 0, "condensed"));

  await setNumberNotation(page, "standard");
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-statistics").click();
  await expect(
    page.getByTestId("settings-statistics").locator('[data-statistic-id="resourceStock"] dd'),
  ).toHaveText(formatNumber("en", totalResources, 0, "standard"));
});

