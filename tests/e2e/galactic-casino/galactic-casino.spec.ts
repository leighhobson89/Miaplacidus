import { type Locator, type Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale, setNumberNotation } from "../_harness/settings-controls";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { formatNumber } from "../../../src/app/numberFormatting";
import {
  casinoSectionHelpLabel,
  casinoSectionHelpText,
  casinoText,
} from "../../../src/i18n/casinoMessages";

async function tabUntilFocused(page: Page, target: Locator): Promise<void> {
  for (let index = 0; index < 100; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Keyboard traversal did not reach the expected control");
}

test("Casino run counters use locale plural forms for zero, one and multiple counts @p47-casino-count-plurals", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startMetaFixture(page, "meta-casino-timewarp");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");
  const labels = {
    en: { playOne: "play", playOther: "plays", winOne: "win", winOther: "wins" },
    es: { playOne: "jugada", playOther: "jugadas", winOne: "victoria", winOther: "victorias" },
    pt: { playOne: "jogada", playOther: "jogadas", winOne: "vitória", winOther: "vitórias" },
    de: { playOne: "Spiel", playOther: "Spiele", winOne: "Sieg", winOther: "Siege" },
    it: { playOne: "partita", playOther: "partite", winOne: "vittoria", winOther: "vittorie" },
    fr: { playOne: "partie", playOther: "parties", winOne: "victoire", winOther: "victoires" },
  } as const;

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
    await expect(casino.getByTestId("casino-wheel-help")).toHaveText(
      casinoText(locale, "wheelHelp"),
    );
    const words = labels[locale];
    const noun = (kind: "play" | "win", count: number) => {
      const singular = new Intl.PluralRules(locale).select(count) === "one";
      return kind === "play"
        ? singular
          ? words.playOne
          : words.playOther
        : singular
          ? words.winOne
          : words.winOther;
    };
    await expect(casino.getByTestId("casino-run-stats-higherLower")).toHaveText(
      `${casinoText(locale, "runStats")}: 1 ${noun("play", 1)} · 0 ${noun("win", 0)}`,
    );
    await expect(casino.getByTestId("casino-run-stats-doubleOrNothing")).toHaveText(
      `${casinoText(locale, "runStats")}: 0 ${noun("play", 0)} · 0 ${noun("win", 0)}`,
    );
    await expect(casino.getByTestId("casino-lifetime-stats-doubleOrNothing")).toHaveText(
      `${casinoText(locale, "allTimeStats")}: 0 ${noun("play", 0)} · 0 ${noun("win", 0)}`,
    );
  }

  await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "settings.update",
      patch: { locale: "en" },
    }),
  );
  await casino.getByRole("button", { name: "Higher", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const stats = window.miaplacidusTest!.getState().run.casinoStats;
        return [stats.higherLowerPlayed, stats.higherLowerWon];
      }),
    )
    .toEqual([1, 1]);
  await casino.getByTestId("casino-hilo-start").click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const stats = window.miaplacidusTest!.getState().run.casinoStats;
        return [stats.higherLowerPlayed, stats.higherLowerWon];
      }),
    )
    .toEqual([2, 1]);

  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );
    const words = labels[locale];
    const singular = new Intl.PluralRules(locale).select(1) === "one";
    await expect(casino.getByTestId("casino-run-stats-higherLower")).toHaveText(
      `${casinoText(locale, "runStats")}: 2 ${words.playOther} · 1 ${singular ? words.winOne : words.winOther}`,
    );
  }
});

test("plays all four casino games and reloads a saved Higher or Lower round", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await expect(page.locator(".game-nav").getByRole("tab", { name: "Galactic Casino" })).toHaveCount(
    0,
  );
  await page.getByRole("tab", { name: "Galactic Casino" }).click();
  const casino = page.getByTestId("galactic-casino-pane");
  await expect(casino.getByRole("heading", { name: "Galactic Casino" })).toBeVisible();

  await casino.getByLabel("Points to buy").fill("20");
  await page.getByRole("tab", { name: "Galactic Market" }).click();
  await page.getByRole("tab", { name: "Galactic Casino" }).click();
  await expect(casino.getByLabel("Points to buy")).toHaveValue("20");
  await casino.getByTestId("casino-buy-cp").click();
  await expect(casino.getByTestId("casino-balance")).toHaveText("20 CP");
  let state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.cash).toBe(8_002_185);
  expect(state.permanent.galacticCasino.casinoPoints).toBe(20);

  await casino.getByTestId("casino-wheel-spin").click();
  await expect(casino.getByRole("status").first()).toContainText(
    "The wheel revealed a special prize",
  );
  await casino.getByLabel("Choose special prize").selectOption("special_100cp");
  await casino.getByTestId("casino-wheel-claim").click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.galacticCasino.casinoPoints).toBe(119);
  expect(state.run.casinoStats.wheelSpecialWon).toBe(1);

  const notices = page.getByTestId("notification-stack").getByTestId("game-notification");
  await expect(notices.first()).toHaveText("Special Prize Claimed! 100CP", { timeout: 7_500 });
  await casino.getByLabel("Stake in CP").fill("10");
  await casino.getByTestId("casino-don-play").click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.casinoStats.doubleOrNothingPlayed).toBe(1);
  const donOutcome = state.permanent.galacticCasino.history.at(-1);
  expect(donOutcome?.gameId).toBe("doubleOrNothing");
  expect(donOutcome?.result).toMatch(/^(win|loss)$/);
  await expect(notices).toHaveCount(1);
  const donNotice = notices.first();
  await expect(donNotice).toHaveAttribute("data-classification", "galacticCasino");
  await expect(donNotice).toHaveText(
    casinoText(
      "en",
      donOutcome?.result === "win"
        ? "doubleOrNothingWinNotification"
        : "doubleOrNothingLossNotification",
    ),
    { timeout: 5_000 },
  );
  await expect(donNotice).toHaveClass(
    new RegExp(donOutcome?.result === "win" ? "notification-info" : "notification-error"),
  );
  await expect(casino.locator("output.live-feedback")).toHaveText("");

  await casino.getByTestId("casino-hilo-start").click();
  for (let turn = 0; turn < 2; turn += 1) {
    state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const round = state.permanent.galacticCasino.higherLower!;
    const nextCard = round.deck[round.index + 1]!;
    const currentCard = round.deck[round.index]!;
    await casino
      .getByRole("button", {
        name: nextCard.rank > currentCard.rank ? "Higher" : "Lower",
        exact: true,
      })
      .click();
  }
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const savedRound = state.permanent.galacticCasino.higherLower;
  expect(savedRound?.index).toBe(2);
  expect(savedRound?.prizeKey).not.toBeNull();
  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");

  await page.reload();
  await resumeSavedPioneer(page, "Ascendency Pioneer");
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().run.pioneerName))
    .toBe("Ascendency Pioneer");
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.galacticCasino.higherLower).toEqual(savedRound);
  await page.getByRole("tab", { name: "Resources" }).click();
  await setGameLocale(page, "es");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const spanishCasino = page.getByTestId("galactic-casino-pane");
  await expect(spanishCasino.getByRole("heading", { name: "Casino galáctico" })).toBeVisible();
  await spanishCasino.getByRole("button", { name: "Retirar premio", exact: true }).click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.galacticCasino.higherLower).toBeNull();
  expect(state.run.casinoStats.higherLowerPlayed).toBe(1);

  await spanishCasino.getByLabel("Nivel de premio").selectOption("1");
  await spanishCasino.getByTestId("casino-void-seer-play").click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.casinoStats.voidSeerPlayed).toBe(1);
  await expect(
    spanishCasino.getByRole("region", { name: "Historial reciente" }).getByRole("listitem"),
  ).toHaveCount(5);
  await captureVisualCheckpoint(page, testInfo, "galactic-casino-roundtrip");
});

