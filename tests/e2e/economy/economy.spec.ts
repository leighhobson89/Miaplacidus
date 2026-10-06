import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { runTestLabAction } from "../_harness/test-lab";
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
import { formatNumber } from "../../../src/app/numberFormatting";
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

async function expectGoodStock(card: Locator, quantity: string, capacity?: string): Promise<void> {
  await expect(card.locator(".stock-readout > strong")).toContainText(quantity);
  if (capacity !== undefined) await expect(card.locator(".capacity-line")).toContainText(capacity);
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
    | "multipliers",
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
  await page.getByLabel("Pioneer name").fill(`Economy ${fixture}`);
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
  await carbon.getByRole("button", { name: "Collect +1 Carbon" }).click();
  await expectGoodStock(carbon, "2,001", "100,000");
  await carbon.getByLabel("Sale amount Carbon").selectOption("half");
  await expect(carbon.getByText(/Sale preview:/)).toContainText("$");
  await captureVisualCheckpoint(page, testInfo, "economy-resource-catalogue");
  await carbon.getByRole("button", { name: /Sell Carbon/ }).click();
  await expectGoodStock(carbon, "1,001", "100,000");
  await carbon.getByText("Fuse", { exact: true }).click();
  await carbon.getByLabel("Output Carbon").selectOption("neon");
  await carbon.getByLabel("Fusion Amount Carbon").fill("100");
  await carbon.getByRole("button", { name: "Fuse Carbon" }).click();
  await expect
    .poll(async () =>
      page.evaluate(() => window.miaplacidusTest?.getState().run.goods.neon.quantity),
    )
    .toBeGreaterThan(1_500);
  await expect(page.getByTestId("game-notification").last()).toContainText(
    "Fused 100 Carbon into Neon: received ",
  );
  await expect(page.getByTestId("game-notification").last()).toContainText(
    "lost to fusion inefficiency",
  );
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
  await page.getByLabel("Fusion Amount Hydrogen").fill("100");
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
  await scienceKit.getByRole("button", { name: "Buy", exact: true }).click();
  await expect(scienceKit).toContainText("Owned: 1");
  await expect(game.locator(".header-balances")).toContainText("$5.00");
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
  const firstTechnology = game.locator('[data-technology-id="knowledgeSharing"]');
  await expect(firstTechnology).toHaveAttribute("aria-disabled", "false");
  await firstTechnology.click();
  await expect(firstTechnology).toContainText("Researched");
  const researchNotification = game.getByTestId("game-notification").first();
  await expect(researchNotification).toHaveAttribute("data-classification", "tech");
  await expect(researchNotification).toContainText("Knowledge Sharing Researched");
  const noticeBounds = await researchNotification.boundingBox();
  const techTreeBounds = await game.locator(".technology-map-viewport").boundingBox();
  expect(noticeBounds).not.toBeNull();
  expect(techTreeBounds).not.toBeNull();
  expect(noticeBounds!.y + noticeBounds!.height).toBeLessThanOrEqual(techTreeBounds!.y);
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-first-research");
  expect(
    await game.evaluate(() => window.miaplacidusTest!.getState().run.upgrades.scienceKit),
  ).toBe(1);

  await game.locator("#tab-settings").click();
  const settings = game.getByTestId("settings-pane");
  await settings.locator("#tab-settings-statistics").click();
  const researchStatistics = settings
    .getByTestId("settings-statistics")
    .getByRole("heading", { name: "Research", level: 4, exact: true })
    .locator("xpath=..");
  const researchPointsCard = researchStatistics
    .getByText("Research points earned", { exact: true })
    .locator("xpath=..");
  await expect(researchPointsCard.locator(".settings-stat-pair-values strong")).toHaveText([
    "100",
    "100",
  ]);
  const scienceKitsCard = researchStatistics
    .getByText("Science kits built", { exact: true })
    .locator("xpath=..");
  await expect(scienceKitsCard.locator(".settings-stat-pair-values strong")).toHaveText(["1", "1"]);
  for (const label of ["Science clubs built", "Science labs built"]) {
    await expect(
      researchStatistics
        .getByText(label, { exact: true })
        .locator("xpath=..")
        .locator(".settings-stat-pair-values strong"),
    ).toHaveText(["0", "0"]);
  }
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
    .locator('[data-building-id="scienceKit"]')
    .getByRole("button", { name: "Buy", exact: true })
    .click();

  await game.getByRole("tab", { name: /Resources/ }).click();
  const collectHydrogen = game.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  for (let count = 0; count < 50; count += 1) await collectHydrogen.click();
  await expandHydrogenAutobuyers(game.locator('[data-resource-id="hydrogen"]'));
  await game.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await game.evaluate(() => window.miaplacidusTest!.advanceBy(74_500));
  await game.getByRole("button", { name: "Increase storage", exact: true }).click();
  await expect(game.getByTestId("hydrogen-capacity")).toHaveText("300");

  await game.locator("#hydrogen-sell-amount").selectOption("all");
  const sellHydrogen = game.getByRole("button", { name: "Sell", exact: true });
  for (let cycle = 0; cycle < 96; cycle += 1) {
    await game.evaluate(() => window.miaplacidusTest!.advanceBy(150_000));
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
  await expect(game.getByTestId("game-notification").last()).toContainText(
    "Knowledge Sharing Researched",
  );
  await game.mouse.move(0, 0);
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-progression-first-research");
  await game.locator("#tab-research-science-buildings").click();
  await game
    .locator('[data-building-id="scienceClub"]')
    .getByRole("button", { name: "Buy", exact: true })
    .click();
  await game.locator("#tab-research-tech-tree").click();
  await game.evaluate(() => window.miaplacidusTest!.advanceBy(3_200_000));

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
        "energy",
        "research",
        "settings",
        "miaplaedia",
      ]);
    }
    if (technologyId === "compounds") {
      expect(await visibleMainTabIds(game)).toEqual([
        "hydrogen",
        "energy",
        "research",
        "compounds",
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
  await hydrogenFusion.getByLabel("Fusion Amount Hydrogen").fill("50");
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
  await heliumFusion.getByLabel("Fusion Amount Helium").fill("7");
  await heliumFusion.getByRole("button", { name: "Fuse Helium", exact: true }).click();
  const carbon = game.locator('[data-resource-id="carbon"]');
  const carbonPaneTab = game.locator("#tab-resources-carbon");
  await expect(carbonPaneTab.locator(".attention-badge")).toHaveText("New");
  await game.locator(".resource-rail .resource-item").filter({ hasText: "Carbon" }).click();
  await expect(carbonPaneTab).toHaveAttribute("aria-selected", "true");
  await expect(carbon).toBeVisible();
  await expect(carbonPaneTab.locator(".attention-badge")).toHaveCount(0);
  await game.mouse.move(0, 0);
  await expect(game.getByTestId("notification-stack")).toBeVisible();
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-carbon-discovered");

  await expect(game.getByRole("tab", { name: /Energy/ })).toBeEnabled();
  const energyMainTab = game.locator("#tab-energy");
  await expect(energyMainTab.locator(".attention-badge")).toHaveText("New");
  const energyStorageTab = game.locator("#tab-energy-storage");
  const energyStorageBadge = energyStorageTab.locator(".attention-badge");
  const powerPlantTab = game.locator("#tab-energy-power-plant");
  const powerPlantBadge = powerPlantTab.locator(".attention-badge");
  await saveNowFromSettings(game);
  await game.reload();
  await resumeSavedPioneer(game, "Hydrogen Pioneer");
  await expect(energyMainTab.locator(".attention-badge")).toHaveText("New");
  const pendingAttentionIds = await game.evaluate(
    () => window.miaplacidusTest!.getState().run.navigationAttentionIds,
  );
  expect(pendingAttentionIds).toContain("energy");
  expect(pendingAttentionIds).toContain("energy-power-plant");
  await game.locator(".resource-rail .resource-item").filter({ hasText: "Carbon" }).click();
  await expect(carbonPaneTab).toHaveAttribute("aria-selected", "true");
  await energyMainTab.click();
  await expect(powerPlantBadge).toHaveText("New");
  await expect(energyStorageTab).toHaveAttribute("aria-selected", "true");
  await expect(game.locator("#panel-energy-storage [data-building-id='battery1']")).toBeVisible();
  await expect(energyMainTab.locator(".attention-badge")).toHaveText("New");
  await expect(energyStorageBadge).toHaveCount(0);
  await expect(powerPlantBadge).toHaveText("New");
  await game.mouse.move(0, 0);
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
      await expect(page.getByTestId("hydrogen-quantity")).toContainText("2,001");
      continue;
    }

    const materialName = id[0]!.toUpperCase() + id.slice(1);
    const startingQuantity = id === "carbon" ? 2_000 : 1_500;
    await card.getByRole("button", { name: `Collect +1 ${materialName}` }).click();
    await expectGoodStock(card, (startingQuantity + 1).toLocaleString("en-US"), "100,000");
    await card.getByLabel(`Sale amount ${materialName}`).selectOption("half");
    await expect(card.getByText(/Sale preview:/)).toContainText("$");
    await card.getByRole("button", { name: new RegExp(`Sell ${materialName}`) }).click();
    const afterSale = startingQuantity + 1 - Math.floor((startingQuantity + 1) / 2);
    await expectGoodStock(card, afterSale.toLocaleString("en-US"), "100,000");

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
    await expectGoodStock(card, "1,501");
    await card.getByLabel(`Sale amount ${heading}`).selectOption("1");
    await card.getByRole("button", { name: new RegExp(`Sell ${heading}`) }).click();
    await expectGoodStock(card, "1,500");
    if (id === "glass") {
      await card.getByLabel(`Sale amount ${heading}`).selectOption("all");
      await card.getByRole("button", { name: new RegExp(`Sell ${heading}`) }).click();
      await expectGoodStock(card, "0", "100,000");
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
  const dieselBuyerToggle = dieselBuyers
    .locator(".economy-tier")
    .first()
    .getByRole("button", { name: "Pause" });
  await dieselBuyerToggle.click();
  await expect(
    dieselBuyers.locator(".economy-tier").first().getByRole("button", { name: "Resume" }),
  ).toBeVisible();
});

test("material and compound pages share the Hydrogen layout and compounds have a left rail @resources @compounds @ui", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");

  await page.locator("#tab-hydrogen").click();
  const resourceRail = page.getByTestId("resource-rail");
  await expect(resourceRail).toBeVisible();
  let hydrogenHeaderGap = 0;
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
      expect(navBounds).not.toBeNull();
      expect(headingBounds).not.toBeNull();
      const headingGap = headingBounds!.y - (navBounds!.y + navBounds!.height);
      if (id === "hydrogen") hydrogenHeaderGap = headingGap;
      else expect(Math.abs(headingGap - hydrogenHeaderGap)).toBeLessThanOrEqual(2);
    }
    await expectHydrogenStyleGoodLayout(card, {
      hasFusion: MATERIAL_CATALOG[id].fusionOutputs !== undefined,
    });
  }
  await captureVisualCheckpoint(page, testInfo, "economy-hydrogen-style-material-layouts");

  await page.locator("#tab-compounds").click();
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
    expect(navBounds).not.toBeNull();
    expect(headingBounds).not.toBeNull();
    const headingGap = headingBounds!.y - (navBounds!.y + navBounds!.height);
    expect(Math.abs(headingGap - hydrogenHeaderGap)).toBeLessThanOrEqual(2);
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
  await hydrogenPanel.getByRole("button", { name: "Pause compressor" }).click();
  await expect(hydrogenPanel.getByTestId("production-blocked-hydrogen")).toHaveCount(0);

  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-water").click();
  const waterPanel = page.locator("#panel-compounds-water");
  await expect(waterPanel.getByTestId("production-blocked-water")).toHaveText(
    economyLabel("en", "automaticProductionBlockedByStorage"),
  );
  await waterPanel.locator(".economy-details > summary").click();
  await waterPanel
    .locator(".economy-details")
    .getByRole("button", { name: "Pause", exact: true })
    .click();
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
      (startingCapacity * 2).toLocaleString("en-US"),
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
      (startingCapacity * 2).toLocaleString("en-US"),
    );
    if (id === "concrete") {
      await card.getByRole("spinbutton", { name: "Amount Concrete" }).fill("30");
      await card.getByRole("button", { name: "Create Concrete" }).click();
      await expectGoodStock(card, "30", "100");
    }
  }
  await expectGoodStock(page.locator('[data-compound-id="water"]'), "0", "200");
  await expectGoodStock(page.locator('[data-compound-id="concrete"]'), "0", "100");
  await captureVisualCheckpoint(page, testInfo, "economy-all-compound-storage");
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
      await row.getByRole("button", { name: "Pause", exact: true }).click();
      await expect(row.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
      await row.getByRole("button", { name: "Resume", exact: true }).click();
      await expect(row.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
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
      await row.getByRole("button", { name: "Pause", exact: true }).click();
      await expect(row.getByRole("button", { name: "Resume", exact: true })).toBeVisible();
      await row.getByRole("button", { name: "Resume", exact: true }).click();
      await expect(row.getByRole("button", { name: "Pause", exact: true })).toBeVisible();
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
  const storage = water.getByRole("button", { name: "Increase storage" });
  await expect(storage).toBeEnabled();
  await expect(storage).toContainText("99 H₂O + 30 Concrete");
  await storage.click();
  await expectGoodStock(water, "0", "200");
  await expectGoodStock(page.locator('[data-compound-id="concrete"]'), "0", "50");
  await captureVisualCheckpoint(page, testInfo, "economy-water-storage-expanded");
});

