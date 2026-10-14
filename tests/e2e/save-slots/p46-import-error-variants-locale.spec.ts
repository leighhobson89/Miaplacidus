import { createRequire } from "node:module";
import type { Page } from "@playwright/test";
import { LOCALE_IDS } from "../../../src/content/ids";
import { saveErrorText, saveText } from "../../../src/i18n/saveMessages";
import { expect, test } from "../_harness/fixtures";
import { openSaveManager, saveNowFromSettings } from "../_harness/save-controls";

const { compressToEncodedURIComponent } = createRequire(import.meta.url)(
  "lz-string",
) as typeof import("lz-string");

function portableJson(value: unknown): string {
  return `MIA1:${compressToEncodedURIComponent(JSON.stringify(value))}`;
}

async function expectSaveNotification(
  page: Page,
  type: "error" | "success",
  message: string,
): Promise<void> {
  await expect(
    page
      .locator(`[data-testid="game-notification"].notification-${type}`)
      .filter({ hasText: message }),
  ).toHaveText(message);
  await expect(
    page.locator(".save-manager-inline .save-error, .save-manager-inline .save-notice"),
  ).toHaveCount(0);
  await page.clock.runFor(3_300);
}

test("import errors and success copy stay localized across six locales @p46-import-errors-locale", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.clock.install();
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
    await expect(page.getByTestId("save-status")).toHaveText(/\S/u);

    await manager.locator("#import-code").fill("MIA1:garbage");
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expectSaveNotification(page, "error", saveText(locale, "errInvalidSaveString"));

    await manager.locator("#import-code").fill(`MIA1:${compressToEncodedURIComponent("not-json")}`);
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expectSaveNotification(page, "error", saveText(locale, "errInvalidSaveString"));

    await manager.locator("#import-code").fill(portableJson({}));
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expectSaveNotification(page, "error", saveErrorText(locale, "invalid-envelope"));

    await manager.locator("#import-code").fill(portableJson({ schemaVersion: 56 }));
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expectSaveNotification(page, "error", saveErrorText(locale, "future-version"));

    await manager.locator("input[type='file']").setInputFiles({
      name: "oversized-save.txt",
      mimeType: "text/plain",
      buffer: oversizedFile,
    });
    await expectSaveNotification(page, "error", saveErrorText(locale, "too-large"));

    await manager.locator("input[type='file']").setInputFiles({
      name: "unreadable-save.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("MIA1:test"),
    });
    await expectSaveNotification(page, "error", saveErrorText(locale, "unknown"));

    await manager.getByRole("button", { name: saveText(locale, "paste"), exact: true }).click();
    await expectSaveNotification(page, "error", saveText(locale, "clipboardReadError"));

    await manager.getByRole("button", { name: saveText(locale, "copy"), exact: true }).click();
    await expectSaveNotification(page, "error", saveText(locale, "clipboardCopyError"));

    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.resolve() },
      });
    });
    await manager.getByRole("button", { name: saveText(locale, "copy"), exact: true }).click();
    await expectSaveNotification(page, "success", saveText(locale, "clipboardCopied"));

    await manager.locator("#import-code").fill(portableCode);
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await expect(manager.locator(".import-conflict [role='alert']")).toHaveText(
      saveText(locale, "conflict"),
    );
    await manager.locator("#import-new-name").fill("   ");
    await manager.getByRole("button", { name: saveText(locale, "importNew"), exact: true }).click();
    await expectSaveNotification(page, "error", saveErrorText(locale, "invalid-name"));
    await manager.locator("#import-new-name").fill("Import Errors Locale Pioneer");
    await manager.getByRole("button", { name: saveText(locale, "importNew"), exact: true }).click();
    await expectSaveNotification(page, "error", saveErrorText(locale, "duplicate-name"));

    await manager.locator("#import-code").fill(portableCode);
    await manager.getByRole("button", { name: saveText(locale, "preview"), exact: true }).click();
    await manager.locator("#import-new-name").fill(`Imported Copy ${locale}`);
    await manager.getByRole("button", { name: saveText(locale, "importNew"), exact: true }).click();
    await expectSaveNotification(page, "success", saveText(locale, "importedAsNew"));
  }
});
