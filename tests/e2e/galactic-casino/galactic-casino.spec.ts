import { type Locator, type Page } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import { setGameLocale } from "../_harness/settings-controls";

async function tabUntilFocused(page: Page, target: Locator): Promise<void> {
  for (let index = 0; index < 100; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Keyboard traversal did not reach the expected control");
}

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

  await casino.getByLabel("Stake in CP").fill("10");
  await casino.getByTestId("casino-don-play").click();
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.casinoStats.doubleOrNothingPlayed).toBe(1);
  expect(state.permanent.galacticCasino.history.at(-1)?.gameId).toBe("doubleOrNothing");

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

test("disabled Casino actions describe their exact payment and CP shortfalls @p06-affordances", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.locator("#tab-galaxy").click();
  await page.locator("#tab-galactic-casino").click();
  const casino = page.getByTestId("galactic-casino-pane");

  const purchase = casino.getByTestId("casino-buy-cp");
  await casino.getByLabel("Points to buy").fill("50000000");
  await expect(purchase).toBeDisabled();
  await expect(purchase).toHaveAttribute("aria-describedby", "casino-buy-reason");
  const cash = await page.evaluate(() => window.miaplacidusTest!.getState().run.cash);
  await expect(casino.locator("#casino-buy-reason")).toContainText("Requires");
  await expect(casino.locator("#casino-buy-reason")).toContainText(cash.toLocaleString("en-US"));

  const points = await page.evaluate(
    () => window.miaplacidusTest!.getState().permanent.galacticCasino.casinoPoints,
  );
  await casino.getByLabel("Stake in CP").fill(String(points + 999));
  const play = casino.getByTestId("casino-don-play");
  await expect(play).toBeDisabled();
  await expect(play).toHaveAttribute("aria-describedby", "casino-don-reason");
  await expect(casino.locator("#casino-don-reason")).toContainText(
    `${(points + 999).toLocaleString("en-US")} CP`,
  );
  await expect(casino.locator("#casino-don-reason")).toContainText(
    `${points.toLocaleString("en-US")} CP`,
  );
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

test("rebirth does not reveal Casino before the current-run AP award @ui-navigation", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-before-casino-unlock");
  await page.locator("#tab-galaxy").click();

  const childTablist = page
    .getByRole("tabpanel", { name: "Galactic" })
    .getByRole("tablist", { name: "Pages in this section" });
  await expect(childTablist.locator("#tab-galactic-rebirth")).toHaveCount(1);
  await expect(childTablist.locator("#tab-galactic-market")).toHaveCount(1);
  await expect(childTablist.locator("#tab-galactic-ascendency-perks")).toHaveCount(1);
  await expect(childTablist.locator("#tab-galactic-casino")).toHaveCount(0);
});

test("keyboard users can reach and play every Casino game @galactic-casino @keyboard", async ({
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

  test("touch users can purchase points and play a Casino game at 390px @galactic-casino @touch", async ({
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

    await casino.getByTestId("casino-don-play").tap();
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.run.casinoStats.doubleOrNothingPlayed).toBe(1);
    expect(state.permanent.galacticCasino.history.at(-1)?.gameId).toBe("doubleOrNothing");

    const dimensions = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  });
});
