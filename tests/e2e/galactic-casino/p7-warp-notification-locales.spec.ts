import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { nextRandomInteger } from "../../../src/engine/random";
import {
  casinoHistoryText,
  casinoHiloText,
  casinoPrizeText,
  casinoSpecialName,
  casinoText,
  casinoWheelNotificationText,
} from "../../../src/i18n/casinoMessages";

async function setLocale(page: import("@playwright/test").Page, locale: LocaleId) {
  const accepted = await page.evaluate(
    (nextLocale) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      }),
    locale,
  );
  expect(accepted).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().settings.locale))
    .toBe(locale);
}

async function openCasino(page: import("@playwright/test").Page) {
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  return page.getByTestId("galactic-casino-pane");
}

async function clearQueuedNotifications(page: import("@playwright/test").Page) {
  const stack = page.getByTestId("notification-stack");
  for (const enabled of [false, true]) {
    const accepted = await page.evaluate(
      (notificationsEnabled) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { notificationsEnabled },
        }),
      enabled,
    );
    expect(accepted).toBe(true);
    await expect(stack).toBeEmpty();
  }
}

async function buyCasinoPoints(page: import("@playwright/test").Page, amount: number) {
  const accepted = await page.evaluate(
    (purchaseAmount) =>
      window.miaplacidusTest!.dispatch({
        type: "casino.points.buy",
        amount: purchaseAmount,
        goodId: "cash",
      }),
    amount,
  );
  expect(accepted).toBe(true);
}

async function primeWheelSpecialResult(page: import("@playwright/test").Page) {
  const random = await page.evaluate(() => window.miaplacidusTest!.getState().run.random);
  let skippedDraws = 0;
  while (
    nextRandomInteger(
      { seed: random.seed, draws: random.draws + skippedDraws },
      0,
      15,
    ).value !== 0
  ) {
    skippedDraws += 1;
    expect(
      skippedDraws,
      "the deterministic Wheel seed should yield a special result",
    ).toBeLessThan(100);
  }
  for (let index = 0; index < skippedDraws; index += 1) {
    const accepted = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "random.draw",
        purpose: "p7-casino-warp-notice-seed",
      }),
    );
    expect(accepted).toBe(true);
  }
}

async function primeStarshipFinishPrize(page: import("@playwright/test").Page) {
  const random = await page.evaluate(() => window.miaplacidusTest!.getState().run.random);
  let skippedDraws = 0;
  while (
    nextRandomInteger(
      { seed: random.seed, draws: random.draws + skippedDraws + 15 },
      0,
      4,
    ).value !== 1
  ) {
    skippedDraws += 1;
    expect(
      skippedDraws,
      "the deterministic Hilo seed should select Starship Journey",
    ).toBeLessThan(100);
  }
  for (let index = 0; index < skippedDraws; index += 1) {
    const accepted = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({
        type: "random.draw",
        purpose: "p7-casino-starship-finish-prize-seed",
      }),
    );
    expect(accepted).toBe(true);
  }
}

async function launchStarshipTowardSirius(page: import("@playwright/test").Page) {
  await page.locator("#tab-interstellar").click();
  const map = page.getByTestId("star-map-pane");
  await map.getByRole("searchbox").fill("Sirius");
  await map.locator(".star-map-search-results button").filter({ hasText: "Sirius" }).click();
  await map
    .getByTestId("star-selection")
    .getByRole("button", { name: "Set as destination" })
    .click();
  await page.locator("#tab-interstellar-starship").click();
  const starship = page.getByTestId("starship-pane");
  await starship.getByRole("button", { name: "Travel" }).click();
  await page
    .getByRole("dialog", { name: "Warning: point of no return" })
    .getByRole("button", { name: "Confirm launch" })
    .click();
  const state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const timerId = state.run.space.starship.timerId;
  expect(state.run.space.starship.phase).toBe("travelling");
  expect(timerId).not.toBeNull();
  expect(state.run.timers[timerId!]?.status).toBe("running");
  const clockPaused = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({ type: "clock.pause" }),
  );
  expect(clockPaused).toBe(true);
  return timerId!;
}

function fullDeckNotice(locale: LocaleId, prize: string, detail: string) {
  return casinoText(locale, "hiloFullDeckNotification").replace(
    "{prize}",
    `${casinoPrizeText(locale, prize)} - ${detail}`,
  );
}

