import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setGameLocale } from "../_harness/settings-controls";
import { LOCALE_IDS } from "../../../src/content/ids";
import { marketText } from "../../../src/i18n/metaMessages";

test("source liquidation calculation help belongs to the Rebirth action in all six locales @p7-rebirth-liquidation-source-tooltip", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-galactic-identity-matrix");
  await page.locator("#tab-galaxy").click();

  const rebirthTab = page.locator("#tab-galactic-rebirth");
  await rebirthTab.click();
  await expect(rebirthTab).toHaveAttribute("aria-selected", "true");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator(".rebirth-liquidation-card h3")).toContainText(
      marketText(locale, "liquidation"),
    );

    const trigger = page.getByTestId("rebirth-liquidation-help-trigger");
    const tooltip = page.getByTestId("rebirth-liquidation-help");
    await expect(trigger).toHaveAccessibleName(marketText(locale, "liquidationHelpLabel"));
    await trigger.focus();
    await expect(tooltip).toBeVisible();
    const calculationHelp = marketText(locale, "liquidationHelp");
    expect(calculationHelp.trim(), `${locale} liquidation formula help is populated`).not.toBe("");
    await expect(tooltip).toHaveText(calculationHelp);

    await page.locator("#tab-galactic-market").click();
    await expect(page.locator(".galactic-market-pane [data-testid='rebirth-liquidation-help']"))
      .toHaveCount(0);
    await rebirthTab.click();
  }
});
