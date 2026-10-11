import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import { starMapText } from "../../src/i18n/starMapMessages";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<LocaleId, Record<string, string>>;

describe("Star Data weather help source parity", () => {
  it("uses the Star Data weather-column description in every locale", () => {
    for (const locale of LOCALE_IDS) {
      expect(starMapText(locale, "starDataWeatherHelp")).toBe(
        sourceLocales[locale].infoTooltipStarLegendWeather,
      );
    }
  });
});
