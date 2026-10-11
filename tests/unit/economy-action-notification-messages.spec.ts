import { describe, expect, it } from "vitest";
import { LOCALE_IDS, type LocaleId } from "../../src/content/ids";
import { economyLabel, formatEconomyMessage } from "../../src/i18n/economyMessages";

const expectedAutobuyerPurchaseCopy: Readonly<Record<LocaleId, string>> = {
  en: "Autobuyers for {good} (tier {tier}): +{count}.",
  es: "Compradores automáticos para {good} (nivel {tier}): +{count}.",
  pt: "Compradores automáticos para {good} (nível {tier}): +{count}.",
  de: "Automatische Käufer für {good} (Stufe {tier}): +{count}.",
  it: "Automatismi per {good} (livello {tier}): +{count}.",
  fr: "Automatismes pour {good} (niveau {tier}) : +{count}.",
};

describe("economy action notification copy", () => {
  it.each(LOCALE_IDS)("uses number-neutral autobuyer purchase wording in %s", (locale) => {
    expect(economyLabel(locale, "autobuyerPurchaseNotice")).toBe(
      expectedAutobuyerPurchaseCopy[locale],
    );
    expect(
      formatEconomyMessage(locale, "autobuyerPurchaseNotice", {
        count: "1",
        good: "Hydrogen",
        tier: "1",
      }),
    ).toContain("+1");
  });
});
