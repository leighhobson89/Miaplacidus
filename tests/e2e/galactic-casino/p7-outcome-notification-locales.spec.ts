import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { COMPOUND_IDS, LOCALE_IDS, MATERIAL_IDS, type LocaleId } from "../../../src/content/ids";
import { nextRandom, nextRandomInteger } from "../../../src/engine/random";
import type { NumberNotation } from "../../../src/engine/state";
import { economyGoodName } from "../../../src/app/economyDisplay";
import { formatNumber } from "../../../src/app/numberFormatting";
import { casinoFailureText, casinoText } from "../../../src/i18n/casinoMessages";

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
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

async function openCasino(page: import("@playwright/test").Page) {
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  return page.getByTestId("galactic-casino-pane");
}

async function clearQueuedNotifications(page: import("@playwright/test").Page) {
  const stack = page.getByTestId("notification-stack");
  for (const notificationsEnabled of [false, true]) {
    const accepted = await page.evaluate((enabled) =>
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { notificationsEnabled: enabled },
      }), notificationsEnabled);
    expect(accepted).toBe(true);
    await expect(stack).toBeEmpty();
  }
}

async function buyCasinoPoints(
  casino: import("@playwright/test").Locator,
  locale: LocaleId,
  amount: number,
) {
  await casino.getByLabel(casinoText(locale, "amount")).fill(String(amount));
  await casino.getByTestId("casino-buy-cp").click();
  await expect
    .poll(() =>
      casino.evaluate(() =>
        window.miaplacidusTest!.getState().permanent.galacticCasino.casinoPoints,
      ),
    )
    .toBe(amount);
}

async function advanceRandomDraws(
  page: import("@playwright/test").Page,
  skippedDraws: number,
  purpose: string,
) {
  for (let index = 0; index < skippedDraws; index += 1) {
    const accepted = await page.evaluate((drawPurpose) =>
      window.miaplacidusTest!.dispatch({ type: "random.draw", purpose: drawPurpose }), purpose);
    expect(accepted).toBe(true);
  }
}

async function primeDoubleOrNothing(
  page: import("@playwright/test").Page,
  outcome: "win" | "loss",
) {
  const random = await page.evaluate(() => window.miaplacidusTest!.getState().run.random);
  const wins = (value: number) => value < 0.4;
  let skippedDraws = 0;
  while (wins(nextRandom({ seed: random.seed, draws: random.draws + skippedDraws }).value) !==
    (outcome === "win")) {
    skippedDraws += 1;
    expect(skippedDraws, "the deterministic Casino seed should yield both Double-or-Nothing outcomes")
      .toBeLessThan(100);
  }
  await advanceRandomDraws(page, skippedDraws, `p7-casino-don-${outcome}-seed`);
}

async function primeWheelIndex(
  page: import("@playwright/test").Page,
  predicate: (index: number) => boolean,
  purpose: string,
) {
  const random = await page.evaluate(() => window.miaplacidusTest!.getState().run.random);
  let skippedDraws = 0;
  while (
    !predicate(
      nextRandomInteger(
        { seed: random.seed, draws: random.draws + skippedDraws },
        0,
        15,
      ).value,
    )
  ) {
    skippedDraws += 1;
    expect(skippedDraws, "the deterministic Casino seed should reach the requested Wheel sector")
      .toBeLessThan(100);
  }
  await advanceRandomDraws(page, skippedDraws, purpose);
}

async function primeWheelCategory(
  page: import("@playwright/test").Page,
  category: number,
) {
  const random = await page.evaluate(() => window.miaplacidusTest!.getState().run.random);
  let skippedDraws = 0;
  while (true) {
    const wheelIndex = nextRandomInteger(
      { seed: random.seed, draws: random.draws + skippedDraws },
      0,
      15,
    ).value;
    const prizeCategory = nextRandomInteger(
      { seed: random.seed, draws: random.draws + skippedDraws + 1 },
      0,
      5,
    ).value;
    if (wheelIndex > 0 && wheelIndex % 2 === 0 && prizeCategory === category) break;
    skippedDraws += 1;
    expect(skippedDraws, "the deterministic Casino seed should reach the requested prize category")
      .toBeLessThan(100);
  }
  await advanceRandomDraws(page, skippedDraws, `p7-casino-wheel-category-${category}-seed`);
}

