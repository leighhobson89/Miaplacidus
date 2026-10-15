import { LOCALE_IDS } from "../../../src/content/ids";
import { economyAutobuyerName } from "../../../src/i18n/economyAutobuyerNameMessages";
import { economyLabel } from "../../../src/i18n/economyMessages";
import type { Locator } from "@playwright/test";
import { dismissTutorialOfferIfPresent, expect, test } from "../_harness/fixtures";
import { startEconomyFixture } from "../_harness/economyFixtures";
import { setGameLocale } from "../_harness/settings-controls";

async function openIfClosed(details: Locator): Promise<void> {
  if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open))) {
    await details.locator("summary").click();
  }
}

test("Resource and Compound autobuyer add-rate copy follows the selected locale @phase7-locale @economy", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startEconomyFixture(page, "full");
  await dismissTutorialOfferIfPresent(page);

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    await page.locator("#tab-resources-hydrogen").click();
    const hydrogen = page.locator("#panel-resources-hydrogen");
    const hydrogenAutobuyers = hydrogen.locator("details.hydrogen-autobuyer-section");
    await openIfClosed(hydrogenAutobuyers);
    const resourceSummary = hydrogen.locator("#resource-hydrogen-autobuyer-2-summary");
    await expect(resourceSummary).toContainText(economyAutobuyerName(locale, "hydrogen", 2));
    await expect(resourceSummary).toContainText(
      `${economyLabel(locale, "buyTier")} 2: ${economyLabel(locale, "quantity")}: 0`,
    );
    await expect(resourceSummary).toContainText(economyLabel(locale, "perSecondShort"));
    await expect(
      resourceSummary.locator("..").locator("button.text-button").first(),
    ).toContainText(economyLabel(locale, "buy"));

    await page.locator("#tab-compounds").click();
    await page.locator("#tab-compounds-diesel").click();
    const diesel = page.locator('#panel-compounds-diesel [data-compound-id="diesel"]');
    const compoundAutobuyers = diesel.locator("details.compound-autobuyer-section");
    await openIfClosed(compoundAutobuyers);
    const compoundSummary = diesel.locator("#compound-diesel-autobuyer-1-summary");
    await expect(compoundSummary).toContainText(economyAutobuyerName(locale, "diesel", 1));
    await expect(compoundSummary).toContainText(
      `${economyLabel(locale, "buyTier")} 1: ${economyLabel(locale, "quantity")}: 0`,
    );
    await expect(compoundSummary).toContainText(economyLabel(locale, "perSecondShort"));
    await expect(
      compoundSummary.locator("..").locator("button.text-button").first(),
    ).toContainText(economyLabel(locale, "buy"));
  }
});
