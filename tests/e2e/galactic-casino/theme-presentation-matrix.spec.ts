import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { THEME_IDS } from "../../../src/content/themes";

test("Galactic Casino and child navigation fit in all themes at wide and phone widths @theme-matrix @galactic-casino", async ({
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
      await page.locator("#tab-galaxy").click();
      const galacticPane = page.getByRole("tabpanel", { name: "Galactic" });
      await expect(
        page.locator(".game-nav").getByRole("tab", { name: "Galactic Casino" }),
      ).toHaveCount(0);
      const childTabs = galacticPane
        .getByRole("tablist", { name: "Pages in this section" })
        .getByRole("tab");
      // This fixture has no current-run scanned destination, so Rebirth stays hidden.
      await expect(childTabs).toHaveCount(4);
      await expect(galacticPane.getByRole("tab", { name: "Rebirth" })).toHaveCount(0);
      const childTabLabels = await childTabs.evaluateAll((tabs) =>
        tabs.map((tab) => {
          const label = tab.cloneNode(true) as HTMLElement;
          label.querySelector(".attention-badge")?.remove();
          return label.textContent?.trim() ?? "";
        }),
      );
      expect(childTabLabels).toEqual([
        "Galactic Market",
        "Galactic Casino",
        "Ascendency Perks",
        "Megastructures",
      ]);
      await page.locator("#tab-galactic-casino").click();
      await expect(page.getByTestId("galactic-casino-pane")).toBeVisible();
      const casinoWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(casinoWidth, `${theme} Galactic Casino at ${viewport.width}px`).toBeLessThanOrEqual(
        viewport.width,
      );
    }
  }
});
