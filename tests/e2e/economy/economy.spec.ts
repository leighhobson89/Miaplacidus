import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { devices, type Locator, type Page } from "@playwright/test";
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

async function expandAllDetails(container: Locator): Promise<void> {
  const closedSummaries = container.locator("details:not([open]) > summary:visible");
  while ((await closedSummaries.count()) > 0) await closedSummaries.first().press("Enter");
  await expect(container.locator("details:not([open]) > summary:visible")).toHaveCount(0);
}

async function collapseAllDetails(container: Locator): Promise<void> {
  const openDetails = container.locator("details[open] > summary:visible");
  while ((await openDetails.count()) > 0) await openDetails.first().press("Enter");
}

async function expectHydrogenStyleGoodLayout(
  card: Locator,
  options: { readonly hasFusion: boolean; readonly compound?: boolean },
): Promise<void> {
  await expect(card.locator(".economy-card-heading")).toHaveCount(0);
  await expect(card.locator(".pane-intro")).toHaveCount(0);
  const hero = card.locator(".hydrogen-hero");
  const stock = hero.locator(".stock-readout > strong");
  const storage = card.locator(".hydrogen-storage-card");
  const sale = hero.locator(".sale-card");
  await expect(hero).toBeVisible();
  await expect(stock).toBeVisible();
  await expect(storage).toBeVisible();
  await expect(sale).toBeVisible();

  const panelOrder = await card.evaluate((node) =>
    Array.from(node.children)
      .filter((child) => !child.matches(".live-feedback"))
      .map((child) => {
        if (child.matches(".pane-heading")) return "heading";
        if (child.matches(".hydrogen-hero")) return "hero";
        if (child.matches(".hydrogen-storage-card")) return "storage";
        if (child.matches(".economy-details")) {
          const label = child.querySelector("summary")?.textContent?.trim() ?? "";
          return label.toLocaleLowerCase();
        }
        return child.className.toString();
      }),
  );
  expect(panelOrder).toEqual(
    options.compound
      ? ["heading", "hero", "storage", "autobuyers"]
      : ["heading", "hero", "storage", "autobuyers", "production allocation"],
  );

  const [heroBounds, storageBounds, saleBounds] = await Promise.all([
    hero.boundingBox(),
    storage.boundingBox(),
    sale.boundingBox(),
  ]);
  expect(heroBounds).not.toBeNull();
  expect(storageBounds).not.toBeNull();
  expect(saleBounds).not.toBeNull();
  expect(saleBounds!.y).toBeGreaterThanOrEqual(heroBounds!.y);
  expect(saleBounds!.y + saleBounds!.height).toBeLessThanOrEqual(
    heroBounds!.y + heroBounds!.height + 1,
  );
  expect(heroBounds!.y + heroBounds!.height).toBeLessThanOrEqual(storageBounds!.y + 1);
  expect(Math.abs(heroBounds!.x - storageBounds!.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(heroBounds!.width - storageBounds!.width)).toBeLessThanOrEqual(2);

  const fusion = sale.locator(".resource-fusion-panel");
  if (options.hasFusion) {
    await expect(fusion).toBeVisible();
    await expect(fusion.locator("summary")).toHaveCount(0);
    const fusionBounds = await fusion.boundingBox();
    expect(fusionBounds).not.toBeNull();
    expect(fusionBounds!.y).toBeGreaterThanOrEqual(saleBounds!.y);
    expect(fusionBounds!.x).toBeCloseTo(saleBounds!.x, 0);
    expect(fusionBounds!.width).toBeCloseTo(saleBounds!.width, 0);
  } else {
    await expect(fusion).toHaveCount(0);
  }
}

async function expectGoodStock(card: Locator, quantity: number, capacity?: number): Promise<void> {
  await expect(card.locator(".stock-readout > strong")).toContainText(formatNumber("en", quantity));
  if (capacity !== undefined) {
    await expect(card.locator(".capacity-line")).toContainText(formatNumber("en", capacity));
  }
}

async function expectLocalizedContent(locator: Locator): Promise<void> {
  await expect(locator).not.toBeEmpty();
  await expect(locator).not.toContainText("???");
}

async function dismissRandomEventResultIfOpen(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const dialog = page.getByTestId("random-event-result-dialog");
  if (!(await dialog.isVisible())) return;
  await dialog.getByRole("button").click();
  await expect(dialog).not.toBeVisible();
}

async function clearTransientEconomyOverlays(page: Page): Promise<void> {
  const tutorial = page.locator(".progression-tutorial");
  if (await tutorial.isVisible()) {
    await tutorial.locator("button").last().click();
    await expect(tutorial).toHaveCount(0);
  }
  await expect(page.getByTestId("notification-stack")).toBeEmpty({ timeout: 15_000 });
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.locator(".top-stat-tooltip:visible")).toHaveCount(0);
}

async function clearQueuedNotificationsThroughSettings(page: Page): Promise<void> {
  await page.locator("#tab-settings").click();
  const notifications = page.locator("#settings-notifications");
  await expect(notifications).toBeChecked();
  await notifications.uncheck();
  await expect(page.locator('[data-testid="game-notification"]')).toHaveCount(0);
  await notifications.check();
  await expect(notifications).toBeChecked();
}

async function expandHydrogenAutobuyers(container: Locator): Promise<void> {
  const section = container.locator(".hydrogen-autobuyer-section");
  if ((await section.getAttribute("open")) === null) await section.locator("summary").click();
}

async function setAllocationSlider(
  allocation: Locator,
  label: "Cash share" | "Compound share",
  value: number,
): Promise<void> {
  const slider = allocation.getByRole("slider", { name: `${label} (%)` });
  const currentValue = Number(await slider.getAttribute("aria-valuenow"));
  const distance = Math.abs(value - currentValue);
  if (distance % 5 !== 0) throw new Error("Allocation values must use five-point increments.");
  const key = value > currentValue ? "ArrowRight" : "ArrowLeft";
  for (let step = 0; step < distance / 5; step += 1) await slider.press(key);
}

async function expandResearchProduction(page: Page): Promise<void> {
  await page.locator("#tab-research-science-buildings").click();
  await expect(
    page.locator("#panel-research-science-buildings .research-production-section"),
  ).toBeVisible();
}