test("Water storage stays disabled until both displayed inputs are affordable @resources @compounds @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "water-storage-short");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  await page.locator("#tab-compounds-water").click();
  const water = page.locator('[data-compound-id="water"]');
  const storage = water.getByRole("button", { name: "Increase storage" });
  await expect(storage).toBeDisabled();
  await expect(storage).toContainText("99 H₂O + 30 Concrete");
  await expectGoodStock(page.locator('[data-compound-id="concrete"]'), "29", "50");
  await captureVisualCheckpoint(page, testInfo, "economy-water-storage-blocked");
});

test("individual storage controls replace the bulk storage action @resources @compounds @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "storage-all");
  await expect(page.getByRole("button", { name: "Increase affordable storage" })).toHaveCount(0);
  await page
    .locator('[data-resource-id="hydrogen"]')
    .getByRole("button", { name: "Increase storage", exact: true })
    .click();
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText("200,000");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  await page.locator("#tab-compounds-water").click();
  await page
    .locator('[data-compound-id="water"]')
    .getByRole("button", { name: /^Increase storage/ })
    .click();
  await expectGoodStock(page.locator('[data-compound-id="water"]'), "0", "200,000");
  await expectGoodStock(page.locator('[data-compound-id="concrete"]'), "0", "100,000");
  await captureVisualCheckpoint(page, testInfo, "economy-increase-all-storage");
});

