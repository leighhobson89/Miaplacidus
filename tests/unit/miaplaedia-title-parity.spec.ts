import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import { miaplaediaPaneItems } from "../../src/app/presentationNavigation";
import {
  settingsSectionName,
  type SettingsSectionId,
} from "../../src/i18n/settingsMessages";

const SOURCE_OPTION_IDS = [
  "option4",
  "option12",
  "option5",
  "option6",
  "option7",
  "option13",
  "option11",
] as const;

type SourceOptionId = (typeof SOURCE_OPTION_IDS)[number];

const SECTION_BY_SOURCE_OPTION_ID = {
  option4: "getStarted",
  option12: "story",
  option5: "conceptsEarly",
  option6: "conceptsMid",
  option7: "conceptsLate",
  option13: "endGoal",
  option11: "philosophies",
} as const satisfies Record<SourceOptionId, SettingsSectionId>;

const SOURCE_GUIDE_TITLES = {
  en: {
    option4: "Get Started",
    option12: "Story",
    option5: "Concepts - Early",
    option6: "Concepts - Mid",
    option7: "Concepts - Late",
    option13: "Concepts - End Goal",
    option11: "Philosophies",
  },
  es: {
    option4: "Empezar",
    option12: "Historia",
    option5: "Conceptos - Temprano",
    option6: "Conceptos - Medio",
    option7: "Conceptos - Tardío",
    option13: "Conceptos - Objetivo Final",
    option11: "Filosofías",
  },
  pt: {
    option4: "Começar",
    option12: "História",
    option5: "Conceitos - Inicial",
    option6: "Conceitos - Intermédio",
    option7: "Conceitos - Avançado",
    option13: "Conceitos - Objetivo Final",
    option11: "Filosofias",
  },
  de: {
    option4: "Erste Schritte",
    option12: "Geschichte",
    option5: "Konzepte - Früh",
    option6: "Konzepte - Mitte",
    option7: "Konzepte - Spät",
    option13: "Konzepte - Endziel",
    option11: "Philosophien",
  },
  it: {
    option4: "Iniziare",
    option12: "Storia",
    option5: "Concetti - Inizio",
    option6: "Concetti - Metà",
    option7: "Concetti - Tardi",
    option13: "Concetti - Obiettivo Finale",
    option11: "Filosofie",
  },
  fr: {
    option4: "Commencer",
    option12: "Histoire",
    option5: "Concepts - Début",
    option6: "Concepts - Milieu",
    option7: "Concepts - Fin",
    option13: "Concepts - Objectif Final",
    option11: "Philosophies",
  },
} as const satisfies Record<LocaleId, Record<SourceOptionId, string>>;

const guideTitleCases = LOCALE_IDS.flatMap((locale) =>
  SOURCE_OPTION_IDS.map((sourceOptionId) => ({
    locale,
    sourceOptionId,
    section: SECTION_BY_SOURCE_OPTION_ID[sourceOptionId],
    sourceTitle: SOURCE_GUIDE_TITLES[locale][sourceOptionId],
  })),
);

describe("Miaplaedia guide titles", () => {
  it.each(guideTitleCases)(
    "$locale $sourceOptionId option and page title match the source",
    ({ locale, section, sourceOptionId, sourceTitle }) => {
      expect(settingsSectionName(locale, section), `${locale}.${section} page title`).toBe(
        sourceTitle,
      );

      const option = miaplaediaPaneItems(locale).find(
        (item) => item.sourceOptionId === sourceOptionId,
      );
      expect(option?.label, `${locale}.${sourceOptionId} option label`).toBe(sourceTitle);
    },
  );
});
