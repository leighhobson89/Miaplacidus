import { NEWS_CATEGORIES } from "../../../src/content/metaSignals";
import { LOCALE_IDS } from "../../../src/content/ids";
import { newsCategoryName } from "../../../src/i18n/metaSignalMessages";
import { sourceNewsCopy } from "../../../src/i18n/sourceNewsCopy";
import type { Locator } from "@playwright/test";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";

async function finishTickerMessage(ticker: Locator) {
  return ticker.locator(".news-ticker-message").evaluate(
    (element) =>
      new Promise<{ readonly left: number; readonly right: number; readonly windowLeft: number }>(
        (resolve, reject) => {
          element.addEventListener(
            "animationend",
            (event) => {
              if (event.target !== element) return;
              const messageBounds = element.getBoundingClientRect();
              const windowBounds = element.parentElement!.getBoundingClientRect();
              resolve({
                left: messageBounds.left,
                right: messageBounds.right,
                windowLeft: windowBounds.left,
              });
            },
            { once: true },
          );
          const animation = element
            .getAnimations()
            .find(
              (candidate) =>
                "animationName" in candidate && candidate.animationName === "news-ticker-scroll",
            );
          if (!animation) reject(new Error("Ticker message scroll animation was not running"));
          else animation.finish();
        },
      ),
  );
}

test("the shell ticker shows only its message and lets keyboard users claim both reward types @news-ticker", async ({
  freshGame,
}) => {
  const ticker = freshGame.getByTestId("news-ticker");
  await expect(ticker).toBeVisible();
  await expect(ticker.locator(".news-ticker-copy")).toHaveText("");
  await expect(ticker).not.toContainText("No reports yet");
  const tickerSizing = await ticker.evaluate((element) => ({
    fontSize: Number.parseFloat(
      getComputedStyle(element.querySelector(".news-ticker-message")!).fontSize,
    ),
    height: element.getBoundingClientRect().height,
  }));
  expect(tickerSizing.fontSize).toBeGreaterThan(16);
  expect(tickerSizing.height).toBeGreaterThanOrEqual(64);
  await expect(ticker.locator(".news-ticker-message")).toHaveAttribute("aria-live", "polite");
  await expect(ticker.locator(".news-ticker-label, .news-ticker-category")).toHaveCount(0);
  await expect(ticker.locator(".news-ticker-message")).toHaveCSS("animation-play-state", "running");
  await ticker.hover();
  await expect(ticker.locator(".news-ticker-message")).toHaveCSS("animation-play-state", "running");

  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "headline", id: 0 }),
    ),
  ).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "0");
  await expect(ticker.locator(".news-ticker-copy .sr-only")).toHaveText(
    `${newsCategoryName("en", "headline")}:`,
  );
  await expect(ticker.locator(".news-ticker-copy")).toContainText("Hydrogen surpluses");
  await expect(ticker.locator(".news-ticker-action")).toHaveCount(0);

  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "prize", id: 2000 }),
    ),
  ).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "0");
  await finishTickerMessage(ticker);
  await expect(ticker).toHaveAttribute("data-news-id", "2000");
  await expect(ticker.locator(".news-ticker-copy")).toContainText("free Hydrogen");
  const resourceClaim = ticker.locator(".news-ticker-action");
  await expect(resourceClaim).toBeVisible();
  await expect(resourceClaim).toHaveCSS("text-decoration-line", "none");
  await expect(resourceClaim).toHaveCSS("color", "rgb(255, 255, 255)");
  const prizeBeforeClaim = await freshGame.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      quantity: state.run.goods.hydrogen.quantity,
      prizeAmount: state.run.newsTicker.entries.at(-1)?.prizeAmount,
    };
  });
  expect(prizeBeforeClaim.prizeAmount).toBeGreaterThan(0);
  await expect(ticker.locator(".news-ticker-copy")).toContainText(
    String(prizeBeforeClaim.prizeAmount),
  );
  await resourceClaim.focus();
  await expect(ticker.locator(".news-ticker-message")).toHaveCSS("animation-play-state", "running");
  await resourceClaim.press("Enter");
  await expect(resourceClaim).toBeDisabled();
  await expect(resourceClaim).toHaveText("here");
  await expect(resourceClaim).toHaveCSS("opacity", "0.5");
  const hydrogenAfter = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
  );
  expect(hydrogenAfter - prizeBeforeClaim.quantity).toBe(prizeBeforeClaim.prizeAmount);

  const pointsBefore = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().permanent.ascendencyPoints,
  );
  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "oneOff", id: 3013 }),
    ),
  ).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "2000");
  await finishTickerMessage(ticker);
  await expect(ticker).toHaveAttribute("data-news-id", "3013");
  await expect(ticker.locator(".news-ticker-copy")).toContainText("free AP");
  const specialClaim = ticker.locator(".news-ticker-action");
  await specialClaim.focus();
  await specialClaim.press("Enter");
  await expect(specialClaim).toBeDisabled();
  const pointsAfter = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().permanent.ascendencyPoints,
  );
  expect(pointsAfter).toBe(pointsBefore + 1);

  const desktopViewport = freshGame.viewportSize();
  await freshGame.setViewportSize({ width: 390, height: 844 });
  for (const [index, locale] of LOCALE_IDS.entries()) {
    const headlineId = index + 1;
    await setGameLocale(freshGame, locale);
    expect(
      await freshGame.evaluate(
        (id) =>
          window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "headline", id }),
        headlineId,
      ),
    ).toBe(true);
    await finishTickerMessage(ticker);
    await expect(ticker).toHaveAttribute("data-news-id", String(headlineId));
    await expect(ticker.locator(".news-ticker-copy")).toContainText(
      sourceNewsCopy(locale).headlines[headlineId],
    );
    const tickerLayout = await freshGame.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      tickerWidth: document
        .querySelector<HTMLElement>("[data-testid='news-ticker']")
        ?.getBoundingClientRect().width,
    }));
    expect(tickerLayout.documentWidth, `${locale} page width at 390px`).toBeLessThanOrEqual(390);
    expect(tickerLayout.tickerWidth, `${locale} ticker width at 390px`).toBeLessThanOrEqual(390);
  }
  if (desktopViewport) await freshGame.setViewportSize(desktopViewport);
});

