import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import {
  SETTINGS_PANE_IDS,
  settingsPaneItems,
  type SettingsPaneId,
} from "../../../src/app/presentationNavigation";
import { achievementText } from "../../../src/i18n/achievementMessages";
import { metaSignalText } from "../../../src/i18n/metaSignalMessages";
import { settingsSectionName, settingsText } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

const LANGUAGE_NAMES = {
  en: "English",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  it: "Italiano",
  fr: "Français",
} as const;

const SOURCE_SETTINGS_ROUTES = [
  {
    id: "settings-achievements",
    sourceOptionId: "option10",
    groupId: "settings-achievements-and-stats",
    groupKey: "achievementsAndStatsSection",
  },
  {
    id: "settings-events",
    sourceOptionId: "option14",
    groupId: "settings-achievements-and-stats",
    groupKey: "achievementsAndStatsSection",
  },
  {
    id: "settings-statistics",
    sourceOptionId: "option8",
    groupId: "settings-achievements-and-stats",
    groupKey: "achievementsAndStatsSection",
  },
  {
    id: "settings-visual",
    sourceOptionId: "option1",
    groupId: "settings-options",
    groupKey: "optionsSection",
  },
  {
    id: "settings-game-options",
    sourceOptionId: "option3",
    groupId: "settings-options",
    groupKey: "optionsSection",
  },
  {
    id: "settings-saves",
    sourceOptionId: "option2",
    groupId: "settings-options",
    groupKey: "optionsSection",
  },
] as const satisfies readonly {
  id: SettingsPaneId;
  sourceOptionId: string;
  groupId: string;
  groupKey: "achievementsAndStatsSection" | "optionsSection";
}[];

function destinationHeading(locale: (typeof LOCALE_IDS)[number], paneId: SettingsPaneId) {
  switch (paneId) {
    case "settings-achievements":
      return achievementText(locale, "title");
    case "settings-events":
      return metaSignalText(locale, "title");
    case "settings-statistics":
      return settingsSectionName(locale, "statistics");
    case "settings-visual":
      return settingsSectionName(locale, "visual");
    case "settings-game-options":
      return settingsSectionName(locale, "gameOptions");
    case "settings-saves":
      return settingsText(locale, "savingSection");
  }
}

function destinationLabel(locale: (typeof LOCALE_IDS)[number], paneId: SettingsPaneId) {
  switch (paneId) {
    case "settings-achievements":
      return settingsText(locale, "achievements");
    case "settings-events":
      return settingsSectionName(locale, "events");
    case "settings-statistics":
      return settingsSectionName(locale, "statistics");
    case "settings-visual":
      return settingsSectionName(locale, "visual");
    case "settings-game-options":
      return settingsSectionName(locale, "gameOptions");
    case "settings-saves":
      return settingsText(locale, "savingSection");
  }
}

test("Settings source destinations and language choices stay localized in all six locales @phase7-locale @settings @locale", async ({
  freshGame,
}) => {
  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
    await freshGame.locator("#tab-settings").click();

    const settings = freshGame.getByTestId("settings-pane");
    await settings.locator("#tab-settings-game-options").click();
    const language = settings.locator("#settings-language");
    await expect(language).toHaveValue(locale);
    await expect(language.locator("option")).toHaveCount(LOCALE_IDS.length);
    for (const languageId of LOCALE_IDS) {
      await expect(language.locator(`option[value="${languageId}"]`)).toHaveText(
        LANGUAGE_NAMES[languageId],
      );
    }

    const items = settingsPaneItems(locale);
    expect(SETTINGS_PANE_IDS).toEqual(SOURCE_SETTINGS_ROUTES.map(({ id }) => id));
    expect(
      items.map(({ id, sourceOptionId, groupId, groupLabel }) => ({
        id,
        sourceOptionId,
        groupId,
        groupLabel,
      })),
    ).toEqual(
      SOURCE_SETTINGS_ROUTES.map(({ id, sourceOptionId, groupId, groupKey }) => ({
        id,
        sourceOptionId,
        groupId,
        groupLabel: settingsText(locale, groupKey),
      })),
    );
    await expect(settings.getByRole("tab")).toHaveCount(SOURCE_SETTINGS_ROUTES.length);
    const groupHeadings = settings.locator(".pane-nav-group-heading");
    await expect(groupHeadings).toHaveCount(2);
    await expect(groupHeadings.nth(0).locator("span").first()).toHaveText(
      settingsText(locale, "achievementsAndStatsSection"),
    );
    await expect(groupHeadings.nth(1).locator("span").first()).toHaveText(
      settingsText(locale, "optionsSection"),
    );

    for (const route of SOURCE_SETTINGS_ROUTES) {
      const label = destinationLabel(locale, route.id);
      const tab = settings.locator(`#tab-${route.id}`);
      await expect(tab).toHaveText(label);
      await tab.click();

      const panel = settings.locator(`#panel-${route.id}`);
      await expect(panel).toBeVisible();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(panel.locator("h2, h3").first()).toHaveText(
        destinationHeading(locale, route.id),
      );
    }
  }
});
