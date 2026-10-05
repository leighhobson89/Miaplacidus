import { expect, type Page, type TestInfo } from "@playwright/test";

export async function captureVisualCheckpoint(
  page: Page,
  testInfo: TestInfo,
  name: string,
  appMustBeReady = true,
): Promise<void> {
  if (appMustBeReady) {
    await expect(page.locator("[data-app-ready]")).toBeVisible();
    const surface = await page.locator("html").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        background: getComputedStyle(element).backgroundColor,
      };
    });
    expect(surface.width).toBeGreaterThan(0);
    expect(surface.height).toBeGreaterThan(0);
    expect(surface.background).not.toBe("rgb(255, 255, 255)");
  }

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.scrollTo(0, 0);
        requestAnimationFrame(() => resolve());
      }),
  );
  const image = await page.screenshot({ fullPage: true, animations: "disabled" });
  await testInfo.attach(`${name}.png`, { body: image, contentType: "image/png" });
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    animations: "disabled",
    maxDiffPixelRatio: 0.05,
  });
}