test("Wheel result notice waits for the spin and a claimed special prize gets its own notice", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");
  const casinoNotices = page
    .getByTestId("notification-stack")
    .locator('[data-classification="galacticCasino"]');

  await casino.getByLabel("Points to buy").fill("1");
  await casino.getByTestId("casino-buy-cp").click();
  await expect(casino.getByTestId("casino-balance")).toHaveText("1 CP");
  await expect(casinoNotices).toHaveCount(0);

  await casino.getByTestId("casino-wheel-spin").click();
  await expect(casinoNotices).toHaveCount(0);
  await page.waitForTimeout(300);
  await expect(casinoNotices).toHaveCount(0);
  await expect(casino.locator("#casino-wheel-spin-reason")).not.toHaveText(
    casinoText("en", "reasonWheelSpinning"),
    { timeout: 6_000 },
  );
  await expect(casinoNotices).toHaveCount(1);
  await expect(casinoNotices.first()).toHaveText(
    "WIN! Special Prize! - Select a Prize from the dropdown to continue.",
  );
  await expect(casinoNotices.first()).toHaveClass(/notification-info/);

  await casino.getByTestId("casino-wheel-spin").click();
  await expect(casinoNotices.first()).toHaveText("Claim your prize before spinning again.", {
    timeout: 6_000,
  });
  await expect(casinoNotices.first()).toHaveClass(/notification-info/);

  await casino.getByLabel("Choose special prize").selectOption("special_100cp");
  await casino.getByTestId("casino-wheel-claim").click();
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.galacticCasino.casinoPoints),
    )
    .toBe(100);
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().run.casinoStats.wheelSpecialWon),
    )
    .toBe(1);
  await expect(casinoNotices.first()).toHaveText("Special Prize Claimed! 100CP", {
    timeout: 10_000,
  });
  await expect(casinoNotices).toHaveCount(1);
});

test("P-41 Casino special-prize quantities follow the selected notation @precision @notation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");
  await casino.getByLabel("Points to buy").fill("1");
  await casino.getByTestId("casino-buy-cp").click();
  await casino.getByTestId("casino-wheel-spin").click();
  await expect(casino.getByRole("status").first()).toContainText(
    "The wheel revealed a special prize",
    { timeout: 7_500 },
  );

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-casino").click();
    await expect(
      casino.getByLabel("Choose special prize").locator('option[value="special_100k_research"]'),
    ).toContainText(formatNumber("en", 100_000, 0, notation));
  }
});

test("Hilo cashout and Void Seer outcomes use visible Casino notices while correct guesses stay quiet", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");
  const casinoNotices = page
    .getByTestId("notification-stack")
    .locator('[data-classification="galacticCasino"]');

  await casino.getByLabel("Points to buy").fill("20");
  await casino.getByTestId("casino-buy-cp").click();
  await expect(casino.getByTestId("casino-balance")).toHaveText("20 CP");
  await expect(casinoNotices).toHaveCount(0);

  await casino.getByTestId("casino-hilo-start").click();
  for (let turn = 0; turn < 2; turn += 1) {
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    const round = state.permanent.galacticCasino.higherLower!;
    const nextCard = round.deck[round.index + 1]!;
    const currentCard = round.deck[round.index]!;
    await casino
      .getByRole("button", {
        name: nextCard.rank > currentCard.rank ? "Higher" : "Lower",
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
    await expect(casinoNotices).toHaveCount(0);
  }

  const roundBeforeCashout = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.galacticCasino.higherLower,
  );
  expect(roundBeforeCashout?.index).toBe(2);
  const revealedCount = roundBeforeCashout!.index + 1;
  await casino.getByRole("button", { name: "Cash out", exact: true }).click();
  const stateAfterCashout = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateAfterCashout.permanent.galacticCasino.higherLower).toBeNull();
  expect(stateAfterCashout.permanent.galacticCasino.history.at(-1)?.gameId).toBe("higherLower");
  await expect(casinoNotices).toHaveCount(1);
  const cashoutNotice = casinoNotices.first();
  await expect(cashoutNotice).toHaveAttribute("data-classification", "galacticCasino");
  await expect(cashoutNotice).toHaveClass(/notification-info/);
  await expect(cashoutNotice).toHaveText(
    new RegExp(
      `^You cashed out at ${revealedCount} cards - (?:\\d+CP|Cash Boost(?: - \\d+ Cash)?|Research Boost(?: - \\d+ Research Points)?|Resource Top-Up - \\d+ .+|Compound Top-Up - \\d+ .+)$`,
    ),
  );

  await expect(casinoNotices).toHaveCount(0, { timeout: 5_000 });
  await casino.getByLabel("Prize tier").selectOption("1");
  await casino.getByTestId("casino-void-seer-play").click();
  const stateAfterVoidSeer = await page.evaluate(() => window.miaplacidusTest!.getState());
  const voidOutcome = stateAfterVoidSeer.permanent.galacticCasino.history.at(-1);
  expect(voidOutcome?.gameId).toBe("voidSeer");
  await expect(casinoNotices).toHaveCount(1);
  const voidNotice = casinoNotices.first();
  await expect(voidNotice).toHaveAttribute("data-classification", "galacticCasino");
  if (voidOutcome?.result === "loss") {
    await expect(voidNotice).toHaveClass(/notification-error/);
    await expect(voidNotice).toHaveText("LOSE! Better luck next time");
  } else if (voidOutcome?.result.startsWith("antimatter:")) {
    await expect(voidNotice).toHaveClass(/notification-info/);
    await expect(voidNotice).toContainText(/^WIN! \+\d+ Antimatter$/);
  } else if (/^(?:o-type-clue|manuscript-clue):/.test(voidOutcome?.result ?? "")) {
    await expect(voidNotice).toHaveClass(/notification-warning/);
    await expect(voidNotice).toContainText(/^WIN! .{12,}/);
    await expect(voidNotice).not.toContainText(/(?:o-type-clue|manuscript-clue|system:\d+:)/);
  } else {
    expect(voidOutcome?.result).toMatch(/^(?:o-type-clue|manuscript-clue)$/);
    await expect(voidNotice).toHaveClass(/notification-info/);
    await expect(voidNotice).toHaveText("WIN!");
  }
});

