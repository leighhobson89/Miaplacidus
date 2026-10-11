import { NEWS_CATEGORIES } from "../../../src/content/metaSignals";
import { LOCALE_IDS } from "../../../src/content/ids";
import { newsCategoryName, newsEntryText } from "../../../src/i18n/metaSignalMessages";
import { sourceNewsCopy } from "../../../src/i18n/sourceNewsCopy";
import type { Locator } from "@playwright/test";
import { saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale, setNumberNotation } from "../_harness/settings-controls";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { formatNumber } from "../../../src/app/numberFormatting";

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

async function freezeTickerAnimations(ticker: Locator, effectProgress = 0.5) {
  await ticker.evaluate(async (element, effectProgress) => {
    const animations = element.getAnimations({ subtree: true });
    for (const animation of animations) animation.pause();
    await Promise.all(animations.map((animation) => animation.ready));

    const message = element.querySelector<HTMLElement>(".news-ticker-message");
    const scrollAnimation = animations.find(
      (animation) =>
        (animation as Animation & { readonly animationName?: string }).animationName ===
        "news-ticker-scroll",
    );
    if (message && scrollAnimation) {
      const width = message.getBoundingClientRect().width;
      const viewportWidth = window.innerWidth;
      const halfRem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;
      const startX = viewportWidth;
      const endX = -width - viewportWidth - halfRem;
      const targetX = (viewportWidth - width) / 2;
      const progress = (targetX - startX) / (endX - startX);
      const duration = scrollAnimation.effect?.getTiming().duration;
      scrollAnimation.currentTime = typeof duration === "number" ? duration * progress : 15_000;
    }

    for (const animation of animations) {
      animation.pause();
      const cssAnimation = animation as Animation & { readonly animationName?: string };
      if (cssAnimation.animationName === "news-ticker-scroll") continue;
      const duration = animation.effect?.getTiming().duration;
      if (typeof duration === "number" && Number.isFinite(duration)) {
        animation.currentTime = duration * effectProgress;
      }
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }, effectProgress);
}

interface TickerEffectContract {
  readonly effect: "wave" | "bounce" | "fade" | "glitch" | "wobble";
  readonly subject: ".news-ticker-window" | ".news-ticker-message";
  readonly duration: number;
  readonly direction: "normal" | "alternate";
  readonly offsets: readonly number[];
  readonly property: "transform" | "opacity";
  readonly values: readonly string[];
}

const sourceTickerEffectContracts: readonly TickerEffectContract[] = [
  {
    effect: "wave",
    subject: ".news-ticker-window",
    duration: 2_000,
    direction: "alternate",
    offsets: [0, 1],
    property: "transform",
    values: ["scaleX(1)", "scaleX(1.5)"],
  },
  {
    effect: "bounce",
    subject: ".news-ticker-window",
    duration: 1_000,
    direction: "normal",
    offsets: [0, 0.5, 1],
    property: "transform",
    values: ["translateY(10px)", "translateY(-15px)", "translateY(10px)"],
  },
  {
    effect: "fade",
    subject: ".news-ticker-message",
    duration: 1_000,
    direction: "alternate",
    offsets: [0, 1],
    property: "opacity",
    values: ["1", "0"],
  },
  {
    effect: "glitch",
    subject: ".news-ticker-window",
    duration: 100,
    direction: "normal",
    offsets: [0, 0.5, 1],
    property: "transform",
    values: ["translate(2px, -2px)", "translate(-2px, 2px)", "translate(0, 0)"],
  },
  {
    effect: "wobble",
    subject: ".news-ticker-window",
    duration: 1_000,
    direction: "normal",
    offsets: [0, 0.25, 0.5, 0.75, 1],
    property: "transform",
    values: ["rotate(0deg)", "rotate(-6deg)", "rotate(6deg)", "rotate(-3deg)", "rotate(0deg)"],
  },
];

async function expectTickerEffectMatchesSource(ticker: Locator, contract: TickerEffectContract) {
  const animation = await ticker.locator(contract.subject).evaluate(
    (element, effect) => {
      const cssAnimation = element
        .getAnimations()
        .find(
          (candidate) =>
            (candidate as Animation & { readonly animationName?: string }).animationName ===
            `news-effect-${effect.name}`,
        );
      if (!cssAnimation) return null;
      const timing = cssAnimation.effect?.getTiming();
      const normalizeValue = (value: string | number | null) => {
        if (value === null) return null;
        if (effect.property !== "transform") return String(value);
        return Array.from(new DOMMatrix(String(value)).toFloat64Array()).map((component) =>
          Number(component.toFixed(6)),
        );
      };
      return {
        animationName: (cssAnimation as Animation & { readonly animationName?: string })
          .animationName,
        duration: timing?.duration,
        direction: timing?.direction,
        iterations: timing?.iterations,
        playState: cssAnimation.playState,
        keyframes: cssAnimation.effect?.getKeyframes().map((frame) => ({
          offset: frame.offset,
          value: normalizeValue(frame[effect.property] ?? null),
        })),
        expectedValues: effect.values.map((value) => normalizeValue(value)),
      };
    },
    { name: contract.effect, property: contract.property, values: contract.values },
  );

  expect(
    animation,
    `${contract.effect} is attached to its source-equivalent subject`,
  ).not.toBeNull();
  expect(animation?.animationName).toBe(`news-effect-${contract.effect}`);
  expect(animation?.duration).toBe(contract.duration);
  expect(animation?.direction).toBe(contract.direction);
  expect(animation?.iterations).toBe(Number.POSITIVE_INFINITY);
  expect(animation?.playState).toBe("running");
  expect(animation?.keyframes?.map((frame) => frame.offset)).toEqual(contract.offsets);
  expect(animation?.keyframes?.map((frame) => frame.value)).toEqual(animation?.expectedValues);

  const effectSubjects = await ticker.evaluate((element, effect) => {
    const candidates = [
      { selector: ".news-ticker-bar", element },
      ...[".news-ticker-window", ".news-ticker-message", ".news-ticker-copy"].map((selector) => ({
        selector,
        element: element.querySelector(selector),
      })),
    ];
    return candidates
      .filter(({ element: subject }) => subject !== null)
      .filter(({ element: subject }) =>
        subject!
          .getAnimations()
          .some(
            (candidate) =>
              (candidate as Animation & { readonly animationName?: string }).animationName ===
              `news-effect-${effect}`,
          ),
      )
      .map(({ selector }) => selector);
  }, contract.effect);
  expect(effectSubjects, `${contract.effect} animates only its source-equivalent subject`).toEqual([
    contract.subject,
  ]);
}

async function expectFeedbackEffectMatchesSource(ticker: Locator, choice: "good" | "bad") {
  const transforms =
    choice === "good"
      ? ["scale(1) translateY(0)", "scale(1.5) translateY(-20px)", "scale(1) translateY(0)"]
      : ["scale(1) translateY(0)", "scale(0.5) translateY(20px)", "scale(1) translateY(0)"];
  const animation = await ticker.locator(".news-ticker-window").evaluate(
    (element, effect) => {
      const cssAnimation = element
        .getAnimations()
        .find(
          (candidate) =>
            (candidate as Animation & { readonly animationName?: string }).animationName ===
            `news-effect-feedback-${effect.choice}`,
        );
      if (!cssAnimation) return null;
      const keyframes = cssAnimation.effect?.getKeyframes() ?? [];
      const toMatrix = (transform: string) =>
        Array.from(new DOMMatrix(transform).toFloat64Array()).map((value) =>
          Number(value.toFixed(6)),
        );
      return {
        animationName: (cssAnimation as Animation & { readonly animationName?: string })
          .animationName,
        duration: cssAnimation.effect?.getTiming().duration,
        direction: cssAnimation.effect?.getTiming().direction,
        iterations: cssAnimation.effect?.getTiming().iterations,
        fillMode: cssAnimation.effect?.getTiming().fill,
        playState: cssAnimation.playState,
        keyframes: keyframes.map((frame) => ({
          offset: frame.offset,
          transform: toMatrix(String(frame.transform ?? "none")),
        })),
        expectedTransforms: effect.transforms.map(toMatrix),
      };
    },
    { choice, transforms },
  );

  expect(animation, `${choice} feedback animation exists`).not.toBeNull();
  expect(animation?.animationName).toBe(`news-effect-feedback-${choice}`);
  expect(animation?.duration).toBe(400);
  expect(animation?.direction).toBe("normal");
  expect(animation?.iterations).toBe(1);
  expect(animation?.fillMode).toBe("forwards");
  expect(animation?.playState).toBe("running");
  expect(animation?.keyframes.map((frame) => frame.offset)).toEqual([0, 0.5, 1]);
  expect(animation?.keyframes.map((frame) => frame.transform)).toEqual(
    animation?.expectedTransforms,
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
  await expect(ticker.locator(".news-ticker-message")).toHaveCSS("animation-duration", "40s");
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

test("P-41 ticker prize amounts follow the selected notation in the visible UI @precision @notation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  const ticker = page.getByTestId("news-ticker");
  expect(
    await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { reducedMotion: true },
      }),
    ),
  ).toBe(true);

  const cases = [
    { id: 2000, notation: "condensed" },
    { id: 2001, notation: "standard" },
    { id: 2002, notation: "scientific" },
  ] as const;
  for (const { id, notation } of cases) {
    await setNumberNotation(page, notation);
    expect(
      await page.evaluate(
        (prizeId) =>
          window.miaplacidusTest!.dispatch({
            type: "news.ticker.force",
            category: "prize",
            id: prizeId,
          }),
        id,
      ),
    ).toBe(true);
    await expect(ticker).toHaveAttribute("data-news-id", String(id));
    const prizeAmount = await page.evaluate(
      () => window.miaplacidusTest!.getState().run.newsTicker.entries.at(-1)?.prizeAmount,
    );
    expect(prizeAmount).toBeGreaterThan(999);
    await expect(ticker.locator(".news-ticker-copy")).toContainText(
      formatNumber("en", prizeAmount!, 0, notation),
    );
  }
});

