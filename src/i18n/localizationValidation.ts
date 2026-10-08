import { ACHIEVEMENT_NAMES } from "../content/achievementNames.generated";
import { ECONOMY_BUILDING_NAMES } from "../content/economyBuildingNames";
import { LOCALE_IDS, type LocaleId } from "../content/ids";
import { TECHNOLOGY_DESCRIPTIONS } from "../content/technologyDescriptions";
import { TECHNOLOGY_NAMES } from "../content/technologyNames";
import { LOCALIZATION_VALIDATION_DATA as achievement } from "./achievementMessages";
import { LOCALIZATION_VALIDATION_DATA as achievementReward } from "./achievementRewardMessages";
import { LOCALIZATION_VALIDATION_DATA as blackHole } from "./blackHoleMessages";
import { LOCALIZATION_VALIDATION_DATA as casino } from "./casinoMessages";
import { cosmicopediaSourceMessages } from "./cosmicopediaMessages";
import { LOCALIZATION_VALIDATION_DATA as cosmicRip } from "./cosmicRipMessages";
import { LOCALIZATION_VALIDATION_DATA as debugScenario } from "./debugScenarioMessages";
import { LOCALIZATION_VALIDATION_DATA as economy } from "./economyMessages";
import { LOCALIZATION_VALIDATION_DATA as energyStatistics } from "./energyStatisticsMessages";
import { LOCALIZATION_VALIDATION_DATA as interstellarStatistics } from "./interstellarStatisticsMessages";
import { LOCALIZATION_VALIDATION_DATA as megastructure } from "./megastructureMessages";
import { LOCALIZATION_VALIDATION_DATA as meta } from "./metaMessages";
import { LOCALIZATION_VALIDATION_DATA as metaSignal } from "./metaSignalMessages";
import { LOCALIZATION_VALIDATION_DATA as story } from "./miaplacidusStoryMessages";
import { MESSAGES as coreMessages } from "./messages";
import { LOCALIZATION_VALIDATION_DATA as philosophy } from "./philosophyMessages";
import { LOCALIZATION_VALIDATION_DATA as rocket } from "./rocketMessages";
import { LOCALIZATION_VALIDATION_DATA as save } from "./saveMessages";
import { LOCALIZATION_VALIDATION_DATA as settings } from "./settingsMessages";
import { LOCALIZATION_VALIDATION_DATA as settingsHelp } from "./settingsHelpMessages";
import { LOCALIZATION_VALIDATION_DATA as space } from "./spaceMessages";
import { SPACE_NOTIFICATION_MESSAGES } from "./spaceNotificationMessages";
import { LOCALIZATION_VALIDATION_DATA as sourceNews } from "./sourceNewsCopy";
import { LOCALIZATION_VALIDATION_DATA as starMap } from "./starMapMessages";
import { LOCALIZATION_VALIDATION_DATA as starship } from "./starshipMessages";
import { LOCALIZATION_VALIDATION_DATA as statistics } from "./statisticsMessages";
import { LOCALIZATION_VALIDATION_DATA as technologyNotifications } from "./technologyNotificationMessages";
import { LOCALIZATION_VALIDATION_DATA as topStatus } from "./topStatusMessages";

export interface LocalizationCatalogue {
  readonly id: string;
  readonly values: Readonly<Record<LocaleId, unknown>>;
  readonly fallback?: "english" | "localized";
  readonly allowedRichTextTags?: readonly string[];
}

type StringLeaves = Map<string, string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toLocaleRoot(id: string, value: unknown): LocalizationCatalogue {
  if (!isRecord(value)) throw new Error(`${id} is not a locale catalogue object`);
  const keys = Object.keys(value);
  if (LOCALE_IDS.every((locale) => keys.includes(locale))) {
    return { id, values: value as Readonly<Record<LocaleId, unknown>> };
  }

  const rows = Object.entries(value);
  if (rows.length > 0 && rows.every(([, row]) => isRecord(row) && LOCALE_IDS.every((locale) => locale in row))) {
    const transposed = Object.fromEntries(
      LOCALE_IDS.map((locale) => [
        locale,
        Object.fromEntries(rows.map(([key, row]) => [key, (row as Record<string, unknown>)[locale]])),
      ]),
    );
    return { id, values: transposed as Readonly<Record<LocaleId, unknown>> };
  }

  throw new Error(`${id} does not have a locale-root or message-id-root shape`);
}

