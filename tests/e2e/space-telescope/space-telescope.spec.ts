import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

async function startSpaceFixture(
  page: import("@playwright/test").Page,
  fixture:
    | "space-telescope"
    | "space-late-game"
    | "space-rocket-part-shortfall"
    | "space-rocket-part-exact" = "space-telescope",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Space Telescope Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect(page.getByText("Space Telescope Pioneer")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("keeps Mining hidden until a rocket reaches an asteroid @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await expect(page.locator("#tab-space-mining-mining")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterUnlocked),
    )
    .toBe(false);
});

test("explains why the antimatter boost is unavailable at zero mining rate @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-late-game");
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterUnlocked),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase),
    )
    .toBe("outbound");

  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-mining").click();

  const miningRate = page.getByTestId("antimatter-rate");
  await expect(miningRate).toContainText("0 /s");
  const boost = page.getByTestId("antimatter-boost");
  await expect(boost).toBeDisabled();
  await expect(boost).toHaveAttribute("aria-pressed", "false");
  await expect(boost).toHaveAttribute("aria-describedby", "antimatter-boost-reason");
  await expect(page.getByTestId("antimatter-boost-reason")).toBeVisible();
  await expect(page.getByTestId("antimatter-boost-reason")).toHaveText(
    "The boost is available while antimatter is being mined.",
  );
  expect(
    await page.evaluate(() => window.miaplacidusTest!.getState().run.space.antimatterBoostActive),
  ).toBe(false);
});

test("builds a telescope, starts an asteroid scan, and keeps its timer in game state @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  const pane = page.getByTestId("space-mining-pane");
  await expect(pane).toBeVisible();
  await expect(pane).toContainText("$10,000");
  await expect(pane).toContainText("20,000 Iron");
  await page.getByRole("button", { name: "Build telescope" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.telescopeBuilt))
    .toBe(true);
  await expect(pane).toContainText("Telescope built");
  await page.getByRole("button", { name: "Scan for asteroids" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBe("asteroids");
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.timers["survey:asteroid-scan"]?.status,
      ),
    )
    .toBe("running");
  await expect(page.getByTestId("space-survey-progress")).toBeVisible();
});

test("keeps launch-pad weather separate from the telescope and shows precipitation in the header tooltip @space-live-countdown", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();

  await expect(page.getByTestId("space-weather-overview")).toHaveCount(0);
  const location = page.getByTestId("location-status");
  await location.locator(".location-status-summary").focus();
  const weatherTooltip = page.locator("#location-status-tooltip");
  await expect(weatherTooltip).toBeVisible();
  await expect(weatherTooltip).toContainText("Precipitation rate:");
  await expect(weatherTooltip).toContainText("Precipitation collected this run:");

  await page.locator("#tab-space-mining-launch-pad").click();
  await expect(page.getByTestId("space-weather-overview")).toBeVisible();
  const weatherCountdown = page.getByTestId("space-weather-timer");
  await expect(weatherCountdown).toBeVisible();
  const initialWeatherMs = Number(await weatherCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await weatherCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialWeatherMs);

  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build telescope" }).click();
  await page.getByRole("button", { name: "Scan for asteroids" }).click();
  const surveyCountdown = page.getByTestId("space-survey-countdown");
  await expect(surveyCountdown).toBeVisible();
  const initialSurveyMs = Number(await surveyCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await surveyCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialSurveyMs);
});

test("explains the one-unit rocket-part shortfall through its associated reason @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-rocket-part-shortfall");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();

  const rocket = page.getByTestId("rocket-card-rocket1");
  const buildPart = rocket.getByRole("button", { name: "Build one part" });
  await expect(rocket).toContainText("3,000 Steel");
  await expect(buildPart).toBeDisabled();
  await expect(buildPart).toHaveAttribute("aria-describedby", "rocket-rocket1-part-reason");
  await expect(page.locator("#rocket-rocket1-part-reason")).toHaveText(
    "Not enough Steel. Required: 3,000.",
  );
});

