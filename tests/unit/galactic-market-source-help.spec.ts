import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALE_IDS } from "../../src/content/ids";
import {
  marketBiasHelpLabel,
  marketBiasHelpText,
  marketSourceHelpLabel,
  marketSourceHelpText,
  type MarketSourceHelpKey,
} from "../../src/i18n/marketMessages";

const marketPaneSource = readFileSync(
  resolve(process.cwd(), "src/app/GalacticMarketPane.tsx"),
  "utf8",
);
const liquidationCardSource = readFileSync(
  resolve(process.cwd(), "src/app/AssetLiquidationCard.tsx"),
  "utf8",
);
const ascendencyPaneSource = readFileSync(
  resolve(process.cwd(), "src/app/AscendencyPane.tsx"),
  "utf8",
);

describe("Galactic Market source help", () => {
  it("provides populated market-bias labels and help in all six locales", () => {
    for (const locale of LOCALE_IDS) {
      expect(marketBiasHelpLabel(locale).trim()).not.toBe("");
      expect(marketBiasHelpText(locale, 2, 1).trim()).not.toBe("");
      expect(marketBiasHelpText(locale, 1, 2).trim()).not.toBe("");
      expect(marketBiasHelpText(locale, 2, -2).trim()).not.toBe("");
    }
  });

  it("provides help for whichever market bias is present", () => {
    for (const locale of LOCALE_IDS) {
      expect(marketBiasHelpText(locale, 1, null).trim()).not.toBe("");
      expect(marketBiasHelpText(locale, null, -1).trim()).not.toBe("");
      expect(marketBiasHelpText(locale, null, null)).toBe("");
    }
  });

  it("provides populated help for each market card in all six locales", () => {
    for (const key of ["trade", "sellAp", "liquidation"] as const) {
      for (const locale of LOCALE_IDS) {
        expect(marketSourceHelpLabel(locale, key).trim()).not.toBe("");
        expect(marketSourceHelpText(locale, key).trim()).not.toBe("");
        expect(marketSourceHelpText(locale, key, true).trim()).not.toBe("");
      }
    }
  });

  it("keeps source help with its matching market or rebirth card", () => {
    for (const [key, testId] of Object.entries({
      trade: "galactic-market-trade-source-help",
      sellAp: "galactic-market-ap-sale-source-help",
    }) as [Exclude<MarketSourceHelpKey, "liquidation">, string][]) {
      expect(marketPaneSource).toContain(`marketSourceHelpText(locale, "${key}")`);
      expect(marketPaneSource).toContain(`testId="${testId}"`);
    }
    expect(liquidationCardSource).toContain('marketSourceHelpText(locale, "liquidation"');
    expect(liquidationCardSource).toContain('testId="rebirth-liquidation-source-help"');
    expect(ascendencyPaneSource).toContain(
      "<AssetLiquidationCard state={state} store={store} />",
    );
  });
});
