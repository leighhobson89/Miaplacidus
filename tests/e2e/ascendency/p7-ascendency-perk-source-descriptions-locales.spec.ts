import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { ASCENDENCY_PERKS } from "../../../src/content/ascendency";
import { LOCALE_IDS } from "../../../src/content/ids";
import { metaPerkCopy } from "../../../src/i18n/metaMessages";

const SOURCE_PERKS = [
  ["littleBagOfHydrogen", "buffLittleBagOfHydrogenContent1"],
  ["nonExhaustiveResources", "buffNonExhaustiveResourcesContent1"],
  ["efficientStorage", "buffEfficientStorageContent1"],
  ["smartAutoBuyers", "buffSmartAutoBuyersContent1"],
  ["jumpstartResearch", "buffJumpstartResearchContent1"],
  ["optimizedPowerGrids", "buffOptimizedPowerGridsContent1"],
  ["nanoBrokers", "buffNanoBrokersContent1"],
  ["roboticResearchAutomation", "buffRoboticResearchAutomationContent1"],
  ["fasterAsteroidScan", "buffFasterAsteroidScanContent1"],
  ["deeperStarStudy", "buffDeeperStarStudyContent1"],
  ["asteroidScannerBoost", "buffAsteroidScannerBoostContent1"],
  ["rocketFuelOptimization", "buffRocketFuelOptimizationContent1"],
  ["enhancedMining", "buffEnhancedMiningContent1"],
  ["quantumEngines", "buffQuantumEnginesContent1"],
  ["autoSpaceTelescope", "buffAutoSpaceTelescopeContent1"],
  ["bulkPurchasing", "buffBulkPurchasingContent1"],
] as const;

test("P7 Ascendency perk source descriptions render for all six locales", async ({ page }) => {
  expect(ASCENDENCY_PERKS.map(({ id }) => id)).toEqual(SOURCE_PERKS.map(([id]) => id));

  await startMetaFixture(page, "meta-rebirth-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-ascendency-perks").click();
  const pane = page.getByTestId("ascendency-pane");

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

    for (const [perkId, sourceKey] of SOURCE_PERKS) {
      const description = metaPerkCopy(locale, perkId)[1];
      expect(description, `${locale}/${sourceKey}`).not.toBe("");
      const card = pane.locator(`[data-perk-id="${perkId}"]`);
      await expect(card.locator(".card-copy p")).toHaveText(description);
      await expect(card.locator(".card-copy p")).toBeVisible();
    }
  }
});
