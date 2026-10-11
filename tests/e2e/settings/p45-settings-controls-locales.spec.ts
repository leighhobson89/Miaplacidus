import { expect, test } from "../_harness/fixtures";
import { THEME_IDS } from "../../../src/content/themes";
import { LOCALE_IDS } from "../../../src/content/ids";
import {
  themeName,
  settingsLabel,
  settingsSectionName,
  settingsText,
} from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("P-45 Settings preference labels and options render in all six locales @p45-settings-locales", async ({
  freshGame,
}) => {
  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
    await freshGame.locator("#tab-settings").click();

    const settings = freshGame.getByTestId("settings-pane");
    await expect(
      settings.getByRole("heading", { name: settingsText(locale, "title") }),
    ).toBeVisible();

    await settings.locator("#tab-settings-visual").click();
    const visual = settings.locator("#panel-settings-visual");
    await expect(
      visual.getByRole("heading", { name: settingsSectionName(locale, "visual") }),
    ).toBeVisible();
    const theme = visual.getByLabel(settingsText(locale, "theme"));
    await expect(theme.locator("option")).toHaveText(THEME_IDS.map((id) => themeName(locale, id)));
    await expect(visual.getByLabel(settingsText(locale, "currency"))).toBeVisible();
    await expect(visual.getByLabel(settingsText(locale, "notation"))).toBeVisible();
    for (const key of [
      "reducedMotion",
      "notifications",
      "customPointer",
      "pointerTrail",
      "weatherEffects",
    ] as const) {
      await expect(visual.getByLabel(settingsText(locale, key))).toBeVisible();
    }

    await settings.locator("#tab-settings-game-options").click();
    const gameOptions = settings.locator("#panel-settings-game-options");
    await expect(
      gameOptions.getByRole("heading", { name: settingsSectionName(locale, "gameOptions") }),
    ).toBeVisible();
    await expect(
      gameOptions.getByText(settingsText(locale, "fullscreen"), { exact: true }),
    ).toBeVisible();
    await expect(
      gameOptions.getByRole("button", { name: settingsText(locale, "fullscreenEnter") }),
    ).toBeVisible();
    await expect(gameOptions.getByLabel(settingsLabel(locale, "language"))).toBeVisible();
    for (const key of ["backgroundAudio", "soundEffects", "newsTicker"] as const) {
      await expect(
        gameOptions.getByLabel(settingsText(locale, key), { exact: true }),
      ).toBeVisible();
    }
    await expect(
      gameOptions.getByRole("slider", {
        name: settingsText(locale, "backgroundAudioVolume"),
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      gameOptions.getByRole("slider", {
        name: settingsText(locale, "soundEffectsVolume"),
        exact: true,
      }),
    ).toBeVisible();
  }
});