test("a fresh prize keeps its here action while localized ticker copy is loading @news-ticker", async ({
  freshGame,
}) => {
  let releaseCopy: (() => void) | undefined;
  let copyRequestSeen = false;
  const copyHeld = new Promise<void>((resolve) => {
    releaseCopy = resolve;
  });
  await freshGame.route("**/sourceNewsCopy.ts*", async (route) => {
    copyRequestSeen = true;
    await copyHeld;
    await route.continue();
  });

  try {
    expect(
      await freshGame.evaluate(() =>
        window.miaplacidusTest!.dispatch({
          type: "news.ticker.force",
          category: "prize",
          id: 2000,
        }),
      ),
    ).toBe(true);
    const ticker = freshGame.getByTestId("news-ticker");
    await expect(ticker).toHaveAttribute("data-news-id", "2000");
    await expect.poll(() => copyRequestSeen).toBe(true);
    const claim = ticker.locator(".news-ticker-claim");
    await ticker.locator(".news-ticker-message").evaluate((element) => {
      (element as HTMLElement).style.animation = "none";
    });
    await expect(claim).toHaveText("here");
    await expect(ticker.locator(".news-ticker-copy")).toContainText(
      String(
        await freshGame.evaluate(
          () => window.miaplacidusTest!.getState().run.newsTicker.entries.at(-1)?.prizeAmount,
        ),
      ),
    );
    const beforeClaim = await freshGame.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      return {
        quantity: state.run.goods.hydrogen.quantity,
        amount: state.run.newsTicker.entries.at(-1)?.prizeAmount,
      };
    });
    await claim.click();
    await expect(claim).toBeDisabled();
    await expect(claim).toHaveText("here");
    await expect(claim).toHaveCSS("opacity", "0.5");
    const afterClaim = await freshGame.evaluate(
      () => window.miaplacidusTest!.getState().run.goods.hydrogen.quantity,
    );
    expect(afterClaim - beforeClaim.quantity).toBe(beforeClaim.amount);
  } finally {
    releaseCopy?.();
  }

  await expect(freshGame.locator(".news-ticker-copy")).toContainText("free Hydrogen");
  await expect(freshGame.locator(".news-ticker-claim")).toHaveText("here");
  await expect(freshGame.locator(".news-ticker-claim")).toBeDisabled();
});

