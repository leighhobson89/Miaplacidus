import { expect, test } from "../_harness/fixtures";
import { settingsPaneItems } from "../../../src/app/presentationNavigation";
import { LOCALE_IDS } from "../../../src/content/ids";
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
    await expect(settings.getByRole("heading", { level: 2 })).toHaveText(/\S/u);

    const navigation = settings.getByRole("navigation");
    await expect(navigation).toHaveAttribute("aria-label", /\S/u);
    const tablist = navigation.getByRole("tablist");
    await expect(tablist).toHaveAttribute("aria-label", /\S/u);
    const sectionItems = settingsPaneItems(locale);
    await expect(tablist.getByRole("tab")).toHaveCount(sectionItems.length);

    for (const item of sectionItems) {
      const tab = tablist.locator(`#tab-${item.id}`);
      await expect(tab).toHaveText(/\S/u);
      const panelId = `panel-${item.id}`;
      await expect(tab).toHaveAttribute("aria-controls", panelId);

      await tab.click();
      await expect(tab).toHaveAttribute("aria-selected", "true");
      await expect(tab).toHaveAttribute("tabindex", "0");
      const panel = settings.locator(`#${panelId}`);
      await expect(panel).toBeVisible();
      await expect(panel).toHaveAttribute("role", "tabpanel");
      await expect(panel).toHaveAttribute("aria-labelledby", `tab-${item.id}`);
      await expect(panel.getByRole("heading").first()).toHaveText(/\S/u);
    }

    const visualItem = sectionItems.find((item) => item.id === "settings-visual");
    const gameOptionsItem = sectionItems.find((item) => item.id === "settings-game-options");
    expect(visualItem).toBeDefined();
    expect(gameOptionsItem).toBeDefined();
    const visualTab = tablist.locator(`#tab-${visualItem!.id}`);
    const gameOptionsTab = tablist.locator(`#tab-${gameOptionsItem!.id}`);
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
    await expect(visualPanel.locator(".pane-intro")).toHaveText(/\S/u);
    await expect(settings.getByTestId("settings-currency-description")).toHaveText(/\S/u);
    await expect(settings.locator("#settings-currency")).toHaveAttribute(
      "aria-describedby",
      "settings-currency-description",
    );
    for (const testId of [
      "settings-theme-description",
      "settings-notation-description",
      "settings-notifications-description",
    ]) {
      await expect(visualPanel.getByTestId(testId)).toHaveText(/\S/u);
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
    for (const testId of [
      "settings-theme-help",
      "settings-currency-help",
      "settings-notation-help",
      "settings-notifications-help",
    ]) {
      await expect(freshGame.getByTestId(testId)).toHaveText(/\S/u);
      await expect(settings.getByTestId(`${testId}-trigger`)).toHaveAttribute(
        "aria-describedby",
        `${testId}-tooltip`,
      );
    }

    await settings.locator("#tab-settings-game-options").click();
    const gameOptionsPanel = settings.locator("#panel-settings-game-options");
    await expect(gameOptionsPanel.locator(".pane-intro")).toHaveText(/\S/u);
    await expect(settings.getByTestId("settings-fullscreen-description")).toHaveText(/\S/u);
    await expect(
      settings.locator('button[aria-describedby="settings-fullscreen-description"]'),
    ).toBeVisible();
    for (const testId of [
      "settings-language-description",
      "settings-news-ticker-description",
      "settings-background-audio-description",
      "settings-sound-effects-description",
    ]) {
      await expect(gameOptionsPanel.getByTestId(testId)).toHaveText(/\S/u);
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
    await expect(savesPanel.locator(".pane-intro")).toHaveText(/\S/u);
  }
});

