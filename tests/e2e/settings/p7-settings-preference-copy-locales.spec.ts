import type { Page, Locator } from "@playwright/test";
import { expect, test } from "../_harness/fixtures";
import { CURRENCY_CODES, CURRENCY_IDS, CURRENCY_SYMBOLS } from "../../../src/content/currency";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { economyLabel } from "../../../src/i18n/economyMessages";
import { translate } from "../../../src/i18n/messages";
import {
  settingsLabel,
  settingsText,
  themeName,
} from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

async function expectLocalizedTooltip(
  page: Page,
  testId: string,
  accessibleName: string,
  content: string,
): Promise<void> {
  const trigger = page.getByTestId(testId + "-trigger");
  const tooltip = page.getByTestId(testId);
  await expect(trigger).toHaveAttribute("aria-label", accessibleName);
  await expect(tooltip).toHaveText(content);
  await trigger.click();
  await expect(tooltip).toHaveClass(/is-open/u);
}

async function toggleAndRestore(control: Locator): Promise<void> {
  const initialValue = await control.isChecked();
  await control.setChecked(!initialValue);
  await expect(control).toBeChecked({ checked: !initialValue });
  await control.setChecked(initialValue);
  await expect(control).toBeChecked({ checked: initialValue });
}

test("Visual and Game Options preference copy follows the selected locale @phase7-locale @settings @locale", async ({
  freshGame,
}) => {
  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);

    const settingsTab = freshGame.locator("#tab-settings");
    await expect(settingsTab.locator("span").first()).toHaveText(
      translate(locale, "tab.settings"),
    );
    const settingsOverview = economyLabel(locale, "settingsOverviewHelp");
    await expect(settingsTab).toHaveAttribute("title", settingsOverview);
    await expect(settingsTab).toHaveAttribute("aria-description", settingsOverview);
    await settingsTab.click();

    const settings = freshGame.getByTestId("settings-pane");
    await expect(settings.locator("#settings-title")).toHaveText(
      settingsText(locale, "title"),
    );
    await expect(settings.locator(".pane-heading .pane-intro")).toHaveText(
      settingsText(locale, "description"),
    );
    await settings.locator("#tab-settings-visual").click();
    const visual = settings.locator("#panel-settings-visual");

    await expect(visual.locator(".pane-intro")).toHaveText(
      settingsText(locale, "visualDescription"),
    );

    const theme = visual.locator("#settings-theme");
    await expect(visual.locator('label[for="settings-theme"]')).toHaveText(
      settingsText(locale, "theme"),
    );
    await expect(visual.getByTestId("settings-theme-description")).toHaveText(
      settingsText(locale, "themeRowDescription"),
    );
    await expect(theme).toHaveAttribute("aria-describedby", "settings-theme-description");
    await expect(theme.locator("option")).toHaveCount(THEME_IDS.length);
    for (const themeId of THEME_IDS) {
      await expect(theme.locator('option[value="' + themeId + '"]')).toHaveText(
        themeName(locale, themeId),
      );
    }

    const currency = visual.locator("#settings-currency");
    await expect(visual.locator('label[for="settings-currency"]')).toHaveText(
      settingsText(locale, "currency"),
    );
    await expect(visual.getByTestId("settings-currency-description")).toHaveText(
      settingsText(locale, "currencyDescription"),
    );
    await expect(currency).toHaveAttribute("aria-describedby", "settings-currency-description");
    await expect(currency.locator("option")).toHaveCount(CURRENCY_IDS.length);
    for (const currencyId of CURRENCY_IDS) {
      await expect(currency.locator(`option[value="${currencyId}"]`)).toHaveText(
        `${CURRENCY_SYMBOLS[currencyId]} (${CURRENCY_CODES[currencyId]})`,
      );
    }
    const originalCurrency = await currency.inputValue();
    const alternateCurrency = originalCurrency === "eur" ? "usd" : "eur";
    await currency.selectOption(alternateCurrency);
    await expect(currency).toHaveValue(alternateCurrency);
    await currency.selectOption(originalCurrency);
    await expect(currency).toHaveValue(originalCurrency);

    const notation = visual.locator("#settings-notation");
    await expect(notation).toHaveAccessibleName(settingsText(locale, "notation"));
    await expect(visual.getByTestId("settings-notation-description")).toHaveText(
      settingsText(locale, "notationRowDescription"),
    );
    for (const notationId of ["condensed", "standard", "scientific"] as const) {
      await expect(notation.locator('option[value="' + notationId + '"]')).toHaveText(
        settingsText(
          locale,
          notationId === "condensed"
            ? "condensed"
            : notationId === "standard"
              ? "standard"
              : "scientific",
        ),
      );
    }

    await expect(visual.locator('label[for="settings-motion"]')).toHaveText(
      settingsText(locale, "reducedMotion"),
    );
    await expect(visual.locator('label[for="settings-notifications"]')).toHaveText(
      settingsText(locale, "notifications"),
    );
    await expect(visual.getByTestId("settings-notifications-description")).toHaveText(
      settingsText(locale, "notificationsRowDescription"),
    );
    await expect(visual.locator('label[for="settings-custom-pointer"]')).toHaveText(
      settingsText(locale, "customPointer"),
    );
    await expect(visual.locator("#settings-custom-pointer-description")).toHaveText(
      settingsText(locale, "customPointerDescription"),
    );
    await expect(visual.locator('label[for="settings-pointer-trail"]')).toHaveText(
      settingsText(locale, "pointerTrail"),
    );
    await expect(visual.locator("#settings-pointer-trail-description")).toHaveText(
      settingsText(locale, "pointerTrailDescription"),
    );
    await expect(visual.locator('label[for="settings-weather-effects"]')).toHaveText(
      settingsText(locale, "weatherEffects"),
    );
    await expect(visual.locator("#settings-weather-effects-description")).toHaveText(
      settingsText(locale, "weatherEffectsDescription"),
    );

    await expectLocalizedTooltip(
      freshGame,
      "settings-theme-help",
      settingsText(locale, "optionHelpLabel"),
      settingsText(locale, "themeHelpDescription"),
    );
    await expectLocalizedTooltip(
      freshGame,
      "settings-currency-help",
      settingsText(locale, "optionHelpLabel"),
      settingsText(locale, "currencyHelpDescription"),
    );
    await expectLocalizedTooltip(
      freshGame,
      "settings-notation-help",
      settingsText(locale, "optionHelpLabel"),
      settingsText(locale, "notationHelpDescription"),
    );
    await expectLocalizedTooltip(
      freshGame,
      "settings-notifications-help",
      settingsText(locale, "optionHelpLabel"),
      settingsText(locale, "notificationsHelpDescription"),
    );
    await expectLocalizedTooltip(
      freshGame,
      "settings-custom-pointer-help",
      settingsText(locale, "customPointerHelpLabel"),
      settingsText(locale, "customPointerDescription"),
    );
    await expectLocalizedTooltip(
      freshGame,
      "settings-pointer-trail-help",
      settingsText(locale, "pointerTrailHelpLabel"),
      settingsText(locale, "pointerTrailDescription"),
    );

    for (const controlId of [
      "settings-notifications",
      "settings-custom-pointer",
      "settings-pointer-trail",
      "settings-weather-effects",
    ]) {
      await toggleAndRestore(visual.locator("#" + controlId));
    }

    await settings.locator("#tab-settings-game-options").click();
    const gameOptions = settings.locator("#panel-settings-game-options");
    await expect(gameOptions.locator(".pane-intro")).toHaveText(
      settingsText(locale, "gameOptionsDescription"),
    );

    const fullscreenButton = gameOptions.locator(
      'button[aria-describedby="settings-fullscreen-description"]',
    );
    await expect(fullscreenButton.locator("xpath=..").locator("span").first()).toHaveText(
      settingsText(locale, "fullscreen"),
    );
    await expect(fullscreenButton).toHaveText(settingsText(locale, "fullscreenToggle"));
    await expect(gameOptions.getByTestId("settings-fullscreen-description")).toHaveText(
      settingsText(locale, "fullscreenDescription"),
    );

    await expect(gameOptions.locator('label[for="settings-language"]')).toHaveText(
      settingsLabel(locale, "language"),
    );
    await expect(gameOptions.locator("#settings-language")).toHaveValue(locale);
    await expect(gameOptions.getByTestId("settings-language-description")).toHaveText(
      settingsText(locale, "languageRowDescription"),
    );

    await expect(gameOptions.locator('label[for="settings-background-audio"]')).toHaveText(
      settingsText(locale, "backgroundAudio"),
    );
    await expect(gameOptions.getByTestId("settings-background-audio-description")).toHaveText(
      settingsText(locale, "backgroundAudioRowDescription"),
    );
    await expect(
      gameOptions.locator('label[for="settings-background-volume"]'),
    ).toHaveText(settingsText(locale, "backgroundAudioVolume"));

    await expect(gameOptions.locator('label[for="settings-sound-effects"]')).toHaveText(
      settingsText(locale, "soundEffects"),
    );
    await expect(gameOptions.getByTestId("settings-sound-effects-description")).toHaveText(
      settingsText(locale, "soundEffectsRowDescription"),
    );
    await expect(
      gameOptions.locator('label[for="settings-sound-effects-volume"]'),
    ).toHaveText(settingsText(locale, "soundEffectsVolume"));

    await expect(gameOptions.locator('label[for="settings-news-ticker"]')).toHaveText(
      settingsText(locale, "newsTicker"),
    );
    await expect(gameOptions.getByTestId("settings-news-ticker-description")).toHaveText(
      settingsText(locale, "newsTickerRowDescription"),
    );
    await toggleAndRestore(gameOptions.locator("#settings-news-ticker"));
  }
});
