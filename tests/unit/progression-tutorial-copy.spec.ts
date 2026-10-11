import { describe, expect, it } from "vitest";
import { LOCALE_IDS } from "../../src/content/ids";
import { tutorialText } from "../../src/i18n/tutorialMessages";

describe("progression tutorial copy", () => {
  it("explains disabled-building production and energy behavior in all locales", () => {
    const sourceAlignedCopy = {
      en: "Disabled buildings produce nothing and consume no energy.",
      es: "Las instalaciones desactivadas no producen nada ni consumen energía.",
      pt: "Estruturas desativadas não produzem nada nem consomem energia.",
      de: "Deaktivierte Gebäude produzieren nichts und verbrauchen keine Energie.",
      it: "Gli edifici disattivati non producono nulla e non consumano energia.",
      fr: "Les bâtiments désactivés ne produisent rien et ne consomment pas d'énergie.",
    } satisfies Record<(typeof LOCALE_IDS)[number], string>;

    for (const locale of LOCALE_IDS) {
      expect(tutorialText(locale, "step.explainResearchRate.body")).toContain(
        sourceAlignedCopy[locale],
      );
    }
  });
});
