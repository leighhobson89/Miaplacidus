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
import { expandResearchProduction } from "../_harness/economyShared";

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

test("Diesel autobuyer tier purchases and toggles through player controls @autobuyers", async ({ page }) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  await page.locator("#tab-compounds-diesel").click();
  const dieselBuyers = page.locator('[data-compound-id="diesel"]').locator("details").filter({ hasText: "Buy tier 1" });
  await dieselBuyers.locator("summary").click();
  await dieselBuyers.getByLabel("Automatic creation").uncheck();
  await dieselBuyers.locator(".economy-tier").first().getByRole("button", { name: "Buy max" }).click();
  await expect(dieselBuyers.locator(".economy-tier").first()).toContainText(/Buy tier 1: 1/);
  const toggle = dieselBuyers.locator(".economy-tier").first().locator("button[aria-pressed]");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});


test("material autobuyer tier 1 purchases work through each resource pane @autobuyers @resources", async ({ page }) => {
  await startEconomyFixture(page, "full");
  for (const id of ["helium", "carbon", "neon", "oxygen", "sodium", "silicon", "iron"]) {
    await page.locator("#tab-resources-" + id).click();
    const card = page.locator("[data-resource-id=\"" + id + "\"]");
    const autobuyers = card.locator("details").filter({ hasText: "Buy tier 1" }).first();
    await autobuyers.locator("summary").click();
    await autobuyers.locator(".economy-tier").first().getByRole("button", { name: "Buy max" }).click();
    await expect(autobuyers.locator(".economy-tier").first()).toContainText(/Buy tier 1: [1-9]\d*/);
  }
});