test("Casino entry costs, stake previews, and insufficient-balance guidance are clear @p06-affordances @p20-announcements", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");

  const purchase = casino.getByTestId("casino-buy-cp");
  await casino.getByLabel("Points to buy").fill("50000000");
  await expect(purchase).toBeDisabled();
  await expect(purchase).toHaveAttribute("aria-describedby", "casino-buy-reason");
  await expect(casino.locator("#casino-buy-reason")).toHaveAttribute("role", "status");
  await expect(casino.locator("#casino-buy-reason")).toHaveAttribute("aria-live", "polite");
  const cash = await page.evaluate(() => window.miaplacidusTest!.getState().run.cash);
  const cashRequired = Math.ceil((50_000_000 * 100_000) / 1);
  await expect(casino.locator("#casino-buy-reason")).toHaveText(
    `Requires ${formatNumber("en", cashRequired)} Cash; available: ${formatNumber("en", cash)}.`,
  );

  const points = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.galacticCasino.casinoPoints,
  );
  const wheel = casino.getByTestId("casino-wheel-spin");
  await expect(wheel).toBeEnabled();
  await expect(wheel).not.toHaveAttribute("aria-disabled", "true");
  await expect(wheel).toHaveAttribute("aria-describedby", "casino-wheel-spin-reason");
  await expect(casino.locator("#casino-wheel-spin-reason")).toHaveText(
    `Requires 1 CP; available: ${points.toLocaleString("en-US")} CP.`,
  );
  const casinoNotices = page
    .getByTestId("notification-stack")
    .locator('[data-classification="galacticCasino"]');
  await wheel.click();
  await expect(casinoNotices.first()).toHaveText("Not enough CP to spin the wheel.");
  await expect(casinoNotices.first()).toHaveClass(/notification-info/);
  await expect(casinoNotices).toHaveCount(0);

  const higherLower = casino.getByTestId("casino-hilo-start");
  await expect(higherLower).toBeDisabled();
  await expect(higherLower).toHaveAttribute("aria-describedby", "casino-hilo-start-reason");
  await expect(casino.locator("#casino-hilo-start-reason")).toHaveText(
    `Requires 5 CP; available: ${points.toLocaleString("en-US")} CP.`,
  );

  await casino.getByLabel("Stake in CP").fill(String(points + 999));
  const doubleOrNothing = casino.getByTestId("casino-don-play");
  await expect(doubleOrNothing).toBeDisabled();
  await expect(doubleOrNothing).toHaveAttribute("aria-describedby", "casino-don-reason");
  await expect(casino.locator("#casino-don-reason")).toHaveText(
    `Requires ${(points + 999).toLocaleString("en-US")} CP; available: ${points.toLocaleString("en-US")} CP.`,
  );

  await casino.getByLabel("Points to buy").fill("5");
  await expect(purchase).toBeEnabled();
  await purchase.click();
  await expect(casino.getByTestId("casino-balance")).toHaveText("5 CP");
  let state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.cash).toBe(cash - 500_000);

  await expect(casino.getByTestId("casino-wheel-entry-cost")).toHaveText("Entry cost: 1 CP");
  await expect(casino.getByTestId("casino-hilo-entry-cost")).toHaveText("Entry cost: 5 CP");
  await expect(wheel).toBeEnabled();
  await expect(higherLower).toBeEnabled();

  const stake = casino.getByLabel("Stake in CP");
  await stake.fill("3");
  await expect(casino.getByTestId("casino-don-stake-preview")).toHaveText("Current stake: 3 CP");
  await expect(casino.getByTestId("casino-don-win-preview")).toHaveText("Win payout: 6 CP");
  await expect(doubleOrNothing).toBeEnabled();
  await captureVisualCheckpoint(page, testInfo, "casino-entry-cost-previews");

  await wheel.click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.casinoStats.wheelPlayed).toBe(1);
  const wheelPrize = state.permanent.galacticCasino.history.at(-1)!;
  expect(wheelPrize.gameId).toBe("wheel");
  expect(wheelPrize.cpSpent).toBe(1);
  const balanceAfterWheel = state.permanent.galacticCasino.casinoPoints;
  await expect(casino.getByTestId("casino-balance")).toHaveText(`${balanceAfterWheel} CP`);
  await casino.getByLabel("Points to buy").fill("1");
  await purchase.click();
  await expect(casino.getByTestId("casino-balance")).toHaveText(`${balanceAfterWheel + 1} CP`);

  await higherLower.click();
  await expect(casino.getByTestId("casino-balance")).toHaveText(`${balanceAfterWheel - 4} CP`);
  await expect(casino.getByRole("button", { name: "Higher", exact: true })).toBeVisible();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.galacticCasino.higherLower).not.toBeNull();
  expect(state.permanent.galacticCasino.casinoPoints).toBe(balanceAfterWheel - 4);
  expect(state.permanent.galacticCasino.history.at(-1)?.gameId).toBe("wheel");
  await expect(casino.getByTestId("casino-don-stake-preview")).toHaveText("Current stake: 3 CP");
});

test("Double-or-Nothing blocked stakes use the linked inline reason instead of a toast @p08-notifications", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Galactic Casino" }).click();
  const casino = page.getByTestId("galactic-casino-pane");
  const play = casino.getByTestId("casino-don-play");
  const reason = casino.locator("#casino-don-reason");
  const casinoNotices = page
    .getByTestId("notification-stack")
    .locator('[data-classification="galacticCasino"]');
  const initialNoticeCount = await casinoNotices.count();

  await casino.getByLabel("Stake in CP").fill("1.5");
  await expect(play).toBeDisabled();
  await expect(play).toHaveAttribute("aria-describedby", "casino-don-reason");
  await expect(reason).toHaveText("Enter a whole number of at least 1.");

  const points = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.galacticCasino.casinoPoints,
  );
  const stake = Math.floor(points) + 1;
  await casino.getByLabel("Stake in CP").fill(String(stake));
  await expect(play).toBeDisabled();
  await expect(play).toHaveAttribute("aria-describedby", "casino-don-reason");
  await expect(reason).toHaveText(
    `Requires ${formatNumber("en", stake)} CP; available: ${formatNumber("en", points)} CP.`,
  );
  await expect(casinoNotices).toHaveCount(initialNoticeCount);
});