test("Bulk Purchasing buys the affordable science buildings and spends only their exact costs @research @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "bulk-science");
  await page.locator("#tab-research").click();
  await expandResearchProduction(page);
  const scienceKit = page.locator('[data-building-id="scienceKit"]');
  await expect(scienceKit.getByRole("button", { name: "Buy max" })).toBeEnabled();
  await scienceKit.getByRole("button", { name: "Buy max" }).click();
  await expect(scienceKit).toContainText("Owned: 2");
  await expect(page.getByTestId("cash-balance")).toContainText("$0.00");
  await captureVisualCheckpoint(page, testInfo, "economy-bulk-research-building");
});

test("Bulk Purchasing buys the affordable Hydrogen compressors from its player pane @resources @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "bulk-hydrogen");
  await expandHydrogenAutobuyers(page.locator('[data-resource-id="hydrogen"]'));
  const compressor = page.locator(".autobuyer-card");
  await expect(compressor.getByRole("button", { name: "Buy max", exact: true })).toBeEnabled();
  await compressor.getByRole("button", { name: "Buy max", exact: true }).click();
  await expect(page.getByTestId("hydrogen-autobuyer-count")).toHaveText("2");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("43");
  await captureVisualCheckpoint(page, testInfo, "economy-bulk-hydrogen-buyers");
});

