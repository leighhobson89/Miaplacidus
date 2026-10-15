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
import { expandAllDetails, collapseAllDetails, expectLocalizedContent, clearTransientEconomyOverlays, expandResearchProduction } from "../_harness/economyShared";

test("notation and language controls update live economy and technology readouts @precision @ui @locale @localization", async ({
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

