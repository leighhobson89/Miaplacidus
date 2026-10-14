import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { permanentPerkPurchaseCount } from "../../../src/content/economyRules";
import { FLEET_ENVOY_COST } from "../../../src/content/space";
import { philosophyRepeatableRank } from "../../../src/engine/philosophy";
import { starshipModulePartCost } from "../../../src/engine/spaceRules";

async function startStarshipFixture(
  page: Page,
  fixture: "space-starship" | "space-starship-ready" = "space-starship",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Starship Currency Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("P-41 formats Starship module cash costs in every notation @p41-starship-currency", async ({
  page,
}) => {
  await startStarshipFixture(page);

  const renderedCosts: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Interstellar" }).click();
    await page.locator("#tab-interstellar-starship").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const purchases =
      permanentPerkPurchaseCount(state.permanent.acquiredPerks, "spaceElevator") +
      philosophyRepeatableRank(state, "spaceElevator");
    const cashCost = starshipModulePartCost(
      "structural",
      state.run.space.starshipModules.structural.builtParts,
      purchases,
    ).cash;
    const expected = formatCurrency(
      "en",
      cashCost,
      state.settings.currencyId ?? "usd",
      2,
      notation,
    );
    const costLine = page
      .getByTestId("starship-module-structural")
      .locator(".space-cost-list li")
      .first();
    await expect(costLine).toHaveText(expected);
    renderedCosts[notation] = expected;
  }

  expect(renderedCosts.scientific).not.toBe(renderedCosts.standard);
});

test("P-41 formats the Fleet Envoy cash cost in every notation @p41-starship-currency", async ({
  page,
}) => {
  await startStarshipFixture(page, "space-starship-ready");

  const renderedCosts: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Interstellar" }).click();
    await page.locator("#tab-interstellar-fleet-hangar").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const expected = formatCurrency(
      "en",
      FLEET_ENVOY_COST.cash,
      state.settings.currencyId ?? "usd",
      2,
      notation,
    );
    const costLine = page
      .getByTestId("starship-fleet-hangar")
      .locator(".space-cost-list li")
      .first();
    await expect(costLine).toHaveText(expected);
    renderedCosts[notation] = expected;
  }

  expect(renderedCosts.scientific).not.toBe(renderedCosts.standard);
});