function withPolicy(
  catalogue: LocalizationCatalogue,
  policy: { readonly fallback?: "english" | "localized"; readonly allowedRichTextTags?: readonly string[] },
): LocalizationCatalogue {
  return { ...catalogue, ...policy };
}

function groupedCatalogues(
  group: string,
  values: Readonly<Record<string, unknown>>,
  fallbackNames: Readonly<Record<string, "english" | "localized">> = {},
): LocalizationCatalogue[] {
  return Object.entries(values).map(([name, value]) => {
    const catalogue = toLocaleRoot(`${group}.${name}`, value);
    return fallbackNames[name] ? { ...catalogue, fallback: fallbackNames[name] } : catalogue;
  });
}

export const LOCALIZATION_CATALOGUES: readonly LocalizationCatalogue[] = [
  toLocaleRoot("core.messages", coreMessages),
  toLocaleRoot("core.spaceNotifications", SPACE_NOTIFICATION_MESSAGES),
  withPolicy(toLocaleRoot("guides.cosmicopedia", cosmicopediaSourceMessages), {
    allowedRichTextTags: ["br"],
  }),
  ...groupedCatalogues("achievement", achievement),
  ...groupedCatalogues("achievementReward", achievementReward),
  ...groupedCatalogues("blackHole", blackHole),
  ...groupedCatalogues("casino", casino),
  ...groupedCatalogues("cosmicRip", cosmicRip),
  ...groupedCatalogues("debugScenario", debugScenario),
  ...groupedCatalogues("economy", economy),
  ...groupedCatalogues("energyStatistics", energyStatistics),
  ...groupedCatalogues("interstellarStatistics", interstellarStatistics),
  ...groupedCatalogues("megastructure", megastructure),
  ...groupedCatalogues("meta", meta),
  ...groupedCatalogues("metaSignal", metaSignal),
  ...groupedCatalogues("story", story),
  ...groupedCatalogues("philosophy", philosophy),
  ...groupedCatalogues("rocket", rocket),
  ...groupedCatalogues("save", save),
  ...groupedCatalogues("settings", settings),
  ...groupedCatalogues("settingsHelp", settingsHelp),
  ...groupedCatalogues("space", space),
  ...groupedCatalogues("sourceNews", sourceNews),
  withPolicy(
    toLocaleRoot(
      "starMap.effective",
      Object.fromEntries(
        LOCALE_IDS.map((locale) => [
          locale,
          {
            ...starMap.messages[locale],
            ...starMap.additionalMessages[locale],
          },
        ]),
      ),
    ),
    { fallback: "english" },
  ),
  ...groupedCatalogues("starship", starship, { messages: "english" }),
  ...groupedCatalogues("statistics", statistics),
  ...groupedCatalogues("technologyNotifications", technologyNotifications, { notices: "localized" }),
  ...groupedCatalogues("topStatus", topStatus),
  toLocaleRoot("achievementNames", ACHIEVEMENT_NAMES),
  toLocaleRoot("economyBuildingNames", ECONOMY_BUILDING_NAMES),
  toLocaleRoot("technologyNames", TECHNOLOGY_NAMES),
  toLocaleRoot("technologyDescriptions", TECHNOLOGY_DESCRIPTIONS),
];

function flattenStringLeaves(value: unknown, prefix = "", leaves: StringLeaves = new Map()): StringLeaves {
  if (typeof value === "string") {
    leaves.set(prefix || "$", value);
  } else if (Array.isArray(value)) {
    value.forEach((entry, index) => flattenStringLeaves(entry, `${prefix}[${index}]`, leaves));
  } else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      flattenStringLeaves(child, prefix ? `${prefix}.${key}` : key, leaves);
    }
  }
  return leaves;
}

function placeholderSignature(value: string): string[] {
  return [...value.matchAll(/\{([\w.-]+)\}/gu)].map((match) => match[1] ?? "").sort();
}

const TAG_LIKE_MARKUP = /<\/?([a-z][a-z0-9]*)\b[^>]*>/giu;
const KNOWN_TRANSLATION_INVARIANTS: ReadonlySet<string> = new Set([
  "economy.messages:nanoBrokersRequirement:es",
  "economy.messages:nanoBrokersRequirement:pt",
  "economy.messages:nanoBrokersRequirement:fr",
  "sourceNews.SOURCE_NEWS_COPY:wackyEffects[5]:pt",
  "sourceNews.SOURCE_NEWS_COPY:wackyEffects[5]:de",
  "sourceNews.SOURCE_NEWS_COPY:wackyEffects[5]:it",
  "sourceNews.SOURCE_NEWS_COPY:wackyEffects[5]:fr",
]);