test("Bulk Purchasing buys the affordable power plants and spends only their exact costs @energy @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "bulk-energy");
  await page.getByRole("tab", { name: /Energy/ }).click();
  const powerPlant = page.locator('[data-building-id="powerPlant1"]');
  await expect(powerPlant.getByRole("button", { name: "Buy max" })).toBeEnabled();
  await powerPlant.getByRole("button", { name: "Buy max" }).click();
  await expect(powerPlant).toContainText("Owned: 2");
  await expect(page.getByTestId("cash-balance")).toContainText("$0.00");
  await page.getByRole("button", { name: "Power all plants" }).click();
  await expect(powerPlant.getByRole("checkbox", { name: "Power Plant" })).not.toBeChecked();
  await page.getByRole("button", { name: "Power all plants" }).click();
  await expect(powerPlant.getByRole("checkbox", { name: "Power Plant" })).toBeChecked();
  await captureVisualCheckpoint(page, testInfo, "economy-bulk-power-building");
});

test("Energy compares live generator mix with consumption accessibly @energy @accessibility", async ({
  page,
}) => {
  await startEconomyFixture(page, "power-buildings");
  await page.locator("#tab-energy").click();
  for (const [paneId, buildingId] of [
    ["energy-power-plant", "powerPlant1"],
    ["energy-solar-power-plant", "powerPlant2"],
    ["energy-advanced-power-plant", "powerPlant3"],
  ] as const) {
    await page.locator(`#tab-${paneId}`).click();
    await page
      .locator(`[data-building-id="${buildingId}"]`)
      .getByRole("button", { name: "Buy", exact: true })
      .click();
  }
  await page.locator("#tab-research").click();
  await expandResearchProduction(page);
  await page
    .locator('[data-building-id="scienceLab"]')
    .getByRole("button", { name: "Buy", exact: true })
    .click();
  await page.locator("#tab-energy").click();

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

  await page.locator("#tab-energy-storage").click();
  await page
    .getByRole("tabpanel", { name: "Energy Storage" })
    .getByRole("checkbox", { name: "Power grid" })
    .uncheck();
  await expect(chart.getByTestId("energy-generation-powerPlant1")).toHaveText("0");
  await expect(chart.getByTestId("energy-generation-powerPlant2")).toHaveText("0");
  await expect(chart.getByTestId("energy-generation-powerPlant3")).toHaveText("0");
  await expect(chart.getByTestId("energy-generation-total")).toHaveText("0 kJ/s");
  await expect(chart.getByTestId("energy-consumption-total")).toHaveText("0 kJ/s");
  await expect(chart).toContainText("Power grid off: active generators are producing 0 kJ/s.");
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
    const card = page.locator(`[data-building-id="${id}"]`);
    await card.getByRole("button", { name: "Buy", exact: true }).click();
    await expect(card).toContainText("Owned: 1");
  }
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.capacity))
    .toBe(initialCapacity + 1_665_000);
  const plants = ["powerPlant1", "powerPlant2", "powerPlant3"] as const;
  for (const id of plants) {
    await expect(page.locator(`[data-building-id="${id}"]`).getByRole("checkbox")).toBeChecked();
  }
  await page.getByRole("button", { name: "Power all plants" }).click();
  for (const id of plants) {
    await expect(
      page.locator(`[data-building-id="${id}"]`).getByRole("checkbox"),
    ).not.toBeChecked();
  }
  await page.getByRole("button", { name: "Power all plants" }).click();
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
    await card.getByRole("button", { name: "Buy", exact: true }).click();
    await expect(card).toContainText("Owned: 1");
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
  await expect(page.getByRole("button", { name: "Pause compressor" })).toBeVisible();
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
  await runTestLabAction(page, "Advance 10 seconds");
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
}) => {
  const context = await browser.newContext({
    ...devices["Pixel 7"],
    baseURL: "http://127.0.0.1:4173",
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
  await expect(page.getByRole("button", { name: "Pause compressor" })).toBeVisible();
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
  await runTestLabAction(page, "Advance 10 seconds");
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

  await runTestLabAction(page, "Advance 10 seconds");
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
  await expect(page.locator(".autobuyer-card")).toContainText("Adds 4.5 Hydrogen per second");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-solar-power-plant").click();
  await expect(page.locator('[data-building-id="powerPlant2"]')).toContainText("+13.5 kJ/s");
  await captureVisualCheckpoint(page, testInfo, "economy-permanent-production-multipliers");
});

test("technology research purchase is atomic and opens the energy and compounds panes @research @technology", async ({
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
  await page.getByRole("button", { name: "Research technology: Knowledge Sharing" }).click();
  await expect(page.locator('[data-technology-id="knowledgeSharing"]')).toContainText("Researched");
  await expect(page.getByTestId("game-notification").last()).toContainText(
    "Knowledge Sharing Researched",
  );
  await expect(page.getByTestId("research-points")).toHaveText("0");
  await captureVisualCheckpoint(page, testInfo, "economy-research-unlocked");
  await expandResearchProduction(page);
  const researchAutomation = page.getByLabel("Research available technologies automatically");
  await expect(researchAutomation).toBeEnabled();
  await researchAutomation.check();
  await expect(researchAutomation).toBeChecked();
  await researchAutomation.uncheck();
  await expect(researchAutomation).not.toBeChecked();
  await expect(page.getByRole("tab", { name: /Energy/ })).toHaveAttribute("aria-disabled", "true");
  await expect(page.getByRole("tab", { name: /Compounds/ })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
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
  await page.locator('[data-technology-id="advancedPowerGeneration"]').scrollIntoViewIfNeeded();
  await captureVisualCheckpoint(page, testInfo, "technology-tree-dependency-edges");
  const initial = await viewport.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    overflowX: getComputedStyle(element).overflowX,
    overflowY: getComputedStyle(element).overflowY,
  }));
  expect(initial.overflowX).toBe("auto");
  expect(initial.overflowY).toBe("auto");
  expect(initial.scrollWidth).toBeGreaterThan(initial.clientWidth);

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

test("research automation purchases an available technology from player controls @research @technology @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "research");
  await page.locator("#tab-research").click();
  await expandResearchProduction(page);
  const automation = page.getByRole("checkbox", {
    name: "Research available technologies automatically",
  });
  await expect(automation).toBeEnabled();
  await automation.check();
  await runTestLabAction(page, "Advance 10 seconds");
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

test("research completion notifications match Cosmic Forge in all six player languages @research @technology @locale", async ({
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
    await page.locator("#tab-research-tech-tree").click();
    const technologyName = TECHNOLOGY_NAMES.knowledgeSharing[locale];
    await page.locator('[data-technology-id="knowledgeSharing"]').click();
    const expected = technologyNotificationText(locale, "knowledgeSharing", technologyName);
    await expect(page.getByTestId("game-notification").last()).toHaveText(expected);
    await captureVisualCheckpoint(page, testInfo, `economy-research-notification-${locale}`);
  }
});

test("the Dyson power research gate grants infinite power and restores a full grid @energy @technology", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "infinite-power");
  await page.getByRole("tab", { name: /Research/ }).click();
  await page.locator("#tab-research-tech-tree").click();
  const technology = page.locator('[data-technology-id="dysonSpherePower"]');
  await expect(
    technology.getByRole("button", { name: "Research technology: Dyson Sphere Power" }),
  ).toBeEnabled();
  await technology.getByRole("button", { name: "Research technology: Dyson Sphere Power" }).click();
  await expect(technology).toContainText("Researched");
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power))
    .toMatchObject({ infinitePower: true, gridEnabled: true, quantity: 1_665_000 });
  await captureVisualCheckpoint(page, testInfo, "economy-infinite-power-research");
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
    await expect(page.locator("#pane-hydrogen .pane-heading h2")).toHaveText(locale.hydrogen);
    await expect(page.getByTestId("hydrogen-quantity")).toContainText("E3");
    const resources = page.locator("#pane-hydrogen [data-resource-id]");
    await expect(resources).toHaveCount(MATERIAL_IDS.length);
    for (const id of MATERIAL_IDS) {
      const resource = page.locator(`#pane-hydrogen [data-resource-id="${id}"]`);
      await expect(resource.locator(".pane-heading h2")).toHaveText(economyGoodName(locale.id, id));
      await expect(resource.locator(".economy-card-heading")).toHaveCount(0);
      await expect(resource.locator(".hydrogen-hero")).toHaveCount(1);
    }
    await expandAllDetails(page.locator("#pane-hydrogen"));
    await expect(page.locator("#pane-hydrogen")).not.toContainText("???");
    await expect(page.locator("#pane-hydrogen .economy-tier").first()).toContainText(
      economyLabel(locale.id, "buyTier"),
    );
    await collapseAllDetails(page.locator("#pane-hydrogen"));
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
    for (const technology of visibleTechnologies)
      await expect(
        page.locator(
          `#pane-research [data-technology-id="${technology.id}"] .technology-map-node-heading strong`,
        ),
      ).toHaveText(TECHNOLOGY_NAMES[technology.id][locale.id]);
    await expect(
      page.locator('[data-technology-id="knowledgeSharing"] .technology-map-tooltip-description'),
    ).not.toContainText("???");
    await expandResearchProduction(page);
    await expect(page.locator('[data-building-id="scienceKit"] h4')).toHaveText(locale.science);
    for (const id of Object.keys(SCIENCE_BUILDINGS) as (keyof typeof SCIENCE_BUILDINGS)[])
      await expect(page.locator(`#pane-research [data-building-id="${id}"] h4`)).toHaveText(
        ECONOMY_BUILDING_NAMES[id][locale.id],
      );
    await expect(page.locator("#pane-research")).not.toContainText("???");
    await page.locator("#tab-research-tech-tree").click();
    await expect(page.getByTestId("technology-tree-viewport")).toBeVisible();
    await expect(
      page.locator('[data-technology-id="knowledgeSharing"] .technology-map-researched'),
    ).toBeVisible();
    await captureVisualCheckpoint(page, testInfo, `economy-research-locale-${locale.id}`);
    await page.locator("#tab-energy").click();
    const energyPaneByBuilding = {
      battery1: "energy-storage",
      battery2: "energy-storage",
      battery3: "energy-storage",
      powerPlant1: "energy-power-plant",
      powerPlant2: "energy-solar-power-plant",
      powerPlant3: "energy-advanced-power-plant",
    } as const;
    for (const id of Object.keys(ENERGY_BUILDINGS) as (keyof typeof ENERGY_BUILDINGS)[]) {
      await page.locator(`#tab-${energyPaneByBuilding[id]}`).click();
      await expect(page.locator(`#pane-energy [data-building-id="${id}"] h3`)).toHaveText(
        ECONOMY_BUILDING_NAMES[id][locale.id],
      );
    }
    await page.locator("#tab-energy-power-plant").click();
    const powerPlant = page.locator('[data-building-id="powerPlant1"]');
    await expect(powerPlant.locator("h3")).toHaveText(locale.plant);
    await expect(powerPlant.getByRole("button").first()).toBeEnabled();
    await expect(page.locator("#pane-energy")).not.toContainText("???");
    await page.locator("#tab-energy-storage").click();
    await captureVisualCheckpoint(page, testInfo, `economy-energy-locale-${locale.id}`);
    await page.locator("#tab-compounds").click();
    for (const id of COMPOUND_IDS) {
      await page.locator(`#tab-compounds-${id}`).click();
      const compound = page.locator(`#pane-compounds [data-compound-id="${id}"]`);
      await expect(compound).toBeVisible();
      await expect(compound.locator(".pane-heading h2")).toHaveText(economyGoodName(locale.id, id));
      await expect(compound.locator(".hydrogen-hero")).toHaveCount(1);
    }
    await page.locator("#tab-compounds-diesel").click();
    const diesel = page.locator('[data-compound-id="diesel"]');
    await expect(diesel.locator("h3")).toHaveText(locale.diesel);
    await expect(diesel).toContainText(locale.dieselRecipe);
    await expect(diesel.getByRole("button").first()).toBeEnabled();
    await expandAllDetails(page.locator("#pane-compounds"));
    await expect(page.locator("#pane-compounds")).not.toContainText("???");
    await expect(page.locator("#pane-compounds .economy-tier").first()).toContainText(
      economyLabel(locale.id, "buyTier"),
    );
    await collapseAllDetails(page.locator("#pane-compounds"));
    await captureVisualCheckpoint(page, testInfo, `economy-compounds-locale-${locale.id}`);

    await page.setViewportSize({ width: 390, height: 844 });
    for (const tabId of ["hydrogen", "research", "energy", "compounds"] as const) {
      await page.locator(`#tab-${tabId}`).click();
      await expect(page.locator(`#pane-${tabId}`)).toBeVisible();
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth, `${locale.id} ${tabId} at 390px`).toBeLessThanOrEqual(390);
    }
    if (desktopViewport) await page.setViewportSize(desktopViewport);
  }
});

