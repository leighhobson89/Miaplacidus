import { createRequire } from "node:module";
import { expect, test } from "../_harness/fixtures";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { stabilizeStarMapVisual } from "./visual-stability";
import { starshipTravelPlan } from "../../../src/engine/spaceMechanics";
import type { GameState } from "../../../src/engine/state";
import { canonicalJson, makeEnvelope, type SaveEnvelopeV1 } from "../../../src/persistence/schema";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";

type StoredEntry = readonly [string, string];

const { compressToUTF16, decompressFromUTF16 } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

function saveWithAntimatter(entries: readonly StoredEntry[], quantity: number): StoredEntry[] {
  const values = new Map(entries);
  const slotId = values.get("miaplacidus:v1:lastStartedSlot") ?? null;
  if (!slotId) throw new Error("The Star Map test save was not marked as the latest save.");
  const commitId = values.get(`miaplacidus:v1:head:${slotId}`);
  if (!commitId) throw new Error("The Star Map test save has no committed generation.");
  const payloadKey = `miaplacidus:v1:slot:${slotId}:${commitId}`;
  const payload = values.get(payloadKey);
  if (!payload) throw new Error("The Star Map test save payload could not be read.");
  const json = decompressFromUTF16(payload);
  if (!json) throw new Error("The Star Map test save payload could not be decompressed.");
  const envelope = JSON.parse(json) as SaveEnvelopeV1;
  const state: GameState = {
    ...envelope.state,
    run: {
      ...envelope.state.run,
      space: { ...envelope.state.run.space, antimatter: quantity },
    },
  };
  const updated = makeEnvelope({
    slotId,
    pioneerName: envelope.pioneerName,
    createdAt: envelope.createdAt,
    savedAt: Math.max(Date.now(), envelope.savedAt),
    revision: envelope.revision + 1,
    state,
  });
  values.set(payloadKey, compressToUTF16(canonicalJson(updated)));
  return [...values.entries()];
}

async function browserLocalStorageEntries(
  page: import("@playwright/test").Page,
): Promise<StoredEntry[]> {
  return page.evaluate(() => {
    const prefix = "miaplacidus:v1:";
    const entries: StoredEntry[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) entries.push([key, value]);
    }
    return entries;
  });
}

async function openSavedPioneer(
  context: import("@playwright/test").BrowserContext,
  entries: readonly StoredEntry[],
): Promise<import("@playwright/test").Page> {
  const page = await context.newPage();
  await page.addInitScript(
    (storedEntries: StoredEntry[]) => {
      const prefix = "miaplacidus:v1:";
      const keys = Array.from({ length: localStorage.length }, (_, index) =>
        localStorage.key(index),
      ).filter((key): key is string => key?.startsWith(prefix) ?? false);
      for (const key of keys) localStorage.removeItem(key);
      for (const [key, value] of storedEntries) localStorage.setItem(key, value);
    },
    [...entries],
  );
  await page.goto("/");
  await resumeSavedPioneer(page, "Star Map Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
  return page;
}

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
  const homeSearchResult = map
    .locator(".star-map-search-results button")
    .filter({ hasText: "Miaplacidus" });
  await expect(homeSearchResult).toHaveAttribute("aria-disabled", "true");
  const homeSearchReasonId = await homeSearchResult.getAttribute("aria-describedby");
  expect(homeSearchReasonId).toBeTruthy();
  await expect(map.locator(`[id="${homeSearchReasonId}"]`)).toContainText("fourth milestone");
  await expect(map.getByTestId("star-selection")).toContainText("Spica");
  const lockedHome = map.locator(
    ".star-map-marker-overlay [data-testid^='star-marker-'][aria-label^='Miaplacidus']",
  );
  await expect(lockedHome).toHaveAttribute("aria-disabled", "true");
  const homeReasonId = await lockedHome.getAttribute("aria-describedby");
  expect(homeReasonId).toBeTruthy();
  await expect(map.locator(`[id="${homeReasonId}"]`)).toContainText("fourth milestone");

  await search.fill("sirius");
  const distantSearchResult = map
    .locator(".star-map-search-results button")
    .filter({ hasText: "Sirius" });
  await expect(distantSearchResult).toHaveAttribute("aria-disabled", "true");
  const studyReasonId = await distantSearchResult.getAttribute("aria-describedby");
  expect(studyReasonId).toBeTruthy();
  await expect(map.locator(`[id="${studyReasonId}"]`)).toContainText("Study farther");
  await expect(map.getByTestId("star-selection")).toContainText("Spica");
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

test("Star Map canvas has durable desktop and phone presentation captures @p66-visual-review", async ({
  page,
}, testInfo) => {
  await startStarMapFixture(page, "space-starship-ready");
  await stabilizeStarMapVisual(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  const canvas = map.getByTestId("star-map-canvas");
  await expect(map).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect(map.locator(".pane-heading h2")).toHaveText("Star Map");

  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "en", themeId: "terminal" },
    }),
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await captureVisualCheckpoint(page, testInfo, "phase6-star-map-terminal-desktop");

  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "en", themeId: "light" },
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await captureVisualCheckpoint(page, testInfo, "phase6-star-map-light-mobile");
});