test("French and Italian ticker apostrophes render as plain ASCII quotes @news-ticker", async ({
  freshGame,
}, testInfo) => {
  const ticker = freshGame.getByTestId("news-ticker");
  const examples = [
    {
      locale: "it" as const,
      copy: "Nuove sfide emergono mentre la galassia entra in un'età dell'oro.",
    },
    {
      locale: "fr" as const,
      copy: "Apparemment, il y a d'anciens Manuscrits disséminés dans la Galaxie qui pointent vers d'anciennes Mégastructures...",
    },
  ];

  await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { reducedMotion: true },
    }),
  );

  for (const { locale, copy } of examples) {
    await setGameLocale(freshGame, locale);
    const headlineId = sourceNewsCopy(locale).headlines.indexOf(copy);
    expect(headlineId, `${locale} example exists in the source catalog`).toBeGreaterThanOrEqual(0);
    expect(copy).toContain("'");

    expect(
      await freshGame.evaluate(
        (id) =>
          window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "headline", id }),
        headlineId,
      ),
    ).toBe(true);
    await expect(ticker).toHaveAttribute("data-news-id", String(headlineId));
    await expect(ticker.locator(".news-ticker-copy")).toContainText(copy);
    await ticker.screenshot({ path: testInfo.outputPath(`ticker-apostrophe-${locale}.png`) });
  }
});

