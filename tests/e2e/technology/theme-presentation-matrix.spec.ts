import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { THEME_IDS } from "../../../src/content/themes";

test("Tech Tree fits in all themes at wide and phone widths @theme-matrix @technology", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startMetaFixture(page, "meta-megastructure-route");
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of THEME_IDS) {
      await page.locator("#tab-settings").click();
      await page.locator("#tab-settings-visual").click();
      await page.locator("#settings-theme").selectOption(theme);
      await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);
      await page.locator("#tab-research").click();
      await page.locator("#tab-research-tech-tree").click();
      await expect(page.getByTestId("technology-tree-viewport")).toBeVisible();
      const researchWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(researchWidth, `${theme} Tech Tree at ${viewport.width}px`).toBeLessThanOrEqual(
        viewport.width,
      );
    }
  }
});
