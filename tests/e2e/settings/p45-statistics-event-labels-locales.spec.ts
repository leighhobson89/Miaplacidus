import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { RANDOM_EVENT_IDS } from "../../../src/content/metaSignals";
import { setGameLocale } from "../_harness/settings-controls";
import { randomEventName } from "../../../src/i18n/metaSignalMessages";
import { settingsSectionName, settingsStatisticLabel } from "../../../src/i18n/settingsMessages";

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
    const events = statistics
      .getByRole("heading", {
        name: settingsSectionName(locale, "events"),
        level: 3,
        exact: true,
      })
      .locator("xpath=..");
    const rows = events.locator(".settings-stat-card");
    await expect(rows).toHaveCount(RANDOM_EVENT_IDS.length);

    for (const id of RANDOM_EVENT_IDS) {
      const row = events.locator(`[data-statistic-id="event-${id}"]`);
      await expect(row.locator("dt")).toHaveText(randomEventName(locale, id));
      await expect(row.locator(".settings-stat-pair-values small")).toHaveText([
        settingsStatisticLabel(locale, "run"),
        settingsStatisticLabel(locale, "lifetime"),
      ]);
    }
  }
});
