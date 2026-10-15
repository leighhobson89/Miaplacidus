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
import { expectHydrogenStyleGoodLayout, expectGoodStock, clearQueuedNotificationsThroughSettings } from "../_harness/economyShared";

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

test("materials and compounds use Hydrogen-style cards with title-first compound actions and a left rail @resources @compounds @ui", async ({
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
  let compoundTitleActionsGap: number | undefined;
  let compoundActionsHeroGap: number | undefined;
  for (const id of COMPOUND_IDS) {
    await page.getByTestId(`compound-rail-${id}`).click();
    const card = page.locator(`[data-compound-id="${id}"]`);
    await expect(card).toBeVisible();
    const compoundLayout = page.locator(".tab-section-layout.compound-page-selected");
    await expect(compoundLayout.locator(".economy-section")).toHaveCSS("border-top-width", "0px");
    const [navBounds, headingBounds, actionBounds] = await Promise.all([
      compoundLayout.locator(".pane-nav-scroll").boundingBox(),
      card.locator(".pane-heading h2").boundingBox(),
      card.locator(".economy-page-actions").boundingBox(),
    ]);
    const heroBounds = await card.locator(".hydrogen-hero").boundingBox();
    expect(navBounds).not.toBeNull();
    expect(headingBounds).not.toBeNull();
    expect(actionBounds).not.toBeNull();
    expect(heroBounds).not.toBeNull();
    expect(headingBounds!.y).toBeGreaterThanOrEqual(navBounds!.y + navBounds!.height);
    const titleActionsGap = actionBounds!.y - (headingBounds!.y + headingBounds!.height);
    const actionsHeroGap = heroBounds!.y - (actionBounds!.y + actionBounds!.height);
    expect(titleActionsGap).toBeGreaterThanOrEqual(8);
    expect(actionsHeroGap).toBeGreaterThanOrEqual(8);
    if (compoundTitleActionsGap === undefined) compoundTitleActionsGap = titleActionsGap;
    else expect(Math.abs(titleActionsGap - compoundTitleActionsGap)).toBeLessThanOrEqual(2);
    if (compoundActionsHeroGap === undefined) compoundActionsHeroGap = actionsHeroGap;
    else expect(Math.abs(actionsHeroGap - compoundActionsHeroGap)).toBeLessThanOrEqual(2);
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
    const actions = card.locator(".economy-page-actions");
    const actionBounds = (await actions.count()) > 0 ? await actions.boundingBox() : null;
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
    expect(heroBounds).not.toBeNull();
    expect(storageBounds).not.toBeNull();
    expect(Math.abs(heroBounds!.x - storageBounds!.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(heroBounds!.width - storageBounds!.width)).toBeLessThanOrEqual(2);
    const headingBounds = await card.locator(".pane-heading h2").boundingBox();
    expect(headingBounds).not.toBeNull();
    const heroGap = heroBounds!.y - (headingBounds!.y + headingBounds!.height);
    if (actionBounds) {
      const titleActionsGap = actionBounds.y - (headingBounds!.y + headingBounds!.height);
      const actionsHeroGap = heroBounds!.y - (actionBounds.y + actionBounds.height);
      expect(titleActionsGap).toBeGreaterThanOrEqual(8);
      expect(actionsHeroGap).toBeGreaterThanOrEqual(8);
      await expect(card.locator(".compound-create-row .primary-button")).toBeVisible();
      await expect(card.locator(".hydrogen-sale-controls .card-controls .secondary-button")).toBeVisible();
    } else {
      expect(Math.abs(heroGap - hydrogenMobileHeroGap)).toBeLessThanOrEqual(2);
    }
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

test("all eight material cards support collection and sale @resources", async ({ page }) => {
  await startEconomyFixture(page, "full");
  const materialIds = ["hydrogen", "helium", "carbon", "neon", "oxygen", "sodium", "silicon", "iron"];
  await expect(page.locator("[data-resource-id]")).toHaveCount(materialIds.length);
  for (const id of materialIds) {
    await page.locator("#tab-resources-" + id).click();
    const card = page.locator("[data-resource-id=\"" + id + "\"]");
    await expect(card).toBeVisible();
    if (id === "hydrogen") {
      await page.getByRole("button", { name: "Collect 1 Hydrogen", exact: true }).click();
      await expect(page.getByTestId("hydrogen-quantity")).toContainText(formatNumber("en", 2_001));
      continue;
    }
    const materialName = id[0].toUpperCase() + id.slice(1);
    const startingQuantity = id === "carbon" ? 2_000 : 1_500;
    await card.getByRole("button", { name: "Gain 1", exact: true }).click();
    await expectGoodStock(card, startingQuantity + 1, 100_000);
    await card.getByLabel("Sale amount " + materialName).selectOption("half");
    await expect(card.getByText(/Sale preview:/)).toContainText("$");
    await card.getByRole("button", { name: new RegExp("Sell " + materialName) }).click();
    const afterSale = startingQuantity + 1 - Math.floor((startingQuantity + 1) / 2);
    await expectGoodStock(card, afterSale, 100_000);
  }
});



