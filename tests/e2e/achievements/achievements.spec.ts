import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { resumeSavedPioneer, saveNowFromSettings } from "../_harness/save-controls";
import { ACHIEVEMENT_CATALOGUE, achievementName } from "../../../src/content/achievements";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { achievementText } from "../../../src/i18n/achievementMessages";
import { settingsLabel, settingsText } from "../../../src/i18n/settingsMessages";

test("shows unlocked game tabs and permanently awards the all-themes achievement", async ({
  page,
}) => {
  await startMetaFixture(page, "meta-rebirth-ready");
  const mainTabs = page.getByRole("tablist", { name: "Game sections" }).getByRole("tab");
  expect(await mainTabs.evaluateAll((tabs) => tabs.map((tab) => tab.id))).toEqual([
    "tab-hydrogen",
    "tab-research",
    "tab-galaxy",
    "tab-settings",
    "tab-miaplaedia",
  ]);
  await page.getByRole("tab", { name: "Settings" }).click();
  const settings = page.getByTestId("settings-pane");
  await expect(settings).toBeVisible();
  const settingsTabs = settings.getByRole("tablist").getByRole("tab");
  expect(await settingsTabs.evaluateAll((tabs) => tabs.map((tab) => tab.id))).toEqual([
    "tab-settings-achievements",
    "tab-settings-events",
    "tab-settings-statistics",
    "tab-settings-visual",
    "tab-settings-game-options",
    "tab-settings-saves",
  ]);
  await settings.locator("#tab-settings-events").click();
  await expect(settings.getByTestId("meta-journal-pane")).toBeVisible();
  await settings.locator("#tab-settings-visual").click();

  const themeSelector = page.getByTestId("theme-selector");
  for (const themeId of THEME_IDS.slice(1)) {
    await themeSelector.selectOption(themeId);
    await expect(page.locator(".game-frame")).toHaveAttribute("data-theme", themeId);
  }
  await settings.locator("#tab-settings-achievements").click();
  await expect(settings.getByTestId("achievements-pane")).toBeVisible();
  await expect(settings.locator('[data-achievement-id="tryAllThemes"]')).toHaveClass(/is-earned/);
  const badgeIds = await settings
    .locator("[data-achievement-badge]")
    .evaluateAll((badges) => badges.map((badge) => badge.getAttribute("data-achievement-badge")));
  expect(badgeIds).toEqual(ACHIEVEMENT_CATALOGUE.map(({ id }) => id));

  await saveNowFromSettings(page);
  await expect(page.getByTestId("save-status")).toContainText("Saved");
  await page.reload();
  await resumeSavedPioneer(page, "Ascendency Pioneer");
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await expect(page.getByTestId("theme-selector")).toHaveValue("space");
  await settings.locator("#tab-settings-achievements").click();
  await expect(
    page.getByTestId("settings-pane").locator('[data-achievement-id="tryAllThemes"]'),
  ).toHaveClass(/is-earned/);
  await settings.locator("#tab-settings-game-options").click();

  let currentLocale = "en" as (typeof LOCALE_IDS)[number];
  for (const locale of LOCALE_IDS) {
    await page
      .getByTestId("settings-pane")
      .getByLabel(settingsLabel(currentLocale, "language"))
      .selectOption(locale);
    currentLocale = locale;
    await expect(
      page.getByRole("heading", { name: settingsText(locale, "title"), exact: true }),
    ).toBeVisible();
    await settings.locator("#tab-settings-achievements").click();
    await expect(
      page.getByRole("heading", { name: achievementText(locale, "title"), exact: true }),
    ).toBeVisible();
    await expect(
      page.getByTestId("achievements-pane").locator('[data-achievement-id="collect50Hydrogen"] h3'),
    ).toHaveText(achievementName("collect50Hydrogen", locale));
    await settings.locator("#tab-settings-game-options").click();
  }
});