test("the prize ticker keeps its visual treatment across theme, locale and width @news-ticker", async ({
  freshGame,
}) => {
  const ticker = freshGame.getByTestId("news-ticker");
  const captures = [
    { theme: "terminal", locale: "en", width: 1280, height: 900 },
    { theme: "terminal", locale: "fr", width: 390, height: 844 },
    { theme: "light", locale: "en", width: 390, height: 844 },
    { theme: "light", locale: "fr", width: 1280, height: 900 },
  ] as const;

  await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { reducedMotion: true },
    }),
  );

  for (const [index, capture] of captures.entries()) {
    await freshGame.setViewportSize({ width: capture.width, height: capture.height });
    await setGameLocale(freshGame, capture.locale);
    await freshGame.locator("#tab-settings").click();
    await freshGame.locator("#tab-settings-visual").click();
    await freshGame.locator("#settings-theme").selectOption(capture.theme);
    await expect(freshGame.locator(".game-frame")).toHaveAttribute("data-theme", capture.theme);
    await freshGame.locator("#tab-hydrogen").click();
    if (index > 0) await freshGame.evaluate(() => window.miaplacidusTest!.advanceBy(1));

    expect(
      await freshGame.evaluate(() =>
        window.miaplacidusTest!.dispatch({
          type: "news.ticker.force",
          category: "prize",
          id: 2000,
        }),
      ),
    ).toBe(true);
    await expect(ticker).toHaveAttribute("data-news-id", "2000");
    await expect(ticker.locator(".news-ticker-claim")).toBeVisible();
    await freshGame.mouse.move(0, 0);
    await expect(ticker).toHaveScreenshot(
      `news-ticker-${capture.theme}-${capture.locale}-${capture.width}.png`,
      { animations: "disabled", caret: "hide" },
    );
  }
});

