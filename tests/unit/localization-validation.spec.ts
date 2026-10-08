import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALE_IDS } from "../../src/content/ids";
import {
  LOCALIZATION_CATALOGUES,
  validateAllLocalizationCatalogues,
  validateLocalizationCatalogue,
  type LocalizationCatalogue,
} from "../../src/i18n/localizationValidation";

const PARTIAL_CATALOGUES_WITH_FALLBACK = [
  "starMap.effective:english",
  "starship.messages:english",
  "technologyNotifications.notices:localized",
];

describe("six-locale localization validation", () => {
  it("checks all registered catalogues for key shape, placeholders, plain text, and untranslated values", () => {
    const issues = validateAllLocalizationCatalogues();
    expect(issues, issues.map((issue) => `${issue.catalogue}:${issue.locale}:${issue.path} ${issue.code}`).join("\n")).toEqual([]);
  });

  it("requires an explicit fallback policy for every intentionally partial catalogue", () => {
    expect(
      LOCALIZATION_CATALOGUES.filter((catalogue) => catalogue.fallback)
        .map((catalogue) => `${catalogue.id}:${catalogue.fallback}`)
        .sort(),
    ).toEqual([...PARTIAL_CATALOGUES_WITH_FALLBACK].sort());
  });

  it("detects missing locales, keys, placeholder mismatches, markup, and English copy in fixtures", () => {
    const values = Object.fromEntries(
      LOCALE_IDS.map((locale) => [locale, { action: "Open {system} with care" }]),
    ) as Record<(typeof LOCALE_IDS)[number], unknown>;
    values.es = { action: "Abrir {planet}<img src=x>" };
    const issues = validateLocalizationCatalogue({ id: "fixture", values });
    expect(issues.map(({ code }) => code).sort()).toEqual([
      "placeholder-parity",
      "unsafe-markup",
      "untranslated-candidate",
      "untranslated-candidate",
      "untranslated-candidate",
      "untranslated-candidate",
    ].sort());

    const missing = validateLocalizationCatalogue({
      id: "missing-key-fixture",
      values: { ...values, fr: {} },
    } as LocalizationCatalogue);
    expect(missing).toContainEqual(
      expect.objectContaining({ locale: "fr", code: "message-keys", path: "action" }),
    );
  });

  it("keeps runtime fallback sites explicit and reviewable", () => {
    const sourceRoot = resolve(process.cwd(), "src/i18n");
    const files = readdirSync(sourceRoot).filter((file) => file.endsWith(".ts"));
    const englishFallbackFiles = files.filter((file) =>
      /\?\?\s*en\[/.test(readFileSync(resolve(sourceRoot, file), "utf8")),
    );
    const localizedFallbackFiles = files.filter((file) =>
      /\?\?\s*fallback\[locale\]/.test(readFileSync(resolve(sourceRoot, file), "utf8")),
    );
    expect(englishFallbackFiles.sort()).toEqual(["starMapMessages.ts", "starshipMessages.ts"]);
    expect(localizedFallbackFiles).toEqual(["technologyNotificationMessages.ts"]);
  });
});
