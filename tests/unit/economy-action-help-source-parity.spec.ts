import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  COMPOUND_IDS,
  ECONOMIC_GOOD_IDS,
  LOCALE_IDS,
  type EconomicGoodId,
  type LocaleId,
} from "../../src/content/ids";
import { economyActionHelp } from "../../src/i18n/economyActionHelpMessages";

const sourceLocales = JSON.parse(
  readFileSync(resolve(process.cwd(), "../cosmicForge/cosmicForge/localization.json"), "utf8"),
) as Record<LocaleId, Record<string, string>>;

const SOURCE_ACTION_KEY_PATTERN = /^optionDesc.*(Sell|Storage|AutoBuyer[1-4]|Create)Content[12]$/;

function sourceGoodName(goodId: EconomicGoodId): string {
  return `${goodId[0].toUpperCase()}${goodId.slice(1)}`;
}

function sourceKey(
  goodId: EconomicGoodId,
  action: "sell" | "storage" | "create" | "autobuyer",
  options?: { tier?: 1 | 2 | 3 | 4; content?: 1 | 2 },
): string {
  const actionName = {
    sell: "Sell",
    storage: "Storage",
    create: "Create",
    autobuyer: `AutoBuyer${options?.tier}`,
  }[action];
  return `optionDesc${sourceGoodName(goodId)}${actionName}Content${options?.content ?? 1}`;
}

const sourceActionKeys = Object.keys(sourceLocales.en)
  .filter((key) => SOURCE_ACTION_KEY_PATTERN.test(key))
  .sort();

describe("resource and compound action help source parity", () => {
  it("maps every source action-help key and value in all six locales", () => {
    expect(sourceActionKeys).toHaveLength(96);

    for (const locale of LOCALE_IDS) {
      const selectedSourceKeys = new Set<string>();

      for (const goodId of ECONOMIC_GOOD_IDS) {
        const sellKey = sourceKey(goodId, "sell");
        selectedSourceKeys.add(sellKey);
        expect(economyActionHelp(locale, goodId, "sell")).toBe(sourceLocales[locale][sellKey]);

        const fusedSellKey = sourceKey(goodId, "sell", { content: 2 });
        const selectedFusedSellKey = Object.hasOwn(sourceLocales.en, fusedSellKey)
          ? fusedSellKey
          : sellKey;
        selectedSourceKeys.add(selectedFusedSellKey);
        expect(economyActionHelp(locale, goodId, "sell", { fused: true })).toBe(
          sourceLocales[locale][selectedFusedSellKey],
        );

        const storageKey = sourceKey(goodId, "storage");
        selectedSourceKeys.add(storageKey);
        expect(economyActionHelp(locale, goodId, "storage")).toBe(
          sourceLocales[locale][storageKey],
        );

        for (const tier of [1, 2, 3, 4] as const) {
          const autobuyerKey = sourceKey(goodId, "autobuyer", { tier });
          selectedSourceKeys.add(autobuyerKey);
          expect(economyActionHelp(locale, goodId, "autobuyer", { tier })).toBe(
            sourceLocales[locale][autobuyerKey],
          );
        }
      }

      // Only compounds have a source create-description row; do not request a create row for materials.
      for (const goodId of COMPOUND_IDS) {
        const createKey = sourceKey(goodId, "create");
        selectedSourceKeys.add(createKey);
        expect(economyActionHelp(locale, goodId, "create")).toBe(sourceLocales[locale][createKey]);
      }

      expect([...selectedSourceKeys].sort()).toEqual(sourceActionKeys);
    }
  });

  it("uses fused sale copy where present and falls back to ordinary sale copy otherwise", () => {
    const fusedSaleGoods = ECONOMIC_GOOD_IDS.filter((goodId) =>
      Object.hasOwn(sourceLocales.en, sourceKey(goodId, "sell", { content: 2 })),
    );

    expect(fusedSaleGoods).toHaveLength(6);

    for (const locale of LOCALE_IDS) {
      for (const goodId of ECONOMIC_GOOD_IDS) {
        const normalKey = sourceKey(goodId, "sell");
        const fusedKey = sourceKey(goodId, "sell", { content: 2 });
        const expectedKey = Object.hasOwn(sourceLocales.en, fusedKey) ? fusedKey : normalKey;

        expect(economyActionHelp(locale, goodId, "sell", { fused: true })).toBe(
          sourceLocales[locale][expectedKey],
        );
      }
    }
  });

  it("has create help rows only for the six compounds", () => {
    const sourceCreateGoods = sourceActionKeys
      .filter((key) => key.endsWith("CreateContent1"))
      .map((key) => key.slice("optionDesc".length, -"CreateContent1".length))
      .sort();

    expect(sourceCreateGoods).toEqual(COMPOUND_IDS.map(sourceGoodName).sort());
  });
});