async function startEconomyFixture(
  page: Page,
  fixture:
    | "full"
    | "notation-coverage"
    | "research"
    | "infinite-power"
    | "power-deficit"
    | "battery-cycle"
    | "storage"
    | "storage-efficient"
    | "storage-each"
    | "storage-compounds"
    | "storage-all"
    | "water-storage"
    | "water-storage-short"
    | "storage-production"
    | "save"
    | "bulk-hydrogen"
    | "bulk-science"
    | "bulk-energy"
    | "power-buildings"
    | "buyer-tiers"
    | "compound-automation"
    | "multipliers"
    | "meta-megastructure-factory-dysonSphere"
    | "meta-megastructure-visual-dysonSphere",
  locale: LocaleId = "en",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const clearedFlag = "miaplacidus:test:economy-storage-cleared";
    if (sessionStorage.getItem(clearedFlag) === "1") return;
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
    sessionStorage.setItem(clearedFlag, "1");
  });
  await page.goto(`/?testSeed=20261003&testLocale=${locale}&economyFixture=${fixture}`);
  await page.locator("#pioneer-name").fill(`Economy ${fixture}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

async function visibleMainTabIds(page: Page): Promise<(string | null)[]> {
  return page
    .locator(".game-nav [role='tab']")
    .evaluateAll((tabs) =>
      tabs.map((tab) => tab.getAttribute("aria-controls")?.replace(/^pane-/, "") ?? null),
    );
}

test("resource catalogue controls collect, preview, sell, store, and fuse through clicks @resources @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.locator("#tab-resources-carbon").click();
  const carbon = page.locator('[data-resource-id="carbon"]');
  await carbon.getByRole("button", { name: "Gain 1", exact: true }).click();
  await expectGoodStock(carbon, 2_001, 100_000);
  await carbon.getByLabel("Sale amount Carbon").selectOption("half");
  await expect(carbon.getByText(/Sale preview:/)).toContainText("$");
  await captureVisualCheckpoint(page, testInfo, "economy-resource-catalogue");
  await carbon.getByRole("button", { name: /Sell Carbon/ }).click();
  await expectGoodStock(carbon, 1_001, 100_000);
  await clearQueuedNotificationsThroughSettings(page);
  await page.locator("#tab-hydrogen").click();
  await page.locator("#tab-resources-carbon").click();
  await carbon.getByText("Fuse", { exact: true }).click();
  await carbon.getByLabel("Output Carbon").selectOption("neon");
  await carbon.getByLabel("Fuse Amount Carbon").fill("100");
  await carbon.getByRole("button", { name: "Fuse Carbon" }).click();
  await expect
    .poll(async () =>
      page.evaluate(() => window.miaplacidusTest?.getState().run.goods.neon.quantity),
    )
    .toBeGreaterThan(1_500);
  const fusionNotice = page
    .getByTestId("notification-stack")
    .locator('[data-testid="game-notification"][data-classification="fuse"]')
    .filter({ hasText: "Fused 100 Carbon into 30 Neon." });
  await expect(fusionNotice).toHaveText("Fused 100 Carbon into 30 Neon.");
  await page.locator("#tab-resources-neon").click();
  await expect(page.locator('[data-resource-id="neon"]')).toContainText("Neon");
});

test("first fusion discovery reports stored yield before later fusions report efficiency loss @resources @fusion @notifications", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await startEconomyFixture(page, "research");
  await page.getByRole("tab", { name: /^Research/ }).click();
  await page.locator("#tab-research-tech-tree").click();

  await page.locator('[data-technology-id="knowledgeSharing"]').click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_500_000));
  await expect(page.getByTestId("research-points")).toHaveText("750");
  await page.locator('[data-technology-id="fusionTheory"]').click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(2_300_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.researchPoints))
    .toBeGreaterThanOrEqual(1_150);
  await page.locator('[data-technology-id="hydrogenFusion"]').click();

  await page.getByRole("tab", { name: /Resources/ }).click();
  const collectHydrogen = page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  const collectUntilFusionReady = async () => {
    for (let count = 0; count <= 100; count += 1) {
      const quantity = await page.evaluate(
        () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
      );
      if (quantity >= 100) return;
      await collectHydrogen.click();
    }
    throw new Error("Hydrogen stock did not reach the fusion amount.");
  };
  await collectUntilFusionReady();

  await page.getByLabel("Output Hydrogen").selectOption("helium");
  await page.getByLabel("Fuse Amount Hydrogen").fill("100");
  await page.getByRole("button", { name: "Fuse Hydrogen", exact: true }).click();
  const fusionNotifications = page.locator(
    '[data-testid="game-notification"][data-classification="fuse"]',
  );
  await expect(fusionNotifications.last()).toHaveText(
    "Discovered Helium by fusing 100 Hydrogen: 13 Helium generated, 13 stored; 37 lost to fusion inefficiency and 0 to limited storage.",
  );
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.helium.quantity))
    .toBe(13);

  const hydrogenHero = page.locator('[data-resource-id="hydrogen"] .hydrogen-hero');
  const saleCard = hydrogenHero.locator(".sale-card");
  const fusionPanel = saleCard.locator(".hydrogen-fusion-panel");
  await expect(fusionPanel).toBeVisible();
  await expect(fusionPanel.locator("summary")).toHaveCount(0);
  const [saleBounds, fusionBounds] = await Promise.all([
    saleCard.boundingBox(),
    fusionPanel.boundingBox(),
  ]);
  expect(saleBounds).not.toBeNull();
  expect(fusionBounds).not.toBeNull();
  expect(fusionBounds!.x).toBeCloseTo(saleBounds!.x, 0);
  expect(fusionBounds!.width).toBeCloseTo(saleBounds!.width, 0);
  await captureVisualCheckpoint(page, testInfo, "economy-hydrogen-fusion-open");

  await collectUntilFusionReady();
  await page.getByRole("button", { name: "Fuse Hydrogen", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.helium.quantity))
    .toBeGreaterThan(13);
  const laterYield = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.helium.quantity - 13,
  );
  await expect(fusionNotifications.last()).toHaveText(
    `Fused 100 Hydrogen into Helium: received ${laterYield}; ${50 - laterYield} lost to fusion inefficiency (ideal output 50).`,
  );
});

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

test("all eight material cards and six compounds are usable through player controls @resources @compounds @autobuyers", async ({
  page,
}) => {
  await startEconomyFixture(page, "full");
  const materialIds = [
    "hydrogen",
    "helium",
    "carbon",
    "neon",
    "oxygen",
    "sodium",
    "silicon",
    "iron",
  ];
  const compoundIds = ["diesel", "glass", "steel", "concrete", "water", "titanium"];
  await expect(page.locator("[data-resource-id]")).toHaveCount(materialIds.length);

  for (const id of materialIds) {
    await page.locator(`#tab-resources-${id}`).click();
    const card = page.locator(`[data-resource-id="${id}"]`);
    await expect(card).toBeVisible();
    if (id === "hydrogen") {
      await page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true }).click();
      await expect(page.getByTestId("hydrogen-quantity")).toContainText(formatNumber("en", 2_001));
      continue;
    }

    const materialName = id[0]!.toUpperCase() + id.slice(1);
    const startingQuantity = id === "carbon" ? 2_000 : 1_500;
    await card.getByRole("button", { name: "Gain 1", exact: true }).click();
    await expectGoodStock(card, startingQuantity + 1, 100_000);
    await card.getByLabel(`Sale amount ${materialName}`).selectOption("half");
    await expect(card.getByText(/Sale preview:/)).toContainText("$");
    await card.getByRole("button", { name: new RegExp(`Sell ${materialName}`) }).click();
    const afterSale = startingQuantity + 1 - Math.floor((startingQuantity + 1) / 2);
    await expectGoodStock(card, afterSale, 100_000);

    const autobuyers = card.locator("details").filter({ hasText: "Buy tier 1" }).first();
    await autobuyers.locator("summary").click();
    await autobuyers
      .locator(".economy-tier")
      .first()
      .getByRole("button", { name: "Buy max" })
      .click();
    await expect(autobuyers.locator(".economy-tier").first()).toContainText(/Buy tier 1: [1-9]\d*/);
  }

  await page.getByRole("tab", { name: /Compounds/ }).click();
  await expect(page.locator("[data-compound-id]")).toHaveCount(compoundIds.length);
  for (const id of compoundIds) {
    await page.locator(`#tab-compounds-${id}`).click();
    const card = page.locator(`[data-compound-id="${id}"]`);
    await expect(card).toBeVisible();
    const heading = id[0]!.toUpperCase() + id.slice(1);
    await expect(card.getByRole("button", { name: `Create ${heading}` })).toBeEnabled();
    await card.getByRole("button", { name: `Create ${heading}` }).click();
    await expectGoodStock(card, 1_501);
    await card.getByLabel(`Sale amount ${heading}`).selectOption("1");
    await card.getByRole("button", { name: new RegExp(`Sell ${heading}`) }).click();
    await expectGoodStock(card, 1_500);
    if (id === "glass") {
      await card.getByLabel(`Sale amount ${heading}`).selectOption("all");
      await card.getByRole("button", { name: new RegExp(`Sell ${heading}`) }).click();
      await expectGoodStock(card, 0, 100_000);
    }
    await expect(card.getByRole("button", { name: "Increase storage" })).toBeDisabled();
  }

  await page.locator("#tab-compounds-diesel").click();
  const diesel = page.locator('[data-compound-id="diesel"]');
  const dieselBuyers = diesel.locator("details").filter({ hasText: "Buy tier 1" });
  await dieselBuyers.locator("summary").click();
  await dieselBuyers.getByLabel("Automatic creation").uncheck();
  await dieselBuyers
    .locator(".economy-tier")
    .first()
    .getByRole("button", { name: "Buy max" })
    .click();
  await expect(dieselBuyers.locator(".economy-tier").first()).toContainText(/Buy tier 1: 1/);
  const dieselBuyerToggle = dieselBuyers.locator(".economy-tier").first().locator("button[aria-pressed]");
  await expect(dieselBuyerToggle).toHaveAttribute("aria-pressed", "true");
  await dieselBuyerToggle.click();
  await expect(dieselBuyerToggle).toHaveAttribute("aria-pressed", "false");
});

