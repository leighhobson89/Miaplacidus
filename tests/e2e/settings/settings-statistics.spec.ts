import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { currentWeatherForSystem } from "../../../src/engine/weather";
import { topStatusText } from "../../../src/i18n/topStatusMessages";
import { setGameLocale } from "../_harness/settings-controls";
import { startMetaFixture } from "../_harness/meta-fixture";

test("header balances and conditional status stats follow the source layout @presentation @status", async ({
  freshGame,
}) => {
  await expect(freshGame.getByTestId("top-stat-time")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-energy")).toHaveCount(0);
  await expect(freshGame.getByTestId("top-stat-power")).toHaveCount(0);
  await expect(freshGame.getByTestId("top-stat-antimatter")).toHaveCount(0);
  expect(
    await freshGame.locator(".header-balances").evaluate((header) =>
      Array.from(header.children).map((child) => {
        if (child.matches("[data-testid='location-status']")) return "location";
        if (child.matches("[data-testid='ascendency-balance']")) return "ap";
        if (child.querySelector("[data-testid='cash-balance']")) return "cash";
        if (child.querySelector("[data-testid='research-balance']")) return "research";
        return "unexpected";
      }),
    ),
  ).toEqual(["location", "ap", "cash", "research"]);

  await startMetaFixture(freshGame, "meta-megastructure-route");
  await expect(freshGame.getByTestId("top-stat-antimatter")).toBeVisible();
  await expect(freshGame.getByTestId("top-stat-antimatter")).not.toContainText("???");
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
    const apValue = document.querySelector('[data-testid="ascendency-balance"]');
    const cashValue = document.querySelector('[data-testid="cash-balance"]');
    if (!apValue || !cashValue) throw new Error("AP or cash balance is missing.");
    const locationBounds = element.getBoundingClientRect();
    const apBounds = apValue.getBoundingClientRect();
    const cashBounds = cashValue.getBoundingClientRect();
    return {
      isBeforeAp: locationBounds.right <= apBounds.left,
      isApBeforeCash: apBounds.right <= cashBounds.left,
      gapToAp: apBounds.left - locationBounds.right,
      gapToCash: cashBounds.left - apBounds.right,
    };
  });
  expect(desktopPosition.isBeforeAp).toBe(true);
  expect(desktopPosition.isApBeforeCash).toBe(true);
  expect(desktopPosition.gapToAp).toBeLessThan(32);
  expect(desktopPosition.gapToCash).toBeLessThan(32);
  await expect(freshGame.locator(".game-header")).toHaveScreenshot("status-header-desktop.png");

  await freshGame.setViewportSize({ width: 390, height: 844 });
  await expect(location).toBeVisible();
  await expect(cash).toBeVisible();
  await location.locator(".location-status-summary").focus();
  await expect(freshGame.locator("#location-status-tooltip")).toBeVisible();
  const mobilePosition = await location.evaluate((element) => {
    const apValue = document.querySelector('[data-testid="ascendency-balance"]');
    const cashValue = document.querySelector('[data-testid="cash-balance"]');
    if (!apValue || !cashValue) throw new Error("AP or cash balance is missing.");
    const locationBounds = element.getBoundingClientRect();
    const apBounds = apValue.getBoundingClientRect();
    const cashBounds = cashValue.getBoundingClientRect();
    return {
      isBeforeAp: locationBounds.right <= apBounds.left,
      isApBeforeCash: apBounds.right <= cashBounds.left,
      gapToAp: apBounds.left - locationBounds.right,
      gapToCash: cashBounds.left - apBounds.right,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    };
  });
  expect(mobilePosition.isBeforeAp).toBe(true);
  expect(mobilePosition.isApBeforeCash).toBe(true);
  expect(mobilePosition.gapToAp).toBeLessThan(32);
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
      const cashValue = document.querySelector('[data-testid="cash-balance"]');
      if (!cashValue) throw new Error("Cash balance is missing.");
      const locationBounds = element.getBoundingClientRect();
      const cashBounds = cashValue.getBoundingClientRect();
      return {
        locationBeforeCash: locationBounds.right <= cashBounds.left,
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      };
    });
    expect(layout.locationBeforeCash).toBe(true);
    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth);
    await location.locator(".location-status-summary").evaluate((element) => element.blur());
  }
});

test("maps source Statistics groups, production totals, and Space Mining metrics @settings @statistics", async ({
  freshGame,
}) => {
  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");
  await settings.locator("#tab-settings-statistics").click();

  const statistics = settings.getByTestId("settings-statistics");
  await expect(statistics).toBeVisible();
  await expect(statistics.locator(".settings-stat-card")).toHaveCount(81);
  await expect(statistics.locator(".settings-stat-section h4")).toHaveText([
    "Overview",
    "Run",
    "Current snapshot",
    "Events",
    "Resources",
    "Compounds",
    "Space Mining",
    "Interstellar",
    "Galactic Casino",
    "Cosmic Rip Chapter",
    "Lifetime",
  ]);
  const statisticsSection = (name: string) =>
    statistics.getByRole("heading", { name, level: 4, exact: true }).locator("xpath=..");
  const statisticCard = (section: ReturnType<typeof statisticsSection>, label: string) =>
    section.getByText(label, { exact: true }).locator("xpath=..");
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
  await expect(statisticCard(run, "AP anticipated").locator("dd")).toHaveText("Not tracked");
  await expect(statisticCard(run, "Antimatter").locator("dd")).toHaveText("0");
  await expect(run.getByText(/AP anticipated is not tracked separately/)).toBeVisible();
  const currentSnapshot = statisticsSection("Current snapshot");
  await expect(statisticCard(currentSnapshot, "Research pool").locator("dd")).toHaveText("50");
  await expect(statisticCard(run, "Research pool")).toHaveCount(0);
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
  await expect(statistics.getByText("Double or Nothing played", { exact: true })).toBeVisible();
  await expect(
    statistics.getByText("Near Space Scanner Array restored", { exact: true }),
  ).toBeVisible();
});
