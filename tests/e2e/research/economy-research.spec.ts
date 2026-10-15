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
import { clearQueuedNotificationsThroughSettings, expandResearchProduction } from "../_harness/economyShared";

test("fresh Hydrogen progression reaches its first research through player controls @resources @research @autobuyers", async ({
  freshGame,
}, testInfo) => {
  const game = freshGame;
  await expect(game.getByTestId("top-stat-time")).toBeVisible();
  await expect(game.getByTestId("top-stat-energy")).toHaveCount(0);
  await expect(game.getByTestId("top-stat-power")).toHaveCount(0);
  await game.getByRole("tab", { name: /Research/ }).click();
  await expandResearchProduction(game);
  const scienceKit = game.locator('[data-building-id="scienceKit"]');
  await scienceKit.locator(".economy-building-actions button").first().click();
  await expect(scienceKit).toContainText("Quantity: 1");
  await expect(game.getByTestId("cash-balance")).toContainText("$5.00");
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-science-kit");

  await game.getByRole("tab", { name: /Resources/ }).click();
  const hydrogenCard = game.locator('[data-resource-id="hydrogen"]');
  await expect(hydrogenCard.locator(".economy-card-heading")).toHaveCount(0);
  await expect(game.getByRole("button", { name: "Increase affordable storage" })).toHaveCount(0);
  const hydrogenHero = hydrogenCard.locator(".hydrogen-hero");
  const storageCard = hydrogenCard.locator(".hydrogen-storage-card");
  const sellCard = hydrogenHero.locator(".sale-card");
  const [heroBounds, storageBounds, sellBounds] = await Promise.all([
    hydrogenHero.boundingBox(),
    storageCard.boundingBox(),
    sellCard.boundingBox(),
  ]);
  expect(heroBounds).not.toBeNull();
  expect(storageBounds).not.toBeNull();
  expect(sellBounds).not.toBeNull();
  expect(sellBounds!.y + sellBounds!.height).toBeLessThanOrEqual(
    heroBounds!.y + heroBounds!.height,
  );
  expect(heroBounds!.y + heroBounds!.height).toBeLessThanOrEqual(storageBounds!.y);
  await expect(sellCard.locator(".hydrogen-fusion-panel")).toHaveCount(1);
  await expect(sellCard.locator(".hydrogen-fusion-panel summary")).toHaveCount(0);
  await expect(sellCard.locator(".hydrogen-fusion-panel h4")).toBeVisible();
  const [sellBoundsForFusion, fusionBounds] = await Promise.all([
    sellCard.boundingBox(),
    sellCard.locator(".hydrogen-fusion-panel").boundingBox(),
  ]);
  expect(sellBoundsForFusion).not.toBeNull();
  expect(fusionBounds).not.toBeNull();
  expect(fusionBounds!.x).toBeCloseTo(sellBoundsForFusion!.x, 0);
  expect(fusionBounds!.width).toBeCloseTo(sellBoundsForFusion!.width, 0);
  const hydrogenTiers = hydrogenCard.locator("details").filter({ hasText: "Buy tier" });
  await hydrogenTiers.locator("summary").click();
  await expect(hydrogenCard.locator(".autobuyer-card")).toBeVisible();
  await expect(
    hydrogenTiers.locator(".economy-tier").filter({ hasText: "Buy tier 2:" }),
  ).toContainText("Quantum Computing");
  await expect(
    hydrogenTiers.locator(".economy-tier").filter({ hasText: "Buy tier 4:" }),
  ).toContainText("Rocket Composites");
  await hydrogenTiers.locator("summary").click();
  const allocation = hydrogenCard.locator("details").filter({ hasText: "Production allocation" });
  await allocation.locator("summary").click();
  await expect(allocation.getByRole("slider", { name: "Cash share (%)" })).toBeDisabled();
  await expect(allocation.getByText("Locked by: Nano Brokers I")).toBeVisible();
  await allocation.locator("summary").click();
  await hydrogenCard.locator(".hydrogen-autobuyer-section > summary").click();
  const collect = game.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  for (let count = 0; count < 50; count += 1) await collect.click();
  await expect(game.getByTestId("hydrogen-quantity")).toContainText("50");
  await game.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await expect(game.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  await expect(game.getByTestId("hydrogen-quantity")).toContainText("0");
  await expect(hydrogenCard).not.toContainText("Compressor purchase complete.");
  await hydrogenCard.locator(".hydrogen-autobuyer-section > summary").click();
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-hydrogen-compressor");

  await game.evaluate(() => window.miaplacidusTest!.advanceBy(200_000));
  await expect(game.getByTestId("hydrogen-quantity")).toContainText("150");
  await expect(game.getByTestId("research-balance")).toHaveText("150");
  await game.getByRole("tab", { name: /Research/ }).click();
  await expect(game.getByTestId("research-rate")).toContainText("0.5");
  await expect(game.getByTestId("research-points")).toContainText("150");
  await game.locator("#tab-research-tech-tree").click();
  await clearQueuedNotificationsThroughSettings(game);
  await game.getByRole("tab", { name: /Research/ }).click();
  await game.locator("#tab-research-tech-tree").click();
  const firstTechnology = game.locator('[data-technology-id="knowledgeSharing"]');
  await expect(firstTechnology).toHaveAttribute("aria-disabled", "false");
  await firstTechnology.click();
  await expect(firstTechnology).toHaveAttribute("aria-label", /^RESEARCHED:/i);
  await expect(firstTechnology.locator(".technology-map-researched")).toBeVisible();
  const researchNotification = game.locator(
    '[data-testid="game-notification"][data-classification="tech"]',
  ).filter({ hasText: "Knowledge Sharing Researched" });
  await expect(researchNotification).toHaveAttribute("data-classification", "tech");
  await expect(researchNotification).toHaveText(
    technologyNotificationText("en", "knowledgeSharing", TECHNOLOGY_NAMES.knowledgeSharing.en),
  );
  const noticePosition = await game
    .getByTestId("notification-stack")
    .evaluate((stack) => {
      const bounds = stack.getBoundingClientRect();
      return {
        position: getComputedStyle(stack).position,
        right: window.innerWidth - bounds.right,
        bottom: window.innerHeight - bounds.bottom,
      };
    });
  expect(noticePosition.position).toBe("fixed");
  expect(noticePosition.right).toBeLessThanOrEqual(20);
  expect(noticePosition.bottom).toBeLessThanOrEqual(20);
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-first-research");
  expect(
    await game.evaluate(() => window.miaplacidusTest!.getState().run.upgrades.scienceKit),
  ).toBe(1);

  await game.locator("#tab-settings").click();
  const settings = game.getByTestId("settings-pane");
  await settings.locator("#tab-settings-statistics").click();
  const researchStatistics = settings.getByTestId("settings-statistics");
  await expect(
    researchStatistics.locator('[data-statistic-id="researchPointsEarned"] strong'),
  ).toHaveText(["100", "100"]);
  await expect(
    researchStatistics.locator('[data-statistic-id="scienceKitsBuilt"] strong'),
  ).toHaveText(["1", "1"]);
  await expect(
    researchStatistics.locator('[data-statistic-id="scienceClubsBuilt"] strong'),
  ).toHaveText(["0", "0"]);
  await expect(
    researchStatistics.locator('[data-statistic-id="scienceLabsBuilt"] strong'),
  ).toHaveText(["0", "0"]);
});

test("Hydrogen tier-2 help remains populated while Quantum Computing gates the tier @resources @research @autobuyers @p44-copy", async ({
  page,
}) => {
  await startEconomyFixture(page, "research");
  const hydrogen = page.locator('[data-resource-id="hydrogen"]');
  const hydrogenAutobuyers = hydrogen.locator(".hydrogen-autobuyer-section");
  if ((await hydrogenAutobuyers.getAttribute("open")) === null)
    await hydrogenAutobuyers.locator("summary").click();
  const tierTwo = hydrogenAutobuyers.locator(".economy-tier").filter({ hasText: "Buy tier 2:" });
  const help = tierTwo.locator(".economy-action-description");

  expect(
    await page.evaluate(() =>
      window
        .miaplacidusTest!.getState()
        .run.economy.researchedTechnologies.includes("quantumComputing"),
    ),
  ).toBe(false);
  await expect(tierTwo).toContainText("Quantum Computing");
  await expect(help).toBeVisible();
  await expect(help).not.toBeEmpty();

  expect(
    await page.evaluate(() => window.miaplacidusTest!.applyDebugAction("give-1m-research")),
  ).toBe(true);
  await page.getByRole("tab", { name: /^Research/ }).click();
  await page.locator("#tab-research-tech-tree").click();
  for (const technology of [
    "knowledgeSharing",
    "fusionTheory",
    "hydrogenFusion",
    "heliumFusion",
    "nanoTubeTechnology",
    "quantumComputing",
  ]) {
    const node = page.locator(`[data-technology-id="${technology}"]`);
    await expect(node).toBeVisible();
    await expect(node).toHaveAttribute("aria-disabled", "false");
    await node.click();
  await expect(node).toHaveAttribute("aria-label", /^RESEARCHED:/i);
  }

  expect(
    await page.evaluate(() =>
      window
        .miaplacidusTest!.getState()
        .run.economy.researchedTechnologies.includes("quantumComputing"),
    ),
  ).toBe(true);
  await page.getByRole("tab", { name: /Resources/ }).click();
  await page.locator("#tab-resources-hydrogen").click();
  if ((await hydrogenAutobuyers.getAttribute("open")) === null)
    await hydrogenAutobuyers.locator("summary").click();
  await expect(help).toBeVisible();
  await expect(help).not.toBeEmpty();
});

test("Bulk Purchasing buys an affordable Science Kit and keeps its displayed cash balance in sync @research @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "bulk-science");
  await page.locator("#tab-research").click();
  await expandResearchProduction(page);
  const scienceKit = page.locator('[data-building-id="scienceKit"]');
  await expect(scienceKit.locator(".economy-rate")).toContainText("total cost");
  await expect(scienceKit.getByRole("button", { name: "Buy max" })).toBeEnabled();
  await scienceKit.getByRole("button", { name: "Buy max" }).click();
  await expect(scienceKit).toContainText("Quantity: 2");
  const cashAfterPurchase = await page.evaluate(() => window.miaplacidusTest!.getState().run.cash);
  expect(cashAfterPurchase).toBeGreaterThanOrEqual(0);
  await expect(page.getByTestId("cash-balance")).toHaveText(formatCurrency("en", cashAfterPurchase));
  await captureVisualCheckpoint(page, testInfo, "economy-bulk-research-building");
});

test("all science buildings can be purchased and report their live research rate @research @energy", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Research/ }).click();
  await expandResearchProduction(page);
  for (const id of ["scienceKit", "scienceClub", "scienceLab"] as const) {
    const card = page.locator(`[data-building-id="${id}"]`);
    await card.locator(".economy-building-actions button").first().click();
    await expect(card).toContainText("Quantity: 1");
  }
  await expect(page.getByTestId("research-rate")).toHaveText("28.5");
  await captureVisualCheckpoint(page, testInfo, "economy-all-research-buildings");
});

test("Research building pane displays its active panel @research", async ({ page }, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Research/ }).click();
  await expect(page.getByTestId("economy-research")).toBeVisible();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await captureVisualCheckpoint(page, testInfo, "economy-research-buildings-panel");
});