test("material and compound pages share the Hydrogen layout and compounds have a left rail @resources @compounds @ui", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");

  await page.locator("#tab-hydrogen").click();
  const resourceRail = page.getByTestId("resource-rail");
  await expect(resourceRail).toBeVisible();
  let resourceChildHeaderGap: number | undefined;
  let hydrogenHeroGap = 0;
  for (const id of MATERIAL_IDS) {
    if (id !== "hydrogen") await page.getByTestId(`resource-rail-${id}`).click();
    const card = page.locator(`[data-resource-id="${id}"]`);
    await expect(card).toBeVisible();
    {
      const layout = page.locator(
        id === "hydrogen"
          ? ".tab-section-layout:not(.resource-page-selected)"
          : ".tab-section-layout.resource-page-selected",
      );
      if (id !== "hydrogen")
        await expect(layout.locator(".economy-section")).toHaveCSS("border-top-width", "0px");
      const [navBounds, headingBounds] = await Promise.all([
        layout.locator(".pane-nav-scroll").boundingBox(),
        card.locator(".pane-heading h2").boundingBox(),
      ]);
      const heroBounds = await card.locator(".hydrogen-hero").boundingBox();
      expect(navBounds).not.toBeNull();
      expect(headingBounds).not.toBeNull();
      expect(heroBounds).not.toBeNull();
      const headingGap = headingBounds!.y - (navBounds!.y + navBounds!.height);
      const heroGap = heroBounds!.y - (headingBounds!.y + headingBounds!.height);
      if (id !== "hydrogen") {
        if (resourceChildHeaderGap === undefined) resourceChildHeaderGap = headingGap;
        else expect(Math.abs(headingGap - resourceChildHeaderGap)).toBeLessThanOrEqual(2);
      }
      if (id === "hydrogen") hydrogenHeroGap = heroGap;
      else expect(Math.abs(heroGap - hydrogenHeroGap)).toBeLessThanOrEqual(2);
    }
    await expectHydrogenStyleGoodLayout(card, {
      hasFusion: MATERIAL_CATALOG[id].fusionOutputs !== undefined,
    });
  }
  await captureVisualCheckpoint(page, testInfo, "economy-hydrogen-style-material-layouts");

  await page.locator("#tab-compounds").click();
  expect(resourceChildHeaderGap).toBeDefined();
  const compoundRail = page.getByTestId("compound-rail");
  await expect(compoundRail).toBeVisible();
  for (const id of COMPOUND_IDS) {
    await page.getByTestId(`compound-rail-${id}`).click();
    const card = page.locator(`[data-compound-id="${id}"]`);
    await expect(card).toBeVisible();
    const compoundLayout = page.locator(".tab-section-layout.compound-page-selected");
    await expect(compoundLayout.locator(".economy-section")).toHaveCSS("border-top-width", "0px");
    const [navBounds, headingBounds] = await Promise.all([
      compoundLayout.locator(".pane-nav-scroll").boundingBox(),
      card.locator(".pane-heading h2").boundingBox(),
    ]);
    const heroBounds = await card.locator(".hydrogen-hero").boundingBox();
    expect(navBounds).not.toBeNull();
    expect(headingBounds).not.toBeNull();
    expect(heroBounds).not.toBeNull();
    const headingGap = headingBounds!.y - (navBounds!.y + navBounds!.height);
    const heroGap = heroBounds!.y - (headingBounds!.y + headingBounds!.height);
    expect(Math.abs(headingGap - resourceChildHeaderGap!)).toBeLessThanOrEqual(2);
    expect(Math.abs(heroGap - hydrogenHeroGap)).toBeLessThanOrEqual(2);
    await expectHydrogenStyleGoodLayout(card, { hasFusion: false, compound: true });

    const [railBounds, cardBounds] = await Promise.all([
      compoundRail.boundingBox(),
      card.boundingBox(),
    ]);
    expect(railBounds).not.toBeNull();
    expect(cardBounds).not.toBeNull();
    expect(railBounds!.x + railBounds!.width).toBeLessThanOrEqual(cardBounds!.x + 1);
  }
  await captureVisualCheckpoint(page, testInfo, "economy-hydrogen-style-compound-layouts");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#tab-hydrogen").click();
  await page.getByTestId("resource-rail-hydrogen").click();
  const hydrogenMobileHeadingBounds = await page
    .locator('[data-resource-id="hydrogen"] .pane-heading h2')
    .boundingBox();
  const hydrogenMobileHeroBounds = await page
    .locator('[data-resource-id="hydrogen"] .hydrogen-hero')
    .boundingBox();
  expect(hydrogenMobileHeadingBounds).not.toBeNull();
  expect(hydrogenMobileHeroBounds).not.toBeNull();
  const hydrogenMobileHeroGap =
    hydrogenMobileHeroBounds!.y -
    (hydrogenMobileHeadingBounds!.y + hydrogenMobileHeadingBounds!.height);
  const expectPhoneLayout = async (card: Locator) => {
    await expect(card).toBeVisible();
    const [scrollWidth, viewportWidth, heroBounds, storageBounds] = await Promise.all([
      page.evaluate(() => document.documentElement.scrollWidth),
      page.evaluate(() => document.documentElement.clientWidth),
      card.locator(".hydrogen-hero").boundingBox(),
      card.locator(".hydrogen-storage-card").boundingBox(),
    ]);
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
    expect(heroBounds).not.toBeNull();
    expect(storageBounds).not.toBeNull();
    expect(Math.abs(heroBounds!.x - storageBounds!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(heroBounds!.width - storageBounds!.width)).toBeLessThanOrEqual(2);
    const headingBounds = await card.locator(".pane-heading h2").boundingBox();
    expect(headingBounds).not.toBeNull();
    const heroGap = heroBounds!.y - (headingBounds!.y + headingBounds!.height);
    expect(Math.abs(heroGap - hydrogenMobileHeroGap)).toBeLessThanOrEqual(2);
  };

  await page.locator("#tab-hydrogen").click();
  for (const id of MATERIAL_IDS) {
    await page.getByTestId(`resource-rail-${id}`).click();
    await expectPhoneLayout(page.locator(`[data-resource-id="${id}"]`));
  }
  await page.locator("#tab-compounds").click();
  for (const id of COMPOUND_IDS) {
    await page.getByTestId(`compound-rail-${id}`).click();
    await expectPhoneLayout(page.locator(`[data-compound-id="${id}"]`));
  }
  await captureVisualCheckpoint(page, testInfo, "economy-hydrogen-style-mobile-compounds");
});

test("storage purchase consumes the displayed Hydrogen cost and doubles its capacity @resources", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "storage");
  await page.getByRole("button", { name: "Increase storage", exact: true }).click();
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText("300");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("0");
  await captureVisualCheckpoint(page, testInfo, "economy-storage-expanded");
});

test("full storage identifies active automatic production and clears when paused @resources @accessibility", async ({
  page,
}) => {
  await startEconomyFixture(page, "storage-production");

  const hydrogenPanel = page.locator("#panel-resources-hydrogen");
  await expect(hydrogenPanel.getByTestId("production-blocked-hydrogen")).toHaveText(
    economyLabel("en", "automaticProductionBlockedByStorage"),
  );
  await hydrogenPanel.locator(".hydrogen-autobuyer-section > summary").click();
  await hydrogenPanel.getByRole("button", { name: "Autobuyer for Hydrogen, tier 1" }).click();
  await expect(hydrogenPanel.getByTestId("production-blocked-hydrogen")).toHaveCount(0);

  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-water").click();
  const waterPanel = page.locator("#panel-compounds-water");
  await expect(waterPanel.getByTestId("production-blocked-water")).toHaveText(
    economyLabel("en", "automaticProductionBlockedByStorage"),
  );
  await waterPanel.locator(".economy-details > summary").click();
  const waterAutobuyerToggle = waterPanel.locator(".economy-details button[aria-pressed]");
  await expect(waterAutobuyerToggle).toHaveAttribute("aria-pressed", "true");
  await waterAutobuyerToggle.click();
  await expect(waterAutobuyerToggle).toHaveAttribute("aria-pressed", "false");
  await expect(waterPanel.getByTestId("production-blocked-water")).toHaveCount(0);
});

test("all eight material storage upgrades are individually usable through clicks @resources @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "storage-each");
  await page.getByRole("button", { name: "Increase storage", exact: true }).click();
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText("300");

  const materialIds = ["helium", "carbon", "neon", "oxygen", "sodium", "silicon", "iron"] as const;
  for (const id of materialIds) {
    await page.locator(`#tab-resources-${id}`).click();
    const card = page.locator(`[data-resource-id="${id}"]`);
    const startingCapacity = await page.evaluate((goodId) => {
      const state = window.miaplacidusTest!.getState();
      return state.run.goods[goodId].storageCapacity;
    }, id);
    await card.getByRole("button", { name: "Increase storage" }).click();
    await expect(card.locator(".capacity-line")).toContainText(
      formatNumber("en", startingCapacity * 2),
    );
  }
  await captureVisualCheckpoint(page, testInfo, "economy-each-material-storage");
});

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

