import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setGameLocale } from "../_harness/settings-controls";
import { LOCALE_IDS } from "../../../src/content/ids";
import { metaText } from "../../../src/i18n/metaMessages";

test("routes Cosmic Forge Rebirth row description in all six locales @p7-localization @galactic", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-galactic-identity-matrix");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-rebirth").click();

  const trigger = page.getByTestId("rebirth-action-source-help-trigger");
  const tooltip = page.getByTestId("rebirth-action-source-help");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(page, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const expectedCopy = metaText(locale, "rebirthSourceHelp").trim();
    expect(expectedCopy, `${locale} Rebirth source help is populated`).not.toBe("");
    await expect(trigger).toHaveAttribute("aria-describedby", "rebirth-action-source-help");
    await trigger.focus();
    await expect(tooltip).toHaveAttribute("role", "tooltip");
    await expect(tooltip).toHaveText(expectedCopy);
    await expect(tooltip).toBeVisible();
  }
});