test("pans the focused map with arrow keys @star-map @keyboard", async ({ page }) => {
  await startStarMapFixture(page);
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  const canvas = map.getByTestId("star-map-canvas");
  const initialViewBox = await canvas.getAttribute("viewBox");

  const zoomIn = map.getByRole("button", { name: "Zoom in" });
  await zoomIn.focus();
  await page.keyboard.press("Enter");
  await expect(canvas).toHaveAttribute("data-zoom", "1.25");
  await canvas.focus();
  await expect(canvas).toBeFocused();
  await expect(canvas).toHaveAttribute("tabindex", "0");
  await expect(canvas).toHaveAttribute("aria-describedby", "star-map-keyboard-help");
  const zoomedViewBox = await canvas.getAttribute("viewBox");

  await page.keyboard.press("ArrowRight");
  const movedRightViewBox = await canvas.getAttribute("viewBox");
  expect(movedRightViewBox).not.toBe(zoomedViewBox);

  await page.keyboard.press("ArrowDown");
  const movedDownViewBox = await canvas.getAttribute("viewBox");
  expect(movedDownViewBox).not.toBe(movedRightViewBox);

  await page.keyboard.press("ArrowLeft");
  const movedLeftViewBox = await canvas.getAttribute("viewBox");
  expect(movedLeftViewBox).not.toBe(movedDownViewBox);
  expect(movedLeftViewBox).not.toBe(zoomedViewBox);

  await page.keyboard.press("ArrowUp");
  await expect(canvas).toBeFocused();
  await expect(canvas).toHaveAttribute("viewBox", zoomedViewBox!);

  const zoomOut = map.getByRole("button", { name: "Zoom out" });
  await zoomOut.focus();
  await page.keyboard.press("Enter");
  await expect(canvas).toHaveAttribute("data-zoom", "1");

  await zoomIn.focus();
  await page.keyboard.press("Enter");
  await expect(canvas).toHaveAttribute("data-zoom", "1.25");
  await zoomIn.focus();
  await page.keyboard.press("Enter");
  await expect(canvas).toHaveAttribute("data-zoom", "1.5625");
  const reset = map.getByRole("button", { name: "Reset map view" });
  await reset.focus();
  await page.keyboard.press("Enter");
  await expect(canvas).toHaveAttribute("data-zoom", "1");
  await expect(canvas).toHaveAttribute("viewBox", initialViewBox!);
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
    await marker.scrollIntoViewIfNeeded();
    const markerBounds = await marker.boundingBox();
    expect(markerBounds?.width).toBeGreaterThanOrEqual(44);
    expect(markerBounds?.height).toBeGreaterThanOrEqual(44);
    const viewport = page.viewportSize();
    expect(markerBounds!.y).toBeGreaterThanOrEqual(0);
    expect(markerBounds!.y + markerBounds!.height).toBeLessThanOrEqual(viewport!.height);
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

    const bounds = await canvas.boundingBox();
    expect(bounds).not.toBeNull();
    const touchStart = await canvas.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const candidates = [
        [0.12, 0.86],
        [0.82, 0.86],
        [0.12, 0.14],
        [0.82, 0.14],
        [0.5, 0.5],
      ];
      for (const [xRatio, yRatio] of candidates) {
        const x = rect.left + rect.width * xRatio!;
        const y = rect.top + rect.height * yRatio!;
        const hit = document.elementFromPoint(x, y);
        if (hit?.closest(".star-map-hit-target")) continue;
        if (hit && element.contains(hit)) return { x, y };
      }
      throw new Error("Could not find an unobstructed point on the Star Map canvas");
    });
    await map.getByRole("button", { name: "Reset map view" }).tap();
    await expect(canvas).toHaveAttribute("viewBox", initialViewBox!);
    await map.getByRole("button", { name: "Zoom out" }).tap();
    await expect(canvas).toHaveAttribute("data-zoom", "1");
    await expect(canvas).toHaveAttribute("viewBox", initialViewBox!);

    await map.getByRole("button", { name: "Zoom in" }).tap();
    await map.getByRole("button", { name: "Zoom in" }).tap();
    await expect(canvas).toHaveAttribute("data-zoom", "1.5625");
    await map.getByRole("button", { name: "Reset map view" }).tap();
    await expect(canvas).toHaveAttribute("data-zoom", "1");
    await expect(canvas).toHaveAttribute("viewBox", initialViewBox!);

    await map.getByRole("button", { name: "Zoom in" }).tap();
    const viewBoxBeforeTouchDrag = await canvas.getAttribute("viewBox");
    const touch = await context.newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...touchStart, id: 1, radiusX: 2, radiusY: 2, force: 1 }],
    });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        { ...touchStart, x: touchStart.x - 48, id: 1, radiusX: 2, radiusY: 2, force: 1 },
      ],
    });
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(canvas).not.toHaveAttribute("viewBox", viewBoxBeforeTouchDrag!);
    await touch.detach();
  } finally {
    await context.close();
  }
});

