import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { cosmicRipEndingCinematicText } from "../../../src/i18n/cosmicRipEndingCinematicMessages";
import { cosmicRipText } from "../../../src/i18n/cosmicRipMessages";

async function selectLocale(page: import("@playwright/test").Page, locale: LocaleId) {
  const accepted = await page.evaluate(
    (nextLocale) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, reducedMotion: true, notificationsEnabled: true },
      }),
    locale,
  );
  expect(accepted).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

for (const locale of LOCALE_IDS) {
  test(`Cosmic Rip closure result and ending use the selected locale (${locale}) @p7-cosmic-rip-ending-locales`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-cosmic-rip-ending-ready");
    await selectLocale(page, locale);
    await page.locator("#tab-cosmic-rip").click();
    await page.locator("#tab-cosmic-rip-situation").click();

    const gameCopy = cosmicRipText(locale);
    const closeButton = page.locator("#panel-cosmic-rip-situation .cosmic-rip-close");
    await expect(closeButton).toBeEnabled();
    await closeButton.click();

    const resultDialog = page.getByTestId("random-event-result-dialog");
    await expect(resultDialog).toBeVisible();
    await expect(resultDialog.getByRole("heading")).toHaveText(gameCopy.closedTitle);
    await expect(resultDialog.locator("#random-event-result-copy")).toHaveText(gameCopy.closed);
    await resultDialog
      .getByRole("button", { name: gameCopy.closedDialogEndLabel, exact: true })
      .click();

    const endingCopy = cosmicRipEndingCinematicText(locale);
    const ending = page.getByRole("dialog", { name: endingCopy.ariaLabel, exact: true });
    await expect(ending).toBeVisible();
    await expect(ending).toHaveAttribute("data-reduced-motion", "true");
    await expect
      .poll(() =>
        page.evaluate(() => window.miaplacidusTest!.getState().permanent.cosmicRip.closed),
      )
      .toBe(true);

    const finalCard = ending.locator(".cosmic-rip-cinematic-static-ending");
    await expect(finalCard).toBeVisible();
    await expect(finalCard.locator("p").nth(0)).toHaveText(endingCopy.gameName);
    await expect(finalCard.locator("h3")).toHaveText(endingCopy.victory);
    await expect(finalCard.locator("p").nth(1)).toHaveText(endingCopy.securedFuture);
    await expect(finalCard.locator("p").nth(2)).toHaveText(endingCopy.playerIdentity);
    await expect(finalCard.locator("strong")).toHaveText(endingCopy.theEnd);
    await expect(ending.locator("#cosmic-rip-cinematic-announcement")).toHaveText(
      `${endingCopy.victory}. ${endingCopy.securedFuture} ${endingCopy.playerIdentity} ${endingCopy.theEnd}`,
    );
    await ending.getByRole("button", { name: endingCopy.continue, exact: true }).click();
    await expect(ending).toHaveCount(0);
  });
}
