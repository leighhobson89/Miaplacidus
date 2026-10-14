import { expect, test } from "../_harness/fixtures";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { displayCurrency } from "../../../src/engine/precision";
import { selectEconomyAction } from "../../../src/engine/selectors";
import type { GameState } from "../../../src/engine/state";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { economyLabel, formatEconomyMessage } from "../../../src/i18n/economyMessages";
import { topStatusText } from "../../../src/i18n/topStatusMessages";

async function startFixture(
  page: import("@playwright/test").Page,
  fixture: "bulk-energy" | "power-deficit",
  locale: LocaleId,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
    for (const key of keys) if (key?.startsWith(prefix)) localStorage.removeItem(key);
  });
  await page.goto(`/?testSeed=20261010&testLocale=${locale}&economyFixture=${fixture}`);
  await page.locator("#pioneer-name").fill(`P-45 Energy ${locale}`);
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("Energy disabled purchase reason stays localized after dynamic repricing in all locales @p45-energy-locales", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const locale of LOCALE_IDS) {
    for (const width of [320, 390]) {
      await startFixture(page, "bulk-energy", locale);
      await page.setViewportSize({ width, height: 844 });
      await page.locator("#tab-energy").click();
      await page.locator("#tab-energy-power").click();
      const card = page.locator('[data-building-id="powerPlant1"]');
      const buyMax = card.getByRole("button", {
        name: economyLabel(locale, "buyMax"),
        exact: true,
      });
      await expect(buyMax).toBeEnabled();
      await buyMax.click();
      await expect(buyMax).toBeDisabled();

      const state = (await page.evaluate(() => window.miaplacidusTest!.getState())) as GameState;
      const purchase = selectEconomyAction(state, {
        type: "economy.building.purchase",
        buildingId: "powerPlant1",
      });
      expect(purchase.enabled).toBe(false);
      expect(purchase.failure?.code).toBe("insufficient-cash");
      const requiredCash = formatCurrency(
        locale,
        Number(displayCurrency(purchase.failure!.required)),
        state.settings.currencyId ?? "usd",
        2,
        state.settings.notation,
      );
      const expectedReason = formatEconomyMessage(locale, "needCashAmount", {
        amount: requiredCash,
      });
      const reason = page.locator("#energy-building-powerPlant1-bulk-reason");
      await expect(reason).toHaveText(expectedReason);
      await expect(buyMax).toHaveAttribute(
        "aria-describedby",
        /energy-building-powerPlant1-bulk-reason/,
      );
      await expect(page.locator('dialog[open], [role="dialog"]:visible')).toHaveCount(0);
    }
  }
});

test("Energy grid-trip result stays localized when the Energy page is revisited @p45-energy-locales", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const locale of LOCALE_IDS) {
    await startFixture(page, "power-deficit", locale);
    await page.locator("#tab-resources-hydrogen").click();
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(20_000));
    const announcement = page.getByTestId("power-trip-announcement");
    await expect(announcement).toHaveText(topStatusText(locale, "tripped"));
    await expect(page.getByTestId("top-stat-power")).toContainText(
      topStatusText(locale, "trippedShort"),
    );
    await page.locator("#tab-energy").click();
    await page.locator("#tab-energy-summary").click();
    await expect(
      page
        .locator("#panel-energy")
        .getByRole("alert")
        .filter({ hasText: economyLabel(locale, "trip") }),
    ).toBeVisible();
  }
});
