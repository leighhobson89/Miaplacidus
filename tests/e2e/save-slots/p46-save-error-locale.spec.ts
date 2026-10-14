import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import type { Page } from "@playwright/test";
import { saveText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager, saveNowFromSettings } from "../_harness/save-controls";

async function clearNotificationQueue(page: Page): Promise<void> {
  await page.locator("#tab-settings-visual").click();
  const toggle = page.locator("#settings-notifications");
  await toggle.uncheck();
  await expect(page.getByTestId("game-notification")).toHaveCount(0);
  await toggle.check();
  await page.locator("#tab-settings-saves").click();
}

test("save quota errors stay localized when the active locale changes @p46-save-error-locale", async ({
  page,
}) => {
  await page.goto("/?testSeed=20261009&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Quota Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.dispatch === "function"))
    .toBe(true);

  await saveNowFromSettings(page);
  await page.evaluate(() => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith("miaplacidus:v1:slot:") || key.startsWith("miaplacidus:v1:head:")) {
        throw new DOMException("Storage quota exceeded", "QuotaExceededError");
      }
      nativeSetItem.call(this, key, value);
    };
  });

  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale: LocaleId) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await saveNowFromSettings(page);
    await expect(page.locator(".save-error-banner")).toHaveText(/\S/u);
  }
});

test("save import validation and conflict copy stay localized across six locales @p46-save-import-locale", async ({
  page,
}) => {
  await page.goto("/?testSeed=20261009&testLocale=en");
  await page.getByLabel("Pioneer name").fill("Import Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => typeof window.miaplacidusTest?.dispatch === "function"))
    .toBe(true);
  await saveNowFromSettings(page);
  await openSaveManager(page);

  const manager = page.getByTestId("save-manager-inline");
  const portableCode = await manager.locator("textarea[readonly]").inputValue();
  for (const locale of LOCALE_IDS) {
    await page.evaluate((nextLocale: LocaleId) => {
      window.miaplacidusTest!.dispatch({
        type: "settings.update",
        patch: { locale: nextLocale },
      });
    }, locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    await manager.locator("#import-code").fill("");
    await manager.getByRole("button", { name: saveText(locale, "preview") }).click();
    const invalidStringNotice = page
      .getByTestId("game-notification")
      .filter({ hasText: saveText(locale, "errInvalidSaveString") });
    await expect(invalidStringNotice).toBeVisible();
    await clearNotificationQueue(page);

    await manager.locator("#import-code").fill("not-a-miaplacidus-save");
    await manager.getByRole("button", { name: saveText(locale, "preview") }).click();
    await expect(invalidStringNotice).toBeVisible();
    await clearNotificationQueue(page);

    await manager.locator("#import-code").fill(portableCode);
    await manager.getByRole("button", { name: saveText(locale, "preview") }).click();
    await expect(manager.getByRole("alert")).toHaveText(saveText(locale, "conflict"));
  }
});