test("Hilo finish-rocket prize shortens the active trip and announces the actual journey @p08-notifications", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-finish-rocket-journey");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();

  const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
  const timerId = stateBefore.run.space.rockets.rocket1.timerId;
  expect(timerId).toBe("travel:rocket1-asteroid-journey");
  expect(stateBefore.run.timers[timerId!]?.durationMs).toBe(10_000);
  expect(stateBefore.permanent.galacticCasino.higherLower).toMatchObject({
    index: 7,
    prizeKey: "special_finish_rocket_journey",
  });

  await page.getByRole("button", { name: "Higher", exact: true }).click();

  const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateAfter.run.timers[timerId!]?.durationMs).toBe(2_000);
  expect(stateAfter.permanent.galacticCasino.casinoPoints).toBe(42);
  const notices = page
    .getByTestId("notification-stack")
    .locator('[data-classification="galacticCasino"]');
  await expect(notices).toHaveCount(1);
  await expect(notices.first()).toHaveClass(/notification-info/);
  await expect(notices.first()).toHaveText(
    "WON! Well done you guessed all Cards! Finish Rocket - Finished Rocket Journey Prospector",
  );
});

test("Wheel rocket warp claim announces its destination and completes the active trip @p08-notifications", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-finish-rocket-journey");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();

  const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
  const rocketBefore = stateBefore.run.space.rockets.rocket1;
  const timerId = rocketBefore.timerId;
  expect(timerId).toBe("travel:rocket1-asteroid-journey");
  expect(stateBefore.run.timers[timerId!]?.status).toBe("running");
  expect(stateBefore.run.timers[timerId!]?.durationMs).toBe(10_000);
  expect(stateBefore.permanent.galacticCasino.casinoPoints).toBe(42);

  const casino = page.getByTestId("galactic-casino-pane");
  await casino.getByTestId("casino-wheel-spin").click();
  await expect(casino.getByLabel("Choose special prize")).toBeVisible({ timeout: 6_000 });
  await casino.getByLabel("Choose special prize").selectOption("special_rocket_warp");
  await casino.getByTestId("casino-wheel-claim").click();

  const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateAfter.run.timers[timerId!]?.status).toBe("complete");
  expect(stateAfter.run.space.rockets.rocket1).toMatchObject({
    phase: "mining",
    timerId: null,
  });
  expect(stateAfter.permanent.galacticCasino.casinoPoints).toBe(41);
  expect(stateAfter.permanent.galacticCasino.history.at(-1)).toMatchObject({
    gameId: "wheel",
    cpAwarded: 0,
  });

  const notice = page
    .getByTestId("notification-stack")
    .locator('[data-classification="galacticCasino"]');
  await expect(notice.first()).toHaveText(
    "Special Prize Claimed! Rocket 1 Prospector warped to Asteroid SPI-0002B",
    { timeout: 10_000 },
  );
});

test("Casino pane presentation stays clear across theme, locale and width @galactic-casino", async ({
  page,
}) => {
  const captures = [
    { theme: "terminal", locale: "en", width: 1280, height: 900 },
    { theme: "terminal", locale: "fr", width: 390, height: 844 },
    { theme: "light", locale: "en", width: 390, height: 844 },
    { theme: "light", locale: "fr", width: 1280, height: 900 },
  ] as const;

  await startMetaFixture(page, "meta-casino-ready");
  for (const capture of captures) {
    await page.setViewportSize({ width: capture.width, height: capture.height });
    await setGameLocale(page, capture.locale);
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-visual").click();
    await page.locator("#settings-theme").selectOption(capture.theme);
    await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", capture.theme);
    await page.locator("#tab-galaxy").click();
    await page.locator("#tab-galactic-casino").click();

    const casino = page.getByTestId("galactic-casino-pane");
    await expect(
      casino.getByRole("heading", { name: casinoText(capture.locale, "title") }),
    ).toBeVisible();
    await expect(page.locator("#tab-galactic-casino")).toHaveAttribute("aria-selected", "true");
    const geometry = await casino.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        documentWidth: document.documentElement.scrollWidth,
        layoutBoxes: [
          "html",
          "body",
          ".game-frame",
          "main",
          "nav",
          ".game-nav",
          ".main-layout",
          ".pane-stack",
          "#pane-galaxy",
          ".pane-nav-scroll",
          ".pane-nav",
          "#panel-galactic-casino",
        ].flatMap((selector) => {
          const target = document.querySelector<HTMLElement>(selector);
          if (!target) return [];
          const bounds = target.getBoundingClientRect();
          const style = getComputedStyle(target);
          return [
            {
              selector,
              left: Math.round(bounds.left * 100) / 100,
              right: Math.round(bounds.right * 100) / 100,
              width: Math.round(bounds.width * 100) / 100,
              scrollWidth: target.scrollWidth,
              clientWidth: target.clientWidth,
              overflowX: style.overflowX,
              minWidth: style.minWidth,
              flex: style.flex,
            },
          ];
        }),
        overflowingElements: Array.from(document.querySelectorAll("body *"))
          .map((element) => {
            const bounds = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              id: element.id,
              className: typeof element.className === "string" ? element.className : "",
              left: Math.round(bounds.left * 100) / 100,
              right: Math.round(bounds.right * 100) / 100,
              width: Math.round(bounds.width * 100) / 100,
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth,
            };
          })
          .filter((item) => item.width > 0 && (item.left < -1 || item.right > innerWidth + 1))
          .slice(0, 20),
      };
    });
    expect(geometry.left, `${capture.width}px Casino pane left edge`).toBeGreaterThanOrEqual(-1);
    expect(geometry.right, `${capture.width}px Casino pane right edge`).toBeLessThanOrEqual(
      capture.width + 1,
    );
    expect(
      geometry.documentWidth,
      `${capture.width}px document width; overflow: ${JSON.stringify(geometry.overflowingElements)}; layout: ${JSON.stringify(geometry.layoutBoxes)}`,
    ).toBeLessThanOrEqual(capture.width);
    await page.mouse.move(0, 0);
    await expect(casino).toHaveScreenshot(
      `galactic-casino-${capture.theme}-${capture.locale}-${capture.width}.png`,
      { animations: "disabled", caret: "hide" },
    );
  }
});

