import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import type { Locator, Page } from "@playwright/test";
import { economyGoodName } from "../../../src/app/EconomyPanes";
import { autobuyerUpgradeId, COMPOUND_IDS, MATERIAL_IDS } from "../../../src/content/ids";
import { ECONOMY_BUILDING_NAMES } from "../../../src/content/economyBuildingNames";
import { ENERGY_BUILDINGS, SCIENCE_BUILDINGS } from "../../../src/content/economy";
import { TECHNOLOGY_CATALOG } from "../../../src/content/technology";
import { TECHNOLOGY_NAMES } from "../../../src/content/technologyNames";
import { economyLabel } from "../../../src/i18n/economyMessages";

async function expandAllDetails(container: Locator): Promise<void> {
  const closedDetails = container.locator("details:not([open]) > summary");
  while ((await closedDetails.count()) > 0) await closedDetails.first().click();
}

async function collapseAllDetails(container: Locator): Promise<void> {
  const openDetails = container.locator("details[open] > summary");
  while ((await openDetails.count()) > 0) await openDetails.first().click();
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
    | "save"
    | "bulk-hydrogen"
    | "bulk-science"
    | "bulk-energy"
    | "power-buildings"
    | "buyer-tiers"
    | "compound-automation"
    | "multipliers",
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
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill(`Economy ${fixture}`);
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByTestId("hydrogen-onboarding")).toBeVisible();
  await page.getByRole("button", { name: "Begin exploring" }).click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("resource catalogue controls collect, preview, sell, store, and fuse through clicks @resources @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  const carbon = page.locator('[data-resource-id="carbon"]');
  await carbon.getByRole("button", { name: "Collect +1 Carbon" }).click();
  await expect(carbon).toContainText("2,001 / 100,000");
  await carbon.getByLabel("Sale amount Carbon").selectOption("half");
  await expect(carbon.getByText(/Sale preview:/)).toContainText("$100.00");
  await captureVisualCheckpoint(page, testInfo, "economy-resource-catalogue");
  await carbon.getByRole("button", { name: /Sell Carbon/ }).click();
  await expect(carbon).toContainText("1,001 / 100,000");
  await carbon.getByText("Fuse", { exact: true }).click();
  await carbon.getByLabel("Output Carbon").selectOption("neon");
  await carbon.getByLabel("Fusion Amount Carbon").fill("100");
  await carbon.getByRole("button", { name: "Fuse Carbon" }).click();
  await expect
    .poll(async () =>
      page.evaluate(() => window.miaplacidusTest?.getState().run.goods.neon.quantity),
    )
    .toBeGreaterThan(1_500);
  await expect(page.locator('[data-resource-id="neon"]')).toContainText("Neon");
});

