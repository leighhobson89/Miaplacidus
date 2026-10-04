import { expect, test } from "../_harness/fixtures";

async function startStarMapFixture(
  page: import("@playwright/test").Page,
  fixture: "space-telescope" | "space-manuscript-hidden" = "space-telescope",
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
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByTestId("hydrogen-onboarding").waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Begin exploring" }).click();
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
  await expect(factoryMarker).toBeDisabled();
  await expect(factoryMarker).toHaveAttribute("aria-label", /Unidentified star/);
  await expect(factoryMarker).not.toHaveAttribute("aria-label", /Canopus/);

  await map.getByRole("tab", { name: "Star Data" }).click();
  const factoryRow = map.getByTestId("star-data-table").getByRole("row", { name: /Canopus/ });
  await expect(factoryRow.locator(".star-data-factory-marker")).toHaveCount(0);
  await expect(factoryRow.getByRole("button", { name: "Set as destination" })).toBeDisabled();
  const accepted = await page.evaluate(
    (systemId) =>
      window.miaplacidusTest!.dispatch({ type: "space.starship.destination.select", systemId }),
    factorySystemId,
  );
  expect(accepted).toBe(false);
});

test("filters and sorts Star Data, targets a discovered system, and focuses it on the map @star-map", async ({
  page,
}) => {
  await startStarMapFixture(page, "space-manuscript-hidden");
  await page.getByRole("tab", { name: "Interstellar" }).click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("tab", { name: "Star Data" }).click();
  const table = map.getByTestId("star-data-table");
  const rows = table.locator("tbody tr");
  expect(await rows.count()).toBeGreaterThan(1);

  await map.getByLabel("Sort by").selectOption("distance");
  const distances = async () =>
    (await rows.locator("td:nth-child(2)").allInnerTexts()).map((text) => Number.parseFloat(text));
  const ascending = await distances();
  expect(ascending).toEqual([...ascending].sort((first, second) => first - second));
  await map.getByRole("button", { name: "Reverse order" }).click();
  const descending = await distances();
  expect(descending).toEqual([...descending].sort((first, second) => second - first));

  await map.getByRole("button", { name: "Reverse order" }).click();
  await map.getByLabel("Filter by name").fill("Canopus");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Canopus");
  await expect(
    rows.first().getByRole("button", { name: "Set as destination", exact: true }),
  ).toBeDisabled();

  await map.getByLabel("Filter by name").fill("");
  const targetButton = table.locator("tbody tr td:last-child button:not(:disabled)").first();
  await expect(targetButton).toBeEnabled();
  const targetRow = targetButton.locator("xpath=../..");
  const targetName = (await targetRow.locator("th[scope='row']").innerText()).trim();
  await targetButton.click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.miaplacidusTest!.getState().run.space.starship.destinationSystemId,
      ),
    )
    .not.toBeNull();

  await targetRow.getByRole("button", { name: "Show on map" }).click();
  await expect(map.getByRole("tab", { name: "Map" })).toHaveAttribute("aria-selected", "true");
  await expect(map.getByTestId("star-selection").locator("h3")).toHaveText(targetName);
});