test("Casino keeps its identity and layout across all themes and locales @casino-theme-locale-matrix @galactic-casino", async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  await startMetaFixture(page, "meta-casino-ready");

  for (const theme of THEME_IDS) {
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-visual").click();
    await page.locator("#settings-theme").selectOption(theme);
    await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);

    for (const locale of LOCALE_IDS) {
      await page.locator("#tab-settings").click();
      await page.locator("#tab-settings-game-options").click();
      await page.locator("#settings-language").selectOption(locale);
      await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe(locale);
      await page.locator("#tab-galaxy").click();
      await page.locator("#tab-galactic-casino").click();

      const casino = page.getByTestId("galactic-casino-pane");
      const casinoHeaderTooltip = casino.getByTestId("casino-header-help-tooltip");
      const casinoTab = page.locator("#tab-galactic-casino");
      const casinoPanel = page.locator("#panel-galactic-casino");
      await expect(page.locator(".game-nav #tab-galactic-casino")).toHaveCount(0);
      await expect(page.locator("#pane-galaxy #tab-galactic-casino")).toHaveCount(1);
      await expect(casinoTab).toHaveAttribute("aria-selected", "true");
      await expect(casinoTab).toHaveAttribute("aria-controls", "panel-galactic-casino");
      await expect(casinoTab).toHaveText(casinoText(locale, "title"));
      await expect(page.locator("#pane-galaxy")).toHaveAttribute("aria-labelledby", "tab-galaxy");
      await expect(casinoPanel).toBeVisible();
      await expect(casinoPanel).toHaveAttribute("role", "tabpanel");
      await expect(casinoPanel).toHaveAttribute("aria-labelledby", "tab-galactic-casino");
      await expect(casinoPanel.getByTestId("galactic-casino-pane")).toBeVisible();
      await expect(casino.locator("h2:visible")).toHaveCount(1);
      await expect(casino.locator("h2:visible")).toHaveText(casinoText(locale, "title"));
      await expect(casino.locator(".page-artwork-row:visible")).toHaveCount(1);
      await expect(
        casino.locator(".page-artwork-row [data-celestial-illustration='star-system']"),
      ).toBeVisible();
      await expect(casino.locator(".casino-grid > .upgrade-card")).toHaveCount(5);
      for (const key of [
        "buyTitle",
        "doubleOrNothing",
        "wheel",
        "higherLower",
        "voidSeer",
      ] as const) {
        await expect(
          casino.getByRole("heading", { name: casinoText(locale, key), exact: true }),
        ).toBeVisible();
      }

      for (const viewport of [
        { width: 1280, height: 900 },
        { width: 390, height: 844 },
        { width: 320, height: 740 },
      ]) {
        await page.setViewportSize(viewport);
        await expect
          .poll(() => casinoHeaderTooltip.evaluate((element) => element.style.left))
          .toBe(viewport.width <= 860 ? "auto" : "0px");
        const hydrogenTitleSize = await page
          .locator("#panel-resources-hydrogen .pane-heading h2")
          .evaluate((element) => getComputedStyle(element).fontSize);
        await expect(
          casino.locator(".pane-heading h2"),
          `${theme}/${locale} title scale`,
        ).toHaveCSS("font-size", hydrogenTitleSize);
        const geometry = await casino.evaluate((element) => {
          const pane = element.getBoundingClientRect();
          const overflowers = Array.from(element.querySelectorAll<HTMLElement>("*"))
            .map((child) => {
              const rect = child.getBoundingClientRect();
              return {
                tag: child.tagName,
                className: typeof child.className === "string" ? child.className : "",
                left: rect.left,
                right: rect.right,
                clientWidth: child.clientWidth,
                scrollWidth: child.scrollWidth,
              };
            })
            .filter(
              (child) => child.right > pane.right + 1 || child.scrollWidth > child.clientWidth + 1,
            )
            .slice(0, 8);
          const cards = Array.from(
            element.querySelectorAll<HTMLElement>(".casino-grid > .upgrade-card"),
          ).map((card) => {
            const rect = card.getBoundingClientRect();
            return {
              left: rect.left,
              right: rect.right,
              clientWidth: card.clientWidth,
              scrollWidth: card.scrollWidth,
            };
          });
          return {
            paneLeft: pane.left,
            paneRight: pane.right,
            paneClientWidth: element.clientWidth,
            paneScrollWidth: element.scrollWidth,
            overflowers,
            documentWidth: document.documentElement.scrollWidth,
            viewportWidth: document.documentElement.clientWidth,
            cards,
          };
        });
        const label = `${theme}/${locale} at ${viewport.width}px`;
        expect(geometry.paneLeft, `${label} pane left`).toBeGreaterThanOrEqual(-1);
        expect(geometry.paneRight, `${label} pane right`).toBeLessThanOrEqual(viewport.width + 1);
        expect(
          geometry.paneScrollWidth,
          `${label} pane overflow: ${JSON.stringify(geometry.overflowers)}`,
        ).toBeLessThanOrEqual(geometry.paneClientWidth + 1);
        expect(geometry.documentWidth, `${label} document overflow`).toBeLessThanOrEqual(
          geometry.viewportWidth,
        );
        for (const [index, card] of geometry.cards.entries()) {
          expect(card.left, `${label} card ${index + 1} left`).toBeGreaterThanOrEqual(
            geometry.paneLeft - 1,
          );
          expect(card.right, `${label} card ${index + 1} right`).toBeLessThanOrEqual(
            geometry.paneRight + 1,
          );
          expect(
            card.scrollWidth,
            `${label} card ${index + 1} text/control overflow`,
          ).toBeLessThanOrEqual(card.clientWidth + 1);
        }

        if (locale === "fr" && (viewport.width === 1280 || viewport.width === 390)) {
          if (theme === "space" && viewport.width === 390) {
            const finalTitleWordLineCount = await casino
              .locator(".pane-heading h2")
              .evaluate((element) => {
                const textNode = element.firstChild;
                if (!(textNode instanceof Text)) return 0;
                const title = textNode.textContent ?? "";
                const start = title.lastIndexOf(" ") + 1;
                const range = document.createRange();
                range.setStart(textNode, start);
                range.setEnd(textNode, title.length);
                return range.getClientRects().length;
              });
            expect(finalTitleWordLineCount, "French Casino title final word stays together").toBe(
              1,
            );
          }
          const screenshotName = `casino-${theme}-fr-${viewport.width}.png`;
          const screenshotPath = testInfo.outputPath(screenshotName);
          await page.screenshot({
            path: screenshotPath,
            fullPage: true,
            animations: "disabled",
          });
          await testInfo.attach(screenshotName, { path: screenshotPath, contentType: "image/png" });
        }

        if (theme === "terminal" && locale === "fr" && viewport.width === 320) {
          const screenshotPath = testInfo.outputPath("casino-terminal-fr-320.png");
          await page.screenshot({
            path: screenshotPath,
            fullPage: true,
            animations: "disabled",
          });
          await testInfo.attach("casino-terminal-fr-320.png", {
            path: screenshotPath,
            contentType: "image/png",
          });
        }
      }
    }
  }
});