test("fresh Hydrogen progression reaches its first research through player controls @resources @research @autobuyers", async ({
  freshGame,
}, testInfo) => {
  const game = freshGame;
  await game.getByRole("tab", { name: /Research/ }).click();
  const scienceKit = game.locator('[data-building-id="scienceKit"]');
  await scienceKit.getByRole("button", { name: "Buy", exact: true }).click();
  await expect(scienceKit).toContainText("Owned: 1");
  await expect(game.locator(".header-balances")).toContainText("$5.00");
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-science-kit");

  await game.getByRole("tab", { name: /Resources/ }).click();
  const hydrogenCard = game.locator('[data-resource-id="hydrogen"]');
  const hydrogenTiers = hydrogenCard.locator("details").filter({ hasText: "Buy tier" });
  await hydrogenTiers.locator("summary").click();
  await expect(
    hydrogenTiers.locator(".economy-tier").filter({ hasText: "Buy tier 2:" }),
  ).toContainText("Quantum Computing");
  await expect(
    hydrogenTiers.locator(".economy-tier").filter({ hasText: "Buy tier 4:" }),
  ).toContainText("Rocket Composites");
  await hydrogenTiers.locator("summary").click();
  const allocation = hydrogenCard.locator("details").filter({ hasText: "Production allocation" });
  await allocation.locator("summary").click();
  await expect(allocation.getByLabel("Cash share (%)")).toBeDisabled();
  await expect(allocation.getByText("Locked by: Nano Brokers I")).toBeVisible();
  await allocation.locator("summary").click();
  const collect = game.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  for (let count = 0; count < 50; count += 1) await collect.click();
  await expect(game.getByTestId("hydrogen-quantity")).toContainText("50");
  await game.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await expect(game.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  await expect(game.getByTestId("hydrogen-quantity")).toContainText("0");
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-hydrogen-compressor");

  await game.evaluate(() => window.miaplacidusTest!.advanceBy(200_000));
  await game.getByRole("tab", { name: /Research/ }).click();
  await expect(game.getByTestId("research-rate")).toContainText("0.5");
  await expect(game.getByTestId("research-points")).toContainText("150");
  const firstTechnology = game.locator('[data-technology-id="knowledgeSharing"]');
  await expect(
    firstTechnology.getByRole("button", { name: "Research technology: Knowledge Sharing" }),
  ).toBeEnabled();
  await firstTechnology
    .getByRole("button", { name: "Research technology: Knowledge Sharing" })
    .click();
  await expect(firstTechnology).toContainText("Researched");
  await expect(game.getByTestId("research-feedback")).toHaveText("Knowledge Sharing researched.");
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-first-research");
  expect(
    await game.evaluate(() => window.miaplacidusTest!.getState().run.upgrades.scienceKit),
  ).toBe(1);
});

test("fresh Hydrogen progression unlocks the first Energy and compound systems through player actions @resources @energy @research @compounds", async ({
  freshGame: game,
}, testInfo) => {
  test.setTimeout(180_000);
  await game.getByRole("tab", { name: /Research/ }).click();
  await game
    .locator('[data-building-id="scienceKit"]')
    .getByRole("button", { name: "Buy", exact: true })
    .click();

  await game.getByRole("tab", { name: /Resources/ }).click();
  const collectHydrogen = game.getByRole("button", { name: "Collect 1 Hydrogen", exact: true });
  for (let count = 0; count < 50; count += 1) await collectHydrogen.click();
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
  await expect(game.locator(".header-balances")).toContainText("$581.00");
  await expect(game.getByRole("tab", { name: /Energy/ })).toHaveAttribute("aria-disabled", "true");

  await game.getByRole("tab", { name: /Research/ }).click();
  const knowledgeSharing = game.locator('[data-technology-id="knowledgeSharing"]');
  await knowledgeSharing
    .getByRole("button", { name: "Research technology: Knowledge Sharing" })
    .click();
  await expect(game.getByTestId("research-feedback")).toHaveText("Knowledge Sharing researched.");
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-progression-first-research");
  await game
    .locator('[data-building-id="scienceClub"]')
    .getByRole("button", { name: "Buy", exact: true })
    .click();
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
    const researchButton = technology.getByRole("button", { name: /Research technology:/ });
    await expect(researchButton).toBeEnabled();
    await researchButton.click();
    await expect(technology.locator(".status-pill")).toBeVisible();
  }

  await game.getByRole("tab", { name: /Resources/ }).click();
  const hydrogen = game.locator('[data-resource-id="hydrogen"]');
  const hydrogenFusion = hydrogen.locator("details").filter({ hasText: "Fuse" });
  await hydrogenFusion.locator("summary").click();
  await hydrogenFusion.getByLabel("Output Hydrogen").selectOption("helium");
  await hydrogenFusion.getByLabel("Fusion Amount Hydrogen").fill("50");
  await hydrogenFusion.getByRole("button", { name: "Fuse Hydrogen", exact: true }).click();
  const helium = game.locator('[data-resource-id="helium"]');
  await expect(helium).toBeVisible();
  const heliumFusion = helium.locator("details").filter({ hasText: "Fuse" });
  await heliumFusion.locator("summary").click();
  await heliumFusion.getByLabel("Fusion Amount Helium").fill("7");
  await heliumFusion.getByRole("button", { name: "Fuse Helium", exact: true }).click();
  await expect(game.locator('[data-resource-id="carbon"]')).toBeVisible();
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-carbon-discovered");

  await expect(game.getByRole("tab", { name: /Energy/ })).toBeEnabled();
  await game.getByRole("tab", { name: /Energy/ }).click();
  await expect(game.locator('[data-building-id="powerPlant1"]')).toBeVisible();
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-first-energy");
  await expect(game.getByRole("tab", { name: /Compounds/ })).toBeEnabled();
  await game.getByRole("tab", { name: /Compounds/ }).click();
  const diesel = game.locator('[data-compound-id="diesel"]');
  await expect(diesel).toBeVisible();
  await expect(diesel).toContainText("Hydrogen");
  await captureVisualCheckpoint(game, testInfo, "economy-fresh-first-compound");
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
    await expect(card).toContainText(`${(startingQuantity + 1).toLocaleString("en-US")} / 100,000`);
    await card.getByLabel(`Sale amount ${materialName}`).selectOption("half");
    await expect(card.getByText(/Sale preview:/)).toContainText("$");
    await card.getByRole("button", { name: new RegExp(`Sell ${materialName}`) }).click();
    const afterSale = startingQuantity + 1 - Math.floor((startingQuantity + 1) / 2);
    await expect(card).toContainText(`${afterSale.toLocaleString("en-US")} / 100,000`);

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
    const card = page.locator(`[data-compound-id="${id}"]`);
    await expect(card).toBeVisible();
    const heading = id[0]!.toUpperCase() + id.slice(1);
    await expect(card.getByRole("button", { name: `Create ${heading}` })).toBeEnabled();
    await card.getByRole("button", { name: `Create ${heading}` }).click();
    await expect(card.locator("header strong")).toContainText("1,501");
    await card.getByLabel(`Sale amount ${heading}`).selectOption("1");
    await card.getByRole("button", { name: new RegExp(`Sell ${heading}`) }).click();
    await expect(card.locator("header strong")).toContainText("1,500");
    if (id === "glass") {
      await card.getByLabel(`Sale amount ${heading}`).selectOption("all");
      await card.getByRole("button", { name: new RegExp(`Sell ${heading}`) }).click();
      await expect(card.locator("header strong")).toContainText("0 / 100,000");
    }
    await expect(card.getByRole("button", { name: "Increase storage" })).toBeDisabled();
  }

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

test("storage purchase consumes the displayed Hydrogen cost and doubles its capacity @resources", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "storage");
  await page.getByRole("button", { name: "Increase storage", exact: true }).click();
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText("300");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("0");
  await captureVisualCheckpoint(page, testInfo, "economy-storage-expanded");
});

