import { LOCALE_IDS } from "../../../src/content/ids";
import { saveText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager, saveNowFromSettings } from "../_harness/save-controls";

test("Save Manager import failure and recovery follow the selected locale @phase8-p7-save-import-recovery-locale", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.clock.install();
  await page.goto("/?testSeed=20261015&testLocale=en");
  await page.locator("#pioneer-name").fill("Import Recovery Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();

  await saveNowFromSettings(page);
  await page.clock.fastForward(3_300);
  await openSaveManager(page);

  const manager = page.getByTestId("save-manager-inline");
  const portableCode = await manager.locator("textarea[readonly]").inputValue();
  expect(portableCode).toMatch(/^MIA1:/u);

  for (const locale of LOCALE_IDS) {
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-game-options").click();
    await page.locator("#settings-language").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-settings-saves").click();

    const importHeading = saveText(locale, "import");
    const importFieldLabel = saveText(locale, "importText");
    const previewAction = saveText(locale, "preview");
    expect(importHeading.trim(), `${locale} import heading`).not.toBe("");
    expect(importFieldLabel.trim(), `${locale} import field label`).not.toBe("");
    expect(previewAction.trim(), `${locale} preview action`).not.toBe("");
    await expect(
      manager.getByRole("heading", { name: importHeading, exact: true }),
    ).toBeVisible();
    await expect(manager.getByLabel(importFieldLabel, { exact: true })).toBeVisible();

    const invalidMessage = saveText(locale, "errInvalidSaveString");
    expect(invalidMessage.trim(), `${locale} invalid-import copy`).not.toBe("");
    await manager.locator("#import-code").fill("MIA1:garbage");
    await manager
      .getByRole("button", { name: previewAction, exact: true })
      .click();
    await expect(
      page.locator('[data-testid="game-notification"].notification-error'),
    ).toHaveText(invalidMessage);
    await page.clock.fastForward(3_300);

    await manager.locator("#import-code").fill(portableCode);
    await manager
      .getByRole("button", { name: previewAction, exact: true })
      .click();
    await expect(manager.getByTestId("import-preview")).toBeVisible();
    await expect(manager.locator(".import-conflict [role='alert']")).toHaveText(
      saveText(locale, "conflict"),
    );
    await manager.getByLabel(saveText(locale, "exportFirst"), { exact: true }).check();
    await manager
      .getByRole("button", { name: saveText(locale, "replace"), exact: true })
      .click();

    const recoveredMessage = saveText(locale, "loaded");
    expect(recoveredMessage.trim(), `${locale} successful-import copy`).not.toBe("");
    await expect(
      page.locator('[data-testid="game-notification"].notification-success'),
    ).toHaveText(recoveredMessage);
    await expect(manager.getByTestId("import-preview")).toHaveCount(0);
    await page.clock.fastForward(3_300);
  }
});
