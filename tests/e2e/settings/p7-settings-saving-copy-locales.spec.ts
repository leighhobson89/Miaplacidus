import { expect, test } from "../_harness/fixtures";
import { startMetaFixture } from "../_harness/meta-fixture";
import { LOCALE_IDS } from "../../../src/content/ids";
import { saveText } from "../../../src/i18n/saveMessages";
import { settingsText } from "../../../src/i18n/settingsMessages";
import { setGameLocale } from "../_harness/settings-controls";

test("Saving and Loading actions and autosave notice follow the selected locale @phase7-locale @settings @save-manager @locale", async ({
  freshGame,
}) => {
  await freshGame.clock.install();
  await startMetaFixture(freshGame, "meta-rebirth-ready");

  for (const locale of LOCALE_IDS) {
    await setGameLocale(freshGame, locale);
    await expect(freshGame.locator("html")).toHaveAttribute("lang", locale);
    await freshGame.locator("#tab-settings").click();
    await freshGame.locator("#tab-settings-saves").click();

    const panel = freshGame.getByTestId("settings-saves-panel");
    await expect(panel.locator(".pane-intro")).toHaveText(
      settingsText(locale, "savingSectionDescription"),
    );
    const autoSave = panel.locator("#settings-autosave");
    if (!(await autoSave.isChecked())) await autoSave.check();
    await autoSave.uncheck();
    const autoSaveNotice = freshGame
      .locator('[data-testid="game-notification"][data-classification="loadSave"]')
      .filter({ hasText: saveText(locale, "autoSaveDisabledWarning") });
    await expect(autoSaveNotice).toHaveText(saveText(locale, "autoSaveDisabledWarning"));
    await freshGame.clock.fastForward(5_300);
    await autoSave.check();

    const manager = panel.getByTestId("save-manager-inline");
    await expect(
      manager.getByRole("heading", { name: saveText(locale, "export"), exact: true }),
    ).toBeVisible();
    const exportField = manager.locator("textarea[readonly]");
    await expect(exportField).toHaveAccessibleName(saveText(locale, "export"));
    await expect(exportField).toHaveValue(/^MIA1:/u);
    expect(await exportField.getAttribute("placeholder")).toBeNull();
    await expect(
      manager.getByRole("button", { name: saveText(locale, "copy"), exact: true }),
    ).toBeVisible();
    await expect(
      manager.getByRole("button", { name: saveText(locale, "download"), exact: true }),
    ).toBeVisible();

    await expect(
      manager.getByRole("heading", { name: saveText(locale, "import"), exact: true }),
    ).toBeVisible();
    const importField = manager.locator("#import-code");
    await expect(importField).toHaveAccessibleName(saveText(locale, "importText"));
    expect(await importField.getAttribute("placeholder")).toBeNull();
    await expect(manager.locator(".file-button")).toHaveText(saveText(locale, "file"));
    await expect(
      manager.getByRole("button", { name: saveText(locale, "paste"), exact: true }),
    ).toBeVisible();
    await expect(
      manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }),
    ).toBeVisible();
  }
});