test("every resource and compound autobuyer tier can be bought, resumed, and paused @autobuyers @resources @compounds @energy", async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  await startEconomyFixture(page, "buyer-tiers");

  const compressor = page.locator(".autobuyer-card");
  await page.locator(".hydrogen-autobuyer-section > summary").click();
  await compressor.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await expect(page.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");

  for (const id of [
    "hydrogen",
    "helium",
    "carbon",
    "neon",
    "oxygen",
    "sodium",
    "silicon",
    "iron",
  ] as const) {
    await page.locator(`#tab-resources-${id}`).click();
    const card = page.locator(`[data-resource-id="${id}"]`);
    const autobuyers = card.locator("details").filter({ hasText: "Buy tier" });
    if (id !== "hydrogen") await autobuyers.locator("summary").click();
    const tiers = id === "hydrogen" ? ([2, 3, 4] as const) : ([1, 2, 3, 4] as const);
    for (const tier of tiers) {
      const row = autobuyers.locator(".economy-tier").filter({ hasText: `Buy tier ${tier}:` });
      await row
        .getByRole("button")
        .filter({ hasText: /^Buy ·/ })
        .click();
      await expect(row).toContainText(new RegExp(`Buy tier ${tier}: 1`));
      const toggle = row.locator("button[aria-pressed]");
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-pressed", "false");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    }
    if (id !== "hydrogen") await autobuyers.locator("summary").click();
  }
  await captureVisualCheckpoint(page, testInfo, "economy-all-material-autobuyer-tiers");

  await page.getByRole("tab", { name: /Compounds/ }).click();
  for (const id of ["diesel", "glass", "steel", "concrete", "water", "titanium"] as const) {
    await page.locator(`#tab-compounds-${id}`).click();
    const card = page.locator(`[data-compound-id="${id}"]`);
    const autobuyers = card.locator("details").filter({ hasText: "Buy tier" });
    await autobuyers.locator("summary").click();
    for (const tier of [1, 2, 3, 4] as const) {
      const row = autobuyers.locator(".economy-tier").filter({ hasText: `Buy tier ${tier}:` });
      await row
        .getByRole("button")
        .filter({ hasText: /^Buy ·/ })
        .click();
      await expect(row).toContainText(new RegExp(`Buy tier ${tier}: 1`));
      const toggle = row.locator("button[aria-pressed]");
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-pressed", "false");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    }
    await autobuyers.locator("summary").click();
  }
  await captureVisualCheckpoint(page, testInfo, "economy-all-compound-autobuyer-tiers");
});

test("Efficient Storage shows its rank-adjusted capacity before the player buys @resources @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "storage-efficient");
  const storageCard = page
    .locator(".upgrade-card")
    .filter({ hasText: "149" })
    .filter({ has: page.getByRole("button", { name: "Increase storage", exact: true }) });
  await expect(storageCard.getByText(/150 → 600/)).toBeVisible();
  await storageCard.getByRole("button", { name: "Increase storage", exact: true }).click();
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText("600");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("0");
  await captureVisualCheckpoint(page, testInfo, "economy-efficient-storage");
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

test("individual storage controls replace the bulk storage action @resources @compounds @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "storage-all");
  await expect(page.getByRole("button", { name: "Increase affordable storage" })).toHaveCount(0);
  await page
    .locator('[data-resource-id="hydrogen"]')
    .getByRole("button", { name: /^Increase storage/i })
    .click();
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText(formatNumber("en", 200_000));
  await page.getByRole("tab", { name: /Compounds/ }).click();
  await page.locator("#tab-compounds-water").click();
  await page
    .locator('[data-compound-id="water"]')
    .getByRole("button", { name: /^Increase storage/i })
    .click();
  await expectGoodStock(page.locator('[data-compound-id="water"]'), 0, 200_000);
  await expectGoodStock(page.locator('[data-compound-id="concrete"]'), 0, 100_000);
  await captureVisualCheckpoint(page, testInfo, "economy-increase-all-storage");
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

test("Bulk Purchasing buys the affordable Hydrogen compressors from its player pane @resources @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "bulk-hydrogen");
  await expandHydrogenAutobuyers(page.locator('[data-resource-id="hydrogen"]'));
  const compressor = page.locator(".autobuyer-card");
  const buyMax = compressor.getByRole("button", { name: "Buy max", exact: true });
  await expect(buyMax).toBeEnabled();
  await expect(compressor).toContainText(
    "Buy max: 2 · total cost 107 Hydrogen · result +4 Hydrogen per second.",
  );
  await buyMax.click();
  await expect(page.getByTestId("hydrogen-autobuyer-count")).toHaveText("2");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("43");
  await expect(buyMax).toBeDisabled();
  await expect(buyMax).toHaveAccessibleDescription(/Need 65 Hydrogen; available: 43\./);
  await captureVisualCheckpoint(page, testInfo, "economy-bulk-hydrogen-buyers");
});

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

test("Power Plant sale notification remains conditional because no sale action exists @p08-notifications", async ({
  page,
}) => {
  await startEconomyFixture(page, "power-buildings");
  await page.locator("#tab-energy").click();
  await page.locator("#tab-energy-power").click();

  for (const id of ["powerPlant1", "powerPlant2", "powerPlant3"] as const) {
    const plant = page.locator(`[data-building-id="${id}"]`);
    await expect(plant).toBeVisible();
    await plant.locator(".economy-building-actions button").first().click();
    await expect(plant.locator(".economy-building-actions button").first()).toBeVisible();
    await expect(plant.getByRole("button", { name: /sell/i })).toHaveCount(0);
    await expect(plant.getByRole("checkbox")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          (buildingId) => window.miaplacidusTest!.getState().run.upgrades[buildingId],
          id,
        ),
      )
      .toBe(1);
  }
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

test("player-set allocations sell only new Hydrogen and Carbon production @autosell @resources @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  for (const id of ["diesel", "glass", "steel", "concrete", "water", "titanium"]) {
    await page.locator(`#tab-compounds-${id}`).click();
    const card = page.locator(`[data-compound-id="${id}"]`);
    await card.locator("details").locator("summary").click();
    const autoCreate = card.getByLabel("Automatic creation");
    if (await autoCreate.isChecked()) await autoCreate.uncheck();
  }
  await page.locator("#tab-hydrogen").click();
  const hydrogenAllocation = page
    .locator('[data-resource-id="hydrogen"]')
    .locator("details")
    .filter({ hasText: "Production allocation" });
  await hydrogenAllocation.locator("summary").click();
  const cashHandle = hydrogenAllocation.getByRole("slider", { name: "Cash share (%)" });
  const compoundHandle = hydrogenAllocation.getByRole("slider", { name: "Compound share (%)" });
  const track = hydrogenAllocation.locator(".allocation-slider-track");
  const trackBounds = await track.boundingBox();
  expect(trackBounds).not.toBeNull();
  await cashHandle.focus();
  const initialCashShare = Number(await cashHandle.getAttribute("aria-valuenow"));
  await cashHandle.press("ArrowRight");
  await expect(cashHandle).toHaveAttribute("aria-valuenow", String(initialCashShare + 5));
  await page.mouse.move(
    trackBounds!.x + trackBounds!.width * 0.2,
    trackBounds!.y + trackBounds!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    trackBounds!.x + trackBounds!.width * 0.4,
    trackBounds!.y + trackBounds!.height / 2,
    { steps: 4 },
  );
  await page.mouse.up();
  await expect(cashHandle).toHaveAttribute("aria-valuenow", "40");
  const compoundBoundaryBeforeKey = Number(await compoundHandle.getAttribute("aria-valuenow"));
  const compoundShareBeforeKey = compoundBoundaryBeforeKey - 40;
  await compoundHandle.focus();
  await compoundHandle.press("ArrowRight");
  await expect(compoundHandle).toHaveAttribute(
    "aria-valuenow",
    String(compoundBoundaryBeforeKey + 5),
  );
  await expect(compoundHandle).toHaveAttribute(
    "aria-valuetext",
    `Compound share: ${compoundShareBeforeKey + 5}%`,
  );
  await expect(
    hydrogenAllocation.getByText(`Retained share: ${95 - compoundBoundaryBeforeKey}%`),
  ).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "economy-production-allocation-slider");
  await hydrogenAllocation.locator("summary").click();
  const initialCash = await page.evaluate(() => window.miaplacidusTest!.getState().run.cash);
  for (const id of [
    "hydrogen",
    "helium",
    "carbon",
    "neon",
    "oxygen",
    "sodium",
    "silicon",
    "iron",
  ] as const) {
    await page.locator(`#tab-resources-${id}`).click();
    const card = page.locator(`[data-resource-id="${id}"]`);
    const allocation = card.locator("details").filter({ hasText: "Production allocation" });
    await allocation.locator("summary").click();
    await setAllocationSlider(allocation, "Cash share", 100);
    await expect(allocation.getByText("Retained share: 0%")).toBeVisible();
    await allocation.locator("summary").click();
  }
  await page.locator("#tab-resources-hydrogen").click();
  await expandHydrogenAutobuyers(page.locator('[data-resource-id="hydrogen"]'));
  await page.getByRole("button", { name: "Buy compressor" }).click();
  await expect(
    page.getByRole("button", { name: "Autobuyer for Hydrogen, tier 1" }),
  ).toBeVisible();
  await page.locator("#tab-resources-carbon").click();
  const carbon = page.locator('[data-resource-id="carbon"]');
  const carbonBuyers = carbon.locator("details").filter({ hasText: "Buy tier 1" });
  await carbonBuyers.locator("summary").click();
  await carbonBuyers
    .locator(".economy-tier")
    .first()
    .getByRole("button", { name: /^Buy/ })
    .first()
    .click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() =>
      page.evaluate(
        (startingCash) => window.miaplacidusTest!.getState().run.cash - startingCash,
        initialCash,
      ),
    )
    .toBeCloseTo(11.4, 1);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity))
    .toBeCloseTo(1_950, 5);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.carbon.quantity))
    .toBeCloseTo(1_920, 5);
  await captureVisualCheckpoint(page, testInfo, "economy-player-autosell-allocation");
});