test("all eight material storage upgrades are individually usable through clicks @resources @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "storage-each");
  await page.getByRole("button", { name: "Increase storage", exact: true }).click();
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText("300");

  const materialIds = ["helium", "carbon", "neon", "oxygen", "sodium", "silicon", "iron"] as const;
  for (const id of materialIds) {
    const card = page.locator(`[data-resource-id="${id}"]`);
    const startingCapacity = await page.evaluate((goodId) => {
      const state = window.miaplacidusTest!.getState();
      return state.run.goods[goodId].storageCapacity;
    }, id);
    await card.getByRole("button", { name: "Increase storage" }).click();
    await expect(card.locator("header strong")).toContainText(
      `/ ${(startingCapacity * 2).toLocaleString("en-US")}`,
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
    const card = page.locator(`[data-compound-id="${id}"]`);
    const startingCapacity = await page.evaluate(
      (goodId) => window.miaplacidusTest!.getState().run.goods[goodId].storageCapacity,
      id,
    );
    const storage = card.getByRole("button", { name: "Increase storage" });
    await expect(storage).toBeEnabled();
    await storage.click();
    await expect(card.locator("header strong")).toContainText(
      `/ ${(startingCapacity * 2).toLocaleString("en-US")}`,
    );
    if (id === "concrete") {
      await card.getByRole("spinbutton", { name: "Amount Concrete" }).fill("30");
      await card.getByRole("button", { name: "Create Concrete" }).click();
      await expect(card.locator("header strong")).toContainText("30 / 100");
    }
  }
  await expect(page.locator('[data-compound-id="water"] header strong')).toContainText("0 / 200");
  await expect(page.locator('[data-compound-id="concrete"] header strong')).toContainText(
    "0 / 100",
  );
  await captureVisualCheckpoint(page, testInfo, "economy-all-compound-storage");
});

