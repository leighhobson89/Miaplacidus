import { displayCurrency } from "../../../src/engine/precision";
import type { GameState } from "../../../src/engine/state";
import { MATERIAL_IDS, LOCALE_IDS } from "../../../src/content/ids";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { resourceAllocationBreakdown } from "../../../src/app/resourceAllocationBreakdown";
import { resourceAllocationBreakdownCopy } from "../../../src/i18n/resourceAllocationBreakdownMessages";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";

function fill(template: string, values: Readonly<Record<string, string>>): string {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.split(`{${key}}`).join(value),
    template,
  );
}

test("Resource production allocation breakdown follows all six locales @phase7-locale @economy", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startEconomyFixture(page, "full");
  await dismissTutorialOfferIfPresent(page);

  const prepared = await page.evaluate((goodIds) => {
    const game = window.miaplacidusTest!;
    game.dispatch({ type: "clock.pause" });
    const purchases = goodIds.map((goodId) =>
      goodId === "hydrogen"
        ? game.dispatch({ type: "hydrogen.autobuyer.purchase" })
        : game.dispatch({ type: "economy.autobuyer.purchase", goodId, tier: 1 }),
    );
    const oxygenAllocation = game.dispatch({
      type: "economy.allocation.set",
      goodId: "oxygen",
      cashShare: 25,
      compoundShare: 0,
      enabled: true,
    });
    return [...purchases, oxygenAllocation].every(Boolean);
  }, [...MATERIAL_IDS]);
  expect(prepared).toBe(true);

  for (const locale of LOCALE_IDS) {
    const localeChanged = await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    expect(localeChanged).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    for (const goodId of MATERIAL_IDS) {
      await page.locator(`#tab-resources-${goodId}`).click();
      const trigger = page.getByTestId(`resource-${goodId}-production-breakdown-trigger`);
      await expect(trigger).toBeVisible();
      await trigger.click();

      const tooltip = page.getByTestId(`resource-${goodId}-production-breakdown`);
      await expect(tooltip).toBeVisible();
      const state = (await page.evaluate(() =>
        window.miaplacidusTest!.getState(),
      )) as GameState;
      const breakdown = resourceAllocationBreakdown(state, goodId);
      expect(breakdown).not.toBeNull();
      const current = breakdown!;
      const copy = resourceAllocationBreakdownCopy(locale);
      const rate = (value: number) =>
        `${formatNumber(locale, value, 2, state.settings.notation)} ${economyLabel(locale, "perSecond")}`;
      const currencyRate = `${formatCurrency(
        locale,
        Number(displayCurrency(current.autoSellIncome)),
        state.settings.currencyId ?? "usd",
        2,
        state.settings.notation,
      )} ${economyLabel(locale, "perSecond")}`;

      if (goodId === "silicon") {
        expect(current.soldForCash).toBeGreaterThan(0);
        expect(current.compoundCeiling).toBeGreaterThan(0);
        expect(current.compoundDraws.length).toBeGreaterThan(0);
        expect(current.unusedCompoundShare).toBeGreaterThan(0);
        expect(current.autoSellIncome).toBeGreaterThan(0);
      }

      await expect(tooltip.locator("strong")).toHaveText(copy.heading);
      await expect(page.getByTestId(`resource-${goodId}-breakdown-allocatable`)).toHaveText(
        fill(copy.allocatable, { rate: rate(current.allocatable) }),
      );
      if (current.soldForCash > 0) {
        await expect(page.getByTestId(`resource-${goodId}-breakdown-cash`)).toHaveText(
          fill(copy.soldForCash, { rate: rate(current.soldForCash) }),
        );
      }
      if (current.compoundCeiling > 0) {
        await expect(page.getByTestId(`resource-${goodId}-breakdown-compound-ceiling`)).toHaveText(
          fill(copy.compoundCeiling, { rate: rate(current.compoundCeiling) }),
        );
      }
      for (const draw of current.compoundDraws) {
        const compoundRow = page.getByTestId(
          `resource-${goodId}-breakdown-compound-${draw.compoundId}`,
        );
        await expect(compoundRow).toHaveText(
          fill(copy.divertedToCreate, {
            compound: economyGoodName(locale, draw.compoundId),
            rate: rate(draw.rate),
          }),
        );
      }
      if (current.unusedCompoundShare > 0) {
        await expect(page.getByTestId(`resource-${goodId}-breakdown-unused-compound-share`)).toHaveText(
          fill(copy.unusedCompoundShare, { rate: rate(current.unusedCompoundShare) }),
        );
      }
      await expect(page.getByTestId(`resource-${goodId}-breakdown-storage`)).toHaveText(
        fill(copy.storage, { rate: rate(current.storage) }),
      );
      if (current.autoSellIncome > 0) {
        await expect(page.getByTestId(`resource-${goodId}-breakdown-autosell-income`)).toHaveText(
          fill(copy.autoSellIncome, { cashRate: currencyRate }),
        );
      }
    }
  }
});
