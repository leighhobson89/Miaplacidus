import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { selectGoodSale } from "../../../src/engine/selectors";

test("P-41 formats the Titanium compound sale preview in every notation @p41-compound-sale-currency", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");

  const renderedValues: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Compounds" }).click();
    await page.locator("#tab-compounds-titanium").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const sale = selectGoodSale(state, "titanium", "all");
    const expected = formatCurrency(
      "en",
      sale.proceeds,
      state.settings.currencyId ?? "usd",
      2,
      notation,
    );
    const compound = page.locator('[data-compound-id="titanium"]');
    await expect(compound).toBeVisible();
    await expect(compound.locator(".hydrogen-sale-controls .card-copy strong")).toHaveText(
      expected,
    );
    renderedValues[notation] = expected;
  }

  expect(renderedValues.scientific).not.toBe(renderedValues.standard);
});
