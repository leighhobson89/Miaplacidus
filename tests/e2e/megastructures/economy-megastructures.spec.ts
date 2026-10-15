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

test("Galactic Megastructures researches the Dyson power stage in its source-owned track @energy @technology @megastructures", async ({
  page,
}) => {
  await startEconomyFixture(page, "meta-megastructure-visual-dysonSphere");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-megastructures").click();
  const dysonTrack = page.getByTestId("megastructure-track-dysonSphere");
  await expect(dysonTrack.getByTestId("megastructure-next-stage")).toContainText(
    TECHNOLOGY_NAMES.dysonSpherePower.en,
  );
  await expect(dysonTrack.getByRole("button")).toBeEnabled();
  await dysonTrack.getByRole("button").click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.miaplacidusTest!
          .getState()
          .permanent.megastructures.researchedTechnologyIds.includes("dysonSpherePower"),
      ),
    )
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power))
    .toMatchObject({ infinitePower: true, gridEnabled: true });
});

