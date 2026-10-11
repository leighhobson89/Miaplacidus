import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { THEME_IDS } from "../../../src/content/themes";

test("Cosmic Rip sector controls use the active theme surface @theme-cosmic-rip", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-cosmic-rip-route");
  await page.locator("#tab-cosmic-rip").click();
  await page.locator("#tab-cosmic-rip-scanner-array").click();
  const sector = page.getByTestId("cosmic-rip-sector-0");
  await expect(sector).toBeVisible();

  for (const theme of THEME_IDS) {
    await page.evaluate((themeId) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { themeId },
      });
    }, theme);
    await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);

    const colors = await sector.evaluate((element) => {
      const frame = element.closest<HTMLElement>(".game-frame");
      if (!frame) throw new Error("Cosmic Rip should render inside the themed game frame");
      const sample = document.createElement("span");
      sample.hidden = true;
      sample.style.backgroundColor = "var(--panel-raised)";
      frame.append(sample);
      const expectedSurface = getComputedStyle(sample).backgroundColor;
      sample.remove();
      return {
        theme: frame.dataset.theme,
        actualSurface: getComputedStyle(element).backgroundColor,
        expectedSurface,
      };
    });

    expect(colors.theme).toBe(theme);
    expect(colors.actualSurface, `${theme} Cosmic Rip sector surface`).toBe(colors.expectedSurface);
  }
});
