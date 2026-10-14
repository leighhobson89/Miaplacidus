import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

for (const locale of LOCALE_IDS) {
  test(`Black Hole charge completion is announced in ${locale} after leaving its tab @black-hole @p20-announcements`, async ({
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

    const copy = blackHoleText(locale);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-black-hole").click();
    await page
      .getByTestId("black-hole-research")
      .locator(".space-action-help-group > .primary-button")
      .click();

    const notificationStack = page.getByTestId("notification-stack");
    await expect(notificationStack).toHaveCount(1);
    const resourcesTab = page.locator("#tab-hydrogen");
    await resourcesTab.click();
    await expect(resourcesTab).toHaveAttribute("aria-selected", "true");

    const timer = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.timers["black-hole:charge"]!,
    );
    await page.evaluate(
      (remainingMs) => window.miaplacidusTest!.advanceBy(remainingMs + 1),
      timer.durationMs - timer.elapsedMs,
    );
    await expect
      .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().run.blackHoleChargeReady))
      .toBe(true);
    await expect(resourcesTab).toHaveAttribute("aria-selected", "true");

    const notice = notificationStack
      .locator('[data-testid="game-notification"][data-classification="special"]')
      .filter({ hasText: copy.chargedNotification });
    await expect(notificationStack).toBeVisible();
    await expect(notice).toHaveText(copy.chargedNotification);
    await expect(notice).toHaveRole("status");
    await expect(notice).toHaveClass(/notification-info/);
    await expect(notice).toHaveAttribute("aria-atomic", "true");
  });
}
