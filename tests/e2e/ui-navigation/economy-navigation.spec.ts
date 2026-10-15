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
import { dismissRandomEventResultIfOpen, clearTransientEconomyOverlays, clearQueuedNotificationsThroughSettings, expandResearchProduction, visibleMainTabIds } from "../_harness/economyShared";

test("fresh Hydrogen progression unlocks Energy and Compounds in source tab order through player actions @resources @energy @research @compounds @ui-navigation @progression", async ({
  freshGame: game,
}, testInfo) => {
  test.setTimeout(180_000);
  await expect(game.getByTestId("top-stat-energy")).toHaveCount(0);
  await expect(game.getByTestId("top-stat-power")).toHaveCount(0);
  await game.getByRole("tab", { name: /Research/ }).click();
  await expandResearchProduction(game);
  await game
    .locator('[data-building-id="scienceKit"] .economy-building-actions button')
    .first()
    .click();

  await game.getByRole("tab", { name: /Resources/ }).click();
  const collectHydrogen = game.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  for (let count = 0; count < 50; count += 1) await collectHydrogen.click();
  await expandHydrogenAutobuyers(game.locator('[data-resource-id="hydrogen"]'));
  await game.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await game.evaluate(() => window.miaplacidusTest!.advanceBy(74_500));
  await dismissRandomEventResultIfOpen(game);
  await game.getByRole("button", { name: "Increase storage", exact: true }).click();
  await expect(game.getByTestId("hydrogen-capacity")).toHaveText("300");

  await game.locator("#hydrogen-sell-amount").selectOption("all");
  const sellHydrogen = game.getByRole("button", { name: "Sell", exact: true });
  for (let cycle = 0; cycle < 96; cycle += 1) {
    await game.evaluate(() => window.miaplacidusTest!.advanceBy(150_000));
    await dismissRandomEventResultIfOpen(game);
    await sellHydrogen.click();
  }
  const cashAfterHydrogenSales = await game.evaluate(
    () => window.miaplacidusTest!.getState().run.cash,
  );
  expect(cashAfterHydrogenSales).toBeGreaterThanOrEqual(581);
  await expect(
    game.locator(".game-nav").getByRole("tab", { name: "Energy", exact: true }),
  ).toHaveCount(0);
  expect(await visibleMainTabIds(game)).toEqual(["hydrogen", "research", "settings", "miaplaedia"]);

  await game.getByRole("tab", { name: /Research/ }).click();
  await game.locator("#tab-research-tech-tree").click();
  const knowledgeSharing = game.locator('[data-technology-id="knowledgeSharing"]');
  const knowledgeSharingButton = knowledgeSharing;
  await expect(knowledgeSharingButton).toBeEnabled();
  await knowledgeSharingButton.click();
  // This scenario verifies progression; the dedicated locale notification test verifies the tech toast.
  await expect(knowledgeSharingButton).toHaveAttribute("aria-label", /^RESEARCHED:/i);
  await game.mouse.move(0, 0);
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-progression-first-research");
  await game.locator("#tab-research-science-buildings").click();
  await game
    .locator('[data-building-id="scienceClub"] .economy-building-actions button')
    .first()
    .click();
  await game.locator("#tab-research-tech-tree").click();
  await game.evaluate(() => window.miaplacidusTest!.advanceBy(3_200_000));
  await dismissRandomEventResultIfOpen(game);
  await game.evaluate(() => window.miaplacidusTest!.advanceBy(1_500_000));
  await dismissRandomEventResultIfOpen(game);

  const technologies = [
    "fusionTheory",
    "hydrogenFusion",
    "heliumFusion",
    "nanoTubeTechnology",
    "nobleGasCollection",
    "carbonFusion",
    "basicPowerGeneration",
    "compounds",
    "hydroCarbons",
  ] as const;
  for (const technologyId of technologies) {
    const technology = game.locator(`[data-technology-id="${technologyId}"]`);
    await expect(technology).toBeEnabled();
    await technology.click();
    await expect(technology.locator(".technology-map-researched")).toBeVisible();
    if (technologyId === "basicPowerGeneration") {
      await expect(game.getByTestId("top-stat-energy")).toBeVisible();
      const powerValue = game.getByTestId("top-stat-power").locator(".top-stat-value");
      await expect(powerValue).toBeVisible();
      await expect(powerValue).toContainText("No Battery");
      expect(await visibleMainTabIds(game)).toEqual([
        "hydrogen",
        "research",
        "energy",
        "settings",
        "miaplaedia",
      ]);
    }
    if (technologyId === "compounds") {
      expect(await visibleMainTabIds(game)).toEqual([
        "hydrogen",
        "compounds",
        "research",
        "energy",
        "settings",
        "miaplaedia",
      ]);
    }
  }

  await game.getByRole("tab", { name: /Resources/ }).click();
  const hydrogen = game.locator('[data-resource-id="hydrogen"]');
  const hydrogenFusion = hydrogen.locator(".resource-fusion-panel");
  await expect(hydrogenFusion.locator("summary")).toHaveCount(0);
  await expect(hydrogenFusion.locator("h4")).toBeVisible();
  await hydrogenFusion.getByLabel("Output Hydrogen").selectOption("helium");
  await hydrogenFusion.getByLabel("Fuse Amount Hydrogen").fill("50");
  await hydrogenFusion.getByRole("button", { name: "Fuse Hydrogen", exact: true }).click();
  const helium = game.locator('[data-resource-id="helium"]');
  const heliumPaneTab = game.locator("#tab-resources-helium");
  const resourcesTab = game.locator("#tab-hydrogen");
  await expect(heliumPaneTab).toBeVisible();
  await expect(heliumPaneTab.locator(".attention-badge")).toHaveText("New");
  await expect(resourcesTab.locator(".attention-badge")).toHaveText("New");
  await game.locator(".resource-rail .resource-item").filter({ hasText: "Helium" }).click();
  await expect(heliumPaneTab).toHaveAttribute("aria-selected", "true");
  await expect(helium).toBeVisible();
  await expect(heliumPaneTab.locator(".attention-badge")).toHaveCount(0);
  await expect(resourcesTab.locator(".attention-badge")).toHaveCount(0);
  const heliumFusion = helium.locator(".resource-fusion-panel");
  await expect(heliumFusion.locator("summary")).toHaveCount(0);
  await expect(heliumFusion.locator("h4")).toBeVisible();
  await heliumFusion.getByLabel("Fuse Amount Helium").fill("7");
  await heliumFusion.getByRole("button", { name: "Fuse Helium", exact: true }).click();
  const carbon = game.locator('[data-resource-id="carbon"]');
  const carbonPaneTab = game.locator("#tab-resources-carbon");
  await expect(carbonPaneTab.locator(".attention-badge")).toHaveText("New");
  await game.locator(".resource-rail .resource-item").filter({ hasText: "Carbon" }).click();
  await expect(carbonPaneTab).toHaveAttribute("aria-selected", "true");
  await expect(carbon).toBeVisible();
  await expect(carbonPaneTab.locator(".attention-badge")).toHaveCount(0);
  await game.locator("#tab-resources-hydrogen").click();
  const hydrogenResourceCard = game.locator('[data-resource-id="hydrogen"]');
  await expandHydrogenAutobuyers(hydrogenResourceCard);
  const activeHydrogenAutobuyer = hydrogenResourceCard.locator(
    ".autobuyer-card button[aria-pressed='true']",
  );
  await expect(activeHydrogenAutobuyer).toHaveCount(1);
  await activeHydrogenAutobuyer.click();
  await expect(
    hydrogenResourceCard.locator(".autobuyer-card button[aria-pressed='true']"),
  ).toHaveCount(0);
  const hydrogenStock = await game.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.hydrogen,
  );
  expect(hydrogenStock.quantity).toBeLessThan(hydrogenStock.storageCapacity);
  await game.locator("#tab-resources-carbon").click();
  await clearQueuedNotificationsThroughSettings(game);
  await game.locator("#tab-hydrogen").click();
  await game.locator("#tab-resources-carbon").click();
  await expect(carbonPaneTab).toHaveAttribute("aria-selected", "true");
  await clearTransientEconomyOverlays(game);
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-carbon-discovered");

  await expect(game.getByRole("tab", { name: /Energy/ })).toBeEnabled();
  const energyMainTab = game.locator("#tab-energy");
  await expect(energyMainTab.locator(".attention-badge")).toHaveText("New");
  const energySummaryTab = game.locator("#tab-energy-summary");
  const batteriesTab = game.locator("#tab-energy-batteries");
  const batteriesBadge = batteriesTab.locator(".attention-badge");
  const powerPlantTab = game.locator("#tab-energy-power");
  const powerPlantBadge = powerPlantTab.locator(".attention-badge");
  await saveNowFromSettings(game);
  await game.reload();
  await resumeSavedPioneer(game, "Hydrogen Pioneer");
  await expect(energyMainTab.locator(".attention-badge")).toHaveText("New");
  await expect
    .poll(() => game.evaluate(() => Boolean(window.miaplacidusTest)))
    .toBe(true);
  const pendingAttentionIds = await game.evaluate(
    () => window.miaplacidusTest!.getState().run.navigationAttentionIds,
  );
  expect(pendingAttentionIds).toContain("energy");
  expect(pendingAttentionIds).toContain("energy-power");
  await game.locator(".resource-rail .resource-item").filter({ hasText: "Carbon" }).click();
  await expect(carbonPaneTab).toHaveAttribute("aria-selected", "true");
  await energyMainTab.click();
  await expect(powerPlantBadge).toHaveText("New");
  await expect(energySummaryTab).toHaveAttribute("aria-selected", "true");
  await batteriesTab.click();
  await expect(game.locator("#pane-energy [data-building-id='battery1']")).toBeVisible();
  await expect(energyMainTab.locator(".attention-badge")).toHaveText("New");
  await expect(batteriesBadge).toHaveCount(0);
  await expect(powerPlantBadge).toHaveText("New");
  await clearTransientEconomyOverlays(game);
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-first-energy");
  await powerPlantTab.click();
  await expect(powerPlantBadge).toHaveCount(0);
  await expect(energyMainTab.locator(".attention-badge")).toHaveCount(0);
  await expect(game.locator('[data-building-id="powerPlant1"]')).toBeVisible();
  await expect(game.getByRole("tab", { name: /Compounds/ })).toBeEnabled();
  await game.getByRole("tab", { name: /Compounds/ }).click();
  const diesel = game.locator('[data-compound-id="diesel"]');
  await expect(diesel).toBeVisible();
  await expect(diesel).toContainText("Hydrogen");
  await game.mouse.move(0, 0);
  await game.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-first-compound");
  await game.locator("#tab-energy").click();
  await expect(powerPlantTab).toHaveAttribute("aria-selected", "true");
  await expect(game.locator('[data-building-id="powerPlant1"]')).toBeVisible();
  await game.locator("#tab-hydrogen").click();
  await expect(carbonPaneTab).toHaveAttribute("aria-selected", "true");
  await expect(carbon).toBeVisible();
});