test("Star Data pairs each system's weather glyph with its chance @star-map", async ({ page }) => {
  await startStarMapFixture(page, "space-manuscript-hidden");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  await page.locator("#tab-interstellar-star-data").click();

  const starDataPage = page.locator("#panel-interstellar-star-data");
  const pageHeading = starDataPage.locator(".pane-heading h2");
  await expect(pageHeading).toHaveCount(1);
  await expect(pageHeading).toHaveText("Star Data");
  await expect(pageHeading).toBeVisible();
  const artworkRow = starDataPage.locator(".page-artwork-row");
  await expect(artworkRow).toHaveCount(1);
  await expect(artworkRow).toBeVisible();
  await expect(artworkRow.locator("[data-celestial-illustration='star-system']")).toBeVisible();

  const rows = page.getByTestId("star-data-table").locator("tbody tr");
  await expect(rows.first()).toBeVisible();
  const rowCount = await rows.count();
  let rowsWithWeather = 0;
  for (let index = 0; index < rowCount; index += 1) {
    const row = rows.nth(index);
    const settledMarker = row.locator("[data-testid^='star-data-settled-']");
    const weather = row.locator("[data-testid^='star-data-weather-']");
    if ((await settledMarker.count()) > 0) {
      await expect(weather).toHaveCount(0);
      continue;
    }

    rowsWithWeather += 1;
    await expect(weather).toBeVisible();
    await expect(weather).toHaveAttribute("aria-label", /\d+%/);
    await expect(weather).toContainText(/\d+%/);
    await expect(weather.locator(".weather-symbol svg")).toBeVisible();
  }
  expect(rowsWithWeather).toBeGreaterThan(0);
});

