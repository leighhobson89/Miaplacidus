import type { Page, TestInfo } from "@playwright/test";
import { expect } from "./fixtures";

export interface MetaPageCheck {
  readonly name: string;
  readonly tabId: string;
  readonly paneSelector: string;
  readonly expectedTitle: string;
  readonly illustration: string;
}

export async function checkMetaPages(
  page: Page,
  testInfo: TestInfo,
  mainTabId: string,
  pages: readonly MetaPageCheck[],
): Promise<void> {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    const referenceTitleSize = await page
      .locator("#panel-resources-hydrogen .pane-heading h2")
      .evaluate((element) => getComputedStyle(element).fontSize);
    for (const item of pages) {
      await page.locator(`#${mainTabId}`).click();
      await page.locator(`#${item.tabId}`).click();
      const pane = page.locator(item.paneSelector);
      const headings = pane.locator("h2:visible");
      const artworkRows = pane.locator(".page-artwork-row:visible");
      await expect(headings, `${item.name} should have exactly one visible heading`).toHaveCount(1);
      await expect(headings).toHaveText(item.expectedTitle);
      if (item.name === "cosmic-rip") {
        await expect(
          pane.getByRole("heading", { name: item.expectedTitle, exact: true }),
          "Cosmic Rip should have only one visible heading for its shared page title",
        ).toHaveCount(1);
      }
      await expect(headings, `${item.name} should use the shared page-title treatment`).toHaveClass(
        /game-page-title/,
      );
      await expect(artworkRows, `${item.name} should have exactly one artwork row`).toHaveCount(1);
      const illustration = artworkRows.locator(
        `[data-celestial-illustration='${item.illustration}']`,
      );
      await expect(illustration, `${item.name} should use ${item.illustration} art`).toHaveCount(1);
      await expect(illustration).toBeVisible();

      const titleSize = await headings.evaluate((element) => getComputedStyle(element).fontSize);
      expect(titleSize, `${item.name} title size at ${viewport.width}px`).toBe(referenceTitleSize);
      const contentBounds = await pane.evaluate((element) => {
        const bounds = Array.from(element.querySelectorAll<HTMLElement>("h2, .page-artwork-row"))
          .filter((child) => child.getClientRects().length > 0)
          .map((child) => {
            const rect = child.getBoundingClientRect();
            return { left: rect.left, right: rect.right };
          });
        return {
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          bounds,
        };
      });
      expect(
        contentBounds.documentWidth,
        `${item.name} document width at ${viewport.width}px`,
      ).toBeLessThanOrEqual(viewport.width);
      for (const bounds of contentBounds.bounds) {
        expect(bounds.left, `${item.name} content left edge`).toBeGreaterThanOrEqual(-1);
        expect(bounds.right, `${item.name} content right edge`).toBeLessThanOrEqual(
          viewport.width + 1,
        );
      }
      await page.screenshot({
        path: testInfo.outputPath(`p65-${item.name}-${viewport.width}.png`),
      });
    }
  }
}