test("mobile touch can drag a resource allocation handle @autosell @resources @touch", async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    ...devices["Pixel 7"],
    baseURL: String(testInfo.project.use.baseURL),
  });
  try {
    const page = await context.newPage();
    await startEconomyFixture(page, "full");
    await page.locator("#tab-resources-hydrogen").click();
    const allocation = page
      .locator('[data-resource-id="hydrogen"]')
      .locator("details")
      .filter({ hasText: "Production allocation" });
    await allocation.locator("summary").click();
    const track = allocation.locator(".allocation-slider-track");
    const bounds = await track.boundingBox();
    expect(bounds).not.toBeNull();
    const touch = await context.newCDPSession(page);
    const y = bounds!.y + bounds!.height / 2;
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: bounds!.x + bounds!.width * 0.3, y }],
    });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: bounds!.x + bounds!.width * 0.6, y }],
    });
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(allocation.getByRole("slider", { name: "Cash share (%)" })).toHaveAttribute(
      "aria-valuenow",
      "60",
    );
    await expect(allocation.getByText(/Compound share:/)).toBeVisible();
  } finally {
    await context.close();
  }
});

test("player automation creates Diesel from newly produced resource allocations @autobuyers @compounds", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  for (const id of ["diesel", "glass", "steel", "concrete", "water", "titanium"]) {
    await page.locator(`#tab-compounds-${id}`).click();
    const card = page.locator(`[data-compound-id="${id}"]`);
    await card.locator("details").locator("summary").click();
    const autoCreate = card.getByLabel("Automatic creation");
    if (id === "diesel") {
      if (!(await autoCreate.isChecked())) await autoCreate.check();
    } else if (await autoCreate.isChecked()) {
      await autoCreate.uncheck();
    }
  }
  await page.locator("#tab-hydrogen").click();
  for (const id of ["hydrogen", "carbon"] as const) {
    await page.locator(`#tab-resources-${id}`).click();
    const card = page.locator(`[data-resource-id="${id}"]`);
    const allocation = card.locator("details").filter({ hasText: "Production allocation" });
    await allocation.locator("summary").click();
    await setAllocationSlider(allocation, "Cash share", 0);
    await setAllocationSlider(allocation, "Compound share", 100);
  }
  await page.locator("#tab-resources-hydrogen").click();
  await expandHydrogenAutobuyers(page.locator('[data-resource-id="hydrogen"]'));
  await page.getByRole("button", { name: "Buy compressor" }).click();
  await expect(
    page.getByRole("button", { name: "Autobuyer for Hydrogen, tier 1" }),
  ).toBeVisible();
  await page.locator("#tab-resources-carbon").click();
  const carbon = page.locator('[data-resource-id="carbon"]');
  const carbonBuyers = carbon.locator("details").filter({ hasText: "Buy tier 1" });
  await carbonBuyers.locator("summary").click();
  await carbonBuyers
    .locator(".economy-tier")
    .first()
    .getByRole("button", { name: /^Buy/ })
    .first()
    .click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.diesel.quantity))
    .toBeGreaterThan(1_500);
  await captureVisualCheckpoint(page, testInfo, "economy-player-auto-create-diesel");
});

test("all six compounds auto-create from player-allocated fresh material output @autobuyers @autosell @compounds", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "compound-automation");
  const compoundIds = ["diesel", "glass", "steel", "concrete", "water", "titanium"] as const;
  await page.getByRole("tab", { name: /Compounds/ }).click();
  for (const id of compoundIds) {
    await page.locator(`#tab-compounds-${id}`).click();
    const card = page.locator(`[data-compound-id="${id}"]`);
    const controls = card.locator("details").filter({ hasText: "Automatic creation" });
    await controls.locator("summary").click();
    await controls.getByLabel("Automatic creation").check();
    await expect(controls.getByLabel("Automatic creation")).toBeChecked();
    await controls.locator("summary").click();
  }

  await page.getByRole("tab", { name: /Resources/ }).click();
  const materialIds = [
    "hydrogen",
    "helium",
    "carbon",
    "neon",
    "oxygen",
    "sodium",
    "silicon",
    "iron",
  ] as const;
  for (const id of materialIds) {
    await page.locator(`#tab-resources-${id}`).click();
    const card = page.locator(`[data-resource-id="${id}"]`);
    const allocation = card.locator("details").filter({ hasText: "Production allocation" });
    await allocation.locator("summary").click();
    await setAllocationSlider(allocation, "Compound share", 100);
    await allocation.getByRole("checkbox").check();
    await expect(allocation.getByText("Retained share: 0%")).toBeVisible();
    await allocation.locator("summary").click();
  }

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  for (const id of compoundIds)
    await expect
      .poll(() =>
        page.evaluate(
          (goodId) => window.miaplacidusTest!.getState().run.goods[goodId].quantity,
          id,
        ),
      )
      .toBeGreaterThan(0);
  const quantities = await page.evaluate(
    (ids) => ids.map((id) => window.miaplacidusTest!.getState().run.goods[id].quantity),
    compoundIds,
  );
  expect(quantities.every((quantity) => quantity > 0)).toBe(true);
  await page.getByRole("tab", { name: /Compounds/ }).click();
  await captureVisualCheckpoint(page, testInfo, "economy-all-automatic-compounds");
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

test("technology research purchase is atomic while locked energy and compounds tabs stay omitted @research @technology", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "research");
  await page.getByRole("tab", { name: /Research/ }).click();
  await expect(page.locator("#panel-research-science-buildings")).toBeVisible();
  await expect(page.locator("#panel-research-tech-tree")).toBeHidden();
  await page.locator("#tab-research-tech-tree").click();
  await expect(page.locator("#panel-research-tech-tree")).toBeVisible();
  await expect(page.locator("#panel-research-science-buildings")).toBeHidden();
  await expect(page.getByTestId("technology-tree-viewport")).toBeVisible();
  await expect(page.getByTestId("research-points")).toHaveText("150");
  await expect(page.getByTestId("research-rate")).toHaveText("0.5");
  await expect(page.getByTestId("economy-research")).toContainText("0.5 RP/s");
  await captureVisualCheckpoint(page, testInfo, "economy-research-ready");
  const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
  await knowledgeSharing.click();
  await expect(knowledgeSharing).toHaveAttribute(
    "aria-label",
    /^RESEARCHED:/i,
  );
  await expect(page.getByTestId("game-notification").last()).toContainText(
    "Knowledge Sharing Researched",
  );
  await expect(page.getByTestId("research-points")).toHaveText("0");
  await captureVisualCheckpoint(page, testInfo, "economy-research-unlocked");
  await expandResearchProduction(page);
  const researchAutomation = page.getByLabel(economyLabel("en", "researchAutobuyer"));
  await expect(researchAutomation).toBeEnabled();
  await researchAutomation.check();
  await expect(researchAutomation).toBeChecked();
  await researchAutomation.uncheck();
  await expect(researchAutomation).not.toBeChecked();
  await expect(page.getByRole("tab", { name: /Energy/ })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: /Compounds/ })).toHaveCount(0);
});

test("Tech Tree reveals affordable prerequisite-locked research and hides unaffordable nodes @research @technology @presentation", async ({
  page,
}) => {
  await startEconomyFixture(page, "research");
  await page.getByRole("tab", { name: /^Research/ }).click();
  await page.locator("#tab-research-tech-tree").click();
  const research = page.locator("#pane-research");
  await expect(research.locator("[role='tablist'] [role='tab']")).toHaveCount(2);
  await expect(research.getByRole("tab", { name: /^Research/ })).toBeVisible();
  await expect(research.getByRole("tab", { name: /^Tech Tree/ })).toBeVisible();
  const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
  const fusionTheory = page.locator('[data-technology-id="fusionTheory"]');
  await expect(knowledgeSharing).toBeVisible();
  await expect(fusionTheory).toHaveCount(0);

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_200_000));
  await expect(page.getByTestId("research-points")).toHaveText("750");
  await expect(fusionTheory).toBeVisible();
  await expect(fusionTheory).toHaveAttribute("aria-disabled", "true");
  const fusionTooltip = fusionTheory.locator(".technology-map-tooltip");
  await expect(fusionTooltip).toContainText("Fusion Theory");
  await expect(fusionTooltip).toContainText("Research points: 750");
  await expect(fusionTooltip).toContainText("Knowledge Sharing");

  await knowledgeSharing.click();
  await expect(page.getByTestId("game-notification").last()).toContainText(
    "Knowledge Sharing Researched",
  );
  await expect(fusionTheory).toBeVisible();
  await expect(fusionTheory).toHaveAttribute("aria-disabled", "true");
});

