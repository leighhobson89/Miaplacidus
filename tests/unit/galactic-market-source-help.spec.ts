import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import {
  marketBiasHelpLabel,
  marketBiasHelpText,
  marketSourceHelpText,
  type MarketSourceHelpKey,
} from "../../src/i18n/marketMessages";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<LocaleId, Record<string, string>>;
const marketPaneSource = readFileSync(resolve(process.cwd(), "src/app/GalacticMarketPane.tsx"), "utf8");

const SOURCE_KEYS = {
  outgoingTitle: "galacticMarketOutgoingTitle",
  outgoingBody: "galacticMarketOutgoingText",
  incomingTitle: "galacticMarketIncomingTitle",
  incomingBody: "galacticMarketIncomingText",
  outlookTitle: "galacticMarketComparisonTitle",
  higherOutgoing: "galacticMarketComparisonHigherOutgoing",
  higherIncoming: "galacticMarketComparisonHigherIncoming",
  balanced: "galacticMarketComparisonBalanced",
} as const;

const SOURCE_CARD_HELP_KEYS: Readonly<Record<MarketSourceHelpKey, string>> = {
  trade: "galacticMarketItemSelectContent1",
  sellAp: "galacticMarketSellApForCashContent1",
  liquidation: "galacticMarketLiquidateForApContent1",
};

describe("Galactic Market source help", () => {
  it("uses the source tooltip headings and copy in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      const source = sourceLocales[locale];
      const expected = (outlook: string) =>
        `${source[SOURCE_KEYS.outgoingTitle]}: ${source[SOURCE_KEYS.outgoingBody]} ` +
        `${source[SOURCE_KEYS.incomingTitle]}: ${source[SOURCE_KEYS.incomingBody]} ` +
        `${source[SOURCE_KEYS.outlookTitle]}: ${source[outlook]}`;

      expect(marketBiasHelpLabel(locale)).toBe(source[SOURCE_KEYS.outlookTitle]);
      expect(marketBiasHelpText(locale, 2, 1)).toBe(expected(SOURCE_KEYS.higherOutgoing));
      expect(marketBiasHelpText(locale, 1, 2)).toBe(expected(SOURCE_KEYS.higherIncoming));
      expect(marketBiasHelpText(locale, 2, -2)).toBe(expected(SOURCE_KEYS.balanced));
    }
  });

  it("shows only the source explanation for a bias that is present", () => {
    for (const locale of LOCALE_IDS) {
      const source = sourceLocales[locale];

      expect(marketBiasHelpText(locale, 1, null)).toBe(
        `${source[SOURCE_KEYS.outgoingTitle]}: ${source[SOURCE_KEYS.outgoingBody]}`,
      );
      expect(marketBiasHelpText(locale, null, -1)).toBe(
        `${source[SOURCE_KEYS.incomingTitle]}: ${source[SOURCE_KEYS.incomingBody]}`,
      );
    }
  });

  it("maps each source card description to its matching market help in all six locales", () => {
    for (const key of Object.keys(SOURCE_CARD_HELP_KEYS) as MarketSourceHelpKey[]) {
      for (const locale of LOCALE_IDS) {
        expect(marketSourceHelpText(locale, key)).toBe(
          sourceLocales[locale][SOURCE_CARD_HELP_KEYS[key]],
        );
      }
    }
  });

  it("keeps each source description on its matching Galactic Market card", () => {
    for (const [key, testId] of Object.entries({
      trade: "galactic-market-trade-source-help",
      sellAp: "galactic-market-ap-sale-source-help",
      liquidation: "galactic-market-liquidation-source-help",
    }) as [MarketSourceHelpKey, string][]) {
      expect(marketPaneSource).toContain(`marketSourceHelpText(locale, "${key}")`);
      expect(marketPaneSource).toContain(`testId="${testId}"`);
    }
  });
});