test("a fresh prize shows its localized claim action @news-ticker", async ({ freshGame }) => {
  await setGameLocale(freshGame, "fr");
  const ticker = freshGame.getByTestId("news-ticker");
  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "news.ticker.force",
        category: "prize",
        id: 2000,
      }),
    ),
  ).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "2000");

  const amount = await freshGame.evaluate(
    () => window.miaplacidusTest!.getState().run.newsTicker.entries.at(-1)?.prizeAmount ?? 0,
  );
  await expect(ticker.locator(".news-ticker-copy")).toContainText(
    sourceNewsCopy("fr").prizes[0]!.replace("{amount}", String(amount)),
  );
  await expect(ticker.locator(".news-ticker-claim")).toHaveText(sourceNewsCopy("fr").here);
});

test("P-45 visible ticker prize claims pay out in every locale @news-ticker", async ({
  freshGame,
}) => {
  const ticker = freshGame.getByTestId("news-ticker");
  await freshGame.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { reducedMotion: true },
    }),
  );

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.evaluate(() => window.miaplacidusTest!.advanceBy(1));
    expect(
      await freshGame.evaluate(() =>
        window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "prize" }),
      ),
    ).toBe(true);

    const before = await freshGame.evaluate(() => {
      const state = window.miaplacidusTest!.getState();
      const entry = state.run.newsTicker.entries.at(-1)!;
      const goodId = entry.prizeGoodId as keyof typeof state.run.goods;
      return {
        entry,
        goodId,
        quantity: state.run.goods[goodId].quantity,
        notation: state.settings.notation,
      };
    });
    expect(before.entry.category).toBe("prize");
    await expect(ticker).toHaveAttribute("data-news-id", String(before.entry.id));
    const copy = sourceNewsCopy(locale);
    const expectedMessage = newsEntryText(locale, before.entry, copy, (amount) =>
      formatNumber(locale, amount, 0, before.notation),
    );
    await expect(ticker.locator(".news-ticker-copy")).toContainText(expectedMessage);

    const claim = ticker.locator(".news-ticker-claim");
    await expect(claim).toBeVisible();
    await expect(claim).toHaveText(copy.here);
    await claim.click();
    await expect(claim).toBeDisabled();
    await expect(claim).toHaveText(copy.here);
    await expect(claim).toHaveCSS("opacity", "0.5");

    const quantityAfter = await freshGame.evaluate(
      (goodId) => window.miaplacidusTest!.getState().run.goods[goodId].quantity,
      before.goodId,
    );
    expect(quantityAfter - before.quantity, `${locale} prize payout`).toBe(
      before.entry.prizeAmount,
    );
  }
});