test("every resource and compound autobuyer tier can be bought, resumed, and paused @autobuyers @resources @compounds @energy", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  await startEconomyFixture(page, "buyer-tiers");

  const compressor = page.locator(".autobuyer-card");
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
    const card = page.locator(`[data-resource-id="${id}"]`);
    const autobuyers = card.locator("details").filter({ hasText: "Buy tier" });
    await autobuyers.locator("summary").click();
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
    await autobuyers.locator("summary").click();
  }
  await captureVisualCheckpoint(page, testInfo, "economy-all-material-autobuyer-tiers");

  await page.getByRole("tab", { name: /Compounds/ }).click();
  for (const id of ["diesel", "glass", "steel", "concrete", "water", "titanium"] as const) {
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
  const water = page.locator('[data-compound-id="water"]');
  const storage = water.getByRole("button", { name: "Increase storage" });
  await expect(storage).toBeEnabled();
  await expect(storage).toContainText("99 H₂O + 30 Concrete");
  await storage.click();
  await expect(water.locator("header strong")).toContainText("0 / 200");
  await expect(page.locator('[data-compound-id="concrete"] header strong')).toContainText("0 / 50");
  await captureVisualCheckpoint(page, testInfo, "economy-water-storage-expanded");
});

test("Water storage stays disabled until both displayed inputs are affordable @resources @compounds @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "water-storage-short");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  const water = page.locator('[data-compound-id="water"]');
  const storage = water.getByRole("button", { name: "Increase storage" });
  await expect(storage).toBeDisabled();
  await expect(storage).toContainText("99 H₂O + 30 Concrete");
  await expect(page.locator('[data-compound-id="concrete"] header strong')).toContainText(
    "29 / 50",
  );
  await captureVisualCheckpoint(page, testInfo, "economy-water-storage-blocked");
});

test("Increase all storage prioritizes Water's shared Concrete cost @resources @compounds @precision", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "storage-all");
  await page.getByRole("button", { name: "Increase affordable storage" }).click();
  await expect(page.getByTestId("hydrogen-capacity")).toHaveText("200,000");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  await expect(page.locator('[data-compound-id="water"] header strong')).toContainText(
    "0 / 200,000",
  );
  await expect(page.locator('[data-compound-id="concrete"] header strong')).toContainText(
    "0 / 100,000",
  );
  await captureVisualCheckpoint(page, testInfo, "economy-increase-all-storage");
});

test("Bulk Purchasing buys the affordable science buildings and spends only their exact costs @research @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "bulk-science");
  await page.getByRole("tab", { name: /Research/ }).click();
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
    const card = page.locator(`[data-compound-id="${id}"]`);
    await card.locator("details").locator("summary").click();
    const autoCreate = card.getByLabel("Automatic creation");
    if (await autoCreate.isChecked()) await autoCreate.uncheck();
  }
  await page.locator("#tab-hydrogen").click();
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
    const card = page.locator(`[data-resource-id="${id}"]`);
    const allocation = card.locator("details").filter({ hasText: "Production allocation" });
    await allocation.locator("summary").click();
    await allocation.getByLabel("Cash share (%)").fill("100");
    await expect(allocation.getByText("Retained share: 0%")).toBeVisible();
    await allocation.locator("summary").click();
  }
  await page.getByRole("button", { name: "Buy compressor" }).click();
  await expect(page.getByRole("button", { name: "Pause compressor" })).toBeVisible();
  const carbon = page.locator('[data-resource-id="carbon"]');
  const carbonBuyers = carbon.locator("details").filter({ hasText: "Buy tier 1" });
  await carbonBuyers.locator("summary").click();
  await carbonBuyers
    .locator(".economy-tier")
    .first()
    .getByRole("button", { name: /^Buy ·/ })
    .click();
  const debugTools = page.locator(".debug-tools");
  if (!(await debugTools.evaluate((element) => (element as HTMLDetailsElement).open)))
    await debugTools.locator("summary").first().click();
  await page.getByRole("button", { name: "Advance 10 seconds" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        (startingCash) => window.miaplacidusTest!.getState().run.cash - startingCash,
        initialCash,
      ),
    )
    .toBeCloseTo(2.4, 5);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity))
    .toBeCloseTo(1_950, 5);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.goods.carbon.quantity))
    .toBeCloseTo(1_920, 5);
  await captureVisualCheckpoint(page, testInfo, "economy-player-autosell-allocation");
});

