import { expect, test } from "../_harness/fixtures";

async function startStarshipFixture(
  page: import("@playwright/test").Page,
  fixture:
    | "space-starship"
    | "space-starship-ready"
    | "space-starship-scanning"
    | "space-diplomacy" = "space-starship",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Starship Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("builds required modules at discounted costs while the scanner stays optional @starship", async ({
  page,
}) => {
  await startStarshipFixture(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Starship construction" }).click();

  const pane = page.getByTestId("starship-pane");
  await expect(pane.locator("[data-testid^='starship-module-']")).toHaveCount(5);
  await expect(pane.getByTestId("starship-readiness")).toHaveAttribute("data-status", "building");

  const structural = pane.getByTestId("starship-module-structural");
  await expect(structural).toContainText("3,610 Steel");
  await expect(structural).toContainText("1,353.75 Titanium");
  await expect(structural).toContainText("4,061.25 Silicon");
  await expect(structural).toContainText("$2,707.50");

  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await structural.getByRole("button", { name: "Build one part" }).click();
  const afterFirstPart = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterFirstPart.run.cash).toBeCloseTo(before.run.cash - 2_707.5, 6);
  expect(afterFirstPart.run.goods.steel.quantity).toBeCloseTo(
    before.run.goods.steel.quantity - 3_610,
    6,
  );
  expect(afterFirstPart.run.goods.titanium.quantity).toBeCloseTo(
    before.run.goods.titanium.quantity - 1_353.75,
    6,
  );
  expect(afterFirstPart.run.goods.silicon.quantity).toBeCloseTo(
    before.run.goods.silicon.quantity - 4_061.25,
    6,
  );

  const requiredModules = [
    ["structural", 20],
    ["lifeSupport", 10],
    ["antimatterEngine", 16],
    ["fleetHangar", 1],
  ] as const;
  for (const [moduleId, partCount] of requiredModules) {
    const card = pane.getByTestId(`starship-module-${moduleId}`);
    const builtParts =
      moduleId === "structural"
        ? afterFirstPart.run.space.starshipModules.structural.builtParts
        : 0;
    for (let index = builtParts; index < partCount; index += 1) {
      await card.getByRole("button", { name: "Build one part" }).click();
    }
  }

  await expect(pane.getByTestId("starship-readiness")).toHaveAttribute("data-status", "ready");
  for (const [moduleId, partCount] of requiredModules) {
    await expect(pane.getByTestId(`starship-module-${moduleId}`)).toContainText(
      `Parts built: ${partCount} / ${partCount}`,
    );
  }
  const scanner = pane.getByTestId("starship-module-stellarScanner");
  await expect(scanner).toContainText("Parts built: 0 / 8");
  await expect(scanner.getByRole("button", { name: "Build one part" })).toBeEnabled();
});

test("cancels the point-of-no-return prompt and arrives through the saved voyage timer @starship", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();

  const starship = page.getByTestId("starship-pane");
  await page.getByRole("tab", { name: "Starship construction" }).click();
  const launchButton = starship.getByRole("button", { name: "Launch starship" });
  await expect(launchButton).toBeEnabled();
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await launchButton.click();

  const warning = page.getByRole("dialog", { name: "Warning: point of no return" });
  await expect(warning).toBeVisible();
  await expect(warning).toContainText("cannot be recovered in this run");
  await warning.getByRole("button", { name: "Cancel" }).click();
  await expect(warning).toBeHidden();
  const afterCancel = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterCancel.run.space.starship.phase).toBe("unlaunched");
  expect(afterCancel.run.space.antimatter).toBe(before.run.space.antimatter);

  await launchButton.click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("travelling");
  await expect(
    page.locator('[data-testid="game-notification"][data-classification="starShip"]'),
  ).toContainText("Starship launched toward Sirius");

  const travelling = await page.evaluate(() => window.miaplacidusTest!.getState());
  const voyageTimerId = travelling.run.space.starship.timerId!;
  expect(travelling.run.space.starship.destinationSystemId).not.toBeNull();
  expect(travelling.run.space.antimatter).toBe(
    before.run.space.antimatter - travelling.run.space.starship.antimatterSpent,
  );
  const voyageDuration = travelling.run.timers[voyageTimerId]!.durationMs;
  for (let elapsed = 0; elapsed < voyageDuration + 1; elapsed += 1_000_000) {
    await page.evaluate(
      (milliseconds) => window.miaplacidusTest!.advanceBy(milliseconds),
      Math.min(1_000_000, voyageDuration + 1 - elapsed),
    );
  }

  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.space.starship.phase))
    .toBe("orbiting");
  const arrived = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(arrived.run.space.currentSystemId).toBe("spica");
  expect(arrived.run.space.starship.destinationSystemId).toBe(
    travelling.run.space.starship.destinationSystemId,
  );
  expect(arrived.run.timers[voyageTimerId]?.status).toBe("complete");
});

test("scans an orbiting destination once and persists stable hostility data @starship", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-scanning");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Colonise" }).click();

  const pane = page.getByTestId("starship-pane");
  const scanButton = pane.getByTestId("starship-scan-system-button");
  await expect(scanButton).toBeEnabled();
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());
  await scanButton.click();
  await expect(pane.getByTestId("starship-system-scan-results")).toBeVisible();

  const scanned = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(scanned.run.space.systemEncounters).toHaveLength(1);
  expect(scanned.run.space.systemEncounters[0]?.systemId).toBe(
    before.run.space.starship.destinationSystemId,
  );
  expect(scanned.run.space.systemEncounters[0]?.raceName.length).toBeGreaterThan(0);
  expect(scanned.run.space.systemEncounters[0]?.currentImpression).toBe(
    scanned.run.space.systemEncounters[0]?.initialImpression,
  );
  expect(scanned.run.space.systemEncounters[0]?.latestDifferenceInImpression).toBe(0);
  expect(scanned.run.random).toEqual(before.run.random);
  expect(scanned.run.space.systemEncounters[0]?.anomalies.length).toBeLessThanOrEqual(2);

  const repeated = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({ type: "space.starship.system.scan" }),
  );
  expect(repeated).toBe(false);
  const afterRepeatedScan = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterRepeatedScan.run.space.systemEncounters).toHaveLength(1);
});

