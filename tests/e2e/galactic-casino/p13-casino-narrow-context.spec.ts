import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

test("P-13 keeps Casino balance, prices, and actions visible on narrow screens @p13-casino-context", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();

  const casino = page.getByTestId("galactic-casino-pane");
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 740 });

    const balance = casino.getByTestId("casino-balance");
    const wheelCost = casino.getByTestId("casino-wheel-entry-cost");
    const wheelAction = casino.getByTestId("casino-wheel-spin");
    const hiloCost = casino.getByTestId("casino-hilo-entry-cost");
    const hiloAction = casino.getByTestId("casino-hilo-start");
    const stakePreview = casino.getByTestId("casino-don-stake-preview");
    const payoutPreview = casino.getByTestId("casino-don-win-preview");
    const donAction = casino.getByTestId("casino-don-play");

    await expect(balance).toBeVisible();
    await expect(wheelCost).toContainText("1 CP");
    await expect(wheelAction).toBeVisible();
    await expect(hiloCost).toContainText("5 CP");
    await expect(hiloAction).toBeVisible();
    await expect(stakePreview).toBeVisible();
    await expect(payoutPreview).toBeVisible();
    await expect(donAction).toBeVisible();

    const bounds = await page.evaluate(() => {
      const selectors = [
        '[data-testid="casino-balance"]',
        '[data-testid="casino-wheel-entry-cost"]',
        '[data-testid="casino-wheel-spin"]',
        '[data-testid="casino-hilo-entry-cost"]',
        '[data-testid="casino-hilo-start"]',
        '[data-testid="casino-don-stake-preview"]',
        '[data-testid="casino-don-win-preview"]',
        '[data-testid="casino-don-play"]',
      ];
      return {
        viewportWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        rightEdges: selectors.map(
          (selector) => document.querySelector(selector)!.getBoundingClientRect().right,
        ),
      };
    });
    expect(bounds.documentWidth, `${width}px document width`).toBeLessThanOrEqual(
      bounds.viewportWidth,
    );
    expect(
      bounds.rightEdges.every((right) => right <= width),
      `${width}px Casino content bounds`,
    ).toBe(true);
  }
});
