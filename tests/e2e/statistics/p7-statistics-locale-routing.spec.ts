import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { RANDOM_EVENT_IDS } from "../../../src/content/metaSignals";
import {
  overviewStatisticLabel,
  eventTrackingNote,
  runStatisticLabel,
  statisticsEventLabel,
  statisticsText,
} from "../../../src/i18n/statisticsMessages";
import {
  settingsSectionName,
  settingsStatisticLabel,
  settingsText,
} from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("P7 Statistics route labels and copy follow the selected locale @phase7-locale @statistics @locale", async ({
  freshGame,
}) => {
  const overviewRows: readonly { id: string; label: (locale: LocaleId) => string }[] = [
    { id: "activeTime", label: (locale) => settingsStatisticLabel(locale, "activeTime") },
    { id: "pioneer", label: (locale) => settingsStatisticLabel(locale, "pioneer") },
    { id: "ascendencyPoints", label: (locale) => overviewStatisticLabel(locale, "currentAp") },
    { id: "apGain", label: (locale) => overviewStatisticLabel(locale, "apGain") },
    { id: "runNumber", label: (locale) => settingsStatisticLabel(locale, "runNumber") },
    {
      id: "uniqueNewsTickers",
      label: (locale) => overviewStatisticLabel(locale, "uniqueNewsTickers"),
    },
    { id: "tickerPrizes", label: (locale) => overviewStatisticLabel(locale, "tickerPrizes") },
    { id: "theme", label: (locale) => settingsText(locale, "theme") },
    {
      id: "lifetimeAntimatter",
      label: (locale) => settingsStatisticLabel(locale, "lifetimeAntimatter"),
    },
    { id: "totalAsteroids", label: (locale) => overviewStatisticLabel(locale, "totalAsteroids") },
    {
      id: "legendaryAsteroids",
      label: (locale) => overviewStatisticLabel(locale, "legendaryAsteroids"),
    },
    { id: "rocketsLaunched", label: (locale) => overviewStatisticLabel(locale, "rocketsLaunched") },
    {
      id: "starshipsLaunched",
      label: (locale) => overviewStatisticLabel(locale, "starshipsLaunched"),
    },
  ];
  const runRows: readonly { id: string; label: (locale: LocaleId) => string }[] = [
    { id: "runTime", label: (locale) => runStatisticLabel(locale, "runTime") },
    { id: "starSystem", label: (locale) => runStatisticLabel(locale, "starSystem") },
    { id: "currentWeather", label: (locale) => runStatisticLabel(locale, "currentWeather") },
    { id: "cash", label: (locale) => runStatisticLabel(locale, "cash") },
    { id: "apAnticipated", label: (locale) => runStatisticLabel(locale, "apAnticipated") },
    { id: "antimatter", label: (locale) => runStatisticLabel(locale, "antimatter") },
  ];

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);

    await freshGame.locator("#tab-settings").click();
    const statisticsTab = freshGame.locator("#tab-settings-statistics");
    await expect(statisticsTab).toHaveText(settingsSectionName(locale, "statistics"));
    await statisticsTab.click();

    const statistics = freshGame.getByTestId("settings-statistics");
    await expect(statistics.getByRole("heading", { level: 2 })).toHaveText(
      settingsSectionName(locale, "statistics"),
    );
    await expect(statistics.locator(".pane-intro")).toHaveText(
      statisticsText(locale, "description"),
    );

    const overview = statistics
      .getByRole("heading", {
        level: 3,
        name: settingsStatisticLabel(locale, "overviewSection"),
        exact: true,
      })
      .locator("xpath=..");
    for (const row of overviewRows) {
      await expect(overview.locator(`[data-statistic-id="${row.id}"] dt`)).toHaveText(
        row.label(locale),
      );
    }

    const run = statistics
      .getByRole("heading", {
        level: 3,
        name: settingsStatisticLabel(locale, "runSection"),
        exact: true,
      })
      .locator("xpath=..");
    for (const row of runRows) {
      await expect(run.locator(`[data-statistic-id="${row.id}"] dt`)).toHaveText(
        row.label(locale),
      );
    }

    const events = statistics
      .getByRole("heading", {
        level: 3,
        name: settingsSectionName(locale, "events"),
        exact: true,
      })
      .locator("xpath=..");
    await expect(events.locator(".settings-stat-note")).toHaveText(eventTrackingNote(locale));
    await expect(events.locator(".settings-stat-card")).toHaveCount(RANDOM_EVENT_IDS.length);
    for (const id of RANDOM_EVENT_IDS) {
      const row = events.locator(`[data-statistic-id="event-${id}"]`);
      await expect(row.locator("dt")).toHaveText(statisticsEventLabel(locale, id));
      await expect(row.locator(".settings-stat-pair-values small")).toHaveText([
        settingsStatisticLabel(locale, "run"),
        settingsStatisticLabel(locale, "lifetime"),
      ]);
    }
  }
});