test("all wacky effects activate from keyboard controls, including feedback choices @news-ticker", async ({
  freshGame,
}) => {
  const ticker = freshGame.getByTestId("news-ticker");
  const effects = [
    [1000, "wave"],
    [1001, "disco"],
    [1002, "bounce"],
    [1003, "fade"],
    [1004, "glitch"],
    [1005, "wobble"],
    [1006, "boo"],
  ] as const;

  for (const [index, [id, effect]] of effects.entries()) {
    expect(
      await freshGame.evaluate(
        (entryId) =>
          window.miaplacidusTest!.dispatch({
            type: "news.ticker.force",
            category: "wacky",
            id: entryId,
          }),
        id,
      ),
    ).toBe(true);
    if (index > 0) await finishTickerMessage(ticker);
    await expect(ticker).toHaveAttribute("data-news-id", String(id));
    const action = ticker.locator(".news-ticker-action").first();
    await expect(action).toBeVisible();
    await action.focus();
    await action.press("Enter");
    await expect(ticker).toHaveClass(new RegExp(`news-effect-${effect}\\b`));
    await expect(action).toBeDisabled();
  }

  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "wacky", id: 1007 }),
    ),
  ).toBe(true);
  await finishTickerMessage(ticker);
  await expect(ticker).toHaveAttribute("data-news-id", "1007");
  const feedbackChoices = ticker.locator(".news-ticker-feedback-choice");
  await expect(feedbackChoices).toHaveCount(2);
  await feedbackChoices.nth(1).focus();
  await feedbackChoices.nth(1).press("Enter");
  await expect(ticker).toHaveClass(/news-effect-feedback-bad\b/);
  await expect(feedbackChoices.nth(1)).toBeDisabled();

  await finishTickerMessage(ticker);
  await freshGame.evaluate(() => window.miaplacidusTest!.advanceBy(1_000));
  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "wacky", id: 1007 }),
    ),
  ).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "1007");
  await ticker.locator(".news-ticker-feedback-choice").first().press("Enter");
  await expect(ticker).toHaveClass(/news-effect-feedback-good\b/);
});

test("ticker messages fully leave the viewport and wacky messages keep moving on hover @news-ticker", async ({
  freshGame,
}) => {
  const ticker = freshGame.getByTestId("news-ticker");
  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "wacky", id: 1002 }),
    ),
  ).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "1002");
  const message = ticker.locator(".news-ticker-message");
  const tickerWindow = await ticker.locator(".news-ticker-window").boundingBox();
  expect(tickerWindow).not.toBeNull();
  await freshGame.mouse.move(
    tickerWindow!.x + tickerWindow!.width - 1,
    tickerWindow!.y + tickerWindow!.height / 2,
  );
  await expect.poll(() => message.evaluate((element) => element.matches(":hover"))).toBe(true);
  await expect(message).toHaveCSS("animation-play-state", "running");
  await freshGame.waitForTimeout(250);
  await expect(ticker).toHaveAttribute("data-news-id", "1002");

  const exitBounds = await finishTickerMessage(ticker);
  expect(exitBounds.right).toBeLessThan(exitBounds.windowLeft);
  await expect(ticker).not.toHaveAttribute("data-news-id", "1002");
});