test("builds a rocket part at exact stock and charges every quoted cost @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-rocket-part-exact");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();

  const rocket = page.getByTestId("rocket-card-rocket1");
  const buildPart = rocket.getByRole("button", { name: "Build one part" });
  await expect(buildPart).toBeEnabled();
  await expect(buildPart).not.toHaveAttribute("aria-describedby", /.+/);
  const cashBefore = await page.evaluate(() => window.miaplacidusTest!.getState().run.cash);
  await buildPart.click();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.miaplacidusTest!.getState();
        return {
          builtParts: state.run.space.rockets.rocket1.builtParts,
          glass: state.run.goods.glass.quantity,
          titanium: state.run.goods.titanium.quantity,
          steel: state.run.goods.steel.quantity,
        };
      }),
    )
    .toEqual({
      builtParts: 1,
      glass: 999_000,
      titanium: 999_300,
      steel: 0,
    });
  expect(await page.evaluate(() => window.miaplacidusTest!.getState().run.cash)).toBe(
    cashBefore - 1_000,
  );
  const nextPartCost = rocket.locator(".cost-line");
  await expect(nextPartCost).toContainText("$1,130");
  await expect(nextPartCost).toContainText("1,130 Glass");
  await expect(nextPartCost).toContainText("791 Titanium");
  await expect(nextPartCost).toContainText("3,390 Steel");
  await expect(buildPart).toBeDisabled();
  await expect(buildPart).toHaveAttribute("aria-describedby", "rocket-rocket1-part-reason");
  await expect(page.locator("#rocket-rocket1-part-reason")).toHaveText(
    "Not enough Steel. Required: 3,390.",
  );
});

test("unlocked Auto Telescope starts the selected survey mode @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-telescope").click();
  await page.getByRole("button", { name: "Build telescope" }).click();
  const controls = page.getByTestId("auto-telescope-controls");
  await expect(controls).toBeVisible();
  await controls.getByLabel("Action").selectOption("stars");
  await page.getByRole("button", { name: "Enable automation" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        enabled: window.miaplacidusTest!.getState().run.space.autoTelescopeEnabled,
        mode: window.miaplacidusTest!.getState().run.space.autoTelescopeMode,
      })),
    )
    .toEqual({ enabled: true, mode: "stars" });
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.activeSurvey))
    .toBe("stars");
});

