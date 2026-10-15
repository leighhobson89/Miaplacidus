import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { ECONOMIC_GOOD_IDS, LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { HIGHER_LOWER_PRIZE_TIERS } from "../../../src/content/galacticCasino";
import { starTypeForSystem } from "../../../src/content/starCatalogue";
import { starNameFromIdentity } from "../../../src/app/casinoEventNotifications";
import { formatNumber } from "../../../src/app/numberFormatting";
import type { GameState } from "../../../src/engine/state";
import { nextRandomInteger } from "../../../src/engine/random";
import {
  casinoHiloText,
  casinoOTypeClue,
  casinoText,
} from "../../../src/i18n/casinoMessages";
import { economyGoodName } from "../../../src/app/economyDisplay";

type HiloCashoutCase = Readonly<{
  tier: number;
  prizeKey: string;
}>;

const HILO_CASHOUT_CASES: readonly HiloCashoutCase[] = [
  { tier: 1, prizeKey: "hilo_cash_boost_small" },
  { tier: 1, prizeKey: "hilo_research_boost_small" },
  { tier: 1, prizeKey: "hilo_resource_topup" },
  { tier: 2, prizeKey: "special_double_hydrogen" },
  { tier: 5, prizeKey: "hilo_timewarp_25_20000" },
];

async function stateOf(page: import("@playwright/test").Page): Promise<GameState> {
  return page.evaluate(() => window.miaplacidusTest!.getState());
}

async function setLocale(
  page: import("@playwright/test").Page,
  locale: LocaleId,
): Promise<void> {
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

async function pauseClock(page: import("@playwright/test").Page): Promise<void> {
  const accepted = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({ type: "clock.pause" }),
  );
  expect(accepted).toBe(true);
}

async function openCasino(page: import("@playwright/test").Page) {
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  return page.getByTestId("galactic-casino-pane");
}

async function clearQueuedNotifications(page: import("@playwright/test").Page): Promise<void> {
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
  page: import("@playwright/test").Page,
  casino: import("@playwright/test").Locator,
  locale: LocaleId,
  amount: number,
): Promise<void> {
  await casino.getByLabel(casinoText(locale, "amount")).fill(String(amount));
  await casino.getByTestId("casino-buy-cp").click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.galacticCasino.casinoPoints))
    .toBe(amount);
}

async function advanceRandomDraws(
  page: import("@playwright/test").Page,
  count: number,
  purpose: string,
): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    const accepted = await page.evaluate((drawPurpose) =>
      window.miaplacidusTest!.dispatch({ type: "random.draw", purpose: drawPurpose }), purpose);
    expect(accepted).toBe(true);
  }
}

async function primePrizeAtTier(
  page: import("@playwright/test").Page,
  tier: number,
  prizeKey: string,
  purpose: string,
): Promise<void> {
  const tierPrizes = [...(HIGHER_LOWER_PRIZE_TIERS[tier] ?? HIGHER_LOWER_PRIZE_TIERS[1]!)];
  if (tier === 7 && prizeKey === "special_telescope_finish_void_pillage") {
    tierPrizes[3] = prizeKey;
  }
  const prizeIndex = tierPrizes.indexOf(prizeKey);
  expect(prizeIndex, `the target prize ${prizeKey} belongs to Hilo tier ${tier}`).toBeGreaterThanOrEqual(0);
  const random = (await stateOf(page)).run.random;
  let skippedDraws = 0;
  while (
    nextRandomInteger(
      { seed: random.seed, draws: random.draws + skippedDraws + 9 + tier - 1 },
      0,
      tierPrizes.length - 1,
    ).value !== prizeIndex
  ) {
    skippedDraws += 1;
    expect(skippedDraws, `the deterministic Hilo seed should reach ${prizeKey}`).toBeLessThan(10_000);
  }
  await advanceRandomDraws(page, skippedDraws, purpose);
}