test("Star Map content is absent from every other Interstellar child @star-map @ui-navigation", async ({
  page,
}) => {
  await startStarMapFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();

  const tabIds = [
    "tab-interstellar-star-map",
    "tab-interstellar-star-data",
    "tab-interstellar-starship",
    "tab-interstellar-fleet-hangar",
  ];
  for (const tabId of tabIds) await expect(page.locator(`#${tabId}`)).toHaveCount(1);
  await page.locator("#tab-interstellar-star-map").click();
  await expect(page.getByTestId("star-map-pane")).toBeVisible();

  for (const tabId of tabIds.filter((id) => id !== "tab-interstellar-star-map")) {
    await page.locator(`#${tabId}`).click();
    await expect(page.locator(`#${tabId}`)).toHaveAttribute("aria-selected", "true");
    if (tabId === "tab-interstellar-star-data") {
      await expect(page.getByTestId("star-data-view")).toBeVisible();
    }
    await expect(page.getByTestId("star-map-pane")).toBeHidden();
  }
});

test("selected Star Map route shows readiness-colored distance and antimatter labels @star-map", async ({
  page,
}) => {
  await startStarMapFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();

  const route = map.getByTestId("star-map-selected-route");
  await expect(route).toBeVisible();
  await expect(route).toHaveClass(/green-ready-text/);
  const routeLine = route.locator(".star-map-selected-route-line");
  const routeLabel = route.getByTestId("star-map-selected-route-label");
  await expect(routeLabel).toContainText("Distance:");
  await expect(routeLabel).toContainText("Antimatter required:");
  const midpoint = await routeLine.evaluate((line) => ({
    x: (Number(line.getAttribute("x1")) + Number(line.getAttribute("x2"))) / 2,
    y: (Number(line.getAttribute("y1")) + Number(line.getAttribute("y2"))) / 2,
  }));
  const labelPosition = await routeLabel.evaluate((label) => ({
    x: Number(label.getAttribute("x")),
    y: Number(label.getAttribute("y")),
  }));
  expect(labelPosition.x).toBeCloseTo(midpoint.x, 3);
  expect(labelPosition.y).toBeCloseTo(midpoint.y - 8, 3);
});

test("P-13 keeps Star Map fare, balance, and destination action visible on narrow screens @p13-context @star-map", async ({
  page,
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 740 });
    await startStarMapFixture(page, "space-starship-ready");
    const prepared = await page.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("prepare-run-starship-launch"),
    );
    expect(prepared).toBe(true);
    await page.getByRole("tab", { name: "Interstellar" }).click();
    const map = page.getByTestId("star-map-pane");
    await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
    await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();

    const balance = page.getByTestId("top-stat-antimatter");
    const selection = map.getByTestId("star-selection");
    const fare = selection.getByTestId("star-route-antimatter");
    const destinationAction = selection.getByRole("button", { name: /Set as destination: Sirius/ });
    await expect(balance).toBeVisible();
    await expect(selection).toBeVisible();
    await expect(fare).toBeVisible();
    await expect(destinationAction).toBeVisible();
    await expect(destinationAction).toBeEnabled();

    const geometry = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      balanceRight: document
        .querySelector('[data-testid="top-stat-antimatter"]')!
        .getBoundingClientRect().right,
      selectionRight: document
        .querySelector('[data-testid="star-selection"]')!
        .getBoundingClientRect().right,
    }));
    expect(geometry.documentWidth, `${width}px document width`).toBeLessThanOrEqual(
      geometry.viewportWidth,
    );
    expect(geometry.balanceRight, `${width}px antimatter balance`).toBeLessThanOrEqual(width);
    expect(geometry.selectionRight, `${width}px Star Map selection`).toBeLessThanOrEqual(width);
  }
});

