import { expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { formatCurrency } from "../../../src/app/currencyFormatting";
import { formatNumber } from "../../../src/app/numberFormatting";
import { formatDuration } from "../../../src/app/timeFormatting";
import { MATERIAL_IDS } from "../../../src/content/ids";
import { setNumberNotation } from "../_harness/settings-controls";

test("P-41 formats Statistics totals in all notations without narrow overflow @p41-statistics-notation @notation @statistics", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await startEconomyFixture(page, "notation-coverage");

  const initialState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const totalResources = MATERIAL_IDS.reduce(
    (total, id) => total + initialState.run.goods[id].quantity,
    0,
  );
  expect(totalResources).toBeGreaterThan(999);
  expect(initialState.statistics.lifetimeCashEarned).toBeGreaterThan(999_999);

  const renderedCash: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.getByRole("tab", { name: "Settings" }).click();
    await page.locator("#tab-settings-statistics").click();

    const statistics = page.getByTestId("settings-statistics");
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const resourceStock = statistics.locator('[data-statistic-id="resourceStock"] dd');
    const lifetimeCash = statistics.locator('[data-statistic-id="lifetimeCash"] dd');
    const activeTime = statistics.locator('[data-statistic-id="activeTime"] dd');

    await expect(resourceStock).toHaveText(formatNumber("en", totalResources, 0, notation));
    const expectedCash = formatCurrency(
      "en",
      state.statistics.lifetimeCashEarned,
      state.settings.currencyId ?? "usd",
      2,
      notation,
    );
    await expect(lifetimeCash).toHaveText(expectedCash);
    renderedCash[notation] = expectedCash;
    await expect(activeTime).toHaveText(
      formatDuration("en", state.statistics.lifetimeActiveMs, notation),
    );

    const layout = await statistics.evaluate((pane) => {
      const overflowingCards = Array.from(pane.querySelectorAll<HTMLElement>(".settings-stat-card"))
        .filter((card) => card.scrollWidth > card.clientWidth + 1)
        .map((card) => card.dataset.statisticId ?? card.textContent?.trim() ?? "unknown");
      return {
        viewportWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        paneWidth: pane.clientWidth,
        paneScrollWidth: pane.scrollWidth,
        overflowingCards,
      };
    });
    expect(layout.documentWidth, `${notation} document width`).toBeLessThanOrEqual(
      layout.viewportWidth,
    );
    expect(layout.paneScrollWidth, `${notation} Statistics width`).toBeLessThanOrEqual(
      layout.paneWidth,
    );
    expect(layout.overflowingCards, `${notation} Statistics cards`).toEqual([]);
  }

  expect(renderedCash.condensed).not.toBe(renderedCash.standard);
  expect(renderedCash.standard).not.toBe(renderedCash.scientific);
});
