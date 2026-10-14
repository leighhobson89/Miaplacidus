import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { setNumberNotation } from "../_harness/settings-controls";
import { formatDuration } from "../../../src/app/timeFormatting";

test("P-41 formats and advances the active-event journal duration @p41-journal-duration", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  const accepted = await page.evaluate(() =>
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "galacticMarketLockdown",
    }),
  );
  expect(accepted).toBe(true);
  const resultDialog = page.getByTestId("random-event-result-dialog");
  await expect(resultDialog).toBeVisible();
  await resultDialog.getByRole("button").click();
  await expect(resultDialog).not.toBeVisible();

  const notationValues: Record<"condensed" | "standard" | "scientific", string> = {
    condensed: "",
    standard: "",
    scientific: "",
  };
  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-events").click();

    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);
    const effect = state.run.randomEvents.activeEffects.find(
      (activeEffect) => activeEffect.id === "galacticMarketLockdown",
    );
    if (!effect) throw new Error("The forced Market Lockdown event is not active.");
    expect(effect.remainingMs).toBe(30 * 60_000);
    const visibleDuration = page
      .getByTestId("meta-journal-pane")
      .locator(".journal-active-effects li strong");
    await expect(visibleDuration).toHaveText(formatDuration("en", effect.remainingMs, notation));
    notationValues[notation] = (await visibleDuration.textContent()) ?? "";
  }

  expect(notationValues.scientific).not.toBe(notationValues.standard);
  const journal = page.getByTestId("meta-journal-pane");
  const visibleDuration = journal.locator(".journal-active-effects li strong");
  const before = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    const effect = state.run.randomEvents.activeEffects.find(
      (activeEffect) => activeEffect.id === "galacticMarketLockdown",
    );
    return effect?.remainingMs ?? 0;
  });
  const beforeText = await visibleDuration.textContent();

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10 * 60_000));

  const after = await page.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    const effect = state.run.randomEvents.activeEffects.find(
      (activeEffect) => activeEffect.id === "galacticMarketLockdown",
    );
    return effect?.remainingMs ?? 0;
  });
  expect(after).toBe(20 * 60_000);
  const afterText = formatDuration("en", after, "scientific");
  await expect(visibleDuration).toHaveText(afterText);
  expect(afterText).not.toBe(beforeText);
  expect(before).toBe(30 * 60_000);
});

test("P-41 formats live News interval and journal history ages in every notation @p41-journal-history-duration", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  const forced = await page.evaluate(() => ({
    event: window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "galacticMarketLockdown",
    }),
    news: window.miaplacidusTest!.dispatch({
      type: "news.ticker.force",
      category: "prize",
      id: 2000,
    }),
  }));
  expect(forced.event).toBe(true);
  expect(forced.news).toBe(true);
  const resultDialog = page.getByTestId("random-event-result-dialog");
  await expect(resultDialog).toBeVisible();
  await resultDialog.getByRole("button").click();
  await expect(resultDialog).not.toBeVisible();

  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  const journal = page.getByTestId("meta-journal-pane");
  const newsCountdown = journal.locator(
    '[aria-labelledby="journal-news-heading"] .journal-section-heading small',
  );
  const eventAge = journal.locator('[data-event-id="galacticMarketLockdown"] small');
  const newsAge = journal.locator('[data-news-id="2000"] small');
  const rendered: Record<"condensed" | "standard" | "scientific", string[]> = {
    condensed: [],
    standard: [],
    scientific: [],
  };

  for (const notation of ["condensed", "standard", "scientific"] as const) {
    await setNumberNotation(page, notation);
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-events").click();
    const state = await page.evaluate(() => window.miaplacidusTest!.getState());
    expect(state.settings.notation).toBe(notation);

    const tickerAge = state.run.newsTicker.entries.find((entry) => entry.id === 2000);
    const event = state.run.randomEvents.history.find(
      (entry) => entry.id === "galacticMarketLockdown",
    );
    if (!tickerAge || !event)
      throw new Error("The forced News and event history entries are missing.");
    const newsAgeMs = Math.max(0, state.run.clock.simulationMs - tickerAge.simulationMs);
    const eventAgeMs = Math.max(0, state.run.clock.simulationMs - event.simulationMs);

    const expectedNewsRemaining = formatDuration("en", state.run.newsTicker.remainingMs, notation);
    const expectedNewsAge = formatDuration("en", newsAgeMs, notation);
    const expectedEventAge = formatDuration("en", eventAgeMs, notation);
    await expect(newsCountdown).toContainText(expectedNewsRemaining);
    await expect(newsAge).toContainText(expectedNewsAge);
    await expect(eventAge).toContainText(expectedEventAge);
    rendered[notation] = [
      (await newsCountdown.textContent()) ?? "",
      (await newsAge.textContent()) ?? "",
      (await eventAge.textContent()) ?? "",
    ];
  }

  for (let index = 0; index < 3; index += 1) {
    expect(rendered.scientific[index]).not.toBe(rendered.standard[index]);
  }

  const beforeState = await page.evaluate(() => window.miaplacidusTest!.getState());
  const beforeTickerRemaining = beforeState.run.newsTicker.remainingMs;
  const beforeEntry = beforeState.run.newsTicker.entries.find((entry) => entry.id === 2000);
  const beforeEvent = beforeState.run.randomEvents.history.find(
    (entry) => entry.id === "galacticMarketLockdown",
  );
  if (!beforeEntry || !beforeEvent) throw new Error("The journal history entries are missing.");
  const beforeNewsAge = beforeState.run.clock.simulationMs - beforeEntry.simulationMs;
  const beforeEventAge = beforeState.run.clock.simulationMs - beforeEvent.simulationMs;
  const beforeNewsRemainingText = formatDuration("en", beforeTickerRemaining, "scientific");
  const beforeNewsAgeText = formatDuration("en", beforeNewsAge, "scientific");
  const beforeEventAgeText = formatDuration("en", beforeEventAge, "scientific");
  await page.evaluate(() => window.miaplacidusTest!.advanceBy(10_000));
  const afterState = await page.evaluate(() => window.miaplacidusTest!.getState());
  expect(afterState.run.newsTicker.remainingMs).toBe(beforeTickerRemaining - 10_000);

  const afterNewsRemainingText = formatDuration(
    "en",
    afterState.run.newsTicker.remainingMs,
    "scientific",
  );
  const afterNewsAge =
    afterState.run.clock.simulationMs -
    afterState.run.newsTicker.entries.find((entry) => entry.id === 2000)!.simulationMs;
  const afterNewsAgeText = formatDuration("en", afterNewsAge, "scientific");
  const afterEvent = afterState.run.randomEvents.history.find(
    (entry) => entry.id === "galacticMarketLockdown",
  );
  if (!afterEvent) throw new Error("The Market Lockdown history entry disappeared.");
  const afterEventAgeText = formatDuration(
    "en",
    afterState.run.clock.simulationMs - afterEvent.simulationMs,
    "scientific",
  );
  await expect(newsCountdown).toContainText(afterNewsRemainingText);
  await expect(newsAge).toContainText(afterNewsAgeText);
  await expect(eventAge).toContainText(afterEventAgeText);
  expect(afterNewsRemainingText).not.toBe(beforeNewsRemainingText);
  expect(afterNewsAgeText).not.toBe(beforeNewsAgeText);
  expect(afterEventAgeText).not.toBe(beforeEventAgeText);
  expect(afterNewsAge).toBeGreaterThan(beforeNewsAge);
});
