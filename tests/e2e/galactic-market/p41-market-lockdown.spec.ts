import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatNumber } from "../../../src/app/numberFormatting";
import { marketFailureText, marketLockCountdownText } from "../../../src/i18n/metaMessages";

test("P-41 formats live Galactic Market lockdown reasons in every notation @p41-market-lockdown", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-market-ready");
  const accepted = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "galacticMarketLockdown",
    }),
  );
  expect(accepted).toBe(true);

  const renderedCountdowns: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Galactic" }).click();
    await page.getByRole("tab", { name: "Galactic Market" }).click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    expect(state.run.marketLockdownRemainingMs).toBeGreaterThan(0);
    const market = page.getByRole("region", { name: "Galactic Market" });
    const tradeButton = market.getByRole("button", { name: "Confirm trade", exact: true });
    const apButton = market.getByRole("button", { name: "Sell AP for cash", exact: true });
    const tradeReason = page.locator("#galactic-market-trade-reason");
    const apReason = page.locator("#galactic-market-ap-sale-reason");
    const expectedReason = `${marketFailureText("en", "market-locked")} ${marketLockCountdownText(
      "en",
      state.run.marketLockdownRemainingMs,
      (value) => formatNumber("en", value, 0, notation),
    )}`;

    await expect(tradeButton).toBeDisabled();
    await expect(tradeButton).toHaveAttribute("aria-describedby", "galactic-market-trade-reason");
    await expect(tradeReason).toHaveText(expectedReason);
    await expect(apButton).toBeDisabled();
    await expect(apButton).toHaveAttribute("aria-describedby", "galactic-market-ap-sale-reason");
    await expect(apReason).toHaveText(expectedReason);
    renderedCountdowns[notation] = expectedReason;
  }

  expect(renderedCountdowns.scientific).not.toBe(renderedCountdowns.standard);

  const before = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.marketLockdownRemainingMs,
  );
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10 * 60_000));
  const after = await page.evaluate(
    () => window.miaplacidusTest!.getState().run.marketLockdownRemainingMs,
  );
  expect(after).toBe(before - 10 * 60_000);

  const scientificReason = `${marketFailureText("en", "market-locked")} ${marketLockCountdownText(
    "en",
    after,
    (value) => formatNumber("en", value, 0, "scientific"),
  )}`;
  await expect(page.locator("#galactic-market-trade-reason")).toHaveText(scientificReason);
  await expect(page.locator("#galactic-market-ap-sale-reason")).toHaveText(scientificReason);
  expect(scientificReason).not.toBe(renderedCountdowns.scientific);
});
