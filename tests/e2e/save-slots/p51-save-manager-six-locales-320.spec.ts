import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { saveText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";

async function clearNotificationQueue(page: import("@playwright/test").Page): Promise<void> {
  const settings = page.getByTestId("settings-pane");
  await settings.locator("#tab-settings-visual").click();
  const toggle = settings.locator("#settings-notifications");
  await toggle.uncheck();
  await expect(page.getByTestId("game-notification")).toHaveCount(0);
  await toggle.check();
  await settings.locator("#tab-settings-saves").click();
}

test("Save and Loading fits 320px in all six locales @save-slots @p46-mobile-copy @p51-save-manager-six-locales-320", async ({
  freshGame,
}, testInfo) => {
  await freshGame.setViewportSize({ width: 320, height: 740 });
  await freshGame.locator("#tab-settings").click();
  const settings = freshGame.getByTestId("settings-pane");
  await settings.locator("#tab-settings-game-options").click();

  let currentLocale: LocaleId = "en";
  for (const locale of LOCALE_IDS) {
    await settings.locator("#tab-settings-game-options").click();
    await settings.locator("#settings-language").selectOption(locale);
    currentLocale = locale;
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);

    await settings.locator("#tab-settings-saves").click();
    const savePanel = settings.getByTestId("settings-saves-panel");
    await expect(savePanel).toBeVisible();
    await expect(savePanel.getByRole("heading", { level: 3 }).first()).toHaveText(/\S/u);

    const manager = savePanel.getByTestId("save-manager-inline");
    await expect(manager).toBeVisible();
    await expect(manager.getByRole("heading", { level: 3 }).first()).toHaveText(/\S/u);

    await freshGame.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      window.scrollTo(0, 0);
    });
    await freshGame.mouse.move(0, 0);
    const screenshot = await freshGame.screenshot({ fullPage: true, animations: "disabled" });
    await testInfo.attach(`p51-save-manager-${locale}-320.png`, {
      body: screenshot,
      contentType: "image/png",
    });

    const layout = await freshGame.evaluate(() => {
      const savePanelElement = document.querySelector<HTMLElement>(
        '[data-testid="settings-saves-panel"]',
      );
      const managerElement = document.querySelector<HTMLElement>(
        '[data-testid="save-manager-inline"]',
      );
      if (!savePanelElement || !managerElement) {
        throw new Error("The Save & Loading panel or inline Save Manager is missing.");
      }
      const rect = (element: Element) => {
        const bounds = element.getBoundingClientRect();
        return {
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          bottom: bounds.bottom,
          clientWidth: (element as HTMLElement).clientWidth,
          scrollWidth: (element as HTMLElement).scrollWidth,
        };
      };
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        documentClientWidth: document.documentElement.clientWidth,
        panel: rect(savePanelElement),
        manager: rect(managerElement),
        controls: Array.from(savePanelElement.querySelectorAll("button, input, textarea, select"))
          .filter((control) => control.getClientRects().length > 0)
          .map((control) => ({
            name:
              control.getAttribute("aria-label") ??
              control.getAttribute("id") ??
              control.textContent?.trim() ??
              control.tagName,
            tagName: control.tagName,
            ...rect(control),
          })),
      };
    });

    expect(layout.viewport, `${locale} viewport`).toEqual({ width: 320, height: 740 });
    expect(layout.documentWidth, `${locale} document width`).toBeLessThanOrEqual(
      layout.viewport.width,
    );
    expect(layout.documentClientWidth, `${locale} document client width`).toBeLessThanOrEqual(
      layout.viewport.width,
    );
    for (const [name, container] of [
      ["panel", layout.panel],
      ["manager", layout.manager],
    ] as const) {
      expect(container.left, `${locale} ${name} left`).toBeGreaterThanOrEqual(0);
      expect(container.right, `${locale} ${name} right`).toBeLessThanOrEqual(layout.viewport.width);
      expect(container.top, `${locale} ${name} top`).toBeGreaterThanOrEqual(0);
      expect(container.bottom, `${locale} ${name} bottom`).toBeLessThanOrEqual(
        layout.documentHeight,
      );
      expect(container.scrollWidth, `${locale} ${name} content width`).toBeLessThanOrEqual(
        container.clientWidth + 1,
      );
    }
    expect(layout.controls.length, `${locale} visible controls`).toBeGreaterThan(0);
    for (const control of layout.controls) {
      expect(control.left, `${locale} ${control.name} left edge`).toBeGreaterThanOrEqual(
        layout.panel.left,
      );
      expect(control.right, `${locale} ${control.name} panel edge`).toBeLessThanOrEqual(
        layout.panel.right,
      );
      expect(control.right, `${locale} ${control.name} viewport edge`).toBeLessThanOrEqual(
        layout.viewport.width,
      );
      expect(control.top, `${locale} ${control.name} top edge`).toBeGreaterThanOrEqual(
        layout.panel.top,
      );
      expect(control.bottom, `${locale} ${control.name} bottom edge`).toBeLessThanOrEqual(
        layout.panel.bottom,
      );
      if (control.tagName !== "TEXTAREA") {
        expect(control.scrollWidth, `${locale} ${control.name} content width`).toBeLessThanOrEqual(
          control.clientWidth + 1,
        );
      }
    }

    await manager.locator("#import-code").fill("not-a-miaplacidus-save");
    await manager.locator(".import-card .save-actions button").last().click();
    const error = freshGame
      .getByTestId("game-notification")
      .filter({ hasText: saveText(locale, "errInvalidSaveString") });
    await expect(error).toBeVisible();
    const errorBounds = await error.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const node = element as HTMLElement;
      return {
        left: bounds.left,
        right: bounds.right,
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
        clientHeight: node.clientHeight,
        scrollHeight: node.scrollHeight,
        documentWidth: document.documentElement.scrollWidth,
      };
    });
    expect(errorBounds.left, `${locale} import error left`).toBeGreaterThanOrEqual(0);
    expect(errorBounds.right, `${locale} import error right`).toBeLessThanOrEqual(320);
    expect(errorBounds.scrollWidth, `${locale} import error inline content`).toBeLessThanOrEqual(
      errorBounds.clientWidth + 1,
    );
    expect(errorBounds.scrollHeight, `${locale} import error vertical content`).toBeLessThanOrEqual(
      errorBounds.clientHeight + 1,
    );
    expect(errorBounds.documentWidth, `${locale} error page width`).toBeLessThanOrEqual(320);
    await clearNotificationQueue(freshGame);
  }
});
