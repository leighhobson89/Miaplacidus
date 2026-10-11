import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatNumber } from "../../../src/app/numberFormatting";
import { createStarCatalogue } from "../../../src/content";
import { starshipTravelPlan } from "../../../src/engine/spaceMechanics";
import { selectStarDestination } from "../../../src/engine/starMapSelectors";

async function startStarshipReadyFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-starship-ready");
  await page.getByLabel("Pioneer name").fill("P-41 Star Map Notation Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("P-41 formats the selected Star Map distance and travel cost in every notation @p41-star-map-notation", async ({
  page,
}) => {
  await startStarshipReadyFixture(page);
  const sirius = createStarCatalogue().find(({ name }) => name === "Sirius");
  expect(sirius).toBeDefined();

  const renderedFuel: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Interstellar" }).click();
    const map = page.getByTestId("star-map-pane");
    await map.getByRole("searchbox", { name: "Search stars" }).fill("Sirius");
    await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const plan = starshipTravelPlan(state, sirius!.id);
    expect(plan).not.toBeNull();
    const selection = selectStarDestination(state, sirius!.id);
    expect(selection.route).not.toBeNull();

    await expect(map.getByTestId("star-distance")).toHaveText(
      `${formatNumber("en", plan!.distanceLy, 2, notation)} ly`,
    );
    const expectedFuel = formatNumber("en", selection.route!.antimatterRequired, 0, notation);
    await expect(map.getByTestId("star-route-antimatter")).toHaveText(expectedFuel);
    const expectedAp = selection.route!.ascendencyPoints;
    if (expectedAp === null) {
      await expect(map.getByTestId("star-route-ap")).toHaveText("—");
    } else {
      await expect(map.getByTestId("star-route-ap")).toHaveText(
        formatNumber("en", expectedAp, 0, notation),
      );
    }
    renderedFuel[notation] = expectedFuel;
  }

  expect(renderedFuel.scientific).not.toBe(renderedFuel.standard);
});