test("an orbiting rocket explains the missing asteroid target and travels after one is selected @space-telescope", async ({
  page,
}) => {
  await startSpaceFixture(page);

  await page.keyboard.press("NumpadSubtract");
  const debugMenu = page.getByTestId("debug-scenario-menu");
  await expect(debugMenu).toBeVisible();
  await debugMenu.getByTestId("debug-action-add-10-asteroids").click();
  await debugMenu.getByRole("button", { name: "Close" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.selectedAsteroidId),
    )
    .toBeNull();

  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();
  await page.getByRole("button", { name: "Build launch pad" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.launchPadBuilt))
    .toBe(true);
  const rocket = page.getByTestId("rocket-card-rocket1");
  for (let part = 0; part < 12; part += 1) {
    await rocket.getByRole("button", { name: "Build one part" }).click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase),
    )
    .toBe("ready");

  const rocket2 = page.getByTestId("rocket-card-rocket2");
  for (let part = 0; part < 17; part += 1) {
    await rocket2.getByRole("button", { name: "Build one part" }).click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket2.phase),
    )
    .toBe("ready");
  await page.locator("#tab-space-mining-rocket-2").click();
  await rocket2.getByRole("button", { name: "Buy fuel pump" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();
  await rocket.getByRole("button", { name: "Buy fuel pump" }).click();
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(6_000_000));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
      ),
    )
    .toBe(10_000);
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket2.fuelQuantity,
      ),
    )
    .toBe(12_000);

  await page.keyboard.press("NumpadSubtract");
  const clearWeatherMenu = page.getByTestId("debug-scenario-menu");
  await clearWeatherMenu.getByTestId("debug-action-clear-weather").click();
  await clearWeatherMenu.getByRole("button", { name: "Close" }).click();
  await rocket.getByRole("button", { name: "Launch rocket" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.phase),
    )
    .toBe("orbit");
  await page.locator("#tab-space-mining-rocket-2").click();
  await rocket2.getByRole("button", { name: "Launch rocket" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket2.phase),
    )
    .toBe("orbit");

  await page.locator("#tab-space-mining-rocket-1").click();
  const travelButton = rocket.getByRole("button", { name: "Travel to selected asteroid" });
  await expect(rocket).toContainText("Target: —");
  await expect(travelButton).toBeDisabled();
  await expect(page.locator("#rocket-rocket1-travel-reason")).toHaveText(
    "Select an available asteroid in this system.",
  );
  await expect(travelButton).toHaveAttribute("aria-describedby", "rocket-rocket1-travel-reason");

  await page.locator("#tab-space-mining-asteroids").click();
  const availableAsteroid = await page.evaluate(() =>
    window
      .miaplacidusTest!.getState()
      .run.space.asteroids.find((asteroid) => !asteroid.depleted && asteroid.reservedBy === null),
  );
  expect(availableAsteroid).toBeDefined();
  await page.getByTestId(`asteroid-${availableAsteroid!.id}`).getByRole("button").click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.selectedAsteroidId),
    )
    .toBe(availableAsteroid!.id);

  await page.locator("#tab-space-mining-rocket-1").click();
  await expect(travelButton).toBeEnabled();
  await travelButton.click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.miaplacidusTest!.getState();
        const asteroid = state.run.space.asteroids.find(
          (entry) => entry.id === state.run.space.rockets.rocket1.targetAsteroidId,
        );
        return {
          phase: state.run.space.rockets.rocket1.phase,
          selected: state.run.space.selectedAsteroidId,
          reservedBy: asteroid?.reservedBy,
        };
      }),
    )
    .toEqual({ phase: "outbound", selected: availableAsteroid!.id, reservedBy: "rocket1" });

  await page.locator("#tab-space-mining-rocket-2").click();
  const reservedTargetTravelButton = rocket2.getByRole("button", {
    name: "Travel to selected asteroid",
  });
  await expect(reservedTargetTravelButton).toBeDisabled();
  await expect(page.locator("#rocket-rocket2-travel-reason")).toHaveText(
    "Select an available asteroid in this system.",
  );
  await expect(reservedTargetTravelButton).toHaveAttribute(
    "aria-describedby",
    "rocket-rocket2-travel-reason",
  );
});