test("energy, technology, and compound panels render and accept player actions @energy @compounds @ui", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.getByTestId("economy-energy")).toBeVisible();
  await expect(page.getByTestId("economy-energy").getByText(/Generated: .* kJ\/s/)).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "economy-energy-panel");
  await page.getByRole("checkbox", { name: "Power grid" }).uncheck();
  await page.getByRole("checkbox", { name: "Power grid" }).check();
  await page.getByRole("tab", { name: /Research/ }).click();
  await expect(page.getByTestId("economy-research")).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "economy-research-buildings-panel");
  await page.locator("#tab-research-tech-tree").click();
  await expect(page.locator("#panel-research-tech-tree")).toBeVisible();
  await expect(page.locator("[data-technology-id]").first()).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "economy-technology-panel");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  const diesel = page.locator('[data-compound-id="diesel"]');
  await expect(diesel).toBeVisible();
  await expect(diesel).toContainText("26 Hydrogen + 12 Carbon");
  await diesel.getByRole("button", { name: "Create Diesel" }).click();
  await expectGoodStock(diesel, "1,501", "100,000");
  await captureVisualCheckpoint(page, testInfo, "economy-compound-panel");
});

test("energy deficit trips after grace period and grid toggle recovers the system @energy", async ({
  page,
}) => {
  await startEconomyFixture(page, "power-deficit");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.getByTestId("power-unavailable")).toHaveText("3");
  await runTestLabAction(page, "Advance 10 seconds");
  await runTestLabAction(page, "Advance 10 seconds");
  await expect(page.getByRole("alert").filter({ hasText: "Power trip" })).toBeVisible();
  await page.getByLabel("Power grid").uncheck();
  await expect(page.getByRole("alert").filter({ hasText: "Power trip" })).toHaveCount(0);
});