function formatted(locale: LocaleId, amount: number, notation: NumberNotation): string {
  return formatNumber(locale, amount, 0, notation);
}

async function stateOf(page: import("@playwright/test").Page) {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

for (const locale of LOCALE_IDS) {
  test(`localizes Double-or-Nothing outcomes and entry guidance (${locale}) @p7-casino-outcome-notification-locales @p8-v59`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-casino-ready");
    await setLocale(page, locale);
    const casino = await openCasino(page);
    const notices = page
      .getByTestId("notification-stack")
      .locator('[data-classification="galacticCasino"]');
    await clearQueuedNotifications(page);

    const stake = casino.getByLabel(casinoText(locale, "stake"));
    const play = casino.getByTestId("casino-don-play");
    const initialState = await stateOf(page);
    await stake.fill("0");
    await expect(casino.locator("#casino-don-reason")).toHaveText(
      casinoFailureText(locale, "casino-invalid-amount"),
    );
    await expect(play).toBeDisabled();
    await expect(notices).toBeEmpty();

    await stake.fill("1");
    await expect(casino.locator("#casino-don-reason")).toHaveText(
      casinoFailureText(locale, "casino-insufficient-cp", {
        required: formatted(locale, 1, initialState.settings.notation),
        available: formatted(locale, 0, initialState.settings.notation),
      }),
    );
    await expect(play).toBeDisabled();
    await expect(notices).toBeEmpty();

    await buyCasinoPoints(casino, locale, 50);
    await primeDoubleOrNothing(page, "win");
    await clearQueuedNotifications(page);
    await play.click();
    await expect(notices).toHaveText(casinoText(locale, "doubleOrNothingWinNotification"), {
      timeout: 10_000,
    });

    await primeDoubleOrNothing(page, "loss");
    await clearQueuedNotifications(page);
    await play.click();
    await expect(notices).toHaveText(casinoText(locale, "doubleOrNothingLossNotification"), {
      timeout: 10_000,
    });
  });

  test(`localizes Wheel losses, all reachable regular prize notices, and inline errors (${locale}) @p7-casino-outcome-notification-locales @p8-v59`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await startMetaFixture(page, "meta-casino-telescope-asteroid-prize");
    await setLocale(page, locale);
    const paused = await page.evaluate(() =>
      window.miaplacidusTest!.dispatch({ type: "clock.pause" }),
    );
    expect(paused).toBe(true);
    const casino = await openCasino(page);
    const notices = page
      .getByTestId("notification-stack")
      .locator('[data-classification="galacticCasino"]');
    await clearQueuedNotifications(page);

    const wheelSpin = casino.getByTestId("casino-wheel-spin");
    const zeroCpState = await stateOf(page);
    await expect(wheelSpin).toBeDisabled();
    await expect(casino.locator("#casino-wheel-spin-reason")).toHaveText(
      casinoFailureText(locale, "casino-insufficient-cp", {
        required: formatted(locale, 1, zeroCpState.settings.notation),
        available: formatted(locale, 0, zeroCpState.settings.notation),
      }),
    );
    await expect(notices).toBeEmpty();
    await buyCasinoPoints(casino, locale, 50);

    await primeWheelIndex(page, (index) => index % 2 === 1, "p7-casino-wheel-loss-seed");
    await clearQueuedNotifications(page);
    await wheelSpin.click();
    await expect(notices).toHaveText(casinoText(locale, "wheelLossNotification"), {
      timeout: 10_000,
    });

    const assertPrizeNotice = async (category: number) => {
      await clearQueuedNotifications(page);
      await primeWheelCategory(page, category);
      const before = await stateOf(page);
      await wheelSpin.click();
      const after = await stateOf(page);
      const prefix = casinoText(locale, "wheelWinPrefix");
      let expected: string;

      if (category === 0 || category === 1) {
        const ids = category === 0 ? MATERIAL_IDS : COMPOUND_IDS;
        const goodId = ids.find(
          (id) => after.run.goods[id].quantity > before.run.goods[id].quantity,
        );
        expect(goodId, `Wheel prize category ${category} should increase one localized good`)
          .toBeDefined();
        const amount = after.run.goods[goodId!].quantity - before.run.goods[goodId!].quantity;
        expected = `${prefix}${formatted(locale, amount, after.settings.notation)} ${economyGoodName(locale, goodId!)}`;
      } else if (category === 2) {
        expected = `${prefix}${formatted(locale, after.run.cash - before.run.cash, after.settings.notation)} ${casinoText(locale, "cash")}`;
      } else if (category === 3) {
        expected = `${prefix}${formatted(locale, after.run.researchPoints - before.run.researchPoints, after.settings.notation)} ${casinoText(locale, "researchPoints")}`;
      } else if (category === 4) {
        const timerId = "survey:asteroid-scan";
        const timerBefore = before.run.timers[timerId]!;
        const timerAfter = after.run.timers[timerId]!;
        const beforeRemaining = timerBefore.durationMs - timerBefore.elapsedMs;
        const afterRemaining = timerAfter.durationMs - timerAfter.elapsedMs;
        expected = casinoText(locale, "wheelTimeReducedMessage")
          .replaceAll("{label}", casinoText(locale, "wheelTimerAsteroidScanLabel"))
          .replaceAll("{from}", formatted(locale, Math.ceil(beforeRemaining / 1000), after.settings.notation))
          .replaceAll("{to}", formatted(locale, Math.ceil(afterRemaining / 1000), after.settings.notation));
      } else {
        expected = `${prefix}${formatted(locale, 2, after.settings.notation)} ${casinoText(locale, "wheelCurrencyCp")}`;
      }

      expect(expected, `locale ${locale} has populated Wheel outcome copy`).not.toBe("");
      await expect(notices).toHaveText(expected, { timeout: 10_000 });
    };

    for (const category of [0, 1, 2, 3, 4, 5]) await assertPrizeNotice(category);

    await clearQueuedNotifications(page);
    await primeWheelIndex(page, (index) => index === 0, "p7-casino-wheel-special-ready-seed");
    await wheelSpin.click();
    await expect(notices).toHaveText(casinoText(locale, "wheelSpecialReadyNotification"), {
      timeout: 10_000,
    });
    await clearQueuedNotifications(page);
    await expect(wheelSpin).toBeDisabled();
    await expect(casino.locator("#casino-wheel-spin-reason")).toHaveText(
      casinoFailureText(locale, "casino-wheel-prize-pending"),
    );
    await expect(notices).toBeEmpty();
  });

  test(`localizes non-travel Wheel special-prize claim notices (${locale}) @p7-casino-outcome-notification-locales @p8-v59`, async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-casino-ready");
    await setLocale(page, locale);
    const casino = await openCasino(page);
    const notices = page
      .getByTestId("notification-stack")
      .locator('[data-classification="galacticCasino"]');
    await buyCasinoPoints(casino, locale, 50);

    const claim = async (prize: string, expected: string) => {
      await primeWheelIndex(page, (index) => index === 0, `p7-casino-special-${prize}-seed`);
      await clearQueuedNotifications(page);
      await casino.getByTestId("casino-wheel-spin").click();
      await expect(notices).toHaveText(casinoText(locale, "wheelSpecialReadyNotification"), {
        timeout: 10_000,
      });
      await clearQueuedNotifications(page);
      await casino.getByLabel(casinoText(locale, "choosePrize")).selectOption(prize);
      await casino.getByTestId("casino-wheel-claim").click();
      await expect(notices).toHaveText(expected, { timeout: 10_000 });
    };

    await claim("special_100cp", casinoText(locale, "wheelClaim100CpNotification"));

    const state = await stateOf(page);
    const researchNotice = casinoText(locale, "wheelClaimResearchNotification").replace(
      /100(?:[.,\s\u202f]?000)/,
      formatted(locale, 100_000, state.settings.notation),
    );
    await claim("special_100k_research", researchNotice);

    await claim(
      "special_double_hydrogen",
      `${casinoText(locale, "wheelClaimDoublePrefix")}${economyGoodName(locale, "hydrogen")}${casinoText(locale, "wheelClaimDoubleSuffix")}`,
    );
  });
}