test("Galactic Casino stays on its own child page under Galactic @ui-navigation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  const mainNavigation = page.locator(".game-nav");
  await expect(mainNavigation.getByRole("tab", { name: "Galactic" })).toBeVisible();
  await expect(mainNavigation.getByRole("tab", { name: "Galactic Casino" })).toHaveCount(0);

  await page.locator("#tab-galaxy").click();
  const childTablist = page
    .getByRole("tabpanel", { name: "Galactic" })
    .getByRole("tablist", { name: "Pages in this section" });
  await expect(childTablist.getByRole("tab")).toHaveCount(4);
  const sourceDestinations = await childTablist
    .getByRole("tab")
    .evaluateAll((tabs) => tabs.map((tab) => [tab.id, tab.getAttribute("data-source-option-id")]));
  expect(sourceDestinations).toEqual([
    ["tab-galactic-rebirth", "option1"],
    ["tab-galactic-market", "option2"],
    ["tab-galactic-casino", "option6"],
    ["tab-galactic-ascendency-perks", "option3"],
  ]);
  const casinoTab = page.locator("#tab-galactic-casino");
  await expect(casinoTab).toBeVisible();
  await expect(mainNavigation.getByRole("tab", { name: "Galactic Casino" })).toHaveCount(0);
  await casinoTab.click();
  await expect(
    page.getByTestId("galactic-casino-pane").getByRole("heading", {
      name: "Galactic Casino",
    }),
  ).toBeVisible();
});

test("Casino header help tooltip preserves source guidance across locales and themes @galactic-casino", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");
  const trigger = casino.getByTestId("casino-header-help-trigger");
  const tooltip = casino.getByTestId("casino-header-help-tooltip");

  for (const theme of THEME_IDS) {
    for (const locale of LOCALE_IDS) {
      await page.evaluate(
        ({ nextLocale, nextTheme }) =>
          window.miaplacidusTest!.dispatch({
            type: "settings.update",
            patch: { locale: nextLocale, themeId: nextTheme },
          }),
        { nextLocale: locale, nextTheme: theme },
      );
      await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(trigger).toHaveAttribute("aria-label", casinoText(locale, "headerHelpLabel"));
      await expect(trigger).toHaveAttribute("aria-describedby", "galactic-casino-header-help");
      await expect(tooltip).toHaveAttribute("role", "tooltip");
      await expect(tooltip).toHaveText(casinoText(locale, "headerHelp"));

      if (theme === THEME_IDS[0] && locale === LOCALE_IDS[0]) {
        await trigger.hover();
        await expect(tooltip).toBeVisible();
        await tabUntilFocused(page, trigger);
      } else {
        await trigger.focus();
      }
      await expect(trigger).toBeFocused();
      await expect(tooltip).toBeVisible();
      const themeColors = await tooltip.evaluate((element) => {
        const tooltipStyle = getComputedStyle(element);
        const probe = document.createElement("span");
        probe.style.color = "var(--text)";
        probe.style.backgroundColor = "var(--panel-raised)";
        document.querySelector(".game-frame")!.append(probe);
        const expectedStyle = getComputedStyle(probe);
        const expectedText = expectedStyle.color;
        const expectedBackground = expectedStyle.backgroundColor;
        probe.remove();
        return {
          text: tooltipStyle.color,
          expectedText,
          background: tooltipStyle.backgroundColor,
          expectedBackground,
        };
      });
      expect(themeColors.text, `${theme}/${locale} tooltip text`).toBe(themeColors.expectedText);
      expect(themeColors.background, `${theme}/${locale} tooltip background`).toBe(
        themeColors.expectedBackground,
      );

      if (locale === "fr") {
        for (const viewport of [
          { width: 1280, height: 900 },
          { width: 390, height: 844 },
        ]) {
          await page.setViewportSize(viewport);
          await expect
            .poll(() => tooltip.evaluate((element) => element.style.left))
            .toBe(viewport.width <= 860 ? "auto" : "0px");
          const bounds = await tooltip.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return {
              left: rect.left,
              right: rect.right,
              documentWidth: document.documentElement.scrollWidth,
              viewportWidth: document.documentElement.clientWidth,
            };
          });
          expect(bounds.left, `${theme}/fr ${viewport.width}px tooltip left`).toBeGreaterThanOrEqual(
            -1,
          );
          expect(
            bounds.right,
            `${theme}/fr ${viewport.width}px tooltip right`,
          ).toBeLessThanOrEqual(viewport.width + 1);
          expect(
            bounds.documentWidth,
            `${theme}/fr ${viewport.width}px document width`,
          ).toBeLessThanOrEqual(bounds.viewportWidth);

          const screenshotName = `casino-${theme}-fr-${viewport.width}-tooltip.png`;
          const screenshotPath = testInfo.outputPath(screenshotName);
          await page.screenshot({
            path: screenshotPath,
            fullPage: true,
            animations: "disabled",
          });
          await testInfo.attach(screenshotName, {
            path: screenshotPath,
            contentType: "image/png",
          });
        }
      }
    }
  }
});

test("Casino source row help is attached to each section in all locales @p44-casino-copy", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");
  const helpRows = [
    { id: "casino-purchase-source-help", titleKey: "buyTitle", copyKey: "purchase", price: null },
    {
      id: "casino-double-or-nothing-source-help",
      titleKey: "doubleOrNothing",
      copyKey: "doubleOrNothing",
      price: null,
    },
    { id: "casino-wheel-source-help", titleKey: "wheel", copyKey: "wheel", price: "1" },
    {
      id: "casino-higher-lower-source-help",
      titleKey: "higherLower",
      copyKey: "higherLower",
      price: "5",
    },
    { id: "casino-void-seer-source-help", titleKey: "voidSeer", copyKey: "voidSeer", price: null },
  ] as const;

  for (const locale of LOCALE_IDS) {
    await page.evaluate(
      (nextLocale) =>
        window.miaplacidusTest!.dispatch({
          type: "settings.update",
          patch: { locale: nextLocale },
        }),
      locale,
    );

    for (const row of helpRows) {
      const trigger = casino.getByTestId(`${row.id}-trigger`);
      const tooltip = casino.getByTestId(row.id);
      const section = casinoText(locale, row.titleKey);
      const expected = row.price
        ? casinoSectionHelpText(locale, row.copyKey).replace("{price}", row.price)
        : casinoSectionHelpText(locale, row.copyKey);
      await expect(trigger).toHaveAttribute("aria-label", casinoSectionHelpLabel(locale, section));
      await expect(trigger).toHaveAttribute("aria-describedby", row.id);
      await trigger.focus();
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toHaveText(expected);
    }
  }
});

