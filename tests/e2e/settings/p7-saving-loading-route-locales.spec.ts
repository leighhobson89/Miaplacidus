import { expect, test } from "../_harness/fixtures";
import { LOCALE_IDS } from "../../../src/content/ids";
import { THEME_IDS } from "../../../src/content/themes";
import { saveText } from "../../../src/i18n/saveMessages";
import { settingsText } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

const VIEWPORT_WIDTHS = [320, 390, 768, 1280] as const;
const NARROW_WIDTHS = [320, 390] as const;
const SAVE_INTERVAL_OPTIONS = [
  { value: "300", key: "every5Minutes" },
  { value: "900", key: "every15Minutes" },
  { value: "1800", key: "every30Minutes" },
  { value: "3600", key: "everyHour" },
] as const;

test("Saving and Loading controls stay localized and contained across locales, themes, and widths @phase8-v59 @settings @locale @presentation", async ({
  freshGame,
}) => {
  test.setTimeout(300_000);

  const settings = freshGame.getByTestId("settings-pane");
  const savingPanel = settings.getByTestId("settings-saves-panel");
  const enlargedTextStyle = await freshGame.addStyleTag({
    content: "html.p7-v59-enlarged-text { font-size: 125% !important; }",
  });

  const assertPanelAt = async (
    locale: (typeof LOCALE_IDS)[number],
    theme: (typeof THEME_IDS)[number],
    width: number,
    textScale: "normal" | "125%",
  ) => {
    await freshGame.setViewportSize({ width, height: 844 });

    const snapshot = await savingPanel.evaluate((panel) => {
      const root = panel as HTMLElement;
      const panelBounds = root.getBoundingClientRect();
      const visible = (element: HTMLElement) => {
        const style = getComputedStyle(element);
        return (
          !element.closest("[hidden]") &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          element.getClientRects().length > 0
        );
      };
      const visibleChildren = Array.from(root.querySelectorAll<HTMLElement>("*"))
        .filter(visible)
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            element,
            left: bounds.left,
            right: bounds.right,
          };
        });
      const labelText = (selector: string) =>
        root.querySelector<HTMLElement>(selector)?.textContent?.trim() ?? null;
      const frequency = root.querySelector<HTMLSelectElement>("#settings-save-frequency");
      const saveNow = root.querySelector<HTMLButtonElement>('[data-testid="save-now"]');
      const autosave = root.querySelector<HTMLInputElement>("#settings-autosave");
      const themeFrame = document.querySelector<HTMLElement>(
        ".game-frame:not(.notification-portal)",
      );
      const outsidePanel = visibleChildren
        .filter(({ left, right }) => left < panelBounds.left - 1 || right > panelBounds.right + 1)
        .map(({ element }) =>
          element.id ||
          element.getAttribute("data-testid") ||
          element.className ||
          element.tagName,
        );
      const clippedControls = visibleChildren
        .filter(({ element }) => element.matches("button, input, select, textarea"))
        .filter(({ element }) => element.scrollWidth > element.clientWidth + 2)
        .map(({ element }) =>
          element.id ||
          element.getAttribute("data-testid") ||
          element.className ||
          element.tagName,
        );

      return {
        locale: document.documentElement.lang,
        theme: themeFrame?.getAttribute("data-theme") ?? null,
        routeLabel: document.querySelector("#tab-settings-saves")?.textContent?.trim() ?? null,
        panelVisible: !root.hidden && root.getClientRects().length > 0,
        heading: root.querySelector("h3")?.textContent?.trim() ?? null,
        description: labelText(".pane-intro"),
        autosaveLabel: labelText('label[for="settings-autosave"]'),
        autosaveType: autosave?.type ?? null,
        frequencyLabel:
          root.querySelector('label[for="settings-save-frequency"] span')?.textContent?.trim() ??
          null,
        frequencyOptions: frequency
          ? Array.from(frequency.options).map((option) => ({
              value: option.value,
              text: option.textContent?.trim() ?? "",
            }))
          : null,
        saveNowLabel: saveNow?.textContent?.trim() ?? null,
        saveNowDisabled: saveNow?.disabled ?? true,
        geometry: {
          windowWidth: window.innerWidth,
          documentWidth: Math.max(
            document.documentElement.scrollWidth,
            document.body.scrollWidth,
          ),
          availableWidth: document.documentElement.clientWidth,
          panelLeft: panelBounds.left,
          panelRight: panelBounds.right,
          panelWidth: panelBounds.width,
          outsidePanel,
          clippedControls,
        },
      };
    });

    const context = `${locale}/${theme}/${width}px/${textScale} text`;
    expect(
      {
        locale: snapshot.locale,
        theme: snapshot.theme,
        routeLabel: snapshot.routeLabel,
        panelVisible: snapshot.panelVisible,
        heading: snapshot.heading,
        description: snapshot.description,
        autosaveLabel: snapshot.autosaveLabel,
        autosaveType: snapshot.autosaveType,
        frequencyLabel: snapshot.frequencyLabel,
        frequencyOptions: snapshot.frequencyOptions,
        saveNowLabel: snapshot.saveNowLabel,
        saveNowDisabled: snapshot.saveNowDisabled,
      },
      `localized Saving & Loading content at ${context}`,
    ).toEqual({
      locale,
      theme,
      routeLabel: settingsText(locale, "savingSection"),
      panelVisible: true,
      heading: settingsText(locale, "savingSection"),
      description: settingsText(locale, "savingSectionDescription"),
      autosaveLabel: saveText(locale, "autoSave"),
      autosaveType: "checkbox",
      frequencyLabel: saveText(locale, "saveFrequency"),
      frequencyOptions: SAVE_INTERVAL_OPTIONS.map(({ value, key }) => ({
        value,
        text: saveText(locale, key),
      })),
      saveNowLabel: saveText(locale, "saveNow"),
      saveNowDisabled: false,
    });

    expect(snapshot.geometry.windowWidth, `${context} viewport width`).toBe(width);
    expect(snapshot.geometry.panelWidth, `${context} panel width`).toBeGreaterThan(0);
    expect(snapshot.geometry.panelLeft, `${context} panel left edge`).toBeGreaterThanOrEqual(-1);
    expect(snapshot.geometry.panelRight, `${context} panel right edge`).toBeLessThanOrEqual(
      snapshot.geometry.windowWidth + 1,
    );
    expect(snapshot.geometry.documentWidth, `${context} document width`).toBeLessThanOrEqual(
      snapshot.geometry.availableWidth,
    );
    expect(snapshot.geometry.outsidePanel, `${context} content outside the panel`).toEqual([]);
    expect(snapshot.geometry.clippedControls, `${context} clipped controls`).toEqual([]);
  };

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
    await freshGame.locator("#tab-settings").click();

    for (const theme of THEME_IDS) {
      await settings.locator("#tab-settings-visual").click();
      await settings.locator("#settings-theme").selectOption(theme);
      await settings.locator("#tab-settings-saves").click();

      for (const width of VIEWPORT_WIDTHS) {
        await assertPanelAt(locale, theme, width, "normal");
      }

      await freshGame.locator("html").evaluate((element) =>
        element.classList.add("p7-v59-enlarged-text"),
      );
      for (const width of NARROW_WIDTHS) {
        await assertPanelAt(locale, theme, width, "125%");
      }
      await freshGame.locator("html").evaluate((element) =>
        element.classList.remove("p7-v59-enlarged-text"),
      );
    }
  }

  await enlargedTextStyle.evaluate((style) => style.remove());
});
