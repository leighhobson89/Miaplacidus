import { compoundAutoCreateStatus, compoundsUsingMaterial } from "../../../src/app/compoundAutoCreateStatus";
import { allocationTooltipMessages } from "../../../src/i18n/allocationTooltipMessages";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { MATERIAL_IDS, LOCALE_IDS } from "../../../src/content/ids";
import { resourceAllocationBreakdown } from "../../../src/app/resourceAllocationBreakdown";
import { formatNumber } from "../../../src/app/numberFormatting";
import type { GameState } from "../../../src/engine/state";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { setGameLocale } from "../_harness/settings-controls";

function fill(template: string, values: Readonly<Record<string, string>>): string {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.split(`{${key}}`).join(value),
    template,
  );
}

test("Resource allocation tooltip follows the selected locale @phase7-locale @economy", async ({
  page,
}) => {
  await startEconomyFixture(page, "full");
  await dismissTutorialOfferIfPresent(page);
  const initialState = (await page.evaluate(() =>
    window.miaplacidusTest!.getState(),
  )) as GameState;
  const hydrogenConsumers = compoundsUsingMaterial(initialState, "hydrogen");
  const prepared = await page.evaluate(
    ({ hydrogenCompoundIds, materialIds }) => {
      const game = window.miaplacidusTest!;
      const autoCreateChanges = hydrogenCompoundIds.map((goodId) =>
        game.dispatch({ type: "economy.autoCreate.toggle", goodId, enabled: false }),
      );
      const purchases = materialIds.map((goodId) =>
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
      return [...autoCreateChanges, ...purchases, oxygenAllocation].every(Boolean);
    },
    { hydrogenCompoundIds: hydrogenConsumers, materialIds: [...MATERIAL_IDS] },
  );
  expect(prepared).toBe(true);

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    await page.locator("#tab-resources-hydrogen").click();
    const resourcePane = page.locator("#panel-resources-hydrogen");
    const allocation = resourcePane
      .locator("details.economy-details")
      .filter({ has: page.getByTestId("allocation-cash-handle-hydrogen") });
    const cashHandle = page.getByTestId("allocation-cash-handle-hydrogen");
    const compoundHandle = page.getByTestId("allocation-compound-handle-hydrogen");
    if (!(await allocation.evaluate((element) => (element as HTMLDetailsElement).open))) {
      await allocation.locator("summary").click();
    }

    const cashPercent = Number(await cashHandle.getAttribute("aria-valuenow"));
    const compoundBoundary = Number(await compoundHandle.getAttribute("aria-valuenow"));
    const copy = allocationTooltipMessages(locale, {
      cashPercent,
      compoundPercent: Math.max(0, compoundBoundary - cashPercent),
      storagePercent: Math.max(0, 100 - compoundBoundary),
    });
    await expect(cashHandle).toHaveAttribute(
      "aria-valuetext",
      `${copy.cashHandleLabel}: ${cashPercent}%`,
    );
    await expect(compoundHandle).toHaveAttribute(
      "aria-valuetext",
      `${copy.compoundHandleLabel}: ${Math.max(0, compoundBoundary - cashPercent)}%`,
    );

    await page.getByTestId("resource-hydrogen-allocation-tooltip-trigger").click();
    const tooltip = page.getByTestId("resource-hydrogen-allocation-tooltip");
    await expect(tooltip).toBeVisible();
    for (const text of [
      copy.sliderHeading,
      copy.introduction,
      copy.storage,
      copy.cash,
      copy.compounds,
      copy.cashHandle,
      copy.cashOff,
      copy.compoundHandle,
      copy.compoundFallback,
      copy.breakdownHint,
    ]) {
      await expect(tooltip).toContainText(text);
    }
    const hydrogenState = (await page.evaluate(() =>
      window.miaplacidusTest!.getState(),
    )) as GameState;
    const hydrogenBreakdown = resourceAllocationBreakdown(hydrogenState, "hydrogen");
    expect(hydrogenBreakdown).not.toBeNull();
    const hydrogenOffRate =
      ((hydrogenBreakdown?.allocatable ?? 0) * hydrogenState.run.economy.resourceAllocation.hydrogen.compoundShare) /
      100;
    const hydrogenOffText = fill(copy.compoundOff, {
      compounds: hydrogenConsumers
        .map((compoundId) => economyGoodName(locale, compoundId))
        .join(", "),
      rate: `${formatNumber(locale, hydrogenOffRate, 2, hydrogenState.settings.notation)} ${economyLabel(locale, "perSecond")}`,
    });
    await expect(page.getByTestId("allocation-tooltip-compound-off-hydrogen")).toHaveText(
      hydrogenOffText,
    );
    await expect(allocation.locator("summary")).toContainText(economyLabel(locale, "allocation"));

    await page.locator("#tab-resources-silicon").click();
    const siliconPane = page.locator("#panel-resources-silicon");
    const siliconAllocation = siliconPane
      .locator("details.economy-details")
      .filter({ has: page.getByTestId("allocation-cash-handle-silicon") });
    if (!(await siliconAllocation.evaluate((element) => (element as HTMLDetailsElement).open))) {
      await siliconAllocation.locator("summary").click();
    }
    await page.getByTestId("resource-silicon-allocation-tooltip-trigger").click();
    const siliconTooltip = page.getByTestId("resource-silicon-allocation-tooltip");
    await expect(siliconTooltip).toBeVisible();
    const siliconState = (await page.evaluate(() =>
      window.miaplacidusTest!.getState(),
    )) as GameState;
    const siliconCopy = allocationTooltipMessages(locale, {
      cashPercent: siliconState.run.economy.resourceAllocation.silicon.cashShare,
      compoundPercent: siliconState.run.economy.resourceAllocation.silicon.compoundShare,
      storagePercent:
        100 -
        siliconState.run.economy.resourceAllocation.silicon.cashShare -
        siliconState.run.economy.resourceAllocation.silicon.compoundShare,
    });
    const throttleRows = compoundsUsingMaterial(siliconState, "silicon")
      .filter((compoundId) => siliconState.run.economy.autoCreateEnabled[compoundId])
      .flatMap((compoundId) => {
        const throttledBy = compoundAutoCreateStatus(siliconState, compoundId).throttledBy;
        if (!throttledBy || throttledBy === "silicon") return [];
        return [
          fill(siliconCopy.compoundThrottled, {
            compound: economyGoodName(locale, compoundId),
            resource: economyGoodName(locale, throttledBy),
          }),
        ];
      });
    expect(throttleRows.length).toBeGreaterThan(0);
    for (const row of throttleRows) await expect(siliconTooltip).toContainText(row);
    await expect(siliconTooltip).toContainText(siliconCopy.breakdownHint);
  }
});
