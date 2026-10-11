import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatNumber } from "../../../src/app/numberFormatting";
import { LOCALE_IDS } from "../../../src/content/ids";
import { quoteGalacticTrade } from "../../../src/engine/galacticMarket";
import { transition } from "../../../src/engine/commands";
import { casinoEventNotice } from "../../../src/app/casinoEventNotifications";
import {
  marketFailureText,
  marketLockCountdownText,
  marketOfflineNotificationText,
  marketText,
} from "../../../src/i18n/metaMessages";
import { casinoFailureText, casinoText } from "../../../src/i18n/casinoMessages";

test("P-45 Galactic Market trade and lockdown feedback render in all locales @p45-meta-locales", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-market-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-market").click();
  const market = page.locator(".galactic-market-pane");

  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const quote = quoteGalacticTrade(state, "hydrogen", "helium", 10);
    expect(quote, `${locale} trade quote`).not.toBeNull();

    await market.getByLabel(marketText(locale, "outgoing")).selectOption("hydrogen");
    await market.getByLabel(marketText(locale, "incoming")).selectOption("helium");
    await market.getByLabel(marketText(locale, "quantity")).fill("10");
    await market.getByRole("button", { name: marketText(locale, "trade"), exact: true }).click();

    const expectedTradeNotice = marketText(locale, "tradeCompleteNotification")
      .replace(
        "{outgoing}",
        `${formatNumber(locale, Math.floor(10 - quote!.commissionQuantity), 0, state.settings.notation)} ${economyGoodName(locale, "hydrogen")}`,
      )
      .replace(
        "{incoming}",
        `${formatNumber(locale, quote!.incomingQuantity, 0, state.settings.notation)} ${economyGoodName(locale, "helium")}`,
      )
      .replace(
        "{commission}",
        `${formatNumber(locale, quote!.commissionQuantity, 0, state.settings.notation)} ${economyGoodName(locale, "hydrogen")}`,
      );
    const notice = page.locator('[data-testid="game-notification"][data-classification="special"]');
    await expect(notice).toHaveText(expectedTradeNotice);
    await expect(notice).toHaveCount(0, { timeout: 6_000 });
  }

  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "galacticMarketLockdown",
    }),
  );
  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await page.locator("#tab-galactic-ascendency-perks").click();
    await page.locator("#tab-galactic-market").click();
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const lockedReason = `${marketFailureText(locale, "market-locked")} ${marketLockCountdownText(
      locale,
      state.run.marketLockdownRemainingMs,
      (value) => formatNumber(locale, value, 0, state.settings.notation),
    )}`;
    const tradeButton = market.getByRole("button", {
      name: marketText(locale, "trade"),
      exact: true,
    });
    await expect(tradeButton).toBeDisabled();
    await expect(tradeButton).toHaveAttribute("aria-describedby", "galactic-market-trade-reason");
    await expect(market.locator("#galactic-market-trade-reason")).toHaveText(lockedReason);
    const notice = page
      .locator('[data-testid="game-notification"][data-classification="special"]')
      .filter({ hasText: marketOfflineNotificationText(locale) });
    await expect(notice).toHaveText(marketOfflineNotificationText(locale), { timeout: 6_000 });
    await expect(notice).toHaveClass(/notification-warning/);
    await expect(notice).toHaveCount(0, { timeout: 4_000 });
  }
});

test("P-45 Casino Double-or-Nothing result notices render in all locales @p45-meta-locales", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");
  const notices = page
    .getByTestId("notification-stack")
    .locator('[data-testid="game-notification"][data-classification="galacticCasino"]');
  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const play = casino.getByTestId("casino-don-play");
    await expect(play).toBeDisabled();
    await expect(play).toHaveAttribute("aria-describedby", "casino-don-reason");
    await expect(casino.locator("#casino-don-reason")).toHaveText(
      casinoFailureText(locale, "casino-insufficient-cp", {
        required: formatNumber(locale, 1, 0),
        available: formatNumber(locale, 0, 0),
      }),
    );
  }

  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "en" },
    }),
  );
  await casino.getByLabel(casinoText("en", "amount")).fill("20");
  await casino.getByTestId("casino-buy-cp").click();
  await expect(casino.getByTestId("casino-balance")).toHaveText("20 CP");

  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await casino.getByLabel(casinoText(locale, "stake")).fill("1");
    await casino.getByTestId("casino-don-play").click();
    const outcome = await page.evaluate(() =>
      window.miaplacidusTest!.getState().permanent.galacticCasino.history.at(-1),
    );
    expect(outcome?.gameId, `${locale} accepted Double-or-Nothing play`).toBe("doubleOrNothing");
    const key =
      outcome?.result === "win"
        ? "doubleOrNothingWinNotification"
        : "doubleOrNothingLossNotification";
    const notice = notices.filter({ hasText: casinoText(locale, key) });
    await expect(notice).toHaveText(casinoText(locale, key));
    await expect(notice).toHaveClass(
      new RegExp(outcome?.result === "win" ? "notification-info" : "notification-error"),
    );
    await expect(notices).toHaveCount(0, { timeout: 4_000 });
  }
});

