import { LOCALE_IDS, type LocaleId } from "../../../src/content/ids";
import { saveText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager, saveNowFromSettings } from "../_harness/save-controls";

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
    await expect(page.locator(".save-error-banner")).toContainText(saveText(locale, "errQuota"));
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
    await expect(manager.getByRole("alert")).toHaveText(saveText(locale, "errEmpty"));

    await manager.locator("#import-code").fill("not-a-miaplacidus-save");
    await manager.getByRole("button", { name: saveText(locale, "preview") }).click();
    await expect(manager.getByRole("alert")).toHaveText(saveText(locale, "errFormat"));

    await manager.locator("#import-code").fill(portableCode);
    await manager.getByRole("button", { name: saveText(locale, "preview") }).click();
    await expect(manager.getByRole("alert")).toHaveText(saveText(locale, "conflict"));
  }
});
