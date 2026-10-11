import { expect, test } from "../_harness/fixtures";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { TELESCOPE_COST } from "../../../src/content/space";
import { philosophyDiscountedSpaceCost } from "../../../src/engine/philosophy";
import { spaceText } from "../../../src/i18n/spaceMessages";

test("P-41 formats the Space Telescope build cash quote in every notation @p41-telescope-currency", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto("/?testSeed=20261003&testLocale=en&economyFixture=space-telescope");
  await page.getByLabel("Pioneer name").fill("Telescope Currency Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);

  const initialState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(initialState.run.space.telescopeBuilt).toBe(false);
  const initialCash = initialState.run.cash;
  const initialCurrency = initialState.settings.currencyId ?? "usd";
  const displayedCosts: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Space Mining" }).click();
    await page.locator("#tab-space-mining-telescope").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    expect(state.run.cash).toBe(initialCash);
    expect(state.run.space.telescopeBuilt).toBe(false);
    const cost = philosophyDiscountedSpaceCost(
      state,
      TELESCOPE_COST,
      "efficientAssembly",
      0.01,
      true,
    );
    const expected = formatCurrency("en", cost.cash, initialCurrency, 0, notation);
    const telescope = page
      .getByTestId("space-mining-pane")
      .getByRole("region", { name: spaceText("en", "telescopeTitle") });
    await expect(
      telescope
        .getByRole("list", { name: spaceText("en", "telescopeCost") })
        .getByRole("listitem")
        .first(),
    ).toHaveText(expected);
    await expect(
      telescope.getByRole("button", { name: spaceText("en", "telescopeBuild"), exact: true }),
    ).toBeEnabled();
    displayedCosts[notation] = expected;
  }

  expect(displayedCosts.scientific).not.toBe(displayedCosts.standard);
});
