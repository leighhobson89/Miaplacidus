import { createEconomyTickPlan } from "../../../src/engine/economySimulation";
import { compoundAutoCreateStatus } from "../../../src/app/compoundAutoCreateStatus";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { resourceAllocationBreakdownCopy } from "../../../src/i18n/resourceAllocationBreakdownMessages";
import { LOCALE_IDS } from "../../../src/content/ids";
import { formatNumber } from "../../../src/app/numberFormatting";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";

test("Compound production tooltip routes storage and auto-create status in every locale @phase7-locale @compounds @localization", async ({
  page,
}) => {
  await startEconomyFixture(page, "full");
  await dismissTutorialOfferIfPresent(page);
  await page.locator("#tab-compounds").click();
  await page.locator("#tab-compounds-diesel").click();

  const rate = page.getByTestId("economy-good-rate-diesel");
  const trigger = page.getByTestId("compound-diesel-production-storage-trigger");
  const tooltip = page.getByTestId("compound-diesel-production-storage");
  const line = page.getByTestId("compound-diesel-production-storage-line");
  const autoCreateLine = page.getByTestId("compound-diesel-auto-create-rate-line");
  const throttledByLine = page.getByTestId("compound-diesel-auto-create-throttled-by-line");
  await expect(rate).toBeVisible();
  await trigger.click();
  await expect(tooltip).toBeVisible();

  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const netRate = createEconomyTickPlan(state).netRatesPerSecond.diesel ?? 0;
    const signedRate = `${netRate >= 0 ? "+" : "−"}${formatNumber(
      locale,
      Math.abs(netRate),
      2,
      state.settings.notation,
    )} ${economyLabel(locale, "perSecond")}`;
    const expectedStorageLine = resourceAllocationBreakdownCopy(locale).storage
      .split("{rate}")
      .join(signedRate);

    await expect(line).toHaveText(expectedStorageLine);
    const copy = resourceAllocationBreakdownCopy(locale);
    if (state.run.economy.autoCreateEnabled.diesel) {
      const status = compoundAutoCreateStatus(state, "diesel");
      const expectedAutoCreateLine = `${copy.autoCreationLabel} ${formatNumber(
        locale,
        status.rate,
        2,
        state.settings.notation,
      )} ${economyLabel(locale, "perSecond")}`;
      await expect(autoCreateLine).toHaveText(expectedAutoCreateLine);
      if (status.throttledBy) {
        await expect(throttledByLine).toHaveText(
          copy.throttledBy.replace("{resource}", economyGoodName(locale, status.throttledBy)),
        );
        await expect(tooltip.locator("p")).toHaveCount(3);
      } else {
        await expect(throttledByLine).toHaveCount(0);
        await expect(tooltip.locator("p")).toHaveCount(2);
      }
    } else {
      await expect(autoCreateLine).toHaveCount(0);
      await expect(throttledByLine).toHaveCount(0);
      await expect(tooltip.locator("p")).toHaveCount(1);
    }
  }
});
