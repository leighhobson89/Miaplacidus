import { expect, test } from "../_harness/fixtures";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { galacticMarketUnitPrice, quoteGalacticTrade } from "../../../src/engine/galacticMarket";
import { marketText } from "../../../src/i18n/metaMessages";
import { saveNowFromSettings } from "../_harness/save-controls";
import { startMetaFixture } from "../_harness/meta-fixture";

test("locale switching preserves Galactic Market trade quotes and save identity @locale @p49", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-market-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-market").click();

  const market = page.getByRole("region", { name: "Galactic Market" });
  await market.getByLabel(marketText("en", "outgoing")).selectOption("hydrogen");
  await market.getByLabel(marketText("en", "incoming")).selectOption("helium");
  await market.getByLabel(marketText("en", "quantity")).fill("10");
  await saveNowFromSettings(page);

  const readInvariant = () =>
    page.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        pioneerName: state.run.pioneerName,
        locale: state.settings.locale,
        notation: state.settings.notation,
        currencyId: state.settings.currencyId,
        cash: state.run.cash,
        goods: Object.fromEntries(
          Object.entries(state.run.goods).map(([id, good]) => [
            id,
            { quantity: good.quantity, capacity: good.storageCapacity },
          ]),
        ),
        market: state.permanent.galacticMarket,
        tabIds: Array.from(document.querySelectorAll<HTMLElement>('[role="tab"][id]'))
          .map((tab) => tab.id)
          .sort(),
        selectedMainTab: document.querySelector<HTMLElement>("#tab-galaxy")?.getAttribute("aria-selected"),
        selectedMarketTab: document
          .querySelector<HTMLElement>("#tab-galactic-market")
          ?.getAttribute("aria-selected"),
        slotHeads: Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
          .filter((key): key is string => key?.startsWith("miaplacidus:v1:head:") ?? false)
          .sort(),
        lastStartedSlot: localStorage.getItem("miaplacidus:v1:lastStartedSlot"),
      };
    });

  const baseline = await readInvariant();
  expect(baseline.pioneerName).toBe("Ascendency Pioneer");
  expect(baseline.selectedMainTab).toBe("true");
  expect(baseline.selectedMarketTab).toBe("true");
  expect(baseline.slotHeads).toHaveLength(1);
  expect(baseline.lastStartedSlot).toBe(
    baseline.slotHeads[0]?.slice("miaplacidus:v1:head:".length),
  );

  for (const locale of LOCALE_IDS) {
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-game-options").click();
    await page.locator("#settings-language").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-market").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.locale).toBe(locale);
    const quote = quoteGalacticTrade(state, "hydrogen", "helium", 10);
    expect(quote).not.toBeNull();
    const hydrogenPrice = formatCurrency(
      locale,
      galacticMarketUnitPrice(state, "hydrogen"),
      state.settings.currencyId ?? "usd",
      4,
      state.settings.notation,
    );
    const heliumPrice = formatCurrency(
      locale,
      galacticMarketUnitPrice(state, "helium"),
      state.settings.currencyId ?? "usd",
      4,
      state.settings.notation,
    );
    const marketPane = page.getByRole("region", { name: marketText(locale, "heading") });
    const rates = marketPane.locator(".market-rate-detail");
    await expect(rates.nth(0)).toContainText(hydrogenPrice);
    await expect(rates.nth(1)).toContainText(heliumPrice);

    const expectedOutgoing = `${marketText(locale, "outgoing")}: ${formatNumber(
      locale,
      10,
      0,
      state.settings.notation,
    )} ${economyGoodName(locale, "hydrogen")}`;
    const expectedIncoming = `${marketText(locale, "incoming")}: ${formatNumber(
      locale,
      quote!.incomingQuantity,
      0,
      state.settings.notation,
    )} ${economyGoodName(locale, "helium")}`;
    const expectedCommission = `${marketText(locale, "commission")}: ${formatNumber(
      locale,
      quote!.commissionQuantity,
      0,
      state.settings.notation,
    )} ${economyGoodName(locale, "hydrogen")}`;
    await expect(marketPane.getByText(expectedOutgoing, { exact: true })).toBeVisible();
    await expect(marketPane.getByText(expectedIncoming, { exact: true })).toBeVisible();
    await expect(marketPane.getByText(expectedCommission, { exact: true })).toBeVisible();

    const current = await readInvariant();
    expect(current.locale, `${locale} active locale`).toBe(locale);
    expect(current.tabIds, `${locale} stable tab IDs`).toEqual(baseline.tabIds);
    expect(current.selectedMainTab, `${locale} Galactic route`).toBe("true");
    expect(current.selectedMarketTab, `${locale} Galactic Market sub-route`).toBe("true");
    expect(current.market, `${locale} market state and trade-price inputs`).toEqual(baseline.market);
    expect(current.goods, `${locale} quantities and capacities`).toEqual(baseline.goods);
    expect(current.cash, `${locale} cash balance`).toBe(baseline.cash);
    expect(current.pioneerName, `${locale} canonical save name`).toBe(baseline.pioneerName);
    expect(current.slotHeads, `${locale} save heads`).toEqual(baseline.slotHeads);
    expect(current.lastStartedSlot, `${locale} selected save slot`).toBe(baseline.lastStartedSlot);
  }

  await saveNowFromSettings(page);
  const afterSave = await readInvariant();
  expect(afterSave.slotHeads).toEqual(baseline.slotHeads);
  expect(afterSave.lastStartedSlot).toBe(baseline.lastStartedSlot);
});
