import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { RANDOM_EVENT_IDS } from "../../../src/content/metaSignals";
import { setGameLocale } from "../_harness/settings-controls";

test("P-45 Statistics event names and run/lifetime labels render in all six locales @p45-statistics-locales", async ({
  freshGame,
}) => {
  await startMetaFixture(freshGame, "meta-rebirth-ready");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
    await freshGame.locator("#tab-settings").click();
    await freshGame.locator("#tab-settings-statistics").click();

    const statistics = freshGame.getByTestId("settings-statistics");
    const rows = statistics.locator('[data-statistic-id^="event-"]');
    await expect(rows).toHaveCount(RANDOM_EVENT_IDS.length);

    for (const id of RANDOM_EVENT_IDS) {
      const row = statistics.locator(`[data-statistic-id="event-${id}"]`);
      await expect(row.locator("dt")).toHaveText(/\S/u);
      const scopeLabels = row.locator(".settings-stat-pair-values small");
      await expect(scopeLabels).toHaveCount(2);
      for (const label of await scopeLabels.all()) await expect(label).toHaveText(/\S/u);
    }
  }
});
