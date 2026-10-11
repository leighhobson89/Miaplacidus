import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setNumberNotation } from "../_harness/settings-controls";
import {
  galacticMarketUnitPrice,
  marketLiquidationPreview,
} from "../../../src/engine/galacticMarket";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";

test("P-41 formats Galactic Market unit prices in every notation @p41-market-currency", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-market-ready");

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Galactic" }).click();
    await page.getByRole("tab", { name: "Galactic Market" }).click();

    const market = page.getByRole("region", { name: "Galactic Market" });
    await market.getByLabel("You give").selectOption("hydrogen");
    await market.getByLabel("You receive").selectOption("helium");

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const price = galacticMarketUnitPrice(state, "hydrogen");
    const expected = formatCurrency("en", price, state.settings.currencyId ?? "usd", 4, notation);
    const hydrogenRate = market.locator(".market-rate-detail").filter({ hasText: "Hydrogen" });
    await expect(hydrogenRate).toContainText(expected);
  }

  const standardState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const standardPrice = formatCurrency(
    "en",
    galacticMarketUnitPrice(standardState, "hydrogen"),
    standardState.settings.currencyId ?? "usd",
    4,
    "standard",
  );
  const scientificState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const scientificPrice = formatCurrency(
    "en",
    galacticMarketUnitPrice(scientificState, "hydrogen"),
    scientificState.settings.currencyId ?? "usd",
    4,
    "scientific",
  );
  expect(scientificPrice).not.toBe(standardPrice);
});

test("P-41 formats the Galactic Market AP sale preview in every notation @p41-market-ap-sale", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-market-ready");

  const displayedPayouts: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Galactic" }).click();
    await page.getByRole("tab", { name: "Galactic Market" }).click();

    const market = page.getByRole("region", { name: "Galactic Market" });
    const apSale = market.locator(".upgrade-card").nth(1);
    await apSale.getByLabel("AP to sell").selectOption("10");

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const expectedPayout = formatCurrency(
      "en",
      10 * state.permanent.galacticMarket.apSellPrice,
      state.settings.currencyId ?? "usd",
      0,
      notation,
    );
    const payoutPreview = apSale.locator(".card-copy > p").nth(1);
    await expect(payoutPreview).toHaveText(expectedPayout);
    displayedPayouts[notation] = expectedPayout;

    await apSale.getByRole("button", { name: "Sell AP for cash", exact: true }).click();
    await expect(market.locator(".live-feedback")).toHaveText(
      `${formatNumber("en", 10, 0, notation)} AP · ${expectedPayout}`,
    );
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().permanent.ascendencyPoints),
      )
      .toBe(
        state.permanent.ascendencyPoints -
          10 +
          (state.permanent.achievements.unlockedIds.includes("trade10APForCash") ? 0 : 5),
      );
  }

  expect(displayedPayouts.scientific).not.toBe(displayedPayouts.standard);
});

test("P-41 formats the Galactic Rebirth liquidation value in every notation @p41-market-liquidation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-market-rebirth-ready");

  const displayedValues: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Galactic" }).click();
    await page.getByRole("tab", { name: "Rebirth" }).click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const expectedValue = formatCurrency(
      "en",
      marketLiquidationPreview(state).value,
      state.settings.currencyId ?? "usd",
      0,
      notation,
    );
    const liquidationCard = page.getByTestId("rebirth-pane").locator(".rebirth-liquidation-card");
    const valueLine = liquidationCard.locator(".card-copy > p").first();
    await expect(valueLine).toContainText(expectedValue);
    await liquidationCard.getByRole("button", { name: "Liquidate all assets" }).click();
    const dialog = page.getByRole("dialog", { name: "Confirm asset liquidation" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("p").nth(1)).toContainText(expectedValue);
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    displayedValues[notation] = expectedValue;
  }

  expect(displayedValues.scientific).not.toBe(displayedValues.standard);
});
