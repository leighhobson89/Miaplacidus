import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

for (const locale of LOCALE_IDS) {
  test(`P-45 Black Hole charge completion notice renders in ${locale} @p45-meta-locales`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-black-hole-discovered");
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-black-hole").click();

    const copy = blackHoleText(locale);
    await page
      .getByTestId("black-hole-research")
      .getByRole("button", { name: new RegExp(copy.researchAction) })
      .click();
    await page.evaluate(() => window.miaplacidusTest!.advanceBy(300_001));

    const notice = page
      .getByTestId("notification-stack")
      .locator('[data-testid="game-notification"][data-classification="special"]')
      .filter({ hasText: copy.chargedNotification });
    await expect(notice).toHaveText(copy.chargedNotification);
    await expect(notice).toHaveClass(/notification-info/);
    await expect(page.getByRole("progressbar", { name: copy.charging, exact: true })).toHaveCount(
      0,
    );
  });
}