test("a prize shows the capped amount and explains a full store @news-ticker", async ({
  freshGame,
}) => {
  const ticker = freshGame.getByTestId("news-ticker");
  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "news.ticker.force",
        category: "prize",
        id: 2000,
      }),
    ),
  ).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "2000");
  const rewardAction = ticker.locator(".news-ticker-claim");
  await ticker.locator(".news-ticker-message").evaluate((element) => {
    (element as HTMLElement).style.animation = "none";
  });

  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.applyDebugAction("give-1b-all-resources-compounds"),
    ),
  ).toBe(true);
  await expect(rewardAction).toHaveText("here");
  await expect(rewardAction).toBeDisabled();
  await expect(ticker.locator(".news-ticker-claim-reason")).toContainText("Storage is full");

  const beforeClaim = await freshGame.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      quantity: state.run.goods.hydrogen.quantity,
      claimed: state.run.newsTicker.entries.at(-1)?.claimed,
      simulationMs: state.run.newsTicker.entries.at(-1)?.simulationMs,
    };
  });
  expect(
    await freshGame.evaluate(
      (simulationMs) =>
        window.miaplacidusTest!.dispatch({
          type: "news.prize.claim",
          id: 2000,
          simulationMs: simulationMs!,
        }),
      beforeClaim.simulationMs,
    ),
  ).toBe(false);
  const afterClaim = await freshGame.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      quantity: state.run.goods.hydrogen.quantity,
      claimed: state.run.newsTicker.entries.at(-1)?.claimed,
    };
  });
  expect(afterClaim).toEqual({ quantity: beforeClaim.quantity, claimed: beforeClaim.claimed });
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

for (const contract of sourceTickerEffectContracts) {
  test(`the ${contract.effect} ticker effect matches Cosmic Forge's animated subject and keyframes @news-ticker`, async ({
    freshGame,
  }) => {
    const ticker = freshGame.getByTestId("news-ticker");
    const id = {
      wave: 1000,
      bounce: 1002,
      fade: 1003,
      glitch: 1004,
      wobble: 1005,
    }[contract.effect];
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
    await expect(ticker).toHaveAttribute("data-news-id", String(id));

    const action = ticker.locator(".news-ticker-action");
    await action.focus();
    await action.press("Enter");
    await expect(action).toBeDisabled();
    await expect(ticker).toHaveClass(new RegExp(`news-effect-${contract.effect}\\b`));
    await expectTickerEffectMatchesSource(ticker, contract);

    const scrollAnimationRemains = await ticker
      .locator(".news-ticker-message")
      .evaluate((element) =>
        element
          .getAnimations()
          .some(
            (candidate) =>
              (candidate as Animation & { readonly animationName?: string }).animationName ===
              "news-ticker-scroll",
          ),
      );
    expect(
      scrollAnimationRemains,
      "the ticker continues its normal marquee while the effect runs",
    ).toBe(true);
  });
}

const tickerEffectCaptures = [
  [1000, "wave"],
  [1001, "disco"],
  [1002, "bounce"],
  [1003, "fade"],
  [1004, "glitch"],
  [1005, "wobble"],
  [1006, "boo"],
] as const;

for (const [id, effect] of tickerEffectCaptures) {
  test(`captures the activated ticker ${effect} effect @news-ticker-visual`, async ({
    freshGame,
  }) => {
    const ticker = freshGame.getByTestId("news-ticker");
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
    await expect(ticker).toHaveAttribute("data-news-id", String(id));
    const action = ticker.locator(".news-ticker-action").first();
    await action.focus();
    await action.press("Enter");
    await expect(ticker).toHaveClass(new RegExp(`news-effect-${effect}\\b`));
    await expect(action).toBeDisabled();
    await freezeTickerAnimations(ticker);
    await expect(ticker).toHaveScreenshot(`news-ticker-wacky-${effect}.png`, {
      animations: "allow",
      maxDiffPixels: 20,
    });
  });
}

