import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_IDS } from "../../src/content/achievements";
import {
  ACHIEVEMENT_DESCRIPTION_SOURCE_KEYS,
  ACHIEVEMENT_DESCRIPTIONS,
} from "../../src/content/achievementDescriptions.generated";
import { LOCALE_IDS } from "../../src/content/ids";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<(typeof LOCALE_IDS)[number], Record<string, string>>;

describe("achievement tooltip descriptions", () => {
  it("maps every source achievement description exactly in all six locales", () => {
    expect(Object.keys(ACHIEVEMENT_DESCRIPTION_SOURCE_KEYS).sort()).toEqual(
      [...ACHIEVEMENT_IDS].sort(),
    );
    expect(Object.keys(ACHIEVEMENT_DESCRIPTIONS).sort()).toEqual([...ACHIEVEMENT_IDS].sort());

    for (const id of ACHIEVEMENT_IDS) {
      const sourceKey = ACHIEVEMENT_DESCRIPTION_SOURCE_KEYS[id];
      for (const locale of LOCALE_IDS) {
        expect(ACHIEVEMENT_DESCRIPTIONS[id][locale]).toBe(sourceLocales[locale][sourceKey]);
      }
    }
  });
});