test("player automation creates Diesel from newly produced resource allocations @autobuyers @compounds", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "full");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  for (const id of ["diesel", "glass", "steel", "concrete", "water", "titanium"]) {
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
    const card = page.locator(`[data-resource-id="${id}"]`);
    const allocation = card.locator("details").filter({ hasText: "Production allocation" });
    await allocation.locator("summary").click();
    await allocation.getByLabel("Cash share (%)").fill("0");
    await allocation.getByLabel("Compound share (%)").fill("100");
  }
  await page.getByRole("button", { name: "Buy compressor" }).click();
  await expect(page.getByRole("button", { name: "Pause compressor" })).toBeVisible();
  const carbon = page.locator('[data-resource-id="carbon"]');
  const carbonBuyers = carbon.locator("details").filter({ hasText: "Buy tier 1" });
  await carbonBuyers.locator("summary").click();
  await carbonBuyers
    .locator(".economy-tier")
    .first()
    .getByRole("button", { name: /^Buy ·/ })
    .click();
  const debugTools = page.locator(".debug-tools");
  if (!(await debugTools.evaluate((element) => (element as HTMLDetailsElement).open)))
    await debugTools.locator("summary").first().click();
  await page.getByRole("button", { name: "Advance 10 seconds" }).click();
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
    const card = page.locator(`[data-resource-id="${id}"]`);
    const allocation = card.locator("details").filter({ hasText: "Production allocation" });
    await allocation.locator("summary").click();
    await allocation.getByLabel("Compound share (%)").fill("100");
    await allocation.getByRole("checkbox").check();
    await expect(allocation.getByText("Retained share: 0%")).toBeVisible();
    await allocation.locator("summary").click();
  }

  const debugTools = page.locator(".debug-tools");
  if (!(await debugTools.evaluate((element) => (element as HTMLDetailsElement).open)))
    await debugTools.locator("summary").first().click();
  await page.getByRole("button", { name: "Advance 10 seconds" }).click();
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
  await expect(hydrogen.locator(".economy-rate")).toContainText("3.38");
  await expect(page.getByTestId("hydrogen-rate")).toContainText("3.38");
  await expect(page.locator(".autobuyer-card")).toContainText("Adds 4.5 Hydrogen per second");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.locator('[data-building-id="powerPlant2"]')).toContainText("+13.5 kJ/s");
  await captureVisualCheckpoint(page, testInfo, "economy-permanent-production-multipliers");
});

test("technology research purchase is atomic and opens the energy and compounds panes @research @technology", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "research");
  await page.getByRole("tab", { name: /Research/ }).click();
  await expect(page.getByTestId("research-points")).toHaveText("150");
  await expect(page.getByTestId("research-rate")).toHaveText("0.5");
  await expect(page.getByTestId("economy-research")).toContainText("0.5 RP/s");
  await captureVisualCheckpoint(page, testInfo, "economy-research-ready");
  await page.getByRole("button", { name: "Research technology: Knowledge Sharing" }).click();
  await expect(page.locator('[data-technology-id="knowledgeSharing"]')).toContainText("Researched");
  await expect(page.getByTestId("research-feedback")).toHaveText("Knowledge Sharing researched.");
  await expect(page.getByTestId("research-points")).toHaveText("0");
  await captureVisualCheckpoint(page, testInfo, "economy-research-unlocked");
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