function hasUnsafeMarkup(value: string, allowedTags: readonly string[]): boolean {
  const tags = [...value.matchAll(TAG_LIKE_MARKUP)];
  return tags.some((match) => !allowedTags.includes((match[1] ?? "").toLocaleLowerCase("en")));
}

function likelyEnglishSentence(value: string): boolean {
  const visibleText = value.replace(/\{[\w.-]+\}/gu, " ");
  const unitWords = new Set(["kj", "mj", "kw", "mw", "gw", "ly", "ap", "gp", "rp", "cp", "s"]);
  const words = (visibleText.match(/[\p{L}]{2,}/gu) ?? []).filter(
    (word) => !unitWords.has(word.toLocaleLowerCase("en")),
  );
  return new Set(words.map((word) => word.toLocaleLowerCase("en"))).size >= 2 && visibleText.length >= 12;
}

export interface LocalizationValidationIssue {
  readonly catalogue: string;
  readonly locale?: string;
  readonly path?: string;
  readonly code:
    | "locale-keys"
    | "message-keys"
    | "empty-value"
    | "placeholder-parity"
    | "unsafe-markup"
    | "untranslated-candidate";
  readonly detail: string;
}

export function validateLocalizationCatalogue(
  catalogue: LocalizationCatalogue,
): LocalizationValidationIssue[] {
  const issues: LocalizationValidationIssue[] = [];
  const localeKeys = Object.keys(catalogue.values).sort();
  if (localeKeys.join("|") !== [...LOCALE_IDS].sort().join("|")) {
    issues.push({
      catalogue: catalogue.id,
      code: "locale-keys",
      detail: `Expected ${[...LOCALE_IDS].sort().join(", ")}; received ${localeKeys.join(", ")}`,
    });
  }

  const englishLeaves = flattenStringLeaves(catalogue.values.en);
  for (const locale of LOCALE_IDS) {
    if (locale === "en") continue;
    const translatedLeaves = flattenStringLeaves(catalogue.values[locale]);
    if (!catalogue.fallback) {
      for (const key of englishLeaves.keys()) {
        if (!translatedLeaves.has(key)) {
          issues.push({ catalogue: catalogue.id, locale, path: key, code: "message-keys", detail: "Missing localized value" });
        }
      }
    }
    for (const key of translatedLeaves.keys()) {
      if (!englishLeaves.has(key)) {
        issues.push({ catalogue: catalogue.id, locale, path: key, code: "message-keys", detail: "No English source value" });
      }
    }

    for (const [path, text] of translatedLeaves) {
      if (!text.trim()) {
        issues.push({ catalogue: catalogue.id, locale, path, code: "empty-value", detail: "Localized value is empty" });
      }
      if (hasUnsafeMarkup(text, catalogue.allowedRichTextTags ?? [])) {
        issues.push({ catalogue: catalogue.id, locale, path, code: "unsafe-markup", detail: "Catalog values must remain plain text" });
      }
      const english = englishLeaves.get(path);
      if (english !== undefined) {
        if (placeholderSignature(english).join("|") !== placeholderSignature(text).join("|")) {
          issues.push({ catalogue: catalogue.id, locale, path, code: "placeholder-parity", detail: "Placeholder names/counts differ from English" });
        }
        if (
          !KNOWN_TRANSLATION_INVARIANTS.has(`${catalogue.id}:${path}:${locale}`) &&
          text === english &&
          likelyEnglishSentence(text)
        ) {
          issues.push({ catalogue: catalogue.id, locale, path, code: "untranslated-candidate", detail: "Non-English value matches the English source" });
        }
      }
    }
  }
  for (const [path, text] of englishLeaves) {
    if (!text.trim()) {
      issues.push({ catalogue: catalogue.id, locale: "en", path, code: "empty-value", detail: "English source value is empty" });
    }
    if (hasUnsafeMarkup(text, catalogue.allowedRichTextTags ?? [])) {
      issues.push({ catalogue: catalogue.id, locale: "en", path, code: "unsafe-markup", detail: "Catalog values must remain plain text" });
    }
  }
  return issues;
}

export function validateAllLocalizationCatalogues(): LocalizationValidationIssue[] {
  return LOCALIZATION_CATALOGUES.flatMap(validateLocalizationCatalogue);
}
