import { createRequire } from "node:module";
import { LOCALE_IDS } from "../../../src/content/ids";
import { saveText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager, saveNowFromSettings } from "../_harness/save-controls";

const { compressToEncodedURIComponent } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

function portableJson(value: unknown): string {
  return `MIA1:${compressToEncodedURIComponent(JSON.stringify(value))}`;
}

test("import errors and success copy stay localized across six locales @p46-import-errors-locale", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/?testSeed=20261009&testLocale=en");
  await page.locator("#pioneer-name").fill("Import Errors Locale Pioneer");
  await page.getByTestId("start-game").click();
  await expect(page.locator("[data-app-ready]")).toBeVisible();
  await saveNowFromSettings(page);
  await openSaveManager(page);

  const manager = page.getByTestId("save-manager-inline");
  const portableCode = await manager.locator("textarea[readonly]").inputValue();
  const oversizedFile = Buffer.alloc(900_006, 65);

  await page.evaluate(() => {
    Object.defineProperty(File.prototype, "text", {
      configurable: true,
      value: () => Promise.reject(new Error("Synthetic file read failure")),
    });
  });

  for (const locale of LOCALE_IDS) {
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          readText: () =>
            Promise.reject(new DOMException("Clipboard unavailable", "NotAllowedError")),
          writeText: () =>
            Promise.reject(new DOMException("Clipboard unavailable", "NotAllowedError")),
        },
      });
    });
    await page.locator("#tab-settings").click();
    await page.locator("#tab-settings-game-options").click();
    await page.locator("#settings-language").selectOption(locale);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await page.locator("#tab-settings-saves").click();
    await page.getByTestId("save-now").click();
    await expect(page.getByTestId("save-status")).toHaveText(saveText(locale, "saved"));

    await manager.locator("#import-code").fill("MIA1:garbage");
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "errCode"),
    );

    await manager.locator("#import-code").fill(`MIA1:${compressToEncodedURIComponent("not-json")}`);
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "errCode"),
    );

    await manager.locator("#import-code").fill(portableJson({}));
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "errIntegrity"),
    );

    await manager.locator("#import-code").fill(portableJson({ schemaVersion: 48 }));
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "errFuture"),
    );

    await manager.locator("input[type='file']").setInputFiles({
      name: "oversized-save.txt",
      mimeType: "text/plain",
      buffer: oversizedFile,
    });
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "errTooLarge"),
    );

    await manager.locator("input[type='file']").setInputFiles({
      name: "unreadable-save.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("MIA1:test"),
    });
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "errGeneric"),
    );

    await manager.getByRole("button", { name: saveText(locale, "paste"), exact: true }).click();
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "clipboardReadError"),
    );

    await manager.getByRole("button", { name: saveText(locale, "copy"), exact: true }).click();
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "clipboardCopyError"),
    );

    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.resolve() },
      });
    });
    await manager.getByRole("button", { name: saveText(locale, "copy"), exact: true }).click();
    await expect(manager.locator(".save-notice")).toHaveText(saveText(locale, "clipboardCopied"));

    await manager.locator("#import-code").fill(portableCode);
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expect(manager.locator(".import-conflict [role='alert']")).toHaveText(
      saveText(locale, "conflict"),
    );
    await manager.locator("#import-new-name").fill("   ");
    await manager.getByRole("button", { name: saveText(locale, "importNew"), exact: true }).click();
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "errName"),
    );
    await manager.locator("#import-new-name").fill("Import Errors Locale Pioneer");
    await manager.getByRole("button", { name: saveText(locale, "importNew"), exact: true }).click();
    await expect(manager.locator(".save-error[role='alert']")).toHaveText(
      saveText(locale, "errDuplicate"),
    );

    await manager.locator("#import-code").fill(portableCode);
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await manager.locator("#import-new-name").fill(`Imported Copy ${locale}`);
    await manager.getByRole("button", { name: saveText(locale, "importNew"), exact: true }).click();
    await expect(manager.locator(".save-notice")).toHaveText(saveText(locale, "importedAsNew"));
  }
});