test("research automation purchases an available technology from player controls @research @technology @autobuyers", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "research");
  await page.getByRole("tab", { name: /Research/ }).click();
  const automation = page.getByRole("checkbox", {
    name: "Research available technologies automatically",
  });
  await expect(automation).toBeEnabled();
  await automation.check();
  const debugTools = page.locator(".debug-tools");
  if (!(await debugTools.evaluate((element) => (element as HTMLDetailsElement).open)))
    await debugTools.locator("summary").first().click();
  await page.getByRole("button", { name: "Advance 10 seconds" }).click();
  const knowledgeSharing = page.locator('[data-technology-id="knowledgeSharing"]');
  await expect(knowledgeSharing.locator(".status-pill")).toBeVisible();
  await expect(page.getByTestId("research-feedback")).toHaveText("Knowledge Sharing researched.");
  await expect(automation).toBeChecked();
  await automation.uncheck();
  await expect(automation).not.toBeChecked();
  await expect(page.getByTestId("research-points")).toHaveText("5");
  await captureVisualCheckpoint(page, testInfo, "economy-research-automation");
});

test("research completion feedback is localized across all six player languages @research @technology @locale", async ({
  page,
}, testInfo) => {
  const cases = [
    { id: "en", expected: "Knowledge Sharing researched." },
    {
      id: "es",
      expected: "Intercambio de Conocimiento: investigación completada.",
    },
    { id: "pt", expected: "Partilha de Conhecimento: pesquisa concluída." },
    { id: "de", expected: "Wissensaustausch erforscht." },
    {
      id: "it",
      expected: "Condivisione della Conoscenza: ricerca completata.",
    },
    { id: "fr", expected: "Recherche terminée : Partage des Connaissances." },
  ] as const;
  await startEconomyFixture(page, "research");
  await page.locator("#tab-research").click();
  await page.getByRole("button", { name: "Research technology: Knowledge Sharing" }).click();
  for (const item of cases) {
    await page.locator("#tab-hydrogen").click();
    await page.locator("#hydrogen-locale").selectOption(item.id);
    await page.locator("#tab-research").click();
    await expect(page.getByTestId("research-feedback")).toHaveText(item.expected);
    await captureVisualCheckpoint(page, testInfo, `economy-research-feedback-${item.id}`);
  }
});

