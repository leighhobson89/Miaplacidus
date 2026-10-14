import type { Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import type { LocaleId } from "../../../src/content/ids";
import type { ThemeId } from "../../../src/content/themes";
import { blackHoleText } from "../../../src/i18n/blackHoleMessages";

async function setPresentation(page: Page, locale: LocaleId, themeId: ThemeId): Promise<void> {
  await page.evaluate(
    ({ nextLocale, nextTheme }) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, themeId: nextTheme },
      }),
    { nextLocale: locale, nextTheme: themeId },
  );
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", themeId);
}

test("Black Hole identity has reviewed desktop and phone visuals across themes and locales @p65-visual-review", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-black-hole-discovered");
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  const cases = [
    {
      viewport: { width: 1280, height: 900 },
      locale: "en",
      theme: "terminal",
      capture: "p65-black-hole-terminal-en-desktop",
    },
    {
      viewport: { width: 390, height: 844 },
      locale: "de",
      theme: "light",
      capture: "p65-black-hole-light-de-phone",
    },
    {
      viewport: { width: 1280, height: 900 },
      locale: "fr",
      theme: "supernova",
      capture: "p65-black-hole-supernova-fr-desktop",
    },
    {
      viewport: { width: 390, height: 844 },
      locale: "pt",
      theme: "galaxy",
      capture: "p65-black-hole-galaxy-pt-phone",
    },
  ] as const;

  for (const item of cases) {
    const locale = item.locale satisfies LocaleId;
    const theme = item.theme satisfies ThemeId;
    await page.setViewportSize(item.viewport);
    await setPresentation(page, locale, theme);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-black-hole").click();

    const pane = page.locator(".black-hole-pane");
    const title = pane.locator(":scope > .panel-heading .game-page-title");
    const artwork = pane.locator(":scope > .page-artwork-row");
    await expect(pane).toBeVisible();
    await expect(pane.locator("h2:visible")).toHaveCount(1);
    await expect(title).toHaveText(blackHoleText(locale).title);
    await expect(artwork).toHaveCount(1);
    await expect(artwork.locator('[data-celestial-illustration="black-hole"]')).toBeVisible();
    await expect(pane.getByRole("button").first()).toBeVisible();
    await captureVisualCheckpoint(page, testInfo, item.capture);
  }
});