test("underfunded Star Map route labels use red-disabled styling @star-map", async ({ page }) => {
  await startStarMapFixture(page, "space-starship-ready");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();

  const savedState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const destinationId = savedState.run.space.starship.destinationSystemId;
  expect(destinationId).not.toBeNull();
  const plan = starshipTravelPlan(savedState, destinationId!);
  expect(plan).not.toBeNull();
  expect(savedState.run.space.antimatter).toBeGreaterThanOrEqual(plan!.antimatter);

  await saveNowFromSettings(page);
  const shortfallEntries = saveWithAntimatter(
    await browserLocalStorageEntries(page),
    plan!.antimatter - 1,
  );
  const shortfallPage = await openSavedPioneer(page.context(), shortfallEntries);
  try {
    await shortfallPage.getByRole("tab", { name: "Interstellar" }).click();
    const route = shortfallPage.getByTestId("star-map-selected-route");
    await expect(route).toBeVisible();
    await expect(route).toHaveAttribute("data-affordable", "false");
    await expect(route).toHaveClass(/red-disabled-text/);

    const routeLine = route.locator(".star-map-selected-route-line");
    const routeLabel = route.getByTestId("star-map-selected-route-label");
    await expect(routeLabel).toContainText("Distance:");
    await expect(routeLabel).toContainText("Antimatter required:");
    const midpoint = await routeLine.evaluate((line) => ({
      x: (Number(line.getAttribute("x1")) + Number(line.getAttribute("x2"))) / 2,
      y: (Number(line.getAttribute("y1")) + Number(line.getAttribute("y2"))) / 2,
    }));
    const labelPosition = await routeLabel.evaluate((label) => ({
      x: Number(label.getAttribute("x")),
      y: Number(label.getAttribute("y")),
    }));
    expect(labelPosition.x).toBeCloseTo(midpoint.x, 3);
    expect(labelPosition.y).toBeCloseTo(midpoint.y - 8, 3);

    const routeColor = await route.evaluate((element) => getComputedStyle(element).color);
    expect(await routeLine.evaluate((line) => getComputedStyle(line).stroke)).toBe(routeColor);
    expect(await routeLabel.evaluate((label) => getComputedStyle(label).fill)).toBe(routeColor);
  } finally {
    await shortfallPage.close();
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
  await expect(map.locator(".star-map-search-status")).toHaveText("No matches");
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
  await stabilizeStarMapVisual(page);
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
    `Show this Star on the Star Map: ${targetName}`,
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
  const mapPanel = interstellar.locator("#panel-interstellar-star-map");
  await expect(interstellar.getByRole("tab", { name: "Map" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(mapPanel).toBeFocused();
  await expect(map.getByTestId("star-selection").locator("h3")).toHaveText(targetName);
  await expect(map.getByTestId("star-route-antimatter")).toHaveText(expectedFuel);
  await expect(map.getByTestId("star-route-ap")).toHaveText(expectedAp);
});

test("Show on map moves focus to the selected Star Map panel @star-map @p16-focus", async ({
  page,
}) => {
  await startStarMapFixture(page, "space-manuscript-hidden");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const interstellar = page.getByRole("tabpanel", { name: /Interstellar/ });
  await interstellar.getByRole("tab", { name: /Star Data/ }).click();

  const table = page.getByTestId("star-data-table");
  const showOnMapButton = table.locator("tbody tr td:nth-child(8) button").first();
  await expect(showOnMapButton).toBeEnabled();
  const targetRow = showOnMapButton.locator("xpath=../..");
  const targetName = (await targetRow.locator("th[scope='row']").innerText()).trim();
  await showOnMapButton.click();

  const mapPanel = interstellar.locator("#panel-interstellar-star-map");
  await expect(interstellar.getByRole("tab", { name: "Map" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(mapPanel).toBeFocused();
  await expect(page.getByTestId("star-map-pane").getByTestId("star-selection")).toContainText(
    targetName,
  );
});
