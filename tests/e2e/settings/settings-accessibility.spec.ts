import { expect, test } from "../_harness/fixtures";
import { settingsPaneItems } from "../../../src/app/presentationNavigation";
import { LOCALE_IDS } from "../../../src/content/ids";
import { settingsText } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("Settings exposes labelled tabs and associated panels with keyboard focus order @p15 @accessibility", async ({
  freshGame,
}) => {
  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(freshGame, locale);

    const settingsTab = freshGame.locator("#tab-settings");
    await expect(settingsTab).toHaveAttribute("role", "tab");
    await settingsTab.click();

    const settings = freshGame.getByTestId("settings-pane");
    await expect(settings).toHaveAttribute("aria-labelledby", "settings-title");
    await expect(
      settings.getByRole("heading", { name: settingsText(locale, "title"), level: 2 }),
    ).toBeVisible();

    const sectionsLabel = settingsText(locale, "sections");
    const navigation = settings.getByRole("navigation", { name: sectionsLabel });
    const tablist = navigation.getByRole("tablist", { name: sectionsLabel });
    const sectionItems = settingsPaneItems(locale);
    await expect(tablist.getByRole("tab")).toHaveCount(sectionItems.length);

    for (const item of sectionItems) {
      const tab = tablist.getByRole("tab", { name: item.label });
      const panelId = `panel-${item.id}`;
      await expect(tab).toHaveAttribute("aria-controls", panelId);

      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(tab).toHaveAttribute("tabindex", "0");
      const panel = settings.locator(`#${panelId}`);
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute("role", "tabpanel");
      await expect(panel).toHaveAttribute("aria-labelledby", `tab-${item.id}`);
      await expect(panel.getByRole("heading").first()).toBeVisible();
    }

    const visualItem = sectionItems.find((item) => item.id === "settings-visual");
    const gameOptionsItem = sectionItems.find((item) => item.id === "settings-game-options");
    expect(visualItem).toBeDefined();
    expect(gameOptionsItem).toBeDefined();
    const visualTab = tablist.getByRole("tab", { name: visualItem!.label });
    const gameOptionsTab = tablist.getByRole("tab", { name: gameOptionsItem!.label });
    await visualTab.focus();
    await freshGame.keyboard.press("ArrowRight");
    await expect(gameOptionsTab).toHaveAttribute("aria-selected", "true");
    await expect(gameOptionsTab).toBeFocused();
    await expect(visualTab).toHaveAttribute("tabindex", "-1");
  }
});

test("shows source-mapped Settings descriptions and helper details in all locales @p44-settings-copy @settings @locale", async ({
  freshGame,
}) => {
  for (const locale of LOCALE_IDS) {
    if (locale !== "en") await setGameLocale(freshGame, locale);

    await freshGame.locator("#tab-settings").click();
    const settings = freshGame.getByTestId("settings-pane");

    await settings.locator("#tab-settings-visual").click();
    const visualPanel = settings.locator("#panel-settings-visual");
    await expect(visualPanel.locator(".pane-intro")).toHaveText(
      settingsText(locale, "visualDescription"),
    );
    await expect(settings.getByTestId("settings-currency-description")).toHaveText(
      settingsText(locale, "currencyDescription"),
    );
    await expect(settings.locator("#settings-currency")).toHaveAttribute(
      "aria-describedby",
      "settings-currency-description",
    );
    for (const [testId, messageKey] of [
      ["settings-theme-description", "themeRowDescription"],
      ["settings-notation-description", "notationRowDescription"],
      ["settings-notifications-description", "notificationsRowDescription"],
    ] as const) {
      await expect(visualPanel.getByTestId(testId)).toHaveText(settingsText(locale, messageKey));
    }
    for (const [controlId, descriptionId] of [
      ["settings-theme", "settings-theme-description"],
      ["settings-notation", "settings-notation-description"],
      ["settings-notifications", "settings-notifications-description"],
    ] as const) {
      await expect(visualPanel.locator(`#${controlId}`)).toHaveAttribute(
        "aria-describedby",
        descriptionId,
      );
    }
    for (const [testId, messageKey] of [
      ["settings-theme-help", "themeHelpDescription"],
      ["settings-currency-help", "currencyHelpDescription"],
      ["settings-notation-help", "notationHelpDescription"],
      ["settings-notifications-help", "notificationsHelpDescription"],
    ] as const) {
      await expect(settings.getByTestId(testId)).toHaveText(settingsText(locale, messageKey));
      await expect(settings.getByTestId(`${testId}-trigger`)).toHaveAttribute(
        "aria-describedby",
        `${testId}-tooltip`,
      );
    }

    await settings.locator("#tab-settings-game-options").click();
    const gameOptionsPanel = settings.locator("#panel-settings-game-options");
    await expect(gameOptionsPanel.locator(".pane-intro")).toHaveText(
      settingsText(locale, "gameOptionsDescription"),
    );
    await expect(settings.getByTestId("settings-fullscreen-description")).toHaveText(
      settingsText(locale, "fullscreenDescription"),
    );
    await expect(
      settings.getByRole("button", { name: settingsText(locale, "fullscreenEnter") }),
    ).toHaveAttribute("aria-describedby", "settings-fullscreen-description");
    for (const [testId, messageKey] of [
      ["settings-language-description", "languageRowDescription"],
      ["settings-news-ticker-description", "newsTickerRowDescription"],
      ["settings-background-audio-description", "backgroundAudioRowDescription"],
      ["settings-sound-effects-description", "soundEffectsRowDescription"],
    ] as const) {
      await expect(gameOptionsPanel.getByTestId(testId)).toHaveText(
        settingsText(locale, messageKey),
      );
    }
    for (const [controlId, descriptionId] of [
      ["settings-language", "settings-language-description"],
      ["settings-news-ticker", "settings-news-ticker-description"],
      ["settings-background-audio", "settings-background-audio-description"],
      ["settings-sound-effects", "settings-sound-effects-description"],
    ] as const) {
      await expect(gameOptionsPanel.locator(`#${controlId}`)).toHaveAttribute(
        "aria-describedby",
        descriptionId,
      );
    }

    await settings.locator("#tab-settings-saves").click();
    const savesPanel = settings.locator("#panel-settings-saves");
    await expect(savesPanel.locator(".pane-intro")).toHaveText(
      settingsText(locale, "savingSectionDescription"),
    );
  }
});