test("rebirth restores the source Casino marker before this run awards AP @ui-navigation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-post-rebirth-casino-access");
  const stateBefore = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateBefore.permanent.rebirthCount).toBe(1);
  expect(stateBefore.run.space.ascendencyAwardedThisRun).toBe(false);
  expect(stateBefore.permanent.galacticCasino.casinoPoints).toBe(0);
  await expect(page.getByTestId("top-stat-cp")).toBeVisible();
  await expect(page.getByTestId("cp-balance")).toHaveText("0");
  await page.locator("#tab-galaxy").click();

  const childTablist = page
    .getByRole("tabpanel", { name: "Galactic" })
    .getByRole("tablist", { name: "Pages in this section" });
  await expect(childTablist.locator("#tab-galactic-rebirth")).toHaveCount(0);
  await expect(childTablist.locator("#tab-galactic-market")).toHaveCount(1);
  await expect(childTablist.locator("#tab-galactic-ascendency-perks")).toHaveCount(1);
  const casinoTab = childTablist.locator("#tab-galactic-casino");
  await expect(casinoTab).toHaveCount(1);
  const childOrder = await childTablist
    .getByRole("tab")
    .evaluateAll((tabs) => tabs.map((tab) => tab.id));
  expect(childOrder).toEqual([
    "tab-galactic-market",
    "tab-galactic-casino",
    "tab-galactic-ascendency-perks",
  ]);

  const acceptedPurchase = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "casino.points.buy",
      goodId: "cash",
      amount: 1,
    }),
  );
  expect(acceptedPurchase).toBe(true);
  expect(
    await page.evaluate(
      () => window.miaplacidusTest!.getState().permanent.galacticCasino.casinoPoints,
    ),
  ).toBe(1);

  await casinoTab.click();
  const casino = page.getByTestId("galactic-casino-pane");
  await expect(casino.getByRole("heading", { name: "Galactic Casino" })).toBeVisible();
  await expect(casino.getByTestId("casino-buy-cp")).toBeEnabled();
  await casino.getByTestId("casino-buy-cp").click();
  await expect(casino.getByTestId("casino-balance")).toHaveText("1 CP");
  const stateAfter = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(stateAfter.permanent.galacticCasino.casinoPoints).toBe(1);
});

test("keyboard users can reach and play every Casino game @galactic-casino @keyboard @p21", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");

  const hydrogenTab = page.locator("#tab-hydrogen");
  await tabUntilFocused(page, hydrogenTab);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  const galacticTab = page.locator("#tab-galaxy");
  await expect(galacticTab).toBeFocused();

  const rebirthTab = page.locator("#tab-galactic-rebirth");
  await tabUntilFocused(page, rebirthTab);
  const marketTab = page.locator("#tab-galactic-market");
  await page.keyboard.press("ArrowRight");
  await expect(marketTab).toHaveAttribute("aria-selected", "true");
  await expect(marketTab).toBeFocused();
  await page.keyboard.press("ArrowRight");
  const casinoTab = page.locator("#tab-galactic-casino");
  await expect(casinoTab).toBeFocused();
  await expect(casinoTab).toHaveAttribute("aria-selected", "true");

  const casino = page.getByTestId("galactic-casino-pane");
  const payment = casino.getByLabel("Pay with");
  await tabUntilFocused(page, payment);
  await expect(payment).toBeFocused();

  const amount = casino.getByLabel("Points to buy");
  await page.keyboard.press("Tab");
  await expect(amount).toBeFocused();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText("20");
  await page.keyboard.press("Tab");
  const buyButton = casino.getByTestId("casino-buy-cp");
  await expect(buyButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(casino.getByTestId("casino-balance")).toHaveText("20 CP");

  const wheelButton = casino.getByTestId("casino-wheel-spin");
  await tabUntilFocused(page, wheelButton);
  await expect(wheelButton).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(casino.getByRole("status").first()).toContainText(
    "The wheel revealed a special prize",
  );
  await page.keyboard.press("Shift+Tab");
  const claimButton = casino.getByTestId("casino-wheel-claim");
  await expect(claimButton).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  const specialPrize = casino.getByLabel("Choose special prize");
  await expect(specialPrize).toBeFocused();
  await expect(specialPrize).toHaveAttribute("aria-describedby", "casino-wheel-help");
  await expect(casino.getByTestId("casino-wheel-help")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Tab");
  await expect(claimButton).toBeFocused();
  await page.keyboard.press("Enter");
  let state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.casinoStats.wheelSpecialWon).toBe(1);

  const stake = casino.getByLabel("Stake in CP");
  await tabUntilFocused(page, stake);
  await expect(stake).toBeFocused();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText("10");
  await page.keyboard.press("Tab");
  const doubleOrNothingButton = casino.getByTestId("casino-don-play");
  await expect(doubleOrNothingButton).toBeFocused();
  await page.keyboard.press("Enter");
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.casinoStats.doubleOrNothingPlayed).toBe(1);

  const startHigherLower = casino.getByTestId("casino-hilo-start");
  await tabUntilFocused(page, startHigherLower);
  await expect(startHigherLower).toBeFocused();
  await page.keyboard.press("Enter");
  const higherButton = casino.getByRole("button", { name: "Higher", exact: true });
  await expect(higherButton).toBeFocused();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  const round = state.permanent.galacticCasino.higherLower!;
  const nextCard = round.deck[round.index + 1]!;
  const currentCard = round.deck[round.index]!;
  const guess = casino.getByRole("button", {
    name: nextCard.rank > currentCard.rank ? "Higher" : "Lower",
    exact: true,
  });
  if (nextCard.rank <= currentCard.rank) await page.keyboard.press("Tab");
  await expect(guess).toBeFocused();
  await page.keyboard.press("Enter");
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.galacticCasino.higherLower?.index).toBe(1);

  const nextRound = state.permanent.galacticCasino.higherLower!;
  const secondCurrentCard = nextRound.deck[nextRound.index]!;
  const secondNextCard = nextRound.deck[nextRound.index + 1]!;
  const secondGuess = casino.getByRole("button", {
    name: secondNextCard.rank > secondCurrentCard.rank ? "Higher" : "Lower",
    exact: true,
  });
  await secondGuess.focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.galacticCasino.higherLower),
    )
    .toMatchObject({ index: 2 });
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.galacticCasino.higherLower?.prizeKey).not.toBeNull();

  const cashOutButton = casino.getByRole("button", { name: "Cash out", exact: true });
  await expect(cashOutButton).toBeEnabled();
  await cashOutButton.focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(() =>
      page.evaluate(() => window.miaplacidusTest!.getState().permanent.galacticCasino.higherLower),
    )
    .toBeNull();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.casinoStats.higherLowerPlayed).toBe(1);

  const tier = casino.getByLabel("Prize tier");
  await tabUntilFocused(page, tier);
  await page.keyboard.press("Tab");
  const voidSeerButton = casino.getByTestId("casino-void-seer-play");
  await expect(voidSeerButton).toBeFocused();
  await page.keyboard.press("Enter");
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.casinoStats.voidSeerPlayed).toBe(1);
});