for (const [choice, index] of [
  ["bad", 1],
  ["good", 0],
] as const) {
  test(`plays the source ${choice}-feedback animation @news-ticker-visual`, async ({
    freshGame,
  }) => {
    const ticker = freshGame.getByTestId("news-ticker");
    expect(
      await freshGame.evaluate(() =>
        window.miaplacidusTest!.dispatch({
          type: "news.ticker.force",
          category: "wacky",
          id: 1007,
        }),
      ),
    ).toBe(true);
    await expect(ticker).toHaveAttribute("data-news-id", "1007");
    await ticker.locator(".news-ticker-feedback-choice").nth(index).press("Enter");
    await expect(ticker).toHaveClass(new RegExp(`news-effect-feedback-${choice}\\b`));
    const tickerWindow = ticker.locator(".news-ticker-window");
    await expect(ticker.locator(".news-ticker-copy")).toContainText("Wanna Give FeedBack?");
    const liveAnimation = await tickerWindow.evaluate((element) => {
      const copy = element.querySelector(".news-ticker-copy")!;
      const copyBounds = copy.getBoundingClientRect();
      const windowBounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        animationName: style.animationName,
        animationPlayState: style.animationPlayState,
        visibleHeight: Math.max(
          0,
          Math.min(copyBounds.bottom, windowBounds.bottom) -
            Math.max(copyBounds.top, windowBounds.top),
        ),
      };
    });
    expect(liveAnimation.animationName).toBe(`news-effect-feedback-${choice}`);
    expect(liveAnimation.animationPlayState).toBe("running");
    expect(liveAnimation.visibleHeight).toBeGreaterThan(0);
    await expectFeedbackEffectMatchesSource(ticker, choice);
  });
}

test("the Boo ticker hides its link word until keyboard activation @news-ticker", async ({
  freshGame,
}) => {
  expect(
    await freshGame.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "news.ticker.force", category: "wacky", id: 1006 }),
    ),
  ).toBe(true);

  const ticker = freshGame.getByTestId("news-ticker");
  const action = ticker.locator(".news-ticker-action");
  await expect(ticker.locator(".news-ticker-copy")).toContainText("Don't Click This: Boo!");
  await expect(action).toHaveClass(/news-ticker-boo/);

  const maskedStyle = await action.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      background: style.backgroundColor,
      borderColor: style.borderTopColor,
      borderWidth: style.borderTopWidth,
      borderStyle: style.borderTopStyle,
    };
  });
  expect(maskedStyle.color).toBe(maskedStyle.background);
  expect(maskedStyle.borderWidth).toBe("3px");
  expect(maskedStyle.borderStyle).toBe("solid");
  expect(maskedStyle.borderColor).not.toBe(maskedStyle.background);

  await action.focus();
  await action.press("Enter");
  await expect(action).toBeDisabled();
  await expect(action).not.toHaveClass(/news-ticker-boo/);
  await expect(action).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  const booEffectAnimations = await ticker.evaluate((element) =>
    [
      element,
      element.querySelector(".news-ticker-window"),
      element.querySelector(".news-ticker-message"),
      element.querySelector(".news-ticker-copy"),
    ]
      .filter((subject): subject is Element => subject !== null)
      .flatMap((subject) =>
        subject
          .getAnimations()
          .map(
            (animation) =>
              (animation as Animation & { readonly animationName?: string }).animationName,
          ),
      )
      .filter((name) => name === "news-effect-boo"),
  );
  expect(booEffectAnimations, "Boo reveals its link without moving the ticker bar").toEqual([]);
  await expect(ticker).toHaveCSS("animation-name", "none");
  await expect(ticker.locator(".news-ticker-window")).toHaveCSS("animation-name", "none");
  await expect(ticker.locator(".news-ticker-message")).toHaveCSS(
    "animation-name",
    "news-ticker-scroll",
  );
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
  const hoverPoint = await message.evaluate((element) => {
    const animation = element
      .getAnimations()
      .find(
        (candidate) =>
          "animationName" in candidate && candidate.animationName === "news-ticker-scroll",
      );
    if (!animation) throw new Error("Ticker message scroll animation was not running");
    animation.currentTime = 10_000;
    const bounds = element.getBoundingClientRect();
    return {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    };
  });
  await freshGame.mouse.move(hoverPoint.x, hoverPoint.y);
  await expect.poll(() => message.evaluate((element) => element.matches(":hover"))).toBe(true);
  await expect(message).toHaveCSS("animation-play-state", "running");
  const animationTimeBefore = await message.evaluate(
    (element) =>
      element
        .getAnimations()
        .find(
          (candidate) =>
            "animationName" in candidate && candidate.animationName === "news-ticker-scroll",
        )?.currentTime,
  );
  await freshGame.waitForTimeout(250);
  const animationTimeAfter = await message.evaluate(
    (element) =>
      element
        .getAnimations()
        .find(
          (candidate) =>
            "animationName" in candidate && candidate.animationName === "news-ticker-scroll",
        )?.currentTime,
  );
  expect(animationTimeAfter).toBeGreaterThan(animationTimeBefore ?? 0);
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
  expect(nextInterval).toBeGreaterThanOrEqual(59_999);
  expect(nextInterval).toBeLessThanOrEqual(75_000);
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

