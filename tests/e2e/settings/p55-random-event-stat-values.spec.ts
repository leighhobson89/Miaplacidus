import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { RANDOM_EVENT_IDS } from "../../../src/content/metaSignals";
import { randomEventName } from "../../../src/i18n/metaSignalMessages";
import { settingsStatisticLabel } from "../../../src/i18n/settingsMessages";

test("P-55 Statistics displays each Random Event current-run and lifetime value @p55-random-event-stats", async ({
  freshGame,
}) => {
  await startMetaFixture(freshGame, "meta-rebirth-ready");

  const before = await freshGame.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      run: state.run.randomEvents.eventCountsThisRun,
      lifetime: state.statistics.lifetimeRandomEventCounts,
    };
  });
  expect(before.run.researchBreakthrough).toBe(0);
  expect(before.lifetime.researchBreakthrough).toBe(0);

  const accepted = await freshGame.evaluate(() => [
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "researchBreakthrough",
    }),
    window.miaplacidusTest!.dispatch({
      type: "random-event.force",
      eventId: "researchBreakthrough",
    }),
  ]);
  expect(accepted).toEqual([true, true]);

  const expected = await freshGame.evaluate(() => {
    const state = window.miaplacidusTest!.getState();
    return {
      run: state.run.randomEvents.eventCountsThisRun,
      lifetime: state.statistics.lifetimeRandomEventCounts,
    };
  });
  expect(expected.run.researchBreakthrough).toBe(2);
  expect(expected.lifetime.researchBreakthrough).toBe(2);

  await freshGame.locator("#tab-settings").click();
  await freshGame.locator("#tab-settings-statistics").click();
  const statistics = freshGame.getByTestId("settings-statistics");
  const events = statistics
    .getByRole("heading", { name: "Events", level: 3, exact: true })
    .locator("xpath=..");
  await expect(events.locator(".settings-stat-card")).toHaveCount(RANDOM_EVENT_IDS.length);

  for (const id of RANDOM_EVENT_IDS) {
    const row = events.locator(`[data-statistic-id="event-${id}"]`);
    await expect(row.locator("dt")).toHaveText(randomEventName("en", id));
    await expect(row.locator(".settings-stat-pair-values small")).toHaveText([
      settingsStatisticLabel("en", "run"),
      settingsStatisticLabel("en", "lifetime"),
    ]);
    await expect(row.locator(".settings-stat-pair-values strong")).toHaveText([
      String(expected.run[id]),
      String(expected.lifetime[id]),
    ]);
  }
});