test.describe("touch controls", () => {
  test.use({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  });

  test("touch users can buy points and use all four Casino games at 390px @galactic-casino @touch @p21", async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-casino-ready");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);

    await page.locator("#tab-galaxy").tap();
    await page.locator("#tab-galactic-casino").tap();
    const casino = page.getByTestId("galactic-casino-pane");
    await expect(casino.getByRole("heading", { name: "Galactic Casino" })).toBeVisible();

    const amount = casino.getByLabel("Points to buy");
    await amount.tap();
    await amount.fill("20");
    await casino.getByTestId("casino-buy-cp").tap();
    await expect(casino.getByTestId("casino-balance")).toHaveText("20 CP");

    await casino.getByTestId("casino-wheel-spin").tap();
    await expect(casino.getByTestId("casino-wheel-claim")).toBeVisible();
    await casino.getByTestId("casino-wheel-claim").tap();
    let state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.run.casinoStats.wheelPlayed).toBe(1);
    expect(state.run.casinoStats.wheelSpecialWon).toBe(1);

    await casino.getByTestId("casino-don-play").tap();
    state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.run.casinoStats.doubleOrNothingPlayed).toBe(1);
    expect(state.permanent.galacticCasino.history.at(-1)?.gameId).toBe("doubleOrNothing");

    await casino.getByTestId("casino-hilo-start").tap();
    for (let turn = 0; turn < 2; turn += 1) {
      state = await page.evaluate(() => window.miaplacidusTest!.getState());
      const round = state.permanent.galacticCasino.higherLower!;
      const currentCard = round.deck[round.index]!;
      const nextCard = round.deck[round.index + 1]!;
      const guessId = nextCard.rank > currentCard.rank ? "Higher" : "Lower";
      await casino.getByRole("button", { name: guessId, exact: true }).tap();
    }
    await casino.getByRole("button", { name: "Cash out", exact: true }).tap();
    state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.run.casinoStats.higherLowerPlayed).toBe(1);
    expect(state.permanent.galacticCasino.higherLower).toBeNull();

    await casino.getByTestId("casino-void-seer-play").tap();
    state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.run.casinoStats.voidSeerPlayed).toBe(1);

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      overflowingElements: Array.from(document.querySelectorAll<HTMLElement>("body *"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            element: `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).replaceAll(" ", ".")}` : ""}`,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          };
        })
        .filter((element) => element.right > document.documentElement.clientWidth + 1)
        .slice(0, 12),
    }));
    expect(
      dimensions.documentWidth,
      JSON.stringify(dimensions.overflowingElements),
    ).toBeLessThanOrEqual(dimensions.viewportWidth);
  });

  test("touch Wheel prize controls enable only after the special result lands @galactic-casino @touch @p14-casino-action", async ({
    page,
  }) => {
    await startMetaFixture(page, "meta-casino-ready");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#tab-galaxy").tap();
    await page.locator("#tab-galactic-casino").tap();
    const casino = page.getByTestId("galactic-casino-pane");

    await expect(casino.getByLabel("Choose special prize")).toBeVisible();
    await expect(casino.getByLabel("Choose special prize")).toBeDisabled();
    await expect(casino.getByTestId("casino-wheel-claim")).toBeVisible();
    await expect(casino.getByTestId("casino-wheel-claim")).toBeDisabled();
    await casino.getByLabel("Points to buy").tap();
    await casino.getByLabel("Points to buy").fill("1");
    await casino.getByTestId("casino-buy-cp").tap();
    await expect(casino.getByTestId("casino-balance")).toHaveText("1 CP");

    await casino.getByTestId("casino-wheel-spin").tap();
    const spinReason = casino.locator("#casino-wheel-spin-reason");
    await expect(spinReason).toHaveText(casinoText("en", "reasonWheelSpinning"));
    await expect(casino.getByTestId("casino-wheel-spin")).toBeDisabled();
    await expect(casino.locator(".casino-wheel")).toHaveAttribute("data-special-ready", "false");
    await expect(casino.getByLabel("Choose special prize")).toBeDisabled();
    await expect(casino.getByTestId("casino-wheel-claim")).toBeDisabled();

    await expect(spinReason).not.toHaveText(casinoText("en", "reasonWheelSpinning"), {
      timeout: 6_000,
    });
    await expect(casino.locator(".casino-wheel")).toHaveAttribute("data-special-ready", "true");
    const prizeChoice = casino.getByLabel("Choose special prize");
    await expect(prizeChoice).toBeVisible();
    await expect(prizeChoice).toHaveValue("special_100cp");
    await expect(casino.getByTestId("casino-wheel-claim")).toBeEnabled();
    await expect(casino.getByTestId("casino-wheel-spin")).toBeDisabled();

    await casino.getByTestId("casino-wheel-claim").tap();
    await expect(casino.getByTestId("casino-balance")).toHaveText("100 CP");
    await expect(casino.getByLabel("Choose special prize")).toBeDisabled();
    await expect(casino.getByTestId("casino-wheel-claim")).toBeDisabled();
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.run.casinoStats.wheelPlayed).toBe(1);
    expect(state.run.casinoStats.wheelSpecialWon).toBe(1);
    expect(state.permanent.galacticCasino.wheelSpecialPending).toBe(false);
  });
});

test("keeps the Double or Nothing control focused through its result notice dismissal @p16-focus", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.getByRole("tab", { name: "Galactic" }).click();
  await page.getByRole("tab", { name: "Galactic Casino" }).click();
  const casino = page.getByTestId("galactic-casino-pane");
  await casino.getByLabel("Points to buy").fill("5");
  await casino.getByTestId("casino-buy-cp").click();
  await casino.getByLabel("Stake in CP").fill("1");
  const play = casino.getByTestId("casino-don-play");
  await play.click();

  const outcome = await page.evaluate(() =>
    window.miaplacidusTest!.getState().permanent.galacticCasino.history.at(-1)!,
  );
  const noticeText = casinoText(
    "en",
    outcome.result === "win" ? "doubleOrNothingWinNotification" : "doubleOrNothingLossNotification",
  );
  const resultNotice = page
    .getByTestId("notification-stack")
    .getByTestId("game-notification")
    .filter({ hasText: noticeText });
  await expect(resultNotice).toHaveCount(1);
  await expect(play).toBeFocused();
  await expect(resultNotice).toHaveCount(0, { timeout: 3_000 });
  await expect(play).toBeFocused();
});
