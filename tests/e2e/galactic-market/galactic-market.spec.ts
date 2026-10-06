import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

test("previews and settles an exact Galactic Market trade", async ({ page }, testInfo) => {
  await startMetaFixture(page, "meta-market-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Galactic Market" }).click();
  const market = page.getByRole("region", { name: "Galactic Market" });
  await market.getByLabel("You give").selectOption("hydrogen");
  await market.getByLabel("You receive").selectOption("helium");
  await market.getByLabel("Quantity to trade").fill("10");
  await expect(market.getByText(/You receive:\s*18 Helium/)).toBeVisible();
  await market.getByRole("button", { name: "Confirm trade", exact: true }).click();

  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.goods.hydrogen.quantity).toBe(90);
  expect(state.run.goods.helium.quantity).toBe(18);
  expect(state.permanent.galacticMarket.history).toHaveLength(1);
  await expect(market.getByRole("listitem")).toContainText("10 Hydrogen");

  const apBeforeSale = state.permanent.ascendencyPoints;
  await market.getByLabel("AP to sell").selectOption("10");
  await market.getByRole("button", { name: "Sell AP for cash", exact: true }).click();
  let marketState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(marketState.permanent.ascendencyPoints).toBe(apBeforeSale - 10 + 5);
  expect(marketState.permanent.achievements.unlockedIds).toContain("trade10APForCash");
  expect(marketState.run.cash).toBeGreaterThanOrEqual(
    state.run.cash + 10 * state.permanent.galacticMarket.apSellPrice,
  );

  await market.getByRole("button", { name: "Liquidate all assets", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm asset liquidation" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "CONFIRM LIQUIDATION" }).click();
  marketState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(marketState.permanent.ascendencyPoints).toBe(apBeforeSale - 10 + 5 + 1);
  expect(marketState.run.cash).toBe(0);
  expect(marketState.run.goods.hydrogen.quantity).toBe(0);
  expect(marketState.run.marketLiquidatedThisRun).toBe(true);
  const liquidationButton = market.getByRole("button", { name: "Liquidate all assets" });
  await expect(liquidationButton).toBeDisabled();
  await expect(liquidationButton).toHaveAttribute(
    "aria-describedby",
    "galactic-market-liquidation-reason",
  );
  await expect(page.locator("#galactic-market-liquidation-reason")).toContainText(
    "already been liquidated",
  );
  await captureVisualCheckpoint(page, testInfo, "galactic-market-trade");
});

test("disabled Galactic Market actions describe live selector reasons", async ({ page }) => {
  await startMetaFixture(page, "meta-market-action-reasons");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Galactic Market" }).click();
  const market = page.getByRole("region", { name: "Galactic Market" });
  const tradeButton = market.getByRole("button", { name: "Confirm trade", exact: true });
  const apButton = market.getByRole("button", { name: "Sell AP for cash", exact: true });
  const liquidationButton = market.getByRole("button", {
    name: "Liquidate all assets",
    exact: true,
  });
  for (const [button, reasonId] of [
    [tradeButton, "galactic-market-trade-reason"],
    [apButton, "galactic-market-ap-sale-reason"],
    [liquidationButton, "galactic-market-liquidation-reason"],
  ] as const) {
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-describedby", reasonId);
    await expect(page.locator(`#${reasonId}`)).toContainText("in lockdown");
    await expect(page.locator(`#${reasonId}`)).toContainText("reopens: 1 min");
  }

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(3_001));
  await expect(page.getByText(/in lockdown/)).toHaveCount(0);
  await market.getByLabel("You give").selectOption("hydrogen");
  await market.getByLabel("You receive").selectOption("helium");

  await market.getByLabel("Quantity to trade").fill("101");
  const tradeReason = page.locator("#galactic-market-trade-reason");
  await expect(tradeButton).toBeDisabled();
  await expect(tradeButton).toHaveAttribute("aria-describedby", "galactic-market-trade-reason");
  await expect(tradeReason).toContainText("101");
  await expect(tradeReason).toContainText("100 Hydrogen");

  await market.getByLabel("Quantity to trade").fill("10");
  await expect(tradeReason).toContainText("18 Helium");
  await expect(tradeReason).toContainText("1");
  await expect(tradeReason).toContainText("120");
  await market.getByLabel("Quantity to trade").fill("1");
  await expect(tradeReason).toContainText("2 Helium");

  await market.getByLabel("AP to sell").selectOption("10");
  const apReason = page.locator("#galactic-market-ap-sale-reason");
  await expect(apButton).toBeDisabled();
  await expect(apButton).toHaveAttribute("aria-describedby", "galactic-market-ap-sale-reason");
  await expect(apReason).toContainText("10 AP");
  await expect(apReason).toContainText("3");
  await market.getByLabel("AP to sell").selectOption("1");
  await expect(apButton).toBeEnabled();
  await expect(apReason).toHaveCount(0);
  await expect(apButton).not.toHaveAttribute("aria-describedby", /.+/);
  await apButton.click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.ascendencyPoints))
    .toBe(2);
  await market.getByLabel("AP to sell").selectOption("5");
  await expect(apButton).toBeDisabled();
  await expect(apReason).toContainText("5 AP");
  await expect(apReason).toContainText("2");

  const liquidationReason = page.locator("#galactic-market-liquidation-reason");
  await expect(liquidationButton).toBeDisabled();
  await expect(liquidationButton).toHaveAttribute(
    "aria-describedby",
    "galactic-market-liquidation-reason",
  );
  await expect(liquidationReason).toContainText("Liquidation is worth");
  await expect(liquidationReason).toContainText("needed for 1 AP");
});