test("battery storage charges, drains under load, and recharges after load stops @energy @research", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "battery-cycle");
  const powerValue = page.getByTestId("top-stat-power").locator(".top-stat-value");
  await expect(powerValue).toBeVisible();
  await page.getByRole("tab", { name: /Energy/ }).click();
  const battery = page.locator('[data-building-id="battery1"]');
  await battery.getByRole("button", { name: "Buy", exact: true }).click();
  await page.locator("#tab-energy-solar-power-plant").click();
  const solar = page.locator('[data-building-id="powerPlant2"]');
  await solar.getByRole("button", { name: "Buy", exact: true }).click();

  await page.getByRole("tab", { name: /Research/ }).click();
  await expandResearchProduction(page);
  const lab = page.locator('[data-building-id="scienceLab"]');
  await lab.getByRole("button", { name: "Buy", exact: true }).click();
  await lab.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(lab.getByRole("button", { name: "Resume", exact: true })).toBeVisible();

  await runTestLabAction(page, "Advance 10 seconds");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.getByTestId("power-quantity")).toHaveText("300");
  await expect(powerValue).toHaveClass(/is-charging/);
  await captureVisualCheckpoint(page, testInfo, "economy-battery-charged");

  await page.getByRole("tab", { name: /Research/ }).click();
  await lab.getByRole("button", { name: "Resume", exact: true }).click();
  await runTestLabAction(page, "Advance 10 seconds");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.getByTestId("power-quantity")).toHaveText("150");
  await expect(powerValue).toHaveClass(/is-discharging/);
  await captureVisualCheckpoint(page, testInfo, "economy-battery-discharged");

  await page.getByRole("tab", { name: /Research/ }).click();
  await lab.getByRole("button", { name: "Pause", exact: true }).click();
  await runTestLabAction(page, "Advance 10 seconds");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.getByTestId("power-quantity")).toHaveText("350");
  await expect(powerValue).toHaveClass(/is-charging/);
  await captureVisualCheckpoint(page, testInfo, "economy-battery-recharged");
});

