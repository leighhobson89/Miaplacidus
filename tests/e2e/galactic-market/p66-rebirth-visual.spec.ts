import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { rebirthText } from "../../../src/i18n/metaMessages";

test("Galactic Rebirth has a reviewed desktop and phone page capture @p66-visual-review", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-galactic-identity-matrix");

  for (const view of [
    { width: 1280, height: 900, theme: "terminal", suffix: "terminal-desktop" },
    { width: 390, height: 844, theme: "light", suffix: "light-mobile" },
  ] as const) {
    await page.setViewportSize({ width: view.width, height: view.height });
    await page.evaluate((themeId) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: "en", themeId },
      });
    }, view.theme);
    await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", view.theme);
    await page.addStyleTag({
      content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
    });
    await page.locator("#tab-galaxy").click();
    const rebirthTab = page.locator("#tab-galactic-rebirth");
    await expect(rebirthTab).toBeVisible();
    await expect(rebirthTab).toHaveAttribute("data-source-option-id", "option1");
    await rebirthTab.click();
    await expect(rebirthTab).toHaveAttribute("aria-selected", "true");

    const pane = page.getByTestId("rebirth-pane");
    await expect(pane).toBeVisible();
    await expect(pane.getByRole("heading", { level: 2 })).toHaveText(rebirthText("en", "title"));
    await expect(
      pane.locator('.page-artwork-row [data-celestial-illustration="megastructure"]'),
    ).toBeVisible();
    await captureVisualCheckpoint(page, testInfo, `phase6-galactic-rebirth-${view.suffix}`);
  }
});