test("assembles a rocket, buys its powered fuel pump, and reports fuel progress @rockets @ui-navigation", async ({
  page,
}, testInfo) => {
  await startSpaceFixture(page);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-launch-pad").click();
  for (let rocket = 1; rocket <= 4; rocket += 1) {
    await expect(page.locator(`#tab-space-mining-rocket-${rocket}`)).toHaveCount(0);
  }
  await page.getByRole("button", { name: "Build launch pad" }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.launchPadBuilt))
    .toBe(true);
  await expect(page.locator("[data-testid^='rocket-card-']")).toHaveCount(4);

  const rocket = page.getByTestId("rocket-card-rocket1");
  await expect(rocket).toBeVisible();
  for (let part = 0; part < 12; part += 1) {
    await rocket.getByRole("button", { name: "Build one part" }).click();
  }
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.space.rockets.rocket1.builtParts),
    )
    .toBe(12);
  await expect(page.locator("#tab-space-mining-rocket-1")).toBeVisible();
  for (let otherRocket = 2; otherRocket <= 4; otherRocket += 1) {
    await expect(page.locator(`#tab-space-mining-rocket-${otherRocket}`)).toHaveCount(0);
  }
  await page.locator("#tab-space-mining-rocket-1").click();
  await captureVisualCheckpoint(page, testInfo, "space-rocket-1-ready");

  const desktopHeight = page.viewportSize()?.height ?? 720;
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileGeometry = await page.evaluate(() => {
    const pane = document.querySelector<HTMLElement>("#panel-space-mining")!;
    const card = document.querySelector<HTMLElement>("[data-testid='rocket-card-rocket1']")!;
    const paneBounds = pane.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    return {
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      viewportWidth: document.documentElement.clientWidth,
      paneLeft: paneBounds.left,
      paneRight: paneBounds.right,
      cardLeft: cardBounds.left,
      cardRight: cardBounds.right,
    };
  });
  expect(mobileGeometry.documentWidth).toBeLessThanOrEqual(mobileGeometry.viewportWidth);
  expect(mobileGeometry.cardLeft).toBeGreaterThanOrEqual(mobileGeometry.paneLeft);
  expect(mobileGeometry.cardRight).toBeLessThanOrEqual(mobileGeometry.paneRight);
  await captureVisualCheckpoint(page, testInfo, "space-rocket-1-mobile");
  await page.setViewportSize({ width: 1280, height: desktopHeight });

  await rocket.getByRole("button", { name: "Buy fuel pump" }).click();
  const fuelEta = rocket.getByTestId("rocket-fuel-eta-rocket1");
  await expect(fuelEta).toBeVisible();
  const startingEtaMs = Number(await fuelEta.getAttribute("data-remaining-ms"));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelPumpPurchased,
      ),
    )
    .toBe(true);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
      ),
    )
    .toBeCloseTo(20, 5);
  await expect
    .poll(async () => Number(await fuelEta.getAttribute("data-remaining-ms")))
    .toBeLessThan(startingEtaMs);

  const fuelAtPowerLoss = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
  );
  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-storage").click();
  const powerGrid = page.getByRole("checkbox", { name: "Power grid" });
  await expect(powerGrid).toBeChecked();
  await powerGrid.uncheck();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.gridEnabled),
    )
    .toBe(false);

  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();
  await expect(fuelEta).toHaveText("Turn on the power grid before fueling.");
  await expect(rocket.getByRole("button", { name: "Pause fueling" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelPumpEnabled,
    ),
  ).toBe(true);
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  expect(
    await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
    ),
  ).toBe(fuelAtPowerLoss);

  await page.getByRole("tab", { name: /Energy/ }).click();
  await page.locator("#tab-energy-storage").click();
  await powerGrid.check();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.economy.power.gridEnabled),
    )
    .toBe(true);
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();
  await expect(fuelEta).toContainText("Time to full:");

  await rocket.getByRole("button", { name: "Pause fueling" }).click();
  await expect(fuelEta).toHaveText("Fueling is paused.");
  await expect(rocket.getByRole("button", { name: "Start fueling" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  const pausedFuel = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
  );
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  expect(
    await page.evaluate(
      () => window.miaplacidusTest!.getState().run.space.rockets.rocket1.fuelQuantity,
    ),
  ).toBe(pausedFuel);

  await rocket.getByRole("button", { name: "Start fueling" }).click();
  const resumedEtaMs = Number(await fuelEta.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  await expect
    .poll(async () => Number(await fuelEta.getAttribute("data-remaining-ms")))
    .toBeLessThan(resumedEtaMs);
});

test("shows the rocket's live outbound countdown on its page @space-live-countdown", async ({
  page,
}) => {
  await startSpaceFixture(page, "space-late-game");
  await page.getByRole("tab", { name: "Space Mining" }).click();
  await page.locator("#tab-space-mining-rocket-1").click();

  const journeyCountdown = page.getByTestId("rocket-journey-countdown-rocket1");
  await expect(journeyCountdown).toBeVisible();
  const initialRemainingMs = Number(await journeyCountdown.getAttribute("data-remaining-ms"));
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  await expect
    .poll(async () => Number(await journeyCountdown.getAttribute("data-remaining-ms")))
    .toBeLessThan(initialRemainingMs);
});