test("the Dyson power research gate grants infinite power and restores a full grid @energy @technology", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "infinite-power");
  await page.getByRole("tab", { name: /Research/ }).click();
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
  test.setTimeout(90_000);
  await startEconomyFixture(page, "full");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("2,000");
  await page.getByLabel("Number notation").selectOption("scientific");
  await expect(page.getByTestId("hydrogen-quantity")).toContainText("2E3");
  await captureVisualCheckpoint(page, testInfo, "economy-scientific-notation");
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
    await page.locator("#tab-hydrogen").click();
    await page.locator("#hydrogen-locale").selectOption(locale.id);
    await expect(page.locator("#pane-hydrogen .pane-heading h2")).toHaveText(locale.hydrogen);
    await expect(page.getByTestId("hydrogen-quantity")).toContainText("E3");
    const resources = page.locator("#pane-hydrogen [data-resource-id]");
    await expect(resources).toHaveCount(MATERIAL_IDS.length);
    for (const id of MATERIAL_IDS)
      await expect(page.locator(`#pane-hydrogen [data-resource-id="${id}"] h3`)).toHaveText(
        economyGoodName(locale.id, id),
      );
    await expandAllDetails(page.locator("#pane-hydrogen"));
    await expect(page.locator("#pane-hydrogen")).not.toContainText("???");
    await expect(page.locator("#pane-hydrogen .economy-tier").first()).toContainText(
      economyLabel(locale.id, "buyTier"),
    );
    await collapseAllDetails(page.locator("#pane-hydrogen"));
    await captureVisualCheckpoint(page, testInfo, `economy-locale-${locale.id}`);

    await page.locator("#tab-research").click();
    const technologies = page.locator("#pane-research .tech-card");
    await expect(technologies).toHaveCount(TECHNOLOGY_CATALOG.length);
    for (const technology of TECHNOLOGY_CATALOG)
      await expect(
        page.locator(`#pane-research [data-technology-id="${technology.id}"] h3`),
      ).toHaveText(TECHNOLOGY_NAMES[technology.id][locale.id]);
    await expect(page.locator('[data-technology-id="knowledgeSharing"] h3')).toHaveText(
      locale.research,
    );
    await expect(
      page.locator('[data-technology-id="knowledgeSharing"] .tech-effect'),
    ).not.toContainText("???");
    await expect(page.locator('[data-building-id="scienceKit"] h3')).toHaveText(locale.science);
    for (const id of Object.keys(SCIENCE_BUILDINGS) as (keyof typeof SCIENCE_BUILDINGS)[])
      await expect(page.locator(`#pane-research [data-building-id="${id}"] h3`)).toHaveText(
        ECONOMY_BUILDING_NAMES[id][locale.id],
      );
    await expect(page.locator("#pane-research")).not.toContainText("???");
    await expect(page.locator('[data-tech-path="1"]')).toBeVisible();
    await expect(
      page.locator('[data-technology-id="knowledgeSharing"] .status-pill'),
    ).toBeVisible();
    await captureVisualCheckpoint(page, testInfo, `economy-research-locale-${locale.id}`);
    await page.locator("#tab-energy").click();
    for (const id of Object.keys(ENERGY_BUILDINGS) as (keyof typeof ENERGY_BUILDINGS)[])
      await expect(page.locator(`#pane-energy [data-building-id="${id}"] h3`)).toHaveText(
        ECONOMY_BUILDING_NAMES[id][locale.id],
      );
    await expect(page.locator('[data-building-id="powerPlant1"] h3')).toHaveText(locale.plant);
    await expect(page.locator('[data-building-id="powerPlant1"] button').first()).toBeEnabled();
    await expect(page.locator("#pane-energy")).not.toContainText("???");
    await captureVisualCheckpoint(page, testInfo, `economy-energy-locale-${locale.id}`);
    await page.locator("#tab-compounds").click();
    const compounds = page.locator("#pane-compounds [data-compound-id]");
    await expect(compounds).toHaveCount(COMPOUND_IDS.length);
    for (const id of COMPOUND_IDS)
      await expect(page.locator(`#pane-compounds [data-compound-id="${id}"] h3`)).toHaveText(
        economyGoodName(locale.id, id),
      );
    await expect(page.locator('[data-compound-id="diesel"] h3')).toHaveText(locale.diesel);
    await expect(page.locator('[data-compound-id="diesel"]')).toContainText(locale.dieselRecipe);
    await expect(page.locator('[data-compound-id="diesel"] button').first()).toBeEnabled();
    await expandAllDetails(page.locator("#pane-compounds"));
    await expect(page.locator("#pane-compounds")).not.toContainText("???");
    await expect(page.locator("#pane-compounds .economy-tier").first()).toContainText(
      economyLabel(locale.id, "buyTier"),
    );
    await collapseAllDetails(page.locator("#pane-compounds"));
    await captureVisualCheckpoint(page, testInfo, `economy-compounds-locale-${locale.id}`);
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
  await page.getByLabel("Power grid").uncheck();
  await page.getByLabel("Power grid").check();
  await page.getByRole("tab", { name: /Research/ }).click();
  await expect(page.getByTestId("economy-research")).toBeVisible();
  await expect(page.locator("[data-technology-id]").first()).toBeVisible();
  await captureVisualCheckpoint(page, testInfo, "economy-technology-panel");
  await page.getByRole("tab", { name: /Compounds/ }).click();
  const diesel = page.locator('[data-compound-id="diesel"]');
  await expect(diesel).toBeVisible();
  await expect(diesel).toContainText("26 Hydrogen + 12 Carbon");
  await diesel.getByRole("button", { name: "Create Diesel" }).click();
  await expect(diesel).toContainText("1,501 / 100,000");
  await captureVisualCheckpoint(page, testInfo, "economy-compound-panel");
});

