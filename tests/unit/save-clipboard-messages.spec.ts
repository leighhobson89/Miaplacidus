import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import { saveText } from "../../src/i18n/saveMessages";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<LocaleId, Record<string, string>>;

describe("save clipboard messages", () => {
  it("matches source success and copy-error messages in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      expect(saveText(locale, "clipboardCopied")).toBe(
        sourceLocales[locale].notificationDataCopiedToClipboard,
      );
      expect(saveText(locale, "clipboardCopyError")).toBe(
        sourceLocales[locale].notificationErrorCopyingData,
      );
    }
  });
});