test("P-45 Casino Wheel ready and claim feedback render in all locales @p45-meta-locales", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const [index, locale] of LOCALE_IDS.entries()) {
    if (index > 0) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
    await startMetaFixture(page, "meta-casino-ready");
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, reducedMotion: true },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-casino").click();
    const casino = page.getByTestId("galactic-casino-pane");
    const notices = page
      .getByTestId("notification-stack")
      .locator('[data-testid="game-notification"][data-classification="galacticCasino"]');

    await casino.getByLabel(casinoText(locale, "amount")).fill("1");
    await casino.getByTestId("casino-buy-cp").click();
    await casino.getByTestId("casino-wheel-spin").click();
    const spinResult = await page.evaluate(() =>
      window.miaplacidusTest!.getState().permanent.galacticCasino.history.at(-1),
    );
    expect(spinResult?.gameId, `${locale} Wheel outcome`).toBe("wheel");
    expect(spinResult?.result, `${locale} Wheel result`).toBe("special-ready");
    const readyNotice = notices.filter({
      hasText: casinoText(locale, "wheelSpecialReadyNotification"),
    });
    await expect(readyNotice).toHaveText(casinoText(locale, "wheelSpecialReadyNotification"));
    await expect(readyNotice).toHaveClass(/notification-info/);

    await casino.getByLabel(casinoText(locale, "choosePrize")).selectOption("special_100cp");
    await casino.getByTestId("casino-wheel-claim").click();
    const expectedClaim = casinoText(locale, "wheelClaim100CpNotification").replace(
      "100",
      formatNumber(locale, 100, 0),
    );
    const claimNotice = notices.filter({ hasText: expectedClaim });
    await expect(claimNotice).toHaveText(expectedClaim);
    await expect(claimNotice).toHaveClass(/notification-info/);
  }
});

test("P-45 Casino Hilo cashout and Void Seer results render in all locales @p45-meta-locales", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const [index, locale] of LOCALE_IDS.entries()) {
    if (index > 0) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
    await startMetaFixture(page, "meta-casino-ready");
    await page.evaluate((nextLocale) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale, reducedMotion: true },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-casino").click();
    const casino = page.getByTestId("galactic-casino-pane");
    const notices = page
      .getByTestId("notification-stack")
      .locator('[data-testid="game-notification"][data-classification="galacticCasino"]');

    await casino.getByLabel(casinoText(locale, "amount")).fill("20");
    await casino.getByTestId("casino-buy-cp").click();
    await casino.getByTestId("casino-hilo-start").click();
    for (let turn = 0; turn < 2; turn += 1) {
      const state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const round = state.permanent.galacticCasino.higherLower!;
      const nextCard = round.deck[round.index + 1]!;
      const currentCard = round.deck[round.index]!;
      await casino
        .getByRole("button", {
          name: casinoText(locale, nextCard.rank > currentCard.rank ? "higher" : "lower"),
          exact: true,
        })
        .click();
      await expect
        .poll(() =>
          page.evaluate(
            () => window.miaplacidusTest!.getState().permanent.galacticCasino.higherLower?.index,
          ),
        )
        .toBe(round.index + 1);
      await expect(notices).toHaveCount(0);
    }

    const beforeCashout = await page.evaluate(() => window.miaplacidusTest!.getState());
    const expectedCashout = transition(beforeCashout, {
      type: "casino.higher-lower.cash-out",
    });
    const cashoutNotice = casinoEventNotice(
      locale,
      expectedCashout.events[0]!,
      expectedCashout.state,
    );
    expect(cashoutNotice).not.toBeNull();
    await casino.getByRole("button", { name: casinoText(locale, "cashOut"), exact: true }).click();
    const renderedCashout = notices.filter({ hasText: cashoutNotice!.message });
    await expect(renderedCashout).toHaveText(cashoutNotice!.message);
    await expect(renderedCashout).toHaveClass(new RegExp(`notification-${cashoutNotice!.type}`));

    await casino.getByLabel(casinoText(locale, "tier")).selectOption("1");
    const beforeVoidSeer = await page.evaluate(() => window.miaplacidusTest!.getState());
    const expectedVoidSeer = transition(beforeVoidSeer, {
      type: "casino.void-seer.play",
      tier: 1,
    });
    const voidNotice = casinoEventNotice(
      locale,
      expectedVoidSeer.events[0]!,
      expectedVoidSeer.state,
    );
    expect(voidNotice).not.toBeNull();
    await casino.getByTestId("casino-void-seer-play").click();
    const renderedVoid = notices.filter({ hasText: voidNotice!.message });
    await expect(renderedVoid).toHaveText(voidNotice!.message);
    await expect(renderedVoid).toHaveClass(new RegExp(`notification-${voidNotice!.type}`));
  }
});
