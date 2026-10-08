import { type Locator, type Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { formatNumber } from "../../../src/app/numberFormatting";
import { COSMIC_RIP_TECHNOLOGIES } from "../../../src/content/cosmicRip";
import { LOCALE_IDS } from "../../../src/content/ids";
import { createEconomyTickPlan } from "../../../src/engine/economySimulation";
import { currentWeatherForSystem } from "../../../src/engine/weather";
import { energyStatisticLabel } from "../../../src/i18n/energyStatisticsMessages";
import { settingsStatisticLabel } from "../../../src/i18n/settingsMessages";
import {
  cosmicRipTrackingNote,
  energyTrackingNote,
  statisticsNotApplicableLabel,
} from "../../../src/i18n/statisticsMessages";
import {
  interstellarStatisticLabel,
  interstellarStatisticsTrackingNote,
} from "../../../src/i18n/interstellarStatisticsMessages";
import { topStatusText } from "../../../src/i18n/topStatusMessages";
import { setGameLocale } from "../_harness/settings-controls";
import { startMetaFixture } from "../_harness/meta-fixture";

async function startEnergyStatisticsFixture(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=power-buildings");
  await page.getByLabel("Pioneer name").fill("Energy Statistics Pioneer");
  await page.getByTestId("start-game").click();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}

async function startInterstellarStatisticsFixture(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261006&testLocale=en&economyFixture=space-battle-victory");
  await page.getByLabel("Pioneer name").fill("Interstellar Statistics Pioneer");
  await page.getByTestId("start-game").click();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}

const ENERGY_STATISTIC_IDS = [
  "powerCurrent",
  "totalEnergy",
  "totalProduction",
  "totalConsumption",
  "totalBatteryStorage",
  "energyTrips",
  "basicPowerPlants",
  "advancedPowerPlants",
  "solarPowerPlants",
  "sodiumIonBatteries",
  "battery2",
  "battery3",
] as const;

const INTERSTELLAR_STATISTIC_IDS = [
  "starStudyRange",
  "starShipBuilt",
  "starshipDistanceTravelled",
  "systemScanned",
  "fleetAttackStrength",
  "envoy",
  "scout",
  "marauder",
  "landStalker",
  "navalStrafer",
  "enemy",
  "enemyDefenceOvercome",
  "enemyDefenceRemaining",
  "apFromStarVoyage",
  "blackHoleDiscovered",
  "blackHoleAlwaysActive",
  "blackHoleStrength",
] as const;

const ENERGY_STATISTIC_OWNER_PANES = {
  powerCurrent: "energy-storage",
  totalEnergy: "energy-storage",
  totalProduction: "energy-power-plant",
  totalConsumption: "energy-power-plant",
  totalBatteryStorage: "energy-storage",
  energyTrips: "energy-storage",
  basicPowerPlants: "energy-power-plant",
  advancedPowerPlants: "energy-advanced-power-plant",
  solarPowerPlants: "energy-solar-power-plant",
  sodiumIonBatteries: "energy-storage",
  battery2: "energy-storage",
  battery3: "energy-storage",
} as const;

test("global and current-run status stats follow their two-row layout @presentation @status", async ({
  freshGame,
}) => {
  await expect(freshGame.getByTestId("global-stat-run-number")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-gp")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-ap")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-cp")).toHaveCount(0);
  await expect(freshGame.getByTestId("top-stat-time")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-energy")).toHaveCount(0);
  await expect(freshGame.getByTestId("top-stat-power")).toHaveCount(0);
  await expect(freshGame.getByTestId("top-stat-antimatter")).toHaveCount(0);
  expect(
    await freshGame
      .getByTestId("global-context-bar")
      .locator(":scope > *")
      .evaluateAll((children) => children.map((child) => child.getAttribute("data-testid"))),
  ).toEqual(["global-stat-run-number", "top-stat-gp", "top-stat-ap"]);
  expect(
    await freshGame
      .getByTestId("run-status-bar")
      .locator(":scope > *")
      .evaluateAll((children) => children.map((child) => child.getAttribute("data-testid"))),
  ).toEqual(["location-status", "top-stat-time", "top-stat-cash", "top-stat-rp", "top-stat-event"]);
  await expect(freshGame.getByTestId("cash-balance")).toBeVisible();
  await expect(freshGame.getByTestId("research-balance")).toBeVisible();

  await startMetaFixture(freshGame, "meta-megastructure-route");
  await expect(freshGame.getByTestId("top-stat-antimatter")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-antimatter")).not.toContainText("???");
  await expect(freshGame.getByTestId("global-stat-megastructure-progress")).toBeVisible();
});

test("weather and star system sit beside cash and remain visible on mobile @presentation @status", async ({
  freshGame,
}) => {
  const location = freshGame.getByTestId("location-status");
  const cash = freshGame.getByTestId("cash-balance");
  await expect(location.locator("svg")).toBeVisible();
  await expect(freshGame.getByTestId("top-location-system")).toHaveText("Spica");
  await location.locator(".location-status-summary").focus();
  await expect(freshGame.locator("#location-status-tooltip")).toBeVisible();
  await location.locator(".location-status-summary").evaluate((element) => element.blur());
  const desktopPosition = await location.evaluate((element) => {
    const runtime = document.querySelector('[data-testid="top-stat-time"]');
    const cashValue = document.querySelector('[data-testid="cash-balance"]');
    if (!runtime || !cashValue) throw new Error("Runtime or cash balance is missing.");
    const locationBounds = element.getBoundingClientRect();
    const runtimeBounds = runtime.getBoundingClientRect();
    const cashBounds = cashValue.getBoundingClientRect();
    return {
      isBeforeRuntime: locationBounds.right <= runtimeBounds.left,
      isRuntimeBeforeCash: runtimeBounds.right <= cashBounds.left,
      gapToRuntime: runtimeBounds.left - locationBounds.right,
      gapToCash: cashBounds.left - runtimeBounds.right,
    };
  });
  expect(desktopPosition.isBeforeRuntime).toBe(true);
  expect(desktopPosition.isRuntimeBeforeCash).toBe(true);
  expect(desktopPosition.gapToRuntime).toBeLessThan(32);
  expect(desktopPosition.gapToCash).toBeLessThan(32);
  await expect(freshGame.locator(".game-header")).toHaveScreenshot("status-header-desktop.png");

  await freshGame.setViewportSize({ width: 390, height: 844 });
  await expect(location).toBeVisible();
  await expect(cash).toBeVisible();
  await location.locator(".location-status-summary").focus();
  await expect(freshGame.locator("#location-status-tooltip")).toBeVisible();
  const mobilePosition = await location.evaluate((element) => {
    const runtime = document.querySelector('[data-testid="top-stat-time"]');
    const cashValue = document.querySelector('[data-testid="cash-balance"]');
    if (!runtime || !cashValue) throw new Error("Runtime or cash balance is missing.");
    const locationBounds = element.getBoundingClientRect();
    const runtimeBounds = runtime.getBoundingClientRect();
    const cashBounds = cashValue.getBoundingClientRect();
    return {
      isBeforeRuntime: locationBounds.right <= runtimeBounds.left,
      isRuntimeBeforeCash: runtimeBounds.right <= cashBounds.left,
      gapToRuntime: runtimeBounds.left - locationBounds.right,
      gapToCash: cashBounds.left - runtimeBounds.right,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  expect(mobilePosition.isBeforeRuntime).toBe(true);
  expect(mobilePosition.isRuntimeBeforeCash).toBe(true);
  expect(mobilePosition.gapToRuntime).toBeLessThan(32);
  expect(mobilePosition.gapToCash).toBeLessThan(32);
  expect(mobilePosition.pageWidth).toBeLessThanOrEqual(mobilePosition.viewportWidth);
  await location.locator(".location-status-summary").evaluate((element) => element.blur());
  await expect(freshGame.locator(".game-header")).toHaveScreenshot("status-header-mobile.png");
});

test("localized weather and its tooltip fit beside cash at 390px @presentation @status @locale", async ({
  freshGame,
}) => {
  await freshGame.setViewportSize({ width: 390, height: 844 });
  const location = freshGame.getByTestId("location-status");
  const cash = freshGame.getByTestId("cash-balance");
  const state = await freshGame.evaluate(() => window.miaplacidusTest!.getState());
  const weather = currentWeatherForSystem(state.run.space);
  const weatherKey = `weather${weather.charAt(0).toUpperCase()}${weather.slice(1)}` as Parameters<
    typeof topStatusText
  >[1];

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    const expectedWeather = topStatusText(locale, weatherKey);
    await expect(freshGame.getByTestId("top-location-system")).toHaveText("Spica");
    await expect(freshGame.getByTestId("top-location-weather")).toHaveText(expectedWeather);
    await location.locator(".location-status-summary").focus();
    const tooltip = freshGame.locator("#location-status-tooltip");
    await expect(tooltip).toContainText(topStatusText(locale, "weather"));
    const layout = await location.evaluate((element) => {
      const runtime = document.querySelector('[data-testid="top-stat-time"]');
      const cashValue = document.querySelector('[data-testid="cash-balance"]');
      if (!runtime || !cashValue) throw new Error("Runtime or cash balance is missing.");
      const locationBounds = element.getBoundingClientRect();
      const runtimeBounds = runtime.getBoundingClientRect();
      const cashBounds = cashValue.getBoundingClientRect();
      return {
        locationBeforeRuntime: locationBounds.right <= runtimeBounds.left,
        runtimeBeforeCash: runtimeBounds.right <= cashBounds.left,
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      };
    });
    expect(layout.locationBeforeRuntime).toBe(true);
    expect(layout.runtimeBeforeCash).toBe(true);
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth);
    await location.locator(".location-status-summary").evaluate((element) => element.blur());
  }
});

test("maps source Statistics groups, production totals, and Space Mining metrics @settings @statistics @interstellar-statistics", async ({
  freshGame,
}) => {
  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");
  await settings.locator("#tab-settings-statistics").click();

  const statistics = settings.getByTestId("settings-statistics");
  await expect(statistics).toBeVisible();
  await expect(statistics.locator(".settings-stat-card")).toHaveCount(120);
  await expect(statistics.locator(".settings-stat-section h4")).toHaveText([
    "Overview",
    "Run",
    "Current snapshot",
    "Events",
    "Resources",
    "Compounds",
    "Research",
    "Energy",
    "Space Mining",
    "Interstellar",
    "Galactic Casino",
    "Cosmic Rip Chapter",
    "MIAPLACIDUS live status",
    "Lifetime",
  ]);
  const statisticsSection = (name: string) =>
    statistics.getByRole("heading", { name, level: 4, exact: true }).locator("xpath=..");
  const statisticCard = (section: ReturnType<typeof statisticsSection>, label: string) =>
    section.locator(".settings-stat-card").filter({ hasText: label });
  const overview = statisticsSection("Overview");
  await expect(overview.locator(".settings-stat-card")).toHaveCount(13);
  await expect(statisticCard(overview, "AP Gain").locator("dd")).toHaveText("0");
  await expect(statisticCard(overview, "Unique News Tickers Seen").locator("dd")).toHaveText("0");
  await expect(statisticCard(overview, "News Ticker Prizes Collected").locator("dd")).toHaveText(
    "0",
  );
  await expect(statisticCard(overview, "Total Asteroids Discovered").locator("dd")).toHaveText("0");
  await expect(statisticCard(overview, "Legendary Asteroids Discovered").locator("dd")).toHaveText(
    "0",
  );
  await expect(statisticCard(overview, "Rockets Launched").locator("dd")).toHaveText("0");
  await expect(statisticCard(overview, "Star Ships Launched").locator("dd")).toHaveText("0");
  const run = statisticsSection("Run");
  await expect(statisticCard(run, "Run time").locator("dd")).toBeVisible();
  await expect(statisticCard(run, "Star system").locator("dd")).toHaveText("Spica");
  const currentWeather = await statisticCard(run, "Current weather").locator("dd").innerText();
  await expect(freshGame.locator("#location-status-tooltip")).toContainText(currentWeather);
  await expect(statisticCard(run, "Cash").locator("dd")).toBeVisible();
  await expect(statisticCard(run, "AP anticipated").locator("dd")).toHaveText("0");
  await expect(statisticCard(run, "Antimatter").locator("dd")).toHaveText("0");
  await expect(run.getByText(/AP anticipated is not tracked separately/)).toHaveCount(0);
  const currentSnapshot = statisticsSection("Current snapshot");
  await expect(statisticCard(currentSnapshot, "Research pool").locator("dd")).toHaveText("50");
  await expect(statisticCard(run, "Research pool")).toHaveCount(0);
  const energy = statisticsSection(energyStatisticLabel("en", "energySection"));
  await expect(energy.locator(".settings-stat-card")).toHaveCount(12);
  for (const id of ENERGY_STATISTIC_IDS)
    await expect(energy.locator(`[data-statistic-id="${id}"]`).getByRole("link")).toHaveCount(0);
  const research = statisticsSection("Research");
  await expect(research.locator(".settings-stat-card")).toHaveCount(5);
  await expect(research.locator(".settings-stat-card dt")).toHaveText([
    "Research points earned",
    "Science kits built",
    "Science clubs built",
    "Science labs built",
    "Techs unlocked",
  ]);
  await expect(research.locator(".settings-stat-pair-values strong")).toHaveText(
    Array(8).fill("0"),
  );
  await expect(statisticCard(research, "Techs unlocked").locator("dd")).toHaveText("0");
  const resources = statisticsSection("Resources");
  await expect(resources.locator(".settings-stat-card dt")).toHaveText([
    "Hydrogen",
    "Helium",
    "Carbon",
    "Neon",
    "Oxygen",
    "Sodium",
    "Silicon",
    "Iron",
  ]);
  await expect(resources.locator(".settings-stat-card")).toHaveCount(8);
  await expect(resources.locator(".settings-stat-pair-values strong")).toHaveText(
    Array(16).fill("0"),
  );
  await expect(
    statisticCard(resources, "Hydrogen").locator(".settings-stat-pair-values strong"),
  ).toHaveText(["0", "0"]);
  const compounds = statisticsSection("Compounds");
  await expect(compounds.locator(".settings-stat-card dt")).toHaveText([
    "Diesel",
    "Glass",
    "Steel",
    "Concrete",
    "Water",
    "Titanium",
  ]);
  await expect(compounds.locator(".settings-stat-card")).toHaveCount(6);
  await expect(compounds.locator(".settings-stat-pair-values strong")).toHaveText(
    Array(12).fill("0"),
  );
  await expect(
    statisticCard(compounds, "Diesel").locator(".settings-stat-pair-values strong"),
  ).toHaveText(["0", "0"]);
  const spaceMining = statisticsSection("Space Mining");
  await expect(spaceMining.locator(".settings-stat-card")).toHaveCount(5);
  await expect(statisticCard(spaceMining, "Space telescope built").locator("dd")).toHaveText("No");
  await expect(statisticCard(spaceMining, "Launch Pad built").locator("dd")).toHaveText("No");
  await expect(
    statisticCard(spaceMining, "Rockets built").locator(".settings-stat-pair-values strong"),
  ).toHaveText(["0", "0"]);
  await expect(
    statisticCard(spaceMining, "Asteroids discovered").locator(".settings-stat-pair-values strong"),
  ).toHaveText(["0", "0"]);
  await expect(
    statisticCard(spaceMining, "Asteroids mined").locator(".settings-stat-pair-values strong"),
  ).toHaveText(["0", "0"]);
  const interstellar = statisticsSection("Interstellar");
  const interstellarRows = interstellar.locator(".settings-stat-card");
  await expect(interstellarRows).toHaveCount(18);
  const interstellarRowIds = await interstellarRows.evaluateAll((cards) =>
    cards.map((card) => card.getAttribute("data-statistic-id")),
  );
  expect(interstellarRowIds.slice(0, INTERSTELLAR_STATISTIC_IDS.length)).toEqual(
    INTERSTELLAR_STATISTIC_IDS,
  );
  await expect(interstellarRows.last().locator("dt")).toHaveText("Systems settled");
  await expect(interstellar.locator(".settings-stat-note")).toHaveText(
    interstellarStatisticsTrackingNote("en"),
  );
  for (const id of INTERSTELLAR_STATISTIC_IDS) {
    const row = interstellar.locator(`[data-statistic-id="${id}"]`);
    await expect(row.locator("dt")).toHaveText(interstellarStatisticLabel("en", id));
    await expect(row.locator(".settings-stat-pair-values small")).toHaveText([
      settingsStatisticLabel("en", "run"),
      settingsStatisticLabel("en", "lifetime"),
    ]);
    await expect(row.locator(".settings-stat-pair-values strong")).toHaveCount(2);
  }
  for (const id of INTERSTELLAR_STATISTIC_IDS) {
    await expect(interstellar.locator(`[data-statistic-id="${id}"] a`)).toHaveCount(0);
  }
  await expect(
    interstellar.locator('[data-statistic-id="starStudyRange"] .settings-stat-pair-values strong'),
  ).toHaveText(["0 ly", "Not applicable"]);
  await expect(
    interstellar.locator('[data-statistic-id="starShipBuilt"] .settings-stat-pair-values strong'),
  ).toHaveText(["No", "Not applicable"]);
  await expect(
    interstellar.locator(
      '[data-statistic-id="starshipDistanceTravelled"] .settings-stat-pair-values strong',
    ),
  ).toHaveText(["0 ly", "0 ly"]);
  await expect(
    interstellar.locator('[data-statistic-id="enemy"] .settings-stat-pair-values strong'),
  ).toHaveText(["Not applicable", "Not applicable"]);
  await expect(
    statistics.getByRole("heading", { name: "Events", level: 4, exact: true }),
  ).toBeVisible();
  await expect(statistics.getByText("Power plant explosion", { exact: true })).toBeVisible();
  await expect(statistics.getByText("Black hole instability", { exact: true })).toBeVisible();
  await expect(
    statistics.getByText(/Saved runs restore up to 100 recent event records/),
  ).toBeVisible();
  await expect(
    statistics.getByRole("heading", { name: "Galactic Casino", level: 4, exact: true }),
  ).toBeVisible();
  await expect(
    statistics.getByRole("heading", { name: "Cosmic Rip Chapter", level: 4, exact: true }),
  ).toBeVisible();
  const cosmicRip = statisticsSection("Cosmic Rip Chapter");
  const cosmicRipSourceIds = await cosmicRip
    .locator(".settings-stat-card")
    .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-statistic-id")));
  expect(cosmicRipSourceIds).toEqual([
    "cosmicRipGalacticPointsEarned",
    "cosmicRipGpSpent",
    "cosmicRipTelemetryEarned",
    "cosmicRipChapterUnlocked",
    "cosmicRipScannerRestored",
    "cosmicRipLocated",
    "cosmicRipStabilised",
  ]);
  const gpEarned = cosmicRip.locator('[data-statistic-id="cosmicRipGalacticPointsEarned"]');
  await expect(gpEarned.locator(".settings-stat-pair-values small")).toHaveText([
    settingsStatisticLabel("en", "run"),
    settingsStatisticLabel("en", "lifetime"),
  ]);
  await expect(gpEarned.locator(".settings-stat-pair-values strong")).toHaveText([
    statisticsNotApplicableLabel("en"),
    "0",
  ]);
  await expect(statisticCard(cosmicRip, "Cosmic Rip Chapter unlocked").locator("dd")).toHaveText(
    "No",
  );
  await expect(statisticCard(cosmicRip, "Cosmic Rip stabilised").locator("dd")).toHaveText("No");
  const cosmicRipLive = statisticsSection("MIAPLACIDUS live status");
  await expect(statisticCard(cosmicRipLive, "Cosmic Rip closed").locator("dd")).toHaveText("No");
  await expect(statistics.getByText("Double or Nothing played", { exact: true })).toBeVisible();
  await expect(
    statistics.getByText("Near Space Scanner Array restored", { exact: true }),
  ).toBeVisible();

  await freshGame.setViewportSize({ width: 320, height: 900 });
  const interstellarLayout = await interstellar.evaluate((section) => {
    const cards = Array.from(section.querySelectorAll<HTMLElement>(".settings-stat-card"));
    return {
      sectionClientWidth: section.clientWidth,
      sectionScrollWidth: section.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      widestCard: Math.max(...cards.map((card) => card.scrollWidth)),
      cardClientWidth: Math.min(...cards.map((card) => card.clientWidth)),
    };
  });
  expect(interstellarLayout.sectionScrollWidth).toBeLessThanOrEqual(
    interstellarLayout.sectionClientWidth,
  );
  expect(interstellarLayout.documentScrollWidth).toBeLessThanOrEqual(
    interstellarLayout.documentClientWidth,
  );
  expect(interstellarLayout.widestCard).toBeLessThanOrEqual(interstellarLayout.cardClientWidth);
});

test("maps Galactic Points Earned to the Cosmic Rip source row and settled-system count @settings @statistics @cosmic-rip-gp-earned", async ({
  freshGame,
}) => {
  const openStatistics = async () => {
    await freshGame.locator("#tab-settings").click();
    const settings = freshGame.getByTestId("settings-pane");
    await settings.locator("#tab-settings-statistics").click();
    return settings.getByTestId("settings-statistics");
  };
  const assertSourceRow = async (settledCount: number, expectedLifetime: string) => {
    expect(
      await freshGame.evaluate(
        () => window.miaplacidusTest!.getState().permanent.settledSystemIds.length,
      ),
    ).toBe(settledCount);
    const statistics = await openStatistics();
    const sourceSection = statistics
      .getByRole("heading", { name: "Cosmic Rip Chapter", level: 4, exact: true })
      .locator("xpath=..");
    const sourceIds = await sourceSection
      .locator(".settings-stat-card")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-statistic-id")));
    expect(sourceIds).toEqual([
      "cosmicRipGalacticPointsEarned",
      "cosmicRipGpSpent",
      "cosmicRipTelemetryEarned",
      "cosmicRipChapterUnlocked",
      "cosmicRipScannerRestored",
      "cosmicRipLocated",
      "cosmicRipStabilised",
    ]);
    const row = sourceSection.locator('[data-statistic-id="cosmicRipGalacticPointsEarned"]');
    await expect(row.locator(".settings-stat-pair-values small")).toHaveText([
      "This run",
      "Lifetime",
    ]);
    await expect(row.locator(".settings-stat-pair-values strong")).toHaveText([
      statisticsNotApplicableLabel("en"),
      expectedLifetime,
    ]);
    await expect(
      statistics.getByRole("heading", { name: "MIAPLACIDUS live status", level: 4, exact: true }),
    ).toBeVisible();
  };

  await assertSourceRow(1, "0");
  await startMetaFixture(freshGame, "meta-cosmic-rip-route");
  await assertSourceRow(2, "1");
});

test("Interstellar Statistics links navigate only to currently unlocked owner pages @settings @statistics @interstellar-statistics", async ({
  page,
}) => {
  await startInterstellarStatisticsFixture(page);
  const openStatistics = async () => {
    await page.locator("#tab-settings").click();
    const settings = page.getByTestId("settings-pane");
    await settings.locator("#tab-settings-statistics").click();
    return settings.getByTestId("settings-statistics");
  };
  const statistics = await openStatistics();
  const interstellar = statistics
    .getByRole("heading", { name: "Interstellar", level: 4, exact: true })
    .locator("xpath=..");
  const ownerLink = (id: (typeof INTERSTELLAR_STATISTIC_IDS)[number]) =>
    interstellar.locator(`[data-statistic-id="${id}"]`).getByRole("link");

  await expect(ownerLink("starStudyRange")).toHaveAttribute("href", "#tab-interstellar-star-map");
  await expect(ownerLink("starShipBuilt")).toHaveAttribute("href", "#tab-interstellar-starship");
  await expect(ownerLink("scout")).toHaveAttribute("href", "#tab-interstellar-fleet-hangar");
  await expect(ownerLink("enemy")).toHaveAttribute("href", "#tab-interstellar-colonise");
  for (const id of ["blackHoleDiscovered", "blackHoleAlwaysActive", "blackHoleStrength"] as const)
    await expect(interstellar.locator(`[data-statistic-id="${id}"] a`)).toHaveCount(0);

  await ownerLink("starShipBuilt").click();
  await expect(page.locator("#tab-interstellar")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-interstellar-starship")).toHaveAttribute("aria-selected", "true");

  let updatedStatistics = await openStatistics();
  await updatedStatistics.locator('[data-statistic-id="scout"]').getByRole("link").click();
  await expect(page.locator("#tab-interstellar-fleet-hangar")).toHaveAttribute(
    "aria-selected",
    "true",
  );

  updatedStatistics = await openStatistics();
  await updatedStatistics.locator('[data-statistic-id="enemy"]').getByRole("link").click();
  await expect(page.locator("#tab-interstellar-colonise")).toHaveAttribute("aria-selected", "true");

  updatedStatistics = await openStatistics();
  const systemsSettledLink = updatedStatistics.locator('[data-statistic-id="systemsSettled"] a');
  await expect(systemsSettledLink).toHaveAttribute("href", "#tab-interstellar-star-map");
  await systemsSettledLink.click();
  await expect(page.locator("#tab-interstellar-star-map")).toHaveAttribute("aria-selected", "true");
});

test("Black Hole Statistics link to the discovered Black Hole page @settings @statistics @interstellar-statistics", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.locator("#tab-settings").click();
  const settings = page.getByTestId("settings-pane");
  await settings.locator("#tab-settings-statistics").click();
  const statistics = settings.getByTestId("settings-statistics");
  const blackHole = statistics
    .getByRole("heading", { name: "Interstellar", level: 4, exact: true })
    .locator("xpath=..");
  const link = blackHole.locator('[data-statistic-id="blackHoleStrength"] a');
  await expect(link).toHaveAttribute("href", "#tab-galactic-black-hole");
  await link.click();
  await expect(page.locator("#tab-galaxy")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tab-galactic-black-hole")).toHaveAttribute("aria-selected", "true");
});

test("shows live Energy values, source counters, links, and six localized labels @settings @statistics @energy-statistics @locale", async ({
  page,
}) => {
  await startEnergyStatisticsFixture(page);
  await page.getByRole("tab", { name: /Energy/ }).click();

  const energyPaneForBuilding = {
    powerPlant1: "energy-power-plant",
    powerPlant2: "energy-solar-power-plant",
    powerPlant3: "energy-advanced-power-plant",
    battery1: "energy-storage",
    battery2: "energy-storage",
    battery3: "energy-storage",
  } as const;
  for (const buildingId of [
    "powerPlant1",
    "powerPlant3",
    "powerPlant2",
    "battery1",
    "battery2",
    "battery3",
  ] as const) {
    await page.locator(`#tab-${energyPaneForBuilding[buildingId]}`).click();
    await page
      .locator(`[data-building-id="${buildingId}"]`)
      .getByRole("button", { name: "Buy", exact: true })
      .click();
  }
  await page.getByRole("tab", { name: /Research/ }).click();
  await page.locator("#tab-research-science-buildings").click();
  await page
    .locator('[data-building-id="scienceLab"]')
    .getByRole("button", { name: "Buy", exact: true })
    .click();

  const openStatistics = async () => {
    await page.locator("#tab-settings").click();
    const settings = page.getByTestId("settings-pane");
    await settings.locator("#tab-settings-statistics").click();
    return settings.getByTestId("settings-statistics");
  };
  const currentRowIds = ENERGY_STATISTIC_IDS.slice(0, 5);
  const counterIds = ENERGY_STATISTIC_IDS.slice(5);
  const counterValues = [0, 1, 1, 1, 1, 1, 1] as const;

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    const statistics = await openStatistics();
    const energy = statistics
      .getByRole("heading", {
        name: energyStatisticLabel(locale, "energySection"),
        level: 4,
        exact: true,
      })
      .locator("xpath=..");
    expect(
      await energy
        .locator(".settings-stat-card")
        .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-statistic-id"))),
    ).toEqual(ENERGY_STATISTIC_IDS);
    await expect(statistics.getByText(energyTrackingNote(locale), { exact: true })).toBeVisible();

    for (const id of currentRowIds) {
      const row = energy.locator(`[data-statistic-id="${id}"]`);
      await expect(row.locator(".settings-stat-pair-values small")).toHaveText([
        settingsStatisticLabel(locale, "run"),
        settingsStatisticLabel(locale, "lifetime"),
      ]);
      await expect(row.locator(".settings-stat-pair-values strong").nth(1)).toHaveText(
        energyStatisticLabel(locale, "notApplicable"),
      );
      await expect(
        row.getByRole("link", { name: energyStatisticLabel(locale, id) }),
      ).toHaveAttribute("href", `#tab-${ENERGY_STATISTIC_OWNER_PANES[id]}`);
    }

    for (let index = 0; index < counterIds.length; index += 1) {
      const id = counterIds[index]!;
      const row = energy.locator(`[data-statistic-id="${id}"]`);
      await expect(row.locator(".settings-stat-pair-values small")).toHaveText([
        settingsStatisticLabel(locale, "run"),
        settingsStatisticLabel(locale, "lifetime"),
      ]);
      await expect(row.locator(".settings-stat-pair-values strong")).toHaveText([
        String(counterValues[index]),
        String(counterValues[index]),
      ]);
      await expect(
        row.getByRole("link", { name: energyStatisticLabel(locale, id) }),
      ).toHaveAttribute("href", `#tab-${ENERGY_STATISTIC_OWNER_PANES[id]}`);
    }

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const power = state.run.economy.power;
    const energyPlan = createEconomyTickPlan(state);
    const n = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
    const expectedCurrentValues = [
      topStatusText(locale, power.tripped ? "trippedShort" : power.gridEnabled ? "on" : "off"),
      `${n(power.quantity)} kJ`,
      `${n(Math.floor(energyPlan.generationPerSecond))} kJ/s`,
      `${n(Math.floor(energyPlan.demandPerSecond))} kJ/s`,
      `${n(Math.floor(power.capacity / 1000))} MJ`,
    ];
    for (let index = 0; index < currentRowIds.length; index += 1) {
      const row = energy.locator(`[data-statistic-id="${currentRowIds[index]}"]`);
      await expect(row.locator(".settings-stat-pair-values strong").first()).toHaveText(
        expectedCurrentValues[index]!,
      );
    }
  }

  await setGameLocale(page, "en");
  for (const [statisticId, paneId] of [
    ["basicPowerPlants", "energy-power-plant"],
    ["solarPowerPlants", "energy-solar-power-plant"],
    ["advancedPowerPlants", "energy-advanced-power-plant"],
    ["totalBatteryStorage", "energy-storage"],
  ] as const) {
    const statistics = await openStatistics();
    await statistics
      .locator(`[data-statistic-id="${statisticId}"]`)
      .getByRole("link", { name: energyStatisticLabel("en", statisticId) })
      .click();
    await expect(page.locator(`#tab-${paneId}`)).toHaveAttribute("aria-selected", "true");
  }
});

test("shows source Cosmic Rip completion separately from closing it @settings @statistics @cosmic-rip", async ({
  freshGame,
}) => {
  await startMetaFixture(freshGame, "meta-cosmic-rip-close-affordance");
  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");
  await settings.locator("#tab-settings-statistics").click();
  const statistics = settings.getByTestId("settings-statistics");
  const cosmicRip = statistics
    .getByRole("heading", { name: "Cosmic Rip Chapter", level: 4, exact: true })
    .locator("xpath=..");
  const statisticCard = (id: string) => cosmicRip.locator(`[data-statistic-id="${id}"]`);

  await expect(statisticCard("cosmicRipChapterUnlocked").locator("dd")).toHaveText("Yes");
  await expect(statisticCard("cosmicRipStabilised").locator("dd")).toHaveText("Yes");
  await expect(statisticCard("cosmicRipClosed").locator("dd")).toHaveText("No");
});

test("Cosmic Rip Statistics links navigate to their available owner pages @settings @statistics @cosmic-rip", async ({
  freshGame,
}) => {
  await startMetaFixture(freshGame, "meta-cosmic-rip-route");

  const openStatistics = async () => {
    await freshGame.locator("#tab-settings").click();
    const settings = freshGame.getByTestId("settings-pane");
    await settings.locator("#tab-settings-statistics").click();
    return settings.getByTestId("settings-statistics");
  };

  let statistics = await openStatistics();
  await statistics
    .locator('[data-statistic-id="cosmicRipTelemetry"]')
    .getByRole("link", { name: settingsStatisticLabel("en", "cosmicRipTelemetry") })
    .click();
  await expect(freshGame.locator("#tab-cosmic-rip")).toHaveAttribute("aria-selected", "true");
  await expect(freshGame.locator("#tab-cosmic-rip-situation")).toHaveAttribute(
    "aria-selected",
    "true",
  );

  statistics = await openStatistics();
  await statistics
    .locator('[data-statistic-id="cosmicRipSectors"]')
    .getByRole("link", { name: settingsStatisticLabel("en", "cosmicRipSectors") })
    .click();
  await expect(freshGame.locator("#tab-cosmic-rip-scanner-array")).toHaveAttribute(
    "aria-selected",
    "true",
  );

  statistics = await openStatistics();
  await statistics
    .locator('[data-statistic-id="cosmicRipResearch"]')
    .getByRole("link", { name: settingsStatisticLabel("en", "cosmicRipResearch") })
    .click();
  await expect(freshGame.locator("#tab-cosmic-rip-rip")).toHaveAttribute("aria-selected", "true");
});

test("Statistics links switch to material, compound, research, and Settings owner pages @settings @statistics @statistics-owner-links", async ({
  freshGame,
}) => {
  await startMetaFixture(freshGame, "meta-cosmic-rip-route");
  expect(
    await freshGame.evaluate(
      () => window.miaplacidusTest!.getState().run.economy.researchedTechnologies,
    ),
  ).toContain("compounds");

  const openStatistics = async () => {
    await freshGame.locator("#tab-settings").click();
    const settings = freshGame.getByTestId("settings-pane");
    await settings.locator("#tab-settings-statistics").click();
    return settings.getByTestId("settings-statistics");
  };

  let statistics = await openStatistics();
  await statistics
    .locator('[data-statistic-id="resourceProduction-hydrogen"]')
    .getByRole("link", { name: "Hydrogen" })
    .click();
  await expect(freshGame.locator("#tab-hydrogen")).toHaveAttribute("aria-selected", "true");
  await expect(freshGame.locator("#tab-resources-hydrogen")).toHaveAttribute(
    "aria-selected",
    "true",
  );

  statistics = await openStatistics();
  await statistics
    .locator('[data-statistic-id="compoundProduction-diesel"]')
    .getByRole("link", { name: "Diesel" })
    .click();
  await expect(freshGame.locator("#tab-compounds")).toHaveAttribute("aria-selected", "true");
  await expect(freshGame.locator("#tab-compounds-diesel")).toHaveAttribute("aria-selected", "true");

  statistics = await openStatistics();
  await statistics.locator('[data-statistic-id="researchPointsEarned"]').getByRole("link").click();
  await expect(freshGame.locator("#tab-research")).toHaveAttribute("aria-selected", "true");
  await expect(freshGame.locator("#tab-research-science-buildings")).toHaveAttribute(
    "aria-selected",
    "true",
  );

  statistics = await openStatistics();
  await statistics
    .locator('[data-statistic-id="event-powerPlantExplosion"]')
    .getByRole("link", { name: "Power plant explosion" })
    .click();
  await expect(freshGame.locator("#tab-settings")).toHaveAttribute("aria-selected", "true");
  await expect(freshGame.locator("#tab-settings-events")).toHaveAttribute("aria-selected", "true");
});

test("localizes Cosmic Rip lifetime statistics and tracking note in all shipped languages @settings @statistics @cosmic-rip-locale", async ({
  freshGame,
}) => {
  await startMetaFixture(freshGame, "meta-cosmic-rip-route");
  const cosmicRipTechnologyCount = COSMIC_RIP_TECHNOLOGIES.length;
  const cosmicRipValues = await freshGame.evaluate((technologyCount) => {
    const state = window.miaplacidusTest!.getState();
    return {
      settledSystemCount: state.permanent.settledSystemIds.length,
      gpSpent: state.statistics.lifetimeGalacticPointsSpent,
      telemetryEarned: state.statistics.lifetimeCosmicRipTelemetryDataEarned,
      chapterUnlocked: state.permanent.cosmicRip.unlocked,
      scannerRestored: state.permanent.cosmicRip.scannerRestored,
      located: state.permanent.cosmicRip.ripFound,
      stabilised: state.permanent.cosmicRip.researchedTechnologyIds.length === technologyCount,
    };
  }, cosmicRipTechnologyCount);
  expect(cosmicRipValues.settledSystemCount).toBe(2);
  expect(cosmicRipValues.gpSpent).toBe(0);
  expect(cosmicRipValues.telemetryEarned).toBe(0);
  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-settings").click();
    const settings = freshGame.getByTestId("settings-pane");
    await settings.locator("#tab-settings-statistics").click();
    const statistics = settings.getByTestId("settings-statistics");
    const cosmicRip = statistics
      .getByRole("heading", {
        name: settingsStatisticLabel(locale, "cosmicRipChapterSection"),
        level: 4,
        exact: true,
      })
      .locator("xpath=..");
    const gpEarned = cosmicRip.locator('[data-statistic-id="cosmicRipGalacticPointsEarned"]');
    await expect(gpEarned.locator("dt")).toHaveText(
      settingsStatisticLabel(locale, "cosmicRipGalacticPointsEarned"),
    );
    await expect(gpEarned.locator(".settings-stat-pair-values small")).toHaveText([
      settingsStatisticLabel(locale, "run"),
      settingsStatisticLabel(locale, "lifetime"),
    ]);
    await expect(gpEarned.locator(".settings-stat-pair-values strong")).toHaveText([
      statisticsNotApplicableLabel(locale),
      "1",
    ]);
    const assertSourceScope = async (id: string, label: string, value: string) => {
      const row = cosmicRip.locator(`[data-statistic-id="${id}"]`);
      await expect(row.locator("dt")).toHaveText(label);
      await expect(row.locator(".settings-stat-pair-values small")).toHaveText([
        settingsStatisticLabel(locale, "run"),
        settingsStatisticLabel(locale, "lifetime"),
      ]);
      await expect(row.locator(".settings-stat-pair-values strong")).toHaveText([
        statisticsNotApplicableLabel(locale),
        value,
      ]);
    };
    await assertSourceScope(
      "cosmicRipGpSpent",
      settingsStatisticLabel(locale, "cosmicRipGpSpent"),
      String(cosmicRipValues.gpSpent),
    );
    await assertSourceScope(
      "cosmicRipTelemetryEarned",
      settingsStatisticLabel(locale, "cosmicRipTelemetryEarned"),
      String(cosmicRipValues.telemetryEarned),
    );
    await assertSourceScope(
      "cosmicRipChapterUnlocked",
      settingsStatisticLabel(locale, "cosmicRipChapterUnlocked"),
      settingsStatisticLabel(locale, cosmicRipValues.chapterUnlocked ? "yes" : "no"),
    );
    await assertSourceScope(
      "cosmicRipScannerRestored",
      settingsStatisticLabel(locale, "cosmicRipScannerRestored"),
      settingsStatisticLabel(locale, cosmicRipValues.scannerRestored ? "yes" : "no"),
    );
    await assertSourceScope(
      "cosmicRipLocated",
      settingsStatisticLabel(locale, "cosmicRipLocated"),
      settingsStatisticLabel(locale, cosmicRipValues.located ? "yes" : "no"),
    );
    await assertSourceScope(
      "cosmicRipStabilised",
      settingsStatisticLabel(locale, "cosmicRipStabilised"),
      settingsStatisticLabel(locale, cosmicRipValues.stabilised ? "yes" : "no"),
    );
    await expect(cosmicRip.getByText(cosmicRipTrackingNote(locale), { exact: true })).toBeVisible();
  }
});

test("Galactic Casino Statistics separate current-run and lifetime counters @settings @statistics @casino-statistics", async ({
  freshGame,
}) => {
  await startMetaFixture(freshGame, "meta-rebirth-ready");
  await freshGame.locator("#tab-galaxy").click();
  await freshGame.locator("#tab-galactic-casino").click();
  const casino = freshGame.getByTestId("galactic-casino-pane");

  await casino.getByLabel("Stake in CP").fill("1");
  await casino.getByTestId("casino-don-play").click();
  await expect
    .poll(() =>
      freshGame.evaluate(
        () => window.miaplacidusTest!.getState().run.casinoStats.doubleOrNothingPlayed,
      ),
    )
    .toBe(1);
  await casino.getByTestId("casino-wheel-spin").click();
  await expect
    .poll(() =>
      freshGame.evaluate(() => window.miaplacidusTest!.getState().run.casinoStats.wheelPlayed),
    )
    .toBe(1);

  const openStatistics = async () => {
    await freshGame.locator("#tab-settings").click();
    const settings = freshGame.getByTestId("settings-pane");
    await settings.locator("#tab-settings-statistics").click();
    return settings.getByTestId("settings-statistics");
  };
  const assertCasinoCounter = async (
    statistics: Locator,
    label: string,
    currentRun: string,
    lifetime: string,
  ) => {
    const section = statistics
      .getByRole("heading", { name: "Galactic Casino", level: 4, exact: true })
      .locator("xpath=..");
    const card = section.locator(".settings-stat-card").filter({ hasText: label });
    await expect(card.locator(".settings-stat-pair-values small")).toHaveText([
      "This run",
      "Lifetime",
    ]);
    await expect(card.locator(".settings-stat-pair-values strong")).toHaveText([
      currentRun,
      lifetime,
    ]);
  };

  let statistics = await openStatistics();
  await expect(statistics).toBeVisible();
  await assertCasinoCounter(statistics, "Casino points spent", "2", "2");
  await assertCasinoCounter(statistics, "Double or Nothing played", "1", "1");
  await assertCasinoCounter(statistics, "Wheel of Fortune played", "1", "1");

  await freshGame.locator("#tab-galaxy").click();
  await freshGame.locator("#tab-galactic-rebirth").click();
  const rebirthPane = freshGame.getByTestId("rebirth-pane");
  await rebirthPane.getByRole("button", { name: "Rebirth", exact: true }).click();
  const confirmation = freshGame.getByRole("dialog", { name: "WARNING: REBIRTH!" });
  await confirmation
    .getByRole("button", { name: "RESET ALL PROGRESS AND KEEP AP", exact: true })
    .click();
  await expect
    .poll(() => freshGame.evaluate(() => window.miaplacidusTest?.getState().permanent.rebirthCount))
    .toBe(2);

  statistics = await openStatistics();
  await assertCasinoCounter(statistics, "Casino points spent", "0", "2");
  await assertCasinoCounter(statistics, "Double or Nothing played", "0", "1");
  await assertCasinoCounter(statistics, "Wheel of Fortune played", "0", "1");
});
