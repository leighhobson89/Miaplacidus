import { describe, expect, it } from "vitest";
import { LOCALE_IDS } from "../../src/content/ids";
import { sourceNewsCopy } from "../../src/i18n/sourceNewsCopy";

describe("source News Ticker copy", () => {
  it("keeps all localized copy readable instead of mojibake", () => {
    const encodingArtifacts = /Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â[€‚œ]|Å“|ÄŒ/u;

    for (const locale of LOCALE_IDS) {
      const copy = sourceNewsCopy(locale);
      const strings = Object.values(copy).flatMap((value) =>
        typeof value === "string" ? [value] : value,
      );

      for (const text of strings) expect(text).not.toMatch(encodingArtifacts);
    }

    expect(sourceNewsCopy("es").headlines[0]).toContain("Hidrógeno");
    expect(sourceNewsCopy("pt").headlines[0]).toContain("Hidrogênio");
    expect(sourceNewsCopy("fr").headlines[0]).toContain("Hydrogène");
  });
});
