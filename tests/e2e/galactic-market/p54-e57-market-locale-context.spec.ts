import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatNumber } from "../../../src/app/numberFormatting";
import { ECONOMIC_GOOD_IDS, LOCALE_IDS, type EconomicGoodId } from "../../../src/content/ids";
import {
  galacticMarketUnitPrice,
  marketLiquidationPreview,
  quoteGalacticTrade,
} from "../../../src/engine/galacticMarket";
import { displayCurrency } from "../../../src/engine/precision";
import { marketText } from "../../../src/i18n/metaMessages";

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test("P-54 E-57 all Market rows and Rebirth liquidation dialog fit at phone widths in all locales @p54-e57", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(VIEWPORTS[0]);
  await startMetaFixture(page, "meta-galactic-identity-matrix");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-market").click();

  const market = page.locator(".galactic-market-pane");
  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const copy = (key: Parameters<typeof marketText>[1]) => marketText(locale, key);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const unlockedGoods = ECONOMIC_GOOD_IDS.filter(
      (goodId) =>
        state.run.unlockedResources.includes(
          goodId as (typeof state.run.unlockedResources)[number],
        ) ||
        state.run.economy.unlockedCompounds.includes(
          goodId as (typeof state.run.economy.unlockedCompounds)[number],
        ),
    );
    expect(unlockedGoods.length, "fixture should expose the full Market catalogue").toBeGreaterThan(
      2,
    );
    const goodPairs = unlockedGoods.map((outgoing, index) => ({
      outgoing,
      incoming: unlockedGoods[(index + 1) % unlockedGoods.length]!,
    }));
    const liquidation = marketLiquidationPreview(state);
    const expectedCash = formatCurrency(
      locale,
      Number(displayCurrency(liquidation.value)),
      state.settings.currencyId ?? "usd",
      0,
      state.settings.notation,
    );
    const apPrice = state.permanent.galacticMarket.apSellPrice;
    const expectedApPrice = formatCurrency(
      locale,
      Number(displayCurrency(apPrice)),
      state.settings.currencyId ?? "usd",
      0,
      state.settings.notation,
    );

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.locator("#tab-galactic-market").click();
      await expect(
        market.getByRole("heading", { name: copy("heading"), exact: true }),
      ).toBeVisible();

      for (const { outgoing, incoming } of goodPairs) {
        await market.getByLabel(copy("tradeRow")).selectOption(outgoing);
        await market.getByLabel(copy("tradeFor")).selectOption(incoming);
        await market.getByLabel(copy("quantity")).fill("10");
        const quote = quoteGalacticTrade(state, outgoing, incoming, 10);
        expect(quote, `${outgoing} -> ${incoming}`).not.toBeNull();

        const card = market.locator(".upgrade-card").first();
        await expect(market.getByLabel(copy("tradeRow"))).toHaveValue(outgoing);
        await expect(market.getByLabel(copy("tradeFor"))).toHaveValue(incoming);
        await expect(market.getByLabel(copy("quantity"))).toHaveValue("10");
        const outgoingSummary = `${copy("summaryOutgoing")} ${formatNumber(locale, 10, 0, state.settings.notation)} ${economyGoodName(locale, outgoing)}`;
        const incomingSummary = `${copy("summaryIncoming")} ${formatNumber(locale, quote!.incomingQuantity, 0, state.settings.notation)} ${economyGoodName(locale, incoming)}`;
        await expect(card.locator("p").filter({ hasText: outgoingSummary })).toHaveText(
          outgoingSummary,
        );
        await expect(card.locator("p").filter({ hasText: incomingSummary })).toHaveText(
          incomingSummary,
        );
        await expect(
          card
            .locator("p")
            .filter({ hasText: `${copy("commission")}:` })
            .last(),
        ).toHaveText(
          `${copy("commission")}: ${formatNumber(locale, quote!.commissionQuantity, 0, state.settings.notation)} ${economyGoodName(locale, outgoing)}`,
        );

        const rateRows = card.locator(".market-rate-detail");
        await expect(rateRows).toHaveCount(2);
        for (const goodId of [outgoing, incoming]) {
          const row = rateRows.filter({ hasText: economyGoodName(locale, goodId) });
          const marketGood = state.permanent.galacticMarket.goods[goodId];
          const unitValue = formatCurrency(
            locale,
            galacticMarketUnitPrice(state, goodId),
            state.settings.currencyId ?? "usd",
            4,
            state.settings.notation,
          );
          await expect(row).toHaveCount(1);
          await expect(row).toContainText(copy("adjustedValue"));
          await expect(row).toContainText(unitValue);
          await expect(row).toContainText(copy("marketBias"));
          await expect(row).toContainText(
            `${formatNumber(locale, marketGood.marketBias, 2, state.settings.notation, "always")}%`,
          );
          await expect(row).toContainText(copy("tradeVolume"));
          await expect(row).toContainText(
            formatNumber(locale, marketGood.tradeVolume, 0, state.settings.notation),
          );
        }
      }

      const apSale = market.locator(".upgrade-card").nth(1);
      await expect(apSale.locator("p").first()).toHaveText(
        `${copy("apPrice")}: ${expectedApPrice}`,
      );
      for (const amount of [1, 5, 10] as const) {
        await apSale.getByLabel(copy("sellAp")).selectOption(String(amount));
        const proceeds = formatCurrency(
          locale,
          Number(displayCurrency(amount * apPrice)),
          state.settings.currencyId ?? "usd",
          0,
          state.settings.notation,
        );
        await expect(apSale.locator("p").nth(1)).toHaveText(`${copy("cashGain")} ${proceeds}`);
      }

      await page.locator("#tab-galactic-rebirth").click();
      const rebirth = page.getByTestId("rebirth-pane");
      const liquidate = rebirth.getByRole("button", { name: copy("liquidate"), exact: true });
      await expect(liquidate).toBeEnabled();
      await liquidate.click();
      const dialog = page.getByRole("dialog", { name: copy("liquidateTitle"), exact: true });
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(copy("liquidatePrompt"));
      await expect(dialog.locator("p").nth(1)).toHaveText(
        `${copy("liquidationValue")}: ${expectedCash}`,
      );
      await expect(dialog.locator("p").nth(2)).toHaveText(
        `${copy("liquidationAp")}: ${formatNumber(locale, liquidation.ap, 0, state.settings.notation)}`,
      );
      await expect(
        dialog.getByRole("button", { name: copy("confirmLiquidation"), exact: true }),
      ).toBeVisible();

      const bounds = await page.evaluate(() => {
        const rect = (selector: string) => {
          const element = document.querySelector<HTMLElement>(selector);
          if (!element) throw new Error(`Expected visible presentation context: ${selector}`);
          const box = element.getBoundingClientRect();
          return {
            left: box.left,
            right: box.right,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
          };
        };
        return {
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          market: rect(".galactic-market-pane"),
          rebirth: rect('[data-testid="rebirth-pane"]'),
          cards: Array.from(
            document.querySelectorAll<HTMLElement>(".galactic-market-pane .upgrade-card"),
          ).map((card) => {
            const box = card.getBoundingClientRect();
            return {
              left: box.left,
              right: box.right,
              scrollWidth: card.scrollWidth,
              clientWidth: card.clientWidth,
            };
          }),
          dialog: rect(".rebirth-liquidation-card dialog:modal"),
        };
      });
      expect(bounds.document, `${locale}/${viewport.width}px document`).toBeLessThanOrEqual(
        bounds.viewport,
      );
      for (const [label, box] of Object.entries({
        market: bounds.market,
        rebirth: bounds.rebirth,
        dialog: bounds.dialog,
      })) {
        expect(box.left, `${locale}/${viewport.width}px ${label} left`).toBeGreaterThanOrEqual(-1);
        expect(box.right, `${locale}/${viewport.width}px ${label} right`).toBeLessThanOrEqual(
          bounds.viewport + 1,
        );
        expect(
          box.scrollWidth,
          `${locale}/${viewport.width}px ${label} text overflow`,
        ).toBeLessThanOrEqual(box.clientWidth + 1);
      }
      for (const [index, box] of bounds.cards.entries()) {
        expect(box.left, `${locale}/${viewport.width}px card ${index} left`).toBeGreaterThanOrEqual(
          -1,
        );
        expect(box.right, `${locale}/${viewport.width}px card ${index} right`).toBeLessThanOrEqual(
          bounds.viewport + 1,
        );
        expect(
          box.scrollWidth,
          `${locale}/${viewport.width}px card ${index} overflow`,
        ).toBeLessThanOrEqual(box.clientWidth + 1);
      }

      if (locale === "fr" && viewport.width === 320) {
        const name = "p54-e57-rebirth-fr-320-dialog.png";
        const path = testInfo.outputPath(name);
        await page.screenshot({ path, fullPage: true, animations: "disabled" });
        await testInfo.attach(name, { path, contentType: "image/png" });
      }
      await dialog.getByRole("button", { name: copy("cancel"), exact: true }).click();
      await expect(dialog).toBeHidden();
    }
  }
});
