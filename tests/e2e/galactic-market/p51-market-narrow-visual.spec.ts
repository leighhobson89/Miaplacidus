import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { marketText } from "../../../src/i18n/metaMessages";
import { topStatusText } from "../../../src/i18n/topStatusMessages";

const MARKET_VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
] as const;

test("P-51 Galactic Market quote, RP tooltip, and Rebirth confirmation fit on narrow phones @p51-market-visual @galactic-market @presentation", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-market-rebirth-ready");
  await page.addStyleTag({
    content: ".weather-effects-overlay, .pointer-trail-layer { visibility: hidden !important; }",
  });

  for (const viewport of MARKET_VIEWPORTS) {
    await page.setViewportSize(viewport);

    for (const theme of ["terminal", "light"] as const) {
      await page.evaluate((themeId) => {
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: "fr", themeId },
        });
      }, theme);
      await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);
      await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe("fr");

      await page.locator("#tab-galaxy").click();
      await page.locator("#tab-galactic-market").click();
      const market = page.locator(".galactic-market-pane");
      await expect(market).toBeVisible();
      await expect(market.getByRole("heading", { level: 2 })).toHaveText(
        marketText("fr", "heading"),
      );

      await market.getByLabel(marketText("fr", "outgoing")).selectOption("hydrogen");
      await market.getByLabel(marketText("fr", "incoming")).selectOption("helium");
      await market.getByLabel(marketText("fr", "quantity")).fill("10");
      await expect(market.getByRole("button", { name: marketText("fr", "trade") })).toBeVisible();

      const screenshot = async (name: string) => {
        const path = testInfo.outputPath(name);
        await page.screenshot({ path, fullPage: false, animations: "disabled" });
        await testInfo.attach(name, { path, contentType: "image/png" });
      };

      const researchBalance = page.getByTestId("research-balance");
      await researchBalance.focus();
      const researchTooltip = page.locator("#top-stat-tooltip-rp");
      await expect(researchTooltip).toBeVisible();
      await expect(researchTooltip).toContainText(topStatusText("fr", "researchPointsName"));
      const tooltipBounds = await researchTooltip.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      });
      expect(
        tooltipBounds.left,
        `RP tooltip left edge at ${viewport.width}px ${theme}`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        tooltipBounds.right,
        `RP tooltip right edge at ${viewport.width}px ${theme}`,
      ).toBeLessThanOrEqual(viewport.width + 1);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(viewport.width);
      await screenshot(`p51-market-rp-tooltip-${viewport.width}-${theme}.png`);
      await researchBalance.evaluate((element) => (element as HTMLElement).blur());

      await page.locator("#tab-galactic-rebirth").click();
      const rebirth = page.getByTestId("rebirth-pane");
      const liquidationButton = rebirth.getByRole("button", {
        name: marketText("fr", "liquidate"),
      });
      await expect(liquidationButton).toBeEnabled();
      await liquidationButton.click();
      const dialog = page.getByRole("dialog", { name: marketText("fr", "liquidateTitle") });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText(marketText("fr", "liquidatePrompt"))).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: marketText("fr", "confirmLiquidation") }),
      ).toBeVisible();
      await expect(dialog.getByRole("button", { name: marketText("fr", "cancel") })).toBeVisible();

      const dialogBounds = await dialog.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        const visible = Array.from(element.querySelectorAll<HTMLElement>("*"))
          .filter((child) => child.getClientRects().length > 0)
          .map((child) => {
            const childRect = child.getBoundingClientRect();
            return {
              selector: child.id || child.className || child.tagName,
              left: Math.round(childRect.left),
              right: Math.round(childRect.right),
            };
          })
          .filter((child) => child.left < -1 || child.right > viewportWidth + 1);
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          viewportWidth,
          viewportHeight,
          outside: visible,
        };
      });
      expect(
        dialogBounds.left,
        `dialog left edge at ${viewport.width}px ${theme}`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        dialogBounds.right,
        `dialog right edge at ${viewport.width}px ${theme}`,
      ).toBeLessThanOrEqual(viewport.width + 1);
      expect(
        dialogBounds.top,
        `dialog top edge at ${viewport.width}px ${theme}`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        dialogBounds.bottom,
        `dialog bottom edge at ${viewport.width}px ${theme}`,
      ).toBeLessThanOrEqual(viewport.height + 1);
      expect(dialogBounds.outside, `dialog children outside ${viewport.width}px ${theme}`).toEqual(
        [],
      );
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(viewport.width);
      await screenshot(`p51-rebirth-liquidation-dialog-${viewport.width}-${theme}.png`);

      await dialog.getByRole("button", { name: marketText("fr", "cancel") }).click();
      await expect(dialog).toBeHidden();
      await expect(liquidationButton).toBeFocused();
    }
  }
});
