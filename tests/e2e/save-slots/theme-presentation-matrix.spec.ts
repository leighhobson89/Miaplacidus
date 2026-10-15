import { expect, test } from "../_harness/fixtures";
import { openSaveManager } from "../_harness/save-controls";
import { startMetaFixture } from "../_harness/meta-fixture";
import { THEME_IDS } from "../../../src/content/themes";
import { saveText } from "../../../src/i18n/saveMessages";

test("invalid save errors stay visible across themes and viewport widths @theme-matrix @save-slots", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await startMetaFixture(page, "meta-megastructure-route");
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const theme of THEME_IDS) {
      await page.locator("#tab-settings").click();
      await page.locator("#tab-settings-visual").click();
      await page.locator("#settings-theme").selectOption(theme);
      await expect(page.locator(".game-frame:not(.notification-portal)")).toHaveAttribute("data-theme", theme);
      await openSaveManager(page);
      const manager = page.getByTestId("save-manager-inline");
      await manager.locator("#import-code").fill("not a MIAPLACIDUS save code");
      await manager.getByRole("button", { name: "Preview import" }).click();
      const errorNotice = page
        .getByTestId("notification-stack")
        .getByTestId("game-notification")
        .filter({ hasText: saveText("en", "errInvalidSaveString") })
        .last();
      await expect(errorNotice).toBeVisible();
      await expect(errorNotice).toHaveText(saveText("en", "errInvalidSaveString"));
      await expect(errorNotice).toHaveAttribute("data-classification", "save");
      await expect(errorNotice).toHaveClass(/notification-error/);
      const errorWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(errorWidth, `${theme} save error at ${viewport.width}px`).toBeLessThanOrEqual(
        viewport.width,
      );
      const validSaveCode = await manager.getByLabel(saveText("en", "export")).inputValue();
      await manager.locator("#import-code").fill(validSaveCode);
      await manager.getByRole("button", { name: "Preview import", exact: true }).click();
      await expect(manager.getByTestId("import-preview")).toBeVisible();
      await manager.getByRole("button", { name: "Cancel import", exact: true }).click();
    }
  }
});