test("Tech Tree zoom keeps the wide graph inside a two-axis scroll viewport @research @technology @presentation", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /^Research/ }).click();
  await page.locator("#tab-research-tech-tree").click();
  const viewport = page.getByTestId("technology-tree-viewport");
  const panHelp = page.locator("#technology-tree-pan-help");
  await expect(panHelp).toContainText("arrow keys or Page Up/Down to pan");
  await expect(viewport).toHaveAttribute("aria-describedby", "technology-tree-pan-help");
  const advancedPower = page.locator('[data-technology-id="advancedPowerGeneration"]');
  const advancedPowerEdges = page.locator(
    '.technology-map-edge[data-prerequisite-to="advancedPowerGeneration"]',
  );
  const edgeSources = await advancedPowerEdges.evaluateAll((edges) =>
    edges
      .map((edge) => edge.getAttribute("data-prerequisite-from"))
      .filter((source): source is string => source !== null)
      .sort(),
  );
  expect(edgeSources).toEqual(["basicPowerGeneration", "giganticTurbines"]);
  await advancedPower.scrollIntoViewIfNeeded();
  await captureVisualCheckpoint(page, testInfo, "technology-tree-dependency-edges");
  await advancedPower.focus();
  await expect
    .poll(() =>
      advancedPowerEdges.evaluateAll((edges) =>
        edges.every((edge) => edge.classList.contains("is-related")),
      ),
    )
    .toBe(true);
  const unrelatedEdges = page.locator(".technology-map-edge.is-muted");
  await expect.poll(() => unrelatedEdges.count()).toBeGreaterThan(0);
  await page.mouse.move(0, 0);
  await expect
    .poll(() =>
      advancedPowerEdges.evaluateAll((edges) =>
        edges.every((edge) => edge.classList.contains("is-related")),
      ),
    )
    .toBe(true);
  await advancedPower.blur();
  await expect(
    page.locator(".technology-map-edge.is-related, .technology-map-edge.is-muted"),
  ).toHaveCount(0);
  await advancedPower.hover();
  await expect
    .poll(() =>
      advancedPowerEdges.evaluateAll((edges) =>
        edges.every((edge) => edge.classList.contains("is-related")),
      ),
    )
    .toBe(true);
  await page.mouse.move(0, 0);
  await expect(
    page.locator(".technology-map-edge.is-related, .technology-map-edge.is-muted"),
  ).toHaveCount(0);
  const initial = await viewport.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    overflowX: getComputedStyle(element).overflowX,
    overflowY: getComputedStyle(element).overflowY,
  }));
  expect(initial.overflowX).toBe("auto");
  expect(initial.overflowY).toBe("auto");
  expect(initial.scrollWidth).toBeGreaterThan(initial.clientWidth);
  expect(initial.scrollHeight).toBeLessThanOrEqual(initial.clientHeight);

  const zoom = page.getByRole("slider", { name: "Zoom" });
  await zoom.focus();
  await zoom.press("End");
  await expect(zoom).toHaveAttribute("aria-valuetext", "160%");
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollHeight > element.clientHeight))
    .toBe(true);
  await viewport.evaluate((element) => {
    element.scrollLeft = 0;
    element.scrollTop = 0;
  });
  await viewport.focus();
  await viewport.press("ArrowRight");
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await viewport.press("ArrowDown");
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
});

