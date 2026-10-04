import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { captureVisualCheckpoint } from "../_harness/visual-checkpoints";

test("plays all four casino games and reloads a saved Higher or Lower round", async ({
  page,
}, testInfo) => {
  await startMetaFixture(page, "meta-casino-ready");
  await page.getByRole("tab", { name: "Galaxy" }).click();
  const casino = page.getByTestId("galactic-casino-pane");
  await expect(casino.getByRole("heading", { name: "Galactic Casino" })).toBeVisible();

  await casino.getByLabel("Points to buy").fill("20");
  await casino.getByTestId("casino-buy-cp").click();
  await expect(casino.getByTestId("casino-balance")).toHaveText("20 CP");
  let state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.run.cash).toBe(8_000_000);
  expect(state.permanent.galacticCasino.casinoPoints).toBe(20);

  await casino.getByTestId("casino-wheel-spin").click();
  await expect(casino.locator("p[role='status']")).toContainText(
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
  await page.getByRole("button", { name: "Save now" }).click();
  await expect(page.getByTestId("save-status")).toContainText("Saved");

  await page.reload();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.miaplacidusTest?.getState().run.pioneerName))
    .toBe("Ascendency Pioneer");
  state = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(state.permanent.galacticCasino.higherLower).toEqual(savedRound);
  await page.getByRole("tab", { name: "Resources" }).click();
  await page.getByLabel("Language").selectOption("es");
  await page.getByRole("tab", { name: "Galaxia" }).click();
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