test("energy deficit trips after grace period and grid toggle recovers the system @energy", async ({
  page,
}) => {
  await startEconomyFixture(page, "power-deficit");
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.getByTestId("power-unavailable")).toHaveText("3");
  const debugTools = page.locator(".debug-tools");
  if (!(await debugTools.evaluate((element) => (element as HTMLDetailsElement).open)))
    await debugTools.locator("summary").first().click();
  await page.getByRole("button", { name: "Advance 10 seconds" }).click();
  await page.getByRole("button", { name: "Advance 10 seconds" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Power trip" })).toBeVisible();
  await page.getByLabel("Power grid").uncheck();
  await expect(page.getByRole("alert").filter({ hasText: "Power trip" })).toHaveCount(0);
});

test("battery storage charges, drains under load, and recharges after load stops @energy @research", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "battery-cycle");
  await page.getByRole("tab", { name: /Energy/ }).click();
  const battery = page.locator('[data-building-id="battery1"]');
  await battery.getByRole("button", { name: "Buy", exact: true }).click();
  const solar = page.locator('[data-building-id="powerPlant2"]');
  await solar.getByRole("button", { name: "Buy", exact: true }).click();

  await page.getByRole("tab", { name: /Research/ }).click();
  const lab = page.locator('[data-building-id="scienceLab"]');
  await lab.getByRole("button", { name: "Buy", exact: true }).click();
  await lab.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(lab.getByRole("button", { name: "Resume", exact: true })).toBeVisible();

  const debugTools = page.locator(".debug-tools");
  if (!(await debugTools.evaluate((element) => (element as HTMLDetailsElement).open)))
    await debugTools.locator("summary").first().click();
  await page.getByRole("button", { name: "Advance 10 seconds" }).click();
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.getByTestId("power-quantity")).toHaveText("300");
  await captureVisualCheckpoint(page, testInfo, "economy-battery-charged");

  await page.getByRole("tab", { name: /Research/ }).click();
  await lab.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("button", { name: "Advance 10 seconds" }).click();
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.getByTestId("power-quantity")).toHaveText("150");
  await captureVisualCheckpoint(page, testInfo, "economy-battery-discharged");

  await page.getByRole("tab", { name: /Research/ }).click();
  await lab.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Advance 10 seconds" }).click();
  await page.getByRole("tab", { name: /Energy/ }).click();
  await expect(page.getByTestId("power-quantity")).toHaveText("350");
  await captureVisualCheckpoint(page, testInfo, "economy-battery-recharged");
});

test("resource, research, power, compound, language and notation changes survive save and reload @save-load-local @resources @research @energy @compounds", async ({
  page,
}, testInfo) => {
  await startEconomyFixture(page, "save");
  const carbon = page.locator('[data-resource-id="carbon"]');
  await carbon.getByRole("button", { name: "Collect +1 Carbon" }).click();
  await page.getByRole("button", { name: "Buy compressor", exact: true }).click();
  await expect(page.getByTestId("hydrogen-autobuyer-count")).toHaveText("1");
  const hydrogenAutobuyer = page.locator(".autobuyer-card button[aria-pressed='true']");
  await hydrogenAutobuyer.click();
  const iron = page.locator('[data-resource-id="iron"]');
  await iron.getByRole("button", { name: /Increase storage/ }).click();
  await expect(iron.locator("header strong")).toHaveText("0 / 3,002");
  await page.getByRole("tab", { name: /Research/ }).click();
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
  await carbonAllocation.getByLabel("Cash share (%)").fill("40");
  await page.locator("#number-notation").selectOption("scientific");
  await page.locator("#hydrogen-locale").selectOption("fr");
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
  await page.getByRole("button", { name: "Confirmer", exact: true }).click();
  await page.getByRole("button", { name: "Commencer", exact: true }).click();
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
