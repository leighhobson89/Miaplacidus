import { expect, type Page } from "./fixtures";

export async function waitForTechnologyTreeLayout(page: Page): Promise<void> {
  const stage = page.getByTestId("technology-tree-viewport").locator(".technology-map-stage");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await expect
    .poll(async () => {
      const before = await stage.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return { width: bounds.width, height: bounds.height };
      });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }),
      );
      const after = await stage.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return { width: bounds.width, height: bounds.height };
      });
      return (
        before.width > 0 &&
        before.height > 0 &&
        before.width === after.width &&
        before.height === after.height
      );
    })
    .toBe(true);
}
