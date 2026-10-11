import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import {
  RESEARCH_ACTION_HELP_MESSAGES,
  researchActionHelp,
  type ResearchActionHelpId,
} from "../../src/i18n/researchActionHelpMessages";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<LocaleId, Record<string, string>>;

const sourceKeyByAction: Readonly<Record<ResearchActionHelpId, string>> = {
  researchAutoBuyer: "optionDescResearchAutoBuyerContent1",
  scienceKit: "optionDescResearchScienceKitContent1",
  scienceClub: "optionDescResearchScienceClubContent1",
  scienceLab: "optionDescResearchScienceLabContent1",
};

describe("Research action help source parity", () => {
  it("maps all four source descriptions and values in all six locales", () => {
    expect(Object.keys(sourceKeyByAction)).toHaveLength(4);

    for (const locale of LOCALE_IDS) {
      for (const action of Object.keys(sourceKeyByAction) as ResearchActionHelpId[]) {
        const sourceKey = sourceKeyByAction[action];
        expect(researchActionHelp(locale, action)).toBe(sourceLocales[locale][sourceKey]);
        expect(RESEARCH_ACTION_HELP_MESSAGES[locale][action]).toBe(sourceLocales[locale][sourceKey]);
      }
    }
  });
});