test("builds an Envoy and records message and harmony effects @starship", async ({ page }) => {
  await startStarshipFixture(page, "space-diplomacy");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();

  const pane = page.getByTestId("starship-pane");
  const hangar = pane.getByTestId("starship-fleet-hangar");
  const diplomacy = pane.getByTestId("starship-diplomacy");
  const initial = await page.evaluate(() => window.miaplacidusTest!.getState());
  await page.getByRole("tab", { name: "Colonise" }).click();
  const messageButton = diplomacy.getByRole("button", { name: "Send a message" });
  await expect(messageButton).toBeDisabled();
  await expect(messageButton).toHaveAttribute(
    "aria-describedby",
    "starship-diplomacy-message-reason",
  );
  await expect(diplomacy.locator("#starship-diplomacy-message-reason")).toContainText(
    "Scan a sentient civilization and build an Envoy",
  );
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();
  await hangar.getByRole("button", { name: "Build Envoy" }).click();

  const built = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(built.run.space.fleetEnvoyBuilt).toBe(true);
  expect(built.run.cash).toBe(initial.run.cash - 2_000);
  expect(built.run.goods.hydrogen.quantity).toBe(initial.run.goods.hydrogen.quantity - 8_000);
  expect(built.run.goods.silicon.quantity).toBe(initial.run.goods.silicon.quantity - 300);
  expect(built.run.goods.titanium.quantity).toBe(initial.run.goods.titanium.quantity - 120);

  await pane
    .getByTestId("starship-fleet-scout")
    .getByRole("button", { name: "Build one ship" })
    .click();
  const scoutBuilt = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(scoutBuilt.run.space.playerFleets.scout).toBe(1);
  expect(scoutBuilt.run.cash).toBe(built.run.cash - 5_000);
  expect(scoutBuilt.run.goods.hydrogen.quantity).toBe(built.run.goods.hydrogen.quantity - 14_000);
  expect(scoutBuilt.run.goods.silicon.quantity).toBe(built.run.goods.silicon.quantity - 1_000);
  expect(scoutBuilt.run.goods.titanium.quantity).toBe(built.run.goods.titanium.quantity - 300);

  await page.getByRole("tab", { name: "Colonise" }).click();
  await diplomacy.getByRole("button", { name: "Send a message" }).click();
  await expect(pane.getByTestId("starship-diplomacy-message")).toBeVisible();
  const messaged = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(messaged.run.space.systemEncounters[0]?.lastDiplomacyMessage).toMatch(/^message/);
  expect(messaged.run.space.systemEncounters[0]?.patience).toBe(4);

  await diplomacy.getByRole("button", { name: "Seek harmony" }).click();
  const harmonized = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(harmonized.run.space.systemEncounters[0]?.lastDiplomacyMessage).toMatch(/^harmony/);
  expect(harmonized.run.space.systemEncounters[0]?.patience).toBeLessThanOrEqual(2);
});

test("Fleet Hangar build controls support keyboard focus and activation @fleet-controls", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-diplomacy");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.getByRole("tab", { name: "Fleet Hangar" }).click();

  const hangar = page.getByTestId("starship-fleet-hangar");
  const envoyButton = hangar.getByRole("button", { name: "Build Envoy" });
  const scoutButton = hangar.getByTestId("starship-fleet-build-scout");
  const before = await page.evaluate(() => window.miaplacidusTest!.getState());

  await envoyButton.focus();
  await page.keyboard.press("Tab");
  await expect(scoutButton).toBeFocused();
  expect(await scoutButton.evaluate((button) => button.matches(":focus-visible"))).toBe(true);
  const touchTarget = await scoutButton.boundingBox();
  expect(touchTarget?.height).toBeGreaterThanOrEqual(44);
  expect(touchTarget?.width).toBeGreaterThanOrEqual(44);

  await page.keyboard.press("Enter");
  await expect(scoutButton).toBeFocused();
  const after = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(after.run.space.playerFleets.scout).toBe(before.run.space.playerFleets.scout + 1);
});

test.describe("Fleet Hangar touch controls", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  test("touch users can build a fleet ship at a narrow viewport @fleet-controls", async ({
    page,
  }) => {
    await startStarshipFixture(page, "space-diplomacy");
    await expect.poll(() => page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);
    await page.getByRole("tab", { name: "Interstellar" }).tap();
    await page.getByRole("tab", { name: "Fleet Hangar" }).tap();

    const hangar = page.getByTestId("starship-fleet-hangar");
    const scoutButton = hangar.getByTestId("starship-fleet-build-scout");
    const before = await page.evaluate(() => window.miaplacidusTest!.getState());
    const touchTarget = await scoutButton.boundingBox();
    expect(touchTarget?.height).toBeGreaterThanOrEqual(44);
    expect(touchTarget?.width).toBeGreaterThanOrEqual(44);

    await scoutButton.tap();
    const after = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(after.run.space.playerFleets.scout).toBe(before.run.space.playerFleets.scout + 1);
    const pageWidth = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(pageWidth.document).toBeLessThanOrEqual(pageWidth.viewport);
  });
});
