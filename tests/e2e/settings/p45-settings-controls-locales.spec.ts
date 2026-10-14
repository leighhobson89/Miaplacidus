import { expect, test } from "../_harness/fixtures";
import { THEME_IDS } from "../../../src/content/themes";
import { LOCALE_IDS } from "../../../src/content/ids";
import { setGameLocale } from "../_harness/settings-controls";

test("P-45 Settings preference labels and options render in all six locales @p45-settings-locales", async ({
  freshGame,
}) => {
  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
    await freshGame.locator("#tab-settings").click();

    const settings = freshGame.getByTestId("settings-pane");
    await expect(settings.getByRole("heading", { level: 2 })).toHaveText(/\S/u);

    await settings.locator("#tab-settings-visual").click();
    const visual = settings.locator("#panel-settings-visual");
    await expect(visual.getByRole("heading", { level: 3 }).first()).toHaveText(/\S/u);
    const theme = visual.locator("#settings-theme");
    await expect(theme).toHaveAttribute("aria-label", /\S/u);
    await expect(theme.locator("option")).toHaveCount(THEME_IDS.length);
    for (const option of await theme.locator("option").all()) await expect(option).toHaveText(/\S/u);
    for (const controlId of ["settings-currency", "settings-notation"]) {
      await expect(visual.locator(`#${controlId}`)).toBeVisible();
      await expect(visual.locator(`label[for="${controlId}"]`)).toHaveText(/\S/u);
    }
    for (const controlId of [
      "settings-motion",
      "settings-notifications",
      "settings-custom-pointer",
      "settings-pointer-trail",
      "settings-weather-effects",
    ]) {
      await expect(visual.locator(`#${controlId}`)).toBeVisible();
      await expect(visual.locator(`label[for="${controlId}"]`)).toHaveText(/\S/u);
    }

    await settings.locator("#tab-settings-game-options").click();
    const gameOptions = settings.locator("#panel-settings-game-options");
    await expect(gameOptions.getByRole("heading", { level: 3 }).first()).toHaveText(/\S/u);
    const fullscreen = gameOptions.locator('button[aria-describedby="settings-fullscreen-description"]');
    await expect(fullscreen).toBeVisible();
    await expect(fullscreen).toHaveText(/\S/u);
    for (const controlId of [
      "settings-language",
      "settings-background-audio",
      "settings-sound-effects",
      "settings-news-ticker",
    ]) {
      await expect(gameOptions.locator(`#${controlId}`)).toBeVisible();
      await expect(gameOptions.locator(`label[for="${controlId}"]`)).toHaveText(/\S/u);
    }
    await expect(gameOptions.locator("#settings-background-volume")).toBeVisible();
    await expect(gameOptions.locator("#settings-sound-effects-volume")).toBeVisible();
    await expect(gameOptions.locator('label[for="settings-background-volume"] span')).toHaveText(/\S/u);
    await expect(gameOptions.locator('label[for="settings-sound-effects-volume"] span')).toHaveText(/\S/u);
  }
});
