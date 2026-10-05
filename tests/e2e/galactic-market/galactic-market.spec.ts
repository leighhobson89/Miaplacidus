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
  expect(marketState.permanent.ascendencyPoints).toBe(apBeforeSale - 10);
  expect(marketState.run.cash).toBe(11_000_000);

  await market.getByRole("button", { name: "Liquidate all assets", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm asset liquidation" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "CONFIRM LIQUIDATION" }).click();
  marketState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(marketState.permanent.ascendencyPoints).toBe(apBeforeSale - 9);
  expect(marketState.run.cash).toBe(0);
  expect(marketState.run.goods.hydrogen.quantity).toBe(0);
  expect(marketState.run.marketLiquidatedThisRun).toBe(true);
  await captureVisualCheckpoint(page, testInfo, "galactic-market-trade");
});
