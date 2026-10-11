import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { buildingCost } from "../../../src/engine/commands";

async function startPowerBuildingsFixture(page: import("@playwright/test").Page): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261009&testLocale=en&economyFixture=power-buildings");
  await page.getByLabel("Pioneer name").fill("P-41 Building Cost Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.miaplacidusTest?.getState())))
    .toBe(true);
}

test("P-41 formats Energy and Research building cash costs in every notation @p41-building-currency-costs", async ({
  page,
}) => {
  await startPowerBuildingsFixture(page);

  const renderedCosts: Record<
    "condensed" | "standard" | "scientific",
    { battery: string; research: string }
  > = {
    condensed: { battery: "", research: "" },
    standard: { battery: "", research: "" },
    scientific: { battery: "", research: "" },
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);

    await page.getByRole("tab", { name: "Energy" }).click();
    await page.locator("#tab-energy-batteries").click();
    const battery = page.locator('[data-building-id="battery3"]');
    const batteryCost = buildingCost(state, "battery3").cash;
    const expectedBatteryCost = formatCurrency(
      "en",
      batteryCost,
      state.settings.currencyId ?? "usd",
      2,
      notation,
    );
    await expect(battery.locator("p").filter({ hasText: "Owned:" })).toContainText(
      expectedBatteryCost,
    );
    renderedCosts[notation].battery = expectedBatteryCost;

    await page.getByRole("tab", { name: "Research" }).click();
    await page.locator("#tab-research-science-buildings").click();
    const scienceLab = page.locator('[data-building-id="scienceLab"]');
    const scienceLabCost = buildingCost(state, "scienceLab").cash;
    const expectedScienceLabCost = formatCurrency(
      "en",
      scienceLabCost,
      state.settings.currencyId ?? "usd",
      2,
      notation,
    );
    await expect(scienceLab.locator("p").nth(2)).toHaveText(expectedScienceLabCost);
    renderedCosts[notation].research = expectedScienceLabCost;
  }

  expect(renderedCosts.scientific.battery).not.toBe(renderedCosts.standard.battery);
  expect(renderedCosts.scientific.research).not.toBe(renderedCosts.standard.research);
});