for (const locale of LOCALE_IDS) {
  test(`localizes the Wheel Rocket warp result notice (${locale}) @p7-warp-notification-locales @p8-v59`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await startMetaFixture(page, "meta-casino-finish-rocket-journey");
    await setLocale(page, locale);
    const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
    const timerId = stateBefore.run.space.rockets.rocket1.timerId;
    expect(timerId).toBe("travel:rocket1-asteroid-journey");

    const casino = await openCasino(page);
    const notice = page
      .getByTestId("notification-stack")
      .locator('[data-classification="galacticCasino"]');
    await clearQueuedNotifications(page);
    await casino.getByTestId("casino-wheel-spin").click();
    await expect(casino.getByLabel(casinoText(locale, "choosePrize"))).toBeVisible({
      timeout: 6_000,
    });
    await expect(
      casino
        .getByLabel(casinoText(locale, "choosePrize"))
        .locator('option[value="special_rocket_warp"]'),
    ).toHaveText(casinoSpecialName(locale, "special_rocket_warp"));
    await casino
      .getByLabel(casinoText(locale, "choosePrize"))
      .selectOption("special_rocket_warp");
    await clearQueuedNotifications(page);
    await casino.getByTestId("casino-wheel-claim").click();

    const expected = casinoWheelNotificationText(locale, "claimRocketWarp")
      .replace("{rocket}", "Rocket 1 Prospector")
      .replace(
        "{destination}",
        `${casinoHistoryText(locale, "asteroidDestinationPrefix")}SPI-0002B`,
      );
    await expect(notice.filter({ hasText: expected })).toHaveText(expected, { timeout: 45_000 });
    const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(stateAfter.run.timers[timerId!]?.status).toBe("complete");
    expect(stateAfter.run.space.rockets.rocket1.phase).toBe("mining");
  });

  test(`localizes the Hilo Rocket journey finish result notice (${locale}) @p7-warp-notification-locales @p8-v59`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await startMetaFixture(page, "meta-casino-finish-rocket-journey");
    await setLocale(page, locale);
    const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
    const timerId = stateBefore.run.space.rockets.rocket1.timerId;
    expect(timerId).toBe("travel:rocket1-asteroid-journey");
    expect(stateBefore.permanent.galacticCasino.higherLower).toMatchObject({
      index: 7,
      prizeKey: "special_finish_rocket_journey",
    });

    const casino = await openCasino(page);
    const notice = page
      .getByTestId("notification-stack")
      .locator('[data-classification="galacticCasino"]');
    await clearQueuedNotifications(page);
    await casino
      .getByRole("button", { name: casinoText(locale, "higher"), exact: true })
      .click();

    const detail = casinoHiloText(locale, "awardFinishedRocketJourney").replace(
      "{suffix}",
      " Prospector",
    );
    const expected = fullDeckNotice(locale, "special_finish_rocket_journey", detail);
    await expect(notice.filter({ hasText: expected })).toHaveText(expected, { timeout: 10_000 });
    await expect(notice.filter({ hasText: expected })).toHaveClass(/notification-info/);
    const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(stateAfter.run.timers[timerId!]?.durationMs).toBe(2_000);
  });

  test(`localizes the Wheel Starship warp result notice (${locale}) @p7-warp-notification-locales @p8-v59`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await startMetaFixture(page, "meta-megastructure-route");
    await buyCasinoPoints(page, 100);
    const timerId = await launchStarshipTowardSirius(page);
    await setLocale(page, locale);
    const casino = await openCasino(page);
    const notice = page
      .getByTestId("notification-stack")
      .locator('[data-classification="galacticCasino"]');
    await clearQueuedNotifications(page);
    await primeWheelSpecialResult(page);
    await casino.getByTestId("casino-wheel-spin").click();
    await expect(casino.getByLabel(casinoText(locale, "choosePrize"))).toBeVisible({
      timeout: 6_000,
    });
    await expect(
      casino
        .getByLabel(casinoText(locale, "choosePrize"))
        .locator('option[value="special_starship_warp"]'),
    ).toHaveText(casinoSpecialName(locale, "special_starship_warp"));
    await casino
      .getByLabel(casinoText(locale, "choosePrize"))
      .selectOption("special_starship_warp");
    await clearQueuedNotifications(page);
    await casino.getByTestId("casino-wheel-claim").click();

    const expected = casinoWheelNotificationText(locale, "claimStarshipWarp").replace(
      "{star}",
      "Sirius",
    );
    await expect(notice.filter({ hasText: expected })).toHaveText(expected, { timeout: 10_000 });
    const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(stateAfter.run.timers[timerId]?.status).toBe("complete");
    expect(stateAfter.run.space.starship.phase).toBe("orbiting");
  });

  test(`localizes the Hilo Starship journey finish result notice (${locale}) @p7-warp-notification-locales @p8-v59`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await startMetaFixture(page, "meta-megastructure-route");
    await buyCasinoPoints(page, 20);
    const timerId = await launchStarshipTowardSirius(page);
    await setLocale(page, locale);
    const casino = await openCasino(page);
    const notice = page
      .getByTestId("notification-stack")
      .locator('[data-classification="galacticCasino"]');
    await clearQueuedNotifications(page);
    await primeStarshipFinishPrize(page);
    await casino.getByTestId("casino-hilo-start").click();

    for (let index = 1; index <= 8; index += 1) {
      const round = await page.evaluate(
        () => window.miaplacidusTest!.getState().permanent.galacticCasino.higherLower,
      );
      expect(round).not.toBeNull();
      const previous = round!.deck[round!.index]!;
      const next = round!.deck[round!.index + 1]!;
      const direction = next.rank > previous.rank ? "higher" : "lower";
      await casino
        .getByRole("button", { name: casinoText(locale, direction), exact: true })
        .click();
    }

    const detail = casinoHiloText(locale, "awardFinishedStarshipJourney").replace(
      "{star}",
      "Sirius",
    );
    const expected = fullDeckNotice(locale, "special_finish_starship_journey", detail);
    await expect(notice.filter({ hasText: expected })).toHaveText(expected, { timeout: 10_000 });
    await expect(notice.filter({ hasText: expected })).toHaveClass(/notification-info/);
    const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
    const timerAfter = stateAfter.run.timers[timerId]!;
    expect(timerAfter.durationMs - timerAfter.elapsedMs).toBe(2_000);
    expect(stateAfter.run.space.starship.phase).toBe("travelling");
  });
}