test("manuscript clues show the matching star name without a claim control @news-ticker", async ({
  page,
}) => {
  await startMetaFixture(page, "space-manuscript-hidden");
  const ticker = page.getByTestId("news-ticker");
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "news.ticker.force",
        category: "manuscriptClue",
        id: 4000,
      }),
    ),
  ).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "4000");
  await expect(ticker.locator(".news-ticker-category")).toHaveCount(0);
  await expect(ticker.locator(".news-ticker-copy .sr-only")).toHaveText(
    `${newsCategoryName("en", "manuscriptClue")}:`,
  );
  await expect(ticker.locator(".news-ticker-copy")).toContainText("Sirius");
  await expect(ticker.locator(".news-ticker-action")).toHaveCount(0);
});

test("the ticker advances on schedule and fits a phone width @news-ticker", async ({
  freshGame,
}) => {
  await freshGame.setViewportSize({ width: 390, height: 844 });
  const ticker = freshGame.getByTestId("news-ticker");
  const initial = await freshGame.evaluate(() => window.miaplacidusTest!.getState().run.newsTicker);
  expect(initial.entries).toHaveLength(0);

  await freshGame.evaluate(
    (remaining) => window.miaplacidusTest!.advanceBy(remaining + 1),
    initial.remainingMs,
  );
  await expect
    .poll(() =>
      freshGame.evaluate(() => window.miaplacidusTest!.getState().run.newsTicker.entries.length),
    )
    .toBeGreaterThan(0);
  const latest = await freshGame.evaluate(() =>
    window.miaplacidusTest!.getState().run.newsTicker.entries.at(-1)!,
  );
  const nextInterval = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().run.newsTicker.remainingMs,
  );
  expect(NEWS_CATEGORIES).toContain(latest.category);
  expect(nextInterval).toBeGreaterThanOrEqual(19_999);
  expect(nextInterval).toBeLessThanOrEqual(35_000);
  await expect(ticker).toHaveAttribute("data-news-id", String(latest.id));
  await expect(ticker.locator(".news-ticker-category")).toHaveCount(0);
  const viewport = await freshGame.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const overflowElements = Array.from(document.body.querySelectorAll<HTMLElement>("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id,
          className: String(element.className),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((element) => element.right > viewportWidth + 1 || element.left < -1)
      .sort((left, right) => right.right - left.right)
      .slice(0, 8);
    return {
      viewportWidth,
      documentWidth: document.documentElement.scrollWidth,
      tickerWidth: document
        .querySelector<HTMLElement>("[data-testid='news-ticker']")
        ?.getBoundingClientRect().width,
      overflowElements,
    };
  });
  expect(
    viewport.documentWidth,
    `content outside the phone viewport: ${JSON.stringify(viewport.overflowElements)}`,
  ).toBeLessThanOrEqual(viewport.viewportWidth);
  expect(viewport.tickerWidth).toBeLessThanOrEqual(viewport.viewportWidth);
});

test("the Settings ticker toggle hides the strip and persists after reload @news-ticker", async ({
  page,
}) => {
  await startMetaFixture(page);
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-game-options").click();
  const toggle = page.locator("#settings-news-ticker");
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  await expect(page.getByTestId("news-ticker")).toHaveCount(0);
  await saveNowFromSettings(page);
  await page.reload();
  await page.getByLabel("Pioneer name").fill("Ascendency Pioneer");
  await page.getByRole("option").filter({ hasText: "Ascendency Pioneer" }).click();
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.locator("#tab-settings").click();
  await page.locator("#tab-settings-game-options").click();
  await expect(page.locator("#settings-news-ticker")).not.toBeChecked();
  await expect(page.getByTestId("news-ticker")).toHaveCount(0);
});
