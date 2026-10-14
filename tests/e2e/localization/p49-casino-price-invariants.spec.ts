import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";
import { formatNumber } from "../../../src/app/numberFormatting";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { ECONOMIC_GOOD_IDS, LOCALE_IDS } from "../../../src/content/ids";
import { casinoText, casinoVoidSeerCurrency } from "../../../src/i18n/casinoMessages";
import { selectCasinoEntryCost, selectCasinoPointPurchase } from "../../../src/engine/selectors";

test("live locale changes preserve Casino payment and game entry quotes @locale @p49", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startMetaFixture(page, "meta-casino-ready");
  await saveNowFromSettings(page);
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();

  const readIdentity = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        pioneerName: state.run.pioneerName,
        rebirthCount: state.permanent.rebirthCount,
        casino: state.permanent.galacticCasino,
        casinoStats: state.run.casinoStats,
        tabIds: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"][id]'))
          .map((tab) => tab.id)
          .sort(),
        slotHeads: Array.from({ length: localStorage.length }, (_, index) =>
          localStorage.key(index),
        )
          .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
          .sort(),
        lastStartedSlot: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
      };
    });

  const baselineIdentity = await readIdentity();
  expect(baselineIdentity.pioneerName).toBe("Ascendency Pioneer");
  expect(baselineIdentity.rebirthCount).toBe(1);
  expect(baselineIdentity.slotHeads).toHaveLength(1);
  expect(baselineIdentity.lastStartedSlot).toBe(
    baselineIdentity.slotHeads[0]?.slice("miaplacidus:v1:head:".length),
  );

  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(page, locale);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-casino").click();
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const casino = page.getByTestId("galactic-casino-pane");
    const paymentSelect = casino.getByLabel(casinoText(locale, "payment"));
    const amountInput = casino.getByLabel(casinoText(locale, "amount"));
    await amountInput.fill("10");
    const costLine = casino.locator("article.upgrade-card").first().locator("p").first();

    for (const goodId of ["cash", ...ECONOMIC_GOOD_IDS] as const) {
      await paymentSelect.selectOption(goodId);
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const plan = selectCasinoPointPurchase(state, goodId, 10);
      const label = goodId === "cash" ? casinoText(locale, "cash") : economyGoodName(locale, goodId);
      const number = (value: number) =>
        formatNumber(locale, value, 0, state.settings.notation);
      const expected = `${casinoText(locale, "cost")}: ${number(plan.cost)} ${label} \u00b7 ${number(plan.available)} ${casinoText(locale, "available")}`;
      await expect(costLine, `${locale} ${goodId} Casino point quote`).toHaveText(expected);
    }

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const number = (value: number) => formatNumber(locale, value, 0, state.settings.notation);
    const preview = (key: "entryCostPreview" | "currentStakePreview" | "doubledWinPreview", value: number) =>
      casinoText(locale, key)
        .replace("{amount}", number(value))
        .replace(" CP", ` ${casinoText(locale, "wheelCurrencyCp")}`);
    await casino.getByLabel(casinoText(locale, "stake")).fill("10");
    await expect(casino.getByTestId("casino-don-stake-preview")).toHaveText(
      preview("currentStakePreview", 10),
    );
    await expect(casino.getByTestId("casino-don-win-preview")).toHaveText(
      preview("doubledWinPreview", 20),
    );
    await expect(casino.getByTestId("casino-wheel-entry-cost")).toHaveText(
      preview("entryCostPreview", selectCasinoEntryCost({ type: "casino.wheel.spin" })!),
    );
    await expect(casino.getByTestId("casino-hilo-entry-cost")).toHaveText(
      preview("entryCostPreview", selectCasinoEntryCost({ type: "casino.higher-lower.start" })!),
    );

    const voidTier = casino.getByLabel(casinoText(locale, "tier"));
    const reveal = casino.getByTestId("casino-void-seer-play");
    for (const tier of [1, 2, 3] as const) {
      await voidTier.selectOption(String(tier));
      const cost = selectCasinoEntryCost({ type: "casino.void-seer.play", tier })!;
      await expect(reveal).toHaveText(
        `${casinoText(locale, "voidSeerSpin")} \u00b7 ${number(cost)} ${casinoVoidSeerCurrency(locale)}`,
      );
    }

    const currentIdentity = await readIdentity();
    expect(currentIdentity.pioneerName, `${locale} pioneer`).toBe(baselineIdentity.pioneerName);
    expect(currentIdentity.rebirthCount, `${locale} run progression`).toBe(baselineIdentity.rebirthCount);
    expect(currentIdentity.casino, `${locale} Casino state`).toEqual(baselineIdentity.casino);
    expect(currentIdentity.casinoStats, `${locale} run Casino stats`).toEqual(
      baselineIdentity.casinoStats,
    );
    expect(currentIdentity.tabIds, `${locale} tab identities`).toEqual(baselineIdentity.tabIds);
    expect(currentIdentity.slotHeads, `${locale} save slot`).toEqual(baselineIdentity.slotHeads);
    expect(currentIdentity.lastStartedSlot, `${locale} active save`).toBe(
      baselineIdentity.lastStartedSlot,
    );
  }
});