test.describe("Tech Tree zoom action targets", () => {
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

test("research automation purchases an available technology from player controls @research @technology @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "research");
  await page.locator("#tab-research").click();
  await expandResearchProduction(page);
  const automation = page.getByRole("checkbox", {
    name: economyLabel("en", "researchAutobuyer"),
  });
  await expect(automation).toBeEnabled();
  await automation.check();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect(page.getByTestId("research-balance")).toHaveText("5");
  await expect(page.getByTestId("research-points")).toHaveText("5");
  await page.locator("#tab-research-tech-tree").click();
  await expect(page.locator("#panel-research-tech-tree")).toBeVisible();
  await expect(page.locator("#panel-research-science-buildings")).toBeHidden();
  const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
  await expect(knowledgeSharing.locator(".technology-map-researched")).toBeVisible();
  await expect(page.getByTestId("game-notification").last()).toContainText(
    "Knowledge Sharing Researched",
  );
  await page.locator("#tab-research-science-buildings").click();
  await expect(page.locator("#panel-research-science-buildings")).toBeVisible();
  await expect(page.locator("#panel-research-tech-tree")).toBeHidden();
  await expect(automation).toBeChecked();
  await automation.uncheck();
  await expect(automation).not.toBeChecked();
  await expect(page.getByTestId("research-points")).toHaveText("5");
  await captureVisualCheckpoint(page, testInfo, "economy-research-automation");
});

test("normal research completion reaches the polite atomic live status region @p20-announcements @research", async ({
  page,
}) => {
  await startEconomyFixture(page, "research");
  await page.getByRole("tab", { name: /Research/ }).click();
  await page.locator("#tab-research-tech-tree").click();

  const technology = page.locator('[data-technology-id="knowledgeSharing"]');
  await technology.click();
  await expect(technology).toHaveAttribute("aria-label", /^RESEARCHED:/i);

  const notice = page.locator('[data-testid="game-notification"][data-classification="tech"]');
  await expect(notice).toHaveText(
    technologyNotificationText("en", "knowledgeSharing", TECHNOLOGY_NAMES.knowledgeSharing.en),
  );
  await expect(notice).toHaveRole("status");
  await expect(notice).toHaveAttribute("aria-atomic", "true");
  await expect(page.getByTestId("screen-reader-announcements")).toHaveAttribute(
    "aria-live",
    "polite",
  );
});

test("research completion notifications have a value for all six player languages @research @technology @locale", async ({
  page,
}, testInfo) => {
  const locales: readonly LocaleId[] = ["en", "es", "pt", "de", "it", "fr"];
  for (const locale of locales) {
    if (locale !== "en") {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
    await startEconomyFixture(page, "research", locale);
    await page.locator("#tab-research").click();
    await page.locator("#tab-research-tech-tree").click();
    await page.locator('[data-technology-id="knowledgeSharing"]').click();
    const technologyNotice = page.locator(
      '[data-testid="game-notification"][data-classification="tech"]',
    ).last();
    await expect(technologyNotice).toBeVisible();
    const noticeText = (await technologyNotice.innerText()).trim();
    expect(noticeText, `${locale} technology notice should be populated`).not.toBe("");
    expect(noticeText, `${locale} technology notice should not be a missing-key marker`).not.toContain(
      "???",
    );
    // Verify translated values in every locale; keep the visual baseline on the reviewed English layout.
    if (locale === "en")
      await captureVisualCheckpoint(page, testInfo, `economy-research-notification-${locale}`);
  }
});

test("Galactic Megastructures researches the Dyson power stage in its source-owned track @energy @technology", async ({
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

test("notation and language controls update live economy and technology readouts @precision @ui @locale", async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const desktopViewport = page.viewportSize();
  await startEconomyFixture(page, "full");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("2K");
  await setNumberNotation(page, "scientific");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("2E3");
  await captureVisualCheckpoint(page, testInfo, "economy-scientific-notation");
  await setNumberNotation(page, "standard");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("2,000");
  await setNumberNotation(page, "condensed");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("2K");
  await setNumberNotation(page, "scientific");
  const locales = [
    {
      id: "en",
      hydrogen: "Hydrogen",
      research: "Knowledge Sharing",
      science: "Science Kit",
      plant: "Power Plant",
      diesel: "Diesel",
      dieselRecipe: "26 Hydrogen + 12 Carbon",
    },
    {
      id: "es",
      hydrogen: "Hidrógeno",
      research: "Intercambio de Conocimiento",
      science: "Kit de Ciencia",
      plant: "Planta de Energía",
      diesel: "Diésel",
      dieselRecipe: "26 Hidrógeno + 12 Carbono",
    },
    {
      id: "pt",
      hydrogen: "Hidrogénio",
      research: "Partilha de Conhecimento",
      science: "Kit de Ciência",
      plant: "Central Elétrica",
      diesel: "Diesel",
      dieselRecipe: "26 Hidrogénio + 12 Carbono",
    },
    {
      id: "de",
      hydrogen: "Wasserstoff",
      research: "Wissensaustausch",
      science: "Wissenschaftsset",
      plant: "Kraftwerk",
      diesel: "Diesel",
      dieselRecipe: "26 Wasserstoff + 12 Kohlenstoff",
    },
    {
      id: "it",
      hydrogen: "Idrogeno",
      research: "Condivisione della Conoscenza",
      science: "Kit Scientifico",
      plant: "Centrale Elettrica",
      diesel: "Diesel",
      dieselRecipe: "26 Idrogeno + 12 Carbonio",
    },
    {
      id: "fr",
      hydrogen: "Hydrogène",
      research: "Partage des Connaissances",
      science: "Kit Scientifique",
      plant: "Centrale Électrique",
      diesel: "Diesel",
      dieselRecipe: "26 Hydrogène + 12 Carbone",
    },
  ] as const;
  for (const locale of locales) {
    await setGameLocale(page, locale.id);
    await page.locator("#tab-hydrogen").click();
    await page.locator("#tab-resources-hydrogen").click();
    const hydrogenHeading = page.locator("#panel-resources-hydrogen > .pane-heading h2");
    await expectLocalizedContent(hydrogenHeading);
    if (locale.id === "en") await expect(hydrogenHeading).toHaveText(locale.hydrogen);
    await expect(page.getByTestId("hydrogen-quantity")).toContainText("E3");
    const resources = page.locator("#pane-hydrogen [data-resource-id]");
    await expect(resources).toHaveCount(MATERIAL_IDS.length);
    for (const id of MATERIAL_IDS) {
      const resource = page.locator(`#pane-hydrogen [data-resource-id="${id}"]`);
      const resourceHeading = resource.locator(".pane-heading h2");
      await expectLocalizedContent(resourceHeading);
      if (locale.id === "en")
        await expect(resourceHeading).toHaveText(economyGoodName("en", id));
      await expect(resource.locator(".economy-card-heading")).toHaveCount(0);
      await expect(resource.locator(".hydrogen-hero")).toHaveCount(1);
    }
    await expandAllDetails(page.locator("#pane-hydrogen"));
    await expect(page.locator("#pane-hydrogen")).not.toContainText("???");
    const firstResourceTier = page.locator("#pane-hydrogen .economy-tier").first();
    await expectLocalizedContent(firstResourceTier);
    if (locale.id === "en")
      await expect(firstResourceTier).toContainText(economyLabel("en", "buyTier"));
    await collapseAllDetails(page.locator("#pane-hydrogen"));
    await page.mouse.move(0, 0);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    if (locale.id === "en")
      await captureVisualCheckpoint(page, testInfo, `economy-locale-${locale.id}`);

    await page.locator("#tab-research").click();
    await page.locator("#tab-research-tech-tree").click();
    const technologies = page.locator("#pane-research [data-technology-id]");
    const researchState = await page.evaluate(() => window.miaplacidusTest!.getState());
    const visibleTechnologies = TECHNOLOGY_CATALOG.filter(
      (technology) =>
        !MEGASTRUCTURE_TECHNOLOGY_IDS.includes(technology.id) &&
        researchState.run.economy.revealedTechnologies.includes(technology.id),
    );
    await expect(technologies).toHaveCount(visibleTechnologies.length);
    expect(visibleTechnologies.length).toBeLessThan(TECHNOLOGY_CATALOG.length);
    for (const technology of visibleTechnologies) {
      const technologyHeading = page.locator(
        `#pane-research [data-technology-id="${technology.id}"] .technology-map-node-heading strong`,
      );
      await expectLocalizedContent(technologyHeading);
      if (locale.id === "en")
        await expect(technologyHeading).toHaveText(TECHNOLOGY_NAMES[technology.id].en);
    }
    await expect(
      page.locator('[data-technology-id="knowledgeSharing"] .technology-map-tooltip-description'),
    ).not.toContainText("???");
    await expandResearchProduction(page);
    const scienceKitHeading = page.locator('[data-building-id="scienceKit"] h4');
    await expectLocalizedContent(scienceKitHeading);
    if (locale.id === "en")
      expect((await scienceKitHeading.innerText()).trim().replace(/[:\uFF1A]\s*$/, "")).toBe(
        locale.science,
      );
    for (const id of Object.keys(SCIENCE_BUILDINGS) as (keyof typeof SCIENCE_BUILDINGS)[]) {
      const buildingHeading = page.locator(`#pane-research [data-building-id="${id}"] h4`);
      await expectLocalizedContent(buildingHeading);
      if (locale.id === "en")
        await expect(buildingHeading).toHaveText(ECONOMY_BUILDING_NAMES[id].en);
    }
    await expect(page.locator("#pane-research")).not.toContainText("???");
    await page.locator("#tab-research-tech-tree").click();
    await expect(page.getByTestId("technology-tree-viewport")).toBeVisible();
    await expect(
      page.locator('[data-technology-id="knowledgeSharing"] .technology-map-researched'),
    ).toBeVisible();
    if (locale.id === "en")
      await captureVisualCheckpoint(page, testInfo, `economy-research-locale-${locale.id}`);
    await page.locator("#tab-energy").click();
    const energyPaneByBuilding = {
      battery1: "energy-batteries",
      battery2: "energy-batteries",
      battery3: "energy-batteries",
      powerPlant1: "energy-power",
      powerPlant2: "energy-power",
      powerPlant3: "energy-power",
    } as const;
    for (const id of Object.keys(ENERGY_BUILDINGS) as (keyof typeof ENERGY_BUILDINGS)[]) {
      await page.locator(`#tab-${energyPaneByBuilding[id]}`).click();
      const heading = await page
        .locator(`#pane-energy [data-building-id="${id}"] h3`)
        .innerText();
      expect(heading.trim()).not.toBe("");
      expect(heading).not.toContain("???");
      if (locale.id === "en")
        expect(heading.trim().replace(/[:\uFF1A]\s*$/, "")).toBe(
          ECONOMY_BUILDING_NAMES[id].en,
        );
    }
    await page.locator("#tab-energy-power").click();
    const powerPlant = page.locator('[data-building-id="powerPlant1"]');
    const powerPlantHeading = powerPlant.locator("h3");
    await expectLocalizedContent(powerPlantHeading);
    if (locale.id === "en")
      expect((await powerPlantHeading.innerText()).trim().replace(/[:\uFF1A]\s*$/, "")).toBe(
        locale.plant,
      );
    await expect(powerPlant.getByRole("button").first()).toBeEnabled();
    await expect(page.locator("#pane-energy")).not.toContainText("???");
    await page.locator("#tab-energy-batteries").click();
    await clearTransientEconomyOverlays(page);
    if (locale.id === "en")
      await captureVisualCheckpoint(page, testInfo, `economy-energy-locale-${locale.id}`);
    await page.locator("#tab-compounds").click();
    for (const id of COMPOUND_IDS) {
      await page.locator(`#tab-compounds-${id}`).click();
      const compound = page.locator(`#pane-compounds [data-compound-id="${id}"]`);
      await expect(compound).toBeVisible();
      const compoundHeading = compound.locator(".pane-heading h2");
      await expectLocalizedContent(compoundHeading);
      if (locale.id === "en")
        await expect(compoundHeading).toHaveText(economyGoodName("en", id));
      await expect(compound.locator(".hydrogen-hero")).toHaveCount(1);
    }
    await page.locator("#tab-compounds-diesel").click();
    const diesel = page.locator('[data-compound-id="diesel"]');
    const dieselHeading = diesel.locator(".pane-heading h2");
    await expectLocalizedContent(dieselHeading);
    if (locale.id === "en") await expect(dieselHeading).toHaveText(locale.diesel);
    const dieselRecipe = await diesel.innerText();
    expect(dieselRecipe).toContain(formatNumber(locale.id, 26, 1, "scientific"));
    expect(dieselRecipe).toContain(formatNumber(locale.id, 12, 1, "scientific"));
    expect(dieselRecipe).not.toContain("???");
    if (locale.id === "en")
      expect(dieselRecipe).toContain(
        `${formatNumber("en", 26, 1, "scientific")} Hydrogen + ${formatNumber("en", 12, 1, "scientific")} Carbon`,
      );
    await expect(diesel.getByRole("button").first()).toBeEnabled();
    await expandAllDetails(page.locator("#pane-compounds"));
    await expect(page.locator("#pane-compounds")).not.toContainText("???");
    const firstCompoundTier = page.locator("#pane-compounds .economy-tier").first();
    await expectLocalizedContent(firstCompoundTier);
    if (locale.id === "en")
      await expect(firstCompoundTier).toContainText(economyLabel("en", "buyTier"));
    await collapseAllDetails(page.locator("#pane-compounds"));
    await page.mouse.move(0, 0);
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    if (locale.id === "en")
      await captureVisualCheckpoint(page, testInfo, `economy-compounds-locale-${locale.id}`);

    await page.setViewportSize({ width: 390, height: 844 });
    for (const tabId of ["hydrogen", "research", "energy", "compounds"] as const) {
      await page.locator(`#tab-${tabId}`).click();
      await expect(page.locator(`#pane-${tabId}`)).toBeVisible();
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth, `${locale.id} ${tabId} at 390px`).toBeLessThanOrEqual(390);
    }
    await page.locator("#tab-hydrogen").click();
    for (const id of MATERIAL_IDS) {
      const childTab = page.locator(`#tab-resources-${id}`);
      await childTab.click();
      await expect(childTab, `${locale.id} ${id} selected at 390px`).toHaveAttribute(
        "aria-selected",
        "true",
      );

      const resourcePanel = page.locator(`#panel-resources-${id}`);
      await expect(resourcePanel, `${locale.id} ${id} panel at 390px`).toBeVisible();
      const resourceHeading = resourcePanel.locator(".pane-heading h2");
      await expectLocalizedContent(resourceHeading);
      if (locale.id === "en")
        await expect(resourceHeading, `${locale.id} ${id} heading at 390px`).toHaveText(
          economyGoodName("en", id),
        );
      await expect(
        resourcePanel.locator(".hydrogen-hero"),
        `${locale.id} ${id} hero at 390px`,
      ).toBeVisible();

      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth, `${locale.id} ${id} resource at 390px`).toBeLessThanOrEqual(390);
    }
    await page.locator("#tab-compounds").click();
    for (const id of COMPOUND_IDS) {
      const childTab = page.locator(`#tab-compounds-${id}`);
      await childTab.click();
      await expect(childTab, `${locale.id} ${id} selected at 390px`).toHaveAttribute(
        "aria-selected",
        "true",
      );

      const compound = page.locator(`#pane-compounds [data-compound-id="${id}"]`);
      await expect(compound, `${locale.id} ${id} pane at 390px`).toBeVisible();
      const compoundHeading = compound.locator(".pane-heading h2");
      await expectLocalizedContent(compoundHeading);
      if (locale.id === "en")
        await expect(compoundHeading, `${locale.id} ${id} heading at 390px`).toHaveText(
          economyGoodName("en", id),
        );
      await expect(compound.locator(".hydrogen-hero"), `${locale.id} ${id} hero`).toBeVisible();

      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth, `${locale.id} ${id} at 390px`).toBeLessThanOrEqual(390);
    }
    if (desktopViewport) await page.setViewportSize(desktopViewport);
  }
});

test("P-41 formats a production rate above 999 per second in every notation @precision @notation", async ({
  page,
}) => {
  await startEconomyFixture(page, "notation-coverage");
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const hydrogenRate = createEconomyTickPlan(state).netRatesPerSecond.hydrogen;
  expect(hydrogenRate).toBeGreaterThan(999);
  const cash = state.run.cash;
  expect(cash).toBeGreaterThan(999);

  const readout = page.locator("#panel-resources-hydrogen .rate-readout strong");
  const cashReadout = page.getByTestId("cash-balance");
  const cashTooltip = page.locator("#top-stat-tooltip-cash");
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await expect(readout).toContainText(formatNumber("en", hydrogenRate, 2, notation));
    const formattedCash = formatCurrency(
      "en",
      cash,
      state.settings.currencyId ?? "usd",
      2,
      notation,
    );
    await expect(cashReadout).toHaveText(formattedCash);
    await expect(cashReadout).toHaveAttribute("aria-describedby", "top-stat-tooltip-cash");
    await expect(cashTooltip).toContainText(formattedCash);
  }
});

