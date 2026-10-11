import { expect, test } from "../_harness/fixtures";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});

test("the news ticker claim keeps its text while exposing a phone-sized touch area @p05-ticker-action", async ({
  freshGame,
}) => {
  const ticker = freshGame.getByTestId("news-ticker");
  const quantityBefore = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
  );
  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "prize", id: 2000 }),
    ),
  ).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "2000");
  await ticker.locator(".news-ticker-message").evaluate((element) => {
    const animation = element
      .getAnimations()
      .find(
        (candidate) =>
          (candidate as Animation & { readonly animationName?: string }).animationName ===
          "news-ticker-scroll",
      );
    if (!animation) throw new Error("The ticker message scroll animation was not running");
    const width = element.getBoundingClientRect().width;
    const viewportWidth = window.innerWidth;
    const halfRem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;
    const duration = animation.effect?.getTiming().duration;
    if (typeof duration !== "number") throw new Error("The ticker scroll duration is not numeric");
    const targetX = (viewportWidth - width) / 2;
    const progress = (targetX - viewportWidth) / (-width - viewportWidth - halfRem - viewportWidth);
    animation.pause();
    animation.currentTime = duration * progress;
  });

  const claim = ticker.locator(".news-ticker-claim");
  await expect(claim).toBeVisible();
  const claimBounds = await claim.boundingBox();
  expect(claimBounds).not.toBeNull();
  const hitArea = await claim.evaluate((button) => {
    const bounds = button.getBoundingClientRect();
    const target = getComputedStyle(button, "::after");
    const window = button.closest(".news-ticker-window")!;
    return {
      expandedWidth: bounds.width - 2 * Number.parseFloat(target.left),
      expandedHeight: bounds.height - 2 * Number.parseFloat(target.top),
      topInset: target.top,
      windowHeight: window.getBoundingClientRect().height,
      tickerHeight: button.closest(".news-ticker-bar")!.getBoundingClientRect().height,
    };
  });
  expect(hitArea.expandedWidth).toBeGreaterThanOrEqual(44);
  expect(hitArea.expandedHeight).toBeGreaterThanOrEqual(44);
  expect(hitArea.topInset).toBe("-11px");
  expect(hitArea.windowHeight).toBe(44);
  expect(hitArea.tickerHeight).toBeGreaterThanOrEqual(60);

  const claimTap = { x: claimBounds!.x + claimBounds!.width / 2, y: claimBounds!.y - 4 };
  expect(
    await freshGame.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.className, claimTap),
  ).toContain("news-ticker-claim");
  await freshGame.touchscreen.tap(claimTap.x, claimTap.y);
  await expect(claim).toBeDisabled();
  await expect(claim).toHaveText("here");
  await expect(claim).toHaveCSS("opacity", "0.5");
  const quantityAfter = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
  );
  const prizeAmount = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().run.newsTicker.entries.at(-1)?.prizeAmount ?? 0,
  );
  expect(quantityAfter - quantityBefore).toBe(prizeAmount);
});