test("reduced motion keeps full ticker messages readable and controls usable @news-ticker", async ({
  freshGame,
}) => {
  await freshGame.setViewportSize({ width: 390, height: 844 });
  await freshGame.emulateMedia({ reducedMotion: "reduce" });

  const ticker = freshGame.getByTestId("news-ticker");
  const dispatch = (category: "headline" | "prize" | "wacky", id: number) =>
    freshGame.evaluate(
      ({ entryCategory, entryId }) =>
        window.miaplacidusTest!.dispatch({
          type: "news.ticker.force",
          category: entryCategory,
          id: entryId,
        }),
      { entryCategory: category, entryId: id },
    );

  expect(await dispatch("wacky", 1002)).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "1002");
  const message = ticker.locator(".news-ticker-message");
  await expect(message).toHaveCSS("position", "static");
  await expect(message).toHaveCSS("animation-name", "none");
  await expect(ticker.locator(".news-ticker-window")).toHaveCSS("white-space", "normal");
  const layout = await ticker.locator(".news-ticker-window").evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(layout.clientWidth).toBeGreaterThan(0);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  expect(layout.scrollHeight).toBeLessThanOrEqual(layout.clientHeight);

  const wackyAction = ticker.locator(".news-ticker-action").first();
  await expect(wackyAction).toBeVisible();
  await wackyAction.focus();
  await wackyAction.press("Enter");
  await expect(wackyAction).toBeDisabled();
  await expect(ticker.locator(".news-ticker-copy")).toHaveCSS("animation-name", "none");
  const reducedMotionEffects = await ticker.evaluate((element) =>
    Array.from(element.querySelectorAll<HTMLElement>("*"))
      .flatMap((subject) => subject.getAnimations())
      .map(
        (animation) => (animation as Animation & { readonly animationName?: string }).animationName,
      )
      .filter((name) => name?.startsWith("news-effect-")),
  );
  expect(
    reducedMotionEffects,
    "reduced motion suppresses activated effects on every subject",
  ).toEqual([]);

  expect(await dispatch("prize", 2000)).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "2000");
  await expect(ticker.locator(".news-ticker-copy")).toContainText("free Hydrogen");
  const claim = ticker.locator(".news-ticker-claim");
  await expect(claim).toBeVisible();
  await expect(claim).toHaveText("here");
  await claim.click();
  await expect(claim).toBeDisabled();
  await expect(claim).toHaveText("here");

  await freshGame.emulateMedia({ reducedMotion: "no-preference" });
  await freshGame.locator("#tab-settings").click();
  await freshGame.locator("#tab-settings-visual").click();
  await freshGame.locator("#settings-motion").check();
  expect(await freshGame.locator(".game-frame").getAttribute("data-reduced-motion")).toBe("true");
  expect(await dispatch("headline", 0)).toBe(true);
  await expect(ticker).toHaveAttribute("data-news-id", "0");
  await expect(message).toHaveCSS("position", "static");
  await expect(message).toHaveCSS("animation-name", "none");
  await expect(ticker.locator(".news-ticker-copy")).toContainText("Hydrogen surpluses");
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
