import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

async function startStarMapFixture(
  page: import("@playwright/test").Page,
  fixture:
    | "space-telescope"
    | "space-starship-ready"
    | "space-manuscript-hidden" = "space-telescope",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Star Map Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("searches stars, enforces study and home gates, and keeps geometry stable through zoom @star-map", async ({
  page,
}) => {
  await startStarMapFixture(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  await expect(map).toBeVisible();
  await expect(map.getByTestId("star-selection")).toContainText("Spica");
  await expect(map.locator("[data-testid^='star-marker-system:']")).toHaveCount(2);

  const initialDistance = await map.getByTestId("star-distance").innerText();
  const initialViewBox = await map.getByTestId("star-map-canvas").getAttribute("viewBox");
  const search = map.getByRole("searchbox", { name: "Search stars" });
  await search.fill("m");
  await expect(map.locator(".star-map-search-status")).toContainText(
    "Enter at least two characters",
  );
  await search.fill("miap");
  await map.locator(".star-map-search-results button").filter({ hasText: "Miaplacidus" }).click();
  await expect(map.getByTestId("star-selection")).toContainText("Spica");
  await expect(map.locator(".star-map-selection-feedback")).toContainText("fourth milestone");
  const lockedHome = map.locator(
    ".star-map-marker-overlay [data-testid^='star-marker-'][aria-label^='Miaplacidus']",
  );
  await expect(lockedHome).toHaveAttribute("aria-disabled", "true");
  const homeReasonId = await lockedHome.getAttribute("aria-describedby");
  expect(homeReasonId).toBeTruthy();
  await expect(map.locator(`[id="${homeReasonId}"]`)).toContainText("fourth milestone");

  await search.fill("sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await expect(map.locator(".star-map-selection-feedback")).toContainText("Study farther");
  await map.getByRole("button", { name: "Zoom in" }).click();
  await expect(map.getByTestId("star-map-canvas")).toHaveAttribute("data-zoom", "1.25");
  await expect(map.getByTestId("star-map-canvas")).not.toHaveAttribute("viewBox", initialViewBox!);
  const zoomedViewBox = await map.getByTestId("star-map-canvas").getAttribute("viewBox");
  const mapBounds = await map.getByTestId("star-map-canvas").boundingBox();
  expect(mapBounds).not.toBeNull();
  await page.mouse.move(
    mapBounds!.x + mapBounds!.width * 0.8,
    mapBounds!.y + mapBounds!.height * 0.8,
  );
  await page.mouse.down();
  await page.mouse.move(
    mapBounds!.x + mapBounds!.width * 0.87,
    mapBounds!.y + mapBounds!.height * 0.87,
  );
  await page.mouse.up();
  await expect(map.getByTestId("star-map-canvas")).not.toHaveAttribute("viewBox", zoomedViewBox!);
  await expect(map.getByTestId("star-selection")).toContainText("Spica");
  await expect(map.getByTestId("star-distance")).toHaveText(initialDistance);

  await page.setViewportSize({ width: 720, height: 900 });
  await expect(map.getByTestId("star-map-canvas")).toBeVisible();
  await expect(map.getByTestId("star-distance")).toHaveText(initialDistance);
});

test("pans the focused map with arrow keys @star-map @keyboard", async ({ page }) => {
  await startStarMapFixture(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  const canvas = map.getByTestId("star-map-canvas");

  await map.getByRole("button", { name: "Zoom in" }).click();
  await canvas.focus();
  await expect(canvas).toBeFocused();
  await expect(canvas).toHaveAttribute("tabindex", "0");
  await expect(canvas).toHaveAttribute("aria-describedby", "star-map-keyboard-help");

  const initialViewBox = await canvas.getAttribute("viewBox");
  await page.keyboard.press("ArrowRight");
  const movedRightViewBox = await canvas.getAttribute("viewBox");
  expect(movedRightViewBox).not.toBe(initialViewBox);

  await page.keyboard.press("ArrowDown");
  expect(await canvas.getAttribute("viewBox")).not.toBe(movedRightViewBox);
});

test("keeps Star Map targets touch-sized and usable on a phone @star-map @touch", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  try {
    await startStarMapFixture(page, "space-starship-ready");
    await page.getByRole("tab", { name: "Interstellar" }).click();
    const map = page.getByTestId("star-map-pane");
    const canvas = map.getByTestId("star-map-canvas");
    const initialViewBox = await canvas.getAttribute("viewBox");

    const availableMarkers = await map
      .locator(".star-map-hit-target[aria-disabled='false']")
      .evaluateAll((markers) =>
        markers.map((marker) => ({
          testId: marker.getAttribute("data-testid"),
          name: marker.getAttribute("aria-label")?.split(",")[0] ?? "",
        })),
      );
    const target = availableMarkers.find(({ name }) => name !== "Spica");
    expect(target).toBeDefined();
    const marker = map.getByTestId(target!.testId!);
    const markerBounds = await marker.boundingBox();
    expect(markerBounds?.width).toBeGreaterThanOrEqual(44);
    expect(markerBounds?.height).toBeGreaterThanOrEqual(44);
    await page.touchscreen.tap(
      markerBounds!.x + markerBounds!.width / 2,
      markerBounds!.y + markerBounds!.height / 2,
    );
    await expect(map.getByTestId("star-selection").locator("h3")).toHaveText(target!.name);

    for (const name of ["Zoom in", "Zoom out", "Reset map view"]) {
      const control = map.getByRole("button", { name });
      const bounds = await control.boundingBox();
      expect(bounds?.width, `${name} touch width`).toBeGreaterThanOrEqual(44);
      expect(bounds?.height, `${name} touch height`).toBeGreaterThanOrEqual(44);
    }

    await map.getByRole("button", { name: "Zoom in" }).tap();
    await expect(canvas).toHaveAttribute("data-zoom", "1.25");
    await map.getByRole("button", { name: "Zoom out" }).tap();
    await expect(canvas).toHaveAttribute("data-zoom", "1");
    await expect(canvas).toHaveAttribute("viewBox", initialViewBox!);

    await map.getByRole("button", { name: "Zoom in" }).tap();
    await map.getByRole("button", { name: "Zoom in" }).tap();
    await expect(canvas).toHaveAttribute("data-zoom", "1.5625");
    await map.getByRole("button", { name: "Reset map view" }).tap();
    await expect(canvas).toHaveAttribute("data-zoom", "1");
    await expect(canvas).toHaveAttribute("viewBox", initialViewBox!);
  } finally {
    await context.close();
  }
});

test("keeps undisclosed factory systems out of search and direct targeting @star-map", async ({
  page,
}) => {
  await startStarMapFixture(page, "space-manuscript-hidden");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const factorySystemId = state.permanent.megastructures.ancientManuscripts[0]!.factorySystemId;
  const map = page.getByTestId("star-map-pane");

  const search = map.getByRole("searchbox", { name: "Search stars" });
  await search.fill("Canopus");
  await expect(map.getByText("No matching stars.")).toBeVisible();
  const factoryMarker = map.getByTestId(`star-marker-${factorySystemId}`);
  await expect(factoryMarker).toHaveAttribute("aria-disabled", "true");
  await expect(factoryMarker).toHaveAttribute("aria-label", /Unidentified star/);
  await expect(factoryMarker).not.toHaveAttribute("aria-label", /Canopus/);
  const markerReasonId = await factoryMarker.getAttribute("aria-describedby");
  expect(markerReasonId).toBeTruthy();
  await expect(map.locator(`[id="${markerReasonId}"]`)).toContainText(
    "cannot be selected until it is disclosed",
  );

  const interstellar = page.getByRole("tabpanel", { name: /Interstellar/ });
  await interstellar.getByRole("tab", { name: /Star Data/ }).click();
  const table = page.getByTestId("star-data-table");
  await expect(table.getByRole("row", { name: /Canopus/ })).toHaveCount(0);
  const accepted = await page.evaluate(
    (systemId) =>
      window.miaplacidusTest!.dispatch({ type: "space.starship.destination.select", systemId }),
    factorySystemId,
  );
  expect(accepted).toBe(false);
});

test("filters and sorts Star Data, targets a discovered system, and focuses it on the map @star-map", async ({
  page,
}, testInfo) => {
  await startStarMapFixture(page, "space-manuscript-hidden");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  const interstellar = page.getByRole("tabpanel", { name: /Interstellar/ });
  await interstellar.getByRole("tab", { name: /Star Data/ }).click();
  const starData = page.getByTestId("star-data-view");
  const table = starData.getByTestId("star-data-table");
  const rows = table.locator("tbody tr");
  const initialRowCount = await rows.count();
  expect(initialRowCount).toBeGreaterThan(1);

  await starData.getByLabel("Sort by").selectOption("distance");
  const distances = async () =>
    (await rows.locator("td:nth-child(2)").allInnerTexts()).map((text) => Number.parseFloat(text));
  const ascending = await distances();
  expect(ascending).toEqual([...ascending].sort((first, second) => first - second));
  const sortDirection = starData.getByRole("button", { name: "Switch to descending order" });
  await expect(sortDirection).toHaveAttribute("aria-pressed", "false");
  await sortDirection.click();
  const descending = await distances();
  expect(descending).toEqual([...descending].sort((first, second) => second - first));
  await expect(starData.getByRole("button", { name: "Switch to ascending order" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await starData.getByRole("button", { name: "Switch to ascending order" }).click();
  await starData.getByLabel("Filter by name").fill("Canopus");
  await expect(rows).toHaveCount(0);
  await expect(starData.getByText("No studied destinations have profile data yet.")).toBeVisible();

  await starData.getByLabel("Filter by name").fill("");
  await expect(rows).toHaveCount(initialRowCount);
  await captureVisualCheckpoint(page, testInfo, "star-data-unfiltered");
  await expect(starData.getByTestId("star-data-scroll-hint")).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(starData.getByTestId("star-data-scroll-hint")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const starDataWidth = await starData.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(starDataWidth.scrollWidth).toBeLessThanOrEqual(starDataWidth.clientWidth);
  const tableScroll = starData.locator(".star-data-table-scroll");
  const tableScrollState = await tableScroll.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      scrollLeft: element.scrollLeft,
      overflowX: getComputedStyle(element).overflowX,
    };
  });
  expect(tableScrollState.overflowX).toBe("auto");
  expect(tableScrollState.scrollWidth).toBeGreaterThan(tableScrollState.clientWidth);
  expect(tableScrollState.scrollLeft).toBeGreaterThan(0);
  await expect(tableScroll).toHaveAttribute("role", "region");
  await expect(tableScroll).toHaveAttribute("tabindex", "0");
  await tableScroll.evaluate((element) => {
    element.scrollLeft = 0;
  });
  await tableScroll.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => tableScroll.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await tableScroll.evaluate((element) => {
    element.scrollLeft = 0;
    element.blur();
  });
  await captureVisualCheckpoint(page, testInfo, "star-data-mobile");
  await page.setViewportSize({ width: 1280, height: 900 });
  const targetButton = table.locator("tbody tr td:last-child button:not(:disabled)").first();
  await expect(targetButton).toBeEnabled();
  const targetRow = targetButton.locator("xpath=../..");
  const targetName = (await targetRow.locator("th[scope='row']").innerText())
    .replace(/\u2699/gu, "")
    .trim();
  const expectedFuel = (await targetRow.locator("td:nth-child(6)").innerText()).trim();
  const expectedAp = (await targetRow.locator("td:nth-child(7)").innerText()).trim();
  await expect(targetRow.locator("td:nth-child(8) button")).toHaveAccessibleName(
    `Show on map: ${targetName}`,
  );
  await expect(targetButton).toHaveAccessibleName(`Set as destination: ${targetName}`);
  await targetButton.click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
      ),
    )
    .not.toBeNull();

  await targetRow.locator("td:nth-child(8) button").click();
  await expect(interstellar.getByRole("tab", { name: "Map" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(map.getByTestId("star-selection").locator("h3")).toHaveText(targetName);
  await expect(map.getByTestId("star-route-antimatter")).toHaveText(expectedFuel);
  await expect(map.getByTestId("star-route-ap")).toHaveText(expectedAp);
});