test("resource, research, power, compound, language and notation changes survive save and reload @save-load-local @resources @research @energy @compounds", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "save");
  await expandHydrogenAutobuyers(page.locator('[data-resource-id="hydrogen"]'));
  const carbon = page.locator('[data-resource-id="carbon"]');
  await carbon.getByRole("button", { name: "Collect +1 Carbon" }).click();
  await page.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await expect(page.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  const hydrogenAutobuyer = page.locator(".autobuyer-card button[aria-pressed='true']");
  await hydrogenAutobuyer.click();
  const iron = page.locator('[data-resource-id="iron"]');
  await iron.getByRole("button", { name: /Increase storage/ }).click();
  await expectGoodStock(iron, "0", "3,002");
  await page.getByRole("tab", { name: /Research/ }).click();
  await expandResearchProduction(page);
  const scienceKit = page.locator('[data-building-id="scienceKit"]');
  await scienceKit.getByRole("button", { name: "Buy", exact: true }).click();
  await scienceKit.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Research technology: Fusion Efficiency III" }).click();
  await page.getByRole("tab", { name: /Energy/ }).click();
  const plant = page.locator('[data-building-id="powerPlant1"]');
  await plant.getByRole("button", { name: "Buy", exact: true }).click();
  const battery = page.locator('[data-building-id="battery1"]');
  await battery.getByRole("button", { name: "Buy", exact: true }).click();
  await plant.getByRole("checkbox").uncheck();
  await page.getByLabel("Power grid").uncheck();
  await page.getByRole("tab", { name: /Compounds/ }).click();
  const diesel = page.locator('[data-compound-id="diesel"]');
  const buyers = diesel.locator("details").filter({ hasText: "Buy tier 1" });
  await buyers.locator("summary").click();
  await buyers.getByLabel("Automatic creation").uncheck();
  await diesel.getByRole("button", { name: "Create Diesel" }).click();
  await page.locator("#tab-hydrogen").click();
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
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
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
