import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { permanentPerkPurchaseCount } from "../../../src/content/economyRules";
import {
  LAUNCH_PAD_COST,
  ROCKET_FUEL_PUMP_BASE_COST,
  ROCKET_PART_REQUIREMENTS,
} from "../../../src/content/space";
import { rocketPartCost } from "../../../src/engine/spaceRules";
import {
  philosophyDiscountedSpaceCost,
  philosophyRepeatableRank,
} from "../../../src/engine/philosophy";

async function startRocketPartFixture(
  page: Page,
  fixture:
    | "space-rocket-part-exact"
    | "space-telescope"
    | "space-rocket-fuel-pump" = "space-rocket-part-exact",
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261003&testLocale=en&economyFixture=${fixture}`);
  await page.getByLabel("Pioneer name").fill("Space Mining Currency Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("P-41 formats Rocket part cash costs in every notation @p41-space-currency", async ({
  page,
}) => {
  await startRocketPartFixture(page);

  const renderedCosts: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Space Mining" }).click();
    await page.locator("#tab-space-mining-launch-pad").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const purchases =
      permanentPerkPurchaseCount(state.permanent.acquiredPerks, "launchPadMassProduction") +
      philosophyRepeatableRank(state, "launchPadMassProduction");
    const cashCost = rocketPartCost(state.run.space.rockets.rocket1.builtParts, purchases).cash;
    const expected = formatCurrency(
      "en",
      cashCost,
      state.settings.currencyId ?? "usd",
      0,
      notation,
    );
    const costLine = page.getByTestId("rocket-card-rocket1").locator(".cost-line");
    await expect(costLine).toContainText(expected);
    renderedCosts[notation] = expected;
  }

  expect(renderedCosts.scientific).not.toBe(renderedCosts.standard);
});

test("P-41 formats the Launch Pad construction cash cost in every notation @p41-space-currency", async ({
  page,
}) => {
  await startRocketPartFixture(page, "space-telescope");

  const displayedCosts: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Space Mining" }).click();
    await page.locator("#tab-space-mining-launch-pad").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const cost = philosophyDiscountedSpaceCost(
      state,
      LAUNCH_PAD_COST,
      "efficientAssembly",
      0.01,
      true,
    );
    const expected = formatCurrency(
      "en",
      cost.cash,
      state.settings.currencyId ?? "usd",
      0,
      notation,
    );
    const costLine = page.locator(".space-cost-list:visible").first().locator("li").first();
    await expect(costLine).toHaveText(expected);
    displayedCosts[notation] = expected;
  }

  expect(displayedCosts.scientific).not.toBe(displayedCosts.standard);
});

test("P-41 formats a Rocket fuel-pump cash cost in every notation @p41-space-currency", async ({
  page,
}) => {
  await startRocketPartFixture(page, "space-rocket-fuel-pump");
  const preparedState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(preparedState.run.space.rockets.rocket1.builtParts).toBe(ROCKET_PART_REQUIREMENTS.rocket1);
  expect(preparedState.run.space.rockets.rocket1.phase).toBe("ready");

  const displayedCosts: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Space Mining" }).click();
    await page.locator("#tab-space-mining-rocket-1").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const expected = formatCurrency(
      "en",
      ROCKET_FUEL_PUMP_BASE_COST.rocket1,
      state.settings.currencyId ?? "usd",
      0,
      notation,
    );
    const costLine = page.getByTestId("rocket-card-rocket1").locator(".cost-line");
    await expect(costLine).toContainText(expected);
    displayedCosts[notation] = expected;
  }

  expect(displayedCosts.scientific).not.toBe(displayedCosts.standard);
});
