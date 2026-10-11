import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_NAMES } from "../../src/content/achievementNames.generated";
import { ACHIEVEMENT_IDS } from "../../src/content/achievements";
import { LOCALE_IDS } from "../../src/content/ids";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<(typeof LOCALE_IDS)[number], Record<string, string>>;

describe("achievement names", () => {
  it("matches every source achievement name in all six locales", () => {
    expect(Object.keys(ACHIEVEMENT_NAMES).sort()).toEqual([...ACHIEVEMENT_IDS].sort());

    for (const id of ACHIEVEMENT_IDS) {
      const sourceKey = `achievement${id.charAt(0).toUpperCase()}${id.slice(1)}`;
      for (const locale of LOCALE_IDS) {
        const sourceName = sourceLocales[locale][sourceKey];
        expect(
          sourceName,
          `${locale}.${sourceKey} exists in Cosmic Forge localization`,
        ).toBeDefined();
        expect(ACHIEVEMENT_NAMES[id][locale], `${id}.${locale}`).toBe(sourceName);
      }
    }
  });
});
