import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { settingsText, themeName } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("P-55 Overview theme value follows selection and opens Visual in all locales @settings @statistics @p55-theme", async ({
  freshGame,
}) => {
  const settings = freshGame.getByTestId("settings-statistics");
  const themeCard = settings.locator('[data-statistic-id="theme"]');

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await freshGame.locator("#tab-settings").click();
    await freshGame.locator("#tab-settings-statistics").click();

    const selectedTheme = await freshGame.evaluate(
      () => window.miaplacidusTest!.getState().settings.themeId,
    );
    await expect(themeCard.locator("dd")).toHaveText(themeName(locale, selectedTheme));

    const themeLink = themeCard.locator("dt a");
    await expect(themeLink).toHaveText(settingsText(locale, "theme"));
    await themeLink.click();
    await expect(freshGame.locator("#tab-settings-visual")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const themeSelector = freshGame.locator("#settings-theme");
    await expect(themeSelector).toHaveValue(selectedTheme);

    const nextTheme = THEME_IDS.find((id) => id !== selectedTheme)!;
    await themeSelector.selectOption(nextTheme);
    await expect
      .poll(() => freshGame.evaluate(() => window.miaplacidusTest!.getState().settings.themeId))
      .toBe(nextTheme);

    await freshGame.locator("#tab-settings-statistics").click();
    await expect(themeCard.locator("dd")).toHaveText(themeName(locale, nextTheme));
    await themeCard.locator("dt a").click();
    await expect(themeSelector).toHaveValue(nextTheme);
  }
});
