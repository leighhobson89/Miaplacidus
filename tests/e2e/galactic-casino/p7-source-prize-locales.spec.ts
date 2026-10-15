import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatNumber } from "../../../src/app/numberFormatting";
import { casinoSpecialName, casinoText } from "../../../src/i18n/casinoMessages";

const SOURCE_DOUBLE_MATERIALS = ["titanium", "steel", "silicon", "iron", "sodium"] as const;

// Source keys: casinoPrize100Cp, casinoPrize100kResearch,
// casinoPrizeDoubleMaterial, and casinoPrizeRocketWarp.
test("Casino source Wheel prize labels route in all six locales @p7-localization @galactic-casino", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-finish-rocket-journey");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");

  const accepted = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "casino.points.buy",
      goodId: "cash",
      amount: 1,
    }),
  );
  expect(accepted).toBe(true);
  await casino.getByTestId("casino-wheel-spin").click();

  const prizeSelect = casino.getByLabel(casinoText("en", "choosePrize"));
  await expect(prizeSelect).toBeEnabled({ timeout: 6_000 });
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());

  for (const locale of LOCALE_IDS) {
    const localeAccepted = await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    expect(localeAccepted, `${locale} locale selection is accepted`).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const localizedSelect = casino.getByLabel(casinoText(locale, "choosePrize"));
    const visibleValues = await localizedSelect.locator("option").evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value),
    );
    expect(visibleValues).toContain("special_100cp");
    expect(visibleValues).toContain("special_100k_research");
    expect(visibleValues).toContain("special_rocket_warp");

    const hundredCpLabel = casinoSpecialName(locale, "special_100cp");
    const researchLabel = casinoSpecialName(
      locale,
      "special_100k_research",
      (value, digits = 0) => formatNumber(locale, value, digits, state.settings.notation),
    );
    const rocketWarpLabel = casinoSpecialName(locale, "special_rocket_warp");
    expect(hundredCpLabel, `${locale} 100 CP prize is populated`).not.toBe("");
    expect(researchLabel, `${locale} research prize is populated`).not.toBe("");
    expect(rocketWarpLabel, `${locale} Rocket Warp prize is populated`).not.toBe("");
    await expect(localizedSelect.locator('option[value="special_100cp"]')).toHaveText(
      hundredCpLabel,
    );
    await expect(localizedSelect.locator('option[value="special_100k_research"]')).toHaveText(
      researchLabel,
    );
    await expect(localizedSelect.locator('option[value="special_rocket_warp"]')).toHaveText(
      rocketWarpLabel,
    );

    for (const goodId of SOURCE_DOUBLE_MATERIALS) {
      const value = `special_double_${goodId}`;
      const localizedLabel = casinoText(locale, "doubleGood").replace(
        "{good}",
        economyGoodName(locale, goodId),
      );
      expect(localizedLabel, `${locale} ${goodId} doubled prize is populated`).not.toBe("");
      await expect(localizedSelect.locator(`option[value="${value}"]`)).toHaveText(
        localizedLabel,
      );
    }
  }
});
