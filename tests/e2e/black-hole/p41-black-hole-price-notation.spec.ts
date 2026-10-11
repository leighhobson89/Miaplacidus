import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatNumber } from "../../../src/app/numberFormatting";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

test("P-41 formats the Black Hole Research Point price in every notation @p41-black-hole-price-notation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Black Hole" }).click();
  const research = page.getByTestId("black-hole-research");
  const copy = blackHoleText("en");
  const initialState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(initialState.permanent.blackHole.discovered).toBe(true);
  expect(initialState.permanent.blackHole.researched).toBe(false);
  const initialResearchPoints = initialState.run.researchPoints;
  const researchPrice = initialState.permanent.blackHole.researchPrice;
  expect(researchPrice).toBeGreaterThan(999);

  const renderedPrices: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Galactic" }).click();
    await page.getByRole("tab", { name: "Black Hole" }).click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    expect(state.run.researchPoints).toBe(initialResearchPoints);
    expect(state.permanent.blackHole.researchPrice).toBe(researchPrice);
    const expectedPrice = formatNumber("en", researchPrice, 0, notation);
    await expect(research.getByRole("button")).toContainText(`${expectedPrice} RP`);
    await expect(research.locator("p")).toHaveText(
      `${formatNumber("en", initialResearchPoints, 0, notation)} ${copy.researchPoints}`,
    );
    renderedPrices[notation] = expectedPrice;
  }

  expect(renderedPrices.scientific).not.toBe(renderedPrices.standard);
});