async function advanceHiloToTier(
  page: import("@playwright/test").Page,
  casino: import("@playwright/test").Locator,
  locale: LocaleId,
  tier: number,
): Promise<void> {
  for (let turn = 1; turn <= tier + 1; turn += 1) {
    const round = (await stateOf(page)).permanent.galacticCasino.higherLower;
    expect(round, "Hilo should remain active until the selected tier is reached").not.toBeNull();
    const current = round!.deck[round!.index]!;
    const next = round!.deck[round!.index + 1]!;
    const direction = next.rank > current.rank ? "higher" : "lower";
    await casino.getByRole("button", { name: casinoText(locale, direction), exact: true }).click();
    if (tier === 7 && turn === 8) {
      await expect
        .poll(
          () =>
            page.evaluate(
              () => window.miaplacidusTest!.getState().permanent.galacticCasino.higherLower,
            ),
        )
        .toBeNull();
    } else {
      await expect
        .poll(
          () =>
            page.evaluate(
              () => window.miaplacidusTest!.getState().permanent.galacticCasino.higherLower?.index,
            ),
        )
        .toBe(turn);
    }
  }
}

function quantity(locale: LocaleId, state: GameState, value: number, fractionDigits = 0): string {
  return formatNumber(locale, value, fractionDigits, state.settings.notation);
}

function cashoutPrizeText(
  locale: LocaleId,
  before: GameState,
  after: GameState,
  prizeKey: string,
): string {
  if (prizeKey === "hilo_cash_boost_small") {
    const amount = after.run.cash - before.run.cash;
    return `${casinoHiloText(locale, "cashBoost")} - ${casinoHiloText(locale, "awardCash").replace(
      "{amount}",
      quantity(locale, after, amount),
    )}`;
  }
  if (prizeKey === "hilo_research_boost_small") {
    const amount = after.run.researchPoints - before.run.researchPoints;
    return `${casinoHiloText(locale, "researchBoost")} - ${casinoHiloText(locale, "awardResearch").replace(
      "{amount}",
      quantity(locale, after, amount),
    )}`;
  }
  if (prizeKey === "hilo_resource_topup") {
    const goodId = ECONOMIC_GOOD_IDS.find(
      (id) => after.run.goods[id].quantity > before.run.goods[id].quantity,
    );
    expect(goodId, "the Hilo resource top-up should increase a localized good").toBeDefined();
    const amount = after.run.goods[goodId!].quantity - before.run.goods[goodId!].quantity;
    return `${casinoHiloText(locale, "resourceTopUp")} - ${casinoHiloText(locale, "awardMaterialAmount")
      .replace("{amount}", quantity(locale, after, amount))
      .replace("{material}", economyGoodName(locale, goodId!))}`;
  }
  if (prizeKey === "special_double_hydrogen") {
    return casinoHiloText(locale, "doubleMaterial").replace(
      "{material}",
      economyGoodName(locale, "hydrogen"),
    );
  }
  const multiplier = after.run.timeWarp.multiplier;
  const seconds = Math.round(after.run.timeWarp.remainingMs / 1000);
  return `${casinoHiloText(locale, "timeWarp").replace(
    "{multiplier}",
    quantity(locale, after, multiplier, 2),
  )} - ${casinoHiloText(locale, "awardTimeWarp")
    .replace("{multiplier}", quantity(locale, after, multiplier, 2))
    .replace("{seconds}", quantity(locale, after, seconds))}`;
}

function eligibleOTypeSystems(state: GameState): readonly string[] {
  const ship = state.run.space.starship;
  return state.run.space.systemProfiles
    .map((profile) => profile.systemId)
    .filter(
      (systemId) =>
        !state.permanent.settledSystemIds.includes(systemId) &&
        !(ship.destinationSystemId === systemId && ["travelling", "orbiting"].includes(ship.phase)) &&
        starTypeForSystem(systemId) === "O",
    );
}

