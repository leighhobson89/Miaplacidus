import { expect, test } from "../_harness/fixtures";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { TELESCOPE_COST } from "../../../src/content/space";
import { translate } from "../../../src/i18n/messages";
import { spaceText } from "../../../src/i18n/spaceMessages";

async function startTelescopeShortfallFixture(
  page: import("@playwright/test").Page,
  locale: LocaleId,
): Promise<void> {
  await page.addInitScript(() => {
    const prefix = "miaplacidus:v1:";
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter((key): key is string => key?.startsWith(prefix) ?? false);
    for (const key of keys) localStorage.removeItem(key);
  });
  await page.goto(
    `/?testSeed=20261003&testLocale=${locale}&economyFixture=space-telescope-shortfall`,
  );
  await page.getByLabel(translate(locale, "app.pioneer")).fill("Space Telescope Shortfall Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(window.miaplacidusTest))).toBe(true);
}

test("Space Telescope build exposes the localized one-Iron shortfall @p06-telescope-affordability", async ({
  page,
}) => {
  const ironRequirement = TELESCOPE_COST.materials.find(({ goodId }) => goodId === "iron")!.amount;

  for (const locale of LOCALE_IDS) {
    await startTelescopeShortfallFixture(page, locale);
    await page.getByRole("tab", { name: translate(locale, "tab.spaceMining") }).click();
    await page.locator("#tab-space-mining-telescope").click();

    const pane = page.getByTestId("space-mining-pane");
    const telescope = pane.getByRole("region", { name: spaceText(locale, "telescopeTitle") });
    const buildButton = telescope.getByRole("button", {
      name: spaceText(locale, "telescopeBuild"),
      exact: true,
    });
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.run.goods.iron.quantity).toBe(ironRequirement - 1);

    const expectedQuote = [
      formatCurrency(
        locale,
        TELESCOPE_COST.cash,
        state.settings.currencyId ?? "usd",
        0,
        state.settings.notation,
      ),
      ...TELESCOPE_COST.materials.map(
        ({ goodId, amount }) =>
          `${formatNumber(locale, amount, 0, state.settings.notation)} ${economyGoodName(locale, goodId)}`,
      ),
    ];
    await expect(
      telescope
        .getByRole("list", { name: spaceText(locale, "telescopeCost") })
        .getByRole("listitem"),
    ).toHaveText(expectedQuote);
    await expect(buildButton).toBeDisabled();
    await expect(buildButton).toHaveAttribute("aria-describedby", "telescope-build-reason");
    await expect(page.locator("#telescope-build-reason")).toHaveText(
      spaceText(locale, "reasonInsufficientMaterial", {
        material: economyGoodName(locale, "iron"),
        amount: formatNumber(locale, ironRequirement, 0, state.settings.notation),
      }),
    );
  }
});
