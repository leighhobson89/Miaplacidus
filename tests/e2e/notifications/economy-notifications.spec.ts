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

test("Power Plant sale notification remains conditional because no sale action exists @p08-notifications @notifications", async ({
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

test("normal research completion reaches the polite atomic live status region @p20-announcements @research @notifications", async ({
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

test("research completion notifications have a value for all six player languages @research @technology @locale @notifications", async ({
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

test("energy deficit announces a grid trip on another tab and grid toggle recovers the system @energy @p20-announcements @notifications", async ({
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

