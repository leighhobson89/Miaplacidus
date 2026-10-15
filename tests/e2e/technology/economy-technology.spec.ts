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

test.describe("Tech Tree zoom action targets @technology", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("meet the touch target and keyboard action size @p05-tech-tree-zoom @research @technology @keyboard @touch", async ({
    page,
  }) => {
    await startEconomyFixture(page, "research");
    await page.getByRole("tab", { name: /^Research/ }).click();
    await page.locator("#tab-research-tech-tree").click();

    const zoomOut = page.getByRole("button", { name: "Zoom out" });
    const zoom = page.getByRole("slider", { name: "Zoom" });
    const zoomIn = page.getByRole("button", { name: "Zoom in" });
    const resetZoom = page.getByRole("button", { name: "Reset zoom" });
    for (const control of [zoomOut, zoom, zoomIn, resetZoom]) {
      const target = await control.boundingBox();
      expect(target?.width).toBeGreaterThanOrEqual(44);
      expect(target?.height).toBeGreaterThanOrEqual(44);
    }

    await zoom.focus();
    await page.keyboard.press("Shift+Tab");
    await expect(zoomOut).toBeFocused();
    expect(await zoomOut.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    await page.keyboard.press("Enter");
    await expect(zoom).toHaveAttribute("aria-valuetext", "90%");

    await page.keyboard.press("Tab");
    await expect(zoom).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(zoomIn).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(zoom).toHaveAttribute("aria-valuetext", "100%");

    await page.keyboard.press("Tab");
    await expect(resetZoom).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(zoom).toHaveAttribute("aria-valuetext", "100%");

    await zoomOut.tap();
    await expect(zoom).toHaveAttribute("aria-valuetext", "90%");
    await zoomIn.tap();
    await expect(zoom).toHaveAttribute("aria-valuetext", "100%");
    await resetZoom.tap();
    await expect(zoom).toHaveAttribute("aria-valuetext", "100%");
  });
});

test("Technology Tree renders its graph to the player @technology", async ({ page }, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Research/ }).click();
  await page.locator("#tab-research-tech-tree").click();
  await expect(page.locator("#panel-research-tech-tree")).toBeVisible();
  await expect(page.locator("[data-technology-id]").first()).toBeVisible();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await captureVisualCheckpoint(page, testInfo, "economy-technology-panel");
});