function findOTypeClueOffset(
  random: GameState["run"]["random"],
  eligibleCount: number,
  targetClueIndex: number,
): number {
  for (let skippedDraws = 0; skippedDraws < 10_000; skippedDraws += 1) {
    const first = nextRandomInteger(
      { seed: random.seed, draws: random.draws + skippedDraws },
      0,
      6,
    ).value;
    const second = nextRandomInteger(
      { seed: random.seed, draws: random.draws + skippedDraws + 1 },
      0,
      6,
    ).value;
    const selectedStarIndex = nextRandomInteger(
      { seed: random.seed, draws: random.draws + skippedDraws + 2 },
      0,
      eligibleCount - 1,
    ).value;
    const clueTemplate = nextRandomInteger(
      { seed: random.seed, draws: random.draws + skippedDraws + 3 },
      0,
      2,
    ).value;
    if (
      first === second &&
      selectedStarIndex < eligibleCount &&
      clueTemplate === targetClueIndex
    )
      return skippedDraws;
  }
  throw new Error(`The deterministic Void Seer seed did not yield O-type clue template ${targetClueIndex}`);
}

for (const locale of LOCALE_IDS) {
  test(`localizes Hilo award detail templates (${locale}) @p7-casino-hilo-detail-locales @p8-v59`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await startMetaFixture(page, "meta-casino-ready");
    await setLocale(page, locale);
    await pauseClock(page);
    const casino = await openCasino(page);
    await buyCasinoPoints(page, casino, locale, HILO_CASHOUT_CASES.length * 5);

    for (const [caseIndex, outcome] of HILO_CASHOUT_CASES.entries()) {
      await primePrizeAtTier(
        page,
        outcome.tier,
        outcome.prizeKey,
        `p7-hilo-detail-${caseIndex}-seed`,
      );
      await casino.getByTestId("casino-hilo-start").click();
      await advanceHiloToTier(page, casino, locale, outcome.tier);
      const round = (await stateOf(page)).permanent.galacticCasino.higherLower;
      expect(round?.prizeKey).toBe(outcome.prizeKey);
      const revealedCount = round!.index + 1;
      const beforeAward = await stateOf(page);
      await clearQueuedNotifications(page);
      await casino.getByRole("button", { name: casinoText(locale, "cashOut"), exact: true }).click();
      const afterAward = await stateOf(page);
      const expected = casinoText(locale, "hiloCashOutNotification")
        .replace("{count}", quantity(locale, afterAward, revealedCount))
        .replace(
          "{prize}",
          cashoutPrizeText(locale, beforeAward, afterAward, outcome.prizeKey),
        );
      await expect(
        page
          .getByTestId("notification-stack")
          .locator('[data-classification="galacticCasino"]'),
      ).toHaveText(expected, { timeout: 10_000 });
      expect(afterAward.permanent.galacticCasino.higherLower).toBeNull();
    }
  });

  for (const completion of [
    {
      fixture: "meta-casino-telescope-asteroid-prize" as const,
      prizeKey: "special_telescope_finish_asteroid_search",
      prizeNameKey: "finishAsteroid" as const,
      detailKey: "awardFinishedAsteroidSearch" as const,
    },
    {
      fixture: "meta-casino-telescope-star-study-prize" as const,
      prizeKey: "special_telescope_finish_star_study",
      prizeNameKey: "finishStarStudy" as const,
      detailKey: "awardFinishedStarStudy" as const,
    },
    {
      fixture: "meta-casino-telescope-void-pillage-prize" as const,
      prizeKey: "special_telescope_finish_void_pillage",
      prizeNameKey: "finishVoid" as const,
      detailKey: "awardFinishedVoidPillage" as const,
    },
  ]) {
    test(`localizes Hilo ${completion.prizeKey} completion detail (${locale}) @p7-casino-hilo-detail-locales @p8-v59`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await startMetaFixture(page, completion.fixture);
      await setLocale(page, locale);
      await pauseClock(page);
      const casino = await openCasino(page);
      await buyCasinoPoints(page, casino, locale, 5);
      await primePrizeAtTier(page, 7, completion.prizeKey, `p7-hilo-${completion.prizeKey}-seed`);
      const before = await stateOf(page);
      await casino.getByTestId("casino-hilo-start").click();
      await advanceHiloToTier(page, casino, locale, 7);
      const after = await stateOf(page);
      const notice = page
        .getByTestId("notification-stack")
        .locator('[data-classification="galacticCasino"]');
      let suffix = "";
      if (completion.detailKey === "awardFinishedAsteroidSearch") {
        const oldAsteroidIds = new Set(before.run.space.asteroids.map((asteroid) => asteroid.id));
        const discovered = after.run.space.asteroids.find((asteroid) => !oldAsteroidIds.has(asteroid.id));
        suffix = discovered ? ` (${discovered.name})` : "";
      }
      const detail = casinoHiloText(locale, completion.detailKey).replace("{suffix}", suffix);
      const expected = casinoText(locale, "hiloFullDeckNotification").replace(
        "{prize}",
        `${casinoHiloText(locale, completion.prizeNameKey)} - ${detail}`,
      );
      await expect(notice).toHaveText(expected, { timeout: 10_000 });
      expect(after.run.timers[
        completion.fixture === "meta-casino-telescope-asteroid-prize"
          ? "survey:asteroid-scan"
          : completion.fixture === "meta-casino-telescope-star-study-prize"
            ? "survey:star-study"
            : "survey:void-pillage"
      ]?.status).toBe("complete");
      expect(after.run.space.activeSurvey).toBeNull();
    });
  }

  test(`localizes all three Void Seer O-type clue messages (${locale}) @p7-casino-o-type-clue-locales @p8-v59`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await startMetaFixture(page, "meta-megastructure-route");
    await setLocale(page, locale);
    await pauseClock(page);
    const casino = await openCasino(page);
    const eligible = eligibleOTypeSystems(await stateOf(page));
    expect(eligible.length, "the fixture must expose at least one discovered, unsettled O-type star")
      .toBeGreaterThan(0);
    await buyCasinoPoints(page, casino, locale, 21);

    const notices = page
      .getByTestId("notification-stack")
      .locator('[data-classification="galacticCasino"]');
    for (let clueIndex = 0; clueIndex < 3; clueIndex += 1) {
      const random = (await stateOf(page)).run.random;
      const skippedDraws = findOTypeClueOffset(random, eligible.length, clueIndex);
      await advanceRandomDraws(page, skippedDraws, `p7-o-type-clue-${clueIndex}-seed`);
      await casino.getByLabel(casinoText(locale, "tier")).selectOption("1");
      await clearQueuedNotifications(page);
      await casino.getByTestId("casino-void-seer-play").click();
      await expect
        .poll(() => page.evaluate(() => window.miaplacidusTest!.getState().permanent.galacticCasino.history.at(-1)?.result), {
          timeout: 15_000,
        })
        .toMatch(/^o-type-clue:/);
      const result = (await stateOf(page)).permanent.galacticCasino.history.at(-1)?.result ?? "";
      const starId = result.slice("o-type-clue:".length);
      const clue = casinoOTypeClue(locale, clueIndex).replaceAll(
        "{STAR}",
        starNameFromIdentity(starId),
      );
      const expected = casinoText(locale, "voidWinWithClueNotification").replace("{clue}", clue);
      await expect(notices).toHaveText(expected, { timeout: 15_000 });
      expect(starId).not.toBe("");
    }
  });
}

// HILO_COPY.awardMaterialDoubled is populated but has no active rendered route:
// hiloAwardDetail returns null for material-doubled awards, and Casino notices
// display the separate doubleMaterial prize label instead. It remains unasserted
// here pending an owner-approved active route. Rocket and Starship journey details
// are covered by p7-warp-notification-locales.spec.ts.