test("P-41 formats every visible Resource and Compound holding and rate in every notation @precision @notation", async ({
  page,
}) => {
  await startEconomyFixture(page, "full");

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);

    for (const id of MATERIAL_IDS) {
      await page.locator(`#tab-resources-${id}`).click();
      const panel = page.locator(`#panel-resources-${id}`);
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const rates = createEconomyTickPlan(state).netRatesPerSecond;
      const quantityTestId =
        id === "hydrogen" ? "hydrogen-quantity" : `economy-good-quantity-${id}`;
      const capacityTestId =
        id === "hydrogen" ? "hydrogen-capacity" : `economy-good-capacity-${id}`;
      await expect(panel.getByTestId(quantityTestId)).toContainText(
        formatNumber("en", state.run.goods[id].quantity, 2, notation),
      );
      await expect(panel.getByTestId(capacityTestId)).toHaveText(
        formatNumber("en", state.run.goods[id].storageCapacity, 0, notation),
      );
      await expect(panel.locator(".rate-readout strong")).toContainText(
        formatNumber("en", Math.abs(rates[id] ?? 0), 2, notation),
      );
    }

    await page.locator("#tab-compounds").click();
    for (const id of COMPOUND_IDS) {
      await page.locator(`#tab-compounds-${id}`).click();
      const pane = page.locator(`#pane-compounds [data-compound-id="${id}"]`);
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const rates = createEconomyTickPlan(state).netRatesPerSecond;
      await expect(pane.locator(`[data-testid="economy-good-quantity-${id}"]`)).toContainText(
        formatNumber("en", state.run.goods[id].quantity, 2, notation),
      );
      await expect(pane.locator(`[data-testid="economy-good-capacity-${id}"]`)).toHaveText(
        formatNumber("en", state.run.goods[id].storageCapacity, 0, notation),
      );
      await expect(pane.locator(".rate-readout strong")).toContainText(
        formatNumber("en", Math.abs(rates[id] ?? 0), 2, notation),
      );
    }
  }
});

test("P-41 keeps the long Run Time timer advancing during a live notation change @precision @notation", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "notation-coverage");
  const runTime = page.getByTestId("top-stat-time").locator(".top-stat-value");
  let simulationMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.clock.simulationMs,
  );
  const condensedDuration = formatDuration("en", simulationMs, "condensed");
  await expect(runTime).toHaveText(condensedDuration);
  await expect(runTime).toHaveAttribute("aria-describedby", "top-stat-tooltip-time");
  await expect(page.locator("#top-stat-tooltip-time")).toContainText(condensedDuration);
  await captureVisualCheckpoint(page, testInfo, "p41-runtime-condensed");

  await setNumberNotation(page, "standard");
  simulationMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.clock.simulationMs,
  );
  const standardDuration = formatDuration("en", simulationMs, "standard");
  await expect(runTime).toHaveText(standardDuration);
  await expect(page.locator("#top-stat-tooltip-time")).toContainText(standardDuration);
  await captureVisualCheckpoint(page, testInfo, "p41-runtime-standard");
  await setNumberNotation(page, "scientific");
  simulationMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.clock.simulationMs,
  );
  const scientificDuration = formatDuration("en", simulationMs, "scientific");
  await expect(runTime).toHaveText(scientificDuration);
  await expect(page.locator("#top-stat-tooltip-time")).toContainText(scientificDuration);
  await captureVisualCheckpoint(page, testInfo, "p41-runtime-scientific");
  const before = simulationMs;
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));

  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.clock.simulationMs))
    .toBeGreaterThan(before);
  simulationMs = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.clock.simulationMs,
  );
  await expect(runTime).toHaveText(formatDuration("en", simulationMs, "scientific"));
});

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

test("energy, technology, and compound panels render and accept player actions @energy @compounds @ui", async ({
  page,
}, testInfo) => {
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
  await page.getByRole("tab", { name: /Research/ }).click();
  await expect(page.getByTestId("economy-research")).toBeVisible();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await captureVisualCheckpoint(page, testInfo, "economy-research-buildings-panel");
  await page.locator("#tab-research-tech-tree").click();
  await expect(page.locator("#panel-research-tech-tree")).toBeVisible();
  await expect(page.locator("[data-technology-id]").first()).toBeVisible();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await captureVisualCheckpoint(page, testInfo, "economy-technology-panel");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  const diesel = page.locator('[data-compound-id="diesel"]');
  await expect(diesel).toBeVisible();
  await expect(diesel).toContainText("26 Hydrogen + 12 Carbon");
  await diesel.getByRole("button", { name: "Create Diesel" }).click();
  await expectGoodStock(diesel, 1_501, 100_000);
  await captureVisualCheckpoint(page, testInfo, "economy-compound-panel");
});

test("formats Compound recipe inputs using the selected notation @p41-compound-recipe", async ({
  page,
}) => {
  await startEconomyFixture(page, "full");
  const diesel = page.locator('[data-compound-id="diesel"]');

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    if (notation !== "condensed") await setNumberNotation(page, notation);
    await page.locator("#tab-compounds").click();
    await expect(diesel).toBeVisible();
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const expectedRecipe = philosophyCompoundRecipe(state, "diesel")
      .map(
        (input) =>
          `${formatNumber("en", input.amount, 2, notation)} ${economyGoodName("en", input.goodId)}`,
      )
      .join(" + ");
    await expect(diesel.locator(".compound-recipe")).toContainText(expectedRecipe);
  }
});

test("energy deficit announces a grid trip on another tab and grid toggle recovers the system @energy @p20-announcements", async ({
  page,
}) => {
  await startEconomyFixture(page, "power-deficit");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-summary").click();
  await expect(page.getByTestId("power-unavailable")).toHaveText("3");
  const tripAnnouncement = page.getByTestId("power-trip-announcement");
  await expect(tripAnnouncement).toHaveRole("alert");
  await expect(tripAnnouncement).toHaveAttribute("aria-live", "assertive");
  await expect(tripAnnouncement).toHaveAttribute("aria-atomic", "true");
  await expect(tripAnnouncement).toBeEmpty();
  await page.getByRole("tab", { name: /Resources/ }).click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect(page.locator("#pane-hydrogen")).toBeVisible();
  await expect(page.getByTestId("top-stat-power")).toContainText("TRIPPED");
  await expect(tripAnnouncement).toHaveText(
    "The grid has tripped and needs to be turned on again.",
  );
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-summary").click();
  await expect(page.getByRole("alert").filter({ hasText: "Power trip" })).toBeVisible();
  await page.locator("#tab-energy-power").click();
  await page.getByRole("button", { name: /Turn power grid on/i }).click();
  await page.locator("#tab-energy-summary").click();
  await expect(page.getByRole("alert").filter({ hasText: "Power trip" })).toHaveCount(0);
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
